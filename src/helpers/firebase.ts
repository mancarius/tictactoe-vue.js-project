import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.VUE_APP_FIREBASE_APY_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_FIREBASE_APP_ID,
  measurementId: process.env.VUE_APP_FIREBASE_MEASUREMENT_ID,
};

let isValid = true;

for (const [key, value] of Object.entries(firebaseConfig)) {
  if (value.trim().length === 0) {
    isValid = false;
    break;
  }
}

// Initialize Firebase
const firebaseApp = isValid ? initializeApp(firebaseConfig) : undefined;
const firebaseAnalytics = isValid ? getAnalytics(firebaseApp) : undefined;

export {
    firebaseApp,
    firebaseAnalytics
};