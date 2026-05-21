import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import HomeIcon from "@mui/icons-material/Home";
import axios from "axios";
import { financeChatAPI } from "../../utils/ApiRequest";

const chatModes = [
  {
    key: "general",
    label: "Ask General Query",
    intro: "General finance, saving, budgeting, and Bachat app questions.",
  },
  {
    key: "investment",
    label: "Ask Investment Query",
    intro: "Gold, SIP, mutual funds, Nifty 50, stocks, Bitcoin, and risk basics.",
  },
  {
    key: "data",
    label: "Ask My Data Query",
    intro: "Credit/debit uploads, spending, profit, growth, and transaction percentages.",
  },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const buildCards = (mode, transactions = []) => {
  const income = transactions
    .filter((item) => item.transactionType === "credit")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const expense = transactions
    .filter((item) => item.transactionType === "expense")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const net = income - expense;
  const savingsRate = income ? Math.round((net / income) * 100) : 0;

  if (mode === "investment") {
    const investable = Math.max(0, net);
    return [
      { title: "Gold SIP", subtitle: "Lower volatility hedge", value: formatCurrency(investable * 0.2) },
      { title: "Nifty 50", subtitle: "Index-style growth", value: formatCurrency(investable * 0.3) },
      { title: "Mutual Fund", subtitle: "Diversified SIP", value: formatCurrency(investable * 0.4) },
    ];
  }

  if (mode === "data") {
    return [
      { title: "Income", subtitle: "Total credits", value: formatCurrency(income) },
      { title: "Expense", subtitle: "Total debits", value: formatCurrency(expense) },
      { title: "Net Profit", subtitle: `${savingsRate}% savings rate`, value: formatCurrency(net) },
    ];
  }

  return [
    { title: "Budget", subtitle: "Track fixed and variable costs", value: "50/30/20" },
    { title: "Emergency", subtitle: "Keep liquid savings", value: "3-6 mo" },
    { title: "SIP", subtitle: "Automate monthly investing", value: "Monthly" },
  ];
};

const getCategoryFromQuestion = (question = "") => {
  const normalized = question.toLowerCase();
  const categories = [
    ["groceries", ["groceries", "grocery", "gross", "grosseries"]],
    ["food", ["food", "restaurant", "snacks", "canteen"]],
    ["rent", ["rent"]],
    ["housing", ["housing", "house", "room"]],
    ["utilities", ["electricity", "utility", "utilities", "bill"]],
    ["transportation", ["transport", "uber", "ola", "bus", "train", "petrol"]],
    ["medical", ["medical", "doctor", "medicine", "health"]],
    ["entertainment", ["entertainment", "movie", "netflix"]],
    ["general expenses", ["general", "monthly expense"]],
  ];

  return categories.find(([, aliases]) => aliases.some((alias) => normalized.includes(alias)))?.[0];
};

const buildDataCards = (question, transactions = []) => {
  const expenses = transactions.filter((item) => item.transactionType === "expense");
  const totalExpense = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const categoryTotals = expenses.reduce((acc, item) => {
    const key = String(item.category || "Other").toLowerCase();
    acc[key] = (acc[key] || 0) + Number(item.amount || 0);
    return acc;
  }, {});
  const requestedCategory = getCategoryFromQuestion(question);
  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const cards = [
    {
      title: "Total Expense",
      subtitle: "All debit spending",
      value: formatCurrency(totalExpense),
    },
  ];

  if (requestedCategory) {
    const matchingItems = expenses
      .filter((item) => String(item.category || "").toLowerCase() === requestedCategory)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    cards.unshift({
      title: titleCase(requestedCategory),
      subtitle: "Requested category",
      value: formatCurrency(categoryTotals[requestedCategory] || 0),
    });

    matchingItems.slice(0, 6).forEach((item) => {
      cards.push({
        title: item.title || titleCase(requestedCategory),
        subtitle: `${new Date(item.date).toLocaleDateString("en-IN")} • ${titleCase(requestedCategory)}`,
        value: formatCurrency(item.amount),
      });
    });
  }

  sortedCategories
    .filter(([category]) => category !== requestedCategory)
    .slice(0, requestedCategory ? 2 : 4)
    .forEach(([category, amount]) => {
      cards.push({
        title: titleCase(category),
        subtitle: "Other expense",
        value: formatCurrency(amount),
      });
    });

  return cards;
};

const titleCase = (value = "") =>
  value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const FinanceChatWidget = ({ transactions }) => {
  const [open, setOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const askQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userQuestion = question.trim();
    setMessages((items) => [...items, { role: "user", text: userQuestion }]);
    setQuestion("");
    setLoading(true);

    try {
      const { data } = await axios.post(financeChatAPI, {
        question: userQuestion,
        transactions,
        mode: selectedMode?.key || "data",
      });
      setMessages((items) => [
        ...items,
        {
          role: "bot",
          text: data.answer,
          cards:
            (selectedMode?.key || "data") === "data"
              ? buildDataCards(userQuestion, transactions)
              : buildCards(selectedMode?.key || "data", transactions),
        },
      ]);
    } catch (err) {
      setMessages((items) => [
        ...items,
        {
          role: "bot",
          text: err.response?.data?.message || "Chatbot is unavailable right now.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const chooseMode = (mode) => {
    setSelectedMode(mode);
    setMessages([{ role: "bot", text: `${mode.intro} Ask me your question.` }]);
  };

  const resetChat = () => {
    setSelectedMode(null);
    setQuestion("");
    setMessages([]);
  };

  return (
    <div className="financeChatWidget">
      {open && (
        <div className="floatingChatPanel">
          <div className="floatingChatHeader">
            <div>
              <strong>Bachat Assistant</strong>
              <span>{selectedMode ? selectedMode.label : "How can I help you today?"}</span>
            </div>
            <div className="chatHeaderActions">
              <button type="button" onClick={resetChat} aria-label="Back to options">
                <HomeIcon fontSize="small" />
              </button>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close chat">
                <CloseIcon fontSize="small" />
              </button>
            </div>
          </div>

          <div className="floatingChatBody">
            {!selectedMode && (
              <>
                <div className="assistantGreeting">
                  Hello! I'm your Bachat AI assistant. How can I help you today?
                </div>
                <div className="chatModeGrid">
                  {chatModes.map((mode) => (
                    <button type="button" key={mode.key} onClick={() => chooseMode(mode)}>
                      {mode.label}
                    </button>
                  ))}
                </div>
              </>
            )}
            {messages.map((message, index) => (
              <React.Fragment key={`${message.role}-${index}`}>
                <div className={`chatBubble ${message.role}`}>
                  {message.text}
                </div>
                {message.cards?.length > 0 && (
                  <div className="botCardScroller">
                    {message.cards.map((card) => (
                      <div className="botSuggestionCard" key={card.title}>
                        <span className="botCardIcon">{card.title.slice(0, 1)}</span>
                        <strong>{card.title}</strong>
                        <small>{card.subtitle}</small>
                        <b>{card.value}</b>
                      </div>
                    ))}
                  </div>
                )}
              </React.Fragment>
            ))}
            {loading && <div className="chatBubble bot">Thinking...</div>}
          </div>

          <Form onSubmit={askQuestion} className="floatingChatForm">
            <Form.Control
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={selectedMode ? "Type your message..." : "Choose an option first..."}
              disabled={!selectedMode}
            />
            <Button type="submit" disabled={loading || !selectedMode} aria-label="Send question">
              <SendIcon fontSize="small" />
            </Button>
          </Form>
        </div>
      )}

      <button
        type="button"
        className="roundChatButton"
        onClick={() => setOpen((value) => !value)}
        aria-label="Open finance chatbot"
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </button>
    </div>
  );
};

export default FinanceChatWidget;
