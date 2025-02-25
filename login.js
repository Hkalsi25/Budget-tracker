import { auth, signUp, signIn, signInWithGoogle } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";

// Automatically redirect if user is logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("✅ User is logged in, redirecting...");
        window.location.replace("index.html");
    }
});

// Ensure the DOM is fully loaded before running the script
document.addEventListener("DOMContentLoaded", () => {
    const signInBtn = document.getElementById("sign-in-btn");
    const signUpBtn = document.getElementById("sign-up-btn");
    const googleSignInBtn = document.getElementById("google-signin-btn");

    if (signInBtn) {
        signInBtn.addEventListener("click", async () => {
            const email = document.getElementById("auth-email").value;
            const password = document.getElementById("auth-password").value;
            const user = await signIn(email, password);

            if (user) {
                window.location.replace("index.html");
            }
        });
    } else {
        console.error("❌ Sign In Button not found!");
    }

    if (signUpBtn) {
        signUpBtn.addEventListener("click", async () => {
            const email = document.getElementById("auth-email").value;
            const password = document.getElementById("auth-password").value;
            const user = await signUp(email, password);

            if (user) {
                window.location.replace("index.html");
            }
        });
    } else {
        console.error("❌ Sign Up Button not found!");
    }

    if (googleSignInBtn) {
        googleSignInBtn.addEventListener("click", async () => {
            const user = await signInWithGoogle();

            if (user) {
                window.location.replace("index.html");
            }
        });
    } else {
        console.error("❌ Google Sign-In Button not found!");
    }
});
