import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { connect } from 'react-redux'
import { Formik, Field, Form } from 'formik'
import styles from '../ScenarioForms/ScenarioForm.scss'
import formFieldStyles from '../FormFields/Field.module.scss'
import projectViewStyles from '../../../components/Project/ProjectView.scss'
import projectFormStyles from './ProjectForm.scss'
import formStyles from './ProjectPackageForm.scss'
import {
  ProjectRates,
  ProjectSearch,
  PackageFormProjectList,
  ProposalFormProjectPackageList
} from '../../../components/Project'
import { Footer } from '../../../components/UI/Footer'
import { FormSection, Field as FieldSelect, ImagesField } from '../FormFields'
import DeleteConfirmationModal from '../../Modal/DeleteConfirmationModal'
import {
  PackageMeasureModal,
  MeasurePackagesModal,
  ProjectPackagesModal
} from '../../Modal'
import TextQuillEditor from '../../../components/UI/TextEditor/TextQuillEditor'
import { Loader } from 'utils/Loader'
import { multiSelectChecker } from 'utils/Portfolio'
import {
  createProposal,
  updateProposal,
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
  bulkAddProjects,
  getProjectPackages,
  updateProjectPackage
} from '../../../routes/Building/modules/building'
import { getMeasures } from '../../../routes/Library/modules/library'
import { getOrgProposalTemplates } from '../../../routes/ProposalTemplate/modules/proposalTemplate'
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
import UserFeature from '../../../utils/Feature/UserFeature'

class ProposalForm extends Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    building: PropTypes.object.isRequired,
    proposal: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    mode: PropTypes.oneOf(['addProposal', 'editProposal', 'copyProposal'])
      .isRequired
  }

  state = {
    currentProposal: this.props.proposal,
    originProjects: (this.props.proposal && this.props.proposal.projects) || [],
    projectsToShow: (this.props.proposal && this.props.proposal.projects) || [],
    editingRates: false,
    originProjectPackages:
      (this.props.proposal && this.props.proposal.projectPackages) || [],
    projectPackagesToShow:
      (this.props.proposal && this.props.proposal.projectPackages) || [],
    editingRates: false,
    hideProjectRates: true,
    modalOpen: false,
    currentProject: {},
    currentMeasurePackage: {},
    currentProjectPackage: {},
    modalView: null,
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
    total: (this.props.proposal && this.props.proposal.total) || {},
    rates: (this.props.proposal && this.props.proposal.rates) || {},
    originalRates: (this.props.proposal && this.props.proposal.rates) || {},
    showExtras: false,

    //exisint measures and projects
    showExistingMode: '',
    searchExistingValue: '',
    selectedItemIds: [],
    proposalMode:
      this.props.proposalMode ||
      (this.props.proposal && this.props.proposal.mode) ||
      'Measure',
    existingLoading: false,
    existingProjects: this.props.projects || [],
    existingProjectPackages: this.props.projectPackages || [],
    showExistingProjects: this.props.projects || [],
    showExistingProjectPackages: this.props.projectPackages || []
  }

  componentDidMount() {
    let { rates, proposalMode } = this.state
    let { mode, selectedMeasures = [], selectedProjects = [] } = this.props

    if (rates.constructor === Object && Object.keys(rates).length === 0) {
      rates = (this.props.building && this.props.building.projectRates) || {}
      this.setState({ rates, originalRates: rates })
    }

    if (mode === 'addProposal') {
      if (proposalMode === 'Measure') {
        if (selectedMeasures.length) {
          let { originProjects, projectsToShow, currentProposal } = this.state
          this.setState({
            originProjects: [...originProjects, ...selectedMeasures],
            projectsToShow: [...projectsToShow, ...selectedMeasures],
            currentProposal: {
              ...currentProposal,
              projects: [
                ...((currentProposal && currentProposal.projects) || []),
                ...selectedMeasures
              ]
            }
          })
          this.calculateTotal([...projectsToShow, ...selectedMeasures], rates)
        }
      } else {
        if (selectedProjects.length) {
          let {
            originProjectPackages,
            projectPackagesToShow,
            currentProposal
          } = this.state
          this.setState({
            originProjectPackages: [
              ...originProjectPackages,
              ...selectedProjects
            ],
            projectPackagesToShow: [
              ...projectPackagesToShow,
              ...selectedProjects
            ],
            currentProposal: {
              ...currentProposal,
              projectPackages: [
                ...((currentProposal && currentProposal.projectPackages) || []),
                ...selectedProjects
              ]
            }
          })
          this.calculateTotal(
            [...originProjectPackages, ...selectedProjects],
            rates
          )
        }
      }
    }
    // get organization proposal templates
    this.props.getOrgProposalTemplates()

    if (this.state.proposalMode === 'Measure') {
      if (!this.props.projects) {
        this.setState({ existingLoading: true })
        this.props
          .getProjectsAndMeasures()
          .then(() => {
            this.setState({ existingLoading: false })
          })
          .catch(() => {
            this.setState({ existingLoading: false })
          })
      }
    } else if (this.state.proposalMode === 'Project') {
      if (!this.props.projectPackages) {
        this.setState({ existingLoading: true })
        this.props
          .getProjectPackages()
          .then(() => {
            this.setState({ existingLoading: false })
          })
          .catch(() => {
            this.setState({ existingLoading: false })
          })
      }
    }

    document.addEventListener('mousedown', this.handleClick, false)
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      this.state.proposalMode === 'Measure' ||
      JSON.stringify(this.props.projects) !== JSON.stringify(nextProps.projects)
    ) {
      this.setState({
        existingProjects: nextProps.projects || [],
        showExistingProjects: nextProps.projects || []
      })
    }
    if (
      this.state.proposalMode === 'Project' ||
      JSON.stringify(this.props.projectPackages) !==
        JSON.stringify(nextProps.projectPackages)
    ) {
      this.setState({
        existingProjectPackages: nextProps.projectPackages || [],
        showExistingProjectPackages: nextProps.projectPackages || []
      })
    }
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
      showExtras: !prevState.showExtras,
      showExistingMode: '',
      searchExistingValue: ''
    }))
  }

  handleStartEdit = () => {
    this.setState({ editingRates: true })
  }

  handleHideProposalRates = () => {
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

  handleDescriptionChange = (key, html, setFieldValue) => {
    setFieldValue(key, html)
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

  handleOpenDeletePackageConfirmationModal = projectPackage => {
    this.setState({
      modalOpen: true,
      modalView: 'deletePackageConfirmation',
      currentProjectPackage: projectPackage
    })
  }

  handleDeleteProjectPackage = async (projectPackageId, setFieldValue) => {
    let updatedProjects = this.state.originProjectPackages || []
    updatedProjects = updatedProjects.filter(
      item => item._id != projectPackageId
    )
    setFieldValue('projectPackages', updatedProjects)
    this.setState({
      projectPackagesToShow: updatedProjects,
      originProjectPackages: updatedProjects,
      modalOpen: false,
      modalView: null,
      currentProjectPackage: {},
      editingRates: false,
      searchValue: ''
    })
    await this.calculateTotal(updatedProjects, this.state.rates)
  }

  handleEditProjectPackage = projectPackage => {
    projectPackage.isEditing = true
    this.setState({
      modalOpen: true,
      viewMode: 'editProjectPackage',
      modalView: 'projectPackageModal',
      currentProjectPackage: projectPackage
    })
  }

  handleSearch = input => {
    const { proposalMode } = this.state
    let tempProjectsInBuilding = [],
      target = ''

    if (proposalMode === 'Measure') {
      tempProjectsInBuilding = [...this.state.originProjects]
      target = 'projectsToShow'
    } else {
      tempProjectsInBuilding = [...this.state.originProjectPackages]
      target = 'projectPackagesToShow'
    }

    let tempProjectsToShow = tempProjectsInBuilding.filter(function(item) {
      return (
        JSON.stringify(item)
          .toLowerCase()
          .indexOf(input.toString().toLowerCase()) > -1
      )
    })

    this.setState({
      searchValue: input,
      [target]: tempProjectsToShow
    })
  }

  handleSearchExistingMeasure = input => {
    const { proposalMode } = this.state
    let tempProjectsInBuilding = [],
      target = ''

    if (proposalMode === 'Measure') {
      tempProjectsInBuilding = [...this.state.existingProjects]
      target = 'showExistingProjects'
    } else {
      tempProjectsInBuilding = [...this.state.existingProjectPackages]
      target = 'showExistingProjectPackages'
    }

    let tempProjectsToShow = tempProjectsInBuilding.filter(function(item) {
      return (
        JSON.stringify(item)
          .toLowerCase()
          .indexOf(input.toString().toLowerCase()) > -1
      )
    })

    this.setState({
      searchExistingValue: input,
      [target]: tempProjectsToShow
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

  handleOpenAddProjectPackage = () => {
    this.setState({
      modalOpen: true,
      editProjectPackage: false,
      viewMode: 'addProjectPackage',
      modalView: 'projectPackageModal',
      currentProjectPackage: {}
    })
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
      if (this.formikRef) {
        this.formikRef.setFieldTouched('projects')
        this.formikRef.setFieldValue('projects', updatedProjects)
      }
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
      if (this.formikRef) {
        this.formikRef.setFieldTouched('projects')
        this.formikRef.setFieldValue('projects', updatedProjects)
      }
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

  handleCloseAddProjectPackage = (response, { result = {}, setFieldValue }) => {
    if (response === 'create') {
      const { projectPackage = null } = result
      if (projectPackage && projectPackage._id) {
        let updatedProjectPackage = { ...projectPackage }
        if (
          !updatedProjectPackage.total ||
          (updatedProjectPackage.total.constructor === Object &&
            Object.keys(updatedProjectPackage.total))
        ) {
          updatedProjectPackage.total = {}
        }
        if (
          !updateProjectPackage.totalWithRate ||
          (updatedProjectPackage.totalWithRate.constructor === Object &&
            Object.keys(updatedProjectPackage.totalWithRate))
        ) {
          updatedProjectPackage.totalWithRate = {
            ...updatedProjectPackage.total
          }
        }
        let { originProjectPackages, projectPackagesToShow } = this.state
        originProjectPackages = originProjectPackages.filter(
          item => item._id !== projectPackage._id
        )
        projectPackagesToShow = projectPackagesToShow.filter(
          item => item._id !== projectPackage._id
        )
        this.setState({
          originProjectPackages: [...originProjectPackages, projectPackage],
          projectPackagesToShow: [...projectPackagesToShow, projectPackage],
          modalOpen: false,
          modalView: null,
          currentPackage: {},
          matchingEaMeasures: [],
          editingRates: false,
          searchProjectValue: ''
        })
        if (this.formikRef) {
          this.formikRef.setFieldTouched('projectPackages')
          this.formikRef.setFieldValue('projectPackages', [
            ...originProjectPackages,
            projectPackage
          ])
        }
        this.calculateTotal(
          [...originProjectPackages, projectPackage],
          this.state.rates
        )
      } else {
        this.setState({
          modalOpen: false,
          modalView: null,
          currentPackage: {},
          matchingEaMeasures: [],
          editingRates: false,
          searchProjectValue: ''
        })
      }
    } else {
      this.setState({
        modalOpen: false,
        modalView: null,
        currentPackage: {},
        matchingEaMeasures: [],
        editingRates: false,
        searchProjectValue: ''
      })
    }
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
    const { proposalMode } = this.state
    if (proposalMode === 'Measure') {
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
    } else {
    }
  }

  handleClose = values => {
    this.props.onClose()
  }

  handleSubmit = async values => {
    const { mode, onClose, proposalTemplateList } = this.props
    let { total, rates, proposalMode } = this.state
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
    let projectPackageIds =
      (updatedValues &&
        updatedValues.projectPackages &&
        updatedValues.projectPackages.map(item => item._id)) ||
      []

    delete updatedValues.projectPackages
    updatedValues.measures = projectIds
    updatedValues.measurePackages = measurePackageIds
    updatedValues.projectPackages = projectPackageIds
    updatedValues.total = total

    let selectedProposalTemplate = _.find(proposalTemplateList, {
      _id: values.proposalTemplate
    })
    let templateFields =
      (selectedProposalTemplate && selectedProposalTemplate.fields) || []
    let fields = []
    for (let templateField of templateFields) {
      if (templateField.subFields && templateField.subFields.length) {
        fields = [...fields, ...templateField.subFields]
      }
    }
    let fieldValues = {}
    if (fields) {
      fields.forEach(field => {
        if (field.title === 'Proposal Name') {
          fieldValues[field.title] = updatedValues.name
        } else {
          fieldValues[field.title] = updatedValues[field.title]
          delete updatedValues[field.title]
        }
      })
    }
    updatedValues['fieldValues'] = Object.assign({}, fieldValues)
    updatedValues['fields'] = templateFields
    updatedValues['organizaiton'] =
      (this.props.organizationView && this.props.organizationView._id) || ''
    updatedValues['buildingIds'] = [this.props.building._id]
    updatedValues['mode'] = proposalMode
    updatedValues['rates'] = rates

    switch (mode) {
      case 'addProposal':
        {
          await this.props.createProposal(
            this.props.building._id,
            updatedValues
          )
        }
        break
      case 'copyProposal':
        {
          await this.props.createProposal(
            this.props.building._id,
            updatedValues,
            'copy'
          )
        }
        break
      case 'editProposal':
        {
          await this.props.updateProposal(
            this.props.building._id,
            updatedValues
          )
        }
        break
      default:
        break
    }
    return onClose()
  }

  getTotal = async (projects, rates) => {
    const { proposalMode } = this.state
    if (proposalMode === 'Measure') {
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
          getGHGSavingsCost(
            project,
            this.props.building._id,
            'ghg-cost',
            key
          ) || 0
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
          if (cashFlows && cashFlows.length && annualSavings > 0) {
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
    } else {
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
        let total = project['total'] || project['totalWithRate'] || {}
        let calculatedProjectCost = (total && total.projectCost) || 0
        let calculatedIncentive = (total && total.incentive) || 0
        let calculatedAnnualSavings = (total && total.annualSavings) || 0
        let calculatedElectric = (total && total.electric) || 0
        let calculatedGHGSavings = (total && total.ghgSavings) || 0
        let calculatedGHGSavingsCost = (total && total.ghgSavingsCost) || 0
        calculatedGHGSavingsCost = isFinite(calculatedGHGSavingsCost)
          ? calculatedGHGSavingsCost
          : 0
        let calculatedWaterSavings = (total && total.waterSavings) || 0
        let calculatedGasSavingsCost = (total && total.gasSavings) || 0
        let calculatedEnergySavings = (total && total.energySavings) || 0
        let calculatedDemandSavings = (total && total.demandSavings) || 0
        let calculatedEUL = (total && total.eul) || 0
        if (calculationType === '')
          calculationType = (total && total.calculationType) || ''
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
        maintenanceSavings += (total && total.maintenanceSavings) || 0
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
          if (cashFlows && cashFlows.length && annualSavings > 0) {
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
        let total = projects[0]
          ? projects[0]['total'] || projects[0]['totalWithRate']
          : {}
        roi = (total && total.roi) || 0
        simplePayBack = (total && total.simplePayBack) || 0
        npv = (total && total.npv) || 0
        sir = (total && total.sir) || 0
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
  }

  calculateTotal = async (projects, rates) => {
    this.setState({ reCalculating: true })
    const total = await this.getTotal(projects, rates)
    this.setState({ total, reCalculating: false })
  }

  handleChooseTemplate = (event, setFieldValue, setValues, values) => {
    const { proposalTemplateList } = this.props
    const { currentProposal } = this.state
    let selectedProposalTemplate = _.find(proposalTemplateList, {
      _id: event.target.value
    })
    let templateFields =
      (selectedProposalTemplate && selectedProposalTemplate.fields) || []
    let fields = []
    for (let templateField of templateFields) {
      if (templateField.subFields && templateField.subFields.length) {
        fields = [...fields, ...templateField.subFields]
      }
    }
    let fieldData = {}
    if (fields) {
      let currentProposalFieldValues =
        (currentProposal && currentProposal.fieldValues) || {}
      fields.forEach(field => {
        if (values[field.title]) fieldData[field.title] = values[field.title]
        else if (currentProposalFieldValues[field.title])
          fieldData[field.title] = currentProposalFieldValues[field.title]
        else fieldData[field.title] = field.defaultValue
      })
    }
    setValues({
      _id: (values && values._id) || 'New',
      name: (values && values.name) || '',
      projects: (values && values.projects) || [],
      projectPackages: (values && values.projectPackages) || [],
      comments: (values && values.comments) || '',
      images: (values && values.images) || [],
      ...fieldData,
      proposalTemplate: event.target.value
    })
  }

  handleOpenExistingMeasures = () => {
    this.setState(prevState => ({
      showExtras: !prevState.showExtras,
      showExistingMode: 'Measure',
      searchExistingValue: '',
      selectedItemIds: []
    }))
  }

  handleOpenExistingProjects = () => {
    this.setState(prevState => ({
      showExtras: !prevState.showExtras,
      showExistingMode: 'Project',
      searchExistingValue: '',
      selectedItemIds: []
    }))
  }

  handleCloseExistingMeasureOrProjects = () => {
    this.setState({
      showExistingMode: '',
      searchExistingValue: '',
      selectedItemIds: []
    })
  }

  handleOpenHideEdit = () => {
    this.setState(prevState => ({
      editingRates: !prevState.editingRates
    }))
  }

  handleSelectItemIds = (event, id) => {
    event.stopPropagation()
    let {
      selectedItemIds,
      existingProjects,
      proposalMode,
      existingProjectPackages
    } = this.state
    if (id === 'all') {
      let ids = []
      if (proposalMode === 'Measure')
        ids = existingProjects.map(item => item._id)
      else ids = existingProjectPackages.map(item => item._id)
      let checkedAll =
        multiSelectChecker(ids, selectedItemIds) &&
        multiSelectChecker(selectedItemIds, ids)
      this.setState({ selectedItemIds: checkedAll ? [] : ids })
    } else {
      let ids = []
      if (selectedItemIds.indexOf(id) === -1) ids = [...selectedItemIds, id]
      else ids = selectedItemIds.filter(item => item !== id)
      ids = [...new Set(ids)]
      this.setState({ selectedItemIds: ids })
    }
  }

  checkEmptyState = () => {
    const { originProjects, originProjectPackages, proposalMode } = this.state
    return (
      (proposalMode === 'Measure' && originProjects.length === 0) ||
      (proposalMode === 'Project' && originProjectPackages.length === 0)
    )
  }

  handleCloseMeasureToProposal = (mode, setFieldValue, setFieldTouched) => {
    const {
      selectedItemIds,
      existingProjects,
      existingProjectPackages,
      proposalMode,
      originProjects = [],
      originProjectPackages = []
    } = this.state
    if (mode === 'okay') {
      if (proposalMode === 'Measure') {
        let originalProjectIds = originProjects.map(project => project._id)
        let selectedItems = existingProjects.filter(
          item =>
            selectedItemIds.indexOf(item._id) !== -1 &&
            originalProjectIds.indexOf(item._id) === -1
        )
        let updatedProjects = [...originProjects, ...selectedItems]
        setFieldValue('projects', updatedProjects)
        setFieldTouched('projects')
        this.setState({
          projectsToShow: updatedProjects,
          originProjects: updatedProjects,
          searchExistingValue: '',
          selectedItemIds: [],
          showExistingMode: '',
          searchExistingValue: ''
        })
        this.calculateTotal(updatedProjects, this.state.rates)
      } else {
        let originProjectPackageIds = originProjectPackages.map(
          project => project._id
        )
        let selectedItems = existingProjectPackages.filter(
          item =>
            selectedItemIds.indexOf(item._id) !== -1 &&
            originProjectPackageIds.indexOf(item._id) === -1
        )
        let updatedProjects = [...originProjectPackages, ...selectedItems]
        setFieldValue('projectPackages', updatedProjects)
        setFieldTouched('projectPackages')
        this.setState({
          projectPackagesToShow: updatedProjects,
          originProjectPackages: updatedProjects,
          searchExistingValue: '',
          selectedItemIds: [],
          showExistingMode: '',
          searchExistingValue: ''
        })
        this.calculateTotal(updatedProjects, this.state.rates)
      }
    } else {
      this.setState({
        selectedItemIds: [],
        showExistingMode: '',
        searchExistingValue: ''
      })
    }
  }

  renderTemplateSubField = (
    field,
    allFields,
    values,
    setFieldTouched,
    setFieldValue,
    setValues
  ) => {
    let textQuilIndex = 0
    let index = 0
    if (field.type === 'Text') {
      index = allFields.findIndex(
        item => item.type === field.type && item.title === field.title
      )
    }
    switch (field.type) {
      case 'Input':
        return (
          <div>
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
            />
            <br />
          </div>
        )
      case 'InputNumber':
        return (
          <div>
            <FieldSelect
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
              onWheel={e => e.target.blur()}
            />
            <br />
          </div>
        )
      case 'InputEmail':
        return (
          <div>
            <FieldSelect
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
            />
            <br />
          </div>
        )
      case 'InputPhoneNumber':
        return (
          <div>
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
            />
            <br />
          </div>
        )
      case 'Text': {
        let previousFields =
          allFields.filter(
            (filter, filterIndex) =>
              filter.type === 'Text' && filterIndex < index
          ) || []
        let previousIndex = textQuilIndex + 1 + previousFields.length
        return (
          <div>
            <span className={formFieldStyles.label}>{field.title}</span>
            <TextQuillEditor
              handleChange={html =>
                this.handleDescriptionChange(field.title, html, setFieldValue)
              }
              html={values[field.title] || ''}
              placeholder={field.placeHolder}
              index={previousIndex}
              hidePersonalize={true}
            />
            <br />
          </div>
        )
      }
      case 'Select':
        return (
          <div>
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
            </FieldSelect>
            <br />
          </div>
        )
      case 'Date': {
        return (
          <div>
            <span className={formFieldStyles.label}>{field.title}</span>
            <Field
              type="date"
              component="input"
              id={field.title}
              name={field.title}
              value={values[field.title]}
              onChange={event =>
                this.handleChanged({
                  event,
                  setFieldValue,
                  field: field.title
                })
              }
            />
            <br />
            <br />
          </div>
        )
      }
    }
  }

  renderTemplates = (values, setFieldTouched, setFieldValue, setValues) => {
    const { proposalTemplateList } = this.props
    let selectedProposalTemplate = _.find(proposalTemplateList, {
      _id: values.proposalTemplate
    })
    let sectionFields =
      (selectedProposalTemplate && selectedProposalTemplate.fields) || []
    sectionFields = sectionFields.filter(item => item.text !== 'Proposal')
    let allFields = []
    for (let field of sectionFields) {
      if (field.subFields && field.subFields.length > 0) {
        allFields = [...allFields, ...field.subFields]
      }
    }
    if (!sectionFields.length) return null
    return (
      <div>
        {sectionFields.map((sectionField, index) => {
          let subFields = sectionField.subFields || []
          if (subFields.length == 0) return null
          return (
            <FormSection
              key={`template - ${index}`}
              title={sectionField.text}
              description={sectionField.description || sectionField.text}
            >
              {subFields.map((subField, index) => {
                return (
                  <div key={index}>
                    {this.renderTemplateSubField(
                      subField,
                      allFields,
                      values,
                      setFieldTouched,
                      setFieldValue,
                      setValues
                    )}
                  </div>
                )
              })}
            </FormSection>
          )
        })}
      </div>
    )
  }

  renderDetails = (values, setFieldTouched, setFieldValue, setValues) => {
    const { proposalTemplateList } = this.props
    let selectedProposalTemplate = _.find(proposalTemplateList, {
      _id: values.proposalTemplate
    })
    let sectionFields =
      (selectedProposalTemplate && selectedProposalTemplate.fields) || []
    sectionFields = sectionFields.filter(
      field => field.type === 'section' && field.text === 'Proposal'
    )
    let fields = []
    if (sectionFields && sectionFields.length) {
      fields = [...sectionFields[0].subFields]
    }
    fields = fields.filter(field => field.title !== 'Proposal Name')

    let textQuilIndex = 0

    return (
      <div>
        <FieldSelect
          id="name"
          name="name"
          component="input"
          label="Proposal Name"
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
                      value={values[field.title] || field.defaultValue}
                      onChange={event =>
                        this.handleChanged({
                          event,
                          setFieldValue,
                          field: field.title
                        })
                      }
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
                      value={values[field.title]}
                      onChange={event =>
                        this.handleChanged({
                          event,
                          setFieldValue,
                          field: field.title
                        })
                      }
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

  renderNewButton = () => {
    const { showExtras, proposalMode, originProjects } = this.state

    switch (proposalMode) {
      case 'Measure': {
        let checkEmpty = this.checkEmptyState()
        if (checkEmpty) return null
        return (
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
                <div
                  className={projectViewStyles.extrasLink}
                  onClick={this.handleOpenExistingMeasures}
                >
                  <i className="material-icons">add</i>
                  {'Existing Measure(s)'}
                </div>
              </div>
            </div>
          </div>
        )
      }
      case 'Project': {
        let checkEmpty = this.checkEmptyState()
        if (checkEmpty) return null
        return (
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
                <span> Project</span>
              </button>
              <div
                className={classNames(
                  projectViewStyles.extrasDropdown,
                  projectViewStyles.extrasDropdownRight
                )}
              >
                <div
                  className={projectViewStyles.extrasLink}
                  onClick={this.handleOpenAddProjectPackage}
                >
                  <i className="material-icons">add</i>
                  {'Project'}
                </div>
                <div
                  className={projectViewStyles.extrasLink}
                  onClick={this.handleOpenExistingProjects}
                >
                  <i className="material-icons">add</i>
                  {'Existing Project(s)'}
                </div>
              </div>
            </div>
          </div>
        )
      }
    }
  }

  renderBody(values, setFieldValue, setFieldTouched) {
    const {
      showExtras,
      proposalMode,
      projectsToShow,
      projectPackagesToShow,
      showExistingMode,
      selectedItemIds
    } = this.state

    switch (proposalMode) {
      case 'Measure': {
        let checkEmpty = this.checkEmptyState()
        if (showExistingMode == 'Measure') {
          return (
            <div className={formStyles.formSectionDescription}>
              <p>Measures</p>
              <div className={projectViewStyles.toolbar}>
                <ProjectSearch
                  searchValue={this.state.searchExistingValue}
                  handleSearch={this.handleSearchExistingMeasure}
                  placeholder={'Search for measures'}
                />
              </div>
              <div className={formStyles.main}>
                {this.state.existingLoading && (
                  <div className={formStyles.mainRerunning}>
                    <Loader />
                  </div>
                )}
                <PackageFormProjectList
                  projectsToShow={this.state.showExistingProjects}
                  handleEditProject={this.handleEditProject}
                  handleDeleteProject={this.handleDeleteProject}
                  setFieldValue={setFieldValue}
                  buildingId={this.props.building._id}
                  handleOpenDeleteConfirmationModal={
                    this.handleOpenDeleteConfirmationModal
                  }
                  total={this.state.total}
                  modeFrom="Proposal"
                  isCheckable={true}
                  selectedMeasureIds={selectedItemIds}
                  handleSelectMeasureIds={this.handleSelectItemIds}
                />
              </div>
              <div className={projectViewStyles.proposalFooter}>
                <div className={projectViewStyles.container}>
                  <div className={projectViewStyles.proposalFooterButtons}>
                    <div
                      className={projectViewStyles.proposalFooterButtonsLeft}
                    >
                      <div>
                        Check measures to include the proposal and select next.
                      </div>
                    </div>
                    <div
                      className={projectViewStyles.proposalFooterButtonsRight}
                    >
                      <button
                        type="button"
                        className={classNames(
                          projectViewStyles.button,
                          projectViewStyles.buttonSecondary
                        )}
                        onClick={() =>
                          this.handleCloseMeasureToProposal(
                            'cancel',
                            setFieldValue,
                            setFieldTouched
                          )
                        }
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className={classNames(
                          projectViewStyles.button,
                          projectViewStyles.buttonPrimary,
                          {
                            [projectViewStyles.buttonDisable]: !selectedItemIds.length
                          }
                        )}
                        disabled={!selectedItemIds.length}
                        onClick={() =>
                          this.handleCloseMeasureToProposal(
                            'okay',
                            setFieldValue,
                            setFieldTouched
                          )
                        }
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        }
        if (checkEmpty) {
          return (
            <div className={formStyles.formSectionDescription}>
              <p>Measures</p>
              <div className={projectViewStyles.proposalMeasureEmpty}>
                <div
                  className={classNames(
                    projectViewStyles.projectsNone,
                    projectViewStyles.projectsProposalNone
                  )}
                >
                  <div className={projectViewStyles.projectsNoneTitle}>
                    Add Measures To Your Proposal
                  </div>
                  <div className={projectViewStyles.projectsNoneDescription}>
                    Add new measures or select exisiting measures to include in
                    the proposal.
                  </div>
                  <div
                    className={classNames(
                      projectViewStyles.measureButton,
                      projectViewStyles.projectsNoneButtonDropdown
                    )}
                  >
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
                        <div
                          className={projectViewStyles.extrasLink}
                          onClick={this.handleOpenExistingMeasures}
                        >
                          <i className="material-icons">add</i>
                          {'Existing Measure(s)'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        }
        return (
          <div className={formStyles.formSectionDescription}>
            <p>Measures</p>
            <div>
              <div className={projectViewStyles.toolbar}>
                <ProjectSearch
                  searchValue={this.state.searchValue}
                  handleSearch={this.handleSearch}
                  placeholder={'Search for measures'}
                />
                <div className={projectViewStyles.toolButtons}>
                  <div onClick={this.handleOpenHideEdit}>
                    <i className="material-icons">settings</i> Settings
                  </div>
                </div>
              </div>
              {this.state.editingRates && (
                <div
                  className={classNames(
                    projectViewStyles.panel,
                    projectViewStyles.projectsRates
                  )}
                >
                  <ProjectRates
                    onRatesSubmit={this.onRatesSubmit}
                    hideProjectsRate={this.state.hideProjectRates}
                    initialValues={this.state.rates}
                    handleHideForm={this.handleHideForm}
                    setFieldValue={setFieldValue}
                    setFieldTouched={setFieldTouched}
                    formValues={values}
                  />
                </div>
              )}
            </div>
            <div className={formStyles.main}>
              {(this.state.reRunProjects || this.state.reCalculating) && (
                <div className={formStyles.mainRerunning}>
                  {this.state.reRunProjects && !this.state.reCalculating && (
                    <h3>
                      Re-evaluating measures after rates changed. Please wait to
                      view new outputs.
                    </h3>
                  )}
                  {!this.state.reRunProjects && this.state.reCalculating && (
                    <h3>Re-calculating total values for project.</h3>
                  )}
                  <Loader />
                </div>
              )}
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
        )
      }
      case 'Project': {
        let checkEmpty = this.checkEmptyState()
        if (showExistingMode == 'Project') {
          return (
            <div className={formStyles.formSectionDescription}>
              <p>Projects</p>
              <div className={projectViewStyles.toolbar}>
                <ProjectSearch
                  searchValue={this.state.searchExistingValue}
                  handleSearch={this.handleSearchExistingMeasure}
                  placeholder={'Search for projects'}
                />
              </div>
              <div className={formStyles.main}>
                {this.state.existingLoading && (
                  <div className={formStyles.mainRerunning}>
                    <Loader />
                  </div>
                )}
                <ProposalFormProjectPackageList
                  projectPackages={this.state.showExistingProjectPackages}
                  handleEditProject={this.handleEditProjectPackage}
                  setFieldValue={setFieldValue}
                  buildingId={this.props.building._id}
                  handleOpenDeleteConfirmationModal={
                    this.handleOpenDeletePackageConfirmationModal
                  }
                  total={this.state.total}
                  modeFrom="Proposal"
                  isCheckable={true}
                  selectedProjectPackageIds={selectedItemIds}
                  handleSelectProjectPackageIds={this.handleSelectItemIds}
                />
              </div>
              <div className={projectViewStyles.proposalFooter}>
                <div className={projectViewStyles.container}>
                  <div className={projectViewStyles.proposalFooterButtons}>
                    <div
                      className={projectViewStyles.proposalFooterButtonsLeft}
                    >
                      <div>
                        Check projects to include the proposal and select next.
                      </div>
                    </div>
                    <div
                      className={projectViewStyles.proposalFooterButtonsRight}
                    >
                      <button
                        type="button"
                        className={classNames(
                          projectViewStyles.button,
                          projectViewStyles.buttonSecondary
                        )}
                        onClick={() =>
                          this.handleCloseMeasureToProposal(
                            'cancel',
                            setFieldValue,
                            setFieldTouched
                          )
                        }
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className={classNames(
                          projectViewStyles.button,
                          projectViewStyles.buttonPrimary,
                          {
                            [projectViewStyles.buttonDisable]: !selectedItemIds.length
                          }
                        )}
                        disabled={!selectedItemIds.length}
                        onClick={() =>
                          this.handleCloseMeasureToProposal(
                            'okay',
                            setFieldValue,
                            setFieldTouched
                          )
                        }
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        }
        if (checkEmpty) {
          return (
            <div className={formStyles.formSectionDescription}>
              <p>Projects</p>
              <div className={projectViewStyles.proposalMeasureEmpty}>
                <div
                  className={classNames(
                    projectViewStyles.projectsNone,
                    projectViewStyles.projectsProposalNone
                  )}
                >
                  <div className={projectViewStyles.projectsNoneTitle}>
                    Add Projects To Your Proposal
                  </div>
                  <div className={projectViewStyles.projectsNoneDescription}>
                    Add new projects or select exisiting projects to include in
                    the proposal.
                  </div>
                  <div
                    className={classNames(
                      projectViewStyles.measureButton,
                      projectViewStyles.projectsNoneButtonDropdown
                    )}
                  >
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
                        <span> Project</span>
                      </button>
                      <div
                        className={classNames(
                          projectViewStyles.extrasDropdown,
                          projectViewStyles.extrasDropdownRight
                        )}
                      >
                        <div
                          className={projectViewStyles.extrasLink}
                          onClick={this.handleOpenAddProjectPackage}
                        >
                          <i className="material-icons">add</i>
                          {'Project'}
                        </div>
                        <div
                          className={projectViewStyles.extrasLink}
                          onClick={this.handleOpenExistingProjects}
                        >
                          <i className="material-icons">add</i>
                          {'Existing Project(s)'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        }
        return (
          <div className={formStyles.formSectionDescription}>
            <p>Projects</p>
            <div>
              <div className={projectViewStyles.toolbar}>
                <ProjectSearch
                  searchValue={this.state.searchValue}
                  handleSearch={this.handleSearch}
                  placeholder={'Search for projects'}
                />
                <div className={projectViewStyles.toolButtons}>
                  <div onClick={this.handleOpenHideEdit}>
                    <i className="material-icons">settings</i> Settings
                  </div>
                </div>
              </div>
              {this.state.editingRates && (
                <div
                  className={classNames(
                    projectViewStyles.panel,
                    projectViewStyles.projectsRates
                  )}
                >
                  <ProjectRates
                    onRatesSubmit={this.onRatesSubmit}
                    hideProjectsRate={this.state.hideProjectRates}
                    initialValues={this.state.rates}
                    handleHideForm={this.handleHideForm}
                    setFieldValue={setFieldValue}
                    setFieldTouched={setFieldTouched}
                    formValues={values}
                  />
                </div>
              )}
            </div>
            <div className={formStyles.main}>
              {(this.state.reRunProjects || this.state.reCalculating) && (
                <div className={formStyles.mainRerunning}>
                  {this.state.reRunProjects && !this.state.reCalculating && (
                    <h3>
                      Re-evaluating measures after rates changed. Please wait to
                      view new outputs.
                    </h3>
                  )}
                  {!this.state.reRunProjects && this.state.reCalculating && (
                    <h3>Re-calculating total values for project.</h3>
                  )}
                  <Loader />
                </div>
              )}
              <ProposalFormProjectPackageList
                projectPackages={projectPackagesToShow}
                handleEditProject={this.handleEditProjectPackage}
                handleDeleteProject={this.handleDeleteProjectPackage}
                setFieldValue={setFieldValue}
                buildingId={this.props.building._id}
                handleOpenDeleteConfirmationModal={
                  this.handleOpenDeletePackageConfirmationModal
                }
                total={this.state.total}
                isTotal={true}
                modeFrom="ProjectPackage"
              />
            </div>
          </div>
        )
      }
    }
  }

  render() {
    const { mode, proposalTemplateList } = this.props
    const { currentProposal, loading } = this.state

    let fieldValues = (currentProposal && currentProposal.fieldValues) || {}

    let initialValues = {
      _id: (currentProposal && currentProposal._id) || 'New',
      name: (currentProposal && currentProposal.name) || '',
      proposalTemplate: (currentProposal && currentProposal.template) || '',
      projects: (currentProposal && currentProposal.projects) || [],
      projectPackages:
        (currentProposal && currentProposal.projectPackages) || [],
      comments: (currentProposal && currentProposal.comments) || '',
      images: (currentProposal && currentProposal.images) || [],
      ...fieldValues
    }

    let submitText

    switch (mode) {
      case 'addProposal':
        submitText = 'Add Proposal'
        break
      case 'copyProposal':
        submitText = 'Copy Proposal'
        break
      case 'editProposal':
        submitText = 'Update Proposal'
        break
    }

    let proposalTemplateOptions =
      (proposalTemplateList &&
        proposalTemplateList.map(item => {
          return {
            value: item._id,
            name: item.name
          }
        })) ||
      []

    let index = 0
    return (
      <div className={styles.formWrapper}>
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validate={values => this.validateForm(values)}
          ref={node => (this.formikRef = node)}
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
            let selectedProposalTemplate = _.find(proposalTemplateList, {
              _id: values.proposalTemplate
            })
            let fields =
              (selectedProposalTemplate && selectedProposalTemplate.fields) ||
              []
            let allFields = []
            for (let field of fields) {
              if (field.subFields && field.subFields.length > 0) {
                allFields = [...allFields, ...field.subFields]
              }
            }
            let index =
              allFields.filter(text => text.type === 'Text').length || 0

            return (
              <Form className={styles.form}>
                <div className={styles.assetForm}>
                  <FormSection
                    title="Details"
                    description="Add basic information about your proposal"
                  >
                    <FieldSelect
                      label="Proposal Template"
                      component="select"
                      name="proposalTemplate"
                      data-test="Proposal Template"
                      placeholder="Select"
                      onChange={e =>
                        this.handleChooseTemplate(
                          e,
                          setFieldValue,
                          setValues,
                          values
                        )
                      }
                    >
                      <option defaultValue value="" disabled>
                        Select
                      </option>
                      {proposalTemplateOptions.map(({ name, value }) => (
                        <option key={`status-option-${value}`} value={value}>
                          {name}
                        </option>
                      ))}
                    </FieldSelect>
                    <br />
                    {values.proposalTemplate &&
                      this.renderDetails(
                        values,
                        setFieldTouched,
                        setFieldValue,
                        setValues
                      )}
                  </FormSection>
                  {values.proposalTemplate &&
                    this.renderTemplates(
                      values,
                      setFieldTouched,
                      setFieldValue,
                      setValues
                    )}
                  {values.proposalTemplate && this.renderNewButton()}
                  <br /> <br /> <br />
                  {values.proposalTemplate &&
                    this.renderBody(values, setFieldValue, setFieldTouched)}
                  {values.proposalTemplate && (
                    <UserFeature name="docuSign">
                      {({ enabled }) => {
                        if (!enabled) return null
                        return (
                          <UserFeature name="docuSign">
                            {({ enabled }) => {
                              if (!enabled) return null
                              return (
                                <div
                                  className={
                                    projectFormStyles.projectFormSection
                                  }
                                >
                                  <div
                                    className={
                                      projectFormStyles.projectFormSectionDescription
                                    }
                                  >
                                    <p>DocuSign</p>
                                    <span>
                                      Get eSignatures using your DocuSign
                                      templates in buildee.
                                    </span>
                                  </div>
                                  <div
                                    className={
                                      projectFormStyles.projectFormSectionInputs
                                    }
                                  >
                                    <DocuSignSection
                                      id={
                                        (this.props.proposal &&
                                          this.props.proposal._id) ||
                                        ''
                                      }
                                      modeFrom="proposal"
                                    />
                                  </div>
                                </div>
                              )
                            }}
                          </UserFeature>
                        )
                      }}
                    </UserFeature>
                  )}
                  {values.proposalTemplate && (
                    <FormSection
                      title="Comments"
                      description="Add comments related to the proposal"
                    >
                      <Field
                        label="Comments"
                        component="textarea"
                        name="comments"
                        data-test="schedule-comments"
                        placeholder="Add comments about proposal"
                        onChange={event =>
                          this.handleChanged({
                            event,
                            setFieldValue,
                            field: 'comments'
                          })
                        }
                      />
                    </FormSection>
                  )}
                  {/* {values.proposalTemplate && (
                    <FormSection
                      title="Images"
                      description="Take photos or import images related to this proposal. Note images are compressed."
                    >
                      <ImagesField
                        images={
                          values.images &&
                          values.images.reduce((acc, image) => {
                            let url = new URL(image)
                            return Object.assign(acc, {
                              [url.pathname]: {
                                uploadUrl: url.href,
                                preview: url.href
                              }
                            })
                          }, {})
                        }
                        onFieldUpdate={images => {
                          setFieldValue(
                            'images',
                            Object.keys(images).map(k => images[k].uploadUrl)
                          )
                        }}
                      />
                    </FormSection>
                  )} */}
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
                      modeFrom="Proposal"
                    />
                  )}
                {this.state.modalOpen &&
                  this.state.modalView === 'deletePackageConfirmation' && (
                    <DeleteConfirmationModal
                      title={this.state.currentProjectPackage.name}
                      confirmationFunction={() =>
                        this.handleDeleteProjectPackage(
                          this.state.currentProjectPackage._id,
                          setFieldValue
                        )
                      }
                      onClose={this.handleCloseAddProjectPackage}
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
                {this.state.modalOpen &&
                  this.state.modalView === 'projectPackageModal' && (
                    <ProjectPackagesModal
                      building={this.props.building}
                      onClose={this.handleCloseAddProjectPackage}
                      projectPackage={this.state.currentProjectPackage}
                      endUse={this.props.endUse}
                      utilityMetrics={this.props.utilityMetrics}
                      buildingEquipment={this.props.buildingEquipment}
                      user={this.props.user}
                      viewMode={this.state.viewMode}
                      index={index}
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
  createProposal,
  updateProposal,
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
  bulkAddProjects,
  getOrgProposalTemplates,
  getProjectPackages
}

const mapStateToProps = state => ({
  products: (state.login.user && state.login.user.products) || {},
  proposalTemplateList:
    (state.proposalTemplate && state.proposalTemplate.templateList) || [],
  organizationView: state.organization.organizationView || {},
  projects:
    (state.building &&
      state.building.buildingView &&
      state.building.buildingView.projects) ||
    null,
  projectPackages:
    (state.building &&
      state.building.buildingView &&
      state.building.buildingView.projectPackages) ||
    null
})

export default connect(mapStateToProps, mapDispatchToProps)(ProposalForm)
