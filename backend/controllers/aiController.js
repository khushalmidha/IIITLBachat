const axios = require('axios');

const financeChatController = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const policyPrompt = `You are a helpful finance assistant for a personal expense tracking application called IIITL Bachat. 
    
Your role is to help users with:
- Understanding their spending habits
- Personal finance advice
- Budget management tips
- Investment guidance (general advice only, not specific recommendations)
- Understanding financial concepts

IMPORTANT: Keep answers SHORT and CONCISE (max 2-3 sentences, max 60 words). Be direct and practical.
Avoid long explanations - get straight to the point.
If the user asks something not related to finance/budgeting, politely redirect them.`;

    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
      {
        contents: [
          {
            parts: [
              {
                text: `${policyPrompt}\n\nUser question: ${message}`
              }
            ]
          }
        ]
      },
      {
        params: {
          key: process.env.GEMINI_API_KEY
        }
      }
    );

    const botMessage = response.data.candidates[0].content.parts[0].text;

    res.status(200).json({
      success: true,
      message: botMessage
    });
  } catch (error) {
    console.error('AI Controller Error:', error);
    res.status(500).json({
      error: 'Failed to get response from AI',
      details: error.message
    });
  }
};

module.exports = { financeChatController };
