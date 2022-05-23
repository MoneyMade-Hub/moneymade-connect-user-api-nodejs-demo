import { useState, useMemo, useCallback, useEffect } from 'react'
import { MainButton, Container, Input, H3, P3, useLoader, Select, Option } from '@moneymade/moneymade-ui'

import { createUserCall, createUserSessionCall, getUserAccountsCall } from 'api/apiCalls'
import { sortAsc, getField, isAllRequiredFields, getFieldProp, getScriptTag } from 'utils/utils'
import { INIT_FIELDS } from 'static/consts'
import styles from 'App/App.module.scss'

const App = () => {
  const [fields, setFields] = useState(INIT_FIELDS)
  const [error, setError] = useState('')
  const [accounts, setAccounts] = useState([])
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
  }, [fields, handleChange])

  const handleGetUserAccounts = useCallback(async () => {
    setLoader(true)

    const { success: successUserAccounts, response: responseAccounts } = await getUserAccountsCall(
      getFieldProp(fields, 'apiKey', 'value'),
      getFieldProp(fields, 'secretKey', 'value'),
      getFieldProp(fields, 'userId', 'value')
    )

    if (successUserAccounts) {
      setAccounts(responseAccounts)
      setError('')
    } else {
      const { response } = responseAccounts
      setError(response?.data?.message || '')
    }

    console.log('handleGetUserAccounts', successUserAccounts, responseAccounts)
    setLoader(false)
  }, [fields, setLoader])

  useEffect(() => {
    if (getFieldProp(fields, 'userId', 'value') && !getFieldProp(fields, 'token', 'value')) {
      handleCreateSession()
    }
  }, [fields, handleCreateSession])

  const handleConnect = useCallback(async () => {
    window.MoneyMadeWidget?.connect({
      clientKey: getFieldProp(fields, 'clientKey', 'value'),
      token: getFieldProp(fields, 'token', 'value'),
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

  const handleGetScriptTag = useCallback(() => {
    setLoader(true)
    getScriptTag(handleConnect, () => setLoader(false))
  }, [handleConnect, setLoader])

  return (
    <div className={styles.App}>
      <Container width={700} className={styles.Container}>
        <H3 type="heading" weight="bold" className={styles.Title}>
          MoneyMade Connect API widget Playground
        </H3>

        <P3 className={styles.Desc}>PLease don't use production keys</P3>

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

        {!isReadyToConnect && (
          <MainButton
            shape="squared"
            size="md"
            onClick={handleCreateUser}
            disabled={!isAllRequiredFields(fields)}
            className={styles.Btn}
          >
            Create User
          </MainButton>
        )}

        {isReadyToConnect && (
          <MainButton shape="squared" size="md" onClick={handleGetScriptTag} className={styles.Btn}>
            Connect Account
          </MainButton>
        )}

        {!!accounts.length && (
          <Select minWidth={175} selectedValue={null} handleOnChange={() => {}}>
            {accounts.map(({ provider, id }, index) => (
              <Option key={id} value={provider?.name}>
                {`${index + 1} - ${provider?.name}`}
              </Option>
            ))}
          </Select>
        )}

        {isReadyToConnect && (
          <MainButton
            shape="squared"
            size="xs"
            layout="outlined"
            onClick={() => setFields(INIT_FIELDS)}
            className={styles.Btn}
          >
            Reset Account
          </MainButton>
        )}

        <div className={styles.Loader}>{loaderStatus && loaderElement}</div>
      </Container>
      <div className="Container"></div>
    </div>
  )
}

export default App
