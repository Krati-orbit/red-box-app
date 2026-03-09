# Red Box Deployment Guide: Check-in System

This guide outlines the steps to deploy and configure the Automated Email Check-in System.

## 1. Firebase Plan Upgrade
You must be on the **Firebase Blaze (Pay-as-you-go)** plan to use Cloud Functions and Cloud Scheduler.

## 2. Environment Variables
You need to set the following environment variables in your Firebase project for NodeMailer to work:

```bash
# Set Gmail credentials for NodeMailer
firebase functions:secrets:set GMAIL_USER
# Input your gmail (e.g., yourname@gmail.com)

firebase functions:secrets:set GMAIL_PASS
# Input your Gmail App Password (NOT your regular password)
# Generate one at: https://myaccount.google.com/apppasswords

# Set your App's URL (for link generation)
firebase functions:config:set app.url="https://your-app-domain.web.app"
```

## 3. Install Dependencies
Navigate to the functions directory and install dependencies:
```bash
cd functions
npm install
```

## 4. Deploy to Firebase
Run the deployment command from the root directory:

```bash
# Deploy Functions, Firestore Rules, and Indexes
firebase deploy --only functions,firestore
```

## 5. Local Testing
To test the functions locally:
1.  Run `firebase emulators:start --only functions,firestore`.
2.  Use the [Firebase Emulator UI](http://localhost:4000) to trigger the `dailyCheckInPulse` function manually.
3.  Check the logs in terminal or Emulator UI for email simulation.

## 6. Admin Setup
To see the Admin Panel in your profile:
1.  Open Firestore in the Firebase Console.
2.  Find your user document in the `users` collection.
3.  Add a boolean field: `isAdmin: true`.
4.  Refresh the app and go to your Profile page.

---
**Security Note:** Always keep your `GMAIL_PASS` secret. Never commit it to version control.
