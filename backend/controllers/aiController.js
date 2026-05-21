const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const safeNumber = (value) => {
  if (typeof value === "number") return value;
  const cleaned = String(value || "").replace(/[^0-9.-]/g, "");
  return Number(cleaned || 0);
};

const normalizeTransaction = (raw = {}) => {
  const transactionType = String(raw.transactionType || raw.type || "")
    .toLowerCase()
    .includes("credit")
    ? "credit"
    : "expense";

  return {
    title: String(raw.title || raw.merchant || raw.name || "Receipt transaction").slice(0, 80),
    amount: Math.abs(safeNumber(raw.amount || raw.total || raw.value)),
    description: String(raw.description || raw.notes || "Auto-filled from uploaded receipt").slice(0, 180),
    category: normalizeCategory(raw.category),
    date: normalizeDate(raw.date),
    transactionType,
    confidence: Math.max(0, Math.min(1, safeNumber(raw.confidence || 0.7))),
  };
};

const normalizeCategory = (category = "") => {
  const allowed = [
    "Groceries",
    "Rent",
    "Salary",
    "Tip",
    "Food",
    "Medical",
    "Utilities",
    "Entertainment",
    "Transportation",
    "Other",
  ];
  const match = allowed.find((item) => item.toLowerCase() === String(category).toLowerCase());
  return match || "Other";
};

const normalizeDate = (date) => {
  if (typeof date === "string") {
    const match = date.trim().match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
    if (match) {
      const [, day, month, yearPart] = match;
      const year = yearPart.length === 2 ? `20${yearPart}` : yearPart;
      const parsed = new Date(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString().slice(0, 10);
      }
    }
  }

  const parsed = date ? new Date(date) : new Date();
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }
  return parsed.toISOString().slice(0, 10);
};

const callGemini = async (contents, generationConfig = {}) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured on the backend");
  }

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${process.env.GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.2,
        ...generationConfig,
      },
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || "Gemini request failed");
  }

  return data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim() || "";
};

const parseJsonFromText = (text) => {
  const cleaned = text.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // Fall back to extracting a JSON object from verbose model output.
  }

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("Gemini did not return valid JSON");
  }
  return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
};

const normalizeTransactions = (raw) => {
  const rows = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.transactions)
      ? raw.transactions
      : Array.isArray(raw?.items)
        ? raw.items
        : [raw];

  return rows
    .map((item) => normalizeTransaction(item))
    .filter((item) => item.amount > 0);
};

export const parseReceiptController = async (req, res) => {
  try {
    const { fileBase64, mimeType = "image/jpeg" } = req.body;
    if (!fileBase64) {
      return res.status(400).json({ success: false, message: "Receipt file is required" });
    }

    const prompt = `
Extract every financial transaction row from this receipt, statement, PDF table, or bank message.
Read the full document, including all pages, and do not stop after the first row.
Ignore headings, balances, subtotals, opening/closing balance rows, and duplicate summary totals.
Return only JSON in this exact shape:
{"transactions":[{"title":"","amount":0,"description":"","category":"","date":"","transactionType":"","confidence":0}]}
category must be one of Groceries, Rent, Salary, Tip, Food, Medical, Utilities, Entertainment, Transportation, Other.
transactionType must be credit or expense.
If a document has a table, create one transaction per table row that represents actual money movement.
If the format is unusual, infer the closest valid values and explain uncertainty only in description.
`;

    const text = await callGemini([
      {
        role: "user",
        parts: [
          { text: prompt },
          { inline_data: { mime_type: mimeType, data: fileBase64 } },
        ],
      },
    ], { responseMimeType: "application/json" });

    const transactions = normalizeTransactions(parseJsonFromText(text));
    if (!transactions.length) {
      return res.status(422).json({
        success: false,
        message: "Could not find transaction rows in the uploaded document",
      });
    }

    return res.status(200).json({
      success: true,
      transaction: transactions[0],
      transactions,
      raw: text,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const summarizeTransactions = (transactions = []) => {
  const credits = transactions.filter((item) => item.transactionType === "credit");
  const expenses = transactions.filter((item) => item.transactionType === "expense");
  const income = credits.reduce((sum, item) => sum + safeNumber(item.amount), 0);
  const spending = expenses.reduce((sum, item) => sum + safeNumber(item.amount), 0);
  const categoryTotals = transactions.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + safeNumber(item.amount);
    return acc;
  }, {});

  return {
    count: transactions.length,
    income,
    spending,
    netProfit: income - spending,
    savingsRate: income ? Number((((income - spending) / income) * 100).toFixed(2)) : 0,
    categoryTotals,
  };
};

export const financeChatController = async (req, res) => {
  try {
    const { question, transactions = [], mode = "data" } = req.body;
    if (!question) {
      return res.status(400).json({ success: false, message: "Question is required" });
    }

    const modeInstructions = {
      general:
        "The selected mode is General Query. Answer only general finance, budgeting, saving, and Bachat app questions.",
      investment:
        "The selected mode is Investment Query. Answer only general investing education about SIP, gold, mutual funds, Nifty 50, stocks, Bitcoin, risk, and diversification. Do not give personalized buy/sell calls.",
      data:
        "The selected mode is My Data Query. Answer only using the user's transaction data summary, credit/debit uploads, cashflow, growth, profit, spending, and percentages.",
    };

    const policyPrompt = `
You are Bachat Finance Bot. Answer only questions about:
1. the user's uploaded transaction data, cashflow, growth, profit, spending, savings rate;
2. general educational investing concepts and risk explanations.
Do not answer unrelated requests. Do not give personalized buy/sell recommendations.
If out of scope, reply briefly: "I can only help with your Bachat data and general investing education."
Use Indian rupees when amounts are present.
${modeInstructions[mode] || modeInstructions.data}
Keep every answer short and practical:
- maximum 5 bullet points or 120 words
- no long essays
- ask one clarifying question only when needed
- for investment topics, explain risk briefly and avoid detailed product recommendations
Match the user's language. If the user asks in Hinglish/Hindi, reply in natural Hinglish/Hindi.
`;

    const summary = summarizeTransactions(transactions);
    const text = await callGemini([
      {
        role: "user",
        parts: [
          { text: policyPrompt },
          { text: `User data summary: ${JSON.stringify(summary)}` },
          { text: `Question: ${question}` },
        ],
      },
    ], { temperature: 0.3 });

    return res.status(200).json({ success: true, answer: text });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const fetchYahooGrowth = async (symbol) => {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1y&interval=1d`;
  const response = await fetch(url);
  const data = await response.json();
  const prices = data.chart?.result?.[0]?.indicators?.quote?.[0]?.close?.filter(Boolean) || [];
  const first = prices[0];
  const last = prices[prices.length - 1];
  if (!first || !last) return null;
  return Number((((last - first) / first) * 100).toFixed(2));
};
const futureValueMonthly = (monthlyAmount, annualReturnPercent, years) => {
  const monthlyRate = annualReturnPercent / 100 / 12;
  const months = years * 12;
  if (!monthlyRate) return Math.round(monthlyAmount * months);
  return Math.round(monthlyAmount * (((1 + monthlyRate) ** months - 1) / monthlyRate));
};

const clampReturn = (value, fallback) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return fallback;
  return Math.max(-30, Math.min(35, Number(value)));
};

export const investmentPlanController = async (req, res) => {
  try {
    const { transactions = [] } = req.body;
    const summary = summarizeTransactions(transactions);
    const monthlySurplus = Math.max(0, Math.round(summary.netProfit));

    const [niftyGrowth, bitcoinGrowth, goldGrowth] = await Promise.allSettled([
      fetchYahooGrowth("^NSEI"),
      fetchYahooGrowth("BTC-INR"),
      fetchYahooGrowth("GC=F"),
    ]);

    const growth = {
      gold: clampReturn(goldGrowth.status === "fulfilled" ? goldGrowth.value : null, 8),
      nifty50: clampReturn(niftyGrowth.status === "fulfilled" ? niftyGrowth.value : null, 12),
      bitcoin: clampReturn(bitcoinGrowth.status === "fulfilled" ? bitcoinGrowth.value : null, 15),
    };

    growth.mutualFunds = Number((growth.nifty50 * 0.9).toFixed(2));
    growth.commonStocks = Number((growth.nifty50 * 1.1).toFixed(2));

    const basePlans = [
      {
        key: "short",
        title: "Short Term",
        horizonYears: 1,
        objective: "Protect savings and keep liquidity high.",
        allocation: { gold: 25, mutualFunds: 35, nifty50: 20, commonStocks: 10, bitcoin: 10 },
      },
      {
        key: "medium",
        title: "Medium Term",
        horizonYears: 3,
        objective: "Balanced growth with controlled volatility.",
        allocation: { gold: 15, mutualFunds: 40, nifty50: 25, commonStocks: 12, bitcoin: 8 },
      },
      {
        key: "long",
        title: "Long Term",
        horizonYears: 10,
        objective: "Compounding-focused plan with higher equity exposure.",
        allocation: { gold: 10, mutualFunds: 35, nifty50: 35, commonStocks: 15, bitcoin: 5 },
      },
    ];

    const growthMap = {
      gold: growth.gold,
      mutualFunds: growth.mutualFunds,
      nifty50: growth.nifty50,
      commonStocks: growth.commonStocks,
      bitcoin: growth.bitcoin,
    };

    const labels = {
      gold: "Gold SIP",
      mutualFunds: "Mutual Funds",
      nifty50: "Nifty 50",
      commonStocks: "Common Stocks",
      bitcoin: "Bitcoin",
    };

    const plans = basePlans.map((plan) => {
      const assets = Object.entries(plan.allocation).map(([key, allocation]) => {
        const monthlyAmount = Math.round((monthlySurplus * allocation) / 100);
        return {
          key,
          name: labels[key],
          allocation,
          monthlyAmount,
          assumedAnnualGrowth: growthMap[key],
          projectedValue: futureValueMonthly(monthlyAmount, growthMap[key], plan.horizonYears),
        };
      });

      return {
        ...plan,
        monthlyInvestment: monthlySurplus,
        totalInvested: monthlySurplus * plan.horizonYears * 12,
        projectedValue: assets.reduce((sum, item) => sum + item.projectedValue, 0),
        assets,
      };
    });

    return res.status(200).json({
      success: true,
      generatedAt: new Date().toISOString(),
      summary,
      monthlySurplus,
      growth,
      plans,
      disclaimer: "This is an educational projection based on past one-year growth and your transaction data. It is not financial advice.",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const fetchYahooDailyMove = async (symbol) => {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=5d&interval=1d`;
  const response = await fetch(url);
  const data = await response.json();
  const result = data.chart?.result?.[0];
  const prices = result?.indicators?.quote?.[0]?.close?.filter(Boolean) || [];
  const meta = result?.meta || {};
  const last = meta.regularMarketPrice || prices[prices.length - 1];
  const previous = meta.chartPreviousClose || prices[prices.length - 2];

  if (!last || !previous) return null;

  return {
    price: Number(last.toFixed(2)),
    change: Number((last - previous).toFixed(2)),
    changePercent: Number((((last - previous) / previous) * 100).toFixed(2)),
    currency: meta.currency || "INR",
  };
};

export const marketTickerController = async (req, res) => {
  try {
    const [gold, bitcoin, nifty] = await Promise.allSettled([
      fetchYahooDailyMove("GC=F"),
      fetchYahooDailyMove("BTC-INR"),
      fetchYahooDailyMove("^NSEI"),
    ]);

    const getResult = (result) => (result.status === "fulfilled" ? result.value : null);

    return res.status(200).json({
      success: true,
      updatedAt: new Date().toISOString(),
      items: [
        {
          key: "gold",
          title: "Gold",
          subtitle: "Today move",
          ...getResult(gold),
        },
        {
          key: "bitcoin",
          title: "Bitcoin",
          subtitle: "Today move",
          ...getResult(bitcoin),
        },
        {
          key: "nifty50",
          title: "Nifty 50",
          subtitle: "Today move",
          ...getResult(nifty),
        },
        {
          key: "mutualFunds",
          title: "Mutual Funds",
          subtitle: "Nifty-linked proxy",
          ...getResult(nifty),
        },
        {
          key: "stocks",
          title: "Common Stocks",
          subtitle: "Market proxy",
          ...getResult(nifty),
        },
        {
          key: "govtCapex",
          title: "Govt Investment",
          subtitle: "FY 2026-27 capex",
          price: 12.2,
          change: 1,
          changePercent: 8.93,
          currency: "lakh crore INR",
        },
      ],
      note: "Market values are fetched from public Yahoo chart data. Government capex is the India FY 2026-27 Budget estimate.",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
export const investmentInsightsController = async (req, res) => {
  try {
    const { transactions = [], monthlyInvestment } = req.body;
    const summary = summarizeTransactions(transactions);
    const investable = Math.max(0, safeNumber(monthlyInvestment || summary.netProfit));

    const [niftyGrowth, bitcoinGrowth, goldGrowth] = await Promise.allSettled([
      fetchYahooGrowth("^NSEI"),
      fetchYahooGrowth("BTC-INR"),
      fetchYahooGrowth("GC=F"),
    ]);

    const growth = {
      gold: goldGrowth.status === "fulfilled" ? goldGrowth.value : null,
      nifty50: niftyGrowth.status === "fulfilled" ? niftyGrowth.value : null,
      bitcoin: bitcoinGrowth.status === "fulfilled" ? bitcoinGrowth.value : null,
      mutualFunds: niftyGrowth.status === "fulfilled" && niftyGrowth.value !== null ? Number((niftyGrowth.value * 0.9).toFixed(2)) : null,
      stockBasket: niftyGrowth.status === "fulfilled" && niftyGrowth.value !== null ? Number((niftyGrowth.value * 1.05).toFixed(2)) : null,
    };

    const options = [
      { key: "gold", name: "Gold SIP", allocation: 20, risk: "Low to Medium", growth: growth.gold },
      { key: "mutualFunds", name: "Diversified Mutual Funds", allocation: 35, risk: "Medium", growth: growth.mutualFunds },
      { key: "nifty50", name: "Nifty 50 Index", allocation: 25, risk: "Medium", growth: growth.nifty50 },
      { key: "stockBasket", name: "Common Stock Basket", allocation: 10, risk: "High", growth: growth.stockBasket },
      { key: "bitcoin", name: "Bitcoin", allocation: 10, risk: "Very High", growth: growth.bitcoin },
    ].map((option) => ({
      ...option,
      monthlyAmount: Math.round((investable * option.allocation) / 100),
    }));

    return res.status(200).json({
      success: true,
      summary,
      investable,
      options,
      note: "Educational allocation only. It is not personalized investment advice.",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
