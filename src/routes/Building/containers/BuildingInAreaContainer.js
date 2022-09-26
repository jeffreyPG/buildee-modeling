import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { create, getProjectsAndMeasures } from '../modules/building'

import { BuildingInArea } from 'components/Building'

const mapDispatchToProps = {
  push,
  create,
  getProjectsAndMeasures
}

const mapStateToProps = state => ({
  user: state.login.user || {},
  building: state.building || {}
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BuildingInArea)
