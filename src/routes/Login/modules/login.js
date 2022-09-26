// ------------------------------------
// Constants
// ------------------------------------
export const LOGIN = 'AUTH/LOGIN'
export const LOGIN_FAIL = 'AUTH/LOGIN_FAIL'
export const LOGIN_SUCCESS = 'AUTH/LOGIN_SUCCESS'

export const LOGOUT = 'AUTH/LOGOUT'
export const LOGOUT_CLEAR = 'AUTH/LOGOUT_CLEAR'

export const UPDATE_USER = 'AUTH/UPDATE_USER'
export const UPDATE_USER_PORTFOLIO = 'AUTH/UPDATE_USER_PORTFOLIO'
export const UPDATE_USER_FIREBASEREFS = 'AUTH/UPDATE_USER_FIREBASEREFS'

export const CLEAR_AUTH_STATE = 'AUTH/CLEAR_AUTH_STATE'

import ApiClient from 'utils/ApiClient'
import base64 from 'base-64'
import sha256 from 'crypto-js/sha256'

import { clearTemplateStore } from '../../Template/modules/template'
import { clearBuildingStore } from '../../Building/modules/building'
import { clearOrganizationStore } from '../../Organization/modules/organization'
import { clearPortfolioStore } from '../../Portfolio/modules/portfolio'
import { clearDocuSignStore } from '../../DocuSign/modules/docuSign'
import { PROFILE_GET_SUCCESS } from '../../Profile/modules/profile'
import { showFlash as flash } from 'utils/Flash/modules/flash'
import { push } from 'react-router-redux'
import { client as apolloClient } from 'utils/ApolloClient'
import gql from 'graphql-tag'
import { detectMobileTouch, checkLicense } from 'utils/Utils'
import { clearFeatureFlagStore } from 'routes/FeatureFlags/modules/featureFlags'
// ------------------------------------
// Actions
// ------------------------------------

export const logoutClear = () => {
  return (dispatch, getState) => {
    dispatch({ type: LOGOUT_CLEAR })
  }
}

export const login = redirectUri => {
  return (dispatch, getState) => {
    dispatch({ type: CLEAR_AUTH_STATE })
    dispatch({ type: LOGIN })

    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .get('/user')
        .then(response => {
          dispatch({ type: PROFILE_GET_SUCCESS, user: response.user })
          dispatch(updateUser(response.user))
          // redirect to a shared organization buildings view (for MVP)
          if (detectMobileTouch() === 'mobile') {
            dispatch(
              push(
                redirectUri
                  ? redirectUri
                  : '/organization/' +
                      response.user.orgIds.slice(-1)[0] +
                      '/building'
              )
            )
          } else {
            apolloClient
              .query({
                query: gql`
                  {
                    enabledFeatures {
                      name
                    }
                  }
                `,
                fetchPolicy: 'network-only'
              })
              .then(({ data }) => {
                const hasFeature =
                  data.enabledFeatures &&
                  data.enabledFeatures.some(
                    feature => feature.name === 'portfolio'
                  )
                if (hasFeature) {
                  dispatch(
                    push(
                      redirectUri
                        ? redirectUri
                        : '/organization/' +
                            response.user.orgIds.slice(-1)[0] +
                            '/portfolio'
                    )
                  )
                } else {
                  dispatch(
                    push(
                      redirectUri
                        ? redirectUri
                        : '/organization/' +
                            response.user.orgIds.slice(-1)[0] +
                            '/building'
                    )
                  )
                }
              })

            // dispatch(push('/organization'))
          }
          resolve()
        })
        .catch(err => {
          console.log(err, 'err')
          if (err === 'Invalid Email / Password Combination') {
            const authHeader = base64.encode(
              user.toLowerCase() + ':' + sha256(pass).toString()
            )
            const client = new ApiClient(dispatch, getState())
            client
              .get('/auth/token', {
                hmac: false,
                headers: {
                  Authorization: 'basic ' + authHeader
                }
              })
              .then(response => {
                if (!checkLicense(response.user)) {
                  dispatch({ type: LOGIN_FAIL })
                  dispatch(flash('Your account is deactivated', 'error', 5))
                  reject('Your account is deactivated')
                } else {
                  dispatch({
                    type: LOGIN_SUCCESS,
                    user: response.user,
                    secret: response.secret,
                    expiry: response.expiry
                  })
                  if (response.user.resetPassword) {
                    dispatch(push('/profile/password'))
                  } else {
                    // redirect to a shared organization buildings view (for MVP)
                    apolloClient
                      .query({
                        query: gql`
                          {
                            enabledFeatures {
                              name
                            }
                          }
                        `
                      })
                      .then(({ data }) => {
                        const hasFeature =
                          data.enabledFeatures &&
                          data.enabledFeatures.some(
                            feature => feature.name === 'portfolio'
                          )
                        if (hasFeature) {
                          dispatch(push('/organization/portfolio'))
                        } else {
                          dispatch(
                            push(
                              '/organization/' +
                                response.user.orgIds.slice(-1)[0] +
                                '/building'
                            )
                          )
                        }
                      })
                    // dispatch(push('/organization'))
                  }
                  resolve()
                }
              })
              .catch(err => {
                dispatch({ type: LOGIN_FAIL })
                let errMessage =
                  err.message || typeof err === 'string'
                    ? err
                    : 'Issues with login.'
                dispatch(flash(errMessage, 'error', 5))
                reject(err)
              })
          } else {
            dispatch({ type: LOGIN_FAIL })
            let errMessage =
              err.message || typeof err === 'string'
                ? err
                : 'Issues with login.'
            dispatch(flash(errMessage, 'error', 5))
            reject(err)
          }
        })
    })
  }
}

export const logout = () => {
  return (dispatch, getState) => {
    dispatch({ type: LOGOUT })
    dispatch(clearBuildingStore())
    dispatch(clearTemplateStore())
    dispatch(clearOrganizationStore())
    dispatch(clearPortfolioStore())
    dispatch(clearDocuSignStore())
    dispatch(clearFeatureFlagStore())
  }
}

export const updateUser = userData => ({ type: UPDATE_USER, user: userData })
export const updateUserPortfolio = userPortfolioData => ({
  type: UPDATE_USER_PORTFOLIO,
  portfolio: userPortfolioData
})
export const updateUserFirebaseRefs = userFirebaseRefs => ({
  type: UPDATE_USER_FIREBASEREFS,
  firebaseRefs: userFirebaseRefs
})

export const actions = {
  login,
  logout,
  updateUser,
  updateUserPortfolio,
  updateUserFirebaseRefs
}

// ------------------------------------
// Action Helpers
// ------------------------------------
const handleLogin = (state, action) => {
  return Object.assign({}, state, {
    user: action.user,
    secret: action.secret,
    expiry: action.expiry,
    portfolio: action.user.portfolio || {},
    loggingIn: false
  })
}

const handleUpdateUser = (state, action) => {
  return Object.assign({}, state, {
    user: action.user,
    portfolio: action.user.portfolio || {}
  })
}

const handleUpdateUserPortfolio = (state, action) => {
  let modifiedUser = { ...state.user }
  modifiedUser.portfolio = action.portfolio

  return Object.assign({}, state, {
    user: modifiedUser,
    portfolio: action.portfolio
  })
}

const handleUpdateUserFirebaseRefs = (state, action) => {
  let modifiedUser = { ...state.user }
  modifiedUser.firebaseRefs = action.firebaseRefs

  return Object.assign({}, state, {
    user: modifiedUser,
    firebaseRefs: action.firebaseRefs
  })
}

const handleLogout = (state, action) => {
  return (state = initialState)
}

const handleLogoutClear = (state, action) => {
  return (state = initialState)
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [LOGIN]: (state, action) => {
    return { ...state, loggingIn: true }
  },
  [LOGIN_SUCCESS]: handleLogin,
  [LOGIN_FAIL]: (state, action) => {
    return { ...state, loggingIn: false }
  },

  [LOGOUT]: handleLogout,
  [LOGOUT_CLEAR]: handleLogoutClear,

  [UPDATE_USER]: handleUpdateUser,
  [UPDATE_USER_PORTFOLIO]: handleUpdateUserPortfolio,
  [UPDATE_USER_FIREBASEREFS]: handleUpdateUserFirebaseRefs,

  [CLEAR_AUTH_STATE]: (state, action) => {
    return {}
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  loggingIn: false,
  portfolio: {},
  firebaseRefs: {}
}
export default function loginReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
