import React, { useState } from 'react';


const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message to the chat
    setMessages([...messages, { role: 'user', content: input }]);

    try {     // Send message to the backend, you can replace the URL with your backend endpoint
      const response = await fetch(`${import.meta.env.VITE_API_URL}/chatbot/chat`, {      
        method: 'POST',     // Change to your backend URL
        headers: { 'Content-Type': 'application/json' },  // Set the content type to JSON
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();  // Check if the response is in JSON format
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error('Error sending message:', error);  // Log the error for debugging
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
    }

    setInput('');  // Clear the input field
  };

  return (  // Render the chat interface
    <div className="chatbot">  // Chatbot component
      <div className="chat-window">
        {messages.map((msg, index) => (   // Map through messages
          <div key={index} className={`message ${msg.role}`}>  // Assign class based on role
            {msg.content}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chatbot;


