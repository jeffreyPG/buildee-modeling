import { routerLoginCheck, routerTermsCheck } from 'utils/Utils'
import ChartDashboardContainer from './containers/ChartDashboardContainer'

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
      path: 'organization/:organizationId/template',
      onEnter: requireLogin,

      getComponent(nextState, cb) {
        require.ensure(
          [],
          require => {
            const Building = require('./containers/TemplateContainer').default
            cb(null, Building)
          },
          'template'
        )
      }
    },
    {
      path: 'organization/template/all',
      onEnter: requireLogin,

      getComponent(nextState, cb) {
        require.ensure(
          [],
          require => {
            const Building = require('./containers/TemplateContainer').default
            cb(null, Building)
          },
          'template'
        )
      }
    },
    {
      path: 'template/create',
      onEnter: requireLogin,

      getComponent(nextState, cb) {
        require.ensure(
          [],
          require => {
            const TemplateCreate = require('./containers/TemplateCreateContainer')
              .default
            cb(null, TemplateCreate)
          },
          'template'
        )
      }
    },
    {
      path: 'chart/dashboard',
      onEnter: requireLogin,

      getComponent(nextState, cb) {
        require.ensure(
          [],
          require => {
            const ChartDashboard = require('./containers/ChartDashboardContainer')
              .default
            cb(null, ChartDashboard)
          },
          'chart'
        )
      }
    },
    {
      path: 'template/:templateId',
      onEnter: requireLogin,

      getComponent(nextState, cb) {
        require.ensure(
          [],
          require => {
            const TemplateView = require('./containers/TemplateViewContainer')
              .default
            cb(null, TemplateView)
          },
          'template'
        )
      }
    }
  ]
}
