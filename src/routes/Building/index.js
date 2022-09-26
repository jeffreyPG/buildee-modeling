import { routerLoginCheck, routerTermsCheck } from 'utils/Utils'

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
      path: 'organization/:organizationId/building',
      onEnter: requireLogin,

      getComponent(nextState, cb) {
        require.ensure(
          [],
          require => {
            const Building = require('./containers/BuildingContainer').default
            cb(null, Building)
          },
          'building'
        )
      }
    },
    {
      path: 'building/new',
      onEnter: requireLogin,

      getComponent(nextState, cb) {
        require.ensure(
          [],
          require => {
            const BuildingNew = require('./containers/BuildingNewContainer')
              .default
            cb(null, BuildingNew)
          },
          'building'
        )
      }
    },
    {
      path: 'building/:buildingId(/:tab)(/:subTab)',
      onEnter: requireLogin,

      getComponent(nextState, cb) {
        require.ensure(
          [],
          require => {
            const BuildingView = require('./containers/BuildingViewContainer')
              .default
            cb(null, BuildingView)
          },
          'building'
        )
      }
    }
  ]
}
