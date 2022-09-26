// ------------------------------------
// Constants
// ------------------------------------
export const UPLOADER_UPLOAD_IMAGE = 'TEMPLATE/TEMPLATE_UPLOAD_IMAGE'
export const UPLOADER_UPLOAD_IMAGE_SUCCESS =
  'TEMPLATE/TEMPLATE_UPLOAD_IMAGE_SUCCESS'
export const UPLOADER_UPLOAD_IMAGE_FAIL = 'TEMPLATE/TEMPLATE_UPLOAD_IMAGE_FAIL'

import ApiClient from 'utils/ApiClient'

import { showFlash as flash } from 'utils/Flash/modules/flash'

// ------------------------------------
// Actions
// ------------------------------------

export const uploadImage = image => {
  return (dispatch, getState) => {
    dispatch({ type: UPLOADER_UPLOAD_IMAGE })
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .post('/upload/image', { data: image })
        .then(response => {
          dispatch({ type: UPLOADER_UPLOAD_IMAGE_SUCCESS })
          resolve(response.fileLocation)
        })
        .catch(err => {
          dispatch({ type: UPLOADER_UPLOAD_IMAGE_FAIL })
          dispatch(flash(err || 'Issues uploading image', 'error', 5))
          reject(err)
        })
    })
  }
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [UPLOADER_UPLOAD_IMAGE]: (state, action) => {
    return { ...state }
  },
  [UPLOADER_UPLOAD_IMAGE_SUCCESS]: (state, action) => {
    return { ...state }
  },
  [UPLOADER_UPLOAD_IMAGE_FAIL]: (state, action) => {
    return { ...state }
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {}

export default function uploaderReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
