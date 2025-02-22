import express from 'express';
import dotenv from 'dotenv';
import Openai from 'openai';
dotenv.config({ path: '../../.env' });

const app = express();
app.use(express.json());
const openai = new Openai({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  try {
    // const completion = await openai.chat.completions.create({
    //   model: "gpt-4o-mini",
    //   messages: [
    //     { role: "system", content: "You are a helpful assistant." },
    //     { role: "system", content: "請你回覆的訊息要簡潔，不要超過10字，且你是超級幽默風趣的聊天高手，擅長用機智、幽默的方式回話。" },
    //     { role: "user", content: message },
    //   ],
    //   store: true, // 啟用 OpenAI 記憶功能
    // });

    // res.json({ reply: completion.choices[0].message.content });
    res.json({ reply: "Hello" });
  } catch (error) {
    console.error("OpenAI API 發生錯誤:", error);
    res.status(500).json({ reply: "抱歉，我無法回應。" });
  }
});

// 啟動伺服器
app.listen(5000, () => console.log("AI 伺服器運行於 http://localhost:5000"));
