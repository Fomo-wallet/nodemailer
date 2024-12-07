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

// Endpoint for the guessing game and email sending
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