import _ from 'lodash'
import moment from 'moment'

import { _getValueFromObjPerPath } from './Utils'

export const sortFunction = (array, key) => {
  array.sort((a, b) => {
    let valueA = a[key] || ''
    let valueB = b[key] || ''
    return valueA.toLowerCase() > valueB.toLowerCase()
      ? 1
      : valueB.toLowerCase() > valueA.toLowerCase()
      ? -1
      : 0
  })
  return array
}

export const multiSelectChecker = (arr, target) =>
  target.every(v => arr.includes(v))

export const getValueArrayFromArray = (array, path) => {
  let values = []
  if (array && array.length)
    values = array
      .map(item => _getValueFromObjPerPath.call(item, path) || 0)
      .filter(value => value != 0)
  return values
}

export const getArrayFromBuildingTimeRange = (
  monthlyUtilities,
  timeRange,
  exceptYear = ''
) => {
  let values = monthlyUtilities
  if (
    values &&
    values.length &&
    timeRange &&
    timeRange.type &&
    timeRange.start &&
    timeRange.end
  ) {
    values = values.filter(item => {
      if (item.year_type !== undefined)
        return (
          item.year_type === timeRange.type &&
          timeRange.start <= item.year &&
          item.year <= timeRange.end &&
          (!exceptYear || (exceptYear && item.year !== exceptYear))
        )
      else {
        return (
          timeRange.start <= item.year &&
          item.year <= timeRange.end &&
          (!exceptYear || (exceptYear && item.year !== exceptYear))
        )
      }
    })
  }
  return values
}

export const getAverageOfArray = arr => {
  let array = arr.filter(item => item != 0 && item != undefined)
  const sum = array.reduce((sum, item) => {
    return sum + item
  }, 0)
  return array.length ? ((sum * 1.0) / array.length).toFixed(2) : 0
}

export const formatUnit = (unit, label) => {
  if (unit) {
    if (unit[0] === '$' && unit.length > 0) {
      label = `\$${label}${unit.slice(1)}`
    } else if (unit === '$') label = `${unit}${label}`
    else label = `${label} ${unit}`
  }
  return label
}

export const getAverageOrStringFromBuilding = (building, key, timeRange) => {
  let value = 0
  if (key.includes('buildingUseTypes')) {
    const buildingUseTypes =
      _getValueFromObjPerPath.call(building, 'buildingUseTypes') || []
    const values = getValueArrayFromArray(
      buildingUseTypes,
      key.substring(
        key.indexOf('buildingUseTypes') + 'buildingUseTypes'.length + 1
      )
    )
    value = values.join(', ')
  } else if (key.includes('monthlyUtilities')) {
    let monthlyUtilities = _getValueFromObjPerPath.call(
      building,
      'monthlyUtilities'
    )
    monthlyUtilities =
      getArrayFromBuildingTimeRange(monthlyUtilities, timeRange) || []
    const values = getValueArrayFromArray(
      monthlyUtilities,
      key.substring(
        key.indexOf('monthlyUtilities') + 'monthlyUtilities'.length + 1
      )
    )
    value = getAverageOfArray(values)
  } else if (key.includes('buildingPmScores.score')) {
    let buildingPmScores =
      _getValueFromObjPerPath.call(building, 'buildingPmScores') || []
    buildingPmScores =
      getArrayFromBuildingTimeRange(buildingPmScores, timeRange) || []
    let values = getValueArrayFromArray(
      buildingPmScores,
      key.substring(
        key.indexOf('buildingPmScores') + 'buildingPmScores'.length + 1
      )
    )
    values = values.filter(item => !!item && !isNaN(item)).map(item => +item)
    value = getAverageOfArray(values)
  }
  return value
}

export const handleSearchFilter = (
  user,
  buildingList,
  searchValue,
  filters,
  timeRange,
  buildingGroups = [],
  selectedBuildingGroupId,
  editBuildingGroup = false,
  selectedBuildingIds = [],
  flag = false,
  timeRangeFilterFlag = false
) => {
  let updatedList = buildingList
  if (searchValue != '') {
    updatedList = updatedList.filter(function(item) {
      if (item) {
        return (
          JSON.stringify(item)
            .toLowerCase()
            .indexOf(searchValue.toString().toLowerCase()) > -1
        )
      }
    })
  }
  updatedList = handleBuildingFilter(
    user,
    updatedList,
    filters,
    timeRange,
    flag,
    timeRangeFilterFlag
  )
  let selectedGroupBuildingIds = []
  if (editBuildingGroup && selectedBuildingIds.length) {
    selectedGroupBuildingIds = selectedBuildingIds
  } else if (selectedBuildingGroupId) {
    const selectedGroup = buildingGroups.find(
      group => group._id === selectedBuildingGroupId
    )
    selectedGroupBuildingIds = selectedGroup ? selectedGroup.buildingIds : []
  }
  updatedList = updatedList.reduce((agg, building) => {
    building.isInGroup =
      selectedGroupBuildingIds &&
      selectedGroupBuildingIds.includes(building._id)
    if (
      !selectedGroupBuildingIds.length ||
      building.isInGroup ||
      editBuildingGroup
    ) {
      agg.push(building)
    }
    return agg
  }, [])
  return updatedList
}

export const handleBuildingFilter = (
  user,
  buildingList,
  filtersArray,
  timeRange,
  flag = false,
  timeRangeFilterFlag = false
) => {
  let filters = filtersArray.filter(
    filter => !filter.value.includes('organization')
  )
  if (flag) {
    let organizationfilters = filtersArray.filter(filter =>
      filter.value.includes('organization')
    )
    if (
      organizationfilters.length &&
      !organizationfilters[0].options.selectedAll
    ) {
      let organizationIds = organizationfilters.map(
        filter => filter.options.value
      )
      buildingList = buildingList.filter(item => {
        let ids =
          (item.organizations &&
            item.organizations.map(org => org.organization._id)) ||
          []
        return ids.some(id => {
          return organizationIds.includes(id)
        })
      })
    }
  }

  if (!user.products || user.products.buildeeNYC !== 'access')
    filters =
      filters &&
      filters.filter((filter, index) => !filter.value.includes('nycfields'))

  if (filters && filters.length) {
    buildingList =
      buildingList &&
      buildingList.filter(building => {
        const flags = filters.map(filter => {
          let value
          if (
            filter.value.includes('organization') &&
            building.organization == null
          )
            value = ''
          else value = _getValueFromObjPerPath.call(building, filter.value)
          if (filter.value === 'projects')
            value = (building.projects && building.projects.length) || 0
          if (filter.value.includes('buildingUseTypes')) {
            const buildingUseTypes =
              _getValueFromObjPerPath.call(building, 'buildingUseTypes') || []
            value = getValueArrayFromArray(
              buildingUseTypes,
              filter.value.substring(
                filter.value.indexOf('buildingUseTypes') +
                  'buildingUseTypes'.length +
                  1
              )
            )
          } else if (filter.value.includes('monthlyUtilities')) {
            let monthlyUtilities = _getValueFromObjPerPath.call(
              building,
              'monthlyUtilities'
            )
            monthlyUtilities =
              getArrayFromBuildingTimeRange(monthlyUtilities, timeRange) || []
            value = getValueArrayFromArray(
              monthlyUtilities,
              filter.value.substring(
                filter.value.indexOf('monthlyUtilities') +
                  'monthlyUtilities'.length +
                  1
              )
            )
            value = getAverageOfArray(value)
          } else if (filter.value == 'buildingPmScores.score') {
            let buildingPmScores = _getValueFromObjPerPath.call(
              building,
              'buildingPmScores'
            )
            buildingPmScores =
              getArrayFromBuildingTimeRange(buildingPmScores, timeRange) || []
            value = getValueArrayFromArray(
              buildingPmScores,
              filter.value.substring(
                filter.value.indexOf('buildingPmScores') +
                  'buildingPmScores'.length +
                  1
              )
            )
            value = value.map(item => +item)
            value = getAverageOfArray(value)
          } else if (filter.value.includes('organization')) {
            value = _getValueFromObjPerPath.call(building, 'organization_id')
          } else if (filter.value.includes('createdBy.id')) {
            value = _getValueFromObjPerPath.call(building, 'createdBy.id')
          } else if (filter.value.includes('.created')) {
            value = _getValueFromObjPerPath.call(building, 'created')
          } else if (filter.value.includes('.updated')) {
            value = _getValueFromObjPerPath.call(building, 'updated')
          }
          if (value === +value && typeof value != 'object') value = +value
          switch (filter.select) {
            case 'multiSelect': {
              let options = filters.filter(item => filter.value === item.value)
              if (options.length && options[0].options.selectedAll) {
                return value !== null && value !== undefined
              }
              options = options.map(item => item.options.value)

              if (filter.value == 'buildingUseTypes.use') {
                return value.length ? multiSelectChecker(value, options) : false
              } else {
                return options.some(item => item === value)
              }
            }
            case 'singleSelect': {
              return value === filter.options.value
            }
            case 'dateRange': {
              let { start, end } = filter.options
              start = moment(start).startOf('day')
              end = moment(end).endOf('day')
              value = moment(value).startOf('day')
              if (value.isBetween(start, end)) return true
              return false
            }
            case 'yearRange':
            case 'range': {
              const { start, end } = filter.options
              if (value == null) return false
              if (typeof value === 'object') {
                return value && value.length
                  ? value.every(el => start <= el && el <= end)
                  : false
              } else {
                return start <= value && value <= end
              }
            }
            case 'costRange': {
              let { option, cost } = filter.options
              cost = +cost
              if (option === 'Less than') {
                return value < cost
              } else if (option === 'Greater than') {
                return value > cost
              } else return value === cost
            }
            default:
              return true
          }
        })
        return flags.indexOf(false) === -1
      })
  }

  const list = buildingList || []
  return list.filter(item => {
    if (
      timeRangeFilterFlag &&
      timeRange &&
      timeRange.type &&
      timeRange.start &&
      timeRange.end
    ) {
      const year = +moment(item.updated).format('YYYY')

      return timeRange.start <= year && year <= timeRange.end
    }
    return true
  })
}

const getOrganizationName = team => {
  let organizations = team.organizations || []
  return organizations.map(item => item.name).join('')
}

export const handleSort = (tab = 'building', buildings, sort, timeRange) => {
  return new Promise((resolve, reject) => {
    const { key, direction } = sort
    let buildingList = buildings

    if (direction === 'ASC') {
      buildingList = buildingList.sort(function(a, b) {
        let valueA = _getValueFromObjPerPath.call(a, key)
        let valueB = _getValueFromObjPerPath.call(b, key)
        if (key === 'organization.name' && tab === 'team') {
          valueA = getOrganizationName(a)
          valueB = getOrganizationName(b)
        }
        if (key === 'projects') {
          valueA = (a.projects && a.projects.length) || 0
          valueB = (b.projects && b.projects.length) || 0
        } else if (key.includes('buildingUseTypes')) {
          valueA = getAverageOrStringFromBuilding(a, key)
          valueB = getAverageOrStringFromBuilding(b, key)
        } else if (key.includes('monthlyUtilities')) {
          valueA = getAverageOrStringFromBuilding(a, key, timeRange)
          valueB = getAverageOrStringFromBuilding(b, key, timeRange)
        } else if (key.includes('buildingPmScores')) {
          valueA = getAverageOrStringFromBuilding(a, key, timeRange)
          valueB = getAverageOrStringFromBuilding(b, key, timeRange)
        } else if (
          key === 'updated' ||
          key === 'created' ||
          key === 'estimatedstartdate' ||
          key === 'estimatedcompletiondate' ||
          key === 'actualstartdate' ||
          key === 'actualcompletiondate'
        ) {
          if (valueA === valueB) return 0
          if (valueA === null || valueA === undefined) return 1
          if (valueB === null || valueB === undefined) return -1
          else return valueA < valueB ? -1 : 1
        } else if (key === 'numberOfBuildings') {
          valueA = [...new Set((a && a.buildingIds) || [])].length
          valueB = [...new Set((b && b.buildingIds) || [])].length
        } else if (key === 'building.buildingName') {
          valueA = getBuildingNamesFromProposal(a)
          valueB = getBuildingNamesFromProposal(b)
        }

        if (tab === 'project' || tab === 'projectPackage') {
          if (key === 'organization.name') {
            if (valueA.toLowerCase() < valueB.toLowerCase()) return -1
            if (valueA.toLowerCase() > valueB.toLowerCase()) return 1
            let buildingNameA =
              _getValueFromObjPerPath.call(a, 'building.buildingname') || ''
            let buildingNameB =
              _getValueFromObjPerPath.call(b, 'building.buildingname') || ''

            return buildingNameA.toLowerCase() < buildingNameB.toLowerCase()
              ? -1
              : buildingNameB.toLowerCase() < buildingNameA.toLowerCase()
              ? 1
              : 0
          }
        }
        if (valueA === valueB) return 0
        if (valueA === null || valueA === undefined) return 1
        if (valueB === null || valueB === undefined) return -1

        if (valueA == Number(valueA) || valueB == Number(valueB)) {
          valueA = Number(valueA)
          valueB = Number(valueB)
        }
        if (typeof valueA != 'string' || typeof valueB != 'string') {
          return valueA > valueB ? 1 : valueB > valueA ? -1 : 0
        }

        return valueA.toLowerCase() < valueB.toLowerCase()
          ? -1
          : valueB.toLowerCase() < valueA.toLowerCase()
          ? 1
          : 0
      })
    } else {
      buildingList = buildingList.sort(function(a, b) {
        let valueA = _getValueFromObjPerPath.call(a, key)
        let valueB = _getValueFromObjPerPath.call(b, key)
        if (key === 'organization.name' && tab === 'team') {
          valueA = getOrganizationName(a)
          valueB = getOrganizationName(b)
        }
        if (key === 'projects') {
          valueA = (a.projects && a.projects.length) || 0
          valueB = (b.projects && b.projects.length) || 0
        } else if (key.includes('buildingUseTypes')) {
          valueA = getAverageOrStringFromBuilding(a, key)
          valueB = getAverageOrStringFromBuilding(b, key)
        } else if (key.includes('monthlyUtilities')) {
          valueA = getAverageOrStringFromBuilding(a, key, timeRange)
          valueB = getAverageOrStringFromBuilding(b, key, timeRange)
        } else if (key.includes('buildingPmScores')) {
          valueA = getAverageOrStringFromBuilding(a, key, timeRange)
          valueB = getAverageOrStringFromBuilding(b, key, timeRange)
        } else if (
          key === 'updated' ||
          key === 'created' ||
          key === 'estimatedstartdate' ||
          key === 'estimatedcompletiondate' ||
          key === 'actualstartdate' ||
          key === 'actualcompletiondate'
        ) {
          if (valueA === valueB) return 0
          if (valueA === null || valueA === undefined) return 1
          if (valueB === null || valueB === undefined) return -1
          else return valueA < valueB ? 1 : -1
        } else if (key === 'numberOfBuildings') {
          valueA = [...new Set((a && a.buildingIds) || [])].length
          valueB = [...new Set((b && b.buildingIds) || [])].length
        } else if (key === 'building.buildingName') {
          valueA = getBuildingNamesFromProposal(a)
          valueB = getBuildingNamesFromProposal(b)
        }

        if (tab === 'project' || tab === 'projectPackage') {
          if (key === 'organization.name') {
            if (valueA === valueB) return 0
            if (valueA === null || valueA === undefined) return 1
            if (valueB === null || valueB === undefined) return -1
            if (valueA.toLowerCase() > valueB.toLowerCase()) return -1
            if (valueA.toLowerCase() < valueB.toLowerCase()) return 1
            let buildingNameA =
              _getValueFromObjPerPath.call(a, 'building.buildingname') || ''
            let buildingNameB =
              _getValueFromObjPerPath.call(b, 'building.buildingname') || ''

            return buildingNameA.toLowerCase() < buildingNameB.toLowerCase()
              ? -1
              : buildingNameB.toLowerCase() < buildingNameA.toLowerCase()
              ? 1
              : 0
          }
        }

        if (valueA === valueB) return 0
        if (valueA === null || valueA === undefined) return 1
        if (valueB === null || valueB === undefined) return -1

        if (valueA == Number(valueA) || valueB == Number(valueB)) {
          valueA = Number(valueA)
          valueB = Number(valueB)
        }
        if (typeof valueA != 'string' || typeof valueB != 'string') {
          return valueA > valueB ? -1 : valueB > valueA ? 1 : 0
        }
        return valueA.toLowerCase() > valueB.toLowerCase()
          ? -1
          : valueB.toLowerCase() > valueA.toLowerCase()
          ? 1
          : 0
      })
    }
    resolve(buildingList)
  })
}

export const getOrganizationIds = (
  filters,
  organizationView,
  organizationList = [],
  routeOrganizationId
) => {
  let orgID = (organizationView && organizationView._id) || routeOrganizationId
  let allIds = organizationList.map(organization => organization._id)
  let ids = []
  if (orgID) ids = [orgID]
  if (filters.length) {
    if (filters[0].options.selectedAll) ids = allIds
    else ids = filters.map(filter => filter.options.value)
  } else if (orgID === 'all') {
    ids = allIds
  }
  ids.sort()
  return ids
}
export const checkOrganizationFilterChange = (
  prevFilters,
  nextFilters,
  organizationView,
  organizationList,
  routeOrganizationId
) => {
  let oldOrganizationFilters = prevFilters.filter(filter =>
    filter.value.includes('organization')
  )
  let newOrganizationFilters = nextFilters.filter(filter =>
    filter.value.includes('organization')
  )
  let oldIDs = getOrganizationIds(
    oldOrganizationFilters,
    organizationView,
    organizationList,
    routeOrganizationId
  )
  let newIDs = getOrganizationIds(
    newOrganizationFilters,
    organizationView,
    organizationList,
    routeOrganizationId
  )
  return JSON.stringify(oldIDs) === JSON.stringify(newIDs)
}

export const groupCleanFilters = filters => {
  let newCleanFilters = []
  for (let index in filters) {
    let item = filters[index]
    if (item) {
      if (item.select !== 'multiSelect')
        newCleanFilters.push({
          value: item.value,
          options: item.options,
          tab: item.tab
        })
      if (item.options && item.options.selectedAll) continue
      let firstIndex = _.find(
        filters,
        filter => {
          return filter.value === item.value
        },
        0
      )
      if (firstIndex === index) {
        let options =
          filters
            .filter(fItem => fItem.value === item.value)
            .map(fItem => fItem.options.value) || []
        newCleanFilters.push({
          value: item.value,
          options: options,
          tab: item.tab
        })
      }
    }
  }
  return newCleanFilters
}

export const getOrganzationMemkey = (
  filters,
  organizationView,
  organizationList
) => {
  const orgFilters = filters.filter(filter =>
    filter.value.includes('organization')
  )
  const allIds = getOrganizationIds(
    orgFilters,
    organizationView,
    organizationList,
    null
  )
  let key = allIds.map(id => id.toString()).join(',')
  return key
}

export const getBuildingNamesFromProposal = (proposal = null) => {
  if (!proposal) return '-'
  let buildings = proposal.buildings || []
  let buildingNames = buildings.map(building => building.buildingName)
  buildingNames = [...new Set(buildingNames)]
  return buildingNames.length > 0 ? buildingNames.join(',') : '-'
}

export const getTeamData = (
  user,
  dashboard,
  filters,
  searchValue,
  timeRange,
  selectedView = 'Measure',
  buildingGroups = [],
  selectedBuildingGroupId
) => {
  let {
    buildings = [],
    projects = [],
    projectPackages = [],
    teams = [],
    proposals = []
  } = dashboard

  //filter data
  let filterWithoutOrganization = filters.filter(
    item => !item.value.includes('organization')
  )
  let buildingFilters = filters.filter(filter => filter.tab === 'building')
  let projectFilters = filters.filter(filter => filter.tab === 'project')
  let projectPackageFilters = filters.filter(
    filter => filter.tab === 'projectPackage'
  )
  let proposalFilters = filters.filter(
    filter =>
      filter.tab === 'proposal' ||
      filter.value.includes('organization') ||
      filter.value === 'building.buildingname' ||
      filter.value === 'building.buildingName'
  )
  let buildingList = handleSearchFilter(
    user,
    buildings,
    '',
    buildingFilters,
    timeRange,
    buildingGroups,
    selectedBuildingGroupId,
    false,
    [],
    false,
    true
  )

  let buildingIds = buildingList.map(building => building._id)
  buildingIds = [...new Set(buildingIds)]
  let projectList = handleSearchFilter(
    user,
    projects,
    '',
    projectFilters,
    timeRange
  )
  let projectPackageList = handleSearchFilter(
    user,
    projectPackages,
    '',
    projectPackageFilters,
    timeRange
  )
  let proposalList = handleSearchFilter(user, proposals, '', proposalFilters)

  console.log('proposalList', proposalList)

  projectList = projectList.filter(project => {
    let buildingId = (project && project.building && project.building._id) || ''
    if (buildingId && buildingIds.includes(buildingId)) return true
    return false
  })
  projectPackageList = projectPackageList.filter(project => {
    let buildingId = (project && project.building && project.building._id) || ''
    if (buildingId && buildingIds.includes(buildingId)) return true
    return false
  })
  proposalList = proposalList.filter(proposal => {
    if (!proposal) return false
    let buildingIds = (proposal && proposal.buildingIds) || []
    if (buildingIds.length === 0) return false
    return buildingIds.some(id => !buildingIds.includes(id)) ? false : true
  })

  if (projectList.length !== 0 && projectFilters.length !== 0) {
    let buildingIds = projectList
      .map(project => project && project.building && project.building._id)
      .filter(id => !!id)
    buildingList = buildingList.filter(building =>
      buildingIds.includes(building._id)
    )
  }

  if (projectPackageList.length !== 0 && projectPackageFilters.length !== 0) {
    let buildingIds = projectPackageList
      .map(project => project && project.building && project.building._id)
      .filter(id => !!id)
    buildingList = buildingList.filter(building =>
      buildingIds.includes(building._id)
    )
  }

  if (proposalList.length !== 0 && proposalFilters.length !== 0) {
    let proposalWithoutOrgFilter = proposalFilters.filter(
      item => !item.value.includes('organization')
    )
    if (proposalWithoutOrgFilter.length) {
      let buildingIds = []
      for (let proposal of proposalList) {
        let ids = (proposal && proposal.buildingIds) || []
        buildingIds = [...new Set([...buildingIds, ids])]
      }
      buildingList = buildingList.filter(building =>
        buildingIds.includes(building._id)
      )
    }
  }

  let teamList = []

  for (let team of teams) {
    if (selectedView === 'Measure') {
      let userBuildings =
        buildingList.filter(building => building.createdBy.id === team._id) ||
        []
      let userProjects =
        projectList.filter(project => project.createdBy.id === team._id) || []
      let teamObj = getTeamMeasureDataForUser(
        team,
        userBuildings,
        userProjects,
        buildingList
      )
      teamList.push(teamObj)
    } else if (selectedView === 'Project') {
      let userBuildings =
        buildingList.filter(building => building.createdBy.id === team._id) ||
        []
      let userProjectPackages =
        projectPackageList.filter(
          project => project.createdbyuserid === team._id
        ) || []
      let teamObj = getTeamProjectDataForUser(
        team,
        userBuildings,
        userProjectPackages,
        buildingList
      )
      teamList.push(teamObj)
    } else {
      let userBuildings =
        buildingList.filter(building => building.createdBy.id === team._id) ||
        []
      let userProposals =
        proposalList.filter(
          proposal => proposal.createdByUserId._id === team._id
        ) || []
      console.log(userBuildings, userProposals)
      let teamObj = getTeamProposalDataForUser(
        team,
        userBuildings,
        userProposals,
        buildingList
      )
      teamList.push(teamObj)
    }
  }

  if (filterWithoutOrganization.length !== 0 || selectedBuildingGroupId) {
    teamList = teamList.filter(item => !!item.numberOfBuilding)
  }

  if (searchValue != '') {
    teamList = teamList.filter(function(item) {
      if (item) {
        return (
          JSON.stringify(item.name)
            .toLowerCase()
            .indexOf(searchValue.toString().toLowerCase()) > -1
        )
      }
    })
  }
  return teamList.filter(item => !item.simuwattRole)
}

export const getTeamMeasureDataForUser = (
  userData,
  buildings = [],
  projects = [],
  allBuildings = []
) => {
  let allBuildingsIds = allBuildings.map(building => building._id)
  let numberofBuildings = buildings.length || 0
  let totalEnergysavings = 0,
    totalGHGSavings = 0,
    totalCostSaving = 0,
    totalIncentive = 0
  let allProjectCount = 0
  let paybackValues = []
  let buildingSet = new Set()

  for (let project of projects) {
    if (!project) continue
    totalEnergysavings += +(project.metric_energysavings || 0)
    totalGHGSavings += +(project.metric_ghgsavings || 0)
    totalCostSaving += +(project.metric_ghgsavingscost || 0)
    let simplePayback = +(project.metric_simple_payback || 0)
    totalIncentive += +(project.metric_incentive || 0)
    if (simplePayback) paybackValues.push(simplePayback)
    let buildingId = project.building_id
    if (!buildingId) continue
    if (!buildingSet.has(buildingId) && allBuildingsIds.includes(buildingId)) {
      buildingSet.add(buildingId)
    }
    if (allBuildingsIds.includes(buildingId)) {
      allProjectCount++
    }
  }

  let userBuildingIds = []
  userBuildingIds = buildings.map(building => building._id)
  userBuildingIds = [...userBuildingIds, ...buildingSet]
  buildingSet = new Set(userBuildingIds)

  let allBuildingCount = buildingSet.size || 0

  let user = {
    ...userData,
    numberOfBuilding: +numberofBuildings || 0,
    project_identified: +allProjectCount,
    average_project_building: +(allBuildingCount
      ? allProjectCount / allBuildingCount || 0
      : 0),
    total_energy_savings_identified: +totalEnergysavings,
    total_ghg_savings_identified: +totalGHGSavings,
    total_ghg_cost_savings_identified: +totalCostSaving,
    median_project_payback: getMedianValue(paybackValues),
    total_incentive_identified: +totalIncentive,
    average_project_kbtu: +(allProjectCount
      ? +totalEnergysavings / allProjectCount
      : 0)
  }
  return user
}

export const getTeamProjectDataForUser = (
  userData,
  buildings = [],
  projectPackages = [],
  allBuildings = []
) => {
  let allBuildingsIds = allBuildings.map(building => building._id)
  let numberofBuildings = buildings.length || 0
  let totalEnergysavings = 0,
    totalGHGSavings = 0,
    totalCostSaving = 0,
    totalIncentive = 0
  let allProjectCount = 0
  let paybackValues = []
  let buildingSet = new Set()

  for (let projectPackage of projectPackages) {
    if (!projectPackage) continue
    totalEnergysavings += +(projectPackage.total_energysavings || 0)
    totalGHGSavings += +(projectPackage.total_ghgsavings || 0)
    totalCostSaving += +(projectPackage.total_ghgsavingscost || 0)
    let simplePayback = +(projectPackage.total_simplepayback || 0)
    totalIncentive += +(projectPackage.total_incentive || 0)
    if (simplePayback && simplePayback >= 0) paybackValues.push(simplePayback)
    let buildingId = projectPackage.buildingid
    if (!buildingId) continue
    if (!buildingSet.has(buildingId) && allBuildingsIds.includes(buildingId)) {
      buildingSet.add(buildingId)
    }
    if (allBuildingsIds.includes(buildingId)) {
      allProjectCount++
    }
  }

  let userBuildingIds = []
  userBuildingIds = buildings.map(building => building._id)
  userBuildingIds = [...userBuildingIds, ...buildingSet]
  buildingSet = new Set(userBuildingIds)

  let allBuildingCount = buildingSet.size || 0

  let user = {
    ...userData,
    numberOfBuilding: +numberofBuildings || 0,
    project_identified: +allProjectCount,
    average_project_building: +(allBuildingCount
      ? allProjectCount / allBuildingCount || 0
      : 0),
    total_energy_savings_identified: +totalEnergysavings,
    total_ghg_savings_identified: +totalGHGSavings,
    total_ghg_cost_savings_identified: +totalCostSaving,
    median_project_payback: getMedianValue(paybackValues),
    total_incentive_identified: +totalIncentive,
    average_project_kbtu: +(allProjectCount
      ? +totalEnergysavings / allProjectCount
      : 0)
  }
  return user
}

export const getTeamProposalDataForUser = (
  userData,
  buildings = [],
  proposals = [],
  allBuildings = []
) => {
  let allBuildingsIds = allBuildings.map(building => building._id)
  let numberofBuildings = buildings.length || 0
  let totalEnergysavings = 0,
    totalGHGSavings = 0,
    totalCostSaving = 0,
    totalIncentive = 0
  let allProjectCount = 0
  let paybackValues = []
  let buildingSet = new Set()

  for (let proposal of proposals) {
    if (!proposal) continue
    totalEnergysavings += +(
      (proposal.total && proposal.total.energySavings) ||
      0
    )
    totalGHGSavings += +((proposal.total && proposal.total.ghg) || 0)
    totalCostSaving += +((proposal.total && proposal.total.ghgCost) || 0)
    totalIncentive += +((proposal.total && proposal.total.incentive) || 0)

    let simplePaybackList = []
    let projects = proposal.projects || []
    let projectPackages = proposal.projectPackages || []

    if (simplePaybackList.length)
      paybackValues = [...paybackValues, ...simplePaybackList]
    let buildingIds = proposal.buildingIds || []
    console.log('buildingIds', buildingIds)
    if (!buildingIds.length) continue
    let isBuildingAvailable = false
    for (let buildingId of buildingIds) {
      if (
        !buildingSet.has(buildingId) &&
        allBuildingsIds.includes(buildingId)
      ) {
        buildingSet.add(buildingId)
      }
      if (allBuildingsIds.includes(buildingId)) isBuildingAvailable = true
    }
    console.log('allBuildingsIds', allBuildingsIds)
    console.log('isBuildingAvailable', isBuildingAvailable)
    if (isBuildingAvailable) {
      allProjectCount++
    }
  }

  let userBuildingIds = []
  userBuildingIds = buildings.map(building => building._id)
  userBuildingIds = [...userBuildingIds, ...buildingSet]
  buildingSet = new Set(userBuildingIds)

  let allBuildingCount = buildingSet.size || 0

  let user = {
    ...userData,
    numberOfBuilding: +numberofBuildings || 0,
    project_identified: +allProjectCount,
    average_project_building: +(allBuildingCount
      ? allProjectCount / allBuildingCount || 0
      : 0),
    total_energy_savings_identified: +totalEnergysavings,
    total_ghg_savings_identified: +totalGHGSavings,
    total_ghg_cost_savings_identified: +totalCostSaving,
    median_project_payback: getMedianValue(paybackValues),
    total_incentive_identified: +totalIncentive,
    average_project_kbtu: +(allProjectCount
      ? +totalEnergysavings / allProjectCount
      : 0)
  }
  return user
}

export const getMedianValue = (values = []) => {
  if (values.length === 0) return null
  values.sort((a, b) => a - b)
  let lowMiddle = Math.floor((values.length - 1) / 2)
  let highMiddle = Math.ceil((values.length - 1) / 2)
  let median = (values[lowMiddle] + values[highMiddle]) / 2
  return median
}

export const filterOrganizationsForTeam = (
  organizationList = [],
  filterList = [],
  organizationView = {}
) => {
  let filters =
    filterList.filter(item => item.value === 'organization.name') || []
  const ids = filters
    .map(item => item.options && item.options.value)
    .filter(item => !!item)
  if (ids.length === 0) {
    if (organizationView && organizationView._id) {
      ids.push(organizationView._id)
    }
  }
  const includeOrganizations = organizationList
    .filter(org => ids.includes(org._id))
    .sort((orgA, orgB) => {
      const idA = orgA._id
      const idB = orgB._id
      return idA < idB ? -1 : idA > idB ? 1 : 0
    })
  return [...includeOrganizations]
}

export const getOrganizationsForTeamToolTip = (
  organizationList = [],
  filterList = [],
  organizationView = {}
) => {
  let filters =
    filterList.filter(item => item.value === 'organization.name') || []
  const ids = filters
    .map(item => item.options && item.options.value)
    .filter(item => !!item)
  if (ids.length === 0) {
    if (organizationView && organizationView._id) {
      ids.push(organizationView._id)
    }
  }
  const includeOrganizations = organizationList
    .filter(org => ids.includes(org._id))
    .sort((orgA, orgB) => {
      const idA = orgA._id
      const idB = orgB._id
      return idA < idB ? -1 : idA > idB ? 1 : 0
    })
  const otherOrganizations = organizationList
    .filter(org => !ids.includes(org._id))
    .sort((orgA, orgB) => {
      const idA = orgA._id
      const idB = orgB._id
      return idA < idB ? -1 : idA > idB ? 1 : 0
    })
  return [...includeOrganizations, ...otherOrganizations]
}
