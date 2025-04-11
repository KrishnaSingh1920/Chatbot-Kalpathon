(function () {
    const scriptTag = document.currentScript;
    const scriptUrl = scriptTag.getAttribute('data-script-url');
    if (!scriptUrl) return console.error("FAQ Widget: Missing 'data-script-url' attribute.");
  
    const style = document.createElement('style');
    style.textContent = `
  :root {
    --chat-bg:rgba(30,32,41,1);
    --chat-surface: rgba(73, 79, 104, 0.15);
    --chat-text: #f1f1f1;
    --chat-bot-bg:rgba(73, 79, 104, 0.1);
    --chat-user-bg: rgba(96, 112, 175, 0.50);
    --chat-border:rgba(73, 79, 104, 0.1);
    --accent-red:rgb(201, 109, 109);
  }

  .NexGenEntry {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: var(--chat-bg);
    color: var(--chat-text);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    padding: 20px;
    max-width: 700px;
    margin: 30px auto;
    border-radius: 10px;
    border: solid var(--chat-border) 2.5px;
    transition: all 0.3s ease;
  }

  h2, h3 {
    margin-bottom:20px;
    text-align: center;
  }

  #faq-list {
    margin-bottom: 20px;
    padding: 10px 12px;
    height: 40vh;
    width: 100%;
    overflow-y: auto;
    border: 1px solid var(--chat-border);
    border-radius: 10px;
    background-color: var(--chat-surface);
    box-sizing: border-box;
    scrollbar-width: none;
    -ms-overflow-style: none;
    transition: background 0.3s ease;
  }

  #faq-list::-webkit-scrollbar {
    display: none;
  }

  .faq {
    width: 100%;
    background: var(--chat-surface);
    border: 1px solid var(--chat-border);
    border-radius: 12px;
    padding: 14px 18px;
    margin-bottom: 15px;
    opacity: 0;
    transform: translateY(20px);
    animation: fadeInUp 0.4s ease forwards;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    box-sizing: border-box;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }

  .faq:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(255, 255, 255, 0.08);
  }

  .faq .text {
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding-right: 25px;
    word-break: break-word;
  }

  .faq button {
    background-color: var(--accent-red);
    color: white;
    border: none;
    font-size: 15px;
    padding: 12px 16px;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s ease, transform 0.2s ease;
  }

  .faq button:hover {
    background-color:rgb(235, 47, 47);
    transform: scale(1.05);
  }

  form {
    background: var(--chat-bot-bg);
    width: 80%;
    padding: 20px;
    border-radius: 12px;
    border: 1px solid var(--chat-border);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    transition: all 0.3s ease;
  }

  input, textarea {
    width: 100%;
    padding: 10px;
    margin-bottom: 12px;
    border: 1px solid var(--chat-border);
    border-radius: 6px;
    background-color: var(--chat-surface);
    color: var(--chat-text);
    transition: border 0.3s ease, box-shadow 0.3s ease;
  }

  input:focus, textarea:focus {
    border-color: #aaa;
    box-shadow: 0 0 5px rgba(255, 255, 255, 0.2);
    outline: none;
  }

  input::placeholder, textarea::placeholder {
    color: #aaa;
  }

  #faq-form button[type="submit"] {
    background-color: var(--chat-user-bg);
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.5s ease, transform 0.2s ease;
  }

  #faq-form button[type="submit"]:hover:not(:disabled) {
    background-color: rgba(73, 79, 104, 1);
    transform: scale(1.05);
  }

  button[type="submit"]:disabled {
    background-color: #444;
    cursor: not-allowed;
  }

  #loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(30, 30, 30, 0.95);
    z-index: 999;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }

  .loader {
    border: 5px solid rgba(255, 255, 255, 0.1);
    border-top: 5px solid #f1f1f1;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
  }

  .loading-text {
    margin-top: 10px;
    color: #ccc;
    font-size: 16px;
    font-weight: 500;
  }

  @keyframes fadeInUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

    document.head.appendChild(style);
  
    const wrapper = document.createElement('div');
    wrapper.className = 'NexGenEntry';
    wrapper.innerHTML = `
      <div id="loading-overlay">
        <div class="loader"></div>
        <div class="loading-text">Loading FAQs...</div>
      </div>
  
      <h2>Frequently Asked Questions</h2>
      <div id="faq-list"></div>
  
      <h3>Add FAQs</h3>
      <form id="faq-form">
        <input type="text" id="question" placeholder="Question" required />
        <input type="text" id="answer" placeholder="Answer" required />
        <button type="submit">Submit</button>
      </form>
    `;
    document.body.appendChild(wrapper);
  
    const overlay = wrapper.querySelector('#loading-overlay');
    const faqList = wrapper.querySelector('#faq-list');
    const form = wrapper.querySelector('#faq-form');
    const submitBtn = form.querySelector('button[type="submit"]');
  
    function showOverlay(show) {
      overlay.style.display = show ? 'flex' : 'none';
    }
  
    async function loadFAQs() {
      showOverlay(true);
      const res = await fetch(scriptUrl);
      const faqs = await res.json();
      faqList.innerHTML = '';
      faqs.forEach((faq, i) => {
        const div = document.createElement('div');
        div.className = 'faq';
        div.style.animationDelay = `${i * 80}ms`;
        div.innerHTML = `
          <div class="text">
            <div><strong>Question:</strong> ${faq.question}</div>
            <div><strong>Answer:</strong> ${faq.answer}</div>
          </div>
          <button>Delete</button>
        `;
        div.querySelector('button').onclick = async () => {
          showOverlay(true);
          await fetch(scriptUrl, {
            method: 'POST',
            body: JSON.stringify({ deleteId: faq.id }),
          });
          loadFAQs();
        };
        faqList.appendChild(div);
      });
      showOverlay(false);
    }
  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const question = form.querySelector('#question').value.trim();
      const answer = form.querySelector('#answer').value.trim();
      if (!question || !answer) return;
  
      submitBtn.disabled = true;
      showOverlay(true);
  
      await fetch(scriptUrl, {
        method: 'POST',
        body: JSON.stringify({ question, answer }),
      });
  
      form.reset();
      submitBtn.disabled = false;
      loadFAQs();
    });
  
    loadFAQs();
  })();
  