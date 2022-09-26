// ------------------------------------
// Constants
// ------------------------------------
export const TEMPLATE_CLEAR_STORE = 'TEMPLATE/TEMPLATE_CLEAR_STORE'

export const TEMPLATE_GET = 'TEMPLATE/TEMPLATE_GET'
export const TEMPLATE_GET_SUCCESS = 'TEMPLATE/TEMPLATE_GET_SUCCESS'
export const TEMPLATE_GET_FAIL = 'TEMPLATE/TEMPLATE_GET_FAIL'

export const TEMPLATE_GET_TEMPLATE = 'TEMPLATE/TEMPLATE_GET_TEMPLATE'
export const TEMPLATE_CHART_VIEWS = 'TEMPLATE/TEMPLATE_CHART_VIEWS'
export const TEMPLATE_CHART_VIEWS_SUCCESS =
  'TEMPLATE/TEMPLATE_CHART_VIEWS_SUCCESS'
export const TEMPLATE_CHART_VIEWS_FAIL = 'TEMPLATE/TEMPLATE_CHART_VIEWS_FAIL'
export const TEMPLATE_GET_TEMPLATE_SUCCESS =
  'TEMPLATE/TEMPLATE_GET_TEMPLATE_SUCCESS'
export const TEMPLATE_GET_TEMPLATE_FAIL = 'TEMPLATE/TEMPLATE_GET_TEMPLATE_FAIL'

export const TEMPLATE_DELETE = 'TEMPLATE/TEMPLATE_DELETE'
export const TEMPLATE_DELETE_FAIL = 'TEMPLATE/TEMPLATE_DELETE_FAIL'
export const TEMPLATE_DELETE_SUCCESS = 'TEMPLATE/TEMPLATE_DELETE_SUCCESS'

export const TEMPLATE_SAVE = 'TEMPLATE/TEMPLATE_SAVE'
export const TEMPLATE_SAVE_FAIL = 'TEMPLATE/TEMPLATE_SAVE_FAIL'
export const TEMPLATE_SAVE_SUCCESS = 'TEMPLATE/TEMPLATE_SAVE_SUCCESS'

export const TEMPLATE_UPDATE = 'TEMPLATE/TEMPLATE_UPDATE'
export const TEMPLATE_UPDATE_SUCCESS = 'TEMPLATE/TEMPLATE_UPDATE_SUCCESS'
export const TEMPLATE_UPDATE_FAIL = 'TEMPLATE/TEMPLATE_UPDATE_FAIL'

export const TEMPLATE_UPLOAD_IMAGE = 'TEMPLATE/TEMPLATE_UPLOAD_IMAGE'

export const TEMPLATE_DATA_CLEAR = 'TEMPLATE/TEMPLATE_DATA_CLEAR'

export const TEMPLATE_NAME = 'TEMPLATE/TEMPLATE_NAME'

export const TEMPLATE_STYLES = 'TEMPLATE/TEMPLATE_STYLES'
export const TEMPLATE_ATTACHMENTS = 'TEMPLATE/TEMPLATE_ATTACHMENTS'

export const UPDATE_TEMPLATE_LIST = 'TEMPLATE/UPDATE_TEMPLATE_LIST'

export const TEMPLATE_STATUS_UPDATE = 'TEMPLATE/TEMPLATE_STATUS_UPDATE'

export const TEMPLATE_HEADER = 'TEMPLATE/TEMPLATE_HEADER'
export const TEMPLATE_BODY = 'TEMPLATE/TEMPLATE_BODY'
export const TEMPLATE_FOOTER = 'TEMPLATE/TEMPLATE_FOOTER'
export const TEMPLATE_CONFIG = 'TEMPLATE/TEMPLATE_CONFIG'
export const TEMPLATE_UPDATE_ERROR = 'TEMPLATE/TEMPLATE_UPDATE_ERROR'

export const REPORT_EMAIL_SEND = 'REPORT_EMAIL_SEND'
export const REPORT_EMAIL_SEND_SUCCESS = 'REPORT_EMAIL_SEND_SUCCESS'
export const REPORT_EMAIL_SEND_FAIL = 'REPORT_EMAIL_SEND_FAIL'

import ApiClient from 'utils/ApiClient'

import { showFlash as flash } from 'utils/Flash/modules/flash'
import { push } from 'react-router-redux'

// ------------------------------------
// Actions
// ------------------------------------
export const updateTemplateList = updatedTemplateList => {
  return (dispatch, getState) => {
    dispatch({
      type: UPDATE_TEMPLATE_LIST,
      updatedTemplates: updatedTemplateList
    })
  }
}

export const clearTemplateStore = () => {
  return (dispatch, getState) => {
    dispatch({ type: TEMPLATE_CLEAR_STORE })
  }
}

//Get selected template from template list page
export const getOrgTemplate = (id, orgId) => {
  return (dispatch, getState) => {
    dispatch({ type: TEMPLATE_GET_TEMPLATE })
    return new Promise((resolve, reject) => {
      const organizationId = orgId
        ? orgId
        : getState().organization.organizationView._id
      const client = new ApiClient(dispatch, getState())
      client
        .get('/organization/' + organizationId + '/template/' + id)
        .then(response => {
          dispatch({
            type: TEMPLATE_GET_TEMPLATE_SUCCESS,
            template: response.template
          })
          resolve(response.template)
        })
        .catch(err => {
          dispatch({ type: TEMPLATE_GET_TEMPLATE_FAIL })
          dispatch(flash(err || 'Issues retrieving template', 'error'))
          reject(err)
        })
    })
  }
}

export const getChartReports = () => {
  return (dispatch, getState) => {
    dispatch({ type: TEMPLATE_CHART_VIEWS })
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .get('/chart')
        .then(response => {
          dispatch({
            type: TEMPLATE_CHART_VIEWS_SUCCESS,
            views: response
          })
          resolve()
        })
        .catch(err => {
          dispatch({ type: TEMPLATE_CHART_VIEWS_FAIL })
          dispatch(flash(err || 'Issues retrieving views'), 'error', 5)
          reject(err)
        })
    })
  }
}

export const deleteTemplate = templateId => {
  return (dispatch, getState) => {
    dispatch({ type: TEMPLATE_DELETE })
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      const organizationId = getState().organization.organizationView._id
      client
        .del('/organization/' + organizationId + '/template/' + templateId)
        .then(response => {
          dispatch({ type: TEMPLATE_DELETE_SUCCESS })
          dispatch(flash(response.message, 'success', 2))
          dispatch(push('/organization/' + organizationId + '/template'))
          resolve()
        })
        .catch(err => {
          dispatch({ type: TEMPLATE_DELETE_FAIL })
          dispatch(flash(err || 'Issues deleting template', 'error', 5))
          reject(err)
        })
    })
  }
}

export const saveTemplate = selectedOrgId => {
  return (dispatch, getState) => {
    dispatch({ type: TEMPLATE_SAVE })
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      const templateState = getState().template
      const template = {
        name: templateState.templateViewName,
        header: templateState.templateViewHeader,
        body: templateState.templateViewBody,
        footer: templateState.templateViewFooter,
        config: templateState.templateViewConfig,
        styledDoc: templateState.templateViewStyledDoc,
        attachments: templateState.templateViewAttachments
      }
      const organizationId = getState().organization.organizationView._id
      const manageAllOrgSelected = getState().organization.manageAllOrgSelected
      const orgId = manageAllOrgSelected ? selectedOrgId : organizationId
      client
        .post('/organization/' + orgId + '/template', {
          data: template
        })
        .then(response => {
          dispatch({ type: TEMPLATE_SAVE_SUCCESS })
          dispatch(flash(response.message, 'success', 2))
          dispatch(push('/organization/' + organizationId + '/template'))
          resolve()
        })
        .catch(err => {
          dispatch({ type: TEMPLATE_SAVE_FAIL })
          dispatch(
            flash(
              'Issues saving template. Please fill out empty template widgets.',
              'error',
              5
            )
          )
          reject(err)
        })
    })
  }
}

export const updateTemplate = templateId => {
  return (dispatch, getState) => {
    dispatch({ type: TEMPLATE_UPDATE })
    return new Promise((resolve, reject) => {
      const templateState = getState().template
      const template = {
        _id: templateId,
        name: templateState.templateViewName,
        header: templateState.templateViewHeader,
        body: templateState.templateViewBody,
        footer: templateState.templateViewFooter,
        config: templateState.templateViewConfig,
        styledDoc:
          templateState.templateViewStyledDoc || 'default-style-template.docx',
        attachments: templateState.templateViewAttachments || []
      }
      const client = new ApiClient(dispatch, getState())
      const organizationId = getState().organization.organizationView._id
      client
        .put('/organization/' + organizationId + '/template/' + templateId, {
          data: template
        })
        .then(response => {
          dispatch({ type: TEMPLATE_UPDATE_SUCCESS })
          dispatch(flash(response.message, 'success', 2))
          dispatch(push('/organization/' + organizationId + '/template'))
          resolve()
        })
        .catch(err => {
          console.log('errr', err)
          dispatch({ type: TEMPLATE_UPDATE_FAIL })
          dispatch(
            flash(
              'Issues updating template. Please fill out empty template widgets.',
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
    dispatch({ type: TEMPLATE_UPLOAD_IMAGE })
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
export const uploadPdfFile = file => {
  return (dispatch, getState) => {
    dispatch({ type: TEMPLATE_UPLOAD_IMAGE })
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .post('/upload/file/pdf', { data: file })
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

export const sendReportTemplateEmail = (subject, message, sendTo, cc) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({ type: REPORT_EMAIL_SEND })
      const client = new ApiClient(dispatch, getState())
      const userId = getState().login.user._id
      if (!userId) reject()
      const data = {
        subject,
        message,
        sendTo,
        cc
      }
      client
        .post(`/report/user/${userId}/sendEmail`, {
          data: data
        })
        .then(response => {
          if (response.status == 'Success') {
            dispatch({ type: REPORT_EMAIL_SEND_SUCCESS })
            dispatch(flash(response.message, 'success', 2))
          } else {
            dispatch({ type: REPORT_EMAIL_SEND_FAIL })
          }
          resolve(response)
        })
        .catch(err => {
          dispatch({ type: REPORT_EMAIL_SEND_FAIL })
          dispatch(flash(err || 'Issues sending report template email'))
          reject(err)
        })
    })
  }
}

export const uploadWordFile = file => {
  return (dispatch, getState) => {
    dispatch({ type: TEMPLATE_UPLOAD_IMAGE })
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
  type: TEMPLATE_DATA_CLEAR
})

export const nameTemplate = name => ({
  type: TEMPLATE_NAME,
  name: name
})

export const addStyledReport = styledDoc => ({
  type: TEMPLATE_STYLES,
  styledDoc: styledDoc
})
/* template for Attachments added*/
export const addAttachments = attachments => ({
  type: TEMPLATE_ATTACHMENTS,
  attachments: attachments
})

export const templateUpdated = bool => ({
  type: TEMPLATE_STATUS_UPDATE,
  bool: bool
})

export const headerTemplate = header => ({
  type: TEMPLATE_HEADER,
  header: header
})

export const bodyTemplate = body => ({
  type: TEMPLATE_BODY,
  body: body
})

export const footerTemplate = footer => ({
  type: TEMPLATE_FOOTER,
  footer: footer
})

export const configTemplate = config => ({
  type: TEMPLATE_CONFIG,
  config: config
})

export const templateUpdateError = bool => ({
  type: TEMPLATE_UPDATE_ERROR,
  bool: bool
})

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
    templateViewName: action.template.name,
    templateViewHeader: action.template.header,
    templateViewBody: action.template.body,
    templateViewFooter: action.template.footer,
    templateViewConfig: action.template.config,
    templateViewStyledDoc:
      action.template.styledDoc || 'default-style-template.docx',
    templateViewAttachments: action.template.attachments || []
  })
}

const handleUpdateTemplateList = (state, action) => {
  return Object.assign({}, state, {
    templateList: action.updatedTemplates
  })
}

const handleNameTemplate = (state, action) => {
  return Object.assign({}, state, {
    templateViewName: action.name
  })
}

const handleHeaderTemplate = (state, action) => {
  return Object.assign({}, state, {
    templateViewHeader: action.header
  })
}

const handleBodyTemplate = (state, action) => {
  return Object.assign({}, state, {
    templateViewBody: action.body
  })
}

const handleFooterTemplate = (state, action) => {
  return Object.assign({}, state, {
    templateViewFooter: action.footer
  })
}

const handleConfigTemplate = (state, action) => {
  return Object.assign({}, state, {
    templateViewConfig: action.config
  })
}

const handleStylesTemplate = (state, action) => {
  return Object.assign({}, state, {
    templateViewStyledDoc: action.styledDoc
  })
}

const handleAttachments = (state, action) => {
  return Object.assign({}, state, {
    templateViewAttachments: action.attachments
  })
}
const handleClearStore = (state, action) => {
  return Object.assign({}, state, initialState)
}
const handleViews = (state, action) => {
  return Object.assign({}, state, {
    views: action.views.views
  })
}

const handleTemplateStatusUpdated = (state, action) => {
  return Object.assign({}, state, {
    dirty: action.bool
  })
}

const handleTemplateUpdateError = (state, action) => {
  let inValid = false
  if (action.bool === undefined) {
    let body = state.templateViewBody || []
    for (let i = 0; i < body.length; i++) {
      let widget = body[i]
      if (
        widget &&
        widget.metaData &&
        (widget.type === 'div' ||
          widget.type === 'ordered-list' ||
          widget.type === 'table' ||
          widget.type === 'chart')
      ) {
        let {
          yearRange,
          selectedStartMonth,
          selectedStartYear,
          selectedEndMonth,
          selectedEndYear
        } = widget.metaData
        inValid =
          yearRange === 'Custom' &&
          new Date('1' + selectedStartMonth + selectedStartYear) <=
            new Date('1' + selectedEndMonth + (selectedEndYear - 3))
            ? true
            : inValid
      }
      if (widget.type === 'chart') {
        if (!widget.layoutOption) {
          inValid = true
        }
        const options = widget.options || []
        if (options.constructor === Object && Array.isArray(options)) {
          let flag = options.every(option => (option.fields || []).length > 0)
          if (!flag) inValid = true
        }
      }
    }
  } else {
    inValid = action.bool
  }

  return Object.assign({}, state, {
    templateViewError: inValid,
    dirty: inValid
  })
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [TEMPLATE_GET]: (state, action) => {
    return { ...state, templateList: [] }
  },
  [TEMPLATE_GET_FAIL]: (state, action) => {
    return { ...state }
  },
  [TEMPLATE_GET_SUCCESS]: handleGet,

  [TEMPLATE_CLEAR_STORE]: handleClearStore,

  [TEMPLATE_GET_TEMPLATE]: (state, action) => {
    return { ...state }
  },
  [TEMPLATE_CHART_VIEWS]: (state, action) => {
    return { ...state }
  },

  [TEMPLATE_CHART_VIEWS_SUCCESS]: handleViews,

  [TEMPLATE_GET_TEMPLATE_FAIL]: (state, action) => {
    return { ...state }
  },
  [TEMPLATE_GET_TEMPLATE_SUCCESS]: handleGetTemplate,

  [TEMPLATE_DELETE]: (state, action) => {
    return { ...state }
  },
  [TEMPLATE_DELETE_SUCCESS]: (state, action) => {
    return { ...state }
  },
  [TEMPLATE_DELETE_FAIL]: (state, action) => {
    return { ...state }
  },

  [TEMPLATE_SAVE]: (state, action) => {
    return { ...state }
  },
  [TEMPLATE_SAVE_SUCCESS]: (state, action) => {
    return { ...state }
  },
  [TEMPLATE_SAVE_FAIL]: (state, action) => {
    return { ...state }
  },

  [TEMPLATE_UPDATE]: (state, action) => {
    return { ...state }
  },
  [TEMPLATE_UPDATE_FAIL]: (state, action) => {
    return { ...state }
  },
  [TEMPLATE_UPDATE_SUCCESS]: (state, action) => {
    return { ...state }
  },

  [TEMPLATE_UPLOAD_IMAGE]: (state, action) => {
    return { ...state }
  },

  [UPDATE_TEMPLATE_LIST]: handleUpdateTemplateList,

  [TEMPLATE_NAME]: handleNameTemplate,
  [TEMPLATE_STYLES]: handleStylesTemplate,
  [TEMPLATE_STATUS_UPDATE]: handleTemplateStatusUpdated,
  [TEMPLATE_UPDATE_ERROR]: handleTemplateUpdateError,
  [TEMPLATE_HEADER]: handleHeaderTemplate,
  [TEMPLATE_BODY]: handleBodyTemplate,
  [TEMPLATE_FOOTER]: handleFooterTemplate,
  [TEMPLATE_CONFIG]: handleConfigTemplate,
  [TEMPLATE_ATTACHMENTS]: handleAttachments,
  [TEMPLATE_DATA_CLEAR]: (state, action) => {
    return {
      ...state,
      templateList: [],
      dirty: false,
      templateViewName: '',
      templateViewHeader: {
        image: '',
        text: '',
        divider: null,
        position: null
      },
      templateViewBody: [],
      templateViewFooter: {
        image: '',
        text: '',
        divider: null,
        position: null
      },
      templateViewStyledDoc: 'default-style-template.docx',
      templateViewAttachments: [],
      templateViewConfig: {
        tableOfContents: false
      },
      templateViewError: false
    }
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  templateList: [],
  templateViewName: '',
  templateViewHeader: {
    image: '',
    text: '',
    dividerConfig: null,
    position: null
  },
  templateViewBody: [],
  templateViewFooter: {
    image: '',
    text: '',
    dividerConfig: null,
    position: null
  },
  templateViewStyledDoc: '',
  templateViewAttachments: [],
  templateViewConfig: {
    tableOfContents: false
  },
  dirty: false,
  templateViewError: false
}
export default function templateReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
