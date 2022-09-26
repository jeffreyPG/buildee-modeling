import { routerLoginCheck } from 'utils/Utils'

export default store => {
  const loginCheck = ({ params }, replace, cb) => {
    // if (!routerLoginCheck(store)) {
    //   replace('/')
    // }
    cb()
  }

  return {
    onEnter: loginCheck,

    getComponent(nextState, cb) {
      require.ensure(
        [],
        require => {
          const Home = require('./containers/HomeContainer').default

          cb(null, Home)
        },
        'building'
      )
    }
  }
}
