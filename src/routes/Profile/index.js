import { routerLoginCheck } from 'utils/Utils'

export default store => {
  const requireLogin = ({ params }, replace, cb) => {
    if (!routerLoginCheck(store)) {
      replace('/')
    }
    cb()
  }

  return [
    {
      path: 'profile',
      onEnter: requireLogin,

      getComponent(nextState, cb) {
        require.ensure(
          [],
          require => {
            const Profile = require('./containers/ProfileContainer').default
            cb(null, Profile)
          },
          'profile'
        )
      }
    },
    {
      path: 'profile/password',
      onEnter: requireLogin,

      getComponent(nextState, cb) {
        require.ensure(
          [],
          require => {
            const ProfilePassword = require('./containers/ProfilePasswordContainer')
              .default
            cb(null, ProfilePassword)
          },
          'profile'
        )
      }
    },
    {
      path: 'terms-of-service',
      onEnter: requireLogin,

      getComponent(nextState, cb) {
        require.ensure(
          [],
          require => {
            const ProfileTerms = require('./containers/ProfileTermsContainer')
              .default
            cb(null, ProfileTerms)
          },
          'profile'
        )
      }
    }
  ]
}
