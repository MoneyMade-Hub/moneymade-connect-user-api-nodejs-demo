import { useState, useMemo, useCallback, useEffect } from 'react'
import { MainButton, Container, Input, H3, P3, useLoader, Select, Option, Avatar } from '@moneymade/moneymade-ui'
import ReactJson from 'react-json-view'

import {
  createUserCall,
  createUserSessionCall,
  getUserAccountsCall,
  getUserAccountCall,
  getUserAccountBankDetailsCall,
  getUserAccountHoldingsCall
} from 'api/apiCalls'
import { sortAsc, getField, isAllRequiredFields, getFieldProp, getScriptTag } from 'utils/utils'
import { INIT_FIELDS, JSON_RESPONSE } from 'static/consts'
import styles from 'App/App.module.scss'

const App = () => {
  const [fields, setFields] = useState(INIT_FIELDS)
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
    (value, field) => {
      const other = fields.filter(({ name }) => name !== field)
      const { correct, ...rest } = fields.find(({ name }) => name === field)
      setFields([...other, { ...rest, value, correct: !!value }].sort(sortAsc))
    },
    [fields]
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

  const handleCreateSession = useCallback(async () => {
    setLoader(true)
    // get user token
    const { success: successUserSession, response: responseUserSession } = await createUserSessionCall(
      getFieldProp(fields, 'apiKey', 'value'),
      getFieldProp(fields, 'secretKey', 'value'),
      getFieldProp(fields, 'userId', 'value')
    )

    if (successUserSession) {
      const { token } = responseUserSession
      handleChange(token, 'token')
      setError('')
    } else {
      const { response } = responseUserSession
      setError(response?.data?.message || '')
    }
    setLoader(false)

    handleGetUserAccounts()
  }, [fields, handleChange, handleGetUserAccounts, setLoader])

  const handleUserAccount = async () => {
    setLoader(true)
    // get user account
    const { success: successUserAccount, response: responseUserAccount } = await getUserAccountCall(
      getFieldProp(fields, 'apiKey', 'value'),
      getFieldProp(fields, 'secretKey', 'value'),
      getFieldProp(fields, 'userId', 'value'),
      select
    )

    if (successUserAccount) {
      setJson(responseUserAccount)
    } else {
      try {
        const { response } = responseUserAccount
        setJson(response?.data)
      } catch (error) {
        setJson({ message: 'something whent wrong' })
      }
    }
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

    if (successAccountBankDetails) {
      setJson(responseAccountBankDetails)
    } else {
      try {
        const { response } = responseAccountBankDetails
        setJson(response?.data)
      } catch (error) {
        setJson({ message: 'something whent wrong' })
      }
    }
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

    if (successUserHoldings) {
      setJson(responseUserHoldings)
    } else {
      try {
        const { response } = responseUserHoldings
        setJson(response?.data)
      } catch (error) {
        setJson({ message: 'something whent wrong' })
      }
    }
    setLoader(false)
  }

  const handleAccountTranasctions = async () => {}

  useEffect(() => {
    if (getFieldProp(fields, 'userId', 'value') && !getFieldProp(fields, 'token', 'value')) {
      handleCreateSession()
    }
  }, [fields, handleCreateSession])

  const handleConnect = useCallback(async () => {
    setLoader(false)
    window.MoneyMadeWidget?.connect({
      clientKey: getFieldProp(fields, 'clientKey', 'value'),
      token: getFieldProp(fields, 'token', 'value'),
      clientUserId: getFieldProp(fields, 'clientUserId', 'value'),
      env: 'stage',
      onSuccess: () => {
        setLoader(false)
        handleGetUserAccounts()
      },
      onError: () => setLoader(false),
      onExpire: () => setLoader(false),
      onClose: () => setLoader(false)
    })
  }, [fields, handleGetUserAccounts, setLoader])

  return (
    <div className={styles.App}>
      <Container width={1000} className={styles.Container}>
        <H3 type="heading" weight="bold" className={styles.Title}>
          MoneyMade Connect API widget Playground
        </H3>

        <P3 className={styles.Desc}>Please don't use production keys</P3>

        <div className={styles.InitData}>
          {fields
            .filter(({ hidden }) => !hidden)
            .map(({ name, label, type, id }) => (
              <div className={styles.InputContainer} key={id}>
                <P3 weight="light"> {`${label}:`}</P3>
                <Input
                  inputSize="md"
                  onChange={({ target: { value } }) => handleChange(value, name)}
                  value={getField(fields, name)}
                  type={type}
                  disabled={loaderStatus || isReadyToConnect}
                />
              </div>
            ))}
        </div>

        <div className={styles.InitData}>
          {fields
            .filter(({ hidden }) => hidden)
            .map(({ name, label, type, id }) => (
              <div className={styles.InputContainer} key={id}>
                <P3 weight="light"> {`${label}:`}</P3>
                <Input inputSize="md" value={getField(fields, name)} type={type} disabled />
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
              getScriptTag(handleConnect, () => setLoader(false))
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
            }}
            className={styles.Btn}
            disabled={loaderStatus}
            iconBefore={<i className="icon-delete" />}
          >
            Reset Account
          </MainButton>
        </div>

        {!!accounts?.length && (
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
