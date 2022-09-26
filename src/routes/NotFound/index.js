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
      path: '*',
      onEnter: requireLogin,

      getComponent(nextState, cb) {
        require.ensure(
          [],
          require => {
            const Profile = require('./containers/NotFound').default
            cb(null, Profile)
          },
          'notfound'
        )
      }
    }
  ]
}
