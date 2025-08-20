// DEBUG: Enable debug mode to see what's happening
const CONFIG = {
    API_BASE_URL: window.location.origin,
    ANALYTICS_ENABLED: true,
    DEBUG_MODE: true,
    CALENDLY_URL: 'https://calendly.com/tony-opusautomations/30min'
};

// Debug logging function
function debugLog(message, data = null) {
    if (CONFIG.DEBUG_MODE) {
        console.log(`🛠 [DEBUG] ${message}`, data || '');
    }
}

// Global variables for smooth scrolling
let lenis;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    debugLog('DOM Content Loaded - Initializing Opus Automations');
    
    // Initialize visual effects
    initVisualEffects();
    
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
    
    // Initialize analytics
    initAnalytics();
    
    debugLog('All components initialized successfully');
});

// VISUAL EFFECTS INITIALIZATION
function initVisualEffects() {
    initMagneticCTAButtons();
    initGlowCards();
    debugLog('✅ Visual effects initialized');
}

// MAGNETIC EFFECT FOR CTA BUTTONS ONLY - FIXED SMOOTH ANIMATION
function initMagneticCTAButtons() {
    // Apply magnetic effect to ALL CTA buttons including submit buttons
    const ctaButtons = document.querySelectorAll(
        'a.btn[href], button.btn, .btn[onclick], button[type="submit"]'
    );
    
    ctaButtons.forEach(button => {
        let isHovering = false;
        
        // Set initial transition for smooth return animation
        button.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        
        button.addEventListener('mouseenter', () => {
            isHovering = true;
            // Remove transition during mouse move for immediate response
            button.style.transition = 'none';
        });
        
        button.addEventListener('mouseleave', () => {
            isHovering = false;
            // Restore smooth transition for return animation
            button.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            button.style.transform = 'translate(0, 0) scale(1)';
        });
        
        button.addEventListener('mousemove', e => {
            if (!isHovering) return;
            
            const rect = button.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width/2) * 0.15;
            const y = (e.clientY - rect.top - rect.height/2) * 0.15;
            
            button.style.transform = `translate(${x}px, ${y}px) scale(1.02)`;
        });
    });
    
    debugLog('✅ Magnetic CTA button effects initialized for', ctaButtons.length, 'buttons');
}

// GLOW EFFECT FOR CARDS (NO ROTATING TAGS)
function initGlowCards() {
    const glowElements = document.querySelectorAll('.service-card, .product-card, .featured-product, .stat-card, .case-content, .card, .experience-item, .project-item');
    
    glowElements.forEach(card => {
        card.addEventListener('mouseenter', () => {
            // Add glow class
            card.classList.add('card-glow');
            
            // Rotate service/product icons only (not tags)
            const emojis = card.querySelectorAll('.service-icon, .product-icon');
            emojis.forEach(emoji => {
                emoji.style.transform = 'rotate(360deg)';
            });
        });
        
        card.addEventListener('mouseleave', () => {
            // Remove glow class
            card.classList.remove('card-glow');
            
            // Reset emoji rotation
            const emojis = card.querySelectorAll('.service-icon, .product-icon');
            emojis.forEach(emoji => {
                emoji.style.transform = 'rotate(0deg)';
            });
        });
    });
    
    debugLog('✅ Glow card effects with rotating emojis initialized');
}

// FIXED Mobile Navigation Functionality - Based on Working Portfolio Version
function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const body = document.body;
    
    if (!navToggle || !navMenu) {
        debugLog('Navigation elements not found');
        return;
    }
    
    debugLog('Navigation elements found, initializing navigation...');
    
    // Store current scroll position when menu opens
    let scrollPositionBeforeMenu = 0;
    
    // Helper functions for menu state
    function openMenu() {
        scrollPositionBeforeMenu = window.scrollY;
        navMenu.classList.add('active');
        navToggle.classList.add('active');
        body.classList.add('menu-open');
        
        // Prevent body scroll but maintain position
        body.style.overflow = 'hidden';
        body.style.position = 'fixed';
        body.style.width = '100%';
        body.style.top = `-${scrollPositionBeforeMenu}px`;
        
        debugLog('Mobile menu opened at scroll position:', scrollPositionBeforeMenu);
    }
    
    function closeMenu() {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
        body.classList.remove('menu-open');
        
        // Restore body scroll and position
        body.style.overflow = '';
        body.style.position = '';
        body.style.width = '';
        body.style.top = '';
        
        // Restore scroll position immediately
        if (scrollPositionBeforeMenu > 0) {
            window.scrollTo(0, scrollPositionBeforeMenu);
        }
        
        debugLog('Mobile menu closed, restored scroll position:', scrollPositionBeforeMenu);
    }
    
    // FIXED scroll to section function
    function scrollToSection(sectionId) {
        debugLog('🎯 Attempting to scroll to section:', sectionId);
        
        const targetElement = document.getElementById(sectionId);
        if (!targetElement) {
            debugLog('❌ Target element not found:', sectionId);
            return;
        }
        
        // Calculate scroll position differently for mobile vs desktop
        const isMobile = window.innerWidth <= 768;
        const navbarHeight = isMobile ? 70 : 80;
        
        if (isMobile) {
            // For mobile: close menu first, then scroll with delay
            closeMenu();
            
            // Wait for menu close animation to complete
            setTimeout(() => {
                smoothScrollTo(targetElement, navbarHeight);
                debugLog('✅ Mobile scroll executed');
            }, 150);
        } else {
            // Desktop: immediate scroll
            smoothScrollTo(targetElement, navbarHeight);
            debugLog('✅ Desktop scroll executed');
        }
    }
    
    // Mobile menu toggle
    navToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const isActive = navMenu.classList.contains('active');
        
        if (isActive) {
            closeMenu();
        } else {
            openMenu();
        }
        
        return false;
    });
    
    // BULLETPROOF navigation link handling
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const href = this.getAttribute('href');
            debugLog('🔗 Nav link clicked:', {
                href: href,
                text: this.textContent.trim(),
                isMobile: window.innerWidth <= 768,
                scrollPosition: window.scrollY
            });
            
            // Extract section ID from href
            let sectionId = '';
            if (href && href.startsWith('#')) {
                sectionId = href.substring(1); // Remove the #
            }
            
            debugLog('🎯 Extracted section ID:', sectionId);
            
            if (sectionId) {
                scrollToSection(sectionId);
            }
            
            return false;
        }, true); // Use capture phase to run before other handlers
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        const isClickInsideNav = navMenu.contains(e.target) || navToggle.contains(e.target);
        
        if (!isClickInsideNav && navMenu.classList.contains('active')) {
            closeMenu();
        }
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            closeMenu();
        }
    });
    
    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
                closeMenu();
            }
        }, 100);
    });
    
    // Navbar scroll effect
    function updateNavbarBackground(scrollY) {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (scrollY > 100) {
                navbar.style.background = 'rgba(10, 10, 10, 0.95)';
                navbar.style.backdropFilter = 'blur(20px)';
            } else {
                navbar.style.background = 'rgba(10, 10, 10, 0.9)';
                navbar.style.backdropFilter = 'blur(10px)';
            }
        }
        
        // Update active nav states based on scroll position
        updateActiveNavState(scrollY);
    }
    
    window.addEventListener('scroll', function() {
        updateNavbarBackground(window.scrollY);
    });
    
    debugLog('🚀 Navigation system initialized');
}

// Enhanced smooth scroll function (Working Version from Portfolio)
function smoothScrollTo(targetElement, offset = 80) {
    if (!targetElement) return;
    
    const isMobile = window.innerWidth <= 768;
    const navbarHeight = isMobile ? 70 : 80;
    const elementRect = targetElement.getBoundingClientRect();
    const absoluteElementTop = elementRect.top + window.scrollY;
    const targetScrollPosition = Math.max(0, absoluteElementTop - navbarHeight);
    
    debugLog('🔍 Scroll calculation:', {
        elementTop: absoluteElementTop,
        navbarHeight: navbarHeight,
        targetPosition: targetScrollPosition,
        currentScroll: window.scrollY
    });
    
    // Use Lenis if available, otherwise fallback to native smooth scroll
    if (window.lenis && lenis) {
        lenis.scrollTo(targetScrollPosition, {
            duration: 1.5,
            easing: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
            immediate: false
        });
        debugLog('✅ Using Lenis smooth scroll');
    } else {
        window.scrollTo({
            top: targetScrollPosition,
            behavior: 'smooth'
        });
        debugLog('✅ Using native smooth scroll');
    }
}

// Update active navigation state with purple glow
function updateActiveNavState(scrollY) {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = [
        { id: 'services', element: document.getElementById('services') },
        { id: 'products', element: document.getElementById('products') },
        { id: 'case-studies', element: document.getElementById('case-studies') },
        { id: 'about', element: document.getElementById('about') },
        { id: 'contact', element: document.getElementById('contact') }
    ];
    
    // Remove all active states first
    navLinks.forEach(link => {
        link.classList.remove('nav-active-glow');
    });
    
    // Determine which section is currently in view
    let currentSection = '';
    const viewportHeight = window.innerHeight;
    const scrollPosition = scrollY + viewportHeight / 2; // Middle of viewport
    
    // Check if we're at the very top (hero section)
    if (scrollY < 200) {
        currentSection = 'home';
    } else {
        // Find the section that's currently in the center of the viewport
        for (let i = 0; i < sections.length; i++) {
            const section = sections[i];
            if (section.element) {
                const sectionTop = section.element.offsetTop;
                const sectionBottom = sectionTop + section.element.offsetHeight;
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                    currentSection = section.id;
                    break;
                }
            }
        }
    }
    
    // Apply active glow to the current section's nav link
    if (currentSection) {
        const activeLink = document.querySelector(`.nav-link[href*="${currentSection}"]`);
        if (activeLink) {
            activeLink.classList.add('nav-active-glow');
        }
    }
}

// Initialize Lenis smooth scrolling (Working Version)
function initSmoothScrolling() {
    debugLog('🎬 Initializing smooth scrolling system...');
    
    // Initialize Lenis if available
    function initLenis() {
        if (!window.Lenis) {
            debugLog('Lenis not available, using fallback');
            initFallbackSmoothScroll();
            return;
        }
        
        try {
            // Create Lenis instance with official API
            lenis = new window.Lenis({
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                direction: 'vertical',
                smooth: true,
                mouseMultiplier: 1,
                smoothTouch: false,
                touchMultiplier: 2,
                wheelMultiplier: 1,
                normalizeWheel: true,
                lerp: 0.1,
                infinite: false,
                orientation: 'vertical',
                gestureOrientation: 'vertical'
            });
            
            // Lenis animation loop (required for Lenis to work)
            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);
            
            // Handle window resize
            window.addEventListener('resize', () => {
                lenis.resize();
            });
            
            // Expose functions globally
            window.lenis = lenis;
            window.smoothScrollTo = smoothScrollTo;
            
            debugLog('🚀 Lenis smooth scrolling initialized successfully');
            
        } catch (error) {
            console.error('❌ Error initializing Lenis:', error);
            initFallbackSmoothScroll();
        }
    }
    
    // Enhanced fallback smooth scroll
    function initFallbackSmoothScroll() {
        window.smoothScrollTo = smoothScrollTo;
        debugLog('🚀 Fallback smooth scrolling initialized');
    }
    
    // Initialize everything
    function initialize() {
        // Small delay to ensure Lenis loads from CDN
        setTimeout(() => {
            if (window.Lenis) {
                initLenis();
                debugLog('✅ Using Lenis for smooth scrolling');
            } else {
                initFallbackSmoothScroll();
                debugLog('⚠️ Lenis not loaded, using fallback');
            }
        }, 100);
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
}

// Contact Form Functionality
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) {
        debugLog('Contact form not found');
        return;
    }
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        debugLog('Contact form submitted');
        
        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);
        
        debugLog('Form data collected:', data);
        
        // Basic validation
        const errors = validateForm(data);
        if (errors.length > 0) {
            showNotification(errors.join('<br>'), 'error');
            debugLog('Form validation failed:', errors);
            return;
        }
        
        // Disable submit button
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        debugLog('Sending form data to API...');
        
        // Send to server
        fetch(`${CONFIG.API_BASE_URL}/api/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            debugLog('API response received:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });
            return response.json();
        })
        .then(result => {
            debugLog('API response data:', result);
            
            if (result.success) {
                // Reset form
                contactForm.reset();
                
                // Show success message
                showNotification(result.message || 'Thank you! We\'ll respond within 48 hours.', 'success');
                
                // Track analytics
                trackEvent('form_submit', {
                    form_type: 'contact',
                    company_size: data.revenue,
                    manual_hours: data.operations,
                    lead_score: result.nextSteps?.leadScore || 'unknown',
                    business_stage: result.nextSteps?.businessStage || data.revenue
                });
                
                debugLog('Form submission successful');
            } else {
                showNotification(result.message || 'Sorry, there was an error. Please try again.', 'error');
                debugLog('Form submission failed:', result);
            }
        })
        .catch(error => {
            console.error('Form submission error:', error);
            showNotification('Sorry, there was an error sending your message. Please try again.', 'error');
            debugLog('Form submission error:', error);
        })
        .finally(() => {
            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    });
    
    debugLog('Contact form initialized');
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
    
    debugLog('Form validation completed:', { 
        errors: errors.length,
        details: errors 
    });
    
    return errors;
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    debugLog('Showing notification:', { message, type });
    
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
                debugLog('Element animated in:', entry.target.className);
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll(
        '.service-card, .product-card, .case-content, .about-feature, .stat-card, .featured-product'
    );
    
    animateElements.forEach(el => {
        el.classList.add('animate-element');
        observer.observe(el);
    });
    
    debugLog('Animations initialized for', animateElements.length, 'elements');
}

// Analytics and Performance Tracking
function initAnalytics() {
    if (!CONFIG.ANALYTICS_ENABLED) {
        debugLog('Analytics disabled');
        return;
    }
    
    // Track page load time
    window.addEventListener('load', function() {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        trackEvent('page_load_time', { 
            load_time_ms: loadTime,
            page: window.location.pathname
        });
        debugLog('Page load time tracked:', loadTime + 'ms');
    });
    
    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', function() {
        const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        if (scrollPercent > maxScroll) {
            maxScroll = scrollPercent;
        }
    });
    
    // Track max scroll on page unload
    window.addEventListener('beforeunload', function() {
        if (maxScroll > 0) {
            trackEvent('max_scroll_depth', { 
                scroll_percentage: maxScroll,
                page: window.location.pathname
            });
        }
    });
    
    // Track form interactions
    const formInputs = document.querySelectorAll('#contactForm input, #contactForm select, #contactForm textarea');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            trackEvent('form_field_focus', { 
                field: this.name,
                form_type: 'contact'
            });
        });
    });
    
    // Track CTA clicks
    document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
        btn.addEventListener('click', function() {
            const buttonText = this.textContent.trim();
            const isCalendly = this.href && this.href.includes('calendly');
            const section = this.closest('section')?.id || 'unknown';
            
            trackEvent('cta_click', {
                button_text: buttonText,
                page: window.location.pathname,
                section: section,
                is_calendly: isCalendly,
                button_type: this.classList.contains('btn-primary') ? 'primary' : 'secondary'
            });
        });
    });
    
    // Track product interest
    document.querySelectorAll('.product-card, .featured-product').forEach(card => {
        card.addEventListener('click', function() {
            const productName = this.querySelector('h3')?.textContent || 'Unknown Product';
            trackEvent('product_interest', {
                product_name: productName,
                product_type: this.classList.contains('premium-card') ? 'premium' : 'mini'
            });
        });
    });
    
    debugLog('Analytics initialized');
}

// Track Events Function
function trackEvent(eventName, properties = {}) {
    if (!CONFIG.ANALYTICS_ENABLED) {
        return;
    }
    
    const eventData = {
        event: eventName,
        data: {
            ...properties,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            user_agent: navigator.userAgent,
            referrer: document.referrer || 'direct',
            page_title: document.title
        }
    };
    
    debugLog('Tracking event:', eventData);
    
    // Send to server analytics endpoint
    fetch(`${CONFIG.API_BASE_URL}/api/analytics`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
    }).catch(err => {
        debugLog('Analytics error:', err);
    });
    
    // Google Analytics 4 event tracking (if available)
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, properties);
        debugLog('Sent to Google Analytics:', eventName);
    }
}

// Assessment Modal Functions
function openAssessmentModal() {
    const modal = document.getElementById('assessmentModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        trackEvent('assessment_modal_open', { source: 'button_click' });
        debugLog('Assessment modal opened');
    }
}

function closeAssessmentModal() {
    const modal = document.getElementById('assessmentModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        debugLog('Assessment modal closed');
    }
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
    if (!assessmentForm) {
        debugLog('Assessment form not found');
        return;
    }
    
    assessmentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        debugLog('Assessment form submitted');
        
        const formData = new FormData(assessmentForm);
        const data = Object.fromEntries(formData);
        
        // Calculate assessment results
        const results = calculateAssessment(data);
        
        debugLog('Assessment results calculated:', results);
        
        // Show results
        showAssessmentResults(results);
        
        // Send to server
        submitAssessment(data, results);
    });
    
    debugLog('Assessment form initialized');
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
    
    // Calculate potential savings
    const hourlyRate = Math.min(50 + (revenue / 1000000) * 10, 150);
    const efficiencyGain = 0.8;
    const annualSavings = hours * hourlyRate * 52 * efficiencyGain;
    
    // Calculate ROI timeline
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
    const savingsElement = document.getElementById('savingsAmount');
    const timelineElement = document.getElementById('roiTimeline');
    const complexityElement = document.getElementById('complexity');
    const resultContainer = document.getElementById('assessmentResult');
    
    if (savingsElement) savingsElement.textContent = `${results.savings.toLocaleString()}`;
    if (timelineElement) timelineElement.textContent = `${results.roiMonths} months`;
    if (complexityElement) complexityElement.textContent = results.complexity;
    if (resultContainer) resultContainer.style.display = 'block';
    
    debugLog('Assessment results displayed:', results);
}

function submitAssessment(data, results) {
    const assessmentData = {
        ...data,
        results,
        timestamp: new Date().toISOString(),
        type: 'assessment'
    };
    
    debugLog('Submitting assessment to API:', assessmentData);
    
    fetch(`${CONFIG.API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(assessmentData)
    })
    .then(response => response.json())
    .then(result => {
        debugLog('Assessment submission result:', result);
        
        if (result.success) {
            showNotification('Assessment complete! Check your email for detailed results.', 'success');
            
            trackEvent('assessment_completed', {
                savings_potential: results.savings,
                roi_months: results.roiMonths,
                complexity: results.complexity,
                process: data.process,
                hours: data.hours,
                revenue: data.revenue
            });
        } else {
            showNotification('Assessment saved, but there was an issue sending results. We\'ll follow up manually.', 'warning');
        }
    })
    .catch(error => {
        console.error('Assessment submission error:', error);
        showNotification('Assessment saved locally. We\'ll follow up via email.', 'warning');
        debugLog('Assessment submission error:', error);
    });
}

// Scroll to Contact Function
function scrollToContact() {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
        smoothScrollTo(contactSection, 80);
        debugLog('Scrolled to contact section');
    }
}

// Schedule Call Function
function scheduleCall() {
    window.open(CONFIG.CALENDLY_URL, '_blank');
    trackEvent('calendly_click', {
        source: 'schedule_call_function',
        url: CONFIG.CALENDLY_URL
    });
    debugLog('Opened Calendly link:', CONFIG.CALENDLY_URL);
}

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

// Error Handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    
    trackEvent('javascript_error', {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        stack: e.error?.stack || 'No stack trace'
    });
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    showNotification('An unexpected error occurred. Please try again.', 'error');
    
    trackEvent('unhandled_promise_rejection', {
        reason: e.reason?.toString() || 'Unknown reason',
        stack: e.reason?.stack || 'No stack trace'
    });
    
    e.preventDefault();
});

// Make functions globally available for HTML onclick handlers
window.openAssessmentModal = openAssessmentModal;
window.closeAssessmentModal = closeAssessmentModal;
window.scrollToContact = scrollToContact;
window.scheduleCall = scheduleCall;

debugLog('Script.js fully loaded and configured', CONFIG);
