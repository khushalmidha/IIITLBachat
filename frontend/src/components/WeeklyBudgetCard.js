import React, { useEffect, useState, useCallback } from "react";
import { Button, Card, Form, Spinner as BsSpinner, ProgressBar } from "react-bootstrap";
import axios from "axios";
import { getCurrentBudgetAPI, setBudgetAPI } from "../utils/ApiRequest";

const BUDGET_CATEGORIES = [
  "Groceries", "Food", "Transportation", "Entertainment", "Medical", "Utilities", "Other",
];

const formatCurrency = (v) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v || 0);

const progressVariant = (spent, budget) => {
  if (!budget) return "secondary";
  const pct = (spent / budget) * 100;
  if (pct > 100) return "danger";
  if (pct > 80) return "warning";
  return "success";
};

const WeeklyBudgetCard = ({ userId }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [budgetData, setBudgetData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editValues, setEditValues] = useState({});

  const fetchBudget = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data } = await axios.post(getCurrentBudgetAPI, { userId });
      setBudgetData(data);
      if (data.budget?.categories) {
        setEditValues(data.budget.categories);
      }
    } catch (err) {
      console.error("Failed to fetch budget:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchBudget();
  }, [fetchBudget]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const totalBudget = Object.values(editValues).reduce((s, v) => s + (Number(v) || 0), 0);
      await axios.post(setBudgetAPI, {
        userId,
        categories: editValues,
        totalBudget,
      });
      setEditing(false);
      fetchBudget();
    } catch (err) {
      console.error("Failed to save budget:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <BsSpinner size="sm" /> Loading budget...
      </div>
    );
  }

  const hasBudget = budgetData?.budget?.totalBudget > 0;
  const spending = budgetData?.spending || {};
  const totalSpent = budgetData?.totalSpent || 0;
  const totalBudget = budgetData?.budget?.totalBudget || 0;
  const categories = budgetData?.budget?.categories || {};

  return (
    <div style={{ marginTop: 18 }}>
      <Card className="smartCard" style={{ background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <Card.Body>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <Card.Title style={{ color: "#111827", fontSize: 20 }}>📅 Weekly Budget</Card.Title>
              {budgetData?.weekStart && (
                <Card.Text style={{ color: "#475569", fontSize: 13 }}>
                  {new Date(budgetData.weekStart).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  {" — "}
                  {new Date(budgetData.weekEnd).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </Card.Text>
              )}
            </div>
            <Button
              size="sm"
              variant="outline-secondary"
              onClick={() => setEditing(!editing)}
              style={{ borderColor: "#cbd5e1", color: "#475569" }}
            >
              {editing ? "Cancel" : hasBudget ? "Edit Budget" : "Set Budget"}
            </Button>
          </div>

          {editing ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
              {BUDGET_CATEGORIES.map((cat) => (
                <Form.Group key={cat}>
                  <Form.Label style={{ color: "#475569", fontSize: 13, fontWeight: 600 }}>{cat}</Form.Label>
                  <Form.Control
                    size="sm"
                    type="number"
                    min={0}
                    value={editValues[cat] || ""}
                    onChange={(e) => setEditValues({ ...editValues, [cat]: Number(e.target.value) || 0 })}
                    placeholder="₹0"
                    style={{ background: "#ffffff", border: "1px solid #cbd5e1", color: "#111827" }}
                  />
                </Form.Group>
              ))}
              <div style={{ gridColumn: "1/-1", display: "flex", gap: 10, marginTop: 8 }}>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                  style={{ background: "linear-gradient(135deg, #6C47FF, #8B6BFF)", border: "none" }}
                >
                  {saving ? "Saving..." : "Save Budget"}
                </Button>
                <span style={{ color: "#475569", fontSize: 13, alignSelf: "center" }}>
                  Total: {formatCurrency(Object.values(editValues).reduce((s, v) => s + (Number(v) || 0), 0))}
                </span>
              </div>
            </div>
          ) : hasBudget ? (
            <>
              {/* Overall progress */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: "#111827", fontWeight: 700 }}>Total Spent</span>
                  <span style={{ color: totalSpent > totalBudget ? "#dc2626" : "#16a34a", fontWeight: 700 }}>
                    {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
                  </span>
                </div>
                <ProgressBar
                  now={Math.min(100, (totalSpent / totalBudget) * 100)}
                  variant={progressVariant(totalSpent, totalBudget)}
                  style={{ height: 10, background: "#e2e8f0" }}
                />
              </div>

              {/* Per-category progress */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
                {BUDGET_CATEGORIES.filter((cat) => categories[cat] > 0).map((cat) => {
                  const budget = categories[cat] || 0;
                  const spent = spending[cat] || 0;
                  const pct = budget ? Math.round((spent / budget) * 100) : 0;

                  return (
                    <div
                      key={cat}
                      style={{
                        padding: 12,
                        borderRadius: 10,
                        background: "#f8fafc",
                        border: `1px solid ${pct > 100 ? "#fca5a5" : "#e2e8f0"}`,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ color: "#111827", fontWeight: 600, fontSize: 13 }}>{cat}</span>
                        <span style={{ color: pct > 100 ? "#dc2626" : "#475569", fontSize: 12 }}>
                          {formatCurrency(spent)} / {formatCurrency(budget)} ({pct}%)
                        </span>
                      </div>
                      <ProgressBar
                        now={Math.min(100, pct)}
                        variant={progressVariant(spent, budget)}
                        style={{ height: 6, background: "#e2e8f0" }}
                      />
                      {pct > 100 && (
                        <div style={{ color: "#dc2626", fontSize: 11, marginTop: 4, fontWeight: 600 }}>
                          🚩 Over by {formatCurrency(spent - budget)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: 32, color: "#94a3b8" }}>
              <p style={{ fontSize: 40, marginBottom: 8 }}>📊</p>
              <p>No budget set for this week yet.</p>
              <Button
                size="sm"
                onClick={() => setEditing(true)}
                style={{ background: "linear-gradient(135deg, #6C47FF, #8B6BFF)", border: "none" }}
              >
                Set Weekly Budget
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default WeeklyBudgetCard;
