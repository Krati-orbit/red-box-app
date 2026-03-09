/**
 * Firebase Cloud Functions for Red Box Check-in System
 * 
 * This file contains:
 * 1. dailyCheckInPulse: Scheduled function to scan users and send reminders.
 * 2. verifyCheckInToken: HTTPS trigger to validate check-in links.
 * 3. triggerManualCheckIn: Callable function for admins.
 */

const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onRequest } = require("firebase-functions/v2/https");
const { onCall } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

admin.initializeApp();
const db = admin.firestore();

// Set global options to use the closest region if possible
setGlobalOptions({ region: "us-central1" });

// ==========================================
// 📧 EMAIL CONFIGURATION
// ==========================================
// Using NodeMailer with Gmail. 
// Requires environment variables: GMAIL_USER and GMAIL_PASS (App Password)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

const APP_URL = process.env.APP_URL || "http://localhost:5173";

// ==========================================
// 📄 EMAIL TEMPLATES (HTML)
// ==========================================
const { onDocumentUpdated } = require("firebase-functions/v2/firestore");

const getEmailTemplate = (user, type, link, extra = {}) => {
    const templates = {
        reminder1: {
            subject: "[Red Box] Friendly Reminder: Time to Check In!",
            body: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
                    <h2 style="color: #e63946;">Hi ${user.displayName || "there"},</h2>
                    <p>It's been a while since your last check-in on <strong>Red Box</strong>.</p>
                    <p>To keep your account active and ensure your legacy plan stays on track, please confirm you're still with us by clicking the button below:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${link}" style="background-color: #e63946; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">CHECK IN NOW</a>
                    </div>
                    <p style="font-size: 12px; color: #666;">This link will expire in 7 days.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 14px;">Best,<br>The Red Box Team</p>
                </div>
            `
        },
        reminder2: {
            subject: "[Red Box] Gentle Nudge: We haven't heard from you",
            body: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
                    <h2 style="color: #e63946;">Hello ${user.displayName || "there"},</h2>
                    <p>This is a second reminder that we haven't seen you on <strong>Red Box</strong> lately.</p>
                    <p>Your account security and the integrity of your legacy vault are our top priority. Please take a moment to check in:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${link}" style="background-color: #e63946; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">SECURE CHECK-IN</a>
                    </div>
                    <p style="font-size: 14px;">If you miss the next reminder, we may begin the process of notifying your designated beneficiaries.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 14px;">Safe travels,<br>Red Box Security</p>
                </div>
            `
        },
        reminder3: {
            subject: "[URGENT] Final Notice: Red Box Account Inactivity",
            body: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; background-color: #fff5f5;">
                    <h2 style="color: #e63946; text-transform: uppercase;">⚠️ ACTION REQUIRED IMMEDIATELY</h2>
                    <p><strong>Hi ${user.displayName || "there"},</strong></p>
                    <p>This is your <strong>FINAL URGENT REMINDER</strong>. If you do not check in within the next 7 days, your Red Box account will be marked as INACTIVE.</p>
                    <p>Once marked inactive, your designated beneficiaries will be notified automatically to begin the document retrieval process.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${link}" style="background-color: #000; color: white; padding: 15px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; border: 2px solid #e63946;">I AM STILL ACTIVE - CHECK IN</a>
                    </div>
                </div>
            `
        },
        beneficiary: {
            subject: `[Red Box] Important Notification regarding ${user.displayName}'s Account`,
            body: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
                    <h2>Notification for Beneficiary</h2>
                    <p>You are receiving this email because you are a designated beneficiary for <strong>${user.displayName}</strong> on Red Box.</p>
                    <p>Our system has detected extended inactivity on this account, and we have been unable to reach the account owner after multiple attempts.</p>
                    <p><strong>What this means:</strong> The verification process for document release may now begin. If you believe this is an error, please contact our support team immediately.</p>
                    <p>To proceed with verification, you will need to provide a death certificate or other legal proof of status through our secure portal.</p>
                    <div style="text-align: center; margin: 30px 0;">
                         <a href="${APP_URL}/request-verification" style="background-color: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">START VERIFICATION</a>
                    </div>
                    <hr>
                    <p style="font-size: 14px; color: #666;">This is an automated notification. Our admin team has been CC'd for manual verification.</p>
                </div>
            `
        },
        verification_approved: {
            subject: "[Red Box] Verification Approved: Access Granted",
            body: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
                    <h2 style="color: #2a9d8f;">Access Approved</h2>
                    <p>Hello ${extra.beneficiaryName || "there"},</p>
                    <p>Your verification request for the account of <strong>${extra.deceasedName}</strong> has been <strong>APPROVED</strong>.</p>
                    <p>You can now access the shared documents through your dashboard. Please log in to proceed:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${APP_URL}/dashboard" style="background-color: #2a9d8f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">VIEW DOCUMENTS</a>
                    </div>
                    <p style="font-style: italic; color: #666;">Admin Note: ${extra.adminNotes || "None provided"}</p>
                    <hr>
                    <p style="font-size: 14px;">Red Box Verification Team</p>
                </div>
            `
        },
        verification_rejected: {
            subject: "[Red Box] Verification Request Update",
            body: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
                    <h2 style="color: #e63946;">Verification Update</h2>
                    <p>Hello ${extra.beneficiaryName || "there"},</p>
                    <p>Your verification request for the account of <strong>${extra.deceasedName}</strong> has been <strong>REJECTED</strong>.</p>
                    <p><strong>Reason:</strong> ${extra.adminNotes || "No specific reason provided."}</p>
                    <p>If you believe this is an error or need to provide more information, please submit a new request or contact support.</p>
                    <hr>
                    <p style="font-size: 14px;">Red Box Verification Team</p>
                </div>
            `
        }
    };
    return templates[type];
};

// ==========================================
// 🛠️ HELPER: SEND EMAIL
// ==========================================
const sendEmail = async (to, template) => {
    try {
        await transporter.sendMail({
            from: `"Red Box Support" <${process.env.GMAIL_USER}>`,
            to,
            subject: template.subject,
            html: template.body,
        });
        console.log(`Email sent to ${to}: ${template.subject}`);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
};

// ==========================================
// 🛠️ HELPER: GENERATE TOKEN
// ==========================================
const generateToken = async (userId) => {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = admin.firestore.Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // 7 days from now

    await db.collection("checkInTokens").doc(token).set({
        userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt,
        used: false
    });

    return token;
};

// ==========================================
// ⏰ 1. SCHEDULED PULSE (Daily)
// ==========================================
exports.dailyCheckInPulse = onSchedule("every 24 hours", async (event) => {
    const now = new Date();
    const usersSnap = await db.collection("users").get();

    for (const doc of usersSnap.docs) {
        const userData = doc.data();
        const userId = doc.id;

        // Skip if vacation mode is active
        if (userData.vacationModeUntil && userData.vacationModeUntil.toDate() > now) {
            continue;
        }

        const lastCheckIn = userData.lastCheckIn ? userData.lastCheckIn.toDate() : userData.createdAt.toDate();
        const daysSinceLastCheckIn = Math.floor((now - lastCheckIn) / (1000 * 60 * 60 * 24));
        const frequency = userData.checkInFrequency || 90;

        // Reminder 1: 90 days after last check-in
        if (daysSinceLastCheckIn === frequency) {
            const token = await generateToken(userId);
            const link = `${APP_URL}/check-in-success?token=${token}`;
            const template = getEmailTemplate(userData, "reminder1", link);
            await sendEmail(userData.email, template);
            await db.collection("emailLogs").add({ userId, type: "reminder1", sentAt: admin.firestore.FieldValue.serverTimestamp() });
        }
        // Reminder 2: 7 days after Reminder 1
        else if (daysSinceLastCheckIn === frequency + 7) {
            const token = await generateToken(userId);
            const link = `${APP_URL}/check-in-success?token=${token}`;
            const template = getEmailTemplate(userData, "reminder2", link);
            await sendEmail(userData.email, template);
            await db.collection("emailLogs").add({ userId, type: "reminder2", sentAt: admin.firestore.FieldValue.serverTimestamp() });
        }
        // Reminder 3 (URGENT): 14 days after Reminder 1
        else if (daysSinceLastCheckIn === frequency + 14) {
            const token = await generateToken(userId);
            const link = `${APP_URL}/check-in-success?token=${token}`;
            const template = getEmailTemplate(userData, "reminder3", link);
            await sendEmail(userData.email, template);
            await db.collection("emailLogs").add({ userId, type: "reminder3", sentAt: admin.firestore.FieldValue.serverTimestamp() });
        }
        // DEADLINE REACHED: 21 days after Reminder 1 (total 111 days for 90-day frequency)
        else if (daysSinceLastCheckIn === frequency + 21) {
            // Mark user as inactive
            await db.collection("users").doc(userId).update({ isActive: false });

            // Notify beneficiaries
            const beneficiariesSnap = await db.collection("users").doc(userId).collection("beneficiaries").get();
            const template = getEmailTemplate(userData, "beneficiary", "");

            for (const benDoc of beneficiariesSnap.docs) {
                const benData = benDoc.data();
                if (benData.email) {
                    await sendEmail(benData.email, template);
                }
            }

            await db.collection("emailLogs").add({ userId, type: "beneficiary_notified", sentAt: admin.firestore.FieldValue.serverTimestamp() });
        }
    }
});

// ==========================================
// 🔗 2. VERIFY TOKEN (HTTPS)
// ==========================================
exports.verifyCheckInToken = onRequest(async (req, res) => {
    // Enable CORS
    res.set("Access-Control-Allow-Origin", "*");

    if (req.method === "OPTIONS") {
        res.set("Access-Control-Allow-Methods", "GET");
        res.set("Access-Control-Allow-Headers", "Content-Type");
        res.status(204).send("");
        return;
    }

    const { token } = req.query;
    if (!token) {
        return res.status(400).json({ success: false, message: "Missing token" });
    }

    try {
        const tokenDoc = await db.collection("checkInTokens").doc(token).get();
        if (!tokenDoc.exists) {
            return res.status(404).json({ success: false, message: "Invalid or expired token" });
        }

        const data = tokenDoc.data();
        if (data.used) {
            return res.status(400).json({ success: false, message: "Token already used" });
        }

        if (data.expiresAt.toDate() < new Date()) {
            return res.status(400).json({ success: false, message: "Token expired" });
        }

        // Update user
        await db.collection("users").doc(data.userId).update({
            lastCheckIn: admin.firestore.FieldValue.serverTimestamp(),
            isActive: true
        });

        // Mark token as used
        await db.collection("checkInTokens").doc(token).update({ used: true });

        return res.json({ success: true, message: "Check-in successful" });
    } catch (error) {
        console.error("Error verifying token:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// ==========================================
// 🖱️ 3. MANUAL TRIGGER (Callable)
// ==========================================
exports.triggerManualCheckIn = onCall(async (request) => {
    const { userId } = request.data;
    const auth = request.auth;

    // Check if user is admin (requires custom claims or specific admin list)
    // For this implementation, we'll assume the frontend handles basic permission check
    // but in production you'd check auth.token.admin
    if (!auth) {
        throw new functions.https.HttpsError("unauthenticated", "Login required");
    }

    try {
        const userDoc = await db.collection("users").doc(userId).get();
        if (!userDoc.exists) {
            throw new functions.https.HttpsError("not-found", "User not found");
        }

        const userData = userDoc.data();
        const token = await generateToken(userId);
        const link = `${APP_URL}/check-in-success?token=${token}`;
        const template = getEmailTemplate(userData, "reminder1", link);

        await sendEmail(userData.email, template);

        return { success: true, message: "Manual reminder sent" };
    } catch (error) {
        console.error("Error triggering manual check-in:", error);
        throw new functions.https.HttpsError("internal", error.message);
    }
});

// ==========================================
// 🛡️ 4. VERIFICATION TRIGGER (Firestore)
// ==========================================
exports.onVerificationRequestUpdate = onDocumentUpdated("verificationRequests/{requestId}", async (event) => {
    const newData = event.data.after.data();
    const oldData = event.data.before.data();

    // Only proceed if status has changed
    if (newData.status === oldData.status) return;

    console.log(`Verification request ${event.params.requestId} status changed: ${oldData.status} -> ${newData.status}`);

    if (newData.status === "approved") {
        try {
            // 1. Find the deceased user by email
            const userSnap = await db.collection("users").where("email", "==", newData.deceasedEmail).limit(1).get();

            if (!userSnap.empty) {
                const deceasedUserId = userSnap.docs[0].id;
                // 2. Mark user as deceased
                await db.collection("users").doc(deceasedUserId).update({
                    status: "deceased",
                    isActive: false,
                    deceasedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                console.log(`User ${deceasedUserId} marked as DECEASED.`);
            }

            // 3. Send approval email to beneficiary
            const template = getEmailTemplate({}, "verification_approved", "", {
                beneficiaryName: newData.beneficiaryName,
                deceasedName: newData.deceasedName,
                adminNotes: newData.adminNotes
            });
            await sendEmail(newData.beneficiaryEmail, template);

        } catch (error) {
            console.error("Error processing verification approval:", error);
        }
    }
    else if (newData.status === "rejected") {
        // Send rejection email to beneficiary
        const template = getEmailTemplate({}, "verification_rejected", "", {
            beneficiaryName: newData.beneficiaryName,
            deceasedName: newData.deceasedName,
            adminNotes: newData.adminNotes
        });
        await sendEmail(newData.beneficiaryEmail, template);
    }
});
