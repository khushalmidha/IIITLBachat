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
      <Modal.Header closeButton style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0" }}>
        <Modal.Title style={{ color: "#111827", fontSize: 16 }}>🚩 Budget Exception</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ background: "#f8fafc" }}>
        {/* Transaction Info */}
        <div
          style={{
            padding: 14,
            borderRadius: 10,
            background: "#fee2e2",
            border: "1px solid #fecaca",
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <strong style={{ color: "#111827" }}>{txn?.title || "Transaction"}</strong>
            <Badge bg="danger">{formatCurrency(txn?.amount)}</Badge>
          </div>
          <div style={{ fontSize: 13, color: "#475569" }}>
            Category: {exception.category || txn?.category || "—"}
          </div>
          <div style={{ fontSize: 13, color: "#dc2626", fontWeight: 600, marginTop: 4 }}>
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
            <p style={{ color: "#64748b", fontSize: 13, textAlign: "center", padding: 16 }}>
              No messages yet. Add context about this expense.
            </p>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.sender === userId ? "flex-end" : "flex-start",
                  maxWidth: "80%",
                  padding: "10px 14px",
                  borderRadius: 16,
                  borderTopLeftRadius: msg.sender === userId ? 16 : 4,
                  borderTopRightRadius: msg.sender === userId ? 4 : 16,
                  background: msg.sender === userId
                    ? "linear-gradient(135deg, #6C47FF, #8B6BFF)"
                    : "#ffffff",
                  border: msg.sender === userId ? "none" : "1px solid #e2e8f0",
                  color: msg.sender === userId ? "#ffffff" : "#1e293b",
                  fontSize: 13,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
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
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {!isAcknowledged && (
          <div style={{ padding: 16, background: "#ffffff", borderTop: "1px solid #e2e8f0", display: "flex", gap: 12, alignItems: "center" }}>
            <Form.Control
              type="text"
              placeholder="Type your message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              style={{ 
                background: "#f8fafc", 
                border: "1px solid #e2e8f0", 
                color: "#111827",
                borderRadius: 20
              }}
            />
            <Button
              onClick={handleSend}
              disabled={sending || !text.trim()}
              style={{ 
                background: "linear-gradient(135deg, #6C47FF, #8B6BFF)", 
                border: "none",
                borderRadius: 20,
                padding: "8px 20px"
              }}
            >
              Send
            </Button>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer style={{ background: "#ffffff", borderTop: "1px solid #e2e8f0", justifyContent: "space-between" }}>
        <div style={{ color: "#64748b", fontSize: 13 }}>
          {isAcknowledged ? "✅ Exception Acknowledged" : "⚠️ Needs Acknowledgement"}
        </div>
        <div>
          <Button variant="secondary" onClick={onClose} style={{ marginRight: 10 }}>
            Close
          </Button>
          {!isAcknowledged && (
            <Button variant="success" onClick={handleAcknowledge}>
              Acknowledge Override
            </Button>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ExceptionConversation;
