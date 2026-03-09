// ============================================================
// FILE: src/App.jsx
// ============================================================
// 🗺️ APP.JSX — THE BLUEPRINT OF THE WHOLE APP
//
// This is the "map" or "blueprint" of the entire app.
// It doesn't display any content itself — instead it sets up:
//
//   1. ROUTING   → Which URL shows which page?
//                  /         → HomePage
//                  /login    → LoginPage
//                  /dashboard→ DashboardPage  (only if logged in!)
//                  ...etc
//
//   2. PROVIDERS → It wraps everything in our 3 Contexts so that
//                  ALL pages have access to auth, data, and toasts.
//
// COMMUNICATION FLOW (how data flows downward):
//
//   <AuthProvider>          ← broadcasts auth data (user, login, logout)
//     <DataProvider>        ← broadcasts Firestore data (docs, bens)
//       <ToastProvider>     ← broadcasts showToast function
//         <Navbar />        ← reads auth (show login/logout links)
//         <Routes>          ← decides which page component to show
//           <HomePage />
//           <LoginPage />   ← reads auth (calls login function)
//           <DashboardPage />← reads auth + data
//           ...etc
//         <ChatBot />       ← floats on every page
//
// WHY THIS NESTING ORDER?
// DataProvider uses useAuth() internally (it needs the user ID to
// load Firestore data). So AuthProvider MUST wrap DataProvider.
// ToastProvider wraps the rest so all pages can show toast messages.
// ============================================================

import React from 'react'

// BrowserRouter  → enables URL-based navigation in the app
// Routes         → container for all Route definitions
// Route          → maps a URL path to a component
// Navigate       → programmatically redirects to another URL
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Import our 3 context providers (they "wrap" the app to share data)
import { AuthProvider, useAuth } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import { ToastProvider } from './context/ToastContext'
import { ThemeProvider } from './context/ThemeContext'

// Import shared/reusable components (shown on EVERY page)
import Navbar from './components/Navbar'
import ChatBot from './components/ChatBot'
import GlobalBackground from './components/GlobalBackground'

// Import all page components (each one renders a full page)
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import DocumentsPage from './pages/DocumentsPage'
import UploadPage from './pages/UploadPage'
import BeneficiariesPage from './pages/BeneficiariesPage'
import AddBeneficiaryPage from './pages/AddBeneficiaryPage'
import EditBeneficiaryPage from './pages/EditBeneficiaryPage'
import ProfilePage from './pages/ProfilePage'
import TwoFactorPage from './pages/TwoFactorPage'
import CheckInSuccess from './pages/CheckInSuccess'
import VerificationSubmissionPage from './pages/VerificationSubmissionPage'

// 🛡️ ADMIN PAGES
import AdminLayout from './components/AdminLayout'
import AdminDashboardPage from './pages/AdminDashboardPage'
import VerificationRequestsPage from './pages/VerificationRequestsPage'
import VerificationDetailView from './pages/VerificationDetailView'
import AdminActivityLogsPage from './pages/AdminActivityLogsPage'
import UserManagementPage from './pages/UserManagementPage'

// ============================================================
// 🔒 Protected — A "Route Guard" Component
//
// Some pages (Dashboard, Documents, etc.) should only be accessible
// when the user is logged in. The Protected component handles this.
//
// HOW IT WORKS:
//   Wrap any route element with <Protected>...</Protected>.
//   If the user IS logged in → show the wrapped children (the page)
//   If the user is NOT logged in → silently redirect to /login
//
// This prevents people from typing "/dashboard" in the browser
// and accessing protected pages without logging in.
// ============================================================
function Protected({ children }) {
    const { isLoggedIn } = useAuth() // read auth state from AuthContext

    // Conditional rendering:
    //   if isLoggedIn is true  → render children (the actual page)
    //   if isLoggedIn is false → render <Navigate to="/login" />
    //      which redirects the user to the login page
    //   'replace' means the current entry in browser history is
    //   replaced (so pressing "back" doesn't go back to the protected page)
    return isLoggedIn ? children : <Navigate to="/login" replace />
}

// ============================================================
// AppRoutes — defines the routing structure
//
// This is a separate component (not just inline in App) because
// useAuth() can only be used INSIDE a child of <AuthProvider>.
// ============================================================
function AppRoutes() {
    return (
        <>  {/* Fragment: a wrapper that renders no actual HTML element */}
            <GlobalBackground />
            {/* Navbar is rendered on EVERY page — it sits above the routes */}
            <Navbar />

            {/* Routes: only ONE <Route> renders at a time based on the URL */}
            <Routes>
                {/* Public routes — anyone can visit, logged in or not */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/verify-2fa" element={<TwoFactorPage />} />

                {/* Protected routes — wrapped in <Protected> so only
                    logged-in users can reach them */}
                <Route path="/dashboard"
                    element={<Protected><DashboardPage /></Protected>} />

                <Route path="/documents"
                    element={<Protected><DocumentsPage /></Protected>} />

                <Route path="/upload"
                    element={<Protected><UploadPage /></Protected>} />

                <Route path="/beneficiaries"
                    element={<Protected><BeneficiariesPage /></Protected>} />

                <Route path="/beneficiaries/add"
                    element={<Protected><AddBeneficiaryPage /></Protected>} />

                <Route path="/beneficiaries/edit/:id"
                    element={<Protected><EditBeneficiaryPage /></Protected>} />

                <Route path="/profile"
                    element={<Protected><ProfilePage /></Protected>} />

                <Route path="/check-in-success" element={<CheckInSuccess />} />

                <Route path="/request-verification"
                    element={<Protected><VerificationSubmissionPage /></Protected>} />

                {/* 🛡️ ADMIN PANEL ROUTES */}
                <Route path="/admin" element={<Protected><AdminLayout /></Protected>}>
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboardPage />} />
                    <Route path="requests" element={<VerificationRequestsPage />} />
                    <Route path="requests/:requestId" element={<VerificationDetailView />} />
                    <Route path="users" element={<UserManagementPage />} />
                    <Route path="logs" element={<AdminActivityLogsPage />} />
                    <Route path="settings" element={<div className="container">Settings coming soon...</div>} />
                </Route>

                {/* Catch-all: any unknown URL redirects to homepage */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* ChatBot floats on the bottom-right of EVERY page */}
            <ChatBot />
        </>
    )
}

// ============================================================
// App — the ROOT component exported to main.jsx
//
// We nest the providers in this order (innermost first):
//   1. BrowserRouter  → routing context (must be outermost)
//   2. AuthProvider   → auth context
//   3. DataProvider   → data context (needs auth inside)
//   4. ToastProvider  → toast notification context
//   5. AppRoutes      → the actual UI
// ============================================================

export default function App() {
    return (
        <BrowserRouter>
            <ThemeProvider>
                <AuthProvider>
                    <DataProvider>
                        <ToastProvider>
                            <AppRoutes />
                        </ToastProvider>
                    </DataProvider>
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    )
}
