import React, { useMemo } from 'react'
import { Field, reduxForm } from 'redux-form'
import validate from '../FormFields/validate'
import classNames from 'classnames'
import styles from './NewBuildingForm.scss'
import CheckboxGroup from './CheckboxGroup'
import Checkbox from './Checkbox'
import { RenderField, RenderSelect } from '../FormFields'
import { isEmpty } from 'lodash'

const renderError = ({ meta: { touched, error } }) =>
  touched && error ? <span>{error}</span> : false
const utilityTypes = [
  { id: 'electric', name: 'Electricity' },
  { id: 'fuel-oil-2', name: 'Fuel Oil 2' },
  { id: 'steam', name: 'Steam' },
  { id: 'natural-gas', name: 'Natural Gas' },
  { id: 'fuel-oil-4', name: 'Fuel Oil 4' },
  { id: 'diesel', name: 'Diesel' },
  { id: 'water', name: 'Water' },
  { id: 'fuel-oil-5-6', name: 'Fuel Oil 5 & 6' },
  { id: 'other', name: 'Other' }
]
const clearResultUtilityTypes = [
  { id: 'electric', name: 'Electricity' },
  { id: 'natural-gas', name: 'Natural Gas' }
]

const NewBuildingFormSixthPage = props => {
  const {
    handleSubmit,
    previousPage,
    change,
    options,
    isEnd,
    blendedRates
  } = props
  const {
    disabledCreateBuildingFields = [],
    newCreateBuildingFields = [],
    hasUtility = false,
    hasUtilityInput = false,
    availableUtilityTypes = []
  } = options
  const newFields = newCreateBuildingFields.filter(field => field.page === 6)

  const skip = () => {
    change('utilityTypes', [])
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

  const exactUtilityTypes = useMemo(() => {
    if (hasUtility) {
      if (isEmpty(availableUtilityTypes)) return clearResultUtilityTypes
      return clearResultUtilityTypes.filter(item =>
        availableUtilityTypes.includes(item.id)
      )
    }
    if (availableUtilityTypes.length === 0) return utilityTypes
    return utilityTypes.filter(({ id }) => availableUtilityTypes.includes(id))
  }, [utilityTypes, availableUtilityTypes, hasUtility])

  return (
    <form onSubmit={handleSubmit}>
      <label>Check all of those that apply to this building</label>{' '}
      {!disabledCreateBuildingFields.includes('utilityTypes') &&
        !hasUtility && (
          <Field
            name="utilityTypes"
            component={CheckboxGroup}
            options={exactUtilityTypes}
            required={false}
          />
        )}
      {!disabledCreateBuildingFields.includes('utilityTypes') &&
        !!hasUtility && (
          <Field
            name="utilityTypes"
            component={Checkbox}
            options={exactUtilityTypes}
            required={false}
            blendedRates={blendedRates}
            hasUtilityInput={!!hasUtilityInput}
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

export default reduxForm({
  form: 'newBuilding', //                 <------ same form name
  destroyOnUnmount: false, //        <------ preserve form data
  forceUnregisterOnUnmount: true,
  validate
})(NewBuildingFormSixthPage)
