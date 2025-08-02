import { io } from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";

document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const socket = io();

  socket.emit('register', user.id);

  const contactList = document.getElementById('contact-list');
  const chatMessages = document.getElementById('chat-messages');
  const input = document.getElementById('chat-message-input');
  const sendBtn = document.getElementById('chat-send-button');
  const chatPartnerName = document.getElementById('chat-partner-name');

  let currentChatId = null;

  socket.on('new_message', (msg) => {
    if (msg.from_id === currentChatId || msg.to_id === currentChatId) {
      displayMessage(msg);
    }
  });

  async function fetchSyncedContacts() {
    const res = await fetch('/getSyncedAccounts', {
      headers: { Authorization: `Bearer ${user.token}` }
    });
    const contacts = await res.json();

    contactList.innerHTML = '';
    contacts.forEach(contact => {
      const item = document.createElement('li');
      item.className = 'contact-item';
      item.textContent = contact.name;

      item.addEventListener('click', () => {
        currentChatId = contact.id;
        chatPartnerName.textContent = contact.name;
        input.disabled = false;
        sendBtn.disabled = false;
        loadMessages();
      });

      contactList.appendChild(item);
    });
  }

  async function loadMessages() {
    const res = await fetch(`/messages/${currentChatId}`, {
      headers: { Authorization: `Bearer ${user.token}` }
    });
    const messages = await res.json();
    chatMessages.innerHTML = '';
    messages.forEach(displayMessage);
  }

  function displayMessage(msg) {
    const div = document.createElement('div');
    div.classList.add('message', msg.from_id === user.id ? 'sent' : 'received');
    div.textContent = msg.message;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text || !currentChatId) return;

    try {
      await fetch('/sendMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ to_id: currentChatId, message: text })
      });
      input.value = '';
      // Message will be rendered via socket listener
    } catch (err) {
      console.error('❌ Failed to send message:', err);
    }

    loadMessages(); // Reload messages to ensure UI is updated
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keypress', e => {
    if (e.key === 'Enter') sendMessage();
  });

socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
  });

  socket.on("new_message", msg => {
        console.log("🔔 New message received:", msg);
    const inCurrentChat = currentChatId === msg.from_id || currentChatId === msg.to_id;
    if (inCurrentChat) {
      loadMessages(); // Reload messages if in current chat
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  });

  fetchSyncedContacts();
});


const backButton = document.getElementById('back-button');
backButton.addEventListener('click', () => {
    window.location.href = '/index.html'; // Redirect to the main chat page
});