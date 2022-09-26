import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { push } from 'react-router-redux'
import moment from 'moment'
import { connect } from 'react-redux'
import { CSVLink } from 'react-csv'
import { Loader } from 'utils/Loader'
import ScenarioModal from '../../../containers/Modal/ScenarioModal'
import ScenarioConvertProjectModal from '../../UI/ScenarioConvertProjectModal/ScenarioConvertProjectModal'
import TimeRange from '../../UI/TimeRange'
import FilterContainer from '../FilterContainer'
import ScenarioExtraDropdown from '../../UI/ScenarioExtraDropdown'
import PortfolioTableau from '../PortfolioTableau'
import {
  getPortfolioScenarioList,
  removeScenario,
  getTableauToken,
  fetchBuildingGroups,
  deleteBuildingGroup,
  setBuildingGroup,
  toggleBuildingGroup
} from '../../../routes/Portfolio/modules/portfolio'
import {
  updateBuildingViewMode,
  createSampleBuilding
} from '../../../routes/Building/modules/building'
import styles from '../PortfolioContainer.scss'
import buildingStyles from '../../Building/Building.scss'
import scenarioListStyles from './ScenarioBuildingList.scss'
import projectListStyles from '../../Project/ProjectList.scss'
import {
  handleSort,
  handleSearchFilter,
  multiSelectChecker,
  getValueArrayFromArray,
  getArrayFromBuildingTimeRange,
  getAverageOfArray
} from 'utils/Portfolio'
import {
  defaultScenarioColumn,
  buildingColumnOptions,
  scenarioFilterOptions,
  scenarioTabs
} from 'utils/PortfolioOptions'
import {
  parentNodeHasClass,
  formatNumbersWithCommas,
  isProdEnv,
  _getValueFromObjPerPath
} from 'utils/Utils'
import {
  toggleTargets,
  toggleManageAllOrgs
} from '../../../routes/Organization/modules/organization'
import { ToggleTab } from 'components/Asset/ToggleTab'
import ColumnList from 'components/UI/Column/ColumnList'

class ScenarioList extends Component {
  static propsTypes = {
    user: PropTypes.object.isRequired,
    organizationView: PropTypes.object.isRequired,
    columnList: PropTypes.array.isRequired,
    columnIndex: PropTypes.number.isRequired,
    scenarioList: PropTypes.array.isRequired
  }

  state = {
    loading: false,
    searchValue: '',
    showColumn: false,
    sort: {
      key: 'name',
      direction: 'ASC'
    },
    list: this.props.scenarioList,
    scenario: null,
    convertModalOpen: false,
    modalOpen: false,
    selectedScenarioIds: [],
    showTimeRange: false,
    showFilter: false,
    filters: [],
    timeRange: {
      type: 'Calendar',
      start: '',
      end: ''
    },
    showExtras: false,
    csvReport: {
      data: [],
      headers: [],
      filename: 'Report.csv'
    },
    isCreatingBuilding: false,
    selectedTab: { name: 'Comparison' },
    selectedSubTab: { name: 'Energy Savings' },
    toggleViewOption: 'Total',
    showTabs: false
  }

  componentDidMount() {
    if (this.props.scenarioList.length == 0) this.fetchScenarios()
    else {
      let { scenarioList } = this.props
      let filters = this.addCurrentOrgForFilter()
      scenarioList = handleSearchFilter(
        this.props.user,
        scenarioList,
        this.state.searchValue,
        filters,
        this.state.timeRange,
        true
      )
      this.setState({
        list: scenarioList,
        selectedScenarioIds: scenarioList.map(scenario => scenario._id)
      })
    }
  }

  UNSAFE_componentWillReceiveProps = nextProps => {
    let list = nextProps.scenarioList
    let filters = this.addCurrentOrgForFilter()
    list = handleSearchFilter(
      this.props.user,
      list,
      this.state.searchValue,
      filters,
      this.props.timeRange,
      true
    )
    if (
      nextProps.selectedBuildingGroupId !==
        this.props.selectedBuildingGroupId &&
      nextProps.selectedBuildingGroupId
    ) {
      const selectedGroup = nextProps.buildingGroups.find(
        group => group._id === nextProps.selectedBuildingGroupId
      )
      if (selectedGroup) {
        list = list.reduce((agg, scenario) => {
          scenario.isInGroup = selectedGroup.buildingIds.some(buildingId =>
            scenario.buildingIds.includes(buildingId)
          )
          if (scenario.isInGroup) {
            agg.push(scenario)
          }
          return agg
        }, [])
      }
    }
    if (JSON.stringify(list) !== JSON.stringify(this.state.list)) {
      let { selectedScenarioIds } = this.state
      let currentIDs =
        this.state.list
          .filter(item => item.status !== 'Not Synced')
          .map(item => item._id.toString()) || []
      let filterScenarioList = list.filter(
        item =>
          item.status !== 'Not Synced' && currentIDs.indexOf(item._id) === -1
      )
      let newSelectedIDs = [
        ...selectedScenarioIds.map(id => id.toString()),
        ...filterScenarioList.map(item => item._id.toString())
      ]
      newSelectedIDs = [...new Set(newSelectedIDs)]
      this.setState({
        list,
        selectedScenarioIds: newSelectedIDs
      })
      this.props.getTableauToken()
    }
  }

  UNSAFE_componentWillMount() {
    document.addEventListener('mousedown', this.handleClick, false)
    this.setDefaultTimeRange()
    this.props.getTableauToken()
    if (this.props.buildingGroups.length === 0) {
      this.props.fetchBuildingGroups()
    }
  }
  componentWillUnmount = () => {
    document.removeEventListener('mousedown', this.handleClick, false)
  }

  addCurrentOrgForFilter = () => {
    let { filters } = this.state
    let { organizationView } = this.props
    let organizationfilters = filters.filter(filter =>
      filter.value.includes('organization')
    )
    if (organizationfilters.length == 0) {
      let newOrgFilter = {
        name: 'Organization Name',
        label: 'Organization Name',
        value: 'organizations.organization.name',
        select: 'multiSelect',
        tab: 'scenario',
        options: {
          name: organizationView.name,
          value: organizationView._id
        }
      }
      filters = [newOrgFilter, ...filters]
    }
    return filters
  }

  handleClick = e => {
    // the click is inside, continue to menu links
    if (this.state.showExtras === true) {
      if (this.node && this.node.contains(e.target)) {
        // the click is inside, continue to menu links
        return
      }
      this.handleToggleExtrasButton()
    } else if (this.state.showTabs === true) {
      if (this.node && this.node.contains(e.target)) {
        // the click is inside, continue to menu links
        return
      }
      this.handleToggleTabs()
      return
    } else {
      const portal = e.target.closest('#portal')
      if (
        parentNodeHasClass(e.target, 'extrasClick') ||
        parentNodeHasClass(e.target, 'tableMoreInfo') ||
        portal
      )
        return
    }
    // otherwise, toggle (close) the app dropdown
    this.handleToggleExtras(null)
  }

  handleOpenScenarioModal = item => {
    this.setState({
      modalOpen: true,
      modalView: 'editScenario',
      scenario: item
    })
  }

  handleOpenAddScenarioModal = () => {
    this.setState({
      modalOpen: true,
      modalView: 'addScenario'
    })
  }

  handleCloseScenarioModal = () => {
    this.setState({ modalOpen: false, modalView: null, scenario: null })
  }

  handleOpenConvertModal = item => {
    this.setState({
      convertModalOpen: true,
      scenario: item
    })
  }

  handleCloseConvertModal = () => {
    this.setState({
      convertModalOpen: false,
      scenario: null
    })
  }

  fetchScenarios = (hardReload = false) => {
    const { loading } = this.state
    if (loading) return
    this.setState({ loading: true }, () => {
      this.props
        .getPortfolioScenarioList(hardReload)
        .then(data => {
          this.setState({
            loading: false
          })
        })
        .catch(() => {
          this.setState({ loading: false })
        })
    })
  }

  handleSearchChange = ({ target: { value } }) => {
    if (!this.state.loading) {
      const searchBy = value || ''
      this.setState({ searchValue: searchBy }, () => {
        this.handleSearch()
      })
    }
  }

  handleSearch = () => {
    let { scenarioList } = this.props
    let { searchValue, sort, timeRange } = this.state
    let filters = this.addCurrentOrgForFilter()
    let updatedList = scenarioList
    updatedList = handleSearchFilter(
      this.props.user,
      updatedList,
      searchValue,
      filters,
      timeRange,
      true
    )

    handleSort('scenario', updatedList, sort).then(list => {
      this.setState({
        list: list,
        selectedScenarioIds: list.map(item => item._id)
      })
    })
    this.props.getTableauToken()
  }

  handleClickSort = key => {
    let tempSort = { ...this.state.sort }
    let { list } = this.state

    if (key === tempSort.key) {
      if (tempSort.direction === 'ASC') {
        tempSort.direction = 'DESC'
      } else {
        tempSort.direction = 'ASC'
      }
    } else {
      tempSort.key = key
      tempSort.direction = 'ASC'
    }
    handleSort('scenario', list, tempSort).then(list => {
      this.setState({ list, sort: tempSort })
    })
  }

  handleToggleExtrasButton = () => {
    this.setState(prevState => ({
      showExtras: !prevState.showExtras
    }))
  }

  handleToggleExtras = index => {
    if (index === this.state.showExtra) {
      // toggle off
      this.setState({ showExtra: '' })
      return
    }
    this.setState({ showExtra: index })
  }

  removeScenario = item => {
    this.setState({ loading: true })
    this.props
      .removeScenario(item)
      .then(() => {
        this.setState({ loading: false })
      })
      .catch(() => {
        this.setState({ loading: false })
      })
  }

  handleCheckSceanrio = (event, id) => {
    let { selectedScenarioIds } = this.state
    event.stopPropagation()
    if (id === 'all') {
      event.stopPropagation()
      let ids = this.state.list.map(item => item._id)
      let checkedAll =
        multiSelectChecker(ids, selectedScenarioIds) &&
        multiSelectChecker(selectedScenarioIds, ids)
      this.setState({ selectedScenarioIds: checkedAll ? [] : ids })
    } else {
      let ids = []
      if (selectedScenarioIds.indexOf(id) === -1)
        ids = [...selectedScenarioIds, id]
      else ids = selectedScenarioIds.filter(item => item !== id)
      ids = [...new Set(ids)]
      this.setState({ selectedScenarioIds: ids })
    }
    this.props.getTableauToken()
  }

  renderTimeRange = () => {
    const { timeRange } = this.state
    if (!timeRange || !timeRange.type || !timeRange.start || !timeRange.end)
      return 'Year Range'
    if (timeRange.type === 'Calendar')
      return `${timeRange.start} - ${timeRange.end}`
    return `FY\'${timeRange.start % 100} - FY\'${timeRange.end % 100}`
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

  handleOpenFilter = () => {
    this.setState({
      showFilter: true
    })
  }

  handleOpenColumn = () => {
    this.setState(prevState => ({
      showColumn: !prevState.showColumn
    }))
  }

  handleToggleFilterContainer = toggle => {
    if (toggle != undefined)
      this.setState({
        showFilter: toggle ? true : false
      })
  }

  handleFilterChange = options => {
    let { scenarioList } = this.props
    this.setState({ filters: options }, () => {
      let filters = this.addCurrentOrgForFilter()
      scenarioList = handleSearchFilter(
        this.props.user,
        scenarioList,
        this.state.searchValue,
        filters,
        this.state.timeRange,
        true
      )
      this.setState({
        list: scenarioList,
        selectedScenarioIds: scenarioList.map(scenario => scenario._id)
      })
      this.props.getTableauToken()
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

  setDefaultTimeRange = () => {
    let { timeRange } = this.state
    timeRange = {
      type: 'Calendar',
      start: +moment()
        .subtract(3, 'years')
        .format('YYYY'),
      end: +moment()
        // .add(10, 'years')
        .format('YYYY')
    }
    this.setState({ timeRange })
  }

  handleTimeRangeChange = options => {
    this.setState({ timeRange: options })
    // this.props.getTableauToken()
  }

  getData = () => {
    let { list = [], selectedTab, selectedScenarioIds } = this.state
    let selectedTabName = (selectedTab && selectedTab.name) || 'Comparison'
    let comparisonColumn = [
      'Annual Energy Savings (kBtu)',
      'Annual GHG Reduction (mtCO2e)',
      'Annual Energy Cost Savings ($)',
      'Number of Buildings',
      'Organizations'
    ]
    if (selectedTabName === 'Comparison') {
      const currentYear = +moment().format('YYYY')
      let scenarioNames = list.map(item => {
        return {
          label: item.name,
          key: item.name
        }
      })
      let headers = [
        {
          label: 'Name',
          key: 'name'
        },
        {
          label: 'Baseline',
          key: 'Baseline'
        },
        ...scenarioNames,
        {
          label: 'Combined',
          key: 'Combined'
        }
      ]
      let baselineData = this.getComparisonBaselineData(list)
      let filteredList = list.filter(item =>
        selectedScenarioIds.includes(item._id)
      )
      let ScenarioData = list.map(item =>
        this.getComparisonData(item, this.state.timeRange, currentYear)
      )
      let totalData = this.getComparisonTotalData(ScenarioData, filteredList)
      let data = []
      data = comparisonColumn.map(tableColumn => {
        let totalValue = (totalData && totalData[tableColumn]) || ''
        if (tableColumn === 'Organizations' && totalValue)
          totalValue = totalValue.join(', ')
        else totalValue = formatNumbersWithCommas(totalValue)
        let baselineValue = (baselineData && baselineData[tableColumn]) || ''
        if (tableColumn === 'Organizations' && baselineValue)
          baselineValue = baselineValue.join(', ')
        else baselineValue = formatNumbersWithCommas(baselineValue)

        let result = {
          name: tableColumn,
          Baseline: baselineValue || '-',
          Combined: totalValue || '-'
        }
        list.forEach((item, index) => {
          let value = ScenarioData[index] && ScenarioData[index][tableColumn]
          if (tableColumn === 'Organizations' && value) value = value.join(', ')
          else value = formatNumbersWithCommas(value)
          result[item.name] = value || '-'
        })
        return result
      })

      return {
        headers,
        data
      }
    } else {
      let headers = [
        {
          label: 'Name',
          key: 'name'
        },
        {
          label: 'Organizations',
          key: 'organizationNames'
        },
        {
          label: 'Number of Buildings',
          key: 'numberOfBuildings'
        },
        {
          label: 'Energy Savings',
          key: 'energySavings'
        },
        {
          label: 'Electric Savings',
          key: 'electricSavings'
        },
        {
          label: 'Natural Gas Savings',
          key: 'gasSavings'
        },
        {
          label: 'GHG Savings',
          key: 'ghgSavings'
        },
        {
          label: 'Construction End Date',
          key: 'estimatedCompletionDate'
        }
      ]
      let data = list.map(scenario => {
        let organizationNames =
          (scenario.organizations &&
            scenario.organizations.map(
              organization => organization.organization.name
            )) ||
          []
        organizationNames = [...new Set(organizationNames)]
        let numberOfBuildings = [
          ...new Set((scenario && scenario.buildingIds) || [])
        ].length
        let metric = scenario.metric || {}
        let energySavings = (metric && metric.energySavings) || 0
        let electricSavings = (metric && metric.electricSavings) || 0
        let gasSavings = (metric && metric.gasSavings) || 0
        let ghgSavings = (metric && metric.ghgSavings) || 0
        let estimatedCompletionDate = scenario.estimatedCompletionDate
          ? moment(scenario.estimatedCompletionDate)
              .utc()
              .format('MM/DD/YYYY')
          : '-'
        return {
          name: scenario.name,
          organizationNames: organizationNames.join(', '),
          numberOfBuildings: numberOfBuildings
            ? formatNumbersWithCommas(numberOfBuildings)
            : '-',
          energySavings: energySavings
            ? formatNumbersWithCommas(energySavings) + ' kBtu'
            : '-',
          electricSavings: electricSavings
            ? formatNumbersWithCommas(electricSavings) + ' kWh'
            : '-',
          gasSavings: gasSavings
            ? formatNumbersWithCommas(gasSavings) + ' therms'
            : '-',
          ghgSavings: ghgSavings
            ? formatNumbersWithCommas(ghgSavings) + ' mtCO2e'
            : '-',
          estimatedCompletionDate
        }
      })
      return { headers, data }
    }
  }

  downloadReport = (event, done) => {
    const date = new Date().toLocaleDateString('en-US')
    const { data = [], headers = [] } = this.getData()
    const objReport = {
      filename: `Scenarios Export_${date}.csv`,
      headers: headers,
      data: data
    }
    this.setState({ csvReport: objReport }, () => {
      done()
    })
  }

  hardReload = () => {
    this.fetchScenarios(true)
  }

  handleClickAddBuilding = () => {
    this.props.push('/building/new')
  }

  handleClickAddSampleBuilding = () => {
    this.setState({ isCreatingBuilding: true })
    this.props
      .createSampleBuilding()
      .then(() => {
        this.props.updateBuildingViewMode('portfolio/scenario')
        this.setState({ isCreatingBuilding: false })
      })
      .catch(() => {
        this.setState({ isCreatingBuilding: false })
      })
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
      this.props.push('/organization/all/portfolio/scenario')
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

  renderEmptyState = () => {
    const { loading } = this.state

    return (
      <div>
        <div className={styles.empty}>
          <div className={styles.emptyBody}>
            <div className={styles.emptyBodyTitle}>
              Create buildings to analyze portfolio-level scenarios
            </div>
            <div className={styles.emptyBodyDescription}>
              <p>
                Analyze simple measures prior to collecting details on-site. To
                get started
              </p>
              <p>add your own building or work from a sample building.</p>
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
  }

  checkEmptyState = () => {
    const { buildingList } = this.props
    let archivedBuilding = buildingList.filter(
      building => building.archived === false
    )
    return archivedBuilding.length === 0
  }

  handleToggleTabs = () => {
    this.setState(prevState => ({
      showTabs: !prevState.showTabs
    }))
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

  handleSelectTabChange = (index, name) => {
    if (name !== this.state.selectedTab.name) {
      let selectedTabOption = _.find(scenarioTabs, { name })
      const { toggleViewOption } = this.getChartOptions(
        selectedTabOption,
        selectedTabOption.subTabs[0]
      )
      this.setState({
        selectedTab: { name },
        selectedSubTab: selectedTabOption.subTabs[0],
        toggleViewOption
      })
    }
  }

  handleSelectSubTabChange = name => {
    if (name !== this.state.selectedSubTab.name) {
      let selectedTabOption = _.find(scenarioTabs, {
        name: this.state.selectedTab.name
      })
      const { toggleViewOption = null } = this.getChartOptions(
        selectedTabOption,
        name
      )
      this.setState({
        selectedSubTab: { name },
        toggleViewOption
      })
    }
  }

  handleToggleViewOption = value => {
    if (value != this.state.toggleViewOption)
      this.setState({ toggleViewOption: value })
  }

  renderCharViewOption() {
    let { selectedTab, selectedSubTab, toggleViewOption } = this.state
    let selectedTabName = (selectedTab && selectedTab.name) || 'Comparison'
    let selectedTabOption = _.find(scenarioTabs, { name: selectedTabName })
    let selectedSubTabName =
      (selectedSubTab && selectedSubTab.name) ||
      selectedTabOption.subTabs[0].name

    let selectedSubTabOption = _.find(selectedTabOption.subTabs, {
      name: selectedSubTabName
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
                  onToggle={this.handleToggleViewOption}
                  options={component.options}
                  defaultOption={toggleViewOption}
                />
              )
            }
            default:
              return null
          }
        })}
      </div>
    )
  }

  getParam = (selectedTabOption, selectedSubTabOpion, toggleViewOption) => {
    let components = selectedSubTabOpion.components || []
    if (components.length === 0) return {}
    let paramter = {}
    components.forEach((component, index) => {
      if (component.name === 'toggle') {
        let value
        if (toggleViewOption === null)
          toggleViewOption = component.options[0].value
        if (toggleViewOption === 'Total') value = false
        else value = true
        paramter[component.paramName] = value
      }
    })
    return paramter
  }

  getChartURL = (selectedTabOption, selectedSubTabOpion) => {
    const target = isProdEnv(process.env.DOMAIN_ENV) ? 'buildee' : 'buildeebeta'
    let chartURL = ''
    if (selectedSubTabOpion) {
      chartURL = selectedSubTabOpion.route.replace(
        '/#/site/buildeebeta/',
        `/t/${target}/`
      )
    }
    return chartURL
  }

  getComparisonData = (item, timeRange, currentYear = '') => {
    const fields = [
      {
        name: 'Annual Energy Savings (kBtu)',
        value: 'monthlyUtilities.annual_energy_use'
      },
      {
        name: 'Annual GHG Reduction (mtCO2e)',
        value: 'monthlyUtilities.annual_ghg_emissions'
      },
      {
        name: 'Annual Energy Cost Savings ($)',
        value: 'monthlyUtilities.annual_energy_cost'
      }
    ]
    let organizationNames =
      (item.organizations &&
        item.organizations.map(
          organization => organization.organization.name
        )) ||
      []
    organizationNames = [...new Set(organizationNames)]
    let numberOfBuildings = [...new Set((item && item.buildingIds) || [])]
      .length
    let buildings = item.buildings || []
    let result = {
      _id: item._id,
      'Annual Energy Savings (kBtu)': 0,
      'Annual GHG Reduction (mtCO2e)': 0,
      'Annual Energy Cost Savings ($)': 0,
      'Number of Buildings': numberOfBuildings,
      Organizations: organizationNames
    }
    for (let field of fields) {
      let column = field.value
      let totalValue = 0
      for (let building of buildings) {
        let monthlyUtilities =
          _getValueFromObjPerPath.call(building, 'monthlyUtilities') || []
        monthlyUtilities =
          getArrayFromBuildingTimeRange(
            monthlyUtilities,
            timeRange,
            currentYear
          ) || []
        let value = getValueArrayFromArray(
          monthlyUtilities,
          column.substring(
            column.indexOf('monthlyUtilities') + 'monthlyUtilities'.length + 1
          )
        )
        value = getAverageOfArray(value)
        totalValue += +value
      }
      if (buildings.length) totalValue = totalValue / buildings.length
      result[field.name] = +totalValue || 0
    }
    return result
  }

  getComparisonBaselineData = list => {
    let { timeRange } = this.state
    const currentYear = +moment().format('YYYY')
    timeRange = {
      ...timeRange,
      start: currentYear,
      end: currentYear
    }

    let data = list.map(item => this.getComparisonData(item, timeRange))

    let result = this.getComparisonTotalData(data, list)
    return result
  }

  getComparisonTotalData = (data, list) => {
    let listIds = list.map(item => item._id)
    const fields = [
      {
        name: 'Annual Energy Savings (kBtu)'
      },
      {
        name: 'Annual GHG Reduction (mtCO2e)'
      },
      {
        name: 'Annual Energy Cost Savings ($)'
      }
    ]
    let numberOfBuildings = []
    let organizationNames = []
    for (let item of list) {
      let orgNames =
        (item.organizations &&
          item.organizations.map(
            organization => organization.organization.name
          )) ||
        []
      let itemNumbeofBuildings = [...new Set((item && item.buildingIds) || [])]
      organizationNames = [...new Set([...orgNames, ...organizationNames])]
      numberOfBuildings = [
        ...new Set([...numberOfBuildings, ...itemNumbeofBuildings])
      ]
    }
    let result = {
      'Annual Energy Savings (kBtu)': 0,
      'Annual GHG Reduction (mtCO2e)': 0,
      'Annual Energy Cost Savings ($)': 0,
      'Number of Buildings': numberOfBuildings.length,
      Organizations: organizationNames
    }
    for (let field of fields) {
      let totalValue = 0
      for (let item of data) {
        if (!listIds.includes(item._id)) continue
        totalValue = totalValue + +item[field.name]
      }
      result[field.name] = totalValue
    }
    return result
  }

  renderTable() {
    let { selectedScenarioIds, selectedTab, timeRange } = this.state
    let ids = this.state.list.map(item => item._id)
    let checkedAll =
      multiSelectChecker(ids, selectedScenarioIds) &&
      multiSelectChecker(selectedScenarioIds, ids)
    let comparisonColumn = [
      'Annual Energy Savings (kBtu)',
      'Annual GHG Reduction (mtCO2e)',
      'Annual Energy Cost Savings ($)',
      'Number of Buildings',
      'Organizations'
    ]

    let selectedTabName = (selectedTab && selectedTab.name) || 'Comparison'

    if (selectedTabName === 'Comparison') {
      let list = this.state.list || []
      let baseline = this.getComparisonBaselineData(list)
      const currentYear = +moment().format('YYYY')
      const { selectedScenarioIds } = this.state
      let filteredList = list.filter(item =>
        selectedScenarioIds.includes(item._id)
      )
      let data = list.map(item =>
        this.getComparisonData(item, this.state.timeRange, currentYear)
      )
      let total = this.getComparisonTotalData(data, filteredList)

      return (
        <div
          className={classNames(
            projectListStyles.scrollTableContainer,
            styles.comparisionTableContainer
          )}
        >
          <table>
            <thead>
              <tr
                className={classNames(
                  this.state.sort.direction === 'ASC'
                    ? projectListStyles.sortASC
                    : ''
                )}
              >
                <th></th>
                <th>Baseline</th>
                {list.map((item, index) => {
                  let checked =
                    this.state.selectedScenarioIds.indexOf(item._id) !== -1
                  return (
                    <th
                      key={`scenario - ${index}`}
                      className={projectListStyles.firstColumnWithCheckbox}
                    >
                      <div>
                        <div className={scenarioListStyles.checkboxContainer}>
                          <label
                            className={classNames(
                              scenarioListStyles['__input'],
                              scenarioListStyles['__input--checkboxes']
                            )}
                          >
                            <input
                              defaultChecked={checked}
                              value={true}
                              onClick={e =>
                                this.handleCheckSceanrio(e, item._id)
                              }
                              className={classNames(
                                checked ? scenarioListStyles['checked'] : ''
                              )}
                              type="checkbox"
                              name="data"
                            />
                            <span></span>
                          </label>
                        </div>
                        <div
                          onClick={() => this.handleOpenScenarioModal(item)}
                          className={styles.scenarioComparisionName}
                        >
                          {item.name}&nbsp;
                          {item.status === 'Not Synced' && (
                            <Loader size="button" />
                          )}
                        </div>
                      </div>
                    </th>
                  )
                })}
                <th>Combined</th>
              </tr>
            </thead>
            <tbody>
              {comparisonColumn.map((tableColumn, index) => {
                let totalValue = (total && total[tableColumn]) || ''
                if (tableColumn === 'Organizations' && totalValue)
                  totalValue = totalValue.join(', ')
                else totalValue = formatNumbersWithCommas(totalValue)
                let baselineValue = (baseline && baseline[tableColumn]) || ''
                if (tableColumn === 'Organizations' && baselineValue)
                  baselineValue = baselineValue.join(', ')
                else baselineValue = formatNumbersWithCommas(baselineValue)

                return (
                  <tr key={`${tableColumn}-${index}`}>
                    <td>{tableColumn}</td>
                    <td>{baselineValue || '-'}</td>
                    {this.state.list &&
                      this.state.list.map((scenario, index) => {
                        let columnData = data[index] && data[index][tableColumn]
                        return (
                          <td key={`comparision-${index}`}>
                            {(columnData &&
                              formatNumbersWithCommas(columnData)) ||
                              '-'}
                          </td>
                        )
                      })}
                    <td>{totalValue || '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )
    }
    return (
      <div className={projectListStyles.scrollTableContainer}>
        <table>
          <thead>
            <tr
              className={classNames(
                this.state.sort.direction === 'ASC'
                  ? projectListStyles.sortASC
                  : ''
              )}
            >
              <th className={projectListStyles.firstColumnWithCheckbox}>
                <div>
                  <div className={scenarioListStyles.checkboxContainer}>
                    <label
                      className={classNames(
                        scenarioListStyles['__input'],
                        scenarioListStyles['__input--checkboxes']
                      )}
                    >
                      <input
                        defaultChecked={checkedAll}
                        value={true}
                        onClick={e => this.handleCheckSceanrio(e, 'all')}
                        className={classNames(
                          checkedAll ? scenarioListStyles['checked'] : ''
                        )}
                        type="checkbox"
                        name="data"
                      />
                    </label>
                  </div>
                  <div
                    className={classNames(scenarioListStyles.checkName)}
                    onClick={() => this.handleClickSort('name')}
                  >
                    Name&nbsp;
                    {this.state.sort.key === 'name' ? (
                      <i className="material-icons">arrow_downward</i>
                    ) : (
                      ''
                    )}
                  </div>
                </div>
              </th>
              <th>
                <div>
                  Organizations&nbsp;
                  {this.state.sort.key === 'organizations' ? (
                    <i className="material-icons">arrow_downward</i>
                  ) : (
                    ''
                  )}
                </div>
              </th>
              <th>
                <div onClick={() => this.handleClickSort('numberOfBuildings')}>
                  Number of Buildings&nbsp;
                  {this.state.sort.key === 'numberOfBuildings' ? (
                    <i className="material-icons">arrow_downward</i>
                  ) : (
                    ''
                  )}
                </div>
              </th>
              <th>
                <div
                  onClick={() => this.handleClickSort('metric.energySavings')}
                >
                  Energy Savings&nbsp;
                  {this.state.sort.key === 'metric.energySavings' ? (
                    <i className="material-icons">arrow_downward</i>
                  ) : (
                    ''
                  )}
                </div>
              </th>
              <th>
                <div
                  onClick={() => this.handleClickSort('metric.electricSavings')}
                >
                  Electric Savings&nbsp;
                  {this.state.sort.key === 'metric.electricSavings' ? (
                    <i className="material-icons">arrow_downward</i>
                  ) : (
                    ''
                  )}
                </div>
              </th>
              <th>
                <div
                  onClick={() => this.handleClickSort('metric.gasSavingsCost')}
                >
                  Natural Gas Savings&nbsp;
                  {this.state.sort.key === 'metric.gasSavingsCost' ? (
                    <i className="material-icons">arrow_downward</i>
                  ) : (
                    ''
                  )}
                </div>
              </th>
              <th>
                <div
                  onClick={() => this.handleClickSort('metric.ghgSavingsCost')}
                >
                  GHG Savings&nbsp;
                  {this.state.sort.key === 'metric.ghgSavingsCost' ? (
                    <i className="material-icons">arrow_downward</i>
                  ) : (
                    ''
                  )}
                </div>
              </th>
              <th>
                <div
                  onClick={() =>
                    this.handleClickSort('estimatedCompletionDate')
                  }
                >
                  Construction End Date&nbsp;
                  {this.state.sort.key === 'estimatedCompletionDate' ? (
                    <i className="material-icons">arrow_downward</i>
                  ) : (
                    ''
                  )}
                </div>
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {this.state.list.map((item, index) => {
              let checked =
                this.state.selectedScenarioIds.indexOf(item._id) !== -1
              let organizationNames =
                (item.organizations &&
                  item.organizations.map(
                    organization => organization.organization.name
                  )) ||
                []
              organizationNames = [...new Set(organizationNames)]
              let numberOfBuildings = [
                ...new Set((item && item.buildingIds) || [])
              ].length
              let metric = item.metric || {}
              let energySavings = (metric && metric.energySavings) || 0
              let electricSavings = (metric && metric.electricSavings) || 0
              let gasSavings = (metric && metric.gasSavings) || 0
              let ghgSavings = (metric && metric.ghgSavings) || 0
              let estimatedCompletionDate = item.estimatedCompletionDate
                ? moment(item.estimatedCompletionDate)
                    .utc()
                    .format('MM/DD/YYYY')
                : '-'
              return (
                <tr key={`ScenarioList${index}`}>
                  <td className={projectListStyles.firstColumnWithCheckbox}>
                    <div>
                      <div className={scenarioListStyles.checkboxContainer}>
                        <label
                          className={classNames(
                            scenarioListStyles['__input'],
                            scenarioListStyles['__input--checkboxes']
                          )}
                        >
                          <input
                            defaultChecked={checked}
                            value={true}
                            onClick={e => this.handleCheckSceanrio(e, item._id)}
                            className={classNames(
                              checked ? scenarioListStyles['checked'] : ''
                            )}
                            type="checkbox"
                            name="data"
                          />
                          <span></span>
                        </label>
                      </div>
                      <div
                        className={classNames(
                          scenarioListStyles.checkName,
                          styles.scenarioName
                        )}
                        onClick={() => this.handleOpenScenarioModal(item)}
                      >
                        {item.name}&nbsp;
                        {item.status === 'Not Synced' && (
                          <Loader size="button" />
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{organizationNames.join(', ')}</td>
                  <td>
                    {numberOfBuildings
                      ? formatNumbersWithCommas(numberOfBuildings)
                      : '-'}
                  </td>
                  <td>
                    {energySavings
                      ? formatNumbersWithCommas(energySavings) + ' kBtu'
                      : '-'}
                  </td>
                  <td>
                    {electricSavings
                      ? formatNumbersWithCommas(electricSavings) + ' kWh'
                      : '-'}
                  </td>
                  <td>
                    {gasSavings
                      ? formatNumbersWithCommas(gasSavings) + ' therms'
                      : '-'}
                  </td>
                  <td>
                    {ghgSavings
                      ? formatNumbersWithCommas(ghgSavings) + ' mtCO2e'
                      : '-'}
                  </td>
                  <td>{estimatedCompletionDate}</td>
                  <td>
                    <div className={projectListStyles.scrollExtra}>
                      <ScenarioExtraDropdown
                        key={'ScenarioExtraDropdown' + index}
                        index={index}
                        currentIndex={this.state.showExtra}
                        scenario={item}
                        handleOpenConvertModal={this.handleOpenConvertModal}
                        handleRemoveScenario={this.removeScenario}
                        handleToggleExtras={this.handleToggleExtras}
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  handleToggleColumn = toggle => {
    if (toggle != undefined) this.setState({ showColumn: toggle })
    else {
      this.setState(prevState => ({
        showColumn: !prevState.showColumn
      }))
    }
  }

  handleColumnChange = () => {}

  handleCurrentColumnChange = () => {}

  render() {
    const {
      loading,
      searchValue,
      showColumn,
      showFilter,
      scenario,
      selectedScenarioIds,
      showTimeRange,
      filters,
      timeRange,
      selectedTab,
      selectedSubTab,
      showTabs,
      toggleViewOption
    } = this.state
    const {
      routeOrganizationId,
      showTargets,
      toggleTargets,
      user,
      columnList,
      columnIndex,
      buildingGroups,
      selectedBuildingGroupId
    } = this.props

    let checkEmpty = this.checkEmptyState()
    let selectedTabName = (selectedTab && selectedTab.name) || 'Comparison'
    let selectedTabOption = _.find(scenarioTabs, { name: selectedTabName })
    let selectedSubTabName =
      (selectedSubTab && selectedSubTab.name) ||
      selectedTabOption.subTabs[0].name

    let selectedSubTabOpion = _.find(selectedTabOption.subTabs, {
      name: selectedSubTabName
    })

    let hasSubTab =
      (selectedTabOption &&
        selectedTabOption.subTabs &&
        selectedTabOption.subTabs.length > 1) ||
      false

    let params = this.getParam(
      selectedTabOption,
      selectedSubTabOpion,
      toggleViewOption
    )

    let chartURL = this.getChartURL(selectedTabOption, selectedSubTabOpion)

    const tableauKey =
      JSON.stringify(this.props.tableauToken) +
      // JSON.stringify(timeRange) +
      JSON.stringify(selectedScenarioIds) +
      JSON.stringify(filters) +
      JSON.stringify(this.state.searchValue) +
      JSON.stringify(routeOrganizationId)

    return (
      <div>
        <div className={styles.portfolioContainerSecondHeader}>
          <div className={styles.container}>
            <div className={styles.scenarioTabContainer}>
              <div
                onClick={this.handleToggleTabs}
                className={classNames(
                  buildingStyles.extras,
                  showTabs
                    ? buildingStyles.extrasShow
                    : buildingStyles.extrasHide
                )}
                ref={node => (this.node = node)}
              >
                <div className={styles.scenarioTab}>
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
                    styles.scenarioTabList
                  )}
                >
                  {scenarioTabs.map((item, index) => {
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
                          this.handleSelectTabChange(index, item.name)
                        }
                      >
                        {item.name}
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className={classNames(styles.subTab, styles.scenarioSubTab)}>
                {hasSubTab && (
                  <ToggleTab
                    options={selectedTabOption.subTabs}
                    defaultOption={selectedSubTabName}
                    onToggle={this.handleSelectSubTabChange}
                  />
                )}
              </div>
            </div>
          </div>
          <div className={styles.container}>
            <div
              className={classNames(
                styles.panelFilter,
                loading ? styles.disable : ''
              )}
            >
              <div className={styles.searchFilter}>
                <input
                  placeholder="Search for scenarios"
                  type="search"
                  value={searchValue}
                  onChange={this.handleSearchChange}
                />
                <i className="material-icons">search</i>
                {this.state.loadingSearch && <Loader size="button" />}
              </div>
              <div
                className={classNames(
                  buildingStyles.buildingButtons,
                  styles.filterButtons
                )}
              >
                <div className={styles.dropDown}>
                  <div
                    className={styles.filterSelect}
                    onClick={this.handleOpenColumn}
                  >
                    Columns &nbsp; <i className="material-icons">view_column</i>
                  </div>
                  {showColumn && (
                    <ColumnList
                      user={user}
                      columnList={columnList}
                      defaultColumn={defaultScenarioColumn}
                      ColumnOptions={buildingColumnOptions}
                      currrentIndex={columnIndex}
                      handleToggleColumn={this.handleToggleColumn}
                      handleColumnChange={this.handleColumnChange}
                      handleCurrentColumnChange={this.handleCurrentColumnChange}
                    />
                  )}
                </div>
                {/* <div className={styles.filterSelect} onClick={toggleTargets}>
                  <Switch
                    label="Targets"
                    isSet={showTargets}
                    onSwitchToggled={toggleTargets}
                  />
                </div> */}
                <CSVLink
                  className={classNames(styles.filterSelect, styles.export)}
                  {...this.state.csvReport}
                  asyncOnClick={true}
                  onClick={this.downloadReport}
                >
                  Export&nbsp;
                  <i className="material-icons">cloud_download</i>
                </CSVLink>
                {/* <UserFeature name="scenario">
                  {({ enabled }) => {
                    if (!enabled) return null
                    return (
                      <div
                        className={styles.filterSelect}
                        onClick={this.handleOpenScenarioModal}
                      >
                        <i className="material-icons">add</i>
                        Scenario&nbsp;
                        <i className="material-icons">science</i>
                      </div>
                    )
                  }}
                </UserFeature> */}

                <div className={styles.buildingButtonsAdd}>
                  <div
                    className={styles.filterSelect}
                    onClick={this.hardReload}
                  >
                    <i className="material-icons">replay</i>
                  </div>
                </div>
              </div>
            </div>
            <FilterContainer
              user={this.props.user}
              filters={filters}
              showFilter={showFilter}
              handleFilterChange={this.handleFilterChange}
              handleToggleFilter={this.handleToggleFilter}
              handleShowFilter={this.handleToggleFilterContainer}
              FilterOptions={scenarioFilterOptions}
              itemList={this.props.scenarioList}
              activeTab={'scenario'}
              loading={loading}
              buildingGroups={buildingGroups}
              toggleEditGroup={this.toggleEditGroup}
              onSelectGroup={this.onSelectGroup}
              onEditGroup={this.onEditGroup}
              onDeleteGroup={this.onDeleteGroup}
              onAddGroup={this.onAddGroup}
              selectedBuildingGroupId={selectedBuildingGroupId}
              buildingList={this.props.buildingList}
              showTimeRange={showTimeRange}
              timeRange={timeRange}
              handleTimeRangeChange={this.handleTimeRangeChange}
              handleToggleTimeRange={this.handleToggleTimeRange}
            />
          </div>
        </div>
        {checkEmpty && this.renderEmptyState(checkEmpty)}
        {!checkEmpty && (
          <div className={styles.container}>
            <div
              className={classNames(
                styles.panel,
                loading ? styles.cursorWait : ''
              )}
            >
              <div className={classNames(styles.dashboardChartContainer)}>
                <PortfolioTableau
                  key={tableauKey}
                  url={chartURL}
                  token={this.props.tableauToken}
                  timeRange={timeRange}
                  scenarioIds={selectedScenarioIds}
                  tab="ScenarioList"
                  scenarioFilters={filters}
                  organizationView={this.props.organizationView}
                  organizationList={this.props.organizationList}
                  routeOrganizationId={routeOrganizationId}
                  showTargets={showTargets}
                  params={params}
                  buildingGroups={buildingGroups}
                  selectedBuildingGroupId={selectedBuildingGroupId}
                />
                {this.renderCharViewOption()}
              </div>
              <div>
                {loading && (
                  <div className={styles.portfolioContainerLoading}>
                    <Loader />
                    <div className={styles.loadingBuilding}>
                      <div>One moment while we get your data...</div>
                    </div>
                  </div>
                )}

                {this.renderTable()}

                {selectedTabName !== 'Comparison' &&
                  this.state.list.length === 0 &&
                  !loading && (
                    <div className={scenarioListStyles.scenarioNone}>
                      Add a Scenario
                      <button
                        className={classNames(
                          styles.button,
                          styles.buttonPrimary
                        )}
                        onClick={this.handleOpenAddScenarioModal}
                      >
                        <i className="material-icons">add</i>New
                        <span> Scenario</span>
                      </button>
                    </div>
                  )}
                {this.state.modalOpen && (
                  <ScenarioModal
                    user={this.props.user}
                    onClose={this.handleCloseScenarioModal}
                    modalView={this.state.modalView}
                    filters={(scenario && scenario.filters) || []}
                    scenario={scenario}
                    routeOrganizationId={routeOrganizationId}
                  />
                )}
                {this.state.convertModalOpen && this.state.scenario && (
                  <ScenarioConvertProjectModal
                    onClose={this.handleCloseConvertModal}
                    scenario={scenario}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
}

const mapDispatchToProps = {
  getPortfolioScenarioList,
  getTableauToken,
  removeScenario,
  push,
  createSampleBuilding,
  updateBuildingViewMode,
  toggleTargets,
  fetchBuildingGroups,
  deleteBuildingGroup,
  toggleManageAllOrgs,
  setBuildingGroup,
  toggleBuildingGroup
}

const mapStateToProps = state => ({
  user: state.login.user || {},
  buildingGroups: state.portfolio.buildingGroups,
  organizationView: state.organization.organizationView || {},
  organizationList: state.organization.organizationView || [],
  scenarioList: state.portfolio.scenarioList || [],
  scenarioStatus: state.portfolio.scenarioStatus || '',
  columnList: state.portfolio.scenarioColumnList || [],
  columnIndex: state.portfolio.scenarioColumnIndex || 0,
  filters: [],
  tableauToken: state.portfolio.tableauToken || '',
  buildingList: state.portfolio.dashboard.buildings || [],
  showTargets: state.organization.showTargets || false,
  selectedBuildingGroupId: state.portfolio.selectedBuildingGroupId,
  manageAllOrgSelected: state.organization.manageAllOrgSelected || false
})

export default connect(mapStateToProps, mapDispatchToProps)(ScenarioList)
