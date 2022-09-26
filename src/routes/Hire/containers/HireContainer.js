import { connect } from 'react-redux'
import { push } from 'react-router-redux'

import Hire from 'components/Hire'

const mapDispatchToProps = {
  push
}

const mapStateToProps = state => ({
  user: state.login.user || {}
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Hire)
