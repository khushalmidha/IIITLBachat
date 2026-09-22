import React, { useState } from "react";
import { Modal, Button, Table, Form, Badge } from "react-bootstrap";

const CATEGORIES = [
  "Groceries", "Rent", "Salary", "Tip", "Food",
  "Medical", "Utilities", "Entertainment", "Transportation", "Other",
];

const confidenceColor = (c) => {
  if (c >= 0.8) return "success";
  if (c >= 0.5) return "warning";
  return "danger";
};

const confidenceLabel = (c) => {
  if (c >= 0.8) return "High";
  if (c >= 0.5) return "Medium";
  return "Low";
};

const ReceiptReviewModal = ({ transactions = [], onConfirm, onCancel }) => {
  const [rows, setRows] = useState(
    transactions.map((t, i) => ({
      ...t,
      checked: (t.confidence || 0.7) >= 0.6,
      id: i,
    }))
  );

  const updateRow = (id, field, value) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const toggleRow = (id) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, checked: !r.checked } : r))
    );
  };

  const toggleAll = () => {
    const allChecked = rows.every((r) => r.checked);
    setRows((prev) => prev.map((r) => ({ ...r, checked: !allChecked })));
  };

  const checkedCount = rows.filter((r) => r.checked).length;

  const handleConfirm = () => {
    const selected = rows
      .filter((r) => r.checked)
      .map(({ checked, id, ...rest }) => rest);
    onConfirm(selected);
  };

  return (
    <Modal show onHide={onCancel} size="lg" centered dialogClassName="receipt-review-modal">
      <Modal.Header closeButton style={{ background: "#111827", borderBottom: "1px solid rgba(108,71,255,0.2)" }}>
        <Modal.Title style={{ color: "#fff", fontSize: 18 }}>
          📄 Review Parsed Transactions
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ background: "#0d0f17", maxHeight: "60vh", overflowY: "auto" }}>
        {rows.length === 0 ? (
          <p style={{ color: "#94a3b8", textAlign: "center", padding: 24 }}>
            No transactions were found in this receipt.
          </p>
        ) : (
          <Table responsive hover size="sm" style={{ color: "#e2e8f0" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(108,71,255,0.2)" }}>
                <th style={{ width: 40 }}>
                  <Form.Check
                    type="checkbox"
                    checked={rows.every((r) => r.checked)}
                    onChange={toggleAll}
                  />
                </th>
                <th>Title</th>
                <th style={{ width: 110 }}>Amount</th>
                <th style={{ width: 140 }}>Category</th>
                <th style={{ width: 100 }}>Type</th>
                <th style={{ width: 110 }}>Date</th>
                <th style={{ width: 90 }}>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  style={{
                    opacity: row.checked ? 1 : 0.45,
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    transition: "opacity 0.2s",
                  }}
                >
                  <td>
                    <Form.Check
                      type="checkbox"
                      checked={row.checked}
                      onChange={() => toggleRow(row.id)}
                    />
                  </td>
                  <td>
                    <Form.Control
                      size="sm"
                      type="text"
                      value={row.title || ""}
                      onChange={(e) => updateRow(row.id, "title", e.target.value)}
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0" }}
                    />
                  </td>
                  <td>
                    <Form.Control
                      size="sm"
                      type="number"
                      value={row.amount || ""}
                      onChange={(e) => updateRow(row.id, "amount", Number(e.target.value))}
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0" }}
                    />
                  </td>
                  <td>
                    <Form.Select
                      size="sm"
                      value={row.category || "Other"}
                      onChange={(e) => updateRow(row.id, "category", e.target.value)}
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0" }}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </Form.Select>
                  </td>
                  <td>
                    <Form.Select
                      size="sm"
                      value={row.transactionType || "expense"}
                      onChange={(e) => updateRow(row.id, "transactionType", e.target.value)}
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0" }}
                    >
                      <option value="expense">Expense</option>
                      <option value="credit">Credit</option>
                    </Form.Select>
                  </td>
                  <td>
                    <Form.Control
                      size="sm"
                      type="date"
                      value={row.date || ""}
                      onChange={(e) => updateRow(row.id, "date", e.target.value)}
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0" }}
                    />
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <Badge bg={confidenceColor(row.confidence || 0)}>
                      {confidenceLabel(row.confidence || 0)}
                    </Badge>
                    {(row.confidence || 0) < 0.6 && (
                      <span title="Low confidence — review carefully" style={{ marginLeft: 4 }}>⚠️</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Modal.Body>
      <Modal.Footer style={{ background: "#111827", borderTop: "1px solid rgba(108,71,255,0.2)" }}>
        <span style={{ flex: 1, color: "#94a3b8", fontSize: 13 }}>
          {checkedCount} of {rows.length} transactions selected
        </span>
        <Button variant="outline-light" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleConfirm}
          disabled={checkedCount === 0}
          style={{ background: "linear-gradient(135deg, #6C47FF, #8B6BFF)", border: "none" }}
        >
          Confirm & Save {checkedCount} transaction{checkedCount !== 1 ? "s" : ""}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ReceiptReviewModal;
