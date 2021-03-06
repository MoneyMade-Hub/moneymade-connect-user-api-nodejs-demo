const INIT_FIELDS = [
  {
    id: 1,
    name: 'clientKey',
    label: 'Client Key',
    value: '',
    correct: false,
    type: 'text'
  },
  {
    id: 2,
    name: 'secretKey',
    label: 'Secret Key',
    value: '',
    correct: false,
    type: 'password'
  },
  {
    id: 3,
    name: 'apiKey',
    label: 'Api Key',
    value: '',
    correct: false,
    type: 'text'
  },
  {
    id: 4,
    name: 'clientUserId',
    label: 'Client User Id',
    value: '',
    correct: false,
    type: 'text'
  },
  {
    id: 5,
    name: 'userId',
    label: 'User Id',
    value: '',
    correct: false,
    type: 'text',
    hidden: true
  },
  {
    id: 6,
    name: 'token',
    label: 'Token',
    value: '',
    correct: false,
    type: 'text',
    hidden: true
  }
]

const JSON_RESPONSE = {
  'your JSON response': {
    'will be here': 'click a button to get real data'
  }
}

export { INIT_FIELDS, JSON_RESPONSE }
