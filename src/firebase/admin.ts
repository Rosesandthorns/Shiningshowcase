
import * as admin from 'firebase-admin';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccount) {
    throw new Error('Missing FIREBASE_SERVICE_ACCOUNT environment variable');
}

const serviceAccountJson = JSON.parse(
    Buffer.from(serviceAccount, 'base64').toString('utf8')
);

let adminApp: admin.app.App;

export function getAdminApp() {
    if (!admin.apps.length) {
        adminApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccountJson),
        });
    } else {
        adminApp = admin.app();
    }
    return adminApp;
}
