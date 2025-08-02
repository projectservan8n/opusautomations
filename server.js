const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
require('dotenv').config();

// Add startup logging
console.log('🚀 Starting Opus Automations server...');
console.log('📍 Current directory:', __dirname);
console.log('🔧 Node version:', process.version);
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');

const app = express();
const PORT = process.env.PORT || 8080;

// Security and middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
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

// Static files
app.use(express.static(path.join(__dirname), {
    maxAge: '1d',
    etag: true
}));

// Serve workflows directory
app.use('/workflows', express.static(path.join(__dirname, 'workflows'), {
    maxAge: '1d',
    etag: true
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
        n8n_configured: !!process.env.N8N_WEBHOOK_URL
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
            leadScore: calculateLeadScore(req.body)
        };
        
        console.log('📝 Contact form submission:', {
            name, email, company, revenue, operations,
            timestamp: new Date().toISOString(),
            ip: req.ip,
            leadScore: webhookData.leadScore
        });
        
        // Send to n8n webhook if configured
        if (process.env.N8N_WEBHOOK_URL) {
            try {
                console.log('📤 Sending to n8n webhook...');
                
                const response = await axios.post(process.env.N8N_WEBHOOK_URL, webhookData, {
                    timeout: 10000,
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': 'Opus-Automations-Server'
                    }
                });
                
                console.log('✅ n8n response:', response.status);
                
                // Return n8n response or default success
                res.status(200).json(response.data || { 
                    success: true, 
                    message: 'Thank you! We\'ll respond within 48 hours.' 
                });
                
            } catch (n8nError) {
                console.error('❌ n8n webhook error:', n8nError.message);
                
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
    
    return Math.min(score, 100);
}

// Analytics endpoint
app.post('/api/analytics', (req, res) => {
    try {
        const { event, data } = req.body;
        
        // Log analytics event
        console.log('📊 Analytics event:', event, data);
        
        // Future: forward to n8n analytics workflow
        if (process.env.N8N_ANALYTICS_WEBHOOK_URL) {
            axios.post(process.env.N8N_ANALYTICS_WEBHOOK_URL, req.body)
                .catch(err => console.log('Analytics webhook error:', err.message));
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
        
        // Forward to n8n material management workflow
        if (process.env.N8N_MATERIAL_WEBHOOK_URL) {
            const response = await axios.post(process.env.N8N_MATERIAL_WEBHOOK_URL, orderData, {
                timeout: 10000
            });
            return res.status(200).json(response.data);
        }
        
        // Fallback response
        res.status(200).json({ 
            success: true, 
            orderId: orderData.orderId || Date.now(),
            status: 'received',
            note: 'Will be processed by n8n workflow'
        });
        
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(400).json({ success: false, error: 'Invalid webhook data' });
    }
});

// Serve main routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve workflows page
app.get('/workflows', (req, res) => {
    res.sendFile(path.join(__dirname, 'workflows', 'index.html'));
});

app.get('/workflows/', (req, res) => {
    res.sendFile(path.join(__dirname, 'workflows', 'index.html'));
});

// Serve material management case study (future expansion)
app.get('/workflows/material-management', (req, res) => {
    // For now, redirect to workflows page with anchor
    res.redirect('/workflows#products');
});

app.get('/workflows/material-management/', (req, res) => {
    res.redirect('/workflows#products');
});

app.get('/workflows/material-management/demo', (req, res) => {
    // Future: serve actual material management demo
    res.json({ 
        message: 'Material Management Demo coming soon',
        contact: 'tony@opusautomations.com',
        status: 'development'
    });
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
    res.json({
        name: 'Opus Automations API',
        version: '1.0.0',
        port: PORT,
        endpoints: {
            'POST /api/contact': 'Submit contact form (proxied to n8n)',
            'POST /api/analytics': 'Track analytics events',
            'POST /api/webhook/material-order': 'Material order webhook',
            'GET /health': 'Health check',
            'GET /workflows': 'Products page',
            'GET /': 'Main homepage'
        },
        integrations: {
            n8n_webhook: !!process.env.N8N_WEBHOOK_URL,
            n8n_analytics: !!process.env.N8N_ANALYTICS_WEBHOOK_URL,
            n8n_material: !!process.env.N8N_MATERIAL_WEBHOOK_URL
        },
        documentation: 'Contact tony@opusautomations.com for API access'
    });
});

// 404 handler - serve main page for SPA routing
app.use((req, res) => {
    console.log('404 for path:', req.path);
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
    console.log(`🔗 n8n webhook: ${process.env.N8N_WEBHOOK_URL ? 'Configured' : 'Not configured'}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`🏠 Homepage: http://localhost:${PORT}/`);
    console.log(`📦 Products: http://localhost:${PORT}/workflows`);
    console.log('✅ Server startup complete');
});
