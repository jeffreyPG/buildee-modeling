import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Dropzone from 'react-dropzone'
import { detectMobileTouch } from 'utils/Utils'
import { uploadImage } from '../modules/uploader'

export class Uploader extends React.Component {
  static propTypes = {
    uploadImage: PropTypes.func.isRequired,
    onBeforeEachUpload: PropTypes.func,
    className: PropTypes.string,
    onUpload: PropTypes.func,
    onUploading: PropTypes.func,
    onUploadFail: PropTypes.func,
    onUploadSuccess: PropTypes.func
  }

  state = {
    loadingStatus: ''
  }

  onDrop = (acceptedFiles, rejectedFiles) => {
    let files = acceptedFiles
    let uploadSuccess = Object.keys(files).map(index => {
      //File Upload
      let file = files[index]
      const upload = { [file.name]: file }
      this.props.onUpload({ upload })
      this.setState({ loadingStatus: 'loading' })

      return Promise.all([this.props.onBeforeEachUpload(file) || true]).then(
        ([transformedData]) => {
          const data = new FormData()
          data.append('file', transformedData.url)
          data.append('filename', transformedData.name)

          const upload = { [file.name]: Object.assign(file, transformedData) }
          this.props.onUploading({ upload })
          //File Uploading
          return this.props.uploadImage(data).then(uploadUrl => {
            return { [file.name]: Object.assign(file, { uploadUrl }) }
          })
        }
      )
    })

    Promise.all(uploadSuccess)
      .then(uploadedFiles => {
        //File Upload Success
        this.setState({ loadingStatus: 'success' })
        uploadedFiles.forEach(upload => this.props.onUploadSuccess({ upload }))
      })
      .catch(() => {
        //File Upload Fail
        this.setState({ loadingStatus: 'fail' })
        this.props.onUploadFail()
      })
  }

  render() {
    return (
      <Dropzone onDrop={this.onDrop} accept="image/jpeg, image/jpg, image/png">
        {({ getRootProps, getInputProps, isDragActive }) => {
          if (detectMobileTouch() === 'mobile')
            return (
              <div className={this.props.className}>
                <input {...getInputProps()} />
                <p>
                  <span>Take a photo or select from photo library</span>
                </p>
              </div>
            )
          return (
            <div className={this.props.className}>
              <input {...getInputProps()} />
              <p>
                Drag and drop, or <span>browse files</span>
              </p>
            </div>
          )
        }}
      </Dropzone>
    )
  }
}

const mapStateToProps = state => ({
  uploader: state.uploader
})
export default connect(mapStateToProps, {
  uploadImage
})(Uploader)
