import React from 'react'
import classNames from 'classnames'
import { Field } from 'redux-form'
import { RenderField, RenderSelect } from '../FormFields'
import styles from './Checkbox.scss'

class Checkbox extends React.Component {
  checkboxGroup(option, index) {
    let {
      label,
      required,
      input,
      meta,
      blendedRates,
      hasUtilityInput = false
    } = this.props
    let checked = input.value.indexOf(option.name) !== -1
    let dropdownOptions = []
    if (option.name === 'Electricity') {
      dropdownOptions = [
        {
          value: '0.12',
          label: '$0.12/kWh - Lower Peninsula'
        },
        {
          value: '0.18',
          label: '$0.18/kWh - Upper Peninsula'
        }
      ]
      if (
        blendedRates &&
        blendedRates[option.name] &&
        blendedRates[option.name].length
      ) {
        dropdownOptions = blendedRates[option.name]
      }
    } else {
      dropdownOptions = [
        {
          value: '0.65',
          label: '$0.65/therms - Small Commercial'
        },
        {
          value: '0.45',
          label: '$0.45/therm - Small Industrial'
        },
        {
          value: '0.35',
          label: '$0.35/therm - Large Industrial'
        }
      ]
      if (
        blendedRates &&
        blendedRates[option.name] &&
        blendedRates[option.name].length
      ) {
        dropdownOptions = blendedRates[option.name]
      }
    }
    return (
      <div key={index}>
        <label>
          <input
            type="checkbox"
            name={`${option.name}-[${index}]`}
            className={classNames(checked ? styles['checked'] : '')}
            value={option.name}
            defaultChecked={checked}
            onChange={event => {
              const newValue = [...input.value]
              if (event.target.checked) {
                newValue.push(option.name)
              } else {
                newValue.splice(newValue.indexOf(option.name), 1)
              }

              return input.onChange(newValue)
            }}
          />
          <span />
          <small>{option.name}</small>
        </label>
        {checked && (
          <div className={styles.extraFields}>
            <Field
              label={'Estimated Monthly Cost'}
              id={`${option.name} - Estimated Monthly Cost`}
              name={`${option.name} - Estimated Monthly Cost`}
              component={RenderField}
              type="text"
              required={true}
              icon="attach_money"
            />
            {!hasUtilityInput ? (
              <Field
                label={`Blended Rate`}
                id={`${option.name} - Blended Rate`}
                name={`${option.name} - Blended Rate`}
                component={RenderSelect}
                required={true}
                defaultValue={''}
              >
                <option defaultValue value="" disabled>
                  Select
                </option>
                {dropdownOptions.map(option => (
                  <option key={`option-${option.value}`} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Field>
            ) : (
              <Field
                label={`Blended Rate`}
                id={`${option.name} - Blended Rate`}
                name={`${option.name} - Blended Rate`}
                component={RenderField}
                defaultValue={''}
                type="number"
              />
            )}
          </div>
        )}
      </div>
    )
  }

  render() {
    let { options } = this.props
    return (
      <div>
        {options.map((option, index) => (
          <div
            className={classNames(styles.checkContainer)}
            key={index + '-utility-container'}
          >
            {this.checkboxGroup(option, index)}
          </div>
        ))}
      </div>
    )
  }
}

export default Checkbox
