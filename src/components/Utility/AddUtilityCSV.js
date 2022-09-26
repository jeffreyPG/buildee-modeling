import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Dropzone from 'react-dropzone'
import styles from './AddUtility.scss'

export class AddUtilityCSV extends React.Component {
  static propTypes = {
    consumptionOrDelivery: PropTypes.string.isRequired,
    handleUploadFile: PropTypes.func.isRequired,
    handleClearFileErrors: PropTypes.func.isRequired,
    file: PropTypes.array.isRequired,
    fileError: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired
  }

  onDrop = (acceptedFiles, rejectedFiles) => {
    // Do something with files
    if (acceptedFiles.length) {
      this.props.handleUploadFile(acceptedFiles)
      this.props.handleClearFileErrors()
    }
  }

  renderUploadErrors = () => {
    const { fileError } = this.props

    if (!fileError) {
      return ''
    }

    return (
      <div className={styles['upload-errors']}>
        <h3>There was an error in your upload.</h3>
        <p>{fileError}</p>
      </div>
    )
  }

  render() {
    const { file, fileError } = this.props
    const attachedFile = file

    return (
      <div className={styles.csvUtility}>
        <div className={styles.csvUtilityDropzone}>
          <div className={styles.csvUtilityDownload}>
            <label>
              <small>
                Download the template for this fuel type (CSV), add your data
                with correct units, and upload the file. Note cost data is
                optional
              </small>
            </label>
            {this.props.consumptionOrDelivery === 'delivery' && (
              <a
                href={
                  'https://buildee-test.s3.us-west-2.amazonaws.com/buildeeUtilityCSVDeliveryTemplate.csv'
                }
              >
                Download template
              </a>
            )}
            {this.props.consumptionOrDelivery === 'consumption' &&
              this.props.type === 'electric' && (
                <a
                  href={
                    'https://buildee-test.s3.us-west-2.amazonaws.com/buildeeUtilityCSVElectricTemplate.csv'
                  }
                >
                  Download template
                </a>
              )}
            {this.props.consumptionOrDelivery === 'consumption' &&
              this.props.type !== 'electric' && (
                <a
                  href={
                    'https://buildee-test.s3.us-west-2.amazonaws.com/buildeeUtilityCSVTemplate.csv'
                  }
                >
                  Download template
                </a>
              )}
          </div>
          <Dropzone
            name="uploadCSV"
            // className={styles.dropzone}
            onDrop={this.onDrop.bind(this)}
            accept=".csv, text/csv, application/csv, application/vnd.ms-excel,"
          >
            {({ getRootProps, getInputProps, isDragActive }) => {
              return (
                <div className={styles.dropzone} {...getRootProps()}>
                  <input {...getInputProps()} />
                  <p>
                    Drag and drop, or <span>browse files</span>
                  </p>
                </div>
              )
            }}
          </Dropzone>
          {attachedFile && attachedFile.length > 0 && (
            <div className={styles.csvUtilityFiletitle}>
              {attachedFile[0].name} ({attachedFile[0].type})
            </div>
          )}
          {fileError && (
            <div className={styles.addUtilitErrors}>
              {this.renderUploadErrors()}
            </div>
          )}
        </div>
      </div>
    )
  }
}

export default AddUtilityCSV
