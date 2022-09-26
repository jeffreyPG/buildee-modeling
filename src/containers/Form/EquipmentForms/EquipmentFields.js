import React from 'react'
import PropTypes from 'prop-types'
import styles from './EquipmentFields.scss'
import Field from '../FormFields/Field'
import equipmentFuels from '../../../static/equipment-fuels'
import { getFieldType } from './selectors'

export default class EquipmentFields extends React.Component {
  static propTypes = {
    disabled: PropTypes.bool,
    fields: PropTypes.array,
    values: PropTypes.object,
    setFieldValue: PropTypes.func,
    showPrimaryField: PropTypes.bool
  }

  defaultProps = {
    fields: []
  }

  UNSAFE_componentWillMount = () => {
    let fields = this.props.fields.filter(
      item => item.field === 'totalInputPower'
    )
    if (fields.length) {
      let numberOfLamps =
        (this.props.values &&
          this.props.values.fields &&
          this.props.values.fields.numberOfLamps &&
          this.props.values.fields.numberOfLamps.value) ||
        0

      let lampInputPower =
        (this.props.values &&
          this.props.values.fields &&
          this.props.values.fields.lampInputPower &&
          this.props.values.fields.lampInputPower.value) ||
        0

      let ballastFactor =
        (this.props.values &&
          this.props.values.fields &&
          this.props.values.fields.ballastFactor &&
          this.props.values.fields.ballastFactor.value) ||
        0
      let totalInputPower = numberOfLamps * lampInputPower * ballastFactor
      if (totalInputPower !== 0)
        this.props.setFieldValue(
          'fields.totalInputPower.value',
          totalInputPower
        )
    }
  }

  UNSAFE_componentWillReceiveProps = nextProps => {
    let fields = nextProps.fields.filter(
      item => item.field === 'totalInputPower'
    )
    if (fields.length) {
      let nextPropsNumberOfLamps =
        (nextProps.values &&
          nextProps.values.fields &&
          nextProps.values.fields.numberOfLamps &&
          nextProps.values.fields.numberOfLamps.value) ||
        0

      let nextPropsLampInputPower =
        (nextProps.values &&
          nextProps.values.fields &&
          nextProps.values.fields.lampInputPower &&
          nextProps.values.fields.lampInputPower.value) ||
        0

      let nextPropsBallastFactor =
        (nextProps.values &&
          nextProps.values.fields &&
          nextProps.values.fields.ballastFactor &&
          nextProps.values.fields.ballastFactor.value) ||
        0

      let propsNumberOfLamps =
        (this.props.values &&
          this.props.values.fields &&
          this.props.values.fields.numberOfLamps &&
          this.props.values.fields.numberOfLamps.value) ||
        0

      let propsLampInputPower =
        (this.props.values &&
          this.props.values.fields &&
          this.props.values.fields.lampInputPower &&
          this.props.values.fields.lampInputPower.value) ||
        0

      let propsBallastFactor =
        (this.props.values &&
          this.props.values.fields &&
          this.props.values.fields.ballastFactor &&
          this.props.values.fields.ballastFactor.value) ||
        0

      if (
        nextPropsNumberOfLamps != propsNumberOfLamps ||
        nextPropsLampInputPower != propsLampInputPower ||
        nextPropsBallastFactor != propsBallastFactor
      ) {
        let totalInputPower =
          nextPropsNumberOfLamps *
          nextPropsLampInputPower *
          nextPropsBallastFactor
        if (totalInputPower !== 0) {
          this.props.setFieldValue(
            'fields.totalInputPower.value',
            totalInputPower
          )
        }
      }
    }
  }

  handleNameChanged = e => {
    let fieldName = e.target.name
    let field = fieldName.split('.')[1]
    let value = e.target.value
    field = this.props.fields.filter(item => item.field === field)[0]
    if (getFieldType(field.type) === 'number') {
      value = +value
      if (value === 0) value = ''
    }
    this.props.setFieldValue(fieldName, value)

    if (
      fieldName === 'fields.numberOfLamps.value' ||
      fieldName === 'fields.lampInputPower.value' ||
      fieldName === 'fields.ballastFactor.value'
    ) {
      let numberOfLamps =
        (this.props.values &&
          this.props.values.fields &&
          this.props.values.fields.numberOfLamps &&
          this.props.values.fields.numberOfLamps.value) ||
        0

      let lampInputPower =
        (this.props.values &&
          this.props.values.fields &&
          this.props.values.fields.lampInputPower &&
          this.props.values.fields.lampInputPower.value) ||
        0

      let ballastFactor =
        (this.props.values &&
          this.props.values.fields &&
          this.props.values.fields.ballastFactor &&
          this.props.values.fields.ballastFactor.value) ||
        0

      numberOfLamps = +numberOfLamps
      lampInputPower = +lampInputPower
      ballastFactor = +ballastFactor

      if (fieldName === 'fields.numberOfLamps.value')
        numberOfLamps = +e.target.value
      else if (fieldName === 'fields.lampInputPower.value')
        lampInputPower = +e.target.value
      else ballastFactor = +e.target.value
      let totalInputPower = numberOfLamps * lampInputPower * ballastFactor
      if (totalInputPower !== 0)
        this.props.setFieldValue(
          'fields.totalInputPower.value',
          totalInputPower
        )
    }
  }

  render() {
    const {
      disabled,
      fields,
      fieldOptions,
      values,
      showPrimaryField
    } = this.props

    let hasBallastFactor =
      values.fields.ballastFactor && values.fields.ballastFactor.value > 0
    let hasLampInputPower =
      values.fields.lampInputPower && values.fields.lampInputPower.value > 0
    let hasNumberOfLamps =
      values.fields.numberOfLamps && values.fields.numberOfLamps.value > 0
    let lockTotalInputPowerField =
      hasBallastFactor && hasLampInputPower && hasNumberOfLamps
    return (
      <div className={styles.container}>
        {fields.map(
          ({ display, field, fieldDisplayName, type, values, units, rank }) => {
            if (
              display === false ||
              (showPrimaryField && rank != 'PRIMARY') ||
              (!showPrimaryField && rank === 'PRIMARY')
            )
              return null

            if (!values) {
              const fieldType = getFieldType(type)
              const fieldStep = type === 'float' ? 'any' : '1'
              return (
                <Field
                  disabled={
                    disabled ||
                    (field === 'totalInputPower' && lockTotalInputPowerField)
                  }
                  key={`equipment-input-field-${field}-${disabled}`}
                  data-test={`equipment-field-${field}`}
                  label={fieldDisplayName}
                  name={`fields.${field}.value`}
                  type={fieldType}
                  min={
                    fieldOptions &&
                    fieldOptions.min &&
                    fieldOptions.min(fieldType, field)
                  }
                  step={fieldType === 'number' ? fieldStep : undefined}
                  adornment={units && <div>{units}</div>}
                  onChange={e => {
                    if (
                      !(
                        disabled ||
                        (field === 'totalInputPower' &&
                          lockTotalInputPowerField)
                      )
                    )
                      this.handleNameChanged(e)
                  }}
                />
              )
            }
            return (
              <Field
                component='select'
                disabled={disabled}
                label={fieldDisplayName}
                key={`equipment-select-field-${field}`}
                data-test={`equipment-field-${field}`}
                adornment={units && <div>{units}</div>}
                name={`fields.${field}.value`}
              >
                <option value={null} defaultValue>
                  Select an option
                </option>
                {values.map(value => (
                  <option value={value} key={`options-${field}-${value}`}>
                    {value}
                  </option>
                ))}
              </Field>
            )
          }
        )}
        {!showPrimaryField && (
          <Field
            component='select'
            disabled={disabled}
            data-test={'equipment-field-fuel'}
            label={'Fuel'}
            name={'fuel'}
            type={'text'}
          >
            <option defaultValue value=''>
              Select fuel type
            </option>
            {equipmentFuels.map(({ label, value }) => (
              <option value={value} key={`options-${label}-${value}`}>
                {label}
              </option>
            ))}
          </Field>
        )}
      </div>
    )
  }
}
