import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import _ from 'lodash'
import { uniq, reject, round, find, isEmpty } from 'lodash'
import uuid from 'uuid'

import buildingTypes from 'static/building-types'

import {
  reRunProjectPackage,
  deleteBulkMeasureForProject,
  analysisProjectWithSubProject,
  removeOldSubProjects
} from 'routes/Building/modules/building'
import { xcelMeasureNameList } from 'utils/xcelMeasures'
import { Loader } from 'utils/Loader'
import {
  filterBuildingEquipment,
  findBuildingEquipmentById,
  getValueFromQualifiedOption,
  getValueForXcelMeasure,
  getRebateTypeAndLabelForXcelMeasure,
  checkXcelMeasureFieldForCalcuation,
  calculateIncetiveCostValueForXcelMeasure,
  getEquipmentQuantity,
  setFormEquipmentValues,
  calculateIncentive,
  evaluateConditions
} from 'utils/Project'
import { isProdEnv, findGroupUniqueName } from 'utils/Utils'
import { sortFunction } from 'utils/Portfolio'
import UserFeature from 'utils/Feature/UserFeature'
import DocuSignSection from 'components/DocuSign/DocuSignSection'
import TextQuillEditor from 'components/UI/TextEditor/TextQuillEditor'
import ProjectInfo from 'components/Project/ProjectInfo'
import ToolTip from 'components/ToolTip'
import { ToggleTab } from 'components/Asset/ToggleTab'

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

import ImagesField from '../../FormFields/ImagesField'
import { ProjectPackagesModal } from '../../../Modal'
import { LocationFormSection } from '../../LocationForms/LocationFormSection'

import LocationModal from '../../../Modal/LocationModal'

import ProjectSettingsModal from './ProjectSettingsModal'
import ProjectAnalyzeModal from './ProjectAnalyzeModal'
import ProjectEquipmentModal from './ProjectEquipmentModal'
import CustomProjectEquipmentTable from './CustomProjectEquipmentTable'

import styles from './CustomProjectForm.scss'

export class CustomProjectForm extends React.Component {
  static propTypes = {
    currentProject: PropTypes.object.isRequired,
    submitFunction: PropTypes.func.isRequired,
    eaAudit: PropTypes.object.isRequired,
    handleGoBack: PropTypes.func.isRequired,
    handleCloseAddProjects: PropTypes.func,
    currentView: PropTypes.string.isRequired,
    isSubmitting: PropTypes.bool.isRequired,
    errorRunningProject: PropTypes.bool.isRequired,
    zipCode: PropTypes.string,
    library: PropTypes.bool
  }

  state = {
    lastData: null,
    isAnalysisNeed: false,
    isLoading: false,
    didMount: false,
    formIsValid: false,
    formValues: {},
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
    selectedEquipmentImages: [],
    auditObj: {},
    eaComponents: {},
    currentEaComponent: {},
    eaComponentType: '',
    eaImages: [],
    originalEaImages: [],
    eaImagesButtonDisable: false,
    eaImagesLoading: false,
    imageToAddToReports: [],
    locationModalOpen: false,
    locationName: '',
    locations: [],
    statusOptions: [
      { name: 'Identified', value: 'Identified' },
      { name: 'Not Recommended', value: 'Not Recommended' },
      { name: 'Recommended', value: 'Recommended' },
      { name: 'Evaluated', value: 'Evaluated' },
      { name: 'Selected', value: 'Selected' },
      { name: 'Initiated', value: 'Initiated' },
      { name: 'Discarded', value: 'Discarded' },
      { name: 'In Progress', value: 'In Progress' },
      { name: 'On Hold', value: 'On Hold' },
      { name: 'Completed', value: 'Completed' },
      { name: 'M&V', value: 'M&V' },
      { name: 'Verified', value: 'Verified' },
      { name: 'Unsatisfactory', value: 'Unsatisfactory' }
    ],
    typeOptions: [
      {
        name: 'Energy Efficiency Measure (EEM)',
        value: 'Energy Efficiency Measure (EEM)'
      },
      { name: 'RCx Measure (RCM)', value: 'RCx Measure (RCM)' },
      { name: 'O&M Measure', value: 'O&M Measure' },
      { name: 'Generation Measure', value: 'Generation Measure' }
    ],
    budgetTypeOptions: [
      {
        name: 'Low Cost/No Cost',
        value: 'Low Cost/No Cost'
      },
      {
        name: 'Capital Investment',
        value: 'Capital Investment'
      }
    ],
    projectPackages: [],
    modalOpen: false,
    viewMode: '',
    projectPackage: {},
    currentProject: {},
    reRunProject: false,
    isInfoModalOpen: false,
    isEquipmentModalOpen: false,
    isSettingsModalOpen: false,
    isAnalyzeModalOpen: false,
    rates: (this.props.currentProject && this.props.currentProject.rates) || {},
    subProjects:
      (this.props.currentProject && this.props.currentProject.projects) || [],
    groups:
      (this.props.currentProject && this.props.currentProject.groups) || [],
    equipments:
      (this.props.currentProject && this.props.currentProject.equipments) || [],
    equipmentToGroupMap:
      (this.props.currentProject &&
        this.props.currentProject.equipmentToGroupMap) ||
      {},
    equipmentToProjectMap:
      (this.props.currentProject &&
        this.props.currentProject.equipmentToProjectMap) ||
      {},
    equipmentToEquipmentNameMap:
      (this.props.currentProject &&
        this.props.currentProject.equipmentToEquipmentNameMap) ||
      {},
    analysisToggleViewOption: 'ROI',
    oldSubProjects: [],
    cashFlowData:
      (this.props.currentProject &&
        this.props.currentProject['cashFlowData']) ||
      {}
  }

  componentDidMount = () => {
    const {
      eaAudit,
      building,
      library,
      getProjectPackages,
      buildingId
    } = this.props
    const { rates } = this.state
    this.setFormValues()

    setTimeout(() => {
      this.setState({ didMount: true })
    }, 0)

    // if there is an eaAudit in the building object from props
    if (eaAudit.constructor === Object && Object.keys(eaAudit).length !== 0) {
      this.setState({ auditObj: eaAudit })
      this.getEaComponents(eaAudit)
    }

    if (!library) {
      getProjectPackages(buildingId).then(packages => {
        this.setState({
          projectPackages: packages
        })
      })
    }

    let updatedRates = !isEmpty(rates)
      ? rates
      : (building && building.projectRates) || {}
    const buildingRates = (building && building.projectRates) || {}
    for (let key in updatedRates) {
      if (buildingRates[key] && !updatedRates[key]) {
        updatedRates[key] = buildingRates[key]
      }
    }
    this.setState({
      rates: updatedRates
    })
  }

  findBuildingUseName = buildingUse => {
    if (buildingUse) {
      let typeObject = buildingTypes.find(type => type.value === buildingUse)
      return typeObject ? typeObject.name : 'Undefined'
    } else {
      return 'Undefined'
    }
  }

  setFormValues = async () => {
    const { currentProject } = this.props
    let { selectedEquipmentImages, imageToAddToReports } = this.state
    if (currentProject.imagesInReports) {
      imageToAddToReports = currentProject.imagesInReports
    }
    if (currentProject.initialValues && currentProject.dataAlreadyFromEA) {
      let tempFormObj = Object.assign(
        { ...this.state.formValues },
        currentProject.initialValues
      )
      tempFormObj['displayName'] = currentProject.displayName
      tempFormObj['description'] = currentProject.description
      tempFormObj['status'] = currentProject.status || ''
      tempFormObj['type'] = currentProject.type || ''
      tempFormObj['budgetType'] = currentProject.budgetType || ''
      tempFormObj['measureLife'] = currentProject.measureLife || ''
      tempFormObj['package'] =
        (currentProject.package && currentProject.package._id) || ''
      this.setState({ formValues: tempFormObj })
      const data = this.calculateIncentive(
        tempFormObj,
        selectedEquipmentImages,
        imageToAddToReports
      )
      tempFormObj = { ...data.tempFormObj }
    } else if (currentProject.initialValues) {
      let tempFormObj = Object.assign(
        { ...this.state.formValues },
        currentProject.initialValues
      )
      tempFormObj['displayName'] = currentProject.displayName
      tempFormObj['description'] = currentProject.description
      tempFormObj['status'] = currentProject.status || ''
      tempFormObj['type'] = currentProject.type || ''
      tempFormObj['budgetType'] = currentProject.budgetType || ''
      tempFormObj['measureLife'] = currentProject.measureLife || ''
      tempFormObj['package'] =
        (currentProject.package && currentProject.package._id) || ''
      if (currentProject.initialValues.existing_equipment) {
        const buildingEquipment = findBuildingEquipmentById(
          this.props.buildingEquipment,
          currentProject.initialValues.existing_equipment
        )
        if (buildingEquipment) {
          selectedEquipmentImages = buildingEquipment.images
        }
      }
      this.setState({
        formValues: tempFormObj,
        selectedEquipmentImages,
        imageToAddToReports
      })
    } else {
      let tempFormObj = { ...this.state.formValues }
      tempFormObj['displayName'] = currentProject.displayName
      tempFormObj['description'] = currentProject.description
      tempFormObj['status'] = currentProject.status || ''
      tempFormObj['budgetType'] = currentProject.budgetType || ''
      tempFormObj['type'] = currentProject.type || ''
      tempFormObj['measureLife'] = currentProject.measureLife || ''
      tempFormObj['package'] =
        (currentProject.package && currentProject.package._id) || ''
      if (
        currentProject.fields &&
        currentProject.fields.find(o => o.name === 'zipcode') &&
        this.props.zipCode
      ) {
        tempFormObj['zipcode'] = this.props.zipCode
      }

      if (
        currentProject.initialValues &&
        currentProject.initialValues.location
      ) {
        tempFormObj.location = currentProject.initialValues.location
      }

      if (
        currentProject &&
        currentProject.incentive &&
        currentProject.incentive.incentive_type !== 'none' &&
        currentProject.incentive.input_map
      ) {
        const data = this.calculateIncentive(
          tempFormObj,
          selectedEquipmentImages,
          imageToAddToReports
        )
        tempFormObj = { ...data.tempFormObj }
      } else if (!this.props.library) {
        if (currentProject.name === 'boilerTuneUpNY') {
          tempFormObj.building_type = this.findBuildingUseName(
            (this.props.building && this.props.building.buildingUse) || ''
          )
          const { totalUtilUsages } = this.props.utilityMetrics
          let natural_gas =
            (totalUtilUsages && totalUtilUsages['natural-gas']) || 0
          let fuelOil2 = (totalUtilUsages && totalUtilUsages['fuel-oil-2']) || 0
          let fuelOil4 = (totalUtilUsages && totalUtilUsages['fuel-oil-4']) || 0
          let total = natural_gas + fuelOil2 + fuelOil4
          if (!total) {
            cle
            total = 1
            natural_gas = 1
          }

          let sum = 0
          let buildingEquipment = filterBuildingEquipment(
            this.props.buildingEquipment,
            {
              category: 'HEATING',
              application: 'BOILER',
              technology: ['STEAM_BOILER', 'HOT_WATER_BOILER']
            }
          )
          buildingEquipment.map(item => {
            let maxOutputCapacity =
              (item.libraryEquipment &&
                item.libraryEquipment.fields &&
                item.libraryEquipment.fields.maxOutputCapacity &&
                item.libraryEquipment.fields.maxOutputCapacity.value) ||
              0
            sum += maxOutputCapacity
          })
          let length = buildingEquipment.length
          tempFormObj.project_cost = 1600 * length
          if (length == 0) {
            tempFormObj.project_cost = 1600
            sum = ((100788 / 1910) * this.props.building.squareFeet) / 1000
          }
          tempFormObj.sum_total_of_maxOutputCapacity = sum
          tempFormObj.units = length
          tempFormObj.percentage_natural_gas = +(
            (natural_gas / total) *
            100
          ).toFixed(0)
          tempFormObj.percentage_2_oil = +((fuelOil2 / total) * 100).toFixed(0)
          tempFormObj.percentage_4_oil = +((fuelOil4 / total) * 100).toFixed(0)
          tempFormObj.square_footage = this.props.building.squareFeet
        } else if (currentProject.name == 'lightingNY') {
          let lighting =
            (this.props.endUse &&
              this.props.endUse['lighting-energy-estimate'] &&
              this.props.endUse['lighting-energy-estimate']
                .estimated_consumption) ||
            0
          tempFormObj.baseline_eub_lighting = lighting
          tempFormObj.building_type = this.findBuildingUseName(
            this.props.building.buildingUse
          )
          tempFormObj.project_cost = this.props.building.squareFeet * 1.2
          tempFormObj.square_footage = this.props.building.squareFeet
        }
        this.setState({ formValues: tempFormObj })
      }

      this.setState({
        formValues: tempFormObj
      })
    }

    if (currentProject.locations) {
      this.setState({
        locations: currentProject.locations
      })
    }
  }

  createPayload = (formValues, completeBool) => {
    const { currentProject } = this.props
    const {
      notesImages,
      buildingImages,
      measuresImages,
      ...values
    } = formValues

    if (values.package === 'addProject') delete values['package']

    for (var key in values) {
      if (
        values.hasOwnProperty(key) &&
        !isNaN(values[key]) && // if it is a number (accounts for numbers as strings)
        values[key] !== ''
      ) {
        values[key] = parseFloat(values[key])
      }
    }

    let tagsArr = values.tags
      ? values.tags.split(',').map(item => item.trim())
      : []

    let incentiveObj = { ...currentProject.incentive }
    // add a default of zeros
    incentiveObj['input'] = values.input || 0
    values.input = values.input || 0
    values.maintenance_savings = values.maintenance_savings || ''
    values.project_cost = values.project_cost || null

    let imageUrls
    if (formValues.selectedImages && formValues.uploadedImages) {
      imageUrls = [...formValues.selectedImages, ...formValues.uploadedImages]
    } else if (formValues.uploadedImages) {
      imageUrls = formValues.uploadedImages
    } else if (formValues.selectedImages) {
      imageUrls = formValues.selectedImages
    }

    const payload = {
      name: currentProject.name,
      displayName: values.displayName,
      originalDisplayName:
        currentProject.originalDisplayName || currentProject.displayName,
      source: currentProject.source || '',
      fuel: currentProject.fuel || '',
      tags: tagsArr,
      locations: values.locations,
      comment: values.comment,
      description: values.description,
      fields: currentProject.fields,
      initialValues: values,
      incentive: incentiveObj,
      category: currentProject.category,
      applicable_building_types: currentProject.applicable_building_types,
      project_category: currentProject.project_category,
      project_application: currentProject.project_application,
      project_technology: currentProject.project_technology,
      analysisType: currentProject.analysisType,
      type: formValues.type || '',
      implementation_strategy: values.implementation_strategy,
      imageUrls: imageUrls,
      isProject: currentProject.isEditing,
      isComplete: completeBool,
      createNewProject: true,
      status: formValues.status || '',
      measureLife: formValues.measureLife || '',
      budgetType: formValues.budgetType || '',
      formulas: currentProject.formulas || {},
      config: currentProject.config || {}
    }

    if (currentProject.eaDisplayName) {
      payload.eaDisplayName = currentProject.eaDisplayName
    }

    return payload
  }

  handleSelect = async (event, key) => {
    const { formValues } = this.state
    if (key === 'package' && event.target.value == 'addProject') {
      let flag = false
      let currentProject = this.props.currentProject
      currentProject.runResultsWithRate = {
        ...currentProject.runResults
      }
      for (let key in currentProject.initialValues) {
        if (currentProject.initialValues[key] != formValues[key]) {
          flag = true
          break
        }
      }
      if (flag) {
        this.setState({ reRunProject: true })
        let formValues = Object.assign({}, this.state.formValues)
        let formIsValid = this.state.formIsValid
        if (formValues.input === '') formValues.input = '0'
        Object.assign({}, formValues, {
          locations: this.state.locations
        })

        const payload = this.createPayload(formValues, formIsValid)
        try {
          currentProject = await this.props.reRunProjectPackage({
            payload,
            buildingId: this.props.building._id
          })
        } catch (error) {}
        this.setState({ reRunProject: false })
      }
      currentProject.collectionTarget = 'measure'
      this.setState({
        modalOpen: true,
        viewMode: 'addProjectPackage',
        currentProject,
        projectPackage: {
          projects: [currentProject]
        },
        formValues: {
          ...formValues,
          package: 'addProject'
        }
      })
    } else {
      this.setState({
        formValues: {
          ...formValues,
          [key]: event.target.value
        }
      })
    }
  }

  handleDescriptionChange = html => {
    this.setState({
      formValues: {
        ...this.state.formValues,
        description: html
      }
    })
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
              if (labor_rate && hours) {
                lockFields = ['labor_unit_cost', 'labor_quantity']
              } else {
                lockFields = []
              }
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
              if (labor_unit_cost && labor_quantity) {
                lockFields = ['labor_rate', 'hours']
              } else {
                lockFields = []
              }
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

  getDiff = (obj1, obj2) => {
    let keys = []

    for (let key of Object.keys(obj2)) {
      if (!Object.keys(obj1).includes(key)) keys.push(key)
    }
    for (let key of Object.keys(obj1)) {
      if (obj1[key] !== obj2[key]) keys.push(key)
    }
    return keys
  }

  handleChange = (
    equipmentData = {},
    event,
    inputType,
    additionalInputType
  ) => {
    let updatedData = { ...equipmentData }
    const {
      groupId = null,
      equipmentId = null,
      isEquipmentField = false,
      isDesignField = false
    } = updatedData
    const { currentProject } = this.props
    let {
      extraFinancialFields,
      formValues,
      selectedEquipmentImages,
      imageToAddToReports
    } = this.state

    let extraFieldsArray = this.getExtraFields(extraFinancialFields)
    let extraFieldsObj = this.getExtraFieldsBySection(extraFinancialFields)
    let group = {}
    let tempformValues = null
    if (groupId) {
      group = _.find(this.state.groups, { id: groupId })
      let equipmentValues = (group && group.equipmentValues) || {}
      let equipmentValue = equipmentValues[equipmentId] || {}
      let financialValues = (group && group.financialValues) || {}
      let financialValue = financialValues[equipmentId] || {}

      let UpdatedTempformValues = {
        ...((group && group.formValues) || {}),
        ...equipmentValue,
        ...financialValue
      }
      tempformValues = UpdatedTempformValues
    } else {
      tempformValues = { ...this.state.formValues }
    }

    try {
      let currentField = currentProject.fields.find(
        e => e.name === event.target.name
      )
      if (currentField && currentField.type === 'select') {
        let currentSelection = currentField.options.find(
          e => e.value === event.target.value
        )
        if (currentSelection && currentSelection.set) {
          for (let key in currentSelection.set) {
            tempformValues[key] = currentSelection.set[key]
          }
        } else {
          const conditionalOptions = currentField.conditionalOptions || []
          for (let conditionOption of conditionalOptions) {
            let options = conditionOption.options || []
            let selection = options.find(
              option => option.value === event.target.value
            )
            if (selection && selection.set) {
              for (let key in selection.set) {
                tempformValues[key] = selection.set[key]
              }
            }
          }
        }
      }
    } catch (e) {
      console.log('error', e)
    }

    if (
      event.target.name !== 'input' &&
      event.target.name !== 'project_cost' &&
      event.target.name !== 'project_total_financing_funding' &&
      event.target.name !== 'maintenance_savings' &&
      event.target.name !== 'displayName' &&
      event.target.name !== 'description'
    ) {
      tempformValues[event.target.name] = event.target.value

      if (currentProject.config && currentProject.config.conditionalIncentive) {
        try {
          let result = calculateIncentive(
            currentProject.config.conditionalIncentive,
            tempformValues
          )
          tempformValues['input'] = result.incentive
          tempformValues['incentive_description'] = result.description
        } catch (error) {}
        this.setState({
          formValues: tempformValues
        })
      }
      if (currentProject.config && currentProject.config.conditionalCost) {
        try {
          let result = calculateIncentive(
            currentProject.config.conditionalCost,
            tempformValues
          )
          tempformValues['project_cost'] = result.incentive
          tempformValues['cost_description'] = result.description
        } catch (error) {}

        this.setState({
          formValues: tempformValues
        })
      }

      {
        let condition = currentProject.config?.conditionalCost?.find(itm =>
          evaluateConditions(itm.conditions, tempformValues)
        )
        let quantity =
          tempformValues['quantity'] || tempformValues['units'] || 0
        if (!quantity) {
          const quantityField = this.props?.currentProject?.fields?.find(
            item => item.label === 'Quantity'
          )
          if (quantityField) {
            quantity = tempformValues[quantityField.name] || 0
          }
        }
        let newObj = { material_quantity: quantity, labor_quantity: quantity }
        if (condition) {
          for (let key in condition) {
            if (key === 'conditions') continue
            if (key === 'laborUnitCost')
              newObj['labor_unit_cost'] = condition[key]
            if (key === 'materialUnitCost')
              newObj['material_unit_cost'] = condition[key]
            if (key === 'proposed_total_wattage')
              newObj['proposed_total_wattage'] =
                condition['proposed_total_wattage']
          }
        }
        const updatedGroupValue = {
          ...tempformValues
        }
        for (let key in newObj) {
          if (!updatedGroupValue[key]) {
            updatedGroupValue[key] = newObj[key]
          }
        }
        const { formValues: updatedValue } = this.calculateBasedOnCondition(
          newObj,
          updatedGroupValue
        )
        tempformValues = { ...tempformValues, ...updatedValue }
      }
    }

    if (inputType === 'boolean') {
      tempformValues[event.target.name] =
        event.target.value === 'true' ? true : false
      // calculate project cost when extra financial field are edited
    } else if (extraFieldsArray.indexOf(event.target.name) > -1) {
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
          tempformValues['total_labor_cost'] = totalCost
        } else if (
          fieldName === 'envrionment_unit_cost' ||
          fieldName === 'envrionment_quantity'
        ) {
          let envrionment_unit_cost =
            tempformValues['envrionment_unit_cost'] || 0
          let envrionment_quantity = tempformValues['envrionment_quantity'] || 0
          if (fieldName === 'envrionment_unit_cost')
            envrionment_unit_cost = value
          if (fieldName === 'envrionment_quantity') envrionment_quantity = value
          let totalCost = envrionment_unit_cost * envrionment_quantity
          tempformValues['total_envrionment_unit_cost'] = totalCost
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
              item !== 'envrionment_unit_cost' &&
              item !== 'envrionment_quantity'
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
    } else if (inputType === 'selectAndNumber') {
      let value = event.target.value
      if (additionalInputType == 'input') {
        value = `Other / ${value}`
      } else {
        if (event.target.value.toLowerCase() === 'other') {
          const field = this.props.currentProject.fields.filter(
            item => item.name === event.target.name
          )[0]
          const preOption =
            field &&
            field.options.filter(
              item => item.value === this.state.formValues[event.target.name]
            )[0]
          const otherValueKey = Object.keys(preOption).filter(
            key => key != 'value' && key != 'label'
          )[0]
          value = `Other / ${preOption[otherValueKey]}`
        }
      }
      tempformValues[event.target.name] = value
      if (event.target.name === 'xcelLEDlighting_annual_lighting_hours') {
        let split = value.split(' / ')
        if (split.length === 1) {
          tempformValues.facility_type = split[0]
          tempformValues.annual_hours = 0
        } else if (split.length === 2) {
          tempformValues.facility_type = 'Other'
          tempformValues.annual_hours = +split[1]
        }
      }
    } else {
      tempformValues[event.target.name] = event.target.value
    }

    if (event.target.name === 'xcelLEDLighting_rebate_type') {
      tempformValues.xcelLEDLighting_replace_name = ''
      tempformValues.xcelLEDLighting_replace_wattage = '0'
      tempformValues.xcelLEDLighting_rebate = ''
    }
    if (event.target.name === 'xcelLEDLighting_rebate') {
      tempformValues.xcelLEDLighting_replace_name = event.target.value
    }
    if (event.target.name === 'xcelLEDLighting_replace_wattage') {
      tempformValues.equipment_model_watts =
        tempformValues.xcelLEDLighting_replace_wattage
    }
    // console.log("HERE1")
    // if (event.target.conditionalOptions) {
    //   console.log("HERE2")
    // }
    if (event.target.name === 'retrofit_equipment__v2') {
      /* TODO: expand this to work for any measure */
      if (event.target.value) {
        let index = event.target.selectedIndex
        let label = event.target[index].text
        tempformValues.proposed_total_wattage = event.target.value
        tempformValues.replacement_equipment_name = label
        currentProject.fields.find(
          f => f.name === 'replacement_fixture_code'
        ).state = 'HIDE'
      } else {
        tempformValues.replacement_equipment_name = ''
        currentProject.fields.find(
          f => f.name === 'replacement_fixture_code'
        ).state = 'SHOW'
      }
    }
    if (event.target.name === 'existing_equipment__v2') {
      /* this is similar to existing_equipment but relies entirely on the database field configuration */
      let buildingEquipment = this.props.buildingEquipment.filter(
        item => item._id === tempformValues.existing_equipment__v2
      )
      imageToAddToReports = imageToAddToReports.filter(
        url => !selectedEquipmentImages.includes(url)
      )
      if (buildingEquipment.length) {
        buildingEquipment = buildingEquipment[0]
        let equipmentData = currentProject.fields.find(
          f => f.name === 'existing_equipment__v2'
        ).equipment
        let equipmentDataFields = equipmentData.fields
        if (buildingEquipment.libraryEquipment.type !== equipmentData.type) {
          let equipment_2 = currentProject.fields.find(
            f => f.name === 'existing_equipment__v2'
          )
          equipmentDataFields =
            (equipment_2 &&
              equipment_2.equipment_2 &&
              equipment_2.equipment_2.fields) ||
            []
        }
        setFormEquipmentValues(
          equipmentDataFields,
          buildingEquipment,
          tempformValues,
          this.props.building,
          this.props.operations,
          2
        )
        if (buildingEquipment.images) {
          selectedEquipmentImages = buildingEquipment.images
        } else {
          selectedEquipmentImages = []
        }
      }
    }

    if (event.target.name === 'existing_equipment') {
      let buildingEquipment = filterBuildingEquipment(
        this.props.buildingEquipment,
        {
          category: 'LIGHTING'
        }
      )
      buildingEquipment = buildingEquipment.filter(
        item => item._id === tempformValues.existing_equipment
      )
      imageToAddToReports = imageToAddToReports.filter(
        url => !selectedEquipmentImages.includes(url)
      )
      if (buildingEquipment.length) {
        let incentiveValue = 0,
          costValue = 0,
          incentiveUnit = ''
        ;({
          incentiveValue,
          costValue,
          incentiveUnit
        } = getValueFromQualifiedOption(
          tempformValues.xcelLEDLighting_rebate,
          tempformValues.dlc_qualified,
          tempformValues.energy_star_qualified
        ))
        tempformValues['incentiveValue'] = incentiveValue
        tempformValues['project_cost'] = costValue
        tempformValues['incentiveUnit'] = incentiveUnit
        buildingEquipment = buildingEquipment[0]
        tempformValues.qty_existing_equip = getEquipmentQuantity(
          buildingEquipment,
          incentiveUnit
        )
        tempformValues.qty_existing_equip_base =
          (buildingEquipment && buildingEquipment.quantity) || 0
        tempformValues.existing_equipment_name =
          (buildingEquipment &&
            buildingEquipment.libraryEquipment &&
            buildingEquipment.libraryEquipment.name) ||
          ''
        tempformValues.existing_equipment_wattage =
          (buildingEquipment &&
            buildingEquipment.libraryEquipment &&
            buildingEquipment.libraryEquipment.fields &&
            buildingEquipment.libraryEquipment.fields.totalWattage &&
            buildingEquipment.libraryEquipment.fields.totalWattage.value) ||
          ''
        tempformValues.qty_prop_equip = tempformValues.qty_existing_equip
        if (buildingEquipment.images) {
          selectedEquipmentImages = buildingEquipment.images
        } else {
          selectedEquipmentImages = []
        }
      } else {
        tempformValues.qty_existing_equip = 0
        tempformValues.qty_prop_equip = 0
        tempformValues.existing_equipment_name = ''
        tempformValues.existing_equipment_wattage = ''
        selectedEquipmentImages = []
      }
      tempformValues.existing_model_watts =
        tempformValues.existing_equipment_wattage
    }

    if (
      event.target.name === 'xcelAntiSweatHeaterControlsRebateType' ||
      event.target.name === 'antiSweatHeaterControlType'
    ) {
      tempformValues.xcelAntiSweatHeaterControlsRebateType = event.target.value
      tempformValues.antiSweatHeaterControlType = event.target.value
    }

    if (
      (event.target.name === 'washing_machine_capacity' &&
        currentProject.name === 'xcelOzoneLaundry') ||
      event.target.name === 'seer_eff' ||
      (currentProject.name === 'xcelDishwashers' &&
        event.target.name === 'dishwasher_type') ||
      ((currentProject.name === 'xcelVFDOnMotor' ||
        currentProject.name === 'xcelVFDOnMotorWaterWellPump' ||
        currentProject.name === 'xcelMotorUpgrade') &&
        event.target.name === 'motor_tag') ||
      ((currentProject.name === 'xcelRefrigerationNoHeatCaseDoors' ||
        currentProject.name === 'xcelRefrigerationCaseDoors') &&
        event.target.name === 'caseType') ||
      (currentProject.name === 'xcelCompressedAirMistEliminatorsSavings' &&
        event.target.name === 'cfm') ||
      (currentProject.name === 'xcelRefrigerationECMotors' &&
        event.target.name === 'motor_application') ||
      (currentProject.name === 'xcelCompressedAirCyclingDryersSavings' &&
        event.target.name === 'cfm') ||
      (currentProject.name === 'xcelCompressedAirDewPointControlsSavings' &&
        event.target.name === 'cfm') ||
      (currentProject.name === 'xcelBoilerStackDamper' &&
        event.target.name === 'inputCapacity') ||
      (currentProject.name === 'xcelBoilerOutdoorAirReset' &&
        event.target.name === 'inputCapacity') ||
      (currentProject.name === 'xcelBoilerModulatingBurnerControl' &&
        event.target.name === 'inputCapacity')
    ) {
      const { rebateType } = getRebateTypeAndLabelForXcelMeasure(
        currentProject.name,
        event.target.value
      )
      tempformValues[`${currentProject.name}RebateType`] = rebateType
    }

    if (
      currentProject.name === 'xcelUnitHeaters' &&
      (event.target.name === 'infrared_heater' ||
        event.target.name === 'unit_heater_type')
    ) {
      const { rebateType } = getRebateTypeAndLabelForXcelMeasure(
        currentProject.name,
        {
          infrared_heater: tempformValues['infrared_heater'],
          unit_heater_type: tempformValues['unit_heater_type']
        }
      )
      tempformValues.xcelUnitHeatersRebateType = rebateType
    }

    if (
      currentProject.name === 'xcelBoilerNewHighEfficiency' &&
      event.target.name === 'boilerType'
    ) {
      const { rebateType } = getRebateTypeAndLabelForXcelMeasure(
        currentProject.name,
        {
          boilerType: tempformValues['boilerType'],
          inputCapacity: tempformValues['inputCapacity']
        }
      )
      tempformValues.xcelBoilerNewHighEfficiencyRebateType = rebateType
    }
    if (
      currentProject.name === 'xcelWaterOrAirCooledChillers' &&
      event.target.name === 'size'
    ) {
      const { rebateType } = getRebateTypeAndLabelForXcelMeasure(
        currentProject.name,
        {
          chiler_type: tempformValues['chiler_type'],
          size: tempformValues['size']
        }
      )
      tempformValues.xcelWaterOrAirCooledChillersRebateType = rebateType
    }

    if (
      currentProject.name === 'xcelPipeInsulation' &&
      (event.target.name === 'pipeDiameter' ||
        event.target.name === 'insulationThickness' ||
        event.target.name === 't_fluid')
    ) {
      const { rebateType } = getRebateTypeAndLabelForXcelMeasure(
        currentProject.name,
        {
          pipeDiameter: tempformValues['pipeDiameter'],
          insulationThickness: tempformValues['insulationThickness'],
          t_fluid: tempformValues['t_fluid']
        }
      )
      tempformValues.xcelPipeInsulationRebateType = rebateType
    }

    if (
      currentProject.name === 'xcelHVACUnitReplacement' &&
      (event.target.name === 'equipment_type' ||
        event.target.name === 'size' ||
        event.target.name === 'eer_eff' ||
        event.target.name === 'seer_eff' ||
        event.target.name === 'xcelHVACUnitReplacementRebateType')
    ) {
      let { rebateType } = getRebateTypeAndLabelForXcelMeasure(
        currentProject.name,
        {
          equipment_type: tempformValues['equipment_type'],
          size: tempformValues['size'],
          eer_eff: tempformValues['eer_eff'],
          seer_eff: tempformValues['seer_eff']
        }
      )
      if (event.target.name === 'xcelHVACUnitReplacementRebateType')
        rebateType = tempformValues.xcelHVACUnitReplacementRebateType
      else tempformValues.xcelHVACUnitReplacementRebateType = rebateType
      let field = currentProject.fields.filter(
        item => item.name === 'xcelHVACUnitReplacementRebateType'
      )
      if (field.length) {
        let options = field[0].options || []
        const xcel_effective_useful_lifeOption = options.filter(
          item => item.value === rebateType
        )
        if (xcel_effective_useful_lifeOption.length)
          tempformValues.xcel_effective_useful_life =
            xcel_effective_useful_lifeOption[0].xcel_effective_useful_life ||
            '0'
        else tempformValues.xcel_effective_useful_life = '0'
      } else tempformValues.xcel_effective_useful_life = '0'
    }

    if (
      currentProject.name === 'xcelDishwashers' &&
      event.target.name === 'dishwasher_type'
    ) {
      let field = currentProject.fields.filter(
        field => field.name === event.target.name
      )
      if (field.length) {
        let options = field[0].options || []
        const xcel_effective_useful_lifeOption = options.filter(
          item => item.value === event.target.value
        )
        if (xcel_effective_useful_lifeOption.length) {
          tempformValues.xcel_effective_useful_life =
            xcel_effective_useful_lifeOption[0].xcel_effective_useful_life
        }
      }
    }

    if (
      event.target.name !== 'input' &&
      event.target.name !== 'project_cost' &&
      event.target.name !== 'maintenance_savings' &&
      event.target.name !== 'project_total_financing_funding' &&
      event.target.name !== 'displayName' &&
      event.target.name !== 'description' &&
      !checkXcelMeasureFieldForCalcuation(
        currentProject.name,
        event.target.name
      ) &&
      currentProject &&
      currentProject.incentive &&
      currentProject.incentive.incentive_type !== 'none'
    ) {
      let { tempFormObj: updatedFormObj } = this.calculateIncentive(
        tempformValues,
        selectedEquipmentImages,
        imageToAddToReports
      )
      tempformValues = { ...updatedFormObj }

      if (currentProject.config && currentProject.config.conditionalIncentive) {
        let result = calculateIncentive(
          currentProject.config.conditionalIncentive,
          tempformValues
        )
        tempformValues['input'] = result.incentive
        tempformValues['incentive_description'] = result.description
      }
      if (currentProject.config && currentProject.config.conditionalCost) {
        try {
          let result = calculateIncentive(
            currentProject.config.conditionalCost,
            tempformValues
          )
          tempformValues['project_cost'] = result.incentive
          tempformValues['cost_description'] = result.description
        } catch (error) {}

        {
          let condition = currentProject.config?.conditionalCost.find(itm =>
            evaluateConditions(itm.conditions, tempformValues)
          )
          let quantity =
            tempformValues['quantity'] || tempformValues['units'] || 0
          if (!quantity) {
            const quantityField = this.props?.currentProject?.fields?.find(
              item => item.label === 'Quantity'
            )
            if (quantityField) {
              quantity = tempformValues[quantityField.name] || 0
            }
          }
          let newObj = { material_quantity: quantity, labor_quantity: quantity }
          if (condition) {
            for (let key in condition) {
              if (key === 'conditions') continue
              if (key === 'laborUnitCost')
                newObj['labor_unit_cost'] = condition[key]
              if (key === 'materialUnitCost')
                newObj['material_unit_cost'] = condition[key]
              if (key === 'proposed_total_wattage')
                newObj['proposed_total_wattage'] =
                  condition['proposed_total_wattage']
            }
          }
          const updatedGroupValue = {
            ...tempformValues,
            ...newObj
          }
          const { formValues: updatedValue } = this.calculateBasedOnCondition(
            newObj,
            updatedGroupValue
          )
          console.log('updatedValue', updatedValue)
          tempformValues = { ...tempformValues, ...updatedValue }
        }
      }
    } else if (
      checkXcelMeasureFieldForCalcuation(currentProject.name, event.target.name)
    ) {
      let { tempFormObj: updatedFormObj } = this.calculateIncentiveWithRebate(
        tempformValues,
        selectedEquipmentImages,
        imageToAddToReports
      )
      tempformValues = { ...updatedFormObj }
    }

    // need to update group now

    let isAnalysisNeed = false
    let newGroups = []
    if (groupId) {
      for (let group of this.state.groups) {
        if (group.id !== groupId) {
          newGroups.push(group)
        } else {
          const incentive = {
            ...(group.incentive || {}),
            input: tempformValues['input'] || 0
          }
          let financialValues = {
            ...(group.financialValues || {})
          }
          let updatedValues = { ...financialValues }
          const { equipmentToGroupMap } = this.state
          let updatedEquipmentToGroupMap = {}

          for (let key of Object.keys(equipmentToGroupMap)) {
            if (equipmentToGroupMap[key] === groupId) {
              updatedEquipmentToGroupMap[key] = equipmentToGroupMap[key]
            }
          }

          for (let key of Object.keys(updatedEquipmentToGroupMap)) {
            updatedValues[key] = {
              ...financialValues[key],
              ...tempformValues
            }
          }

          newGroups.push({
            ...group,
            formValues: tempformValues,
            financialValues: updatedValues,
            incentive
          })
        }
      }
      isAnalysisNeed = true
    } else {
      this.setState({
        formValues: tempformValues
      })
    }

    if (isEquipmentField) {
      let equipmentValues = (group && group.equipmentValues) || {}
      let financialValues = (group && group.financialValues) || {}
      let originalEquipmentValues = { ...equipmentValues }
      let originalFinancialValues = { ...financialValues }

      if (equipmentId) {
        let equipmentValue =
          (equipmentId && equipmentValues && equipmentValues[equipmentId]) || {}
        let financialValue =
          (equipmentId && financialValues && financialValues[equipmentId]) || {}

        equipmentValues[equipmentId] = {
          ...equipmentValue,
          ...tempformValues
        }

        financialValues[equipmentId] = {
          ...financialValue,
          ...tempformValues
        }
      }

      if (isDesignField && equipmentId) {
        let equipmentValue =
          (equipmentId &&
            originalEquipmentValues &&
            originalEquipmentValues[equipmentId]) ||
          {}
        let financialValue =
          (equipmentId &&
            originalFinancialValues &&
            originalFinancialValues[equipmentId]) ||
          {}
        let UpdateEquipmentValue =
          (equipmentId && equipmentValues && equipmentValues[equipmentId]) || {}
        let UpdateFinancialValue =
          (equipmentId && financialValues && financialValues[equipmentId]) || {}
        const keys1 = this.getDiff(equipmentValue, UpdateEquipmentValue)
        const keys2 = this.getDiff(financialValue, UpdateFinancialValue)
        const equipments = [...this.state.equipments]

        for (let equipment of equipments) {
          if (equipment === equipmentId && !!event.target.value) continue
          for (let key of keys1) {
            if (!event.target.value) {
              const originalValue = this.getEquipmentValue(equipment)
              const originalKeys = Object.keys(originalValue)
              if (originalKeys.includes(key)) {
                UpdateFinancialValue = {
                  ...UpdateFinancialValue,
                  [key]: originalValue[key]
                }
              } else if (key === 'replacement_wattage') {
                UpdateFinancialValue = {
                  ...UpdateFinancialValue,
                  ['replacement_wattage']: originalValue['existing_wattage']
                }
              }
            }
            financialValues[equipment] = {
              ...financialValues[equipment],
              [key]: UpdateFinancialValue[key]
            }
          }
          for (let key of keys2) {
            if (!event.target.value) {
              const originalValue = this.getEquipmentValue(equipment)
              const originalKeys = Object.keys(originalValue)
              if (originalKeys.includes(key)) {
                UpdateFinancialValue = {
                  ...UpdateFinancialValue,
                  [key]: originalValue[key]
                }
              } else if (key === 'replacement_wattage') {
                UpdateFinancialValue = {
                  ...UpdateFinancialValue,
                  ['replacement_wattage']: originalValue['existing_wattage']
                }
              }
            }
            equipmentValues[equipment] = {
              ...equipmentValues[equipment],
              [key]: UpdateEquipmentValue[key]
            }
          }
        }
      }

      let newUpdateGroups = []
      for (let group of newGroups) {
        if (group.id !== groupId) {
          newUpdateGroups.push(group)
        } else {
          const incentive = {
            ...(group.incentive || {}),
            input: tempformValues['input'] || 0
          }
          newUpdateGroups.push({
            ...group,
            equipmentValues,
            financialValues,
            incentive
          })
        }
      }

      newGroups = [...newUpdateGroups]

      if (groupId && equipmentId) {
        let lastItem = newGroups.find(item => item.id === groupId)
        const lastData = {
          equipmentId,
          groupData: lastItem
        }
        this.setState({ groups: newGroups, isAnalysisNeed: true, lastData })
      } else {
        this.setState({ groups: newGroups, isAnalysisNeed: true })
      }
    }
  }

  calculateIncentive = (
    tempFormObj,
    selectedEquipmentImages,
    imageToAddToReports
  ) => {
    const { currentProject } = this.props
    if (currentProject.incentive.input_map) {
      if (
        typeof currentProject.incentive.input_map === 'string' &&
        currentProject.incentive.input_map.includes('calculation')
      ) {
        let calulationName = currentProject.incentive.input_map.split('.').pop()
        let tempIncentiveInput = '0'

        //pull out into util

        switch (calulationName) {
          case 'wattsReduced':
            tempIncentiveInput =
              (tempFormObj['existing_wattage'] -
                tempFormObj['replacement_wattage']) *
              tempFormObj['quantity']
            break
          case 'existingDemandTons':
            tempIncentiveInput = tempFormObj['capacity_cooling'] / 12000.0
            break
          case 'existingDemandHP':
            tempIncentiveInput = tempFormObj['existing_demand'] * 1.34102
            break
          case 'capacityTons':
            tempIncentiveInput = tempFormObj['capacity'] / 12000.0
            break
          case 'capacityKWtoTons':
            tempIncentiveInput =
              (tempFormObj['capacity'] || tempFormObj['existing_demand']) *
              0.284345
            break
          default:
            tempIncentiveInput = '0'
        }
        tempFormObj['input'] = tempIncentiveInput
      } else if (currentProject.incentive.input_map.includes('analysis')) {
        currentProject.runAnalysis = true
        tempFormObj['input'] = '0'
      } else {
        if (currentProject.fields && currentProject.fields.length > 0) {
          currentProject.fields.map(field => {
            if (field.name === currentProject.incentive.input_map) {
              tempFormObj['input'] = tempFormObj[field.name] || '0'
            }
          })
        }
      }
    } else {
      tempFormObj['input'] = this.state.formValues['input'] || '0'
    }

    return {
      tempFormObj
    }
  }

  calculateIncentiveWithRebate = (
    tempFormObj,
    selectedEquipmentImages,
    imageToAddToReports
  ) => {
    const { currentProject } = this.props
    const { name } = currentProject

    let incentiveValue = 0,
      costValue = 0,
      incentiveUnit = ''
    if (name === 'xcelLEDLighting') {
      ;({
        incentiveValue,
        costValue,
        incentiveUnit
      } = getValueFromQualifiedOption(
        tempFormObj.xcelLEDLighting_rebate,
        tempFormObj.dlc_qualified,
        tempFormObj.energy_star_qualified
      ))

      let buildingEquipment = filterBuildingEquipment(
        this.props.buildingEquipment,
        {
          category: 'LIGHTING'
        }
      )
      buildingEquipment = buildingEquipment.filter(
        item => item._id === tempFormObj.existing_equipment
      )
      if (buildingEquipment.length) {
        buildingEquipment = buildingEquipment[0]
        let equipmentQuantity = getEquipmentQuantity(
          buildingEquipment,
          incentiveUnit
        )
        incentiveValue = incentiveValue * equipmentQuantity
        costValue = costValue * equipmentQuantity
      } else {
        incentiveValue = 0
        costValue = 0
      }
    } else if (xcelMeasureNameList.indexOf(name) !== -1) {
      ;({
        incentiveValue,
        costValue
      } = calculateIncetiveCostValueForXcelMeasure(name, tempFormObj))
    }
    if (isNaN(incentiveValue) || !isFinite(incentiveValue)) incentiveValue = 0
    if (isNaN(costValue) || !isFinite(costValue)) costValue = 0
    incentiveValue = incentiveValue.toFixed(2)
    costValue = costValue.toFixed(2)
    if (incentiveValue == 0) incentiveValue = '0'
    if (costValue == 0) costValue = '0'

    tempFormObj['incentiveValue'] = incentiveValue
    tempFormObj['project_cost'] = costValue
    tempFormObj['incentiveUnit'] = incentiveUnit
    return {
      tempFormObj
    }
  }

  getEaComponents = auditObj => {
    const { currentProject } = this.props
    let componentType = ''
    let componentTypes = []

    if (
      currentProject &&
      currentProject.fields &&
      currentProject.fields.length > 0
    ) {
      currentProject.fields.map(field => {
        if (field.firebase_input) {
          let substring = field.firebase_input.substring(
            0,
            field.firebase_input.indexOf('.')
          )
          if (substring !== 'info') {
            componentType = substring
          }
        }
      })
    }

    if (componentType && auditObj[componentType]) {
      this.setState({
        eaComponents: auditObj[componentType],
        eaComponentType: componentType
      })
    }
  }

  handleImageUpload = uploadedImages => {
    let { imageToAddToReports } = this.state
    if (!imageToAddToReports) imageToAddToReports = []
    let updatedImages = [...imageToAddToReports]
    updatedImages = updatedImages.filter(
      image => uploadedImages.indexOf(image) > -1
    )

    this.setState({
      formValues: { ...this.state.formValues, uploadedImages },
      imageToAddToReports: updatedImages
    })
  }

  handleCloseLocationModal = location => {
    if (location) {
      this.setState({ locations: this.state.locations.concat(location._id) })
    }
    this.setState({ locationModalOpen: false, locationName: '' })
  }

  handleAddLocation = (addedLocation, locationName) => {
    if (addedLocation !== null) {
      this.setState({
        locations: this.state.locations.concat(addedLocation._id),
        locationName: ''
      })
    } else {
      this.setState({ locationModalOpen: true, locationName })
    }
  }

  handleUpdateLocations = nextLocations => {
    this.setState({
      locations: nextLocations
    })
  }

  checkImplementationStrategy = currentProject => {
    if (
      currentProject.incentive &&
      currentProject.incentive.incentive_meta &&
      currentProject.incentive.incentive_meta.length > 0
    ) {
      if (
        currentProject.incentive.incentive_meta.every(
          obj => obj.label !== 'Implementation Strategy'
        )
      ) {
        return true
      } else {
        return false
      }
    } else {
      return true
    }
  }

  submitFunction = async () => {
    if (this.state.isAnalysisNeed) {
      try {
        await this.handleAnalyze()
      } catch (error) {
        console.log('error', error)
      }
    }
    const {
      imageToAddToReports,
      selectedEquipmentImages = [],
      rates,
      oldSubProjects = [],
      subProjects = []
    } = this.state
    let formValues = Object.assign({}, this.state.formValues)
    let imagesInReports = []
    imagesInReports = uniq(imageToAddToReports)
    if (formValues.uploadedImages) {
      formValues.uploadedImages = formValues.uploadedImages.filter(
        url => !selectedEquipmentImages.includes(url)
      )
    }

    let originalProjectIds = (this.props.currentProject?.projects || []).map(
      project => project._id
    )
    let removedProjectIds = [...oldSubProjects, ...originalProjectIds]
    if (this.props.currentView === 'projectAdd') {
      removedProjectIds = [...oldSubProjects]
    }
    let projectIds = subProjects.map(project => project._id)
    removedProjectIds = removedProjectIds.filter(id => !projectIds.includes(id))

    const options = {
      subProjects: this.state.subProjects.map(project => project._id),
      groups: this.state.groups,
      equipments: this.state.equipments,
      equipmentToGroupMap: this.state.equipmentToGroupMap,
      equipmentToProjectMap: this.state.equipmentToProjectMap,
      equipmentToEquipmentNameMap: this.state.equipmentToEquipmentNameMap || {},
      oldSubProjects: removedProjectIds || []
    }

    this.props.submitFunctionV2(
      Object.assign({}, formValues, {
        locations: this.state.locations,
        imagesInReports,
        rates
      }),
      options
    )
  }

  handleCloseAddProjectPackages = async (flag, options = {}) => {
    const { formValues } = this.state
    let { result } = options
    let mode = flag || 'create'
    this.setState({
      modalOpen: false,
      modalView: null,
      projectPackage: {},
      editingRates: false,
      searchValue: ''
    })
    if (mode === 'create') {
      if (
        result &&
        Object.keys(result).length !== 0 &&
        result.constructor === Object
      ) {
        this.setState({
          formValues: {
            ...formValues,
            package: result.projectPackage._id
          }
        })
      }
      try {
        if (this.state.currentProject._id != this.props.currentProject._id) {
          await this.props.deleteProject(
            this.state.currentProject._id,
            this.props.building._id,
            true
          )
        }
        const packages = await this.props.getProjectPackages(
          this.props.buildingId
        )
        this.setState({ projectPackages: packages })
      } catch (error) {
        console.log(error)
      }
    } else {
      if (this.state.currentProject._id != this.props.currentProject._id) {
        await this.props.deleteProject(
          this.state.currentProject._id,
          this.props.building._id,
          true
        )
      }
      try {
        await this.props.deleteBulkMeasureForProject(options)
      } catch (error) {
        console.log('error', error)
      }
    }
  }

  getImageUrls = () => {
    let { selectedEquipmentImages = [], formValues = {} } = this.state
    const uploadedImages = (formValues && formValues.uploadedImages) || []
    if (!selectedEquipmentImages) selectedEquipmentImages = []
    return [...selectedEquipmentImages, ...uploadedImages].reduce(
      (acc, image, index) => {
        let url = new URL(image)
        return Object.assign(acc, {
          [url.pathname]: {
            uploadUrl: url.href,
            preview: url.href,
            isRemovable: index + 1 <= selectedEquipmentImages.length
          }
        })
      },
      {}
    )
  }

  handleAddToReports = (imageUrl, isChecked) => {
    this.setState(({ imageToAddToReports }) => {
      let imageIndex = -1
      let updatedImagesInReports = imageToAddToReports
      if (!isChecked) {
        imageIndex = imageToAddToReports.findIndex(url => url === imageUrl)
        if (imageIndex > -1) updatedImagesInReports.splice(imageIndex, 1)
      } else {
        updatedImagesInReports = [...imageToAddToReports, imageUrl]
      }
      return {
        imageToAddToReports: updatedImagesInReports
      }
    })
  }

  onImageOrderChange = (image, previousIndex) => event => {
    const { imageToAddToReports } = this.state
    const index = event.target.value
    const updatedImagesInReports = imageToAddToReports
    updatedImagesInReports.splice(previousIndex, 1)
    updatedImagesInReports.splice(index, 0, image)
    this.setState({ imageToAddToReports: updatedImagesInReports })
  }

  handleToggleInfoModal = () => {
    this.setState(prevState => ({
      isInfoModalOpen: !prevState.isInfoModalOpen
    }))
  }

  handleToggleEquipmentModal = () => {
    this.setState(prevState => ({
      isEquipmentModalOpen: !prevState.isEquipmentModalOpen
    }))
  }

  handleAddNewRow = () => {
    const {
      groups,
      equipmentToGroupMap,
      equipmentToProjectMap,
      equipments = [],
      equipmentToEquipmentNameMap = {},
      lastData = null
    } = this.state
    let newGroupsBody = [...groups]
    let newEquipmentId = uuid()
    let newGroupId = uuid()
    let newEquipmentToGroupMap = Object.assign({}, equipmentToGroupMap)
    let newEquipmentToProjectMap = Object.assign({}, equipmentToProjectMap)
    let newEquipmentToEquipmentNameMap = Object.assign(
      {},
      equipmentToEquipmentNameMap
    )
    let updatedEquipmentIds = [...equipments, newEquipmentId]
    let newGroupObj = {
      id: newGroupId,
      name: findGroupUniqueName(newGroupsBody),
      equipmentValues: {},
      financialValues: {},
      formValues: { ...this.state.formValues },
      incentive: { ...this.props.currentProject.incentive }
    }

    if (lastData) {
      const { equipmentId = '', groupData = {} } = lastData
      if (equipmentId) {
        const {
          equipmentValues = {},
          financialValues = {},
          formValues = {},
          incentive = {}
        } = groupData
        newGroupObj['equipmentValues'][newEquipmentId] =
          equipmentValues[equipmentId] || {}
        newGroupObj['financialValues'][newEquipmentId] =
          financialValues[equipmentId] || {}
        newGroupObj['formValues'] = formValues || {}
        newGroupObj['incentive'] = incentive || {}
      }
    }

    newGroupsBody = [...newGroupsBody, newGroupObj]
    newEquipmentToGroupMap[newEquipmentId] = newGroupId
    newEquipmentToProjectMap[newEquipmentId] = ''
    newEquipmentToEquipmentNameMap[newEquipmentId] = ''
    if (lastData) {
      const { equipmentId } = lastData
      if (equipmentToEquipmentNameMap[equipmentId]) {
        newEquipmentToEquipmentNameMap[newEquipmentId] =
          equipmentToEquipmentNameMap[equipmentId]
      } else {
        const equipmentData = _.find(this.props.buildingEquipment, {
          _id: equipmentId
        })
        const equipmentName =
          (equipmentData &&
            equipmentData.libraryEquipment &&
            equipmentData.libraryEquipment.name) ||
          ''
        newEquipmentToEquipmentNameMap[newEquipmentId] = equipmentName
      }
    }
    let allGroups = Object.values(newEquipmentToGroupMap)
    newGroupsBody = reject(
      newGroupsBody,
      group => !allGroups.includes(group.id)
    )
    this.setState({
      groups: newGroupsBody,
      equipmentToGroupMap: newEquipmentToGroupMap,
      equipmentToProjectMap: newEquipmentToProjectMap,
      equipmentToEquipmentNameMap: newEquipmentToEquipmentNameMap,
      equipments: updatedEquipmentIds,
      lastData: {
        equipmentId: newEquipmentId,
        groupData: newGroupObj
      }
    })
  }

  handleEquipmentNameChange = (e, equipmentId) => {
    const { equipmentToEquipmentNameMap } = this.state
    const newEquipmentToEquipmentNameMap = Object.assign(
      {},
      equipmentToEquipmentNameMap
    )
    newEquipmentToEquipmentNameMap[equipmentId] = e.target.value
    this.setState({
      equipmentToEquipmentNameMap: newEquipmentToEquipmentNameMap
    })
  }

  getEquipmentValue = equimentId => {
    let { currentProject = {} } = this.props
    let { fields = [] } = currentProject
    let equipmentValues = {
      existing_equipment__v2: equimentId
    }
    let hasExistingEquipment = fields.filter(
      item => item.name === 'existing_equipment__v2'
    )
    if (hasExistingEquipment.length) {
      let buildingEquipment = this.props.buildingEquipment.filter(
        item => item._id === equipmentValues.existing_equipment__v2
      )
      if (buildingEquipment.length) {
        buildingEquipment = buildingEquipment[0]
        let equipmentData = fields.find(
          f => f.name === 'existing_equipment__v2'
        ).equipment
        let equipmentDataFields = (equipmentData && equipmentData.fields) || []
        if (buildingEquipment.libraryEquipment.type !== equipmentData.type) {
          let equipment_2 = currentProject.fields.find(
            f => f.name === 'existing_equipment__v2'
          )
          equipmentDataFields =
            (equipment_2 &&
              equipment_2.equipment_2 &&
              equipment_2.equipment_2.fields) ||
            []
        }
        setFormEquipmentValues(
          equipmentDataFields,
          buildingEquipment,
          equipmentValues,
          this.props.building,
          this.props.operations,
          2
        )
      }
    }
    return equipmentValues
  }

  getFinancialValues = item => {
    let tempformValues = { ...this.state.formValues }
    let quantity = ''
    if (item['quantity_exist']) quantity = item['quantity_exist']
    if (item['quantity']) quantity = item['quantity']

    const obj = {
      project_cost: tempformValues['project_cost'] || 0,
      material_quantity: +quantity || 0,
      environment_quantity: +quantity || 0
    }

    return obj
  }

  handleGroupMapping = (options = {}) => {
    const { groups, equipmentToGroupMap, equipmentToProjectMap } = this.state
    const { equipmentIds = [], isChecked = false, name = '' } = options
    let newGroupsBody = [...groups]
    let updatedEquipmentIds = [...this.state.equipments, ...equipmentIds]
    updatedEquipmentIds = [...new Set(updatedEquipmentIds)]
    let newEquipmentToGroupMap = Object.assign({}, equipmentToGroupMap)
    let needRemoveProjects = []

    equipmentIds.map(equipmentId => {
      let groupId = newEquipmentToGroupMap[equipmentId]
      let projectId = equipmentToProjectMap[equipmentId]
      if (groupId) {
        delete newEquipmentToGroupMap[equipmentId]
      }
      if (projectId) {
        delete equipmentToProjectMap[equipmentId]
        needRemoveProjects.push(projectId)
      }
    })
    if (isChecked) {
      let newGroupId = uuid()
      let tempformValues = { ...this.state.formValues }
      let equipmentValues = {}
      let financialValues = {}
      equipmentIds.map(equipment => {
        let item = this.getEquipmentValue(equipment)
        equipmentValues[equipment] = item
        financialValues[equipment] = this.getFinancialValues(item)
      })
      let groupObj = {
        id: newGroupId,
        name: name,
        equipmentValues: equipmentValues,
        formValues: { ...tempformValues },
        financialValues,
        incentive: { ...this.props.currentProject.incentive }
      }
      newGroupsBody = [...newGroupsBody, groupObj]
      equipmentIds.map(equipmentId => {
        newEquipmentToGroupMap[equipmentId] = newGroupId
      })
    } else {
      equipmentIds.map(equipmentId => {
        let newGroupId = uuid()
        let equipmentValues = {}
        let financialValues = {}
        let item = this.getEquipmentValue(equipmentId)
        equipmentValues[equipmentId] = item
        financialValues[equipmentId] = this.getFinancialValues(item)
        let groupObj = {
          id: newGroupId,
          name: findGroupUniqueName(newGroupsBody),
          equipmentValues,
          financialValues,
          formValues: { ...this.state.formValues },
          incentive: { ...this.props.currentProject.incentive }
        }
        newGroupsBody = [...newGroupsBody, groupObj]
        newEquipmentToGroupMap[equipmentId] = newGroupId
      })
    }

    let allGroups = Object.values(newEquipmentToGroupMap)
    newGroupsBody = reject(
      newGroupsBody,
      group => !allGroups.includes(group.id)
    )

    return {
      updatedEquipmentIds,
      groups: newGroupsBody,
      equipmentToGroupMap: newEquipmentToGroupMap
    }
  }

  handleSubmitEquipment = async (options = {}) => {
    const {
      equipmentToProjectMap: existingEquipmentToProjectMap,
      rates,
      formValues,
      library
    } = this.state
    const oldSubProjects = this.state.subProjects.map(project => project._id)
    console.log('oldSubProjects', oldSubProjects)
    const { buildingId, currentProject } = this.props
    let {
      groups,
      equipmentToGroupMap,
      updatedEquipmentIds
    } = this.handleGroupMapping(options)
    this.setState(
      {
        isEquipmentModalOpen: false,
        isAnalyzeModalOpen: true
      },
      async () => {
        try {
          let {
            projects,
            equipmentToProjectMap
          } = await this.props.analysisProjectWithSubProject({
            library,
            buildingId,
            options: {
              groups,
              equipmentToGroupMap,
              needNewProjectsByEquipment:
                Object.keys(equipmentToGroupMap || {}) || [],
              mainFormValues: formValues,
              rates: rates,
              projectValues: {
                name: currentProject.name,
                originalDisplayName: currentProject.originalDisplayName,
                incentive: currentProject.incentive,
                fields: currentProject.fields || [],
                incentive: currentProject.incentive,
                category: currentProject.category,
                applicable_building_types:
                  currentProject.applicable_building_types,
                project_category: currentProject.project_category,
                project_application: currentProject.project_application,
                project_technology: currentProject.project_technology,
                analysisType: currentProject.analysisType,
                imageUrls: [],
                isComplete: true,
                formulas: currentProject.formulas || [],
                config: currentProject.config || {}
              },
              existingEquipmentToProjectMap
            }
          })
          this.setState({
            subProjects: projects,
            oldSubProjects: [...this.state.oldSubProjects, ...oldSubProjects],
            groups,
            equipmentToGroupMap,
            equipmentToProjectMap: equipmentToProjectMap,
            equipments: updatedEquipmentIds,
            isAnalyzeModalOpen: false
          })
        } catch (error) {
          this.setState({
            subProjects: [],
            oldSubProjects: [],
            groups: {},
            equipmentToGroupMap: {},
            equipmentToProjectMap: {},
            equipments: [],
            isAnalyzeModalOpen: false
          })
          console.log('error', error)
        }
      }
    )
  }

  handleToggleSettingsModal = () => {
    this.setState(prevState => ({
      isSettingsModalOpen: !prevState.isSettingsModalOpen
    }))
  }

  handleOnRateSubmit = async inputs => {
    this.setState({
      rates: inputs
    })
    await this.handleAnalyze({ rates: inputs })
  }

  handleAnalyze = async (options = {}) => {
    this.setState({
      isLoading: true,
      isAnalyzeModalOpen: true,
      isAnalysisNeed: false
    })
    try {
      const { buildingId, currentProject } = this.props
      const {
        rates,
        formValues,
        library,
        equipmentToGroupMap,
        subProjects,
        groups
      } = this.state
      let equipmentIds = Object.keys(equipmentToGroupMap)
      let newRates = rates
      if (options.rates) {
        newRates = options.rates
      }
      const oldSubProjects = this.state.subProjects.map(project => project._id)
      let {
        projects,
        equipmentToProjectMap,
        cashFlowData = {}
      } = await this.props.analysisProjectWithSubProject({
        library,
        buildingId,
        options: {
          groups,
          equipmentToGroupMap,
          needNewProjectsByEquipment: equipmentIds,
          mainFormValues: formValues,
          rates: newRates,
          projectValues: {
            name: currentProject.name,
            originalDisplayName: currentProject.originalDisplayName,
            incentive: currentProject.incentive,
            fields: currentProject.fields || [],
            incentive: currentProject.incentive,
            category: currentProject.category,
            applicable_building_types: currentProject.applicable_building_types,
            project_category: currentProject.project_category,
            project_application: currentProject.project_application,
            project_technology: currentProject.project_technology,
            analysisType: currentProject.analysisType,
            imageUrls: [],
            isComplete: true,
            formulas: currentProject.formulas || [],
            config: currentProject.config || {},
            fuel: currentProject.fuel || ''
          }
        }
      })
      this.setState({
        subProjects: projects,
        oldSubProjects: [...this.state.oldSubProjects, ...oldSubProjects],
        groups,
        equipmentToGroupMap,
        equipmentToProjectMap: equipmentToProjectMap,
        cashFlowData
      })
    } catch (error) {
      console.log('error', error)
    } finally {
      this.setState({
        isLoading: false,
        isAnalyzeModalOpen: false
      })
    }
  }

  handleGroupChange = (equipmentId, newGroupId) => {
    const oldGroupId = this.state.equipmentToGroupMap[equipmentId]
    const newGroupObj = find(this.state.groups, { id: newGroupId })

    let groups = [...this.state.groups]
    console.log('oldGroupId', oldGroupId)
    console.log('newGroupObj', newGroupObj)

    if (oldGroupId && newGroupObj) {
      let newGroupObjData = Object.assign({}, newGroupObj)
      const groupObj = _.find(this.state.groups, { id: oldGroupId })
      let financialValues = {
        ...(newGroupObjData.financialValues || {}),
        [equipmentId]: groupObj?.financialValues?.[equipmentId] || {}
      }
      let equipmentValues = {
        ...(newGroupObjData.equipmentValues || {}),
        [equipmentId]: groupObj?.equipmentValues?.[equipmentId] || {}
      }
      newGroupObjData = {
        ...newGroupObjData,
        financialValues,
        equipmentValues
      }
      groups = [...groups].map(group => {
        if (group.id === newGroupId) {
          return {
            ...group,
            ...newGroupObjData
          }
        }
        return group
      })
    }

    this.setState({
      equipmentToGroupMap: {
        ...this.state.equipmentToGroupMap,
        [equipmentId]: newGroupId
      },
      groups
    })
  }

  handleGroupNameChange = (groupId, newName) => {
    let newGroups = []
    for (let group of this.state.groups) {
      if (group.id !== groupId) {
        newGroups.push(group)
      } else {
        newGroups.push({
          ...group,
          name: newName
        })
      }
    }
    this.setState({ groups: newGroups })
  }

  handleEquipmentRemove = options => {
    const {
      newEquipments,
      newGroups,
      newProjects,
      newEquipmentToGroupMap,
      newEquipmentToProjectMap,
      lastData
    } = options

    this.setState({
      equipments: newEquipments,
      groups: newGroups,
      subProjects: newProjects,
      equipmentToGroupMap: newEquipmentToGroupMap,
      equipmentToProjectMap: newEquipmentToProjectMap,
      lastData
    })

    this.handleAnalyze()
  }

  handleAddNewGroup = async ({
    newEquipmentToGroupMap = {},
    newGroups = []
  }) => {
    this.setState(
      {
        groups: newGroups,
        equipmentToGroupMap: newEquipmentToGroupMap
      },
      () => {
        this.handleAnalyze()
      }
    )
  }

  handleUpdateGroup = (updateGroup, equipmentId) => {
    let newGroups = []
    for (let group of this.state.groups) {
      if (group.id !== updateGroup.id) {
        newGroups.push(group)
      } else {
        let newGroup = {
          ...group,
          financialValues: {
            ...(group['financialValues'] || {}),
            [equipmentId]: {
              ...(updateGroup['formValues'] || {})
            }
          },
          equipmentValues: {
            ...(group['equipmentValues'] || {}),
            [equipmentId]: {
              ...(updateGroup['formValues'] || {})
            }
          }
        }
        newGroups.push(newGroup)
      }
    }
    this.setState(
      {
        groups: newGroups
      },
      () => {
        this.handleAnalyze()
      }
    )
  }

  renderDetails() {
    const { currentProject, organizationView } = this.props
    let {
      statusOptions,
      typeOptions,
      budgetTypeOptions,
      projectPackages,
      formValues
    } = this.state
    const betaCheckFlag = isProdEnv(process.env.DOMAIN_ENV)
    const xcelOrgId = '5f32b52ce21cdd0011ba2f7c'
    const myOrgId = '5e84e3722f10c40010b46f33'
    const specificOrgId = betaCheckFlag ? xcelOrgId : myOrgId
    let showProject = true
    if (organizationView && organizationView._id === specificOrgId) {
      typeOptions = [
        {
          name: 'CEEM',
          value: 'CEEM'
        },
        { name: 'CEEM/DI', value: 'CEEM/DI' },
        { name: 'CO', value: 'CO' }
      ]
    }
    projectPackages = sortFunction(projectPackages, 'name')

    let currConfig = currentProject.config || {}

    return (
      <div className={styles.details}>
        <p className={styles['card-title']}>Details</p>
        <div className={styles.projectFormSectionInput}>
          <label htmlFor='displayName'>Name</label>
          <input
            type='text'
            value={replaceHTMLEntities(formValues['displayName']) || ''}
            name='displayName'
            onChange={e => this.handleChange(null, e)}
          />
        </div>

        <div className={styles['row']}>
          <div
            className={classNames(
              styles.projectFormSectionInput,
              styles['column']
            )}
            style={{
              display:
                currConfig.details &&
                currConfig.details.status &&
                currConfig.details.status.state === 'HIDE'
                  ? 'none'
                  : 'block'
            }}
          >
            <label htmlFor='status'>Status</label>
            <div className={styles.field}>
              <select
                className={styles.selectContainer}
                value={this.state.formValues['status']}
                onChange={e => this.handleSelect(e, 'status')}
              >
                <option defaultValue value='' disabled>
                  Select a status
                </option>
                {statusOptions.map(({ name, value }) => (
                  <option key={`status-option-${value}`} value={value}>
                    {name}
                  </option>
                ))}
              </select>
              <div className={styles.selectIcons}>
                <i className={classNames('material-icons', styles.selectArrow)}>
                  arrow_drop_down
                </i>
              </div>
            </div>
          </div>

          <div
            className={classNames(
              styles.projectFormSectionInput,
              styles['column']
            )}
            style={{
              display:
                currConfig.details &&
                currConfig.details.type &&
                currConfig.details.type.state === 'HIDE'
                  ? 'none'
                  : 'block'
            }}
          >
            <label htmlFor='type'>Type</label>
            <div className={styles.field}>
              <select
                className={styles.selectContainer}
                value={this.state.formValues['type']}
                onChange={e => this.handleSelect(e, 'type')}
              >
                <option defaultValue value='' disabled>
                  Select a type
                </option>
                {typeOptions.map(({ name, value }) => (
                  <option key={`type-option-${value}`} value={value}>
                    {name}
                  </option>
                ))}
              </select>
              <div className={styles.selectIcons}>
                <i className={classNames('material-icons', styles.selectArrow)}>
                  arrow_drop_down
                </i>
              </div>
            </div>
          </div>
        </div>

        <div className={styles['row']}>
          <div
            className={classNames(
              styles.projectFormSectionInput,
              styles['column']
            )}
            style={{
              display:
                currConfig.details &&
                currConfig.details.budgetType &&
                currConfig.details.budgetType.state === 'HIDE'
                  ? 'none'
                  : 'block'
            }}
          >
            <label htmlFor='type'>Budget Type</label>
            <div className={styles.field}>
              <select
                className={styles.selectContainer}
                value={this.state.formValues['budgetType']}
                onChange={e => this.handleSelect(e, 'budgetType')}
              >
                <option defaultValue value='' disabled>
                  Select a budget type
                </option>
                {budgetTypeOptions.map(({ name, value }) => (
                  <option key={`budgetType-option-${value}`} value={value}>
                    {name}
                  </option>
                ))}
              </select>
              <div className={styles.selectIcons}>
                <i className={classNames('material-icons', styles.selectArrow)}>
                  arrow_drop_down
                </i>
              </div>
            </div>
          </div>

          <div
            className={classNames(
              styles.projectFormSectionInput,
              styles['column']
            )}
            style={{
              display:
                currConfig.details &&
                currConfig.details.measureLife &&
                currConfig.details.measureLife.state === 'HIDE'
                  ? 'none'
                  : 'block'
            }}
          >
            <label htmlFor='measureLife'>Effective Useful Life (years)</label>
            <input
              value={replaceHTMLEntities(this.state.formValues['measureLife'])}
              name='measureLife'
              onChange={e => this.handleChange(null, e)}
              disabled={
                currConfig.details &&
                currConfig.details.measureLife &&
                currConfig.details.measureLife.state === 'LOCK'
                  ? 'disabled'
                  : ''
              }
            />
          </div>
        </div>

        <div
          className={styles.projectFormSectionInput}
          style={{
            display:
              currConfig.details &&
              currConfig.details.description &&
              currConfig.details.description.state === 'HIDE'
                ? 'none'
                : 'block'
          }}
        >
          <label htmlFor='description'>Description</label>
          <TextQuillEditor
            handleChange={html => this.handleDescriptionChange(html)}
            html={this.state.formValues['description'] || ''}
            placeholder='Enter Measure Description'
            index={0}
            hidePersonalize={true}
            isImageDisabled={true}
          />
        </div>

        {!this.props.library && showProject && (
          <UserFeature name='projectProject'>
            {({ enabled }) => {
              if (!enabled) return null
              return (
                <div
                  className={styles.projectFormSectionInput}
                  style={{
                    display:
                      currConfig.details &&
                      currConfig.details.project &&
                      currConfig.details.project.state === 'HIDE'
                        ? 'none'
                        : 'block'
                  }}
                >
                  <label htmlFor='package'>Project</label>
                  <div className={styles.field}>
                    <select
                      className={styles.selectContainer}
                      value={this.state.formValues['package']}
                      onChange={e => this.handleSelect(e, 'package')}
                    >
                      <option defaultValue value=''>
                        Select a project
                      </option>
                      <option value='addProject'>Add a new project</option>
                      {projectPackages.map((proPackage, index) => (
                        <option
                          key={`package-option-${proPackage._id}`}
                          value={proPackage._id}
                        >
                          {proPackage.name}
                        </option>
                      ))}
                    </select>
                    <div className={styles.selectIcons}>
                      <i
                        className={classNames(
                          'material-icons',
                          styles.selectArrow
                        )}
                      >
                        arrow_drop_down
                      </i>
                    </div>
                  </div>
                </div>
              )
            }}
          </UserFeature>
        )}

        {currentProject &&
          currentProject.incentive &&
          currentProject.incentive.utility_company && (
            <div className={styles.projectFormSectionInput}>
              <label>Utility</label>
              <p>{currentProject.incentive.utility_company}</p>
            </div>
          )}

        {currentProject &&
          currentProject.incentive &&
          currentProject.incentive.program_period && (
            <div className={styles.projectFormSectionInput}>
              <label>Program Period</label>
              <p>{currentProject.incentive.program_period}</p>
            </div>
          )}

        {currentProject &&
          currentProject.incentive &&
          currentProject.incentive.existing_requirements && (
            <div className={styles.projectFormSectionInput}>
              <label>Existing Requirements</label>
              <p>
                {replaceHTMLEntities(
                  currentProject.incentive.existing_requirements
                )}
              </p>
            </div>
          )}

        {currentProject &&
          currentProject.incentive &&
          currentProject.incentive.design_requirements && (
            <div className={styles.projectFormSectionInput}>
              <label>Design Requirements</label>
              <p>
                {replaceHTMLEntities(
                  currentProject.incentive.design_requirements
                )}
              </p>
            </div>
          )}

        {currentProject &&
          currentProject.incentive &&
          currentProject.incentive.qualified_products && (
            <div className={styles.projectFormSectionInput}>
              <label>Qualified Products List</label>
              <p>
                <a
                  href={currentProject.incentive.qualified_products}
                  target='_blank'
                >
                  {currentProject.incentive.qualified_products}
                </a>
              </p>
            </div>
          )}

        {currentProject &&
          currentProject.incentive &&
          currentProject.incentive.rebate_code && (
            <div className={styles.projectFormSectionInput}>
              <label>Rebate Code</label>
              <p>{currentProject.incentive.rebate_code}</p>
            </div>
          )}
      </div>
    )
  }

  handleAnalysisView = option => {
    this.setState({
      analysisToggleViewOption: option
    })
  }

  getSavingValue = () => {
    const { buildingId } = this.props
    const { subProjects, cashFlowData = {} } = this.state
    const allProject = {
      projects: subProjects,
      cashFlowData
    }
    const calculatedProjectCost = getProjectCost(allProject)
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
    const electricSavings = getEnergySavings(allProject, buildingId, 'electric')
    const waterSavings = getEnergySavings(allProject, buildingId, 'water')
    const nuturalGasSavings = getGasSavingsCost(allProject, buildingId, 'gas')
    const ghgSavings = getGHGSavingsCost(allProject, buildingId, 'ghg')
    const ghgSavingsCost = getGHGSavingsCost(allProject, buildingId, 'ghg-cost')
    const calculatedIncentive = getIncentive(allProject, buildingId)

    return {
      calculatedAnnualSavings,
      calculatedProjectCost,
      calculatedMainternanceSavings,
      calculatedROI,
      calculatedSimplePayback,
      calculatedNPV,
      calculatedSIR,
      calculatedDemandSavings,
      calculatedEUL,
      calculationType,
      totalEnergySavings,
      electricSavings,
      waterSavings,
      nuturalGasSavings,
      ghgSavings,
      ghgSavingsCost,
      calculatedIncentive
    }
  }

  renderAnalysis() {
    const {
      isInfoModalOpen,
      isAnalyzeModalOpen,
      analysisToggleViewOption
    } = this.state
    const { currentProject } = this.props
    let hasMore = false
    if (
      (currentProject &&
        currentProject.incentive &&
        currentProject.incentive.application_link) ||
      (currentProject && currentProject.source)
    )
      hasMore = true

    const analysisOptions = [
      { value: 'ROI', name: 'ROI' },
      { value: 'NPV', name: 'NPV' },
      { value: 'SIR', name: 'SIR' }
    ]

    const {
      calculatedAnnualSavings,
      calculatedProjectCost,
      calculatedMainternanceSavings,
      calculatedROI,
      calculatedNPV,
      calculatedSimplePayback,
      calculatedSIR,
      calculatedDemandSavings,
      calculatedEUL,
      calculationType,
      totalEnergySavings,
      electricSavings,
      waterSavings,
      nuturalGasSavings,
      ghgSavings,
      ghgSavingsCost,
      calculatedIncentive
    } = this.getSavingValue()

    let toggleValue =
      analysisToggleViewOption === 'ROI'
        ? calculatedROI
        : analysisToggleViewOption === 'NPV'
        ? calculatedNPV
        : calculatedSIR
    if (!toggleValue) toggleValue = 0
    let toggleLabel = ''
    if (toggleValue > 0) {
      if (analysisToggleViewOption === 'NPV')
        toggleLabel = '$' + numberWithCommas(round(toggleValue, 2))
      else if (analysisToggleViewOption === 'ROI')
        toggleLabel = numberWithCommas(round(toggleValue, 2)) + '%'
      else toggleLabel = numberWithCommas(round(toggleValue, 2))
    }

    return (
      <div className={styles.analysis}>
        <div className={styles.analysisBody}>
          <div className={styles.analysisHeader}>
            <p className={styles.analysisHeaderLeft}>
              <span className={styles['card-title']}>Analysis Result</span>
            </p>
            <div className={styles.analysisHeaderRight}>
              {hasMore && (
                <div className={styles.analysisHeaderInfo}>
                  <i
                    className={classNames('material-icons')}
                    onClick={this.handleToggleInfoModal}
                  >
                    info_outline
                  </i>
                  {isInfoModalOpen && (
                    <ProjectInfo
                      handleCloseModal={this.handleToggleInfoModal}
                      currentProject={currentProject}
                    />
                  )}
                </div>
              )}
              <div className={styles.analysisHeaderRightButtons}>
                <button
                  type='button'
                  className={classNames(styles.button, styles.buttonSecondary)}
                  onClick={this.handleToggleSettingsModal}
                >
                  <i className='material-icons'>settings</i> Settings
                </button>
                <button
                  type='button'
                  className={classNames(styles.button, styles.buttonPrimary)}
                  onClick={this.handleAnalyze}
                >
                  {isAnalyzeModalOpen ? (
                    <Loader size='button' color='white' />
                  ) : (
                    'Analyze'
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className={styles.analysisItem}>
            <div className={styles.analysisItemLeft}>Annual Cost Savings</div>
            <div className={styles.analysisItemRight}>
              {calculatedAnnualSavings
                ? '$' +
                  numberWithCommas(
                    round(calculatedAnnualSavings, 2),
                    calculationType
                  )
                : '-'}
            </div>
          </div>
          <div className={styles.analysisItem}>
            <div className={styles.analysisItemLeft}>Measure Cost</div>
            <div className={styles.analysisItemRight}>
              {calculatedProjectCost
                ? '$' + numberWithCommas(round(calculatedProjectCost, 2))
                : '-'}
            </div>
          </div>
          <div className={styles.analysisItem}>
            <div className={styles.analysisItemLeft}>Incentive</div>
            <div className={styles.analysisItemRight}>
              {calculatedIncentive
                ? '$' + numberWithCommas(round(calculatedIncentive, 2))
                : '-'}
            </div>
          </div>
          <div className={styles.analysisItem}>
            <div className={styles.analysisItemLeft}>Maintenance Savings</div>
            <div className={styles.analysisItemRight}>
              {calculatedMainternanceSavings
                ? calculatedMainternanceSavings > 0
                  ? '$' +
                    numberWithCommas(round(calculatedMainternanceSavings, 2))
                  : 0
                : '-'}
            </div>
          </div>
          <div className={styles.analysisItem}>
            <div className={styles.analysisItemLeft}>Simple Payback</div>
            <div className={styles.analysisItemRight}>
              {calculatedSimplePayback
                ? (calculatedSimplePayback > 0
                    ? numberWithCommas(round(calculatedSimplePayback, 2))
                    : 0) + ' yrs'
                : '-'}
            </div>
          </div>
          <div className={styles.analysisItem}>
            <div
              className={classNames(
                styles.analysisItemLeft,
                styles.analysisItemCustomLeft
              )}
            >
              <ToggleTab
                onToggle={this.handleAnalysisView}
                options={analysisOptions}
                defaultOption={analysisToggleViewOption}
              />
            </div>
            <div className={styles.analysisItemRight}>
              {toggleLabel ? toggleLabel : '-'}
            </div>
          </div>
        </div>
        <div className={styles.divider} />
        <div className={styles.analysisBody}>
          <div className={styles.analysisItem}>
            <div
              className={classNames(
                styles.analysisItemLeft,
                styles.analysisItemCustomLeft
              )}
            >
              Energy Savings
            </div>
            <div className={styles.analysisItemRight}>
              {totalEnergySavings
                ? numberWithCommas(round(totalEnergySavings, 2)) + ' kBtu'
                : '-'}
            </div>
          </div>
          <div className={styles.analysisItem}>
            <div
              className={classNames(
                styles.analysisItemLeft,
                styles.analysisItemCustomLeft
              )}
            >
              Electricity Savings
            </div>
            <div className={styles.analysisItemRight}>
              {electricSavings
                ? numberWithCommas(round(electricSavings, 2), calculationType) +
                  ' kWh'
                : '-'}
            </div>
          </div>
          <div className={styles.analysisItem}>
            <div
              className={classNames(
                styles.analysisItemLeft,
                styles.analysisItemCustomLeft
              )}
            >
              Demand Savings
            </div>
            <div className={styles.analysisItemRight}>
              {calculatedDemandSavings
                ? numberWithCommas(round(calculatedDemandSavings, 2)) + ' kW'
                : '-'}
            </div>
          </div>
          {!!nuturalGasSavings && (
            <div className={styles.analysisItem}>
              <div
                className={classNames(
                  styles.analysisItemLeft,
                  styles.analysisItemCustomLeft
                )}
              >
                Natural Gas Savings
              </div>
              <div className={styles.analysisItemRight}>
                {nuturalGasSavings
                  ? numberWithCommas(
                      round(nuturalGasSavings, 2),
                      calculationType
                    ) + ' therms'
                  : '-'}
              </div>
            </div>
          )}
          {!!waterSavings && (
            <div className={styles.analysisItem}>
              <div
                className={classNames(
                  styles.analysisItemLeft,
                  styles.analysisItemCustomLeft
                )}
              >
                Water Savings
              </div>
              <div className={styles.analysisItemRight}>
                {waterSavings
                  ? numberWithCommas(round(waterSavings, 2), calculationType) +
                    ' kGal'
                  : '-'}
              </div>
            </div>
          )}
          {!!ghgSavings && (
            <div className={styles.analysisItem}>
              <div
                className={classNames(
                  styles.analysisItemLeft,
                  styles.analysisItemCustomLeft
                )}
              >
                GHG Savings
              </div>
              <div className={styles.analysisItemRight}>
                {ghgSavings
                  ? numberWithCommas(round(ghgSavings, 2), calculationType) +
                    ' mtCO2e'
                  : '-'}
              </div>
            </div>
          )}
          {!!ghgSavingsCost && (
            <div className={styles.analysisItem}>
              <div
                className={classNames(
                  styles.analysisItemLeft,
                  styles.analysisItemCustomLeft
                )}
              >
                GHG Savings Cost
              </div>
              <div className={styles.analysisItemRight}>
                {ghgSavingsCost
                  ? numberWithCommas(
                      round(ghgSavingsCost, 2),
                      calculationType
                    ) + ' $/mtCO2e'
                  : '-'}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  renderDesign() {
    const { currentProject } = this.props
    const config = (currentProject && currentProject.config) || {}
    const measureEquipment = (config && config.measureEquipment) || 'REQUIRED'

    return (
      <div className={classNames(styles.equipmentForm)}>
        <div className={styles.row}>
          <div className={styles.equipmentFormHeader}>
            <div className={styles['card-title']}>Design</div>
            <ToolTip
              content={
                <span className={styles.formSectionDescription}>
                  Add design information to determine savings potential. You can
                  update this later.
                </span>
              }
              direction='right'
            >
              <i className={classNames('material-icons')}>info_outline</i>
            </ToolTip>
          </div>
          <div className={styles.equipmentRow}>
            {measureEquipment !== 'REQUIRED' && (
              <div>
                <button
                  type='button'
                  className={classNames(
                    styles.button,
                    styles.buttonPrimary,
                    styles.buttonRemoveMargin
                  )}
                  onClick={this.handleAddNewRow}
                >
                  <i className='material-icons'>add</i>
                </button>
              </div>
            )}

            {measureEquipment !== 'DISABLED' && (
              <div>
                <button
                  type='button'
                  className={classNames(
                    styles.button,
                    styles.buttonPrimary,
                    styles.buttonRemoveMargin
                  )}
                  onClick={this.handleToggleEquipmentModal}
                >
                  <i className='material-icons'>add</i> Equipment
                </button>
              </div>
            )}
          </div>
        </div>
        <CustomProjectEquipmentTable
          buildingId={this.props.buildingId}
          groups={this.state.groups}
          equipments={this.state.equipments}
          projects={this.state.subProjects}
          equipmentToProjectMap={this.state.equipmentToProjectMap}
          equipmentToGroupMap={this.state.equipmentToGroupMap}
          currentProject={this.props.currentProject}
          buildingEquipment={this.props.buildingEquipment}
          formValues={this.state.formValues}
          handleChange={this.handleChange}
          handleGroupChange={this.handleGroupChange}
          handleGroupNameChange={this.handleGroupNameChange}
          handleEquipmentRemove={this.handleEquipmentRemove}
          handleAddNewGroup={this.handleAddNewGroup}
          handleUpdateGroup={this.handleUpdateGroup}
          getEquipmentValue={this.getEquipmentValue}
          equipmentToEquipmentNameMap={this.state.equipmentToEquipmentNameMap}
          handleEquipmentNameChange={this.handleEquipmentNameChange}
          cashFlowData={this.state.cashFlowData}
        />
      </div>
    )
  }

  renderBody() {
    const { currentProject, library, buildingId } = this.props
    const { imageToAddToReports, locations, formValues } = this.state

    if (library) return null

    return (
      <div>
        {/* <div className={classNames(styles.formSection)}>
          <div className={styles.formSectionHeader}>
            <div>Locations</div>
            <ToolTip
              content={
                <span className={styles.formSectionDescription}>
                  Add locations this project applies to such as exterior,
                  offices or a room number.
                </span>
              }
              direction="right"
            >
              <i className={classNames('material-icons')}>info_outline</i>
            </ToolTip>
          </div>

          <LocationFormSection
            locations={locations}
            buildingId={buildingId}
            onAdd={this.handleAddLocation}
            onUpdate={this.handleUpdateLocations}
            notForm={true}
          />
        </div> */}

        <div className={styles.formSection}>
          <div className={styles.formSectionHeader}>
            <div className={styles['card-title']}>Media</div>
            <ToolTip
              content={
                <span className={styles.formSectionDescription}>
                  Take photos or import images related to the measure. Note
                  images are compressed.
                </span>
              }
              direction='right'
            >
              <i className={classNames('material-icons')}>info_outline</i>
            </ToolTip>
          </div>
          <ImagesField
            images={this.getImageUrls()}
            onFieldUpdate={images => {
              const uploadedImages = Object.keys(images).map(
                k => images[k].uploadUrl
              )
              this.handleImageUpload(uploadedImages)
            }}
            onAddToReports={this.handleAddToReports}
            showAddToReports={true}
            selectedImages={imageToAddToReports}
            onOrderChange={this.onImageOrderChange}
          />
        </div>
        <UserFeature name='docuSign'>
          {({ enabled }) => {
            if (!enabled) return null
            return (
              <div>
                <div className={styles.formSection}>
                  <div className={styles.formSectionHeader}>
                    <div className={styles['card-title']}>DocuSign</div>
                    <ToolTip
                      content={
                        <span className={styles.formSectionDescription}>
                          Get eSignatures using your DocuSign templates in
                          buildee.
                        </span>
                      }
                      direction='right'
                    >
                      <i className={classNames('material-icons')}>
                        info_outline
                      </i>
                    </ToolTip>
                  </div>
                  <DocuSignSection
                    id={(currentProject && currentProject._id) || ''}
                    modeFrom='measure'
                  />
                </div>
              </div>
            )
          }}
        </UserFeature>
        <div className={styles.formSection}>
          <div className={styles.formSectionHeader}>
            <div className={styles['card-title']}>Comments</div>
            <ToolTip
              content={
                <span className={styles.formSectionDescription}>
                  Add comments related to the measure.
                </span>
              }
              direction='right'
            >
              <i className={classNames('material-icons')}>info_outline</i>
            </ToolTip>
          </div>
          <div>
            <div className={styles.formSectionInput}>
              <textarea
                value={formValues['comment']}
                name='comment'
                onChange={e => this.handleChange(null, e)}
                placeholder='Add comments about this measure'
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  closeAddProjects = async () => {
    const { handleCloseAddProjects } = this.props
    try {
      const { oldSubProjects = [], subProjects = [] } = this.state
      let originalProjectIds = (this.props.currentProject?.projects || []).map(
        project => project._id
      )
      let removedProjectIds = [
        ...oldSubProjects,
        ...subProjects.map(project => project._id)
      ]
      removedProjectIds = removedProjectIds.filter(
        id => !originalProjectIds.includes(id)
      )
      if (removedProjectIds.length > 0)
        await this.props.removeOldSubProjects(removedProjectIds)
    } catch (error) {
      console.log('error', error)
    } finally {
      handleCloseAddProjects()
    }
  }

  renderFooter() {
    const {
      currentView,
      handleGoBack,
      library,
      isSubmitting,
      errorRunningProject
    } = this.props

    return (
      <div className={styles.projectFormFooter}>
        <div className={styles.container}>
          <div className={styles.projectFormFooterButtons}>
            {currentView !== 'projectEdit' && (
              <button
                type='button'
                className={classNames(styles.button, styles.buttonSecondary)}
                onClick={handleGoBack}
              >
                Back
              </button>
            )}
            <button
              type='button'
              className={classNames(styles.button, styles.buttonSecondary)}
              onClick={() => {
                if (!library) this.closeAddProjects()
                else handleGoBack()
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (isSubmitting) return
                this.submitFunction()
              }}
              className={classNames(
                styles.button,
                styles.buttonPrimary,
                isSubmitting ? styles.buttonDisable : ''
              )}
              type='button'
            >
              {isSubmitting ? (
                <Loader size='button' color='white' />
              ) : !errorRunningProject ? (
                this.props.currentView === 'projectCopy' ? (
                  'Copy measure'
                ) : (
                  'Done'
                )
              ) : (
                'Issues running this measure. Please close and try again later.'
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  render() {
    const {
      currentProject,
      building,
      endUse,
      user,
      utilityMetrics,
      buildingEquipment
    } = this.props
    let {
      isSettingsModalOpen,
      isAnalyzeModalOpen,
      isEquipmentModalOpen,
      modalOpen,
      locationModalOpen,
      locationName,
      rates,
      projectPackage,
      viewMode
    } = this.state

    return (
      <div className={classNames(styles.projectForm, styles.form)}>
        <form className={styles.container}>
          <div className={styles.detailsAnalysisContainer}>
            {this.renderDetails()}
            {this.renderAnalysis()}
          </div>
          {this.renderDesign()}
          {this.renderBody()}
        </form>
        {this.renderFooter()}
        {isSettingsModalOpen && (
          <ProjectSettingsModal
            rates={rates}
            onClose={this.handleToggleSettingsModal}
            onSubmit={this.handleOnRateSubmit}
          />
        )}
        {modalOpen && (
          <ProjectPackagesModal
            building={building}
            onClose={this.handleCloseAddProjectPackages}
            projectPackage={projectPackage}
            endUse={endUse}
            utilityMetrics={utilityMetrics}
            buildingEquipment={buildingEquipment}
            user={user}
            viewMode={viewMode}
            project={currentProject}
          />
        )}
        {isEquipmentModalOpen && (
          <ProjectEquipmentModal
            onClose={this.handleToggleEquipmentModal}
            onSubmit={this.handleSubmitEquipment}
            building={building}
            currentProject={this.props.currentProject}
            selectedEquipments={this.state.equipments}
          />
        )}
        {isAnalyzeModalOpen && <ProjectAnalyzeModal />}
        {/* {locationModalOpen && (
          <LocationModal
            onClose={this.handleCloseLocationModal}
            modalView="addLocation"
            initialName={locationName}
          />
        )} */}
      </div>
    )
  }
}

const mapStateToProps = state => ({
  buildingId:
    (state.building &&
      state.building.buildingView &&
      state.building.buildingView._id) ||
    '',
  user: state.login.user || {},
  organizationView: state.organization.organizationView || {}
})

const mapDispatchToProps = {
  reRunProjectPackage,
  deleteBulkMeasureForProject,
  analysisProjectWithSubProject,
  removeOldSubProjects
}

export default connect(mapStateToProps, mapDispatchToProps)(CustomProjectForm)
