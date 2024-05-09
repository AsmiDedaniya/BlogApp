// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey:"AIzaSyDUYzZKnUtFJ4cVkavmmYAA3GQSKJehAow",
  authDomain: "blogapp-ce0ae.firebaseapp.com",
  projectId: "blogapp-ce0ae",
  storageBucket: "blogapp-ce0ae.appspot.com",
  messagingSenderId: "600987474003",
  appId: "1:600987474003:web:3098cb8311413ded3f0ea6"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
