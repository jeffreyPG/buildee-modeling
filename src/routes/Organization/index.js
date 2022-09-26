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
      path: 'organization',
      onEnter: requireLogin,

      getComponent(nextState, cb) {
        require.ensure(
          [],
          require => {
            const Organization = require('./containers/OrganizationContainer')
              .default
            cb(null, Organization)
          },
          'organization'
        )
      }
    },
    // {
    //   path: 'organization/new',
    //   onEnter: requireLogin,

    //   getComponent (nextState, cb) {

    //     require.ensure([], (require) => {
    //       const Organization = require('./containers/OrganizationNewContainer').default
    //       cb(null, Organization)
    //     }, 'organization')
    //   }
    // },
    {
      path: 'organization/:organizationId/manage(/:tab)',
      onEnter: requireLogin,

      getComponent(nextState, cb) {
        require.ensure(
          [],
          require => {
            const OrganizationManage = require('./containers/OrganizationAllManageContainer')
              .default
            cb(null, OrganizationManage)
          },
          'organization'
        )
      }
    },
    {
      path: 'organization/manage/all(/:tab)',
      onEnter: requireLogin,

      getComponent(nextState, cb) {
        require.ensure(
          [],
          require => {
            const AllOrganizationManage = require('./containers/OrganizationAllManageContainer')
              .default
            cb(null, AllOrganizationManage)
          },
          'organization'
        )
      }
    },
    {
      path: 'organization/:organizationId/settings',
      onEnter: requireLogin,

      getComponent(nextState, cb) {
        require.ensure(
          [],
          require => {
            const OrganizationSetting = require('./containers/OrganizationSettingContainer')
              .default
            cb(null, OrganizationSetting)
          },
          'organization'
        )
      }
    }
  ]
}
