import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import _ from 'lodash'
import { ToggleTab } from 'components/Asset/ToggleTab'
import {
  filterBuildingEquipment,
  filterBuildingEquipmentByType,
  getEquipmentSelectFieldsString,
  getQualifiedFlag,
  getDropDownOptionsForXcelMeasure,
  getEquipmentQuantity,
  getEquipmentFieldsString,
  evaluateCondition,
  evaluateConditions
} from 'utils/Project'
import { formatNumbersWithCommas } from 'utils/Utils'
import styles from './ProjectFields.scss'

export class ProjectFields extends React.Component {
  static propTypes = {
    fields: PropTypes.array.isRequired,
    formValues: PropTypes.object.isRequired,
    handleChange: PropTypes.func.isRequired,
    building: PropTypes.object
  }

  state = {
    fieldsSeparated: false,
    existingFields: [],
    replacementFields: [],
    hasAdvancedField: false
  }

  componentDidMount = () => {
    this.organizeFields()
  }

  organizeFields = () => {
    const { fields } = this.props

    const advancedField = _.find(fields, { name: 'advanced' })
    const hasAdvancedField = !!advancedField

    let fieldsToBeSeparated = fields.some(field => {
      return field.existing || field.replacement
    })

    if (fieldsToBeSeparated) {
      this.setState({ fieldsSeparated: true })

      let tempExisting = [...this.state.existingFields]
      let tempReplacement = [...this.state.replacementFields]

      fields
        .filter(field => field.name !== 'advanced')
        .map(field => {
          if (field.existing) {
            tempExisting.push(field)
          }
          if (field.replacement) {
            tempReplacement.push(field)
          }
        })

      this.setState({
        existingFields: tempExisting,
        replacementFields: tempReplacement,
        hasAdvancedField
      })
    } else {
      this.setState({ hasAdvancedField })
    }
  }

  renderField = field => {
    const { projectName } = this.props

    // SHOW/HIDE/LOCK fields conditionally
    let conditionalState = field.conditionalState
    if (conditionalState) {
      for (let opt of conditionalState) {
        let conditionAccepted = evaluateConditions(
          opt.conditions,
          this.props.formValues
        )
        if (conditionAccepted) {
          field.state = opt.state
          break
        }
      }
    }

    if (field.hide || field.state === 'HIDE') return
    if (field.type === 'number' || field.type === 'decimal') {
      if (
        field.name === 'xcelLEDLighting_replace_wattage' &&
        (this.props.formValues['xcelLEDLighting_rebate_type'] === '' ||
          this.props.formValues['xcelLEDLighting_rebate'] === '')
      )
        return
      return (
        <div
          className={styles.projectsFieldsInput}
          style={{ display: field.state === 'HIDE' ? 'none' : 'block' }}
        >
          <label htmlFor={field.name}>
            {field.label}
            {field.required === false ? '' : '*'}
          </label>
          <input
            required
            value={this.props.formValues[field.name] || ''}
            name={field.name}
            type="number"
            step={field.type === 'number' ? '.01' : '.0001'}
            placeholder=" "
            onChange={e => this.props.handleChange(e)}
            disabled={field.state === 'LOCK' ? 'disabled' : ''}
            onWheel={e => e.target.blur()}
          />
          <small>{field.description}</small>
        </div>
      )
    } else if (field.type === 'boolean' || field.type === 'bool') {
      return (
        <div className={styles.projectsFieldsInput}>
          <label>
            {field.label}
            {field.required === false ? '' : '*'}
          </label>
          <div className={styles.radioContainer}>
            <label>
              <input
                type="radio"
                name={field.name}
                value={true}
                checked={this.props.formValues[field.name] === true}
                onChange={e => this.props.handleChange(e, 'boolean')}
              />
              <span>Yes</span>
            </label>
            <label>
              <input
                type="radio"
                name={field.name}
                value={false}
                checked={this.props.formValues[field.name] === false}
                onChange={e => this.props.handleChange(e, 'boolean')}
              />
              <span>No</span>
            </label>
          </div>
          <small>{field.description}</small>
        </div>
      )
    } else if (field.type === 'select') {
      let options = field.options || []

      let conditionalOptions = field.conditionalOptions
      if (conditionalOptions) {
        let validOptions = []
        let allCondOptions = []
        for (let opt of conditionalOptions) {
          let conditionAccepted = evaluateConditions(
            opt.conditions,
            this.props.formValues
          )

          if (opt.options) {
            allCondOptions = allCondOptions.concat(opt.options)
          } else {
            allCondOptions.push({ label: opt.label, value: opt.value })
          }

          if (conditionAccepted) {
            if (opt.options) {
              validOptions = validOptions.concat(opt.options)
            } else {
              validOptions.push({ label: opt.label, value: opt.value })
            }
          }
        }
        for (let condOpt of allCondOptions) {
          let existingIndex = field.options.findIndex(function(i) {
            return i.value === condOpt.value
          })
          if (existingIndex >= 0) field.options.splice(existingIndex, 1)
        }
        for (let condOpt of validOptions)
          field.options.push({
            label: condOpt.label,
            value: condOpt.value
          })
      }

      if (field.name === 'retrofit_equipment__v2') {
        let existingEquipmentId = this.props.formValues[
          'existing_equipment__v2'
        ]
        let existingEquipment = this.props.buildingEquipment.find(
          item => item._id === existingEquipmentId
        )
        let existingEquipmentName = null
        if (existingEquipment) {
          existingEquipmentName = existingEquipment.libraryEquipment.name
        }
        let foundLogic = false
        for (let logic of field.logic) {
          if (logic.type === 'IF') {
            // TODO: expand logic options
            if (existingEquipmentName === logic.comparison.value) {
              foundLogic = true
              options = [
                {
                  label: 'Other Equipment',
                  value: ''
                },
                ...logic.options
              ]
            }
          } else if (logic.type === 'ELSE' && !foundLogic) {
            options = logic.options
          }
        }
      }

      if (field.name === 'existing_equipment__v2') {
        /* this is similar to existing_equipment but relies entirely on the database field configuration */
        options = [
          {
            label: 'Select Equipment',
            value: '',
            disabled: true
          }
        ]

        let buildingEquipment = []
        let options1 = []
        if (field.equipment) {
          /* only one equipment type */
          buildingEquipment = filterBuildingEquipmentByType(
            this.props.buildingEquipment,
            field.equipment.type
          )
          options1 = buildingEquipment.map(equipment => {
            let { label, disabled } = getEquipmentSelectFieldsString(
              field.equipment.fields,
              equipment,
              this.props.building
            )
            return {
              label: label,
              // value: equipment.libraryEquipment.name,
              value: equipment._id
              // disabled: disabled
            }
          })
        } else {
          /* multiple equipment types */
          for (let fieldEquipment of field.equipments) {
            let be = filterBuildingEquipmentByType(
              this.props.buildingEquipment,
              fieldEquipment.type
            )
            buildingEquipment = buildingEquipment.concat(be)
            options1 = options1.concat(
              be.map(equipment => {
                let { label, disabled } = getEquipmentSelectFieldsString(
                  fieldEquipment.fields,
                  equipment,
                  this.props.building
                )
                return {
                  label: label,
                  // value: equipment.libraryEquipment.name,
                  value: equipment._id
                  // disabled: disabled
                }
              })
            )
          }
        }
        options = [...options, ...options1]

        if (field.equipment_2) {
          buildingEquipment = filterBuildingEquipmentByType(
            this.props.buildingEquipment,
            field.equipment_2.type
          )
          let options2 = buildingEquipment.map(equipment => {
            let { label, disabled } = getEquipmentSelectFieldsString(
              field.equipment_2.fields,
              equipment,
              this.props.building
            )
            return {
              label: label,
              // value: equipment.libraryEquipment.name,
              value: equipment._id,
              disabled: disabled
            }
          })
          options = [...options, ...options2]
        }
      } else if (field.name === 'existing_equipment') {
        let buildingEquipment = filterBuildingEquipment(
          this.props.buildingEquipment,
          {
            category: 'LIGHTING'
          }
        )
        options = buildingEquipment.map(equipment => {
          let label =
            (equipment.libraryEquipment && equipment.libraryEquipment.name) ||
            ''
          if (label) {
            let totalWattage =
              (equipment.libraryEquipment &&
                equipment.libraryEquipment.fields &&
                equipment.libraryEquipment.fields.totalWattage &&
                equipment.libraryEquipment.fields.totalWattage.value) ||
              0
            label = `${label} - ${
              totalWattage ? formatNumbersWithCommas(totalWattage) : 0
            }W, Qty - ${getEquipmentQuantity(
              equipment,
              'fixture'
            )}, Lamp Qty - ${getEquipmentQuantity(equipment)}`
          }
          return {
            label: label,
            value: equipment._id
          }
        })
        options = [
          {
            label: 'Select Equipment',
            value: ''
          },
          ...options
        ]
      } else if (field.name === 'xcelLEDLighting_rebate') {
        options =
          field.options[this.props.formValues['xcelLEDLighting_rebate_type']]
        if (this.props.formValues['xcelLEDLighting_rebate_type'] === '') return
      } else if (
        field.name === 'dlc_qualified' ||
        field.name === 'energy_star_qualified'
      ) {
        let flag = getQualifiedFlag(
          field.name,
          this.props.formValues['xcelLEDLighting_rebate']
        )
        if (!flag) return
      } else if (field.name === `${projectName}RebateType`) {
        options = getDropDownOptionsForXcelMeasure(
          projectName,
          field,
          this.props.formValues
        )
      }
      return (
        <div className={styles.projectsFieldsInput}>
          <label>
            {field.label}
            {field.required === false ? '' : '*'}
          </label>
          <div className={styles.selectContainer}>
            <select
              name={field.name}
              value={this.props.formValues[field.name] || field.default}
              onChange={e => this.props.handleChange(e)}
            >
              {options &&
                options.map((option, index) => {
                  return (
                    <option
                      key={index}
                      value={option.value}
                      disabled={option.disabled || false}
                    >
                      {option.label}
                    </option>
                  )
                })}
            </select>
          </div>
          <small>{field.description}</small>
        </div>
      )
    } else if (field.type === 'selectAndNumber') {
      let value = this.props.formValues[field.name] || field.default
      let inputValue = null
      if (
        typeof value === 'string' &&
        value.split(' / ')[0].toLowerCase() === 'other'
      ) {
        inputValue = +value.split(' / ')[1]
      }
      return (
        <div>
          <div className={styles.projectsFieldsInput}>
            <label>
              {field.label}
              {field.required === false ? '' : '*'}
            </label>
            <div className={styles.selectContainer}>
              <select
                name={field.name}
                value={value}
                onChange={e => this.props.handleChange(e, 'selectAndNumber')}
              >
                {field.options &&
                  field.options.map((option, index) => {
                    if (
                      option.value.toLowerCase() === 'other' &&
                      value.split(' / ')[0].toLowerCase() === 'other'
                    ) {
                      return (
                        <option key={index} value={value}>
                          {option.label}
                        </option>
                      )
                    }
                    return (
                      <option key={index} value={option.value}>
                        {option.label}
                      </option>
                    )
                  })}
              </select>
            </div>
            <p />
            {inputValue !== null && (
              <input
                required
                value={inputValue}
                name={field.name}
                type="number"
                step=".01"
                placeholder=" "
                onChange={e =>
                  this.props.handleChange(e, 'selectAndNumber', 'input')
                }
              />
            )}
            <small>{field.description}</small>
          </div>
        </div>
      )
    } else {
      if (
        field.name === 'xcelLEDLighting_replace_name' &&
        (this.props.formValues['xcelLEDLighting_rebate_type'] === '' ||
          this.props.formValues['xcelLEDLighting_rebate'] === '')
      )
        return
      return (
        <div className={styles.projectsFieldsInput}>
          <label htmlFor={field.name}>
            {field.label}
            {field.required === false ? '' : '*'}
          </label>
          <input
            required
            value={this.props.formValues[field.name] || ''}
            name={field.name}
            placeholder=" "
            onChange={e => this.props.handleChange(e)}
            disabled={field.state === 'LOCK' ? 'disabled' : ''}
          />
          <small>{field.description}</small>
        </div>
      )
    }
  }

  renderAdvancedField = () => {
    const { fields = [] } = this.props
    const advancedField = _.find(fields, { name: 'advanced' })
    const defaultOption = advancedField.default || 'No'
    const options = [
      {
        value: 'No',
        name: 'Basic'
      },
      {
        value: 'Yes',
        name: 'Advanced'
      }
    ]
    return (
      <div className={styles['advanced']}>
        <ToggleTab
          options={options}
          defaultOption={this.props.formValues['advanced'] || defaultOption}
          onToggle={value => {
            this.props.handleChange({
              target: {
                name: 'advanced',
                value: value
              }
            })
          }}
        />
      </div>
    )
  }

  render() {
    const { fields } = this.props
    const {
      fieldsSeparated,
      existingFields,
      replacementFields,
      hasAdvancedField
    } = this.state

    return (
      <div
        className={classNames(
          styles.projectsFields,
          !fieldsSeparated ? styles.labelNoTopMargin : ''
        )}
      >
        {!!hasAdvancedField && this.renderAdvancedField()}
        {!fieldsSeparated &&
          fields.map((field, index) => {
            return (
              <div key={index} className={styles.projectsFieldsSingle}>
                {this.renderField(field)}
              </div>
            )
          })}

        {fieldsSeparated && existingFields.length > 0 && (
          <div className={styles.projectsFieldsExisting}>
            <h3>Existing Condition</h3>
            {existingFields.map((field, index) => {
              return (
                <div key={index} className={styles.projectsFieldsSingle}>
                  {this.renderField(field)}
                </div>
              )
            })}
          </div>
        )}

        {fieldsSeparated && replacementFields.length > 0 && (
          <div className={styles.projectsFieldsReplacement}>
            <h3>Retrofit Design</h3>
            {replacementFields.map((field, index) => {
              return (
                <div key={index} className={styles.projectsFieldsSingle}>
                  {this.renderField(field)}
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }
}

export default ProjectFields
