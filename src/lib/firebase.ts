// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import type { FirebaseApp } from "firebase/app";
import type { Analytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC1zFQdXY-jTB30pwXPefQBb2wYbNY9LVM",
  authDomain: "shiningshowcase-5e120.firebaseapp.com",
  projectId: "shiningshowcase-5e120",
  storageBucket: "shiningshowcase-5e120.appspot.com",
  messagingSenderId: "443830489093",
  appId: "1:443830489093:web:763499eef57e098fd18c6c",
  measurementId: "G-BHGDG9ESB5"
};

// Initialize Firebase
let app: FirebaseApp;
let analytics: Analytics | null = null;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

if (typeof window !== 'undefined') {
    isSupported().then(supported => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    });
}

export { app, analytics };
