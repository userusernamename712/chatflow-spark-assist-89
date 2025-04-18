
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD5MO62QLQbBrc9GqJlQVfMcLVecDwYyGo",
  authDomain: "bookline-ai-demo.firebaseapp.com",
  projectId: "bookline-ai-demo",
  storageBucket: "bookline-ai-demo.appspot.com",
  messagingSenderId: "709805443177",
  appId: "1:709805443177:web:18f11b64c5a76f5baeeaba",
  measurementId: "G-2XH4Z5Y3HD",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
