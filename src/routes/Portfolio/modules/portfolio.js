import ApiClient from 'utils/ApiClient'
import { showFlash as flash } from 'utils/Flash/modules/flash'
import { push } from 'react-router-redux'

import {
  getOrganizationBuildings,
  ORGANIZATION_GET_BUILDINGS_SUCCESS
} from 'routes/Organization/modules/organization'

import {
  defaultBuildingColumn,
  defaultProjectColumn,
  defaultProjectPackageColumn,
  defaultProposalColumn,
  defaultScenarioColumn,
  getTeamColumnOptions
} from 'utils/PortfolioOptions'
import { isProdEnv } from 'utils/Utils'
import { getOrganzationMemkey } from 'utils/Portfolio'
import merge from 'deepmerge'

// ------------------------------------
// Constants
// ------------------------------------
export const PORTFOLIO_ACCOUNT_SYNC = 'PORTFOLIO/PORTFOLIO_ACCOUNT_SYNC_START'
export const PORTFOLIO_ACCOUNT_SYNC_FAIL =
  'PORTFOLIO/PORTFOLIO_ACCOUNT_SYNC_FAIL'
export const PORTFOLIO_ACCOUNT_SYNC_SUCCESS =
  'PORTFOLIO/PORTFOLIO_ACCOUNT_SYNC_SUCCESS'

export const PORTFOLIO_PROPERTY_SYNC = 'PORTFOLIO/PORTFOLIO_PROPERTY_SYNC_START'
export const PORTFOLIO_PROPERTY_SYNC_FAIL =
  'PORTFOLIO/PORTFOLIO_PROPERTY_SYNC_FAIL'
export const PORTFOLIO_PROPERTY_SYNC_SUCCESS =
  'PORTFOLIO/PORTFOLIO_PROPERTY_SYNC_SUCCESS'

export const PORTFOLIO_METER_SYNC = 'PORTFOLIO/PORTFOLIO_METER_SYNC_START'
export const PORTFOLIO_METER_SYNC_FAIL = 'PORTFOLIO/PORTFOLIO_METER_SYNC_FAIL'
export const PORTFOLIO_METER_SYNC_SUCCESS =
  'PORTFOLIO/PORTFOLIO_METER_SYNC_SUCCESS'

export const PORTFOLIO_GET_PROPERTY_LIST =
  'PORTFOLIO/PORTFOLIO_GET_PROPERTY_LIST'
export const PORTFOLIO_GET_PROPERTY_LIST_FAIL =
  'PORTFOLIO/PORTFOLIO_GET_PROPERTY_LIST_FAIL'
export const PORTFOLIO_GET_PROPERTY_LIST_SUCCESS =
  'PORTFOLIO/PORTFOLIO_GET_PROPERTY_LIST_SUCCESS'

export const PORTFOLIO_ADD_ACCOUNT = 'PORTFOLIO/PORTFOLIO_ADD_ACCOUNT'
export const PORTFOLIO_ADD_ACCOUNT_FAIL = 'PORTFOLIO/PORTFOLIO_ADD_ACCOUNT_FAIL'
export const PORTFOLIO_ADD_ACCOUNT_SUCCESS =
  'PORTFOLIO/PORTFOLIO_ADD_ACCOUNT_SUCCESS'

export const UPDATE_PORTFOLIO_BUILDING_LIST =
  'PORTFOLIO/BUILDING/UPDATE_BUILDING_LIST'
export const PORTFOLIO_UPDATE_BUILDING_SORT = 'PORTFOLIO/BUILDING/UPDATE_SORT'
export const SYNC_SCENARIO_BUILDINGS =
  'PORTOFLIO/SCENARIO/SYNC_SCENARIO_BUILDINGS'
export const PORTFOLIO_UPDATE_BUILDING_COLUMN_LIST =
  'PORTFOLIO/BUILDING/UPDATE_COLUMN_LIST'
export const PORTFOLIO_UPDATE_BUILDING_COLUMN_INDEX =
  'PORTFOLIO/BUILDING/UPDATE_COLUMN_INDEX'

export const PORTFOLIO_UPDATE_PROJECT_SORT = 'PORTFOLIO/PROJECT/UPDATE_SORT'
export const PORTFOLIO_UPDATE_PROJECT_COLUMN_LIST =
  'PORTFOLIO/PROJECT/UPDATE_COLUMN_LIST'
export const PORTFOLIO_UPDATE_PROJECT_COLUMN_INDEX =
  'PORTFOLIO/PROJECT/UPDATE_COLUMN_INDEX'

export const UPDATE_PORTFOLIO_DASHBOARD =
  'PORTFOLIO/PROJECT/UPDATE_PORTFOLIO_DASHBOARD'
export const UPDATE_PORTFOLIO_DASHBOARD_FILTERS =
  'PORTFOLIO/PROJECT/UPDATE_PORTFOLIO_DASHBOARD_FILTERS'

export const UPDATE_PORTFOLIO_SCENARIO_LIST =
  'PORTFOLIO/BUILDING/UPDATE_SCENARIO_LIST'

export const UPDATE_PORTFOLIO_DASHBOARD_LOADING =
  'PORTFOLIO/DASHBOARD/UPDATE_PORTFOLIO_DASHBOARD_LOADING'
export const UPDATE_PORTFOLIO_TAB = 'PORTFOLIO_TAB'
export const PORTFOLIO_CLEAR_STORE = 'PORTFOLIO/PORTFOLIO_CLEAR_STORE'
export const UPDATE_PORTFOLIO_TABLEAU_TOKEN =
  'PORTFOLIO/UPDATE_PORTFOLIO_TABLEAU_TOKEN'
export const UPDATE_PORTFOLIO_TABLEAU_STATE =
  'PORTFOLIO/UPDATE_PORTFOLIO_TABLEAU_STATE'
export const UPDATE_PORTFOLIO_TABLEAU_STATE_REQUEST =
  'PORTFOLIO/UPDATE_PORTFOLIO_TABLEAU_STATE_REQUEST'

export const UPDATE_PORTFOLIO_RELOAD = 'PORTFOLIO/UPDATE_PORTFOLIO_RELOAD'

export const PORTFOLIO_UPDATE_PROJECTPACKAGE_SORT =
  'PORTFOLIO/PROJECTPACKAGE/UPDATE_SORT'
export const PORTFOLIO_UPDATE_PROJECTPACKAGE_COLUMN_LIST =
  'PORTFOLIO/PROJECTPACKAGE/UPDATE_COLUMN_LIST'
export const PORTFOLIO_UPDATE_PROJECTPACKAGE_COLUMN_INDEX =
  'PORTFOLIO/PROJECTPACKAGE/UPDATE_COLUMN_INDEX'

export const PORTFOLIO_UPDATE_PROPOSAL_SORT = 'PORTFOLIO/PROPOSAL/UPDATE_SORT'
export const PORTFOLIO_UPDATE_PROPOSAL_COLUMN_LIST =
  'PORTFOLIO/PROPOSAL/UPDATE_COLUMN_LIST'
export const PORTFOLIO_UPDATE_PROPOSAL_COLUMN_INDEX =
  'PORTFOLIO/PROPOSAL/UPDATE_COLUMN_INDEX'

export const PORTFOLIO_BUILDING_IMPORT_SYNC =
  'PORTFOLIO/PORTFOLIO_BUILDING_IMPORT_SYNC'
export const PORTFOLIO_BUILDING_IMPORT_SYNC_FAIL =
  'PORTFOLIO/PORTFOLIO_BUILDING_IMPORT_SYNC_FAIL'
export const PORTFOLIO_BUILDING_IMPORT_SYNC_SUCCESS =
  'PORTFOLIO/PORTFOLIO_BUILDING_IMPORT_SYNC_SUCCESS'

export const PORTFOLIO_UPDATE_TEAM_SORT = 'PORTFOLIO/TEAM/UPDATE_SORT'
export const PORTFOLIO_UPDATE_TEAM_COLUMN_LIST =
  'PORTFOLIO/TEAM/UPDATE_COLUMN_LIST'
export const PORTFOLIO_UPDATE_TEAM_COLUMN_INDEX =
  'PORTFOLIO/TEAM/UPDATE_COLUMN_INDEX'

export const SCENARIO_CONVERT_PROJECT = 'SCENARIO/CONVERT/PROJECT'
export const UPDATE_PORTOLIO_EXISTING_PROJECTS =
  'PORTFOLIO/UPDATE_PORTOLIO_EXISTING_PROJECTS'
export const UPDATE_PORTOLIO_EXISTING_PROJECTPACKAGES =
  'PORTFOLIO/UPDATE_PORTOLIO_EXISTING_PROJECTPACKAGES'

export const CREATE_PORTFOLIO_PROPOSAL = 'PORTFOLIO/CREATE_PORTFOLIO_PROPOSAL'
export const UPDATE_PORTFOLIO_PROPOSAL = 'PORTFOLIO/UPDATE_PORTFOLIO_PROPOSAL'
export const DELETE_PORTFOLIO_PROPOSAL = 'PORTFOLIO/DELETE_PORTFOLIO_PROPOSAL'

export const CREATE_BUILDING_GROUP = 'PORTFOLIO/CREATE_BUILDING_GROUP'
export const FETCH_BUILDING_GROUP_SUCCESS =
  'PORTFOLIO/FETCH_BUILDING_GROUP_SUCCESS'
export const UPDATE_BUILDING_GROUP_SUCCESS =
  'PORTFOLIO/UPDATE_BUILDING_GROUP_SUCCESS'
export const DELETE_BUILDING_GROUP_SUCCESS =
  'PORTFOLIO/DELETE_BUILDING_GROUP_SUCCESS'
export const SET_BUILDING_GROUP = 'PORTFOLIO/SET_BUILDING_GROUP'
export const TOGGLE_EDIT_BUILDING_GROUP = 'PORTFOLIO/TOGGLE_EDIT_BUILDING_GROUP'
export const GET_PORTFOLIO_PROPOSAL_MEASURE =
  'PORTFOLIO/GET_PORTFOLIO_PROPOSAL_MEASURE'

// ------------------------------------
// Actions
// ------------------------------------

export const deletePortfolioConnection = portfolioId => {
  return (dispatch, getState) => {
    dispatch({ type: PORTFOLIO_ACCOUNT_SYNC })
    const organizationId = getState().organization.organizationView._id
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .post('/portfolio/account/delete', {
          data: {
            portfolioId: portfolioId,
            organizationId: organizationId
          }
        })
        .then(response => {
          dispatch(getConnectedAccounts())
          dispatch(flash(response.message, 'success', 2))
          resolve()
        })
        .catch(err => {
          dispatch({ type: PORTFOLIO_ACCOUNT_SYNC_FAIL })
          dispatch(
            flash(err || 'Issues syncing portfolio manager account', 'error')
          )
          reject(err)
        })
    })
  }
}

export const portfolioAddAccount = (portfolioUser, portfolioPass) => {
  return (dispatch, getState) => {
    dispatch({ type: PORTFOLIO_ACCOUNT_SYNC })
    const organizationId = getState().organization.organizationView._id
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .post('/portfolio/account/add', {
          data: {
            portfolioUser: portfolioUser,
            portfolioPass: portfolioPass,
            organizationId: organizationId
          }
        })
        .then(response => {
          dispatch(getConnectedAccounts())
          dispatch(flash(response.message, 'success', 2))
          resolve()
        })
        .catch(err => {
          dispatch({ type: PORTFOLIO_ACCOUNT_SYNC_FAIL })
          dispatch(
            flash(err || 'Issues syncing portfolio manager account', 'error')
          )
          reject(err)
        })
    })
  }
}

export const portfolioPropertySync = () => {
  return (dispatch, getState) => {
    dispatch({ type: PORTFOLIO_PROPERTY_SYNC })
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .post('/portfolio/property/sync')
        .then(response => {
          dispatch({ type: PORTFOLIO_PROPERTY_SYNC_SUCCESS })
          resolve()
        })
        .catch(err => {
          dispatch({ type: PORTFOLIO_PROPERTY_SYNC_FAIL })
          dispatch(
            flash(err || 'Issues syncing portfolio manager property', 'error')
          )
          reject(err)
        })
    })
  }
}

export const portfolioAccountSync = () => {
  return (dispatch, getState) => {
    dispatch({ type: PORTFOLIO_PROPERTY_SYNC })
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .post('/portfolio/account/sync')
        .then(response => {
          dispatch({ type: PORTFOLIO_PROPERTY_SYNC_SUCCESS })
          resolve()
        })
        .catch(err => {
          dispatch({ type: PORTFOLIO_PROPERTY_SYNC_FAIL })
          dispatch(
            flash(err || 'Issues syncing portfolio manager property', 'error')
          )
          reject(err)
        })
    })
  }
}

export const portfolioMeterSync = () => {
  return (dispatch, getState) => {
    dispatch({ type: PORTFOLIO_METER_SYNC })
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .post('/portfolio/meter/sync')
        .then(response => {
          dispatch({ type: PORTFOLIO_METER_SYNC_SUCCESS })
          resolve()
        })
        .catch(err => {
          dispatch({ type: PORTFOLIO_METER_SYNC_FAIL })
          dispatch(
            flash(err || 'Issues syncing portfolio manager meter', 'error')
          )
          reject(err)
        })
    })
  }
}

export const getConnectedAccounts = () => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const organizationId = getState().organization.organizationView._id
      const client = new ApiClient(dispatch, getState())
      client
        .get('/portfolio/account', {
          params: { organizationId: organizationId }
        })
        .then(response => {
          dispatch({
            type: PORTFOLIO_ACCOUNT_SYNC_SUCCESS,
            connectedAccounts: response.connectedAccounts
          })
          dispatch(portfolioAccountSync())
          dispatch(portfolioPropertySync())
          dispatch(portfolioMeterSync())
          resolve()
        })
        .catch(err => {
          dispatch(
            flash(err || 'Issues syncing portfolio manager account', 'error')
          )
          reject(err)
        })
    })
  }
}

export const getPortfolioPropertyList = accountId => {
  return (dispatch, getState) => {
    dispatch({ type: PORTFOLIO_GET_PROPERTY_LIST })
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .get('/portfolio/propertyList', { params: { accountId: accountId } })
        .then(response => {
          dispatch({
            type: PORTFOLIO_GET_PROPERTY_LIST_SUCCESS,
            propertyList: response.propertyList
          })
          resolve(response.propertyList)
        })
        .catch(err => {
          dispatch({ type: PORTFOLIO_GET_PROPERTY_LIST_FAIL })
          dispatch(
            flash(err || 'Issues retrieving portfolio property list', 'error')
          )
          reject(err)
        })
    })
  }
}

export const pmExportUpdate = (pmAccount, syncBuildings, accountUsername) => {
  var payload = {
    pmAccount: pmAccount,
    syncBuildings: syncBuildings || [],
    accountUsername: accountUsername || ''
  }

  var timeoutLength = 10000
  if (syncBuildings && syncBuildings.length < 10) {
    timeoutLength = 5000
  }

  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      const organizationId = getState().organization.organizationView._id
      client
        .post(
          '/organization/' +
            organizationId +
            '/portfolio/property/export/update',
          { data: payload, params: { run: true } }
        )
        .then(response => {
          let counter = 0

          const checkForCompletion = () => {
            setTimeout(function() {
              client
                .post(
                  '/organization/' +
                    organizationId +
                    '/portfolio/property/export/update',
                  { params: { run: false } }
                )
                .then(response => {
                  if (
                    response.status === 'Success' &&
                    response.exportUpdateResponse
                  ) {
                    dispatch(getOrganizationBuildings(organizationId))
                    resolve(response.exportUpdateResponse)
                  } else {
                    counter++
                    if (counter >= 10) {
                      dispatch(
                        flash(
                          err || 'Issues retrieving portfolio property',
                          'error'
                        )
                      )
                      reject('Issues retrieving portfolio property')
                    } else {
                      checkForCompletion()
                    }
                  }
                })
            }, timeoutLength)
          }

          checkForCompletion()
        })
        .catch(err => {
          dispatch(
            flash(err || 'Issues retrieving portfolio property', 'error')
          )
          reject('Issues retrieving portfolio property')
        })
    })
  }
}

export const pmImport = payload => {
  var timeoutLength = 10000
  if (payload.length < 10) {
    timeoutLength = 5000
  }

  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      const organizationId = getState().organization.organizationView._id
      client
        .post(
          '/organization/' + organizationId + '/portfolio/property/import',
          { data: payload, params: { run: true } }
        )
        .then(response => {
          let counter = 0

          const checkForCompletion = () => {
            setTimeout(function() {
              client
                .post(
                  '/organization/' +
                    organizationId +
                    '/portfolio/property/import',
                  { params: { run: false } }
                )
                .then(response => {
                  if (
                    response.status === 'Success' &&
                    response.importResponse
                  ) {
                    dispatch(getOrganizationBuildings(organizationId))
                    resolve(response.importResponse)
                  } else {
                    counter++
                    if (counter >= 10) {
                      dispatch(
                        flash('Issues retrieving portfolio property', 'error')
                      )
                      reject('Issues retrieving portfolio property')
                    } else {
                      checkForCompletion()
                    }
                  }
                })
                .catch(err => {
                  dispatch(flash('Issues retrieving portfolio property ' + err))
                  reject('Issues retrieving portfolio property')
                })
            }, timeoutLength)
          }

          checkForCompletion()
        })
        .catch(err => {
          dispatch(flash('Issues retrieving portfolio property'))
          reject('Issues retrieving portfolio property')
        })
    })
  }
}

export const getPortfolioMeterList = (accountId, propertyId) => {
  return (dispatch, getState) => {
    dispatch({ type: PORTFOLIO_GET_PROPERTY_LIST })
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .get('/portfolio/meterList', {
          params: { accountId: accountId, propertyId: propertyId }
        })
        .then(response => {
          resolve(response.meterList)
        })
        .catch(err => {
          dispatch({ type: PORTFOLIO_GET_PROPERTY_LIST_FAIL })
          dispatch(
            flash(err || 'Issues retrieving portfolio property list', 'error')
          )
          reject(err)
        })
    })
  }
}

export const getPortfolioMeter = (accountId, meterId) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .get('/portfolio/meter', {
          params: { accountId: accountId, meterId: meterId }
        })
        .then(response => {
          // dispatch(create(payload))
          // resolve()
        })
        .catch(err => {
          dispatch(
            flash(err || 'Issues retrieving portfolio property', 'error')
          )
          reject(err)
        })
    })
  }
}

export const pmImportUpdate = payload => {
  var timeoutLength = 10000

  if (payload.length < 10) {
    timeoutLength = 5000
  }

  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      const organizationId = getState().organization.organizationView._id

      client
        .post(
          '/organization/' +
            organizationId +
            '/portfolio/property/import/update',
          { data: payload, params: { run: true } }
        )
        .then(response => {
          let counter = 0

          const checkForCompletion = () => {
            setTimeout(function() {
              client
                .post(
                  '/organization/' +
                    organizationId +
                    '/portfolio/property/import/update',
                  { data: payload, params: { run: false } }
                )
                .then(response => {
                  if (response.status === 'Success') {
                    dispatch(getOrganizationBuildings(organizationId))
                    resolve(response.importUpdateResponse)
                  } else {
                    counter++
                    if (counter >= 10) {
                      dispatch(
                        flash('Issues retrieving portfolio property', 'error')
                      )
                      reject('Issues retrieving portfolio property')
                    } else {
                      checkForCompletion()
                    }
                  }
                })
            }, timeoutLength)
          }
          checkForCompletion()
        })
        .catch(err => {
          dispatch(flash('Issues retrieving portfolio property'))
          reject('Issues retrieving portfolio property')
        })
    })
  }
}

export const pmExport = (pmAccount, property, accountUsername) => {
  let timeoutLength = 10000
  if (property) {
    timeoutLength = 4000
  }

  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      const organizationId = getState().organization.organizationView._id

      client
        .post(
          '/organization/' + organizationId + '/portfolio/property/export',
          {
            data: property,
            params: {
              run: true,
              pmAccountId: pmAccount.accountId,
              accountUsername: accountUsername
            }
          }
        )
        .then(response => {
          // limit so the function doesnt run indefinitely
          let counter = 0
          const checkForCompletion = () => {
            setTimeout(function() {
              client
                .post(
                  '/organization/' +
                    organizationId +
                    '/portfolio/property/export',
                  { params: { run: false } }
                )
                .then(response => {
                  if (
                    response.status === 'Success' &&
                    response.exportResponse
                  ) {
                    dispatch(getOrganizationBuildings(organizationId))
                    resolve(response.exportResponse)
                  } else {
                    counter++
                    if (counter >= 10) {
                      dispatch(
                        flash('Issues retrieving portfolio property', 'error')
                      )
                      reject('Issues retrieving portfolio property')
                    } else {
                      checkForCompletion()
                    }
                  }
                })
            }, timeoutLength)
          }

          checkForCompletion()
        })
        .catch(err => {
          dispatch(
            flash(err || 'Issues retrieving portfolio property', 'error')
          )
          reject(err)
        })
    })
  }
}

export const linkToBuildeeBuilding = (accountId, propertyId, buildingId) => {
  let payload = {
    accountId: accountId,
    propertyId: propertyId,
    buildingId: buildingId
  }

  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      const organizationId = getState().organization.organizationView._id

      client
        .post('/organization/' + organizationId + '/portfolio/property/link', {
          data: payload
        })
        .then(response => {
          dispatch(getOrganizationBuildings(organizationId))
          resolve()
        })
        .catch(err => {
          dispatch(
            flash(err || 'Issues retrieving portfolio property', 'error')
          )
          reject(err)
        })
    })
  }
}

export const updateBuildingColumnList = columns => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({
        type: PORTFOLIO_UPDATE_BUILDING_COLUMN_LIST,
        columns
      })
      resolve(columns)
    })
  }
}

export const updateBuildingColumnIndex = columnIndex => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({
        type: PORTFOLIO_UPDATE_BUILDING_COLUMN_INDEX,
        columnIndex
      })
      resolve(columnIndex)
    })
  }
}
export const updateBuildingSort = (sort, flag) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({
        type: PORTFOLIO_UPDATE_BUILDING_SORT,
        sort,
        flag
      })
      resolve(sort)
    })
  }
}

export const getPortfolioBuildingList = (
  orgID,
  organizationIds,
  hardReload = false
) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .post('/portfolio/building', {
          data: { orgID, organizationIds, hardReload }
        })
        .then(response => {
          const organization = getState().organization
          if (Object.entries(organization.organizationView).length == 0) {
            dispatch({
              type: ORGANIZATION_GET_BUILDINGS_SUCCESS,
              buildings: response.buildings,
              organization: response.organization
            })
          }
          dispatch({
            type: UPDATE_PORTFOLIO_BUILDING_LIST,
            updatedBuildings: response.buildings
          })
          resolve({
            buildings: response.buildings
          })
        })
        .catch(err => {
          dispatch(
            flash(err || 'Issues retrieving portfolio buildings', 'error')
          )
          reject(err)
        })
    })
  }
}

export const getPortfolioProjects = orgID => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .post('/portfolio/proposal/projects', {
          data: { orgID }
        })
        .then(response => {
          dispatch({
            type: UPDATE_PORTOLIO_EXISTING_PROJECTS,
            projects: response.projects
          })
          resolve({
            projects: response.projects
          })
        })
        .catch(err => {
          dispatch(flash(err || 'Issues retrieving portfolio measure', 'error'))
          reject(err)
        })
    })
  }
}

export const getPortfolioProjectsRefetch = ids => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .post('/portfolio/proposal/projects/refresh', {
          data: { ids }
        })
        .then(response => {
          resolve({
            projects: response.projects
          })
        })
        .catch(err => {
          dispatch(flash(err || 'Issues retrieving portfolio measure', 'error'))
          reject(err)
        })
    })
  }
}

export const getPortfolioProjectPackages = orgID => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .post('/portfolio/proposal/projectPackages', {
          data: { orgID }
        })
        .then(response => {
          dispatch({
            type: UPDATE_PORTOLIO_EXISTING_PROJECTPACKAGES,
            projectPackages: response.projectPackages
          })
          resolve({
            projectPackages: response.projectPackages
          })
        })
        .catch(err => {
          dispatch(
            flash(err || 'Issues retrieving portfolio projects', 'error')
          )
          reject(err)
        })
    })
  }
}

export const syncScenarioBuilding = buildings => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({
        type: SYNC_SCENARIO_BUILDINGS,
        buildings
      })
      resolve()
    })
  }
}

const responseParser = res => {
  try {
    res.data = ''
    let data = res.text.split('\n')
    data = data.reduce((agg, elem, i) => {
      if (elem === '') return agg
      agg.push(JSON.parse(elem))
      return agg
    }, [])
    return merge.all(data)
  } catch (error) {
    console.log('error', error)
  }
}

const mapProposalProjects = (res = {}) => {
  const proposal = res.dashboard?.proposals || []
  if (proposal.length > 0) {
    const projects = res.dashboard?.projects || []
    const projectPackages = res.dashboard?.projectPackages || []
    res.dashboard.proposals = proposal.map(proposal => {
      if (proposal.mode === 'Measure') {
        const measures = projects.filter(
          project => proposal.modeIds.indexOf(project._id.toString()) > -1
        )
        return {
          ...proposal,
          projects: measures
        }
      } else {
        const projectPackageList = projectPackages.filter(
          project => proposal.modeIds.indexOf(project._id.toString()) > -1
        )
        return {
          ...proposal,
          projectPackages: projectPackageList
        }
      }
    })
  }
}

export const getPortfolioDashboard = (
  orgID,
  organizationIds,
  hardReload = false
) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({
        type: UPDATE_PORTFOLIO_DASHBOARD_LOADING,
        state: true,
        orgID
      })
      const client = new ApiClient(dispatch, getState())
      client
        .post('/portfolio/dashboard', {
          data: { orgID, organizationIds, hardReload },
          responseParser
        })
        .then(response => {
          mapProposalProjects(response)
          const organization = getState().organization
          const currentOrgID =
            (getState().portfolio && getState().portfolio.orgID) || 0
          if (currentOrgID == orgID) {
            if (
              Object.entries(organization.organizationView).length == 0 ||
              organization.organizationView._id != orgID
            ) {
              const selectedOrg = response.organization.find(
                org => org._id === currentOrgID
              )
              dispatch({
                type: ORGANIZATION_GET_BUILDINGS_SUCCESS,
                organization: selectedOrg
              })
            }
            dispatch({
              type: UPDATE_PORTFOLIO_DASHBOARD,
              dashboard: response.dashboard,
              authors: response.authors
            })
            dispatch({
              type: UPDATE_PORTFOLIO_DASHBOARD_LOADING,
              state: false
            })

            dispatch({
              type: UPDATE_PORTFOLIO_RELOAD,
              reload: false
            })

            resolve({
              dashboard: response.dashboard
            })
          } else {
            resolve({
              dashboard: {}
            })
          }
        })
        .catch(err => {
          const currentOrgID =
            (getState().portfolio && getState().portfolio.orgID) || 0
          if (orgID === currentOrgID) {
            dispatch({
              type: UPDATE_PORTFOLIO_DASHBOARD_LOADING,
              state: false
            })
            dispatch(
              flash(err || 'Issues retrieving portfolio projects', 'error')
            )
          }
          reject(err)
        })
    })
  }
}

export const updateProjectColumnList = columns => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({
        type: PORTFOLIO_UPDATE_PROJECT_COLUMN_LIST,
        columns
      })
      resolve(columns)
    })
  }
}

export const updateProjectColumnIndex = columnIndex => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({
        type: PORTFOLIO_UPDATE_PROJECT_COLUMN_INDEX,
        columnIndex
      })
      resolve(columnIndex)
    })
  }
}
export const updateProjectSort = sort => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({
        type: PORTFOLIO_UPDATE_PROJECT_SORT,
        sort
      })
      resolve(sort)
    })
  }
}

export const updateProjectPackageColumnList = columns => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({
        type: PORTFOLIO_UPDATE_PROJECTPACKAGE_COLUMN_LIST,
        columns
      })
      resolve(columns)
    })
  }
}

export const updateProjectPackageColumnIndex = columnIndex => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({
        type: PORTFOLIO_UPDATE_PROJECTPACKAGE_COLUMN_INDEX,
        columnIndex
      })
      resolve(columnIndex)
    })
  }
}
export const updateProjectPackageSort = sort => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({
        type: PORTFOLIO_UPDATE_PROJECTPACKAGE_SORT,
        sort
      })
      resolve(sort)
    })
  }
}

export const updateDashboardFilters = filters => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({
        type: UPDATE_PORTFOLIO_DASHBOARD_FILTERS,
        filters
      })
      resolve(filters)
    })
  }
}

export const updateProposalColumnList = columns => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({
        type: PORTFOLIO_UPDATE_PROPOSAL_COLUMN_LIST,
        columns
      })
      resolve(columns)
    })
  }
}

export const updateProposalColumnIndex = columnIndex => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({
        type: PORTFOLIO_UPDATE_PROPOSAL_COLUMN_INDEX,
        columnIndex
      })
      resolve(columnIndex)
    })
  }
}
export const updateProposalSort = sort => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({
        type: PORTFOLIO_UPDATE_PROPOSAL_SORT,
        sort
      })
      resolve(sort)
    })
  }
}

export const getPortfolioScenarioList = (hardReload = false) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .get('/portfolio/scenarios', {
          params: { hardReload: hardReload }
        })
        .then(response => {
          dispatch({
            type: UPDATE_PORTFOLIO_SCENARIO_LIST,
            updatedList: response.scenarios,
            status: 'FIRST_LOAD'
          })
          resolve({
            scenario: response.scenarios
          })
        })
        .catch(err => {
          // dispatch(
          //   flash(err || 'Issues retrieving portfolio scenarios', 'error')
          // )
          reject(err)
        })
    })
  }
}

const checkScenarioSynced = async (
  timerId,
  scenarioId,
  client,
  dispatch,
  getState
) => {
  try {
    let response = await client.get('/portfolio/scenario/check', {
      params: { scenarioId: scenarioId }
    })
    if (response.check) {
      clearInterval(timerId)
      let scenarioList = getState().portfolio.scenarioList
      scenarioList = scenarioList.map(item => {
        if (item._id === scenarioId)
          return {
            ...item,
            status: ''
          }
        else return { ...item }
      })
      dispatch({
        type: UPDATE_PORTFOLIO_SCENARIO_LIST,
        updatedList: scenarioList,
        status: 'FIRST_LOAD'
      })
    }
  } catch (error) {
    console.log('error', error)
  }
}

export const createScenario = values => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .post('/portfolio/scenarios', {
          data: values
        })
        .then(response => {
          let scenario = response.scenario
          scenario.status = 'Not Synced'
          let scenarioList = getState().portfolio.scenarioList
          scenarioList = [...scenarioList, response.scenario]
          dispatch({
            type: UPDATE_PORTFOLIO_SCENARIO_LIST,
            updatedList: scenarioList,
            status: 'CREATE'
          })
          ;(function() {
            let timerId = setInterval(function() {
              checkScenarioSynced(
                timerId,
                response.scenario._id,
                client,
                dispatch,
                getState
              )
            }, 1000)
          })()
          resolve({
            scenario: response.scenario
          })
        })
        .catch(err => {
          dispatch(flash('Issues creating portfolio scenario', 'error'))
          reject(err)
        })
    })
  }
}

export const updateScenario = values => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .put(`/portfolio/scenario/${values._id}`, {
          data: values
        })
        .then(response => {
          let scenarioList = getState().portfolio.scenarioList
          let ids = scenarioList.map(scenario => scenario._id)
          const index = ids.indexOf(response.scenario._id)
          scenarioList[index] = response.scenario
          dispatch({
            type: UPDATE_PORTFOLIO_SCENARIO_LIST,
            updatedList: scenarioList,
            status: 'UPDATE'
          })
          resolve({
            scenario: response.scenario
          })
        })
        .catch(err => {
          dispatch(flash('Issues updating portfolio scenario', 'error'))
          reject(err)
        })
    })
  }
}

export const removeScenario = values => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .del(`/portfolio/scenario/${values._id}`)
        .then(response => {
          let scenarioList = getState().portfolio.scenarioList
          scenarioList = scenarioList.filter(
            scenario => scenario._id.toString() != values._id.toString()
          )
          dispatch({
            type: UPDATE_PORTFOLIO_SCENARIO_LIST,
            updatedList: scenarioList,
            status: 'REMOVE'
          })
          resolve({
            scenario: values
          })
        })
        .catch(err => {
          dispatch(flash(err || 'Issues removing portfolio scenario', 'error'))
          reject(err)
        })
    })
  }
}

export const addScenarioIncompleteProject = ({
  action,
  payload,
  project,
  type,
  buildingIds
}) => {
  if (action === 'add') {
    payload.createNewProject = true
  }
  return (dispatch, getState) => {
    if (type === 'project' || action === 'edit') {
      return new Promise((resolve, reject) => {
        const client = new ApiClient(dispatch, getState())
        client
          .put('/portfolio/scenario/project/' + project._id, {
            data: {
              body: payload,
              buildingIds
            }
          })
          .then(response => {
            resolve(response.project)
          })
          .catch(err => {
            dispatch(flash(err || 'Issues evaluating project', 'error', 5))
            reject(err)
          })
      })
    } else if (type === 'measure') {
      return new Promise((resolve, reject) => {
        const client = new ApiClient(dispatch, getState())
        client
          .post('/portfolio/scenario/project/measure/' + project._id, {
            data: {
              body: payload,
              buildingIds
            }
          })
          .then(response => {
            dispatch(flash(response.message, 'success', 2))
            resolve(response.project)
          })
          .catch(err => {
            dispatch(
              flash(err || 'Issues adding incomplete project', 'error', 5)
            )
            reject(err)
          })
      })
    }
  }
}

export const addScenarioMesaurePackage = values => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .post('/portfolio/scenario/measurePackage', {
          data: values
        })
        .then(response => {
          resolve({
            measurePackage: response.measurePackage
          })
        })
        .catch(err => {
          dispatch(
            flash('Issues creating measure package for scenario', 'error')
          )
          reject(err)
        })
    })
  }
}

export const updatePortfolioTab = selectedView => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({
        type: UPDATE_PORTFOLIO_TAB,
        selectedView
      })
      resolve(selectedView)
    })
  }
}

export const clearPortfolioStore = () => {
  return (dispatch, getState) => {
    dispatch({ type: PORTFOLIO_CLEAR_STORE })
  }
}

export const getTableauToken = () => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      const target = isProdEnv(process.env.DOMAIN_ENV)
        ? 'buildee'
        : 'buildeebeta'
      client
        .post('/portfolio/tableauToken', {
          data: {
            target: target
          }
        })
        .then(response => {
          dispatch({
            type: UPDATE_PORTFOLIO_TABLEAU_TOKEN,
            token: response.token
          })
          resolve(response)
        })
        .catch(err => {
          console.log('error', err)
          reject(err)
        })
    })
  }
}

export const updatePortfolioReload = reload => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({
        type: UPDATE_PORTFOLIO_RELOAD,
        reload
      })
      resolve(reload)
    })
  }
}

export const convertScenarioToProject = scenarioID => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .post(`/portfolio/scenario/convert/${scenarioID}`)
        .then(response => {
          let scenarioList = getState().portfolio.scenarioList
          scenarioList = scenarioList.filter(
            scenario => scenario._id !== scenarioID
          )
          dispatch(flash(response.message, 'success', 2))
          dispatch({
            type: UPDATE_PORTFOLIO_SCENARIO_LIST,
            updatedList: scenarioList,
            status: 'LOAD'
          })
          resolve()
        })
        .catch(err => {
          dispatch(
            flash(
              err || 'Issues converting scenario to measures and project',
              'error'
            )
          )
          reject(err)
        })
    })
  }
}

export const importBuildingSync = (xml, data) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({
        type: PORTFOLIO_BUILDING_IMPORT_SYNC
      })
      const client = new ApiClient(dispatch, getState())
      let organizationId = getState().organization.organizationView._id
      let manageAllOrgSelected =
        getState().organization.manageAllOrgSelected || false
      if (
        manageAllOrgSelected &&
        data.organizationId &&
        organizationId !== data.organizationId
      ) {
        organizationId = data.organizationId
      }
      const userId = getState().login.user._id
      let env =
        process.env.DOMAIN_ENV === 'app.buildee.com'
          ? 'prod'
          : process.env.DOMAIN_ENV === 'beta.buildee.com'
          ? 'beta'
          : 'qa'
      if (!organizationId || !userId) reject()
      client
        .post('/portfolio/buildingImportSync', {
          params: {
            organizationId: organizationId,
            userId: userId,
            env: env
          },
          data: {
            xml: xml,
            option: data
          }
        })
        .then(response => {
          if (response.buildingId) {
            dispatch({
              type: PORTFOLIO_BUILDING_IMPORT_SYNC_SUCCESS
            })
            dispatch(push('/building/' + response.buildingId))
          }
          resolve({
            errors: response.errors,
            warnings: response.warnings
          })
        })
        .catch(err => {
          dispatch({
            type: PORTFOLIO_BUILDING_IMPORT_SYNC_FAIL
          })
          dispatch(flash(err || 'Issues importing buildingSync', 'error'))
          reject(err)
        })
    })
  }
}

export const createPortfolioProposal = values => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      let filters = getState().portfolio.dashboardFilters || []
      const organizationView = getState().organization.organizationView
      const organizationList = getState().organization.organizationList
      let key = getOrganzationMemkey(
        filters,
        organizationView,
        organizationList
      )
      const client = new ApiClient(dispatch, getState())
      client
        .post(`/portfolio/proposal`, {
          data: { ...values, memCacheKey: key }
        })
        .then(response => {
          if (!response.proposal) reject('Issues creating Proposal')
          else {
            dispatch({
              type: CREATE_PORTFOLIO_PROPOSAL,
              proposal: response.proposal
            })
            resolve({
              proposal: response.proposal
            })
          }
        })
        .catch(err => {
          dispatch(flash(err || 'Issues creating Proposal', 'error'))
          reject(err)
        })
    })
  }
}

export const updatePortfolioProposal = (proposalId, values) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      let filters = getState().portfolio.dashboardFilters || []
      const organizationView = getState().organization.organizationView
      const organizationList = getState().organization.organizationList
      let key = getOrganzationMemkey(
        filters,
        organizationView,
        organizationList
      )
      const client = new ApiClient(dispatch, getState())
      client
        .put(`/portfolio/proposal/${proposalId}`, {
          data: { ...values, memCacheKey: key }
        })
        .then(response => {
          if (!response.proposal) reject('Issues updating Proposal')
          else {
            dispatch({
              type: UPDATE_PORTFOLIO_PROPOSAL,
              proposal: response.proposal
            })
            resolve({
              proposal: response.proposal
            })
          }
        })
        .catch(err => {
          dispatch(flash(err || 'Issues updating Proposal', 'error'))
          reject(err)
        })
    })
  }
}

export const deletePortfolioProposal = proposalId => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      let filters = getState().portfolio.dashboardFilters || []
      const organizationView = getState().organization.organizationView
      const organizationList = getState().organization.organizationList
      let key = getOrganzationMemkey(
        filters,
        organizationView,
        organizationList
      )
      const client = new ApiClient(dispatch, getState())
      client
        .del(`/portfolio/proposal/${proposalId}`, {
          data: { memCacheKey: key }
        })
        .then(() => {
          dispatch({
            type: DELETE_PORTFOLIO_PROPOSAL,
            proposalId
          })
          resolve()
        })
        .catch(err => {
          dispatch(flash(err || 'Issues removing Proposal', 'error'))
          reject(err)
        })
    })
  }
}

export const updateTeamColumnList = (view = 'Measure', columns) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({
        type: PORTFOLIO_UPDATE_TEAM_COLUMN_LIST,
        view,
        columns
      })
      resolve(columns)
    })
  }
}

export const updateTeamColumnIndex = (view = 'Measure', columnIndex) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({
        type: PORTFOLIO_UPDATE_TEAM_COLUMN_INDEX,
        view,
        columnIndex
      })
      resolve(columnIndex)
    })
  }
}
export const updateTeamSort = sort => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({
        type: PORTFOLIO_UPDATE_TEAM_SORT,
        sort
      })
      resolve(sort)
    })
  }
}

export const actions = {
  portfolioAddAccount,
  portfolioPropertySync,
  portfolioMeterSync,
  getPortfolioPropertyList,
  getPortfolioMeterList,
  getPortfolioMeter,
  getConnectedAccounts,
  deletePortfolioConnection,
  linkToBuildeeBuilding,

  pmImport,
  pmImportUpdate,

  pmExport,
  pmExportUpdate,

  //Building
  updateBuildingColumnList,
  updateBuildingSort,
  updateBuildingColumnIndex,
  // showBuildingSearchError,

  //Project
  updateProjectColumnList,
  updateProjectSort,
  updateProjectColumnIndex,
  // showProjectSearchError,

  //ProjectPackage
  updateProjectPackageColumnList,
  updateProjectPackageSort,
  updateProjectPackageColumnIndex,
  // showProjectPackageSearchError,

  //Dashboard
  getPortfolioDashboard,
  updateDashboardFilters,

  getPortfolioScenarioList,
  createScenario,
  updateScenario,
  removeScenario,

  addScenarioIncompleteProject,
  addScenarioMesaurePackage,
  updatePortfolioTab,
  getTableauToken,

  //scenario convert
  convertScenarioToProject,

  // Proposal
  createPortfolioProposal
}

// ------------------------------------
// Action Helpers
// ------------------------------------

const handleGetPropertyList = (state, action) => {
  return Object.assign({}, state, {
    properties: action.propertyList
  })
}

const handleGetConnectedAccountList = (state, action) => {
  return Object.assign({}, state, {
    connectedAccounts: action.connectedAccounts
  })
}

const handleUpdatePortfolioBuildingList = (state, action) => {
  return Object.assign({}, state, {
    scenarioBuilding: action.updatedBuildings
  })
}

const handleUpdateBuildingSort = (state, action) => {
  if (!action.flag) {
    return Object.assign({}, state, {
      buildingSort: action.sort
    })
  } else {
    return Object.assign({}, state, {
      scenarioBuildingSort: action.sort
    })
  }
}

const handleUpdateBuildingColumnList = (state, action) => {
  return Object.assign({}, state, {
    buildingColumnList: action.columns
  })
}

const handleUpdateBuildingColumnIndex = (state, action) => {
  return Object.assign({}, state, {
    buildingColumnIndex: action.columnIndex
  })
}

const handleUpdateProjectSort = (state, action) => {
  return Object.assign({}, state, {
    projectSort: action.sort
  })
}

const handleUpdateProjectColumnList = (state, action) => {
  return Object.assign({}, state, {
    projectColumnList: action.columns
  })
}

const handleUpdateProjectColumnIndex = (state, action) => {
  return Object.assign({}, state, {
    projectColumnIndex: action.columnIndex
  })
}

const handleUpdateProjectPackageSort = (state, action) => {
  return Object.assign({}, state, {
    projectPackageSort: action.sort
  })
}

const handleUpdateProjectPackageColumnList = (state, action) => {
  return Object.assign({}, state, {
    projectPackageColumnList: action.columns
  })
}

const handleUpdateProjectPackageColumnIndex = (state, action) => {
  return Object.assign({}, state, {
    projectPackageColumnIndex: action.columnIndex
  })
}

const handleUpdateProposalSort = (state, action) => {
  return Object.assign({}, state, {
    proposalSort: action.sort
  })
}

const handleUpdateProposalColumnList = (state, action) => {
  return Object.assign({}, state, {
    proposalColumnList: action.columns
  })
}

const handleUpdateProposalColumnIndex = (state, action) => {
  return Object.assign({}, state, {
    proposalColumnIndex: action.columnIndex
  })
}

const handleUpdateTeamSort = (state, action) => {
  return Object.assign({}, state, {
    teamSort: action.sort
  })
}

const handleUpdateTeamColumnList = (state, action) => {
  return Object.assign({}, state, {
    [`team${action.view}ColumnList`]: action.columns
  })
}

const handleUpdateTeamColumnIndex = (state, action) => {
  return Object.assign({}, state, {
    [`team${action.view}ColumnIndex`]: action.columnIndex
  })
}

const handleUpdatePortfolioDashboard = (state, action) => {
  return Object.assign({}, state, {
    dashboard: {
      ...action.dashboard,
      existingProjects: action.dashboard.projects || [],
      existingProjectPackages: action.dashboard.projectPackages || [],
      key: action.dashboard.key || ''
    },
    authors: action.authors
  })
}

const handleUpdateDashboardFilters = (state, action) => {
  return Object.assign({}, state, {
    dashboardFilters: action.filters
  })
}
const handleUpdatePortfolioScenarioList = (state, action) => {
  return Object.assign({}, state, {
    scenarioList: action.updatedList,
    scenarioStatus: action.status
  })
}

const handleUpdatePortfolioDashboardLoading = (state, action) => {
  return Object.assign({}, state, {
    loading: action.state,
    orgID: action.state ? action.orgID : 0
  })
}

const handleUpdatePortfolioTab = (state, action) => {
  return Object.assign({}, state, {
    selectedView: action.selectedView
  })
}

const handleClearStore = (state, action) => {
  return Object.assign({}, state, initialState)
}

const handleUpdatePortfolioTableauToken = (state, action) => {
  return Object.assign({}, state, {
    tableauToken: action.token
  })
}

const handleUpdatePortfolioTableauState = (state, action) => {
  return Object.assign({}, state, {
    tableauEmptyState: action.state,
    tableauEmptyStateLoading: false
  })
}

const handleUpdatePortfolioReload = (state, action) => {
  return Object.assign({}, state, {
    reload: action.reload
  })
}

const handleSyncScenarioBuildings = (state, action) => {
  return Object.assign({}, state, {
    scenarioBuilding: action.buildings
  })
}

const handleUpdateExistingProjects = (state, action) => {
  return Object.assign({}, state, {
    dashboard: {
      ...state.dashboard,
      existingProjects: action.projects || []
    }
  })
}

const handleUpdateExistingProjectPackages = (state, action) => {
  return Object.assign({}, state, {
    dashboard: {
      ...state.dashboard,
      existingProjectPackages: action.projectPackages || []
    }
  })
}

const handleCreatePortfolioProposal = (state, action) => {
  return Object.assign({}, state, {
    dashboard: {
      ...state.dashboard,
      proposals: [...state.dashboard.proposals, action.proposal]
    }
  })
}

const handleUpdatePortfolioProposal = (state, action) => {
  let newProposals = [...state.dashboard.proposals]
  let findIndex = newProposals.findIndex(
    proposal => proposal._id.toString() === action.proposal._id.toString()
  )
  if (newProposals[findIndex]) {
    newProposals[findIndex] = action.proposal
  }
  return Object.assign({}, state, {
    dashboard: {
      ...state.dashboard,
      proposals: newProposals
    }
  })
}

const handleDeletePortfolioProposal = (state, action) => {
  let newProposals = [...state.dashboard.proposals] || []
  newProposals = newProposals.filter(
    proposal => proposal._id !== action.proposalId
  )
  return Object.assign({}, state, {
    dashboard: {
      ...state.dashboard,
      proposals: newProposals
    }
  })
}

export const createBuildingGroup = buildingGroup => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .post('/user/createBuildingGroup', {
          data: buildingGroup
        })
        .then(response => {
          dispatch({
            type: CREATE_BUILDING_GROUP,
            buildingGroup: response.buildingGroup
          })
          dispatch(flash(response.message, 'success', 2))
          resolve(response.buildingGroup)
        })
        .catch(err => {
          dispatch(flash(err || 'Issues creating building group', 'error'))
          reject(err)
        })
    })
  }
}

export const fetchBuildingGroups = () => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .get('/user/buildingGroups')
        .then(response => {
          dispatch({
            type: FETCH_BUILDING_GROUP_SUCCESS,
            buildingGroups: response.buildingGroups
          })
          resolve()
        })
        .catch(err => {
          dispatch(flash(err || 'Issues fetching building group', 'error'))
          reject(err)
        })
    })
  }
}

export const updateBuildingGroup = (groupId, buildingGroup) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .post(`/user/buildingGroup/${groupId}`, {
          data: buildingGroup
        })
        .then(response => {
          dispatch({
            type: UPDATE_BUILDING_GROUP_SUCCESS,
            buildingGroup: response.buildingGroup
          })
          resolve(response.buildingGroup)
        })
        .catch(err => {
          dispatch(flash(err || 'Issues deleting building group', 'error'))
          reject(err)
        })
    })
  }
}

export const deleteBuildingGroup = groupId => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .del(`/user/buildingGroup/${groupId}`)
        .then(response => {
          dispatch({ type: DELETE_BUILDING_GROUP_SUCCESS, groupId })
          resolve()
        })
        .catch(err => {
          dispatch(flash(err || 'Issues deleting building group', 'error'))
          reject(err)
        })
    })
  }
}

export const getProposalMeasure = id => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .get(`/portfolio/proposal/project/${id}`)
        .then(response => {
          dispatch({
            type: GET_PORTFOLIO_PROPOSAL_MEASURE,
            project: response.project
          })
          resolve()
        })
        .catch(err => {
          dispatch(flash(err || 'Issuess getting proposal measure', 'error'))
          reject(err)
        })
    })
  }
}

export const setBuildingGroup = groupId => {
  return dispatch => {
    dispatch({
      type: SET_BUILDING_GROUP,
      groupId
    })
  }
}

export const toggleBuildingGroup = editBuildingGroup => {
  return dispatch => {
    dispatch({
      type: TOGGLE_EDIT_BUILDING_GROUP,
      editBuildingGroup
    })
  }
}

const handleCreateBuildingGroup = (state, action) => {
  const buildingGroups = [...state.buildingGroups] || []
  buildingGroups.push(action.buildingGroup)
  return Object.assign({}, state, {
    buildingGroups,
    selectedBuildingGroupId: action.buildingGroup._id,
    editBuildingGroup: false
  })
}

const handleFetchBuildingGroup = (state, action) => {
  return Object.assign({}, state, {
    buildingGroups: action.buildingGroups
  })
}

const handleUpdateBuildingGroup = (state, action) => {
  const buildingGroups = [...state.buildingGroups] || []
  const existingGroupId = buildingGroups.findIndex(
    group => group._id === action.buildingGroup._id
  )
  buildingGroups[existingGroupId] = action.buildingGroup
  return Object.assign({}, state, {
    buildingGroups,
    editBuildingGroup: false
  })
}

const handleDeleteBuildingGroup = (state, action) => {
  let updatedBuildingGroups = [...state.buildingGroups]
  updatedBuildingGroups = updatedBuildingGroups.filter(
    group => group._id != action.groupId
  )
  return Object.assign({}, state, {
    buildingGroups: updatedBuildingGroups,
    selectedBuildingGroupId:
      state.selectedBuildingGroupId === action.groupId
        ? null
        : state.selectedBuildingGroupId
  })
}

const handelSetBuildingGroup = (state, action) => {
  return Object.assign({}, state, {
    selectedBuildingGroupId: action.groupId
  })
}

const handelToggleBuildingGroup = (state, action) => {
  return Object.assign({}, state, {
    editBuildingGroup: action.editBuildingGroup
  })
}

const handleGetPortfolioProposalMeasure = (state, action) => {
  return Object.assign({}, state, {
    currentProject: action.project
  })
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [PORTFOLIO_ACCOUNT_SYNC]: (state, action) => {
    return { ...state }
  },
  [PORTFOLIO_ACCOUNT_SYNC_FAIL]: (state, action) => {
    return { ...state }
  },
  [PORTFOLIO_ACCOUNT_SYNC_SUCCESS]: handleGetConnectedAccountList,

  [PORTFOLIO_PROPERTY_SYNC]: (state, action) => {
    return { ...state }
  },
  [PORTFOLIO_PROPERTY_SYNC_FAIL]: (state, action) => {
    return { ...state }
  },
  [PORTFOLIO_PROPERTY_SYNC_SUCCESS]: (state, action) => {
    return { ...state }
  },

  [PORTFOLIO_METER_SYNC]: (state, action) => {
    return { ...state }
  },
  [PORTFOLIO_METER_SYNC_FAIL]: (state, action) => {
    return { ...state }
  },
  [PORTFOLIO_METER_SYNC_SUCCESS]: (state, action) => {
    return { ...state }
  },

  [PORTFOLIO_GET_PROPERTY_LIST]: (state, action) => {
    return { ...state }
  },
  [PORTFOLIO_GET_PROPERTY_LIST_FAIL]: (state, action) => {
    return { ...state }
  },
  [PORTFOLIO_GET_PROPERTY_LIST_SUCCESS]: handleGetPropertyList,

  [PORTFOLIO_ADD_ACCOUNT]: (state, action) => {
    return { ...state }
  },
  [PORTFOLIO_ADD_ACCOUNT_FAIL]: (state, action) => {
    return { ...state }
  },
  [PORTFOLIO_ADD_ACCOUNT_SUCCESS]: handleGetPropertyList,

  [UPDATE_PORTFOLIO_BUILDING_LIST]: handleUpdatePortfolioBuildingList,
  [PORTFOLIO_UPDATE_BUILDING_SORT]: handleUpdateBuildingSort,
  [PORTFOLIO_UPDATE_BUILDING_COLUMN_LIST]: handleUpdateBuildingColumnList,
  [PORTFOLIO_UPDATE_BUILDING_COLUMN_INDEX]: handleUpdateBuildingColumnIndex,

  [PORTFOLIO_UPDATE_PROJECT_SORT]: handleUpdateProjectSort,
  [PORTFOLIO_UPDATE_PROJECT_COLUMN_LIST]: handleUpdateProjectColumnList,
  [PORTFOLIO_UPDATE_PROJECT_COLUMN_INDEX]: handleUpdateProjectColumnIndex,

  [PORTFOLIO_UPDATE_PROJECTPACKAGE_SORT]: handleUpdateProjectPackageSort,
  [PORTFOLIO_UPDATE_PROJECTPACKAGE_COLUMN_LIST]: handleUpdateProjectPackageColumnList,
  [PORTFOLIO_UPDATE_PROJECTPACKAGE_COLUMN_INDEX]: handleUpdateProjectPackageColumnIndex,

  [PORTFOLIO_UPDATE_PROPOSAL_SORT]: handleUpdateProposalSort,
  [PORTFOLIO_UPDATE_PROPOSAL_COLUMN_LIST]: handleUpdateProposalColumnList,
  [PORTFOLIO_UPDATE_PROPOSAL_COLUMN_INDEX]: handleUpdateProposalColumnIndex,

  [PORTFOLIO_UPDATE_TEAM_SORT]: handleUpdateTeamSort,
  [PORTFOLIO_UPDATE_TEAM_COLUMN_LIST]: handleUpdateTeamColumnList,
  [PORTFOLIO_UPDATE_TEAM_COLUMN_INDEX]: handleUpdateTeamColumnIndex,

  [UPDATE_PORTFOLIO_DASHBOARD]: handleUpdatePortfolioDashboard,
  [UPDATE_PORTFOLIO_DASHBOARD_FILTERS]: handleUpdateDashboardFilters,
  [UPDATE_PORTFOLIO_SCENARIO_LIST]: handleUpdatePortfolioScenarioList,
  [UPDATE_PORTFOLIO_DASHBOARD_LOADING]: handleUpdatePortfolioDashboardLoading,
  [UPDATE_PORTFOLIO_TAB]: handleUpdatePortfolioTab,
  [PORTFOLIO_CLEAR_STORE]: handleClearStore,
  [UPDATE_PORTFOLIO_TABLEAU_TOKEN]: handleUpdatePortfolioTableauToken,
  [UPDATE_PORTFOLIO_TABLEAU_STATE]: handleUpdatePortfolioTableauState,
  [UPDATE_PORTFOLIO_TABLEAU_STATE_REQUEST]: (state, action) => {
    return { ...state, tableauEmptyStateLoading: true }
  },
  [UPDATE_PORTFOLIO_RELOAD]: handleUpdatePortfolioReload,
  [SYNC_SCENARIO_BUILDINGS]: handleSyncScenarioBuildings,
  [UPDATE_PORTOLIO_EXISTING_PROJECTS]: handleUpdateExistingProjects,
  [UPDATE_PORTOLIO_EXISTING_PROJECTPACKAGES]: handleUpdateExistingProjectPackages,
  [CREATE_PORTFOLIO_PROPOSAL]: handleCreatePortfolioProposal,
  [UPDATE_PORTFOLIO_PROPOSAL]: handleUpdatePortfolioProposal,
  [DELETE_PORTFOLIO_PROPOSAL]: handleDeletePortfolioProposal,
  [PORTFOLIO_BUILDING_IMPORT_SYNC]: (state, action) => {
    return { ...state }
  },
  [PORTFOLIO_BUILDING_IMPORT_SYNC_FAIL]: (state, action) => {
    return { ...state }
  },
  [PORTFOLIO_BUILDING_IMPORT_SYNC_SUCCESS]: (state, action) => {
    return { ...state }
  },
  [CREATE_BUILDING_GROUP]: handleCreateBuildingGroup,
  [FETCH_BUILDING_GROUP_SUCCESS]: handleFetchBuildingGroup,
  [UPDATE_BUILDING_GROUP_SUCCESS]: handleUpdateBuildingGroup,
  [DELETE_BUILDING_GROUP_SUCCESS]: handleDeleteBuildingGroup,
  [SET_BUILDING_GROUP]: handelSetBuildingGroup,
  [TOGGLE_EDIT_BUILDING_GROUP]: handelToggleBuildingGroup,
  [GET_PORTFOLIO_PROPOSAL_MEASURE]: handleGetPortfolioProposalMeasure
}

// ------------------------------------
// Reducer
// ------------------------------------

const initialState = {
  properties: [],
  connectedAccounts: [],
  buildingSort: {
    key: 'updated',
    direction: 'DESC'
  },
  buildingColumnList: [
    {
      name: 'Default',
      column: defaultBuildingColumn
    }
  ],
  buildingColumnIndex: 0,
  buildingGroups: [],
  projectSort: {
    key: 'organization.name',
    direction: 'DESC'
  },
  projectColumnList: [
    {
      name: 'Default',
      column: defaultProjectColumn
    }
  ],
  projectColumnIndex: 0,
  projectPackageSort: {
    key: 'organization.name',
    direction: 'DESC'
  },
  projectPackageColumnList: [
    {
      name: 'Default',
      column: defaultProjectPackageColumn
    }
  ],
  projectPackageColumnIndex: 0,
  proposalColumnIndex: 0,
  proposalSort: {
    key: 'updated',
    direction: 'DESC'
  },
  proposalColumnList: [
    {
      name: 'Default',
      column: defaultProposalColumn
    }
  ],
  teamSort: {
    key: 'updated',
    direction: 'DESC'
  },
  teamMeasureColumnList: [
    {
      name: 'Default',
      column: getTeamColumnOptions('Measure').defaultTeamColumn
    }
  ],
  teamMeasureColumnIndex: 0,
  teamProjectColumnList: [
    {
      name: 'Default',
      column: getTeamColumnOptions('Project').defaultTeamColumn
    }
  ],
  teamProjectColumnIndex: 0,
  teamProposalColumnList: [
    {
      name: 'Default',
      column: getTeamColumnOptions('Proposal').defaultTeamColumn
    }
  ],
  teamProposalColumnIndex: 0,
  dashboardFilters: [],
  dashboard: {
    buildings: [],
    projects: [],
    projectPackages: [],
    proposals: [],
    teams: [],
    existingProjects: [],
    existingProjectPackages: []
  },
  authors: [],
  scenarioBuilding: [],
  scenarioBuildingSort: {
    key: 'updated',
    direction: 'DESC'
  },
  scenarioList: [],
  scenarioColumnList: [
    {
      name: 'Default',
      column: defaultScenarioColumn
    }
  ],
  scenarioStatus: '',
  scenarioColumnIndex: 0,
  loading: false,
  selectedView: { name: 'Dashboard' },
  selectedBuildingGroupId: null,
  editBuildingGroup: false,
  tableauToken: '',
  orgID: 0,
  reload: true,
  currentProject: null
}
export default function portfolioReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
