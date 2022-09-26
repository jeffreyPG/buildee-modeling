// ------------------------------------
// Constants
// ------------------------------------
import ApiClient from 'utils/ApiClient'
import { showFlash as flash } from 'utils/Flash/modules/flash'
// import { updateUser } from 'routes/Login/modules/login'
import { updateUser } from 'routes/Login/modules/login'
import { uploadImage } from 'routes/Template/modules/template'
import { push } from 'react-router-redux'
import { getOrganizationBuildings } from 'routes/Organization/modules/organization'
import {
  UPDATE_PORTFOLIO_TAB,
  UPDATE_PORTFOLIO_RELOAD
} from 'routes/Portfolio/modules/portfolio'
import { detectMobileTouch } from 'utils/Utils'

export const BUILDING_START_PROJECT = 'BUILDING/BUILDING_START_PROJECT'

export const BUILDING_CLEAR_STORE = 'BUILDING/BUILDING_CLEAR_STORE'

export const BUILDING_GET = 'BUILDING/BUILDING_GET'
export const BUILDING_GET_SUCCESS = 'BUILDING/BUILDING_GET_SUCCESS'
export const BUILDING_GET_FAIL = 'BUILDING/BUILDING_GET_FAIL'

export const BUILDING_EDIT = 'BUILDING/BUILDING_EDIT'
export const BUILDING_EDIT_SUCCESS = 'BUILDING/BUILDING_EDIT_SUCCESS'
export const BUILDING_EDIT_FAIL = 'BUILDING/BUILDING_EDIT_FAIL'

export const BUILDING_GET_BUILDING = 'BUILDING/BUILDING_GET_BUILDING'
export const BUILDING_GET_BUILDING_SUCCESS =
  'BUILDING/BUILDING_GET_BUILDING_SUCCESS'
export const BUILDING_GET_BUILDING_FAIL = 'BUILDING/BUILDING_GET_BUILDING_FAIL'

export const BUILDING_GET_BENCHMARK = 'BUILDING/BUILDING_GET_BENCHMARK'
export const BUILDING_GET_BENCHMARK_SUCCESS =
  'BUILDING/BUILDING_GET_BENCHMARK_SUCCESS'
export const BUILDING_GET_BENCHMARK_FAIL =
  'BUILDING/BUILDING_GET_BENCHMARK_FAIL'

export const BUILDING_GET_PROJECTS = 'BUILDING/BUILDING_GET_PROJECTS'
export const BUILDING_GET_PROJECTS_SUCCESS =
  'BUILDING/BUILDING_GET_PROJECTS_SUCCESS'
export const BUILDING_GET_PROJECTS_FAIL = 'BUILDING/BUILDING_GET_PROJECTS_FAIL'

export const BUILDING_EVALUATE_PROJECTS = 'BUILDING/BUILDING_EVALUATE_PROJECTS'
export const BUILDING_EVALUATE_PROJECTS_FAIL =
  'BUILDING/BUILDING_EVALUATE_PROJECTS_FAIL'

export const BUILDING_ADD_PROJECT_BULK = 'BUILDING/BUILDING_ADD_PROJECT_BULK'
export const BUILDING_ADD_PROJECT_BULK_SUCCESS =
  'BUILDING/BUILDING_ADD_PROJECT_BULK_SUCCESS'
export const BUILDING_ADD_PROJECT_BULK_FAIL =
  'BUILDING/BUILDING_ADD_PROJECT_BULK_FAIL'

export const BUILDING_EVALUATE_PROJECT_BULK =
  'BUILDING/BUILDING_EVALUATE_PROJECT_BULK'

export const BUILDING_GET_EA_IMAGE_URLS = 'BUILDING/BUILDING_GET_EA_IMAGE_URLS'

export const BUILDING_CREATE = 'BUILDING/BUILDING_CREATE'
export const BUILDING_CREATE_SUCCESS = 'BUILDING/BUILDING_CREATE_SUCCESS'
export const BUILDING_CREATE_FAIL = 'BUILDING/BUILDING_CREATE_FAIL'

export const BUILDING_CREATE_SAMPLE = 'BUILDING/BUILDING_CREATE_SAMPLE'
export const BUILDING_CREATE_SAMPLE_SUCCESS =
  'BUILDING/BUILDING_CREATE_SAMPLE_SUCCESS'
export const BUILDING_CREATE_SAMPLE_FAIL =
  'BUILDING/BUILDING_CREATE_SAMPLE_FAIL'

export const BUILDING_DELETE = 'BUILDING/BUILDING_DELETE'
export const BUILDING_DELETE_SUCCESS = 'BUILDING/BUILDING_DELETE_SUCCESS'
export const BUILDING_DELETE_FAIL = 'BUILDING/BUILDING_DELETE_FAIL'

export const BUILDING_ARCHIVE = 'BUILDING/BUILDING_ARCHIVE'
export const BUILDING_ARCHIVE_SUCCESS = 'BUILDING/BUILDING_ARCHIVE_SUCCESS'
export const BUILDING_ARCHIVE_FAIL = 'BUILDING/BUILDING_ARCHIVE_FAIL'

export const BUILDING_DELETE_PROJECT = 'BUILDING/BUILDING_DELETE_PROJECT'
export const BUILDING_DELETE_PROJECT_SUCCESS =
  'BUILDING/BUILDING_DELETE_PROJECT_SUCCESS'
export const BUILDING_DELETE_PROJECT_FAIL =
  'BUILDING/BUILDING_DELETE_PROJECT_FAIL'

export const BUILDING_CREATE_UTILITIES = 'BUILDING/BUILDING_CREATE_UTILITIES'
export const BUILDING_CREATE_UTILITIES_SUCCESS =
  'BUILDING/BUILDING_CREATE_UTILITIES_SUCCESS'
export const BUILDING_CREATE_UTILITIES_FAIL =
  'BUILDING/BUILDING_CREATE_UTILITIES_FAIL'

export const BUILDING_EDIT_UTILITIES = 'BUILDING/BUILDING_EDIT_UTILITIES'
export const BUILDING_EDIT_UTILITIES_SUCCESS =
  'BUILDING/BUILDING_EDIT_UTILITIES_SUCCESS'

export const BUILDING_GET_UTILITIES = 'BUILDING/BUILDING_GET_UTILITIES'
export const BUILDING_GET_UTILITIES_FAIL =
  'BUILDING/BUILDING_GET_UTILITIES_FAIL'

export const BUILDING_SET_UTILITIES_DATE_RANGE =
  'BUILDING/BUILDING_SET_UTILITIES_DATE_RANGE'

export const BUILDING_CREATE_ASSET_SUCCESS =
  'BUILDING/BUILDING_CREATE_ASSET_SUCCESS'
export const BUILDING_UPDATE_ASSET_SUCCESS =
  'BUILDING/BUILDING_UPDATE_ASSET_SUCCESS'
export const BUILDING_DELETE_ASSET_SUCCESS =
  'BUILDING/BUILDING_DELETE_ASSET_SUCCESS'

export const BUILDING_DATA_SET = 'BUILDING/BUILDING_DATA_SET'
export const BUILDING_DATA_CLEAR = 'BUILDING/BUILDING_DATA_CLEAR'

export const UPDATE_BUILDING_LIST = 'BUILDING/UPDATE_BUILDING_LIST'
export const UPDATE_XML_BUILDING_LIST = 'BUILDING/UPDATE_XML_BUILDING_LIST'

export const EA_GET_BUILDINGS = 'EA/EA_GET_BUILDINGS_START'
export const EA_GET_BUILDINGS_FAIL = 'EA/EA_GET_BUILDINGS_FAIL'
export const EA_GET_BUILDINGS_SUCCESS = 'EA/EA_GET_BUILDINGS_SUCCESS'

export const EA_GET_MEASURES = 'EA/EA_GET_MEASURES_START'
export const EA_GET_MEASURES_FAIL = 'EA/EA_GET_MEASURES_FAIL'
export const EA_GET_MEASURES_SUCCESS = 'EA/EA_GET_MEASURES_SUCCESS'

export const EA_GET_COMPONENT = 'EA/EA_GET_COMPONENT'
export const EA_GET_COMPONENT_SUCCESS = 'EA/EA_GET_COMPONENT_SUCCESS'

export const EA_GET_AUDITS = 'EA/EA_GET_AUDITS_START'
export const EA_GET_AUDITS_FAIL = 'EA/EA_GET_AUDITS_FAIL'
export const EA_GET_AUDITS_SUCCESS = 'EA/EA_GET_AUDITS_SUCCESS'

export const EA_CHANGE_AUDIT = 'EA/EA_CHANGE_AUDIT_START'
export const EA_CHANGE_AUDIT_FAIL = 'EA/EA_CHANGE_AUDIT_FAIL'
export const EA_CHANGE_AUDIT_SUCCESS = 'EA/EA_CHANGE_AUDIT_SUCCESS'

export const EA_CREATE_BUILDINGS = 'EA/EA_CREATE_BUILDINGS'
export const EA_GOT_BUILDINGS = 'EA/EA_GOT_BUILDINGS'
export const UPDATE_BUILDING_TAB = 'BUILDING_TAB'
export const UPDATE_BUILDING_VIEW_MODE = 'BUILDING_VIEW_MODE'
export const UPDATE_PROJECTVIEW_TAB = 'PROJECTVIEW_TAB'
export const UPDATE_BUILDING_LIST_STATUS = 'BUILDING_LIST_STATUS'

export const BUILDING_GET_PROJECTPACKAGES =
  'BUILDING/BUILDING_GET_PROJECTPACKAGES'
export const BUILDING_GET_PROJECTPACKAGES_SUCCESS =
  'BUILDING/BUILDING_GET_PROJECTPACKAGES_SUCCESS'
export const BUILDING_GET_PROJECTPACKAGES_FAIL =
  'BUILDING/BUILDING_GET_PROJECTPACKAGES_FAIL'

export const BUILDING_GET_PROJECTS_BY_IDS =
  'BUILDING/BUILDING_GET_PROJECTS_BY_IDS'
export const BUILDING_GET_PROJECTS_BY_IDS_SUCCESS =
  'BUILDING/BUILDING_GET_PROJECTS_BY_IDS_SUCCESS'
export const BUILDING_GET_PROJECTS_BY_IDS_FAIL =
  'BUILDING/BUILDING_GET_PROJECTS_BY_IDS_FAIL'

export const BUILDING_GET_PROPOSALS = 'BUILDING/BUILDING_GET_PROPOSALS'
export const BUILDING_GET_PROPOSALS_SUCCESS =
  'BUILDING/BUILDING_GET_PROPOSALS_SUCCESS'
export const BUILDING_GET_PROPOSALS_FAIL =
  'BUILDING/BUILDING_GET_PROPOSALS_FAIL'
// ------------------------------------
// Actions
// ------------------------------------

/*
  ********
  Buildings
  ********
*/

export const clearInfo = () => ({ type: BUILDING_DATA_CLEAR })

export const updateBuildingList = updatedBuildingList => {
  return (dispatch, getState) => {
    dispatch({
      type: UPDATE_BUILDING_LIST,
      updatedBuildings: updatedBuildingList
    })
  }
}

export const updateXMLBuildingList = updatedBuildingList => {
  return (dispatch, getState) => {
    dispatch({
      type: UPDATE_XML_BUILDING_LIST,
      updatedBuildings: updatedBuildingList
    })
  }
}

export const getBuildingIdentifiers = type => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      const orgId = getState().organization.organizationView._id
      client
        .get('/organization/' + orgId + '/building')
        .then(response => {
          resolve(response.buildings)
        })
        .catch(err => {
          dispatch(flash(err || 'Issues retreiving building tags', 'error', 5))
          reject(err)
        })
    })
  }
}

export const getUserById = userId => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      if (userId) {
        client
          .get('/userById', { params: { userId: userId } })
          .then(response => {
            resolve(response.user)
          })
          .catch(err => {
            dispatch(
              flash(err || 'Issues retreiving building author', 'error', 5)
            )
            reject(err)
          })
      }
    })
  }
}

export const clearBuildingStore = () => {
  return (dispatch, getState) => {
    dispatch({ type: BUILDING_CLEAR_STORE })
  }
}

export const editBuilding = (payload, id, displayMessage) => (
  dispatch,
  getState
) => {
  dispatch({ type: BUILDING_EDIT })
  return new Promise((resolve, reject) => {
    const client = new ApiClient(dispatch, getState())
    const organizationId = getState().organization.organizationView._id
    client
      .put('/organization/' + organizationId + '/building/' + id, {
        data: payload
      })
      .then(response => {
        dispatch({
          type: BUILDING_EDIT_SUCCESS,
          buildingData: response.building
        })
        if (displayMessage) {
          dispatch(flash(response.message, 'success', 2))
        }
        resolve()
      })
      .catch(err => {
        dispatch({ type: BUILDING_EDIT_FAIL })
        dispatch(flash(err || 'Issues editing building', 'error', 5))
        reject(err)
      })
  })
}

// Get selected building from building list page
export const getBuilding = id => {
  return (dispatch, getState) => {
    dispatch({ type: BUILDING_GET_BUILDING })
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      var organizationId = getState().organization.organizationView._id
      client
        .get('/organization/' + organizationId + '/building/' + id)
        .then(response => {
          dispatch({
            type: BUILDING_GET_BUILDING_SUCCESS,
            building: response.building
          })
          resolve(response.building)
        })
        .catch(err => {
          dispatch({ type: BUILDING_GET_BUILDING_FAIL })
          if (typeof err != 'object')
            dispatch(flash(err || 'Issues retrieving building', 'error'))
          else dispatch(flash('Issues retrieving building', 'error'))
          reject(err)
        })
    })
  }
}

// Delete building
export const deleteBuilding = buildingId => {
  return (dispatch, getState) => {
    dispatch({ type: BUILDING_DELETE })
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      var organizationId = getState().organization.organizationView._id
      client
        .del('/organization/' + organizationId + '/building/' + buildingId)
        .then(response => {
          dispatch({ type: BUILDING_DELETE_SUCCESS })
          dispatch(flash(response.message, 'success', 2))
          dispatch(getOrganizationBuildings(organizationId))
          resolve()
        })
        .catch(err => {
          dispatch({ type: BUILDING_DELETE_FAIL })
          dispatch(flash(err || 'Issues deleting building', 'error', 5))
          reject(err)
        })
    })
  }
}

// Archive building
export const archiveBuilding = (buildingId, payload) => {
  return (dispatch, getState) => {
    dispatch({ type: BUILDING_ARCHIVE })
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      const organizationId = getState().organization.organizationView._id
      client
        .put('/organization/' + organizationId + '/building/' + buildingId, {
          data: payload,
          params: {
            message: payload.archived
              ? 'Archived Building'
              : 'Restored Building'
          }
        })
        .then(response => {
          dispatch({
            type: BUILDING_ARCHIVE_SUCCESS,
            buildingData: response.building
          })
          dispatch(flash(response.message, 'success', 2))
          dispatch(getOrganizationBuildings(organizationId))
          resolve()
        })
        .catch(err => {
          dispatch({ type: BUILDING_ARCHIVE_FAIL })
          dispatch(flash(err || 'Issues archiving building', 'error', 5))
          reject(err)
        })
    })
  }
}

// Get building benchmark
export const getBenchmark = buildingId => {
  if (buildingId) {
    return (dispatch, getState) => {
      dispatch({ type: BUILDING_GET_BENCHMARK })
      return new Promise((resolve, reject) => {
        const client = new ApiClient(dispatch, getState())
        client
          .get('/building/' + buildingId + '/fullbenchmark')
          .then(response => {
            resolve(response.benchmark)
          })
          .catch(err => {
            dispatch({ type: BUILDING_GET_BENCHMARK_FAIL })
            dispatch(
              flash(err || 'Issues retrieving building benchmark', 'error')
            )
            reject(err)
          })
      })
    }
  }
}

// Get building benchmark
export const getBenchmarkUtil = (buildingId, utils, totalCost) => {
  if (buildingId) {
    return (dispatch, getState) => {
      dispatch({ type: BUILDING_GET_BENCHMARK })
      return new Promise((resolve, reject) => {
        const client = new ApiClient(dispatch, getState())
        client
          .get('/building/' + buildingId + '/fullbenchmarkUtil', {
            params: { utils: utils, totalCost: totalCost }
          })
          .then(response => {
            resolve(response.benchmark)
          })
          .catch(err => {
            dispatch({ type: BUILDING_GET_BENCHMARK_FAIL })
            dispatch(
              flash(err || 'Issues retrieving building benchmark', 'error')
            )
            reject(err)
          })
      })
    }
  }
}

// Get building enduse
export const getEndUse = buildingId => {
  if (buildingId) {
    return (dispatch, getState) => {
      dispatch({ type: BUILDING_GET_BENCHMARK })
      return new Promise((resolve, reject) => {
        const client = new ApiClient(dispatch, getState())
        client
          .get('/building/' + buildingId + '/enduse')
          .then(response => {
            resolve(response.endUse)
          })
          .catch(err => {
            dispatch({ type: BUILDING_GET_BENCHMARK_FAIL })
            dispatch(flash(err || 'Issues retrieving enduse', 'error'))
            resolve(null)
          })
      })
    }
  }
}

// Get building enduse with utilities
export const getEndUseUtil = (buildingId, utils, totalCost, year) => {
  if (buildingId && utils) {
    return (dispatch, getState) => {
      dispatch({ type: BUILDING_GET_BENCHMARK })
      return new Promise((resolve, reject) => {
        const client = new ApiClient(dispatch, getState())
        client
          .get('/building/' + buildingId + '/enduseUtil', {
            params: { utils, totalCost, year }
          })
          .then(response => {
            resolve(response.endUse)
          })
          .catch(err => {
            dispatch({ type: BUILDING_GET_BENCHMARK_FAIL })
            dispatch(flash(err || 'Issues retrieving enduse', 'error'))
            resolve(null)
          })
      })
    }
  }
}

export const create = (payload, selectedOrgId) => {
  return (dispatch, getState) => {
    dispatch({ type: BUILDING_CREATE })
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      const orgId = getState().organization.manageAllOrgSelected
        ? selectedOrgId
        : getState().organization.organizationView._id
      client
        .post('/organization/' + orgId + '/building', { data: payload })
        .then(response => {
          dispatch({
            type: BUILDING_CREATE_SUCCESS,
            buildingData: response.building
          })
          dispatch(flash(response.message, 'success', 2))
          dispatch(push('/building/' + response.building._id))
          resolve()
        })
        .catch(err => {
          dispatch({ type: BUILDING_CREATE_FAIL })
          dispatch(flash(err || 'Issues creating sample building', 'error', 5))
          reject(err)
        })
    })
  }
}

export const createSampleBuilding = () => {
  return (dispatch, getState) => {
    dispatch({ type: BUILDING_CREATE_SAMPLE })
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      const orgId = getState().organization.organizationView._id
      client
        .post('/organization/' + orgId + '/sampleBuilding')
        .then(response => {
          dispatch({
            type: BUILDING_CREATE_SUCCESS,
            buildingData: response.building
          })
          dispatch(flash(response.message, 'success', 2))
          dispatch(push('/building/' + response.building._id))
          dispatch({
            type: UPDATE_PORTFOLIO_RELOAD,
            reload: true
          })
          resolve()
        })
        .catch(err => {
          dispatch({ type: BUILDING_CREATE_SAMPLE_FAIL })
          dispatch(flash(err || 'Issues creating sample building', 'error', 5))
          reject(err)
        })
    })
  }
}

export const getOrganizationName = () => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      const orgId = getState().organization.organizationView._id
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

// Get building enduse
export const allBuildingsLink = (flag = true) => {
  return (dispatch, getState) => {
    const mode = getState().building.buildingViewMode || 'BuildingList'
    const currentBuildingTab = getState().building.selectedView || {
      name: 'Dashboard'
    }
    let isOnProjectTab = currentBuildingTab.name === 'Projects'
    if (mode !== 'BuildingList' && flag && detectMobileTouch() != 'mobile') {
      dispatch({
        type: UPDATE_PORTFOLIO_TAB,
        selectedView: { name: 'Buildings', active: true }
      })
      dispatch(
        push(
          '/organization/' +
            getState().organization.organizationView._id +
            '/' +
            mode
        )
      )
      // if (isOnProjectTab) {
      //   dispatch(
      //     push(
      //       '/organization/' +
      //         getState().organization.organizationView._id +
      //         '/' +
      //         mode
      //     )
      //   )
      // } else {
      //   dispatch(
      //     push(
      //       '/organization/' +
      //         getState().organization.organizationView._id +
      //         '/portfolio/building'
      //     )
      //   )
      // }
    } else
      dispatch(
        push(
          '/organization/' +
            getState().organization.organizationView._id +
            '/building'
        )
      )
  }
}

/*
  ********
  Projects
  ********
*/

export const getProjectsAndMeasures = buildingId => {
  return (dispatch, getState) => {
    dispatch({ type: BUILDING_GET_PROJECTS })
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      let id = buildingId || getState().building.buildingView._id
      let buildingView = getState().building.buildingView || {}
      let measures = (buildingView && buildingView.measures) || []
      if (!id) reject()
      client
        .get('/project', {
          params: {
            buildingId: id,
            loadedMeasure: measures.length ? true : false
          }
        })
        .then(response => {
          dispatch({
            type: BUILDING_GET_PROJECTS_SUCCESS,
            measures: response.measures,
            projects: response.projects,
            measurePackages: response.measurePackages
          })
          resolve()
        })
        .catch(err => {
          dispatch({ type: BUILDING_GET_PROJECTS_FAIL })
          dispatch(flash(err || 'Issues retrieving building measures', 'error'))
          reject(err)
        })
    })
  }
}

export const getProjectPackages = buildingId => {
  return (dispatch, getState) => {
    dispatch({ type: BUILDING_GET_PROJECTPACKAGES })
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      let id = buildingId || getState().building.buildingView._id
      if (!id) reject('buildingId is undefined')
      client
        .get(`/building/${id}/projectPackage`)
        .then(response => {
          dispatch({
            type: BUILDING_GET_PROJECTPACKAGES_SUCCESS,
            packages: response.projectPackages
          })
          resolve(response.projectPackages)
        })
        .catch(err => {
          dispatch({ type: BUILDING_GET_PROJECTPACKAGES_FAIL })
          dispatch(flash(err || 'Issues retrieving building measures', 'error'))
          reject(err)
        })
    })
  }
}

export const reRunProjectsByIds = (buildingId, ids, rates) => {
  return (dispatch, getState) => {
    dispatch({ type: BUILDING_GET_PROJECTS_BY_IDS })
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      let id = buildingId || getState().building.buildingView._id
      if (!id) reject()
      client
        .post(`/building/${id}/reRunProjects`, { data: { ids, rates } })
        .then(response => {
          resolve(response.projects)
        })
        .catch(err => {
          reject(err)
        })
    })
  }
}

export const startProject = projectType => ({
  type: BUILDING_START_PROJECT,
  projectType: projectType
})

export const uploadProjectImage = image => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch(uploadImage(image)).then(response => {
        resolve(response)
      })
    })
  }
}

export const addIncompleteProject = ({
  action,
  payload,
  buildingId,
  project,
  type
}) => {
  if (action === 'add') {
    payload.createNewProject = true
  }
  return (dispatch, getState) => {
    if (type === 'project' || action === 'edit') {
      return new Promise((resolve, reject) => {
        const client = new ApiClient(dispatch, getState())
        client
          .put('/building/' + buildingId + '/project/' + project._id, {
            data: payload
          })
          .then(response => {
            dispatch(flash(response.message, 'success', 2))
            resolve(response.project)
          })
          .catch(err => {
            dispatch({ type: BUILDING_EVALUATE_PROJECTS_FAIL })
            dispatch(flash(err || 'Issues evaluating project', 'error', 5))
            reject(err)
          })
      })
    } else if (type === 'measure') {
      return new Promise((resolve, reject) => {
        const client = new ApiClient(dispatch, getState())
        client
          .post('/building/' + buildingId + '/measure/' + project._id, {
            data: payload
          })
          .then(response => {
            dispatch(flash(response.message, 'success', 2))
            resolve(response.project)
          })
          .catch(err => {
            dispatch({ type: BUILDING_EVALUATE_PROJECTS_FAIL })
            dispatch(
              flash(err || 'Issues adding incomplete project', 'error', 5)
            )
            reject(err)
          })
      })
    }
  }
}

export const addIncompletePackageProject = ({
  action,
  payload,
  buildingId,
  project,
  type,
  rates
}) => {
  if (action === 'add') {
    payload.createNewProject = true
  }
  return (dispatch, getState) => {
    if (type === 'project' || action === 'edit') {
      return new Promise((resolve, reject) => {
        const client = new ApiClient(dispatch, getState())
        client
          .put('/building/' + buildingId + '/packageproject/' + project._id, {
            data: { payload, rates }
          })
          .then(response => {
            dispatch(flash(response.message, 'success', 2))
            resolve(response.project)
          })
          .catch(err => {
            dispatch({ type: BUILDING_EVALUATE_PROJECTS_FAIL })
            dispatch(flash(err || 'Issues evaluating project', 'error', 5))
            reject(err)
          })
      })
    } else if (type === 'measure') {
      return new Promise((resolve, reject) => {
        const client = new ApiClient(dispatch, getState())
        client
          .put('/building/' + buildingId + '/packagemeasure/' + project._id, {
            data: { payload, rates }
          })
          .then(response => {
            dispatch(flash(response.message, 'success', 2))
            resolve(response.project)
          })
          .catch(err => {
            dispatch({ type: BUILDING_EVALUATE_PROJECTS_FAIL })
            dispatch(
              flash(err || 'Issues adding incomplete project', 'error', 5)
            )
            reject(err)
          })
      })
    }
  }
}

export const addMeasureForMeasurePackage = ({
  action,
  payload,
  buildingId,
  project,
  type,
  rates
}) => {
  if (action === 'add') {
    payload.createNewProject = true
  }
  return (dispatch, getState) => {
    if (type === 'project' || action === 'edit') {
      return new Promise((resolve, reject) => {
        const client = new ApiClient(dispatch, getState())
        client
          .put(
            '/building/' +
              buildingId +
              '/measurePackage/measure/' +
              project._id,
            {
              data: { payload, rates }
            }
          )
          .then(response => {
            dispatch(flash(response.message, 'success', 2))
            resolve(response.project)
          })
          .catch(err => {
            dispatch({ type: BUILDING_EVALUATE_PROJECTS_FAIL })
            dispatch(flash(err || 'Issues evaluating project', 'error', 5))
            reject(err)
          })
      })
    } else if (type === 'measure') {
      return new Promise((resolve, reject) => {
        const client = new ApiClient(dispatch, getState())
        client
          .post(
            '/building/' +
              buildingId +
              '/measurePackage/measure/' +
              project._id,
            {
              data: { payload, rates }
            }
          )
          .then(response => {
            dispatch(flash(response.message, 'success', 2))
            resolve(response.project)
          })
          .catch(err => {
            dispatch({ type: BUILDING_EVALUATE_PROJECTS_FAIL })
            dispatch(
              flash(err || 'Issues adding incomplete project', 'error', 5)
            )
            reject(err)
          })
      })
    }
  }
}

export const editOrganizationProject = (payload, project) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      const organizationId = getState().organization.organizationView._id
      client
        .put('/organization/' + organizationId + '/project/' + project._id, {
          data: payload
        })
        .then(response => {
          dispatch(flash(response.message, 'success', 2))
          resolve()
        })
        .catch(err => {
          dispatch(flash(err || 'Issues evaluating project', 'error', 5))
          reject(err)
        })
    })
  }
}

export const createOrganizationProject = ({ payload, isCopy = false }) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      const organizationId = getState().organization.organizationView._id
      client
        .post('/organization/' + organizationId + '/project', { data: payload })
        .then(response => {
          if (isCopy) {
            dispatch(flash('Copied project', 'success', 2))
          } else {
            dispatch(flash(response.message, 'success', 2))
          }
          resolve(response)
        })
        .catch(err => {
          dispatch(
            flash(err || 'Issues creating organization projects', 'error', 5)
          )
          reject(err)
        })
    })
  }
}

export const getOrganizationProjects = (library = false) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      const organizationId = getState().organization.organizationView._id
      const manageAllOrgSelected = getState().organization.manageAllOrgSelected
      client
        .get(
          manageAllOrgSelected
            ? '/organization/project/all'
            : '/organization/' + organizationId + '/project',
          { params: { library } }
        )
        .then(response => {
          resolve(response.projects)
        })
        .catch(err => {
          dispatch(
            flash(err || 'Issues getting organization projects', 'error', 5)
          )
          reject(err)
        })
    })
  }
}

export const deleteOrganizationProject = project => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      const organizationId = getState().organization.organizationView._id
      const projectId = project._id
      client
        .del('/organization/' + organizationId + '/project/' + projectId)
        .then(response => {
          dispatch(flash(response.message, 'success', 2))
          resolve(response.projects)
        })
        .catch(err => {
          dispatch(
            flash(err || 'Issues deleting organization project', 'error', 5)
          )
          reject(err)
        })
    })
  }
}

export const deleteProject = (projectId, buildingId, flag) => {
  return (dispatch, getState) => {
    dispatch({ type: BUILDING_DELETE_PROJECT })
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      const organizationId = getState().organization.organizationView._id
      client
        .del(
          '/organization/' +
            organizationId +
            '/project/' +
            projectId +
            '/building/' +
            buildingId
        )
        .then(response => {
          dispatch({ type: BUILDING_DELETE_PROJECT_SUCCESS })
          if (!flag) dispatch(flash(response.message, 'success', 2))
          resolve()
        })
        .catch(err => {
          dispatch({ type: BUILDING_DELETE_PROJECT_FAIL })
          if (!flag)
            dispatch(flash(err || 'Issues deleting project', 'error', 5))
          reject(err)
        })
    })
  }
}

export const evaluateProject = (action, payload, buildingId, project, type) => {
  return (dispatch, getState) => {
    dispatch({ type: BUILDING_EVALUATE_PROJECTS })

    if (type === 'project' || action === 'edit') {
      return new Promise((resolve, reject) => {
        const client = new ApiClient(dispatch, getState())

        client
          .put('/building/' + buildingId + '/project/' + project._id + '/run', {
            data: { payload: payload, action: action }
          })
          .then(response => {
            dispatch(flash(response.message, 'success', 2))
            resolve()
          })
          .catch(err => {
            dispatch({ type: BUILDING_EVALUATE_PROJECTS_FAIL })
            dispatch(flash(err || 'Issues evaluating project', 'error', 5))
            reject(err)
          })
      })
    } else if (type === 'measure') {
      return new Promise((resolve, reject) => {
        const client = new ApiClient(dispatch, getState())
        client
          .post(
            '/building/' + buildingId + '/measure/' + project._id + '/run',
            { data: { payload: payload, action: action } }
          )
          .then(response => {
            dispatch(flash(response.message, 'success', 2))
            resolve()
          })
          .catch(err => {
            dispatch({ type: BUILDING_EVALUATE_PROJECTS_FAIL })
            dispatch(flash(err || 'Issues evaluating project', 'error', 5))
            reject(err)
          })
      })
    }
  }
}

export const bulkEvaluateProjects = (projects, buildingId) => {
  return (dispatch, getState) => {
    dispatch({ type: BUILDING_EVALUATE_PROJECT_BULK })
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .put('/building/' + buildingId + '/projectBulkEvaluate', {
          data: projects
        })
        .then(response => {
          dispatch(flash(response.message, 'success', 2))
          resolve()
        })
        .catch(err => {
          dispatch(flash(err || 'Issues bulk adding project', 'error', 5))
          reject(err)
        })
    })
  }
}

export const bulkAddProjects = (projects, buildingId) => {
  return (dispatch, getState) => {
    dispatch({ type: BUILDING_ADD_PROJECT_BULK })
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .put('/building/' + buildingId + '/projectBulkAdd', { data: projects })
        .then(response => {
          dispatch({ type: BUILDING_ADD_PROJECT_BULK_SUCCESS })
          dispatch(flash(response.message, 'success', 2))
          resolve()
        })
        .catch(err => {
          dispatch({ type: BUILDING_ADD_PROJECT_BULK_FAIL })
          dispatch(flash(err || 'Issues bulk adding project', 'error', 5))
          reject(err)
        })
    })
  }
}

/*
  ********
  Building Rate
  ********
*/

export const getBuildingRate = (id, options) => {
  /*
    ***********
    const options = {
      year: 2020,
      startMonth: 'Jan',
      endMonth: 'Dec',
      yearType: 'CY'
    }
    ***********
  */
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      let organizationId = getState().organization.organizationView._id
      let buildingId = getState().building.buildingView._id
      buildingId = id || buildingId
      if (!organizationId || !buildingId) resolve()
      client
        .get(
          '/organization/' +
            organizationId +
            '/building/' +
            buildingId +
            '/rate',
          {
            params: options
          }
        )
        .then(response => {
          dispatch({
            type: BUILDING_EDIT_SUCCESS,
            buildingData: response.building
          })
          resolve(response.building)
        })
        .catch(err => {
          console.log(err)
          reject(err)
        })
    })
  }
}

/*
  ********
  Utilities
  ********
*/

export const getUtilities = buildingId => {
  return (dispatch, getState) => {
    dispatch({ type: BUILDING_GET_UTILITIES })
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .get('/building/' + buildingId + '/utility')
        .then(response => {
          resolve({
            utilities: response.utilities,
            monthlyUtilities: response.monthlyUtilities
          })
        })
        .catch(err => {
          dispatch({ type: BUILDING_GET_UTILITIES_FAIL })
          dispatch(flash(err.error || 'Issues retrieving buildings', 'error'))
          reject(err)
        })
    })
  }
}

export const createUtilities = payload => {
  if (payload.source === 'csv') {
    return (dispatch, getState) => {
      dispatch({ type: BUILDING_CREATE_UTILITIES })
      return new Promise((resolve, reject) => {
        if (!payload.upload || (payload.upload && !payload.upload.csv)) {
          reject('No file attached.')
        }
        const client = new ApiClient(dispatch, getState())
        client
          .post('/building/' + payload.buildingId + '/utility/csv', {
            params: {
              name: payload.name,
              meterNumber: payload.number,
              accountNumber: payload.accountNumber,
              meterType: payload.meterType,
              meterPurpose: payload.meterPurpose,
              meterConfiguration: payload.meterConfiguration,
              meterShared: payload.meterShared,
              source: payload.source,
              units: payload.units,
              utilType: payload.type,
              consumptionOrDelivery: payload.consumptionOrDelivery,
              isNewUtility: payload.isNewUtility || false
            },
            attachFiles: payload.upload.csv,
            sendFullError: true
          })
          .then(response => {
            dispatch({
              type: BUILDING_CREATE_UTILITIES_SUCCESS,
              info: response.utility
            })
            dispatch({
              type: BUILDING_GET_BUILDING_SUCCESS,
              building: response.building
            }) // populate buildingView with new building that has rerunAnalyses set to true
            dispatch(flash(response.message, 'success', 2))
            if (response.warning && response.warning.length > 0) {
              response.warning.map(warning => {
                dispatch(flash(warning, 'warning', 2))
              })
            }
            resolve()
          })
          .catch(err => {
            dispatch({ type: BUILDING_CREATE_UTILITIES_FAIL })
            dispatch(
              flash(
                err.message || 'Issues creating building utility.',
                'error',
                5
              )
            )
            reject(err)
          })
      })
    }
  } else {
    return (dispatch, getState) => {
      dispatch({ type: BUILDING_CREATE_UTILITIES })
      return new Promise((resolve, reject) => {
        if (!payload.upload || (payload.upload && !payload.upload.manual)) {
          reject('No utility data provided.')
        }
        const client = new ApiClient(dispatch, getState())
        client
          .post('/building/' + payload.buildingId + '/utility', {
            data: payload.upload,
            params: {
              name: payload.name,
              meterNumber: payload.number,
              accountNumber: payload.accountNumber,
              meterType: payload.meterType,
              meterPurpose: payload.meterPurpose,
              meterConfiguration: payload.meterConfiguration,
              meterShared: payload.meterShared,
              source: payload.source,
              units: payload.units,
              utilType: payload.type,
              consumptionOrDelivery: payload.consumptionOrDelivery,
              isNewUtility: payload.isNewUtility || false
            }
          })
          .then(response => {
            dispatch({
              type: BUILDING_CREATE_UTILITIES_SUCCESS,
              info: response.utility
            })
            dispatch({
              type: BUILDING_GET_BUILDING_SUCCESS,
              building: response.building
            }) // populate buildingView with new building that has rerunAnalyses set to true
            dispatch(flash(response.message, 'success', 2))
            resolve()
          })
          .catch(err => {
            dispatch({ type: BUILDING_CREATE_UTILITIES_FAIL })
            dispatch(
              flash(
                err.message || 'Issues creating building utility.',
                'error',
                5
              )
            )
            reject(err)
          })
      })
    }
  }
}

export const editUtility = (payload, utilId) => {
  return (dispatch, getState) => {
    dispatch({ type: BUILDING_EDIT_UTILITIES })
    return new Promise((resolve, reject) => {
      if (!payload.upload || (payload.upload && !payload.upload.manual)) {
        reject('No utility data provided.')
      }
      const client = new ApiClient(dispatch, getState())
      client
        .put('/building/' + payload.buildingId + '/utility/' + utilId, {
          data: payload
        })
        .then(response => {
          dispatch({
            type: BUILDING_GET_BUILDING_SUCCESS,
            building: response.building
          }) // populate buildingView with new building that has rerunAnalyses set to true
          dispatch(flash(response.message, 'success', 2))
          resolve()
        })
        .catch(err => {
          dispatch(
            flash(
              err.message || 'Issues creating building utility.',
              'error',
              5
            )
          )
          reject(err)
        })
    })
  }
}

export const deleteUtility = (buildingId, utilityId) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .del('/building/' + buildingId + '/utility/' + utilityId)
        .then(response => {
          dispatch({
            type: BUILDING_GET_BUILDING_SUCCESS,
            building: response.building
          }) // populate buildingView with new building that has rerunAnalyses set to true
          dispatch(flash('Deleted Utility', 'success', 3))
          resolve()
        })
        .catch(err => {
          dispatch(flash(err.error || 'Issues deleting utility', 'error', 5))
          reject(err)
        })
    })
  }
}

export const getWeather = (startDate, endDate, buildingId) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      let buildingId = getState().building.buildingView._id
      const client = new ApiClient(dispatch, getState())
      client
        .post('/building/' + buildingId + '/utility/weather', {
          data: { startDate: startDate.toString(), endDate: endDate.toString() }
        })
        .then(response => {
          let weather = {}
          try {
            weather = JSON.parse(response.weather)
          } catch (error) {
            weather = response.weather
          }
          resolve(weather)
        })
        .catch(err => {
          dispatch(flash(err || 'Issues retrieving weather data', 'error'))
          reject(err)
        })
    })
  }
}

export const getChangePointAnalysis = (utilityData, buildingId) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .post('/building/' + buildingId + '/utility/changePointAnalysis', {
          data: { utilityData: utilityData }
        })
        .then(response => {
          const data = {
            modelingData: response.modelingData,
            buildingConsumptionData: response.buildingConsumptionData
          }
          resolve(data)
        })
        .catch(err => {
          dispatch(
            flash(err || 'Issues retrieving change point analysis', 'error', 5)
          )
          reject(err)
        })
    })
  }
}

/*
  ********
  Assets
  ********
*/

export const getBuildingEquipment = () => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      let buildingId = getState().building.buildingView._id
      client
        .get('/building/' + buildingId + '/asset')
        .then(response => {
          resolve(response.assets)
        })
        .catch(err => {
          dispatch(
            flash(err || 'Issues retrieving building equipment', 'error')
          )
          reject(err)
        })
    })
  }
}

export const getPublicAssets = () => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .get('/publicAssets')
        .then(response => {
          resolve(response.publicAssets)
        })
        .catch(err => {
          dispatch(flash(err || 'Issues retrieving public assets', 'error'))
          reject(err)
        })
    })
  }
}

export const getEquipment = assetId => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      let buildingId = getState().building.buildingView._id
      client
        .get('/building/' + buildingId + '/asset/' + assetId)
        .then(response => {
          resolve(response.asset)
        })
        .catch(err => {
          dispatch(flash(err || 'Issues retrieving asset', 'error'))
          reject(err)
        })
    })
  }
}

export const createAsset = assetPayload => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      let buildingId = getState().building.buildingView._id
      client
        .post('/building/' + buildingId + '/asset', { data: assetPayload })
        .then(response => {
          dispatch({
            type: BUILDING_CREATE_ASSET_SUCCESS,
            building: response.building
          })
          dispatch(flash(response.message, 'success', 2))
          resolve(response.asset)
        })
        .catch(err => {
          dispatch(flash(err || 'Issues creating asset', 'error'))
          reject(err)
        })
    })
  }
}

export const updateAsset = assetPayload => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      let buildingId = getState().building.buildingView._id
      client
        .put('/building/' + buildingId + '/asset/' + assetPayload._id, {
          data: assetPayload
        })
        .then(response => {
          dispatch({
            type: BUILDING_UPDATE_ASSET_SUCCESS,
            building: response.building
          })
          resolve(response.asset)
        })
        .catch(err => {
          dispatch(flash(err || 'Issues updating asset', 'error'))
          reject(err)
        })
    })
  }
}

export const deleteEquipment = assetId => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      let buildingId = getState().building.buildingView._id
      client
        .del('/building/' + buildingId + '/asset/' + assetId)
        .then(response => {
          dispatch({
            type: BUILDING_DELETE_ASSET_SUCCESS,
            building: response.building
          })
          dispatch(flash(response.message, 'success', 2))
          resolve()
        })
        .catch(err => {
          dispatch(flash(err || 'Issues deleting asset', 'error'))
          reject(err)
        })
    })
  }
}

/*
  ********
  EA Related functions
  ********
*/

export const getEaMeasures = firebaseRefs => {
  return (dispatch, getState) => {
    dispatch({ type: EA_GET_MEASURES })
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .get('/firebase/measures', {
          params: {
            orgId: firebaseRefs.orgId,
            userId: firebaseRefs.userId,
            buildingId: firebaseRefs.buildingId,
            auditId: firebaseRefs.auditId
          }
        })
        .then(response => {
          dispatch({
            type: EA_GET_MEASURES_SUCCESS,
            eaMeasures: response.eaMeasures
          })
          resolve()
        })
        .catch(err => {
          dispatch({ type: EA_GET_MEASURES_FAIL })
          dispatch(flash(err || 'Issues getting audit measures', 'error'))
          reject(err)
        })
    })
  }
}

export const gotEaBuildings = () => {
  return dispatch => {
    dispatch(flash('No buildee Pro buildings to retrieve', 'warning', 3))
  }
}

export const getEaComponent = (firebaseRefs, componentType, componentId) => {
  return (dispatch, getState) => {
    dispatch({ type: EA_GET_COMPONENT })
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .get('/firebase/component', {
          params: {
            orgId: firebaseRefs.orgId,
            userId: firebaseRefs.userId,
            buildingId: firebaseRefs.buildingId,
            auditId: firebaseRefs.auditId,
            componentType: componentType,
            componentId: componentId
          }
        })
        .then(response => {
          dispatch({
            type: EA_GET_COMPONENT_SUCCESS,
            component: response.component
          })
          resolve()
        })
        .catch(err => {
          dispatch(
            flash(
              err || 'Issues retrieving building firebase component',
              'error'
            )
          )
          reject(err)
        })
    })
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
          dispatch(flash(err || 'Issues updating user Ids', 'error'))
          reject(err)
        })
    })
  }
}

export const getEAImageUrls = firebaseRefs => {
  return (dispatch, getState) => {
    dispatch({ type: BUILDING_GET_EA_IMAGE_URLS })
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .get('/firebase/query/images', {
          params: {
            orgId: firebaseRefs.orgId,
            userId: firebaseRefs.userId,
            buildingId: firebaseRefs.buildingId
          }
        })
        .then(response => {
          resolve(response.files)
        })
        .catch(err => {
          dispatch(flash(err || 'Issues retrieving audit image urls', 'error'))
          reject(err)
        })
    })
  }
}

export const getEaBuildings = (organizationId, fbOrgId) => {
  if (organizationId && fbOrgId) {
    return (dispatch, getState) => {
      dispatch({ type: EA_GET_BUILDINGS })
      return new Promise((resolve, reject) => {
        const client = new ApiClient(dispatch, getState())
        client
          .get('/organization/' + organizationId + '/firebase/orgBuildings', {
            params: { orgId: fbOrgId, avoidCleanForReport: true }
          })
          .then(response => {
            let allUsersBuildings = []

            for (let userId in response.users) {
              let value = response.users[userId]

              if (value.buildings) {
                Object.keys(value.buildings).map((buildingId, index) => {
                  let lastAudit = Object.keys(
                    value.buildings[buildingId].audits
                  ).pop()
                  let audit = value.buildings[buildingId].audits[lastAudit]
                  audit.userRef = userId
                  audit.auditRef = lastAudit
                  audit.clientName =
                    value.buildings[buildingId].clientName || ''
                  audit.siteName = value.buildings[buildingId].siteName || ''
                  allUsersBuildings.push(audit)
                })
              }
              dispatch({ type: EA_GOT_BUILDINGS })
              resolve(allUsersBuildings)
            }
          })
          .catch(err => {
            dispatch({ type: EA_GET_BUILDINGS_FAIL })
            dispatch(flash(err || 'Issues getting EA buildings', 'error'))
            reject(err)
          })
      })
    }
  }
}

export const changeFirebaseAudit = (
  orgId,
  userId,
  buildingId,
  auditId,
  buildeeBuildingId
) => {
  return (dispatch, getState) => {
    dispatch({ type: EA_CHANGE_AUDIT })
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .get('/firebase/changeAudit', {
          params: {
            orgId: orgId,
            userId: userId,
            buildingId: buildingId,
            auditId: auditId,
            buildeeBuildingId: buildeeBuildingId,
            avoidCleanForReport: true
          }
        })
        .then(response => {
          dispatch({ type: EA_CHANGE_AUDIT_SUCCESS })
          resolve(response.audit)
        })
        .catch(err => {
          dispatch({ type: EA_CHANGE_AUDIT_FAIL })
          dispatch(flash(err || 'Issues changing audit', 'error'))
          reject(err)
        })
    })
  }
}

export const createBuildingFromEA = (orgId, payload) => {
  return (dispatch, getState) => {
    dispatch({ type: EA_CREATE_BUILDINGS })
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      const organizationId = getState().organization.organizationView._id
      client
        .post('/organization/' + orgId + '/building/batch', { data: payload })
        .then(response => {
          dispatch(flash(response.message, 'success', 2))
          dispatch(getOrganizationBuildings(organizationId))
          resolve()
        })
        .catch(err => {
          dispatch(flash(err || 'Issues creating building from EA', 'error', 5))
          reject(err)
        })
    })
  }
}

export const updateBuildingTab = selectedView => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({
        type: UPDATE_BUILDING_TAB,
        selectedView
      })
      resolve(selectedView)
    })
  }
}

export const updateBuildingViewMode = (mode = 'BuildingList') => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({
        type: UPDATE_BUILDING_VIEW_MODE,
        mode
      })
      resolve(mode)
    })
  }
}

export const updateProjectViewTab = selectedView => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({
        type: UPDATE_PROJECTVIEW_TAB,
        selectedView
      })
      resolve(selectedView)
    })
  }
}

export const updateBuildingListStatus = option => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      dispatch({
        type: UPDATE_BUILDING_LIST_STATUS,
        option
      })
      resolve(option)
    })
  }
}

// Project
export const createProjectPackage = (buildingId, values) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      let id = buildingId || getState().building.buildingView._id
      if (!id) reject()
      client
        .post(`/building/${id}/projectPackage`, {
          data: values
        })
        .then(response => {
          resolve({
            projectPackage: response.projectPackage
          })
        })
        .catch(err => {
          dispatch(flash(err || 'Issues creating Project Package', 'error'))
          reject(err)
        })
    })
  }
}

export const updateProjectPackage = (buildingId, values) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      let id = buildingId || getState().building.buildingView._id
      if (!id) reject()
      client
        .put(`/building/${id}/projectPackage/${values._id}`, {
          data: values
        })
        .then(response => {
          resolve({
            projectPackage: response.projectPackage
          })
        })
        .catch(err => {
          dispatch(flash(err || 'Issues updating Project Package', 'error'))
          reject(err)
        })
    })
  }
}

export const deleteProjectPackage = (projectId, buildingId) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      let id = buildingId || getState().building.buildingView._id
      if (!id) reject()
      client
        .del(`/building/${id}/projectPackage/${projectId}`)
        .then(response => {
          resolve({})
        })
        .catch(err => {
          dispatch(flash(err || 'Issues removing Project Package', 'error'))
          reject(err)
        })
    })
  }
}

// Proposal

export const getProposals = buildingId => {
  return (dispatch, getState) => {
    dispatch({ type: BUILDING_GET_PROPOSALS })
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      let id = buildingId || getState().building.buildingView._id
      if (!id) reject('buildingId is undefined')
      client
        .get(`/building/${id}/proposal`)
        .then(response => {
          dispatch({
            type: BUILDING_GET_PROPOSALS_SUCCESS,
            proposals: response.proposals
          })
          resolve(response.proposals)
        })
        .catch(err => {
          dispatch({ type: BUILDING_GET_PROPOSALS_FAIL })
          dispatch(
            flash(err || 'Issues retrieving building proposals', 'error')
          )
          reject(err)
        })
    })
  }
}

export const createProposal = (buildingId, values, mode = 'new') => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      let id = buildingId || getState().building.buildingView._id
      if (!id) reject()
      client
        .post(`/building/${id}/proposal`, {
          data: values
        })
        .then(response => {
          resolve({
            proposal: response.proposal
          })
        })
        .catch(err => {
          dispatch(flash(err || 'Issues creating Proposal', 'error'))
          reject(err)
        })
    })
  }
}

export const updateProposal = (buildingId, values) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      let id = buildingId || getState().building.buildingView._id
      if (!id) reject()
      client
        .put(`/building/${id}/proposal/${values._id}`, {
          data: values
        })
        .then(response => {
          resolve({
            proposal: response.proposal
          })
        })
        .catch(err => {
          dispatch(flash(err || 'Issues updating Proposal', 'error'))
          reject(err)
        })
    })
  }
}

export const deleteProposal = (projectId, buildingId) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      let id = buildingId || getState().building.buildingView._id
      if (!id) reject()
      client
        .del(`/building/${id}/proposal/${projectId}`)
        .then(response => {
          resolve({})
        })
        .catch(err => {
          dispatch(flash(err || 'Issues removing Proposal', 'error'))
          reject(err)
        })
    })
  }
}

export const getCashFlow = data => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .post('/cashflow', { data })
        .then(response => {
          resolve({
            data: response.data
          })
        })
        .catch(err => {
          reject(err)
        })
    })
  }
}

export const reRunProjectPackage = ({ payload, buildingId }) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .post(`/building/${buildingId}/reRunProjectPackage`, {
          data: { payload }
        })
        .then(response => {
          resolve(response.project)
        })
        .catch(err => {
          reject(err)
        })
    })
  }
}

// Measure Package

export const createMeasurePackage = (
  buildingId,
  values,
  mode = 'MeasurePackage'
) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      let id = buildingId || getState().building.buildingView._id
      if (!id) reject()
      client
        .post(`/building/${id}/measurePackage`, {
          data: { values, mode }
        })
        .then(response => {
          resolve({
            measurePackage: response.measurePackage
          })
        })
        .catch(err => {
          dispatch(flash(err || 'Issues creating Measure Package', 'error'))
          reject(err)
        })
    })
  }
}

export const updateMeasurePackage = (
  buildingId,
  values,
  mode = 'MeasurePackage'
) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      let id = buildingId || getState().building.buildingView._id
      if (!id) reject()
      client
        .put(`/building/${id}/measurePackage/${values._id}`, {
          data: { values, mode }
        })
        .then(response => {
          resolve({
            measurePackage: response.measurePackage
          })
        })
        .catch(err => {
          dispatch(flash(err || 'Issues updating Measure Package', 'error'))
          reject(err)
        })
    })
  }
}

export const deleteMeasurePackage = (projectId, buildingId) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      let id = buildingId || getState().building.buildingView._id
      if (!id) reject()
      client
        .del(`/building/${id}/measurePackage/${projectId}`)
        .then(response => {
          dispatch(flash(response.message, 'success', 2))
          resolve()
        })
        .catch(err => {
          dispatch(flash(err || 'Issues deleting measure package', 'error', 5))
          reject(err)
        })
    })
  }
}

export const deleteBulkMeasureForProject = options => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      let { projectIds = [], measurePackageIds = [] } = options
      const client = new ApiClient(dispatch, getState())
      let id = getState().building.buildingView._id
      if (!id) reject()
      client
        .del(`/building/${id}/projectpackage/cancel`, {
          data: { projectIds, measurePackageIds }
        })
        .then(response => {
          resolve()
        })
        .catch(err => {
          reject(err)
        })
    })
  }
}

export const createTempMeasurePackage = (buildingId, values) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      let id = buildingId || getState().building.buildingView._id
      if (!id) reject()
      client
        .post(`/building/${id}/reRunMeasurePackage`, {
          data: values
        })
        .then(response => {
          resolve(response.measurePackage)
        })
        .catch(err => {
          dispatch(
            flash(err || 'Issues creating Temp Measure Package', 'error')
          )
          reject(err)
        })
    })
  }
}

export const analysisProjectWithSubProject = ({
  library,
  buildingId,
  options
}) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      if (library) {
        const organizationId = getState().organization.organizationView._id
        if (!organizationId) reject()
        client
          .post(
            `/organization/${organizationId}/analysisProjectWithSubProject`,
            {
              data: options
            }
          )
          .then(response => {
            resolve({
              projects: response.projects,
              equipmentToProjectMap: response.equipmentToProjectMap,
              cashFlowData: response.cashFlowData || {}
            })
          })
          .catch(err => {
            dispatch(flash(err || 'Issues Analysising Project', 'error'))
            reject(err)
          })
      } else {
        let id = buildingId || getState().building.buildingView._id
        if (!id) reject()
        client
          .post(`/building/${id}/analysisProjectWithSubProject`, {
            data: options
          })
          .then(response => {
            resolve({
              projects: response.projects,
              equipmentToProjectMap: response.equipmentToProjectMap,
              cashFlowData: response.cashFlowData || {}
            })
          })
          .catch(err => {
            dispatch(flash(err || 'Issues Analysising Project', 'error'))
            reject(err)
          })
      }
    })
  }
}

export const createProjectWithSubProject = (library, buildingId, options) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      if (library) {
        let id = getState().organization.organizationView._id
        client
          .post(`/organization/${id}/createProjectWithSubProject`, {
            data: options
          })
          .then(response => {
            resolve(response.project)
          })
          .catch(err => {
            dispatch(
              flash(err || 'Issues createProjectWithSubProject', 'error')
            )
            reject(err)
          })
      } else {
        let id = buildingId || getState().building.buildingView._id

        client
          .post(`/building/${id}/createProjectWithSubProject`, {
            data: options
          })
          .then(response => {
            resolve(response.project)
          })
          .catch(err => {
            dispatch(
              flash(err || 'Issues createProjectWithSubProject', 'error')
            )
            reject(err)
          })
      }
    })
  }
}

export const copyProjectWithSubProject = options => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      let organizationId = getState().organization.organizationView._id

      client
        .post(`/organization/${organizationId}/copyProjectWithSubProject`, {
          data: { options }
        })
        .then(response => {
          resolve(response.project)
        })
        .catch(err => {
          dispatch(flash(err || 'Issues copyProjectWithSubProject', 'error'))
          reject(err)
        })
    })
  }
}

export const removeSubProject = id => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .del(`/project/subProject/${id}`)
        .then(response => {
          resolve()
        })
        .catch(err => {
          reject(err)
        })
    })
  }
}

export const removeOldSubProjects = ids => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const client = new ApiClient(dispatch, getState())
      client
        .del(`/project/subProject`, { data: ids })
        .then(response => {
          resolve()
        })
        .catch(err => {
          reject(err)
        })
    })
  }
}

export const actions = {
  getBuilding,
  getEndUse,
  getEndUseUtil,
  editBuilding,
  create,
  deleteBuilding,
  archiveBuilding,
  deleteUtility,
  getUtilities,
  startProject,
  clearInfo,
  createBuildingFromEA,
  updateUserIds,
  getEaBuildings,
  changeFirebaseAudit,
  getEaMeasures,
  clearBuildingStore,
  uploadProjectImage,
  getWeather,
  updateBuildingTab,
  updateProjectViewTab,
  updateBuildingListStatus,

  // Project
  createProjectPackage,
  updateProjectPackage,
  reRunProjectPackage,

  // Proposal
  createProposal
}

// ------------------------------------
// Action Helpers
// ------------------------------------

const handleClearStore = (state, action) => {
  return Object.assign({}, state, initialState)
}

const handleGet = (state, action) => {
  return Object.assign({}, state, {
    buildingList: action.buildings
  })
}

const handleGetBuilding = (state, action) => {
  return Object.assign({}, state, {
    buildingView: action.building
  })
}

const handleEditBuilding = (state, action) => {
  let tempObj = Object.assign({}, state.buildingView, action.buildingData)

  return Object.assign({}, state, {
    buildingView: tempObj
  })
}

const handleGetProjects = (state, action) => {
  let tempObj = { ...state.buildingView }
  let stateMeasures = (tempObj && tempObj.measures) || []

  if (stateMeasures.length === 0) {
    let measuresArray = []
    let measures = action.measures

    for (let key in measures) {
      let project = measures[key]
      if (project) {
        project.map((item, index) => {
          if (!item.type) item.type = key
          measuresArray.push(item)
        })
      }
    }
    tempObj.measures = measuresArray
  }

  let projects = []
  projects = action.projects.map(pro => {
    return {
      ...pro,
      collectionTarget: 'measure'
    }
  })
  let measurePackages =
    action.measurePackages.map(mPackage => {
      let projects = (mPackage && mPackage.projects) || []
      projects = projects.map(project => {
        return {
          ...project,
          collectionTarget: 'measure'
        }
      })
      return {
        ...mPackage,
        collectionTarget: 'measurePackage',
        projects: projects
      }
    }) || []
  projects = [...projects, ...measurePackages]
  tempObj.projects = action.projects
  tempObj.projects = projects

  return Object.assign({}, state, {
    buildingView: tempObj
  })
}

const handleGetProjectPackages = (state, action) => {
  return Object.assign({}, state, {
    buildingView: {
      ...state.buildingView,
      projectPackages: action.packages
    }
  })
}

const handleGetProposals = (state, action) => {
  return Object.assign({}, state, {
    buildingView: {
      ...state.buildingView,
      proposals: action.proposals
    }
  })
}

const handleGetBenchmark = (state, action) => {
  if (!state.buildingView.benchmark) {
    state.buildingView.benchmark = {}
  }
  let tempObj = { ...state.buildingView }
  tempObj.benchmark = action.benchmark

  return Object.assign({}, state, {
    buildingView: tempObj
  })
}

const handleCreateBuilding = (state, action) => {
  let tempObj = Object.assign(state.buildingView, action.buildingData)
  return Object.assign({}, state, {
    buildingView: tempObj
  })
}

const handleUpdateBuildingList = (state, action) => {
  return Object.assign({}, state, {
    buildingList: action.updatedBuildings
  })
}

const handleUpdateXMLBuildingList = (state, action) => {
  return Object.assign({}, state, {
    xmlBuildingList: action.updatedBuildings
  })
}

const handleGetEaMeasures = (state, action) => {
  let tempObj = { ...state.buildingView }

  if (!tempObj.eaMeasures) {
    tempObj.eaMeasures = {}
  } else {
    tempObj.eaMeasures = action.eaMeasures
  }

  return Object.assign({}, state, {
    buildingView: tempObj
  })
}

const handleResetEaComponent = (state, action) => {
  let tempObj = { ...state.buildingView }
  tempObj.eaComponents = []
  return Object.assign({}, state, {
    buildingView: tempObj
  })
}

const handleGetEaComponent = (state, action) => {
  let tempObj = { ...state.buildingView }
  tempObj.eaComponents.push(action.component)

  return Object.assign({}, state, {
    buildingView: tempObj
  })
}

const handleCreateUtilities = (state, action) => {
  const { buildingView } = state
  let updatedUtilities = []
  if (buildingView.utilities) {
    updatedUtilities = [...buildingView.utilities]
  }
  updatedUtilities.push(action.info)
  return {
    ...state,
    buildingView: {
      ...buildingView,
      utilities: updatedUtilities
    }
  }
}

/// /EA Buildings////

const handleGetAuditList = (state, action) => {
  let tempObj = { ...state.buildingView }
  tempObj.eaAudits = action.audits

  return Object.assign({}, state, {
    buildingView: tempObj
  })
}

const handleUpdateGotEaBuildings = (state, action) => {
  return Object.assign({}, state, {
    gotEaBuildings: true
  })
}

const handleUpdateBuildingTab = (state, action) => {
  return Object.assign({}, state, {
    selectedView: action.selectedView,
    selectedProjectView: { name: 'Measures' }
  })
}

const handleUpdateBuildingViewMode = (state, action) => {
  return Object.assign({}, state, {
    buildingViewMode: action.mode
  })
}
const handleUpdateProjectViewTab = (state, action) => {
  return Object.assign({}, state, {
    selectedProjectView: action.selectedView
  })
}

const handleUpdateBuildingListStatus = (state, action) => {
  return Object.assign({}, state, {
    buildingListStatus: action.option
  })
}
// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [BUILDING_DATA_CLEAR]: (state, action) => {
    return {
      ...state,
      buildingView: {}
    }
  },

  [BUILDING_GET]: (state, action) => {
    return { ...state, buildingList: [] }
  },
  [BUILDING_GET_FAIL]: (state, action) => {
    return { ...state }
  },
  [BUILDING_GET_SUCCESS]: handleGet,

  [BUILDING_CLEAR_STORE]: handleClearStore,

  [BUILDING_GET_BUILDING]: (state, action) => {
    return { ...state, buildingView: {} }
  },
  [BUILDING_GET_BUILDING_FAIL]: (state, action) => {
    return { ...state }
  },
  [BUILDING_GET_BUILDING_SUCCESS]: handleGetBuilding,

  [BUILDING_GET_BENCHMARK]: (state, action) => {
    return { ...state }
  },
  [BUILDING_GET_BENCHMARK_FAIL]: (state, action) => {
    return { ...state }
  },
  [BUILDING_GET_BENCHMARK_SUCCESS]: handleGetBenchmark,

  [BUILDING_GET_PROJECTS]: (state, action) => {
    return { ...state }
  },
  [BUILDING_GET_PROJECTS_FAIL]: (state, action) => {
    return { ...state }
  },
  [BUILDING_GET_PROJECTS_SUCCESS]: handleGetProjects,

  [BUILDING_EVALUATE_PROJECTS]: (state, action) => {
    return { ...state }
  },
  [BUILDING_EVALUATE_PROJECTS_FAIL]: (state, action) => {
    return { ...state }
  },

  [BUILDING_EVALUATE_PROJECT_BULK]: (state, action) => {
    return { ...state }
  },

  [BUILDING_ADD_PROJECT_BULK]: (state, action) => {
    return { ...state }
  },
  [BUILDING_ADD_PROJECT_BULK_FAIL]: (state, action) => {
    return { ...state }
  },
  [BUILDING_ADD_PROJECT_BULK_SUCCESS]: (state, action) => {
    return { ...state }
  },

  [BUILDING_GET_EA_IMAGE_URLS]: (state, action) => {
    return { ...state }
  },

  [BUILDING_CREATE]: (state, action) => {
    return { ...state }
  },
  [BUILDING_CREATE_FAIL]: (state, action) => {
    return { ...state }
  },
  [BUILDING_CREATE_SUCCESS]: handleCreateBuilding,

  [BUILDING_CREATE_SAMPLE]: (state, action) => {
    return { ...state }
  },
  [BUILDING_CREATE_SAMPLE_FAIL]: (state, action) => {
    return { ...state }
  },

  [BUILDING_DELETE]: (state, action) => {
    return { ...state }
  },
  [BUILDING_DELETE_FAIL]: (state, action) => {
    return { ...state }
  },
  [BUILDING_DELETE_SUCCESS]: (state, action) => {
    return { ...state }
  },

  [BUILDING_ARCHIVE]: (state, action) => {
    return { ...state }
  },
  [BUILDING_ARCHIVE_FAIL]: (state, action) => {
    return { ...state }
  },
  [BUILDING_ARCHIVE_SUCCESS]: handleEditBuilding,

  [BUILDING_DELETE_PROJECT]: (state, action) => {
    return { ...state }
  },
  [BUILDING_DELETE_PROJECT_FAIL]: (state, action) => {
    return { ...state }
  },
  [BUILDING_DELETE_PROJECT_SUCCESS]: (state, action) => {
    return { ...state }
  },

  [BUILDING_CREATE_UTILITIES]: (state, action) => {
    return { ...state }
  },
  [BUILDING_CREATE_UTILITIES_FAIL]: (state, action) => {
    return { ...state }
  },
  [BUILDING_CREATE_UTILITIES_SUCCESS]: handleCreateUtilities,

  [BUILDING_EDIT_UTILITIES]: (state, action) => {
    return { ...state }
  },

  [BUILDING_CREATE_ASSET_SUCCESS]: handleGetBuilding,
  [BUILDING_UPDATE_ASSET_SUCCESS]: handleGetBuilding,
  [BUILDING_DELETE_ASSET_SUCCESS]: handleGetBuilding,

  [BUILDING_SET_UTILITIES_DATE_RANGE]: (state, action) => {
    return { ...state }
  },

  [BUILDING_GET_UTILITIES]: (state, action) => {
    return { ...state }
  },
  [BUILDING_GET_UTILITIES_FAIL]: (state, action) => {
    return { ...state }
  },

  [BUILDING_EDIT]: (state, action) => {
    return { ...state }
  },
  [BUILDING_EDIT_FAIL]: (state, action) => {
    return { ...state }
  },
  [BUILDING_EDIT_SUCCESS]: handleEditBuilding,

  [UPDATE_BUILDING_LIST]: handleUpdateBuildingList,
  [UPDATE_XML_BUILDING_LIST]: handleUpdateXMLBuildingList,
  [EA_GOT_BUILDINGS]: handleUpdateGotEaBuildings,

  [EA_GET_BUILDINGS]: (state, action) => {
    return { ...state }
  },
  [EA_GET_BUILDINGS_FAIL]: (state, action) => {
    return { ...state }
  },

  [EA_GET_MEASURES]: (state, action) => {
    return { ...state }
  },
  [EA_GET_MEASURES_FAIL]: (state, action) => {
    return { ...state }
  },
  [EA_GET_MEASURES_SUCCESS]: handleGetEaMeasures,

  [EA_GET_COMPONENT]: handleResetEaComponent,
  [EA_GET_COMPONENT_SUCCESS]: handleGetEaComponent,

  [EA_CHANGE_AUDIT]: (state, action) => {
    return { ...state }
  },
  [EA_CHANGE_AUDIT_FAIL]: (state, action) => {
    return { ...state }
  },
  [EA_CHANGE_AUDIT_SUCCESS]: (state, action) => {
    return { ...state }
  },

  [EA_GET_AUDITS]: (state, action) => {
    return { ...state }
  },
  [EA_GET_AUDITS_FAIL]: (state, action) => {
    return { ...state }
  },
  [EA_GET_AUDITS_SUCCESS]: handleGetAuditList,
  [UPDATE_BUILDING_TAB]: handleUpdateBuildingTab,
  [UPDATE_BUILDING_VIEW_MODE]: handleUpdateBuildingViewMode,
  [UPDATE_PROJECTVIEW_TAB]: handleUpdateProjectViewTab,
  [UPDATE_BUILDING_LIST_STATUS]: handleUpdateBuildingListStatus,
  [BUILDING_GET_PROJECTPACKAGES]: (state, action) => {
    return { ...state }
  },
  [BUILDING_GET_PROJECTPACKAGES_FAIL]: (state, action) => {
    return { ...state }
  },
  [BUILDING_GET_PROJECTPACKAGES_SUCCESS]: handleGetProjectPackages,
  [BUILDING_GET_PROPOSALS_FAIL]: (state, action) => {
    return { ...state }
  },
  [BUILDING_GET_PROPOSALS_SUCCESS]: handleGetProposals
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  buildingList: [],
  buildingView: {},
  gotEaBuildings: false,
  selectedView: { name: 'Overview' },
  selectedProjectView: { name: 'Measures' },
  buildingListStatus: 'buildings',
  buildingViewMode: 'BuildingList',
  xmlBuildingList: []
}
export default function buildingReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
