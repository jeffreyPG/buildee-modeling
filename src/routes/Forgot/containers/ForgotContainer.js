import { connect } from 'react-redux'
import { forgot } from '../../Profile/modules/profile'

import Forgot from 'components/Forgot'

const mapDispatchToProps = {
  forgot
}

const mapStateToProps = state => ({})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Forgot)
