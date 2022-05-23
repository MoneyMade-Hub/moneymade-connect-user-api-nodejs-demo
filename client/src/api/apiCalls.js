import axios from 'axios'

import { API_URL, CREATE_USER, CREATE_SESSION, ACCOUNTS, BANK_DETAILS, HOLDINGS } from 'api/apiConstants'

const globalAxios = (apiKeys, apiSecret) => {
  axios.defaults.baseURL = API_URL
  axios.defaults.headers.common['api-key'] = apiKeys
  axios.defaults.headers.common['api-secret'] = apiSecret
  return axios
}

const responseAxios = async instance => {
  try {
    const response = await instance()
    const { data, status } = response

    if (status >= 200 && status < 300) {
      return {
        success: true,
        response: data
      }
    }
    return {
      success: false,
      response: data
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      response: { error }
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

export { createUserCall }
