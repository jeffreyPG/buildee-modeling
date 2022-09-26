import ApiClient from 'utils/ApiClient'
import { showFlash as flash } from 'utils/Flash/modules/flash'

// ------------------------------------
// Constants
// ------------------------------------

export const DOCUSIGN_GET_AUTH_CODE_GRANT_URL =
  'DOCUSIGN/GET_AUTH_CODE_GRANT_URL'
export const DOCUSIGN_GET_AUTH_CODE_GRANT_URL_SUCCESS =
  'DOCUSIGN/GET_AUTH_CODE_GRANT_URL_SUCCESS'
export const DOCUSIGN_GET_AUTH_CODE_GRANT_URL_FAIL =
  'DOCUSIGN/GET_AUTH_CODE_GRANT_URL_FAIL'
export const DOCUSIGN_SET_CODE = 'DOCUSIGN/SET_CODE'

export const DOCUSIGN_LOGIN = 'DOCUSIGN/LOGIN'
export const DOCUSIGN_LOGIN_SUCCESS = 'DOCUSIGN/LOGIN_SUCCESS'
export const DOCUSIGN_LOGIN_FAIL = 'DOCUSIGN/LOGIN_FAIL'

export const DOCUSIGN_GET_TEMPLATES = 'DOCUSIGN/GET_TEMPLATES'
export const DOCUSIGN_GET_TEMPLATES_SUCCESS = 'DOCUSIGN/GET_TEMPLATES_SUCCESS'
export const DOCUSIGN_GET_TEMPLATES_FAIL = 'DOCUSIGN/GET_TEMPLATES_FAIL'

export const DOCUSIGN_EMAIL_SEND = 'DOCUSIGN/EMAIL_SEND'
export const DOCUSIGN_EMAIL_SEND_SUCCESS = 'DOCUSIGN/EMAIL_SEND_SUCCESS'
export const DOCUSIGN_EMAIL_SEND_FAIL = 'DOCUSIGN/EMAIL_SEND_FAIL'

export const DOCUSING_GET_EMBEDDED_URL = 'DOCUSIGN/GET_EMBEDDED_URL'
export const DOCUSING_GET_EMBEDDED_URL_SUCCESS =
  'DOCUSIGN/GET_EMBEDDED_URL_SUCCESS'
export const DOCUSING_GET_EMBEDDED_URL_FAIL = 'DOCUSIGN/GET_EMBEDDED_URL_FAIL'
export const DOCUSIGN_SET_EMBEDDED_STATUS = 'DOCUSIGN/SET_EMBEDDED_STATUS'

export const DOCUSIGN_LINKED_ENVELOPE_DOCUMENTS =
  'DOCUSIGN/LINKED_ENVELOPE_DOCUMENTS'
export const DOCUSIGN_LINKED_ENVELOPE_DOCUMENTS_SUCCESS =
  'DOCUSIGN/LINKED_ENVELOPE_DOCUMENTS_SUCCESS'
export const DOCUSIGN_LINKED_ENVELOPE_DOCUMENTS_FAIL =
  'DOCUSIGN/LINKED_ENVELOPE_DOCUMENTS_FAIL'

export const DOCUSIGN_DELETE_ENVELOPE_DOCUMENT =
  'DOCUSIGN/DELETE_ENVELOPE_DOCUMENT'
export const DOCUSIGN_UNLINK_ENVELOPE_DOCUMENT =
  'DOCUSIGN/UNLINK_ENVELOPE_DOCUMENT'

export const DOCUSIGN_CLEAR_STORE = 'DOCUSIGN/CLEAR_STORE'

// ------------------------------------
// Actions
// ------------------------------------

export const setDocuSignCode = code => {
  return dispatch => {
    dispatch({ type: DOCUSIGN_SET_CODE, code: code })
  }
}

export const setEmbedStatus = status => {
  return dispatch => {
    dispatch({ type: DOCUSIGN_SET_EMBEDDED_STATUS, status })
  }
}

export const clearDocuSignStore = () => {
  return (dispatch, getState) => {
    dispatch({ type: DOCUSIGN_CLEAR_STORE })
  }
}

export const getAuthGrantURL = callback => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: DOCUSIGN_GET_AUTH_CODE_GRANT_URL })
      const client = new ApiClient(dispatch, getState())
      const orgId = getState().organization.organizationView._id
      const data = {
        organizationId: orgId,
        callback: callback,
        state: 0
      }
      client
        .get(`/ds/getAuthCodeGrantUri`, {
          params: data
        })
        .then(response => {
          if (response) {
            if (response.status === 'Success') {
              dispatch({
                type: DOCUSIGN_GET_AUTH_CODE_GRANT_URL_SUCCESS,
                status: response.status,
                url: response.uri
              })
            }
          }
          resolve(response)
        })
        .catch(err => {
          dispatch({ type: DOCUSIGN_GET_AUTH_CODE_GRANT_URL_FAIL })
          dispatch(flash(err || 'Can not get grant URL for docuSign', 'error'))
          reject(err)
        })
    })
  }
}

export const docuSignLogin = docuCode => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: DOCUSIGN_LOGIN })
      const client = new ApiClient(dispatch, getState())
      const orgId = getState().organization.organizationView._id
      const userId = getState().login.user._id
      const StoreCode = getState().docuSign.code || ''
      let code = docuCode || StoreCode
      if (!orgId || !userId || !code) reject()
      const data = {
        organizationId: orgId,
        userId: userId,
        code: code
      }
      client
        .put(`/ds/login`, {
          data: data
        })
        .then(response => {
          if (response.status === 'Success') {
            dispatch({
              type: DOCUSIGN_LOGIN_SUCCESS,
              status: response.status,
              url: response.uri
            })
            resolve(response)
          } else {
            dispatch({ type: DOCUSIGN_LOGIN_FAIL })
            reject()
          }
        })
        .catch(err => {
          dispatch({ type: DOCUSIGN_LOGIN_FAIL })
          dispatch(flash(err || 'Can not login in DocuSign', 'error'))
          reject(err)
        })
    })
  }
}

// export const getDocuSignTemplates = () => {
//   return (dispatch, getState) => {
//     return new Promise((resolve, reject) => {
//       dispatch({ type: DOCUSIGN_GET_TEMPLATES })
//       const client = new ApiClient(dispatch, getState())
//       const orgId = getState().organization.organizationView._id
//       const userId = getState().login.user._id
//       if (!orgId || !userId) reject()
//       const data = {
//         organizationId: orgId,
//         userId: userId
//       }
//       client
//         .get(`/ds/listTemplates`, {
//           params: data
//         })
//         .then(response => {
//           dispatch({ type: DOCUSIGN_GET_TEMPLATES_SUCCESS, response })
//           resolve(response)
//         })
//         .catch(err => {
//           console.log(err)
//           dispatch({ type: DOCUSIGN_GET_TEMPLATES_FAIL })
//           dispatch(flash(err || 'Issues retreiving docuSign templates'))
//           reject(err)
//         })
//     })
//   }
// }

export const getDocuSignTemplates = () => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: DOCUSIGN_GET_TEMPLATES })
      const client = new ApiClient(dispatch, getState())
      const orgId = getState().organization.organizationView._id
      if (!orgId) reject()
      const data = {
        organizationId: orgId
      }
      client
        .get(`/ds/listTemplates/admin`, {
          params: data
        })
        .then(response => {
          dispatch({ type: DOCUSIGN_GET_TEMPLATES_SUCCESS, response })
          resolve(response)
        })
        .catch(err => {
          console.log(err)
          dispatch({ type: DOCUSIGN_GET_TEMPLATES_FAIL })
          dispatch(flash(err || 'Issues retreiving docuSign templates'))
          reject(err)
        })
    })
  }
}

export const getLinkedEnvelopeDocuments = (id, mode) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: DOCUSIGN_LINKED_ENVELOPE_DOCUMENTS })
      const client = new ApiClient(dispatch, getState())
      const data = {}
      if (id) {
        data[`${mode}Id`] = id
        client
          .get(`/ds/listLinkedEnvelopes`, {
            params: data
          })
          .then(response => {
            if (response.status === 'Success') {
              dispatch({
                type: DOCUSIGN_LINKED_ENVELOPE_DOCUMENTS_SUCCESS,
                response
              })
              resolve(response)
            } else {
              dispatch({ type: DOCUSIGN_LINKED_ENVELOPE_DOCUMENTS_FAIL })
            }
          })
          .catch(err => {
            dispatch({ type: DOCUSIGN_LINKED_ENVELOPE_DOCUMENTS_FAIL })
            dispatch(
              flash(
                err || 'Issues retreiving docuSign linked envelopes',
                'error'
              )
            )
            reject(err)
          })
      } else {
        dispatch({ type: DOCUSIGN_LINKED_ENVELOPE_DOCUMENTS_FAIL })
        dispatch(flash('Issues retreiving docuSign linked envelopes', 'error'))
        reject()
      }
    })
  }
}

export const sendDocuSignEmail = (
  dsTemplateId,
  emailSubject,
  emailBody,
  signers,
  cc,
  id,
  mode
) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: DOCUSIGN_EMAIL_SEND })
      const client = new ApiClient(dispatch, getState())
      const orgId = getState().organization.organizationView._id
      const userId = getState().login.user._id
      if (!orgId || !userId) reject()
      const data = {
        organizationId: orgId,
        userId: userId,
        dsTemplateId,
        emailSubject,
        emailBody,
        signers,
        cc
      }
      if (id) data[`${mode}Id`] = id

      client
        .put(`/ds/sendEmail/admin`, {
          data: data
        })
        .then(response => {
          if (response.status == 'Success')
            dispatch({ type: DOCUSIGN_EMAIL_SEND_SUCCESS })
          else {
            dispatch({ type: DOCUSIGN_EMAIL_SEND_FAIL })
          }
          resolve(response)
        })
        .catch(err => {
          dispatch({ type: DOCUSIGN_EMAIL_SEND_FAIL })
          dispatch(flash(err || 'Issues sending docusign emails'))
          reject(err)
        })
    })
  }
}

export const getEmbeddSignURL = (dsTemplateId, returnUrl, id, mode) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: DOCUSING_GET_EMBEDDED_URL })
      const client = new ApiClient(dispatch, getState())
      const orgId = getState().organization.organizationView._id
      const userId = getState().login.user._id
      if (!orgId || !userId || !id) reject()
      const data = {
        organizationId: orgId,
        userId: userId,
        dsTemplateId,
        returnUrl
      }
      if (id) data[`${mode}Id`] = id
      else reject()
      client
        .put(`/ds/embeddedSign`, {
          data: data
        })
        .then(response => {
          if (response.status == 'Success')
            dispatch({
              type: DOCUSING_GET_EMBEDDED_URL_SUCCESS,
              status: response.status,
              results: response.results
            })
          else {
            dispatch({ type: DOCUSING_GET_EMBEDDED_URL_FAIL })
            dispatch({ type: DOCUSIGN_CLEAR_STORE })
          }
          resolve(response)
        })
        .catch(err => {
          console.log('err', err)
          dispatch({ type: DOCUSING_GET_EMBEDDED_URL_FAIL })
          dispatch({ type: DOCUSIGN_CLEAR_STORE })
          dispatch(flash('Issues getting embedded URL', 'error', 500))
          reject(err)
        })
    })
  }
}

export const deleteEnvelopeDocument = envelopeId => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      const orgId = getState().organization.organizationView._id
      const userId = getState().login.user._id
      if (!orgId || !userId) reject()
      const data = {
        organizationId: orgId,
        userId: userId,
        envelopeId
      }
      client
        .put(`/ds/deleteEnvelope`, {
          data: data
        })
        .then(response => {
          console.log(response)
          if (response.status == 'Success')
            dispatch({
              type: DOCUSIGN_DELETE_ENVELOPE_DOCUMENT
            })
          resolve(response)
        })
        .catch(err => {
          dispatch(flash('Issues removing envelope documents', 'error', 500))
          reject(err)
        })
    })
  }
}

export const unlinkEnvelopeDocument = envelopeId => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      const orgId = getState().organization.organizationView._id
      const userId = getState().login.user._id
      if (!orgId || !userId) reject()
      const data = {
        organizationId: orgId,
        userId: userId,
        envelopeId
      }
      client
        .put(`/ds/unlinkEnvelope`, {
          data: data
        })
        .then(response => {
          console.log(response)
          if (response.status == 'Success')
            dispatch({
              type: DOCUSIGN_UNLINK_ENVELOPE_DOCUMENT
            })
          resolve(response)
        })
        .catch(err => {
          dispatch(flash('Issues removing envelope documents', 'error', 500))
          reject(err)
        })
    })
  }
}

export const getEmbeddedEnvlopeLink = (envelopeId, dsReturnUrl) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      const orgId = getState().organization.organizationView._id
      const userId = getState().login.user._id
      if (!orgId || !userId) reject()
      const data = {
        organizationId: orgId,
        userId: userId,
        envelopeId,
        dsReturnUrl
      }
      client
        .put(`/ds/embeddedEnvelope`, {
          data: data
        })
        .then(response => {
          if (response.status === 'Success') resolve(response)
          else {
            dispatch({ type: DOCUSIGN_CLEAR_STORE })
            reject(err)
          }
        })
        .catch(err => {
          dispatch(flash('Issues getting embed envelope link', 'error', 500))
          reject(err)
        })
    })
  }
}

// ------------------------------------
// Action Helpers
// ------------------------------------
const handleGetAuthGrantURL = (state, action) => {
  return Object.assign({}, state, {
    grantStatus: action.status,
    grantURL: action.url
  })
}

const handleClearStore = (state, action) => {
  return Object.assign({}, state, initialState)
}

const handleDocuSignLogin = (state, action) => {
  return Object.assign({}, state, { isLoggedIn: true })
}

const handleGetTemplates = (state, action) => {
  return Object.assign({}, state, {
    templateLoading: false,
    templates:
      action.response.status == 'Success' ? action.response.results : []
  })
}

const handleGetEvenlopes = (state, action) => {
  return Object.assign({}, state, {
    documents: action.response.envelopes || []
  })
}

const handleGetEmbeddURL = (state, action) => {
  return Object.assign({}, state, {
    embeddLoading: false,
    embeddStatus: action.status,
    embeddURL: action.results.redirectUrl,
    embeddedSignStatus: ''
  })
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [DOCUSIGN_GET_AUTH_CODE_GRANT_URL]: (state, action) => {
    return { ...state, grantURL: '', grantStatus: '', isLoggedIn: false }
  },
  [DOCUSIGN_GET_AUTH_CODE_GRANT_URL_FAIL]: (state, action) => {
    return { ...state, grantURL: '', grantStatus: 'FAIL', isLoggedIn: false }
  },
  [DOCUSIGN_GET_AUTH_CODE_GRANT_URL_SUCCESS]: handleGetAuthGrantURL,
  [DOCUSIGN_SET_CODE]: (state, action) => {
    return { ...state, code: action.code }
  },
  [DOCUSIGN_LOGIN]: (state, action) => {
    return { ...state, isLoggedIn: false }
  },
  [DOCUSIGN_LOGIN_FAIL]: (state, action) => {
    return { ...state }
  },
  [DOCUSIGN_LOGIN_SUCCESS]: handleDocuSignLogin,
  [DOCUSIGN_GET_TEMPLATES]: (state, action) => {
    return {
      ...state,
      templates: [],
      templateLoading: true,
      embeddLoading: false
    }
  },
  [DOCUSIGN_GET_TEMPLATES_FAIL]: (state, action) => {
    return { ...state, templates: [], templateLoading: false }
  },
  [DOCUSIGN_GET_TEMPLATES_SUCCESS]: handleGetTemplates,
  [DOCUSIGN_LINKED_ENVELOPE_DOCUMENTS]: (state, action) => {
    return {
      ...state,
      documents: []
    }
  },
  [DOCUSIGN_LINKED_ENVELOPE_DOCUMENTS_FAIL]: (state, action) => {
    return { ...state, documents: [] }
  },
  [DOCUSIGN_LINKED_ENVELOPE_DOCUMENTS_SUCCESS]: handleGetEvenlopes,
  [DOCUSIGN_EMAIL_SEND]: (state, action) => {
    return { ...state, emailStatus: 'PENDING' }
  },
  [DOCUSIGN_EMAIL_SEND_FAIL]: (state, action) => {
    return { ...state, emailStatus: 'FAIL' }
  },
  [DOCUSIGN_EMAIL_SEND_SUCCESS]: (state, action) => {
    return { ...state, emailStatus: 'Success' }
  },
  [DOCUSING_GET_EMBEDDED_URL]: (state, action) => {
    return {
      ...state,
      embeddURL: '',
      embeddStatus: '',
      embeddLoading: true,
      embeddedSignStatus: ''
    }
  },
  [DOCUSING_GET_EMBEDDED_URL_FAIL]: (state, action) => {
    return {
      ...state,
      embeddURL: '',
      embeddStatus: 'FAIL',
      embeddLoading: false
    }
  },
  [DOCUSING_GET_EMBEDDED_URL_SUCCESS]: handleGetEmbeddURL,
  [DOCUSIGN_SET_EMBEDDED_STATUS]: (state, action) => {
    return { ...state, embeddedSignStatus: action.status }
  },
  [DOCUSIGN_DELETE_ENVELOPE_DOCUMENT]: (state, action) => {
    return {
      ...state
    }
  },
  [DOCUSIGN_UNLINK_ENVELOPE_DOCUMENT]: (state, action) => {
    return {
      ...state
    }
  },
  [DOCUSIGN_CLEAR_STORE]: handleClearStore
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  grantStatus: '',
  grantURL: '',
  code: '',
  isLoggedIn: false,
  documents: [],
  templates: [],
  templateLoading: false,
  emailStatus: '',
  embeddLoading: false,
  embeddURL: '',
  embeddStatus: '',
  embeddedSignStatus: ''
}

export default function docuSignReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
