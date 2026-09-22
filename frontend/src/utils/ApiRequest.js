const host = process.env.REACT_APP_API_URL || "https://iiitlbachat.onrender.com";
export const setAvatarAPI = `${host}/api/auth/setAvatar`;
export const registerAPI = `${host}/api/auth/register`;
export const loginAPI = `${host}/api/auth/login`;
export const googleAuthAPI = `${host}/api/auth/google`;
export const addTransaction = `${host}/api/v1/addTransaction`;
export const getTransactions = `${host}/api/v1/getTransaction`;
export const editTransactions = `${host}/api/v1/updateTransaction`;
export const deleteTransactions = `${host}/api/v1/deleteTransaction`;
export const parseReceiptAPI = `${host}/api/ai/receipt`;
export const financeChatAPI = `${host}/api/ai/chat`;
export const investmentInsightsAPI = `${host}/api/ai/investments`;
export const investmentPlanAPI = `${host}/api/ai/plans`;
export const marketTickerAPI = `${host}/api/ai/market-ticker`;

// Budget API
export const getCurrentBudgetAPI = `${host}/api/budget/current`;
export const setBudgetAPI = `${host}/api/budget/set`;
export const getBudgetHistoryAPI = `${host}/api/budget/history`;

// Wallet API
export const createWalletAPI = `${host}/api/wallet/create`;
export const generateInviteAPI = `${host}/api/wallet/invite`;
export const joinWalletAPI = `${host}/api/wallet/join`;
export const getMyWalletsAPI = `${host}/api/wallet/mine`;
export const getWalletDetailsAPI = `${host}/api/wallet`;

// Voice API
export const voiceExpenseAPI = `${host}/api/ai/voice-expense`;
