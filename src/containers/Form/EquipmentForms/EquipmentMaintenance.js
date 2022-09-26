import React, { useEffect } from 'react'
import Field from '../FormFields/Field'
import styles from './EquipmentConfiguration.scss'

const getDynamicCalculatedValue = (maintainances, calculation) => {
  try {
    const calculationEq = calculation.replace(/#\{(.*?)\}/g, function(
      _,
      token
    ) {
      return maintainances[token] || 0
    })
    return `${eval(calculationEq)}`
  } catch (err) {
    console.log(err)
  }
  return ''
}

const renderOptions = (values, name) => {
  return values.reduce(
    (acc, value, index) =>
      acc.concat(
        <option value={value} key={`options-${name}-${index}`}>
          {value}
        </option>
      ),
    [
      <option value="" defaultValue key={`options-${name}-default`}>
        Select One
      </option>
    ]
  )
}

const EquipmentMaintenance = ({
  fields,
  disabled,
  showPrimaryMaintenance,
  values = [],
  onFieldUpdate
}) => {
  useEffect(() => {
    if (values && values.length === 0) {
      const maintenanceFields = fields.map(({ field, value }) => ({
        field,
        value
      }))
      onFieldUpdate(`maintenances`, maintenanceFields)
    }
    const hashedValues = values.reduce((agg, item) => {
      if (item) agg[item.field] = item.value
      return agg
    }, {})
    fields.forEach((item, index) => {
      if (item.calculation) {
        const value = getDynamicCalculatedValue(hashedValues, item.calculation)
        onFieldUpdate(`maintenances.${index}.value`, value)
      }
    })
  }, [values, fields, onFieldUpdate])
  return (
    <div className={styles.card}>
      <div className={styles.cardContent}>
        {fields.map(
          (
            {
              display,
              field,
              fieldDisplayName,
              type,
              values,
              units,
              rank,
              editable
            },
            index
          ) => {
            if (
              display === false ||
              (showPrimaryMaintenance && rank != 'PRIMARY') ||
              (!showPrimaryMaintenance && rank === 'PRIMARY')
            )
              return null
            return (
              <div
                className={styles.cardElement}
                key={`$equipment-maintenance-${field || fieldName}`}
              >
                {values && values.length > 0 ? (
                  <Field
                    disabled={disabled}
                    label={fieldDisplayName}
                    data-test={`equipment-maintenance-${field}`}
                    name={`maintenances.${index}.value`}
                    component="select"
                    adornment={units && <div>{units}</div>}
                  >
                    {renderOptions(values, fieldDisplayName)}
                  </Field>
                ) : (
                  <Field
                    disabled={disabled || !editable}
                    label={fieldDisplayName}
                    data-test={`equipment-maintenance-${field}`}
                    name={`maintenances.${index}.value`}
                    component={type === 'paragraph' ? 'textarea' : 'input'}
                    adornment={units && <div>{units}</div>}
                  />
                )}
              </div>
            )
          }
        )}
      </div>
    </div>
  )
}

export default EquipmentMaintenance
