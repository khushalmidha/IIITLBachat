import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Badge } from "react-bootstrap";
import axios from "axios";

const host = process.env.REACT_APP_API_URL || "https://iiitlbachat.onrender.com";

const formatCurrency = (v) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v || 0);

const ExceptionConversation = ({ exception, userId, onClose, onAcknowledge }) => {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState(exception?.messages || []);

  useEffect(() => {
    setMessages(exception?.messages || []);
  }, [exception]);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      const { data } = await axios.post(`${host}/api/budget/exceptions/${exception._id}/message`, {
        userId,
        text: text.trim(),
      });
      if (data.success) {
        setMessages(data.exception.messages);
        setText("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleAcknowledge = async () => {
    try {
      const { data } = await axios.post(`${host}/api/budget/exceptions/${exception._id}/acknowledge`, {
        userId,
      });
      if (data.success && onAcknowledge) {
        onAcknowledge(exception._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!exception) return null;

  const txn = exception.transactionId;

  return (
    <Modal show onHide={onClose} centered>
      <Modal.Header closeButton style={{ background: "#111827", borderBottom: "1px solid rgba(255,59,48,0.2)" }}>
        <Modal.Title style={{ color: "#fff", fontSize: 16 }}>🚩 Budget Exception</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ background: "#0d0f17" }}>
        {/* Transaction Info */}
        <div
          style={{
            padding: 14,
            borderRadius: 10,
            background: "rgba(255,59,48,0.06)",
            border: "1px solid rgba(255,59,48,0.2)",
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <strong style={{ color: "#fff" }}>{txn?.title || "Transaction"}</strong>
            <Badge bg="danger">{formatCurrency(txn?.amount)}</Badge>
          </div>
          <div style={{ fontSize: 13, color: "#94a3b8" }}>
            Category: {exception.category || txn?.category || "—"}
          </div>
          <div style={{ fontSize: 13, color: "#FF6B6B", fontWeight: 600, marginTop: 4 }}>
            Over budget by {formatCurrency(exception.overAmount)}
          </div>
        </div>

        {/* Conversation Thread */}
        <div
          style={{
            maxHeight: 240,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginBottom: 14,
            padding: 4,
          }}
        >
          {messages.length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", padding: 16 }}>
              No messages yet. Add context about this expense.
            </p>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.sender === userId ? "flex-end" : "flex-start",
                  maxWidth: "80%",
                  padding: "8px 14px",
                  borderRadius: 12,
                  background: msg.sender === userId
                    ? "rgba(108,71,255,0.2)"
                    : "rgba(255,255,255,0.06)",
                  color: "#e2e8f0",
                  fontSize: 13,
                }}
              >
                <div>{msg.text}</div>
                <div style={{ fontSize: 10, color: "#64748b", marginTop: 4 }}>
                  {new Date(msg.createdAt).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Input */}
        {!exception.acknowledged && (
          <div style={{ display: "flex", gap: 8 }}>
            <Form.Control
              size="sm"
              placeholder='e.g., "Emergency medical expense"'
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#e2e8f0",
              }}
            />
            <Button
              size="sm"
              onClick={handleSend}
              disabled={sending || !text.trim()}
              style={{ background: "linear-gradient(135deg, #6C47FF, #8B6BFF)", border: "none" }}
            >
              Send
            </Button>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer style={{ background: "#111827", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        {exception.acknowledged ? (
          <Badge bg="success">✓ Acknowledged</Badge>
        ) : (
          <Button size="sm" variant="outline-success" onClick={handleAcknowledge}>
            ✓ Acknowledge
          </Button>
        )}
        <Button size="sm" variant="outline-light" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ExceptionConversation;
