import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Query } from 'react-apollo'
import { Loader } from 'utils/Loader'
import styles from './ProjectView.scss'
import {
  ProjectsModal,
  ProjectPackagesModal,
  MeasurePackagesModal,
  ProposalModal
} from '../../containers/Modal'
import {
  ProjectSearch,
  ProjectList,
  ProjectRates,
  EAProjectList,
  ProjectPackageList,
  ProposalList
} from './'
import DeleteConfirmationModal from '../../containers/Modal/DeleteConfirmationModal'
import { GET_BUILDING_EQUIPMENT_LIST } from '../../utils/graphql/queries/equipment'
import {
  GET_BUILDING_OPERATIONS,
  REMOVE_BUILDING_OPERATION
} from '../../utils/graphql/queries/operation.js'
import { multiSelectChecker } from 'utils/Portfolio'
import UserFeature from '../../utils/Feature/UserFeature'
import { ENABLED_FEATURES } from '../../utils/graphql/queries/user'
import { ConstructionFields } from 'utils/ReportOptions'
import { isProdEnv } from 'utils/Utils'

export class ProjectView extends React.Component {
  static propTypes = {
    building: PropTypes.object.isRequired,
    getProjectsAndMeasures: PropTypes.func.isRequired,
    evaluateProject: PropTypes.func.isRequired,
    createOrganizationProject: PropTypes.func.isRequired,
    editOrganizationProject: PropTypes.func.isRequired,
    addIncompleteProject: PropTypes.func.isRequired,
    editBuilding: PropTypes.func.isRequired,
    deleteProject: PropTypes.func.isRequired,
    uploadProjectImage: PropTypes.func.isRequired,
    getOrganizationProjects: PropTypes.func.isRequired,
    deleteOrganizationProject: PropTypes.func.isRequired,
    getOrganizationName: PropTypes.func.isRequired,
    bulkAddProjects: PropTypes.func.isRequired,
    reRunProjects: PropTypes.bool.isRequired,
    getUserById: PropTypes.func.isRequired,
    changeReRunProjects: PropTypes.func.isRequired,
    getProjectPackages: PropTypes.func.isRequired,
    deleteProjectPackage: PropTypes.func.isRequired,
    getMeasures: PropTypes.func.isRequired,
    addIncompletePackageProject: PropTypes.func.isRequired,
    updateProjectViewTab: PropTypes.func.isRequired,
    selectedProjectView: PropTypes.object.isRequired,
    deleteBulkMeasureForProject: PropTypes.func.isRequired,
    getProposals: PropTypes.func.isRequired,
    deleteProposal: PropTypes.func.isRequired
  }

  state = {
    modalOpen: false,
    modalView: null,
    editingProject: false,
    editingRates: false,
    projectsToShow: [],
    currentProject: {},
    currentMeasurePackage: {},
    matchingEaMeasures: [],
    showingEaMeasures: [],
    searchMeasureValue: '',
    searchProjectValue: '',
    searchPropoalValue: '',
    eaAudit: {},
    gettingEaAudits: true,
    hideProjectRates: true,
    reRunProjects: false,
    tabs: [
      { name: 'Measures', active: true, featureFlag: 'buildingProjects' },
      { name: 'Proposals', active: true, featureFlag: 'projectProposal' },
      { name: 'Projects', active: true, featureFlag: 'projectProject' }
    ],
    projectPackages: [],
    projectPackageLoading: false,
    currentPackage: {},
    viewMode: '',
    showExtras: false,
    showExtrasNone: false,

    //proposal part
    proposals: [],
    selectedMeasureIds: [],
    currentProposal: {},
    proposalLoading: false,
    isCheckable: false,
    proposalMode: ''
  }

  UNSAFE_componentWillMount() {
    document.addEventListener('mousedown', this.handleClick, false)
  }

  componentDidMount = () => {
    if (this.props.building._id) {
      this.getProjectsAndMeasures()
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.building.eaAudit !== this.props.building.eaAudit) {
      if (nextProps.building._id) {
        this.getProjectsAndMeasures()
      }
    }
  }

  componentWillUnmount = () => {
    document.removeEventListener('mousedown', this.handleClick, false)
    this.setState({ showExtras: false })
  }

  getEaAudit = () => {
    const { building } = this.props
    if (
      building &&
      building.eaAudit &&
      building.eaAudit.constructor === Object &&
      Object.keys(building.eaAudit).length !== 0
    ) {
      const { eaAudit } = this.props.building
      this.setState({ gettingEaAudits: true })
      if (eaAudit && eaAudit.measures) {
        let tempMatchingEaMeasures = []
        Object.keys(eaAudit.measures).map(eaMeasure => {
          let measure = eaAudit.measures[eaMeasure]
          let measureName = eaAudit.measures[eaMeasure].name
          // only if a measure coming from pro has a name that matches anything within the measures library
          // then we'll add it to the buildee library
          if (building.measures && building.measures.length > 0) {
            building.measures.map(buildeeMeasure => {
              if (buildeeMeasure.displayName === measureName) {
                tempMatchingEaMeasures.push({
                  measure,
                  buildeeMeasure,
                  measureName
                })
              }
            })
          }
        })
        if (tempMatchingEaMeasures.length > 0) {
          tempMatchingEaMeasures.map((matchingMeasure, index) => {
            if (matchingMeasure.measure && matchingMeasure.measure.references) {
              Object.keys(matchingMeasure.measure.references).map(component => {
                let componentType = component

                if (
                  Object.prototype.toString.call(
                    matchingMeasure.measure.references[component]
                  ) === '[object Array]'
                ) {
                  matchingMeasure.measure.references[component].map(
                    componentId => {
                      if (eaAudit && eaAudit[componentType]) {
                        eaAudit[componentType][componentId].id = componentId
                        if (!tempMatchingEaMeasures[index].eaComponents) {
                          tempMatchingEaMeasures[index].eaComponents = []
                        }
                        tempMatchingEaMeasures[index].eaComponents.push(
                          eaAudit[componentType][componentId]
                        )
                      }
                    }
                  )
                } else {
                  Object.keys(
                    matchingMeasure.measure.references[component]
                  ).map(componentKey => {
                    let componentId =
                      matchingMeasure.measure.references[component][
                        componentKey
                      ]
                    eaAudit[componentType][componentId].id = componentId
                    if (!tempMatchingEaMeasures[index].eaComponents) {
                      tempMatchingEaMeasures[index].eaComponents = []
                    }
                    tempMatchingEaMeasures[index].eaComponents.push(
                      eaAudit[componentType][componentId]
                    )
                  })
                }
              })
            }
          })
        }
        let anotherTempArr = []
        let projectNames = []
        this.props.building.projects.map(existingProject => {
          let tempProject = { displayName: existingProject.displayName }
          if (existingProject.eaDisplayName) {
            tempProject.eaDisplayName = existingProject.eaDisplayName
          }
          projectNames.push(tempProject)
        })

        tempMatchingEaMeasures.map((matchingMeasure, index) => {
          if (matchingMeasure.eaComponents) {
            matchingMeasure.eaComponents.map((component, index) => {
              projectNames.map(existingProject => {
                if (
                  existingProject.displayName ===
                    component.name + ' - ' + matchingMeasure.measure.name &&
                  existingProject.eaDisplayName === matchingMeasure.measureName
                ) {
                  matchingMeasure.eaComponents.splice(index, 1)
                }
              })
            })
            anotherTempArr.push(matchingMeasure)
          } else {
            anotherTempArr.push(matchingMeasure)
          }
        })
        this.setState({
          matchingEaMeasures: anotherTempArr,
          showingEaMeasures: anotherTempArr,
          eaAudit: eaAudit,
          gettingEaAudits: false
        })
      } else {
        this.setState({ gettingEaAudits: false })
      }
    } else {
      this.setState({ gettingEaAudits: false })
    }
  }

  getProjectsAndMeasures = async () => {
    const { selectedProjectView } = this.props
    if (selectedProjectView.name === 'Projects') {
      try {
        this.setState({ projectPackageLoading: true })
        let packages = await this.props.getProjectPackages(
          this.props.building._id
        )
        this.setState({
          projectPackages: packages,
          projectPackageLoading: false
        })
      } catch (err) {
        console.log(err)
        this.setState({
          projectPackageLoading: false
        })
      }
    } else if (selectedProjectView.name === 'Proposals') {
      try {
        this.setState({ proposalLoading: true })
        let proposals = await this.props.getProposals(this.props.building._id)
        this.setState({
          proposals: proposals,
          proposalLoading: false
        })
      } catch (err) {
        console.log(err)
        this.setState({
          proposalLoading: false
        })
      }
    } else {
      try {
        await this.getMeasures()
      } catch (err) {
        console.log(err)
      }
    }
  }

  getMeasures = () => {
    this.props
      .getProjectsAndMeasures(this.props.building._id)
      .then(() => {
        this.setState({ projectsToShow: this.props.building.projects })
        this.getEaAudit()
        if (
          this.props.reRunProjects &&
          this.props.building.projects.length > 0
        ) {
          //rerun all projects if flag is set
          this.setState({ reRunProjects: true })
          this.handleRerunProjects()
            .then(() => {
              this.props
                .getProjectsAndMeasures()
                .then(() => {
                  this.props.changeReRunProjects(false)
                  this.setState({ reRunProjects: false })
                })
                .catch(() => {
                  this.props.changeReRunProjects(false)
                  this.setState({ reRunProjects: false })
                })
            })
            .catch(() => {
              this.props.changeReRunProjects(false)
              this.setState({ reRunProjects: false })
            })
        }
      })
      .catch(err => {
        console.log(err)
      })
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

  getDescendantPropWithDotNotation = (obj, desc) => {
    var arr = desc.split('.')
    while (arr.length && obj) {
      obj = obj[arr.shift()]
    }
    return obj
  }

  handleAddEaProject = (eaMeasure, component, index) => {
    let currentProject = eaMeasure.buildeeMeasure
    currentProject.isEditing = false

    if (component) {
      currentProject.displayName =
        component.name + ' - ' + eaMeasure.measure.name
    } else {
      currentProject.displayName = eaMeasure.measure.name
    }

    currentProject.initialValues = { location: [] }

    let counter = 0

    currentProject.fields.map(field => {
      if (field.firebase_input && component) {
        const fieldPath = field.firebase_input.substring(
          field.firebase_input.indexOf('${refId}') + 9
        )
        const fieldPathArr = fieldPath.split('.')
        const type = field.firebase_input.substr(
          0,
          field.firebase_input.indexOf('.')
        )

        if (
          this.state.eaAudit &&
          this.state.eaAudit[type] &&
          this.state.eaAudit[type][component.id]
        ) {
          if (
            this.state.eaAudit[type][component.id].references &&
            this.state.eaAudit[type][component.id].references.levels &&
            counter === 0
          ) {
            Object.keys(
              this.state.eaAudit[type][component.id].references.levels
            ).map(levelId => {
              if (levelId) {
                currentProject.initialValues.location.push(
                  this.state.eaAudit.levels[levelId].displayName
                )
              }
            })
          }
          if (
            this.state.eaAudit[type][component.id].references &&
            this.state.eaAudit[type][component.id].references.spaces &&
            counter === 0
          ) {
            Object.keys(
              this.state.eaAudit[type][component.id].references.spaces
            ).map(spaceId => {
              if (spaceId) {
                currentProject.initialValues.location.push(
                  this.state.eaAudit.spaces[spaceId].displayName
                )
              }
            })
          }

          counter += 1

          if (fieldPathArr[0] === 'quantity') {
            let toSum = []
            if (this.state.eaAudit[type][component.id].references) {
              if (this.state.eaAudit[type][component.id].references.building) {
                toSum.push(
                  this.state.eaAudit.instances[type][component.id].quantity
                )
              }
              if (this.state.eaAudit[type][component.id].references.levels) {
                Object.keys(
                  this.state.eaAudit[type][component.id].references.levels
                ).map(levelId => {
                  if (levelId) {
                    toSum.push(
                      this.state.eaAudit.levels[levelId][type][component.id]
                        .quantity
                    )
                  }
                })
              }
              if (this.state.eaAudit[type][component.id].references.spaces) {
                Object.keys(
                  this.state.eaAudit[type][component.id].references.spaces
                ).map(levelId => {
                  if (levelId) {
                    toSum.push(
                      this.state.eaAudit.spaces[levelId][type][component.id]
                        .quantity
                    )
                  }
                })
              }
            }
            var sum = toSum.reduce((a, b) => a + b, 0)
            currentProject.initialValues[field.name] = parseFloat(sum)
          } else {
            const value = this.getDescendantPropWithDotNotation(
              component,
              fieldPath
            )
            // if the value exists in the aduit
            if (value) {
              currentProject.initialValues[field.name] = parseFloat(value)
            }
          }
        }
      }
    })
    currentProject.eaDisplayName = eaMeasure.measure.name
    currentProject.dataAlreadyFromEA = true

    if (eaMeasure.measure && eaMeasure.measure.comment) {
      currentProject.initialValues['comment'] = eaMeasure.measure.comment
    }

    currentProject.initialValues['displayName'] = currentProject.displayName
    currentProject.initialValues['description'] = currentProject.description

    this.setState({
      modalOpen: true,
      modalView: 'projectModal',
      editingProject: false,
      currentProject
    })
  }

  handleOpenDeleteConfirmationModal = project => {
    this.setState({
      modalOpen: true,
      modalView: 'deleteConfirmation',
      currentProject: project
    })
  }

  handleDeleteProject = project => {
    let collectionTarget = project.collectionTarget || 'measure'
    if (collectionTarget === 'measure') {
      this.props
        .deleteProject(project._id, this.props.building._id)
        .then(() => {
          this.getProjectsAndMeasures()
        })
        .catch(err => {})
    } else {
      this.props
        .deleteMeasurePackage(project._id, this.props.building._id)
        .then(() => {
          this.getProjectsAndMeasures()
        })
        .catch(err => {})
    }
    this.handleCloseAddProjects()
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

  handleEditProjectPackage = project => {
    project.isEditing = true
    this.setState({
      modalOpen: true,
      viewMode: 'editProjectPackage',
      modalView: 'projectPackageModal',
      currentPackage: project
    })
  }

  handleOpenDeletePackageConfirmationModal = project => {
    this.setState({
      modalOpen: true,
      modalView: 'deletePackageConfirmation',
      currentPackage: project
    })
  }

  handleDeleteProjectPackage = projectId => {
    this.props
      .deleteProjectPackage(projectId, this.props.building._id)
      .then(() => {
        this.getProjectsAndMeasures()
      })
      .catch(err => {})

    this.handleCloseAddProjectPackages()
  }

  //only handling rates currently needs to be refactored
  onRatesSubmit = async values => {
    const { building } = this.props
    const { projectsToShow } = this.state
    if (projectsToShow.length) {
      this.setState({ reRunProjects: true })

      // update only finance rates
      let modifiedRates = { ...values }
      modifiedRates.financeRate = parseFloat(values.financeRate)
      modifiedRates.discountRate = parseFloat(values.discountRate) || 2.5
      modifiedRates.reinvestmentRate = parseFloat(values.reinvestmentRate)
      modifiedRates.inflationRate = parseFloat(values.inflationRate) || 0.5
      modifiedRates.investmentPeriod = parseFloat(values.investmentPeriod) || 10

      let fieldsEdited =
        (building.projectRates && building.projectRates.fieldsEdited) || []
      // check updated rates
      let keys = [
        'electric',
        'gas',
        'fuelOil2',
        'steam',
        'water',
        'other',
        'fuelOil2',
        'fuelOil4',
        'fuelOil56',
        'diesel'
      ]
      for (let key of keys) {
        if (fieldsEdited.indexOf(key) !== -1) continue
        if (modifiedRates[key] != building.projectRates[key])
          fieldsEdited.push(key)
      }
      modifiedRates.fieldsEdited = fieldsEdited
      let payload = { projectRates: modifiedRates }
      try {
        await this.props.editBuilding(payload, this.props.building._id, true)
        this.setState({ editingRates: false })
        if (this.state.projectsToShow && this.state.projectsToShow.length > 0) {
          await this.handleRerunProjects()
          const packages = await this.props.getProjectPackages(
            this.props.building._id
          )
          await this.props
            .getProjectsAndMeasures(this.props.building._id)
            .then(() => {
              this.setState({ projectsToShow: this.props.building.projects })
            })
          this.setState({
            reRunProjects: false,
            projectPackages: packages,
            projectsToShow: (result && result.projects) || []
          })
        }
      } catch (error) {
        this.setState({ reRunProjects: false })
      }
    }
  }

  handleRerunProjects = () => {
    const component = this
    return new Promise(resolve => {
      component.props
        .bulkEvaluateProjects(
          component.state.projectsToShow,
          component.props.building._id
        )
        .then(() => {
          resolve()
        })
        .catch(err => {
          console.log(err)
          resolve()
        })
    })
  }

  handleHideForm = () => {
    this.setState({ editingRates: false })
  }

  handleOpenHideEdit = () => {
    this.setState(prevState => ({
      editingRates: !prevState.editingRates
    }))
  }

  handleCheckableProject = () => {
    this.setState(prevState => ({
      isCheckable: !prevState.isCheckable,
      selectedMeasureIds: []
    }))
  }

  handleOpenAddProjects = () => {
    const { selectedProjectView } = this.props
    if (selectedProjectView.name === 'Measures') {
      this.setState({
        modalOpen: true,
        editingProject: false,
        modalView: 'projectModal'
      })
    }
  }

  handleCloseAddProjects = () => {
    this.setState({
      modalOpen: false,
      modalView: null,
      currentProject: {},
      matchingEaMeasures: [],
      editingRates: false,
      searchMeasureValue: ''
    })
    this.getProjectsAndMeasures()
  }

  handleOpenAddProjectPackage = () => {
    this.setState({
      modalOpen: true,
      editProjectPackage: false,
      viewMode: 'addProjectPackage',
      modalView: 'projectPackageModal'
    })
  }

  handleCloseAddProjectPackages = (flag, options = {}) => {
    this.setState({
      modalOpen: false,
      modalView: null,
      currentPackage: {},
      matchingEaMeasures: [],
      editingRates: false,
      searchProjectValue: ''
    })
    let mode = flag || 'create'
    if (mode === 'cancel') {
      this.props
        .deleteBulkMeasureForProject(options)
        .then(() => {
          this.getProjectsAndMeasures()
        })
        .catch(() => {
          this.getProjectsAndMeasures()
        })
    } else {
      this.getProjectsAndMeasures()
    }
  }

  handleOpenAddMeasurePackage = () => {
    const { selectedProjectView } = this.props
    if (selectedProjectView.name === 'Measures') {
      this.setState({
        modalOpen: true,
        currentMeasurePackage: {},
        viewMode: 'addMeasurePackage',
        modalView: 'measurePackageModal'
      })
    }
  }

  handleCloseAddMeasurePackage = () => {
    this.setState({
      modalOpen: false,
      modalView: null,
      currentProject: {},
      matchingEaMeasures: [],
      editingRates: false,
      viewMode: '',
      searchMeasureValue: ''
    })
    this.getProjectsAndMeasures()
  }

  handleOpenAddProposals = proposalMode => {
    this.setState(prevState => ({
      modalOpen: true,
      currentProposal: {},
      viewMode: 'addProposal',
      modalView: 'proposalModal',
      proposalMode,
      isCheckable: !prevState.isCheckable
    }))
  }

  handleCloseAddProposals = () => {
    this.setState({
      modalOpen: false,
      modalView: null,
      currentProposal: {},
      viewMode: '',
      searchPropoalValue: ''
    })
    this.getProjectsAndMeasures()
  }

  handleEditProposal = proposal => {
    proposal.isEditing = true
    this.setState({
      modalOpen: true,
      viewMode: 'editProposal',
      modalView: 'proposalModal',
      currentProposal: proposal,
      proposalMode: proposal.mode
    })
  }

  handleCopyProposal = proposal => {
    proposal.isEditing = true
    this.setState({
      modalOpen: true,
      viewMode: 'copyProposal',
      modalView: 'proposalModal',
      currentProposal: proposal
    })
  }

  handleCreateProjectFromProposal = proposal => {
    let sections = proposal.fields || []
    let fields = sections.reduce((allFields, currentSection) => {
      let sectionFields = currentSection.subFields || []
      sectionFields = sectionFields.filter(field => !!field.convertedName)
      return [...allFields, ...sectionFields]
    }, [])
    let name = proposal.name,
      description = '',
      estimatedStartDate = '',
      estimatedCompletionDate = ''
    let nameFieldIndex = fields.findIndex(
      field => field.convertedName === 'name'
    )
    let descriptionFieldIndex = fields.findIndex(
      field => field.convertedName === 'description'
    )
    let estimatedStartDateFieldIndex = fields.findIndex(
      field => field.convertedName === 'estimatedStartDate'
    )
    let estimatedCompletionDateFieldIndex = fields.findIndex(
      field => field.convertedName === 'estimatedCompletionDate'
    )
    if (nameFieldIndex !== -1) {
      name =
        (proposal &&
          proposal.fieldValues &&
          proposal.fieldValues[fields[nameFieldIndex].title]) ||
        proposal.name
    }
    if (descriptionFieldIndex !== -1) {
      description =
        (proposal &&
          proposal.fieldValues &&
          proposal.fieldValues[fields[descriptionFieldIndex].title]) ||
        proposal.name
    }
    if (estimatedStartDateFieldIndex !== -1) {
      estimatedStartDate =
        (proposal &&
          proposal.fieldValues &&
          proposal.fieldValues[fields[estimatedStartDateFieldIndex].title]) ||
        proposal.name
    }
    if (estimatedCompletionDateFieldIndex !== -1) {
      estimatedCompletionDate =
        (proposal &&
          proposal.fieldValues &&
          proposal.fieldValues[
            fields[estimatedCompletionDateFieldIndex].title
          ]) ||
        proposal.name
    }

    this.setState({
      modalOpen: true,
      viewMode: 'createProjectPackagefromProposal',
      modalView: 'projectPackageModal',
      currentPackage: {
        name: name,
        description: description,
        fields: proposal.fields,
        fieldValues: proposal.fieldValues,
        projects: proposal.projects,
        total: proposal.total,
        estimatedStartDate,
        estimatedCompletionDate
      }
    })
  }

  handleOpenDeleteProposalConfirmationModal = proposal => {
    this.setState({
      modalOpen: true,
      modalView: 'deleteProposalConfirmation',
      currentProposal: proposal
    })
  }

  handleDeleteProposal = proposalId => {
    this.props
      .deleteProposal(proposalId, this.props.building._id)
      .then(() => {
        this.getProjectsAndMeasures()
      })
      .catch(err => {
        console.log(err)
      })
    this.handleCloseAddProposals()
  }

  handleSearch = input => {
    const { selectedProjectView } = this.props
    if (selectedProjectView.name === 'Measures') {
      var tempProjectsInBuilding = [...this.props.building.projects]
      let tempProjectsToShow = tempProjectsInBuilding.filter(function(item) {
        return (
          JSON.stringify(item)
            .toLowerCase()
            .indexOf(input.toString().toLowerCase()) > -1
        )
      })

      var tempMatchingEaMeasures = [...this.state.matchingEaMeasures]
      let tempshowingEaMeasures = tempMatchingEaMeasures.filter(function(item) {
        return (
          JSON.stringify(item)
            .toLowerCase()
            .indexOf(input.toString().toLowerCase()) > -1
        )
      })

      this.setState({
        searchMeasureValue: input,
        showingEaMeasures: tempshowingEaMeasures,
        projectsToShow: tempProjectsToShow
      })
    } else if (selectedProjectView.name === 'Projects') {
      let tempProjects = [...this.props.building.projectPackages]
      let tempProjectsToShow = tempProjects.filter(function(item) {
        return (
          JSON.stringify(item)
            .toLowerCase()
            .indexOf(input.toString().toLowerCase()) > -1
        )
      })

      this.setState({
        searchProjectValue: input,
        projectPackages: tempProjectsToShow
      })
    } else if (selectedProjectView.name === 'Proposals') {
      let tempProjects = [...this.props.building.proposals]
      let tempProjectsToShow = tempProjects.filter(function(item) {
        return (
          JSON.stringify(item)
            .toLowerCase()
            .indexOf(input.toString().toLowerCase()) > -1
        )
      })

      this.setState({
        searchPropoalValue: input,
        proposals: tempProjectsToShow
      })
    }
  }

  handleTabChange = (index, name, active) => {
    const { selectedProjectView } = this.props
    if (active && name !== selectedProjectView.name) {
      let tempState = this.state.tabs.find(tab => tab.name === name)
      if (tempState.name === 'Measures' || tempState.name === 'Proposals') {
        document.addEventListener('mousedown', this.handleClick, false)
      } else {
        document.removeEventListener('mousedown', this.handleClick, false)
        this.setState({ showExtras: false })
      }
      this.props.updateProjectViewTab(tempState).then(() => {
        this.getProjectsAndMeasures()
        this.setState({ selectedMeasureIds: [], isCheckable: false })
      })
      let { building } = this.props
      let buildingId = building && building._id
      if (buildingId) {
        let subRoute =
          name === 'Measures'
            ? 'measure'
            : name === 'Proposals'
            ? 'proposal'
            : 'project'
        this.props.push('/building/' + buildingId + `/project/${subRoute}`)
      }
    }
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

  handleToggleExtrasNone = () => {
    this.setState(prevState => ({
      showExtrasNone: !prevState.showExtrasNone
    }))
  }

  renderNewButton = () => {
    const { selectedProjectView, building } = this.props
    let originalProjects = (building && building.projects) || []
    let originalProjectPackages = (building && building.projectPackages) || []
    let originalProposals = (building && building.proposals) || []
    const { showExtras, selectedMeasureIds } = this.state
    let viewName =
      (selectedProjectView && selectedProjectView.name) || 'Measures'
    switch (viewName) {
      case 'Measures': {
        if (originalProjects.length === 0) return null
        return (
          <div
            className={classNames(
              styles.extras,
              showExtras ? styles.extrasShow : styles.extrasHide
            )}
            ref={node => (this.node = node)}
          >
            <button
              className={classNames(styles.button, styles.buttonPrimary)}
              onClick={this.handleToggleExtras}
            >
              <i className='material-icons'>add</i>New
              <span> Measure</span>
            </button>
            <div
              className={classNames(
                styles.extrasDropdown,
                styles.extrasDropdownRight
              )}
            >
              <div
                className={styles.extrasLink}
                onClick={this.handleOpenAddProjects}
              >
                <i className='material-icons'>add</i>
                {'Measure'}
              </div>
              <div
                className={styles.extrasLink}
                onClick={this.handleOpenAddMeasurePackage}
              >
                <i className='material-icons'>add</i>
                {'Measure Package'}
              </div>
            </div>
          </div>
        )
      }
      case 'Projects': {
        if (originalProjectPackages.length === 0) return null
        return (
          <button
            className={classNames(styles.button, styles.buttonPrimary)}
            onClick={this.handleOpenAddProjectPackage}
          >
            <i className='material-icons'>add</i>New
            <span> Project</span>
          </button>
        )
      }
      case 'Proposals': {
        if (originalProposals.length === 0) return null
        return (
          <div
            className={classNames(
              styles.extras,
              showExtras ? styles.extrasShow : styles.extrasHide
            )}
            ref={node => (this.node = node)}
          >
            <button
              className={classNames(styles.button, styles.buttonPrimary)}
              onClick={this.handleToggleExtras}
            >
              <i className='material-icons'>add</i>New
              <span> Proposal</span>
            </button>
            <div
              className={classNames(
                styles.extrasDropdown,
                styles.extrasDropdownRight
              )}
            >
              <div
                className={styles.extrasLink}
                onClick={() => this.handleOpenAddProposals('Measure')}
              >
                <i className='material-icons'>add</i>
                {'Proposal From Measures'}
              </div>

              <UserFeature name='projectProject'>
                {({ enabled }) => {
                  if (!enabled) return null
                  return (
                    <div
                      className={styles.extrasLink}
                      onClick={() => this.handleOpenAddProposals('Project')}
                    >
                      <i className='material-icons'>add</i>
                      {'Proposal From Projects'}
                    </div>
                  )
                }}
              </UserFeature>
            </div>
          </div>
        )
      }
      default:
        return null
    }
  }

  handleSelectMeasureIds = (event, id) => {
    event.stopPropagation()
    let { selectedMeasureIds, projectsToShow } = this.state
    if (id === 'all') {
      let ids = projectsToShow.map(item => item._id)
      let checkedAll =
        multiSelectChecker(ids, selectedMeasureIds) &&
        multiSelectChecker(selectedMeasureIds, ids)
      this.setState({ selectedMeasureIds: checkedAll ? [] : ids })
    } else {
      let ids = []
      if (selectedMeasureIds.indexOf(id) === -1)
        ids = [...selectedMeasureIds, id]
      else ids = selectedMeasureIds.filter(item => item !== id)
      ids = [...new Set(ids)]
      this.setState({ selectedMeasureIds: ids })
    }
  }

  handleSelectProjectPackageIds = (event, id) => {
    event.stopPropagation()
    let { selectedMeasureIds, projectPackages } = this.state
    if (id === 'all') {
      let ids = projectPackages.map(item => item._id)
      let checkedAll =
        multiSelectChecker(ids, selectedMeasureIds) &&
        multiSelectChecker(selectedMeasureIds, ids)
      this.setState({ selectedMeasureIds: checkedAll ? [] : ids })
    } else {
      let ids = []
      if (selectedMeasureIds.indexOf(id) === -1)
        ids = [...selectedMeasureIds, id]
      else ids = selectedMeasureIds.filter(item => item !== id)
      ids = [...new Set(ids)]
      this.setState({ selectedMeasureIds: ids })
    }
  }

  renderAll(buildingEquipment, operations = []) {
    const { selectedProjectView } = this.props
    if (
      Object.entries(selectedProjectView).length != 0 &&
      selectedProjectView.constructor === Object
    ) {
      switch (selectedProjectView.name) {
        case 'Measures':
          return this.renderMeasures(buildingEquipment, operations)
        case 'Projects':
          return this.renderProjects(buildingEquipment)
        case 'Proposals':
          return this.renderProposals(buildingEquipment)
        default:
          return null
      }
    }
  }

  renderMeasures(buildingEquipment, operations) {
    const { building } = this.props
    const {
      projectsToShow,
      showExtrasNone,
      selectedMeasureIds = [],
      isCheckable
    } = this.state
    let originalProjects = (building && building.projects) || []

    let selectedMeasures =
      projectsToShow.filter(
        project => selectedMeasureIds.indexOf(project._id) !== -1
      ) || []

    return (
      <div>
        <div style={{ marginTop: '20px' }}></div>

        {building.projectRates &&
          Object.keys(building.projectRates).length > 0 && (
            <div className={styles.projectsMain}>
              {this.state.reRunProjects && (
                <div className={styles.projectsRerunning}>
                  <h3>
                    Re-evaluating projects after rates changed. Please wait to
                    view new outputs.
                  </h3>
                  <Loader />
                </div>
              )}

              {(originalProjects.length !== 0 ||
                this.state.showingEaMeasures.length !== 0) && (
                <div className={styles.toolbar}>
                  <ProjectSearch
                    searchValue={this.state.searchMeasureValue}
                    handleSearch={this.handleSearch}
                    placeholder={'Search for measures'}
                  />
                  <div className={styles.toolButtons}>
                    <div onClick={this.handleOpenHideEdit}>
                      <i className='material-icons'>settings</i> Settings
                    </div>

                    <UserFeature name='projectProposal'>
                      {({ enabled }) => {
                        if (!enabled) return null
                        return (
                          <div onClick={this.handleCheckableProject}>
                            <i className='material-icons'>add</i>
                            Proposal&nbsp;
                            <i className='material-icons'>summarize</i>
                          </div>
                        )
                      }}
                    </UserFeature>
                  </div>
                </div>
              )}

              {originalProjects.length !== 0 && this.state.editingRates && (
                <div className={classNames(styles.panel, styles.projectsRates)}>
                  <ProjectRates
                    onRatesSubmit={this.onRatesSubmit}
                    hideProjectsRate={this.state.hideProjectRates}
                    initialValues={this.props.building.projectRates || {}}
                    handleHideForm={this.handleHideForm}
                  />
                </div>
              )}

              {this.state.showingEaMeasures.length > 0 && (
                <EAProjectList
                  showingEaMeasures={this.state.showingEaMeasures}
                  handleAddEaProject={this.handleAddEaProject}
                />
              )}

              {this.state.gettingEaAudits && (
                <div className={styles.projectsLoading}>
                  <Loader />
                </div>
              )}

              {originalProjects.length === 0 && (
                <div className={styles.projectsNone}>
                  <div className={styles.projectsNoneTitle}>
                    Add Measures to Improve Building Efficiency & Value
                  </div>
                  <div className={styles.projectsNoneDescription}>
                    Browse a library of typical energy saving measures and
                    utility incentives.
                  </div>
                  <div className={styles.projectsNoneButtonDropdown}>
                    <div
                      className={classNames(
                        styles.extras,
                        styles.extrasNone,
                        showExtrasNone ? styles.extrasShow : styles.extrasHide
                      )}
                      ref={node => (this.nodeNone = node)}
                    >
                      <button
                        className={classNames(
                          styles.button,
                          styles.buttonPrimary
                        )}
                        onClick={this.handleToggleExtrasNone}
                      >
                        <i className='material-icons'>add</i>New
                        <span> Measure</span>
                      </button>
                      <div
                        className={classNames(
                          styles.extrasDropdown,
                          styles.extrasDropdownRight
                        )}
                      >
                        <div
                          className={styles.extrasLink}
                          onClick={this.handleOpenAddProjects}
                        >
                          <i className='material-icons'>add</i>
                          {'Measure'}
                        </div>
                        <div
                          className={styles.extrasLink}
                          onClick={this.handleOpenAddMeasurePackage}
                        >
                          <i className='material-icons'>add</i>
                          {'Measure Package'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {projectsToShow.length !== 0 && (
                <ProjectList
                  projectsToShow={projectsToShow}
                  handleEditProject={this.handleEditProject}
                  handleDeleteProject={this.handleDeleteProject}
                  buildingId={this.props.building._id}
                  handleOpenDeleteConfirmationModal={
                    this.handleOpenDeleteConfirmationModal
                  }
                  isCheckable={isCheckable}
                  selectedMeasureIds={selectedMeasureIds}
                  handleSelectMeasureIds={this.handleSelectMeasureIds}
                />
              )}
            </div>
          )}

        {this.state.modalOpen && this.state.modalView === 'projectModal' && (
          <ProjectsModal
            uploadProjectImage={this.props.uploadProjectImage}
            building={this.props.building}
            handleCloseAddProjects={this.handleCloseAddProjects}
            evaluateProject={this.props.evaluateProject}
            createOrganizationProject={this.props.createOrganizationProject}
            editOrganizationProject={this.props.editOrganizationProject}
            addIncompleteProject={this.props.addIncompleteProject}
            getProjectsAndMeasures={this.props.getProjectsAndMeasures}
            currentProject={this.state.currentProject}
            getUserById={this.props.getUserById}
            getOrganizationName={this.props.getOrganizationName}
            getOrganizationProjects={this.props.getOrganizationProjects}
            deleteOrganizationProject={this.props.deleteOrganizationProject}
            bulkAddProjects={this.props.bulkAddProjects}
            endUse={this.props.endUse}
            utilityMetrics={this.props.utilityMetrics}
            buildingEquipment={buildingEquipment}
            getProjectPackages={this.props.getProjectPackages}
            deleteProject={this.props.deleteProject}
            operations={operations}
          />
        )}

        {this.state.modalOpen &&
          this.state.modalView === 'deleteConfirmation' && (
            <DeleteConfirmationModal
              title={
                this.state.currentProject.collectionTarget === 'measurePackage'
                  ? this.state.currentProject.name
                  : this.state.currentProject.displayName
              }
              confirmationFunction={() =>
                this.handleDeleteProject(this.state.currentProject)
              }
              onClose={this.handleCloseAddProjects}
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
              buildingEquipment={buildingEquipment}
              user={this.props.user}
              viewMode={this.state.viewMode}
              modeFrom='ProjectView'
            />
          )}
        {this.state.modalOpen && this.state.modalView === 'proposalModal' && (
          <ProposalModal
            building={this.props.building}
            onClose={this.handleCloseAddProposals}
            proposal={this.state.currentProposal}
            endUse={this.props.endUse}
            utilityMetrics={this.props.utilityMetrics}
            buildingEquipment={buildingEquipment}
            user={this.props.user}
            viewMode={this.state.viewMode}
            selectedMeasures={selectedMeasures}
            selectedProjects={[]}
            proposalMode='Measure'
          />
        )}

        {isCheckable && (
          <div className={styles.proposalFooter}>
            <div className={styles.container}>
              <div className={styles.proposalFooterButtons}>
                <div className={styles.proposalFooterButtonsLeft}>
                  <div>
                    Check measures to include the proposal and select next.
                  </div>
                </div>
                <div className={styles.proposalFooterButtonsRight}>
                  <button
                    className={classNames(
                      styles.button,
                      styles.buttonSecondary
                    )}
                    onClick={this.handleCheckableProject}
                  >
                    Cancel
                  </button>
                  <button
                    className={classNames(styles.button, styles.buttonPrimary, {
                      [styles.buttonDisable]: !selectedMeasureIds.length
                    })}
                    disabled={!selectedMeasureIds.length}
                    onClick={() => this.handleOpenAddProposals('Measure')}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  renderProjects(buildingEquipment) {
    const { building } = this.props
    const { projectPackages, selectedMeasureIds = [], isCheckable } = this.state

    let originalProjectPackages = (building && building.projectPackages) || []

    let selectedProjectPackages =
      projectPackages.filter(
        project => selectedMeasureIds.indexOf(project._id) !== -1
      ) || []

    return (
      <div>
        <div style={{ marginTop: '20px' }}></div>
        {building.projectRates &&
          Object.keys(building.projectRates).length > 0 && (
            <div className={styles.projectsMain}>
              {this.state.reRunProjects && (
                <div className={styles.projectsRerunning}>
                  <h3>
                    Re-evaluating projects after rates changed. Please wait to
                    view new outputs.
                  </h3>
                  <Loader />
                </div>
              )}

              {originalProjectPackages.length !== 0 && (
                <div className={styles.toolbar}>
                  <ProjectSearch
                    searchValue={this.state.searchProjectValue}
                    handleSearch={this.handleSearch}
                    placeholder={'Search for projects'}
                  />
                  <div className={styles.toolButtons}>
                    <UserFeature name='projectProposal'>
                      {({ enabled }) => {
                        if (!enabled) return null
                        return (
                          <div onClick={this.handleCheckableProject}>
                            <i className='material-icons'>add</i>
                            Proposal&nbsp;
                            <i className='material-icons'>summarize</i>
                          </div>
                        )
                      }}
                    </UserFeature>
                  </div>
                </div>
              )}
              {this.state.projectPackageLoading && !projectPackages.length && (
                <div className={styles.projectsLoading}>
                  <Loader />
                </div>
              )}

              {originalProjectPackages.length === 0 && (
                <div className={styles.projectsNone}>
                  <div className={styles.projectsNoneTitle}>
                    Track Implementation of Measures with Projects
                  </div>
                  <div className={styles.projectsNoneDescription}>
                    Add projects, associate measures, and track high-level
                    execution.
                  </div>
                  <button
                    className={classNames(styles.button, styles.buttonPrimary)}
                    onClick={this.handleOpenAddProjectPackage}
                  >
                    <i className='material-icons'>add</i>New
                    <span> Project</span>
                  </button>
                </div>
              )}

              {projectPackages.length !== 0 && (
                <ProjectPackageList
                  projectPackages={projectPackages}
                  handleEditProject={this.handleEditProjectPackage}
                  handleDeleteProject={this.handleDeleteProjectPackage}
                  buildingId={this.props.building._id}
                  handleOpenDeleteConfirmationModal={
                    this.handleOpenDeletePackageConfirmationModal
                  }
                  isCheckable={isCheckable}
                  selectedProjectPackageIds={selectedMeasureIds}
                  handleSelectProjectPackageIds={
                    this.handleSelectProjectPackageIds
                  }
                />
              )}
            </div>
          )}

        {this.state.modalOpen &&
          this.state.modalView === 'deletePackageConfirmation' && (
            <DeleteConfirmationModal
              title={this.state.currentPackage.name}
              confirmationFunction={() =>
                this.handleDeleteProjectPackage(this.state.currentPackage._id)
              }
              onClose={this.handleCloseAddProjectPackages}
            />
          )}

        {this.state.modalOpen &&
          this.state.modalView === 'projectPackageModal' && (
            <ProjectPackagesModal
              building={this.props.building}
              onClose={this.handleCloseAddProjectPackages}
              projectPackage={this.state.currentPackage}
              endUse={this.props.endUse}
              utilityMetrics={this.props.utilityMetrics}
              buildingEquipment={buildingEquipment}
              user={this.props.user}
              viewMode={this.state.viewMode}
            />
          )}

        {this.state.modalOpen && this.state.modalView === 'proposalModal' && (
          <ProposalModal
            building={this.props.building}
            onClose={this.handleCloseAddProposals}
            proposal={this.state.currentProposal}
            endUse={this.props.endUse}
            utilityMetrics={this.props.utilityMetrics}
            buildingEquipment={buildingEquipment}
            user={this.props.user}
            viewMode={this.state.viewMode}
            selectedMeasures={[]}
            selectedProjects={selectedProjectPackages}
            proposalMode='Project'
          />
        )}

        {isCheckable && (
          <div className={styles.proposalFooter}>
            <div className={styles.container}>
              <div className={styles.proposalFooterButtons}>
                <div className={styles.proposalFooterButtonsLeft}>
                  <div>
                    Check projects to include the proposal and select next.
                  </div>
                </div>
                <div className={styles.proposalFooterButtonsRight}>
                  <button
                    className={classNames(
                      styles.button,
                      styles.buttonSecondary
                    )}
                    onClick={this.handleCheckableProject}
                  >
                    Cancel
                  </button>
                  <button
                    className={classNames(styles.button, styles.buttonPrimary, {
                      [styles.buttonDisable]: !selectedMeasureIds.length
                    })}
                    disabled={!selectedMeasureIds.length}
                    onClick={() => this.handleOpenAddProposals('Project')}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  renderProposals(buildingEquipment) {
    const { building } = this.props
    const {
      proposals,
      selectedMeasureIds,
      projectsToShow,
      showExtrasNone
    } = this.state
    let originalProposals = (building && building.proposals) || []
    let selectedMeasures =
      projectsToShow.filter(
        project => selectedMeasureIds.indexOf(project._id) !== -1
      ) || []

    return (
      <div>
        <div style={{ marginTop: '20px' }}></div>
        {building.projectRates &&
          Object.keys(building.projectRates).length > 0 && (
            <div className={styles.projectsMain}>
              {this.state.reRunProjects && (
                <div className={styles.projectsRerunning}>
                  <h3>
                    Re-evaluating projects after rates changed. Please wait to
                    view new outputs.
                  </h3>
                  <Loader />
                </div>
              )}

              {originalProposals.length !== 0 && (
                <div className={styles.toolbar}>
                  <ProjectSearch
                    searchValue={this.state.searchPropoalValue}
                    handleSearch={this.handleSearch}
                    placeholder={'Search for proposals'}
                  />
                </div>
              )}
              {this.state.proposalLoading && !proposals.length && (
                <div className={styles.projectsLoading}>
                  <Loader />
                </div>
              )}

              {originalProposals.length === 0 && (
                <div className={styles.projectsNone}>
                  <div className={styles.projectsNoneTitle}>
                    Create and Track Proposals
                  </div>
                  <div className={styles.projectsNoneDescription}>
                    Add projects, associate measures, and track approval.
                  </div>

                  <div className={styles.projectsNoneButtonDropdown}>
                    <div
                      className={classNames(
                        styles.extras,
                        styles.extrasNone,
                        showExtrasNone ? styles.extrasShow : styles.extrasHide
                      )}
                      ref={node => (this.nodeNone = node)}
                    >
                      <button
                        className={classNames(
                          styles.button,
                          styles.buttonPrimary
                        )}
                        onClick={this.handleToggleExtrasNone}
                      >
                        <i className='material-icons'>add</i>New
                        <span> Proposal</span>
                      </button>
                      <div
                        className={classNames(
                          styles.extrasDropdown,
                          styles.extrasDropdownRight
                        )}
                      >
                        <div
                          className={styles.extrasLink}
                          onClick={() => this.handleOpenAddProposals('Measure')}
                        >
                          <i className='material-icons'>add</i>
                          {'Proposal From Measures'}
                        </div>
                        <UserFeature name='projectProject'>
                          {({ enabled }) => {
                            if (!enabled) return null
                            return (
                              <div
                                className={styles.extrasLink}
                                onClick={() =>
                                  this.handleOpenAddProposals('Project')
                                }
                              >
                                <i className='material-icons'>add</i>
                                {'Proposal From Projects'}
                              </div>
                            )
                          }}
                        </UserFeature>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {proposals.length !== 0 && (
                <ProposalList
                  proposals={proposals}
                  handleEditProposal={this.handleEditProposal}
                  handleCopyProposal={this.handleCopyProposal}
                  handleCreateProjectFromProposal={
                    this.handleCreateProjectFromProposal
                  }
                  handleDeleteProposal={this.handleDeleteProposal}
                  buildingId={this.props.building._id}
                  handleOpenDeleteConfirmationModal={
                    this.handleOpenDeleteProposalConfirmationModal
                  }
                />
              )}
            </div>
          )}

        {this.state.modalOpen &&
          this.state.modalView === 'deleteProposalConfirmation' && (
            <DeleteConfirmationModal
              title={this.state.currentProposal.name}
              confirmationFunction={() =>
                this.handleDeleteProposal(this.state.currentProposal._id)
              }
              onClose={this.handleCloseAddProjectPackages}
            />
          )}
        {this.state.modalOpen && this.state.modalView === 'proposalModal' && (
          <ProposalModal
            building={this.props.building}
            onClose={this.handleCloseAddProposals}
            proposal={this.state.currentProposal}
            endUse={this.props.endUse}
            utilityMetrics={this.props.utilityMetrics}
            buildingEquipment={buildingEquipment}
            user={this.props.user}
            viewMode={this.state.viewMode}
            selectedMeasures={[]}
            selectedProjects={[]}
            proposalMode={this.state.proposalMode}
          />
        )}
        {this.state.modalOpen &&
          this.state.modalView === 'projectPackageModal' && (
            <ProjectPackagesModal
              building={this.props.building}
              onClose={this.handleCloseAddProjectPackages}
              projectPackage={this.state.currentPackage}
              endUse={this.props.endUse}
              utilityMetrics={this.props.utilityMetrics}
              buildingEquipment={buildingEquipment}
              user={this.props.user}
              viewMode={this.state.viewMode}
            />
          )}
      </div>
    )
  }

  render() {
    const { building, selectedProjectView } = this.props
    const buildingId = (building && building._id) || 0
    return (
      <Query
        query={GET_BUILDING_OPERATIONS}
        variables={{ id: buildingId }}
        skip={!buildingId}
      >
        {({ data: operationData }) => {
          const operations =
            (operationData &&
              operationData.building &&
              operationData.building.operations) ||
            []
          return (
            <Query
              skip={!buildingId}
              query={GET_BUILDING_EQUIPMENT_LIST}
              variables={{ buildingId }}
              fetchPolicy='network-only'
            >
              {({ loading, error, data }) => {
                let buildingEquipment = []
                if (data && data.buildingEquipment)
                  buildingEquipment = data.buildingEquipment
                return (
                  <div className={styles.projects}>
                    <div className={styles.projectsHeading}>
                      <Query query={ENABLED_FEATURES}>
                        {({ loading, error, data }) => {
                          if (loading || !data) return null
                          const enabledFeatures = data.enabledFeatures
                          let isProposalEnabled =
                            enabledFeatures &&
                            enabledFeatures.some(
                              feature => feature.name === 'projectProposal'
                            )
                          let isProjectEnabled =
                            enabledFeatures &&
                            enabledFeatures.some(
                              feature => feature.name === 'projectProject'
                            )
                          if (!isProposalEnabled && !isProjectEnabled)
                            return <h2>Measures</h2>
                          return <h2>Projects</h2>
                        }}
                      </Query>
                      {this.renderNewButton()}
                    </div>
                    <Query query={ENABLED_FEATURES}>
                      {({ loading, error, data }) => {
                        if (loading || !data) return null
                        const enabledFeatures = data.enabledFeatures

                        return (
                          <div className={styles.projectTabContainer}>
                            {this.state.tabs
                              .filter(
                                ({ name, featureFlag }) =>
                                  !featureFlag ||
                                  (enabledFeatures &&
                                    enabledFeatures.some(
                                      feature => feature.name === featureFlag
                                    ))
                              )
                              .map((tab, index) => {
                                if (tab.name === 'Measures') {
                                  let isProposalEnabled =
                                    enabledFeatures &&
                                    enabledFeatures.some(
                                      feature =>
                                        feature.name === 'projectProposal'
                                    )
                                  let isProjectEnabled =
                                    enabledFeatures &&
                                    enabledFeatures.some(
                                      feature =>
                                        feature.name === 'projectProject'
                                    )
                                  if (!isProposalEnabled && !isProjectEnabled)
                                    return null
                                  return (
                                    <div
                                      key={index}
                                      name={`${tab.name}Tab`}
                                      onClick={() => {
                                        this.handleTabChange(
                                          index,
                                          tab.name,
                                          tab.active
                                        )
                                      }}
                                      className={classNames(
                                        styles.tab,
                                        tab.name === selectedProjectView.name
                                          ? styles.tabActive
                                          : '',
                                        tab.active ? '' : styles.tabInactive
                                      )}
                                    >
                                      {'Measures'}
                                    </div>
                                  )
                                }

                                return (
                                  <div
                                    key={index}
                                    name={`${tab.name}Tab`}
                                    onClick={() => {
                                      this.handleTabChange(
                                        index,
                                        tab.name,
                                        tab.active
                                      )
                                    }}
                                    className={classNames(
                                      styles.tab,
                                      tab.name === selectedProjectView.name
                                        ? styles.tabActive
                                        : '',
                                      tab.active ? '' : styles.tabInactive
                                    )}
                                  >
                                    {tab.name}
                                  </div>
                                )
                              })}
                          </div>
                        )
                      }}
                    </Query>
                    {this.renderAll(buildingEquipment, operations)}
                  </div>
                )
              }}
            </Query>
          )
        }}
      </Query>
    )
  }
}

export default ProjectView
