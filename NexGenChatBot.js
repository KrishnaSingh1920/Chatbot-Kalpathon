const CHAT_HISTORY_KEY = 'faq_chat_history';
const MAX_CHAT_HISTORY = 50;
const style = `
  <style>
    :root {
      --chat-bg: #1e1e1e;
      --chat-surface: #2a2a2a;
      --chat-text: #f1f1f1;
      --chat-bot-bg: #3a3a3a;
      --chat-user-bg: #505050;
      --chat-border: #838383;
    }

    .chat-toggle-button {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      border-radius: 5px;
      background-color: var(--chat-bg);
      border: 2px solid var(--chat-border);
      cursor: pointer;
      z-index: 1002;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s ease, opacity 0.3s ease;
    }

    .chat-toggle-button:hover {
      transform: scale(1.1);
    }

    .chat-toggle-button img {
      width: 36px;
      height: 36px;
      filter: invert(1);
    }

    .chatbot-wrapper {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1001;
      background-color: var(--chat-bg);
      padding: 20px;
      border-radius: 15px;
      width: 360px;
      max-width: 90vw;
      display: flex;
      flex-direction: column;
      gap: 10px;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
      max-height: 80vh;
      color: var(--chat-text);
      opacity: 0;
      transform: translateY(40px);
      pointer-events: none;
      transition: opacity 0.3s ease, transform 0.3s ease;
    }

    .chatbot-wrapper.visible {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }

    .chatbot-wrapper h5 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
      text-align: center;
    }

    .close-button {
      position: absolute;
      top: 8px;
      right: 12px;
      font-size: 28px;
      font-weight: bold;
      color: var(--chat-text);
      cursor: pointer;
      transition: opacity 0.3s ease;
    }

    .chat-history {
      flex: 1;
      min-height: 50vh;
      max-height: 50vh;
      overflow-y: auto;
      border: 1px solid var(--chat-border);
      padding: 10px;
      border-radius: 8px;
      background-color: var(--chat-surface);
      display: flex;
      flex-direction: column;
    }

    .chat-history::-webkit-scrollbar {
      display: none;
    }

    .chat-input-area {
      display: flex;
      gap: 10px;
    }

    .chat-input-area input {
      flex: 1;
      padding: 10px 12px;
      background-color: var(--chat-surface);
      border-radius: 7.5px;
      border: none;
      color: var(--chat-text);
    }

    .chat-input-area input::placeholder {
      color: #aaa;
    }

    .chat-input-area button {
      padding: 10px 14px;
      background-color: var(--chat-user-bg);
      border-radius: 5px;
      color: var(--chat-text);
      border: none;
      cursor: pointer;
    }

    .chat-message {
      margin: 5px 0;
      padding: 8px 12px;
      border-radius: 8px;
      max-width: 80%;
      word-wrap: break-word;
      white-space: pre-wrap;
      text-align: justify;
      animation: fadeIn 0.3s ease;
    }

    .chat-from-user {
      background-color: var(--chat-user-bg);
      align-self: flex-end;
      border: 1px solid var(--chat-border);
      animation: slideInRight 0.8s ease;
    }

    .chat-from-bot {
      background-color: var(--chat-bot-bg);
      align-self: flex-start;
      border: 1px solid var(--chat-border);
      animation: slideInLeft 0.8s ease;
      display:flex;
      align-item:center;
      justify-content:center;
      flex-direction:column;
    }

    .typing-indicator {
      font-style: italic;
      font-size: 14px;
      color: #ccc;
      padding: 5px 10px;
      align-self: flex-start;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes slideInRight {
      from { transform: translateX(50%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    @keyframes slideInLeft {
      from { transform: translateX(-50%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  </style>
`;

const html = `
  <button class="chat-toggle-button" id="chatToggleBtn">
    <img src="https://img.icons8.com/?size=100&id=Imv4VIewVo4o&format=png&color=000000" alt="Chat Icon" />
  </button>

  <div class="chatbot-wrapper" id="chatContainer">
    <span class="close-button" id="closeChatBtn">&times;</span>
    <h5>NexGenTube Bot</h5>
    <div id="chatHistory" class="chat-history"></div>
    <div class="chat-input-area">
      <input type="text" id="chatInput" placeholder="Type your question..." />
      <button id="sendChatBtn">Send</button>
    </div>
  </div>
`;

document.body.insertAdjacentHTML('beforeend', style + html);

(async () => {
  const { GoogleGenAI } = await import('https://cdn.jsdelivr.net/npm/@google/genai@latest/+esm');

  const scriptTag = document.querySelector('script[src*="NexGenChatBot.js"]');
  const apiKey = scriptTag?.getAttribute('data-api-key') || 'missing_key';
  const sheetUrl = scriptTag?.getAttribute('data-sheet-url') || '';
  const email = scriptTag?.getAttribute('data-email') || '';

  const genAI = new GoogleGenAI({ apiKey });

  const chatContainerEl = document.getElementById('chatContainer');
  const chatToggleBtn = document.getElementById('chatToggleBtn');
  const closeChatBtn = document.getElementById('closeChatBtn');
  const chatHistoryEl = document.getElementById('chatHistory');
  const chatInputEl = document.getElementById('chatInput');
  const sendChatBtn = document.getElementById('sendChatBtn');

  let faqPrompt = '';

  async function loadFAQContext() {
    try {
      const res = await fetch(sheetUrl);
      const text = await res.text();
      const json = JSON.parse(text.substring(47).slice(0, -2));
      const rows = json.table.rows;
      const faqData = rows.map(row => {
        const q = row.c[0]?.v || '';
        const a = row.c[1]?.v || '';
        return `Q: ${q}\nA: ${a}`;
      }).join('\n\n');

      faqPrompt = `
You are a helpful FAQ assistant.
Only answer questions using the data provided below.
If the question is similar or closely matches any of the following FAQs, respond with the corresponding answer directly.
If the question does not match or is unrelated to the FAQs, respond with:
"Sorry, I don't have an answer for that."

FAQs:
${faqData}

User Question:
      `.trim();
    } catch (err) {
      console.error('FAQ load failed:', err);
      faqPrompt = 'FAQ data could not be loaded.';
    }
  }

  function appendMessage(text, sender) {
    const msgEl = document.createElement('div');
    msgEl.className = 'chat-message ' + (sender === 'bot' ? 'chat-from-bot' : 'chat-from-user');
    msgEl.textContent = text;
    chatHistoryEl.appendChild(msgEl);
    chatHistoryEl.scrollTop = chatHistoryEl.scrollHeight;

    saveMessageToHistory({ text, sender });
  }

  function saveMessageToHistory(message) {
    const history = JSON.parse(localStorage.getItem(CHAT_HISTORY_KEY)) || [];
    history.push(message);
    if (history.length > MAX_CHAT_HISTORY) history.shift();
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
  }

  function loadMessageHistory() {
    const history = JSON.parse(localStorage.getItem(CHAT_HISTORY_KEY)) || [];
    history.forEach(msg => appendMessage(msg.text, msg.sender));
  }

  async function handleChatSubmit() {
    const userText = chatInputEl.value.trim();
    if (!userText) return;
    appendMessage(userText, 'user');
    chatInputEl.value = '';

    // Show typing indicator
    const typingEl = document.createElement('div');
    typingEl.className = 'typing-indicator';
    typingEl.textContent = 'Bot is typing...';
    chatHistoryEl.appendChild(typingEl);
    chatHistoryEl.scrollTop = chatHistoryEl.scrollHeight;

    try {
      const response = await genAI.models.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: [
          {
            role: 'user',
            parts: [
              { text: faqPrompt },
              { text: userText }
            ]
          }
        ]
      });

      const botReply = response?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, something went wrong.';
      typingEl.remove();
      appendMessage(botReply, 'bot');

      if (botReply.includes("don't have an answer")) {
        const escalationEl = document.createElement('div');
        escalationEl.className = 'chat-message chat-from-bot';
        escalationEl.innerHTML = `Didn’t get the answer you were looking for ?
          <button id="escalateBtn" style="margin-top: 2.5px; padding: 8px 16px; background: var(--chat-user-bg); border: none; border-radius: 5px; color: var(--chat-text); cursor: pointer;">Escalate to support</button>
        `;
        chatHistoryEl.appendChild(escalationEl);
        chatHistoryEl.scrollTop = chatHistoryEl.scrollHeight;

        const escalateBtn = escalationEl.querySelector('#escalateBtn');
        escalateBtn?.addEventListener('click', () => {
          const subject = encodeURIComponent('Unanswered FAQ Inquiry');
          const body = encodeURIComponent(`Hello,\n\nI asked the FAQ chatbot the following question but didn't receive a helpful answer:\n\n"${userText}"\n\nPlease help me with this.\n\nThank you!`);
          window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
        });
      }
    } catch (err) {
      console.error('Chatbot Error:', err);
      typingEl.remove();
      appendMessage('An error occurred. Please try again.', 'bot');
    }
  }

  chatToggleBtn.addEventListener('click', () => {
    chatContainerEl.classList.add('visible');
    chatToggleBtn.style.display = 'none';
    loadFAQContext();
    loadMessageHistory();
  });

  closeChatBtn.addEventListener('click', () => {
    chatContainerEl.classList.remove('visible');
    setTimeout(() => {
      chatToggleBtn.style.display = 'flex';
    }, 300);
  });

  document.addEventListener('click', (e) => {
    if (
      chatContainerEl.classList.contains('visible') &&
      !chatContainerEl.contains(e.target) &&
      !chatToggleBtn.contains(e.target)
    ) {
      chatContainerEl.classList.remove('visible');
      setTimeout(() => {
        chatToggleBtn.style.display = 'flex';
      }, 300);
    }
  });

  chatInputEl.addEventListener('keypress', e => {
    if (e.key === 'Enter') handleChatSubmit();
  });
  sendChatBtn.addEventListener('click', handleChatSubmit);
})();
