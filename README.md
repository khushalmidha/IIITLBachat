# Expense Management System

An **expense tracker** web application that allows users to manage and analyze their financial transactions effectively. This project is built with **MongoDB, Express.js, React.js, Node.js**, and **Bootstrap5** for styling. It provides features such as adding and viewing income/expense entries, generating category-wise statistics, and downloading the transaction history in spreadsheet format.

---

## Features

1. **User Login & Secure Session**  
   - Users can securely log in to access their personal expense records.

2. **Add New Transactions**  
   - Record both **income** and **expense** entries along with details such as title, amount, type, and category.

3. **Filter & Search**  
   - Filter transactions by **date range** (start and end date) and **transaction type** (all, income, or expense).

4. **Data Visualization**  
   - Dynamic **pie charts** showcase the percentage of income and expenses, as well as a breakdown of expenses by category.

5. **Frequency Selection**  
   - View transactions over **weekly, monthly, or yearly** frequencies, or opt for a custom date range.

6. **Download Feature**  
   - Export transaction history in a spreadsheet (Excel/CSV) format, preserving all data fields.

7. **Responsive UI**  
   - Built with **Bootstrap5**, ensuring the application is mobile-friendly and visually appealing.

---

## Screenshots

### Homepage & Dashboard
![Screenshot 2025-03-21 012859](https://github.com/user-attachments/assets/5c45b15b-47e2-4c48-81b9-31e02f2a7022)
- Displays total transactions, income, and expense.  
- Shows category-wise income and expense distribution in pie charts.

### Transaction List
![Screenshot 2025-03-21 012936](https://github.com/user-attachments/assets/09ce86fe-9090-4ee7-8684-02d791337d83)
- Comprehensive list of transactions with date, title, amount, category, and type.  
- Includes options to **reset filters** and **add new** transactions.

### Downloaded File Preview
![Screenshot 2025-03-21 013215](https://github.com/user-attachments/assets/64949285-d4bf-4078-a8eb-1545d6289b3f)
- Exported Excel file illustrating columns like Title, Transaction Type, Category, Date, and Amount.

---

## Tech Stack

- **Front End:** React.js (with npm packages like **Datepicker** and **tsparticles**)  
- **Back End:** Express.js and Node.js  
- **Database:** MongoDB  
- **Styling:** Bootstrap5  

---

## Setup Instructions

1. **Clone the Repository**  
   ```bash
   git clone https://github.com/khushalmidha/ExpenseTracker.git
   ```

2. **Navigate to the Project Directory**  
   ```bash
   cd ExpenseTracker
   ```

3. **Install Dependencies**  
   - **Server Setup:**  
     ```bash
     cd server
     npm install
     ```
   - **Client Setup:**  
     ```bash
     cd ../client
     npm install
     ```

4. **Configure Environment Variables**  
   - Create a `.env` file in the server folder and add the necessary credentials (e.g., MongoDB connection URL).

5. **Run the Application**  
   - Start the server:
     ```bash
     npm start
     ```
   - Start the client:
     ```bash
     npm start
     ```
   - The application will typically run on [http://localhost:3000](http://localhost:3000).

---

## Usage

1. **Login or Register** to create your account.
2. **Add New Transactions** to record income and expenses.
3. **Analyze** your financial data with interactive pie charts and filters.
4. **Download** your transaction history in spreadsheet format for further analysis.

---

## Contributor

- **Khushal Midha**  
  - [GitHub Profile](https://github.com/khushalmidha)

---
