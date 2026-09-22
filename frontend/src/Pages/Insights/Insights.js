import React, { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import "./insights.css";
import { getTransactions } from "../../utils/ApiRequest";
import axios from "axios";
import Spinner from "../../components/Spinner";
import moment from "moment";

/* ── Stub Insights page — will be fully built in Phase 7 ── */
const Insights = () => {
  const navigate = useNavigate();
  const [cUser, setcUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (localStorage.getItem("user")) {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user.isAvatarImageSet || !user.avatarImage) {
        return navigate("/setAvatar");
      }
      setcUser(user);
    } else {
      return navigate("/login");
    }
  }, [navigate]);

  // Fetch all transactions
  useEffect(() => {
    if (!cUser?._id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await axios.post(getTransactions, {
          userId: cUser._id,
          frequency: "custom",
          type: "all",
        });
        setTransactions(data.transactions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [cUser?._id]);

  // Compute monthly data for last 6 months
  const monthlyData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const m = moment().subtract(i, "months");
      const key = m.format("YYYY-MM");
      const label = m.format("MMM YYYY");
      const monthTxns = transactions.filter(
        (t) => moment(t.date).format("YYYY-MM") === key
      );
      const income = monthTxns
        .filter((t) => t.transactionType === "credit")
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);
      const expense = monthTxns
        .filter((t) => t.transactionType === "expense")
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);
      months.push({ key, label, income, expense, net: income - expense, txns: monthTxns });
    }
    return months;
  }, [transactions]);

  // Categories for heatmap
  const categories = ["Groceries", "Food", "Rent", "Transportation", "Entertainment", "Medical", "Utilities", "Other"];

  // Category heatmap data
  const heatmapData = useMemo(() => {
    return categories.map((cat) => {
      const values = monthlyData.map((m) => {
        return m.txns
          .filter((t) => t.category === cat && t.transactionType === "expense")
          .reduce((sum, t) => sum + Number(t.amount || 0), 0);
      });
      return { category: cat, values };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthlyData]);

  const maxHeatVal = useMemo(() => {
    let max = 0;
    heatmapData.forEach((row) => row.values.forEach((v) => { if (v > max) max = v; }));
    return max || 1;
  }, [heatmapData]);

  // Weekly archive
  const weeklyData = useMemo(() => {
    const weeks = [];
    for (let i = 0; i < 6; i++) {
      const weekStart = moment().startOf("isoWeek").subtract(i, "weeks");
      const weekEnd = moment(weekStart).endOf("isoWeek");
      const weekTxns = transactions.filter((t) => {
        const d = moment(t.date);
        return d.isSameOrAfter(weekStart, "day") && d.isSameOrBefore(weekEnd, "day");
      });
      const income = weekTxns.filter((t) => t.transactionType === "credit").reduce((s, t) => s + Number(t.amount || 0), 0);
      const expense = weekTxns.filter((t) => t.transactionType === "expense").reduce((s, t) => s + Number(t.amount || 0), 0);
      
      // Find top category
      const catTotals = {};
      weekTxns.filter((t) => t.transactionType === "expense").forEach((t) => {
        catTotals[t.category] = (catTotals[t.category] || 0) + Number(t.amount || 0);
      });
      const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];

      weeks.push({
        label: `${weekStart.format("DD MMM")} – ${weekEnd.format("DD MMM YYYY")}`,
        income,
        expense,
        net: income - expense,
        topCategory: topCat ? topCat[0] : "—",
        isCurrent: i === 0,
      });
    }
    return weeks;
  }, [transactions]);

  // Find best and worst months
  const bestMonth = useMemo(() => {
    return monthlyData.reduce((best, m) => (m.net > best.net ? m : best), monthlyData[0] || { net: 0 });
  }, [monthlyData]);

  const worstMonth = useMemo(() => {
    return monthlyData.reduce((worst, m) => (m.net < worst.net ? m : worst), monthlyData[0] || { net: 0 });
  }, [monthlyData]);

  const formatCurrency = (v) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v || 0);

  return (
    <>
      <Header />
      {loading ? (
        <Spinner />
      ) : (
        <Container className="mt-3 insights-container">
          <h2 className="insights-title">📊 Insights</h2>
          <p className="insights-subtitle">Your financial story, at a glance.</p>

          {/* ── Section A: Monthly Overview ── */}
          <section className="insights-section">
            <h3 className="insights-section-title">Monthly Overview</h3>
            <div className="insights-stats-row">
              {monthlyData.map((m) => (
                <div className="insights-month-card" key={m.key}>
                  <span className="insights-month-label">{m.label}</span>
                  <div className="insights-month-bar-container">
                    <div
                      className="insights-month-bar income"
                      style={{ height: `${Math.min(100, (m.income / (Math.max(m.income, m.expense) || 1)) * 100)}%` }}
                    />
                    <div
                      className="insights-month-bar expense"
                      style={{ height: `${Math.min(100, (m.expense / (Math.max(m.income, m.expense) || 1)) * 100)}%` }}
                    />
                  </div>
                  <span className={`insights-month-net ${m.net >= 0 ? "positive" : "negative"}`}>
                    {formatCurrency(m.net)}
                  </span>
                </div>
              ))}
            </div>
            <div className="insights-callout-row">
              <div className="insights-callout best">
                <span>🏆 Best Month</span>
                <strong>{bestMonth?.label}</strong>
                <span className="positive">{formatCurrency(bestMonth?.net)}</span>
              </div>
              <div className="insights-callout worst">
                <span>📉 Worst Month</span>
                <strong>{worstMonth?.label}</strong>
                <span className="negative">{formatCurrency(worstMonth?.net)}</span>
              </div>
            </div>
          </section>

          {/* ── Section B: Category Heatmap ── */}
          <section className="insights-section">
            <h3 className="insights-section-title">Category Heatmap</h3>
            <div className="heatmap-grid">
              <div className="heatmap-header-row">
                <div className="heatmap-label" />
                {monthlyData.map((m) => (
                  <div className="heatmap-col-label" key={m.key}>{m.label.split(" ")[0]}</div>
                ))}
              </div>
              {heatmapData.map((row) => (
                <div className="heatmap-row" key={row.category}>
                  <div className="heatmap-label">{row.category}</div>
                  {row.values.map((val, ci) => (
                    <div
                      key={ci}
                      className="heatmap-cell"
                      style={{
                        background: val
                          ? `rgba(108, 71, 255, ${Math.max(0.08, (val / maxHeatVal) * 0.9)})`
                          : "rgba(255,255,255,0.03)",
                      }}
                      title={`${row.category} · ${monthlyData[ci]?.label}: ${formatCurrency(val)}`}
                    >
                      {val > 0 ? formatCurrency(val) : "—"}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>

          {/* ── Section C: Weekly Archive ── */}
          <section className="insights-section">
            <h3 className="insights-section-title">Weekly Archive</h3>
            <div className="weekly-archive">
              {weeklyData.map((w, i) => (
                <details key={i} open={w.isCurrent} className="weekly-card">
                  <summary>
                    <span>{w.isCurrent ? "📍 " : ""}{w.label}</span>
                    <span className={w.net >= 0 ? "positive" : "negative"}>
                      Net: {formatCurrency(w.net)}
                    </span>
                  </summary>
                  <div className="weekly-details">
                    <span>💰 Income: {formatCurrency(w.income)}</span>
                    <span>💸 Expenses: {formatCurrency(w.expense)}</span>
                    <span>📂 Top category: {w.topCategory}</span>
                  </div>
                </details>
              ))}
            </div>
          </section>
        </Container>
      )}
    </>
  );
};

export default Insights;
