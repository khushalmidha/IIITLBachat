import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Col, Form, Row, Spinner as BsSpinner } from "react-bootstrap";
import axios from "axios";
// import { financeChatAPI, parseReceiptAPI } from "../../utils/ApiRequest";
import { investmentInsightsAPI, investmentPlanAPI, parseReceiptAPI } from "../../utils/ApiRequest";

const toBase64Payload = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const [, base64] = String(reader.result).split(",");
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const SmartFinancePanel = ({ transactions, onReceiptParsed }) => {
    const [receiptLoading, setReceiptLoading] = useState(false);
    const [insightsLoading, setInsightsLoading] = useState(false);
    const [planLoading, setPlanLoading] = useState(false);
    const [insights, setInsights] = useState(null);
    const [investmentPlan, setInvestmentPlan] = useState(null);
    const [error, setError] = useState("");

    const monthlySummary = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        const getNet = (month, year) =>
            transactions
                .filter((item) => {
                    const date = new Date(item.date);
                    return date.getMonth() === month && date.getFullYear() === year;
                })
                .reduce((sum, item) => {
                    const amount = Number(item.amount || 0);
                    return item.transactionType === "credit" ? sum + amount : sum - amount;
                }, 0);

        const currentNet = getNet(currentMonth, currentYear);
        const previousNet = getNet(previousMonth, previousYear);
        const growth = previousNet
            ? Number((((currentNet - previousNet) / Math.abs(previousNet)) * 100).toFixed(2))
            : 0;

        return { currentNet, previousNet, growth };
    }, [transactions]);

    const fetchInsights = useCallback(async () => {
        setError("");
        setInsightsLoading(true);
        try {
            const { data } = await axios.post(investmentInsightsAPI, {
                transactions,
                monthlyInvestment: monthlySummary.currentNet,
            });
            setInsights(data);
        } catch (err) {
            setError(err.response?.data?.message || "Could not fetch investment options");
        } finally {
            setInsightsLoading(false);
        }
    }, [monthlySummary.currentNet, transactions]);

    useEffect(() => {
        if (transactions.length) {
            fetchInsights();
        }
    }, [fetchInsights, transactions.length]);

    const handleReceiptUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setError("");
        setReceiptLoading(true);
        try {
            const fileBase64 = await toBase64Payload(file);
            const { data } = await axios.post(parseReceiptAPI, {
                fileBase64,
                mimeType: file.type || "image/jpeg",
            });

            onReceiptParsed(data.transaction);
        } catch (err) {
            setError(err.response?.data?.message || "Could not read the receipt");
        } finally {
            event.target.value = "";
            setReceiptLoading(false);

        }
    };
    const generateInvestmentPlan = async () => {
        setError("");
        setPlanLoading(true);
        try {
            const { data } = await axios.post(investmentPlanAPI, { transactions });
            setInvestmentPlan(data);
        } catch (err) {
            setError(err.response?.data?.message || "Could not generate investment plan");
        } finally {
            setPlanLoading(false);
        }
    };

    const downloadInvestmentPlan = () => {
        if (!investmentPlan) return;

        const lines = [
            "Bachat Investment Plan",
            `Generated: ${new Date(investmentPlan.generatedAt).toLocaleString()}`,
            `Monthly surplus from your data: ${formatCurrency(investmentPlan.monthlySurplus)}`,
            `Savings rate: ${investmentPlan.summary?.savingsRate || 0}%`,
            "",
            "One year growth used:",
            `Gold: ${investmentPlan.growth.gold}%`,
            `Mutual Funds: ${investmentPlan.growth.mutualFunds}%`,
            `Nifty 50: ${investmentPlan.growth.nifty50}%`,
            `Common Stocks: ${investmentPlan.growth.commonStocks}%`,
            `Bitcoin: ${investmentPlan.growth.bitcoin}%`,
            "",
            ...investmentPlan.plans.flatMap((plan) => [
                `${plan.title} (${plan.horizonYears} year${plan.horizonYears > 1 ? "s" : ""})`,
                plan.objective,
                `Monthly investment: ${formatCurrency(plan.monthlyInvestment)}`,
                `Total invested: ${formatCurrency(plan.totalInvested)}`,
                `Projected value: ${formatCurrency(plan.projectedValue)}`,
                ...plan.assets.map(
                    (asset) =>
                        `- ${asset.name}: ${asset.allocation}% | ${formatCurrency(asset.monthlyAmount)}/month | growth ${asset.assumedAnnualGrowth}% | projected ${formatCurrency(asset.projectedValue)}`
                ),
                "",
            ]),
            investmentPlan.disclaimer,
        ];

        const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `bachat-investment-plan-${new Date().toISOString().slice(0, 10)}.txt`;
        anchor.click();
        URL.revokeObjectURL(url);
    };
    return (
        <div className="smartFinancePanel">
            {error && <Alert variant="warning">{error}</Alert>}

            <Row className="g-3">
                <Col lg={4}>
                    <Card className="smartCard h-100">
                        <Card.Body>
                            <Card.Title>Receipt Autofill</Card.Title>
                            <Card.Text>
                                Upload a credit/debit receipt and Gemini will map it into the app fields.
                            </Card.Text>
                            <Form.Group controlId="receiptUpload">
                                <Form.Control
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={handleReceiptUpload}
                                    disabled={receiptLoading}
                                />
                            </Form.Group>
                            {receiptLoading && (
                                <div className="smartLoading">
                                    <BsSpinner size="sm" /> Reading receipt...
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={8}>
                    <Card className="smartCard h-100">
                        <Card.Body>
                            <div className="investmentHeader">
                                <div>
                                    <Card.Title>Monthly Net Profit Plan</Card.Title>
                                    <Card.Text>
                                        Current net: {formatCurrency(monthlySummary.currentNet)} | Growth: {monthlySummary.growth}%
                                    </Card.Text>
                                </div>
                                <Button size="sm" onClick={fetchInsights} disabled={insightsLoading}>
                                    {insightsLoading ? "Fetching..." : "Refresh Growth"}
                                </Button>
                            </div>

                            <div className="investmentGrid">
                                {(insights?.options || []).map((option) => (
                                    <div className="investmentOption" key={option.key}>
                                        <span>{option.name}</span>
                                        <strong>{formatCurrency(option.monthlyAmount)}</strong>
                                        <small>
                                            {option.allocation}% | {option.risk} | 1Y growth:{" "}
                                            {option.growth === null || option.growth === undefined ? "N/A" : `${option.growth}%`}
                                        </small>
                                    </div>
                                ))}
                            </div>
                            <small className="text-muted">
                                Educational allocation only, not personalized investment advice.
                            </small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Card className="smartCard mt-3">
                <Card.Body>
                    <div className="investmentHeader">
                        <div>
                            <Card.Title>Personal Investment Plan</Card.Title>
                            <Card.Text>
                                Generate 1 year, 3 year, and 10 year plans from your current data and recent 1 year market growth.
                            </Card.Text>
                        </div>
                        <div className="planActions">
                            <Button onClick={generateInvestmentPlan} disabled={planLoading}>
                                {planLoading ? "Generating..." : "Generate Plan"}
                            </Button>
                            <Button variant="outline-dark" onClick={downloadInvestmentPlan} disabled={!investmentPlan}>
                                Download
                            </Button>
                        </div>
                    </div>

                    {investmentPlan && (
                        <>
                            <div className="growthStrip">
                                <span>Gold {investmentPlan.growth.gold}%</span>
                                <span>Mutual Funds {investmentPlan.growth.mutualFunds}%</span>
                                <span>Nifty 50 {investmentPlan.growth.nifty50}%</span>
                                <span>Stocks {investmentPlan.growth.commonStocks}%</span>
                                <span>Bitcoin {investmentPlan.growth.bitcoin}%</span>
                            </div>

                            <div className="planGrid">
                                {investmentPlan.plans.map((plan) => (
                                    <div className="planCard" key={plan.key}>
                                        <div>
                                            <span className="planLabel">{plan.title}</span>
                                            <h3>{plan.horizonYears} Year Plan</h3>
                                            <p>{plan.objective}</p>
                                        </div>
                                        <div className="planNumbers">
                                            <strong>{formatCurrency(plan.projectedValue)}</strong>
                                            <small>
                                                {formatCurrency(plan.monthlyInvestment)}/month | invested {formatCurrency(plan.totalInvested)}
                                            </small>
                                        </div>
                                        <div className="assetRows">
                                            {plan.assets.map((asset) => (
                                                <div className="assetRow" key={asset.key}>
                                                    <span>{asset.name}</span>
                                                    <b>{asset.allocation}%</b>
                                                    <small>{formatCurrency(asset.monthlyAmount)}</small>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <small className="text-muted">{investmentPlan.disclaimer}</small>
                        </>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default SmartFinancePanel;
