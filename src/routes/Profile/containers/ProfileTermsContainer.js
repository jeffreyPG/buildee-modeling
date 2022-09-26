import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { acceptTerms } from '../modules/profile'

import { ProfileTerms } from 'components/Profile'

const mapDispatchToProps = {
  acceptTerms,
  push
}

const mapStateToProps = state => ({
  user: state.login.user || {}
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProfileTerms)
