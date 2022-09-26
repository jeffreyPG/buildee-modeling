import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import moment from 'moment'
import _ from 'lodash'

import PortfolioContainerHeader from './PortfolioContainerHeader'
import PortfolioDashBoard from './PortfolioDashBoard'
import PortfolioEquipmentList from './PortfolioEquipmentList'
import PortfolioBuildings from './PortfolioBuildings'
import PortfolioProjects from './PortfolioProjects'
import PortfolioProjectPackages from './PortfolioProjectPackages'
import PortfolioTeamList from './PortfolioTeamList'
import ScenarioList from './Scenario/ScenarioList'
import PortfolioProposal from './Proposal/PortfolioProposal'
import TargetModal from 'containers/Modal/TargetModal'

import {
  getPortfolioDashboard,
  updatePortfolioTab,
  getTableauToken,
  updateDashboardFilters
} from 'routes/Portfolio/modules/portfolio'
import { updateBuildingListStatus } from 'routes/Building/modules/building'
import { toggleTargets } from 'routes/Organization/modules/organization'

import {
  checkOrganizationFilterChange,
  getOrganizationIds
} from 'utils/Portfolio'
import { isProdEnv } from 'utils/Utils'
import { dashboardTabs } from 'utils/PortfolioOptions'

import styles from './PortfolioContainer.scss'

class PortfolioContainer extends Component {
  _isMounted = false

  static propTypes = {
    user: PropTypes.object.isRequired,
    push: PropTypes.func.isRequired,
    filters: PropTypes.array.isRequired,
    organizationList: PropTypes.array.isRequired,
    organizationView: PropTypes.object.isRequired,
    reload: PropTypes.bool.isRequired,
    updateOrganization: PropTypes.func.isRequired
  }

  state = {
    showTargetModal: false,
    tabs: [
      { name: 'Dashboard', route: 'dashboard', active: true },
      { name: 'Buildings', route: 'building', active: true },
      { name: 'Measures', route: 'measure', active: true },
      { name: 'Projects', route: 'project', active: true },
      {
        name: 'Proposals',
        route: 'proposal',
        active: true
      },
      { name: 'Equipments', route: 'equipment', active: true },
      { name: 'Teams', route: 'team', active: true },
      {
        name: 'Scenarios',
        route: 'scenario',
        active: true,
        featureFlag: true
      }
    ],
    timeRange: {
      type: '',
      start: '',
      end: ''
    },
    selectedDashboardTab: {
      name: 'Energy Use'
    },
    selectedDashboardSubTab: {
      name: 'Usage'
    },
    toggleViewOption: 'Total',
    viewOptions: [null, null]
  }

  UNSAFE_componentWillMount() {
    const { routeParams, selectedView, manageAllOrgSelected } = this.props
    let { tab, organizationId } = routeParams
    const { tabs } = this.state
    let currentTab = _.find(tabs, { route: tab })
    if (currentTab) {
      tab = currentTab
    } else {
      tab = { name: 'Dashboard', route: 'dashboard', active: true }
    }
    if (
      Object.entries(selectedView).length != 0 &&
      selectedView.constructor === Object
    ) {
      this.props.updatePortfolioTab({ name: tab.name })
      if (manageAllOrgSelected) {
        this.props.updateDashboardFilters([
          {
            label: 'Organization Name',
            name: 'Organization Name',
            options: {
              selectedAll: true
            },
            select: 'multiSelect',
            tab: 'building',
            value: 'organization.name'
          }
        ])
      }
      this.props.push(
        '/organization/' +
          (manageAllOrgSelected
            ? 'all'
            : this.props.organizationView._id || organizationId) +
          '/portfolio/' +
          tab.route
      )
    } else {
      this.props.updatePortfolioTab({ name: 'Dashboard' })
    }
  }

  componentDidMount() {
    this._isMounted = true
    window.addEventListener('beforeunload', this.componentCleanup)
    this.setDefaultTimeRange()
    setTimeout(() => {
      this.props.getTableauToken()
    }, 500)

    const { filters, routeParams, dashboard, reload } = this.props
    if (
      reload ||
      this.isEmptyDashboard(dashboard) ||
      this.checkDashboardOrg(dashboard, routeParams.organizationId) ||
      this.checkOrganization(
        this.props.organizationView,
        routeParams.organizationId
      )
    ) {
      const orgFilters = filters.filter(filter =>
        filter.value.includes('organization')
      )
      let organizationIds = getOrganizationIds(
        orgFilters,
        this.props.organizationView,
        this.props.organizationList,
        routeParams.organizationId
      )
      this.props.getPortfolioDashboard(
        routeParams.organizationId,
        organizationIds
      )
    }
  }

  UNSAFE_componentWillReceiveProps = nextProps => {
    if (
      nextProps.reload ||
      !nextProps.loading ||
      nextProps.routeParams.organizationId !=
        this.props.routeParams.organizationId
    ) {
      if (!this.props.manageAllOrgSelected && nextProps.manageAllOrgSelected) {
        this.props.updateDashboardFilters([
          {
            label: 'Organization Name',
            name: 'Organization Name',
            options: {
              selectedAll: true
            },
            select: 'multiSelect',
            tab: 'building',
            value: 'organization.name'
          }
        ])
      } else if (
        this.props.manageAllOrgSelected &&
        !nextProps.manageAllOrgSelected
      ) {
        this.props.updateDashboardFilters([])
      }
      if (
        !checkOrganizationFilterChange(
          this.props.filters,
          nextProps.filters,
          nextProps.organizationView,
          nextProps.organizationList,
          nextProps.routeParams.organizationId
        ) ||
        nextProps.routeParams.organizationId !=
          this.props.routeParams.organizationId
      ) {
        const organizationIds = getOrganizationIds(
          nextProps.filters,
          nextProps.organizationView,
          nextProps.organizationList,
          nextProps.routeParams.organizationId
        )
        this.props.getPortfolioDashboard(
          nextProps.organizationView._id ||
            nextProps.routeParams.organizationId,
          organizationIds
        )
        this.getTableauEmptyState({ filters: nextProps.filters })
      }
    }
    if (this.props.filters !== nextProps.filters) {
      this.getTableauEmptyState({ filters: nextProps.filters, check: false })
    }

    if (nextProps.routeParams.tab !== this.props.routeParams.tab) {
      const { routeParams, selectedView } = nextProps
      let { tab, organizationId } = routeParams
      const { tabs } = this.state
      let currentTab = _.find(tabs, { route: tab })
      if (currentTab) {
        tab = currentTab
      } else {
        tab = { name: 'Dashboard', route: 'dashboard', active: true }
      }
      if (
        Object.entries(selectedView).length != 0 &&
        selectedView.constructor === Object
      ) {
        this.props.updatePortfolioTab({ name: tab.name })
        this.props.push(
          '/organization/' +
            (nextProps.manageAllOrgSelected
              ? 'all'
              : this.props.organizationView._id || organizationId) +
            '/portfolio/' +
            tab.route
        )
      } else {
        this.props.updatePortfolioTab({ name: 'Dashboard' })
      }
      setTimeout(() => {
        this.getTableauEmptyState()
      }, 500)
    }
  }

  componentCleanup = () => {
    this._isMounted = false
    if (!isProdEnv(process.env.DOMAIN_ENV)) {
      window.Intercom('shutdown', {
        app_id: 'gqgtysua'
      })
      window.Intercom('update')
    }
    this.props.updatePortfolioTab({ name: 'Dashboard' })
  }

  componentWillUnmount() {
    this.componentCleanup()
    window.removeEventListener('beforeunload', this.componentCleanup)
  }

  isEmptyDashboard = dashboard => {
    return (
      dashboard.buildings?.length === 0 &&
      dashboard.projects?.length === 0 &&
      dashboard.projectPackages?.length === 0
    )
  }

  handleTabChange = (index, name, active) => {
    let { selectedView, manageAllOrgSelected } = this.props
    if (active && name !== selectedView.name) {
      selectedView = this.state.tabs.find(tab => tab.name === name)
      this.props.updatePortfolioTab(selectedView).then(() => {
        this.props.push(
          '/organization/' +
            (manageAllOrgSelected ? 'all' : this.props.organizationView._id) +
            '/portfolio/' +
            selectedView.route
        )
        this.getTableauEmptyState()
      })
      if (name === 'Dashboard') {
        this.setState({
          selectedDashboardTab: {
            name: 'Energy Use'
          },
          selectedDashboardSubTab: {
            name: 'Usage'
          },
          toggleViewOption: 'Total'
        })
      }
    }
  }

  handleChangeViewOption = (index, value) => {
    let { viewOptions } = this.state
    if (index == 0) {
      this.setState({
        viewOptions: [value, viewOptions[1]]
      })
    } else {
      this.setState({
        viewOptions: [viewOptions[0], value]
      })
    }
    this.props.getTableauToken()
    this.props.getTableauToken()
  }

  handleToggleViewOption = value => {
    if (value != this.state.toggleViewOption)
      this.setState({ toggleViewOption: value })
    this.props.getTableauToken()
    this.props.getTableauToken()
  }

  handleTimeRangeChange = options => {
    const { timeRange } = this.state
    this.setState({ timeRange: options })
    if (options.type !== timeRange.type) {
      this.getTableauEmptyState({ timeRange: options })
    } else {
      this.getTableauEmptyState()
    }
  }

  setDefaultTimeRange = () => {
    let { timeRange } = this.state
    timeRange = {
      type: 'Calendar',
      start: +moment()
        .subtract(4, 'years')
        .format('YYYY'),
      end: +moment()
        // .add(1, 'years')
        .format('YYYY')
    }
    this.setState({ timeRange })
    this.getTableauEmptyState({ timeRange })
  }

  checkDashboardOrg = (dashboard, organizationId) => {
    let { buildings = [], projects = [] } = dashboard
    return (
      buildings[0]?.organization?._id != organizationId ||
      projects[0]?.organization?._id != organizationId
    )
  }

  checkOrganization = (organizationView, organizationId) => {
    let id = (organizationView && organizationView._id) || ''
    return id != organizationId
  }

  onTargetsSave = updatedTargets => {
    const { updateOrganization, organizationView } = this.props
    const payload = {
      ...organizationView,
      targets: updatedTargets
    }
    updateOrganization(organizationView._id, payload).then(() => {
      setTimeout(this.props.getTableauToken, 35000)
    })
  }

  onToggleTargetModal = () => {
    const { showTargetModal } = this.state
    this.setState({ showTargetModal: !showTargetModal })
  }

  isOrganizationOwner = () => {
    const { user, organizationView } = this.props
    if (organizationView && organizationView.users) {
      const currentUser = organizationView.users.find(
        data => data.userId === user._id
      )
      if (currentUser) return currentUser.userRole === 'owner'
    }
    return false
  }

  hardReload = () => {
    const { filters, routeParams, reload } = this.props
    if (!reload) {
      const orgFilters = filters.filter(filter =>
        filter.value.includes('organization')
      )
      let organizationIds = getOrganizationIds(
        orgFilters,
        this.props.organizationView,
        this.props.organizationList,
        routeParams.organizationId
      )
      this.props.getPortfolioDashboard(
        this.props.organizationView._id,
        organizationIds,
        true
      )
      this.getTableauEmptyState()
    }
  }

  getChartOptions = (selectedTabOption, subTab) => {
    let toggleViewOption, viewOptions
    let selectedSubOption = _.find(selectedTabOption.subTabs, {
      name: subTab
    })
    if (!selectedSubOption)
      return { viewOptions: [null, null], toggleViewOption: null }
    const components = selectedSubOption.components || []
    if (components.length) {
      if (components[0].name === 'toggle')
        toggleViewOption = components[0].options[0].value
      else {
        if (components.length === 1) {
          viewOptions = [components[0].options[0].value, null]
        } else if (components.length === 2) {
          viewOptions = components.map(component => component.options[0].value)
        } else {
          viewOptions = [null, null]
          toggleViewOption = null
        }
      }
    }
    return { viewOptions, toggleViewOption }
  }

  getTableauEmptyState = option => {
    let check = option && option.check
    if (check === true || check === undefined) {
      this.props.getTableauToken()
    }
  }

  handleDashboardTabChange = (index, name) => {
    if (name !== this.state.selectedDashboardTab.name) {
      let selectedTabOption = _.find(dashboardTabs, { name })
      const { viewOptions, toggleViewOption } = this.getChartOptions(
        selectedTabOption,
        selectedTabOption.subTabs[0]
      )
      this.setState({
        selectedDashboardTab: { name },
        selectedDashboardSubTab: selectedTabOption.subTabs[0],
        toggleViewOption,
        viewOptions
      })
      this.getTableauEmptyState({
        selectedDashboardTab: { name },
        selectedDashboardSubTab: selectedTabOption.subTabs[0]
      })
    }
  }

  handleDashboardSubTabChange = name => {
    if (name !== this.state.selectedDashboardSubTab.name) {
      let selectedTabOption = _.find(dashboardTabs, {
        name: this.state.selectedDashboardTab.name
      })
      const {
        viewOptions = null,
        toggleViewOption = null
      } = this.getChartOptions(selectedTabOption, name)
      this.setState({
        selectedDashboardSubTab: { name },
        toggleViewOption,
        viewOptions
      })
      this.getTableauEmptyState({
        selectedDashboardSubTab: { name }
      })
    }
  }

  render() {
    const {
      push,
      user,
      selectedView,
      organizationView,
      showTargets,
      toggleTargets
    } = this.props
    const { tabs, timeRange, showTargetModal } = this.state
    const { tableauToken } = this.props
    // If the user is in the forgot password flow then do not render the portfolio
    if (user.resetPassword) {
      return <span />
    }

    if (Object.entries(user).length == 0) {
      return null
    }

    return (
      <div>
        <div className={styles.portfolioContainer}>
          {showTargetModal && (
            <TargetModal
              targets={organizationView.targets}
              onSave={this.onTargetsSave}
              onDismiss={this.onToggleTargetModal}
            />
          )}
          <PortfolioContainerHeader
            user={this.props.user}
            push={push}
            tabs={tabs}
            selectedView={selectedView}
            handleTabChange={this.handleTabChange}
            orgId={this.props.routeParams.organizationId}
            updateBuildingListStatus={this.props.updateBuildingListStatus}
            toggleTargetModal={this.onToggleTargetModal}
            loading={this.props.loading}
            isOrganizationOwner={this.isOrganizationOwner()}
            routeOrganizationId={this.props.routeParams.organizationId}
          />
        </div>
        {selectedView.name === 'Dashboard' && (
          <PortfolioDashBoard
            tableauToken={tableauToken}
            timeRange={timeRange}
            showTargets={showTargets}
            onTargetsToggled={toggleTargets}
            routeOrganizationId={this.props.routeParams.organizationId}
            handleTimeRangeChange={this.handleTimeRangeChange}
            hardReload={this.hardReload}
            handleTabChange={this.handleTabChange}
            selectedDashboardTab={this.state.selectedDashboardTab}
            handleDashboardTabChange={this.handleDashboardTabChange}
            selectedDashboardSubTab={this.state.selectedDashboardSubTab}
            handleDashboardSubTabChange={this.handleDashboardSubTabChange}
            toggleViewOption={this.state.toggleViewOption}
            handleToggleViewOption={this.handleToggleViewOption}
            viewOptions={this.state.viewOptions}
            handleChangeViewOption={this.handleChangeViewOption}
          />
        )}
        {selectedView.name === 'Buildings' && (
          <PortfolioBuildings
            handleTimeRangeChange={this.handleTimeRangeChange}
            timeRange={timeRange}
            routeOrganizationId={this.props.routeParams.organizationId}
            hardReload={this.hardReload}
          />
        )}
        {selectedView.name === 'Measures' && (
          <PortfolioProjects
            timeRange={timeRange}
            handleTimeRangeChange={this.handleTimeRangeChange}
            routeOrganizationId={this.props.routeParams.organizationId}
            hardReload={this.hardReload}
            handleTabChange={this.handleTabChange}
          />
        )}
        {selectedView.name === 'Projects' && (
          <PortfolioProjectPackages
            timeRange={timeRange}
            handleTimeRangeChange={this.handleTimeRangeChange}
            routeOrganizationId={this.props.routeParams.organizationId}
            hardReload={this.hardReload}
            handleTabChange={this.handleTabChange}
          />
        )}
        {selectedView.name === 'Equipments' && <PortfolioEquipmentList />}
        {selectedView.name === 'Teams' && (
          <PortfolioTeamList
            routeOrganizationId={this.props.routeParams.organizationId}
            handleTimeRangeChange={this.handleTimeRangeChange}
            hardReload={this.hardReload}
            timeRange={timeRange}
          />
        )}
        {selectedView.name === 'Scenarios' && (
          <ScenarioList
            routeOrganizationId={this.props.routeParams.organizationId}
          />
        )}
        {selectedView.name === 'Proposals' && (
          <PortfolioProposal
            hardReload={this.hardReload}
            routeOrganizationId={this.props.routeParams.organizationId}
            timeRange={timeRange}
          />
        )}
      </div>
    )
  }
}
const mapDispatchToProps = {
  push,
  getPortfolioDashboard,
  updatePortfolioTab,
  getTableauToken,
  updateBuildingListStatus,
  toggleTargets,
  updateDashboardFilters
}

const mapStateToProps = state => ({
  user: state.login.user || {},
  filters: state.portfolio.dashboardFilters || [],
  dashboard: state.portfolio.dashboard || {},
  loading: state.portfolio.loading || false,
  selectedView: state.portfolio.selectedView,
  organizationList: state.organization.organizationList || [],
  organizationView: state.organization.organizationView || {},
  showTargets: state.organization.showTargets || false,
  tableauToken: state.portfolio.tableauToken || '',
  reload: state.portfolio.reload
})

export default connect(mapStateToProps, mapDispatchToProps)(PortfolioContainer)
