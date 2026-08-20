const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const GroqService = require('../services/GeminiService'); // GeminiService.js now uses Groq internally

/**
 * POST /api/property-agent/chat
 *
 * Body:
 *   {
 *     slug:    string,   // property slug to identify which property
 *     message: string,   // visitor's message
 *     history: Array     // optional - previous turns [{ role: 'user'|'assistant', content: string }]
 *   }
 *
 * Public endpoint — no auth required (visitors are not logged in)
 */
router.post('/chat', async (req, res) => {
  try {
    const { slug, message, history = [] } = req.body;

    // Validate input
    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ error: '"slug" is required' });
    }
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: '"message" is required' });
    }
    if (message.trim().length > 500) {
      return res.status(400).json({ error: 'Message too long (max 500 chars)' });
    }

    // Fetch property from DB using slug
    const property = await Project.findOne({ slug })
      .select(
        'projectName builderName city location projectStatus category propertyType ' +
        'pricing configuration amenities reraApproved reraNumber description cta'
      )
      .lean();

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Sanitize history — Groq uses OpenAI format: { role: 'user'|'assistant', content: string }
    const sanitizedHistory = Array.isArray(history)
      ? history
          .filter(
            (h) =>
              h &&
              (h.role === 'user' || h.role === 'assistant') &&
              typeof h.content === 'string' &&
              h.content.trim().length > 0
          )
          .slice(-10) // keep last 10 turns to stay within token limits
      : [];

    // Call Groq
    const { reply, history: updatedHistory } = await GroqService.chat(
      property,
      message.trim(),
      sanitizedHistory
    );

    res.json({ reply, history: updatedHistory });
  } catch (error) {
    console.error('❌ Property Agent chat error:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      return res.status(500).json({ error: 'AI service configuration error. Please contact support.' });
    }

    res.status(500).json({ error: 'AI agent is temporarily unavailable. Please try again.' });
  }
});

module.exports = router;
