import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames'
import styles from './ProjectForm.scss'
import ImagesField from '../FormFields/ImagesField'
import { Loader } from 'utils/Loader'
import { replaceHTMLEntities } from 'components/Project/ProjectHelpers'
import buildingTypes from 'static/building-types'
import {
  ProjectFields,
  ProjectIncentive,
  ProjectFinancial,
  ProjectImplementation
} from '.'
import TextQuillEditor from '../../../components/UI/TextEditor/TextQuillEditor'
import { uniq } from 'lodash'
import { LocationFormSection } from '../LocationForms/LocationFormSection'
import LocationModal from '../../Modal/LocationModal'
import { xcelMeasureNameList } from 'utils/xcelMeasures'
import {
  filterBuildingEquipment,
  findBuildingEquipmentById,
  getValueFromQualifiedOption,
  getValueForXcelMeasure,
  getRebateTypeAndLabelForXcelMeasure,
  checkXcelMeasureFieldForCalcuation,
  calculateIncetiveCostValueForXcelMeasure,
  getEquipmentQuantity
} from 'utils/Project'
import { isProdEnv } from 'utils/Utils'

export class PackageMeasureForm extends React.Component {
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
      { name: 'Material Cost', label: 'material_cost' },
      { name: 'Labor Cost', label: 'labor_cost' },
      { name: 'Design Fees', label: 'design_fees' },
      { name: 'Construction Management', label: 'construction_management' },
      {
        name: 'Site-Specific Installation Factors',
        label: 'installation_factors'
      },
      { name: 'Permits', label: 'permits' },
      { name: 'Temporary Services', label: 'temporary_services' },
      { name: 'Test and Balancing', label: 'test_and_balancing' },
      { name: 'Utility Service Upgrades', label: 'utility_service_upgrades' },
      { name: 'Commissioning', label: 'commissioning' },
      { name: 'Taxes', label: 'taxes' },
      { name: 'Profit', label: 'profit' },
      { name: 'Contingency', label: 'contingency' }
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
    ]
  }

  componentDidMount = () => {
    const { eaAudit } = this.props
    this.setFormValues()

    setTimeout(() => {
      this.setState({ didMount: true })
    }, 0)

    // if there is an eaAudit in the building object from props
    if (eaAudit.constructor === Object && Object.keys(eaAudit).length !== 0) {
      this.setState({ auditObj: eaAudit })
      this.getEaComponents(eaAudit)
    }
  }

  componentWillReceiveProps = nextProps => {
    if (
      JSON.stringify(this.props.currentProject) !==
      JSON.stringify(nextProps.currentProject)
    )
      this.setFormValues(nextProps)
  }

  findBuildingUseName = buildingUse => {
    if (buildingUse) {
      let typeObject = buildingTypes.find(type => type.value === buildingUse)
      return typeObject ? typeObject.name : 'Undefined'
    } else {
      return 'Undefined'
    }
  }

  setFormValues = async (nextProps = null) => {
    let { currentProject } = this.props
    if (!currentProject || Object.keys(currentProject).length === 0) {
      currentProject = (nextProps && nextProps.currentProject) || {}
    }
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
      tempFormObj['measureLife'] = currentProject.measureLife || ''

      this.setState({ formValues: tempFormObj })
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
      if (currentProject.initialValues.existing_equipment) {
        const buildingEquipment = findBuildingEquipmentById(
          this.props.buildingEquipment,
          currentProject.initialValues.existing_equipment
        )
        if (buildingEquipment) {
          selectedEquipmentImages = buildingEquipment.images
        }
      }
      if (currentProject.fields && currentProject.fields.length) {
        for (let field of currentProject.fields) {
          if (!tempFormObj[field.name]) {
            let value
            if (field.type == 'number' || field.type === 'decimal')
              value = field.default || '0'
            else value = field.default || ''
            tempFormObj[field.name] = value
          }
        }
      }

      if (tempFormObj.input == 0 && currentProject.initialValues.input == 0)
        tempFormObj.input = '0'

      tempFormObj['status'] = currentProject.status || ''
      tempFormObj['type'] = currentProject.type || ''
      tempFormObj['measureLife'] = currentProject.measureLife || ''
      tempFormObj['package'] =
        (currentProject.package && currentProject.package._id) || ''
      if (currentProject.originalDisplayName === 'LED Lighting') {
      }
      this.setState({
        formValues: tempFormObj,
        selectedEquipmentImages,
        imageToAddToReports
      })
      this.isFormValid(tempFormObj)
    } else {
      let tempFormObj = { ...this.state.formValues }
      tempFormObj['displayName'] = currentProject.displayName
      tempFormObj['description'] = currentProject.description
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
          tempFormObj.baseline_eub_lighting = lighting / 1000
          tempFormObj.building_type = this.findBuildingUseName(
            this.props.building.buildingUse
          )
          tempFormObj.project_cost = this.props.building.squareFeet * 1.2
          tempFormObj.square_footage = this.props.building.squareFeet
        }
        if (currentProject && currentProject.fields) {
          for (let field of currentProject.fields) {
            if (
              !tempFormObj[field.name] ||
              tempFormObj[field.name] == 'Undefined' ||
              tempFormObj[field.name] == 'Infinity'
            ) {
              let value
              if (field.type == 'number' || field.type == 'decimal')
                value = field.default || '0'
              else value = field.default || ''
              tempFormObj[field.name] = value
            }
          }
        }
        tempFormObj['status'] = currentProject.status || ''
        tempFormObj['type'] = currentProject.type || ''
        tempFormObj['measureLife'] = currentProject.measureLife || ''
        tempFormObj['package'] =
          (currentProject.package && currentProject.package._id) || ''
        this.isFormValid(tempFormObj)
        this.setState({
          formValues: tempFormObj,
          selectedEquipmentImages,
          imageToAddToReports
        })
      }
    }
    if (currentProject.locations) {
      this.setState({
        locations: currentProject.locations
      })
    }
  }

  handleSelect = (event, key) => {
    const { formValues } = this.state
    this.setState({
      formValues: {
        ...formValues,
        [key]: event.target.value
      }
    })
  }

  handleDescriptionChange = html => {
    this.setState({
      formValues: {
        ...this.state.formValues,
        description: html
      }
    })
  }

  handleChange = (event, inputType, additionalInputType) => {
    const { currentProject } = this.props
    let {
      extraFinancialFields,
      formValues,
      selectedEquipmentImages,
      imageToAddToReports
    } = this.state
    var extraFieldsArray = Object.keys(extraFinancialFields).map(
      k => extraFinancialFields[k].label
    )

    let tempformValues = { ...this.state.formValues }
    if (inputType === 'boolean') {
      tempformValues[event.target.name] =
        event.target.value === 'true' ? true : false
      // calculate project cost when extra financial field are edited
    } else if (extraFieldsArray.indexOf(event.target.name) > -1) {
      tempformValues[event.target.name] = event.target.value
      tempformValues.project_cost = Number(event.target.value)
      extraFieldsArray.forEach(field => {
        if (formValues[field] && field !== event.target.name) {
          tempformValues.project_cost += Number(formValues[field])
        }
      })
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
        buildingEquipment = buildingEquipment[0]
        tempformValues.qty_existing_equip = getEquipmentQuantity(
          buildingEquipment
        )
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
        if (!tempformValues[field.name]) {
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

  calculateIncentiveWithRebate = (
    tempFormObj,
    selectedEquipmentImages,
    imageToAddToReports
  ) => {
    const { currentProject } = this.props
    const { name } = currentProject

    let incentiveValue = 0,
      costValue = 0
    if (name === 'xcelLEDLighting') {
      ;({ incentiveValue, costValue } = getValueFromQualifiedOption(
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
        incentiveValue =
          incentiveValue *
          ((buildingEquipment && buildingEquipment.quantity) || 0)
        costValue =
          costValue * ((buildingEquipment && buildingEquipment.quantity) || 0)
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
    const { imageToAddToReports, selectedEquipmentImages = [] } = this.state
    let formValues = Object.assign({}, this.state.formValues)
    let formIsValid = this.state.formIsValid
    if (formValues.input === '') formValues.input = '0'
    let imagesInReports = []
    imagesInReports = uniq(imageToAddToReports)
    if (formValues.uploadedImages) {
      formValues.uploadedImages = formValues.uploadedImages.filter(
        url => !selectedEquipmentImages.includes(url)
      )
    }
    this.props.submitFunction(
      Object.assign({}, formValues, {
        locations: this.state.locations,
        imagesInReports
      }),
      formIsValid
    )
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

  onImageOrderChange = (image, previousIndex) => event => {
    const { imageToAddToReports } = this.state
    const index = event.target.value
    const updatedImagesInReports = imageToAddToReports
    updatedImagesInReports.splice(previousIndex, 1)
    updatedImagesInReports.splice(index, 0, image)
    this.setState({ imageToAddToReports: updatedImagesInReports })
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

  render() {
    const { currentProject, target } = this.props
    let index = this.props.index || 0
    index++
    let {
      statusOptions,
      typeOptions,
      budgetTypeOptions,
      imageToAddToReports
    } = this.state
    const betaCheckFlag = isProdEnv(process.env.DOMAIN_ENV)
    const xcelOrgId = '5f32b52ce21cdd0011ba2f7c'
    const myOrgId = '5e84e3722f10c40010b46f33'
    const specificOrgId = betaCheckFlag ? xcelOrgId : myOrgId
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
    const {
      showUnit,
      incentiveValue,
      costValue,
      incentiveUnit,
      costUnit
    } = this.getXcelMeasureInfo(this.state.formValues)

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
                <label htmlFor="displayName">Measure Name</label>
                <input
                  type="text"
                  value={
                    replaceHTMLEntities(this.state.formValues['displayName']) ||
                    ''
                  }
                  name="displayName"
                  onChange={this.handleChange.bind(this)}
                />
              </div>
              {target === 'Project' && (
                <div className={styles.projectFormSectionInput}>
                  <label htmlFor="status">Status</label>
                  <div className={styles.field}>
                    <select
                      className={styles.selectContainer}
                      value={this.state.formValues['status']}
                      onChange={e => this.handleSelect(e, 'status')}
                    >
                      <option defaultValue value="" disabled>
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
              )}
              {target === 'Project' && (
                <div className={styles.projectFormSectionInput}>
                  <label htmlFor="type">Type</label>
                  <div className={styles.field}>
                    <select
                      className={styles.selectContainer}
                      value={this.state.formValues['type']}
                      onChange={e => this.handleSelect(e, 'type')}
                    >
                      <option defaultValue value="" disabled>
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
              )}
              {target === 'Project' && (
                <div className={styles.projectFormSectionInput}>
                  <label htmlFor="type">Budget Type</label>
                  <div className={styles.field}>
                    <select
                      className={styles.selectContainer}
                      value={this.state.formValues['budgetType']}
                      onChange={e => this.handleSelect(e, 'budgetType')}
                    >
                      <option defaultValue value="" disabled>
                        Select a type
                      </option>
                      {budgetTypeOptions.map(({ name, value }) => (
                        <option
                          key={`budgetType-option-${value}`}
                          value={value}
                        >
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
              <div className={styles.projectFormSectionInput}>
                <label htmlFor="description">Measure Description</label>
                <TextQuillEditor
                  handleChange={html => this.handleDescriptionChange(html)}
                  html={this.state.formValues['description'] || ''}
                  placeholder="Enter Measure Description"
                  index={index}
                  hidePersonalize={true}
                />
              </div>

              <div className={styles.projectFormSectionInput}>
                <label htmlFor="measureLife">
                  Effective Useful Life (years)
                </label>
                <input
                  value={replaceHTMLEntities(
                    this.state.formValues['measureLife']
                  )}
                  name="measureLife"
                  onChange={this.handleChange.bind(this)}
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
                        target="_blank"
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
                        target="_blank"
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
                          /(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w\.-]*)*\/?\S/g
                        )}
                        target="_blank"
                      >
                        {currentProject.source.replace(
                          /(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w\.-]*)*\/?\S/g,
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
                  />
                </div>
              </div>
            )}

          <LocationFormSection
            locations={this.state.locations}
            buildingId={this.props.buildingId}
            onAdd={this.handleAddLocation}
            onUpdate={this.handleUpdateLocations}
          />

          <div className={styles.projectFormSection}>
            <div className={styles.projectFormSectionDescription}>
              <p>Comments</p>
              <span>Add comments related to the measure.</span>
            </div>
            <div className={styles.projectFormSectionInputs}>
              <div className={styles.projectFormSectionInput}>
                <label htmlFor="comment">Comments</label>
                <textarea
                  value={this.state.formValues['comment']}
                  name="comment"
                  onChange={this.handleChange.bind(this)}
                  placeholder="Add comments about this measure"
                />
              </div>
            </div>
          </div>

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
        </form>
        {this.state.locationModalOpen && (
          <LocationModal
            onClose={this.handleCloseLocationModal}
            modalView="addLocation"
            initialName={this.state.locationName}
          />
        )}
        <div className={styles.projectFormFooter}>
          <div className={styles.container}>
            {this.props.currentView !== 'projectEdit' && (
              <div
                className={styles.projectFormFooterBack}
                onClick={this.props.handleGoBack}
              >
                <i className="material-icons">arrow_back_ios</i>
                <small>Back</small>
              </div>
            )}

            <div className={styles.projectFormFooterButtons}>
              {!this.props.library && (
                <button
                  className={classNames(styles.button, styles.buttonSecondary)}
                  onClick={() => this.props.handleCloseAddProjects()}
                  type="button"
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
                  type="button"
                >
                  <Loader size="button" color="white" />
                </button>
              )}

              {!this.props.isSubmitting && !this.props.errorRunningProject && (
                <button
                  onClick={this.submitFunction}
                  className={classNames(styles.button, styles.buttonPrimary)}
                  type="button"
                >
                  {this.props.isSubmitting ? (
                    <Loader size="button" color="white" />
                  ) : this.props.currentView === 'projectAdd' ||
                    this.props.currentProject.dataAlreadyFromEA ? (
                    this.state.formIsValid ? (
                      'Add Measure'
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
                  type="button"
                >
                  Issues running this measure. Please close and try again later.
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  building: state.building || {},
  buildingId:
    (state.building &&
      state.building.buildingView &&
      state.building.buildingView._id) ||
    '',
  organizationView: state.organization.organizationView || {}
})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(PackageMeasureForm)
