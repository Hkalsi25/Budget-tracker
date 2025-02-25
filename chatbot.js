import { db, doc, getDoc } from "./firebase.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ✅ Global Variables
let apiKey;
let genAI;
let model;

// ✅ Fetch API Key from Firestore
async function getApiKey() {
    try {
        let snapshot = await getDoc(doc(db, "apikey", "googlegenai"));
        if (snapshot.exists()) {
            apiKey = snapshot.data().key;
            console.log("✅ API Key Retrieved:", apiKey);

            // ✅ Initialize Gemini AI
            genAI = new GoogleGenerativeAI(apiKey);
            model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            console.log("🤖 Chatbot is Ready!");
        } else {
            console.error("❌ API Key Not Found in Firestore");
        }
    } catch (error) {
        console.error("❌ Firestore Error:", error);
    }
}

// ✅ Call API Key Retrieval on Load
getApiKey();

// ✅ Chatbot Event Listener
document.getElementById("chatbot-send-btn").addEventListener("click", async () => {
    let prompt = document.getElementById("chatbot-input").value.trim().toLowerCase();
    
    if (prompt) {
        appendMessage("🧑‍💻 " + prompt); // Display user input
        document.getElementById("chatbot-input").value = ""; // Clear input
        await askChatBot(prompt);
    } else {
        appendMessage("⚠️ Please enter a message.");
    }
});

// ✅ Ask AI Chatbot
async function askChatBot(request) {
    try {
        const response = await model.generateContent(request);
        const aiMessage = response.response.candidates[0].content.parts[0].text;
        appendMessage("🤖 " + aiMessage);
    } catch (error) {
        console.error("❌ Error Generating AI Response:", error);
        appendMessage("⚠️ AI encountered an error.");
    }
}

// ✅ Append Messages to Chat History
function appendMessage(message) {
    let chatHistory = document.getElementById("chat-history");
    let messageElement = document.createElement("div");
    messageElement.textContent = message;
    messageElement.className = "history";
    chatHistory.appendChild(messageElement);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}
