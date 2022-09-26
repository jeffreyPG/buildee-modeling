import Spreadsheet from './containers/SpreadsheetContainer'
import SpreadsheetCreate from './containers/SpreadsheetCreateContainer'
import SpreadsheetView from './containers/SpreadsheetViewContainer'
import { routerLoginCheck, routerTermsCheck } from '../../utils/Utils'

export default store => {
  const requireLogin = ({ params }, replace, cb) => {
    // check to make sure they're logged in
    if (!routerLoginCheck(store)) {
      replace('/')
    }
    // check to make sure they've accepted the terms of use
    if (!routerTermsCheck(store)) {
      replace('/terms-of-service')
    }
    cb()
  }

  return [
    {
      path: 'spreadsheet/templatelist',
      onEnter: requireLogin,

      getComponent(nextState, cb) {
        cb(null, Spreadsheet)
      }
    },
    {
      path: 'spreadsheet/create(/:type)',
      onEnter: requireLogin,

      getComponent(nextState, cb) {
        cb(null, SpreadsheetCreate)
      }
    },
    {
      path: 'spreadsheet/template/:templateId',
      onEnter: requireLogin,

      getComponent(nextState, cb) {
        cb(null, SpreadsheetView)
      }
    }
  ]
}
