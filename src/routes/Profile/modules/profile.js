// ------------------------------------
// Constants
// ------------------------------------
export const PROFILE_GET = 'PROFILE/PROFILE_GET_START'
export const PROFILE_GET_FAIL = 'PROFILE/PROFILE_GET_FAIL'
export const PROFILE_GET_SUCCESS = 'PROFILE/PROFILE_GET_SUCCESS'

export const PROFILE_UPDATE = 'PROFILE/PROFILE_UPDATE_START'
export const PROFILE_UPDATE_FAIL = 'PROFILE/PROFILE_UPDATE_FAIL'
export const PROFILE_UPDATE_SUCCESS = 'PROFILE/PROFILE_UPDATE_SUCCESS'

export const PROFILE_PASSWORD_FORGOT = 'PROFILE/PASSWORD_FORGOT'
export const PROFILE_PASSWORD_FORGOT_FAIL = 'PROFILE/PASSWORD_FORGOT_FAIL'
export const PROFILE_PASSWORD_FORGOT_SUCCESS = 'PROFILE/PASSWORD_FORGOT_SUCCESS'

export const PROFILE_PASSWORD_UPDATE = 'PROFILE/PASSWORD_UPDATE'
export const PROFILE_PASSWORD_UPDATE_FAIL = 'PROFILE/PASSWORD_UPDATE_FAIL'
export const PROFILE_PASSWORD_UPDATE_SUCCESS = 'PROFILE/PASSWORD_UPDATE_SUCCESS'

export const PROFILE_VERIFY_EMAIL = 'PROFILE/PROFILE_VERIFY_EMAIL_START'
export const PROFILE_VERIFY_EMAIL_FAIL = 'PROFILE/PROFILE_VERIFY_EMAIL_FAIL'
export const PROFILE_VERIFY_EMAIL_SUCCESS =
  'PROFILE/PROFILE_VERIFY_EMAIL_SUCCESS'

export const PROFILE_UPDATE_USER_PRODUCTS =
  'PROFILE/PROFILE_UPDATE_USER_PRODUCTS'
export const PROFILE_UPDATE_USER_TYPE = 'PROFILE/PROFILE_UPDATE_USER_TYPE'
export const PROFILE_USER_ACCEPTING_TERMS =
  'PROFILE/PROFILE_USER_ACCEPTING_TERMS'

import ApiClient from 'utils/ApiClient'
import base64 from 'base-64'
import { showFlash as flash } from 'utils/Flash/modules/flash'
import { updateUser } from 'routes/Login/modules/login'
import { push } from 'react-router-redux'

// ------------------------------------
// Actions
// ------------------------------------

export const get = () => {
  return (dispatch, getState) => {
    dispatch({ type: PROFILE_GET })
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .get('/user')
        .then(response => {
          dispatch({ type: PROFILE_GET_SUCCESS, user: response.user })
          dispatch(updateUser(response.user))
          resolve()
        })
        .catch(err => {
          dispatch({ type: PROFILE_GET_FAIL })
          dispatch(
            flash(err.message || 'Issues retrieving profile', 'error', 5)
          )
          reject(err)
        })
    })
  }
}

export const update = payload => {
  return (dispatch, getState) => {
    dispatch({ type: PROFILE_UPDATE })
    // return new Promise((resolve, reject) => {
    //   const currentState = getState()
    //   const client = new ApiClient(dispatch, getState())
    //   client.put('/user', {data: payload}).then((response) => {
    //     dispatch({type: PROFILE_UPDATE_SUCCESS, user: response.user})
    //     dispatch(updateUser(response.user))
    //     dispatch(flash(response.message, 'success', 2))
    //     dispatch(push('/profile'))
    //     resolve()
    //   }).catch((err) => {
    //     dispatch({type: PROFILE_UPDATE_FAIL})
    //     dispatch(flash(err.message || 'Issues updating profile', 'error'))
    //     reject(err)
    //   })
    // })
  }
}

export const forgot = email => {
  return (dispatch, getState) => {
    dispatch({ type: PROFILE_PASSWORD_FORGOT })
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .get(
          '/user/password',
          { params: { email: email, fromEa: false } },
          { hmac: false }
        )
        .then(response => {
          dispatch({ type: PROFILE_PASSWORD_FORGOT_SUCCESS })
          dispatch(push('/login'))
          dispatch(flash('Temporary password sent to email', 'success', 3))
          resolve()
        })
        .catch(err => {
          dispatch({ type: PROFILE_PASSWORD_FORGOT_FAIL })
          dispatch(flash(err.message || err, 'error', 5))
          reject(err)
        })
    })
  }
}

export const updatePassword = (payload, userEmail, isPasswordReset) => {
  return (dispatch, getState) => {
    dispatch({ type: PROFILE_PASSWORD_UPDATE })

    payload.password = payload.newPassword
    const authHeader = base64.encode(
      userEmail.toLowerCase() + ':' + payload.currentPassword
    )

    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .put('/user/password/', {
          hmac: false,
          headers: {
            Authorization: 'basic ' + authHeader,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          data: payload
        })
        .then(response => {
          dispatch({
            type: PROFILE_PASSWORD_UPDATE_SUCCESS,
            user: response.user
          })
          dispatch(updateUser(response.user))
          if (isPasswordReset) {
            // redirect to a shared organization buildings view (for MVP)
            dispatch(
              push(
                '/organization/' +
                  response.user.orgIds.slice(-1)[0] +
                  '/building'
              )
            )
          } else {
            dispatch(push('/profile'))
          }
          dispatch(flash(response.message, 'success', 2))
          resolve()
        })
        .catch(err => {
          dispatch({ type: PROFILE_PASSWORD_UPDATE_FAIL })
          dispatch(flash(err || 'Issues updating profile password', 'error', 5))
          reject(err)
        })
    })
  }
}

export const verifyEmail = () => {
  return (dispatch, getState) => {
    dispatch({ type: PROFILE_VERIFY_EMAIL })
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .post('/account/verify')
        .then(response => {
          dispatch({ type: PROFILE_VERIFY_EMAIL_SUCCESS })
          dispatch(flash(response.message, 'success', 2))
          resolve()
        })
        .catch(err => {
          dispatch({ type: PROFILE_VERIFY_EMAIL_FAIL })
          dispatch(
            flash(err || 'Issues starting verify email process', 'error', 5)
          )
          reject(err)
        })
    })
  }
}

export const updateUserProducts = products => {
  return (dispatch, getState) => {
    dispatch({ type: PROFILE_UPDATE_USER_PRODUCTS })
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .put('/user', { data: { products: products } })
        .then(response => {
          dispatch(updateUser(response.user))
          resolve(response.user)
        })
        .catch(err => {
          dispatch(flash(err || 'Issues updating user products', 'error', 5))
          reject(err)
        })
    })
  }
}

export const updateUserType = type => {
  return (dispatch, getState) => {
    dispatch({ type: PROFILE_UPDATE_USER_TYPE })
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .put('/user', { data: { type: type } })
        .then(response => {
          dispatch(updateUser(response.user))
          resolve(response.user)
        })
        .catch(err => {
          dispatch(flash(err || 'Issues updating user type', 'error', 5))
          reject(err)
        })
    })
  }
}

export const updateProfile = data => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      let user = getState().login.user || {}
      let id = user && user._id
      if (!id) reject()
      client
        .put('/user/profile', { data: { data, userId: id } })
        .then(response => {
          dispatch(updateUser(response.user))
          resolve(response.user)
        })
        .catch(err => {
          dispatch(flash(err || 'Issues updating user profile', 'error', 5))
          reject(err)
        })
    })
  }
}

export const verifyEmailSuccess = () => {
  return (dispatch, getState) => {
    dispatch(flash('User verified', 'success', 5))
  }
}

export const updateUserIds = firebaseRefs => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .put('/user', { data: { firebaseRefs: firebaseRefs } })
        .then(response => {
          dispatch(updateUser(response.user))
          dispatch(flash(response.message, 'success', 2))
          resolve()
        })
        .catch(err => {
          dispatch(flash(err || 'Issues syncing user account', 'error', 5))
          reject(err)
        })
    })
  }
}

export const updateLEANOrgsSettings = orgIDArray => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .put('/user', {
          data: {
            settings: {
              leanOrganizations: orgIDArray
            }
          }
        })
        .then(response => {
          dispatch(updateUser(response.user))
          dispatch(flash(response.message, 'success', 2))
          resolve()
        })
        .catch(err => {
          dispatch(
            flash(err || 'Issues updating LEAN organizations', 'error', 5)
          )
          reject(err)
        })
    })
  }
}

export const getOrganizationName = orgId => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .get('/organization/' + orgId)
        .then(response => {
          resolve(response.organization)
        })
        .catch(err => {
          dispatch(flash('Issues getting organization information', 'error', 5))
          reject(err)
        })
    })
  }
}

export const acceptTerms = () => {
  return (dispatch, getState) => {
    dispatch({ type: PROFILE_USER_ACCEPTING_TERMS })
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .put('/user', { data: { acceptedTerms: true } })
        .then(response => {
          dispatch(updateUser(response.user))
          dispatch(
            push(
              '/organization/' + response.user.orgIds.slice(-1)[0] + '/building'
            )
          )
          resolve(response.user)
        })
        .catch(err => {
          dispatch(flash(err || 'Issues accepting terms', 'error', 5))
          reject(err)
        })
    })
  }
}

// ------------------------------------
// Action Helpers
// ------------------------------------

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [PROFILE_GET]: (state, action) => {
    return { ...state }
  },
  [PROFILE_GET_FAIL]: (state, action) => {
    return { ...state }
  },
  [PROFILE_GET_SUCCESS]: (state, action) => {
    return { ...state }
  },

  [PROFILE_UPDATE]: (state, action) => {
    return { ...state }
  },
  [PROFILE_UPDATE_FAIL]: (state, action) => {
    return { ...state }
  },
  [PROFILE_UPDATE_SUCCESS]: (state, action) => {
    return { ...state }
  },

  [PROFILE_PASSWORD_UPDATE]: (state, action) => {
    return { ...state }
  },
  [PROFILE_PASSWORD_UPDATE_FAIL]: (state, action) => {
    return { ...state }
  },
  [PROFILE_PASSWORD_UPDATE_SUCCESS]: (state, action) => {
    return { ...state }
  },

  [PROFILE_VERIFY_EMAIL]: (state, action) => {
    return { ...state }
  },
  [PROFILE_VERIFY_EMAIL_FAIL]: (state, action) => {
    return { ...state }
  },
  [PROFILE_VERIFY_EMAIL_SUCCESS]: (state, action) => {
    return { ...state }
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {}
export default function profileReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
