import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import _ from 'lodash'
import { connect } from 'react-redux'
import styles from './PortfolioProposalForm.scss'
import formFieldStyles from '../FormFields/Field.module.scss'
import projectViewStyles from '../../../components/Project/ProjectView.scss'
import formStyles from '../ProjectForms/ProjectPackageForm.scss'
import portfolioContainerStyles from '../../../components/Portfolio/PortfolioContainer.scss'
import { ProjectRates, ProjectSearch } from '../../../components/Project'
import { Footer } from '../../../components/UI/Footer'
import DeleteConfirmationModal from '../../Modal/DeleteConfirmationModal'
import TextQuillEditor from '../../../components/UI/TextEditor/TextQuillEditor'
import { Formik, Field, Form } from 'formik'
import { FormSection, Field as FieldSelect, ImagesField } from '../FormFields'
import { Loader } from 'utils/Loader'
import { multiSelectChecker } from 'utils/Portfolio'
import PortfolioProposalProjectTable from '../../../components/UI/PortfolioTables/PortfolioProposalProjectTable'
import PortfolioProposalProjectPackageTable from 'components/UI/PortfolioTables/PortfolioProposalProjectPackageTable'
import {
  getPortfolioProjects,
  getPortfolioProjectPackages,
  createPortfolioProposal,
  updatePortfolioProposal,
  getPortfolioProjectsRefetch
} from '../../../routes/Portfolio/modules/portfolio'
import { getOrgProposalTemplates } from '../../../routes/ProposalTemplate/modules/proposalTemplate'
import {
  defaultProjectColumn,
  defaultProjectPackageColumn
} from 'utils/PortfolioOptions'

import { PortfolioProposalMeasureModal } from 'containers/Modal'

class PortfolioProposalForm extends Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    proposal: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    mode: PropTypes.oneOf(['addProposal', 'editProposal']).isRequired,
    selectedMeasuresIds: PropTypes.array,
    selectedProjectIds: PropTypes.array,
    proposalMode: PropTypes.string,
    buildingLevel: PropTypes.bool
  }

  state = {
    currentProposal: this.props.proposal,
    orgId: this.props.orgId,
    originProjects: (this.props.proposal && this.props.proposal.projects) || [],
    projectsToShow: (this.props.proposal && this.props.proposal.projects) || [],
    editingRates: false,
    originProjectPackages:
      (this.props.proposal && this.props.proposal.projectPackages) || [],
    projectPackagesToShow:
      (this.props.proposal && this.props.proposal.projectPackages) || [],
    proposalMode:
      this.props.proposalMode ||
      (this.props.proposal && this.props.proposal.mode) ||
      'Measure',
    loading: false,
    showExtras: false,
    showExtrasNone: false,
    selectedItemIds: [],
    existingLoading: false,
    existingProjects: this.props.projects || [],
    existingProjectPackages: this.props.projectPackages || [],
    showExistingProjects: this.props.projects || [],
    showExistingProjectPackages: this.props.projectPackages || [],
    isCheckable: false,
    searchValue: '',
    searchExistingValue: '',
    height: window.innerHeight,
    selectedMeasureId: null,
    selectedBuildingId: null
  }

  componentDidMount() {
    let { proposalMode, orgId } = this.state
    let {
      organizationView,
      mode,
      selectedMeasures = [],
      selectedProjects = []
    } = this.props
    if (!orgId) {
      orgId = organizationView && organizationView._id
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
        }
      }
    }

    // get organization proposal templates
    this.props.getOrgProposalTemplates(orgId)

    if (proposalMode === 'Measure') {
      if (!this.props.projects.length) {
        this.setState({ existingLoading: true })
        this.props
          .getPortfolioProjects(orgId)
          .then(() => {
            this.setState({ existingLoading: false })
          })
          .catch(() => {
            this.setState({ existingLoading: false })
          })
      } else {
        let { existingProjects } = this.state
        existingProjects = existingProjects.filter(
          project =>
            (project && project.organization && project.organization._id) ===
            orgId
        )
        this.setState({
          existingProjects,
          showExistingProjects: existingProjects
        })
      }
    } else if (proposalMode === 'Project') {
      if (!this.props.projectPackages.length) {
        this.setState({ existingLoading: true })
        this.props
          .getPortfolioProjectPackages(orgId)
          .then(() => {
            this.setState({ existingLoading: false })
          })
          .catch(() => {
            this.setState({ existingLoading: false })
          })
      } else {
        let { existingProjectPackages } = this.state
        existingProjectPackages = existingProjectPackages.filter(
          project =>
            (project && project.organization && project.organization._id) ===
            orgId
        )
        this.setState({
          existingProjectPackages,
          showExistingProjectPackages: existingProjectPackages
        })
      }
    }

    document.addEventListener('mousedown', this.handleClick, false)
    window.addEventListener('resize', this.resize)
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClick, false)
    window.removeEventListener('resize', this.resize)
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    let { orgId } = this.state
    let { organizationView } = nextProps
    if (!orgId) {
      orgId = organizationView && organizationView._id
    }
    if (
      this.state.proposalMode === 'Measure' ||
      JSON.stringify(this.props.projects) !== JSON.stringify(nextProps.projects)
    ) {
      let existingProjects = [...nextProps.projects]
      existingProjects = existingProjects.filter(
        project =>
          (project && project.organization && project.organization._id) ===
          orgId
      )
      this.setState({
        existingProjects: existingProjects || [],
        showExistingProjects: existingProjects || []
      })
    }

    if (
      this.state.proposalMode === 'Project' ||
      JSON.stringify(this.props.projectPackages) !==
        JSON.stringify(nextProps.projectPackages)
    ) {
      let existingProjectPackages = [...nextProps.projectPackages]
      existingProjectPackages = existingProjectPackages.filter(
        project =>
          (project && project.organization && project.organization._id) ===
          orgId
      )
      this.setState({
        existingProjectPackages: existingProjectPackages || [],
        showExistingProjectPackages: existingProjectPackages || []
      })
    }
  }

  resize = () => {
    this.setState({ height: window.innerHeight })
  }

  handleClick = e => {
    if (this.state.showExtras) {
      if (this.node && this.node.contains(e.target)) return
      this.setState({ showExtras: false })
    }
  }

  validateForm = values => {
    let errors = {}
    if (values.name.length === 0) {
      errors.name = 'Name is required'
    }

    return errors
  }

  handleClose = () => {
    this.props.onClose()
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
        if (field.title !== 'Proposal Name') {
          fieldValues[field.title] = updatedValues[field.title]
          delete updatedValues[field.title]
        } else {
          fieldValues[field.title] = updatedValues.name
        }
      })
    }

    let buildingIds = []
    if (this.props.buildingId) {
      buildingIds = [this.props.buildingId]
    } else {
      if (proposalMode === 'Measure') {
        for (let project of values.projects) {
          let buildingId = project.building_id
          buildingIds = [...buildingIds, buildingId]
        }
      } else {
        for (let project of values.projectPackages) {
          let buildingId = project.buildingid
          buildingIds = [...buildingIds, buildingId]
        }
      }
      buildingIds = buildingIds.filter(id => !!id)
      buildingIds = [...new Set(buildingIds)]
    }

    updatedValues['fieldValues'] = Object.assign({}, fieldValues)
    updatedValues['fields'] = templateFields
    updatedValues['organizaiton'] =
      this.state.orgId ||
      (this.props.organizationView && this.props.organizationView._id)
    updatedValues['buildingIds'] = buildingIds
    updatedValues['mode'] =
      proposalMode === 'Measure' || proposalMode === 'PortfolioMeasure'
        ? 'PortfolioMeasure'
        : 'PortfolioProject'

    updatedValues['rates'] = rates
    switch (mode) {
      case 'addProposal':
        {
          await this.props.createPortfolioProposal(updatedValues)
        }
        break
      case 'editProposal':
        {
          await this.props.updatePortfolioProposal(
            this.props.proposal._id,
            updatedValues
          )
        }
        break
      default:
        break
    }
    return onClose()
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

  handleChanged = ({ event, setFieldValue, field }) => {
    setFieldValue(field, event.target.value)
  }

  handleDescriptionChange = (key, html, setFieldValue) => {
    setFieldValue(key, html)
  }

  handleToggleExtras = () => {
    this.setState(prevState => ({
      showExtras: !prevState.showExtras,
      showExistingMode: '',
      searchExistingValue: ''
    }))
  }

  handleOpenDeleteConfirmationModal = project => {
    this.setState({
      modalOpen: true,
      modalView: 'deleteConfirmation',
      currentProject: project
    })
  }

  handleOpenDeletePackageConfirmationModal = projectPackage => {
    this.setState({
      modalOpen: true,
      modalView: 'deletePackageConfirmation',
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

  getQuillIndex = values => {
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
    fields = fields
      .filter(field => field.title !== 'Proposal Name')
      .filter(field => field.type === 'Text')
    return fields.length + 5
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
    const quillIndex = this.getQuillIndex(values)

    switch (proposalMode) {
      case 'Measure': {
        let checkEmpty = this.checkEmptyState()
        let maxLength = (this.state.height - 420) / 60
        maxLength = Math.max(Math.trunc(maxLength), 0)
        if (showExistingMode == 'Measure') {
          let length =
            this.state.showExistingProjects.length >= maxLength
              ? maxLength
              : this.state.showExistingProjects.length
          let height = (length + 2) * 60
          if (navigator.appVersion.indexOf('Win') != -1) height += 17
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
                <div className={classNames(portfolioContainerStyles.panel)}>
                  <div style={{ marginBottom: `${height}px` }}>
                    <div className={classNames(portfolioContainerStyles.panel)}>
                      <PortfolioProposalProjectTable
                        projects={this.state.showExistingProjects}
                        columns={defaultProjectColumn}
                        user={this.props.user}
                        sortOption={{}}
                        filterList={[]}
                        pushFunc={() => {}}
                        sortFunc={() => {}}
                        loading={this.state.existingLoading}
                        updateOrganization={() => {}}
                        updateBuildingTab={() => {}}
                        updateProjectViewTab={() => {}}
                        updateBuildingViewMode={() => {}}
                        isCheckable={true}
                        handleSelectItems={this.handleSelectItemIds}
                        selectedItems={selectedItemIds}
                        handleOpenMeasure={this.handleOpenMeasure}
                      />
                    </div>
                  </div>
                </div>
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

        let length =
          projectsToShow.length >= maxLength ? maxLength : projectsToShow.length
        let height = (length + 2) * 60
        if (navigator.appVersion.indexOf('Win') != -1) height += 17
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
              <div className={classNames(portfolioContainerStyles.panel)}>
                <div style={{ marginBottom: `${height}px` }}>
                  <div className={classNames(portfolioContainerStyles.panel)}>
                    <PortfolioProposalProjectTable
                      projects={projectsToShow}
                      columns={defaultProjectColumn}
                      user={this.props.user}
                      sortOption={{}}
                      filterList={[]}
                      pushFunc={() => {}}
                      sortFunc={() => {}}
                      loading={this.state.existingLoading}
                      updateOrganization={() => {}}
                      updateBuildingTab={() => {}}
                      updateProjectViewTab={() => {}}
                      updateBuildingViewMode={() => {}}
                      isCheckable={false}
                      handleSelectItems={this.handleSelectItemIds}
                      selectedItems={selectedItemIds}
                      handleOpenMeasure={this.handleOpenMeasure}
                    />
                  </div>
                </div>
              </div>
              {this.state.selectedMeasureId && (
                <PortfolioProposalMeasureModal
                  handleCloseAddProjects={this.close}
                  id={this.state.selectedMeasureId}
                  buidlingId={this.state.selectedBuildingId}
                  index={quillIndex}
                />
              )}
            </div>
          </div>
        )
      }
      case 'Project': {
        let checkEmpty = this.checkEmptyState()
        let maxLength = (this.state.height - 420) / 60
        maxLength = Math.max(Math.trunc(maxLength), 0)
        if (showExistingMode == 'Project') {
          let length =
            this.state.showExistingProjects.length >= maxLength
              ? maxLength
              : this.state.showExistingProjects.length
          let height = (length + 2) * 60
          if (navigator.appVersion.indexOf('Win') != -1) height += 17
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
                <div className={classNames(portfolioContainerStyles.panel)}>
                  <div style={{ marginBottom: `${height}px` }}>
                    <div className={classNames(portfolioContainerStyles.panel)}>
                      <PortfolioProposalProjectPackageTable
                        projectPackages={this.state.showExistingProjectPackages}
                        columns={defaultProjectPackageColumn}
                        user={this.props.user}
                        sortOption={{}}
                        filterList={[]}
                        pushFunc={() => {}}
                        sortFunc={() => {}}
                        loading={this.state.existingLoading}
                        updateOrganization={() => {}}
                        updateBuildingTab={() => {}}
                        updateProjectViewTab={() => {}}
                        updateBuildingViewMode={() => {}}
                        isCheckable={true}
                        handleSelectItems={this.handleSelectItemIds}
                        selectedItems={selectedItemIds}
                      />
                    </div>
                  </div>
                </div>
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

        let length =
          projectPackagesToShow.length >= maxLength
            ? maxLength
            : projectPackagesToShow.length
        let height = (length + 2) * 60
        if (navigator.appVersion.indexOf('Win') != -1) height += 17
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
              <div className={classNames(portfolioContainerStyles.panel)}>
                <div style={{ marginBottom: `${height}px` }}>
                  <div className={classNames(portfolioContainerStyles.panel)}>
                    <PortfolioProposalProjectPackageTable
                      projectPackages={projectPackagesToShow}
                      columns={defaultProjectPackageColumn}
                      user={this.props.user}
                      sortOption={{}}
                      filterList={[]}
                      pushFunc={() => {}}
                      sortFunc={() => {}}
                      loading={this.state.existingLoading}
                      updateOrganization={() => {}}
                      updateBuildingTab={() => {}}
                      updateProjectViewTab={() => {}}
                      updateBuildingViewMode={() => {}}
                      isCheckable={false}
                      handleSelectItems={this.handleSelectItemIds}
                      selectedItems={selectedItemIds}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }
    }
  }

  handleOpenMeasure = id => {
    const { projectsToShow, showExistingMode } = this.state
    if (!showExistingMode) {
      const project = _.find(projectsToShow, { _id: id })
      this.setState({
        selectedMeasureId: id,
        selectedBuildingId: project.building_id
      })
    }
  }

  close = () => {
    const { projectsToShow } = this.state
    let ids = projectsToShow.map(item => item._id)
    this.setState({
      selectedMeasureId: null,
      selectedBuildingId: null
    })
    this.setState({ existingLoading: true })
    this.props
      .getPortfolioProjectsRefetch(ids)
      .then(res => {
        this.setState({ existingLoading: false, projectsToShow: res.projects })
      })
      .catch(() => {
        this.setState({ existingLoading: false })
      })
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

    return (
      <div className={styles.formWrapper}>
        <Formik
          enableReinitialize
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
                    onClick={this.handleClose}
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
              </Form>
            )
          }}
        </Formik>
      </div>
    )
  }
}

const mapDispatchToProps = {
  getPortfolioProjects,
  getPortfolioProjectPackages,
  getOrgProposalTemplates,
  createPortfolioProposal,
  updatePortfolioProposal,
  getPortfolioProjectsRefetch
}

const mapStateToProps = (state, ownProps) => ({
  products: (state.login.user && state.login.user.products) || {},
  user: state.login.user || {},
  proposalTemplateList:
    (state.proposalTemplate && state.proposalTemplate.templateList) || [],
  projects: (state.portfolio.dashboard.existingProjects || []).filter(item => {
    if (ownProps.buildingId) return item.buildingid === ownProps.buildingId
    return true
  }),
  projectPackages: (
    state.portfolio.dashboard.existingProjectPackages || []
  ).filter(item => {
    if (ownProps.buildingId) return item.buildingid === ownProps.buildingId
    return true
  }),
  organizationView: state.organization.organizationView || {}
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PortfolioProposalForm)
