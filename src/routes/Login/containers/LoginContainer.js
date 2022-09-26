import { connect } from 'react-redux'
import { push } from 'react-router-redux'

import Login from 'components/Login'

import { sessionExpireCheck } from 'utils/Utils'

const mapDispatchToProps = {
  push
}

const mapStateToProps = state => ({
  user: state.login.user,
  isExpired: sessionExpireCheck(state.login || {}),
  loggingIn: state.login.loggingIn || false
})

export default connect(mapStateToProps, mapDispatchToProps)(Login)
