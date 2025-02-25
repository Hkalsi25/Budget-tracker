// ✅ Import Firebase Modules
import { initializeApp } from "firebase/app";
import { 
    getFirestore, collection, addDoc, getDocs, deleteDoc, doc, setDoc, getDoc, updateDoc 
} from "firebase/firestore";
import { 
    getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, 
    GoogleAuthProvider, signInWithPopup, onAuthStateChanged 
} from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// ✅ Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyA3fJS6PhycR0NRUX66xCMDKyQNY3h2NVo",
    authDomain: "budget-planner-ab940.firebaseapp.com",
    projectId: "budget-planner-ab940",
    storageBucket: "budget-planner-ab940.appspot.com",
    messagingSenderId: "10658175769",
    appId: "1:10658175769:web:40df076cb26544a505c388",
    measurementId: "G-V858QEFWJ3"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const provider = new GoogleAuthProvider(); // Google Sign-In Provider

// ✅ Authentication Functions
async function signUp(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("✅ User Signed Up:", userCredential.user);
        return userCredential.user;
    } catch (error) {
        console.error("❌ Sign Up Error:", error.message);
        return null;
    }
}

async function signIn(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("✅ User Signed In:", userCredential.user);
        return userCredential.user;
    } catch (error) {
        console.error("❌ Sign In Error:", error.message);
        return null;
    }
}

async function signInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, provider);
        console.log("✅ Google Sign-In Successful:", result.user);
        return result.user;
    } catch (error) {
        console.error("❌ Google Sign-In Error:", error.message);
        return null;
    }
}

// ✅ Fix: Ensure signOutUser is correctly defined and exported
async function signOutUser() {
    try {
        await signOut(auth);
        console.log("✅ User Signed Out");
    } catch (error) {
        console.error("❌ Sign Out Error:", error.message);
    }
}

onAuthStateChanged(auth, (user) => {
    const authStatusElement = document.getElementById("auth-status");
    if (authStatusElement) {
        if (user) {
            console.log("👤 User Logged In:", user.email);
            authStatusElement.textContent = `Logged in as ${user.email}`;
        } else {
            console.log("🚪 No User Logged In");
            authStatusElement.textContent = "Not logged in";
        }
    }
});


// ✅ Export Firestore, Auth & Authentication Functions
export { 
    db, auth, provider, collection, addDoc, getDocs, deleteDoc, doc, setDoc, 
    getDoc, updateDoc, signUp, signIn, signInWithGoogle, signOutUser
};
