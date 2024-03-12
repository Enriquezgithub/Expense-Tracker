
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBCAQ98V-QLkfC1eWwF94QAR0j0TcNY9M0",
  authDomain: "project1-44874.firebaseapp.com",
  projectId: "project1-44874",
  storageBucket: "project1-44874.appspot.com",
  messagingSenderId: "891388660364",
  appId: "1:891388660364:web:ccc0149e6af032bd4049a9"
};

initializeApp(firebaseConfig);

const db = getFirestore();

export default db