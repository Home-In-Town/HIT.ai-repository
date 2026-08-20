const axios = require('axios');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'qwen/qwen3.6-27b';

/**
 * Builds a detailed system prompt for the property AI agent
 * using the full project data so the LLM knows everything about the property.
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
    cta.callNumber   ? `Call/Enquiry Number: ${cta.callNumber}` : '',
    cta.whatsappNumber ? `WhatsApp: ${cta.whatsappNumber}` : '',
    ``,
    `=== AGENT INSTRUCTIONS ===`,
    `- When visitors ask about price, give the starting price and mention they can enquire for exact unit pricing.`,
    `- When visitors ask about availability, encourage them to call or WhatsApp.`,
    `- When visitors show interest, suggest booking a site visit.`,
    `- Keep responses short (2-4 sentences max) unless the visitor asks for more details.`,
    `- Do NOT discuss competitor projects.`,
    `- Do NOT invent features or amenities not listed above.`
  );

  return lines.filter(Boolean).join('\n');
}

class GroqService {
  /**
   * Send a chat message with full property context.
   * Groq uses OpenAI-compatible API — simple messages array.
   *
   * @param {object} property    - Full property/project data object
   * @param {string} userMessage - Latest message from the visitor
   * @param {Array}  history     - Previous turns [{ role: 'user'|'assistant', content: string }]
   * @returns {Promise<{ reply: string, history: Array }>}
   */
  async chat(property, userMessage, history = []) {
    const systemPrompt = buildSystemPrompt(property);

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: userMessage },
    ];

    const response = await axios.post(
      GROQ_URL,
      {
        model: GROQ_MODEL,
        messages,
        max_tokens: 512,
        temperature: 0.7,
      },
      {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
      }
    );

    const rawReply = response.data.choices?.[0]?.message?.content ||
                  'Sorry, I could not generate a response. Please try again.';

    // Strip <think>...</think> reasoning tags (Qwen model includes internal reasoning)
    const reply = rawReply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim() ||
                  'Sorry, I could not generate a response. Please try again.';

    // Append both turns to history for next call
    const updatedHistory = [
      ...history,
      { role: 'user', content: userMessage },
      { role: 'assistant', content: reply },
    ];

    return { reply, history: updatedHistory };
  }
}

module.exports = new GroqService();
