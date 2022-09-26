import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import {
  get,
  verifyEmail,
  updateUserType,
  verifyEmailSuccess,
  getOrganizationName,
  updateLEANOrgsSettings,
  updateProfile
} from '../modules/profile'

import { Profile } from 'components/Profile'

const mapDispatchToProps = {
  push,
  get,
  verifyEmail,
  verifyEmailSuccess,
  updateUserType,
  getOrganizationName,
  updateLEANOrgsSettings,
  updateProfile
}

const mapStateToProps = state => ({
  user: state.login.user || {},
  userHasVerified:
    state.login.user &&
    state.login.user.roles &&
    state.login.user.roles.indexOf('verified') !== -1
})

export default connect(mapStateToProps, mapDispatchToProps)(Profile)
