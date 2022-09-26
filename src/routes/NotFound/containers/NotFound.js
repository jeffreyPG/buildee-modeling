import { connect } from 'react-redux'
import { push } from 'react-router-redux'

import { NotFound } from 'components/NotFound'

const mapDispatchToProps = {
  push
}

const mapStateToProps = state => ({})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NotFound)
