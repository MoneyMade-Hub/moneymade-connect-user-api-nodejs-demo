import axios from 'axios'

import { API_URL, CREATE_USER, CREATE_SESSION, ACCOUNTS, BANK_DETAILS, HOLDINGS } from 'api/apiConstants'

const globalAxios = (apiKeys, apiSecret) => {
  axios.defaults.baseURL = API_URL
  axios.defaults.headers.common['api-key'] = apiKeys
  axios.defaults.headers.common['api-secret'] = apiSecret
  return axios
}

// POST
const createUserCall = async (apiKeys, apiSecret, clientUserId) => {
  try {
    const response = await axios({
      ...globalAxios(apiKeys, apiSecret),
      url: CREATE_USER,
      method: 'post',
      data: {
        client_user_id: clientUserId
      }
    })

    const { data } = response

    return {
      success: true,
      response: data
    }
  } catch (error) {
    return {
      success: false,
      response: { error }
    }
  }
}

const createUserSessionCall = async (apiKeys, apiSecret, userId) => {
  try {
    const response = await axios({
      ...globalAxios(apiKeys, apiSecret),
      url: CREATE_SESSION,
      method: 'post',
      data: {
        user_id: userId
      }
    })

    const { data } = response

    return {
      success: true,
      response: data
    }
  } catch (error) {
    return {
      success: false,
      response: { ...error }
    }
  }
}

// {{API_URL}}/moneymade-users/a9bc2d0a-4335-41c9-84af-6de7d1b66135/accounts
const getUserAccountsCall = async (apiKeys, apiSecret, userId) => {
  try {
    const response = await axios({
      ...globalAxios(apiKeys, apiSecret),
      url: `${CREATE_USER}/${userId}${ACCOUNTS}`,
      method: 'get'
    })

    const { data } = response

    return {
      success: true,
      response: data
    }
  } catch (error) {
    return {
      success: false,
      response: { ...error }
    }
  }
}

export { createUserCall, createUserSessionCall, getUserAccountsCall }
