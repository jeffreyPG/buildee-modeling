import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import _, { isEmpty } from 'lodash'
import useTypes from '../../static/building-types'
import styles from './ProjectListing.scss'
import { replaceHTMLEntities } from './ProjectHelpers'
import { parentNodeHasClass } from '../../utils/Utils'
import UserFeature from '../../utils/Feature/UserFeature'
import Categorization from 'components/Categorization'

const DISPLAY_VALUES = {
  abatement: 'Abatement',
  incentive: 'Incentive',
  'o&m': 'O&M',
  retrofit: 'Retrofit',
  rcx: 'RCx',
  CEEM: 'CEEM',
  'CEEM/DI': 'CEEM/DI',
  CO: 'CO'
}

export class ProjectListing extends React.Component {
  static propTypes = {
    handleSelectedProjects: PropTypes.func.isRequired,
    handleOpenProject: PropTypes.func.isRequired,
    handleDeleteProject: PropTypes.func.isRequired,
    getOrganizationProjects: PropTypes.func.isRequired,
    getMeasures: PropTypes.func,
    buildingLocation: PropTypes.object.isRequired,
    buildingUse: PropTypes.string.isRequired,
    library: PropTypes.bool,
    measures: PropTypes.array.isRequired,
    products: PropTypes.object.isRequired,
    projects: PropTypes.array.isRequired,
    selectedProjects: PropTypes.array.isRequired,
    tab: PropTypes.string
  }

  state = {
    activeTab: this.props.tab ? this.props.tab : 'myLibrary',
    originalOrgLibrary: [],
    originalPublicLibrary: [],
    orgLibrary: [],
    publicLibrary: [],
    searchValue: '',
    myLibraryFilterLists: {
      type: [],
      category: [],
      app: [],
      tech: [],
      fuel: [],
      analysis: [],
      utility: [],
      buildingType: []
    },
    myLibraryFilterValues: {
      type: 'default',
      category: 'default',
      app: 'default',
      tech: 'default',
      fuel: 'default',
      analysis: 'default',
      utility: 'default',
      buildingType: this.props.buildingUse || 'default'
    },
    publicFilterLists: {
      type: [],
      category: [],
      app: [],
      tech: [],
      fuel: [],
      analysis: [],
      utility: [],
      buildingType: []
    },
    publicFilterValues: {
      type: 'default',
      category: 'default',
      app: 'default',
      tech: 'default',
      fuel: 'default',
      analysis: 'default',
      utility: 'default',
      buildingType: this.props.buildingUse || 'default'
    },
    showPrivateExtras: '',
    showPublicExtras: '',
    selectedProjects: [],
    sort: {
      key: 'project',
      direction: 'DESC'
    },
    hideProjectFilters: true
  }

  componentDidMount = () => {
    this.props.getOrganizationProjects().then(projects => {
      if (this.props.library) {
        this.props.getMeasures().then(measures => {
          let measuresArray = []
          for (let key in measures) {
            let project = measures[key]
            if (project) {
              project.map(item => {
                measuresArray.push(item)
              })
            }
          }
          // don't filter measures outside of state or
          // building type since we're in the library
          this.setState({
            originalOrgLibrary: projects,
            orgLibrary: projects,
            originalPublicLibrary: measuresArray,
            publicLibrary: measuresArray
          })
          this.removeExpiredMeasures().then(() => {
            this.populateFiltersAll()
          })
        })
      } else {
        this.removeProjectsOutsideType(projects).then(() => {
          this.removeIncentivesOutsideState().then(() => {
            this.removeExpiredMeasures().then(() => {
              this.populateFiltersAll()
            })
          })
        })
      }
    })
  }

  componentDidUpdate = prevProps => {
    if (prevProps.selectedProjects !== this.props.selectedProjects) {
      this.setState({ selectedProjects: this.props.selectedProjects })
    }
  }
  UNSAFE_componentWillMount() {
    document.addEventListener('mousedown', this.handleClick, false)
  }
  componentWillUnmount = () => {
    document.removeEventListener('mousedown', this.handleClick, false)
  }
  handleClick = e => {
    // the click is inside, continue to menu links
    if (parentNodeHasClass(e.target, 'extrasClick')) return
    // otherwise, toggle (close) the app dropdown
    this.handleToggleExtras(null, 'private')
  }

  removeProjectsOutsideType = projects => {
    const { buildingUse, measures } = this.props
    return new Promise(resolve => {
      var filteredProjects = projects.filter(function(proj) {
        // if the project has a building type and the building type is listed
        let applicable_building_types = proj.applicable_building_types || []
        applicable_building_types = applicable_building_types.map(type =>
          type.trim()
        )

        if (!isEmpty(applicable_building_types) && buildingUse) {
          return proj.applicable_building_types.includes(
            buildingUse.trim().toLowerCase()
          )
        } else {
          return true
        }
      })
      var filteredMeasures = measures.filter(function(measure) {
        // if the measure has a building type and the building type is listed
        if (
          measure.applicable_building_types &&
          measure.applicable_building_types.length
        ) {
          return measure.applicable_building_types.includes(buildingUse)
        } else {
          return true
        }
      })

      this.setState({
        originalOrgLibrary: filteredProjects,
        orgLibrary: filteredProjects,
        originalPublicLibrary: filteredMeasures,
        publicLibrary: filteredMeasures
      })
      resolve()
    })
  }

  removeIncentivesOutsideState = () => {
    const { tab } = this.props
    if (tab === 'publicLibrary')
      return new Promise(resolve => {
        resolve()
      })
    return new Promise(resolve => {
      let tempPublicLibrary = [...this.state.publicLibrary]
      tempPublicLibrary = tempPublicLibrary.filter(project => {
        // if the incentive states do not have the building state in the array
        if (
          project.incentive.state &&
          project.incentive.state.length > 0 &&
          project.incentive.state[0] !== null &&
          project.incentive.state.indexOf(this.props.buildingLocation.state) ===
            -1
        ) {
          return false
        } else {
          return true
        }
      })
      this.setState({
        originalPublicLibrary: tempPublicLibrary,
        publicLibrary: tempPublicLibrary
      })
      resolve()
    })
  }

  removeExpiredMeasures = () => {
    return new Promise(resolve => {
      let tempPublicLibrary = [...this.state.publicLibrary]
      tempPublicLibrary = tempPublicLibrary.filter(
        project => project.project_category !== 'LL87'
      )
      tempPublicLibrary = tempPublicLibrary.filter(project => {
        let currentDate = new Date()
        // if the expiration date even exists
        if (project.incentive && project.incentive.expiration) {
          // remove measure if expiration date has passed
          if (project.incentive.expiration < currentDate.toISOString()) {
            return false
          } else {
            return true
          }
        } else {
          return true
        }
      })
      this.setState({
        originalPublicLibrary: tempPublicLibrary,
        publicLibrary: tempPublicLibrary
      })
      resolve()
    })
  }

  populateFiltersAll = () => {
    this.populateFilters('myLibrary')
    this.populateFilters('publicLibrary')
    this.filterList(
      {
        target: {
          value: this.props.buildingUse || 'default'
        }
      },
      'buildingType'
    )
  }

  populateFilters = target => {
    let tempFilters =
      target === 'myLibrary'
        ? { ...this.state.myLibraryFilterLists }
        : { ...this.state.publicFilterLists }

    let projectTypes = ['incentive', 'retrofit']
    let uniqueUtilityCompany = []
    let uniqueCategory = []
    let uniqueApp = []
    let uniqueTech = []
    let uniqueFuel = []
    let uniqueAnalysis = []
    let uniqueBuildingType = []
    let analysisOrder = ['cost-only', 'description', 'calculated']

    const pushInValues = values => {
      let projects = Array.from(values)
      projects = projects.filter(project => project.project_category !== 'LL87')
      projects.forEach(project => {
        // Type
        if (project.type) {
          projectTypes.push(project.type)
        }
        // Category
        if (project.project_category) {
          uniqueCategory.push(project.project_category)
        }
        // Application
        if (project.project_application && project.project_application !== '') {
          uniqueApp.push(project.project_application)
        }
        // Technology
        if (project.project_technology && project.project_technology !== '') {
          uniqueTech.push(project.project_technology)
        }
        // Analysis
        uniqueAnalysis.push(project.category)
        // Fuel
        uniqueFuel.push(project.fuel)
        // Utility
        if (project && project.incentive && project.incentive.utility_company) {
          uniqueUtilityCompany.push(project.incentive.utility_company)
        }
        // buildingTypes
        if (
          project &&
          project.applicable_building_types &&
          project.applicable_building_types.length > 0
        ) {
          uniqueBuildingType = [
            ...uniqueBuildingType,
            ...project.applicable_building_types.map(type =>
              type.trim().toLowerCase()
            )
          ]
          uniqueBuildingType = [...new Set(uniqueBuildingType)]
        }
      })
    }
    if (target === 'myLibrary') pushInValues(this.state.orgLibrary)
    else pushInValues(this.state.publicLibrary)

    tempFilters.type = Array.from(new Set(projectTypes)).sort()
    tempFilters.tech = Array.from(new Set(uniqueTech)).sort()
    tempFilters.app = Array.from(new Set(uniqueApp)).sort()
    tempFilters.fuel = Array.from(new Set(uniqueFuel))
      .sort()
      .filter(Boolean)
    tempFilters.category = Array.from(new Set(uniqueCategory)).sort()

    if (this.props.buildingUse) {
      let buildingType = this.props.buildingUse.trim().toLowerCase()
      uniqueBuildingType = [...uniqueBuildingType, buildingType]
    }

    tempFilters.buildingType = Array.from(new Set(uniqueBuildingType)).sort()

    // give a set order to the analysis filtering since the values are not the same as the display names
    let analysisArray = Array.from(new Set(uniqueAnalysis)).sort()
    tempFilters.analysis = []
    for (var i = 0; i < analysisOrder.length; i++) {
      if (analysisArray.indexOf(analysisOrder[i]) > -1) {
        tempFilters.analysis.push(analysisOrder[i])
      }
    }

    if (uniqueUtilityCompany.length > 0) {
      tempFilters.utility = Array.from(new Set(uniqueUtilityCompany))
        .sort()
        .filter(Boolean)
    }

    if (target === 'myLibrary') {
      this.setState({ myLibraryFilterLists: tempFilters })
    } else {
      this.setState({ publicFilterLists: tempFilters })
    }
  }

  searchList = event => {
    const { activeTab } = this.state
    let filterValues =
      activeTab === 'myLibrary'
        ? this.state.myLibraryFilterValues
        : this.state.publicFilterValues
    let updatedOrgLibrary = [...this.state.originalOrgLibrary]
    let updatedPublicLibrary = [...this.state.originalPublicLibrary]
    let string = event.target.value.toString().toLowerCase()
    string = string.replace(/\(/g, '\\(') // escape left parentheses
    string = string.replace(/\)/g, '\\)') // escape right parentheses
    string = string.replace(/\&/g, '\\&') // escape ampersand
    let regex = new RegExp(string)

    // if there are any filter values set, search from the filtered project lists
    if (
      Object.values(filterValues).some(value => {
        return value !== 'default'
      })
    ) {
      updatedOrgLibrary = this.filterLibrary(updatedOrgLibrary)
      updatedPublicLibrary = this.filterLibrary(updatedPublicLibrary)
    }

    updatedOrgLibrary = updatedOrgLibrary.filter(project => {
      if (project) {
        return (
          JSON.stringify(project)
            .toLowerCase()
            .search(regex) !== -1
        )
      }
    })

    updatedPublicLibrary = updatedPublicLibrary.filter(project => {
      if (project) {
        return (
          JSON.stringify(project)
            .toLowerCase()
            .search(regex) !== -1
        )
      }
    })

    this.setState({
      orgLibrary: updatedOrgLibrary,
      publicLibrary: updatedPublicLibrary,
      searchValue: event.target.value
    })
  }

  filterLibrary = (filteredProjects, value, filter) => {
    const { activeTab } = this.state
    let appliedFilterValues =
      activeTab === 'myLibrary'
        ? { ...this.state.myLibraryFilterValues }
        : { ...this.state.publicFilterValues }
    // set a new filter value if passed in to the function
    if (value && filter) {
      if (filter === 'category') {
        // reset application and technology
        appliedFilterValues.app = 'all'
        appliedFilterValues.tech = 'all'
      }
      if (filter === 'app') {
        // reset technology
        appliedFilterValues.tech = 'all'
      }
      appliedFilterValues[filter] = value
      if (activeTab === 'myLibrary')
        this.setState({ myLibraryFilterValues: appliedFilterValues })
      else this.setState({ publicFilterValues: appliedFilterValues })
    }

    return Object.keys(appliedFilterValues).reduce((projects, key) => {
      if (
        appliedFilterValues[key] === 'default' ||
        appliedFilterValues[key] === 'all'
      ) {
        return projects
      }
      let value = appliedFilterValues[key]
        .toString()
        .toLowerCase()
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)')
        .replace(/\&/g, '\\&')
      if (key === 'category' || key === 'app' || key === 'tech') {
        value = value.replace(/\_/g, ' ').replace(/and/g, '&')
      }
      let regexValue = new RegExp(value)
      if (key === 'type') {
        return projects.filter(project => {
          if (value === 'incentive') {
            return (
              project.incentive &&
              project.incentive.incentive_type !== 'none' &&
              project.incentive.incentive_type !== 'default'
            )
          }
          return (
            project.type && project.type.toLowerCase().search(regexValue) !== -1
          )
        })
      } else if (key === 'category') {
        return projects.filter(
          project =>
            project.project_category &&
            project.project_category.toLowerCase().search(regexValue) !== -1
        )
      } else if (key === 'analysis') {
        return projects.filter(
          project =>
            project.category &&
            JSON.stringify(project.category)
              .toLowerCase()
              .search(regexValue) !== -1
        )
      } else if (key === 'app') {
        return projects.filter(
          project =>
            project.project_application &&
            JSON.stringify(project.project_application)
              .toLowerCase()
              .search(regexValue) !== -1
        )
      } else if (key === 'tech') {
        return projects.filter(
          project =>
            project.project_technology &&
            JSON.stringify(project.project_technology)
              .toLowerCase()
              .search(regexValue) !== -1
        )
      } else if (key === 'fuel') {
        return projects.filter(
          project =>
            project.fuel &&
            JSON.stringify(project.fuel)
              .toLowerCase()
              .search(regexValue) !== -1
        )
      } else if (key === 'utility') {
        return projects.filter(
          project =>
            project.incentive.utility_company &&
            project.incentive.utility_company.indexOf(
              appliedFilterValues[key]
            ) !== -1
        )
      } else if (key === 'buildingType') {
        let filteredValue = appliedFilterValues[key].trim()
        return projects.filter(project => {
          let buildingTypes = project.applicable_building_types || []
          buildingTypes = buildingTypes.map(type => type.trim().toLowerCase())
          if (isEmpty(buildingTypes)) return true
          return filteredValue === 'default'
            ? true
            : buildingTypes.includes(filteredValue)
        })
      }
    }, Array.from(filteredProjects))
  }

  filterList = (event, filter) => {
    // start with the original copy of the projects everytime
    let { activeTab } = this.state
    let tempOrgLibrary = [...this.state.originalOrgLibrary]
    let tempPublicLibrary = [...this.state.originalPublicLibrary]

    let filteredOrgLibrary = this.filterLibrary(
      tempOrgLibrary,
      event.target.value || 'default',
      filter
    )
    let filteredPublicLibrary = this.filterLibrary(
      tempPublicLibrary,
      event.target.value || 'default',
      filter
    )
    let searchString = this.state.searchValue.toString().toLowerCase()
    searchString = searchString.replace(/\(/g, '\\(') // escape left parentheses
    searchString = searchString.replace(/\)/g, '\\)') // escape right parentheses
    searchString = searchString.replace(/\&/g, '\\&') // escape ampersand
    let regex = new RegExp(searchString)

    // if there is a search value present, also search by that
    if (this.state.searchValue && this.state.searchValue !== '') {
      filteredOrgLibrary = filteredOrgLibrary.filter(project => {
        if (project) {
          return (
            JSON.stringify(project)
              .toLowerCase()
              .search(regex) !== -1
          )
        }
      })

      filteredPublicLibrary = filteredPublicLibrary.filter(project => {
        if (project) {
          return (
            JSON.stringify(project)
              .toLowerCase()
              .search(regex) !== -1
          )
        }
      })
    }

    // filter application and technology dropdowns based on data
    if (['category', 'app'].indexOf(filter) > -1) {
      let tempFilters =
        activeTab === 'myLibrary'
          ? { ...this.state.myLibraryFilterLists }
          : { ...this.state.publicFilterLists }
      let orgApp = filteredOrgLibrary.map(project => {
        if (project.project_application) {
          return project.project_application
        }
      })
      let publicApp = filteredPublicLibrary.map(project => {
        if (project.project_application) {
          return project.project_application
        }
      })

      let orgTech = filteredOrgLibrary.map(project => {
        if (project.project_technology) {
          return project.project_technology
        }
      })
      let publicTech = filteredPublicLibrary.map(project => {
        if (project.project_technology) {
          return project.project_technology
        }
      })

      // set new application filters only if category was selected
      if (filter === 'category') {
        tempFilters.app = Array.from(new Set([...orgApp, ...publicApp]))
          .sort()
          .filter(Boolean)
      }
      tempFilters.tech = Array.from(new Set([...orgTech, ...publicTech]))
        .sort()
        .filter(Boolean)
      if (activeTab === 'myLibrary') {
        this.setState({ myLibraryFilterLists: tempFilters })
      } else {
        this.setState({ publicFilterLists: tempFilters })
      }
    }

    if (filter === 'type') {
      let filterValues =
        activeTab === 'myLibrary'
          ? this.state.myLibraryFilterValues
          : this.state.publicFilterValues

      let updatedFilterValues = {
        type: event.target.value,
        category: filterValues.category,
        app: filterValues.app,
        tech: filterValues.tech,
        fuel: filterValues.fuel,
        analysis: filterValues.analysis,
        utility: filterValues.utility,
        buildingType: filterValues.buildingType
      }
      if (event.target.value === 'incentive') {
        updatedFilterValues = {
          type: event.target.value,
          category: filterValues.category,
          app: filterValues.app,
          tech: filterValues.tech,
          fuel: filterValues.fuel,
          analysis: filterValues.analysis,
          utility: filterValues.utility,
          buildingType: filterValues.buildingType
        }
      }
      if (activeTab === 'myLibrary') {
        this.setState({
          orgLibrary: filteredOrgLibrary,
          publicLibrary: filteredPublicLibrary,
          myLibraryFilterValues: updatedFilterValues
        })
      } else {
        this.setState({
          orgLibrary: filteredOrgLibrary,
          publicLibrary: filteredPublicLibrary,
          publicFilterValues: updatedFilterValues
        })
      }
    } else {
      this.setState({
        orgLibrary: filteredOrgLibrary,
        publicLibrary: filteredPublicLibrary
      })
    }
  }

  handleFormatAnalysisFilter = value => {
    switch (value) {
      case 'description':
        return 'General Description'
      case 'cost-only':
        return 'Financial Impact'
      case 'calculated':
        return 'Savings Calculation'
    }
  }

  handleFormatBuildingTypeFilter = filterValue => {
    let building = _.find(useTypes, { value: filterValue })
    if (building) return building.name
    return (
      filterValue.charAt(0).toUpperCase() + filterValue.slice(1).toLowerCase()
    )
  }

  handleFormatFuelType = filterValue => {
    let displayName = filterValue.toLowerCase()
    switch (displayName) {
      case 'electric':
        return 'Electricity'
      case 'gas':
      case 'natural gas':
        return 'Natural Gas'
      case 'gas/electric':
        return 'Natural Gas/Electricity'
    }
    return (
      displayName.charAt(0).toUpperCase() + displayName.slice(1).toLowerCase()
    )
  }

  handleClickSort = (key, projects, library) => {
    if (!projects) return

    let tempSort = { ...this.state.sort }

    if (key === tempSort.key) {
      tempSort.direction = this.state.sort.direction === 'ASC' ? 'DESC' : 'ASC'
    } else {
      tempSort.key = key
      tempSort.direction = 'ASC'
    }

    if (tempSort.direction === 'ASC') {
      projects = projects.sort(function(a, b) {
        if (key === 'name') {
          return a.displayName.toLowerCase() < b.displayName.toLowerCase()
            ? -1
            : b.displayName.toLowerCase() < a.displayName.toLowerCase()
            ? 1
            : 0
        } else if (key === 'category') {
          return a.project_category.toLowerCase() <
            b.project_category.toLowerCase()
            ? -1
            : b.project_category.toLowerCase() <
              a.project_category.toLowerCase()
            ? 1
            : 0
        }
      })
    } else {
      projects = projects.sort(function(a, b) {
        if (key === 'name') {
          return a.displayName.toLowerCase() > b.displayName.toLowerCase()
            ? -1
            : b.displayName.toLowerCase() > a.displayName.toLowerCase()
            ? 1
            : 0
        } else if (key === 'category') {
          return a.project_category.toLowerCase() >
            b.project_category.toLowerCase()
            ? -1
            : b.project_category.toLowerCase() >
              a.project_category.toLowerCase()
            ? 1
            : 0
        }
      })
    }
    this.setState({
      [library]: projects,
      sort: tempSort
    })
  }

  formatFilterValue = (value, filterValue) => {
    switch (value) {
      case 'type':
        return (
          DISPLAY_VALUES[filterValue] ||
          filterValue.charAt(0).toUpperCase() +
            filterValue.slice(1).toLowerCase()
        )
      case 'fuel':
        return this.handleFormatFuelType(filterValue)
      case 'analysis':
        return this.handleFormatAnalysisFilter(filterValue)
      case 'buildingType':
        return this.handleFormatBuildingTypeFilter(filterValue)
      default:
        return filterValue
    }
  }

  formatDisplayValue = (value, type) => {
    let upperCaseValue = value.charAt(0).toUpperCase() + value.slice(1)
    switch (value) {
      case 'type':
        return type === 'plural' ? `${upperCaseValue}s` : upperCaseValue
      case 'category':
        return type === 'plural' ? 'Categories' : upperCaseValue
      case 'app':
        return type === 'plural' ? 'Applications' : 'Application'
      case 'tech':
        return type === 'plural' ? 'Technologies' : 'Technology'
      case 'fuel':
      case 'analysis':
      case 'utility':
        return upperCaseValue
      case 'buildingType':
        return type === 'plural' ? 'Building Types' : 'Building Type'
    }
  }

  handleDeleteProject = project => {
    this.props.handleDeleteProject(project).then(() => {
      this.props.getOrganizationProjects().then(projects => {
        this.setState({ orgLibrary: projects })
      })
    })
  }

  handleProjectTab = clickedTab => {
    if (this.state.activeTab !== clickedTab) {
      this.props.handleSelectedProjects([])
      this.setState({
        activeTab: clickedTab,
        selectedProjects: [],
        showPrivateExtras: '',
        showPublicExtras: '',
        orgLibrary: this.filterLibrary(this.state.originalOrgLibrary),
        publicLibrary: this.filterLibrary(this.state.originalPublicLibrary)
      })
    }
  }

  checkSelectedProject = (project, action, type) => {
    if (!this.props.library) {
      let tempSelectedProjects = [...this.state.selectedProjects]
      let projectObject = tempSelectedProjects.find(
        proj => JSON.stringify(proj.project) === JSON.stringify(project)
      )
      if (projectObject) {
        // remove if project is already in array
        tempSelectedProjects = tempSelectedProjects.filter(
          proj =>
            JSON.stringify(proj.project) !==
            JSON.stringify(projectObject.project)
        )
      } else {
        // add to array if it's not there
        tempSelectedProjects.push({
          project: project,
          action: action,
          type: type
        })
      }

      this.setState({
        selectedProjects: tempSelectedProjects,
        showPrivateExtras: '',
        showPublicExtras: ''
      })
      this.props.handleSelectedProjects(tempSelectedProjects)
    }
  }

  handleToggleExtras = (index, type) => {
    let extrasState =
      type === 'private' ? 'showPrivateExtras' : 'showPublicExtras'
    if (index === this.state[extrasState]) {
      // toggle off
      this.setState({ [extrasState]: '' })
      return
    }
    this.setState({ [extrasState]: index })
  }

  handleHideProjectFilters = () => {
    this.setState(prevState => ({
      hideProjectFilters: !prevState.hideProjectFilters
    }))
  }

  onMouseDown = event => {
    event.stopPropagation()
  }

  onMouseUp = event => {
    event.stopPropagation()
  }

  render() {
    const {
      myLibraryFilterLists,
      myLibraryFilterValues,
      publicFilterLists,
      publicFilterValues,
      activeTab
    } = this.state

    const filterLists =
      activeTab === 'myLibrary' ? myLibraryFilterLists : publicFilterLists
    const filterValues =
      activeTab === 'myLibrary' ? myLibraryFilterValues : publicFilterValues

    return (
      <div className={styles.projectListing}>
        <div
          className={classNames(
            styles.projectListingTitle,
            this.props.library ? styles.projectListingLibrary : ''
          )}
        >
          <div className={styles.container}>
            <h3>
              {this.props.library
                ? 'Measure Library'
                : 'Select a starting point for your measure'}
            </h3>
          </div>
        </div>

        <div
          className={classNames(
            styles.tabs,
            styles.sidePadding,
            this.props.library ? styles.projectListingLibrary : ''
          )}
        >
          <div className={styles.container}>
            <UserFeature name='myLibrary'>
              {({ enabled }) => {
                if (!enabled) return null
                return (
                  <div
                    className={classNames(
                      styles.tab,
                      this.state.activeTab === 'myLibrary'
                        ? styles.tabActive
                        : ''
                    )}
                    onClick={() => this.handleProjectTab('myLibrary')}
                  >
                    My Library
                  </div>
                )
              }}
            </UserFeature>
            <UserFeature name='publicLibrary'>
              {({ enabled }) => {
                if (!enabled) return null
                return (
                  <div
                    className={classNames(
                      styles.tab,
                      this.state.activeTab === 'publicLibrary'
                        ? styles.tabActive
                        : ''
                    )}
                    onClick={() => this.handleProjectTab('publicLibrary')}
                  >
                    Public Library
                  </div>
                )
              }}
            </UserFeature>
          </div>
        </div>

        <div className={styles.container}>
          <div className={styles.projectListingTools}>
            <div className={styles.projectListingFilter}>
              <div className={styles.projectListingFilterMobile}>
                <div onClick={this.handleHideProjectFilters}>
                  {this.state.hideProjectFilters ? (
                    <i className='material-icons'>arrow_drop_up</i>
                  ) : (
                    <i className='material-icons'>arrow_drop_down</i>
                  )}
                </div>
                <h3>Filters</h3>
              </div>

              <div className={styles.projectListingFilterHeader}>
                <h3>Filters</h3>
              </div>
              {/* All filter dropdowns */}
              {Object.keys(filterValues).map((value, index) => {
                if (
                  (value === 'utility' && filterLists.utility.length <= 0) ||
                  // value === 'app' ||
                  // value === 'tech' ||
                  (value === 'buildingType' &&
                    filterLists.buildingType.length <= 0)
                )
                  return // don't give a utility filter if there are none
                if (value === 'tech' || value === 'category') return null
                if (value == 'app') {
                  return (
                    <div key={index} className={styles.categoryWrapper}>
                      <Categorization
                        category={filterValues['category']}
                        application={filterValues['app']}
                        technology={filterValues['tech']}
                        hasPopulateOption={true}
                        populateData={{
                          category: filterLists['category'],
                          app: filterLists['app'],
                          tech: filterLists['tech']
                        }}
                        handleCategory={val => {
                          this.filterList(
                            {
                              target: {
                                value: val
                              }
                            },
                            'category'
                          )
                        }}
                        handleApplication={val => {
                          this.filterList(
                            {
                              target: {
                                value: val
                              }
                            },
                            'app'
                          )
                        }}
                        handleTechnology={val => {
                          this.filterList(
                            {
                              target: {
                                value: val
                              }
                            },
                            'tech'
                          )
                        }}
                        target='measure'
                      />
                    </div>
                  )
                }
                let sortedListOptions = filterLists[value] || []
                if (value === 'buildingType' && sortedListOptions) {
                  sortedListOptions = sortedListOptions
                    .map(item => item.trim())
                    .sort((itemA, itemB) => {
                      return this.handleFormatBuildingTypeFilter(
                        itemA.toLowerCase()
                      ).toLowerCase() <
                        this.handleFormatBuildingTypeFilter(
                          itemB.toLowerCase()
                        ).toLowerCase()
                        ? -1
                        : this.handleFormatBuildingTypeFilter(
                            itemA.toLowerCase()
                          ).toLowerCase() >
                          this.handleFormatBuildingTypeFilter(
                            itemB.toLowerCase()
                          ).toLowerCase()
                        ? 1
                        : 0
                    })
                }
                if (value === 'fuel' && !isEmpty(sortedListOptions)) {
                  let fuelSet = new Set()
                  sortedListOptions = sortedListOptions.filter(item => {
                    if (fuelSet.has(this.handleFormatFuelType(item)))
                      return false
                    fuelSet.add(this.handleFormatFuelType(item))
                    return true
                  })
                }
                return (
                  <div
                    key={index}
                    className={classNames(
                      styles.selectContainer,
                      this.state.hideProjectFilters ? styles.hide : ''
                    )}
                  >
                    <select
                      onChange={e => this.filterList(e, value)}
                      value={filterValues[value]}
                      onMouseDown={this.onMouseDown}
                      onMouseUp={this.onMouseUp}
                    >
                      <option
                        disabled
                        value='default'
                        defaultValue={filterValues[value] === 'default'}
                      >
                        {this.formatDisplayValue(value)}
                      </option>
                      <option value='all'>
                        All {this.formatDisplayValue(value, 'plural')}
                      </option>
                      {filterLists[value] &&
                        sortedListOptions.map((filterValue, index) => {
                          return (
                            <option
                              key={`${activeTab}_filterList_${index}`}
                              defaultValue={filterValues[value] === filterValue}
                              value={filterValue}
                            >
                              {this.formatFilterValue(value, filterValue)}
                            </option>
                          )
                        })}
                    </select>
                  </div>
                )
              })}
            </div>
            <div className={styles.projectListingSearch}>
              <input
                placeholder='Search for keywords'
                type='search'
                onChange={this.searchList}
                value={this.state.searchValue}
              />
              <i className='material-icons'>search</i>
            </div>
          </div>

          {activeTab === 'myLibrary' && (
            <div>
              <div className={styles.table}>
                <div
                  className={classNames(
                    styles.tableHeader,
                    this.state.sort.direction === 'ASC'
                      ? styles.tableHeaderSortASC
                      : styles.tableHeaderSortDESC
                  )}
                >
                  <div
                    className={classNames(
                      styles.tableRowItem,
                      styles.tableRowItem_4
                    )}
                    onClick={() =>
                      this.handleClickSort(
                        'name',
                        this.state.orgLibrary,
                        'orgLibrary'
                      )
                    }
                  >
                    Measure
                    {this.state.sort.key === 'name' ? (
                      <i className='material-icons'>arrow_downward</i>
                    ) : (
                      ''
                    )}
                  </div>
                  <div
                    className={classNames(
                      styles.tableRowItem,
                      styles.projectListingType
                    )}
                    onClick={() =>
                      this.handleClickSort(
                        'category',
                        this.state.orgLibrary,
                        'orgLibrary'
                      )
                    }
                  >
                    Category
                    {this.state.sort.key === 'category' ? (
                      <i className='material-icons'>arrow_downward</i>
                    ) : (
                      ''
                    )}
                  </div>
                  {!!this.props.library && (
                    <div className={styles.tableRowItem} />
                  )}
                </div>
                {this.state.orgLibrary &&
                  this.state.orgLibrary.length > 0 &&
                  this.state.orgLibrary.map((project, index) => {
                    return (
                      <div
                        key={index}
                        className={classNames(
                          styles.tableRow,
                          this.state.selectedProjects.find(
                            proj =>
                              JSON.stringify(proj.project) ===
                              JSON.stringify(project)
                          )
                            ? styles.projectListingSelected
                            : ''
                        )}
                      >
                        <div
                          className={classNames(
                            styles.tableRowItem,
                            styles.tableRowItem_4,
                            styles.projectListingName,
                            !this.props.library ? styles.pointer : ''
                          )}
                          onClick={() =>
                            this.checkSelectedProject(
                              project,
                              'projectAdd',
                              'project'
                            )
                          }
                        >
                          <div>
                            {replaceHTMLEntities(project.displayName)}
                            <span>{project.project_category}</span>
                          </div>
                        </div>
                        <div
                          className={classNames(
                            styles.tableRowItem,
                            styles.projectListingType
                          )}
                        >
                          {project.project_category}
                        </div>
                        {!!this.props.library && (
                          <div
                            className={classNames(
                              styles.tableRowItem,
                              styles.projectListingLastCol
                            )}
                          >
                            <div
                              data-test='private-project-extras-button'
                              onClick={() =>
                                this.handleToggleExtras(index, 'private')
                              }
                              className={classNames(
                                styles.extras,
                                'extrasClick',
                                this.state.showPrivateExtras === index
                                  ? styles.extrasShow
                                  : styles.extrasHide
                              )}
                            >
                              <span className={styles.extrasButton} />
                              <div
                                className={classNames(
                                  styles.extrasDropdown,
                                  styles.extrasDropdownRight
                                )}
                              >
                                <div
                                  className={styles.extrasLink}
                                  onClick={() =>
                                    this.props.handleOpenProject(
                                      project,
                                      'projectEdit',
                                      'project-edit'
                                    )
                                  }
                                >
                                  <i className='material-icons'>edit</i>Edit
                                </div>
                                <div
                                  className={styles.extrasLink}
                                  onClick={() =>
                                    this.props.handleOpenProject(
                                      project,
                                      'projectCopy',
                                      'project'
                                    )
                                  }
                                >
                                  <i className='material-icons'>file_copy</i>
                                  Copy
                                </div>
                                <div
                                  className={styles.extrasLink}
                                  onClick={() =>
                                    this.handleDeleteProject(project)
                                  }
                                >
                                  <i className='material-icons'>delete</i>Delete
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                {!this.state.orgLibrary ||
                  (this.state.orgLibrary.length == 0 && (
                    <div className={styles.tableRow}>
                      <div className={styles.tableRowItem}>
                        No Private Measures Found
                      </div>
                    </div>
                  ))}
              </div>
              {!this.state.orgLibrary ||
                (this.state.orgLibrary.length == 0 && (
                  <div className={styles.empty}>
                    <div className={styles.emptyBody}>
                      <div className={styles.emptyBodyTitle}>
                        Build your own measure library
                      </div>
                      <div className={styles.emptyBodyDescription}>
                        Copy measures from Public Library tab.
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {activeTab === 'publicLibrary' && (
            <div className={styles.table}>
              <div
                className={classNames(
                  styles.tableHeader,
                  this.state.sort.direction === 'ASC'
                    ? styles.tableHeaderSortASC
                    : styles.tableHeaderSortDESC
                )}
              >
                <div
                  className={classNames(
                    styles.tableRowItem,
                    styles.tableRowItem_4
                  )}
                  onClick={() =>
                    this.handleClickSort(
                      'name',
                      this.state.publicLibrary,
                      'publicLibrary'
                    )
                  }
                >
                  Measure
                  {this.state.sort.key === 'name' ? (
                    <i className='material-icons'>arrow_downward</i>
                  ) : (
                    ''
                  )}
                </div>
                <div
                  className={classNames(
                    styles.tableRowItem,
                    styles.projectListingType
                  )}
                  onClick={() =>
                    this.handleClickSort(
                      'category',
                      this.state.publicLibrary,
                      'publicLibrary'
                    )
                  }
                >
                  Category
                  {this.state.sort.key === 'category' ? (
                    <i className='material-icons'>arrow_downward</i>
                  ) : (
                    ''
                  )}
                </div>
              </div>
              {this.state.publicLibrary &&
                this.state.publicLibrary.length > 0 &&
                this.state.publicLibrary.map((project, index) => {
                  return (
                    <div
                      key={index}
                      className={classNames(
                        styles.tableRow,
                        this.state.selectedProjects.find(
                          proj =>
                            JSON.stringify(proj.project) ===
                            JSON.stringify(project)
                        )
                          ? styles.projectListingSelected
                          : ''
                      )}
                    >
                      <div
                        className={classNames(
                          styles.tableRowItem,
                          styles.tableRowItem_4,
                          styles.projectListingName
                        )}
                        onClick={() =>
                          this.checkSelectedProject(
                            project,
                            'projectAdd',
                            'measure'
                          )
                        }
                      >
                        <div>
                          {replaceHTMLEntities(project.displayName)}
                          <span>{project.project_category}</span>
                        </div>
                      </div>
                      <div
                        className={classNames(
                          styles.tableRowItem,
                          styles.projectListingType
                        )}
                      >
                        {project.project_category}
                      </div>
                    </div>
                  )
                })}
              {!this.state.publicLibrary ||
                (this.state.publicLibrary.length == 0 && (
                  <div className={styles.tableRow}>
                    <div className={styles.tableRowItem}>
                      No Public Measures Found
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    )
  }
}

export default ProjectListing
