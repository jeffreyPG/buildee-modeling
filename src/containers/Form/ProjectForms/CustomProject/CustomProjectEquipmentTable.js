import React, { Component } from 'react'
import classNames from 'classnames'
import _, { round } from 'lodash'
import uuid from 'uuid'

// utils
import {
  filterBuildingEquipment,
  filterBuildingEquipmentByType,
  getEquipmentSelectFieldsString,
  getQualifiedFlag,
  getDropDownOptionsForXcelMeasure,
  getEquipmentQuantity,
  evaluateConditions,
  getValueForXcelMeasure,
  evaluateFormula
} from 'utils/Project'
import { parentNodeHasClass, findGroupUniqueName } from 'utils/Utils'
import { xcelMeasureNameList } from 'utils/xcelMeasures'

// components
import {
  numberWithCommas,
  getAnnualSavings,
  getProjectCost,
  getIncentive,
  getTotalEnergySavings,
  getEnergySavings,
  getROI,
  getSimplePayback,
  getNPV,
  getSIR,
  replaceHTMLEntities,
  getGHGSavingsCost,
  getGasSavingsCost,
  getDemandSavings,
  getEUL,
  getMaintenanceSavings,
  getCalculationType
} from 'components/Project/ProjectHelpers'
import CustomProjectEquipmentExtraDropdown from './CustomProjectEquipmentExtraDropdown'
import CustomProjectFinancialModal from './CustomProjectFinancialModal'

// styles
import styles from './CustomProjectEquipmentTable.scss'
import projectFieldStyles from '../../ProjectForms/ProjectFields.scss'

class CustomProjectEquipmentTable extends Component {
  state = {
    fieldsSeparated: false,
    existingFields: [],
    replacementFields: [],
    isGroupNameEditing: false,
    groupName: '',
    selectedGroupId: null,
    showExtras: '',
    financialMode: false,
    newFinancialGroup: null,
    selectedEquipmentId: null,
    extraFinancialFields: [
      {
        name: 'Hard Costs',
        label: 'Hard Costs',
        layout: 3,
        subFields: [
          {
            name: 'Materials Unit Cost',
            label: 'material_unit_cost',
            unit: '$/unit'
          },
          { name: 'Quantity', label: 'material_quantity', unit: '' },
          { name: 'Total Materials Cost', label: 'material_cost', unit: '$' },
          { name: 'Labor Rate', label: 'labor_rate', unit: '$/hr' },
          { name: 'Hours', label: 'hours', unit: 'hrs' },
          { name: 'Total Labor Cost', label: 'total_labor_cost', unit: '$' },
          { name: 'Labor/Unit Cost', label: 'labor_unit_cost', unit: '$/unit' },
          { name: 'Labor Quantity', label: 'labor_quantity', unit: '' },
          {
            name: 'Site-Specific Installation Factors',
            label: 'installation_factors',
            unit: '$'
          },
          {
            name: 'Utility Service Upgrades',
            label: 'utility_service_upgrades',
            unit: '$'
          },
          {
            name: 'Temporary Services',
            label: 'temporary_services',
            unit: '$'
          },
          {
            name: 'Environment Unit Cost',
            label: 'environment_unit_cost',
            unit: '$'
          },
          {
            name: 'Quantity',
            label: 'environment_quantity'
          },
          {
            name: 'Total Environment Unit Cost',
            label: 'total_environment_unit_cost',
            unit: '$'
          },
          { name: 'Contingency', label: 'contingency', unit: '$' },
          { name: 'Profit', label: 'profit', unit: '$' },
          { name: 'Taxes', label: 'taxes', unit: '$' },
          { name: 'Other Hard Costs', label: 'other_hard_cost', unit: '$' },
          { name: 'Total Hard Costs', label: 'total_hard_cost', unit: '$' }
        ]
      },
      {
        name: 'Soft Costs',
        label: 'Soft Costs',
        layout: 3,
        subFields: [
          { name: 'Pre-Design', label: 'pre_design', unit: '$' },
          { name: 'Design Fees', label: 'design_fees', unit: '$' },
          { name: 'Permits & Inspections', label: 'permits', unit: '$' },
          {
            name: 'Construction Management',
            label: 'construction_management',
            unit: '$'
          },
          {
            name: 'Material Handling',
            label: 'material_handling',
            unit: '$'
          },
          {
            name: 'Test and Balancing',
            label: 'test_and_balancing',
            unit: '$'
          },
          { name: 'Commissioning', label: 'commissioning', unit: '$' },
          { name: 'Program Fees', label: 'program_fees', unit: '$' },
          { name: 'Overhead', label: 'overhead', unit: '$' },
          { name: 'Other Soft Costs', label: 'other_soft_cost', unit: '$' },
          { name: 'Total Soft Costs', label: 'total_soft_cost', unit: '$' }
        ]
      },
      {
        name: 'Financing',
        label: 'Financing',
        layout: 2,
        subFields: [
          { name: 'Cost Share', label: 'finance_cost_share', unit: '$' },
          {
            name: 'Cost Share',
            label: 'finance_cost_share_rate',
            unit: '%'
          },
          { name: 'Financing', label: 'finance_finance', unit: '$' },
          {
            name: 'Financing',
            label: 'finance_finance_rate',
            unit: '%'
          }
        ]
      },
      {
        name: 'Funding',
        label: 'Funding',
        layout: 2,
        subFields: [
          { name: 'Cost Share', label: 'fund_cost_share', unit: '$' },
          {
            name: 'Cost Share',
            label: 'fund_cost_share_rate',
            unit: '%'
          },
          { name: 'Funding', label: 'fund_finance', unit: '$' },
          {
            name: 'Funding',
            label: 'fund_finance_rate',
            unit: '%'
          }
        ]
      }
    ],
    lockFields: []
  }

  componentDidMount = () => {
    this.organizeFields()
    document.addEventListener('mousedown', this.handleClick, false)
  }

  componentWillUnmount = () => {
    document.removeEventListener('mousedown', this.handleClick, false)
  }

  handleClick = e => {
    const portal = e.target.closest('#portal')
    if (
      parentNodeHasClass(e.target, 'extrasClick') ||
      parentNodeHasClass(e.target, 'tableMoreInfo') ||
      portal
    ) {
      return
    }
    this.setState({ showExtras: '' })
  }

  handleToggleExtras = index => {
    // toggle off
    if (index === this.state.showExtras) {
      this.setState({ showExtras: '' })
      return
    }
    this.setState({ showExtras: index })
  }

  organizeFields = () => {
    const { currentProject } = this.props
    let { fields = [] } = currentProject

    fields = fields.filter(field => field.name !== 'existing_equipment__v2')

    let fieldsToBeSeparated = fields.some(field => {
      return field.existing || field.replacement
    })

    if (fieldsToBeSeparated) {
      this.setState({ fieldsSeparated: true })

      let tempExisting = [...this.state.existingFields]
      let tempReplacement = [...this.state.replacementFields]

      fields.map(field => {
        let newField = { ...field }
        let conditionalState = newField.conditionalState
        if (conditionalState) {
          for (let opt of conditionalState) {
            let conditionAccepted = evaluateConditions(
              opt.conditions,
              this.props.formValues
            )
            if (conditionAccepted) {
              newField.state = opt.state
              break
            }
          }
        }
        if (newField.hide) return
        if (newField.existing) {
          tempExisting.push(newField)
        }
        if (newField.replacement) {
          tempReplacement.push(newField)
        }
      })

      this.setState({
        existingFields: tempExisting,
        replacementFields: [
          { name: 'Group', label: 'Group' },
          ...tempReplacement
        ]
      })
    }
  }

  showUnitWithRebate = (equipmentId, groupId) => {
    const { currentProject } = this.props
    const name = currentProject.name
    const { groups } = this.props
    let group = _.find(groups, { id: groupId }) || {}
    let tempObj = (group && group.formValues) || {}
    const financialValues = (group && group['financialValues']) || {}
    const equipmentValues = (group && group['equipmentValues']) || {}
    const financialValue =
      (financialValues && financialValues[equipmentId]) || {}
    const equipmentValue =
      (equipmentValues && equipmentValues[equipmentId]) || {}
    const allValues = {
      ...tempObj,
      ...equipmentValue,
      ...financialValue
    }

    if (name === 'xcelWaterOrAirCooledChillers') {
      const data = getValueForXcelMeasure(name, {
        rebate: allValues['xcelWaterOrAirCooledChillersRebateType']
      })
      if (data.incentive.length) {
        const label = [
          `$${data.incentive[0].value} per Ton`,
          `$${data.incentive[1].value} per FLV - ${data.incentive[1].flv_vfd_baseline} kW/ton below base`,
          `$${data.incentive[2].value} per IPLV - ${data.incentive[2].IPlv_vfd_baseline} kW/ton below base`
        ]
        return (
          <td>
            <div className={styles.projectsIncentiveUnit}>
              {label.map((item, index) => (
                <p key={index}>{item}</p>
              ))}
            </div>
          </td>
        )
      }
    } else {
      const {
        incentiveUnit,
        incentiveValue,
        showUnit
      } = this.getXcelMeasureInfo(equipmentId, groupId)
      if (!showUnit) return <td></td>
      return (
        <td>
          ${incentiveValue} per {incentiveUnit}
        </td>
      )
    }
    return null
  }

  checkUnitWithRebate = (equipmentId, groupId, flag) => {
    const { currentProject, groups } = this.props
    const name = currentProject.name
    let group = _.find(groups, { id: groupId }) || {}
    let tempObj = (group && group.formValues) || {}
    const financialValues = (group && group['financialValues']) || {}
    const equipmentValues = (group && group['equipmentValues']) || {}
    const financialValue =
      (financialValues && financialValues[equipmentId]) || {}
    const equipmentValue =
      (equipmentValues && equipmentValues[equipmentId]) || {}
    const allValues = {
      ...tempObj,
      ...equipmentValue,
      ...financialValue
    }

    if (name === 'xcelWaterOrAirCooledChillers') {
      const data = getValueForXcelMeasure(name, {
        rebate: allValues['xcelWaterOrAirCooledChillersRebateType']
      })
      return !!data.incentive.length
    }
    const {
      incentiveUnit,
      incentiveValue,
      costUnit,
      costValue
    } = this.getXcelMeasureInfo(equipmentId, groupId)
    if (flag) return incentiveUnit && incentiveValue
    return costUnit && costValue
  }

  getXcelMeasureInfo(equipmentId, groupId) {
    const { currentProject, groups } = this.props
    const name = currentProject.name
    let group = _.find(groups, { id: groupId }) || {}
    let tempObj = (group && group.formValues) || {}
    const financialValues = (group && group['financialValues']) || {}
    const equipmentValues = (group && group['equipmentValues']) || {}
    const financialValue =
      (financialValues && financialValues[equipmentId]) || {}
    const equipmentValue =
      (equipmentValues && equipmentValues[equipmentId]) || {}
    const allValues = {
      ...tempObj,
      ...equipmentValue,
      ...financialValue
    }

    let showUnit = false,
      incentiveValue = 0,
      costValue = 0,
      incentiveUnit = '',
      costUnit = ''
    if (
      name === 'xcelLEDLighting' &&
      allValues['xcelLEDLighting_rebate_type'] &&
      allValues['xcelLEDLighting_rebate']
    ) {
      ;({
        incentiveValue,
        costValue,
        incentiveUnit,
        costUnit
      } = getValueFromQualifiedOption(
        allValues['xcelLEDLighting_rebate'],
        allValues['dlc_qualified'],
        allValues['energy_star_qualified']
      ))
      showUnit = true
    } else if (xcelMeasureNameList.indexOf(name) !== -1) {
      ;({
        incentiveValue,
        costValue,
        incentiveUnit,
        costUnit
      } = getValueForXcelMeasure(name, {
        rebate: allValues[`${name}RebateType`]
      }))
      showUnit = !!allValues[`${name}RebateType`]
      if (name === 'xcelMotorUpgrade') {
        ;({
          incentiveValue,
          costValue,
          incentiveUnit,
          costUnit
        } = getValueForXcelMeasure(name, {
          rebate: allValues[`${name}RebateType`],
          plan: allValues['measure_enhancement_type']
        }))
      }
    }

    if (allValues['incentive_description']) {
      let incentive_description = allValues['incentive_description']
      let items = incentive_description.split(' per ')
      if (items && items.length >= 2) {
        incentiveValue = incentive_description.split(' per ')[0]
        incentiveUnit = incentive_description.split(' per ')[1]
        showUnit = true
      }
    }
    if (allValues['cost_description']) {
      let cost_description = allValues['cost_description']
      let items = cost_description.split(' per ')
      if (items && items.length >= 2) {
        costValue = cost_description.split(' per ')[0]
        costUnit = cost_description.split(' per ')[1]
        showUnit = true
      }
    }

    return { showUnit, incentiveValue, costValue, incentiveUnit, costUnit }
  }

  checkFinanceUnit = (equipmentId, groupId) => {
    const { showUnit, costValue, costUnit } = this.getXcelMeasureInfo(
      equipmentId,
      groupId
    )
    return showUnit && costValue && costUnit
  }

  showFinanceUnit = (equipmentId, groupId) => {
    const { showUnit, costValue, costUnit } = this.getXcelMeasureInfo(
      equipmentId,
      groupId
    )
    if (!showUnit) return <td className={styles.linkColumn}></td>

    return (
      <td className={styles.linkColumn}>
        ${costValue} per {costUnit}
      </td>
    )
  }

  renderEquipmentName = (name, equipmentId, isUUid) => {
    if (!isUUid) return <td>{name}</td>
    return (
      <td>
        <input
          value={name}
          name='input'
          onChange={e => this.props.handleEquipmentNameChange(e, equipmentId)}
        />
      </td>
    )
  }

  renderDesignField = (field, groupId, equipmentId) => {
    const { groups, currentProject } = this.props
    const { fields = [] } = currentProject
    let projectName = currentProject && currentProject.name

    let group = _.find(groups, { id: groupId }) || {}
    let tempObj = (group && group.formValues) || {}
    let equipmentValues = (group && group.equipmentValues) || {}
    let equipmentValue = equipmentValues[equipmentId] || {}
    let financialValues = (group && group.financialValues) || {}
    let financialValue = (financialValues && financialValues[equipmentId]) || {}
    let formValues = { ...tempObj }
    const isEquipmentField = true
    const allValues = {
      ...formValues,
      ...equipmentValue,
      ...financialValue
    }
    let EquipmentV2Field = fields.find(f => f.name === 'existing_equipment__v2')
    let equipmentData = EquipmentV2Field && EquipmentV2Field.equipment

    // SHOW/HIDE/LOCK fields conditionally
    let conditionalState = field.conditionalState
    if (conditionalState) {
      for (let opt of conditionalState) {
        let conditionAccepted = evaluateConditions(opt.conditions, allValues)
        if (conditionAccepted) {
          field.state = opt.state
          break
        }
      }
    }

    if (field.hide || field.state === 'HIDE') return
    if (field.type === 'number' || field.type === 'decimal') {
      let conditionalValues = field.conditionalValues
      if (conditionalValues) {
        for (let condValue of conditionalValues) {
          let conditionAccepted = evaluateConditions(
            condValue.conditions,
            allValues
          )
          if (conditionAccepted) {
            allValues[field.name] = evaluateFormula(
              condValue.formula,
              allValues
            )
          }
        }
      }

      if (
        field.name === 'xcelLEDLighting_replace_wattage' &&
        (allValues['xcelLEDLighting_rebate_type'] === '' ||
          allValues['xcelLEDLighting_rebate'] === '')
      )
        return
      return (
        <div
          className={projectFieldStyles.projectsFieldsInput}
          style={{ display: field.state === 'HIDE' ? 'none' : 'block' }}
        >
          <input
            required
            value={allValues[field.name] || ''}
            name={field.name}
            type='number'
            step={field.type === 'number' ? '.01' : '.0001'}
            placeholder=' '
            onChange={e =>
              this.props.handleChange(
                { groupId, equipmentId, isEquipmentField, isDesignField: true },
                e
              )
            }
            disabled={field.state === 'LOCK' ? 'disabled' : ''}
            onWheel={e => e.target.blur()}
          />
        </div>
      )
    } else if (field.type === 'boolean' || field.type === 'bool') {
      return (
        <div className={projectFieldStyles.projectsFieldsInput}>
          <div className={projectFieldStyles.radioContainer}>
            <label>
              <input
                type='radio'
                name={field.name}
                value={true}
                checked={allValues[field.name] === true}
                onChange={e =>
                  this.props.handleChange(
                    {
                      groupId,
                      equipmentId,
                      isEquipmentField,
                      isDesignField: true
                    },
                    e,
                    'boolean'
                  )
                }
              />
              <span>Yes</span>
            </label>
            <label>
              <input
                type='radio'
                name={field.name}
                value={false}
                checked={allValues[field.name] === false}
                onChange={e =>
                  this.props.handleChange(
                    {
                      groupId,
                      equipmentId,
                      isEquipmentField,
                      isDesignField: true
                    },
                    e,
                    'boolean'
                  )
                }
              />
              <span>No</span>
            </label>
          </div>
        </div>
      )
    } else if (field.type === 'select') {
      let options = field.options || []

      let conditionalOptions = field.conditionalOptions
      if (conditionalOptions) {
        let validOptions = []
        let allCondOptions = []
        for (let opt of conditionalOptions) {
          let conditionAccepted = evaluateConditions(opt.conditions, allValues)

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

        /* Check if current selection is valid, reset to first option if not */
        let allOptions = []
        for (let opt of field.options) allOptions.push(opt.value)
        if (allOptions.indexOf(allValues[field.name]) === -1)
          allValues[field.name] = allOptions[0]
      }

      if (field.name === 'retrofit_equipment__v2') {
        let existingEquipmentId = allValues['existing_equipment__v2']
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

        let buildingEquipment = filterBuildingEquipmentByType(
          this.props.buildingEquipment,
          field.equipment.type
        )
        let options1 = buildingEquipment.map(equipment => {
          let { label, disabled } = getEquipmentSelectFieldsString(
            (field && field.equipment && field.equipment.fields) || [],
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
        options = field.options[allValues['xcelLEDLighting_rebate_type']]
        if (allValues['xcelLEDLighting_rebate_type'] === '') return
      } else if (
        field.name === 'dlc_qualified' ||
        field.name === 'energy_star_qualified'
      ) {
        let flag = getQualifiedFlag(
          field.name,
          allValues['xcelLEDLighting_rebate']
        )
        if (!flag) return
      } else if (field.name === `${projectName}RebateType`) {
        options = getDropDownOptionsForXcelMeasure(
          projectName,
          field,
          allValues
        )
      }
      let defaultValue = allValues[field.name] || field.default
      if (field.name === 'xcelLEDLighting_rebate') {
        defaultValue = allValues[field.name]
      }
      return (
        <div className={projectFieldStyles.projectsFieldsInput}>
          <div className={projectFieldStyles.selectContainer}>
            <select
              key={`defaultValue-${defaultValue}`}
              defaultValue={defaultValue}
              onChange={e => {
                let event = {
                  target: {
                    value: e.target.value,
                    name: field.name
                  }
                }
                this.props.handleChange(
                  {
                    groupId,
                    equipmentId,
                    isEquipmentField,
                    isDesignField: true
                  },
                  event
                )
              }}
            >
              {options &&
                options.map((option, index) => {
                  return (
                    <option
                      key={index}
                      value={option.value}
                      defaultValue={
                        (allValues[field.name] || field.default) ===
                        option.value
                      }
                      disabled={option.disabled || false}
                    >
                      {option.label}
                    </option>
                  )
                })}
            </select>
          </div>
        </div>
      )
    } else if (field.type === 'selectAndNumber') {
      let value = allValues[field.name] || field.default
      let inputValue = null
      if (
        typeof value === 'string' &&
        value.split(' / ')[0].toLowerCase() === 'other'
      ) {
        inputValue = +value.split(' / ')[1]
      }
      return (
        <div className={projectFieldStyles.projectsFieldsInput}>
          <div className={projectFieldStyles.selectContainer}>
            <select
              defaultValue={value}
              onChange={e => {
                let event = {
                  target: {
                    value: e.target.value,
                    name: field.name
                  }
                }
                this.props.handleChange(
                  {
                    groupId,
                    equipmentId,
                    isEquipmentField,
                    isDesignField: true
                  },
                  event,
                  'selectAndNumber'
                )
              }}
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
                    <option
                      key={index}
                      value={option.value}
                      defaultValue={option.value == value}
                    >
                      {option.label}
                    </option>
                  )
                })}
            </select>
          </div>
          {inputValue !== null && (
            <input
              required
              value={inputValue}
              name={field.name}
              type='number'
              step='.01'
              placeholder=' '
              onChange={e =>
                this.props.handleChange(
                  {
                    groupId,
                    equipmentId,
                    isEquipmentField,
                    isDesignField: true
                  },
                  e,
                  'selectAndNumber',
                  'input'
                )
              }
              onWheel={e => e.target.blur()}
            />
          )}
        </div>
      )
    } else {
      if (
        field.name === 'xcelLEDLighting_replace_name' &&
        (allValues['xcelLEDLighting_rebate_type'] === '' ||
          allValues['xcelLEDLighting_rebate'] === '')
      )
        return
      return (
        <div className={projectFieldStyles.projectsFieldsInput}>
          <input
            required
            value={allValues[field.name] || ''}
            name={field.name}
            placeholder=' '
            onChange={e =>
              this.props.handleChange(
                { groupId, equipmentId, isEquipmentField, isDesignField: true },
                e
              )
            }
            disabled={field.state === 'LOCK' ? 'disabled' : ''}
          />
        </div>
      )
    }
  }

  handleGroupChange = (e, equipmentId) => {
    if (e.target.value === 'Add') {
      const {
        formValues,
        currentProject,
        groups,
        equipmentToGroupMap
      } = this.props
      const newGroupId = uuid()
      let equipmentValues = {}
      let newEquipmentToGroupMap = Object.assign({}, equipmentToGroupMap)
      const originalGroupId = equipmentToGroupMap[equipmentId]
      const originalGroup = _.find(groups, { id: originalGroupId })
      const originalEquipmentValue =
        originalGroup?.equipmentValues?.[equipmentId] || {}
      let item = this.props.getEquipmentValue(equipmentId) || {}
      for (let key in item) {
        if (item[key] === '0' || !item[key]) {
          item[key] = originalEquipmentValue[key] || ''
        }
      }
      equipmentValues[equipmentId] = item
      const groupObj = {
        id: newGroupId,
        name: findGroupUniqueName(groups),
        formValues: { ...formValues },
        incentive: { ...currentProject.incentive },
        equipmentValues
      }
      let newGroups = [...groups, groupObj]
      let groupId = newEquipmentToGroupMap[equipmentId]
      newEquipmentToGroupMap[equipmentId] = newGroupId
      let allGroupIds = Object.values(newEquipmentToGroupMap) || []
      if (!allGroupIds.includes(groupId)) {
        newGroups = _.reject(newGroups, { id: groupId })
      }
      this.props.handleAddNewGroup({
        newEquipmentToGroupMap,
        newGroups
      })
    } else {
      this.props.handleGroupChange(equipmentId, e.target.value)
    }
  }

  handleGroupNameSave = () => {
    const { groupName, selectedGroupId } = this.state
    this.props.handleGroupNameChange(selectedGroupId, groupName)
    this.setState({
      groupName: '',
      isGroupNameEditing: false,
      selectedGroupId: null,
      selectedEquipmentGroupId: null
    })
  }

  handleGroupNameNotSave = () => {
    this.setState({
      groupName: '',
      isGroupNameEditing: false,
      selectedGroupId: null,
      selectedEquipmentGroupId: null
    })
  }

  currentGroupName = e => {
    this.setState({
      groupName: e.target.value
    })
  }

  handleSetGroupNameEditing = (groupId, equipmentId) => {
    const { groups } = this.props
    const group = _.find(groups, { id: groupId }) || {}
    this.setState({
      groupName: (group && group.name) || '',
      isGroupNameEditing: true,
      selectedGroupId: groupId,
      selectedEquipmentGroupId: equipmentId
    })
  }

  onEquipmentRemove = id => {
    let {
      groups,
      equipmentToGroupMap,
      equipments,
      equipmentToProjectMap,
      projects
    } = this.props
    let newEquipments = equipments.filter(equipment => equipment !== id)
    let newEquipmentToGroupMap = Object.assign({}, equipmentToGroupMap)
    let newEquipmentToProjectMap = Object.assign({}, equipmentToProjectMap)
    const needToRemoveProjectId = newEquipmentToProjectMap[id]
    const groupId = newEquipmentToGroupMap[id]
    delete newEquipmentToGroupMap[id]
    delete newEquipmentToProjectMap[id]
    let newProjects = _.reject(projects, { _id: needToRemoveProjectId })
    let newGroups = [...groups]
    let allGroupIds = Object.values(newEquipmentToGroupMap) || []
    let lastGroup = groups.find(item => item.id === groupId)
    if (!allGroupIds.includes(groupId)) {
      newGroups = _.reject(newGroups, { id: groupId })
    }

    this.props.handleEquipmentRemove({
      newEquipments,
      newGroups,
      newProjects,
      newEquipmentToGroupMap,
      newEquipmentToProjectMap,
      lastData: {
        equipmentId: id,
        groupData: lastGroup || null
      }
    })
  }

  getIncentiveFields = () => {
    let { equipmentToGroupMap, groups, equipments, projects } = this.props
    let fields = []
    const hasUnit = equipments.some(equipment => {
      const groupId = equipmentToGroupMap[equipment]
      return this.checkUnitWithRebate(equipment, groupId, true)
    })
    if (hasUnit) {
      fields.push({
        label: 'Unit Cost'
      })
      fields.push({
        label: 'Unit'
      })
    }

    fields.push({
      label: 'Total Incentive'
    })

    return fields
  }

  getFinancialFields = () => {
    let fields = []
    let { equipmentToGroupMap, groups, equipments, projects } = this.props
    const hasUnit = equipments.some(equipment => {
      const groupId = equipmentToGroupMap[equipment]
      return this.checkUnitWithRebate(equipment, groupId, false)
    })
    if (hasUnit) {
      fields.push('Unit Incentive')
      fields.push('Unit')
    }
    fields.push('Cost')
    fields.push('Financing/Funding')
    return fields
  }

  calculateBasedOnCondition = (newData, values) => {
    const { extraFinancialFields } = this.state
    let extraFieldsArray = this.getExtraFields(extraFinancialFields)
    let extraFieldsObj = this.getExtraFieldsBySection(extraFinancialFields)
    let tempformValues = { ...values }
    let lockFields = []
    for (let fieldName in newData) {
      let fieldValue = newData[fieldName]
      if (extraFieldsArray.indexOf(fieldName) > -1) {
        tempformValues[fieldName] = fieldValue

        if (extraFieldsObj['Hard Costs'].indexOf(fieldName) !== -1) {
          let value = Number(fieldValue, 0)
          if (
            fieldName === 'material_unit_cost' ||
            fieldName === 'material_quantity'
          ) {
            let material_unit_cost = tempformValues['material_unit_cost'] || 0
            let unit = tempformValues['material_quantity'] || 0
            if (fieldName === 'material_unit_cost') material_unit_cost = value
            if (fieldName === 'material_quantity') unit = value
            let totalCost = material_unit_cost * unit
            tempformValues['material_cost'] = totalCost
          } else if (fieldName === 'labor_rate' || fieldName === 'hours') {
            let labor_rate = tempformValues['labor_rate'] || 0
            let hours = tempformValues['hours'] || 0
            if (fieldName === 'labor_rate') labor_rate = value
            if (fieldName === 'hours') hours = value
            let totalCost = labor_rate * hours
            if (
              !tempformValues['labor_unit_cost'] ||
              !tempformValues['labor_quantity']
            ) {
              tempformValues['total_labor_cost'] = totalCost
            }
            if (labor_rate || hours) {
              lockFields = ['labor_unit_cost', 'labor_quantity']
            } else {
              lockFields = []
            }
          } else if (
            fieldName === 'labor_unit_cost' ||
            fieldName === 'labor_quantity'
          ) {
            let labor_unit_cost = tempformValues['labor_unit_cost'] || 0
            let labor_quantity = tempformValues['labor_quantity'] || 0
            if (fieldName === 'labor_unit_cost') labor_unit_cost = value
            if (fieldName === 'labor_quantity') labor_quantity = value
            let totalCost = labor_unit_cost * labor_quantity
            if (!tempformValues['labor_rate'] || !tempformValues['hours']) {
              tempformValues['total_labor_cost'] = totalCost
            }
            if (labor_unit_cost || labor_quantity) {
              lockFields = ['labor_rate', 'hours']
            } else {
              lockFields = []
            }
          } else if (
            fieldName === 'environment_unit_cost' ||
            fieldName === 'environment_quantity'
          ) {
            let environment_unit_cost =
              tempformValues['environment_unit_cost'] || 0
            let environment_quantity =
              tempformValues['environment_quantity'] || 0
            if (fieldName === 'environment_unit_cost')
              environment_unit_cost = value
            if (fieldName === 'environment_quantity')
              environment_quantity = value
            let totalCost = environment_unit_cost * environment_quantity
            tempformValues['total_environment_unit_cost'] = totalCost
          }
        }

        if (
          extraFieldsObj['Hard Costs'].indexOf(fieldName) !== -1 ||
          extraFieldsObj['Soft Costs'].indexOf(fieldName) !== -1
        ) {
          if (
            extraFieldsObj['Hard Costs'].indexOf(fieldName) !== -1 &&
            fieldName !== 'total_hard_cost'
          ) {
            let fields = extraFieldsObj['Hard Costs'] || []
            fields = fields.filter(
              item =>
                item !== 'total_hard_cost' &&
                item !== 'material_unit_cost' &&
                item !== 'material_quantity' &&
                item !== 'labor_rate' &&
                item !== 'hours' &&
                item !== 'labor_unit_cost' &&
                item !== 'labor_quantity' &&
                item !== 'environment_unit_cost' &&
                item !== 'environment_quantity'
            )
            let sum = 0
            for (let field of fields) {
              let fieldValue = Number(tempformValues[field] || 0)
              sum += fieldValue
            }
            tempformValues['total_hard_cost'] = sum
          }
          if (
            extraFieldsObj['Soft Costs'].indexOf(fieldName) !== -1 &&
            fieldName !== 'total_soft_cost'
          ) {
            let fields = extraFieldsObj['Soft Costs'] || []
            fields = fields.filter(item => item !== 'total_soft_cost')
            let sum = 0
            for (let field of fields) {
              let fieldValue = Number(tempformValues[field] || 0)
              sum += fieldValue
            }
            tempformValues['total_soft_cost'] = sum
          }
          tempformValues.project_cost =
            Number(tempformValues['total_hard_cost'] || 0) +
            Number(tempformValues['total_soft_cost'] || 0)
          tempformValues.project_cost = round(
            tempformValues.project_cost || 0,
            2
          )
        } else if (
          extraFieldsObj['Financing'].indexOf(fieldName) !== -1 ||
          extraFieldsObj['Funding'].indexOf(fieldName) !== -1
        ) {
          if (
            fieldName === 'finance_cost_share' ||
            fieldName === 'finance_finance' ||
            fieldName === 'fund_cost_share' ||
            fieldName === 'fund_finance'
          ) {
            tempformValues[fieldName] = fieldValue
          }
          if (fieldName === 'finance_cost_share_rate') {
            tempformValues[fieldName] = fieldValue
            let totalValue =
              Number(tempformValues['total_hard_cost'] || 0) +
              Number(tempformValues['total_soft_cost'] || 0)
            tempformValues['finance_cost_share'] =
              (totalValue * Number(tempformValues[fieldName])) / 100
          }
          if (fieldName === 'finance_finance_rate') {
            tempformValues[fieldName] = fieldValue
            let totalValue =
              Number(tempformValues['total_hard_cost'] || 0) +
              Number(tempformValues['total_soft_cost'] || 0)
            tempformValues['finance_finance'] =
              (totalValue * Number(tempformValues[fieldName])) / 100
          }
          if (fieldName === 'fund_cost_share_rate') {
            tempformValues[fieldName] = fieldValue
            let totalValue =
              Number(tempformValues['total_hard_cost'] || 0) +
              Number(tempformValues['total_soft_cost'] || 0)
            tempformValues['fund_cost_share'] =
              (totalValue * Number(tempformValues[fieldName])) / 100
          }
          if (fieldName === 'fund_finance_rate') {
            tempformValues[fieldName] = fieldValue
            let totalValue =
              Number(tempformValues['total_hard_cost'] || 0) +
              Number(tempformValues['total_soft_cost'] || 0)
            tempformValues['fund_finance'] =
              (totalValue * Number(tempformValues[fieldName])) / 100
          }
          tempformValues['project_total_financing_funding'] =
            Number(tempformValues['finance_cost_share'] || 0) +
            Number(tempformValues['finance_finance'] || 0) +
            Number(tempformValues['fund_cost_share'] || 0) +
            Number(tempformValues['fund_finance'] || 0)

          tempformValues['project_total_financing_funding'] = round(
            tempformValues['project_total_financing_funding'],
            2
          )
        }
      }
    }
    return { formValues: tempformValues, lockFields }
  }

  handleOpenFinancialModal = item => {
    const { groups } = this.props
    const group = _.find(groups, { id: item.groupId }) || {}
    const financialValues = (group && group.financialValues) || {}
    const equipmentFinancialValue =
      (financialValues && financialValues[item.equipment]) || {}
    let updatedGroup = {
      ...group,
      formValues: { ...equipmentFinancialValue }
    }
    const equipmentFinancialValues =
      (group &&
        group.financialValues &&
        group['financialValues'][item.equipment]) ||
      {}
    const equipmentSpecficValues =
      (group &&
        group.equipmentValues &&
        group['equipmentValues'][item.equipment]) ||
      {}
    const allValues = {
      ...((group && group.formValues) || {}),
      ...equipmentFinancialValues,
      ...equipmentSpecficValues
    }

    let quantity = allValues['quantity'] || allValues['units'] || 0
    if (!quantity) {
      const quantityField = this.props?.currentProject?.fields?.find(
        item => item.label === 'Quantity'
      )
      if (quantityField) {
        quantity = allValues[quantityField.name] || 0
      }
    }

    let newObj = { material_quantity: quantity, labor_quantity: quantity }
    const conditionalCosts =
      this.props?.currentProject?.config?.conditionalCost || []
    let condition = conditionalCosts.find(itm =>
      evaluateConditions(itm.conditions, allValues)
    )
    if (condition) {
      for (let key in condition) {
        if (key === 'conditions') continue
        if (key === 'laborUnitCost') newObj['labor_unit_cost'] = condition[key]
        if (key === 'materialUnitCost')
          newObj['material_unit_cost'] = condition[key]
        if (key === 'proposed_total_wattage')
          newObj['proposed_total_wattage'] = condition['proposed_total_wattage']
      }
    }

    const updatedGroupValue = {
      ...updatedGroup['formValues']
    }

    let newSelectedValue = {}
    for (let key in newObj) {
      if (
        updatedGroupValue[key] === null ||
        updatedGroupValue[key] === undefined
      ) {
        updatedGroupValue[key] = newObj[key]
        newSelectedValue[key] = newObj[key]
      }
    }

    let {
      formValues: updatedValue,
      lockFields
    } = this.calculateBasedOnCondition(newSelectedValue, updatedGroupValue)

    if (updatedValue['labor_rate'] && updatedValue['hours']) {
      lockFields = ['labor_unit_cost', 'labor_quantity']
    } else if (
      updatedValue['labor_unit_cost'] &&
      updatedValue['labor_quantity']
    ) {
      lockFields = ['labor_rate', 'hours']
    }

    this.setState({
      financialMode: true,
      newFinancialGroup: {
        ...updatedGroup,
        formValues: updatedValue
      },
      selectedEquipmentId: item.equipment,
      lockFields
    })
  }

  handleCloseFinancialModal = () => {
    this.setState({
      financialMode: false,
      newFinancialGroup: null,
      selectedEquipmentId: null,
      lockFields: []
    })
  }

  handleSaveFinancialModal = () => {
    this.props.handleUpdateGroup(
      this.state.newFinancialGroup,
      this.state.selectedEquipmentId
    )
    this.handleCloseFinancialModal()
  }

  getExtraFields = extraFinancialFields => {
    let fields = []
    for (let section of extraFinancialFields) {
      let sectionFields = section.subFields || []
      for (let field of sectionFields) {
        let label = field.label
        if (fields.indexOf(label) === -1) {
          fields.push(label)
        }
      }
    }
    return fields
  }

  getExtraFieldsBySection = extraFinancialFields => {
    let obj = {}
    for (let section of extraFinancialFields) {
      let sectionFields = section.subFields || []
      let fields = []
      for (let field of sectionFields) {
        let label = field.label
        if (fields.indexOf(label) === -1) {
          fields.push(label)
        }
      }
      obj[section.name] = fields
    }
    return obj
  }

  handleFinancialChange = event => {
    const { newFinancialGroup = {}, extraFinancialFields } = this.state
    const { formValues = {} } = newFinancialGroup ?? {}
    let tempformValues = { ...formValues }
    tempformValues[event.target.name] = event.target.value
    let extraFieldsArray = this.getExtraFields(extraFinancialFields)
    let extraFieldsObj = this.getExtraFieldsBySection(extraFinancialFields)
    if (extraFieldsArray.indexOf(event.target.name) > -1) {
      tempformValues[event.target.name] = event.target.value

      if (extraFieldsObj['Hard Costs'].indexOf(event.target.name) !== -1) {
        let fieldName = event.target.name
        let value = Number(event.target.value, 0)
        if (
          fieldName === 'material_unit_cost' ||
          fieldName === 'material_quantity'
        ) {
          let material_unit_cost = tempformValues['material_unit_cost'] || 0
          let unit = tempformValues['material_quantity'] || 0
          if (fieldName === 'material_unit_cost') material_unit_cost = value
          if (fieldName === 'material_quantity') unit = value
          let totalCost = material_unit_cost * unit
          tempformValues['material_cost'] = totalCost
        } else if (fieldName === 'labor_rate' || fieldName === 'hours') {
          let labor_rate = tempformValues['labor_rate'] || 0
          let hours = tempformValues['hours'] || 0
          if (fieldName === 'labor_rate') labor_rate = value
          if (fieldName === 'hours') hours = value
          let totalCost = labor_rate * hours
          if (
            !tempformValues['labor_unit_cost'] ||
            !tempformValues['labor_quantity']
          ) {
            tempformValues['total_labor_cost'] = totalCost
          }
          if (labor_rate || hours) {
            this.setState({
              lockFields: ['labor_unit_cost', 'labor_quantity']
            })
          } else {
            this.setState({
              lockFields: []
            })
          }
        } else if (
          fieldName === 'labor_unit_cost' ||
          fieldName === 'labor_quantity'
        ) {
          let labor_unit_cost = tempformValues['labor_unit_cost'] || 0
          let labor_quantity = tempformValues['labor_quantity'] || 0
          if (fieldName === 'labor_unit_cost') labor_unit_cost = value
          if (fieldName === 'labor_quantity') labor_quantity = value
          let totalCost = labor_unit_cost * labor_quantity
          if (!tempformValues['labor_rate'] || !tempformValues['hours']) {
            tempformValues['total_labor_cost'] = totalCost
          }
          if (labor_unit_cost || labor_quantity) {
            this.setState({
              lockFields: ['labor_rate', 'hours']
            })
          } else {
            this.setState({
              lockFields: []
            })
          }
        } else if (
          fieldName === 'environment_unit_cost' ||
          fieldName === 'environment_quantity'
        ) {
          let environment_unit_cost =
            tempformValues['environment_unit_cost'] || 0
          let environment_quantity = tempformValues['environment_quantity'] || 0
          if (fieldName === 'environment_unit_cost')
            environment_unit_cost = value
          if (fieldName === 'environment_quantity') environment_quantity = value
          let totalCost = environment_unit_cost * environment_quantity
          tempformValues['total_environment_unit_cost'] = totalCost
        }
      }

      if (
        extraFieldsObj['Hard Costs'].indexOf(event.target.name) !== -1 ||
        extraFieldsObj['Soft Costs'].indexOf(event.target.name) !== -1
      ) {
        if (
          extraFieldsObj['Hard Costs'].indexOf(event.target.name) !== -1 &&
          event.target.name !== 'total_hard_cost'
        ) {
          let fields = extraFieldsObj['Hard Costs'] || []
          fields = fields.filter(
            item =>
              item !== 'total_hard_cost' &&
              item !== 'material_unit_cost' &&
              item !== 'material_quantity' &&
              item !== 'labor_rate' &&
              item !== 'hours' &&
              item !== 'labor_unit_cost' &&
              item !== 'labor_quantity' &&
              item !== 'environment_unit_cost' &&
              item !== 'environment_quantity'
          )
          let sum = 0
          for (let field of fields) {
            let fieldValue = Number(tempformValues[field] || 0)
            sum += fieldValue
          }
          tempformValues['total_hard_cost'] = sum
        }
        if (
          extraFieldsObj['Soft Costs'].indexOf(event.target.name) !== -1 &&
          event.target.name !== 'total_soft_cost'
        ) {
          let fields = extraFieldsObj['Soft Costs'] || []
          fields = fields.filter(item => item !== 'total_soft_cost')
          let sum = 0
          for (let field of fields) {
            let fieldValue = Number(tempformValues[field] || 0)
            sum += fieldValue
          }
          tempformValues['total_soft_cost'] = sum
        }
        tempformValues.project_cost =
          Number(tempformValues['total_hard_cost'] || 0) +
          Number(tempformValues['total_soft_cost'] || 0)
        tempformValues.project_cost = round(tempformValues.project_cost || 0, 2)
      } else if (
        extraFieldsObj['Financing'].indexOf(event.target.name) !== -1 ||
        extraFieldsObj['Funding'].indexOf(event.target.name) !== -1
      ) {
        let fieldName = event.target.name
        if (
          fieldName === 'finance_cost_share' ||
          fieldName === 'finance_finance' ||
          fieldName === 'fund_cost_share' ||
          fieldName === 'fund_finance'
        ) {
          tempformValues[fieldName] = event.target.value
        }
        if (fieldName === 'finance_cost_share_rate') {
          tempformValues[fieldName] = event.target.value
          let totalValue =
            Number(tempformValues['total_hard_cost'] || 0) +
            Number(tempformValues['total_soft_cost'] || 0)
          tempformValues['finance_cost_share'] =
            (totalValue * Number(tempformValues[fieldName])) / 100
        }
        if (fieldName === 'finance_finance_rate') {
          tempformValues[fieldName] = event.target.value
          let totalValue =
            Number(tempformValues['total_hard_cost'] || 0) +
            Number(tempformValues['total_soft_cost'] || 0)
          tempformValues['finance_finance'] =
            (totalValue * Number(tempformValues[fieldName])) / 100
        }
        if (fieldName === 'fund_cost_share_rate') {
          tempformValues[fieldName] = event.target.value
          let totalValue =
            Number(tempformValues['total_hard_cost'] || 0) +
            Number(tempformValues['total_soft_cost'] || 0)
          tempformValues['fund_cost_share'] =
            (totalValue * Number(tempformValues[fieldName])) / 100
        }
        if (fieldName === 'fund_finance_rate') {
          tempformValues[fieldName] = event.target.value
          let totalValue =
            Number(tempformValues['total_hard_cost'] || 0) +
            Number(tempformValues['total_soft_cost'] || 0)
          tempformValues['fund_finance'] =
            (totalValue * Number(tempformValues[fieldName])) / 100
        }
        tempformValues['project_total_financing_funding'] =
          Number(tempformValues['finance_cost_share'] || 0) +
          Number(tempformValues['finance_finance'] || 0) +
          Number(tempformValues['fund_cost_share'] || 0) +
          Number(tempformValues['fund_finance'] || 0)
      }
    }

    this.setState({
      newFinancialGroup: {
        ...newFinancialGroup,
        formValues: tempformValues
      }
    })
  }

  projectResultsIncludeFuelType = (data, key) => {
    const { buildingId, projects } = this.props
    // as soon as you get a truthy value, exit .some method and move on
    // meaning, at least one project has this value, so display the column
    // no need to continue on to the rest of the projects
    switch (data) {
      case 'electric':
      case 'water':
        return projects.some(project => {
          return getEnergySavings(project, buildingId, data, key)
        })
      case 'gas':
      case 'gas-savings':
      case 'gas-charge':
        return projects.some(project => {
          return getGasSavingsCost(project, buildingId, data, key)
        })
      case 'ghg':
      case 'ghg-cost':
        return projects.some(project => {
          return getGHGSavingsCost(project, buildingId, data, key)
        })
      case 'totalEnergy': {
        return projects.some(project => {
          return getTotalEnergySavings(project, buildingId, key)
        })
      }
      // return true for everything else since we're not checking
      // for anything other than electric, gas, and water right meow
      default:
        return true
    }
  }

  projectResultsIncludeGHG = (data, key) => {
    const { buildingId, projects } = this.props
    switch (data) {
      case 'ghg':
      case 'ghg-cost':
        return projects.some(project => {
          if (project.projects && project.projects.length) {
            let value = project.projects.some(item =>
              getGHGSavingsCost(item, buildingId, data, key)
            )
            return value
          }

          return getGHGSavingsCost(project, buildingId, data, key)
        })
      default:
        return true
    }
  }

  projectResultsIncludeGasType = (data, key) => {
    const { buildingId, projects } = this.props
    switch (data) {
      case 'gas':
      case 'gas-savings':
      case 'gas-charge':
        return projects.some(project => {
          if (project.projects && project.projects.length) {
            let value = project.projects.some(item =>
              getGasSavingsCost(item, buildingId, data, key)
            )
            return value
          }
          return getGasSavingsCost(project, buildingId, data, key)
        })
      default:
        return true
    }
  }

  getAvailableFields = () => {
    const isElectricResult = this.projectResultsIncludeFuelType(
      'electric',
      'runResults'
    )
    const isGasResult = this.projectResultsIncludeGasType('gas', 'runResults')
    const isWaterResult = this.projectResultsIncludeFuelType(
      'water',
      'runResults'
    )
    const isGHGResult = this.projectResultsIncludeGHG('ghg', 'runResults')
    const isGHGCostResult = this.projectResultsIncludeGHG(
      'ghg-cost',
      'runResults'
    )
    const isTotalEnergyResult = this.projectResultsIncludeFuelType(
      'totalEnergy',
      'runResults'
    )
    let fields = [
      'Annual Cost Savings($)',
      'Mainternance Savings($)',
      'Simple Payback(yrs)',
      'NPV($)',
      'SIR($)',
      'ROI(%)'
    ]
    if (isTotalEnergyResult) fields.push('Energy Savings(kBtu)')
    if (isElectricResult) fields.push('Electricity Savings(kWh)')
    fields.push('Demand Savings(kW)')
    if (isGasResult) fields.push('Natural Gas Savings(therms)')
    if (isWaterResult) fields.push('Water Savings(kGal)')
    if (isGHGResult) fields.push('GHG Savings(mtCO2e)')
    if (isGHGCostResult) fields.push('GHG Savings Cost($/mtCO2e)')
    return fields
  }

  hasDuplicateValue = (element, id) => {
    return true
    // let count = 0
    // for (let key of Object.keys(element)) {
    //   if (element[key] === id) count++
    // }
    // return count > 1
  }

  renderGroupName = (groupId, equipmentId) => {
    const { groups, equipmentToGroupMap } = this.props
    const {
      isGroupNameEditing,
      groupName,
      selectedGroupId,
      selectedEquipmentGroupId
    } = this.state

    let options = groups
      .filter(item => this.hasDuplicateValue(equipmentToGroupMap, item.id))
      .map(item => ({
        value: item.id,
        name: item.name
      }))
    options.push({
      value: 'Add',
      name: 'Add New Group'
    })

    if (
      isGroupNameEditing &&
      groupId === selectedGroupId &&
      equipmentId === selectedEquipmentGroupId
    )
      return (
        <div className={styles['groupName']}>
          <div className={styles.groupContainer}>
            <div
              className={classNames(
                projectFieldStyles.projectsFieldsInput,
                styles.input
              )}
            >
              <input
                required
                value={groupName}
                name='Group Name'
                placeholder=' '
                onChange={e => this.currentGroupName(e)}
              />
            </div>
            <div className={styles.iconContainer}>
              <i
                className={classNames('material-icons')}
                onClick={this.handleGroupNameSave}
              >
                check
              </i>
              <i
                className={classNames('material-icons')}
                onClick={this.handleGroupNameNotSave}
              >
                close
              </i>
            </div>
          </div>
        </div>
      )

    return (
      <div className={styles['groupName']}>
        <div className={styles.groupContainer}>
          <div
            className={classNames(
              projectFieldStyles.projectsFieldsInput,
              styles.input
            )}
          >
            <div className={projectFieldStyles.selectContainer}>
              <select
                defaultValue={groupId}
                value={groupId}
                onChange={e => {
                  this.handleGroupChange(e, equipmentId)
                }}
              >
                {options.length &&
                  options.map((option, index) => {
                    return (
                      <option
                        key={index}
                        value={option.value}
                        defaultValue={groupId == option.value}
                      >
                        {option.name}
                      </option>
                    )
                  })}
              </select>
            </div>
          </div>
          <div className={styles.iconContainer}>
            <i
              className={classNames('material-icons')}
              onClick={e =>
                this.handleSetGroupNameEditing(groupId, equipmentId)
              }
            >
              edit
            </i>
          </div>
        </div>
      </div>
    )
  }

  getTotal = (name, field) => {
    let {
      equipments,
      equipmentToGroupMap,
      equipmentToProjectMap,
      groups,
      buildingId,
      projects = [],
      cashFlowData
    } = this.props
    let totalValue = 0
    if (name !== 'project') {
      for (let equipment of equipments) {
        const projectId = equipmentToProjectMap[equipment]
        const groupId = equipmentToGroupMap[equipment]
        let project = {}
        let group = {}
        if (projectId) {
          project = _.find(projects, { _id: projectId }) || {}
        }
        if (groupId) {
          group = _.find(groups, { id: groupId }) || {}
        }
        let itemValue = ''
        if (name === 'field') {
          const {
            formValues = {},
            equipmentValues = {},
            financialValues = {}
          } = group
          const financialValue =
            (financialValues && financialValues[equipment]) || {}
          const equipmentValue =
            (equipmentValues && equipmentValues[equipment]) || {}
          const allValues = {
            ...formValues,
            ...equipmentValue,
            ...financialValue
          }
          itemValue = (allValues && allValues[field.name]) || ''
          if (field.type === 'number' || field.type === 'decimal') {
            let conditionalValues = field.conditionalValues
            if (conditionalValues) {
              for (let condValue of conditionalValues) {
                let conditionAccepted = evaluateConditions(
                  condValue.conditions,
                  allValues
                )
                if (conditionAccepted) {
                  itemValue = evaluateFormula(condValue.formula, allValues)
                }
              }
            }
          }
        } else if (name === 'incentive') {
          const { incentive } = group
          const label = (field && field.label) || ''
          const {
            formValues = {},
            equipmentValues = {},
            financialValues
          } = group
          const financialValue =
            (financialValues && financialValues[equipment]) || {}
          const equipmentValue =
            (equipmentValues && equipmentValues[equipment]) || {}
          const allValues = {
            ...formValues,
            ...equipmentValue,
            ...financialValue
          }
          if (label === 'Total Incentive') {
            itemValue = allValues['input']
          }
        } else if (name === 'project_cost') {
          const {
            formValues = {},
            equipmentValues = {},
            financialValues
          } = group
          const financialValue =
            (financialValues && financialValues[equipment]) || {}
          const equipmentValue =
            (equipmentValues && equipmentValues[equipment]) || {}
          const allValues = {
            ...formValues,
            ...equipmentValue,
            ...financialValue
          }
          itemValue = (allValues && allValues['project_cost']) || ''
        } else if (name === 'funding') {
          const {
            formValues = {},
            equipmentValues = {},
            financialValues
          } = group
          const financialValue =
            (financialValues && financialValues[equipment]) || {}
          const equipmentValue =
            (equipmentValues && equipmentValues[equipment]) || {}
          const allValues = {
            ...formValues,
            ...equipmentValue,
            ...financialValue
          }
          itemValue =
            (allValues && allValues['project_total_financing_funding']) || ''
        }
        if (itemValue == +itemValue) totalValue += +itemValue
      }
      return totalValue
    } else {
      const allProject = {
        projects,
        cashFlowData
      }
      const calculatedAnnualSavings = getAnnualSavings(allProject, buildingId)
      const calculatedMainternanceSavings = getMaintenanceSavings(allProject)
      const calculatedROI = getROI(allProject, buildingId)
      const calculatedSimplePayback = getSimplePayback(allProject, buildingId)
      const calculatedNPV = getNPV(allProject, buildingId)
      const calculatedSIR = getSIR(allProject, buildingId)
      const calculatedDemandSavings = getDemandSavings(allProject, buildingId)
      const calculatedEUL = getEUL(allProject, buildingId)
      const calculationType = getCalculationType(allProject, buildingId)
      const totalEnergySavings = getTotalEnergySavings(allProject, buildingId)
      const electricSavings = getEnergySavings(
        allProject,
        buildingId,
        'electric'
      )
      const waterSavings = getEnergySavings(allProject, buildingId, 'water')
      const nuturalGasSavings = getGasSavingsCost(allProject, buildingId, 'gas')
      const ghgSavings = getGHGSavingsCost(allProject, buildingId, 'ghg')
      const ghgSavingsCost = getGHGSavingsCost(
        allProject,
        buildingId,
        'ghg-cost'
      )
      switch (field) {
        case 'Annual Cost Savings($)':
          return calculatedAnnualSavings
        case 'Mainternance Savings($)':
          return calculatedMainternanceSavings
        case 'Simple Payback(yrs)':
          return calculatedSimplePayback
        case 'NPV($)':
          return calculatedNPV
        case 'SIR($)':
          return calculatedSIR
        case 'ROI(%)':
          return calculatedROI
        case 'Energy Savings(kBtu)':
          return totalEnergySavings
        case 'Electricity Savings(kWh)':
          return electricSavings
        case 'Demand Savings(kW)':
          return calculatedDemandSavings
        case 'Natural Gas Savings(therms)':
          return nuturalGasSavings
        case 'Water Savings(kGal)':
          return waterSavings
        case 'GHG Savings(mtCO2e)':
          return ghgSavings
        case 'GHG Savings Cost($/mtCO2e)':
          return ghgSavingsCost
      }
    }
  }

  render() {
    const {
      equipmentToGroupMap,
      equipments,
      currentProject,
      equipmentToProjectMap,
      projects,
      groups,
      buildingId,
      equipmentToEquipmentNameMap = {}
    } = this.props
    const data = equipments.map(equipment => {
      let group = equipmentToGroupMap && equipmentToGroupMap[equipment]
      let projectId = equipmentToProjectMap && equipmentToProjectMap[equipment]
      return {
        equipment,
        groupId: group,
        projectId
      }
    })

    if (data.length === 0) return null

    const { fieldsSeparated, existingFields, replacementFields } = this.state
    let fields = currentProject.fields || []

    let showPosition = ''
    if (fieldsSeparated && existingFields.length)
      showPosition = 'existingFields'
    else {
      if (fieldsSeparated && replacementFields.length)
        showPosition = 'replacementFields'
    }

    const incentiveFields = this.getIncentiveFields()
    const financialFields = this.getFinancialFields()
    const savingFields = this.getAvailableFields()
    const { newFinancialGroup = {}, financialMode } = this.state
    const formValues =
      (newFinancialGroup && newFinancialGroup['formValues']) || {}

    return (
      <div className={styles.equipmentFormTable}>
        {financialMode && (
          <CustomProjectFinancialModal
            onClose={this.handleCloseFinancialModal}
            onSave={this.handleSaveFinancialModal}
            handleChange={this.handleFinancialChange}
            formValues={{ ...formValues }}
            extraFinancialFields={this.state.extraFinancialFields}
            lockFields={this.state.lockFields}
          />
        )}

        <div className={styles.scrollTableContainer}>
          <table>
            <thead>
              <tr>
                {!fieldsSeparated &&
                  fields.length &&
                  fields.map((field, index) => {
                    if (index === 0) return <th key={index}>Design</th>
                    return <th key={index}></th>
                  })}
                {showPosition === '' && <th />}
                {fieldsSeparated &&
                  existingFields.length > 0 &&
                  existingFields.map((field, index) => {
                    if (index === 0)
                      return <th key={index}>Existing Condition</th>
                    return <th key={index}></th>
                  })}
                {showPosition === 'existingFields' && <th />}
                {fieldsSeparated &&
                  replacementFields.length &&
                  replacementFields.map((field, index) => {
                    if (index === 0)
                      return (
                        <th key={index} className={styles['groupName']}>
                          Retrofit Design
                        </th>
                      )
                    return <th key={index}></th>
                  })}

                {showPosition === 'replacementFields' && <th />}

                {incentiveFields.length &&
                  incentiveFields.map((field, index) => {
                    if (index === 0) return <th key={index}>Incentive</th>
                    return <th key={index}></th>
                  })}

                {financialFields.length &&
                  financialFields.map((field, index) => {
                    if (index === 0)
                      return (
                        <th
                          key={index}
                          className={
                            field != 'Unit Cost' &&
                            field != 'Unit' &&
                            styles.linkColumn
                          }
                        >
                          Financial Modeling
                        </th>
                      )
                    return (
                      <th
                        key={index}
                        className={
                          field != 'Unit Cost' &&
                          field != 'Unit' &&
                          styles.linkColumn
                        }
                      ></th>
                    )
                  })}
                {savingFields.length &&
                  savingFields.map((field, index) => {
                    if (index === 0) return <th key={index}>Analysis</th>
                    return <th key={index}></th>
                  })}
                <th></th>
              </tr>
              <tr>
                {showPosition === '' && (
                  <th>
                    <div>Equipment</div>
                  </th>
                )}
                {!fieldsSeparated &&
                  fields.length > 0 &&
                  fields.map((field, index) => {
                    return (
                      <th key={index}>
                        <div className={styles['content']}>{field.label}</div>
                      </th>
                    )
                  })}
                {showPosition === 'existingFields' && (
                  <th>
                    <div>Equipment</div>
                  </th>
                )}
                {fieldsSeparated &&
                  existingFields.length &&
                  existingFields.map((field, index) => {
                    return (
                      <th key={index}>
                        <div className={styles['content']}>{field.label}</div>
                      </th>
                    )
                  })}
                {showPosition === 'replacementFields' && (
                  <th>
                    <div>Equipment</div>
                  </th>
                )}
                {fieldsSeparated &&
                  replacementFields.length &&
                  replacementFields.map((field, index) => {
                    if (field.name === 'Group') {
                      return (
                        <th key={index} className={styles['groupName']}>
                          <div className={styles['content']}>{field.label}</div>
                        </th>
                      )
                    }
                    return (
                      <th key={index}>
                        <div className={styles['content']}>{field.label}</div>
                      </th>
                    )
                  })}
                {incentiveFields.length &&
                  incentiveFields.map((field, index) => {
                    return (
                      <th key={index}>
                        <div className={styles['content']}>{field.label}</div>
                      </th>
                    )
                  })}

                {financialFields.length &&
                  financialFields.map((field, index) => {
                    if (field === 'Cost') {
                      return (
                        <th className={styles.linkColumn} key={index}>
                          <div className={styles['content']}>Cost</div>
                        </th>
                      )
                    }
                    if (field === 'Financing/Funding') {
                      return (
                        <th key={index} className={styles.linkColumn}>
                          <div>Financing/Funding</div>
                        </th>
                      )
                    }
                    if (field === 'Cost') {
                      return (
                        <th className={styles.linkColumn} key={index}>
                          <div className={styles['content']}>Cost</div>
                        </th>
                      )
                    }
                    return (
                      <th key={index}>
                        <div>{field}</div>
                      </th>
                    )
                  })}
                {savingFields.length &&
                  savingFields.map((field, index) => {
                    return (
                      <th key={index}>
                        <div className={styles['content']}>{field}</div>
                      </th>
                    )
                  })}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => {
                const project = _.find(projects, { _id: item.projectId }) || {}
                const equipmentData = _.find(this.props.buildingEquipment, {
                  _id: item.equipment
                })
                const group = _.find(groups, { id: item.groupId }) || {}
                let isUUid =
                  equipmentToEquipmentNameMap[item.equipment] !== undefined

                let equipmentName =
                  (equipmentData &&
                    equipmentData.libraryEquipment &&
                    equipmentData.libraryEquipment.name) ||
                  ''
                if (isUUid) {
                  equipmentName =
                    (equipmentToEquipmentNameMap &&
                      equipmentToEquipmentNameMap[item.equipment]) ||
                    ''
                }
                let calculatedProjectCost = getProjectCost(project)
                let calculatedIncentive = getIncentive(project, buildingId)
                let calculatedAnnualSavings = getAnnualSavings(
                  project,
                  buildingId
                )
                let calculatedMainternanceSavings = getMaintenanceSavings(
                  project
                )
                let calculatedROI = getROI(project, buildingId)
                let calculatedSimplePayback = getSimplePayback(
                  project,
                  buildingId
                )
                let calculatedNPV = getNPV(project, buildingId)
                let calculatedSIR = getSIR(project, buildingId)
                let calculatedDemandSavings = getDemandSavings(
                  project,
                  buildingId
                )
                let calculatedEUL = getEUL(project, buildingId)
                let calculationType = getCalculationType(project, buildingId)
                let totalEnergySavings = getTotalEnergySavings(
                  project,
                  buildingId
                )
                let electricSavings = getEnergySavings(
                  project,
                  buildingId,
                  'electric'
                )
                let waterSavings = getEnergySavings(
                  project,
                  buildingId,
                  'water'
                )
                let nuturalGasSavings = getGasSavingsCost(
                  project,
                  buildingId,
                  'gas'
                )
                let ghgSavings = getGHGSavingsCost(project, buildingId, 'ghg')
                let ghgSavingsCost = getGHGSavingsCost(
                  project,
                  buildingId,
                  'ghg-cost'
                )
                const equipmentFinancialValues =
                  (group &&
                    group.financialValues &&
                    group['financialValues'][item.equipment]) ||
                  {}
                const equipmentSpecficValues =
                  (group &&
                    group.equipmentValues &&
                    group['equipmentValues'][item.equipment]) ||
                  {}
                const allValues = {
                  ...((group && group.formValues) || {}),
                  ...equipmentFinancialValues,
                  ...equipmentSpecficValues
                }
                const costUnitValues = this.getXcelMeasureInfo(
                  item.equipment,
                  item.groupId
                )

                return (
                  <tr key={`${index} - ${item.equipment}`}>
                    {showPosition === '' &&
                      this.renderEquipmentName(
                        equipmentName,
                        item.equipment,
                        isUUid
                      )}
                    {!fieldsSeparated &&
                      fields.map(field => {
                        return (
                          <td key={`${field.name} ${item.equipment}`}>
                            {this.renderDesignField(
                              field,
                              item.groupId,
                              item.equipment
                            )}
                          </td>
                        )
                      })}
                    {showPosition === 'existingFields' &&
                      this.renderEquipmentName(
                        equipmentName,
                        item.equipment,
                        isUUid
                      )}
                    {fieldsSeparated &&
                      existingFields.map(field => {
                        return (
                          <td key={`${field.name} ${item.equipment}`}>
                            {this.renderDesignField(
                              field,
                              item.groupId,
                              item.equipment
                            )}
                          </td>
                        )
                      })}
                    {showPosition === 'replacementFields' &&
                      this.renderEquipmentName(
                        equipmentName,
                        item.equipment,
                        isUUid
                      )}
                    {fieldsSeparated &&
                      replacementFields.map(field => {
                        return (
                          <td key={`${field.name} ${item.equipment}`}>
                            {field.name === 'Group'
                              ? this.renderGroupName(
                                  item.groupId,
                                  item.equipment
                                )
                              : this.renderDesignField(
                                  field,
                                  item.groupId,
                                  item.equipment
                                )}
                          </td>
                        )
                      })}
                    {incentiveFields.length &&
                      incentiveFields.map((field, index) => {
                        switch (field.label) {
                          case 'Description':
                            return (
                              <td key={index}>
                                {project.incentive.incentive_description}
                              </td>
                            )
                          case 'Unit':
                            return (
                              <td key={index}>
                                {costUnitValues.incentiveUnit}
                              </td>
                            )
                          case 'Unit Cost':
                            return (
                              <td key={index}>
                                {costUnitValues.incentiveValue}
                              </td>
                            )
                          default: {
                            return (
                              <td key={index}>
                                <input
                                  value={allValues['input'] || ''}
                                  name='input'
                                  placeholder=' '
                                  step='.01'
                                  type='number'
                                  onChange={e =>
                                    this.props.handleChange(
                                      {
                                        groupId: group.id,
                                        equipmentId: item.equipment,
                                        isDesignField: true,
                                        isEquipmentField: true
                                      },
                                      e
                                    )
                                  }
                                  disabled={
                                    project &&
                                    project.incentive &&
                                    project.incentive.disable_user_input ===
                                      true
                                      ? 'disabled'
                                      : ''
                                  }
                                  onWheel={e => e.target.blur()}
                                />
                              </td>
                            )
                          }
                        }
                      })}
                    {financialFields.length &&
                      financialFields.map((field, index) => {
                        switch (field) {
                          case 'Cost':
                            return (
                              <td className={styles.linkColumn}>
                                <div className={styles.inputContainer}>
                                  <div
                                    className={classNames(
                                      styles.projectsFinancialInput,
                                      styles.input
                                    )}
                                  >
                                    <span>
                                      <i className='material-icons'>
                                        attach_money
                                      </i>
                                      <input
                                        required
                                        value={allValues['project_cost'] || ''}
                                        name='project_cost'
                                        type='number'
                                        autoComplete='off'
                                        step='.01'
                                        placeholder=' '
                                        onChange={e =>
                                          this.props.handleChange(
                                            {
                                              groupId: group.id,
                                              equipmentId: item.equipment,
                                              isDesignField: true,
                                              isEquipmentField: true
                                            },
                                            e
                                          )
                                        }
                                        onWheel={e => e.target.blur()}
                                      />
                                    </span>
                                  </div>
                                  <div
                                    onClick={() =>
                                      this.handleOpenFinancialModal(item)
                                    }
                                  >
                                    More
                                  </div>
                                </div>
                              </td>
                            )
                          case 'Financing/Funding':
                            return (
                              <td className={styles.linkColumn}>
                                <div className={styles.inputContainer}>
                                  <div
                                    className={classNames(
                                      styles.projectsFinancialInput,
                                      styles.input
                                    )}
                                  >
                                    <span>
                                      <i className='material-icons'>
                                        attach_money
                                      </i>
                                      <input
                                        disabled={
                                          (group &&
                                            group.formValues &&
                                            group.formValues
                                              .projectCostDisabled) ||
                                          false
                                        }
                                        required
                                        value={
                                          allValues[
                                            'project_total_financing_funding'
                                          ] || ''
                                        }
                                        name='project_total_financing_funding'
                                        type='number'
                                        autoComplete='off'
                                        step='.01'
                                        placeholder=' '
                                        onChange={e =>
                                          this.props.handleChange(
                                            {
                                              groupId: group.id,
                                              equipmentId: item.equipment,
                                              isDesignField: true,
                                              isEquipmentField: true
                                            },
                                            e
                                          )
                                        }
                                        onWheel={e => e.target.blur()}
                                      />
                                    </span>
                                  </div>
                                  <div
                                    onClick={() =>
                                      this.handleOpenFinancialModal(item)
                                    }
                                  >
                                    More
                                  </div>
                                </div>
                              </td>
                            )
                          case 'Unit Incentive':
                            return (
                              <td>
                                <div>{costUnitValues.costValue}</div>
                              </td>
                            )
                          case 'Unit':
                            return (
                              <td>
                                <div>{costUnitValues.costUnit}</div>
                              </td>
                            )
                          case '':
                            return this.showFinanceUnit(
                              item.equipment,
                              item.groupId
                            )
                        }
                      })}
                    {savingFields.length &&
                      savingFields.map((field, index) => {
                        switch (field) {
                          case 'Annual Cost Savings($)':
                            return (
                              <td key={index}>
                                {(calculatedAnnualSavings &&
                                  numberWithCommas(
                                    round(calculatedAnnualSavings, 2),
                                    calculationType
                                  )) ||
                                  '-'}
                              </td>
                            )
                          case 'Mainternance Savings($)':
                            return (
                              <td key={index}>
                                {calculatedMainternanceSavings
                                  ? numberWithCommas(
                                      round(calculatedMainternanceSavings, 2),
                                      calculationType
                                    )
                                  : '-'}
                              </td>
                            )
                          case 'Simple Payback(yrs)':
                            return (
                              <td key={index}>
                                {calculatedSimplePayback
                                  ? numberWithCommas(
                                      round(calculatedSimplePayback, 2)
                                    )
                                  : '-'}
                              </td>
                            )
                          case 'NPV($)':
                            return (
                              <td key={index}>
                                {calculatedNPV
                                  ? numberWithCommas(round(calculatedNPV, 2))
                                  : '-'}
                              </td>
                            )
                          case 'SIR($)':
                            return (
                              <td key={index}>
                                {calculatedSIR
                                  ? numberWithCommas(round(calculatedSIR, 2))
                                  : '-'}
                              </td>
                            )
                          case 'ROI(%)':
                            return (
                              <td key={index}>
                                {calculatedROI
                                  ? numberWithCommas(round(calculatedROI, 2))
                                  : '-'}
                              </td>
                            )
                          case 'Energy Savings(kBtu)':
                            return (
                              <td key={index}>
                                {totalEnergySavings
                                  ? numberWithCommas(
                                      round(totalEnergySavings, 2)
                                    )
                                  : '-'}
                              </td>
                            )
                          case 'Electricity Savings(kWh)':
                            return (
                              <td key={index}>
                                {electricSavings
                                  ? numberWithCommas(round(electricSavings, 2))
                                  : '-'}
                              </td>
                            )
                          case 'Demand Savings(kW)':
                            return (
                              <td key={index}>
                                {calculatedDemandSavings
                                  ? numberWithCommas(
                                      round(calculatedDemandSavings, 2)
                                    )
                                  : '-'}
                              </td>
                            )
                          case 'Natural Gas Savings(therms)':
                            return (
                              <td key={index}>
                                {nuturalGasSavings
                                  ? numberWithCommas(
                                      round(nuturalGasSavings, 2),
                                      calculationType
                                    )
                                  : '-'}
                              </td>
                            )
                          case 'Water Savings(kGal)':
                            return (
                              <td key={index}>
                                {waterSavings
                                  ? numberWithCommas(
                                      round(waterSavings, 2),
                                      calculationType
                                    )
                                  : '-'}
                              </td>
                            )
                          case 'GHG Savings(mtCO2e)':
                            return (
                              <td key={index}>
                                {ghgSavings
                                  ? numberWithCommas(
                                      round(ghgSavings, 2),
                                      calculationType
                                    )
                                  : '-'}
                              </td>
                            )
                          case 'GHG Savings Cost($/mtCO2e)':
                            return (
                              <td key={index}>
                                {ghgSavingsCost
                                  ? numberWithCommas(
                                      round(ghgSavingsCost, 2),
                                      calculationType
                                    )
                                  : '-'}
                              </td>
                            )
                          default:
                            return <td key={index}></td>
                        }
                      })}
                    <td>
                      <div className={styles.scrollExtra}>
                        <CustomProjectEquipmentExtraDropdown
                          key={index}
                          index={index}
                          id={item.equipment}
                          currentIndex={this.state.showExtras}
                          deleteText={'Remove Equipment'}
                          handleToggleExtras={this.handleToggleExtras}
                          onRemove={this.onEquipmentRemove}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}

              <tr>
                {showPosition === '' && <td>Total</td>}
                {!fieldsSeparated &&
                  fields.length > 0 &&
                  fields.map((field, index) => {
                    return (
                      <td key={index}>
                        {this.getTotal('field', field)
                          ? numberWithCommas(
                              _.round(this.getTotal('field', field), 2)
                            )
                          : '-'}
                      </td>
                    )
                  })}
                {showPosition === 'existingFields' && <td>Total</td>}
                {fieldsSeparated &&
                  existingFields.length &&
                  existingFields.map((field, index) => {
                    return (
                      <td key={index}>
                        {this.getTotal('field', field)
                          ? numberWithCommas(
                              _.round(this.getTotal('field', field), 2)
                            )
                          : '-'}
                      </td>
                    )
                  })}
                {showPosition === 'replacementFields' && <td>Total</td>}
                {fieldsSeparated &&
                  replacementFields.length &&
                  replacementFields.map((field, index) => {
                    if (field.name === 'Group')
                      return <td className={styles['groupName']}>-</td>
                    return (
                      <td key={index}>
                        {this.getTotal('field', field)
                          ? numberWithCommas(
                              _.round(this.getTotal('field', field), 2)
                            )
                          : '-'}
                      </td>
                    )
                  })}
                {incentiveFields.length &&
                  incentiveFields.map((field, index) => {
                    return (
                      <td key={index}>
                        {this.getTotal('incentive', field)
                          ? numberWithCommas(
                              _.round(this.getTotal('incentive', field), 2)
                            )
                          : '-'}
                      </td>
                    )
                  })}

                {financialFields.length &&
                  financialFields.map((field, index) => {
                    if (field === 'Cost') {
                      return (
                        <td className={styles.linkColumn} key={index}>
                          {this.getTotal('project_cost')
                            ? numberWithCommas(
                                _.round(this.getTotal('project_cost'), 2)
                              )
                            : '-'}
                        </td>
                      )
                    }
                    if (field == 'Financing/Funding')
                      return (
                        <td className={styles.linkColumn}>
                          {this.getTotal('funding')
                            ? numberWithCommas(
                                _.round(this.getTotal('funding'), 2)
                              )
                            : '-'}
                        </td>
                      )
                    return <td key={index}>-</td>
                  })}
                {savingFields.length &&
                  savingFields.map((field, index) => {
                    let value = this.getTotal('project', field)
                    return (
                      <td key={index}>
                        {value ? numberWithCommas(_.round(value, 2)) : '-'}
                      </td>
                    )
                  })}
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}
export default CustomProjectEquipmentTable
