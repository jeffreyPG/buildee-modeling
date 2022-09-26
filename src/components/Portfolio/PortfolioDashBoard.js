import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import styles from './PortfolioContainer.scss'
import buildingStyles from '../Building/Building.scss'
import DashboardFilterContainer from './DashboardFilterContainer'
import { Loader } from 'utils/Loader'
import { dashboardFilterOptions, dashboardTabs } from 'utils/PortfolioOptions'
import {
  updateDashboardFilters,
  getTableauToken,
  fetchBuildingGroups,
  deleteBuildingGroup,
  setBuildingGroup,
  toggleBuildingGroup
} from '../../routes/Portfolio/modules/portfolio'
import { toggleManageAllOrgs } from '../../routes/Organization/modules/organization'
import {
  updateBuildingViewMode,
  createSampleBuilding
} from '../../routes/Building/modules/building'
import Switch from 'components/Switch/Switch'
import PortfolioTableau from './PortfolioTableau'
import { isProdEnv } from 'utils/Utils'
import { ToggleTab } from 'components/Asset/ToggleTab'
import { DropdownMenu } from 'components/Asset/DropdownMenu'
import UserFeature from 'utils/Feature/UserFeature'
import PortfolioSyncPopup from './PortfolioSyncPopup'
import { downloadItem } from '../../utils/Utils'
import { getOrganizationIds, handleSearchFilter } from 'utils/Portfolio'

class PortfolioDashBoard extends Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    dashboard: PropTypes.object.isRequired,
    organizationList: PropTypes.array.isRequired,
    organizationView: PropTypes.object.isRequired,
    dashboardFilters: PropTypes.array.isRequired,
    handleTimeRangeChange: PropTypes.func.isRequired,
    timeRange: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    hardReload: PropTypes.func.isRequired,
    showTargets: PropTypes.bool.isRequired,
    onTargetsToggled: PropTypes.func.isRequired
  }

  state = {
    showBuildingFilter: false,
    showBuildingFilterContainer: false,
    showFilter: false,
    showMore: false,
    showFilterContainer: true,
    selectedView: 'Summary',
    isCreatingBuilding: false,
    showTabs: false,
    showPopup: false
  }

  UNSAFE_componentWillMount() {
    document.addEventListener('mousedown', this.handleClick, false)
    localStorage.setItem('tableauEmptyState', JSON.stringify(false))
    if (this.props.buildingGroups.length === 0) {
      this.props.fetchBuildingGroups()
    }
  }

  componentWillUnmount = () => {
    document.removeEventListener('mousedown', this.handleClick, false)
  }

  handleClick = e => {
    if (this.node && this.node.contains(e.target)) {
      // the click is inside, continue to menu links
      return
    }
    // otherwise, toggle (close) the dropdowns
    this.setState({ showTabs: false })
  }

  handleOpenFilter = () => {
    this.setState({
      showFilterContainer: true,
      showFilter: true
    })
  }

  handleToggleFilter = toggle => {
    if (toggle != undefined) this.setState({ showFilter: toggle })
    else {
      this.setState(prevState => ({
        showFilter: !prevState.showFilter
      }))
    }
  }

  handleShowFilter = toggle => {
    if (toggle != undefined)
      this.setState({
        showFilterContainer: toggle,
        showFilter: toggle ? true : false
      })
    else {
      this.setState(prevState => ({
        showFilterContainer: !prevState.showFilterContainer
      }))
    }
  }

  handleFilterChange = options => {
    this.props.updateDashboardFilters(options)
  }

  handleToggleTimeRange = toggle => {
    if (toggle != undefined) {
      this.setState({ showTimeRange: toggle })
    } else {
      this.setState(prevState => ({
        showTimeRange: !prevState.showTimeRange
      }))
    }
  }

  handleTimeRangeChange = options => {
    this.props.handleTimeRangeChange(options)
  }

  handleOpenMore = () => {
    const { showMore } = this.state
    this.setState({ showMore: !showMore })
  }

  handleClickAddBuilding = () => {
    this.props.push('/building/new')
  }

  handleToggleTabs = () => {
    this.setState(prevState => ({
      showTabs: !prevState.showTabs
    }))
  }

  handleClickAddSampleBuilding = () => {
    this.setState({ isCreatingBuilding: true })
    this.props
      .createSampleBuilding()
      .then(() => {
        this.props.updateBuildingViewMode('portfolio/dashboard')
        this.setState({ isCreatingBuilding: false })
      })
      .catch(() => {
        this.setState({ isCreatingBuilding: false })
      })
  }

  showPopup = () => {
    this.setState({ showPopup: true })
  }

  hidePopup = () => {
    this.setState({ showPopup: false })
  }

  renderEmptyState = status => {
    let { loading } = this.props

    if (status == 1) {
      return (
        <div>
          <div className={styles.empty}>
            <div className={styles.emptyBody}>
              <div className={styles.emptyBodyTitle}>
                Add a building to get started
              </div>
              <div className={styles.emptyBodyDescription}>
                Add your own building or work from a sample building.
              </div>
              <div className={styles.emptyButtons}>
                <button
                  className={classNames(styles.button, styles.buttonPrimary)}
                  onClick={this.handleClickAddBuilding}
                >
                  <i className="material-icons">add</i> Add Building
                </button>
                {this.state.isCreatingBuilding === false && (
                  <button
                    className={classNames(styles.button, styles.buttonPrimary)}
                    onClick={this.handleClickAddSampleBuilding}
                  >
                    <i className="material-icons">add</i> Sample Building
                  </button>
                )}
                {this.state.isCreatingBuilding === true && (
                  <button
                    className={classNames(
                      styles.button,
                      styles.buttonPrimary,
                      styles.buttonDisable
                    )}
                    type="submit"
                    disabled
                  >
                    <Loader size="button" color="white" />
                  </button>
                )}
              </div>
            </div>
          </div>
          {loading && (
            <div className={styles.portfolioContainerLoading}>
              <Loader />
              <div className={styles.loadingBuilding}>
                <div>One moment while we get your data...</div>
              </div>
            </div>
          )}
        </div>
      )
    } else {
      return (
        <div>
          <div className={styles.empty}>
            <div className={styles.emptyBody}>
              <div className={styles.emptyBodyTitle}>
                Add buildings with utility bills or measures to start
                tracking...
              </div>
              <div className={styles.emptyBodyDescription}>
                your portfolio performance and improvements.
              </div>
              <div className={styles.emptyButtons}>
                <button
                  className={classNames(styles.button, styles.buttonPrimary)}
                  onClick={() => {
                    this.props.handleTabChange(2, 'Buildings', true)
                  }}
                >
                  Go To buildings
                </button>
              </div>
            </div>
          </div>
          {loading && (
            <div className={styles.portfolioContainerLoading}>
              <Loader />
              <div className={styles.loadingBuilding}>
                <div>One moment while we get your data...</div>
              </div>
            </div>
          )}
        </div>
      )
    }
  }

  renderEmptyChartState = () => {
    const {
      dashboard,
      dashboardFilters,
      selectedDashboardTab,
      selectedDashboardSubTab
    } = this.props

    let selectedTabName =
      (selectedDashboardTab && selectedDashboardTab.name) || 'Energy Use'

    let selectedTabOption = _.find(dashboardTabs, { name: selectedTabName })

    let selectedSubName =
      (selectedDashboardSubTab && selectedDashboardSubTab.name) ||
      selectedTabOption.subTabs[0].name
    let title = 'Add a Building with Utility Bills'
    let description = 'Navigate to a building and add utilities'

    if (selectedTabName === 'Measures') {
      let projects = dashboard.projects || []
      if (projects.length === 0) {
        title = 'Create Your First Measure'
        description = 'Navigate to a building and add a measure'
      } else {
        title = 'No Measures Found'
        description = 'Update your filters and try again'
      }
    }
    if (selectedTabName === 'Projects') {
      let projectPackages = dashboard.projectPackages || []
      if (projectPackages.length === 0) {
        title = 'Create Your First Project'
        description = 'Navigate to a building and add a project'
      } else {
        title = 'No Projects Found'
        description = 'Update your filters and try again'
      }
    }

    return (
      <div className={styles.emptyChartBody}>
        <div className={styles.emptyChartTitle}>{title}</div>
        <div className={styles.emptyChartDescription}>{description}</div>
      </div>
    )
  }

  checkEmptyState = () => {
    const {
      buildings = [],
      projectPackages = [],
      projects = []
    } = this.props.dashboard
    let archivedBuilding = buildings.filter(
      building => building.archived === false
    )
    if (archivedBuilding.length === 0) return 1
    let flag = buildings.every(
      building =>
        !building.monthlyUtilities || building.monthlyUtilities.length === 0
    )
    if (flag && projects.length === 0 && projectPackages.length === 0) return 2
    return 0
  }

  getTableauEmptyState = () => {
    let {
      dashboard,
      dashboardFilters,
      loading,
      timeRange,
      selectedDashboardTab
    } = this.props
    let { buildings, projects, projectPackages } = dashboard

    if (loading) return true

    let buildingFilters = dashboardFilters.filter(
      filter => filter.tab == 'building' || filter.tab === 'all'
    )
    let projectFilters = dashboardFilters.filter(
      filter => filter.tab == 'project'
    )
    let projectPackageFilters = dashboardFilters.filter(
      filter => filter.tab == 'projectPackage'
    )

    let selectedTabName =
      (selectedDashboardTab && selectedDashboardTab.name) || 'Energy Use'

    let buildingList = handleSearchFilter(
      this.props.user,
      buildings,
      '',
      buildingFilters,
      timeRange
    )
    let buildingIds = buildingList.map(building => building._id)
    buildingIds = [...new Set(buildingIds)]

    let projectList = handleSearchFilter(
      this.props.user,
      projects,
      '',
      projectFilters,
      timeRange
    )

    projectList = projectList.filter(project => {
      let buildingId =
        (project && project.building && project.building._id) || ''
      if (buildingId && buildingIds.includes(buildingId)) return true
      return false
    })

    let projectPackageList = handleSearchFilter(
      this.props.user,
      projectPackages,
      '',
      projectPackageFilters,
      timeRange
    )

    projectPackageList = projectPackageList.filter(project => {
      let buildingId =
        (project && project.building && project.building._id) || ''
      if (buildingId && buildingIds.includes(buildingId)) return true
      return false
    })

    if (buildingList.length === 0) return true
    if (selectedTabName === 'Measures') return projectList.length === 0
    if (selectedTabName === 'Projects') return projectPackageList.length === 0

    return false
  }

  checkTableauEmptyState = () => {
    let emptyState = this.getTableauEmptyState()
    let previousEmptyState = JSON.parse(
      localStorage.getItem('tableauEmptyState')
    )
    if (previousEmptyState !== emptyState) {
      this.props.getTableauToken()
    }
    localStorage.setItem('tableauEmptyState', JSON.stringify(emptyState))
    return emptyState
  }

  renderCharViewOption() {
    let {
      selectedDashboardTab,
      selectedDashboardSubTab,
      viewOptions,
      toggleViewOption
    } = this.props
    let selectedTabName =
      (selectedDashboardTab && selectedDashboardTab.name) || 'Energy Use'

    let selectedTabOption = _.find(dashboardTabs, { name: selectedTabName })

    let selectedSubName =
      (selectedDashboardSubTab && selectedDashboardSubTab.name) ||
      selectedTabOption.subTabs[0].name

    let selectedSubTabOption = _.find(selectedTabOption.subTabs, {
      name: selectedSubName
    })
    let components =
      (selectedSubTabOption && selectedSubTabOption.components) || []
    if (!components.length) return null

    return (
      <div className={styles.chartFilterContainer}>
        {components.map((component, index) => {
          switch (component.name) {
            case 'toggle': {
              toggleViewOption = toggleViewOption || component.options[0].value
              return (
                <ToggleTab
                  key={index}
                  onToggle={this.props.handleToggleViewOption}
                  options={component.options}
                  defaultOption={toggleViewOption}
                />
              )
            }
            case 'dropdown': {
              return (
                <DropdownMenu
                  key={`dropdown-menu ${index}`}
                  onSelect={value =>
                    this.props.handleChangeViewOption(index, value)
                  }
                  options={component.options}
                  selectedView={viewOptions[index] || ''}
                />
              )
            }
          }
        })}
      </div>
    )
  }

  getChartURL = (selectedTabOption, selectedSubTabOpion, viewOptions) => {
    const target = isProdEnv(process.env.DOMAIN_ENV) ? 'buildee' : 'buildeebeta'
    let chartURL = ''
    if (selectedSubTabOpion) {
      chartURL = selectedSubTabOpion.route.replace(
        '/#/site/buildeebeta/',
        `/t/${target}/`
      )
      if (
        selectedTabOption.name === 'Measures' ||
        selectedTabOption.name === 'Projects'
      ) {
        let firstComponent = selectedSubTabOpion.components[0]
        let firstViewOption = viewOptions[0] || firstComponent.options[0].value
        let selectedViewOption =
          _.find(firstComponent.options, {
            value: firstViewOption
          }) || firstComponent.options[0]

        chartURL = selectedViewOption.route.replace(
          '/#/site/buildeebeta/',
          `/t/${target}/`
        )
      }
    }
    return chartURL
  }

  getParam = (
    selectedTabOption,
    selectedSubTabOpion,
    toggleViewOption,
    viewOptions
  ) => {
    let components = selectedSubTabOpion.components || []
    let {
      timeRange,
      dashboardFilters,
      organizationView,
      organizationList
    } = this.props
    let paramter = {
      start_year: timeRange.start,
      end_year: timeRange.end,
      year_type: timeRange.type
    }
    components.forEach((component, index) => {
      if (component.name === 'toggle') {
        let value
        if (toggleViewOption === null)
          toggleViewOption = component.options[0].value
        if (toggleViewOption === 'Total') value = false
        else value = true
        paramter[component.paramName] = value
      } else if (component.name === 'dropdown') {
        let dropdownValue = viewOptions[index]
        if (dropdownValue === null) dropdownValue = component.options[0].value
        if (selectedTabOption.name === 'Part to Whole') {
          if (dropdownValue !== 'All')
            paramter[component.paramName] = dropdownValue
          else paramter[component.paramName] = 1000000
        } else {
          if (
            selectedTabOption.name === 'Measures' ||
            selectedTabOption.name === 'Projects'
          ) {
            let secondComponent = components[1]
            let secondOption =
              viewOptions[1] || secondComponent.options[0].value
            paramter[secondComponent.paramName] = secondOption.toLowerCase()
          }
        }
      }
    })

    let buildingFilters =
      dashboardFilters.filter(
        filter =>
          filter.tab == 'building' && !filter.value.includes('organization')
      ) || []
    let organizationFilters = buildingFilters.filter(filter =>
      filter.value.includes('organization')
    )
    let orgIds = getOrganizationIds(
      organizationFilters,
      organizationView,
      organizationList,
      this.props.routeOrganizationId
    )
    paramter.organization_id = orgIds
    buildingFilters = buildingFilters.filter(
      filter => !filter.value.includes('organization')
    )
    let projectFilters =
      dashboardFilters.filter(
        filter => filter.tab === 'project' || filter.tab === 'projectPackage'
      ) || []

    projectFilters = projectFilters.filter(
      filter => !filter.value.includes('organization')
    )

    let buildingMultiSelectSet = new Set()
    let projectMultiSelectSet = new Set()

    buildingFilters.forEach(filter => {
      if (filter.paramName) {
        if (filter.select === 'range' || filter.select === 'yearRange') {
          let parametersHigh = `${filter.paramName}_high`
          let parametersLow = `${filter.paramName}_low`
          paramter[parametersLow] = filter.options.start
          paramter[parametersHigh] = filter.options.end
        } else if (
          filter.select === 'costRange' ||
          filter.select === 'yearRange'
        ) {
          let parametersHigh = `${filter.paramName}_high`
          let parametersLow = `${filter.paramName}_low`
          if (filter.options.option === 'Less than')
            paramter[parametersHigh] = filter.options.cost
          else if (filter.options.option === 'Equal to') {
            paramter[parametersHigh] = filter.options.cost
            paramter[parametersLow] = filter.options.cost
          } else paramter[parametersLow] = filter.options.cost
        } else if (filter.select === 'multiSelect') {
          if (!buildingMultiSelectSet.has(filter.paramName)) {
            buildingMultiSelectSet.add(filter.paramName)
            let sameFilters = buildingFilters.filter(
              item => item.value === filter.value
            )
            let options = sameFilters.map(item => item.options.value)
            if (!(sameFilters.length && sameFilters[0].options.selectedAll))
              paramter[filter.paramName] = options
          }
        }
      }
    })

    projectFilters.forEach(filter => {
      if (filter.paramName) {
        if (filter.select === 'range') {
          let parametersHigh = `${filter.paramName}_high`
          let parametersLow = `${filter.paramName}_low`
          paramter[parametersLow] = filter.options.start
          paramter[parametersHigh] = filter.options.end
        } else if (filter.select === 'costRange') {
          let parametersHigh = `${filter.paramName}_high`
          let parametersLow = `${filter.paramName}_low`
          if (filter.options.option === 'Less than')
            paramter[parametersHigh] = filter.options.cost
          else if (filter.options.option === 'Equal to') {
            paramter[parametersHigh] = filter.options.cost
            paramter[parametersLow] = filter.options.cost
          } else paramter[parametersLow] = filter.option.cost
        } else if (filter.select === 'multiSelect') {
          if (!projectFilters.has(filter.paramName)) {
            projectMultiSelectSet.add(filter.paramName)
            let sameFilters = projectFilters.filter(
              item => item.value === filter.value
            )
            let options = sameFilters.map(item => item.options.value)
            if (!(sameFilters.length && sameFilters[0].options.selectedAll))
              paramter[filter.paramName] = options
          }
        }
      }
    })

    return paramter
  }

  getDownloadURL = () => {
    let {
      selectedDashboardTab,
      selectedDashboardSubTab,
      toggleViewOption,
      viewOptions
    } = this.props

    const target = isProdEnv(process.env.DOMAIN_ENV) ? 'exportBeta' : 'exportQA'
    let selectedTabName =
      (selectedDashboardTab && selectedDashboardTab.name) || 'Energy Use'

    let selectedTabOption = _.find(dashboardTabs, { name: selectedTabName })

    let selectedSubTabName =
      (selectedDashboardSubTab && selectedDashboardSubTab.name) ||
      selectedTabOption.subTabs[0].name

    let selectedSubTabOpion = _.find(selectedTabOption.subTabs, {
      name: selectedSubTabName
    })

    let params = this.getParam(
      selectedTabOption,
      selectedSubTabOpion,
      toggleViewOption,
      viewOptions
    )
    let downloadURL = ''
    if (selectedSubTabOpion) {
      downloadURL = selectedSubTabOpion[target]
      if (
        selectedTabOption.name === 'Measures' ||
        selectedTabOption.name === 'Projects'
      ) {
        let firstComponent = selectedSubTabOpion.components[0]
        let firstViewOption = viewOptions[0] || firstComponent.options[0].value
        let selectedViewOption =
          _.find(firstComponent.options, {
            value: firstViewOption
          }) || firstComponent.options[0]
        downloadURL = selectedViewOption[target]
      }
    }
    return { downloadURL, params }
  }

  exportPDF = () => {
    let { downloadURL, params } = this.getDownloadURL()
    const target = isProdEnv(process.env.DOMAIN_ENV) ? 'buildee' : 'buildeebeta'
    let encodedURL = encodeURIComponent(downloadURL)
    if (params) {
      for (let key in params) {
        encodedURL += '&' + key + '=' + params[key]
      }
    }

    console.log(
      'EXPORT PDF URL',
      `/pdf/export?urls=${encodedURL}&target=${target}`
    )

    downloadItem(`/pdf/export?urls=${encodedURL}&target=${target}`)
  }

  toggleEditGroup = value => {
    this.props.toggleBuildingGroup(value)
  }

  onAddGroup = () => {
    const { manageAllOrgSelected, organizationView } = this.props
    this.props.toggleBuildingGroup(true)
    this.props.setBuildingGroup()
    if (manageAllOrgSelected) {
      this.props.push('/organization/all/portfolio/building')
    } else {
      this.props.push(
        `/organization/${organizationView._id}/portfolio/building`
      )
    }
  }

  onSelectGroup = groupId => {
    const { buildingGroups, organizationList } = this.props
    const selectedGroup =
      groupId != 'all' && buildingGroups.find(group => group._id === groupId)
    if (
      selectedGroup &&
      selectedGroup.orgIds &&
      selectedGroup.orgIds.length > 1 &&
      organizationList.length > 1
    ) {
      this.props.toggleManageAllOrgs(true)
      this.props.push('/organization/all/portfolio/dashboard')
    }
    this.props.setBuildingGroup(groupId !== 'all' ? groupId : null)
    this.props.toggleBuildingGroup(false)
  }

  onEditGroup = groupId => {
    const { buildingGroups, organizationView, organizationList } = this.props
    this.props.toggleBuildingGroup(true)
    this.props.setBuildingGroup(groupId)
    const selectedGroup =
      groupId != 'all' && buildingGroups.find(group => group._id === groupId)
    if (
      selectedGroup &&
      selectedGroup.orgIds &&
      selectedGroup.orgIds.length > 1 &&
      organizationList.length > 1
    ) {
      this.props.toggleManageAllOrgs(true)
      this.props.push('/organization/all/portfolio/building')
    } else {
      this.props.push(
        `/organization/${organizationView._id}/portfolio/building`
      )
    }
  }

  onDeleteGroup = groupId => {
    this.props.deleteBuildingGroup(groupId)
  }

  render() {
    let {
      showFilterContainer,
      showFilter,
      showTimeRange,
      showMore,
      showTabs
    } = this.state
    let {
      loading,
      onTargetsToggled,
      showTargets,
      selectedDashboardTab,
      selectedDashboardSubTab,
      dashboardFilters,
      user,
      dashboard,
      timeRange,
      toggleViewOption,
      viewOptions,
      buildingGroups,
      selectedBuildingGroupId
    } = this.props

    let selectedTabName =
      (selectedDashboardTab && selectedDashboardTab.name) || 'Energy Use'

    let selectedTabOption = _.find(dashboardTabs, { name: selectedTabName })

    let selectedSubTabName =
      (selectedDashboardSubTab && selectedDashboardSubTab.name) ||
      selectedTabOption.subTabs[0].name

    // let tableauKey =
    //   JSON.stringify(dashboardFilters) +
    //   JSON.stringify(tableauToken) +
    //   JSON.stringify(this.props.routeOrganizationId)

    let selectedSubTabOpion = _.find(selectedTabOption.subTabs, {
      name: selectedSubTabName
    })
    let chartURL = this.getChartURL(
      selectedTabOption,
      selectedSubTabOpion,
      viewOptions
    )
    let hasSubTab =
      (selectedTabOption &&
        selectedTabOption.subTabs &&
        selectedTabOption.subTabs.length > 1) ||
      false

    let params = this.getParam(
      selectedTabOption,
      selectedSubTabOpion,
      toggleViewOption,
      viewOptions
    )
    let checkEmpty = this.checkEmptyState()
    let tableauEmptyState = this.checkTableauEmptyState()

    return (
      <div>
        <div className={styles.portfolioContainerSecondHeader}>
          <div className={classNames(styles.container)}>
            <div
              className={classNames(
                styles.panelFilter,
                loading ? styles.disable : ''
              )}
            >
              <div>
                <div
                  onClick={this.handleToggleTabs}
                  className={classNames(
                    buildingStyles.buildingButtonsMore,
                    buildingStyles.extras,
                    showTabs
                      ? buildingStyles.extrasShow
                      : buildingStyles.extrasHide,
                    styles.dashboard,
                    !hasSubTab ? styles.dashboardOneSubTab : ''
                  )}
                  ref={node => (this.node = node)}
                >
                  <div className={styles.dashboardTab}>
                    <span>{selectedTabName}</span>
                    {showTabs ? (
                      <i className="material-icons">expand_less</i>
                    ) : (
                      <i className="material-icons">expand_more</i>
                    )}
                  </div>
                  <div
                    className={classNames(
                      buildingStyles.extrasDropdown,
                      buildingStyles.extrasDropdownLeft,
                      styles.dashboardTabList
                    )}
                  >
                    {dashboardTabs.map((item, index) => {
                      if (item.name === 'Projects')
                        return (
                          <UserFeature name="projectProject" key={index}>
                            {({ enabled }) => {
                              if (!enabled) return null
                              return (
                                <div
                                  key={item.name}
                                  className={classNames(
                                    styles.extrasLink,
                                    selectedTabName === item.name
                                      ? styles.dashboardTabActive
                                      : ''
                                  )}
                                  onClick={() =>
                                    this.props.handleDashboardTabChange(
                                      index,
                                      item.name
                                    )
                                  }
                                >
                                  {item.name}
                                </div>
                              )
                            }}
                          </UserFeature>
                        )
                      return (
                        <div
                          key={item.name}
                          className={classNames(
                            styles.extrasLink,
                            selectedTabName === item.name
                              ? styles.dashboardTabActive
                              : ''
                          )}
                          onClick={() =>
                            this.props.handleDashboardTabChange(
                              index,
                              item.name
                            )
                          }
                        >
                          {item.name}
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className={styles.subTab}>
                  {hasSubTab && (
                    <ToggleTab
                      options={selectedTabOption.subTabs}
                      defaultOption={selectedSubTabName}
                      onToggle={this.props.handleDashboardSubTabChange}
                    />
                  )}
                </div>
              </div>

              <div
                className={classNames(
                  buildingStyles.buildingButtons,
                  styles.filterButtons,
                  styles.dashboardFilterButtons
                )}
              >
                {/* <div className={styles.buildingButtonsAdd}>
                  <div
                    className={styles.filterSelect}
                    onClick={this.handleOpenFilter}
                  >
                    Filter &nbsp;
                    <i className="material-icons">tune</i>
                  </div>
                </div> */}
                {/* <div className={styles.filterSelect} onClick={onTargetsToggled}>
                  <Switch
                    label="Targets"
                    isSet={showTargets}
                    onSwitchToggled={onTargetsToggled}
                  />
                </div> */}
                {/* <div className={styles.filterSelect} onClick={this.exportPDF}>
                  Export&nbsp;
                  <i className="material-icons">cloud_download</i>
                </div> */}
                <div className={styles.buildingButtonsAdd}>
                  <div
                    className={styles.filterSelect}
                    onClick={this.props.hardReload}
                    onMouseEnter={this.showPopup}
                    onMouseLeave={this.hidePopup}
                  >
                    <i className="material-icons">replay</i>
                  </div>
                  {this.state.showPopup && <PortfolioSyncPopup />}
                </div>
              </div>
            </div>
            <DashboardFilterContainer
              user={user}
              showFilter={showFilter}
              handleFilterChange={this.handleFilterChange}
              handleToggleFilter={this.handleToggleFilter}
              handleShowFilter={this.handleShowFilter}
              FilterOptions={dashboardFilterOptions}
              dashboardFilters={dashboardFilters}
              dashboard={dashboard}
              activeTab={'dashboard'}
              loading={loading}
              showTimeRange={showTimeRange}
              timeRange={timeRange}
              handleTimeRangeChange={this.handleTimeRangeChange}
              handleToggleTimeRange={this.handleToggleTimeRange}
              buildingGroups={buildingGroups}
              toggleEditGroup={this.toggleEditGroup}
              onSelectGroup={this.onSelectGroup}
              onEditGroup={this.onEditGroup}
              onDeleteGroup={this.onDeleteGroup}
              onAddGroup={this.onAddGroup}
              selectedBuildingGroupId={selectedBuildingGroupId}
            />
          </div>
        </div>
        {!!checkEmpty && this.renderEmptyState(checkEmpty)}
        {!checkEmpty && (
          <div className={styles.container}>
            <div
              className={classNames(
                styles.panelChart,
                loading ? styles.cursorWait : ''
              )}
            >
              {loading && (
                <div className={styles.portfolioContainerLoading}>
                  <Loader />
                  <div className={styles.loadingBuilding}>
                    <div>One moment while we get your data...</div>
                  </div>
                </div>
              )}
              {!!tableauEmptyState ? (
                <div className={styles.emptyChart}>
                  {this.renderEmptyChartState()}
                </div>
              ) : (
                <div
                  className={classNames(
                    loading ? styles.disable : '',
                    styles.dashboardChartContainer
                  )}
                >
                  <PortfolioTableau
                    // key={tableauKey}
                    url={chartURL}
                    timeRange={timeRange}
                    tab="portfolioDashboard"
                    routeOrganizationId={this.props.routeOrganizationId}
                    showTargets={false}
                    params={params}
                    buildingGroups={buildingGroups}
                    selectedBuildingGroupId={selectedBuildingGroupId}
                  />
                  {this.renderCharViewOption()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }
}
const mapDispatchToProps = {
  push,
  updateDashboardFilters,
  createSampleBuilding,
  updateBuildingViewMode,
  getTableauToken,
  fetchBuildingGroups,
  deleteBuildingGroup,
  setBuildingGroup,
  toggleBuildingGroup,
  toggleManageAllOrgs
}

const mapStateToProps = state => ({
  user: state.login.user || {},
  dashboard: state.portfolio.dashboard || {},
  dashboardFilters: state.portfolio.dashboardFilters || [],
  organizationList: state.organization.organizationList || [],
  organizationView: state.organization.organizationView || {},
  loading: state.portfolio.loading || false,
  buildingGroups: state.portfolio.buildingGroups,
  selectedBuildingGroupId: state.portfolio.selectedBuildingGroupId,
  manageAllOrgSelected: state.organization.manageAllOrgSelected || false
})

export default connect(mapStateToProps, mapDispatchToProps)(PortfolioDashBoard)
