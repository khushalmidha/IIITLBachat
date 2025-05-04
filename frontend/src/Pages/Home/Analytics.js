import React from "react";
import { Container, Row } from "react-bootstrap";
import CircularProgressBar from "../../components/CircularProgressBar";
import LineProgressBar from "../../components/LineProgressBar";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const Analytics = ({ transactions }) => {
  const TotalTransactions = transactions.length;
  const totalIncomeTransactions = transactions.filter(
    (item) => item.transactionType === "credit"
  );
  const totalExpenseTransactions = transactions.filter(
    (item) => item.transactionType === "expense"
  );

  // Fix for NaN - Prevent division by zero
  let totalIncomePercent = TotalTransactions > 0 
    ? (totalIncomeTransactions.length / TotalTransactions) * 100
    : 0;
  
  let totalExpensePercent = TotalTransactions > 0
    ? (totalExpenseTransactions.length / TotalTransactions) * 100
    : 0;

  const totalTurnOver = transactions.reduce(
    (acc, transaction) => acc + transaction.amount,
    0
  );
  const totalTurnOverIncome = transactions
    .filter((item) => item.transactionType === "credit")
    .reduce((acc, transaction) => acc + transaction.amount, 0);
  const totalTurnOverExpense = transactions
    .filter((item) => item.transactionType === "expense")
    .reduce((acc, transaction) => acc + transaction.amount, 0);

  // Fix for NaN - Prevent division by zero
  const TurnOverIncomePercent = totalTurnOver > 0 
    ? (totalTurnOverIncome / totalTurnOver) * 100
    : 0;
  
  const TurnOverExpensePercent = totalTurnOver > 0 
    ? (totalTurnOverExpense / totalTurnOver) * 100
    : 0;

  const categories = [
    "Groceries",
    "Rent",
    "Salary",
    "Tip",
    "Food",
    "Medical",
    "Utilities",
    "Entertainment",
    "Transportation",
    "Other",
  ];

  const colors = {
    "Groceries": '#FF6384',
    "Rent": '#36A2EB',
    "Salary": '#FFCE56',
    "Tip": '#4BC0C0',
    "Food": '#9966FF',
    "Medical": '#FF9F40',
    "Utilities": '#8AC926',
    "Entertainment": '#6A4C93',
    "Transportation": '#1982C4',
    "Other": '#F45B69',
  };
  
  // Function to safely calculate percentage
  const safeCalculatePercent = (amount, total) => {
    if (total <= 0) return 0;
    return (amount / total) * 100;
  };

  return (
    <>
      <Container className="mt-5">
        <Row>
          <div className="col-lg-3 col-md-6 mb-4">
            <div className="card h-100">
              <div className="card-header bg-black text-white">
                <span style={{ fontWeight: "bold" }}>Total Transactions:</span>{" "}
                {TotalTransactions}
              </div>
              <div className="card-body">
                <h5 className="card-title" style={{color: "green"}}>
                  Income: <ArrowDropUpIcon/>{totalIncomeTransactions.length}
                </h5>
                <h5 className="card-title" style={{color: "red"}}>
                  Expense: <ArrowDropDownIcon />{totalExpenseTransactions.length}
                </h5>

                <div className="d-flex justify-content-center mt-3">
                  <CircularProgressBar
                    percentage={totalIncomePercent.toFixed(0)}
                    color="green"
                  />
                </div>

                <div className="d-flex justify-content-center mt-4 mb-2">
                  <CircularProgressBar
                    percentage={totalExpensePercent.toFixed(0)}
                    color="red"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 mb-4">
            <div className="card h-100">
              <div className="card-header bg-black text-white">
                <span style={{ fontWeight: "bold" }}>Total TurnOver:</span>{" "}
                {totalTurnOver}
              </div>
              <div className="card-body">
                <h5 className="card-title" style={{color: "green"}}>Income: <ArrowDropUpIcon /> {totalTurnOverIncome} <CurrencyRupeeIcon /></h5>
                <h5 className="card-title" style={{color: "red"}}>Expense: <ArrowDropDownIcon />{totalTurnOverExpense} <CurrencyRupeeIcon /></h5>
                <div className="d-flex justify-content-center mt-3">
                  <CircularProgressBar
                    percentage={TurnOverIncomePercent.toFixed(0)}
                    color="green"
                  />
                </div>

                <div className="d-flex justify-content-center mt-4 mb-4">
                  <CircularProgressBar
                    percentage={TurnOverExpensePercent.toFixed(0)}
                    color="red"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 mb-4">
            <div className="card h-100">
              <div className="card-header bg-black text-white">
                <span style={{ fontWeight: "bold" }}>Categorywise Income</span>{" "}
              </div>
              <div className="card-body">
                {categories.map((category, index) => {
                  const income = transactions
                    .filter(transaction => transaction.transactionType === "credit" && transaction.category === category)
                    .reduce((acc, transaction) => acc + transaction.amount, 0);
                  
                  // Fix for NaN - Use safe calculation function
                  const incomePercent = safeCalculatePercent(income, totalTurnOver);

                  return (
                    <React.Fragment key={`income-${index}`}>
                      {income > 0 && (
                        <LineProgressBar 
                          label={category} 
                          percentage={incomePercent.toFixed(0)} 
                          lineColor={colors[category]} 
                        />
                      )}
                    </React.Fragment>
                  );
                })}
                
                {/* Show message if no income transactions */}
                {totalIncomeTransactions.length === 0 && (
                  <div className="text-center text-muted py-3">
                    No income transactions to display
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 mb-4">
            <div className="card h-100">
              <div className="card-header bg-black text-white">
                <span style={{ fontWeight: "bold" }}>Categorywise Expense</span>{" "}
              </div>
              <div className="card-body">
                {categories.map((category, index) => {
                  const expenses = transactions
                    .filter(transaction => transaction.transactionType === "expense" && transaction.category === category)
                    .reduce((acc, transaction) => acc + transaction.amount, 0);
                  
                  // Fix for NaN - Use safe calculation function
                  const expensePercent = safeCalculatePercent(expenses, totalTurnOver);

                  return (
                    <React.Fragment key={`expense-${index}`}>
                      {expenses > 0 && (
                        <LineProgressBar 
                          label={category} 
                          percentage={expensePercent.toFixed(0)} 
                          lineColor={colors[category]} 
                        />
                      )}
                    </React.Fragment>
                  );
                })}
                
                {/* Show message if no expense transactions */}
                {totalExpenseTransactions.length === 0 && (
                  <div className="text-center text-muted py-3">
                    No expense transactions to display
                  </div>
                )}
              </div>
            </div>
          </div>
        </Row>
      </Container>
    </>
  );
};

export default Analytics;
