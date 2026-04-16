import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC2Kr02xTkShljzPuStaUrD-nq-Vk4BjVA",
  authDomain: "habit-tracker-4f0ae.firebaseapp.com",
  projectId: "habit-tracker-4f0ae",
  storageBucket: "habit-tracker-4f0ae.firebasestorage.app",
  messagingSenderId: "576199253360",
  appId: "1:576199253360:web:ee297880d0cf509d70c3b5",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
