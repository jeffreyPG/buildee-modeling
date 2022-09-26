import React from 'react'
import PropTypes from 'prop-types'
import Field from '../FormFields/Field'
import styles from './EquipmentConfiguration.scss'

export default class EquipmentConfiguration extends React.Component {
  static propTypes = {
    disabled: PropTypes.bool,
    fields: PropTypes.array,
    showPrimaryConfig: PropTypes.bool
  }

  state = {}

  defaultProps = {
    fields: []
  }

  onSubmit = (executeMutation, values, setSubmitting) => {}

  renderOptions = (values, name) => {
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

  render() {
    const { fields, disabled, showPrimaryConfig } = this.props

    return (
      <div className={styles.card}>
        <div className={styles.cardContent}>
          {fields.map(
            (
              { display, field, fieldDisplayName, type, values, units, rank },
              index
            ) => {
              if (
                display === false ||
                field === 'tagID' ||
                field === 'identifier' ||
                (showPrimaryConfig && rank != 'PRIMARY') ||
                (!showPrimaryConfig && rank === 'PRIMARY')
              )
                return null
              return (
                <div
                  className={styles.cardElement}
                  key={`$equipment-config-${field || fieldName}`}
                >
                  {values && values.length > 0 ? (
                    <Field
                      disabled={disabled}
                      label={fieldDisplayName}
                      data-test={`equipment-config-${field}`}
                      name={`configs.${index}.value`}
                      component="select"
                      adornment={units && <div>{units}</div>}
                    >
                      {this.renderOptions(values, fieldDisplayName)}
                    </Field>
                  ) : (
                    <Field
                      disabled={disabled}
                      label={fieldDisplayName}
                      data-test={`equipment-config-${field}`}
                      name={`configs.${index}.value`}
                      component="input"
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
}
