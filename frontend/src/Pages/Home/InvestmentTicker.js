import React, { useEffect, useState } from "react";
import axios from "axios";
import { marketTickerAPI } from "../../utils/ApiRequest";

const fallbackItems = [
  {
    key: "gold",
    title: "Gold",
    subtitle: "Today move",
    price: null,
    changePercent: null,
    currency: "USD",
  },
  {
    key: "bitcoin",
    title: "Bitcoin",
    subtitle: "Today move",
    price: null,
    changePercent: null,
    currency: "INR",
  },
  {
    key: "nifty50",
    title: "Nifty 50",
    subtitle: "Today move",
    price: null,
    changePercent: null,
    currency: "INR",
  },
  {
    key: "mutualFunds",
    title: "Mutual Funds",
    subtitle: "Nifty-linked proxy",
    price: null,
    changePercent: null,
    currency: "INR",
  },
  {
    key: "stocks",
    title: "Common Stocks",
    subtitle: "Market proxy",
    price: null,
    changePercent: null,
    currency: "INR",
  },
  {
    key: "govtCapex",
    title: "Govt Investment",
    subtitle: "FY 2026-27 capex",
    price: 12.2,
    changePercent: 8.93,
    currency: "lakh crore INR",
  },
];

const InvestmentTicker = () => {
  const [items, setItems] = useState(fallbackItems);


  useEffect(() => {
    const fetchTicker = async () => {
      try {
        const { data } = await axios.get(marketTickerAPI);
        if (data.success && data.items?.length) {
          setItems(data.items);
        }
      } catch (err) {
        setItems(fallbackItems);
      }
    };

    fetchTicker();
    const timer = setInterval(fetchTicker, 5 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);
    const displayItems = [...items, ...items];

  const formatValue = (item) => {
    if (item.price === null || item.price === undefined) return "Updating";
    if (item.key === "govtCapex") return `₹${item.price} lakh cr`;
    if (item.currency === "INR") return `₹${Number(item.price).toLocaleString("en-IN")}`;
    return `${item.currency || ""} ${Number(item.price).toLocaleString("en-IN")}`;
  };

  const formatChange = (item) => {
    if (item.changePercent === null || item.changePercent === undefined) return "Live data";
    const sign = item.changePercent >= 0 ? "+" : "";
    return `${sign}${item.changePercent}%`;
  };

  return (
    <div className="investmentTicker" aria-label="Investment highlights">
      <div className="tickerTrack">
        {displayItems.map((item, index) => (
          <div className="tickerItem" key={`${item.key}-${index}`}>
            <span className="tickerTitle">{item.title}</span>
            <strong>{formatValue(item)}</strong>
            <span className={Number(item.changePercent) >= 0 ? "tickerGain" : "tickerLoss"}>
              {formatChange(item)}
            </span>
            <small>{item.subtitle}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvestmentTicker;
