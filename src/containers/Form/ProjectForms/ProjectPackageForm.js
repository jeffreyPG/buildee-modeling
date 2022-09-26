import React, { Component } from 'react'
import moment from 'moment'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { connect } from 'react-redux'
import { Formik, Field, Form, ErrorMessage } from 'formik'
import styles from '../ScenarioForms/ScenarioForm.scss'
import formFieldStyles from '../FormFields/Field.module.scss'
import projectViewStyles from '../../../components/Project/ProjectView.scss'
import projectFormStyles from './ProjectForm.scss'
import formStyles from './ProjectPackageForm.scss'
import {
  ProjectRates,
  ProjectSearch,
  PackageFormProjectList
} from '../../../components/Project'
import { Footer } from '../../../components/UI/Footer'
import { FormSection, Field as FieldSelect } from '../FormFields'
import DeleteConfirmationModal from '../../../containers/Modal/DeleteConfirmationModal'
import {
  PackageMeasureModal,
  MeasurePackagesModal
} from '../../../containers/Modal'
import TextQuillEditor from '../../../components/UI/TextEditor/TextQuillEditor'
import { Loader } from 'utils/Loader'
import {
  createProjectPackage,
  updateProjectPackage,
  getCashFlow,
  reRunProjectsByIds,
  createOrganizationProject,
  editOrganizationProject,
  getProjectsAndMeasures,
  getOrganizationName,
  getOrganizationProjects,
  deleteOrganizationProject,
  addIncompletePackageProject,
  uploadProjectImage,
  evaluateProject,
  getUserById,
  bulkAddProjects
} from '../../../routes/Building/modules/building'
import { getMeasures } from '../../../routes/Library/modules/library'
import {
  getAnnualSavings,
  getProjectCost,
  getIncentive,
  getTotalEnergySavings,
  getEnergySavings,
  getGHGSavingsCost,
  getGasSavingsCost,
  getROI,
  getSimplePayback,
  getSIR,
  getNPV,
  getDemandSavings,
  getEUL,
  getCalculationType,
  getMaintenanceSavings
} from '../../../components/Project/ProjectHelpers'
import DocuSignSection from '../../../components/DocuSign/DocuSignSection'
import UserFeature from 'utils/Feature/UserFeature'

class ProjectPackagesForm extends Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    building: PropTypes.object.isRequired,
    projectPackage: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    mode: PropTypes.oneOf([
      'addProjectPackage',
      'editProjectPackage',
      'createProjectPackagefromProposal'
    ]).isRequired
  }

  state = {
    currentProjectPackage: this.props.projectPackage,
    originProjects: this.props.projectPackage.projects || [],
    projectsToShow: this.props.projectPackage.projects || [],
    editingRates: false,
    hideProjectRates: true,
    modalOpen: false,
    currentProject: {},
    currentMeasurePackage: {},
    modalView: null,
    constructionStatusOptions: [
      { name: 'Conceptual design', value: 'Conceptual design' },
      { name: 'Schematic design', value: 'Schematic design' },
      { name: 'Design development', value: 'Design development' },
      {
        name: 'Construction administration',
        value: 'Construction administration'
      },
      { name: 'Completed', value: 'Completed' },
      { name: 'Occupancy', value: 'Occupancy' }
    ],
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
    reRunProjects: false,
    reCalculating: false,
    total: (this.props.projectPackage && this.props.projectPackage.total) || {},
    rates: this.props.projectPackage.rates || {},
    originalRates: this.props.projectPackage.rates || {},
    showExtras: false
  }

  componentDidMount() {
    let { rates } = this.state
    if (rates.constructor === Object && Object.keys(rates).length === 0) {
      rates =
        (this.props.building && this.props.building.projectRates) ||
        (this.props.building && this.props.building.rates) ||
        {}
      this.setState({ rates, originalRates: rates })
    }
    if (this.props.project) {
      this.calculateTotal(this.state.originProjects, rates)
    }
    document.addEventListener('mousedown', this.handleClick, false)
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClick, false)
  }

  handleClick = e => {
    if (this.state.showExtras) {
      if (this.node && this.node.contains(e.target)) return
      this.setState({ showExtras: false })
    }
    if (this.state.showExtrasNone) {
      if (this.nodeNone && this.nodeNone.contains(e.target)) return
      this.setState({ showExtrasNone: false })
    }
  }

  handleToggleExtras = () => {
    this.setState(prevState => ({
      showExtras: !prevState.showExtras
    }))
  }

  handleStartEdit = () => {
    this.setState({ editingRates: true })
  }

  handleHideProjectRates = () => {
    this.setState(prevState => ({
      hideProjectRates: !prevState.hideProjectRates
    }))

    if (this.state.hideProjectRates) {
      this.setState({ editingRates: false })
    }
  }

  handleHideForm = () => {
    this.setState({ editingRates: false })
  }

  handleDescriptionChange = (html, setFieldValue) => {
    setFieldValue('description', html)
  }

  handleChanged = ({ event, setFieldValue, field }) => {
    setFieldValue(field, event.target.value)
  }

  handleOpenDeleteConfirmationModal = project => {
    this.setState({
      modalOpen: true,
      modalView: 'deleteConfirmation',
      currentProject: project
    })
  }

  handleEditProject = project => {
    project.isEditing = true
    let collectionTarget = project.collectionTarget || 'measure'
    if (collectionTarget === 'measure') {
      this.setState({
        modalOpen: true,
        modalView: 'projectModal',
        currentProject: project
      })
    } else {
      this.setState({
        modalOpen: true,
        currentMeasurePackage: project,
        viewMode: 'editMeasurePackage',
        modalView: 'measurePackageModal'
      })
    }
  }

  handleDeleteProject = async (projectId, setFieldValue) => {
    let updatedProjects = this.state.originProjects || []
    updatedProjects = updatedProjects.filter(item => item._id != projectId)
    setFieldValue('projects', updatedProjects)
    this.setState({
      projectsToShow: updatedProjects,
      originProjects: updatedProjects,
      modalOpen: false,
      modalView: null,
      currentMeasurePackage: {},
      currentProject: {},
      editingRates: false,
      searchValue: ''
    })
    await this.calculateTotal(updatedProjects, this.state.rates)
  }

  handleCloseAddProjects = (projects, project, setFieldValue) => {
    if (
      project &&
      Object.entries(project).length !== 0 &&
      project.constructor === Object &&
      project._id
    ) {
      let updatedProjects = projects || []
      updatedProjects = updatedProjects.filter(item => item._id != project._id)
      updatedProjects = [...updatedProjects, project]
      setFieldValue('projects', updatedProjects)
      this.setState(
        {
          projectsToShow: updatedProjects,
          originProjects: updatedProjects,
          modalOpen: false,
          modalView: null,
          currentProject: {},
          editingRates: false,
          searchValue: ''
        },
        () => {
          this.calculateTotal(updatedProjects, this.state.rates)
        }
      )
    } else {
      this.setState({
        modalOpen: false,
        modalView: null,
        currentProject: {},
        editingRates: false,
        searchValue: ''
      })
    }
  }

  handleCloseAddMeasurePackage = (response = {}, projects, setFieldValue) => {
    let { measurePackage } = response
    if (
      measurePackage &&
      Object.entries(measurePackage).length !== 0 &&
      measurePackage.constructor === Object &&
      measurePackage._id
    ) {
      measurePackage.collectionTarget = 'measurePackage'
      let updatedProjects = projects || []
      updatedProjects = updatedProjects.filter(
        item => item._id != measurePackage._id
      )
      updatedProjects = [...updatedProjects, measurePackage]
      setFieldValue('projects', updatedProjects)
      this.setState(
        {
          projectsToShow: updatedProjects,
          originProjects: updatedProjects,
          modalOpen: false,
          modalView: null,
          currentMeasurePackage: {},
          editingRates: false,
          searchValue: ''
        },
        () => {
          this.calculateTotal(updatedProjects, this.state.rates)
        }
      )
    } else
      this.setState({
        modalOpen: false,
        modalView: null,
        currentMeasurePackage: {},
        editingRates: false,
        viewMode: ''
      })
  }

  handleSearch = input => {
    var tempProjectsInBuilding = [...this.state.originProjects]
    let tempProjectsToShow = tempProjectsInBuilding.filter(function(item) {
      return (
        JSON.stringify(item)
          .toLowerCase()
          .indexOf(input.toString().toLowerCase()) > -1
      )
    })

    this.setState({
      searchValue: input,
      projectsToShow: tempProjectsToShow
    })
  }

  handleOpenAddProjects = () => {
    this.setState({
      modalOpen: true,
      editingProject: false,
      modalView: 'projectModal'
    })
  }

  handleOpenAddMeasurePackage = () => {
    this.setState({
      modalOpen: true,
      currentMeasurePackage: {},
      viewMode: 'addMeasurePackage',
      modalView: 'measurePackageModal'
    })
  }

  handleDateFields = (e, field, setFieldValue) => {
    setFieldValue(field, e.target.value)
  }

  validateForm = values => {
    let errors = {}

    if (values.name.length === 0) {
      errors.name = 'Name is required'
    }

    return errors
  }

  onRatesSubmit = async (
    values,
    setFieldValue,
    formValues,
    setFieldTouched
  ) => {
    let rates = values
    for (let key in rates) {
      rates[key] = +rates[key]
    }
    this.setState({ rates, reRunProjects: true })
    try {
      let projectIds = formValues.projects
        .filter(project => {
          let collectionTarget = project.collectionTarget || 'measure'
          return collectionTarget === 'measure'
        })
        .map(project => project._id)
      let measurePackageIds = formValues.projects
        .filter(project => {
          let collectionTarget = project.collectionTarget || 'measure'
          return collectionTarget === 'measurePackage'
        })
        .map(project => project._id)
      let projects = await this.props.reRunProjectsByIds(
        this.props.building._id,
        { projectIds, measurePackageIds },
        rates
      )
      setFieldValue('projects', projects)
      setFieldValue('rates', rates)
      setFieldTouched('projects')
      setFieldTouched('rates')
      this.setState({
        reRunProjects: false,
        originProjects: projects,
        projectsToShow: projects,
        searchValue: ''
      })
      await this.calculateTotal(projects, rates)
    } catch (err) {
      console.log(err)
      this.setState({
        reRunProjects: false,
        searchValue: ''
      })
    }
  }

  handleClose = values => {
    let projectIds = [],
      measurePackageIds = []
    let { project, projectPackage } = this.props
    let projectId = (project && project._id) || ''
    let originalProjects = projectPackage.projects || []
    let originalProjectIds = originalProjects
      .filter(project => {
        let collectionTarget = project.collectionTarget || 'measure'
        return collectionTarget === 'measure'
      })
      .map(project => project._id)
    let originalMeasurePackageIds = originalProjects
      .filter(project => {
        let collectionTarget = project.collectionTarget || 'measure'
        return collectionTarget === 'measurePackage'
      })
      .map(project => project._id)
    projectIds = values.projects
      .filter(project => {
        let collectionTarget = project.collectionTarget || 'measure'
        return collectionTarget === 'measure'
      })
      .map(project => project._id)
      .filter(id => id != projectId && originalProjectIds.indexOf(id) === -1)
    measurePackageIds = values.projects
      .filter(project => {
        let collectionTarget = project.collectionTarget || 'measure'
        return collectionTarget === 'measurePackage'
      })
      .map(project => project._id)
      .filter(
        id => id != projectId && originalMeasurePackageIds.indexOf(id) === -1
      )
    this.props.onClose('cancel', { projectIds, measurePackageIds })
    if (
      JSON.stringify(this.state.rates) !==
      JSON.stringify(this.state.originalRates)
    ) {
      let ids = this.state.originProjects.map(project => project._id)
      this.props.reRunProjectsByIds(
        this.props.building._id,
        ids,
        this.props.originalRates
      )
    }
  }

  handleSubmit = async values => {
    const { mode, onClose, project } = this.props
    let { total, rates } = this.state
    let response
    let updatedValues = Object.assign({}, values)
    let projectIds = updatedValues.projects
      .filter(
        project =>
          !project.collectionTarget || project.collectionTarget === 'measure'
      )
      .map(project => project._id)
    let measurePackageIds = updatedValues.projects
      .filter(project => project.collectionTarget === 'measurePackage')
      .map(project => project._id)
    delete updatedValues.projects
    if (project) {
      projectIds = projectIds.filter(
        id => id != ((project && project._id) || '')
      )
      measurePackageIds = measurePackageIds.filter(
        id => id !== ((project && project._id) || '')
      )
      let { originProjects } = this.state
      let filterProjects = originProjects.filter(
        pro => pro._id != (project && project._id)
      )
      total = await this.getTotal(filterProjects, rates)
    } else {
      let { originProjects } = this.state
      total = await this.getTotal(originProjects, rates)
    }
    updatedValues.projects = projectIds
    updatedValues.measurePackages = measurePackageIds
    updatedValues.total = total

    updatedValues['fields'] = this.state.currentProjectPackage.fields || []
    let sectionFields = [...(this.state.currentProjectPackage.fields || [])]
    let fields = []
    for (let sectionField of sectionFields) {
      if (sectionField.subFields && sectionField.subFields.length) {
        fields = [...fields, ...sectionField.subFields]
      }
    }
    let fieldValues = {}
    if (fields) {
      fields.forEach(field => {
        fieldValues[field.title] = updatedValues[field.title]
        delete updatedValues[field.title]
      })
    }
    updatedValues['fieldValues'] = Object.assign({}, fieldValues)

    switch (mode) {
      case 'addProjectPackage':
      case 'createProjectPackagefromProposal':
        {
          response = await this.props.createProjectPackage(
            this.props.building._id,
            updatedValues
          )
        }
        break
      case 'editProjectPackage':
        {
          response = await this.props.updateProjectPackage(
            this.props.building._id,
            updatedValues
          )
        }
        break
      default:
        break
    }
    if (project && project.collectionTarget !== 'measure')
      return onClose('create', {
        result: response,
        setFieldValue: this.props.setFieldValue
      })
    return onClose('create', { result: response })
  }

  getTotal = async (projects, rates) => {
    let projectCost = 0,
      incentive = 0,
      annualSavings = 0,
      electric = 0,
      roi = 0,
      simplePayBack = 0,
      npv = 0,
      sir = 0,
      ghgSavings = 0,
      ghgSavingsCost = 0,
      waterSavings = 0,
      gasSavings = 0,
      maintenanceSavings = 0,
      calculationType = '',
      demandSavings = 0,
      eul = 0,
      energySavings = 0

    projects.forEach(project => {
      const key = 'runResultsWithRate'
      let calculatedProjectCost = getProjectCost(project) || 0
      let calculatedIncentive =
        getIncentive(project, this.props.building._id, key) || 0
      let calculatedAnnualSavings =
        getAnnualSavings(project, this.props.building._id, 'sort', key) || 0
      let calculatedElectric =
        getEnergySavings(
          project,
          this.props.building._id,
          'electric',
          'sort',
          key
        ) || 0
      let calculatedGHGSavings =
        getGHGSavingsCost(project, this.props.building._id, 'ghg', key) || 0
      calculatedGHGSavings = isFinite(calculatedGHGSavings)
        ? calculatedGHGSavings
        : 0
      let calculatedGHGSavingsCost =
        getGHGSavingsCost(project, this.props.building._id, 'ghg-cost', key) ||
        0
      calculatedGHGSavingsCost = isFinite(calculatedGHGSavingsCost)
        ? calculatedGHGSavingsCost
        : 0
      let calculatedWaterSavings =
        getEnergySavings(
          project,
          this.props.building._id,
          'water',
          'sort',
          key
        ) || 0
      let calculatedGasSavingsCost =
        getGasSavingsCost(project, this.props.building._id, 'gas', key) || 0
      let calculatedEnergySavings = getTotalEnergySavings(
        project,
        this.props.building._id,
        key
      )
      let calculatedDemandSavings =
        getDemandSavings(project, this.props.building._id, key) || 0
      let calculatedEUL = getEUL(project, this.props.building._id, key) || 0
      if (calculationType === '')
        calculationType =
          getCalculationType(project, this.props.building._id, key) || ''
      projectCost += calculatedProjectCost
      incentive += calculatedIncentive
      annualSavings += calculatedAnnualSavings
      electric += calculatedElectric
      ghgSavingsCost += calculatedGHGSavingsCost
      ghgSavings += calculatedGHGSavings
      gasSavings += calculatedGasSavingsCost
      waterSavings += calculatedWaterSavings
      demandSavings += calculatedDemandSavings
      eul += Number(calculatedEUL)
      maintenanceSavings += getMaintenanceSavings(project, key) || 0
      energySavings = Number(energySavings) + Number(calculatedEnergySavings)
    })
    if (projects.length > 1) {
      roi = (
        ((annualSavings + maintenanceSavings) / (projectCost - incentive)) *
        100
      ).toFixed(0)
      roi = isFinite(roi) ? Number(roi) : 0
      const requestBody = {
        project_cost: projectCost,
        incentive: incentive,
        annual_savings: annualSavings,
        maintenance_savings: maintenanceSavings,
        discount_rate: ((rates && rates.financeRate) || 0) / 100,
        finance_rate: ((rates && rates.discountRate) || 0) / 100,
        inflation_rate: ((rates && rates.inflationRate) || 0) / 100,
        reinvestment_rate: ((rates && rates.reinvestmentRate) || 0) / 100,
        investment_period: (rates && rates.investmentPeriod) || 0
      }
      try {
        const { data } = await this.props.getCashFlow(requestBody)
        simplePayBack = data.simple_payback || 0
        let cashFlows = data.cash_flows || []
        if (
          cashFlows &&
          cashFlows[0] &&
          cashFlows[0].SIR &&
          annualSavings > 0
        ) {
          sir = Number(cashFlows.slice(-1)[0].SIR.toFixed(2))
        } else sir = 0
        if (cashFlows && annualSavings > 0) {
          npv = Math.ceil(cashFlows.slice(-1)[0].NPV)
        } else npv = 0
      } catch (err) {
        console.log(err)
      } finally {
        return {
          projectCost,
          incentive,
          annualSavings,
          electric,
          gasSavings,
          ghgSavings,
          ghgSavingsCost,
          waterSavings,
          roi,
          simplePayBack,
          npv,
          sir,
          demandSavings,
          eul,
          calculationType,
          energySavings,
          maintenanceSavings
        }
      }
    } else if (projects.length == 1) {
      roi = getROI(projects[0], this.props.building._id, 'runResultsWithRate')
      simplePayBack = getSimplePayback(
        projects[0],
        this.props.building._id,
        'runResultsWithRate'
      )
      npv = getNPV(projects[0], this.props.building._id, 'runResultsWithRate')
      sir = getSIR(projects[0], this.props.building._id, 'runResultsWithRate')
      return {
        projectCost,
        incentive,
        annualSavings,
        electric,
        gasSavings,
        ghgSavings,
        ghgSavingsCost,
        waterSavings,
        roi,
        simplePayBack,
        npv,
        sir,
        demandSavings,
        eul,
        calculationType,
        energySavings,
        maintenanceSavings
      }
    } else {
      return {}
    }
  }

  calculateTotal = async (projects, rates) => {
    this.setState({ reCalculating: true })
    const total = await this.getTotal(projects, rates)
    this.setState({ total, reCalculating: false })
  }

  renderDetails = (values, setFieldTouched, setFieldValue, setValues) => {
    const { currentProjectPackage } = this.state
    let sectionFields = currentProjectPackage.fields || []
    let allFields = []
    for (let field of sectionFields) {
      if (field.subFields && field.subFields.length > 0) {
        allFields = [...allFields, ...field.subFields]
      }
    }
    let fields = allFields.filter(
      field =>
        field.type !== 'section' &&
        field.text !== 'Proposal' &&
        !field.convertedName
    )

    let textQuilIndex = this.props.project ? 1 : 0
    if (this.props.index !== undefined) textQuilIndex = this.props.index + 2

    return (
      <div>
        {!!fields &&
          fields.map((field, index) => {
            switch (field.type) {
              case 'Input':
                return (
                  <div key={index}>
                    <FieldSelect
                      id={field.title}
                      name={field.title}
                      component="input"
                      label={field.title}
                      type="text"
                      value={
                        (values && values[field.title]) || field.defaultValue
                      }
                      onChange={event =>
                        this.handleChanged({
                          event,
                          setFieldValue,
                          field: field.title
                        })
                      }
                      disabled={true}
                    />
                    <br />
                  </div>
                )
              case 'InputNumber':
                return (
                  <div key={index}>
                    <FieldSelect
                      key={index}
                      id={field.title}
                      name={field.title}
                      component="input"
                      label={field.title}
                      type="number"
                      value={values[field.title] || field.defaultValue}
                      onChange={event =>
                        this.handleChanged({
                          event,
                          setFieldValue,
                          field: field.title
                        })
                      }
                      disabled={true}
                      onWheel={e => e.target.blur()}
                    />
                    <br />
                  </div>
                )
              case 'InputEmail':
                return (
                  <div key={index}>
                    <FieldSelect
                      key={index}
                      id={field.title}
                      name={field.title}
                      component="input"
                      label={field.title}
                      type="email"
                      value={values[field.title] || field.defaultValue}
                      onChange={event =>
                        this.handleChanged({
                          event,
                          setFieldValue,
                          field: field.title
                        })
                      }
                      disabled={true}
                    />
                    <br />
                  </div>
                )
              case 'InputPhoneNumber':
                return (
                  <div key={index}>
                    <FieldSelect
                      id={field.title}
                      name={field.title}
                      component="input"
                      label={field.title}
                      type="text"
                      value={values[field.title] || field.defaultValue}
                      onChange={event =>
                        this.handleChanged({
                          event,
                          setFieldValue,
                          field: field.title
                        })
                      }
                      disabled={true}
                    />
                    <br />
                  </div>
                )
              case 'Text': {
                let previousFields =
                  fields.filter(
                    (filter, filterIndex) =>
                      filter.type === 'Text' && filterIndex < index
                  ) || []
                let previousIndex = textQuilIndex + 1 + previousFields.length
                return (
                  <div key={index}>
                    <span className={formFieldStyles.label}>{field.title}</span>
                    <TextQuillEditor
                      handleChange={html =>
                        this.handleDescriptionChange(
                          field.title,
                          html,
                          setFieldValue
                        )
                      }
                      html={values[field.title] || ''}
                      placeholder={field.placeHolder}
                      index={previousIndex}
                      hidePersonalize={true}
                      disabled={true}
                    />
                    <br />
                  </div>
                )
              }
              case 'Select':
                return (
                  <div key={index}>
                    <FieldSelect
                      label={field.title}
                      component="select"
                      name={field.title}
                      data-test={field.title}
                      placeholder="Select"
                      onChange={event =>
                        this.handleChanged({
                          event,
                          setFieldValue,
                          field: field.title
                        })
                      }
                      disabled={true}
                      defaultValue={field.defaultValue || ''}
                    >
                      <option defaultValue value="" disabled>
                        Select {field.title}
                      </option>
                      {field.options.map(option => (
                        <option
                          key={`${field.title}-option-${option}`}
                          value={option}
                        >
                          {option}
                        </option>
                      ))}
                    </FieldSelect>
                    <br />
                  </div>
                )
              case 'Date': {
                return (
                  <div key={index}>
                    <span className={formFieldStyles.label}>{field.title}</span>
                    <Field
                      type="date"
                      component="input"
                      id={field.title}
                      name={field.title}
                      value={(values && values[field.title]) || ''}
                      onChange={event =>
                        this.handleChanged({
                          event,
                          setFieldValue,
                          field: field.title
                        })
                      }
                      disabled={true}
                    />
                    <br />
                    <br />
                  </div>
                )
              }
              default:
                break
            }
          })}
      </div>
    )
  }

  render() {
    const { mode, project } = this.props
    const { showExtras } = this.state
    let index = project ? 1 : 0
    if (this.props.index !== undefined) index = index + 2 + this.props.index
    const {
      currentProjectPackage,
      loading,
      projectsToShow,
      statusOptions,
      constructionStatusOptions
    } = this.state

    let fieldValues =
      (currentProjectPackage && currentProjectPackage.fieldValues) || {}

    let initialValues = {
      _id: (currentProjectPackage && currentProjectPackage._id) || 'New',
      name: (currentProjectPackage && currentProjectPackage.name) || '',
      description:
        (currentProjectPackage && currentProjectPackage.description) || '',
      projects: (currentProjectPackage && currentProjectPackage.projects) || [],
      estimatedStartDate:
        (currentProjectPackage && currentProjectPackage.estimatedStartDate) ||
        '',
      estimatedCompletionDate:
        (currentProjectPackage &&
          currentProjectPackage.estimatedCompletionDate) ||
        '',
      actualStartDate:
        (currentProjectPackage && currentProjectPackage.actualStartDate) || '',
      actualCompletionDate:
        (currentProjectPackage && currentProjectPackage.actualCompletionDate) ||
        '',
      status: (currentProjectPackage && currentProjectPackage.status) || '',
      constructionStatus:
        (currentProjectPackage && currentProjectPackage.constructionStatus) ||
        '',
      rates: this.state.rates,
      ...fieldValues
    }

    if (initialValues.estimatedStartDate) {
      initialValues.estimatedStartDate = moment(
        initialValues.estimatedStartDate
      )
        .utc()
        .format('YYYY-MM-DD')
    }

    if (initialValues.estimatedCompletionDate) {
      initialValues.estimatedCompletionDate = moment(
        initialValues.estimatedCompletionDate
      )
        .utc()
        .format('YYYY-MM-DD')
    }

    if (initialValues.actualStartDate) {
      initialValues.actualStartDate = moment(initialValues.actualStartDate)
        .utc()
        .format('YYYY-MM-DD')
    }

    if (initialValues.actualCompletionDate) {
      initialValues.actualCompletionDate = moment(
        initialValues.actualCompletionDate
      )
        .utc()
        .format('YYYY-MM-DD')
    }

    let submitText

    switch (mode) {
      case 'addProjectPackage':
      case 'createProjectPackagefromProposal':
        submitText = 'Add Project'
        break
      case 'editProjectPackage':
        submitText = 'Update Project'
        break
    }

    return (
      <div className={styles.formWrapper}>
        <Formik
          initialValues={initialValues}
          validate={values => this.validateForm(values)}
        >
          {({
            values,
            isSubmitting,
            isValid,
            setFieldValue,
            setFieldTouched,
            setSubmitting,
            setValues
          }) => {
            return (
              <Form className={styles.form}>
                <div className={styles.assetForm}>
                  <FormSection
                    title="Details"
                    description="Add basic information about your project"
                  >
                    <ErrorMessage
                      name="name"
                      component="div"
                      className={styles.formError}
                    />
                    <FieldSelect
                      id="name"
                      name="name"
                      component="input"
                      label="Project Name"
                      type="text"
                      value={values.name}
                      onChange={event =>
                        this.handleChanged({
                          event,
                          setFieldValue,
                          field: 'name'
                        })
                      }
                    />
                    <br />
                    <ErrorMessage
                      name="status"
                      component="div"
                      className={styles.formError}
                    />
                    <FieldSelect
                      label="Status"
                      component="select"
                      name="status"
                      data-test="status"
                      placeholder="Select"
                    >
                      <option defaultValue value="" disabled>
                        Select a status
                      </option>
                      {statusOptions.map(({ name, value }) => (
                        <option key={`status-option-${value}`} value={value}>
                          {name}
                        </option>
                      ))}
                    </FieldSelect>
                    <br />
                    <div>
                      <span className={formFieldStyles.label}>Description</span>
                      <TextQuillEditor
                        handleChange={html =>
                          this.handleDescriptionChange(html, setFieldValue)
                        }
                        html={values.description || ''}
                        placeholder="Enter Project Description"
                        index={index}
                        hidePersonalize={true}
                      />
                    </div>
                    <br />
                    {this.renderDetails(
                      values,
                      setFieldTouched,
                      setFieldValue,
                      setValues
                    )}
                  </FormSection>
                  <FormSection
                    title="Construction"
                    description="Add construction for your project"
                  >
                    <ErrorMessage
                      name="constructionStatus"
                      component="div"
                      className={styles.formError}
                    />
                    <FieldSelect
                      label="Construction Status"
                      component="select"
                      name="constructionStatus"
                      data-test="construction-status"
                      placeholder="Select"
                    >
                      <option defaultValue value="" disabled>
                        Select a construction status
                      </option>
                      {constructionStatusOptions.map(({ name, value }) => (
                        <option key={`type-option-${value}`} value={value}>
                          {name}
                        </option>
                      ))}
                    </FieldSelect>
                    <br />
                    <div className={styles.date}>
                      <span className={formFieldStyles.label}>
                        Estimated Date
                      </span>
                      <div className={styles.dateContainer}>
                        <div className={styles.dateContainerSection}>
                          <ErrorMessage
                            name="estimatedStartDate"
                            component="div"
                            className={styles.formError}
                          />
                          <label>
                            <small>Start Date</small>
                          </label>
                          <Field
                            type="date"
                            component="input"
                            name="estimatedStartDate"
                            value={values.estimatedStartDate}
                            onChange={e =>
                              this.handleDateFields(
                                e,
                                'estimatedStartDate',
                                setFieldValue
                              )
                            }
                          />
                        </div>
                        <div className={styles.dateContainerSection}>
                          <ErrorMessage
                            name="estimatedCompletionDate"
                            component="div"
                            className={styles.formError}
                          />
                          <label>
                            <small>Completion Date</small>
                          </label>
                          <Field
                            type="date"
                            component="input"
                            name="estimatedCompletionDate"
                            value={values.estimatedCompletionDate}
                            onChange={e =>
                              this.handleDateFields(
                                e,
                                'estimatedCompletionDate',
                                setFieldValue
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <br />
                    <div className={styles.date}>
                      <span className={formFieldStyles.label}>Actual Date</span>
                      <div className={styles.dateContainer}>
                        <div className={styles.dateContainerSection}>
                          <ErrorMessage
                            name="actualStartDate"
                            component="div"
                            className={styles.formError}
                          />
                          <label>
                            <small>Start Date</small>
                          </label>
                          <Field
                            type="date"
                            component="input"
                            name="actualStartDate"
                            value={values.actualStartDate}
                            onChange={e =>
                              this.handleDateFields(
                                e,
                                'actualStartDate',
                                setFieldValue
                              )
                            }
                          />
                        </div>
                        <div className={styles.dateContainerSection}>
                          <ErrorMessage
                            name="actualCompletionDate"
                            component="div"
                            className={styles.formError}
                          />
                          <label>
                            <small>Completion Date</small>
                          </label>
                          <Field
                            type="date"
                            component="input"
                            name="actualCompletionDate"
                            value={values.actualCompletionDate}
                            onChange={e =>
                              this.handleDateFields(
                                e,
                                'actualCompletionDate',
                                setFieldValue
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </FormSection>
                  <div className={styles.measureButton}>
                    <div
                      className={classNames(
                        projectViewStyles.extras,
                        showExtras
                          ? projectViewStyles.extrasShow
                          : projectViewStyles.extrasHide
                      )}
                      ref={node => (this.node = node)}
                    >
                      <button
                        type="button"
                        className={classNames(
                          projectViewStyles.button,
                          projectViewStyles.buttonPrimary
                        )}
                        onClick={this.handleToggleExtras}
                      >
                        <i className="material-icons">add</i>New
                        <span> Measure</span>
                      </button>
                      <div
                        className={classNames(
                          projectViewStyles.extrasDropdown,
                          projectViewStyles.extrasDropdownRight
                        )}
                      >
                        <div
                          className={projectViewStyles.extrasLink}
                          onClick={this.handleOpenAddProjects}
                        >
                          <i className="material-icons">add</i>
                          {'Measure'}
                        </div>
                        <div
                          className={projectViewStyles.extrasLink}
                          onClick={this.handleOpenAddMeasurePackage}
                        >
                          <i className="material-icons">add</i>
                          {'Measure Package'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <br /> <br /> <br />
                  <div className={formStyles.formSectionDescription}>
                    <p>Measures</p>
                    <div
                      className={classNames(
                        projectViewStyles.panel,
                        projectViewStyles.projectsRates
                      )}
                    >
                      <div className={projectViewStyles.panelHeader}>
                        <div className={projectViewStyles.projectsRatesHeader}>
                          <div
                            className={projectViewStyles.panelDropdownClick}
                            onClick={this.handleHideProjectRates}
                          >
                            {this.state.hideProjectRates ? (
                              <i className="material-icons">arrow_drop_up</i>
                            ) : (
                              <i className="material-icons">arrow_drop_down</i>
                            )}
                          </div>
                          <h3>Settings</h3>
                        </div>
                        {!this.state.editingRates && (
                          <div
                            className={classNames(
                              projectViewStyles.panelEdit,
                              this.state.hideProjectRates
                                ? projectViewStyles.panelEditHide
                                : ''
                            )}
                            onClick={this.handleStartEdit}
                          >
                            <i className="material-icons">edit</i>
                          </div>
                        )}
                      </div>
                      {/* {!this.state.editingRates && this.state.rates && (
                        <div
                          className={classNames(
                            projectViewStyles.panelContent,
                            this.state.hideProjectRates
                              ? projectViewStyles.panelContentHide
                              : ''
                          )}
                        >
                          <div
                            className={projectViewStyles.projectsRatesCurrent}
                          >
                            <p>
                              <span>Finance Rate:</span>
                              {(this.state.rates &&
                                this.state.rates.financeRate) ||
                                0}
                              %
                            </p>
                            <p>
                              <span>Discount Rate:</span>
                              {(this.state.rates &&
                                this.state.rates.discountRate) ||
                                0}
                              %
                            </p>
                            <p>
                              <span>Reinvestment Rate:</span>
                              {(this.state.rates &&
                                this.state.rates.reinvestmentRate) ||
                                0}
                              %
                            </p>
                            <p>
                              <span>Inflation Rate:</span>
                              {(this.state.rates &&
                                this.state.rates.inflationRate) ||
                                0}
                              %
                            </p>
                            <p>
                              <span>Investment Period:</span>
                              {(this.state.rates &&
                                this.state.rates.investmentPeriod) ||
                                10}{' '}
                              yrs
                            </p>
                          </div>
                        </div>
                      )} */}
                      {this.state.editingRates && (
                        <ProjectRates
                          onRatesSubmit={this.onRatesSubmit}
                          hideProjectsRate={this.state.hideProjectRates}
                          initialValues={this.state.rates}
                          handleHideForm={this.handleHideForm}
                          setFieldValue={setFieldValue}
                          setFieldTouched={setFieldTouched}
                          formValues={values}
                        />
                      )}
                    </div>
                    <div className={formStyles.main}>
                      {(this.state.reRunProjects ||
                        this.state.reCalculating) && (
                        <div className={formStyles.mainRerunning}>
                          {this.state.reRunProjects &&
                            !this.state.reCalculating && (
                              <h3>
                                Re-evaluating measures after rates changed.
                                Please wait to view new outputs.
                              </h3>
                            )}
                          {!this.state.reRunProjects &&
                            this.state.reCalculating && (
                              <h3>Re-calculating total values for project.</h3>
                            )}
                          <Loader />
                        </div>
                      )}
                      <ProjectSearch
                        searchValue={this.state.searchValue}
                        handleSearch={this.handleSearch}
                      />
                      <PackageFormProjectList
                        projectsToShow={projectsToShow}
                        handleEditProject={this.handleEditProject}
                        handleDeleteProject={this.handleDeleteProject}
                        setFieldValue={setFieldValue}
                        buildingId={this.props.building._id}
                        handleOpenDeleteConfirmationModal={
                          this.handleOpenDeleteConfirmationModal
                        }
                        total={this.state.total}
                        modeFrom="ProjectPackage"
                      />
                    </div>
                  </div>
                  <UserFeature name="docuSign">
                    {({ enabled }) => {
                      if (!enabled) return null
                      return (
                        <div className={projectFormStyles.projectFormSection}>
                          <div
                            className={
                              projectFormStyles.projectFormSectionDescription
                            }
                          >
                            <p>DocuSign</p>
                            <span>
                              Get eSignatures using your DocuSign templates in
                              buildee.
                            </span>
                          </div>
                          <div
                            className={
                              projectFormStyles.projectFormSectionInputs
                            }
                          >
                            <DocuSignSection
                              id={
                                (this.props.projectPackage &&
                                  this.props.projectPackage._id) ||
                                ''
                              }
                              modeFrom="project"
                            />
                          </div>
                        </div>
                      )
                    }}
                  </UserFeature>
                </div>
                <Footer>
                  <button
                    type="button"
                    className={classNames(
                      styles.button,
                      styles.buttonSecondary
                    )}
                    onClick={() => this.handleClose(values)}
                  >
                    Cancel
                  </button>
                  <button
                    className={classNames(styles.button, styles.buttonPrimary, {
                      [styles.buttonDisable]: !isValid
                    })}
                    disabled={!isValid}
                    type="submit"
                    data-test="user-package-add-button"
                    onClick={event => {
                      event.preventDefault()
                      setSubmitting(true)
                      this.handleSubmit(values).then(() => {
                        setSubmitting(false)
                      })
                      event.stopPropagation()
                    }}
                  >
                    {loading || isSubmitting ? (
                      <Loader size="button" color="white" />
                    ) : (
                      submitText
                    )}
                  </button>
                </Footer>
                {this.state.modalOpen &&
                  this.state.modalView === 'deleteConfirmation' && (
                    <DeleteConfirmationModal
                      title={this.state.currentProject.displayName}
                      flag={'remove'}
                      confirmationFunction={() =>
                        this.handleDeleteProject(
                          this.state.currentProject._id,
                          setFieldValue
                        )
                      }
                      onClose={this.handleCloseAddProjects}
                    />
                  )}
                {this.state.modalOpen &&
                  this.state.modalView === 'projectModal' && (
                    <PackageMeasureModal
                      uploadProjectImage={this.props.uploadProjectImage}
                      building={this.props.building}
                      handleCloseAddProjects={this.handleCloseAddProjects}
                      evaluateProject={this.props.evaluateProject}
                      createOrganizationProject={
                        this.props.createOrganizationProject
                      }
                      editOrganizationProject={
                        this.props.editOrganizationProject
                      }
                      addIncompleteProject={this.props.addIncompleteProject}
                      getProjectsAndMeasures={this.props.getProjectsAndMeasures}
                      currentProject={this.state.currentProject}
                      getUserById={this.props.getUserById}
                      getOrganizationName={this.props.getOrganizationName}
                      getOrganizationProjects={
                        this.props.getOrganizationProjects
                      }
                      deleteOrganizationProject={
                        this.props.deleteOrganizationProject
                      }
                      bulkAddProjects={this.props.bulkAddProjects}
                      endUse={this.props.endUse}
                      utilityMetrics={this.props.utilityMetrics}
                      buildingEquipment={this.props.buildingEquipment}
                      products={this.props.products}
                      getMeasures={this.props.getMeasures}
                      setFieldValue={setFieldValue}
                      projects={values.projects}
                      rates={this.state.rates}
                      index={index}
                    />
                  )}
                {this.state.modalOpen &&
                  this.state.modalView === 'measurePackageModal' && (
                    <MeasurePackagesModal
                      building={this.props.building}
                      onClose={this.handleCloseAddMeasurePackage}
                      measurePackage={this.state.currentMeasurePackage}
                      endUse={this.props.endUse}
                      utilityMetrics={this.props.utilityMetrics}
                      buildingEquipment={this.props.buildingEquipment}
                      user={this.props.user}
                      viewMode={this.state.viewMode}
                      rates={this.state.rates}
                      index={index}
                      projects={values.projects}
                      setFieldValue={setFieldValue}
                      modeFrom="ProjectPackage"
                    />
                  )}
              </Form>
            )
          }}
        </Formik>
      </div>
    )
  }
}

const mapDispatchToProps = {
  createProjectPackage,
  updateProjectPackage,
  getCashFlow,
  reRunProjectsByIds,
  getMeasures,
  createOrganizationProject,
  editOrganizationProject,
  getProjectsAndMeasures,
  getOrganizationName,
  getOrganizationProjects,
  deleteOrganizationProject,
  addIncompleteProject: addIncompletePackageProject,
  uploadProjectImage,
  evaluateProject,
  getUserById,
  bulkAddProjects
}

const mapStateToProps = state => ({
  products: (state.login.user && state.login.user.products) || {}
})

export default connect(mapStateToProps, mapDispatchToProps)(ProjectPackagesForm)
