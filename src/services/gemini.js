// ============================================================
// FILE: src/services/gemini.js
// ============================================================
// 🧠 GEMINI AI SERVICE — Talks to Google's Gemini AI API
//
// WHAT IS AN API?
//   An API (Application Programming Interface) is like a waiter at a restaurant.
//   You (the frontend) don't cook the food — you ask the waiter (the API) to
//   bring it from the kitchen (the AI model running on Google's servers).
//   You send a request, and you receive a response.
//
// WHAT THIS FILE DOES:
//   1. Defines a SYSTEM PROMPT → instructions that shape how the AI behaves.
//      It tells the AI: "You are RedBox AI, answer in the user's language,
//      be warm and helpful, focus on app features and legal topics."
//   2. Defines a FALLBACK function → if the API is unavailable or over quota,
//      we return a pre-written answer based on keywords in the question.
//   3. Exports sendMessageToGemini() → the main function called by ChatBot.jsx.
//      It sends the user's message + conversation history to Gemini and
//      returns the AI's text reply.
//
// HOW IT CONNECTS TO CHATBOT:
//   ChatBot.jsx calls:  sendMessageToGemini(userText, conversationHistory)
//   This file talks to: Google's Gemini REST API via fetch()
//   Returns:            The AI's reply as a plain string
//
// WHAT IS fetch()?
//   fetch() is a built-in browser function for making HTTP requests.
//   It sends data to a URL and waits for a response — like sending a letter
//   and getting one back. It's promise-based, so we use async/await.
// ============================================================

// ── API KEY ───────────────────────────────────────────────
// This key authenticates our requests to Google's Gemini API.
// Think of it like a password that tells Google "this is a valid user."
// ⚠️  For production, move this to an environment variable (.env file)
//     so it's not visible in your public source code.
const GEMINI_API_KEY = "AIzaSyDvaEuejFBFvCVQUZagDjFsuHq4ZJSUV_4"

// ── SYSTEM PROMPT ─────────────────────────────────────────
// This is a hidden instruction message we always send at the START
// of the conversation, before the user's actual question.
// The AI reads this first and uses it to "become" the RedBox assistant.
//
// Key instructions we give it:
//   1. LANGUAGE RULE → always reply in the same language the user types in
//   2. Identity       → "You are RedBox AI Assistant"
//   3. Topics         → App features (upload, beneficiaries, check-in) + Legal Q&A
//   4. Tone           → Warm, empathetic, clear, useful
const SYSTEM_PROMPT =
    "LANGUAGE RULE (HIGHEST PRIORITY): Always detect the language of the user's message and respond in that EXACT same language. " +
    "If they write in Hindi or Hinglish, respond in Hindi/Hinglish. If in English, respond in English. " +
    "If they mix languages, match their style. Never force a specific language on the user.\n\n" +

    "━━ 🧠 YOUR PERSONA: LEGAL SECURITY CONSULTANT & DIGITAL LAWYER ━━\n" +
    "You are the RedBox AI Assistant. You are not just a chatbot; you are a highly specialized Legal Security Consultant and Digital Lawyer. " +
    "Your tone must be professional, structured, and authoritative, yet deeply empathetic and warm. " +
    "Your primary goal is to help users secure their digital legacy and understand the legal implications of their documents.\n\n" +

    "━━ ⚖️ MANDATORY OPERATIONAL RULES ━━\n" +
    "1. INQUISITIVE ENGAGEMENT: In EVERY response, you MUST ask at least one relevant, high-value follow-up question. " +
    "This question should aim to uncover more about the user's specific legal or security needs (e.g., 'Do you have a registered Will?', 'Who have you designated as your primary beneficiary for these assets?').\n" +
    "2. PROACTIVE SECURITY SUGGESTIONS: Always suggest specific ways to secure documents. " +
    "If a user mentions a document, ask if it's encrypted and advise on assigning a beneficiary or setting up a Deadman's Switch check-in.\n" +
    "3. STRUCTURED ANSWERS: Use clear headings, bullet points, and numbered lists to make your legal and technical advice easy to digest.\n\n" +

    "━━ 📂 KNOWLEDGE AREAS ━━\n" +
    "1. RED BOX APP FEATURES: Expert knowledge on uploading/encryption (AES-256), Beneficiary management, Deadman's Switch logic, and Zero-Knowledge security.\n" +
    "2. LEGAL ADVICE: Confident and thorough answers on Wills, Inheritance, Estate Planning, Property Law, and Digital Assets. Mention that for final execution, consulting a local certified lawyer is recommended.\n\n" +

    "━━ 📝 EXAMPLES OF INTERACTION Style ━━\n" +
    "User: 'I want to upload my house papers.'\n" +
    "You: 'That is a critical step. Uploading property deeds to RedBox ensures they are encrypted and safe. Have you already added the person who should inherit this property as a beneficiary in the app? Also, is the deed registered or are you storing the draft?'\n" +
    "User: 'What is a Will?'\n" +
    "You: 'A Will is a legal document that... [Explanation]. To secure your Will in RedBox, I suggest you [Security steps]. To give you better advice: Have you already physically signed your Will in the presence of witnesses?'"

// ── FALLBACK RESPONSES ────────────────────────────────────
// If the Gemini API is unavailable (quota exceeded, network error, etc.),
// we show a pre-written static answer based on keywords in the user's message.
// This way the chatbot is NEVER completely broken — it always gives SOME answer.
//
// msg.includes('keyword') → returns true if the string contains that word
// We check the message in lowercase so "Document", "DOCUMENT", "document" all match.
function getFallbackResponse(userMessage) {
    const msg = userMessage.toLowerCase()

    if (msg.includes('upload') || msg.includes('document') || msg.includes('file'))
        return "📄 To upload documents: Dashboard → 'Upload Document'. Your file is encrypted with AES-256 in your browser before upload — even Red Box cannot read it!"

    if (msg.includes('beneficiar'))
        return "👥 To add a beneficiary: Dashboard → 'Add Beneficiary' → fill Name, Email, Relationship. They get access only after proper verification."

    if (msg.includes('will') || msg.includes('testament'))
        return "📜 A valid will in India requires: testator aged 18+, sound mind, signature in front of 2 witnesses. Registration isn't mandatory but is safer."

    if (msg.includes('encrypt') || msg.includes('security') || msg.includes('safe'))
        return "🔐 Red Box uses AES-256 encryption — same as banks and military. Zero-knowledge architecture means only you can access your files."

    // Default fallback if no keyword matched
    return "🙏 I'm the RedBox AI Assistant. Ask me about app features or legal topics (wills, inheritance, property, estate planning)!"
}

// ── MAIN EXPORTED FUNCTION ────────────────────────────────
// Called by ChatBot.jsx with:
//   userMessage         → the question the user typed
//   conversationHistory → array of past messages (so AI remembers context)
//
// Returns: a string (the AI's reply text)
// It's async because fetch() is asynchronous — it takes time to get a response.
export async function sendMessageToGemini(userMessage, conversationHistory = []) {

    // ── BUILD THE MESSAGES ARRAY ──────────────────────────
    // The Gemini API expects a specific message format.
    // We build the full conversation like this:
    //
    //   1. System prompt as a 'user' message (our instructions to the AI)
    //   2. AI's greeting as a 'model' message (so AI "remembers" it greeted the user)
    //   3. Past conversation history (previous Q&A pairs for context)
    //   4. The new user message
    //
    // Why role: 'user' for the system prompt?
    //   Gemini's API doesn't have a dedicated 'system' role in the v1beta API.
    //   The convention is to send the system instructions as the first user message,
    //   followed by a model response, to "seed" the conversation context.
    const messages = [
        { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
        { role: 'model', parts: [{ text: "Greetings. I am your RedBox Legal Security Consultant. How may I assist you with your digital legacy or legal documentation today? Also, have you updated your check-in frequency recently?" }] },
        ...conversationHistory,    // spread operator: insert all past messages here
        { role: 'user', parts: [{ text: userMessage }] }   // the new question
    ]

    try {
        // ── FETCH REQUEST ─────────────────────────────────
        // fetch() sends an HTTP POST request to Google's Gemini API.
        // The URL contains our API key as a query parameter.
        // Template literal syntax: `...${variable}...` inserts the variable inline.
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // JSON.stringify converts our JavaScript object to a JSON string.
                // JSON is the universal data format for APIs — like a "language"
                // that both frontend and server understand.
                body: JSON.stringify({
                    contents: messages,
                    generationConfig: {
                        temperature: 0.7,     // 0 = very predictable, 1 = very creative
                        maxOutputTokens: 800, // roughly ~600 words max
                        topP: 0.8,            // nucleus sampling (AI tuning parameter)
                        topK: 40              // top-K sampling (AI tuning parameter)
                    }
                })
            }
        )

        // ── CHECK FOR HTTP ERRORS ─────────────────────────
        // response.ok is true if status code is 200-299 (success).
        // If it's false (e.g., 429 Too Many Requests, 403 Forbidden),
        // we parse the error body and throw a descriptive error.
        if (!response.ok) {
            // .catch(() => ({})) handles the case where the error body isn't valid JSON
            const errData = await response.json().catch(() => ({}))
            throw new Error('API Error: ' + (errData.error?.message || 'HTTP ' + response.status))
        }

        // ── PARSE THE RESPONSE ────────────────────────────
        // response.json() parses the JSON text body into a JavaScript object.
        // The Gemini API response structure is deeply nested:
        //   data.candidates[0].content.parts[0].text = the AI's reply text
        const data = await response.json()
        return data.candidates[0].content.parts[0].text

    } catch (error) {
        // ── ERROR HANDLING ────────────────────────────────
        // Log the error to the browser console (visible in DevTools > Console)
        console.error('Gemini API Error:', error)

        // If the error is quota-related (too many requests), use fallback.
        // '429' is the HTTP status code for "Too Many Requests."
        if (error.message.includes('quota') || error.message.includes('429')) {
            return getFallbackResponse(userMessage)
        }

        // For other errors (network failure, invalid API key, etc.),
        // re-throw the error so ChatBot.jsx can catch it and show an error message.
        throw error
    }
}
