import React from 'react'
import { Field, reduxForm } from 'redux-form'
import validate from '../FormFields/validate'
import { RenderField, RenderSelect } from '../FormFields'

import classNames from 'classnames'
import styles from './NewBuildingForm.scss'

const NewBuildingFormFirstPage = props => {
  const {
    handleSubmit,
    options = {},
    isEnd,
    manageAllOrgSelected,
    organizationList
  } = props
  const {
    disabledCreateBuildingFields = [],
    newCreateBuildingFields = []
  } = options

  const newFields = newCreateBuildingFields.filter(field => field.page === 1)

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
      <Field
        label="Name Your Building*"
        id="buildingName"
        name="buildingName"
        component={RenderField}
        type="text"
        placeholder="Building Name"
      />
      {manageAllOrgSelected && (
        <Field
          label={'Organization*'}
          id={'organisatio'}
          name={'orgId'}
          component={RenderSelect}
          required
        >
          <option defaultValue value="" disabled>
            Select Organization
          </option>
          {organizationList.map(org => (
            <option key={`${org._id}-option`} value={org._id}>
              {org.name}
            </option>
          ))}
        </Field>
      )}
      {!disabledCreateBuildingFields.includes('siteName') && (
        <Field
          label="Is it a Part of a Campus or Complex? Provide a Shared Site Name."
          id="siteName"
          name="siteName"
          component={RenderField}
          type="text"
          placeholder="Site Name"
          required={false}
        />
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
            styles.buttonDisable
          )}
          disabled
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
    </form>
  )
}

export default reduxForm({
  form: 'newBuilding',
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: false,
  //keepDirtyOnReinitialize: true,
  validate
})(NewBuildingFormFirstPage)
