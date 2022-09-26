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
      path: 'portfolio(/:target)',
      onEnter: requireLogin,

      getComponent(nextState, cb) {
        require.ensure(
          [],
          require => {
            const Portfolio = require('./containers/PortfolioContainer').default
            cb(null, Portfolio)
          },
          'portfolio'
        )
      }
    },
    {
      path: 'organization/:organizationId/portfolio(/:tab)',
      onEnter: requireLogin,

      getComponent(nextState, cb) {
        require.ensure(
          [],
          require => {
            const Portfolio = require('./containers/Portfolio').default
            cb(null, Portfolio)
          },
          'portfolio'
        )
      }
    }
  ]
}
