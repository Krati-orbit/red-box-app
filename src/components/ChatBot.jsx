// ============================================================
// FILE: src/components/ChatBot.jsx
// ============================================================
// 🤖 CHATBOT — The floating AI assistant button on every page
//
// WHAT IT DOES:
//   - A small 🤖 button floats in the bottom-right corner of the screen,
//     visible on EVERY page (because App.jsx renders it above the Routes)
//   - Clicking it opens/closes a chat window
//   - Users can type any question and get an AI reply from Gemini
//   - Maintains the full conversation history so context is preserved
//   - Shows a "Typing..." placeholder while waiting for the AI response
//
// HOW IT COMMUNICATES:
//   - Calls sendMessageToGemini() from gemini.js (the Gemini API service)
//   - Does NOT use any React Context — it's fully self-contained
//
// KEY CONCEPTS:
//   1. useState  → managing open/closed, message list, input text, loading
//   2. useRef    → (a) auto-scroll chat to bottom, (b) store conversation history
//                  without causing re-renders
//   3. async/await → waiting for AI response from the API
//   4. try/catch → gracefully handling API errors
//   5. Array spread [...prev, newItem] → adding to arrays immutably
// ============================================================

import React, { useState, useRef } from 'react'
import { sendMessageToGemini } from '../services/gemini'

export default function ChatBot() {

    // ── STATE ──────────────────────────────────────────────

    // open → is the chat window currently visible?
    // false = only the floating 🤖 button is shown
    // true  = the chat window slides into view
    const [open, setOpen] = useState(false)

    // messages → the chat history displayed on screen
    // Each message is an object: { role: 'user' | 'bot', text: '...', typing?: true }
    // We pre-populate with one greeting message from the bot.
    const [messages, setMessages] = useState([
        { role: 'bot', text: "Greetings. I am your RedBox Legal Security Consultant. How may I assist you with your digital legacy or legal documentation today? Also, have you updated your check-in frequency recently?" }
    ])

    // input → what the user is currently typing in the text field
    const [input, setInput] = useState('')

    // sending → true while we're waiting for Gemini to respond
    // Used to disable the send button and prevent double-sending
    const [sending, setSending] = useState(false)

    // ── REFS ───────────────────────────────────────────────

    // historyRef stores the FULL Gemini-formatted conversation history.
    // We use useRef (not useState) because:
    //   - We don't want React to re-render the component when history updates
    //   - History is only READ (when sending to Gemini) and WRITTEN (on reply)
    //   - useRef values persist between renders without causing re-draws
    //
    // Gemini needs the history in this exact format:
    //   [{ role: 'user', parts: [{ text: '...' }] },
    //    { role: 'model', parts: [{ text: '...' }] }, ...]
    const historyRef = useRef([])

    // messagesEndRef points to an invisible <div> at the very bottom
    // of the message list. We call .scrollIntoView() on it to
    // auto-scroll the chat to the newest message.
    const messagesEndRef = useRef(null)

    // ── SCROLL TO BOTTOM ──────────────────────────────────
    // Called after new messages are added.
    // setTimeout(..., 50) waits 50ms for React to finish rendering
    // the new message before we try to scroll to it.
    // The ?. is "optional chaining" — safe to call even if the ref is null.
    function scrollBottom() {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }

    // ── SEND MESSAGE ──────────────────────────────────────
    // This is the main function that runs when the user sends a message.
    async function send() {
        const text = input.trim()

        // Guard: don't send if the input is empty or already waiting for a reply
        if (!text || sending) return

        setInput('')         // clear the text field immediately
        setSending(true)     // disable the send button

        // Immediately show the user's message AND a "Typing..." placeholder
        // for the bot's reply in the message list.
        // We add both at once so the UI updates in a single render.
        //
        // [...prev, newItem] is the immutable way to add to an array in React.
        // We NEVER directly mutate state (e.g., prev.push(x) is WRONG).
        // We always create a NEW array with the spread operator (...).
        setMessages(prev => [
            ...prev,
            { role: 'user', text },
            { role: 'bot', text: 'Typing...', typing: true }   // placeholder
        ])
        scrollBottom()

        try {
            // Call the Gemini API service with the user's message AND
            // the full conversation history (so the AI remembers context).
            // historyRef.current.slice() creates a copy of the array so we
            // don't accidentally pass a reference that changes mid-flight.
            const reply = await sendMessageToGemini(text, historyRef.current.slice())

            // Store the exchange in our conversation history for future messages.
            // Gemini requires 'user' for user messages and 'model' for AI replies.
            historyRef.current.push(
                { role: 'user', parts: [{ text }] },
                { role: 'model', parts: [{ text: reply }] }
            )

            // Replace the "Typing..." placeholder with the real reply.
            // prev.filter(m => !m.typing) removes ALL typing placeholders,
            // then we append the real bot reply.
            setMessages(prev => [
                ...prev.filter(m => !m.typing),
                { role: 'bot', text: reply }
            ])

        } catch (err) {
            // If the API call fails (network error, quota exceeded, etc.),
            // replace the typing placeholder with an error message.
            setMessages(prev => [
                ...prev.filter(m => !m.typing),
                { role: 'bot', text: '❌ ' + (err.message || 'AI unavailable. Please try again.') }
            ])
        } finally {
            // 'finally' runs whether the try succeeded or the catch ran.
            // Always re-enable the send button and scroll to the latest message.
            setSending(false)
            scrollBottom()
        }
    }

    // ── JSX ───────────────────────────────────────────────
    return (
        <>  {/* Fragment: renders two sibling elements without a wrapping div */}

            {/* ── FLOATING BUTTON ──────────────────────────
                Always visible in the bottom-right corner (CSS positions it).
                o => !o is shorthand for "toggle": if open=true → false, and vice versa */}
            <button
                className="ai-chatbot-btn"
                onClick={() => setOpen(o => !o)}
                title="RedBox AI Assistant"
            >
                🤖
            </button>

            {/* ── CHAT WINDOW ──────────────────────────────
                'open' class is added when open=true, triggering CSS animation
                to slide the window into view. */}
            <div className={`ai-chatbot-window${open ? ' open' : ''}`}>

                {/* Header bar */}
                <div className="chat-header">
                    <div className="chat-header-avatar">🤖</div>
                    <div className="chat-header-info">
                        <div className="chat-header-name">RedBox Legal Consultant</div>
                        <div className="chat-header-status">● Online — Ask me anything</div>
                    </div>
                    <button className="chat-close-btn" onClick={() => setOpen(false)}>✕</button>
                </div>

                {/* Message list */}
                <div className="chat-messages">
                    {messages.map((m, i) => (
                        // key={i} is required for list rendering.
                        // CSS class: "chat-msg user" or "chat-msg bot" or "chat-msg bot typing"
                        <div key={i} className={`chat-msg ${m.role}${m.typing ? ' typing' : ''}`}>
                            {m.text}
                        </div>
                    ))}

                    {/* This invisible div is what we scroll INTO VIEW
                        to bring the chat to the bottom. */}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <div className="chat-input-area">
                    <input
                        className="chat-input-field"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        // onKeyDown fires on every key press.
                        // e.key === 'Enter' → if the Enter key was pressed, call send()
                        onKeyDown={e => e.key === 'Enter' && send()}
                        placeholder="Ask anything..."
                    />
                    {/* disabled={sending} prevents sending while waiting for a reply */}
                    <button className="chat-send-btn" onClick={send} disabled={sending}>➤</button>
                </div>
            </div>
        </>
    )
}
