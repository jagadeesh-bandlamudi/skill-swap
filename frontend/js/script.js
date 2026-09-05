// Initialize Lucide icons
document.addEventListener('DOMContentLoaded', function () {
    // Lucide is optional (kept for backward compatibility)
    if (window.lucide) { try { lucide.createIcons(); } catch (e) {} }

    // Smooth scrolling for navigation links
    initializeSmoothScrolling();

    // Intersection observer for animations
    initializeScrollAnimations();
    // (Mobile menu + header scroll are handled inline in newindex.html)
});

// Mobile menu functionality
function initializeMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function () {
            mobileMenu.classList.toggle('active');

            // Update button icon
            const icon = mobileMenuBtn.querySelector('i');
            if (mobileMenu.classList.contains('active')) {
                icon.setAttribute('data-lucide', 'x');
            } else {
                icon.setAttribute('data-lucide', 'menu');
            }
            lucide.createIcons();
        });

        // Close mobile menu when clicking on nav links
        const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', function () {
                mobileMenu.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                icon.setAttribute('data-lucide', 'menu');
                lucide.createIcons();
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function (event) {
            if (!mobileMenu.contains(event.target) &&
                !mobileMenuBtn.contains(event.target) &&
                mobileMenu.classList.contains('active')) {
                mobileMenu.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                icon.setAttribute('data-lucide', 'menu');
                lucide.createIcons();
            }
        });
    }
}

// Smooth scrolling for navigation links
function initializeSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const headerHeight = 80; // Approximate header height
                const targetPosition = targetSection.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Newsletter subscription functionality
function subscribeNewsletter() {
    const emailInput = document.getElementById('emailInput');
    const email = emailInput.value.trim();

    if (!email) {
        showNotification('Please enter your email address', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }

    // Simulate API call
    showNotification('Subscribing...', 'info');

    setTimeout(() => {
        showNotification('Thank you for subscribing! Welcome to Skill Swap.', 'success');
        emailInput.value = '';
    }, 1500);
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification system — delegates to the premium toast system (ui.js)
function showNotification(message, type = 'info') {
    if (window.toast) return window.toast(message, type);
    console.log(`[${type}] ${message}`);
}

// Initialize scroll animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements that should animate on scroll
    const animatedElements = document.querySelectorAll('.feature-card, .skill-card, .step-card, .teacher-card');

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });
}

// Header scroll behavior
function initializeHeaderScroll() {
    const header = document.querySelector('.header');
    let lastScrollTop = 0;

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            header.style.transform = 'translateY(0)';
        }

        lastScrollTop = scrollTop;
    });
}

// (Demo CTA / skill-card / teacher-card click handlers removed — the landing
//  page now uses real modal + navigation interactions defined in newindex.html.)

// Performance optimization: Debounced scroll handler
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debouncing to scroll-heavy functions
const debouncedScrollHandler = debounce(() => {
    // Any additional scroll-based functionality can go here
}, 16); // ~60fps

window.addEventListener('scroll', debouncedScrollHandler);

// Form handling for newsletter
document.addEventListener('keypress', function (event) {
    if (event.target.id === 'emailInput' && event.key === 'Enter') {
        event.preventDefault();
        subscribeNewsletter();
    }
});

// Add loading states for better UX
function addLoadingState(button) {
    const originalText = button.innerHTML;
    button.innerHTML = '<i data-lucide="loader-2"></i> Loading...';
    button.disabled = true;
    lucide.createIcons();

    return () => {
        button.innerHTML = originalText;
        button.disabled = false;
        lucide.createIcons();
    };
}

// ============================================================
// BACKEND API CONFIGURATION
// ============================================================
// ============================================================
// BACKEND INTEGRATION FOR SIGNUP, OTP, LOGIN & PASSWORD RESET
// ============================================================

document.addEventListener('DOMContentLoaded', function () {

    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');

    // ---- Inline field-error helpers (clear, per-field messages) ----
    function setFieldError(inputId, errorId, msg) {
        const input = document.getElementById(inputId);
        const err = document.getElementById(errorId);
        if (input) input.classList.add('invalid');
        if (err) { err.textContent = msg; err.style.display = 'block'; }
    }
    function clearFieldError(inputId, errorId) {
        const input = document.getElementById(inputId);
        const err = document.getElementById(errorId);
        if (input) input.classList.remove('invalid');
        if (err) { err.textContent = ''; err.style.display = 'none'; }
    }
    // Clear a field's error as soon as the user edits it
    ['signupEmail:signupEmailError', 'signupPhone:signupPhoneError',
     'signupPassword:signupPasswordError', 'signupConfirmPassword:signupConfirmPasswordError',
     'loginEmail:loginEmailError', 'loginPassword:loginPasswordError'].forEach(pair => {
        const [i, e] = pair.split(':');
        const el = document.getElementById(i);
        if (el) el.addEventListener('input', () => clearFieldError(i, e));
    });


    // ========================================================
    // SIGNUP
    // ========================================================

    async function handleSignup(event) {
        event.preventDefault();

        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const confirmPassword =
            document.getElementById('signupConfirmPassword').value;
        const phoneNumber =
            document.getElementById('signupPhone').value.trim();

        // Clear old errors
        clearFieldError('signupEmail', 'signupEmailError');
        clearFieldError('signupPhone', 'signupPhoneError');
        clearFieldError('signupPassword', 'signupPasswordError');
        clearFieldError('signupConfirmPassword', 'signupConfirmPasswordError');

        // ---- Validate each field with a specific reason ----
        let valid = true;
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) {
            setFieldError('signupEmail', 'signupEmailError', 'Email is required.'); valid = false;
        } else if (!emailRe.test(email)) {
            setFieldError('signupEmail', 'signupEmailError', 'Enter a valid email address.'); valid = false;
        } else if (!/@(gmail\.com|rguktong\.ac\.in)$/i.test(email)) {
            setFieldError('signupEmail', 'signupEmailError', 'Use a gmail.com or rguktong.ac.in email.'); valid = false;
        }

        if (!phoneNumber) {
            setFieldError('signupPhone', 'signupPhoneError', 'Phone number is required.'); valid = false;
        } else if (!/^\d{10}$/.test(phoneNumber)) {
            setFieldError('signupPhone', 'signupPhoneError', 'Phone number must be exactly 10 digits.'); valid = false;
        }

        if (!password) {
            setFieldError('signupPassword', 'signupPasswordError', 'Password is required.'); valid = false;
        } else if (password.length < 6) {
            setFieldError('signupPassword', 'signupPasswordError', 'Password must be at least 6 characters.'); valid = false;
        }

        if (!confirmPassword) {
            setFieldError('signupConfirmPassword', 'signupConfirmPasswordError', 'Please re-enter your password.'); valid = false;
        } else if (password !== confirmPassword) {
            setFieldError('signupConfirmPassword', 'signupConfirmPasswordError', 'Passwords do not match.'); valid = false;
        }

        if (!valid) {
            toast('Please fix the highlighted fields.', 'warning');
            return;
        }


        try {

            const response = await fetch(
                `${API_BASE_URL}/api/auth/signup`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify({
                        email,
                        password,
                        phoneNumber
                    })
                }
            );


            // Safely read JSON response
            const text = await response.text();

            let data = {};

            if (text) {
                try {
                    data = JSON.parse(text);
                } catch (jsonError) {
                    console.error(
                        'Signup response was not valid JSON:',
                        text
                    );
                }
            }


            if (response.ok) {

                toast(
                    data.msg ||
                    'OTP has been sent to your email.'
                );


                // Store email for OTP verification
                sessionStorage.setItem(
                    'verificationEmail',
                    email
                );


                // Close signup modal
                const signUpModal =
                    document.getElementById('signUpModal');

                if (signUpModal) {
                    signUpModal.classList.remove('active');
                }


                // Open OTP modal
                const otpModal =
                    document.getElementById('otpModal');

                if (otpModal) {
                    otpModal.classList.add('active');
                }

            } else {

                let msg = data.msg;
                if (!msg) {
                    if (response.status >= 500) {
                        msg = 'Server error — the database or email service may be unavailable. Please try again shortly.';
                    } else if (response.status === 400) {
                        msg = 'An account with this email already exists. Try signing in instead.';
                    } else {
                        msg = 'Signup failed. Please try again.';
                    }
                }
                toast(msg, 'error');
            }

        } catch (error) {

            console.error(
                'Error during signup:',
                error
            );

            toast('Cannot connect to the server. Please make sure the backend is running.', 'error');
        }
    }


    // ========================================================
    // OTP VERIFICATION
    // ========================================================

    async function handleOtpVerification(event) {

        event.preventDefault();


        const otp =
            document.getElementById('otpInput').value.trim();

        const email =
            sessionStorage.getItem('verificationEmail');


        // Check email
        if (!email) {

            toast('Something went wrong. Please sign up again.', 'error');

            return;
        }


        // Check OTP
        if (!otp) {

            toast('Please enter the code.', 'warning');

            return;
        }


        try {

            console.log(
                'Verifying OTP for:',
                email
            );


            const response = await fetch(
                `${API_BASE_URL}/api/auth/verify-otp`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify({
                        email,
                        otp
                    })
                }
            );


            // Safely read response
            const text = await response.text();

            let data = {};

            if (text) {

                try {

                    data = JSON.parse(text);

                } catch (jsonError) {

                    console.error(
                        'OTP response was not valid JSON:',
                        text
                    );
                }
            }


            console.log(
                'OTP verification response:',
                response.status,
                data
            );


            if (response.ok) {

                // Store JWT
                if (data.token) {

                    localStorage.setItem(
                        'token',
                        data.token
                    );
                }


                // Store user ID if backend sends it
                if (data.user && data.user._id) {

                    localStorage.setItem(
                        'userId',
                        data.user._id
                    );
                }


                // Store full name if available
                if (
                    data.user &&
                    data.user.profile &&
                    data.user.profile.fullName
                ) {

                    localStorage.setItem(
                        'fullName',
                        data.user.profile.fullName
                    );
                }


                // Remove temporary email
                sessionStorage.removeItem(
                    'verificationEmail'
                );


                toast(
                    data.msg ||
                    'Account created successfully!'
                );


                // Redirect to profile setup
                window.location.href =
                    'profile-1.html';

            } else {

                toast(
                    data.msg ||
                    'OTP verification failed.'
                );
            }

        } catch (error) {

            console.error(
                'Error during OTP verification:',
                error
            );

            toast('Cannot connect to the server. Please try again.', 'error');
        }
    }


    // ========================================================
    // LOGIN
    // ========================================================

    async function handleLogin(event) {

        event.preventDefault();


        const email =
            document.getElementById('loginEmail').value.trim();

        const password =
            document.getElementById('loginPassword').value;


        try {

            const response = await fetch(
                `${API_BASE_URL}/api/auth/signin`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );


            const text = await response.text();

            let data = {};

            if (text) {

                try {
                    data = JSON.parse(text);
                } catch (jsonError) {
                    console.error(
                        'Login response was not valid JSON:',
                        text
                    );
                }
            }


            if (response.ok) {

                // Save JWT
                if (data.token) {

                    localStorage.setItem(
                        'token',
                        data.token
                    );
                }


                // Save user ID
                if (data.user && data.user._id) {

                    localStorage.setItem(
                        'userId',
                        data.user._id
                    );
                }


                // Save full name
                if (
                    data.user &&
                    data.user.profile &&
                    data.user.profile.fullName
                ) {

                    localStorage.setItem(
                        'fullName',
                        data.user.profile.fullName
                    );
                }


                // Decode JWT if parseJwt exists
                if (
                    typeof parseJwt === 'function' &&
                    data.token
                ) {

                    const payload =
                        parseJwt(data.token);

                    console.log(
                        'TOKEN PAYLOAD:',
                        payload
                    );


                    if (
                        payload &&
                        payload.user &&
                        payload.user.role === 'admin'
                    ) {

                        window.location.href =
                            'admin.html';

                    } else {

                        window.location.href =
                            'homepage.html';
                    }

                } else {

                    window.location.href =
                        'homepage.html';
                }

            } else {

                toast(
                    data.msg ||
                    'Login failed.'
                );
            }

        } catch (error) {

            console.error(
                'Error during login:',
                error
            );

            toast('Cannot connect to the server. Please try again.', 'error');
        }
    }


    // ========================================================
    // FORGOT PASSWORD
    // ========================================================

    const signInModal =
        document.getElementById('signInModal');

    const forgotPasswordModal =
        document.getElementById('forgotPasswordModal');

    const resetPasswordModal =
        document.getElementById('resetPasswordModal');


    const forgotPasswordLink =
        document.getElementById('forgotPasswordLink');


    if (forgotPasswordLink) {

        forgotPasswordLink.addEventListener(
            'click',
            (event) => {

                event.preventDefault();

                if (signInModal) {
                    signInModal.classList.remove('active');
                }

                if (forgotPasswordModal) {
                    forgotPasswordModal.classList.add('active');
                }
            }
        );
    }


    // ========================================================
    // BACK TO SIGN IN
    // ========================================================

    const backToSignInLink =
        document.getElementById('backToSignInLink');


    if (backToSignInLink) {

        backToSignInLink.addEventListener(
            'click',
            (event) => {

                event.preventDefault();

                if (forgotPasswordModal) {
                    forgotPasswordModal.classList.remove('active');
                }

                if (signInModal) {
                    signInModal.classList.add('active');
                }
            }
        );
    }


    // ========================================================
    // SEND PASSWORD RESET OTP
    // ========================================================

    const forgotPasswordForm =
        document.getElementById('forgotPasswordForm');


    if (forgotPasswordForm) {

        forgotPasswordForm.addEventListener(
            'submit',
            async (event) => {

                event.preventDefault();


                const email =
                    document
                        .getElementById('forgotPasswordEmail')
                        .value
                        .trim();


                try {

                    const response = await fetch(
                        `${API_BASE_URL}/api/auth/forgot-password`,
                        {
                            method: 'POST',

                            headers: {
                                'Content-Type':
                                    'application/json'
                            },

                            body: JSON.stringify({
                                email
                            })
                        }
                    );


                    const text =
                        await response.text();

                    let data = {};

                    if (text) {

                        try {
                            data = JSON.parse(text);
                        } catch (jsonError) {
                            console.error(
                                'Forgot password response was not JSON:',
                                text
                            );
                        }
                    }


                    toast(
                        data.msg ||
                        'Password reset OTP request completed.'
                    );


                    if (response.ok) {

                        sessionStorage.setItem(
                            'resetEmail',
                            email
                        );


                        if (forgotPasswordModal) {
                            forgotPasswordModal.classList.remove(
                                'active'
                            );
                        }


                        if (resetPasswordModal) {
                            resetPasswordModal.classList.add(
                                'active'
                            );
                        }
                    }

                } catch (error) {

                    console.error(
                        'Forgot password error:',
                        error
                    );

                    toast('Cannot connect to the server. Please try again.', 'error');
                }
            }
        );
    }


    // ========================================================
    // RESET PASSWORD
    // ========================================================

    const resetPasswordForm =
        document.getElementById('resetPasswordForm');


    if (resetPasswordForm) {

        resetPasswordForm.addEventListener(
            'submit',
            async (event) => {

                event.preventDefault();


                const otp =
                    document
                        .getElementById('resetOtpInput')
                        .value
                        .trim();


                const newPassword =
                    document
                        .getElementById('resetNewPassword')
                        .value;


                const email =
                    sessionStorage.getItem(
                        'resetEmail'
                    );


                if (!email) {

                    toast('Session expired. Please restart the reset process.', 'error');

                    return;
                }


                try {

                    const response = await fetch(
                        `${API_BASE_URL}/api/auth/reset-password`,
                        {
                            method: 'POST',

                            headers: {
                                'Content-Type':
                                    'application/json'
                            },

                            body: JSON.stringify({
                                email,
                                otp,
                                newPassword
                            })
                        }
                    );


                    const text =
                        await response.text();

                    let data = {};

                    if (text) {

                        try {
                            data = JSON.parse(text);
                        } catch (jsonError) {
                            console.error(
                                'Reset password response was not JSON:',
                                text
                            );
                        }
                    }


                    if (response.ok) {

                        if (data.token) {

                            localStorage.setItem(
                                'token',
                                data.token
                            );
                        }


                        sessionStorage.removeItem(
                            'resetEmail'
                        );


                        toast(
                            data.msg ||
                            'Password reset successfully!'
                        );


                        window.location.href =
                            'homepage.html';

                    } else {

                        toast(
                            data.msg ||
                            'Invalid or expired OTP.'
                        );
                    }

                } catch (error) {

                    console.error(
                        'Reset password error:',
                        error
                    );

                    toast('Cannot connect to the server. Please try again.', 'error');
                }
            }
        );
    }


    // ========================================================
    // OTP FORM EVENT
    // ========================================================

    const otpForm =
        document.getElementById('otpForm');


    if (otpForm) {

        otpForm.addEventListener(
            'submit',
            handleOtpVerification
        );
    }


    // ========================================================
    // CLOSE OTP MODAL
    // ========================================================

    const closeOtpModalBtn =
        document.getElementById('closeOtpModal');


    if (closeOtpModalBtn) {

        closeOtpModalBtn.addEventListener(
            'click',
            function () {

                const otpModal =
                    document.getElementById('otpModal');

                if (otpModal) {
                    otpModal.classList.remove('active');
                }
            }
        );
    }


    // ========================================================
    // CLOSE FORGOT PASSWORD MODAL
    // ========================================================

    const closeForgotPasswordModal =
        document.getElementById(
            'closeForgotPasswordModal'
        );


    if (closeForgotPasswordModal) {

        closeForgotPasswordModal.addEventListener(
            'click',
            () => {

                if (forgotPasswordModal) {
                    forgotPasswordModal.classList.remove(
                        'active'
                    );
                }
            }
        );
    }


    // ========================================================
    // CLOSE RESET PASSWORD MODAL
    // ========================================================

    const closeResetPasswordModal =
        document.getElementById(
            'closeResetPasswordModal'
        );


    if (closeResetPasswordModal) {

        closeResetPasswordModal.addEventListener(
            'click',
            () => {

                if (resetPasswordModal) {
                    resetPasswordModal.classList.remove(
                        'active'
                    );
                }
            }
        );
    }


    // ========================================================
    // FORM EVENT LISTENERS
    // ========================================================

    if (signupForm) {

        signupForm.addEventListener(
            'submit',
            handleSignup
        );
    }


    if (loginForm) {

        loginForm.addEventListener(
            'submit',
            handleLogin
        );
    }

});

// Enhanced error handling
window.addEventListener('error', function (event) {
    console.error('JavaScript error:', event.error);
    // In a real application, you might want to send this to an error tracking service
});

// Console welcome message
console.log('%c🚀 Welcome to Skill Swap!', 'color: #6366f1; font-size: 16px; font-weight: bold;');
console.log('%cThis is a demo version converted from React to vanilla HTML/CSS/JS', 'color: #64748b; font-size: 12px;');