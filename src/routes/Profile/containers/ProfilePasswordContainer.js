import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { updatePassword } from '../modules/profile'

import { ProfilePassword } from 'components/Profile'

const mapDispatchToProps = {
  updatePassword,
  push
}

const mapStateToProps = state => ({
  user: state.login.user || {}
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProfilePassword)
