// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBLumWoI4bIWedWLIEEuGAPIQ21clubrBU",
  authDomain: "ecommercewebapp-40db9.firebaseapp.com",
  projectId: "ecommercewebapp-40db9",
  storageBucket: "ecommercewebapp-40db9.appspot.com",
  messagingSenderId: "1046760661218",
  appId: "1:1046760661218:web:ce4ed7ef4be98f5f563ebb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const imageDb = getStorage(app);
// const analytics = getAnalytics(app);