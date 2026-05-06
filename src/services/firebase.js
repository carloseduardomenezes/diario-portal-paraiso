import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBe37GHAx-O0584RErY-eECSj5tUJeIL7s",
  authDomain: "portal-do-paraiso.firebaseapp.com",
  projectId: "portal-do-paraiso",
  storageBucket: "portal-do-paraiso.appspot.com",
  messagingSenderId: "599058253731",
  appId: "1:599058253731:web:c02f7b43dcc2dab8ddfc16"
};

const app = initializeApp(firebaseConfig);

// 🔥 Firestore (banco de dados)
export const db = getFirestore(app);

// 🔐 Auth (login email/senha + Google)
export const auth = getAuth(app);

// 🌐 Google login provider
export const provider = new GoogleAuthProvider();