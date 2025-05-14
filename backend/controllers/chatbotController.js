const { Configuration, OpenAIApi } = require('openai');

// Initialize OpenAI configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, 
});
const openai = new OpenAIApi(configuration);

exports.handleChat = async (req, res) => {
  try {
    const { message } = req.body;

    // Send the user's message to OpenAI GPT
    const response = await openai.createChatCompletion({
      model: 'gpt-4', // Use GPT-4 or GPT-3.5
      messages: [{ role: 'user', content: message }],
    });

    const reply = response.data.choices[0].message.content;
    res.status(200).json({ reply });
  } catch (error) {
    console.error('Error handling chat:', error);
    res.status(500).json({ message: 'Failed to process the chat', error: error.message });
  }
};