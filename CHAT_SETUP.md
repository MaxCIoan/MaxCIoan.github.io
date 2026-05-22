# Private Chat Setup

This portfolio is hosted on GitHub Pages, which is static. The chat UI lives in `chat.html`, but the private login, message history, admin permissions, and realtime updates must be handled by Firebase.

## Security Model

- Firestore stores conversations and message history.
- Firestore rules deny all unknown reads/writes.
- A normal user can read and write only their own conversation document, whose ID is their Firebase UID.
- The admin can list/read conversations only when the ID token has `admin == true` and `firebase.sign_in_second_factor` is present.
- Message text is rendered with `textContent`, not `innerHTML`, to avoid XSS execution.
- Message length is limited to 2000 characters in Firestore rules.
- There is no SQL database in this design.

## Required Firebase Setup

1. Create a Firebase project.
2. Enable Authentication with Email/Password.
3. Enable multi-factor authentication for the admin account.
4. Enable Firestore.
5. Deploy `firestore.rules`.
6. Add your Firebase web app config into `chat.html`.
7. Deploy `functions/index.js` if you want the admin panel to create test users.
8. Set the admin custom claim on your admin account from a trusted environment:

```js
await admin.auth().setCustomUserClaims("ADMIN_UID_HERE", { admin: true });
```

Do not put Admin SDK credentials or service account keys in GitHub Pages.

## Live URLs After Deploy

- Public chat page: `https://maxcioan.github.io/chat.html`
- Portfolio contact link: `Private Chat`

## Notes

The admin panel will not work until Firebase Functions are deployed and the signed-in admin account has both the `admin` custom claim and MFA in the current sign-in token.
