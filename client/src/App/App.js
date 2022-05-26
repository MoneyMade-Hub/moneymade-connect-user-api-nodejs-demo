import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  MainButton,
  Container,
  Input,
  H3,
  P3,
  useLoader,
  Select,
  Option,
  Avatar,
  CircleButton
} from '@moneymade/moneymade-ui'
import ReactJson from 'react-json-view'
import { CopyToClipboard } from 'react-copy-to-clipboard'

import {
  createUserCall,
  createUserSessionCall,
  getUserAccountsCall,
  getUserAccountCall,
  getUserAccountBankDetailsCall,
  getUserAccountHoldingsCall
} from 'api/apiCalls'
import { sortAsc, getField, isAllRequiredFields, getFieldProp, getScriptTag, toSetResponse } from 'utils/utils'
import { INIT_FIELDS, JSON_RESPONSE } from 'static/consts'
import styles from 'App/App.module.scss'

const App = () => {
  const [fields, setFields] = useState(INIT_FIELDS)
  const [disabledInputs, setDisabledInputs] = useState(false)
  const [error, setError] = useState('')
  const [accounts, setAccounts] = useState([])
  const [select, setSelect] = useState({})
  const [json, setJson] = useState(JSON_RESPONSE)
  const { loaderStatus, loaderElement, setLoader } = useLoader(false)

  const isReadyToConnect = useMemo(
    () => !!getFieldProp(fields, 'token', 'value') && !!getFieldProp(fields, 'clientUserId', 'value'),
    [fields]
  )

  const handleChange = useCallback(
    (value, field, refreshToken = false) => {
      const other =
        isReadyToConnect && !refreshToken
          ? fields.filter(({ name }) => name !== field && name !== 'userId' && name !== 'token')
          : fields.filter(({ name }) => name !== field)
      const generated =
        isReadyToConnect && !refreshToken ? INIT_FIELDS.filter(({ name }) => name === 'userId' || name === 'token') : []
      const { correct, ...rest } = fields.find(({ name }) => name === field)
      setFields([...other, ...generated, { ...rest, value, correct: !!value }].sort(sortAsc))
    },
    [fields, isReadyToConnect]
  )

  const handleGetUserAccounts = useCallback(async () => {
    setLoader(true)
    // get user accounts
    const { success: successUserAccounts, response: responseAccounts } = await getUserAccountsCall(
      getFieldProp(fields, 'apiKey', 'value'),
      getFieldProp(fields, 'secretKey', 'value'),
      getFieldProp(fields, 'userId', 'value')
    )

    if (successUserAccounts) {
      setAccounts(responseAccounts)
      setSelect(responseAccounts?.[0]?.id)
      setError('')
    } else {
      const { response } = responseAccounts
      setError(response?.data?.message || '')
    }
    setLoader(false)
  }, [fields, setLoader])

  const handleCreateUser = async () => {
    setLoader(true)
    // get user Id
    const { success: successUser, response: responseUser } = await createUserCall(
      getFieldProp(fields, 'apiKey', 'value'),
      getFieldProp(fields, 'secretKey', 'value'),
      getFieldProp(fields, 'clientUserId', 'value')
    )

    const { id } = responseUser

    if (successUser) {
      handleChange(id, 'userId')
    } else {
      handleChange(getFieldProp(fields, 'clientUserId', 'value'), 'userId')
    }

    setLoader(false)
  }

  const handleCreateSession = useCallback(
    async (refreshToken = false) => {
      setLoader(true)
      // get user token
      const { success: successUserSession, response: responseUserSession } = await createUserSessionCall(
        getFieldProp(fields, 'apiKey', 'value'),
        getFieldProp(fields, 'secretKey', 'value'),
        getFieldProp(fields, 'userId', 'value')
      )

      if (successUserSession) {
        const { token } = responseUserSession
        handleChange(token, 'token', refreshToken)
        setDisabledInputs(true)
        setError('')
      } else {
        const { response } = responseUserSession
        setError(response?.data?.message || '')
      }
      setLoader(false)
      // get account for current user
      handleGetUserAccounts()
    },
    [fields, handleChange, handleGetUserAccounts, setLoader]
  )

  useEffect(() => {
    if (getFieldProp(fields, 'userId', 'value') && !getFieldProp(fields, 'token', 'value')) {
      handleCreateSession()
    }
  }, [fields, handleCreateSession])

  const handleUserAccount = async () => {
    setLoader(true)
    // get user account
    const { success: successUserAccount, response: responseUserAccount } = await getUserAccountCall(
      getFieldProp(fields, 'apiKey', 'value'),
      getFieldProp(fields, 'secretKey', 'value'),
      getFieldProp(fields, 'userId', 'value'),
      select
    )
    toSetResponse(successUserAccount, responseUserAccount, setJson)
    setLoader(false)
  }

  const handleAccountBankDetails = async () => {
    setLoader(true)
    // get user account bank details
    const { success: successAccountBankDetails, response: responseAccountBankDetails } =
      await getUserAccountBankDetailsCall(
        getFieldProp(fields, 'apiKey', 'value'),
        getFieldProp(fields, 'secretKey', 'value'),
        select
      )
    toSetResponse(successAccountBankDetails, responseAccountBankDetails, setJson)
    setLoader(false)
  }

  const handleAccountHoldings = async () => {
    setLoader(true)
    // get user account holdings
    const { success: successUserHoldings, response: responseUserHoldings } = await getUserAccountHoldingsCall(
      getFieldProp(fields, 'apiKey', 'value'),
      getFieldProp(fields, 'secretKey', 'value'),
      select
    )
    toSetResponse(successUserHoldings, responseUserHoldings, setJson)
    setLoader(false)
  }

  const handleAccountTranasctions = async () => {}

  const handleConnect = async () => {
    // refresh token
    await handleCreateSession(true)
    // open widget
    window.MoneyMadeWidget?.connect({
      clientKey: getFieldProp(fields, 'clientKey', 'value'),
      token: getFieldProp(fields, 'token', 'value'),
      clientUserId: getFieldProp(fields, 'clientUserId', 'value'),
      env: 'stage',
      onSuccess: () => handleGetUserAccounts()
    })
  }

  return (
    <div className={styles.App}>
      <Container width={1000} className={styles.Container}>
        <H3 type="heading" weight="bold" className={styles.Title}>
          MoneyMade Connect API widget Playground
        </H3>

        <P3 className={styles.Desc}>Please don't use production keys</P3>

        <div className={styles.InitData}>
          {fields.map(({ name, label, type, id, hidden, show, copy, value }) => (
            <div className={styles.InputContainer} key={id}>
              <P3 weight="light"> {`${label}:`}</P3>

              <div className={styles.Bottom}>
                <Input
                  inputSize="md"
                  onChange={({ target: { value } }) => handleChange(value, name)}
                  value={getField(fields, name)}
                  type={type}
                  disabled={hidden || loaderStatus || (disabledInputs && !show)}
                />

                <CopyToClipboard text={value} className={`${styles.Copy} ${copy && value ? styles.Show : styles.Hide}`}>
                  <CircleButton color="blue" size="sm" opacity={0.5} icon={<i className="icon-copy" />} />
                </CopyToClipboard>
              </div>
            </div>
          ))}
        </div>

        <P3 className={`${styles.Error} ${error ? styles.Show : styles.Hide}`}>{error}</P3>

        <div className={`${styles.CreateBtn} ${!isReadyToConnect ? styles.Show : styles.Hide}`}>
          <MainButton
            shape="squared"
            size="md"
            onClick={handleCreateUser}
            disabled={!isAllRequiredFields(fields)}
            className={styles.Btn}
            iconBefore={<i className="icon-plus" />}
          >
            Create User
          </MainButton>
        </div>

        <div className={`${styles.ConnectBtns} ${isReadyToConnect ? styles.Show : styles.Hide}`}>
          <MainButton
            shape="squared"
            size="md"
            onClick={() => {
              setLoader(true)
              getScriptTag(
                () => {
                  handleConnect()
                  setLoader(false)
                },
                () => setLoader(false)
              )
            }}
            className={styles.Btn}
            disabled={loaderStatus}
            iconAfter={<i className="icon-chainlink" />}
          >
            Connect Account
          </MainButton>

          <MainButton
            shape="squared"
            size="md"
            layout="outlined"
            onClick={() => {
              setFields(INIT_FIELDS)
              setError('')
              setAccounts([])
              setSelect({})
              setJson('')
              setDisabledInputs(false)
            }}
            className={styles.Btn}
            disabled={loaderStatus}
            iconBefore={<i className="icon-delete" />}
          >
            Clear
          </MainButton>
        </div>

        {isReadyToConnect && !!accounts?.length && (
          <div className={`${styles.Select} ${isReadyToConnect ? styles.Show : styles.Hide}`}>
            <div className={styles.Left}>
              <Select
                minWidth={200}
                selectedValue={select}
                handleOnChange={value => {
                  setSelect(value)
                  setJson('')
                }}
                disabled={loaderStatus}
              >
                {accounts?.map(({ provider: { name, logo }, id }, index) => (
                  <Option key={id} value={id}>
                    <Avatar width={32} height={32} radius="50%" src={logo} alt={name} /> {`${index + 1} - ${name}`}
                  </Option>
                ))}
              </Select>

              <MainButton
                color="blue"
                size="sm"
                onClick={handleUserAccount}
                className={styles.Btn}
                disabled={loaderStatus}
                iconBefore={<i className="icon-user" />}
              >
                Get user account
              </MainButton>

              <MainButton
                color="blue"
                size="sm"
                onClick={handleAccountBankDetails}
                className={styles.Btn}
                disabled={loaderStatus}
                iconBefore={<i className="icon-court" />}
              >
                Get account bank details
              </MainButton>

              <MainButton
                color="blue"
                size="sm"
                onClick={handleAccountHoldings}
                className={styles.Btn}
                disabled={loaderStatus}
                iconBefore={<i className="icon-rising" />}
              >
                Get holdings
              </MainButton>

              <MainButton
                color="blue"
                size="sm"
                onClick={handleAccountTranasctions}
                className={styles.Btn}
                disabled={true}
                iconBefore={<i className="icon-shield" />}
              >
                Get transactions
              </MainButton>
            </div>

            <div className={`${styles.Right} ${json ? styles.Show : styles.Hide}`}>
              {json && (
                <ReactJson
                  src={json}
                  name={false}
                  collapsed={2}
                  displayObjectSize={false}
                  displayDataTypes={false}
                  theme="bright:inverted"
                  iconStyle="triangle"
                />
              )}
            </div>
          </div>
        )}

        <div className={styles.Loader}>{loaderStatus && loaderElement}</div>
      </Container>
    </div>
  )
}

export default App
