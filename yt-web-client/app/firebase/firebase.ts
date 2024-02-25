// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged,
    User
} from "firebase/auth";



// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCunpGvktMasMLRrpsSKSn8VV5aEPzBY5w",
    authDomain: "yt-clone-bdf7b.firebaseapp.com",
    projectId: "yt-clone-bdf7b",
    storageBucket: "yt-clone-bdf7b.appspot.com",
    messagingSenderId: "894947506774",
    appId: "1:894947506774:web:6ba5a797962ea2c25c99f7",
    measurementId: "G-X7WBPW5XXQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);

/**
 * Signs in user with Google authentication
 */
export function signInWithGoogle() {
    return signInWithPopup(auth, new GoogleAuthProvider());
}

export function signOut() {
    return auth.signOut();
}

export function onAuthStateChangedHelper(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
}