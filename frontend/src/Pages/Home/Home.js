import React, { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import { Button, Modal, Form, Container } from "react-bootstrap";
import "./home.css";
import { addTransaction, getTransactions } from "../../utils/ApiRequest";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Spinner from "../../components/Spinner";
import TableData from "./TableData";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import BarChartIcon from "@mui/icons-material/BarChart";
import TimelineIcon from '@mui/icons-material/Timeline';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import Analytics from "./Analytics";
import * as XLSX from "xlsx";
import MonthlyCharts from './MonthlyCharts';
import SmartFinancePanel from "./SmartFinancePanel";
import FinanceChatWidget from "./FinanceChatWidget";
import InvestmentTicker from "./InvestmentTicker";
import CalendarViewWeekIcon from '@mui/icons-material/CalendarViewWeek';
import WeeklyBudgetCard from "../../components/WeeklyBudgetCard";
import VoiceExpenseButton from "../../components/VoiceExpenseButton";

const Home = () => {
  const navigate = useNavigate();

  const toastOptions = useMemo(() => ({
    position: "bottom-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: "dark",
  }), []);
  const [cUser, setcUser] = useState();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [frequency, setFrequency] = useState("custom");
  const [type, setType] = useState("all");
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [view, setView] = useState("table");
  const [avatar, setAvatar] = useState(false);
  const [isSharedWallet, setIsSharedWallet] = useState(false);
  const [investmentPlan, setInvestmentPlan] = useState({
    shortTerm: {},
    mediumTerm: {},
    longTerm: {}
  });

  const handleStartChange = (date) => {
    setStartDate(date);
  };

  const handleEndChange = (date) => {
    setEndDate(date);
  };

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    const avatarFunc = async () => {
      if (localStorage.getItem("user")) {
        const user = JSON.parse(localStorage.getItem("user"));
        console.log(user);

        if (user.isAvatarImageSet === false || user.avatarImage === "") {
          navigate("/setAvatar");
        }
        setcUser(user);
        setRefresh(true);
      } else {
        return navigate("/login");
      }
    };

    avatarFunc();
    setAvatar(true);
  }, [navigate]);

  useEffect(() => {
    if (cUser?._id) {
      const savedPlan = localStorage.getItem(`investmentPlan:${cUser._id}`);
      if (savedPlan) {
        setInvestmentPlan(JSON.parse(savedPlan));
      }
    }
  }, [cUser?._id]);

  useEffect(() => {
    if (cUser?._id) {
      localStorage.setItem(`investmentPlan:${cUser._id}`, JSON.stringify(investmentPlan));
    }
  }, [investmentPlan, cUser?._id]);

  const [values, setValues] = useState({
    title: "",
    amount: "",
    description: "",
    category: "",
    date: "",
    transactionType: "",
  });

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleChangeFrequency = (e) => {
    setFrequency(e.target.value);
  };

  const handleSetType = (e) => {
    setType(e.target.value);
  };

  const handleSetCategory = (e) => {
    setCategory(e.target.value);
  };

  const downloadDoc = async () => {
    setLoading(true)
    if (!transactions || transactions?.length === 0) {
      toast.info("There are no Transactions to download.", toastOptions)
      setLoading(false)
      return;
    }
    if(!cUser){
      toast.info("Logging in Again!!")
      setLoading(false)
      return navigate("/login")
    }
    const headers = [
      {
        header: "S. No.",
        key: "snum",
        type: "index"
      },
      {
        header: "Title",
        key: "title",
        type: "string"
      },
      {
        header: "Transaction Type",
        key: "transactionType",
        type: "string"
      },
      {
        header: "Category",
        key: "category",
        type: "string"
      },
      {
        header: "Date",
        key: "date",
        type: "date"
      },
      {
        header: "Amount",
        key: "amount",
        type: "number"
      }
    ]
    const data = transactions.sort((a,b) => b.date - a.date);
    const worksheet = XLSX.utils.aoa_to_sheet([
      headers.map((col) => col.header), 
      [] 
    ]);
    data.forEach((item,index)=>{
      const row = headers.map((heads)=>{
        if(heads.type === "index") return (index+1);
        if(heads.type === "number") return Number(item[heads.key]);
        if(headers.type === "date") return XLSX.SSF.format("yyyy-mm-dd",new Date(item[heads.key]));
        return item[heads.key];
      })
      XLSX.utils.sheet_add_aoa(worksheet,[row],{origin:-1});
    })
    headers.forEach((_, colIndex) => {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIndex });
      if (!worksheet[cellRef]) return;
      worksheet[cellRef].s = {
        font: { bold: true },
        alignment: { horizontal: "center" }
      };
    });

    const wrokbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wrokbook,worksheet,"Sheet 1");

    XLSX.writeFile(wrokbook,`IIITL-Bachat-${cUser.name?.split(" ")[0] || ""}-${new Date(Date.now()).toISOString().slice(0, 10).replace(/-/g, "")}.xlsx`);
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { title, amount, description, category, date, transactionType } =
      values;

    if (
      !title ||
      !amount ||
      !description ||
      !category ||
      !date ||
      !transactionType
    ) {
      toast.error("Please enter all the fields", toastOptions);
    }
    setLoading(true);

    const { data } = await axios.post(addTransaction, {
      title: title,
      amount: amount,
      description: description,
      category: category,
      date: date,
      transactionType: transactionType,
      userId: cUser._id,
    });
    if (data.success === true) {
      toast.success(data.message, toastOptions);
      handleClose();
      setValues({
        title: "",
        amount: "",
        description: "",
        category: "",
        date: "",
        transactionType: "",
      })
      setRefresh(!refresh);
    } else {
      toast.error(data.message, toastOptions);
    }

    setLoading(false);
  };

  const handleReset = () => {
    setType("all");
    setStartDate(null);
    setEndDate(null);
    setFrequency("7");
    setCategory("");
  };

  useEffect(() => {
    if (!avatar || !cUser?._id) {
      return;
    }
    const fetchAllTransactions = async () => {
      try {
        setLoading(true);

        console.log(cUser._id, frequency, startDate, endDate, type);
        const res = await axios.post(getTransactions, {
          userId: cUser._id,
          frequency: frequency,
          startDate: startDate,
          endDate: endDate,
          type: type,
          category: category,
        });
        const data = res.data
        console.log(data);
        const  test = data?.transactions?.sort((a,b) => {
          if(a.date === b.date){
            return (b.createdAt - a.createdAt);
          }
          return (b.date - a.date);
        }) || []
        console.log(test)
        setTransactions(test);

        setLoading(false);
      } catch (err) {
        toast.error(err.message || err.response?.data?.message || "There is some network error", toastOptions);
        setLoading(false);
      }
    };

    fetchAllTransactions();
  }, [avatar, cUser?._id, refresh, frequency, endDate, type, startDate, category, toastOptions]);

  // Real-time polling for shared wallets (Phase 8)
  useEffect(() => {
    if (!isSharedWallet) return;
    const interval = setInterval(() => {
      setRefresh((prev) => !prev);
    }, 10000);
    const handleFocus = () => setRefresh((prev) => !prev);
    window.addEventListener("focus", handleFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [isSharedWallet]);

  // Check if user is in any shared wallet to enable live sync
  useEffect(() => {
    if (!cUser?._id) return;
    axios.post(`${process.env.REACT_APP_API_URL || "https://iiitlbachat.onrender.com"}/api/wallet/mine`, { userId: cUser._id })
      .then(({ data }) => setIsSharedWallet(data.wallets?.length > 0))
      .catch(() => setIsSharedWallet(false));
  }, [cUser?._id, refresh]);

  const handleTableClick = (e) => {
    setView("table");
  };

  const handleChartClick = (e) => {
    setView("chart");
  };

   const handleLineChartClick = (e) => {
    setView("line");
  };

  const handleSmartClick = () => {
    setView("smart");
  };

  const handleBudgetClick = () => {
    setView("budget");
  };

  const handleReceiptParsed = async (parsedTransactions) => {
    const rows = Array.isArray(parsedTransactions)
      ? parsedTransactions
      : parsedTransactions
        ? [parsedTransactions]
        : [];

    if (!rows.length) {
      toast.error("No transaction rows found in the upload", toastOptions);
      return;
    }

    if (!cUser?._id) {
      toast.info("Logging in Again!!", toastOptions);
      return navigate("/login");
    }

    setLoading(true);
    try {
      const results = await Promise.allSettled(
        rows.map((transaction) =>
          axios.post(addTransaction, {
            title: transaction.title || "Uploaded transaction",
            amount: transaction.amount || "",
            description: transaction.description || "Auto-filled from uploaded document",
            category: transaction.category || "Other",
            date: transaction.date || new Date().toISOString().slice(0, 10),
            transactionType: transaction.transactionType || "expense",
            userId: cUser._id,
          })
        )
      );

      const addedCount = results.filter(
        (result) => result.status === "fulfilled" && result.value?.data?.success
      ).length;

      if (addedCount) {
        toast.success(`${addedCount} transaction${addedCount > 1 ? "s" : ""} added from upload`, toastOptions);
        setRefresh((current) => !current);
      }

      if (addedCount < rows.length) {
        const failedCount = rows.length - addedCount;
        toast.error(`${failedCount} row${failedCount > 1 ? "s" : ""} could not be added`, toastOptions);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not add uploaded transactions", toastOptions);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header isSharedWallet={isSharedWallet} />

      {loading ? (
        <>
          <Spinner />
        </>
      ) : (
        <>
          <Container
            style={{ position: "relative", zIndex: "2 !important" }}
            className="mt-3"
          >
            <div className="filterRow">
              {view !== "line" && view !== "smart" && view !== "budget" && (
                <div>
                  <Form.Group className="mb-3" controlId="formSelectFrequency">
                    <Form.Label style={{ color: '#475569', fontWeight: 600 }}>Select Frequency</Form.Label>
                    <Form.Select
                      name="frequency"
                      value={frequency}
                      onChange={handleChangeFrequency}
                    >
                      <option value="custom">All</option>
                      <option value="7">Current Week</option>
                      <option value="30">Current Month</option>
                      <option value="365">Current Year</option>
                    </Form.Select>
                  </Form.Group>
                </div>
              )}

              {view !== "line" && view !== "smart" && view !== "budget" && (
                <div className="type">
                  <Form.Group className="mb-3" controlId="formSelectFrequency">
                    <Form.Label style={{ color: '#475569', fontWeight: 600 }}>Type</Form.Label>
                    <Form.Select
                      name="type"
                      value={type}
                      onChange={handleSetType}
                    >
                      <option value="all">All</option>
                      <option value="expense">Expense</option>
                      <option value="credit">Earned</option>
                    </Form.Select>
                  </Form.Group>
                </div>
              )}

              {view !== "line" && view !== "smart" && view !== "budget" && (
                <div className="type">
                  <Form.Group className="mb-3" controlId="formSelectCategory">
                    <Form.Label style={{ color: '#475569', fontWeight: 600 }}>Category</Form.Label>
                    <Form.Select
                      name="category"
                      value={category}
                      onChange={handleSetCategory}
                    >
                      <option value="">All</option>
                      <option value="Groceries">Groceries</option>
                      <option value="Rent">Rent</option>
                      <option value="Salary">Salary</option>
                      <option value="Tip">Tip</option>
                      <option value="Food">Food</option>
                      <option value="Medical">Medical</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Transportation">Transportation</option>
                      <option value="Housing">Housing</option>
                      <option value="General Expenses">General Expenses</option>
                      <option value="Other">Other</option>
                    </Form.Select>
                  </Form.Group>
                </div>
              )}

              <div className="iconBtnBox">
                <FormatListBulletedIcon
                  sx={{ cursor: "pointer" }}
                  onClick={handleTableClick}
                  className={`${view === "table" ? "iconActive" : "iconDeactive"}`}
                />
                <BarChartIcon
                  sx={{ cursor: "pointer" }}
                  onClick={handleChartClick}
                  className={`${view === "chart" ? "iconActive" : "iconDeactive"}`}
                />
                <TimelineIcon
                  sx={{ cursor: "pointer" }}
                  onClick={handleLineChartClick}
                  className={`${view === "line" ? "iconActive" : "iconDeactive"}`}
                />
                <AutoAwesomeIcon
                  sx={{ cursor: "pointer" }}
                  onClick={handleSmartClick}
                  className={`${view === "smart" ? "iconActive" : "iconDeactive"}`}
                />
                <CalendarViewWeekIcon
                  sx={{ cursor: "pointer" }}
                  onClick={handleBudgetClick}
                  className={`${view === "budget" ? "iconActive" : "iconDeactive"}`}
                />
              </div>
              {view !== "line" && view !== "smart" && view !== "budget" && (
                <div>
                  <Button className="addNew" onClick={downloadDoc}>Download</Button>
                </div>
              )}
              <div>
                <Button onClick={handleShow} className="addNew">
                  Add New
                </Button>
                <Button onClick={handleShow} className="mobileBtn">
                  +
                </Button>
                <Modal show={show} onHide={handleClose} centered>
                  <Modal.Header closeButton>
                    <Modal.Title>Add Transaction Details</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <Form>
                      <Form.Group className="mb-3" controlId="formName">
                        <Form.Label>Title</Form.Label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <Form.Control
                            name="title"
                            type="text"
                            placeholder="Enter Transaction Name"
                            value={values.title}
                            onChange={handleChange}
                            style={{ flex: 1 }}
                          />
                          <VoiceExpenseButton 
                            onTranscribed={(t) => setValues(prev => ({
                              ...prev,
                              title: t.title || prev.title,
                              amount: t.amount || prev.amount,
                              description: t.description || prev.description,
                              category: t.category || prev.category,
                              date: t.date || new Date().toISOString().slice(0, 10),
                              transactionType: t.transactionType || prev.transactionType,
                            }))} 
                          />
                        </div>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="formAmount">
                        <Form.Label>Amount</Form.Label>
                        <Form.Control
                          name="amount"
                          type="number"
                          placeholder="Enter your Amount"
                          value={values.amount}
                          onChange={handleChange}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="formSelect">
                        <Form.Label>Category</Form.Label>
                        <Form.Select
                          name="category"
                          value={values.category}
                          onChange={handleChange}
                        >
                          <option value="">Choose...</option>
                          <option value="Groceries">Groceries</option>
                          <option value="Rent">Rent</option>
                          <option value="Salary">Salary</option>
                          <option value="Tip">Tip</option>
                          <option value="Food">Food</option>
                          <option value="Medical">Medical</option>
                          <option value="Utilities">Utilities</option>
                          <option value="Entertainment">Entertainment</option>
                          <option value="Transportation">Transportation</option>
                          <option value="Other">Other</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="formDescription">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                          type="text"
                          name="description"
                          placeholder="Enter Description"
                          value={values.description}
                          onChange={handleChange}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="formSelect1">
                        <Form.Label>Transaction Type</Form.Label>
                        <Form.Select
                          name="transactionType"
                          value={values.transactionType}
                          onChange={handleChange}
                        >
                          <option value="">Choose...</option>
                          <option value="credit">Credit</option>
                          <option value="expense">Expense</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="formDate">
                        <Form.Label>Date</Form.Label>
                        <Form.Control
                          type="date"
                          name="date"
                          value={values.date}
                          onChange={handleChange}
                        />
                      </Form.Group>

                      {/* Add more form inputs as needed */}
                    </Form>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                      Close
                    </Button>
                    <Button variant="primary" onClick={handleSubmit}>
                      Submit
                    </Button>
                  </Modal.Footer>
                </Modal>
              </div>
            </div>
            <br />

            {frequency === "custom" && view !== "line" && view !== "smart" && view !== "budget" ? (
              <>
                <div className="date">
                  <div className="form-group">
                    <label htmlFor="startDate" style={{ color: '#475569', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                      Start Date:
                    </label>
                    <div>
                      <DatePicker
                        selected={startDate}
                        onChange={handleStartChange}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="endDate" style={{ color: '#475569', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                      End Date:
                    </label>
                    <div>
                      <DatePicker
                        selected={endDate}
                        onChange={handleEndChange}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        minDate={startDate}
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <></>
            )}

            {view !== "line" && view !== "smart" && view !== "budget" && (
              <div className="containerBtn">
                <Button variant="primary" onClick={handleReset}>
                  Reset Filter
                </Button>
              </div>
            )}
            {view === "table" ? (
              <>
                <TableData data={transactions} user={cUser} />
              </>
            ) : view === "chart" ? (
              <>
                <Analytics transactions={transactions} user={cUser} />
              </>
            ) : view === "line" ? (
              <>
                <MonthlyCharts 
                  userId={cUser?._id} 
                  frequency="custom"
                  type="all"
                />
              </>
            ) : view === "budget" ? (
              <WeeklyBudgetCard userId={cUser?._id} />
            ) : (
              <SmartFinancePanel
                transactions={transactions}
                onReceiptParsed={handleReceiptParsed}
              />
            )}
            <ToastContainer />
          </Container>
            <InvestmentTicker />
          <FinanceChatWidget transactions={transactions} />
        </>
      )}
    </>
  );
};

export default Home;
