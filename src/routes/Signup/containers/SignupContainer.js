import { connect } from 'react-redux'
import { signup, clearViewState } from '../modules/signup'

import Signup from 'components/Signup'

const mapDispatchToProps = {
  signup,
  clearViewState
}

const mapStateToProps = state => ({})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Signup)
