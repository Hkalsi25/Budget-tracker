import { auth, signUp, signIn, signInWithGoogle } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";

// Automatically redirect if user is logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("✅ User is logged in, redirecting...");
        window.location.replace("index.html"); // Prevent back button from returning to login page
    }
});

// Handle Sign In
document.getElementById("sign-in-btn").addEventListener("click", async () => {
    const email = document.getElementById("auth-email").value;
    const password = document.getElementById("auth-password").value;
    const user = await signIn(email, password);
    
    if (user) {
        window.location.replace("index.html"); // Redirect after successful login
    }
});

// Handle Sign Up
document.getElementById("sign-up-btn").addEventListener("click", async () => {
    const email = document.getElementById("auth-email").value;
    const password = document.getElementById("auth-password").value;
    const user = await signUp(email, password);
    
    if (user) {
        window.location.replace("index.html");
    }
});

// Handle Google Sign In
document.getElementById("google-signin-btn").addEventListener("click", async () => {
    const user = await signInWithGoogle();
    
    if (user) {
        window.location.replace("index.html");
    }
});
