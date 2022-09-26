import React, { useMemo } from 'react'
import { Field, reduxForm } from 'redux-form'
import classNames from 'classnames'
import styles from './NewBuildingForm.scss'
import validate from '../FormFields/validate'
import { RenderField, RenderSelect } from '../FormFields'
import { Loader } from 'utils/Loader'
import { formatCamelCaseNotation } from 'utils/Utils'
import contactRoles from 'static/contact-roles.json'
import industryTypes from 'static/building-industry-types'

const NewBuildingFormLastPage = props => {
  const {
    handleSubmit,
    pristine,
    previousPage,
    submitting,
    disableSubmit,
    options,
    change
  } = props
  let { contactRoleOptions = null } = options

  if (!contactRoleOptions || contactRoleOptions.length == 0) {
    contactRoleOptions = contactRoles
  } else {
    if (contactRoleOptions.length > 0) {
      change('role', contactRoleOptions[0])
    }
  }

  let contactFieldsOrder = [
    'firstName',
    'lastName',
    'title',
    'company',
    'phoneNumber',
    'emailAddress',
    'role'
  ]

  const {
    disabledCreateBuildingFields = [],
    newCreateBuildingFields = [],
    enabledBuildingFields = [],
    disabledCreateBuildingPages = [],
    isCustomForm = false,
    disabledBuildingUseType = []
  } = options
  const newFields = newCreateBuildingFields.filter(field => field.page === 7)

  const isDefaultForm = useMemo(() => {
    if (isCustomForm) return false
    if (disabledCreateBuildingPages.length > 0) return false
    if (disabledCreateBuildingFields.length > 0) return false
    if (newCreateBuildingFields.length > 0) return false
    if (enabledBuildingFields.length > 0) return false
    if (disabledBuildingUseType.length > 0) return false
    return true
  }, [
    disabledCreateBuildingFields,
    newCreateBuildingFields,
    enabledBuildingFields,
    isCustomForm,
    disabledCreateBuildingPages,
    disabledBuildingUseType
  ])

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

  const showIndustry =
    (isDefaultForm && enabledBuildingFields.includes('clientIndustry')) ||
    (!isDefaultForm && !disabledCreateBuildingFields.includes('clientIndustry'))

  return (
    <form onSubmit={handleSubmit}>
      {!disabledCreateBuildingFields.includes('contacts') && (
        <div>
          <label>Who is the primary contact at this site?</label>
          <div className={styles.contactContainer}>
            {contactFieldsOrder.map(field => {
              if (field === 'role') {
                return (
                  <Field
                    label={formatCamelCaseNotation(field)}
                    id={field}
                    name={field}
                    component={RenderSelect}
                    key={field}
                    className={styles.roleContainer}
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    {contactRoleOptions.map((option, index) => {
                      return (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      )
                    })}
                  </Field>
                )
              }
              return (
                <Field
                  label={formatCamelCaseNotation(field)}
                  id={field}
                  name={field}
                  component={RenderField}
                  type="text"
                  key={field}
                  required={false}
                />
              )
            })}
          </div>
        </div>
      )}

      {showIndustry && (
        <Field
          label="Client Industry"
          id="clientIndustry"
          name="clientIndustry"
          component={RenderSelect}
          required={false}
        >
          <option value="" disabled>
            Select an industry
          </option>
          {industryTypes.map(({ name, value }, index) => {
            return (
              <option key={index} value={value}>
                {name}
              </option>
            )
          })}
        </Field>
      )}

      {newFields.map((field, index) => {
        return <div key={field.title}>{renderNewField(field)}</div>
      })}

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
        {disableSubmit && (
          <button
            className={classNames(
              styles.button,
              styles.buttonPrimary,
              styles.buttonDisable
            )}
            type="submit"
            disabled={pristine || submitting}
          >
            <Loader size="button" color="white" />
          </button>
        )}
        {!disableSubmit && (
          <button
            className={classNames(styles.button, styles.buttonPrimary)}
            type="submit"
            disabled={pristine || submitting}
          >
            Submit
          </button>
        )}
      </div>
    </form>
  )
}

export default reduxForm({
  form: 'newBuilding', //                 <------ same form name
  destroyOnUnmount: true, //        <------ preserve form data
  forceUnregisterOnUnmount: true,
  validate
})(NewBuildingFormLastPage)
