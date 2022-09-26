import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Loader } from 'utils/Loader'
import styles from './TemplateComponent.scss'
import {
  uploadWordFile,
  addStyledReport
} from '../../../routes/Template/modules/template'

const FILE_NAME_REGEX = new RegExp(/^[\w\.\_\-\ ]*$/)

export class ReportStyles extends React.Component {
  static propTypes = {
    templateView: PropTypes.object,
    addStyledReport: PropTypes.func.isRequired
  }

  state = {
    upload: '',
    error: ''
  }

  clearInputValue = e => {
    e.target.value = ''
  }

  fileUpload = e => {
    this.setState({ error: '' }) // reset error on upload
    var file = e.target.files[0]
    const validated = FILE_NAME_REGEX.test(file.name)
    if (validated) {
      var self = this
      this.setState({ upload: 'loading' })
      const data = new FormData()
      data.append('file', file)
      data.append('filename', file.name)
      self.props
        .uploadWordFile(data)
        .then(imageUrl => {
          var fileName = imageUrl.replace(
            'https://buildee-test.s3.us-west-2.amazonaws.com/',
            ''
          )
          self.props.addStyledReport(fileName)
          self.setState({ upload: 'success' })
        })
        .catch(() => {
          self.setState({ upload: 'fail' })
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
    this.props.addStyledReport('')
    this.setState({ upload: '' })
  }

  render() {
    const { styledDoc } = this.props
    const { upload, error } = this.state

    return (
      <div
        className={classNames(
          styles['editor__reportStyles'],
          styles['reportUploadStyles']
        )}
      >
        <h3>Style Template</h3>
        <div className={styles.templateDescription}>
          <span>
            Have an existing report template with a look and feel that you love?
          </span>
          <a href={'/buildeee-default-template-guide.docx'}>
            Download our style template guide.
          </a>
        </div>
        {styledDoc && styledDoc !== '' && (
          <div className={styles.uploadedFile}>
            <p>{styledDoc}</p>
            <a
              href={`https://buildee-test.s3.us-west-2.amazonaws.com/${styledDoc}`}
            >
              Download
            </a>
            <span onClick={() => this.removeStyledDoc()}>Remove</span>
          </div>
        )}

        {(!styledDoc || styledDoc === '') && (
          <div className={styles.upload}>
            {(upload === '' || upload === 'fail') && (
              <label>
                <p>Upload a Word Document to pull styles from</p>
                <input
                  type="file"
                  name="report-styles"
                  accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onClick={e => {
                    this.clearInputValue(e)
                  }}
                  onChange={e => {
                    this.fileUpload(e)
                  }}
                />
              </label>
            )}

            {upload === 'loading' && <Loader />}
            {upload === 'fail' && (
              <p className={styles['editor__error']}>
                Please upload a different Word document.
              </p>
            )}
            {error !== '' && <p className={styles['editor__error']}>{error}</p>}
          </div>
        )}
      </div>
    )
  }
}

const mapDispatchToProps = {
  uploadWordFile,
  addStyledReport
}

const mapStateToProps = state => ({
  styledDoc: state.template.templateViewStyledDoc || ''
})

const withConnect = connect(mapStateToProps, mapDispatchToProps)

export default withConnect(ReportStyles)
