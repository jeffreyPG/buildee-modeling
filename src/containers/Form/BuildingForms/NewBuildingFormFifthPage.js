import React from 'react'
import { Field, reduxForm } from 'redux-form'
import validate from '../FormFields/validate'
import { RenderField, RenderSelect } from '../FormFields'
import classNames from 'classnames'
import styles from './NewBuildingForm.scss'

const renderError = ({ meta: { touched, error } }) =>
  touched && error ? <span>{error}</span> : false

const NewBuildingFormFifthPage = props => {
  const { handleSubmit, previousPage, change, options, isEnd } = props
  const {
    disabledCreateBuildingFields = [],
    newCreateBuildingFields = [],
    labels = {}
  } = options
  const newFields = newCreateBuildingFields.filter(field => field.page === 5)

  const skip = () => {
    change('buildYear', '')
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
      {!disabledCreateBuildingFields.includes('buildYear') && (
        <Field
          label={
            labels?.buildYear ||
            'When was your building constructed? Or, when was the last major renovation?'
          }
          id="buildYear"
          name="buildYear"
          component={RenderField}
          type="number"
          min="1"
          placeholder="Year"
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

export default reduxForm({
  form: 'newBuilding', //                 <------ same form name
  destroyOnUnmount: false, //        <------ preserve form data
  forceUnregisterOnUnmount: true,
  validate
})(NewBuildingFormFifthPage)
