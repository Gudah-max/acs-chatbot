# Amara — AI Chatbot for Amus College School

Amara is a friendly AI chatbot assistant for [Amus College School](https://amuscollegeschool.com), a premier boarding secondary school in Bukedea District, Uganda. It is powered by the Anthropic Claude API and surfaces as a floating chat widget on the school's website.

---

## Project Structure

```
acs-chatbot/
├── server.js           # Express backend — proxies requests to Claude API
├── package.json
├── .env.example        # Copy to .env and fill in your API key
├── .gitignore
├── acs-knowledge.txt   # School knowledge base (paste your content here)
├── README.md
└── public/
    └── widget.js       # Frontend chat widget (served at /widget.js)
```

---

## Local Setup

### 1. Install dependencies
```bash
cd acs-chatbot
npm install
```

### 2. Add your API key
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Open `.env` and replace `your_anthropic_api_key_here` with your real key from [console.anthropic.com](https://console.anthropic.com).

**Never commit `.env` to Git** — it is already listed in `.gitignore`.

### 3. Paste the knowledge base
Open `acs-knowledge.txt`, delete the placeholder comment, and paste the full school knowledge base content.

### 4. Start the server
```bash
node server.js
```

### 5. Verify it is running
Open a browser and visit:
```
http://localhost:3000/health
```
You should see: `{"status":"ok"}`

### 6. Test the widget
Add these two lines just before `</body>` in any local HTML file and open it in a browser:
```html
<script>window.ACS_CHATBOT_URL = 'http://localhost:3000';</script>
<script src="http://localhost:3000/widget.js"></script>
```
A red chat bubble should appear in the bottom-right corner.

---

## Deploy to Railway

1. Create a free account at [railway.app](https://railway.app).
2. Create a new GitHub repository called `acs-chatbot` and push the contents of this folder to it. **Do not push `.env`.**
3. In Railway: click **New Project** → **Deploy from GitHub repo** → select `acs-chatbot`.
4. Go to **Variables** and add:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** your real API key
5. Railway will build and deploy automatically. You will receive a live URL such as:
   ```
   https://acs-chatbot-production.up.railway.app
   ```
6. Verify the deployment:
   ```
   https://your-railway-url.up.railway.app/health
   ```

---

## Embed on the ACS Website

Send the following two lines to Vanta Digital (the website builder) and ask them to add them just before the closing `</body>` tag on every page of amuscollegeschool.com:

```html
<!-- ACS Chatbot Widget -->
<script>window.ACS_CHATBOT_URL = 'https://YOUR-RAILWAY-URL-HERE';</script>
<script src="https://YOUR-RAILWAY-URL-HERE/widget.js"></script>
```

Replace `YOUR-RAILWAY-URL-HERE` with the actual URL from Railway (Step 5 above).

---

## Updating the Knowledge Base

1. Open `acs-knowledge.txt` and make your changes (correct fees, add new sections, etc.).
2. Save the file.
3. Commit and push to GitHub — Railway will redeploy automatically.
4. The updated knowledge base is loaded when the server starts.

---

## Contacts

| Resource | Details |
|---|---|
| School email | amuscollegeschool@gmail.com |
| School phone | +256 782 442 940 |
| Anthropic console | [console.anthropic.com](https://console.anthropic.com) |
| Railway hosting | [railway.app](https://railway.app) |
| Website builder | Vanta Digital — [vantadigital.co](https://vantadigital.co) |
