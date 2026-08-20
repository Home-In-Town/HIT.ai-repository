const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-3.6-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent`;

/**
 * Builds a detailed system prompt for the property AI agent
 * using the full project data so Gemini knows everything about the property.
 */
function buildSystemPrompt(property) {
  const {
    projectName,
    builderName,
    city,
    location,
    projectStatus,
    category,
    propertyType,
    pricing = {},
    configuration = {},
    amenities = [],
    reraApproved,
    reraNumber,
    description,
    cta = {},
  } = property;

  const formatPrice = (val) => {
    if (!val) return null;
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(0)} Lac`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const statusMap = {
    'ready-to-move': 'Ready to Move In',
    'pre-launch': 'Pre-Launch',
    'under-construction': 'Under Construction',
  };

  const lines = [
    `You are an expert real estate sales agent for ${projectName || 'this property'} located in ${location || ''}${city ? ', ' + city : ''}.`,
    `Your job is to answer visitor questions about this property, highlight its strengths, handle objections, and encourage site visits or enquiries.`,
    `Be friendly, helpful, and concise. Respond in the same language the visitor uses (Hindi, English, or Hinglish).`,
    `Never make up information. If you don't know something, say you'll have the team follow up.`,
    ``,
    `=== PROPERTY DETAILS ===`,
    `Name: ${projectName || 'N/A'}`,
    `Builder/Developer: ${builderName || 'N/A'}`,
    `Location: ${location || 'N/A'}${city ? ', ' + city : ''}`,
    `Status: ${statusMap[projectStatus] || projectStatus || 'N/A'}`,
    `Category: ${category || 'N/A'}`,
    `Type: ${propertyType || 'N/A'}`,
  ];

  if (pricing.startingPrice) lines.push(`Starting Price: ${formatPrice(pricing.startingPrice)}`);
  if (pricing.pricePerSqFt) lines.push(`Price per sq.ft: ₹${pricing.pricePerSqFt.toLocaleString('en-IN')}`);
  if (pricing.totalPriceRange) lines.push(`Total Price Range: ${pricing.totalPriceRange}`);
  if (pricing.paymentPlan) lines.push(`Payment Plan: ${pricing.paymentPlan}`);
  if (pricing.bankLoanAvailable !== undefined) lines.push(`Bank Loan Available: ${pricing.bankLoanAvailable ? 'Yes' : 'No'}`);

  if (configuration.bhkOptions?.length) lines.push(`BHK Options: ${configuration.bhkOptions.join(', ')}`);
  if (configuration.carpetAreaRange) lines.push(`Carpet Area: ${configuration.carpetAreaRange}`);
  if (configuration.floorRange) lines.push(`Floors: ${configuration.floorRange}`);
  if (configuration.plotSizeRange) lines.push(`Plot Size: ${configuration.plotSizeRange}`);
  if (configuration.facingOptions?.length) lines.push(`Facing Options: ${configuration.facingOptions.join(', ')}`);
  if (configuration.gatedCommunity !== undefined) lines.push(`Gated Community: ${configuration.gatedCommunity ? 'Yes' : 'No'}`);

  if (amenities.length > 0) lines.push(`Amenities: ${amenities.join(', ')}`);

  if (reraApproved) lines.push(`RERA Approved: Yes${reraNumber ? ' | RERA No: ' + reraNumber : ''}`);
  if (description) lines.push(``, `About: ${description}`);

  lines.push(
    ``,
    `=== CONTACT ===`,
    cta.callNumber ? `Call/Enquiry Number: ${cta.callNumber}` : '',
    cta.whatsappNumber ? `WhatsApp: ${cta.whatsappNumber}` : '',
    ``,
    `=== AGENT INSTRUCTIONS ===`,
    `- When visitors ask about price, give the starting price and mention they can enquire for exact unit pricing.`,
    `- When visitors ask about availability, encourage them to call or WhatsApp for current availability.`,
    `- When visitors show interest, suggest booking a site visit.`,
    `- Keep responses short (2-4 sentences max) unless the visitor asks for details.`,
    `- Do NOT discuss competitor projects.`,
    `- Do NOT invent features or amenities not listed above.`
  );

  return lines.filter(l => l !== undefined).join('\n');
}

class GeminiService {
  /**
   * Send a chat message with full property context.
   * Maintains conversation history for multi-turn chat.
   *
   * @param {object} property  - Full property/project data object
   * @param {string} userMessage - Latest message from the visitor
   * @param {Array}  history   - Previous turns [{ role: 'user'|'model', parts: [{ text }] }]
   * @returns {Promise<{ reply: string, history: Array }>}
   */
  async chat(property, userMessage, history = []) {
    const systemPrompt = buildSystemPrompt(property);

    // Build contents array: system prompt as first user turn (workaround for REST API),
    // then conversation history, then current message
    const contents = [
      // Inject system prompt as a leading user/model pair so it anchors the conversation
      {
        role: 'user',
        parts: [{ text: `[SYSTEM INSTRUCTIONS]\n${systemPrompt}\n[END SYSTEM INSTRUCTIONS]\n\nAcknowledge you understand your role.` }]
      },
      {
        role: 'model',
        parts: [{ text: `Understood! I'm the AI agent for ${property.projectName || 'this property'}. I'm ready to help visitors with any questions about this property.` }]
      },
      // Previous conversation turns
      ...history,
      // Current user message
      {
        role: 'user',
        parts: [{ text: userMessage }]
      }
    ];

    const response = await axios.post(
      `${GEMINI_URL}?key=${GEMINI_API_KEY}`,
      {
        contents,
        generationConfig: {
          maxOutputTokens: 512,
          temperature: 0.7,
        },
      },
      {
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 
                  'Sorry, I could not generate a response. Please try again.';

    // Append only the real conversation turns (not the system prompt injection)
    const updatedHistory = [
      ...history,
      { role: 'user', parts: [{ text: userMessage }] },
      { role: 'model', parts: [{ text: reply }] },
    ];

    return { reply, history: updatedHistory };
  }
}

module.exports = new GeminiService();
