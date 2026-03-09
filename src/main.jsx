// ============================================================
// FILE: main.jsx
// ============================================================
// 🏁 THIS IS THE STARTING POINT OF THE ENTIRE APP.
//
// Think of this file like the "ON switch" for your React app.
// It looks at your HTML file (index.html), finds a <div id="root">
// and says: "Hey! I'm going to put my entire React app INSIDE that div."
//
// HTML (index.html) provides the empty box 📦
// React (this file) fills that box with your whole app 🎨
// ============================================================

// React is the core library that gives us JSX (the HTML-like
// syntax you write inside JavaScript files like <App />).
import React from 'react'

// ReactDOM is the bridge between React and the browser's real HTML.
// "DOM" = Document Object Model = the actual webpage your browser shows.
import ReactDOM from 'react-dom/client'

// We import our main App component. It's the ROOT component that
// contains EVERYTHING else (all pages, navbar, chatbot, etc.)
import App from './App.jsx'

// We import the global CSS stylesheet so all styles apply app-wide.
import './index.css'

// ReactDOM.createRoot(...) — this finds the <div id="root"> inside
// public/index.html and makes React "own" that element.
//
// .render(...) — this says "draw/render my App component into that div".
//
// <React.StrictMode> is a helper wrapper that catches common mistakes
// during development. It doesn't affect the final user-facing app.
ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        {/* 👇 This is our entire app. ONE component that contains everything. */}
        <App />
    </React.StrictMode>
)
