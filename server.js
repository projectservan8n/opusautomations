const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
require('dotenv').config();

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

// Email configuration
const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'tony@opusautomations.com',
        pass: process.env.EMAIL_PASSWORD || process.env.GMAIL_APP_PASSWORD
    }
});

// Routes

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
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
                    <li><strong>Within 48 hours:</strong> Tony
