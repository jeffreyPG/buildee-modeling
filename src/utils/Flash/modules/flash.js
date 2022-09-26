// ------------------------------------
// Constants
// ------------------------------------
export const FLASH_DISPLAYED = 'FLASH/DISPLAYED'
export const FLASH_HIDE = 'FLASH/HIDE'
export const FLASH_HIDDEN = 'FLASH/HIDDEN'
export const FLASH_SHOW = 'FLASH/SHOW'

let hideTO
let hiddenTO

// ------------------------------------
// Actions
// ------------------------------------
export const flashDisplayed = () => {
  return dispatch => {
    dispatch({ type: FLASH_DISPLAYED })
  }
}

export const hideFlash = () => {
  return (dispatch, getState) => {
    const currentState = getState()
    if (currentState.flash.displayed) {
      dispatch({ type: FLASH_HIDE })
      clearTimeout(hideTO)
      clearTimeout(hiddenTO)
      hiddenTO = window.setTimeout(() => dispatch({ type: FLASH_HIDDEN }), 500)
    }
  }
}

export const showFlash = (text, type = 'success', timer = false) => {
  return dispatch => {
    if (type === 'error') return
    dispatch({
      type: FLASH_SHOW,
      flash: {
        type: type,
        text: text
      }
    })

    if (timer && typeof timer === 'number') {
      clearTimeout(hideTO)
      hideTO = window.setTimeout(() => dispatch(hideFlash()), timer * 1000)
    }

    if (!timer) {
      clearTimeout(hideTO)
      hideTO = window.setTimeout(() => dispatch(hideFlash()), 2000)
    }
  }
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [FLASH_DISPLAYED]: (state, action) => {
    return { ...state, ...action.flash, displayed: true }
  },
  [FLASH_HIDE]: (state, action) => {
    return { ...state, ...action.flash, status: 'hide', displayed: false }
  },
  [FLASH_HIDDEN]: (state, action) => {
    return { ...state, text: '', type: '', status: 'hidden', displayed: false }
  },
  [FLASH_SHOW]: (state, action) => {
    return { ...state, ...action.flash, status: 'show', displayed: false }
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  text: '',
  type: '',
  status: 'hidden',
  displayed: false
}

export default function flashReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
