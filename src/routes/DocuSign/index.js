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
      path: 'docuRedirect',
      onEnter: requireLogin,

      getComponent(nextState, cb) {
        require.ensure(
          [],
          require => {
            const DocuSignRedirectContainer = require('./containers/DocuSignRedirectContainer')
              .default
            cb(null, DocuSignRedirectContainer)
          },
          'docuSign'
        )
      }
    }
  ]
}
