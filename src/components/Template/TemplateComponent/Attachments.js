import React from 'react'
import stylesTab from './Editor.scss'
import styles from './TemplateComponent.scss'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  uploadPdfFile,
  addAttachments
} from '../../../routes/Template/modules/template'
const FILE_NAME_REGEX = new RegExp(/^[\w\.\_\-\ ]*$/)

export class Attachments extends React.Component {
  static propTypes = {
    templateView: PropTypes.object,
    addAttachments: PropTypes.func.isRequired
  }
  state = {
    showExtras1: false,
    showExtras2: false,
    upload: '',
    error: '',
    uploadError: null,
    attachments: [],
    attachmentList: []
  }

  clearInputValue = e => {
    e.target.value = ''
  }

  handleAddAttachment = e => {
    this.setState({ error: '' }) // reset error on upload
    var file = e.target.files[0]
    const validated = FILE_NAME_REGEX.test(file.name)
    if (validated) {
      ;``
      var self = this
      this.setState({ upload: 'loading' })
      const data = new FormData()
      data.append('file', file)
      console.log(file)
      data.append('filename', file.name)
      console.log(file.name)
      self.props
        .uploadPdfFile(data)
        .then(imageUrl => {
          var fileName = imageUrl.replace(
            'https://buildee-test.s3.us-west-2.amazonaws.com/',
            ''
          )
          let attachments = [...this.state.attachments]
          let attachmentList = [...this.state.attachmentList]
          let date =
            [file.lastModifiedDate.getDate()] +
            '-' +
            [file.lastModifiedDate.getMonth()] +
            '-' +
            [file.lastModifiedDate.getFullYear()]
          console.log(date)

          attachments.push({
            DocumentName: file.name,
            BucketName: fileName,
            DateUpdate: date,
            AuthorName: 'No Auth'
          })
          console.log(attachments)

          attachmentList.push(file.name)
          self.props.addAttachments(attachments)
          self.setState({
            attachmentList: attachmentList,
            attachments: attachments
          })
          self.setState({ upload: 'success' })
        })
        .catch(err => {
          if (err.status === 413) {
            self.setState({
              upload: 'fail',
              uploadError: 'File size exceeded. Maximum size allowed is 10MB'
            })
          } else {
            self.setState({ upload: 'fail', uploadError: err.message })
          }
        })
      return true
    } else {
      this.setState({
        error:
          'Unable to upload. Please remove all special characters from the file name.'
      })
      return false
    }
  }

  removeStyledDoc = () => {
    this.props.addAttachments('')
    this.setState({ upload: '' })
  }
  handleToggleExtras1 = index => {
    if (index === this.state.showExtras1) {
      this.setState({ showExtras1: '' })
      return
    }
    this.setState({ showExtras1: index })
  }
  handleToggleExtras2 = index => {
    if (index === this.state.showExtras2) {
      this.setState({ showExtras2: '' })
      return
    }
    this.setState({ showExtras2: index })
  }
  handleDeleteAttachment = index => {
    console.log(index)
    var list = [...this.state.attachments]
    if (index !== -1) {
      list.splice(index, 1)
      this.setState({ attachments: list })
    }
  }
  handleListSorting = (event, index) => {
    let internalIndex = parseInt(event.target.value)
    console.log(internalIndex)
    let attachments = [...this.state.attachments]
    let attachmentList = [...this.state.attachmentList]
    console.log(index)
    let val1 = { ...attachments[index] }
    attachments[index] = { ...attachments[internalIndex] }
    attachments[internalIndex] = { ...val1 }
    let val2 = attachmentList[index]
    attachmentList[index] = attachmentList[internalIndex]
    attachmentList[internalIndex] = val2

    this.props.addAttachments(attachments)
    this.setState({
      attachmentList: attachmentList,
      attachments: attachments
    })
  }

  componentDidMount = () => {
    this.setState({
      attachments: this.props.attachments
    })
  }

  render() {
    const { upload, error, uploadError } = this.state
    return (
      <div className={stylesTab.container}>
        <div className={stylesTab.leftside}>
          <h5>
            <strong>Attached Documents</strong>
          </h5>
          <p>
            Attach PDF documents to the end of documents generated from this
            template. Upload and set the order of the files. File size is
            limited to 50 MB
          </p>
        </div>
        <div className={stylesTab.rightside}>
          <div>
            {upload === 'fail' && (
              <p className={styles['editor__error']}>
                {uploadError
                  ? uploadError
                  : 'Please upload a different PDF file.'}
              </p>
            )}
            {error !== '' && <p className={styles['editor__error']}>{error}</p>}
          </div>
          <div className={stylesTab.upper}>
            <p className={stylesTab.DoucumentH}>
              <strong> Document Name</strong>
            </p>
            <p className={stylesTab.AuthorH}>
              <strong>Author</strong>
            </p>
            <p className={stylesTab.DatedH}>
              <strong>Last Updated</strong>
            </p>
            <div className={stylesTab.buttonAdd}>
              <label
                className={classNames(
                  styles.button,
                  styles.buttonPrimary,
                  upload === 'loading' ? styles.buttonDisable : ''
                )}
              >
                {upload === 'loading' && (
                  <i className="material-icons">upload</i>
                )}

                {(upload === '' ||
                  upload === 'fail' ||
                  upload === 'success') && (
                  <i className="material-icons">add</i>
                )}

                <div>
                  <input
                    className={stylesTab.FileInput}
                    type="file"
                    disabled={upload === 'loading'}
                    name="attachments"
                    accept=".pdf"
                    onClick={e => {
                      this.clearInputValue(e)
                    }}
                    onChange={e => {
                      this.handleAddAttachment(e)
                    }}
                  />
                </div>
              </label>
            </div>
          </div>
          <div className={stylesTab.lower}>
            {this.state.attachments.map((list, index) => {
              return (
                <div className={stylesTab.listDocument} key={index}>
                  <div className={stylesTab.Counter}>
                    <span className={stylesTab.index}>{index + 1}</span>
                    <select
                      value=""
                      className={stylesTab.countBtn}
                      onChange={e => this.handleListSorting(e, index)}
                    >
                      <option value="">Select Order</option>
                      {this.state.attachments.map((list, internalIndex) => {
                        if (index != internalIndex)
                          return (
                            <option value={internalIndex}>
                              {internalIndex + 1}{' '}
                            </option>
                          )
                      })}
                    </select>
                  </div>

                  <div className={stylesTab.DocumentName}>
                    <p>{list.DocumentName}</p>
                  </div>

                  <div className={stylesTab.AuthorName}>
                    <p>{list.AuthorName}</p>
                  </div>

                  <div className={stylesTab.DateUpdate}>
                    <p>{list.DateUpdate}</p>
                  </div>

                  <div
                    onClick={() => this.handleToggleExtras2(index)}
                    className={classNames(
                      stylesTab.moreButton,
                      stylesTab.extras,
                      this.state.showExtras2 === index
                        ? stylesTab.extrasShow
                        : stylesTab.extrasHide
                    )}
                  >
                    <span className={stylesTab.extrasButton} />
                    <div
                      className={classNames(
                        stylesTab.extrasDropdown,
                        stylesTab.extrasDropdownRight
                      )}
                    >
                      <div className={stylesTab.extrasLink}>
                        <a
                          href={`https://buildee-test.s3.us-west-2.amazonaws.com/${list.BucketName}`}
                        >
                          <i className="material-icons"> cloud_download </i>
                          Download
                        </a>
                      </div>

                      <div
                        className={stylesTab.extrasLink}
                        onClick={() => this.handleDeleteAttachment(index)}
                      >
                        <i className="material-icons">delete</i> Delete
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = {
  uploadPdfFile,
  addAttachments
}

const mapStateToProps = state => ({
  attachments: state.template.templateViewAttachments || []
})

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps
)

export default withConnect(Attachments)
