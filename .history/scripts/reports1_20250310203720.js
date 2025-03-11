// Import Firebase modules
import "https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js";
import "https://www.gstatic.com/firebasejs/8.10.0/firebase-auth.js";
import "https://www.gstatic.com/firebasejs/8.10.0/firebase-firestore.js";
import "https://www.gstatic.com/firebasejs/8.10.0/firebase-storage.js";

// Import our firebase config
import { firebaseConfig } from './config.js';


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = firebaseConfig.firestore();

