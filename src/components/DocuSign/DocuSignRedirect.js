import React, { Component } from 'react'
class DocuSignRedirect extends Component {
  componentDidMount() {
    let code =
      (this.props.location &&
        this.props.location.query &&
        this.props.location.query.code) ||
      ''
    let event =
      (this.props.location &&
        this.props.location.query &&
        this.props.location.query.event) ||
      ''
    if (event) {
      this.props.setEmbedStatus(event)
      setTimeout(self.close, 50)
      setTimeout(window.close, 50)
    }
    if (code) {
      this.props.setDocuSignCode(code)
      setTimeout(self.close, 50)
      setTimeout(window.close, 50)
    }
    setTimeout(self.close, 50)
    setTimeout(window.close, 50)
  }

  render() {
    return null
  }
}
export default DocuSignRedirect
