import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { connect } from 'react-redux'
import {
  getAuthGrantURL,
  docuSignLogin,
  getDocuSignTemplates,
  getLinkedEnvelopeDocuments,
  getEmbeddedEnvlopeLink,
  deleteEnvelopeDocument,
  unlinkEnvelopeDocument
} from 'routes/DocuSign/modules/docuSign'
import { Loader } from 'utils/Loader'
import { parentNodeHasClass, downloadItem } from 'utils/Utils'
import DocuTemplateModal from './DocuTemplateModal'
import styles from './DocuSignSection.scss'

class DocuSignSection extends Component {
  state = {
    modalOpen: false,
    modalView: null,
    loading: false,
    showExtras: ''
  }

  componentDidMount() {
    this.getLinkedEnvelopeDocuments()
  }

  getLinkedEnvelopeDocuments = () => {
    this.setState({ loading: true })
    this.props
      .getLinkedEnvelopeDocuments(this.props.id || '', this.props.modeFrom)
      .then(() => {
        this.setState({ loading: false })
      })
      .catch(err => {
        console.log(err)
        this.setState({ loading: false })
      })
  }

  UNSAFE_componentWillMount() {
    document.addEventListener('mousedown', this.handleClick, false)
  }

  componentWillUnmount = () => {
    document.removeEventListener('mousedown', this.handleClick, false)
  }

  handleClick = e => {
    // the click is inside, continue to menu links
    if (parentNodeHasClass(e.target, 'extrasClick')) return
    // otherwise, toggle (close) the app dropdown
    this.handleToggleExtras('')
  }

  checkEmptyState = () => {
    const { documents } = this.props
    return !documents || documents.length === 0
  }

  renderEmptyState = () => {
    return (
      <div className={styles.docuEmtpy}>
        <div className={styles.docuEmtpyBody}>
          <div className={styles.docuEmtpyBodyTitle}>
            Add a DocuSign Document
          </div>
          <div className={styles.docuEmtpyBodyTitleDescription}>
            Select a template, get a signature, and access and track documents
            here.
          </div>
          <div className={styles.docuEmtpyButtons}>
            <button
              className={classNames(styles.button, styles.buttonPrimary)}
              onClick={this.openDocuSignModal}
            >
              <i className="material-icons">add</i> New Document
            </button>
          </div>
        </div>
      </div>
    )
  }

  openDocuSignModal = event => {
    event.preventDefault()
    event.stopPropagation()
    this.setState(
      {
        modalOpen: false,
        modalView: null
      },
      () => {
        setTimeout(() => {
          this.setState({
            modalOpen: true,
            modalView: 'docuTemplates'
          })
        }, 10)
      }
    )
  }

  closeTemplateModal = () => {
    this.setState({
      modalOpen: false,
      modalView: null
    })
  }

  renderModals() {
    const { modalView } = this.state
    const { modeFrom } = this.props
    switch (modalView) {
      case 'docuTemplates':
        return (
          <DocuTemplateModal
            onClose={this.closeTemplateModal}
            id={this.props.id || ''}
            modeFrom={modeFrom}
          />
        )
      default:
        return null
    }
  }

  handleToggleExtras = id => {
    this.setState({
      showExtras: id
    })
  }

  lanuchDocuSign = (event, id) => {
    event.stopPropagation()
    let callbackURL = window.location.origin + '/docuRedirect'
    this.setState({
      showExtras: ''
    })
    this.props
      .getEmbeddedEnvlopeLink(id, callbackURL)
      .then(response => {
        const newWindow = window.open(response.redirectUrl)
      })
      .catch(err => {
        console.log('error', err)
      })
  }

  downloadEnvelope = (event, envelopeId, orgId, envelopeName) => {
    downloadItem(
      `/ds/downloadEnvelope/admin?organizationId=${orgId}&envelopeId=${envelopeId}&filename=${envelopeName}`
    )
    event.stopPropagation()
    this.setState({
      showExtras: ''
    })
  }

  unlink = (event, id) => {
    event.stopPropagation()
    this.setState({
      showExtras: ''
    })
    this.props
      .unlinkEnvelopeDocument(id)
      .then(() => {
        this.getLinkedEnvelopeDocuments()
      })
      .catch(err => {
        console.log('error', err)
      })
  }

  remove = (event, id) => {
    event.stopPropagation()
    this.setState({
      showExtras: ''
    })
    this.props
      .deleteEnvelopeDocument(id)
      .then(() => {
        this.getLinkedEnvelopeDocuments()
      })
      .catch(err => {
        console.log('error', err)
      })
  }

  renderBody() {
    const { documents } = this.props
    return (
      <div className={styles.table}>
        <div
          className={classNames(styles.tableHeader, styles.documentTableHeader)}
        >
          <div
            className={classNames(styles.tableRowItem, styles.tableRowItem_2)}
          >
            Document Name
          </div>
          <div className={classNames(styles.tableRowItem)}>Author Name</div>
          <div className={classNames(styles.tableRowItem)}>Last Update</div>
          <div className={classNames(styles.documentTableHeaderButton)}>
            <button
              className={classNames(styles.button, styles.buttonPrimary)}
              onClick={this.openDocuSignModal}
            >
              <i className="material-icons">add</i>
            </button>
          </div>
        </div>
        {!!documents.length &&
          documents.map((document, index) => (
            <div key={`document-${index}`} className={styles.tableRow}>
              <div
                className={classNames(
                  styles.tableRowItem,
                  styles.tableRowItem_2
                )}
              >
                {document.envelopeName}
              </div>
              <div className={classNames(styles.tableRowItem)}>
                {document.dsAuthorName}
              </div>
              <div className={classNames(styles.tableRowItem)}>
                {new Date(document.updatedAt).toLocaleDateString('en-US')}
              </div>

              <div className={classNames(styles.documentTableHeaderButton)}>
                <div
                  data-test="document-envelope"
                  onClick={() => this.handleToggleExtras(document._id)}
                  className={classNames(
                    styles.extras,
                    'extrasClick',
                    this.state.showExtras === document._id
                      ? styles.extrasShow
                      : styles.extrasHide
                  )}
                >
                  <span className={styles.extrasButton} />
                  <div
                    className={classNames(
                      styles.extrasDropdown,
                      styles.extrasDropdownRight
                    )}
                  >
                    <div
                      className={styles.extrasLink}
                      onClick={event =>
                        this.lanuchDocuSign(event, document._id)
                      }
                    >
                      <i className="material-icons">launch</i>Open in DocuSign
                    </div>
                    <div
                      className={styles.extrasLink}
                      onClick={event =>
                        this.downloadEnvelope(
                          event,
                          document.envelopeId,
                          document.organizationId,
                          document.envelopeName
                        )
                      }
                    >
                      <i className="material-icons">cloud_download</i>Download
                      ZIP
                    </div>
                    <div
                      className={styles.extrasLink}
                      onClick={event => this.unlink(event, document.envelopeId)}
                    >
                      <i className="material-icons">link_off</i>Unlink from
                      buildee
                    </div>
                    <div
                      className={styles.extrasLink}
                      onClick={event => this.remove(event, document.envelopeId)}
                    >
                      <i className="material-icons">delete</i>Delete from
                      DocuSign
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    )
  }

  render() {
    const { modalOpen, loading } = this.state
    let emptyState = this.checkEmptyState()
    return (
      <div className={classNames(loading ? styles.textCenter : '')}>
        {loading && <Loader />}
        {emptyState && this.renderEmptyState()}
        {!emptyState && this.renderBody()}
        {modalOpen && this.renderModals()}
      </div>
    )
  }
}

const mapDispatchToProps = {
  getAuthGrantURL,
  docuSignLogin,
  getDocuSignTemplates,
  getLinkedEnvelopeDocuments,
  deleteEnvelopeDocument,
  unlinkEnvelopeDocument,
  getEmbeddedEnvlopeLink
}

const mapStateToProps = state => ({
  user: state.login.user || {},
  organizationView: state.organization.organizationView || {},
  documents: state.docuSign.documents || []
})

export default connect(mapStateToProps, mapDispatchToProps)(DocuSignSection)
