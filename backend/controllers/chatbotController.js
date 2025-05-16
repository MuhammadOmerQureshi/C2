const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.handleChat = async (req, res) => {
  try {
    const { message } = req.body;

    // Send the user's message to OpenAI GPT
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: message }],
    });

    const reply = response.choices[0].message.content;
    res.status(200).json({ reply });
  } catch (error) {
    console.error('Error handling chat:', error);
    res.status(500).json({ message: 'Failed to process the chat', error: error.message });
  }
};