export default store => ({
  path: 'forgot',

  getComponent(nextState, cb) {
    require.ensure(
      [],
      require => {
        const Forgot = require('./containers/ForgotContainer').default

        cb(null, Forgot)
      },
      'forgot'
    )
  }
})
