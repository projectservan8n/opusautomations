// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize particles
    initParticles();
    
    // Initialize navigation
    initNavigation();
    
    // Initialize contact form
    initContactForm();
    
    // Initialize assessment form
    initAssessmentForm();
    
    // Initialize smooth scrolling
    initSmoothScrolling();
    
    // Initialize animations
    initAnimations();
});

// Initialize Twemoji
function initTwemoji() {
    try {
        if (window.twemoji) {
            twemoji.parse(document.body, {
                folder: 'svg',
                ext: '.svg',
                className: 'emoji'
            });
            console.log('✅ Twemoji initialized successfully');
        } else {
            console.log('❌ Twemoji not available');
        }
    } catch (error) {
        console.log('❌ Twemoji error:', error);
    }
}

// Floating Particles Animation
function initParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    
    const particleCount = 50;
    
    function createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random starting position
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (Math.random() * 20 + 10) + 's';
        particle.style.animationDelay = Math.random() * 20 + 's';
        
        // Random size
        const size = Math.random() * 4 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        particlesContainer.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 40000);
    }
    
    // Create initial particles
    for (let i = 0; i < particleCount; i++) {
        setTimeout(createParticle, Math.random() * 2000);
    }
    
    // Continuously create new particles
    setInterval(createParticle, 400);
}

// Navigation Functionality
function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
        // Mobile menu toggle
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
        
        // Close menu when clicking nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 100) {
                navbar.style.background = 'rgba(10, 10, 10, 0.95)';
            } else {
                navbar.style.background = 'rgba(10, 10, 10, 0.9)';
            }
        }
    });
}

// Contact Form Functionality
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);
        
        // Basic validation
        const errors = validateForm(data);
        if (errors.length > 0) {
            showNotification(errors.join('<br>'), 'error');
            return;
        }
        
        // Disable submit button
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        // Send to server
        fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                // Reset form
                contactForm.reset();
                
                // Show success message
                showNotification(result.message || 'Thank you! We\'ll respond within 48 hours.', 'success');
                
                // Track analytics
                trackEvent('form_submit', {
                    form_type: 'contact',
                    company_size: data.revenue,
                    manual_hours: data.operations
                });
            } else {
                showNotification(result.message || 'Sorry, there was an error. Please try again.', 'error');
            }
        })
        .catch(error => {
            console.error('Form submission error:', error);
            showNotification('Sorry, there was an error sending your message. Please try again.', 'error');
        })
        .finally(() => {
            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    });
}

// Form Validation
function validateForm(data) {
    const errors = [];
    
    if (!data.name || data.name.trim().length < 2) {
        errors.push('Please enter your full name (minimum 2 characters)');
    }
    
    // Enhanced email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!data.email || !emailRegex.test(data.email)) {
        errors.push('Please enter a valid business email address');
    }
    
    if (!data.company || data.company.trim().length < 2) {
        errors.push('Please enter your company name');
    }
    
    if (!data.revenue) {
        errors.push('Please select your company size/stage');
    }
    
    if (!data.operations) {
        errors.push('Please select weekly hours on manual work');
    }
    
    return errors;
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            ${message}
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(34, 197, 94, 0.9)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        border: 1px solid ${type === 'error' ? '#ef4444' : '#22c55e'};
        backdrop-filter: blur(10px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
        font-size: 0.9rem;
        line-height: 1.4;
    `;
    
    // Add close functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        margin-left: 1rem;
        padding: 0;
    `;
    
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Append to body
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Smooth Scrolling
function initSmoothScrolling() {
    // Smooth scroll for navigation links
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Scroll to Contact Function
function scrollToContact() {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
        const offsetTop = contactSection.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// Schedule Call Function
function scheduleCall() {
    window.open('https://calendly.com/tony-opusautomations/30min', '_blank');
}

// Animation on Scroll
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll(
        '.service-card, .case-content, .about-feature, .stat-card'
    );
    
    animateElements.forEach(el => {
        el.classList.add('animate-element');
        observer.observe(el);
    });
}

// Analytics and Performance Tracking
function initAnalytics() {
    // Track page load time
    window.addEventListener('load', function() {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log('Page load time:', loadTime + 'ms');
    });
    
    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', function() {
        const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        if (scrollPercent > maxScroll) {
            maxScroll = scrollPercent;
        }
    });
    
    // Track form interactions
    const formInputs = document.querySelectorAll('#contactForm input, #contactForm select, #contactForm textarea');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            trackEvent('form_field_focus', { field: this.name });
        });
    });
    
    // Track CTA clicks
    document.querySelectorAll('.btn-primary').forEach(btn => {
        btn.addEventListener('click', function() {
            trackEvent('cta_click', {
                button_text: this.textContent.trim(),
                page: window.location.pathname
            });
        });
    });
}

// Track Events Function
function trackEvent(eventName, properties = {}) {
    // Send to server analytics endpoint
    fetch('/api/analytics', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            event: eventName,
            data: properties,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
        })
    }).catch(err => console.log('Analytics error:', err));
    
    // Google Analytics 4 event tracking (if available)
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, properties);
    }
}

// Initialize analytics
initAnalytics();

// Utility Functions
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

// Optimize scroll performance
const optimizedScrollHandler = debounce(function() {
    // Handle scroll events here if needed
}, 16); // ~60fps

window.addEventListener('scroll', optimizedScrollHandler);

// Error Handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    
    // Track error
    trackEvent('javascript_error', {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno
    });
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    showNotification('An unexpected error occurred. Please try again.', 'error');
    e.preventDefault();
});

// Assessment Modal Functions
function openAssessmentModal() {
    document.getElementById('assessmentModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeAssessmentModal() {
    document.getElementById('assessmentModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('assessmentModal');
    if (event.target === modal) {
        closeAssessmentModal();
    }
});

// Assessment Form Functionality
function initAssessmentForm() {
    const assessmentForm = document.getElementById('assessmentForm');
    if (!assessmentForm) return;
    
    assessmentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(assessmentForm);
        const data = Object.fromEntries(formData);
        
        // Calculate assessment results
        const results = calculateAssessment(data);
        
        // Show results
        showAssessmentResults(results);
        
        // Send to server
        submitAssessment(data, results);
    });
}

function calculateAssessment(data) {
    const hoursMap = {
        '5-10': 7.5,
        '10-20': 15,
        '20-40': 30,
        '40+': 50
    };
    
    const revenueMap = {
        '100k-500k': 300000,
        '500k-2m': 1250000,
        '2m-10m': 6000000,
        '10m-50m': 30000000,
        '50m+': 75000000
    };
    
    const hours = hoursMap[data.hours] || 0;
    const revenue = revenueMap[data.revenue] || 0;
    
    // Calculate potential savings (hours * $50/hour * 52 weeks * efficiency gain)
    const hourlyRate = Math.min(50 + (revenue / 1000000) * 10, 150);
    const efficiencyGain = 0.8; // 80% of manual work can be automated
    const annualSavings = hours * hourlyRate * 52 * efficiencyGain;
    
    // Calculate ROI timeline based on investment needed
    const estimatedInvestment = Math.max(15000, Math.min(annualSavings * 0.3, 150000));
    const roiMonths = Math.ceil((estimatedInvestment / annualSavings) * 12);
    
    // Determine complexity
    let complexity = 'Medium';
    if (hours < 15 && revenue < 2000000) complexity = 'Low';
    if (hours > 30 || revenue > 10000000) complexity = 'High';
    
    return {
        savings: Math.round(annualSavings),
        roiMonths: Math.min(roiMonths, 24),
        complexity,
        investment: Math.round(estimatedInvestment)
    };
}

function showAssessmentResults(results) {
    document.getElementById('savingsAmount').textContent = `${results.savings.toLocaleString()}`;
    document.getElementById('roiTimeline').textContent = `${results.roiMonths} months`;
    document.getElementById('complexity').textContent = results.complexity;
    document.getElementById('assessmentResult').style.display = 'block';
}

function submitAssessment(data, results) {
    const assessmentData = {
        ...data,
        results,
        timestamp: new Date().toISOString(),
        type: 'assessment'
    };
    
    fetch('/api/contact', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(assessmentData)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            showNotification('Assessment complete! Check your email for detailed results.', 'success');
        }
    })
    .catch(error => {
        console.error('Assessment submission error:', error);
    });
}
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .animate-element {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease;
    }
    
    .animate-element.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    
    /* Mobile menu styles */
    @media (max-width: 768px) {
        .nav-menu {
            position: fixed;
            top: 70px;
            right: -100%;
            width: 100%;
            height: calc(100vh - 70px);
            background: rgba(10, 10, 10, 0.95);
            backdrop-filter: blur(10px);
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            padding-top: 3rem;
            transition: right 0.3s ease;
            border-left: 1px solid rgba(139, 92, 246, 0.2);
        }
        
        .nav-menu.active {
            right: 0;
        }
        
        .nav-link {
            font-size: 1.2rem;
            margin: 1rem 0;
        }
        
        .nav-toggle.active .bar:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        
        .nav-toggle.active .bar:nth-child(2) {
            opacity: 0;
        }
        
        .nav-toggle.active .bar:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
        }
    }
`;
document.head.appendChild(style);
