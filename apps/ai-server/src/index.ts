import express from 'express';
// import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const app = express();
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: message }],
    }),
  });

  const data = await response.json();
  res.json({ reply: data.choices[0].message.content });
});

app.listen(5000, () => console.log('AI 伺服器運行於 http://localhost:5000'));
