import { push } from 'react-router-redux'

import ApiClient from '../../../utils/ApiClient'
import { showFlash as flash } from '../../../utils/Flash/modules/flash'
import { uploadImage } from '../../Template/modules/template'
import {
  updateBuildingList,
  updateXMLBuildingList
} from '../../Building/modules/building'
import { updateTemplateList } from '../../Template/modules/template'
import { updateTemplateSpreadsheetList } from '../../Spreadsheet/modules/spreadsheet'

// ------------------------------------
// Constants
// ------------------------------------

export const CREATE_ORGANIZATION_SUCCESS =
  'DASHBOARD/CREATE_ORGANIZATION_SUCCESS'

export const ORGANIZATIONS_GET_SUCCESS =
  'ORGANIZATION/ORGANIZATIONS_GET_SUCCESS'
export const ORGANIZATION_GET_SUCCESS = 'ORGANIZATION/ORGANIZATION_GET_SUCCESS'

export const ORGANIZATION_GET_BUILDINGS_SUCCESS =
  'ORGANIZATION/ORGANIZATION_GET_BUILDINGS_SUCCESS'

export const ORGANIZATION_GET_TEMPLATES_SUCCESS =
  'ORGANIZATION/ORGANIZATION_GET_TEMPLATES_SUCCESS'

export const ORGANIZATION_GET_SPREADSHEET_TEMPLATES_SUCCESS =
  'ORGANIZATION/ORGANIZATION_GET_SPREADSHEETS_TEMPLATES_SUCCESS'

export const ORGANIZATION_CLEAR_STORE = 'ORGANIZATION/ORGANIZATION_CLEAR_STORE'

export const ORGANIZATION_TOGGLE_TARGETS =
  'ORGANIZATION/ORGANIZATION_TOGGLE_TARGETS'

export const ORGANIZATION_TOGGLE_MANAGE_ALL_ORGS =
  'ORGANIZATION/ORGANIZATION_TOGGLE_MANAGE_ALL_ORGS'

export const ORGANIZATION_GET_ALL_CATEGORIZATION_SUCCESS =
  'ORGANIZATION_GET_ALL_CATEGORIZATION_SUCCESS'

// ------------------------------------
// Actions
// ------------------------------------

export const clearOrganizationStore = () => {
  return (dispatch, getState) => {
    dispatch({ type: ORGANIZATION_CLEAR_STORE })
  }
}

export const toggleTargets = () => {
  return (dispatch, getState) => {
    dispatch({ type: ORGANIZATION_TOGGLE_TARGETS })
  }
}

export const toggleManageAllOrgs = isSelected => {
  return (dispatch, getState) => {
    dispatch({ type: ORGANIZATION_TOGGLE_MANAGE_ALL_ORGS, isSelected })
  }
}

export const createOrganization = (payload, disableRedirect = false) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .post('/organization', { data: payload })
        .then(response => {
          dispatch({
            type: CREATE_ORGANIZATION_SUCCESS,
            organization: response.organization
          })
          dispatch({
            type: ORGANIZATION_GET_SUCCESS,
            organization: response.organization
          })
          dispatch(flash(response.message, 'success', 2))
          if (!disableRedirect) {
            dispatch(
              push('/organization/' + response.organization._id + '/manage/')
            )
            dispatch({
              type: ORGANIZATION_TOGGLE_MANAGE_ALL_ORGS,
              isSelected: false
            })
          }
          resolve()
        })
        .catch(err => {
          dispatch(flash(err || 'Issues retrieving organizations', 'error'))
          reject(err)
        })
    })
  }
}

export const getOrganizations = (
  organizationId = 'all',
  disableDispatch = false
) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      const userId = getState().login.user._id
      let url = !disableDispatch
        ? '/user/' + userId + '/organizations'
        : '/user/' +
          userId +
          `/organizations?organizationId=${organizationId}&disable=${disableDispatch}`
      client
        .get(url)
        .then(response => {
          if (!disableDispatch) {
            dispatch({
              type: ORGANIZATIONS_GET_SUCCESS,
              organizations: response.organizations
            })
          }
          resolve(response.organizations)
        })
        .catch(err => {
          if (getState().loggingIn) {
            dispatch(flash(err || 'Issues retrieving organizations', 'error'))
            reject(err)
          }
        })
    })
  }
}

export const getOrganization = id => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .get('/organization/' + id)
        .then(response => {
          dispatch({
            type: ORGANIZATION_GET_SUCCESS,
            organization: response.organization
          })
          resolve()
        })
        .catch(err => {
          dispatch(flash(err || 'Issues retrieving organizations', 'error'))
          reject(err)
        })
    })
  }
}

export const updateOrganization = (id, payload) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .put('/organization/' + id, { data: payload })
        .then(response => {
          dispatch({
            type: ORGANIZATION_GET_SUCCESS,
            organization: response.organization
          })
          dispatch(flash('Updated Organization Settings', 'success'))
          resolve()
        })
        .catch(err => {
          dispatch(flash(err || 'Issues retrieving organizations', 'error'))
          reject(err)
        })
    })
  }
}

export const archiveOrganization = id => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .post('/organization/' + id + '/archive')
        .then(response => {
          dispatch(flash('Organization removed successfully', 'success'))
          resolve()
        })
        .catch(err => {
          dispatch(flash(err || 'Issues removing organizations', 'error'))
          reject(err)
        })
    })
  }
}

//gets buildinglist on /building page
export const getOrganizationBuildings = (id, unarchived) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .get('/organization/' + id + '/building')
        .then(response => {
          if (unarchived) {
            let unarchivedBuildings = []
            response.buildings.forEach(building => {
              if (!building.archived) {
                unarchivedBuildings.push(building)
              }
            })
            resolve(unarchivedBuildings)
          } else {
            dispatch({
              type: ORGANIZATION_GET_BUILDINGS_SUCCESS,
              buildings: response.buildings,
              organization: response.organization
            })
            dispatch(updateBuildingList(response.buildings))
            resolve(response.buildings)
          }
        })
        .catch(err => {
          dispatch(
            flash(err || 'Issues retrieving organization buildings', 'error')
          )
          reject(err)
        })
    })
  }
}

//gets buildinglist on /building page
export const getOrganizationXMLBuildings = (id, unarchived) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .get('/organization/' + id + '/building')
        .then(response => {
          if (unarchived) {
            let unarchivedBuildings = []
            response.buildings.forEach(building => {
              if (!building.archived) {
                unarchivedBuildings.push(building)
              }
            })
            resolve(unarchivedBuildings)
          } else {
            dispatch(updateXMLBuildingList(response.buildings))
            resolve(response.buildings)
          }
        })
        .catch(err => {
          dispatch(
            flash(err || 'Issues retrieving organization buildings', 'error')
          )
          reject(err)
        })
    })
  }
}

export const uploadOrganizationImage = image => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch(uploadImage(image)).then(response => {
        resolve(response)
      })
    })
  }
}

export const getOrganizationTemplates = () => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      const orgId = getState().organization.organizationView._id
      const manageAllOrgSelected = getState().organization.manageAllOrgSelected
      client
        .get(
          manageAllOrgSelected
            ? '/organization/template/all'
            : '/organization/' + orgId + '/template'
        )
        .then(response => {
          dispatch({
            type: ORGANIZATION_GET_TEMPLATES_SUCCESS,
            templates: response.templates,
            organization: response.organization
          })
          dispatch(updateTemplateList(response.templates))
          resolve(response.templates)
        })
        .catch(err => {
          dispatch(
            flash(err || 'Issues retrieving organization templates', 'error')
          )
          reject(err)
        })
    })
  }
}

export const getAllOrganizationTemplates = () => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .get('/organization/template/all')
        .then(response => {
          dispatch(updateTemplateList(response.templates))
          resolve(response.templates)
        })
        .catch(err => {
          dispatch(
            flash(
              err || 'Issues retrieving all organization templates',
              'error'
            )
          )
          reject(err)
        })
    })
  }
}

export const getOrganizationSpreadsheetTemplates = () => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      const orgId = getState().organization.organizationView._id
      const manageAllOrgSelected = getState().organization.manageAllOrgSelected
      client
        .get(
          manageAllOrgSelected
            ? '/spreadsheet/template/all'
            : '/spreadsheet/template',
          !manageAllOrgSelected && {
            params: { organizationId: orgId }
          }
        )
        .then(response => {
          dispatch({
            type: ORGANIZATION_GET_SPREADSHEET_TEMPLATES_SUCCESS,
            templateList: response.spreadsheetTemplate
          })
          dispatch(updateTemplateSpreadsheetList(response.spreadsheetTemplate))
          resolve(response.spreadsheetTemplate)
        })
        .catch(err => {
          dispatch(
            flash(err || 'Issues retrieving organization templates', 'error')
          )
          reject(err)
        })
    })
  }
}

export const getSpecficOrganizationUsers = orgId => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .get('/organization/' + orgId + '/user')
        .then(response => {
          resolve(response.users)
        })
        .catch(err => {
          dispatch(
            flash(err || 'Issues retrieving organization users', 'error')
          )
          reject(err)
        })
    })
  }
}

export const getAllUsers = () => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .get('/users')
        .then(response => {
          resolve(response.users)
        })
        .catch(err => {
          dispatch(flash(err || 'Issues retrieving available users', 'error'))
          reject(err)
        })
    })
  }
}

export const getOrganizationUsers = () => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      const orgId = getState().organization.organizationView._id
      const manageAllOrgSelected = getState().organization.manageAllOrgSelected
      client
        .get(
          manageAllOrgSelected
            ? '/organization/user/all'
            : '/organization/' + orgId + '/user'
        )
        .then(response => {
          resolve(response.users)
        })
        .catch(err => {
          dispatch(
            flash(err || 'Issues retrieving organization users', 'error')
          )
          reject(err)
        })
    })
  }
}

export const addOrganizationUser = (payload, orgId) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .post('/organization/' + orgId + '/user', { data: payload })
        .then(response => {
          dispatch(flash(response.message, 'success', 2))
          resolve()
        })
        .catch(err => {
          dispatch(flash(err || 'Issues removing organization user', 'error'))
          reject(err)
        })
    })
  }
}

export const addOrganizationExistingUser = (payload, orgId) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .post('/organization/' + orgId + '/existingUser', { data: payload })
        .then(response => {
          dispatch(flash(response.message, 'success', 2))
          resolve()
        })
        .catch(err => {
          dispatch(flash(err || 'Issues adding organization user', 'error'))
          reject(err)
        })
    })
  }
}

export const removeOrganizationUser = (orgId, removeUser) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const payload = { userToBeRemoved: removeUser }
      const currentUserId = getState().login.user._id

      const client = new ApiClient(dispatch, getState())
      client
        .del('/organization/' + orgId + '/user/' + currentUserId, {
          data: payload
        })
        .then(response => {
          dispatch({
            type: ORGANIZATION_GET_SUCCESS,
            organization: response.organization
          })
          dispatch(flash(response.message, 'success', 2))
          resolve()
        })
        .catch(err => {
          dispatch(
            flash(err || 'Issues removing user from organization', 'error')
          )
          reject(err)
        })
    })
  }
}

export const updateOrganizationUser = (userId, newRole) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const payload = { userToBeUpdated: userId, newRole: newRole }
      const orgId = getState().organization.organizationView._id
      const currentUserId = getState().login.user._id

      const client = new ApiClient(dispatch, getState())
      client
        .put('/organization/' + orgId + '/user/' + currentUserId, {
          data: payload
        })
        .then(response => {
          dispatch({
            type: ORGANIZATION_GET_SUCCESS,
            organization: response.organization
          })
          dispatch(flash(response.message, 'success', 2))
          resolve()
        })
        .catch(err => {
          dispatch(flash(err || 'Issues removing organization user', 'error'))
          reject(err)
        })
    })
  }
}

export const updateSpecificOrganizationUser = (orgId, userId, newRole) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const payload = { userToBeUpdated: userId, newRole: newRole }
      const currentUserId = getState().login.user._id

      const client = new ApiClient(dispatch, getState())
      client
        .put('/organization/' + orgId + '/user/' + currentUserId, {
          data: payload
        })
        .then(response => {
          dispatch(flash(response.message, 'success', 2))
          resolve()
        })
        .catch(err => {
          dispatch(flash(err || 'Issues updating organization user', 'error'))
          reject(err)
        })
    })
  }
}

export const updateCurrentOrganization = orgId => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const organizationView = getState().organization.organizationView || {}
      const currentOrgId = (organizationView && organizationView._id) || ''
      if (currentOrgId != orgId) {
        const organizations = getState().organization.organizationList.filter(
          org => org._id === orgId
        )
        if (organizations.length) {
          dispatch({
            type: ORGANIZATION_GET_SUCCESS,
            organization: organizations[0]
          })
        }
      }
      resolve()
    })
  }
}

export const getAllCategorizationdata = target => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .get('/categorization', {
          params: { target }
        })
        .then(response => {
          dispatch({
            type: ORGANIZATION_GET_ALL_CATEGORIZATION_SUCCESS,
            categorizations: response.categorizations
          })
          resolve(response.categorizations)
        })
        .catch(err => {
          dispatch(flash(err || 'Issues getting categorizations', 'error'))
          reject(err)
        })
    })
  }
}

export const getAllOrganizations = () => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .get('/organizations')
        .then(response => {
          resolve(response.organizations)
        })
        .catch(err => {
          dispatch(flash(err || 'Issues getting organizations', 'error'))
          reject(err)
        })
    })
  }
}

export const getAllOrganizationUsers = organizationId => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .get(`/organizations/users?organizationId=${organizationId}`)
        .then(response => {
          resolve(response.users)
        })
        .catch(err => {
          dispatch(flash(err || 'Issues getting users', 'error'))
          reject(err)
        })
    })
  }
}

export const updateUser = payload => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .put('/userManage/user', {
          data: payload
        })
        .then(response => {
          resolve(response.user)
        })
        .catch(err => {
          dispatch(flash(err || 'Issues updating user', 'error'))
          reject(err)
        })
    })
  }
}

export const removeUser = (userId, organizationId) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .del('/userManage/user', {
          data: {
            userId,
            organizationId
          }
        })
        .then(response => {
          resolve(response.user)
        })
        .catch(err => {
          dispatch(flash(err || 'Issues removing user', 'error'))
          reject(err)
        })
    })
  }
}

export const inviteNewUser = payload => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .post('/userManage/userInvite', {
          data: payload
        })
        .then(response => {
          resolve()
        })
        .catch(err => {
          dispatch(flash(err || 'Issues updating user', 'error'))
          reject(err)
        })
    })
  }
}

export const actions = {
  createOrganization,
  getOrganizations,
  getOrganization,
  getOrganizationBuildings,
  getOrganizationUsers,
  clearOrganizationStore,
  toggleTargets,
  updateCurrentOrganization
}

// ------------------------------------
// Action Helpers
// ------------------------------------

const handleClearStore = (state, action) => {
  return Object.assign({}, state, initialState)
}

const handleToggleTargets = (state, action) => {
  return Object.assign({}, state, {
    showTargets: !state.showTargets
  })
}

const handleToggleManageAllOrgs = (state, action) => {
  return Object.assign({}, state, {
    manageAllOrgSelected: action.isSelected
  })
}

const handleCreateOrganization = (state, action) => {
  let tempOrgs = Object.assign(state.organizationList, action.organization)
  return Object.assign({}, state, {
    organizationList: tempOrgs
  })
}

const handleGetOrganizations = (state, action) => {
  return Object.assign({}, state, {
    organizationList: action.organizations
  })
}

const handleGetOrganization = (state, action) => {
  return Object.assign({}, state, {
    organizationView: action.organization
  })
}

const handleGetOrganizationBuildings = (state, action) => {
  return Object.assign({}, state, {
    organizationView: action.organization
  })
}

const handleGetOrganizationTemplates = (state, action) => {
  return Object.assign({}, state, {
    organizationView: action.organization
  })
}
const handleGetOrgSpreadsheetTemplates = (state, action) => {
  return Object.assign({}, state, {})
}

const handleSetAllCategorzation = (state, action) => {
  return Object.assign({}, state, {
    categorizationData: action.categorizations
  })
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [CREATE_ORGANIZATION_SUCCESS]: handleCreateOrganization,

  [ORGANIZATIONS_GET_SUCCESS]: handleGetOrganizations,
  [ORGANIZATION_GET_SUCCESS]: handleGetOrganization,

  [ORGANIZATION_GET_BUILDINGS_SUCCESS]: handleGetOrganizationBuildings,
  [ORGANIZATION_GET_TEMPLATES_SUCCESS]: handleGetOrganizationTemplates,
  [ORGANIZATION_GET_SPREADSHEET_TEMPLATES_SUCCESS]: handleGetOrgSpreadsheetTemplates,
  [ORGANIZATION_CLEAR_STORE]: handleClearStore,
  [ORGANIZATION_TOGGLE_TARGETS]: handleToggleTargets,
  [ORGANIZATION_TOGGLE_MANAGE_ALL_ORGS]: handleToggleManageAllOrgs,
  [ORGANIZATION_GET_ALL_CATEGORIZATION_SUCCESS]: handleSetAllCategorzation
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  organizationList: [],
  organizationView: {},
  showTargets: true,
  manageAllOrgSelected: false,
  categorizationData: []
}

export default function organizationReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
