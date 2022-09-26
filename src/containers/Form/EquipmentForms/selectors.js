const NUMBER_TYPE_NAMES = ['float', 'integer']

export const getFieldType = type =>
  NUMBER_TYPE_NAMES.includes(type) ? 'number' : 'text'

export const getFieldLabel = field =>
  field.charAt(0) +
  field
    .slice(1)
    .replace('_', ' ')
    .toLowerCase()

export const getObjectRejectingEmptyValues = values =>
  Object.entries(values).reduce((acc, [key, value]) => {
    if (
      value === null ||
      value === undefined ||
      value.length === 0 ||
      (typeof value === 'object' && Object.values(value).length === 0)
    ) {
      return acc
    }
    return Object.assign({}, acc, { [key]: value })
  }, {})

export const getLabelForSnakeCasedName = name =>
  name
    .split(/([A-Z]?[a-z]+)/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .trim()

export const getLabelForEnumValue = name => {
  if (name === null) return ''
  return name
    .split('_')
    .map(w => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ')
    .trim()
}

export const getLocationDisplayName = l => {
  if (!l || l.length === 0) return ''
  if (!l.spaceType) return l.name
  return `${l.spaceType.charAt(0).toUpperCase()}${l.spaceType.slice(1)} ${
    l.name
  }`
}

export const getUseTypeDisplayName = name => {
  if (!name) return ''
  return `${name.charAt(0).toUpperCase()}${name.slice(1)}`
}

export const getValueType = value => {
  const type = typeof value
  if (type === 'number') {
    return Number.isInteger(value) ? 'integer' : 'float'
  }
  return 'string'
}

export const getValueFromList = list => item => {
  const result = list.find(listItem => listItem.value === item)
  return result ? result.displayName : '-'
}
