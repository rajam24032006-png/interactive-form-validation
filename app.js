/**
 * Interactive Form Validation Application
 * Handles real-time form validation with visual feedback
 */

// Validation patterns and messages from requirements
const VALIDATION_CONFIG = {
    patterns: {
        email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        name: /^[a-zA-Z\s]+$/,
        password: {
            minLength: 8,
            uppercase: /[A-Z]/,
            lowercase: /[a-z]/,
            number: /[0-9]/,
            special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/
        }
    },
    messages: {
        name: {
            required: "Full name is required",
            minLength: "Name must be at least 3 characters long",
            noNumbers: "Name cannot contain numbers",
            valid: "Valid name"
        },
        email: {
            required: "Email address is required",
            invalid: "Please enter a valid email address",
            valid: "Valid email address"
        },
        password: {
            required: "Password is required",
            weak: "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
            valid: "Strong password"
        },
        confirmPassword: {
            required: "Please confirm your password",
            noMatch: "Passwords do not match",
            valid: "Passwords match"
        }
    }
};

// Form validation state
let formState = {
    fullName: { isValid: false, touched: false },
    email: { isValid: false, touched: false },
    password: { isValid: false, touched: false },
    confirmPassword: { isValid: false, touched: false }
};

// DOM elements
const form = document.getElementById('registrationForm');
const fields = {
    fullName: document.getElementById('fullName'),
    email: document.getElementById('email'),
    password: document.getElementById('password'),
    confirmPassword: document.getElementById('confirmPassword')
};
const submitButton = document.getElementById('submitButton');
const successModal = document.getElementById('successModal');
const progressFill = document.getElementById('progress-fill');
const progressPercentage = document.getElementById('progress-percentage');

/**
 * Initialize the form validation system
 */
function initializeForm() {
    // Add event listeners for real-time validation
    Object.keys(fields).forEach(fieldName => {
        const field = fields[fieldName];
        
        // Validate on input (real-time)
        field.addEventListener('input', () => handleFieldValidation(fieldName, field));
        
        // Mark as touched on blur
        field.addEventListener('blur', () => {
            formState[fieldName].touched = true;
            handleFieldValidation(fieldName, field);
        });
        
        // Clear validation state on focus
        field.addEventListener('focus', () => clearValidationDisplay(fieldName));
    });

    // Password visibility toggle
    const togglePassword = document.querySelector('.toggle-password');
    togglePassword.addEventListener('click', togglePasswordVisibility);

    // Form submission
    form.addEventListener('submit', handleFormSubmission);

    // Modal close functionality
    const modalClose = document.querySelector('.modal-close');
    const modalOkButton = document.getElementById('modalOkButton');
    const modalOverlay = document.querySelector('.modal-overlay');
    
    modalClose.addEventListener('click', closeModal);
    modalOkButton.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    // Initialize form state
    updateFormProgress();
    updateSubmitButton();
}

/**
 * Handle validation for a specific field
 */
function handleFieldValidation(fieldName, field) {
    const value = field.value.trim();
    let isValid = false;
    let message = '';
    let messageType = '';

    // Mark field as touched
    formState[fieldName].touched = true;

    switch (fieldName) {
        case 'fullName':
            ({ isValid, message, messageType } = validateName(value));
            break;
        case 'email':
            ({ isValid, message, messageType } = validateEmail(value));
            break;
        case 'password':
            ({ isValid, message, messageType } = validatePassword(value));
            updatePasswordStrength(value);
            // Re-validate confirm password if it has a value
            if (fields.confirmPassword.value) {
                handleFieldValidation('confirmPassword', fields.confirmPassword);
            }
            break;
        case 'confirmPassword':
            ({ isValid, message, messageType } = validateConfirmPassword(value, fields.password.value));
            break;
    }

    // Update form state
    formState[fieldName].isValid = isValid;

    // Update UI
    updateFieldDisplay(fieldName, field, isValid, message, messageType);
    updateFormProgress();
    updateSubmitButton();
}

/**
 * Validate full name field
 */
function validateName(value) {
    if (!value) {
        return {
            isValid: false,
            message: VALIDATION_CONFIG.messages.name.required,
            messageType: 'error'
        };
    }

    if (value.length < 3) {
        return {
            isValid: false,
            message: VALIDATION_CONFIG.messages.name.minLength,
            messageType: 'error'
        };
    }

    if (!VALIDATION_CONFIG.patterns.name.test(value)) {
        return {
            isValid: false,
            message: VALIDATION_CONFIG.messages.name.noNumbers,
            messageType: 'error'
        };
    }

    return {
        isValid: true,
        message: VALIDATION_CONFIG.messages.name.valid,
        messageType: 'success'
    };
}

/**
 * Validate email field
 */
function validateEmail(value) {
    if (!value) {
        return {
            isValid: false,
            message: VALIDATION_CONFIG.messages.email.required,
            messageType: 'error'
        };
    }

    if (!VALIDATION_CONFIG.patterns.email.test(value)) {
        return {
            isValid: false,
            message: VALIDATION_CONFIG.messages.email.invalid,
            messageType: 'error'
        };
    }

    return {
        isValid: true,
        message: VALIDATION_CONFIG.messages.email.valid,
        messageType: 'success'
    };
}

/**
 * Validate password field
 */
function validatePassword(value) {
    if (!value) {
        return {
            isValid: false,
            message: VALIDATION_CONFIG.messages.password.required,
            messageType: 'error'
        };
    }

    const { minLength, uppercase, lowercase, number, special } = VALIDATION_CONFIG.patterns.password;
    
    if (value.length < minLength ||
        !uppercase.test(value) ||
        !lowercase.test(value) ||
        !number.test(value) ||
        !special.test(value)) {
        return {
            isValid: false,
            message: VALIDATION_CONFIG.messages.password.weak,
            messageType: 'error'
        };
    }

    return {
        isValid: true,
        message: VALIDATION_CONFIG.messages.password.valid,
        messageType: 'success'
    };
}

/**
 * Validate confirm password field
 */
function validateConfirmPassword(value, passwordValue) {
    if (!value) {
        return {
            isValid: false,
            message: VALIDATION_CONFIG.messages.confirmPassword.required,
            messageType: 'error'
        };
    }

    if (value !== passwordValue) {
        return {
            isValid: false,
            message: VALIDATION_CONFIG.messages.confirmPassword.noMatch,
            messageType: 'error'
        };
    }

    return {
        isValid: true,
        message: VALIDATION_CONFIG.messages.confirmPassword.valid,
        messageType: 'success'
    };
}

/**
 * Update password strength indicator
 */
function updatePasswordStrength(password) {
    const strengthBar = document.querySelector('.strength-bar');
    const strengthLevel = document.querySelector('.strength-level');
    
    if (!password) {
        strengthBar.className = 'strength-bar';
        strengthLevel.textContent = 'Not set';
        return;
    }

    let strength = 0;
    const checks = VALIDATION_CONFIG.patterns.password;
    
    // Check each requirement
    if (password.length >= checks.minLength) strength++;
    if (checks.uppercase.test(password)) strength++;
    if (checks.lowercase.test(password)) strength++;
    if (checks.number.test(password)) strength++;
    if (checks.special.test(password)) strength++;

    // Update strength display
    strengthBar.className = 'strength-bar';
    
    switch (strength) {
        case 0:
        case 1:
            strengthBar.classList.add('weak');
            strengthLevel.textContent = 'Weak';
            strengthLevel.style.color = 'var(--color-error)';
            break;
        case 2:
        case 3:
            strengthBar.classList.add('fair');
            strengthLevel.textContent = 'Fair';
            strengthLevel.style.color = 'var(--color-warning)';
            break;
        case 4:
            strengthBar.classList.add('good');
            strengthLevel.textContent = 'Good';
            strengthLevel.style.color = 'var(--color-info)';
            break;
        case 5:
            strengthBar.classList.add('strong');
            strengthLevel.textContent = 'Strong';
            strengthLevel.style.color = 'var(--color-success)';
            break;
    }
}

/**
 * Update field display with validation results
 */
function updateFieldDisplay(fieldName, field, isValid, message, messageType) {
    const inputWrapper = field.closest('.input-wrapper');
    const validationIcon = inputWrapper.querySelector('.validation-icon');
    const errorElement = document.getElementById(`${fieldName}-error`);
    const successElement = document.getElementById(`${fieldName}-success`);

    // Update field styling
    field.classList.remove('valid', 'invalid');
    if (formState[fieldName].touched) {
        field.classList.add(isValid ? 'valid' : 'invalid');
    }

    // Update validation icon
    validationIcon.classList.remove('success', 'error', 'visible');
    if (formState[fieldName].touched) {
        validationIcon.classList.add(isValid ? 'success' : 'error', 'visible');
    }

    // Update messages
    errorElement.classList.remove('visible');
    successElement.classList.remove('visible');
    
    if (formState[fieldName].touched && message) {
        const targetElement = messageType === 'error' ? errorElement : successElement;
        targetElement.textContent = message;
        targetElement.classList.add('visible');
    }
}

/**
 * Clear validation display for a field
 */
function clearValidationDisplay(fieldName) {
    const field = fields[fieldName];
    const inputWrapper = field.closest('.input-wrapper');
    const validationIcon = inputWrapper.querySelector('.validation-icon');
    const errorElement = document.getElementById(`${fieldName}-error`);
    const successElement = document.getElementById(`${fieldName}-success`);

    // Don't clear if field is already touched and has value
    if (formState[fieldName].touched && field.value.trim()) {
        return;
    }

    // Clear styling and icons
    field.classList.remove('valid', 'invalid');
    validationIcon.classList.remove('success', 'error', 'visible');
    errorElement.classList.remove('visible');
    successElement.classList.remove('visible');
}

/**
 * Update form progress indicator
 */
function updateFormProgress() {
    const totalFields = Object.keys(formState).length;
    const validFields = Object.values(formState).filter(field => field.isValid).length;
    const progress = Math.round((validFields / totalFields) * 100);
    
    progressFill.style.width = `${progress}%`;
    progressPercentage.textContent = `${progress}%`;
}

/**
 * Update submit button state
 */
function updateSubmitButton() {
    const allFieldsValid = Object.values(formState).every(field => field.isValid);
    const allFieldsTouched = Object.values(formState).every(field => field.touched);
    
    submitButton.disabled = !(allFieldsValid && allFieldsTouched);
    
    if (allFieldsValid && allFieldsTouched) {
        submitButton.textContent = 'Create Account';
        submitButton.classList.remove('loading');
    }
}

/**
 * Toggle password visibility
 */
function togglePasswordVisibility() {
    const passwordField = fields.password;
    const eyeIcon = document.querySelector('.password-eye');
    
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        eyeIcon.textContent = '🙈';
    } else {
        passwordField.type = 'password';
        eyeIcon.textContent = '👁️';
    }
}

/**
 * Handle form submission
 */
function handleFormSubmission(event) {
    event.preventDefault();
    
    // Final validation check
    const allFieldsValid = Object.values(formState).every(field => field.isValid);
    
    if (!allFieldsValid) {
        alert('Please fix all validation errors before submitting.');
        return;
    }

    // Show loading state
    submitButton.classList.add('loading');
    submitButton.disabled = true;

    // Simulate form submission delay
    setTimeout(() => {
        showSuccessModal();
        submitButton.classList.remove('loading');
        submitButton.disabled = false;
    }, 1500);
}

/**
 * Show success modal
 */
function showSuccessModal() {
    successModal.classList.remove('hidden');
    // Focus management for accessibility
    const modalTitle = document.getElementById('modal-title');
    modalTitle.focus();
}

/**
 * Close success modal
 */
function closeModal() {
    successModal.classList.add('hidden');
    // Reset form for demo purposes
    resetForm();
}

/**
 * Reset form to initial state
 */
function resetForm() {
    // Clear all field values
    Object.values(fields).forEach(field => {
        field.value = '';
        field.classList.remove('valid', 'invalid');
    });

    // Reset form state
    Object.keys(formState).forEach(fieldName => {
        formState[fieldName] = { isValid: false, touched: false };
    });

    // Clear all validation displays
    document.querySelectorAll('.validation-icon').forEach(icon => {
        icon.classList.remove('success', 'error', 'visible');
    });

    document.querySelectorAll('.error-message, .success-message').forEach(msg => {
        msg.classList.remove('visible');
        msg.textContent = '';
    });

    // Reset password strength
    updatePasswordStrength('');
    
    // Reset progress and submit button
    updateFormProgress();
    updateSubmitButton();

    // Focus first field
    fields.fullName.focus();
}

/**
 * Handle keyboard navigation for accessibility
 */
function handleKeyboardNavigation(event) {
    // Close modal on Escape key
    if (event.key === 'Escape' && !successModal.classList.contains('hidden')) {
        closeModal();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeForm);
document.addEventListener('keydown', handleKeyboardNavigation);

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateName,
        validateEmail,
        validatePassword,
        validateConfirmPassword,
        VALIDATION_CONFIG
    };
}