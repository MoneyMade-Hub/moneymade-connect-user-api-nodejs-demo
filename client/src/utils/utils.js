const sortAsc = (a, b) => (a.id > b.id ? 1 : b.id > a.id ? -1 : 0)

const getField = (fields, field) => fields.find(({ name }) => name === field)?.value || ''

const isAllRequiredFields = fields =>
  fields.map(({ correct }) => correct).reduce((result, current) => result && current, true)

const getFieldProp = (fields, field, prop) => fields.find(({ name }) => name === field)?.[prop] || ''

export { sortAsc, getField, isAllRequiredFields, getFieldProp }
