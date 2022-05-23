const sortAsc = (a, b) => (a.id > b.id ? 1 : b.id > a.id ? -1 : 0)

const getField = (fields, field) => fields.find(({ name }) => name === field)?.value || ''

const isAllRequiredFields = fields =>
  fields
    .filter(({ hidden }) => !hidden)
    .map(({ correct }) => correct)
    .reduce((result, current) => result && current, true)

const getFieldProp = (fields, field, prop) => fields.find(({ name }) => name === field)?.[prop] || ''

const getScriptTag = (callBack, errorCallback) => {
  let script = document.querySelector(`script[id="moneymade-connector-script"]`)
  if (script) callBack()
  else {
    script = document.createElement('script')
    script.id = 'moneymade-connector-script'
    script.src = 'https://connect-widget-stage.vercel.app/moneymade-connect.js'
    script.async = true
    script.defer = true
    script.onload = () => callBack()
    script.onerror = () => errorCallback()
    document.body.appendChild(script)
  }
}

export { sortAsc, getField, isAllRequiredFields, getFieldProp, getScriptTag }
