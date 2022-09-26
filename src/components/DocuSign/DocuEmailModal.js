import React, { Component } from 'react'
import { connect } from 'react-redux'
import { sendDocuSignEmail } from '../../routes/DocuSign/modules/docuSign'
import EmailModal from 'components/UI/EmailModal'

class DocuEmailModal extends Component {
  handleSubmit = async values => {
    const signers = []
    const cc = []
    signers.push({
      name: values.to,
      email: values.to
    })
    if (values.cc)
      cc.push({
        name: values.cc,
        email: values.cc
      })
    await this.props
      .sendDocuSignEmail(
        this.props.templateId,
        values.subject,
        values.message,
        signers,
        cc,
        this.props.id || '',
        this.props.modeFrom
      )
      .then(res => {
        this.props.onClose()
        this.props.showSuccessModal()
      })
      .catch(err => {})
  }

  render() {
    return (
      <EmailModal
        title="Email Document"
        onSubmit={this.handleSubmit}
        onClose={this.props.onClose}
      />
    )
  }
}

const mapDispatchToProps = { sendDocuSignEmail }

const mapStateToProps = state => ({
  user: state.login.user || {}
})

export default connect(mapStateToProps, mapDispatchToProps)(DocuEmailModal)
