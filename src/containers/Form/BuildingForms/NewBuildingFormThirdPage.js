import React from 'react'
import { connect } from 'react-redux'
import { Field, reduxForm, formValueSelector } from 'redux-form'
import classNames from 'classnames'
import UseTypeDropDown from 'components/UI/UseTypeDropDown'
import { RenderField, RenderSelect } from '../FormFields'
import styles from './NewBuildingForm.scss'
import buildingDetailsEditStyle from 'containers/Form/BuildingForms/BuildingDetailsEdit.scss'
import validate from '../FormFields/validate'

let NewBuildingFormThirdPage = props => {
  const {
    handleSubmit,
    previousPage,
    change,
    options,
    buildingUse,
    isEnd
  } = props
  const {
    disabledCreateBuildingFields = [],
    newCreateBuildingFields = [],
    disabledBuildingUseType = [],
    onlyAvailableBuildingUseType = []
  } = options
  const newFields = newCreateBuildingFields.filter(field => field.page === 3)

  const skip = () => {
    change('buildingUse', '')
    change('open247', '')
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

  let disabledBuildingUseTypes = disabledBuildingUseType.map(item =>
    item.toLowerCase()
  )
  let onlyAvailableBuildingUseTypes = onlyAvailableBuildingUseType.map(item =>
    item.toLowerCase()
  )

  return (
    <form onSubmit={handleSubmit}>
      <div>
        {!disabledCreateBuildingFields.includes('buildingUse') && (
          <div
            className={classNames(
              styles.buildingUseType,
              buildingDetailsEditStyle.useTypeDropdownContainer
            )}
          >
            <label htmlFor="buildingUse">What is the building used for?</label>
            <UseTypeDropDown
              removeUseTypes={disabledBuildingUseTypes}
              onlyAvailableBuildingUseTypes={onlyAvailableBuildingUseTypes}
              useType={buildingUse}
              onChange={value => change('buildingUse', value)}
            />
          </div>
        )}
        {!disabledCreateBuildingFields.includes('open247') && (
          <Field
            label="Is your building open 24/7?"
            id="open247"
            name="open247"
            component={RenderSelect}
            required={false}
          >
            <option value="" disabled>
              Select
            </option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </Field>
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
              className={classNames(
                styles.button,
                styles.buttonPrimary,
                'next'
              )}
            >
              {isEnd ? 'Submit' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}

NewBuildingFormThirdPage = reduxForm({
  form: 'newBuilding',
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true,
  validate
})(NewBuildingFormThirdPage)

const selector = formValueSelector('newBuilding')
NewBuildingFormThirdPage = connect(state => {
  const buildingUse = selector(state, 'buildingUse')
  return {
    buildingUse
  }
})(NewBuildingFormThirdPage)

export default NewBuildingFormThirdPage
