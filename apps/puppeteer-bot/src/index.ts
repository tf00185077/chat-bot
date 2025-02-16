import puppeteer from 'puppeteer';
// import axios from 'axios';
import dotenv from 'dotenv';
declare global {
  interface Window {
    __newMessage: { message: string, index: number; } | null;
  }
}
dotenv.config({ path: '../../.env' });

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const page = await browser.newPage();

  await page.goto('https://tinder.com', { waitUntil: 'networkidle2' });

  console.log("請手動登入 Tinder...");
  await new Promise(resolve => setTimeout(resolve, 30000)); // 讓使用者手動登入

  console.log("登入成功，開始監控聊天...");

  await page.evaluate(() => {
    const chatContainer = document.querySelector('.messageListItem__message')?.parentElement; // 父容器
    if (!chatContainer) return;

    const observer = new MutationObserver((mutations) => {
      const messages = Array.from(document.querySelectorAll('.messageListItem__message')); // 取得所有訊息
      for (const mutation of mutations) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1 && (node as HTMLElement).classList.contains('messageListItem__message')) {
              const messageDiv = node as HTMLElement;

              // 檢查是否有 <svg>，有 <svg> 的是自己發送的訊息
              const hasSVG = messageDiv.querySelector('svg') !== null;
              if (!hasSVG) {
                const newMessage = messageDiv.innerText;
                const messageIndex = messages.indexOf(messageDiv);
                console.log("收到新訊息:", newMessage);
                window.__newMessage = { message: newMessage, index: messageIndex }; // 存到全域變數
              }
            }
          });
        }
      }
    });

    observer.observe(chatContainer, { childList: true, subtree: true });
  });

  // 監控新訊息的變化
  while (true) {
    try {
      const newMessage = await page.evaluate(() => window.__newMessage);

      if (newMessage) {
        console.log("偵測到新訊息:", newMessage.message, "索引:", newMessage.index);

        await page.evaluate((index) => {
          const messageDivs = Array.from(document.querySelectorAll('.messageListItem__message'));
          if (index >= 0 && index < messageDivs.length) {
            const targetMessage = messageDivs[index];
            const closestLi = targetMessage.closest('li');
            if (closestLi) {
              console.log("點擊對應索引的 li");
              closestLi.click();
            }
          }
        }, newMessage.index);
        // 呼叫 AI API 取得回應
        const response = await fetch('http://localhost:5000/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: newMessage }),
        });
        const data = await response.json();
        console.log("AI 回覆:", data.reply);

        // // 找到輸入框並輸入 AI 回覆
        await page.waitForSelector('textarea[placeholder="輸入訊息"]', { visible: true });
        await page.type('textarea[placeholder="輸入訊息"]', data.reply);
        await page.keyboard.press('Enter');

        console.log("訊息已發送");

        // 點擊 `<a>` 按鈕回到配對列表
        await page.waitForSelector('a.CenterAlign.Fxs\\(0\\).Cur\\(p\\).Sq\\(44px\\).C\\(\\$c-pink\\).focus-button-style', { visible: true });
        await page.click('a.CenterAlign.Fxs\\(0\\).Cur\\(p\\).Sq\\(44px\\).C\\(\\$c-pink\\).focus-button-style');

        console.log("返回配對列表");

        // 清除變數，避免重複回應
        await page.evaluate(() => { (window as any).__newMessage = null; });
      }
    } catch (error) {
      console.error("錯誤:", error);
    }

    await new Promise(resolve => setTimeout(resolve, 5000)); // 每秒檢查一次變數
  }
})();