# IIITL Bachat

IIITL Bachat is a full-stack personal finance and expense management application built for tracking income, expenses, monthly trends, and investment possibilities from one dashboard. Users can add transactions manually, import transactions from receipts or PDFs with Gemini AI, analyze spending patterns, export records, and ask an AI assistant questions about budgeting, investments, and their own financial data.

The project uses the MERN stack with a React frontend, Express/Node backend, MongoDB database, Google authentication, Gemini-powered finance tools, and live market data from public Yahoo Finance chart endpoints.

---

## Key Features

### Authentication and User Profile

- Local registration and login with email and password.
- Password hashing with `bcrypt` before storing credentials.
- Google Sign-In using Google Identity Services and backend token verification.
- User profile support with avatar image setup.
- Authenticated user data is stored locally in the browser for dashboard access.
- Users without an avatar are redirected to the avatar setup screen.

### Transaction Management

- Add income and expense records with title, amount, category, description, date, and transaction type.
- View all transactions in a responsive table.
- Edit existing transaction details.
- Delete transactions from the dashboard.
- Store every transaction against the logged-in MongoDB user.
- Supported categories include:
  - Groceries
  - Rent
  - Salary
  - Tip
  - Food
  - Medical
  - Utilities
  - Entertainment
  - Transportation
  - Other

### Filters and Search Controls

- Filter transactions by transaction type:
  - All
  - Expense
  - Earned/Credit
- Filter by frequency:
  - All
  - Current week
  - Current month
  - Current year
- Filter by custom start and end date.
- Filter by transaction category.
- Reset all active filters from the dashboard.

### Dashboard Views

- Table view for day-to-day transaction management.
- Analytics view for summary cards and progress indicators.
- Monthly line chart view for income and expense trends.
- Smart finance view for AI-powered receipt import and investment planning.
- Floating investment ticker visible on the dashboard.
- Floating AI finance chat assistant available from the dashboard.

### Analytics

- Total transaction count.
- Income transaction count and percentage.
- Expense transaction count and percentage.
- Total turnover.
- Income turnover and expense turnover.
- Category-wise income progress bars.
- Category-wise expense progress bars.
- Empty-state handling when no transactions exist.

### Monthly Charts

- Monthly income and expense line charts using Chart.js.
- Month-wise grouping of all available transaction data.
- Category selector for chart-level filtering.
- Separate visual trends for credit and debit/expense transactions.
- Loading and no-data states for a cleaner user experience.

### Exporting Data

- Download transaction history as an `.xlsx` spreadsheet.
- Export includes serial number, title, transaction type, category, date, and amount.
- File name includes the app name, user name, and current date.

### AI Receipt and PDF Import

- Upload images or PDFs from the Smart Finance panel.
- Gemini extracts financial transaction rows from receipts, statements, PDF tables, or bank messages.
- Supports multi-row extraction from documents instead of only reading the first transaction.
- Automatically normalizes amount, category, date, transaction type, title, and description.
- Adds all successfully parsed transactions to the user's account.
- Shows partial success/error feedback when some rows cannot be saved.

### Bachat AI Assistant

- Floating chat widget powered by Gemini.
- Three conversation modes:
  - General finance, saving, budgeting, and Bachat app questions.
  - Investment education for SIP, gold, mutual funds, Nifty 50, stocks, Bitcoin, and risk basics.
  - User data queries based on uploaded and manually entered transactions.
- Gives short, practical answers.
- Supports Hinglish/Hindi responses when the user asks in that style.
- Refuses unrelated questions and avoids personalized buy/sell recommendations.
- Shows helpful financial summary cards alongside chat responses.

### Investment Insights

- Calculates income, spending, net profit, savings rate, and category totals from transaction data.
- Estimates investable surplus from monthly net profit.
- Fetches one-year public market growth data for:
  - Gold
  - Bitcoin
  - Nifty 50
  - Mutual fund proxy
  - Stock basket proxy
- Produces educational allocation suggestions with risk labels.
- Includes a clear note that suggestions are educational and not personalized investment advice.

### Personal Investment Plans

- Generates short-term, medium-term, and long-term investment plans.
- Plan horizons:
  - 1 year
  - 3 years
  - 10 years
- Allocates monthly surplus across:
  - Gold SIP
  - Mutual Funds
  - Nifty 50
  - Common Stocks
  - Bitcoin
- Calculates projected value using monthly future value calculations.
- Shows allocation percentage, monthly amount, assumed annual growth, total invested, and projected value.
- Allows downloading the generated investment plan as a `.txt` file.

### Live Investment Ticker

- Fetches market movement data for Gold, Bitcoin, and Nifty 50.
- Shows proxy entries for mutual funds and common stocks.
- Includes an India government investment/capex item.
- Auto-refreshes ticker data every 5 minutes.
- Falls back to default display items if live data is unavailable.

### UI and Experience

- Responsive React UI with Bootstrap and React Bootstrap components.
- Material UI icons for dashboard actions and chat controls.
- Toast notifications for success, error, and info messages.
- Loading spinners for async operations.
- Animated background/visual effects using tsparticles assets.
- Mobile-friendly action controls including compact add button behavior.

---

## Tech Stack

### Frontend

- React 18
- React Router DOM
- React Bootstrap
- Bootstrap 5
- Material UI icons
- Axios
- React Datepicker
- React Date Range
- React Chart.js 2
- Chart.js
- XLSX for spreadsheet exports
- React Toastify and React Hot Toast
- tsparticles / react-tsparticles

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- ES Modules
- bcrypt for password hashing
- CORS
- dotenv
- helmet
- morgan
- body-parser
- validator

### AI and External Services

- Google Gemini API for receipt parsing, finance chat, and AI-generated insights.
- Google Identity Services for Google Sign-In.
- Google OAuth token info endpoint for backend credential verification.
- Yahoo Finance chart endpoints for public market movement and growth data.

### Deployment

- Frontend build configured for Vercel.
- Root `vercel.json` points Vercel to `frontend/build`.
- Backend API is configured through `REACT_APP_API_URL`.
- Default frontend API host currently points to the deployed Render backend:
  - `https://iiitlbachat.onrender.com`

---

## Project Structure

```text
IIITLBachat/
  backend/
    app.js
    DB/
      Database.js
    Routers/
      Transactions.js
      aiRouter.js
      userRouter.js
    controllers/
      aiController.js
      transactionController.js
      userController.js
    models/
      TransactionModel.js
      UserSchema.js
    package.json
  frontend/
    public/
    src/
      App.js
      components/
      Pages/
        Auth/
        Avatar/
        Home/
      utils/
        ApiRequest.js
    package.json
  scripts/
    start-dev.cjs
  package.json
  vercel.json
```

---

## API Overview

### Auth Routes

Base path: `/api/auth`

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/register` | Create a local user account |
| `POST` | `/login` | Login with email and password |
| `POST` | `/google` | Login or register with Google credential |
| `POST` | `/setAvatar/:id` | Save avatar image for a user |

### Transaction Routes

Base path: `/api/v1`

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/addTransaction` | Add a transaction |
| `POST` | `/getTransaction` | Fetch transactions with filters |
| `POST` | `/deleteTransaction/:id` | Delete a transaction |
| `PUT` | `/updateTransaction/:id` | Update a transaction |

### AI Routes

Base path: `/api/ai`

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/receipt` | Parse receipt/PDF/image transaction data |
| `POST` | `/chat` | Ask the Bachat AI assistant |
| `POST` | `/investments` | Get educational investment options |
| `POST` | `/plans` | Generate investment plans |
| `GET` | `/market-ticker` | Fetch market ticker data |

---

## Environment Variables

Create a `.env` file inside `backend/`:

```env
PORT=3001
MONGO_URL=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
GOOGLE_CLIENT_ID=your_google_client_id
```

Create a `.env` file inside `frontend/` if you need to override the defaults:

```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

For deployment, add these same variables in the hosting provider dashboard instead of committing secrets to the repository.

---

## Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/khushalmidha/IIITLBachat.git
cd IIITLBachat
```

### 2. Install Dependencies

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

You can also install root-level dependencies if needed:

```bash
cd ..
npm install
```

### 3. Configure Environment Variables

Add the backend and frontend `.env` files described above.

### 4. Run the Application

From the project root, start both frontend and backend together:

```bash
npm run dev
```

Or start them separately:

```bash
cd backend
npm run dev
```

```bash
cd frontend
npm start
```

Default local URLs:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`

---

## Build

Create a production frontend build from the root:

```bash
npm run build
```

This installs frontend dependencies with `npm ci` and generates the React build in `frontend/build`.

---

## Deployment Notes

- The React app can be deployed on Vercel using the provided `vercel.json`.
- The backend should be deployed separately on a Node-compatible platform such as Render.
- Set `REACT_APP_API_URL` in the frontend deployment to point to the backend API URL.
- Add `MONGO_URL`, `GEMINI_API_KEY`, `GEMINI_MODEL`, and `GOOGLE_CLIENT_ID` to the backend deployment environment.
- Add the deployed frontend URL to the backend CORS `allowedOrigins` list in `backend/app.js`.

---

## Usage Flow

1. Register with email/password or continue with Google.
2. Set an avatar if prompted.
3. Add income and expense transactions manually.
4. Use filters to inspect records by type, date, frequency, or category.
5. Switch between table, analytics, monthly chart, and smart finance views.
6. Upload receipts or PDFs to auto-create transactions through Gemini.
7. Ask the Bachat Assistant questions about budgeting, investments, or your own data.
8. Generate investment plans based on your current transaction surplus.
9. Download transaction history or investment plans when needed.

---

## Important Notes

- Investment insights are educational projections only and are not financial advice.
- Market data is pulled from public chart endpoints and may be delayed or unavailable.
- Gemini features require a valid `GEMINI_API_KEY` on the backend.
- Google login requires `REACT_APP_GOOGLE_CLIENT_ID` on the frontend and `GOOGLE_CLIENT_ID` on the backend.
- Do not commit `.env` files or API keys to source control.

---

## Contributor

**Khushal Midha**

- GitHub: [khushalmidha](https://github.com/khushalmidha)
