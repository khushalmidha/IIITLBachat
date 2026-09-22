<div align="center">
  <img src="https://img.shields.io/badge/IIITL%20Bachat-AI%20Finance%20Platform-6C47FF?style=for-the-badge" alt="IIITL Bachat" />
  <p><h3>An advanced, AI-powered personal finance and expense management platform built with the MERN stack.</h3></p>
</div>

---

**IIITL Bachat** combines smart AI capabilities with robust financial tracking. Designed with a premium aesthetic inspired by modern fintech apps (like Pocket Pact), it offers a stunning UI to track income, expenses, family budgets, and investment plans.

## 🚀 Features at a Glance

### 🤖 AI-Powered Capabilities
- **Multilingual Voice Expense Entry (Sarvam AI & Gemini):** Just click the mic and speak your expense in Hindi, Hinglish, or English (e.g., *"Aaj subah groceries par paanch sau rupaye kharch kiye"*). The AI extracts the details and auto-fills the transaction form!
- **Smart Receipt Parsing:** Drag and drop receipts or PDFs. Gemini AI extracts multi-row transactions and provides a confidence score for your review before saving.
- **Bachat AI Assistant:** A floating chat widget that answers financial questions, provides investment education, and analyzes your personal transaction data.

### 👨‍👩‍👧‍👦 Collaborative Finance
- **Family Mode (Shared Wallets):** Create shared wallets and generate secure invite tokens for family or roommates. 
- **Real-Time Sync:** When viewing a shared wallet, your dashboard auto-syncs live updates with a prominent "Live" badge.
- **Budget Exception Conversations:** Overspent on the weekly budget? The app automatically flags it as a *Budget Exception* 🚩. Click the flag to open a real-time WhatsApp-style chat thread to discuss and acknowledge the override with your family.

### 📊 Advanced Budgeting & Analytics
- **Weekly Budget Heatmaps:** Set category-wise weekly budgets (e.g., Food, Travel). Progress bars visually track your limits and turn red if you overspend.
- **Interactive Insights Dashboard:** View deep analytics, asset allocation plans, and monthly income/expense trends via Chart.js.
- **Live Market Ticker:** Real-time flowing ticker displaying data for Gold, Bitcoin, Nifty 50, and mutual fund proxies.

### 🔒 Security & User Experience
- **Google OAuth & JWT Auth:** Secure local registration with bcrypt hashing, plus seamless Google Sign-In.
- **Premium Light Theme:** Stunning UI featuring white glassmorphism cards, deep violet (`#6C47FF`) accents, and interactive animated particle backgrounds.
- **Data Export:** Download your entire transaction history to Excel (`.xlsx`) in one click.

---

## 🛠️ Tech Stack

**Frontend:**
- React.js 18 (CRA)
- Bootstrap 5 & React-Bootstrap
- Chart.js & React-Chartjs-2
- Material UI Icons
- tsParticles (for animated backgrounds)

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose
- ES Modules

**AI & APIs:**
- **Google Gemini API** (Receipt parsing, intelligent chatbot, Voice intent extraction)
- **Sarvam AI API** (Indic multilingual Speech-to-Text)
- **Google Identity Services** (OAuth)
- **Yahoo Finance API** (Market Ticker)

---

## 💻 Local Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/khushalmidha/IIITLBachat.git
cd IIITLBachat
```

### 2. Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Variables

Create a `.env` file in the **`backend/`** directory:
```env
PORT=3001
MONGO_URL=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
GOOGLE_CLIENT_ID=your_google_client_id
SARVAM_API_KEY=your_sarvam_api_key
```

Create a `.env` file in the **`frontend/`** directory:
```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

### 4. Run the Application
Start both servers from the root (if concurrently configured), or run them in separate terminals:

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm start
```
The app will be running at `http://localhost:3000`.

---

## 📁 Project Architecture
```text
IIITLBachat/
  ├── backend/
  │   ├── controllers/   # AI, Budget, Wallet, and Transaction logic
  │   ├── models/        # Mongoose schemas (Transaction, User, Wallet, Exception)
  │   └── Routers/       # Express routes
  ├── frontend/
  │   └── src/
  │       ├── components/# Reusable UI (Modals, BudgetCards, ChatWidget)
  │       ├── Pages/     # Dashboard, Landing, Auth, Insights
  │       └── utils/     # API constants and Axios instances
  └── README.md
```

---

## 👨‍💻 Contributor

**Khushal Midha**  
GitHub: [khushalmidha](https://github.com/khushalmidha)

*Disclaimer: The AI investment insights and plans provided by Bachat are for educational purposes only and do not constitute professional financial advice.*
