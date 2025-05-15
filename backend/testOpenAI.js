// filepath: c:\Users\ibola\C2\backend\testOpenAI.js
const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MTg5OGQ3NGY3NGU4MzJkOWYxNjAwYSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NzIyNTA2MCwiZXhwIjoxNzQ3MzExNDYwfQ.TYcTUYZYny_CfymuP_U5aaaHrH-GXaZReYHDgS4Sgnw', // Replace with your actual API key
});
const openai = new OpenAIApi(configuration);

async function testOpenAI() {
  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'Hello, how are you?' }],
    });
    console.log(response.data.choices[0].message.content);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testOpenAI();