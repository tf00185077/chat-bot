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
    executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  });
  const page = await browser.newPage();

  await page.goto('https://wootalk.today/', { waitUntil: 'networkidle2' });

  console.log("開啟中");
  page.on('framenavigated', async () => {
    const client = await page.target().createCDPSession();
    await client.send('Network.enable');

    client.on('Network.webSocketFrameReceived', ({ requestId, timestamp, response }) => {
      console.log('WebSocket Frame Received:', response.payloadData);
    });

    client.on('Network.webSocketFrameSent', ({ requestId, timestamp, response }) => {
      console.log('WebSocket Frame Sent:', response.payloadData);
    });
  });

  // Keep the browser open
  await new Promise(resolve => setTimeout(resolve, 60000)); // Adjust the time as needed
})();