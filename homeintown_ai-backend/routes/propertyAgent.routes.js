const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const GeminiService = require('../services/GeminiService');

/**
 * POST /api/property-agent/chat
 *
 * Body:
 *   {
 *     slug: string,          // property slug to identify which property
 *     message: string,       // visitor's message
 *     history: Array         // optional - previous conversation turns
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

    // Sanitize history — keep only valid turns, max last 10 turns
    const sanitizedHistory = Array.isArray(history)
      ? history
          .filter(
            (h) =>
              h &&
              (h.role === 'user' || h.role === 'model') &&
              Array.isArray(h.parts) &&
              h.parts[0]?.text
          )
          .slice(-10)
      : [];

    // Call Gemini
    const { reply, history: updatedHistory } = await GeminiService.chat(
      property,
      message.trim(),
      sanitizedHistory
    );

    res.json({ reply, history: updatedHistory });
  } catch (error) {
    console.error('❌ Property Agent chat error:', error.message);

    // Gemini API key issues
    if (error.message?.includes('API_KEY') || error.message?.includes('API key')) {
      return res.status(500).json({ error: 'AI service configuration error. Please contact support.' });
    }

    res.status(500).json({ error: 'AI agent is temporarily unavailable. Please try again.' });
  }
});

module.exports = router;
