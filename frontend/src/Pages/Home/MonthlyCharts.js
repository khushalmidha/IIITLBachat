import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Container, Row, Col, Spinner, Form } from 'react-bootstrap';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { getTransactions } from '../../utils/ApiRequest';
import { toast } from 'react-toastify';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Array of colors for category graphs
const categoryColors = [
  'rgba(75, 192, 192, 1)',   // Teal
  'rgba(255, 159, 64, 1)',   // Orange
  'rgba(153, 102, 255, 1)',  // Purple
  'rgba(255, 99, 132, 1)',   // Pink
  'rgba(54, 162, 235, 1)',   // Blue
  'rgba(255, 206, 86, 1)',   // Yellow
  'rgba(231, 233, 237, 1)',  // Grey
  'rgba(46, 204, 113, 1)'    // Green
];

const MonthlyCharts = ({ userId, frequency, startDate, endDate, type }) => {
  const [monthlyData, setMonthlyData] = useState({
    labels: [],
    creditData: [],
    debitData: [],
  });
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredMonthlyData, setFilteredMonthlyData] = useState({
    labels: [],
    creditData: [],
    debitData: [],
  });

  const toastOptions = {
    position: "bottom-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: "dark",
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        const res = await axios.post(getTransactions, {
          userId: userId,
          frequency: 'custom', // Default to yearly view for charts
          type: 'all', // Always fetch all transactions for the charts
        });
        
        if (res.data && res.data.transactions) {
          const sortedTransactions = res.data.transactions.sort((a, b) => {
            if(a.date === b.date){
              return (b.createdAt - a.createdAt);
            }
            return (b.date - a.date);
          });
          
          setTransactions(sortedTransactions);
          
          // Extract unique categories
          const uniqueCategories = [...new Set(sortedTransactions.map(t => t.category))].filter(Boolean);
          setCategories(uniqueCategories);
          
          // Process transactions to group by month
          const monthlyAggregates = processTransactionsByMonth(sortedTransactions);
          setMonthlyData(monthlyAggregates);
          setFilteredMonthlyData(monthlyAggregates); // Initially show all data
        }
      } catch (err) {
        toast.error(err.message || err.response?.data?.message || "Error fetching transaction data", toastOptions);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [userId, frequency, startDate, endDate, type]);

  // Process data when selected category changes
  useEffect(() => {
    if (transactions.length === 0) return;

    setCategoryLoading(true);
    
    setTimeout(() => {
      if (selectedCategory === "all") {
        // Show all transactions
        setFilteredMonthlyData(monthlyData);
      } else {
        // Filter transactions by category
        const filteredTransactions = transactions.filter(t => t.category === selectedCategory);
        const filteredData = processTransactionsByMonth(filteredTransactions);
        setFilteredMonthlyData(filteredData);
      }
      setCategoryLoading(false);
    }, 300);
  }, [selectedCategory, transactions, monthlyData]);

  const processTransactionsByMonth = (transactions) => {
    // Create a map to hold monthly totals
    const creditByMonth = {};
    const debitByMonth = {};
    
    // Process each transaction
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      const amount = parseFloat(transaction.amount);
      if (transaction.transactionType.toLowerCase() === 'credit') {
        creditByMonth[monthYear] = (creditByMonth[monthYear] || 0) + amount;
      } else if (transaction.transactionType.toLowerCase() === 'expense') {
        debitByMonth[monthYear] = (debitByMonth[monthYear] || 0) + amount;
      }
    });
    
    // Get all unique months from both datasets
    const allMonths = [...new Set([...Object.keys(creditByMonth), ...Object.keys(debitByMonth)])];
    
    // Sort months chronologically
    allMonths.sort((a, b) => {
      const [monthA, yearA] = a.split('/').map(Number);
      const [monthB, yearB] = b.split('/').map(Number);
      
      if (yearA !== yearB) return yearA - yearB;
      return monthA - monthB;
    });
    
    // Format month labels for display
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels = allMonths.map(monthYear => {
      const [month, year] = monthYear.split('/');
      return `${monthNames[parseInt(month) - 1]} ${year}`;
    });
    
    // Create data arrays with 0 for missing months
    const creditData = allMonths.map(month => creditByMonth[month] || 0);
    const debitData = allMonths.map(month => debitByMonth[month] || 0);
    
    return { labels, creditData, debitData };
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  // Credit chart options and data
  const creditChartData = {
    labels: filteredMonthlyData.labels,
    datasets: [
      {
        label: selectedCategory === "all" ? 'Monthly Credits' : `${selectedCategory} - Monthly Credits`,
        data: filteredMonthlyData.creditData,
        borderColor: 'rgba(0, 204, 102, 1)',
        backgroundColor: 'rgba(0, 204, 102, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const creditChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#fff',
        },
      },
      title: {
        display: true,
        text: selectedCategory === "all" ? 'Monthly Income' : `${selectedCategory} - Monthly Income`,
        color: '#fff',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#fff',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      x: {
        ticks: {
          color: '#fff',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };

  // Debit chart options and data
  const debitChartData = {
    labels: filteredMonthlyData.labels,
    datasets: [
      {
        label: selectedCategory === "all" ? 'Monthly Expenses' : `${selectedCategory} - Monthly Expenses`,
        data: filteredMonthlyData.debitData,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const debitChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#fff',
        },
      },
      title: {
        display: true,
        text: selectedCategory === "all" ? 'Monthly Expenses' : `${selectedCategory} - Monthly Expenses`,
        color: '#fff',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#fff',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      x: {
        ticks: {
          color: '#fff',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };

  if (loading) {
    return (
      <Container className="monthly-charts mt-4 text-center">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <Spinner animation="border" role="status" variant="light">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <span className="ms-2 text-white">Loading transaction data...</span>
        </div>
      </Container>
    );
  }

  if (transactions.length === 0) {
    return (
      <Container className="monthly-charts mt-4">
        <div className="text-center p-4 text-white" style={{ background: 'rgba(33, 37, 41, 0.7)', borderRadius: '10px' }}>
          <h4>No transaction data available for the selected period</h4>
          <p>Add some transactions to see your monthly charts</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="monthly-charts mt-4">
      <Row className="align-items-center mb-4">
        <Col md={6}>
          <h3 className="text-white mb-0">Monthly Transaction Analysis</h3>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-0">
            <Form.Select 
              value={selectedCategory} 
              onChange={handleCategoryChange}
              className="bg-dark text-white"
              style={{ borderColor: '#6c757d' }}
            >
              <option value="all">All Categories</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {categoryLoading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <Spinner animation="border" role="status" variant="light">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <span className="ms-2 text-white">Filtering data...</span>
        </div>
      ) : (
        <Row>
          <Col lg={6} md={12} className="mb-4">
            <div className="chart-container" style={{ height: '400px', background: 'rgba(33, 37, 41, 0.7)', borderRadius: '10px', padding: '20px' }}>
              <Line options={creditChartOptions} data={creditChartData} />
            </div>
          </Col>
          <Col lg={6} md={12} className="mb-4">
            <div className="chart-container" style={{ height: '400px', background: 'rgba(33, 37, 41, 0.7)', borderRadius: '10px', padding: '20px' }}>
              <Line options={debitChartOptions} data={debitChartData} />
            </div>
          </Col>
        </Row>
      )}

      {!categoryLoading && filteredMonthlyData.labels.length === 0 && selectedCategory !== "all" && (
        <div className="text-center p-4 text-white mt-3" style={{ background: 'rgba(33, 37, 41, 0.7)', borderRadius: '10px' }}>
          <h4>No data available for category: {selectedCategory}</h4>
          <p>Try selecting a different category or time period</p>
        </div>
      )}
    </Container>
  );
};

export default MonthlyCharts;