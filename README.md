# 🔒 Red Box — Secure Your Legacy

A modern web application for securing important documents, passwords, and digital assets with end-to-end encryption. Red Box implements a "deadman's switch" system to ensure your digital legacy is safely transferred to designated beneficiaries.

## ✨ Features

### 🔐 Security First
- **AES-256 Encryption**: Military-grade encryption for all documents
- **Zero-Knowledge Architecture**: Files are encrypted client-side in the browser
- **End-to-End Encrypted**: Even the servers cannot access your files

### 📄 Document Management
- Upload and store important documents (wills, property papers, passwords)
- Organize files with categories and tags
- Secure file metadata and storage

### 👥 Beneficiary System
- Add trusted contacts as beneficiaries
- Assign specific documents to specific beneficiaries
- Manual verification process before document release

### ⏱️ Deadman's Switch
- Regular check-ins to confirm account activity
- Automatic beneficiary notification after missed check-ins
- Customizable check-in frequency (default: 90 days)

### 🛡️ Verified Release
- Documents unlock only after proper verification
- Email notifications to beneficiaries
- Step-by-step access instructions

## 📁 Project Structure

```
red-box-app/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All CSS styling
├── js/
│   └── app.js          # JavaScript functionality
└── README.md           # This file
```

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No server required for basic functionality

### Installation

1. **Clone or download** this repository
2. **Open** `index.html` in your web browser
3. That's it! The app runs entirely client-side

### Usage

1. **Home Page**: Learn about Red Box features
2. **Sign Up**: Create a new account (demo mode)
3. **Dashboard**: Overview of your secured documents and beneficiaries
4. **Upload Documents**: Add files with encryption
5. **Add Beneficiaries**: Designate trusted contacts
6. **Check-in**: Confirm your account is active

## 🎨 Design Features

- **Dark Mode UI**: Modern, premium dark interface
- **Smooth Animations**: Fade-up transitions and micro-interactions
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Noise Texture**: Subtle grain overlay for depth
- **Red Accent Theme**: Bold red highlights with dark backgrounds

## 🛠️ Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Custom properties, grid, flexbox, animations
- **Vanilla JavaScript**: No frameworks, pure JS
- **Google Fonts**: Space Mono (monospace) & DM Sans (sans-serif)

## 📄 File Descriptions

### `index.html`
The main HTML structure containing all page templates:
- Landing page
- Login/Signup pages
- Dashboard
- Documents page
- Upload page
- Beneficiaries pages

### `css/styles.css`
Complete styling including:
- CSS custom properties (design tokens)
- Component styles (buttons, cards, forms)
- Page-specific layouts
- Animations and transitions
- Responsive breakpoints

### `js/app.js`
Application logic including:
- Page navigation system
- User authentication (demo)
- Toast notifications
- Password strength checker
- File upload handling
- Form interactions

## 🔧 Customization

### Colors
Edit CSS custom properties in `css/styles.css`:
```css
:root {
  --red: #dc2626;
  --bg: #0a0a0a;
  --text: #f5f5f5;
  /* ... more variables */
}
```

### Pages
Add new pages by:
1. Adding page ID to `pages` object in `js/app.js`
2. Creating page HTML in `index.html`
3. Styling in `css/styles.css`

## 📱 Responsive Design

The app is fully responsive with breakpoints at:
- **Desktop**: 1100px+ (default)
- **Tablet**: 768px - 1099px
- **Mobile**: below 768px

## 🔮 Future Enhancements

- [ ] Real backend integration (Firebase/Supabase)
- [ ] Actual file encryption (Web Crypto API)
- [ ] Email notifications system
- [ ] Two-factor authentication
- [ ] Document sharing permissions
- [ ] Activity audit logs
- [ ] Mobile apps (iOS/Android)

## ⚠️ Current Status

This is a **frontend prototype/demo**. For production use, you would need:
- Backend server for authentication
- Database for user/document storage
- Real encryption implementation
- Email service integration
- Payment processing (if monetizing)

## 📝 License

This project is provided as-is for educational and demonstration purposes.

## 🤝 Contributing

This is a standalone demo project. Feel free to fork and customize for your own needs!

## 📧 Contact

For questions or feedback, please open an issue in the repository.

---

**Built with ❤️ for securing digital legacies**
