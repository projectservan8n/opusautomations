// Hardcoded configuration - no environment variables needed
const CONFIG = {
    API_BASE_URL: window.location.origin, // Uses current domain automatically
    ANALYTICS_ENABLED: true,
    DEBUG_MODE: false, // Set to true for development debugging
    CALENDLY_URL: 'https://calendly.com/tony-opusautomations/30min'
};

// Debug logging function
function debugLog(message, data = null) {
    if (CONFIG.DEBUG_MODE) {
        console.log(`🐛 [DEBUG] ${message}`, data || '');
    }
}

// Global variables for smooth scrolling
let lenis;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    debugLog('DOM Content Loaded - Initializing Opus Automations');
    
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
    
    // Initialize analytics
    initAnalytics();
    
    debugLog('All components initialized successfully');
});

// Twemoji removed - using native emojis only

// Enhanced Floating Particles Animation - More Visible
function initParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) {
        debugLog('Particles container not found');
        return;
    }
    
    const particleCount = 80; // Increased count for more visibility
    
    function createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random starting position
        particle.style.left = Math.random() * 100 + '%';
        particle.style.bottom = '-10px'; // Start from bottom
        
        // More visible styling
        const size = Math.random() * 6 + 3; // Larger particles (3-9px)
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // Enhanced visibility
        particle.style.background = `linear-gradient(45deg, 
            rgba(139, 92, 246, ${0.6 + Math.random() * 0.4}), 
            rgba(236, 72, 153, ${0.5 + Math.random() * 0.3})
        )`;
        particle.style.borderRadius = '50%';
        particle.style.position = 'absolute';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '1';
        
        // Add glow effect for better visibility
        particle.style.boxShadow = `0 0 ${size * 2}px rgba(139, 92, 246, 0.3)`;
        
        // Animation properties
        const duration = Math.random() * 15 + 10; // 10-25 seconds
        const horizontalDrift = (Math.random() - 0.5) * 200; // Drift left/right
        
        particle.style.animation = `floatUp ${duration}s linear forwards`;
        particle.style.setProperty('--horizontal-drift', horizontalDrift + 'px');
        
        particlesContainer.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, duration * 1000 + 1000);
    }
    
    // Create initial burst of particles
    for (let i = 0; i < particleCount; i++) {
        setTimeout(createParticle, Math.random() * 3000);
    }
    
    // Continuously create new particles more frequently
    setInterval(createParticle, 200); // More frequent creation
    
    // Add the CSS animation
    addParticlesCSS();
    
    debugLog('Enhanced particles system initialized with', particleCount, 'particles');
}

// Add enhanced particles CSS
function addParticlesCSS() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatUp {
            0% {
                transform: translateY(0) translateX(0) rotate(0deg);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                transform: translateY(-100vh) translateX(var(--horizontal-drift, 0px)) rotate(360deg);
                opacity: 0;
            }
        }
        
        .particles-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            overflow: hidden;
        }
        
        .particle {
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
            will-change: transform, opacity;
        }
        
        /* Pulsing effect for some particles */
        .particle:nth-child(3n) {
            animation-name: floatUp, pulse;
            animation-duration: inherit, 3s;
            animation-timing-function: linear, ease-in-out;
            animation-iteration-count: 1, infinite;
            animation-fill-mode: forwards, none;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
        }
    `;
    document.head.appendChild(style);
}

// Enhanced Navigation Functionality - FIXED MOBILE
function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const body = document.body;
    
    if (navToggle && navMenu) {
        // Mobile menu toggle with better event handling
        navToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            debugLog('Nav toggle clicked');
            
            // Toggle menu state
            const isActive = navMenu.classList.contains('active');
            
            if (isActive) {
                // Close menu
                closeMenu();
                debugLog('Mobile menu closed');
            } else {
                // Open menu
                openMenu();
                debugLog('Mobile menu opened');
            }
        });
        
        // Helper functions for menu state
        function openMenu() {
            navMenu.classList.add('active');
            navToggle.classList.add('active');
            body.classList.add('menu-open');
            body.style.overflow = 'hidden';
            body.style.position = 'fixed';
            body.style.width = '100%';
        }
        
        function closeMenu() {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            body.classList.remove('menu-open');
            body.style.overflow = '';
            body.style.position = '';
            body.style.width = '';
        }
        
        // Close menu when clicking nav links - FIXED
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // Don't prevent default for external links
                if (!this.getAttribute('href').startsWith('#')) {
                    closeMenu();
                    return;
                }
                
                // For anchor links, close menu after a short delay
                setTimeout(() => {
                    closeMenu();
                }, 100);
                
                debugLog('Menu closed via nav link click');
            });
        });
        
        // Close menu when clicking outside - IMPROVED
        document.addEventListener('click', function(e) {
            // Check if click is outside nav elements
            const isClickInsideNav = navMenu.contains(e.target) || navToggle.contains(e.target);
            
            if (!isClickInsideNav && navMenu.classList.contains('active')) {
                closeMenu();
                debugLog('Menu closed via outside click');
            }
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                closeMenu();
                debugLog('Menu closed via escape key');
            }
        });
        
        // Handle window resize - IMPROVED
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
                    closeMenu();
                    debugLog('Menu closed due to window resize');
                }
            }, 100);
        });
        
        // Fix for touch devices
        navToggle.addEventListener('touchstart', function(e) {
            e.stopPropagation();
        }, { passive: true });
    }
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 100) {
                navbar.style.background = 'rgba(10, 10, 10, 0.95)';
                navbar.style.backdropFilter = 'blur(20px)';
            } else {
                navbar.style.background = 'rgba(10, 10, 10, 0.9)';
                navbar.style.backdropFilter = 'blur(10px)';
            }
        }
    });
    
    debugLog('Enhanced navigation system initialized');
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

// Lenis Smooth Scrolling Implementation (Official from darkroomengineering/lenis)
function initSmoothScrolling() {
    // Load Lenis library with correct CDN sources
    function loadLenis() {
        return new Promise((resolve) => {
            // Check if Lenis is already loaded
            if (window.Lenis) {
                debugLog('Lenis already loaded');
                resolve();
                return;
            }
            
            // Official Lenis CDN sources (CSP-approved)
            const lenisUrls = [
                'https://cdn.jsdelivr.net/npm/lenis@1.2.1/dist/lenis.min.js',
                'https://cdnjs.cloudflare.com/ajax/libs/lenis/1.2.1/lenis.min.js',
                'https://unpkg.com/lenis@1.2.1/dist/lenis.min.js'
            ];
            
            let currentUrlIndex = 0;
            
            function tryLoadScript() {
                if (currentUrlIndex >= lenisUrls.length) {
                    debugLog('All Lenis CDNs failed, using enhanced fallback');
                    initFallbackSmoothScroll();
                    resolve();
                    return;
                }
                
                const script = document.createElement('script');
                script.src = lenisUrls[currentUrlIndex];
                script.onload = () => {
                    debugLog('✅ Lenis loaded successfully from:', lenisUrls[currentUrlIndex]);
                    resolve();
                };
                script.onerror = () => {
                    debugLog('❌ Failed to load Lenis from:', lenisUrls[currentUrlIndex]);
                    currentUrlIndex++;
                    tryLoadScript();
                };
                document.head.appendChild(script);
            }
            
            tryLoadScript();
        });
    }
    
    // Initialize Lenis smooth scrolling with correct API
    function initLenis() {
        if (!window.Lenis) {
            debugLog('Lenis not available, using enhanced fallback');
            initFallbackSmoothScroll();
            return;
        }
        
        try {
            // Create Lenis instance with official API (darkroomengineering/lenis)
            lenis = new window.Lenis({
                duration: 1.2,           // Duration for programmatic scrolls
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // heraops.com easing
                direction: 'vertical',   // Scroll direction
                smooth: true,           // Enable smooth scrolling
                mouseMultiplier: 1,     // Mouse wheel sensitivity
                smoothTouch: false,     // Disable smooth scrolling for touch (better mobile experience)
                touchMultiplier: 2,     // Touch scroll sensitivity
                wheelMultiplier: 1,     // Wheel scroll sensitivity
                normalizeWheel: true,   // Normalize wheel across browsers
                lerp: 0.1,             // Linear interpolation intensity (0.1 = smooth like heraops)
                infinite: false,        // Disable infinite scroll
                orientation: 'vertical', // Scroll orientation
                gestureOrientation: 'vertical' // Gesture orientation
            });
            
            // Lenis animation loop (required for Lenis to work)
            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);
            
            // Enhanced smooth scroll to element function
            function smoothScrollToElement(targetElement, offset = 80) {
                if (!targetElement) return;
                
                // Calculate target position
                const rect = targetElement.getBoundingClientRect();
                const absoluteTop = rect.top + window.scrollY;
                const targetPosition = absoluteTop - offset;
                
                // Use Lenis scrollTo method
                lenis.scrollTo(targetPosition, {
                    duration: 1.5,
                    easing: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
                    immediate: false
                });
            }
            
            // Set up navigation links - ENHANCED for merged site
            const navLinks = document.querySelectorAll('.nav-link[href^="#"], [data-scroll-to]');
            navLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href') || this.getAttribute('data-scroll-to');
                    const targetElement = document.querySelector(targetId);
                    
                    if (targetElement) {
                        smoothScrollToElement(targetElement, 80);
                        debugLog('🎯 Lenis smooth scrolling to:', targetId);
                    }
                });
            });
            
            // Add smooth scrolling to elements with data-scroll-to attribute
            document.querySelectorAll('[data-scroll-to]').forEach(element => {
                element.addEventListener('click', function() {
                    const targetId = this.getAttribute('data-scroll-to');
                    const targetElement = document.querySelector(targetId);
                    
                    if (targetElement) {
                        smoothScrollToElement(targetElement, 80);
                        debugLog('🎯 Lenis smooth scrolling to:', targetId);
                    }
                });
            });
            
            // Update navbar background on scroll (Lenis event)
            lenis.on('scroll', (e) => {
                updateNavbarBackground(e.scroll);
            });
            
            // Initialize nav click effects
            addNavClickEffects();
            
            // Handle window resize
            window.addEventListener('resize', () => {
                lenis.resize();
            });
            
            // Expose functions globally
            window.smoothScrollToElement = smoothScrollToElement;
            window.lenis = lenis;
            window.getCurrentScrollY = () => lenis.scroll || 0;
            
            debugLog('🚀 Lenis smooth scrolling initialized successfully (heraops.com style)');
            
        } catch (error) {
            console.error('❌ Error initializing Lenis:', error);
            initFallbackSmoothScroll();
        }
    }
    
    // Enhanced fallback smooth scroll (heraops.com inspired)
    function initFallbackSmoothScroll() {
        let isScrolling = false;
        let currentScrollY = window.scrollY;
        let targetScrollY = window.scrollY;
        let velocity = 0;
        let rafId = null;
        
        // Smooth scrolling configuration (heraops.com style)
        const config = {
            lerp: 0.1,           // Linear interpolation (same as heraops.com)
            friction: 0.9,       // Velocity friction
            maxVelocity: 30,     // Maximum scroll velocity
            wheelMultiplier: 1.2, // Wheel sensitivity
            touchMultiplier: 2   // Touch sensitivity
        };
        
        // Smooth animation loop
        function animate() {
            // Apply velocity to target
            if (Math.abs(velocity) > 0.1) {
                targetScrollY += velocity;
                velocity *= config.friction;
                
                // Clamp to bounds
                const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
                targetScrollY = Math.max(0, Math.min(targetScrollY, maxScroll));
            }
            
            // Smooth interpolation towards target
            const diff = targetScrollY - currentScrollY;
            
            if (Math.abs(diff) > 0.1) {
                currentScrollY += diff * config.lerp;
                window.scrollTo(0, currentScrollY);
                
                updateNavbarBackground(currentScrollY);
                
                rafId = requestAnimationFrame(animate);
                isScrolling = true;
            } else {
                currentScrollY = targetScrollY;
                isScrolling = false;
                rafId = null;
            }
        }
        
        // Enhanced wheel handling (heraops.com style)
        function onWheel(e) {
            e.preventDefault();
            
            // Normalize wheel delta
            let delta = 0;
            if (e.deltaY) {
                delta = e.deltaY;
            } else if (e.wheelDelta) {
                delta = -e.wheelDelta;
            }
            
            // Apply wheel delta to velocity
            velocity += delta * config.wheelMultiplier * 0.4;
            velocity = Math.max(-config.maxVelocity, Math.min(config.maxVelocity, velocity));
            
            // Start animation if not already running
            if (!isScrolling && rafId === null) {
                animate();
            }
        }
        
        // Touch handling for mobile
        let touchStartY = 0;
        let lastTouchY = 0;
        let touchVelocity = 0;
        
        function onTouchStart(e) {
            touchStartY = e.touches[0].clientY;
            lastTouchY = touchStartY;
            touchVelocity = 0;
        }
        
        function onTouchMove(e) {
            if (e.touches.length > 1) return; // Ignore multi-touch
            
            const touchY = e.touches[0].clientY;
            const deltaY = lastTouchY - touchY;
            
            touchVelocity = deltaY * config.touchMultiplier;
            velocity += touchVelocity * 0.3;
            velocity = Math.max(-config.maxVelocity, Math.min(config.maxVelocity, velocity));
            
            lastTouchY = touchY;
            
            if (!isScrolling && rafId === null) {
                animate();
            }
            
            e.preventDefault();
        }
        
        function onTouchEnd() {
            // Apply final momentum
            velocity *= 0.8;
            if (Math.abs(velocity) > 1 && !isScrolling && rafId === null) {
                animate();
            }
        }
        
        // Smooth scroll to element function
        function smoothScrollToElement(targetElement, offset = 80) {
            if (!targetElement) return;
            
            const targetPosition = targetElement.offsetTop - offset;
            const startPosition = currentScrollY;
            const distance = targetPosition - startPosition;
            const duration = Math.min(Math.abs(distance) * 1.2, 1500);
            const startTime = performance.now();
            
            // Cancel existing animations
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
            
            velocity = 0; // Stop momentum
            isScrolling = true;
            
            function easeInOutCubic(t) {
                return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            }
            
            function scrollAnimation() {
                const elapsed = performance.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = easeInOutCubic(progress);
                
                currentScrollY = startPosition + (distance * easedProgress);
                targetScrollY = currentScrollY;
                
                window.scrollTo(0, currentScrollY);
                updateNavbarBackground(currentScrollY);
                
                if (progress < 1) {
                    requestAnimationFrame(scrollAnimation);
                } else {
                    isScrolling = false;
                }
            }
            
            scrollAnimation();
        }
        
        // Set up navigation links - ENHANCED for merged site
        const navLinks = document.querySelectorAll('.nav-link[href^="#"], [data-scroll-to]');
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href') || this.getAttribute('data-scroll-to');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    smoothScrollToElement(targetElement, 80);
                    debugLog('🎯 Fallback smooth scrolling to:', targetId);
                }
            });
        });
        
        // Add smooth scrolling to elements with data-scroll-to attribute
        document.querySelectorAll('[data-scroll-to]').forEach(element => {
            element.addEventListener('click', function() {
                const targetId = this.getAttribute('data-scroll-to');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    smoothScrollToElement(targetElement, 80);
                    debugLog('🎯 Fallback smooth scrolling to:', targetId);
                }
            });
        });
        
        // Bind events
        window.addEventListener('wheel', onWheel, { passive: false });
        window.addEventListener('touchstart', onTouchStart, { passive: true });
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('touchend', onTouchEnd, { passive: true });
        
        // Sync with regular scroll events (for other scripts)
        window.addEventListener('scroll', () => {
            if (!isScrolling) {
                currentScrollY = window.scrollY;
                targetScrollY = currentScrollY;
                updateNavbarBackground(currentScrollY);
            }
        }, { passive: true });
        
        // Initialize nav click effects
        addNavClickEffects();
        
        // Expose functions
        window.smoothScrollToElement = smoothScrollToElement;
        window.getCurrentScrollY = () => currentScrollY;
        
        debugLog('🚀 Enhanced fallback smooth scrolling initialized (heraops.com inspired)');
    }
    
    // Update navbar background and active states based on scroll position
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
    
    // Update active navigation state with purple glow - ENHANCED for merged site
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
    
    // Add click glow effect to nav links
    function addNavClickEffects() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            // Add click effect
            link.addEventListener('click', function(e) {
                // Remove glow from all links
                navLinks.forEach(l => l.classList.remove('nav-active-glow'));
                
                // Add glow to clicked link
                this.classList.add('nav-active-glow');
                
                // Add temporary click pulse effect
                this.classList.add('nav-click-pulse');
                setTimeout(() => {
                    this.classList.remove('nav-click-pulse');
                }, 300);
            });
            
            // Add hover effects
            link.addEventListener('mouseenter', function() {
                if (!this.classList.contains('nav-active-glow')) {
                    this.classList.add('nav-hover-glow');
                }
            });
            
            link.addEventListener('mouseleave', function() {
                this.classList.remove('nav-hover-glow');
            });
        });
    }
    
    // Add optimized CSS for smooth scrolling and nav effects
    function addSmoothScrollCSS() {
        const style = document.createElement('style');
        style.textContent = `
            /* Lenis CSS classes (official) */
            html.lenis {
                height: auto;
            }
            
            .lenis.lenis-smooth {
                scroll-behavior: auto !important;
            }
            
            .lenis.lenis-smooth [data-lenis-prevent] {
                overscroll-behavior: contain;
            }
            
            .lenis.lenis-stopped {
                overflow: hidden;
            }
            
            .lenis.lenis-scrolling iframe {
                pointer-events: none;
            }
            
            /* Disable all default smooth scrolling */
            html, * {
                scroll-behavior: auto !important;
            }
            
            /* GPU acceleration for smooth elements */
            .service-card, .product-card, .hero-content, .hero-visual,
            .case-content, .about-feature, .stat-card {
                will-change: transform;
                backface-visibility: hidden;
                transform: translate3d(0, 0, 0);
            }
            
            /* Ensure navbar stays fixed above everything */
            .navbar {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                z-index: 9999 !important;
                will-change: backdrop-filter, background-color;
            }
            
            /* Optimize body for smooth scrolling */
            body {
                font-kerning: none;
                text-rendering: optimizeSpeed;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }
            
            /* ===============================
               PURPLE GLOW NAVIGATION EFFECTS 
               =============================== */
            
            /* Active glow state (matches Products page) */
            .nav-link.nav-active-glow {
                color: #8b5cf6 !important;
                background: rgba(139, 92, 246, 0.2) !important;
                box-shadow: 
                    0 0 20px rgba(139, 92, 246, 0.4),
                    0 0 40px rgba(139, 92, 246, 0.2),
                    inset 0 0 10px rgba(139, 92, 246, 0.1) !important;
                border: 1px solid rgba(139, 92, 246, 0.5) !important;
                font-weight: 600 !important;
                transform: translateY(-1px) !important;
                transition: all 0.3s ease !important;
            }
            
            /* Hover glow state */
            .nav-link.nav-hover-glow {
                color: #a855f7 !important;
                background: rgba(139, 92, 246, 0.1) !important;
                box-shadow: 
                    0 0 15px rgba(139, 92, 246, 0.3),
                    0 0 30px rgba(139, 92, 246, 0.1) !important;
                border: 1px solid rgba(139, 92, 246, 0.3) !important;
                transform: translateY(-0.5px) !important;
                transition: all 0.2s ease !important;
            }
            
            /* Click pulse effect */
            .nav-link.nav-click-pulse {
                animation: navClickPulse 0.3s ease !important;
            }
            
            @keyframes navClickPulse {
                0% {
                    transform: translateY(-1px) scale(1);
                    box-shadow: 
                        0 0 20px rgba(139, 92, 246, 0.4),
                        0 0 40px rgba(139, 92, 246, 0.2);
                }
                50% {
                    transform: translateY(-2px) scale(1.02);
                    box-shadow: 
                        0 0 30px rgba(139, 92, 246, 0.6),
                        0 0 60px rgba(139, 92, 246, 0.3);
                }
                100% {
                    transform: translateY(-1px) scale(1);
                    box-shadow: 
                        0 0 20px rgba(139, 92, 246, 0.4),
                        0 0 40px rgba(139, 92, 246, 0.2);
                }
            }
            
            /* Enhanced nav-link base styles */
            .nav-link {
                position: relative;
                transition: all 0.3s ease !important;
                border: 1px solid transparent !important;
                backdrop-filter: blur(10px) !important;
            }
            
            /* Remove default hover/active states to avoid conflicts */
            .nav-link:hover:not(.nav-active-glow):not(.nav-hover-glow) {
                background: rgba(139, 92, 246, 0.05) !important;
                color: #e5e7eb !important;
            }
            
            .nav-link.active:not(.nav-active-glow) {
                background: rgba(139, 92, 246, 0.1) !important;
                color: #8b5cf6 !important;
            }
            
            /* Mobile navigation glow effects */
            @media (max-width: 768px) {
                .nav-link.nav-active-glow {
                    background: rgba(139, 92, 246, 0.25) !important;
                    box-shadow: 
                        0 0 25px rgba(139, 92, 246, 0.5),
                        0 0 50px rgba(139, 92, 246, 0.3),
                        inset 0 0 15px rgba(139, 92, 246, 0.2) !important;
                    border-left: 4px solid #8b5cf6 !important;
                }
                
                .nav-link.nav-hover-glow {
                    background: rgba(139, 92, 246, 0.15) !important;
                    box-shadow: 
                        0 0 20px rgba(139, 92, 246, 0.4),
                        0 0 40px rgba(139, 92, 246, 0.2) !important;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Initialize everything
    async function initialize() {
        debugLog('🎬 Initializing Lenis smooth scrolling system...');
        
        // Add CSS first
        addSmoothScrollCSS();
        
        // Load and initialize Lenis
        try {
            await loadLenis();
            
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                if (window.Lenis) {
                    initLenis();
                } else {
                    initFallbackSmoothScroll();
                }
            }, 100);
            
        } catch (error) {
            console.error('❌ Error loading Lenis:', error);
            initFallbackSmoothScroll();
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
}

// Scroll to Contact Function with Ultra-Smooth Scrolling
function scrollToContact() {
    const contactSection = document.getElementById('contact');
    if (contactSection && window.smoothScrollToElement) {
        window.smoothScrollToElement(contactSection, 80);
        debugLog('Ultra-smooth scrolled to contact section');
    }
}

// Enhanced smooth scroll function for global use (fallback)
function fallbackSmoothScrollToElement(targetElement, offset = 80) {
    if (!targetElement) return;
    
    const targetPosition = targetElement.offsetTop - offset;
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    const duration = Math.min(Math.abs(distance) * 1.2, 1500);
    const startTime = Date.now();
    
    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    function animateScroll() {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easedProgress = easeInOutCubic(progress);
        const currentPosition = startPosition + (distance * easedProgress);
        
        window.scrollTo(0, currentPosition);
        
        if (progress < 1) {
            requestAnimationFrame(animateScroll);
        }
    }
    
    animateScroll();
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
    
    // Observe elements for animation - ENHANCED for merged site
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
    
    // Track CTA clicks - ENHANCED for merged site
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
    const savingsElement = document.getElementById('savingsAmount');
    const timelineElement = document.getElementById('roiTimeline');
    const complexityElement = document.getElementById('complexity');
    const resultContainer = document.getElementById('assessmentResult');
    
    if (savingsElement) savingsElement.textContent = `$${results.savings.toLocaleString()}`;
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

// Add notification animations
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
`;
document.head.appendChild(style);

// Make functions globally available for HTML onclick handlers
window.openAssessmentModal = openAssessmentModal;
window.closeAssessmentModal = closeAssessmentModal;
window.scrollToContact = scrollToContact;
window.scheduleCall = scheduleCall;

debugLog('Script.js fully loaded and configured', CONFIG);
