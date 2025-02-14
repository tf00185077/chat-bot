import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const app = express();
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  const response = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: 'gpt-4',
    messages: [{ role: 'user', content: message }],
  }, {
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }
  });

  res.json({ reply: response.data.choices[0].message.content });
});

app.listen(5000, () => console.log('AI 伺服器運行於 http://localhost:5000'));
