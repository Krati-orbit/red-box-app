// src/utils/validators.js — Shared validation functions for beneficiary forms
// Each returns null if valid, or a string error message.

export function validateName(val) {
    if (!val || !val.trim()) return 'Full name is required'
    if (val.trim().length < 2) return 'Name must be at least 2 characters'
    if (val.trim().length > 60) return 'Name must be under 60 characters'
    if (!/^[a-zA-Z\s\-'.]+$/.test(val.trim()))
        return 'Name can only contain letters, spaces, hyphens, and apostrophes'
    return null
}

export function validateEmail(val) {
    if (!val || !val.trim()) return 'Email address is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val.trim()))
        return 'Please enter a valid email address (e.g. priya@example.com)'
    return null
}

export function validatePhone(val) {
    if (!val || !val.trim()) return null
    const digits = val.replace(/\D/g, '')
    if (!/^[+\d\s\-().]+$/.test(val)) return 'Phone can only contain digits, +, -, spaces, and parentheses'
    if (digits.length < 7) return 'Phone number must have at least 7 digits'
    if (digits.length > 15) return 'Phone number must not exceed 15 digits'
    return null
}

export function validateProfession(val) {
    if (!val || !val.trim()) return null
    if (val.trim().length < 2) return 'Profession must be at least 2 characters'
    if (val.trim().length > 60) return 'Profession must be under 60 characters'
    if (!/^[a-zA-Z\s\-\/.,&]+$/.test(val.trim()))
        return 'Profession can only contain letters, spaces, and common punctuation'
    return null
}

export function validateDob(val) {
    if (!val) return null
    const dob = new Date(val)
    if (isNaN(dob.getTime())) return 'Please enter a valid date'
    if (dob >= new Date()) return 'Date of birth must be in the past'
    const maxAge = new Date()
    maxAge.setFullYear(maxAge.getFullYear() - 130)
    if (dob < maxAge) return 'Please enter a realistic date of birth'
    return null
}

export function validateAddress(val) {
    if (!val || !val.trim()) return null
    if (val.trim().length < 5) return 'Address must be at least 5 characters'
    if (val.trim().length > 300) return 'Address is too long (max 300 characters)'
    if (!/[a-zA-Z]/.test(val)) return 'Address must contain letters (e.g. street name, city)'
    if (/[<>{}|\\^`]/.test(val)) return 'Address contains invalid characters'
    return null
}

export function validateIdNumber(idType, idNumber) {
    if (!idNumber || !idNumber.trim()) return null
    const val = idNumber.trim().toUpperCase()
    switch (idType) {
        case 'Aadhaar Card':
            if (!/^\d{12}$/.test(val)) return 'Aadhaar number must be exactly 12 digits'
            break
        case 'PAN Card':
            if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val))
                return 'PAN must be in format: ABCDE1234F (5 letters, 4 digits, 1 letter)'
            break
        case 'Passport':
            if (!/^[A-Z][0-9]{7}$/.test(val)) return 'Passport must be 1 letter followed by 7 digits (e.g. A1234567)'
            break
        case 'Voter ID':
            if (!/^[A-Z]{3}[0-9]{7}$/.test(val)) return 'Voter ID must be 3 letters followed by 7 digits'
            break
        case 'Driving Licence':
            if (!/^[A-Z]{2}\d{2}[A-Z0-9]{2}\d{7,}$/.test(val)) return 'Driving licence format is invalid'
            break
        default:
            if (!/^[A-Z0-9\-\/]{4,30}$/.test(val)) return 'ID number must be 4–30 alphanumeric characters'
    }
    return null
}

export function validateNotes(val) {
    if (!val || !val.trim()) return null
    if (val.length > 1000) return 'Notes must not exceed 1000 characters'
    if (/<script|javascript:|on\w+=/i.test(val)) return 'Notes contain invalid content'
    return null
}

export function validateBeneficiaryForm({ name, email, phone, altPhone, profession, dob, address, idType, idNumber, notes }) {
    const errors = {}
    const check = (key, fn, ...args) => { const err = fn(...args); if (err) errors[key] = err }
    check('name', validateName, name)
    check('email', validateEmail, email)
    check('phone', validatePhone, phone)
    check('altPhone', validatePhone, altPhone)
    check('profession', validateProfession, profession)
    check('dob', validateDob, dob)
    check('address', validateAddress, address)
    check('idNumber', validateIdNumber, idType, idNumber)
    check('notes', validateNotes, notes)
    return errors
}
