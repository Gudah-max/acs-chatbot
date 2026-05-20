(function () {
  'use strict';

  var BACKEND_URL = (window.ACS_CHATBOT_URL || 'http://localhost:3000').replace(/\/$/, '');

  var COLORS = {
    red: '#CC0000',
    yellow: '#FFD700',
    navy: '#0D1B2A',
    userBubble: '#CC0000',
    botBubble: '#F1F1F1',
    userText: '#FFFFFF',
    botText: '#1A1A1A',
  };

  var conversationHistory = [];
  var isOpen = false;
  var welcomeShown = false;

  // ── Inject styles ──────────────────────────────────────────────────────────
  var style = document.createElement('style');
  style.textContent = [
    '@keyframes acsDot{0%,80%,100%{transform:scale(0);opacity:.4}40%{transform:scale(1);opacity:1}}',
    '#acs-bubble{position:fixed;bottom:24px;right:24px;width:60px;height:60px;border-radius:50%;background:' + COLORS.red + ';box-shadow:0 4px 20px rgba(204,0,0,.45),0 2px 8px rgba(13,27,42,.3);cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:2147483646;transition:transform .2s cubic-bezier(.34,1.56,.64,1),box-shadow .2s ease;}',
    '#acs-bubble:hover{transform:scale(1.1);box-shadow:0 8px 28px rgba(204,0,0,.55),0 4px 12px rgba(13,27,42,.35);}',
    '#acs-bubble:active{transform:scale(.95);}',
    '#acs-window{position:fixed;bottom:100px;right:24px;width:400px;height:550px;background:#fff;border-radius:16px;box-shadow:0 20px 60px rgba(13,27,42,.3),0 4px 16px rgba(13,27,42,.15);z-index:2147483645;display:none;flex-direction:column;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;}',
    '#acs-window.acs-open{display:flex;}',
    '#acs-header{background:' + COLORS.navy + ';padding:14px 16px;display:flex;align-items:center;gap:10px;flex-shrink:0;}',
    '#acs-header img{width:36px;height:36px;border-radius:50%;object-fit:contain;background:#fff;padding:2px;}',
    '#acs-header-info{flex:1;}',
    '#acs-header-name{color:#fff;font-weight:700;font-size:15px;line-height:1.2;}',
    '#acs-header-status{color:' + COLORS.yellow + ';font-size:11px;letter-spacing:.02em;}',
    '#acs-close{background:none;border:none;color:rgba(255,255,255,.7);font-size:20px;cursor:pointer;padding:4px;line-height:1;border-radius:4px;transition:color .15s,background .15s;}',
    '#acs-close:hover{color:#fff;background:rgba(255,255,255,.1);}',
    '#acs-messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth;}',
    '#acs-messages::-webkit-scrollbar{width:4px;}',
    '#acs-messages::-webkit-scrollbar-track{background:transparent;}',
    '#acs-messages::-webkit-scrollbar-thumb{background:rgba(13,27,42,.15);border-radius:4px;}',
    '.acs-msg{max-width:80%;padding:10px 14px;border-radius:16px;font-size:14px;line-height:1.6;word-wrap:break-word;white-space:pre-wrap;}',
    '.acs-msg-user{background:' + COLORS.userBubble + ';color:' + COLORS.userText + ';align-self:flex-end;border-bottom-right-radius:4px;}',
    '.acs-msg-bot{background:' + COLORS.botBubble + ';color:' + COLORS.botText + ';align-self:flex-start;border-bottom-left-radius:4px;}',
    '#acs-typing{align-self:flex-start;background:' + COLORS.botBubble + ';padding:12px 16px;border-radius:16px;border-bottom-left-radius:4px;display:none;gap:5px;align-items:center;}',
    '#acs-typing.acs-visible{display:flex;}',
    '.acs-dot{width:7px;height:7px;border-radius:50%;background:#999;animation:acsDot 1.2s infinite ease-in-out;}',
    '.acs-dot:nth-child(2){animation-delay:.2s;}',
    '.acs-dot:nth-child(3){animation-delay:.4s;}',
    '#acs-quick-replies{padding:0 16px 12px;display:flex;flex-wrap:wrap;gap:8px;}',
    '.acs-qr{background:#fff;border:1.5px solid ' + COLORS.red + ';color:' + COLORS.red + ';border-radius:20px;padding:6px 14px;font-size:13px;cursor:pointer;transition:background .15s,color .15s;white-space:nowrap;}',
    '.acs-qr:hover{background:' + COLORS.red + ';color:#fff;}',
    '#acs-input-row{padding:12px 16px;border-top:1px solid #eee;display:flex;gap:8px;flex-shrink:0;background:#fff;}',
    '#acs-input{flex:1;border:1.5px solid #ddd;border-radius:24px;padding:10px 16px;font-size:14px;outline:none;transition:border-color .15s;font-family:inherit;}',
    '#acs-input:focus{border-color:' + COLORS.red + ';}',
    '#acs-send{background:' + COLORS.red + ';color:#fff;border:none;border-radius:24px;padding:10px 18px;font-size:14px;font-weight:600;cursor:pointer;transition:background .15s,transform .1s;white-space:nowrap;}',
    '#acs-send:hover{background:#aa0000;}',
    '#acs-send:active{transform:scale(.96);}',
    '@media(max-width:480px){#acs-window{width:100vw;height:100vh;bottom:0;right:0;border-radius:0;}}',
    '@media(max-width:480px){#acs-bubble{bottom:16px;right:16px;}}',
  ].join('');
  document.head.appendChild(style);

  // ── Build DOM ──────────────────────────────────────────────────────────────
  var bubble = document.createElement('div');
  bubble.id = 'acs-bubble';
  bubble.setAttribute('aria-label', 'Chat with Amara');
  bubble.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';

  var win = document.createElement('div');
  win.id = 'acs-window';
  win.setAttribute('role', 'dialog');
  win.setAttribute('aria-label', 'Amara — ACS Chatbot');
  win.innerHTML = [
    '<div id="acs-header">',
    '  <img src="https://amuscollegeschool.com/images/logo.png" alt="ACS Logo" onerror="this.style.display=\'none\'">',
    '  <div id="acs-header-info">',
    '    <div id="acs-header-name">Amara</div>',
    '    <div id="acs-header-status">ACS Assistant &bull; Online</div>',
    '  </div>',
    '  <button id="acs-close" aria-label="Close chat">&times;</button>',
    '</div>',
    '<div id="acs-messages"></div>',
    '<div id="acs-typing"><span class="acs-dot"></span><span class="acs-dot"></span><span class="acs-dot"></span></div>',
    '<div id="acs-quick-replies"></div>',
    '<div id="acs-input-row">',
    '  <input id="acs-input" type="text" placeholder="Type your message..." autocomplete="off" maxlength="500">',
    '  <button id="acs-send">Send</button>',
    '</div>',
  ].join('');

  document.body.appendChild(bubble);
  document.body.appendChild(win);

  var messagesEl = document.getElementById('acs-messages');
  var typingEl = document.getElementById('acs-typing');
  var quickRepliesEl = document.getElementById('acs-quick-replies');
  var inputEl = document.getElementById('acs-input');
  var sendBtn = document.getElementById('acs-send');
  var closeBtn = document.getElementById('acs-close');

  // ── Helpers ────────────────────────────────────────────────────────────────
  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addMessage(text, role) {
    var msg = document.createElement('div');
    msg.className = 'acs-msg ' + (role === 'user' ? 'acs-msg-user' : 'acs-msg-bot');
    msg.textContent = text;
    messagesEl.appendChild(msg);
    scrollToBottom();
    return msg;
  }

  function showTyping() {
    typingEl.classList.add('acs-visible');
    messagesEl.appendChild(typingEl);
    scrollToBottom();
  }

  function hideTyping() {
    typingEl.classList.remove('acs-visible');
  }

  function removeQuickReplies() {
    quickRepliesEl.innerHTML = '';
  }

  function showQuickReplies() {
    var questions = [
      'How do I apply?',
      'What are the fees?',
      'Tell me about sports',
      'Do you offer scholarships?',
    ];
    quickRepliesEl.innerHTML = '';
    questions.forEach(function (q) {
      var btn = document.createElement('button');
      btn.className = 'acs-qr';
      btn.textContent = q;
      btn.addEventListener('click', function () {
        removeQuickReplies();
        sendMessage(q);
      });
      quickRepliesEl.appendChild(btn);
    });
  }

  function sendMessage(text) {
    text = text.trim();
    if (!text) return;

    removeQuickReplies();
    addMessage(text, 'user');
    conversationHistory.push({ role: 'user', content: text });

    inputEl.value = '';
    inputEl.disabled = true;
    sendBtn.disabled = true;
    showTyping();

    fetch(BACKEND_URL + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        history: conversationHistory.slice(-7, -1), // last 6 before current
      }),
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        hideTyping();
        var reply = data.reply || "I'm sorry, I didn't get a response. Please try again.";
        addMessage(reply, 'assistant');
        conversationHistory.push({ role: 'assistant', content: reply });
      })
      .catch(function () {
        hideTyping();
        var errMsg = "I'm having trouble connecting right now. Please try again or contact the school at amuscollegeschool@gmail.com.";
        addMessage(errMsg, 'assistant');
      })
      .finally(function () {
        inputEl.disabled = false;
        sendBtn.disabled = false;
        inputEl.focus();
      });
  }

  function openChat() {
    isOpen = true;
    win.classList.add('acs-open');
    bubble.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

    if (!welcomeShown) {
      welcomeShown = true;
      var welcome = "Hello! I'm Amara, the AI assistant for Amus College School. How can I help you today? 👋";
      addMessage(welcome, 'assistant');
      conversationHistory.push({ role: 'assistant', content: welcome });
      showQuickReplies();
    }

    setTimeout(function () { inputEl.focus(); }, 100);
  }

  function closeChat() {
    isOpen = false;
    win.classList.remove('acs-open');
    bubble.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
  }

  // ── Events ─────────────────────────────────────────────────────────────────
  bubble.addEventListener('click', function () {
    if (isOpen) { closeChat(); } else { openChat(); }
  });

  closeBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    closeChat();
  });

  sendBtn.addEventListener('click', function () {
    sendMessage(inputEl.value);
  });

  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputEl.value);
    }
  });

})();
