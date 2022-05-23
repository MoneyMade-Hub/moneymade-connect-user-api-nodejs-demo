import { useState, useCallback } from 'react'
import { MainButton, Container, Input, H3, P1, P3 } from '@moneymade/moneymade-ui'
import axios from 'axios'

import { createUserCall } from 'api/apiCalls'
import { sortAsc, getField, isAllRequiredFields, getFieldProp } from 'utils/utils'
import { INIT_FIELDS } from 'static/consts'
import styles from 'App/App.module.scss'

const App = () => {
  const [fields, setFields] = useState(INIT_FIELDS)

  const handleChange = (value, field) => {
    const other = fields.filter(({ name }) => name !== field)
    const { correct, ...rest } = fields.find(({ name }) => name === field)
    setFields([...other, { ...rest, value, correct: !!value }].sort(sortAsc))
  }

  const handleCreateUser = async () => {
    const { success, response } = await createUserCall(
      getFieldProp(fields, 'apiKey', 'value'),
      getFieldProp(fields, 'secretKey', 'value'),
      getFieldProp(fields, 'clientUserId', 'value')
    )

    console.log(success, response)
  }

  return (
    <div className={styles.App}>
      <Container width={700} className={styles.Container}>
        <H3 className={styles.Title}>MoneyMade Connect widget Playground</H3>

        <P3 className={styles.Desc}>PLease don't use production keys</P3>

        <div className={styles.InitData}>
          {INIT_FIELDS.map(({ name, label, type, id }) => (
            <div className={styles.InputContainer} key={id}>
              <P3 weight="light"> {`${label}:`}</P3>
              <Input
                inputSize="md"
                onChange={({ target: { value } }) => handleChange(value, name)}
                value={getField(fields, name)}
                type={type}
              />
            </div>
          ))}
        </div>

        <MainButton
          shape="squared"
          size="md"
          onClick={handleCreateUser}
          disabled={!isAllRequiredFields(fields)}
          className={styles.CreateUserBtn}
        >
          Create User
        </MainButton>
      </Container>
      <div className="Container"></div>
    </div>
  )
}

export default App
