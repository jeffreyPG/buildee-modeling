import { combineReducers } from 'redux'
import { routerReducer as router } from 'react-router-redux'
import { reducer as formReducer } from 'redux-form'

import * as storage from 'redux-storage'

import login from 'routes/Login/modules/login'
import profile from 'routes/Profile/modules/profile'
import portfolio from 'routes/Portfolio/modules/portfolio'
import building from 'routes/Building/modules/building'
import report from 'routes/Building/modules/report'
import library from 'routes/Library/modules/library'
import organization from 'routes/Organization/modules/organization'
import template from 'routes/Template/modules/template'
import spreadsheet from '../routes/Spreadsheet/modules/spreadsheet'
import proposalTemplate from '../routes/ProposalTemplate/modules/proposalTemplate'
import flash from 'utils/Flash/modules/flash'
import docuSign from 'routes/DocuSign/modules/docuSign'
import featureFlag from 'routes/FeatureFlags/modules/featureFlags'

export const makeRootReducer = asyncReducers => {
  return storage.reducer(
    combineReducers({
      router,
      form: formReducer,
      flash,
      login,
      building,
      library,
      profile,
      organization,
      portfolio,
      template,
      spreadsheet,
      report,
      docuSign,
      proposalTemplate,
      featureFlag,
      ...asyncReducers
    })
  )
}

export const injectReducer = (store, { key, reducer }) => {
  if (Object.hasOwnProperty.call(store.asyncReducers, key)) return

  store.asyncReducers[key] = reducer
  store.replaceReducer(makeRootReducer(store.asyncReducers))
}

export default makeRootReducer
