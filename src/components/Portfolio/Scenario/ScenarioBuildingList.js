import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import moment from 'moment'
import styles from '../PortfolioContainer.scss'
import buildingStyles from '../../Building/Building.scss'
import scenarioStyles from './ScenarioBuildingList.scss'
import FilterContainer from '../FilterContainer'
import ColumnList from '../../UI/Column/ColumnList'
import TimeRange from '../../UI/TimeRange'
import { Loader } from 'utils/Loader'
import ScenarioBuildingTable from '../../UI/PortfolioTables/ScenarioBuildingTable'
import {
  updateBuildingSort,
  updateBuildingColumnList,
  updateBuildingColumnIndex,
  getPortfolioBuildingList,
  syncScenarioBuilding
} from '../../../routes/Portfolio/modules/portfolio'
import { updateCurrentOrganization } from '../../../routes/Organization/modules/organization'
import { _getValueFromObjPerPath } from 'utils/Utils'
import { defaultBuildingColumn } from 'utils/PortfolioOptions'
import {
  handleSort,
  handleSearchFilter,
  checkOrganizationFilterChange,
  getOrganizationIds,
  multiSelectChecker
} from 'utils/Portfolio'
import {
  BuildingFilterOptions,
  buildingColumnOptions
} from 'utils/PortfolioOptions'

class ScenarioBuildingList extends Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    push: PropTypes.func.isRequired,
    buildingList: PropTypes.array.isRequired,
    organizationView: PropTypes.object.isRequired,
    sort: PropTypes.object.isRequired,
    columnList: PropTypes.array.isRequired,
    columnIndex: PropTypes.number.isRequired,
    changeBuildings: PropTypes.func.isRequired,
    setFieldValue: PropTypes.func.isRequired,
    buildingIds: PropTypes.array,
    scenarioBuildings: PropTypes.array
  }

  state = {
    showFilter: false,
    showFilterContainer: false,
    loadingSearch: false,
    showColumn: false,
    loading: false,
    searchValue: '',
    buildingList: [],
    timeRange: {
      type: '',
      start: '',
      end: ''
    },
    showExtras: false,
    filters: [],
    scenarioBuildings: this.props.scenarioBuildings
  }
  UNSAFE_componentWillMount() {
    let timeRange
    timeRange = {
      type: 'Calendar',
      start: +moment()
        .subtract(3, 'years')
        .format('YYYY'),
      end: +moment().format('YYYY')
    }
    this.setState({ timeRange })
    if (this.props.filters && this.props.filters.length)
      this.setState({ filters: this.props.filters })
  }

  componentDidMount() {
    let { searchValue, timeRange, filters } = this.state
    let { sort, buildingList, user } = this.props
    const orgFilters = filters.filter(filter =>
      filter.value.includes('organization')
    )
    let organizationIds = getOrganizationIds(
      orgFilters,
      this.props.organizationView,
      this.props.organizationList
    )
    if (this.checkDashboardBuilding(organizationIds) === true) {
      filters = filters.filter(filter => filter.tab == 'building')
      buildingList = handleSearchFilter(
        user,
        this.props.dashboardBuildingList,
        searchValue,
        filters,
        timeRange
      )
      this.setState({ loading: true }, () => {
        handleSort('scenarioBuilding', buildingList, sort, timeRange).then(
          buildingList => {
            this.setState({ buildingList, loading: false })
          }
        )
      })
      this.props.syncScenarioBuilding(this.props.dashboardBuildingList)
    } else {
      if (this.checkBuilding(organizationIds) === true) {
        filters = filters.filter(filter => filter.tab == 'building')
        buildingList = handleSearchFilter(
          user,
          buildingList,
          searchValue,
          filters,
          timeRange
        )
        this.setState({ loading: true }, () => {
          handleSort('scenarioBuilding', buildingList, sort, timeRange).then(
            buildingList => {
              this.setState({ buildingList, loading: false })
            }
          )
        })
      }
      this.fetchBuildingList(true)
    }
  }

  UNSAFE_componentWillReceiveProps = nextProps => {
    if (nextProps.organizationView._id != this.props.organizationView._id) {
      this.fetchBuildingList(true)
    }
    if (
      nextProps.buildingList !== this.props.buildingList ||
      (nextProps.user.products &&
        this.props.user.products &&
        nextProps.user.products.buildeeNYC !==
          this.props.user.products.buildeeNYC)
    ) {
      let { searchValue, timeRange, filters } = this.state
      let { sort } = this.props
      filters = filters.filter(filter => filter.tab == 'building')
      let buildingList = handleSearchFilter(
        nextProps.user,
        nextProps.buildingList,
        searchValue,
        filters,
        timeRange
      )
      this.setState({ loading: true }, () => {
        handleSort('scenarioBuilding', buildingList, sort, timeRange).then(
          buildingList => {
            this.setState({ buildingList, loading: false })
          }
        )
      })
    }
    if (nextProps.scenarioBuildings != this.props.scenarioBuildings) {
      let { timeRange } = this.state
      let { sort } = this.props
      handleSort(
        'scenarioBuilding',
        nextProps.scenarioBuildings,
        sort,
        timeRange
      ).then(scenarioBuildings => {
        this.setState({ scenarioBuildings })
      })
    }
  }

  handleToggleExtras = () => {
    this.setState(prevState => ({
      showExtras: !prevState.showExtras
    }))
  }

  fetchBuildingList = (option = false) => {
    const { loading, filters } = this.state
    if (loading) return
    const orgFilters = filters.filter(filter =>
      filter.value.includes('organization')
    )
    let organizationIds = getOrganizationIds(
      orgFilters,
      this.props.organizationView,
      this.props.organizationList
    )
    if (option === false && this.checkBuilding(organizationIds) === true) return
    this.setState({ loading: true }, () => {
      this.props
        .getPortfolioBuildingList(
          this.props.organizationView._id,
          organizationIds
        )
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

  checkOrganizationIds = (organizationIds, buildingList) => {
    let { routeOrganizationId } = this.props
    let uniqOrganizationIds = [...new Set([...organizationIds])]
    if (uniqOrganizationIds.length === 0)
      uniqOrganizationIds = [routeOrganizationId]
    let orgIds = buildingList.map(
      building =>
        (building && building.organization && building.organization._id) || ''
    )
    orgIds = orgIds.filter(orgId => orgId !== '')
    orgIds = [...new Set(orgIds)]
    if (orgIds.length === 0) orgIds = [routeOrganizationId]
    return (
      multiSelectChecker(uniqOrganizationIds, orgIds) &&
      multiSelectChecker(orgIds, uniqOrganizationIds)
    )
  }

  checkDashboardBuilding = organizationIds => {
    let { dashboardBuildingList = [] } = this.props
    return this.checkOrganizationIds(organizationIds, dashboardBuildingList)
  }

  checkBuilding = organizationIds => {
    let { buildingList = [] } = this.props
    return this.checkOrganizationIds(organizationIds, buildingList)
  }

  handleToggleFilter = toggle => {
    if (toggle != undefined) this.setState({ showFilter: toggle })
    else {
      this.setState(prevState => ({
        showFilter: !prevState.showFilter
      }))
    }
  }

  handleToggleFilterContainer = toggle => {
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

  handleToggleColumn = toggle => {
    if (toggle != undefined) this.setState({ showColumn: toggle })
    else {
      this.setState(prevState => ({
        showColumn: !prevState.showColumn
      }))
    }
  }

  handleFilterChange = options => {
    let { filters } = this.state
    const { setFieldValue, setFieldTouched } = this.props
    setFieldValue('filters', [...options])
    setFieldTouched('filters', true, true)
    this.setState({ filters: options }, () => {
      if (
        !checkOrganizationFilterChange(
          filters,
          options,
          this.props.organizationView,
          this.props.organizationList
        )
      ) {
        this.fetchBuildingList(true)
      } else {
        let { filters } = this.state
        filters = filters.filter(filter => filter.tab == 'building')
        let { timeRange, searchValue } = this.state
        let updatedList = this.props.buildingList
        this.setState({ loading: true }, () => {
          updatedList = handleSearchFilter(
            this.props.user,
            updatedList,
            searchValue,
            filters,
            timeRange
          )
          this.setState({
            buildingList: updatedList,
            loading: false
          })
        })
      }
    })
  }

  handleColumnChange = (columnList, index = null) => {
    this.props.updateBuildingColumnList(columnList)
    this.props.updateBuildingColumnIndex(
      index != null ? index : columnList.length - 1
    )
  }

  handleCurrentColumnChange = index => {
    this.props.updateBuildingColumnIndex(index)
  }

  handleOpenFilter = () => {
    this.setState({
      showFilterContainer: true,
      showFilter: true
    })
  }

  handleOpenColumn = () => {
    this.setState(prevState => ({
      showColumn: !prevState.showColumn
    }))
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
    this.setState({ timeRange: options }, () => {
      this.handleSearch()
    })
  }

  handleClickSort = key => {
    let tempSort = { ...this.props.sort }
    const { timeRange } = this.state
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

    this.setState({ loading: true }, () => {
      this.props.updateBuildingSort(tempSort, true).then(() => {
        let buildingList = [...this.state.buildingList]
        handleSort('scenarioBuilding', buildingList, tempSort, timeRange).then(
          buildingList => {
            this.setState({
              buildingList,
              loading: false
            })
          }
        )
        handleSort(
          'scenarioBuilding',
          this.props.scenarioBuildings,
          tempSort,
          timeRange
        ).then(buildingList => {
          this.setState({
            scenarioBuildings: buildingList
          })
        })
      })
    })
  }

  handleSearch = () => {
    let { filters } = this.state
    filters = filters.filter(filter => filter.tab == 'building')
    let { timeRange, searchValue } = this.state
    let updatedList = this.props.buildingList
    this.setState({ loading: true }, () => {
      updatedList = handleSearchFilter(
        this.props.user,
        updatedList,
        searchValue,
        filters,
        timeRange
      )
      this.setState({ buildingList: updatedList, loading: false })
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

  renderTimeRange = () => {
    const { timeRange } = this.state
    if (!timeRange || !timeRange.type || !timeRange.start || !timeRange.end)
      return 'Year Range'
    if (timeRange.type === 'Calendar')
      return `${timeRange.start} - ${timeRange.end}`
    return `FY\'${timeRange.start % 100} - FY\'${timeRange.end % 100}`
  }

  hardReload = () => {
    const { loading, filters } = this.state
    if (loading) return
    const orgFilters = filters.filter(filter =>
      filter.value.includes('organization')
    )
    let organizationIds = getOrganizationIds(
      orgFilters,
      this.props.organizationView,
      this.props.organizationList
    )
    this.setState({ loading: true }, () => {
      this.props
        .getPortfolioBuildingList(
          this.props.organizationView._id,
          organizationIds,
          true
        )
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

  render() {
    const {
      sort,
      columnList,
      columnIndex,
      user,
      setFieldValue,
      buildingIds,
      changeBuildings
    } = this.props
    let {
      filters,
      buildingList,
      showFilter,
      showFilterContainer,
      showColumn,
      searchValue,
      showTimeRange,
      timeRange,
      loading,
      scenarioBuildings
    } = this.state
    const columns =
      (columnList && columnList.length && columnList[columnIndex].column) ||
      defaultBuildingColumn

    const savedIds = buildingList.map(building => building._id)
    scenarioBuildings = scenarioBuildings.filter(
      building => savedIds.indexOf(building._id) === -1
    )

    const tableBuildings = [...scenarioBuildings, ...buildingList]
    let height = tableBuildings.length >= 8 ? 8 : tableBuildings.length
    height = 60 * height + 62

    return (
      <div
        className={classNames(styles.panel, loading ? styles.cursorWait : '')}
        style={{ marginBottom: `${height}px` }}
      >
        <div
          className={classNames(
            styles.panelFilter,
            loading ? styles.disable : ''
          )}
        >
          <div className={styles.searchFilter}>
            <input
              placeholder="Search for buildings"
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
                  defaultColumn={defaultBuildingColumn}
                  ColumnOptions={buildingColumnOptions}
                  currrentIndex={columnIndex}
                  handleToggleColumn={this.handleToggleColumn}
                  handleColumnChange={this.handleColumnChange}
                  handleCurrentColumnChange={this.handleCurrentColumnChange}
                />
              )}
            </div>
            <div className={styles.buildingButtonsAdd}>
              <div
                className={styles.filterSelect}
                onClick={this.handleOpenFilter}
              >
                Filter &nbsp;
                <i className="material-icons">tune</i>
              </div>
            </div>
            <div className={styles.buildingButtonsAdd}>
              <div className={styles.filterSelect} onClick={this.hardReload}>
                <i className="material-icons">replay</i>
              </div>
            </div>
          </div>
        </div>
        {(filters.length || showFilterContainer) && (
          <FilterContainer
            user={user}
            filters={filters}
            showFilter={showFilter}
            handleFilterChange={this.handleFilterChange}
            handleToggleFilter={this.handleToggleFilter}
            handleShowFilter={this.handleToggleFilterContainer}
            FilterOptions={BuildingFilterOptions}
            itemList={this.props.buildingList}
            activeTab={'building'}
            loading={loading}
            buildingList={buildingList}
            showTimeRange={showTimeRange}
            timeRange={timeRange}
            handleTimeRangeChange={this.handleTimeRangeChange}
            handleToggleTimeRange={this.handleToggleTimeRange}
          />
        )}
        {loading && (
          <div
            className={classNames(
              styles.portfolioContainerLoading,
              scenarioStyles.portfolioContainerLoading
            )}
          >
            <Loader />
            <div
              className={classNames(
                styles.loadingBuilding,
                scenarioStyles.loadingBuilding
              )}
            >
              <div>One moment while we get your data...</div>
            </div>
          </div>
        )}
        <ScenarioBuildingTable
          buildings={tableBuildings}
          columns={columns}
          user={this.props.user}
          sortOption={sort}
          user={user}
          timeRangeOption={timeRange}
          filterList={filters}
          pushFunc={this.props.push}
          sortFunc={this.handleClickSort}
          loading={loading}
          setFieldValue={setFieldValue}
          changeBuildings={changeBuildings}
          buildingIds={buildingIds}
          updateOrganization={this.props.updateCurrentOrganization}
        />
      </div>
    )
  }
}

const mapDispatchToProps = {
  push,
  updateBuildingSort,
  updateBuildingColumnList,
  updateBuildingColumnIndex,
  updateCurrentOrganization,
  getPortfolioBuildingList,
  syncScenarioBuilding
}

const mapStateToProps = state => ({
  user: state.login.user || {},
  buildingList: state.portfolio.scenarioBuilding || [],
  dashboardBuildingList:
    (state.portfolio.dashboard && state.portfolio.dashboard.buildings) || [],
  organizationList: state.organization.organizationList || [],
  organizationView: state.organization.organizationView || {},
  sort: state.portfolio.scenarioBuildingSort || {},
  columnList: state.portfolio.buildingColumnList || [
    {
      name: 'Default',
      column: defaultBuildingColumn
    }
  ],
  columnIndex: state.portfolio.buildingColumnIndex || 0
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ScenarioBuildingList)
