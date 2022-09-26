import React, { Component } from 'react'
import classNames from 'classnames'
import { connect } from 'react-redux'
import {
  getDocuSignTemplates,
  getEmbeddSignURL,
  getAuthGrantURL,
  docuSignLogin,
  getLinkedEnvelopeDocuments
} from 'routes/DocuSign/modules/docuSign'
import { Loader } from 'utils/Loader'

import styles from './DocuTemplateModal.scss'
import DocuEmailModal from './DocuEmailModal'
import DocuStatusModal from './DocuStatusModal'

class DocuTemplateModal extends Component {
  state = {
    selectedTemplateId: null,
    mode: null
  }

  componentDidMount() {
    this.props.getDocuSignTemplates()
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { mode } = this.state
    if (!nextProps.isLoggedIn) {
      if (
        nextProps.grantStatus !== this.props.grantStatus &&
        nextProps.grantURL != ''
      ) {
        const newWindow = window.open(nextProps.grantURL)
      } else if (nextProps.code !== this.props.code) {
        this.props.docuSignLogin(nextProps.code)
      }
    }
    if (nextProps.isLoggedIn && !this.props.isLoggedIn) {
      if (mode === 'embed') {
        const { selectedTemplateId } = this.state
        let callbackURL = window.location.origin + '/docuRedirect'
        this.props.getEmbeddSignURL(
          selectedTemplateId,
          callbackURL,
          this.props.id,
          this.props.modeFrom
        )
      }
    }

    if (this.props.embeddURL === '' && nextProps.embeddURL !== '') {
      const newWindow = window.open(nextProps.embeddURL)
    } else if (
      this.props.embeddedSignStatus === '' &&
      nextProps.embeddedSignStatus === 'signing_complete'
    ) {
      this.props.getLinkedEnvelopeDocuments(
        this.props.id || '',
        this.props.modeFrom
      )
    }
  }

  selectTemplate = templateID => {
    this.setState({
      selectedTemplateId: templateID
    })
  }

  handleOpenModal = (event, mode) => {
    event.preventDefault()
    event.stopPropagation()
    const { selectedTemplateId } = this.state
    if (selectedTemplateId) {
      this.setState({ mode })
    }

    if (mode === 'embed') {
      let callbackURL = window.location.origin + '/docuRedirect'
      if (!this.props.isLoggedIn) {
        if (!this.props.grantStatus || !this.props.grantURL) {
          this.props.getAuthGrantURL(callbackURL)
        } else {
          const newWindow = window.open(this.props.grantURL)
        }
      } else {
        if (mode === 'embed') {
          this.props.getEmbeddSignURL(
            selectedTemplateId,
            callbackURL,
            this.props.id,
            this.props.modeFrom
          )
        }
      }
    }
  }

  handleCloseSubModal = () => {
    this.setState({ mode: null })
    this.props.onClose()
  }

  showSuccessModal = () => {
    this.setState({ mode: 'successEmail' })
    this.props.getLinkedEnvelopeDocuments(
      this.props.id || '',
      this.props.modeFrom
    )
  }

  getTitle = () => {
    const { status } = this.props
    switch (status) {
      case 'Success':
        return 'Email Sent'
      default:
        return ''
    }
  }

  getBodyText = () => {
    const { status } = this.props
    switch (status) {
      case 'Success':
        return 'Your document has been linked to buildee. You can open or download this at any time.'
      default:
        return ''
    }
  }

  checkEmptyState = () => {
    const { templates = [] } = this.props
    return !templates.length
  }

  renderEmptyState = () => {
    return (
      <div className={classNames(styles.empty, styles.modalEmpty)}>
        <div className={styles.emptyBody}>
          <div className={styles.emptyBodyTitle}>No Templates Found</div>
          <div
            className={classNames(
              styles.emptyBodyDescription,
              styles.modalEmptyDescription
            )}
          >
            <p>Add templates to you DocuSign</p>
            <p>account and they will appear here.</p>
          </div>
        </div>
      </div>
    )
  }

  renderBody = () => {
    const { templates, loading } = this.props
    const { selectedTemplateId } = this.state
    let checkEmpty = this.checkEmptyState()

    return (
      <div className={classNames(styles.modalBody)}>
        {loading && <Loader />}
        {!!checkEmpty && this.renderEmptyState()}
        {!checkEmpty && (
          <div>
            {!!templates &&
              templates.map(template => {
                return (
                  <div
                    key={template.templateId}
                    onClick={() => this.selectTemplate(template.templateId)}
                    className={classNames(
                      styles.tableRow,
                      styles.docuSignTableRow,
                      selectedTemplateId === template.templateId
                        ? styles.docuSignTableRowSelected
                        : ''
                    )}
                  >
                    <div
                      className={classNames(
                        styles.tableRowItem,
                        styles.tableRowItem_2
                      )}
                    >
                      {template.name}
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </div>
    )
  }

  render() {
    const checkEmpty = this.checkEmptyState()
    const { mode, selectedTemplateId } = this.state

    return (
      <div>
        {!mode && (
          <div className={styles.modal}>
            <div className={styles.modalInner}>
              <div className={styles.modalHeading}>
                <h2>DocuSign Templates</h2>
                <div className={styles.modalClose} onClick={this.props.onClose}>
                  <i className="material-icons">close</i>
                </div>
              </div>
              {this.renderBody()}
              <div className={styles.modalFooter}>
                <button
                  onClick={event => this.handleOpenModal(event, 'email')}
                  className={classNames(styles.button, styles.buttonPrimary, {
                    [styles.buttonDisable]: checkEmpty || !selectedTemplateId
                  })}
                >
                  Email
                </button>

                <button
                  onClick={event => this.handleOpenModal(event, 'embed')}
                  className={classNames(styles.button, styles.buttonPrimary, {
                    [styles.buttonDisable]: checkEmpty || !selectedTemplateId
                  })}
                >
                  {!!this.props.embeddLoading ? (
                    <Loader size="button" color="white" />
                  ) : (
                    <div>
                      <i className="material-icons">launch</i> Open in docusign
                    </div>
                  )}
                </button>

                <button
                  className={classNames(styles.button, styles.buttonSecondary)}
                  onClick={this.props.onClose}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {mode === 'email' && (
          <DocuEmailModal
            onClose={this.handleCloseSubModal}
            showSuccessModal={this.showSuccessModal}
            id={this.props.id || ''}
            templateId={this.state.selectedTemplateId}
            modeFrom={this.props.modeFrom}
          />
        )}
        {mode === 'successEmail' && (
          <DocuStatusModal
            onClose={this.handleCloseSubModal}
            title={this.getTitle()}
            bodyText={this.getBodyText()}
          />
        )}
        {mode === 'embed' &&
          this.props.embeddedSignStatus === 'signing_complete' && (
            <DocuStatusModal
              onClose={this.handleCloseSubModal}
              title={'Your DocuSign Document'}
              bodyText={
                'You document has been linked to buildee! You can reopen, download, and more in the table.'
              }
            />
          )}
      </div>
    )
  }
}
const mapDispatchToProps = {
  getDocuSignTemplates,
  getEmbeddSignURL,
  getAuthGrantURL,
  docuSignLogin,
  getLinkedEnvelopeDocuments
}

const mapStateToProps = state => ({
  user: state.login.user || {},
  organizationView: state.organization.organizationView || {},
  templates: state.docuSign.templates || [],
  loading: state.docuSign.templateLoading || false,
  status: state.docuSign.emailStatus || '',
  embeddLoading: state.docuSign.embeddLoading || false,
  embeddStatus: state.docuSign.embeddStatus || '',
  embeddURL: state.docuSign.embeddURL || '',
  embeddedSignStatus: state.docuSign.embeddedSignStatus || '',
  grantStatus: state.docuSign.grantStatus || '',
  grantURL: state.docuSign.grantURL || '',
  code: state.docuSign.code || '',
  isLoggedIn: state.docuSign.isLoggedIn || false
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DocuTemplateModal)
