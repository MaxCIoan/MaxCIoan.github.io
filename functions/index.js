import admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";

admin.initializeApp();

function assertAdminWithMfa(request) {
  const token = request.auth?.token;

  if (!token?.admin || !token?.firebase?.sign_in_second_factor) {
    throw new HttpsError("permission-denied", "Admin MFA is required.");
  }
}

export const createTestUser = onCall(async (request) => {
  assertAdminWithMfa(request);

  const email = String(request.data?.email || "").trim().toLowerCase();
  const password = String(request.data?.password || "");

  if (!email || !email.includes("@")) {
    throw new HttpsError("invalid-argument", "A valid email is required.");
  }

  if (password.length < 12) {
    throw new HttpsError("invalid-argument", "Temporary password must be at least 12 characters.");
  }

  const user = await admin.auth().createUser({
    email,
    password,
    emailVerified: false,
    disabled: false
  });

  await admin.firestore().collection("conversations").doc(user.uid).set({
    userUid: user.uid,
    userEmail: email,
    participants: [user.uid],
    createdByAdmin: true,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  return { uid: user.uid, email };
});
