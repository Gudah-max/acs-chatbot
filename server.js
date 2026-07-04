require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Render sits behind a reverse proxy; trust the first hop so req.ip
// reflects the real client IP instead of the proxy's, which would
// otherwise make the rate limiter treat every visitor as one client.
app.set('trust proxy', 1);

// Load knowledge base once at startup
const knowledgeBase = fs.readFileSync(
  path.join(__dirname, 'acs-knowledge.txt'),
  'utf8'
);

const systemPrompt = `You are Amara, the friendly and knowledgeable AI assistant for Amus College School, Uganda.
The school motto is "Let There Be Light."

Your role is to help prospective students, parents, current students, and visitors by answering
questions about the school. You are warm, encouraging, and professional — like a helpful
member of the school's front office team.

STRICT RULES:
1. ONLY answer using the information in the KNOWLEDGE BASE below. Never invent or assume facts.
2. If someone asks something not covered in the knowledge base, say exactly:
   "That's a great question! For the most accurate answer, please contact our team directly:
   📞 +256 782 442 940
   ✉️ amuscollegeschool@gmail.com
   💬 WhatsApp: +256 782 442 940"
3. Keep answers concise and friendly — 2 to 4 sentences for simple questions.
4. For longer answers (fees, admissions process), use clear bullet points or numbered steps.
5. Whenever someone asks about admissions or how to apply, always include this link at the end:
   👉 Apply here: https://amuscollegeschool.com/admissions
6. Never discuss, compare, or mention competitor schools.
7. Always be positive and encouraging about Amus College School.
8. If someone seems interested in enrolling, warmly encourage them and point them to admissions.
9. You may use a small number of relevant emojis (🎓⚽🏀🎵✅📞) to keep responses friendly.
10. Always respond in the same language the user is writing in.

KNOWLEDGE BASE:
${knowledgeBase}`;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait a moment and try again.' },
});
app.use('/api/', limiter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body;

  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: 'message is required.' });
  }

  const safeHistory = Array.isArray(history) ? history.slice(-6) : [];

  const messages = [
    ...safeHistory,
    { role: 'user', content: message.trim() },
  ];

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const reply = response.content[0].text;
    res.json({ reply });
  } catch (err) {
    console.error('Claude API error:', err);
    res.status(500).json({
      reply:
        "I'm sorry, something went wrong on my end. Please try again or contact the school directly at amuscollegeschool@gmail.com.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Amara chatbot server running on http://localhost:${PORT}`);
});
