import React, { Component } from 'react'
import { connect } from 'react-redux'
import TableauReport from 'tableau-react'
import { getOrganizationIds, handleSearchFilter } from 'utils/Portfolio'
import styles from './PortfolioTableau.scss'
import { getTableauToken } from '../../routes/Portfolio/modules/portfolio'

let viz = null,
  self,
  props = {}

class PortfolioTableau extends Component {
  UNSAFE_componentWillMount() {
    localStorage.setItem('dashboard_buildingIds', JSON.stringify([]))
    localStorage.setItem('dashboard_measureIds', JSON.stringify([]))
    localStorage.setItem('dashboard_projectIds', JSON.stringify([]))
    self = this
    props = { ...this.props }
    const existingScript = document.getElementById('tableauAPI')
    if (!existingScript) {
      const script = document.createElement('script')
      script.src =
        'https://tableau.buildee.com/javascripts/api/tableau-2.8.0.min.js'
      script.id = 'tableauAPI'
      script.setAttribute('crossorigin', 'anonymous')
      document.body.appendChild(script)
      script.onload = () => {
        console.log('Tableau API is Loaded')
        this.initViz()
      }
    }
  }

  componentWillUnmount() {
    localStorage.setItem('dashboard_buildingIds', JSON.stringify([]))
    localStorage.setItem('dashboard_measureIds', JSON.stringify([]))
    localStorage.setItem('dashboard_projectIds', JSON.stringify([]))
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.tab !== 'portfolioDashboard') return
    let prevOrgIds = this.getOrgIds(props)
    let orgIds = this.getOrgIds(nextProps)
    prevOrgIds = prevOrgIds.sort((a, b) => a - b)
    orgIds = orgIds.sort((a, b) => a - b)

    let prevTableauToken = props.tableauToken
    let tableauToken = nextProps.tableauToken

    if (tableauToken !== prevTableauToken) {
      console.log('need to reload')
      props = Object.assign({}, nextProps)
      this.initViz()
    } else {
      console.log('need to apply filter')
      props = Object.assign({}, nextProps)
      this.filterApply()
    }
  }

  handleError(event) {
    console.log('Tableau Error', event)
    this.props.getTableauToken()
  }

  initViz() {
    let ticket = props.tableauToken
    let containerDiv = document.getElementById('vizContainer')
    let index = props.url.indexOf('/t/')
    let url =
      props.url.slice(0, index) + `/trusted/${ticket}` + props.url.slice(index)
    if (props.tab === 'portfolioDashboard') {
      let chartType = ''
      let orgIds = this.getOrgIds(props)
      let query = `?:showAppBanner=false&:revert=all&:display_count=n&:origin=viz_share_link&:jsdebug=y&:render=false&:embed=y&:showVizHome=n&:toolbar=n`
      if (url.includes('?chart_type')) {
        let originalURl = url
        let index = originalURl.indexOf('?chart_type')
        url = url.slice(0, index)
        chartType = originalURl.slice(index + 12)
        query = `?chart_type=${chartType}&:showAppBanner=false&:display_count=n&:origin=viz_share_link&:jsdebug=y&:render=false&:embed=y&:showVizHome=n&:toolbar=n`
      }
      let organizationIdString = encodeURIComponent(orgIds)
      query = `${query}&start_year=${props.timeRange.start}&end_year=${props.timeRange.end}&year_type=${props.timeRange.type}&organization_id=${organizationIdString}`
      if (props.params) {
        let { params } = props
        delete params['end_year']
        delete params['start_year']
        delete params['year_type']
        delete params['organization_id']
        for (let key in params) {
          query = `${query}&${key}=${params[key]}`
        }
      }
      url = url + query
    }
    let options = {
      hideTabs: true,
      onFirstInteractive: self.filterApply
    }

    if (viz) {
      viz.dispose()
      viz = null
    }

    // let buildingIds = self.getBuildingIds(props)
    // let measureIds = self.getProjectIds(props)
    // let projectIds = self.getProjectPackageIds(props)
    // buildingIds = buildingIds === -1 ? [] : buildingIds
    // measureIds = measureIds === -1 ? [] : measureIds
    // projectIds = projectIds === -1 ? [] : projectIds
    // options['building_id'] = buildingIds
    // options['measure_id'] = measureIds
    // options['project_id'] = projectIds
    // localStorage.setItem('dashboard_buildingIds', JSON.stringify(buildingIds))
    // localStorage.setItem('dashboard_measureIds', JSON.stringify(measureIds))
    // localStorage.setItem('dashboard_projectIds', JSON.stringify(projectIds))

    localStorage.setItem('dashboard_buildingIds', JSON.stringify([]))
    localStorage.setItem('dashboard_measureIds', JSON.stringify([]))
    localStorage.setItem('dashboard_projectIds', JSON.stringify([]))

    console.log('Tableau URL:', url)
    console.log('Tableau Token: ', props.tableauToken)
    console.log('options ', options)
    viz = new tableau.Viz(containerDiv, url, options)
  }

  filterApply() {
    try {
      let mainWorkBook = viz.getWorkbook()
      let worksheet = mainWorkBook.getActiveSheet()
      let buildingIds = self.getBuildingIds(props)
      let measureIds = self.getProjectIds(props)
      let projectIds = self.getProjectPackageIds(props)
      buildingIds =
        buildingIds === -1
          ? []
          : buildingIds.length === 0
          ? 'None'
          : buildingIds
      measureIds =
        measureIds === -1 ? [] : measureIds.length === 0 ? 'None' : measureIds
      projectIds =
        projectIds === -1 ? [] : projectIds.length === 0 ? 'None' : projectIds
      let prevBuildingIds = localStorage.getItem('dashboard_buildingIds')
      let prevMeasureIds = localStorage.getItem('dashboard_measureIds')
      let prevProjectIds = localStorage.getItem('dashboard_projectIds')

      if (prevBuildingIds !== JSON.stringify(buildingIds)) {
        worksheet.applyFilterAsync(
          'building_id',
          buildingIds === 'None' ? [] : buildingIds,
          tableau.FilterUpdateType.REPLACE
        )
        if (buildingIds === 'None') {
          console.log('empty : True')
          mainWorkBook.changeParameterValueAsync('building_empty', 'True')
        } else {
          console.log('empty : False')
          mainWorkBook.changeParameterValueAsync('building_empty', 'False')
        }
        localStorage.setItem(
          'dashboard_buildingIds',
          JSON.stringify(buildingIds)
        )
      }

      if (prevMeasureIds !== JSON.stringify(measureIds)) {
        worksheet.applyFilterAsync(
          'measure_id',
          measureIds,
          tableau.FilterUpdateType.REPLACE
        )
        localStorage.setItem('dashboard_measureIds', JSON.stringify(measureIds))
      }

      if (prevProjectIds !== JSON.stringify(projectIds)) {
        console.log('project filter applied ')
        worksheet.applyFilterAsync(
          'project_id',
          projectIds,
          tableau.FilterUpdateType.REPLACE
        )
        localStorage.setItem('dashboard_projectIds', JSON.stringify(projectIds))
      }
    } catch (error) {
      console.log('error', error)
    }
  }

  getOrgIds = props => {
    let {
      dashboardFilters,
      organizationView,
      organizationList,
      routeOrganizationId
    } = props
    if (!dashboardFilters) return null
    let organizationFilters = dashboardFilters.filter(filter =>
      filter.value.includes('organization')
    )
    let orgIds = getOrganizationIds(
      organizationFilters,
      organizationView,
      organizationList,
      routeOrganizationId
    )
    return orgIds
  }

  getBuildingIds = newProps => {
    let {
      dashboardFilters,
      user,
      buildingList,
      timeRange,
      projectList,
      buildingGroups,
      selectedBuildingGroupId
    } = newProps
    if (!newProps.dashboardFilters) return null
    let buildingFilters =
      dashboardFilters.filter(
        filter =>
          filter.tab == 'building' && !filter.value.includes('organization')
      ) || []

    let onlyBuildingFilters =
      dashboardFilters.filter(filter => filter.tab == 'building') || []

    let projectFilters = dashboardFilters.filter(
      filter =>
        filter.tab == 'project' || filter.value === 'building.buildingname'
    )

    console.log('onlyBuildingFilters', onlyBuildingFilters, dashboardFilters)

    if (
      (buildingFilters.length === 0 || onlyBuildingFilters.length === 0) &&
      projectFilters.length === 0 &&
      !selectedBuildingGroupId
    )
      return -1

    let filteredBuildingList = handleSearchFilter(
      user,
      buildingList,
      '',
      buildingFilters,
      timeRange,
      buildingGroups,
      selectedBuildingGroupId
    )

    let ids = filteredBuildingList.map(building => building._id)
    let buildingIds = [...new Set(ids)]
    if (projectList.length === 0 || projectFilters.length === 0)
      return buildingIds
    projectList = projectList.filter(project => {
      if (project.building_id) {
        return buildingIds.indexOf(project.building_id) != -1
      }
      return false
    })
    projectList = handleSearchFilter(user, projectList, '', projectFilters)
    buildingIds = projectList
      .map(project => project && project.building && project.building._id)
      .filter(id => !!id)
    return buildingIds
  }

  getProjectIds = newProps => {
    let { dashboardFilters, user, timeRange } = newProps
    let projectList = newProps.projectList
    if (!newProps.dashboardFilters) return null
    let buildingFilters = dashboardFilters.filter(
      filter =>
        filter.tab == 'building' && !filter.value.includes('organization')
    )

    let projectFilters = dashboardFilters.filter(
      filter =>
        filter.tab == 'project' ||
        filter.value.includes('organization') ||
        filter.value === 'building.buildingname'
    )

    let onlyProjectFilters = dashboardFilters.filter(
      filter => filter.tab == 'project'
    )
    if (onlyProjectFilters.length === 0) return -1

    if (buildingFilters.length || newProps.buildingGroups.length) {
      let buildingList = handleSearchFilter(
        user,
        newProps.buildingList,
        '',
        buildingFilters,
        timeRange,
        newProps.buildingGroups,
        newProps.selectedBuildingGroupId
      )
      let buildingIds = buildingList.map(item => item._id)
      projectList = projectList.filter(project => {
        if (project.building_id) {
          return buildingIds.indexOf(project.building_id) != -1
        }
        return false
      })
    }
    let filteredProjectList = handleSearchFilter(
      user,
      projectList,
      '',
      projectFilters
    )
    let ids = filteredProjectList.map(project => project._id)
    return [...new Set(ids)]
  }

  getProjectPackageIds = newProps => {
    let { dashboardFilters, user, timeRange } = newProps
    let projectPackageList = newProps.projectPackageList
    if (!newProps.dashboardFilters) return null
    let buildingFilters = dashboardFilters.filter(
      filter =>
        filter.tab == 'building' && !filter.value.includes('organization')
    )
    let projectPackageFilters = dashboardFilters.filter(
      filter =>
        filter.tab == 'projectPackage' ||
        filter.value.includes('organization') ||
        filter.value === 'building.buildingname'
    )

    let onlyProjectPackageFilters = dashboardFilters.filter(
      filter => filter.tab == 'projectPackage'
    )
    if (onlyProjectPackageFilters.length === 0) return -1

    if (buildingFilters.length || props.buildingGroups.length) {
      let buildingList = handleSearchFilter(
        user,
        props.buildingList,
        '',
        buildingFilters,
        timeRange,
        props.buildingGroups,
        props.selectedBuildingGroupId,
        props.editBuildingGroup
      )
      let buildingIds = buildingList.map(item => item._id)
      projectPackageList = projectPackageList.filter(projectPackage => {
        if (projectPackage.building_id) {
          return buildingIds.indexOf(projectPackage.building_id) != -1
        }
        return false
      })
    }
    let filteredProjectPackageList = handleSearchFilter(
      user,
      projectPackageList,
      '',
      projectPackageFilters
    )

    let ids = filteredProjectPackageList.map(
      projectPackage => projectPackage._id
    )
    return [...new Set(ids)]
  }

  getParameters = () => {
    const {
      dashboardFilters,
      organizationView,
      organizationList,
      timeRange,
      routeOrganizationId,
      tab,
      showTargets,
      params
    } = this.props
    let filters = {}
    let parameters = {
      start_year: timeRange.start,
      end_year: timeRange.end,
      year_type: timeRange.type,
      show_targets: showTargets !== undefined ? showTargets : true,
      multiple_targets: organizationView.targets
        ? organizationView.targets.length > 1
        : false
    }
    if (params) {
      parameters = {
        ...parameters,
        ...params
      }
    }
    if (tab === 'ScenarioList') {
      if (!this.props.scenarioIds || this.props.scenarioIds.length === 0) {
        parameters.organization_id = routeOrganizationId
        parameters.scenario_present = false
      } else {
        parameters.scenario_id = this.props.scenarioIds
        parameters.scenario_present = true
      }
      // parameters.end_year = 2050
      // let { scenarioFilters = [] } = this.props
      // let organizationfilters = scenarioFilters.filter(filter =>
      //   filter.value.includes('organization')
      // )
      // let orgIds = getOrganizationIds(
      //   organizationfilters,
      //   organizationView,
      //   organizationList,
      //   routeOrganizationId
      // )
      // parameters.organization_id = orgIds
    } else {
      let buildingFilters =
        dashboardFilters.filter(
          filter =>
            filter.tab == 'building' && !filter.value.includes('organization')
        ) || []
      let organizationFilters = dashboardFilters.filter(filter =>
        filter.value.includes('organization')
      )
      let orgIds = getOrganizationIds(
        organizationFilters,
        organizationView,
        organizationList,
        routeOrganizationId
      )
      parameters.organization_id = orgIds
      buildingFilters = buildingFilters.filter(
        filter => !filter.value.includes('organization')
      )
      let projectFilters = []
      if (tab === 'Measure') {
        projectFilters =
          dashboardFilters.filter(filter => filter.tab === 'project') || []
      } else {
        projectFilters =
          dashboardFilters.filter(filter => filter.tab === 'projectPackage') ||
          []
      }
      if (tab === 'portfolioDashboard') {
        projectFilters =
          dashboardFilters.filter(
            filter =>
              filter.tab === 'project' || filter.tab === 'projectPackage'
          ) || []
      }
      projectFilters = projectFilters.filter(
        filter => !filter.value.includes('organization')
      )

      buildingFilters.forEach(filter => {
        if (filter.paramName) {
          if (filter.select === 'multiSelect') {
            if (!filters[filter.paramName]) {
              let sameFilters = buildingFilters.filter(
                item => item.value === filter.value
              )
              let options = sameFilters.map(item => item.options.value)
              if (!(sameFilters.length && sameFilters[0].options.selectedAll))
                filters[filter.paramName] = options
            }
          } else if (
            filter.select === 'range' ||
            filter.select === 'yearRange'
          ) {
            let parametersHigh = `${filter.paramName}_high`
            let parametersLow = `${filter.paramName}_low`
            parameters[parametersLow] = filter.options.start
            parameters[parametersHigh] = filter.options.end
          } else if (
            filter.select === 'costRange' ||
            filter.select === 'yearRange'
          ) {
            let parametersHigh = `${filter.paramName}_high`
            let parametersLow = `${filter.paramName}_low`
            if (filter.options.option === 'Less than')
              parameters[parametersHigh] = filter.options.cost
            else if (filter.options.option === 'Equal to') {
              parameters[parametersHigh] = filter.options.cost
              parameters[parametersLow] = filter.options.cost
            } else parameters[parametersLow] = filter.options.cost
          }
        }
      })

      projectFilters.forEach(filter => {
        if (filter.paramName) {
          if (filter.select === 'multiSelect') {
            if (!filters[filter.paramName]) {
              let sameFilters = projectFilters.filter(
                item => item.value === filter.value
              )
              let options = sameFilters.map(item => item.options.value)
              if (!(sameFilters.length && sameFilters[0].options.selectedAll))
                filters[filter.paramName] = options
            }
          } else if (filter.select === 'range') {
            let parametersHigh = `${filter.paramName}_high`
            let parametersLow = `${filter.paramName}_low`
            parameters[parametersLow] = filter.options.start
            parameters[parametersHigh] = filter.options.end
          } else if (filter.select === 'costRange') {
            let parametersHigh = `${filter.paramName}_high`
            let parametersLow = `${filter.paramName}_low`
            if (filter.options.option === 'Less than')
              parameters[parametersHigh] = filter.options.cost
            else if (filter.options.option === 'Equal to') {
              parameters[parametersHigh] = filter.options.cost
              parameters[parametersLow] = filter.options.cost
            } else parameters[parametersLow] = filter.option.cost
          }
        }
      })
    }
    return { filters, parameters }
  }

  render() {
    let { filters, parameters } = this.getParameters()
    let refreshParameter = ''
    if (this.props.tab === 'ScenarioList') {
      if (!this.props.scenarioIds || this.props.scenarioIds.length === 0)
        refreshParameter = '&:revert=all'
      let query = `?:showAppBanner=false&:display_count=n${refreshParameter}&:origin=viz_share_link&:jsdebug=y&:render=false`
      return (
        <div className={styles.tableua}>
          <TableauReport
            url={this.props.url}
            query={query}
            options={{
              device: 'desktop',
              hideToolbar: true
            }}
            filters={filters}
            parameters={parameters}
            token={this.props.token}
          />
        </div>
      )
    }

    return (
      <div className={styles.tableua}>
        <div id="vizContainer" style={{ width: '1170px', height: '580px' }} />
      </div>
    )
  }
}

const mapDispatchToProps = {
  getTableauToken
}

const mapStateToProps = state => ({
  user: state.login.user || {},
  buildingList: state.portfolio.dashboard.buildings || [],
  projectList: state.portfolio.dashboard.projects || [],
  projectPackageList: state.portfolio.dashboard.projectPackages || [],
  organizationList: state.organization.organizationList || [],
  organizationView: state.organization.organizationView || {},
  tableauToken: state.portfolio.tableauToken || '',
  dashboardFilters: state.portfolio.dashboardFilters || []
})

export default connect(mapStateToProps, mapDispatchToProps)(PortfolioTableau)
