import axios from 'axios'

import { API_URL, CREATE_USER, CREATE_SESSION, ACCOUNTS, BANK_DETAILS, HOLDINGS } from 'api/apiConstants'

const globalAxios = (apiKeys, apiSecret) => {
  axios.defaults.baseURL = API_URL
  axios.defaults.headers.common['api-key'] = apiKeys
  axios.defaults.headers.common['api-secret'] = apiSecret
  return axios
}

// GET
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

const getUserAccountCall = async (apiKeys, apiSecret, userId, accountId) => {
  try {
    const response = await axios({
      ...globalAxios(apiKeys, apiSecret),
      url: `${CREATE_USER}/${userId}${ACCOUNTS}/${accountId}`,
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

const getUserAccountBankDetailsCall = async (apiKeys, apiSecret, accountId) => {
  try {
    const response = await axios({
      ...globalAxios(apiKeys, apiSecret),
      url: `${CREATE_USER}${ACCOUNTS}/${accountId}${BANK_DETAILS}`,
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

const getUserAccountHoldingsCall = async (apiKeys, apiSecret, accountId) => {
  try {
    const response = await axios({
      ...globalAxios(apiKeys, apiSecret),
      url: `${CREATE_USER}${ACCOUNTS}/${accountId}${HOLDINGS}`,
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

export {
  createUserCall,
  createUserSessionCall,
  getUserAccountsCall,
  getUserAccountCall,
  getUserAccountBankDetailsCall,
  getUserAccountHoldingsCall
}
