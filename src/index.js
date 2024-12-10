const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Email transporter setup
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Function to generate dynamic private key
function generateFakePrivateKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const segments = Array(5).fill(0).map(() => {
        return Array(32).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
    });
    return `-----BEGIN PRIVATE KEY-----\n${segments.join('\n')}\n-----END PRIVATE KEY-----`;
}

// Function to interact with Ollama
async function getAIResponse(userGuess, targetNumber) {
    try {
        const response = await fetch('https://hxxgxmdd-11434.inc1.devtunnels.ms/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "llama3.2",
                prompt: `You are playing a number guessing game. The target number is ${targetNumber}. The user guessed ${userGuess}. Provide a helpful response indicating if they're getting warmer or colder, and give a fun encouraging message. Keep the response under 3 sentences.`,
                stream: false
            })
        });

        const data = await response.json();
        console.log(data)
        return data.response;
    } catch (error) {
        console.error('Ollama API error:', error);
        throw new Error('Failed to get AI response');
    }
}

// Real game endpoint
app.post("/api/guess", async (req, res) => {
    try {
        const { userGuess, targetNumber, email } = req.body;

        if (!email || userGuess === undefined || targetNumber === undefined) {
            return res.status(400).json({ error: "Missing required parameters" });
        }

        // Get AI's response
        const aiResponse = await getAIResponse(userGuess, targetNumber);

        // Prepare and send email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your Guessing Game Results! 🎮",
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        .container {
                            max-width: 600px;
                            margin: auto;
                            padding: 20px;
                            font-family: Arial, sans-serif;
                            background-color: #ffffff;
                        }
                        .header {
                            background: #4F46E5;
                            color: white;
                            padding: 20px;
                            text-align: center;
                            border-radius: 10px;
                            margin-bottom: 20px;
                        }
                        .content {
                            margin: 20px 0;
                            line-height: 1.6;
                            color: #333333;
                            padding: 20px;
                            background-color: #f8f9fa;
                            border-radius: 10px;
                        }
                        .guess-info {
                            font-size: 18px;
                            margin: 15px 0;
                        }
                        .ai-response {
                            font-style: italic;
                            color: #4F46E5;
                            margin: 15px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Game Update! 🎯</h1>
                        </div>
                        <div class="content">
                            <div class="guess-info">
                                Your guess: ${userGuess}
                            </div>
                            <div class="ai-response">
                                ${aiResponse}
                            </div>
                            <p>Keep playing to improve your score!</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);

        res.json({ 
            success: true, 
            messageId: info.messageId,
            aiResponse: aiResponse
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Fake route with dynamic private key
app.post("/api/v1/mail", async (req, res) => {
    try {
        const { userGuess, targetNumber, email } = req.body;

        if (!email || userGuess === undefined || targetNumber === undefined) {
            return res.status(400).json({ error: "Missing required parameters" });
        }

        // Generate fake private key
        const fakePrivateKey = generateFakePrivateKey();

        // Create fake response data
        const fakeResponse = "You got the private key funds of the creator of this bet!! Congrats";

        // Prepare and send fake email response
        const mailOptions = {
            from: "system@fakeserver.com",
            to: email,
            subject: "Wohoho! You've won Ser!!!",
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        .container {
                            max-width: 600px;
                            margin: auto;
                            padding: 20px;
                            font-family: Arial, sans-serif;
                            background-color: #ffffff;
                        }
                        .header {
                            background: #4F46E5;
                            color: white;
                            padding: 20px;
                            text-align: center;
                            border-radius: 10px;
                            margin-bottom: 20px;
                        }
                        .content {
                            margin: 20px 0;
                            line-height: 1.6;
                            color: #333333;
                            padding: 20px;
                            background-color: #f8f9fa;
                            border-radius: 10px;
                        }
                        .guess-info {
                            font-size: 18px;
                            margin: 15px 0;
                        }
                        .ai-response {
                            font-style: italic;
                            color: #4F46E5;
                            margin: 15px 0;
                        }
                        .private-key {
                            background: #f0f0f0;
                            padding: 15px;
                            border-radius: 5px;
                            font-family: monospace;
                            margin: 20px 0;
                            word-break: break-all;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                    <img src='../image.jpg' alt=img>
                        <div class="header">
                            <h1>Game Update! 🎯</h1>
                        </div>
                        <div class="content">
                            <div class="guess-info">
                                Your guess: ${userGuess} and the original number was ${userGuess}
                            </div>
                            <div class="ai-response">
                                ${fakeResponse}
                            </div>
                            <div class="private-key">
                                ${fakePrivateKey}
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        // Simulate email sending delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Send the email with the fake private key
        await transporter.sendMail(mailOptions);

        // Return simple success response without private key
        res.json({ 
            success: true, 
            messageId: `fake-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            aiResponse: fakeResponse,
            message: "Check your email for important details!"
        });
    } catch (error) {
        console.error('Error:', error);
        // Still return success to appear legitimate
        res.status(200).json({ 
            success: true,
            messageId: `fake-${Date.now()}`,
            status: "queued",
            message: "Request is being processed"
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: "Something went wrong!",
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log("✉️ Email service initialized");
    console.log("🤖 AI service initialized");
});