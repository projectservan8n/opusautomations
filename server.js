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
const PORT = process.env.PORT || 3000;

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

// Routes

// Health check
app.get('/health', (req, res) => {
    const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development',
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
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
            headers: req.headers
        };
        
        // Send to n8n webhook
        const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'https://your-n8n-instance.com/webhook/opus-contact-form';
        
        console.log('📤 Sending to n8n webhook:', { name, email, company });
        
        const response = await axios.post(n8nWebhookUrl, webhookData, {
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
        
    } catch (error) {
        console.error('❌ Contact form error:', error.message);
        
        // Fallback - log locally if n8n is down
        console.log('📝 Fallback logging:', req.body);
        
        res.status(200).json({ 
            success: true, 
            message: 'Thank you! We\'ll respond within 48 hours.',
            note: 'Request logged for manual follow-up'
        });
    }
});

// Analytics endpoint (for future use)
app.post('/api/analytics', (req, res) => {
    try {
        const { event, data } = req.body;
        
        // Log analytics event
        console.log('Analytics event:', event, data);
        
        // Future: forward to n8n analytics workflow
        
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
            const response = await axios.post(process.env.N8N_MATERIAL_WEBHOOK_URL, orderData);
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

// Serve products/workflows page
app.get('/workflows/', (req, res) => {
    res.sendFile(path.join(__dirname, 'workflows', 'index.html'));
});

// Serve material management case study (future expansion)
app.get('/workflows/material-management/', (req, res) => {
    // For now, redirect to products page with anchor
    res.redirect('/workflows/#products');
});

app.get('/workflows/material-management/demo', (req, res) => {
    // Future: serve actual material management demo
    res.json({ 
        message: 'Material Management Demo coming soon',
        contact: 'tony@opusautomations.com'
    });
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
    res.json({
        name: 'Opus Automations API',
        version: '1.0.0',
        endpoints: {
            'POST /api/contact': 'Submit contact form (proxied to n8n)',
            'POST /api/analytics': 'Track analytics events',
            'POST /api/webhook/material-order': 'Material order webhook',
            'GET /health': 'Health check'
        },
        n8n_integration: !!process.env.N8N_WEBHOOK_URL,
        documentation: 'Contact tony@opusautomations.com for API access'
    });
});

// 404 handler
app.use((req, res) => {
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
    console.log('✅ Server startup complete');
});

// Contact form submission
app.post('/api/contact', contactLimiter, async (req, res) => {
    try {
        const { name, email, company, revenue, operations, challenge } = req.body;
        
        // Validation
        if (!name || !email || !company || !revenue || !operations) {
            return res.status(400).json({ 
                success: false, 
                message: 'All required fields must be filled' 
            });
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid email address' 
            });
        }
        
        // Log submission regardless of email configuration
        console.log('📝 Contact form submission:', {
            name, email, company, revenue, operations,
            timestamp: new Date().toISOString(),
            ip: req.ip
        });
        
        // Only send emails if transporter is configured
        if (transporter) {
            // Prepare email content
            const emailContent = `
                <h2>New Contact Form Submission - Opus Automations</h2>
                <div style="font-family: Arial, sans-serif; max-width: 600px;">
                    <h3>Contact Information</h3>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Company:</strong> ${company}</p>
                    
                    <h3>Business Information</h3>
                    <p><strong>Annual Revenue:</strong> ${revenue}</p>
                    <p><strong>Monthly Operations Spend:</strong> ${operations}</p>
                    
                    <h3>Challenge Description</h3>
                    <p>${challenge || 'Not provided'}</p>
                    
                    <hr>
                    <p><em>Submitted on: ${new Date().toLocaleString()}</em></p>
                    <p><em>IP Address: ${req.ip}</em></p>
                </div>
            `;
            
            // Auto-response email content
            const autoResponseContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #8b5cf6;">Thank you for your interest in Opus Automations!</h2>
                    
                    <p>Hi ${name},</p>
                    
                    <p>Thank you for reaching out! We've received your inquiry about automation solutions for ${company}.</p>
                    
                    <h3 style="color: #8b5cf6;">What happens next?</h3>
                    <ul>
                        <li><strong>Within 24 hours:</strong> We'll review your requirements and prepare a preliminary assessment</li>
                        <li><strong>Within 48 hours:</strong> Tony will personally reach out to schedule your free consultation</li>
                        <li><strong>Discovery Call:</strong> We'll dive deep into your workflows and identify automation opportunities</li>
                        <li><strong>Custom Proposal:</strong> You'll receive a tailored automation plan with ROI projections</li>
                    </ul>
                    
                    <div style="background: #f8fafc; padding: 20px; border-left: 4px solid #8b5cf6; margin: 20px 0;">
                        <h4 style="margin: 0 0 10px 0; color: #8b5cf6;">Your Submission Summary:</h4>
                        <p><strong>Company:</strong> ${company}</p>
                        <p><strong>Revenue Range:</strong> ${revenue}</p>
                        <p><strong>Operations Spend:</strong> ${operations}</p>
                    </div>
                    
                    <p>Based on your profile, we estimate you could save <strong>$100K+ annually</strong> with our automation solutions.</p>
                    
                    <p>In the meantime, feel free to explore our <a href="https://opusautomations.com/workflows/material-management/" style="color: #8b5cf6;">material management case study</a> to see how we've helped similar businesses.</p>
                    
                    <p>Best regards,<br>
                    <strong>Tony</strong><br>
                    Opus Automations<br>
                    <a href="mailto:tony@opusautomations.com" style="color: #8b5cf6;">tony@opusautomations.com</a></p>
                    
                    <hr style="margin: 30px 0;">
                    <p style="font-size: 12px; color: #666;">
                        This is an automated response. Please don't reply to this email. 
                        If you have urgent questions, contact us directly at tony@opusautomations.com
                    </p>
                </div>
            `;
            
            try {
                // Send notification email to admin
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: 'tony@opusautomations.com',
                    subject: `New Lead: ${company} (${revenue} ARR) - Opus Automations`,
                    html: emailContent
                });
                
                // Send auto-response to user
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: email,
                    subject: 'Your Automation Consultation Request - Opus Automations',
                    html: autoResponseContent
                });
                
                console.log('📧 Emails sent successfully');
            } catch (emailError) {
                console.error('📧 Email sending failed:', emailError.message);
                // Continue anyway - form submission is still valid
            }
        } else {
            console.log('📧 Email not configured - submission logged only');
        }
        
        res.status(200).json({ 
            success: true, 
            message: 'Thank you! We\'ll respond within 48 hours.' 
        });
        
    } catch (error) {
        console.error('❌ Contact form error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Sorry, there was an error sending your message. Please try again.' 
        });
    }
});

// Analytics endpoint (for future use)
app.post('/api/analytics', (req, res) => {
    try {
        const { event, data } = req.body;
        
        // Log analytics event
        console.log('Analytics event:', event, data);
        
        // Here you could send to Google Analytics, Mixpanel, etc.
        
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ success: false });
    }
});

// Webhook endpoint for n8n integration (for future material management clients)
app.post('/api/webhook/material-order', express.raw({ type: 'application/json' }), (req, res) => {
    try {
        // This would handle material order webhooks from client systems
        const orderData = JSON.parse(req.body);
        
        console.log('Material order received:', orderData);
        
        // Process order logic here
        // - Validate order data
        // - Send to appropriate supplier
        // - Update tracking system
        // - Notify client
        
        res.status(200).json({ 
            success: true, 
            orderId: orderData.orderId || Date.now(),
            status: 'received'
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

// Serve material management case study (future expansion)
app.get('/workflows/material-management/', (req, res) => {
    // For now, redirect to main page with anchor
    res.redirect('/#case-studies');
});

app.get('/workflows/material-management/demo', (req, res) => {
    // Future: serve actual material management demo
    res.json({ 
        message: 'Material Management Demo coming soon',
        contact: 'tony@opusautomations.com'
    });
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
    res.json({
        name: 'Opus Automations API',
        version: '1.0.0',
        endpoints: {
            'POST /api/contact': 'Submit contact form',
            'POST /api/analytics': 'Track analytics events',
            'POST /api/webhook/material-order': 'Material order webhook',
            'GET /health': 'Health check'
        },
        documentation: 'Contact tony@opusautomations.com for API access'
    });
});

// 404 handler
app.use((req, res) => {
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
    console.log(`📧 Email configured: ${!!transporter}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log('✅ Server startup complete');
});
