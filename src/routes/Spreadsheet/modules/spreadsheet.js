import { push } from 'react-router-redux'

import ApiClient from '../../../utils/ApiClient'
import { showFlash as flash } from '../../../utils/Flash/modules/flash'

// ------------------------------------
// Constants
// ------------------------------------
export const SPREADSHEET_TEMPLATE_CLEAR_STORE = 'TEMPLATE/TEMPLATE_CLEAR_STORE'

export const SPREADSHEET_TEMPLATE_GET = 'TEMPLATE/TEMPLATE_GET'
export const SPREADSHEET_TEMPLATE_GET_SUCCESS = 'TEMPLATE/TEMPLATE_GET_SUCCESS'
export const SPREADSHEET_TEMPLATE_GET_FAIL = 'TEMPLATE/TEMPLATE_GET_FAIL'

export const SPREADSHEET_TEMPLATE_GET_TEMPLATE = 'SPREADSHEET/TEMPLATE'
export const SPREADSHEET_TEMPLATE_GET_TEMPLATE_SUCCESS =
  'TEMPLATE/TEMPLATE_GET_TEMPLATE_SUCCESS'
export const SPREADSHEET_TEMPLATE_GET_TEMPLATE_FAIL =
  'TEMPLATE/TEMPLATE_GET_TEMPLATE_FAIL'

export const SPREADSHEET_TEMPLATE_DELETE = 'TEMPLATE/TEMPLATE_DELETE'
export const SPREADSHEET_TEMPLATE_DELETE_FAIL = 'TEMPLATE/TEMPLATE_DELETE_FAIL'
export const SPREADSHEET_TEMPLATE_DELETE_SUCCESS =
  'TEMPLATE/TEMPLATE_DELETE_SUCCESS'

export const SPREADSHEET_TEMPLATE_SAVE = 'SPREADSHEET/TEMPLATE'
export const SPREADSHEET_TEMPLATE_SAVE_FAIL = 'TEMPLATE/TEMPLATE_SAVE_FAIL'
export const SPREADSHEET_TEMPLATE_SAVE_SUCCESS =
  'TEMPLATE/TEMPLATE_SAVE_SUCCESS'

export const SPREADSHEET_TEMPLATE_UPDATE = 'TEMPLATE/TEMPLATE_UPDATE'
export const SPREADSHEET_TEMPLATE_UPDATE_SUCCESS =
  'TEMPLATE/TEMPLATE_UPDATE_SUCCESS'
export const SPREADSHEET_TEMPLATE_UPDATE_FAIL = 'TEMPLATE/TEMPLATE_UPDATE_FAIL'

export const SPREADSHEET_TEMPLATE_UPLOAD_IMAGE =
  'TEMPLATE/TEMPLATE_UPLOAD_IMAGE'

export const SPREADSHEET_TEMPLATE_DATA_CLEAR = 'TEMPLATE/TEMPLATE_DATA_CLEAR'

export const SPREADSHEET_TEMPLATE_NAME = 'TEMPLATE/TEMPLATE_NAME'

export const SPREADSHEET_TEMPLATE_STYLES = 'TEMPLATE/TEMPLATE_STYLES'

export const UPDATE_TEMPLATE_LIST = 'TEMPLATE/UPDATE_TEMPLATE_LIST'

export const UPDATE_TEMPLATE_TYPE = 'SPREADSHEET/UPDATE_TEMPLATE_TYPE'

export const types = { DRAG: 'drag' }

// ------------------------------------
// Actions
// ------------------------------------
export const updateTemplateSpreadsheetList = updatedTemplateList => {
  return (dispatch, getState) => {
    dispatch({
      type: UPDATE_TEMPLATE_LIST,
      updatedTemplates: updatedTemplateList
    })
  }
}

export const clearTemplateStore = () => {
  return (dispatch, getState) => {
    dispatch({ type: SPREADSHEET_TEMPLATE_CLEAR_STORE })
  }
}

//Get selected template from template list page
export const getSpreadSheetTemplate = id => {
  return (dispatch, getState) => {
    dispatch({ type: SPREADSHEET_TEMPLATE_GET_TEMPLATE })
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .get('/spreadsheet/template/' + id)
        .then(response => {
          dispatch({
            type: SPREADSHEET_TEMPLATE_GET_TEMPLATE_SUCCESS,
            template: response.spreadsheetTemplate
          })
          resolve()
        })
        .catch(err => {
          dispatch({ type: SPREADSHEET_TEMPLATE_GET_TEMPLATE_FAIL })
          dispatch(flash(err || 'Issues retrieving template', 'error'))
          reject(err)
        })
    })
  }
}

export const deleteTemplate = templateId => {
  return (dispatch, getState) => {
    dispatch({ type: SPREADSHEET_TEMPLATE_DELETE })
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .del('/spreadsheet/template/' + templateId)
        .then(response => {
          dispatch({ type: SPREADSHEET_TEMPLATE_DELETE_SUCCESS })
          dispatch(flash(response.message, 'success', 2))
          dispatch(push('/spreadsheet/templatelist'))
          resolve()
        })
        .catch(err => {
          dispatch({ type: SPREADSHEET_TEMPLATE_DELETE_FAIL })
          dispatch(flash(err || 'Issues deleting template', 'error', 5))
          reject(err)
        })
    })
  }
}

export const saveSpreadsheetTemplate = () => {
  return (dispatch, getState) => {
    dispatch({ type: SPREADSHEET_TEMPLATE_SAVE })
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      let template = getState().spreadsheet.templateView
      template.organizationId = getState().organization.organizationView._id
      client
        .post('/spreadsheet/template', {
          data: template
        })
        .then(response => {
          dispatch({ type: SPREADSHEET_TEMPLATE_SAVE_SUCCESS })
          dispatch(flash(response.message, 'success', 2))
          dispatch(push('/spreadsheet/templatelist'))
          resolve()
        })
        .catch(err => {
          dispatch({ type: SPREADSHEET_TEMPLATE_SAVE_FAIL })
          dispatch(
            flash(
              err ||
                'Issues saving template. Please fill all the empty/invalid fields.',
              'error',
              5
            )
          )
          reject(err)
        })
    })
  }
}

export const updateTemplate = (templateId, template) => {
  return (dispatch, getState) => {
    dispatch({ type: SPREADSHEET_TEMPLATE_UPDATE })
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .put('/spreadsheet/template/' + templateId, {
          data: template
        })
        .then(response => {
          dispatch({ type: SPREADSHEET_TEMPLATE_UPDATE_SUCCESS })
          dispatch(flash(response.message, 'success', 2))
          dispatch(push('/spreadsheet/templatelist'))
          resolve()
        })
        .catch(err => {
          dispatch({ type: SPREADSHEET_TEMPLATE_UPDATE_FAIL })
          dispatch(
            flash(
              err ||
                'Issues updating template. Please fill all the empty/invalid template widgets.',
              'error',
              5
            )
          )
          reject(err)
        })
    })
  }
}

export const uploadImage = image => {
  return (dispatch, getState) => {
    dispatch({ type: SPREADSHEET_TEMPLATE_UPLOAD_IMAGE })
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .post('/upload/image', { data: image })
        .then(response => {
          resolve(response.fileLocation)
        })
        .catch(err => {
          dispatch(flash(err || 'Issues uploading image', 'error', 5))
          reject(err)
        })
    })
  }
}

export const uploadWordFile = file => {
  return (dispatch, getState) => {
    dispatch({ type: SPREADSHEET_TEMPLATE_UPLOAD_IMAGE })
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .post('/upload/file/word', { data: file })
        .then(response => {
          resolve(response.fileLocation)
        })
        .catch(err => {
          dispatch(flash(err || 'Issues uploading file', 'error', 5))
          reject(err)
        })
    })
  }
}

export const clearData = index => ({
  type: SPREADSHEET_TEMPLATE_DATA_CLEAR
})

export const nameTemplate = name => ({
  type: SPREADSHEET_TEMPLATE_NAME,
  name: name
})

export const addStyledReport = styledDoc => ({
  type: SPREADSHEET_TEMPLATE_STYLES,
  styledDoc: 's'
})

export const updateTemplateType = templateType => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({
        type: UPDATE_TEMPLATE_TYPE,
        templateType
      })
      resolve(templateType)
    })
  }
}

// ------------------------------------
// Action Helpers
// ------------------------------------

const handleGet = (state, action) => {
  let modifiedView = [...action.templateList]
  let strippedTemplates = []
  modifiedView.map(template => {
    const { config, header, body, footer, ...strippedTemplate } = template
    strippedTemplates.push(strippedTemplate)
  })
  return Object.assign({}, state, {
    templateList: strippedTemplates
  })
}

const handleGetTemplate = (state, action) => {
  return Object.assign({}, state, {
    templateView: action.template
  })
}

const handleUpdateTemplateList = (state, action) => {
  return Object.assign({}, state, {
    templateList: action.updatedTemplates
  })
}

const handleNameTemplate = (state, action) => {
  let modifiedView = { ...state.templateView }
  modifiedView.name = action.name
  return Object.assign({}, state, {
    templateView: modifiedView
  })
}

const handleStylesTemplate = (state, action) => {
  let modifiedView = { ...state.templateView }
  modifiedView.styledDoc = action.styledDoc
  return Object.assign({}, state, {
    templateView: modifiedView
  })
}

const handleClearStore = (state, action) => {
  return Object.assign({}, state, initialState)
}

const handleUpdateTemplateType = (state, action) => {
  return Object.assign({}, state, {
    typeTemplate: action.templateType
  })
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [SPREADSHEET_TEMPLATE_GET]: (state, action) => {
    return { ...state, templateList: [] }
  },
  [SPREADSHEET_TEMPLATE_GET_FAIL]: (state, action) => {
    return { ...state }
  },
  [SPREADSHEET_TEMPLATE_GET_SUCCESS]: handleGet,

  [SPREADSHEET_TEMPLATE_CLEAR_STORE]: handleClearStore,

  [SPREADSHEET_TEMPLATE_GET_TEMPLATE]: (state, action) => {
    return { ...state }
  },
  [SPREADSHEET_TEMPLATE_GET_TEMPLATE_FAIL]: (state, action) => {
    return { ...state }
  },
  [SPREADSHEET_TEMPLATE_GET_TEMPLATE_SUCCESS]: handleGetTemplate,

  [SPREADSHEET_TEMPLATE_DELETE]: (state, action) => {
    return { ...state }
  },
  [SPREADSHEET_TEMPLATE_DELETE_SUCCESS]: (state, action) => {
    return { ...state }
  },
  [SPREADSHEET_TEMPLATE_DELETE_FAIL]: (state, action) => {
    return { ...state }
  },

  [SPREADSHEET_TEMPLATE_SAVE]: (state, action) => {
    return { ...state }
  },
  [SPREADSHEET_TEMPLATE_SAVE_SUCCESS]: (state, action) => {
    return { ...state }
  },
  [SPREADSHEET_TEMPLATE_SAVE_FAIL]: (state, action) => {
    return { ...state }
  },

  [SPREADSHEET_TEMPLATE_UPDATE]: (state, action) => {
    return { ...state }
  },
  [SPREADSHEET_TEMPLATE_UPDATE_FAIL]: (state, action) => {
    return { ...state }
  },
  [SPREADSHEET_TEMPLATE_UPDATE_SUCCESS]: (state, action) => {
    return { ...state }
  },

  [SPREADSHEET_TEMPLATE_UPLOAD_IMAGE]: (state, action) => {
    return { ...state }
  },

  [UPDATE_TEMPLATE_LIST]: handleUpdateTemplateList,

  [SPREADSHEET_TEMPLATE_NAME]: handleNameTemplate,
  [SPREADSHEET_TEMPLATE_STYLES]: handleStylesTemplate,

  [SPREADSHEET_TEMPLATE_DATA_CLEAR]: (state, action) => {
    return {
      ...state,
      templateList: [],
      templateView: {
        name: '',
        type: 'building',
        sheets: [
          {
            order: 1,
            name: '',
            datasource: '',
            metaData: '',
            year: '',
            columnHeadings: []
          }
        ],
        config: {},
        organizationId: ''
      }
    }
  },

  [UPDATE_TEMPLATE_TYPE]: handleUpdateTemplateType
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  templateList: [],
  templateView: {
    name: '',
    type: 'building',
    sheets: [
      {
        order: 1,
        name: '',
        datasource: '',
        metaData: '',
        year: '',
        columnHeadings: []
      }
    ],
    config: {
      pageNumbers: false,
      numberPosition: '',
      tableOfContents: false
    },
    organizationId: ''
  },
  typeTemplate: ''
}

export default function excelTemplateReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
export const drag = (props, draggedCol, targetCol) => {
  reOrder(props, draggedCol, targetCol)
  return { type: types.DRAG, props, draggedCol, targetCol }
}

export const reOrder = (props, draggedCol, targetCol) => {
  if (draggedCol.tabs._id !== targetCol._id) {
    let draggedColIndex = props.alltabs.findIndex(
      tabs => tabs._id === draggedCol.tabs._id
    )
    props.alltabs.splice(draggedColIndex, 1)

    let targetColIndex = props.alltabs.findIndex(
      tabs => tabs._id === targetCol._id
    )
    targetColIndex =
      targetColIndex >= draggedColIndex ? ++targetColIndex : targetColIndex
    props.alltabs.splice(targetColIndex, 0, draggedCol.tabs)

    let order = 0
    props.alltabs.map(tab => {
      tab.order = order++
    })
  }
  return props
}
