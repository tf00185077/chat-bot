import puppeteer from 'puppeteer';
// import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('https://tinder.com', { waitUntil: 'networkidle2' });

  console.log("請手動登入 Tinder...");
  await new Promise(resolve => setTimeout(resolve, 30000)); // 讓使用者手動登入

  console.log("登入成功，開始監控聊天...");

  while (true) {
    try {
      // 取得最新訊息
      const lastMessage = await page.evaluate(() => {
        const chatElements = document.querySelectorAll('.message-class'); // 這裡要改成實際的 class
        return chatElements.length > 0 ? chatElements[chatElements.length - 1].textContent : null;
      });

      if (lastMessage) {
        console.log("收到訊息:", lastMessage);

        // 呼叫 AI 伺服器獲取 GPT 回覆
        const response = await fetch('http://localhost:5000/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: lastMessage }),
        });

        const data = await response.json();

        console.log("AI 回覆:", data.reply);

        // 發送 AI 回覆
        await page.type('.chat-input-selector', data.reply);
        await page.keyboard.press('Enter');
      }
    } catch (error) {
      console.error("錯誤:", error);
    }

    await new Promise(resolve => setTimeout(resolve, 5000)); // 每 5 秒檢查一次訊息
  }
})();
