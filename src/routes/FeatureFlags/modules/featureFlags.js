import ApiClient from 'utils/ApiClient'
import { showFlash as flash } from 'utils/Flash/modules/flash'

// ------------------------------------
// Constants
// ------------------------------------

export const FEATURE_FLAG_GET_LIST = 'FEATURE_FLAG/FEATURE_FLAG_GET_LIST'
export const FEATURE_FLAG_GET_LIST_SUCCESS =
  'FEATURE_FLAG/FEATURE_FLAG_GET_LIST_SUCCESS'
export const FEATURE_FLAG_GET_LIST_FAIL =
  'FEATURE_FLAG/FEATURE_FLAG_GET_LIST_FAIL'

export const FEATURE_FLAG_CLEAR_STORE = 'FEATURE_FLAG/CLEAR_STORE'

// ------------------------------------
// Actions
// ------------------------------------

export const getFeatureFlagList = orgId => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: FEATURE_FLAG_GET_LIST })
      const client = new ApiClient(dispatch, getState())
      client
        .get(`/featureFlag`)
        .then(response => {
          dispatch({
            type: FEATURE_FLAG_GET_LIST_SUCCESS,
            featureFlags: response.featureFlags || []
          })
          resolve(response.featureFlags)
        })
        .catch(err => {
          dispatch({ type: FEATURE_FLAG_GET_LIST_FAIL })
          dispatch(flash(err || 'Issues retreiving features'))
          reject(err)
        })
    })
  }
}

export const getUserListWithFeatureFlag = orgId => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      const data = {
        organizationId: orgId
      }
      client
        .get(`/featureFlag/user`, {
          params: data
        })
        .then(response => {
          resolve(response.userList)
        })
        .catch(err => {
          reject(err)
        })
    })
  }
}

export const updateUserFeatureFlag = (userId, featureId, check) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .post(`/featureFlag/${featureId}/user`, {
          data: {
            check,
            userId
          }
        })
        .then(response => {
          resolve(response.userList)
        })
        .catch(err => {
          reject(err)
        })
    })
  }
}

export const clearFeatureFlagStore = () => {
  return (dispatch, getState) => {
    dispatch({ type: FEATURE_FLAG_CLEAR_STORE })
  }
}

// ------------------------------------
// Action Helpers
// ------------------------------------
const handleGetFeatureFlag = (state, action) => {
  return Object.assign({}, state, {
    loading: false,
    list: action.featureFlags || []
  })
}

const handleClearStore = (state, action) => {
  return Object.assign({}, state, initialState)
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [FEATURE_FLAG_GET_LIST]: (state, action) => {
    return { ...state, loading: true }
  },
  [FEATURE_FLAG_GET_LIST_FAIL]: (state, action) => {
    return { ...state, loading: false }
  },
  [FEATURE_FLAG_GET_LIST_SUCCESS]: handleGetFeatureFlag,
  [FEATURE_FLAG_CLEAR_STORE]: handleClearStore
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  loading: true,
  list: []
}

export default function featureFlagReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
