import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames'
import { uniq, find, round } from 'lodash'

import buildingTypes from 'static/building-types'

import {
  reRunProjectPackage,
  deleteBulkMeasureForProject
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
import { isProdEnv } from 'utils/Utils'
import { sortFunction } from 'utils/Portfolio'
import UserFeature from 'utils/Feature/UserFeature'
import DocuSignSection from 'components/DocuSign/DocuSignSection'
import TextQuillEditor from 'components/UI/TextEditor/TextQuillEditor'
import { replaceHTMLEntities } from 'components/Project/ProjectHelpers'

import {
  ProjectFields,
  ProjectIncentive,
  ProjectFinancial,
  ProjectImplementation
} from '.'
import { ProjectPackagesModal } from '../../Modal'
import { LocationFormSection } from '../LocationForms/LocationFormSection'
import LocationModal from '../../Modal/LocationModal'
import ImagesField from '../FormFields/ImagesField'

import CustomProjectForm from './CustomProject/CustomProjectForm'

import styles from './ProjectForm.scss'

export class ProjectForm extends React.Component {
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
    loadingStatus: '',
    didMount: false,

    showSource: false,

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
    lockFields: [],
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
    reRunProject: false
  }

  componentDidMount = () => {
    const { eaAudit, currentProject } = this.props
    this.setFormValues()

    setTimeout(() => {
      this.setState({ didMount: true })
    }, 0)

    // if there is an eaAudit in the building object from props
    if (eaAudit.constructor === Object && Object.keys(eaAudit).length !== 0) {
      this.setState({ auditObj: eaAudit })
      this.getEaComponents(eaAudit)
    }
    if (!this.props.library) {
      this.props.getProjectPackages(this.props.buildingId).then(packages => {
        this.setState({
          projectPackages: packages
        })
      })
    }
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
    let lockFields = []
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
      if (tempFormObj['labor_rate'] && tempFormObj['hours']) {
        lockFields = ['labor_unit_cost', 'labor_quantity']
      } else if (
        tempFormObj['labor_unit_cost'] &&
        tempFormObj['labor_quantity']
      ) {
        lockFields = ['labor_rate', 'hours']
      }
      this.setState({ formValues: tempFormObj, lockFields })
      this.calculateIncentive(
        tempFormObj,
        selectedEquipmentImages,
        imageToAddToReports
      )
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

      // if (currentProject.fields && currentProject.fields.length) {
      //   for (let field of currentProject.fields) {
      //     if (!tempFormObj[field.name]) {
      //       let value
      //       if (field.type == 'number' || field.type === 'decimal')
      //         value = field.default || '0'
      //       else value = field.default || ''
      //       tempFormObj[field.name] = value
      //     }
      //   }
      // }

      // if (tempFormObj.input == 0 && currentProject.initialValues.input == 0)
      //   tempFormObj.input = '0'

      if (currentProject.originalDisplayName === 'LED Lighting') {
      }
      if (tempFormObj['labor_rate'] && tempFormObj['hours']) {
        lockFields = ['labor_unit_cost', 'labor_quantity']
      } else if (
        tempFormObj['labor_unit_cost'] &&
        tempFormObj['labor_quantity']
      ) {
        lockFields = ['labor_rate', 'hours']
      }
      this.setState({
        formValues: tempFormObj,
        selectedEquipmentImages,
        imageToAddToReports,
        lockFields
      })
      this.isFormValid(tempFormObj)
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
        this.calculateIncentive(
          tempFormObj,
          selectedEquipmentImages,
          imageToAddToReports
        )
      } else {
        if (currentProject.name === 'boilerTuneUpNY') {
          tempFormObj.building_type = this.findBuildingUseName(
            this.props.building.buildingUse
          )
          const { totalUtilUsages } = this.props.utilityMetrics
          let natural_gas =
            (totalUtilUsages && totalUtilUsages['natural-gas']) || 0
          let fuelOil2 = (totalUtilUsages && totalUtilUsages['fuel-oil-2']) || 0
          let fuelOil4 = (totalUtilUsages && totalUtilUsages['fuel-oil-4']) || 0
          let total = natural_gas + fuelOil2 + fuelOil4
          if (!total) {
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

        // if (currentProject && currentProject.fields) {
        //   for (let field of currentProject.fields) {
        //     if (
        //       !tempFormObj[field.name] ||
        //       tempFormObj[field.name] == 'Undefined' ||
        //       tempFormObj[field.name] == 'Infinity'
        //     ) {
        //       let value
        //       if (field.type == 'number' || field.type == 'decimal')
        //         value = field.default || '0'
        //       else value = field.default || ''
        //       tempFormObj[field.name] = value
        //     }
        //   }
        // }

        this.isFormValid(tempFormObj)
        if (tempFormObj['labor_rate'] && tempFormObj['hours']) {
          lockFields = ['labor_unit_cost', 'labor_quantity']
        } else if (
          tempFormObj['labor_unit_cost'] &&
          tempFormObj['labor_quantity']
        ) {
          lockFields = ['labor_rate', 'hours']
        }
        this.setState({ formValues: tempFormObj, lockFields })
      }
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

  handleChange = (event, inputType, additionalInputType) => {
    const { currentProject } = this.props
    let {
      extraFinancialFields,
      formValues,
      selectedEquipmentImages,
      imageToAddToReports
    } = this.state

    let extraFieldsArray = this.getExtraFields(extraFinancialFields)
    let extraFieldsObj = this.getExtraFieldsBySection(extraFinancialFields)
    let tempformValues = { ...this.state.formValues }

    if (
      event.target.name !== 'input' &&
      event.target.name !== 'project_cost' &&
      event.target.name !== 'maintenance_savings' &&
      event.target.name !== 'displayName' &&
      event.target.name !== 'description'
    ) {
      tempformValues[event.target.name] = event.target.value

      if (currentProject.config && currentProject.config.conditionalCost) {
        try {
          let result = calculateIncentive(
            currentProject.config.conditionalCost,
            tempformValues
          )
          tempformValues['project_cost'] = result.incentive
          tempformValues['cost_description'] = result.description
        } catch (error) {
          console.log('error', error)
        }

        this.setState({
          formValues: tempformValues
        })
      }
      if (currentProject.config && currentProject.config.conditionalIncentive) {
        try {
          let result = calculateIncentive(
            currentProject.config.conditionalIncentive,
            tempformValues
          )
          formValues['input'] = result.incentive
          if (
            currentProject.incentive &&
            currentProject.incentive.max_is_cost &&
            formValues['input'] > tempformValues['project_cost']
          ) {
            formValues['input'] = tempformValues['project_cost']
          }
          currentProject.incentive.incentive_description = result.description
        } catch (error) {
          console.log('error')
        }
      }
      if (!extraFieldsArray.includes(event.target.name)) {
        try {
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
            lockFields = []
          } = this.calculateBasedOnCondition(newObj, updatedGroupValue)
          if (updatedValue['labor_rate'] && updatedValue['hours']) {
            lockFields = ['labor_unit_cost', 'labor_quantity']
          } else if (
            updatedValue['labor_unit_cost'] &&
            updatedValue['labor_quantity']
          ) {
            lockFields = ['labor_rate', 'hours']
          }
          tempformValues = { ...tempformValues, ...updatedValue }
          this.setState({
            lockFields
          })
        } catch (error) {
          console.log('error', error)
        }
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
            this.setState({
              formValues: tempformValues
            })
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
        // This is needed for old Xcel measures that use objects for select options (instead of arrays)
        console.log('error', e)
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
        let existingEquipmentField = currentProject.fields.find(
          f => f.name === 'existing_equipment__v2'
        )
        let equipmentData
        if (existingEquipmentField.equipment) {
          equipmentData = existingEquipmentField.equipment
        } else {
          equipmentData = existingEquipmentField.equipments.filter(
            e => e.type === buildingEquipment.libraryEquipment.type
          )[0]
        }
        let equipmentDataFields = equipmentData.fields
        if (buildingEquipment.libraryEquipment.type !== equipmentData.type) {
          equipmentDataFields = currentProject.fields.find(
            f => f.name === 'existing_equipment__v2'
          ).equipment_2.fields
        }
        setFormEquipmentValues(
          equipmentDataFields,
          buildingEquipment,
          tempformValues,
          this.props.building
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

    this.isFormValid(tempformValues)
    if (
      event.target.name !== 'input' &&
      event.target.name !== 'project_cost' &&
      event.target.name !== 'maintenance_savings' &&
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
      this.calculateIncentive(
        tempformValues,
        selectedEquipmentImages,
        imageToAddToReports
      )
    } else if (
      checkXcelMeasureFieldForCalcuation(currentProject.name, event.target.name)
    ) {
      this.calculateIncentiveWithRebate(
        tempformValues,
        selectedEquipmentImages,
        imageToAddToReports
      )
    } else {
      this.setState({
        formValues: tempformValues,
        selectedEquipmentImages,
        imageToAddToReports
      })
    }
  }

  isFormValid = tempformValues => {
    const { currentProject } = this.props
    let formIsValid = true

    if (!tempformValues.displayName) {
      formIsValid = false
    }

    if (
      this.props.currentProject.fields &&
      this.props.currentProject.fields.length > 0
    ) {
      this.props.currentProject.fields.map(field => {
        if (!tempformValues[field.name] && field.default === undefined) {
          formIsValid = false
        }
      })
    } else {
      formIsValid = true
    }

    // if (
    //   currentProject &&
    //   currentProject.incentive &&
    //   currentProject.incentive.incentive_type &&
    //   currentProject.incentive.incentive_type !== 'none'
    // ) {
    //   if (!tempformValues.input) {
    //     formIsValid = false
    //   }
    // }

    if (formIsValid) {
      this.setState({ formIsValid: true })
    } else {
      if (this.state.formValues) {
        this.setState({ formIsValid: false })
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

    this.setState({
      formValues: tempFormObj,
      selectedEquipmentImages,
      imageToAddToReports
    })
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
    tempFormObj['input'] = incentiveValue
    tempFormObj['project_cost'] = costValue
    this.setState({
      formValues: tempFormObj,
      selectedEquipmentImages,
      imageToAddToReports
    })
  }

  getXcelMeasureInfo(formValues) {
    const { currentProject } = this.props
    const name = currentProject.name
    let showUnit = false,
      incentiveValue = 0,
      costValue = 0,
      incentiveUnit = '',
      costUnit = ''
    if (
      name === 'xcelLEDLighting' &&
      formValues['xcelLEDLighting_rebate_type'] &&
      formValues['xcelLEDLighting_rebate']
    ) {
      ;({
        incentiveValue,
        costValue,
        incentiveUnit,
        costUnit
      } = getValueFromQualifiedOption(
        formValues['xcelLEDLighting_rebate'],
        formValues['dlc_qualified'],
        formValues['energy_star_qualified']
      ))
      showUnit = true
    } else if (xcelMeasureNameList.indexOf(name) !== -1) {
      ;({
        incentiveValue,
        costValue,
        incentiveUnit,
        costUnit
      } = getValueForXcelMeasure(name, {
        rebate: formValues[`${name}RebateType`]
      }))
      showUnit = !!formValues[`${name}RebateType`]
      if (name === 'xcelMotorUpgrade') {
        ;({
          incentiveValue,
          costValue,
          incentiveUnit,
          costUnit
        } = getValueForXcelMeasure(name, {
          rebate: formValues[`${name}RebateType`],
          plan: formValues['measure_enhancement_type']
        }))
      }
    }
    return { showUnit, incentiveValue, costValue, incentiveUnit, costUnit }
  }

  toggleSource = () => {
    this.setState(prevState => ({
      showSource: !prevState.showSource
    }))
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
    this.setState({
      formValues: { ...this.state.formValues, uploadedImages }
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

  submitFunction = () => {
    const { currentProject } = this.props
    const { imageToAddToReports, selectedEquipmentImages = [] } = this.state
    let formValues = Object.assign({}, this.state.formValues)
    let formIsValid = this.state.formIsValid
    if (formValues.input === '') formValues.input = '0'
    if (currentProject.incentive) {
      let incentiveInput = +currentProject.incentive.input || 0
      if (
        currentProject.incentive.unit_rate &&
        incentiveInput === +formValues['input']
      ) {
        formValues['input'] =
          incentiveInput / +currentProject.incentive.unit_rate
      }
    }
    let imagesInReports = []
    imagesInReports = uniq(imageToAddToReports)
    if (formValues.uploadedImages) {
      formValues.uploadedImages = formValues.uploadedImages.filter(
        url => !selectedEquipmentImages.includes(url)
      )
    }
    let existedMeasureInProject = false
    if (existedMeasureInProject) {
      formValues.package = ''
    }
    this.props.submitFunction(
      Object.assign({}, formValues, {
        locations: this.state.locations,
        imagesInReports
      }),
      formIsValid
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
      console.log('cancelled', options)
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
    const {
      selectedEquipmentImages = [],
      formValues: { uploadedImages = [] }
    } = this.state
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

  renderBody() {
    const { currentProject } = this.props
    let {
      statusOptions,
      typeOptions,
      budgetTypeOptions,
      projectPackages,
      imageToAddToReports
    } = this.state
    const betaCheckFlag = isProdEnv(process.env.DOMAIN_ENV)
    const xcelOrgId = '5f32b52ce21cdd0011ba2f7c'
    const myOrgId = '5e84e3722f10c40010b46f33'
    const specificOrgId = betaCheckFlag ? xcelOrgId : myOrgId
    let showProject = true
    if (
      this.props.organizationView &&
      this.props.organizationView._id === specificOrgId
    ) {
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
    const {
      showUnit,
      incentiveValue,
      costValue,
      incentiveUnit,
      costUnit
    } = this.getXcelMeasureInfo(this.state.formValues)

    let currConfig = currentProject.config || {}
    return (
      <div className={styles.projectForm}>
        <form className={styles.container}>
          <div className={styles.projectFormSection}>
            <div className={styles.projectFormSectionDescription}>
              <p>Details</p>
              <span>Add Basic information about your project</span>
            </div>

            <div className={styles.projectFormSectionInputs}>
              <div className={styles.projectFormSectionInput}>
                <label htmlFor='displayName'>Measure Name</label>
                <input
                  type='text'
                  value={
                    replaceHTMLEntities(this.state.formValues['displayName']) ||
                    ''
                  }
                  name='displayName'
                  onChange={this.handleChange.bind(this)}
                />
              </div>

              <div
                className={styles.projectFormSectionInput}
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

              <div
                className={styles.projectFormSectionInput}
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

              <div
                className={styles.projectFormSectionInput}
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
                            <option defaultValue value='' disabled>
                              Select a project
                            </option>
                            <option value='addProject'>
                              Add a new project
                            </option>
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
                <label htmlFor='description'>Measure Description</label>
                <TextQuillEditor
                  handleChange={html => this.handleDescriptionChange(html)}
                  html={this.state.formValues['description'] || ''}
                  placeholder='Enter Measure Description'
                  index={0}
                  hidePersonalize={true}
                />
              </div>

              <div
                className={styles.projectFormSectionInput}
                style={{
                  display:
                    currConfig.details &&
                    currConfig.details.measureLife &&
                    currConfig.details.measureLife.state === 'HIDE'
                      ? 'none'
                      : 'block'
                }}
              >
                <label htmlFor='measureLife'>
                  Effective Useful Life (years)
                </label>
                <input
                  value={replaceHTMLEntities(
                    this.state.formValues['measureLife']
                  )}
                  name='measureLife'
                  onChange={this.handleChange.bind(this)}
                  disabled={
                    currConfig.details &&
                    currConfig.details.measureLife &&
                    currConfig.details.measureLife.state === 'LOCK'
                      ? 'disabled'
                      : ''
                  }
                />
              </div>

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

              {currentProject &&
                currentProject.incentive &&
                currentProject.incentive.application_link && (
                  <div className={styles.projectFormSectionInput}>
                    <label>Link to Application</label>
                    <p>
                      <a
                        href={currentProject.incentive.application_link}
                        target='_blank'
                      >
                        {currentProject.incentive.application_link}
                      </a>
                    </p>
                  </div>
                )}

              {currentProject && currentProject.source && (
                <div className={styles.projectFormSectionInput}>
                  <div className={styles.projectFormSource}>
                    <small onClick={this.toggleSource}>
                      {this.state.showSource
                        ? 'Hide Calculation Description '
                        : 'Show Calculation Description '}
                    </small>
                    {this.state.showSource && (
                      <a
                        href={currentProject.source.match(
                          /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/gim
                        )}
                        target='_blank'
                      >
                        {currentProject.source.replace(
                          /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/gim,
                          ''
                        )}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {currentProject &&
            currentProject.fields &&
            currentProject.fields.length > 0 && (
              <div className={styles.projectFormSection}>
                <div className={styles.projectFormSectionDescription}>
                  <p>Design</p>
                  <span>
                    Add design information to determine savings potential. You
                    can update this later.
                  </span>
                </div>
                <div className={styles.projectFormSectionInputs}>
                  <ProjectFields
                    fields={currentProject.fields}
                    formValues={this.state.formValues}
                    handleChange={this.handleChange}
                    buildingEquipment={this.props.buildingEquipment}
                    projectName={this.props.currentProject.name}
                    building={this.props.building}
                  />
                </div>
              </div>
            )}

          {currentProject.incentive &&
            currentProject.incentive.incentive_meta &&
            currentProject.incentive.incentive_meta.length > 0 && (
              <div className={styles.projectFormSection}>
                <div className={styles.projectFormSectionDescription}>
                  <p>Implementation</p>
                </div>
                <div className={styles.projectFormSectionInputs}>
                  <ProjectImplementation
                    fields={currentProject.incentive.incentive_meta}
                    formValues={this.state.formValues}
                    handleChange={this.handleChange}
                  />
                </div>
              </div>
            )}

          {currentProject &&
            currentProject.incentive &&
            currentProject.incentive.incentive_type !== 'none' && (
              <div className={styles.projectFormSection}>
                <div className={styles.projectFormSectionDescription}>
                  <p>Incentive</p>
                  <span>
                    Provide details to determine the impact of incentives on
                    your measure.
                  </span>
                </div>
                <div className={styles.projectFormSectionInputs}>
                  <ProjectIncentive
                    incentive={currentProject.incentive}
                    formValues={this.state.formValues}
                    handleChange={this.handleChange}
                    runAnalysis={currentProject.runAnalysis ? true : false}
                    unit={incentiveUnit}
                    showUnit={showUnit}
                    incentiveValue={incentiveValue}
                    name={currentProject.name}
                    currentView={this.props.currentView}
                  />
                </div>
              </div>
            )}

          {currentProject.category !== 'description' &&
            this.checkImplementationStrategy(currentProject) && (
              <div className={styles.projectFormSection}>
                <div className={styles.projectFormSectionDescription}>
                  <p>Financial Modeling</p>
                </div>
                <div className={styles.projectFormSectionInputs}>
                  <ProjectFinancial
                    formValues={this.state.formValues}
                    extraFinancialFields={this.state.extraFinancialFields}
                    handleChange={this.handleChange}
                    unit={costUnit}
                    showUnit={showUnit}
                    costValue={costValue}
                    config={currConfig.financial || {}}
                    lockFields={this.state.lockFields}
                  />
                </div>
              </div>
            )}
          {!this.props.library && (
            <LocationFormSection
              locations={this.state.locations}
              buildingId={this.props.buildingId}
              onAdd={this.handleAddLocation}
              onUpdate={this.handleUpdateLocations}
            />
          )}
          {!this.props.library && (
            <div className={styles.projectFormSection}>
              <div className={styles.projectFormSectionDescription}>
                <p>Comments</p>
                <span>Add comments related to the measure.</span>
              </div>
              <div className={styles.projectFormSectionInputs}>
                <div className={styles.projectFormSectionInput}>
                  <label htmlFor='comment'>Comments</label>
                  <textarea
                    value={this.state.formValues['comment']}
                    name='comment'
                    onChange={this.handleChange.bind(this)}
                    placeholder='Add comments about this measure'
                  />
                </div>
              </div>
            </div>
          )}
          <div className={styles.projectFormSection}>
            <div className={styles.projectFormSectionDescription}>
              <p>Images</p>
              <span>
                Take photos or import images related to the measure. Note images
                are compressed.
              </span>
            </div>
            <div className={styles.projectFormSectionInputs}>
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
          </div>
          {!this.props.library && (
            <UserFeature name='docuSign'>
              {({ enabled }) => {
                if (!enabled) return null
                return (
                  <div>
                    <div className={styles.projectFormSection}>
                      <div className={styles.projectFormSectionDescription}>
                        <p>DocuSign</p>
                        <span>
                          Get eSignatures using your DocuSign templates in
                          buildee.
                        </span>
                      </div>
                      <div className={styles.projectFormSectionInputs}>
                        <DocuSignSection
                          id={
                            (this.props.currentProject &&
                              this.props.currentProject._id) ||
                            ''
                          }
                          modeFrom='measure'
                        />
                      </div>
                    </div>
                  </div>
                )
              }}
            </UserFeature>
          )}
        </form>
        {this.state.locationModalOpen && (
          <LocationModal
            onClose={this.handleCloseLocationModal}
            modalView='addLocation'
            initialName={this.state.locationName}
          />
        )}
        {this.state.reRunProject && (
          <div className={styles.loadingContainer}>
            <Loader />
            <div className={styles.reRunProject}>
              <div>One moment while we rerun your measure...</div>
            </div>
          </div>
        )}
        <div className={styles.projectFormFooter}>
          <div className={styles.container}>
            {this.props.currentView !== 'projectEdit' && (
              <div
                className={styles.projectFormFooterBack}
                onClick={this.props.handleGoBack}
              >
                <i className='material-icons'>arrow_back_ios</i>
                <small>Back</small>
              </div>
            )}

            <div className={styles.projectFormFooterButtons}>
              {!this.props.library ? (
                <button
                  className={classNames(styles.button, styles.buttonSecondary)}
                  onClick={() => this.props.handleCloseAddProjects()}
                >
                  Cancel
                </button>
              ) : (
                <button
                  className={classNames(styles.button, styles.buttonSecondary)}
                  onClick={this.props.handleGoBack}
                >
                  Cancel
                </button>
              )}

              {this.props.isSubmitting && (
                <button
                  className={classNames(
                    styles.button,
                    styles.buttonPrimary,
                    styles.buttonDisable
                  )}
                  type='button'
                >
                  <Loader size='button' color='white' />
                </button>
              )}

              {!this.props.isSubmitting && !this.props.errorRunningProject && (
                <button
                  onClick={this.submitFunction}
                  className={classNames(styles.button, styles.buttonPrimary)}
                  type='button'
                >
                  {this.props.isSubmitting ? (
                    <Loader size='button' color='white' />
                  ) : this.props.currentView === 'projectAdd' ||
                    this.props.currentProject.dataAlreadyFromEA ? (
                    this.state.formIsValid ? (
                      'Evaluate Measure'
                    ) : (
                      'Add Measure'
                    )
                  ) : this.props.currentView === 'projectEdit' ||
                    this.props.currentProject.dataAlreadyFromEA === false ? (
                    'Edit Measure'
                  ) : (
                    'Copy Measure'
                  )}
                </button>
              )}

              {!this.props.isSubmitting && this.props.errorRunningProject && (
                <button
                  onClick={this.submitFunction}
                  className={classNames(styles.button, styles.buttonPrimary)}
                  type='button'
                >
                  Issues running this measure. Please close and try again later.
                </button>
              )}
            </div>
          </div>
        </div>
        {this.state.modalOpen && (
          <ProjectPackagesModal
            building={this.props.building}
            onClose={this.handleCloseAddProjectPackages}
            projectPackage={this.state.projectPackage}
            endUse={this.props.endUse}
            utilityMetrics={this.props.utilityMetrics}
            buildingEquipment={this.props.buildingEquipment}
            user={this.props.user}
            viewMode={this.state.viewMode}
            project={this.state.currentProject}
          />
        )}
      </div>
    )
  }

  render() {
    const { currentProject } = this.props
    const designVersion =
      (currentProject &&
        currentProject.config &&
        currentProject.config.designVersion) ||
      0

    // check design version is 2 then render new Measure UI
    if (designVersion === 2) return <CustomProjectForm {...this.props} />

    return <div>{this.renderBody()}</div>
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
  deleteBulkMeasureForProject
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectForm)
