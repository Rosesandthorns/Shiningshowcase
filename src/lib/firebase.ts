// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { 
  getAuth, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  type User
} from "firebase/auth";

// Your web app's Firebase configuration
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

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error during sign in:", error);
    return null;
  }
};

const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error during sign out:", error);
  }
};

export { 
  app, 
  analytics, 
  auth, 
  onAuthStateChanged,
  signInWithGoogle,
  signOutUser,
  type User
};
