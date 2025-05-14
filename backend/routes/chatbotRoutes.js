const express = require('express');
const { handleChat } = require('../controllers/chatbotController');
const router = express.Router();

// Define the chatbot route
router.post('/chat', handleChat);

module.exports = router;