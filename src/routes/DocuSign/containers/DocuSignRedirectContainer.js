import { connect } from 'react-redux'
import { push } from 'react-router-redux'

import DocuSignRedirect from 'components/DocuSign/DocuSignRedirect'
import { setDocuSignCode, setEmbedStatus } from '../modules/docuSign'

const mapDispatchToProps = {
  push,
  setDocuSignCode,
  setEmbedStatus
}

const mapStateToProps = state => ({
  user: state.login.user || {}
})

export default connect(mapStateToProps, mapDispatchToProps)(DocuSignRedirect)
