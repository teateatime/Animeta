import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore'; // Import Firestore module

const firebaseConfig = {
  apiKey: "AIzaSyC4QDtIX9-3MKSTPlSFH0DUXzWmmjuNoUI",
  authDomain: "animeta-6673e.firebaseapp.com",
  projectId: "animeta-6673e",
  storageBucket: "animeta-6673e.appspot.com",
  messagingSenderId: "193990299962",
  appId: "1:193990299962:web:7ae1a71510598192bd0003",
  measurementId: "G-EF9CLDPHTX"
};

firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();

export { firebase, firestore };