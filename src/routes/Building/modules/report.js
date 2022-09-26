import ApiClient from 'utils/ApiClient'
import { showFlash as flash } from 'utils/Flash/modules/flash'

// ------------------------------------
// Constants
// ------------------------------------

export const BUILDING_REPORT = 'BUILDING/BUILDING_REPORT'
export const BUILDING_REPORT_SUCCESS = 'BUILDING/BUILDING_REPORT_SUCCESS'
export const BUILDING_REPORT_FAIL = 'BUILDING/BUILDING_REPORT_FAIL'

// ------------------------------------
// Actions
// ------------------------------------

export const getReport = ({ templateId, startDate, endDate, proposalId }) => {
  return async (dispatch, getState) => {
    console.log('DISPATCH')
    const { login, building } = getState()
    const userId = login && login.user && login.user._id
    const buildingId =
      building && building.buildingView && building.buildingView._id
    dispatch({ type: BUILDING_REPORT })
    const client = new ApiClient(dispatch, getState())
    console.log('SEND')
    let url = `/report/user/${userId}/building/${buildingId}/template/${templateId}/enduse`
    if (startDate && endDate) {
      url += '?customStartDate=' + startDate + '&customEndDate=' + endDate
    }
    if (proposalId) {
      url += '&proposalId=' + proposalId
    }
    await client.post(url)
    console.log('HEY')
    dispatch({
      type: BUILDING_REPORT_SUCCESS
    })
  }
}

export const actions = {
  getReport
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [BUILDING_REPORT]: (state, action) => {
    return { ...state, isLoading: true }
  },
  [BUILDING_REPORT_SUCCESS]: (state, action) => {
    return { ...state, isLoading: false }
  },
  [BUILDING_REPORT_FAIL]: (state, action) => {
    return { ...state, isLoading: false }
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  isLoading: false
}
export default function reportReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
