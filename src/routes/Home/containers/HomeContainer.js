import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { startProject } from '../../Building/modules/building'
import { checkLoginAndRedirect } from '../modules/home'

import Home from 'components/Home'

import { sessionExpireCheck } from 'utils/Utils'

const mapDispatchToProps = {
  push,
  startProject,
  checkLoginAndRedirectAction: checkLoginAndRedirect
}

const mapStateToProps = state => ({
  user: state.login.user || {},
  isExpired: sessionExpireCheck(state.login || {}),
  buildingList: state.building.buildingList || []
})

export default connect(mapStateToProps, mapDispatchToProps)(Home)
