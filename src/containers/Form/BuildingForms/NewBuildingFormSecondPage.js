import React from 'react'
import { connect } from 'react-redux'
import { Field, reduxForm, formValueSelector } from 'redux-form'
import validate from '../FormFields/validate'
import { RenderField, RenderSelect } from '../FormFields'
import { getStates } from 'utils/Utils'

import classNames from 'classnames'
import styles from './NewBuildingForm.scss'

let NewBuildingFormSecondPage = props => {
  const {
    handleSubmit,
    previousPage,
    change,
    country = '',
    options,
    isEnd
  } = props
  const {
    disabledCreateBuildingFields = [],
    newCreateBuildingFields = [],
    stateOptions = [],
    countryOptions = []
  } = options

  const newFields = newCreateBuildingFields.filter(field => field.page === 2)
  const defaultStateOptions = getStates(country)
  const defaultCountryOptions = ['United States', 'Canada']

  let renderCountryOptions = [...defaultCountryOptions]
  let renderStateOptions = [...defaultStateOptions]

  if (countryOptions.length !== 0) {
    renderCountryOptions = [...countryOptions]
    change('country', countryOptions[0])
    renderStateOptions = getStates(countryOptions[0])
  }

  if (stateOptions.length !== 0) {
    let savedStateOptions = [...renderStateOptions]
    renderStateOptions = renderStateOptions.filter(stateOption =>
      stateOptions.includes(stateOption)
    )
    if (renderStateOptions.length > 0) change('state', renderStateOptions[0])
    else {
      renderStateOptions = [...savedStateOptions]
    }
  }

  const handleCountryChange = (event, changeAction) => {
    changeAction('state', '')
  }

  const skip = () => {
    change('country', '')
    change('address', '')
    change('state', '')
    change('city', '')
    change('postalCode', '')
    handleSubmit()
  }

  const renderNewField = field => {
    switch (field.type) {
      case 'Input': {
        let label = field.label
        let required = field.required || false
        return (
          <Field
            label={required ? label + '*' : label}
            id={field.title}
            name={field.title}
            component={RenderField}
            type="text"
            placeholder={field.placeHolder}
            required={required}
          />
        )
      }
      case 'InputNumber': {
        let label = field.label
        let required = field.required || false
        return (
          <Field
            label={required ? label + '*' : label}
            id={field.title}
            name={field.title}
            component={RenderField}
            type="number"
            placeholder={field.placeHolder}
            required={required}
          />
        )
      }
      case 'InputEmail': {
        let label = field.label
        let required = field.required || false
        return (
          <Field
            label={required ? label + '*' : label}
            id={field.title}
            name={field.title}
            component={RenderField}
            type="email"
            placeholder={field.placeHolder}
            required={required}
          />
        )
      }
      case 'Select': {
        let label = field.label
        let required = field.required || false
        return (
          <Field
            label={required ? label + '*' : label}
            id={field.title}
            name={field.title}
            component={RenderSelect}
            placeholder={field.placeHolder}
            required={required}
            defaultValue={field.defaultValue || ''}
          >
            <option defaultValue value="" disabled>
              Select {field.title}
            </option>
            {field.options.map(option => (
              <option key={`${field.title}-option-${option}`} value={option}>
                {option}
              </option>
            ))}
          </Field>
        )
      }
      case 'Date': {
        let label = field.label
        let required = field.required || false
        return (
          <Field
            label={required ? label + '*' : label}
            id={field.title}
            name={field.title}
            component={RenderField}
            type="date"
            placeholder={field.placeHolder}
            required={required}
          />
        )
      }
      default:
        return null
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {!disabledCreateBuildingFields.includes('country') && (
        <Field
          label="Country"
          id="country"
          name="country"
          component={RenderSelect}
          type="text"
          placeholder="country"
          required={false}
          onChange={event => handleCountryChange(event, change)}
        >
          <option value="" disabled>
            Country
          </option>
          {renderCountryOptions.length > 0 &&
            renderCountryOptions.map(countryOption => (
              <option value={countryOption}>{countryOption}</option>
            ))}
        </Field>
      )}

      {!disabledCreateBuildingFields.includes('address') && (
        <Field
          label="Street Address"
          id="address"
          name="address"
          component={RenderField}
          type="text"
          placeholder="Street Address"
          required={false}
        />
      )}
      {!disabledCreateBuildingFields.includes('city') && (
        <Field
          label="City"
          id="city"
          name="city"
          component={RenderField}
          type="text"
          placeholder="City"
          required={false}
        />
      )}
      {!disabledCreateBuildingFields.includes('state') && (
        <Field
          label="State/Province"
          id="state"
          name="state"
          component={RenderSelect}
          type="text"
          placeholder="State/Province"
          required={false}
        >
          <option value="" disabled>
            State/Province
          </option>
          {renderStateOptions.map(state => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </Field>
      )}
      {!disabledCreateBuildingFields.includes('postalCode') && (
        <Field
          label="Postal Code"
          id="postalCode"
          name="postalCode"
          component={RenderField}
          type="text"
          placeholder="Postal Code"
          required={false}
        />
      )}

      {newFields.map((field, index) => {
        return <div key={field.title}>{renderNewField(field)}</div>
      })}

      <div className={styles.buttonContainer}>
        <button
          onClick={skip}
          className={classNames(
            styles.button,
            styles.buttonPrimary,
            styles.skipButton
          )}
        >
          Skip
        </button>
        <div className={styles.buttons}>
          <button
            type="button"
            className={classNames(
              styles.button,
              styles.buttonSecondary,
              'previous'
            )}
            onClick={previousPage}
          >
            Previous
          </button>
          <button
            type="submit"
            className={classNames(styles.button, styles.buttonPrimary, 'next')}
          >
            {isEnd ? 'Submit' : 'Next'}
          </button>
        </div>
      </div>
    </form>
  )
}

NewBuildingFormSecondPage = reduxForm({
  form: 'newBuilding',
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: false,
  keepDirtyOnReinitialize: true,
  validate
})(NewBuildingFormSecondPage)

const selector = formValueSelector('newBuilding')
NewBuildingFormSecondPage = connect(state => {
  const country = selector(state, 'country')
  return {
    country
  }
})(NewBuildingFormSecondPage)

export default NewBuildingFormSecondPage
