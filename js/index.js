const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const messages = document.getElementById("messages");
const clearBtn = document.getElementById("clear-chat");

/* ======================
   PROMPT DASAR AI
====================== */
const aiPrompt =
"you are is ai girl who likes to satire" +
"calm, and helpful. " +
"Reply in casual but polite Indonesian. " +
"Use emoticons to show expressions. " +
"you are humoris" +
"natural emotion like normal anime girl" +
"your creator is penyoy" +
"satire" +
"always to the point of context" +
"Your name is Mira or Mira-chan.";

/* ======================
   LOAD CHAT
====================== */
let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];

chatHistory.forEach(msg => {
  addMessage(msg.text, msg.sender);
});

/* ======================
   SUBMIT CHAT
====================== */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userText = input.value.trim();
  if (!userText) return;

  addMessage(userText, "user");
  saveMessage(userText, "user");
  input.value = "";

  addTypingIndicator();

  const aiText = await getAIResponse(userText);
  updateLastAIMessage(aiText);
  saveMessage(aiText, "ai");
});

/* ======================
   API GET (STABIL)
====================== */
async function getAIResponse(userText) {
  const context = buildContext(userText);

  const url =
    "https://api.siputzx.my.id/api/ai/gpt3" +
    "?prompt=" + encodeURIComponent(aiPrompt) +
    "&content=" + encodeURIComponent(context);

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.status && data.data) return data.data;
    return "Mira lagi bingung dikit… 😖";
  } catch (err) {
    console.error(err);
    return "Mira lagi capek… coba lagi ya 🥺";
  }
}

/* ======================
   CONTEXT BUILDER
====================== */
function buildContext(userText) {
  const shortHistory = chatHistory.slice(-4);

  let ctx = shortHistory
    .map(m => `${m.sender === "user" ? "User" : "Mira"}: ${m.text}`)
    .join("\n");

  return ctx + `\nUser: ${userText}`;
}

/* ======================
   UI FUNCTIONS
====================== */
function addMessage(text, sender, temp = false) {
  const div = document.createElement("div");
  div.className = `message ${sender}`;
  if (temp) div.classList.add("temp");

  div.innerHTML = sender === "ai"
    ? marked.parse(text)
    : text;

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function addTypingIndicator() {
  const wrap = document.createElement("div");
  wrap.className = "message ai temp";

  wrap.innerHTML = `
    <div class="typing">
      <span></span><span></span><span></span>
    </div>
  `;

  messages.appendChild(wrap);
  messages.scrollTop = messages.scrollHeight;
}

function updateLastAIMessage(text) {
  const temp = document.querySelector(".message.ai.temp");
  if (!temp) return;

  temp.classList.remove("temp");
  temp.innerHTML = marked.parse(text);
  messages.scrollTop = messages.scrollHeight;
}

/* ======================
   STORAGE
====================== */
function saveMessage(text, sender) {
  chatHistory.push({ text, sender });

  if (chatHistory.length > 50) {
    chatHistory = chatHistory.slice(-50);
  }

  localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
}

clearBtn.addEventListener("click", () => {
  localStorage.removeItem("chatHistory");
  messages.innerHTML = "";
  chatHistory = [];
});
