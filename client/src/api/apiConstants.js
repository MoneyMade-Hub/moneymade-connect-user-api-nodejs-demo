const API_URL = process.env.REACT_APP_API_URL

const CREATE_USER = `/moneymade-users`
const CREATE_SESSION = `/moneymade-users/sessions`

// {{API_URL}}/moneymade-users/78dbfffc-eb5c-4af1-b919-4c6e0110ba30/accounts
const ACCOUNTS = '/accounts'

// {{API_URL}}/moneymade-users/a9bc2d0a-4335-41c9-84af-6de7d1b66135/accounts/0cef589a-e70f-49ff-93ef-75dae9af4b78
// account

// {{API_URL}}/moneymade-users/accounts/0cef589a-e70f-49ff-93ef-75dae9af4b78/bank-details
const BANK_DETAILS = '/bank-details'

// {{API_URL}}/moneymade-users/accounts/0cef589a-e70f-49ff-93ef-75dae9af4b78/holdings
const HOLDINGS = '/holdings'

export { API_URL, CREATE_USER, CREATE_SESSION, ACCOUNTS, BANK_DETAILS, HOLDINGS }
