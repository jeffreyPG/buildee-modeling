// ------------------------------------
// Constants
// ------------------------------------
export const SIGNUP = 'SIGNUP/START'
export const SIGNUP_FAIL = 'SIGNUP/SIGNUP_FAIL'
export const SIGNUP_SUCCESS = 'SIGNUP/SIGNUP_SUCCESS'

export const CLEAR_SIGNUP_INVITE = 'CLEAR_SIGNUP_INVITE/SIGNUP_CLEAR'

import ApiClient from 'utils/ApiClient'
import { showFlash as flash } from 'utils/Flash/modules/flash'
import { push } from 'react-router-redux'

import { login } from 'routes/Login/modules/login'

// ------------------------------------
// Actions
// ------------------------------------
export const signup = (payload, orgId) => {
  return (dispatch, getState) => {
    dispatch({ type: SIGNUP })
    payload.email = payload.email.toLowerCase()
    return new Promise((resolve, reject) => {
      let postUrl = '/user'
      if (orgId) {
        postUrl = '/user?orgId=' + orgId
      }
      const client = new ApiClient(dispatch, getState())
      const request = {
        email: payload.email,
        password: payload.password,
        company: payload.company,
        name: payload.name,
        role: payload.role,
        acceptedTerms: true,
        expert: {}
      }
      if (payload.expertRadius) {
        request.expert.radius = payload.expertRadius
      }
      if (payload.expertZipCode) {
        request.expert.serviceZipCode = payload.expertZipCode
      }
      client
        .post(postUrl, { data: request })
        .then(response => {
          dispatch({ type: SIGNUP_SUCCESS })
          dispatch(login(request.email, request.password, true))
          dispatch(flash(response.message, 'success', 2))
          resolve()
        })
        .catch(err => {
          dispatch({ type: SIGNUP_FAIL })
          dispatch(flash(err, 'error', 5))
          reject(err)
        })
    })
  }
}

export const clearViewState = () => ({ type: CLEAR_SIGNUP_INVITE })

export const actions = {
  signup,
  clearViewState
}

// ------------------------------------
// Action Helpers
// ------------------------------------

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [SIGNUP]: (state, action) => {
    return { ...state }
  },
  [SIGNUP_FAIL]: (state, action) => {
    return { ...state }
  },
  [SIGNUP_SUCCESS]: (state, action) => {
    return { ...state }
  },

  [CLEAR_SIGNUP_INVITE]: (state, action) => {
    return { ...state }
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {}
export default function signupReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
