import { routerLoginCheck } from 'utils/Utils'

export default store => {
  const requireLogin = ({ params }, replace, cb) => {
    if (!routerLoginCheck(store)) {
      replace('/')
    }
    cb()
  }

  return {
    path: 'hire',
    onEnter: requireLogin,

    getComponent(nextState, cb) {
      require.ensure(
        [],
        require => {
          const Hire = require('./containers/HireContainer').default

          cb(null, Hire)
        },
        'hire'
      )
    }
  }
}
