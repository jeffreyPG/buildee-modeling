// ------------------------------------
// Constants
// ------------------------------------

export const PROPOSAL_TEMPLATES_CLEAR_STORE =
  'PROPOSAL/TEMPLATE/TEMPLATES_CLEAR_STORE'
export const ORGANIZATION_GET_PROPOSAL_TEMPLATES_SUCCESS =
  'ORGANIZATION/ORGANIZATION_GET_PROPOSAL_TEMPLATES_SUCCESS'
export const ORGANIZATION_GET_PROPOSAL_TEMPLATES =
  'ORGANIZATION/ORGANIZATION_GET_PROPOSAL_TEMPLATES'
export const ORGANIZATION_GET_PROPOSAL_TEMPLATES_FAIL =
  'ORGANIZATION/ORGANIZATION_GET_PROPOSAL_TEMPLATES_FAIL'

export const PROPOSAL_TEMPLATE_STATUS_UPDATE =
  'PROPOSALTEMPLATE/TEMPLATE_STATUS_UPDATE'

export const PROPOSAL_TEMPLATE_GET_TEMPLATE =
  'PROPOSALTEMPLATE/TEMPLATE_GET_TEMPLATE'
export const PROPOSAL_TEMPLATE_GET_TEMPLATE_SUCCESS =
  'PROPOSALTEMPLATE/TEMPLATE_GET_TEMPLATE_SUCCESS'
export const PROPOSAL_TEMPLATE_GET_TEMPLATE_FAIL =
  'PROPOSALTEMPLATE/TEMPLATE_GET_TEMPLATE_FAIL'

// ------------------------------------
// Imports
// ------------------------------------
import ApiClient from 'utils/ApiClient'
import { showFlash as flash } from 'utils/Flash/modules/flash'
import { push } from 'react-router-redux'

// ------------------------------------
// Actions
// ------------------------------------
export const clearProposalTemplateStore = () => {
  return (dispatch, getState) => {
    dispatch({ type: PROPOSAL_TEMPLATES_CLEAR_STORE })
  }
}

export const templateUpdated = bool => ({
  type: PROPOSAL_TEMPLATE_STATUS_UPDATE,
  bool: bool
})

//Get selected template from template list page
export const getOrgProposalTemplates = (id = null) => {
  return (dispatch, getState) => {
    dispatch({ type: ORGANIZATION_GET_PROPOSAL_TEMPLATES })
    return new Promise((resolve, reject) => {
      let organizationId = getState().organization.organizationView._id
      const client = new ApiClient(dispatch, getState())
      if (id) organizationId = id
      client
        .get('/organization/' + organizationId + '/proposalTemplates/')
        .then(response => {
          dispatch({
            type: ORGANIZATION_GET_PROPOSAL_TEMPLATES_SUCCESS,
            templateList: response.proposalTemplates
          })
          resolve(response.proposalTemplates)
        })
        .catch(err => {
          dispatch({ type: ORGANIZATION_GET_PROPOSAL_TEMPLATES_FAIL })
          dispatch(
            flash(err || 'Issues retrieving proposal templates', 'error')
          )
          reject(err)
        })
    })
  }
}

export const clearData = () => ({
  type: PROPOSAL_TEMPLATES_CLEAR_STORE
})

// ------------------------------------
// Action Helpers
// ------------------------------------

const handleClearStore = (state, action) => {
  return Object.assign({}, state, initialState)
}

const handleGet = (state, action) => {
  return Object.assign({}, state, {
    templateList: [...action.templateList]
  })
}

const handleTemplateStatusUpdated = (state, action) => {
  return Object.assign({}, state, {
    dirty: action.bool
  })
}

// ------------------------------------
// Action Handlers
// ------------------------------------

const ACTION_HANDLERS = {
  [PROPOSAL_TEMPLATES_CLEAR_STORE]: handleClearStore,
  [ORGANIZATION_GET_PROPOSAL_TEMPLATES]: (state, action) => {
    return { ...state, templateList: [] }
  },
  [ORGANIZATION_GET_PROPOSAL_TEMPLATES_FAIL]: (state, action) => {
    return { ...state }
  },
  [ORGANIZATION_GET_PROPOSAL_TEMPLATES_SUCCESS]: handleGet,
  [PROPOSAL_TEMPLATE_STATUS_UPDATE]: handleTemplateStatusUpdated
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  templateList: [],
  dirty: false
}
export default function templateReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
