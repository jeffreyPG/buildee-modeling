// ------------------------------------
// Constants
// ------------------------------------
export const LIBRARY_GET_MEASURES = 'LIBRARY/LIBRARY_GET_MEASURES'

import ApiClient from 'utils/ApiClient'
import { showFlash as flash } from 'utils/Flash/modules/flash'

// ------------------------------------
// Actions
// ------------------------------------
export const getMeasures = () => {
  return (dispatch, getState) => {
    dispatch({ type: LIBRARY_GET_MEASURES })
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .get('/measure')
        .then(response => {
          resolve(response.measures)
        })
        .catch(err => {
          dispatch(flash(err || 'Issues retrieving building measures', 'error'))
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
  [LIBRARY_GET_MEASURES]: (state, action) => {
    return { ...state }
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  library: []
}
export default function libraryReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
