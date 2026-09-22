import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Tab, Nav, Badge, Spinner as BsSpinner } from "react-bootstrap";
import axios from "axios";
import { createWalletAPI, generateInviteAPI, joinWalletAPI, getMyWalletsAPI } from "../utils/ApiRequest";

const FamilyModeModal = ({ show, onHide, user }) => {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [walletName, setWalletName] = useState("");
  const [inviteToken, setInviteToken] = useState("");
  const [generatedToken, setGeneratedToken] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchWallets = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const { data } = await axios.post(getMyWalletsAPI, { userId: user._id });
      setWallets(data.wallets || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show) fetchWallets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const handleCreate = async () => {
    if (!walletName.trim()) {
      setError("Please enter a wallet name");
      return;
    }
    setError("");
    setMessage("");
    try {
      const { data } = await axios.post(createWalletAPI, { userId: user._id, name: walletName });
      if (data.success) {
        setMessage("Wallet created! 🎉");
        setWalletName("");
        fetchWallets();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create wallet");
    }
  };

  const handleJoin = async () => {
    if (!inviteToken.trim()) {
      setError("Please enter an invite token");
      return;
    }
    setError("");
    setMessage("");
    try {
      const { data } = await axios.post(`${joinWalletAPI}/${inviteToken}`, { userId: user._id });
      if (data.success) {
        setMessage("Successfully joined wallet! 🎉");
        setInviteToken("");
        fetchWallets();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to join wallet");
    }
  };

  const handleGenerateInvite = async (walletId) => {
    setError("");
    setGeneratedToken("");
    try {
      const { data } = await axios.post(generateInviteAPI, { userId: user._id, walletId });
      if (data.success) {
        setGeneratedToken(data.token);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate invite");
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(generatedToken);
    setMessage("Token copied to clipboard!");
    setTimeout(() => setMessage(""), 2000);
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton style={{ background: "#111827", borderBottom: "1px solid rgba(108,71,255,0.2)" }}>
        <Modal.Title style={{ color: "#fff" }}>👨‍👧 Family Mode</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ background: "#0d0f17", minHeight: 300 }}>
        {error && (
          <div style={{ color: "#FF6B6B", background: "rgba(255,59,48,0.1)", padding: "8px 14px", borderRadius: 8, marginBottom: 14, fontSize: 13 }}>
            {error}
          </div>
        )}
        {message && (
          <div style={{ color: "#00CC66", background: "rgba(0,204,102,0.1)", padding: "8px 14px", borderRadius: 8, marginBottom: 14, fontSize: 13 }}>
            {message}
          </div>
        )}

        <Tab.Container defaultActiveKey="wallets">
          <Nav variant="pills" style={{ marginBottom: 20, gap: 8 }}>
            <Nav.Item>
              <Nav.Link eventKey="wallets" style={{ color: "#e2e8f0", fontSize: 13 }}>
                My Wallets {wallets.length > 0 && <Badge bg="primary">{wallets.length}</Badge>}
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="create" style={{ color: "#e2e8f0", fontSize: 13 }}>
                Create Wallet
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="join" style={{ color: "#e2e8f0", fontSize: 13 }}>
                Join Wallet
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content>
            {/* My Wallets Tab */}
            <Tab.Pane eventKey="wallets">
              {loading ? (
                <div style={{ textAlign: "center", padding: 24 }}>
                  <BsSpinner size="sm" /> Loading wallets...
                </div>
              ) : wallets.length === 0 ? (
                <div style={{ textAlign: "center", padding: 32, color: "#94a3b8" }}>
                  <p style={{ fontSize: 32, marginBottom: 8 }}>🏠</p>
                  <p>No shared wallets yet. Create one or join with an invite token.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {wallets.map((w) => {
                    const isOwner = w.owner?._id === user._id;
                    return (
                      <div
                        key={w._id}
                        style={{
                          padding: 16,
                          borderRadius: 12,
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(108,71,255,0.2)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <strong style={{ color: "#fff", fontSize: 16 }}>{w.name}</strong>
                          <Badge bg={isOwner ? "primary" : "secondary"}>
                            {isOwner ? "Owner" : "Supporter"}
                          </Badge>
                        </div>
                        <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#94a3b8", marginBottom: 10 }}>
                          <span>👤 Owner: {w.owner?.name || "—"}</span>
                          <span>🤝 Supporter: {w.supporter?.name || "Not joined yet"}</span>
                        </div>
                        {isOwner && !w.supporter && (
                          <Button
                            size="sm"
                            variant="outline-light"
                            onClick={() => handleGenerateInvite(w._id)}
                            style={{ borderColor: "rgba(108,71,255,0.4)", fontSize: 12 }}
                          >
                            Generate Invite Link
                          </Button>
                        )}
                      </div>
                    );
                  })}
                  {generatedToken && (
                    <div style={{ padding: 14, borderRadius: 10, background: "rgba(108,71,255,0.08)", border: "1px solid rgba(108,71,255,0.25)" }}>
                      <div style={{ color: "#cbd5e1", fontSize: 12, marginBottom: 6 }}>Share this token (valid 24h):</div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <code style={{ color: "#8B6BFF", fontSize: 13, flex: 1, wordBreak: "break-all" }}>
                          {generatedToken}
                        </code>
                        <Button size="sm" variant="outline-light" onClick={copyToken} style={{ fontSize: 11 }}>
                          📋 Copy
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Tab.Pane>

            {/* Create Wallet Tab */}
            <Tab.Pane eventKey="create">
              <div style={{ maxWidth: 400 }}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: "#cbd5e1", fontSize: 13 }}>Wallet Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder='e.g., "Family Budget" or "Roommates"'
                    value={walletName}
                    onChange={(e) => setWalletName(e.target.value)}
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0" }}
                  />
                </Form.Group>
                <Button
                  onClick={handleCreate}
                  style={{ background: "linear-gradient(135deg, #6C47FF, #8B6BFF)", border: "none" }}
                >
                  Create Wallet
                </Button>
              </div>
            </Tab.Pane>

            {/* Join Wallet Tab */}
            <Tab.Pane eventKey="join">
              <div style={{ maxWidth: 400 }}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: "#cbd5e1", fontSize: 13 }}>Invite Token</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Paste the invite token here"
                    value={inviteToken}
                    onChange={(e) => setInviteToken(e.target.value)}
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0" }}
                  />
                </Form.Group>
                <Button
                  onClick={handleJoin}
                  style={{ background: "linear-gradient(135deg, #6C47FF, #8B6BFF)", border: "none" }}
                >
                  Join Wallet
                </Button>
              </div>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Modal.Body>
    </Modal>
  );
};

export default FamilyModeModal;
