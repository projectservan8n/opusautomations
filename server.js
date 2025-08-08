const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const axios = require('axios');

// Hardcoded configuration - no .env file needed
const N8N_WEBHOOK_URL = 'https://primary-production-3ef2.up.railway.app/webhook/contact-form';

// Add startup logging
console.log('🚀 Starting Opus Automations server...');
console.log('📍 Current directory:', __dirname);
console.log('🔧 Node version:', process.version);
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
console.log('🔗 n8n Webhook URL:', N8N_WEBHOOK_URL);

const app = express();
const PORT = process.env.PORT || 8080;

// Security and middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://twemoji.maxcdn.com", "https://cdn.jsdelivr.net", "https://unpkg.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://github.com"],
            imgSrc: ["'self'", "data:", "https:", "https://twemoji.maxcdn.com"],
            connectSrc: ["'self'"]
        }
    }
}));

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Contact form rate limiting (more restrictive)
const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 contact form submissions per hour
    message: 'Too many contact form submissions, please try again later.'
});

// Static files with no caching for development
app.use(express.static(path.join(__dirname), {
    maxAge: 0,
    etag: false,
    lastModified: false,
    setHeaders: (res, path) => {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Surrogate-Control', 'no-store');
    }
}));

// Routes

// Health check
app.get('/health', (req, res) => {
    const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development',
        port: PORT,
        n8n_configured: !!N8N_WEBHOOK_URL,
        site_type: 'merged_single_page'
    };
    
    console.log('Health check requested:', healthData);
    res.status(200).json(healthData);
});

// Contact form submission - proxy to n8n
app.post('/api/contact', contactLimiter, async (req, res) => {
    try {
        const { name, email, company, revenue, operations, challenge } = req.body;
        
        // Basic validation
        if (!name || !email || !company || !revenue || !operations) {
            return res.status(400).json({ 
                success: false, 
                message: 'All required fields must be filled' 
            });
        }
        
        // Email validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid email address' 
            });
        }
        
        // Add metadata
        const webhookData = {
            ...req.body,
            timestamp: new Date().toISOString(),
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            headers: req.headers,
            leadScore: calculateLeadScore(req.body),
            source: 'merged_site'
        };
        
        console.log('📝 Contact form submission:', {
            name, email, company, revenue, operations,
            timestamp: new Date().toISOString(),
            ip: req.ip,
            leadScore: webhookData.leadScore,
            source: 'merged_site'
        });
        
        // Send to n8n webhook - hardcoded URL
        if (N8N_WEBHOOK_URL) {
            try {
                console.log('📤 Sending to n8n webhook...');
                console.log('🔗 Webhook URL:', N8N_WEBHOOK_URL);
                console.log('📦 Webhook Data:', JSON.stringify(webhookData, null, 2));
                
                const response = await axios.post(N8N_WEBHOOK_URL, webhookData, {
                    timeout: 15000,
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': 'Opus-Automations-Merged-Server'
                    }
                });
                
                console.log('✅ n8n response status:', response.status);
                console.log('✅ n8n response headers:', response.headers);
                console.log('✅ n8n response data:', response.data);
                
                // Return n8n response or default success
                res.status(200).json(response.data || { 
                    success: true, 
                    message: 'Thank you! We\'ll respond within 48 hours.' 
                });
                
            } catch (n8nError) {
                console.error('❌ n8n webhook error details:');
                console.error('Error message:', n8nError.message);
                console.error('Response status:', n8nError.response?.status);
                console.error('Response data:', n8nError.response?.data);
                console.error('Request config:', {
                    url: n8nError.config?.url,
                    method: n8nError.config?.method,
                    headers: n8nError.config?.headers
                });
                
                // Fallback - still accept the submission
                res.status(200).json({ 
                    success: true, 
                    message: 'Thank you! We\'ll respond within 48 hours.',
                    note: 'Request logged for manual follow-up'
                });
            }
        } else {
            console.log('📧 n8n not configured - submission logged only');
            
            res.status(200).json({ 
                success: true, 
                message: 'Thank you! We\'ll respond within 48 hours.' 
            });
        }
        
    } catch (error) {
        console.error('❌ Contact form error:', error.message);
        
        res.status(500).json({ 
            success: false, 
            message: 'Sorry, there was an error sending your message. Please try again.' 
        });
    }
});

// Lead scoring function
function calculateLeadScore(data) {
    let score = 0;
    
    // Revenue scoring
    const revenueScores = {
        'startup': 20,      // $100K - $500K
        'small': 40,        // $500K - $2M
        'medium': 60,       // $2M - $10M
        'large': 80,        // $10M - $50M
        'enterprise': 100   // $50M+
    };
    
    // Operations spend scoring
    const operationsScores = {
        '5-15': 25,
        '15-25': 50,
        '25-40': 75,
        '40+': 100
    };
    
    score += revenueScores[data.revenue] || 0;
    score += operationsScores[data.operations] || 0;
    
    // Company name bonus (established companies)
    if (data.company && data.company.length > 10) {
        score += 10;
    }
    
    // Challenge description bonus
    if (data.challenge && data.challenge.length > 50) {
        score += 15;
    }
    
    // Assessment data bonus (if it's an assessment submission)
    if (data.type === 'assessment') {
        score += 20; // Assessment submissions are higher intent
    }
    
    return Math.min(score, 100);
}

// Analytics endpoint
app.post('/api/analytics', (req, res) => {
    try {
        const { event, data } = req.body;
        
        // Log analytics event with enhanced data for merged site
        console.log('📊 Analytics event:', event, {
            ...data,
            site_type: 'merged_single_page',
            timestamp: new Date().toISOString()
        });
        
        // Enhanced analytics for product interactions
        if (event === 'product_interest') {
            console.log('🛍️ Product Interest:', {
                product: data.product_name,
                type: data.product_type,
                timestamp: new Date().toISOString(),
                user_agent: data.user_agent
            });
        }
        
        // Track section engagement
        if (event === 'cta_click') {
            console.log('🎯 CTA Click:', {
                button: data.button_text,
                section: data.section,
                is_calendly: data.is_calendly,
                timestamp: new Date().toISOString()
            });
        }
        
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ success: false });
    }
});

// Webhook endpoint for material management (future client systems)
app.post('/api/webhook/material-order', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const orderData = JSON.parse(req.body);
        
        console.log('📦 Material order received:', orderData);
        
        // Note: No material webhook configured - just log
        
        // Fallback response
        res.status(200).json({ 
            success: true, 
            orderId: orderData.orderId || Date.now(),
            status: 'received',
            note: 'Order logged for processing'
        });
        
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(400).json({ success: false, error: 'Invalid webhook data' });
    }
});

// Main route - serve the merged single page
app.get('/', (req, res) => {
    console.log('📄 Serving main page (merged site)');
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle old workflows routes - redirect to main page with anchor
app.get('/workflows', (req, res) => {
    console.log('🔄 Redirecting /workflows to /#products');
    res.redirect('/#products');
});

app.get('/workflows/', (req, res) => {
    console.log('🔄 Redirecting /workflows/ to /#products');
    res.redirect('/#products');
});

// Serve individual sections from main page with anchors
app.get('/services', (req, res) => {
    console.log('🔄 Redirecting /services to /#services');
    res.redirect('/#services');
});

app.get('/services/', (req, res) => {
    console.log('🔄 Redirecting /services/ to /#services');
    res.redirect('/#services');
});

app.get('/products', (req, res) => {
    console.log('🔄 Redirecting /products to /#products');
    res.redirect('/#products');
});

app.get('/products/', (req, res) => {
    console.log('🔄 Redirecting /products/ to /#products');
    res.redirect('/#products');
});

app.get('/case-studies', (req, res) => {
    console.log('🔄 Redirecting /case-studies to /#case-studies');
    res.redirect('/#case-studies');
});

app.get('/case-studies/', (req, res) => {
    console.log('🔄 Redirecting /case-studies/ to /#case-studies');
    res.redirect('/#case-studies');
});

app.get('/about', (req, res) => {
    console.log('🔄 Redirecting /about to /#about');
    res.redirect('/#about');
});

app.get('/about/', (req, res) => {
    console.log('🔄 Redirecting /about/ to /#about');
    res.redirect('/#about');
});

app.get('/contact', (req, res) => {
    console.log('🔄 Redirecting /contact to /#contact');
    res.redirect('/#contact');
});

app.get('/contact/', (req, res) => {
    console.log('🔄 Redirecting /contact/ to /#contact');
    res.redirect('/#contact');
});

// Serve material management case study (future expansion)
app.get('/workflows/material-management', (req, res) => {
    console.log('🔄 Redirecting /workflows/material-management to /#products');
    res.redirect('/#products');
});

app.get('/workflows/material-management/', (req, res) => {
    console.log('🔄 Redirecting /workflows/material-management/ to /#products');
    res.redirect('/#products');
});

app.get('/workflows/material-management/demo', (req, res) => {
    console.log('📋 Material management demo requested');
    res.json({ 
        message: 'Material Management Demo coming soon',
        contact: 'tony@opusautomations.com',
        status: 'development',
        redirect_to: '/#products'
    });
});

// Product-specific routes (for future individual product pages)
app.get('/products/focusflow', (req, res) => {
    console.log('🔄 Redirecting FocusFlow to /#products');
    res.redirect('/#products');
});

app.get('/products/supplychain', (req, res) => {
    console.log('🔄 Redirecting SupplyChain to /#products');
    res.redirect('/#products');
});

app.get('/products/pulsekpi', (req, res) => {
    console.log('🔄 Redirecting PulseKPI to /#products');
    res.redirect('/#products');
});

app.get('/products/autocaption', (req, res) => {
    console.log('🔄 Redirecting AutoCaption to /#products');
    res.redirect('/#products');
});

app.get('/products/copyforge', (req, res) => {
    console.log('🔄 Redirecting CopyForge to /#products');
    res.redirect('/#products');
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
    res.json({
        name: 'Opus Automations API',
        version: '1.0.0',
        port: PORT,
        site_type: 'merged_single_page',
        endpoints: {
            'POST /api/contact': 'Submit contact form (proxied to n8n)',
            'POST /api/analytics': 'Track analytics events',
            'POST /api/webhook/material-order': 'Material order webhook',
            'GET /health': 'Health check',
            'GET /': 'Main homepage (merged site)',
            'GET /products': 'Redirect to /#products',
            'GET /services': 'Redirect to /#services',
            'GET /about': 'Redirect to /#about',
            'GET /contact': 'Redirect to /#contact'
        },
        redirects: {
            '/workflows': '/#products',
            '/products': '/#products',
            '/services': '/#services',
            '/case-studies': '/#case-studies',
            '/about': '/#about',
            '/contact': '/#contact'
        },
        integrations: {
            n8n_webhook: !!N8N_WEBHOOK_URL,
            n8n_analytics: false,
            n8n_material: false
        },
        configuration: {
            n8n_webhook_url: N8N_WEBHOOK_URL
        },
        documentation: 'Contact tony@opusautomations.com for API access'
    });
});

// Sitemap for SEO (merged site)
app.get('/sitemap.xml', (req, res) => {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${req.protocol}://${req.get('host')}/</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>${req.protocol}://${req.get('host')}/#services</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>${req.protocol}://${req.get('host')}/#products</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
    </url>
    <url>
        <loc>${req.protocol}://${req.get('host')}/#case-studies</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>
    <url>
        <loc>${req.protocol}://${req.get('host')}/#about</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>
    <url>
        <loc>${req.protocol}://${req.get('host')}/#contact</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>
</urlset>`;
    
    res.set('Content-Type', 'text/xml');
    res.send(sitemap);
});

// Robots.txt for SEO
app.get('/robots.txt', (req, res) => {
    const robots = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /health

Sitemap: ${req.protocol}://${req.get('host')}/sitemap.xml`;
    
    res.set('Content-Type', 'text/plain');
    res.send(robots);
});

// 404 handler - serve main page for SPA routing
app.use((req, res) => {
    console.log('404 for path:', req.path, '- serving main page');
    res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

// Error handler
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Opus Automations server running on port ${PORT}`);
    console.log(`🔗 n8n webhook: ${N8N_WEBHOOK_URL ? 'Configured' : 'Not configured'}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`🏠 Homepage (merged): http://localhost:${PORT}/`);
    console.log(`📦 Products: http://localhost:${PORT}/#products`);
    console.log(`🔄 All old routes redirect to main page with anchors`);
    console.log('✅ Server startup complete - MERGED SITE READY');
});
