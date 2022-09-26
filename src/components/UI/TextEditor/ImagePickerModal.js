import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Resize } from 'utils/Utils'
import styles from './ImagePickerModal.scss'
import { connect } from 'react-redux'
import { Loader } from 'utils/Loader'
import { uploadImage } from '../../../routes/Template/modules/template'
const imageOptions = [
  { name: 'Upload an Image', value: 'imageUpload' },
  { name: 'Insert Building Image', value: 'buildingImage' },
  { name: 'Insert Profile Photo', value: 'profileImage' }
]

class ImagePickerModal extends Component {
  state = {
    option: '',
    imageUploadStatus: '',
    imageUrl: null,
    width: 200,
    height: 'auto'
  }

  static propTypes = {
    handleCloseModal: PropTypes.func.isRequired,
    squarePosition: PropTypes.string.isRequired,
    uploadImage: PropTypes.func.isRequired
  }

  UNSAFE_componentWillMount() {
    document.addEventListener('click', this.handleOutsideClick, true)
    document.addEventListener('mousedown', this.handleOutsideClick, true)
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleOutsideClick, true)
    document.removeEventListener('mousedown', this.handleOutsideClick, true)
  }

  handleOutsideClick = event => {
    if (this.node !== null && this.node.contains(event.target)) {
      return
    }
    this.handleClose()
  }

  handleClose = () => {
    this.props.handleCloseModal()
  }

  handleImageOptionChange = event => {
    this.setState({
      option: event.target.value
    })
  }

  handleImageUpload = e => {
    var file = e.target.files[0]
    var self = this
    var maxWidth = 2000
    var maxHeight = 2000
    this.setState({ imageUploadStatus: 'loading' })

    Resize(file, maxWidth, maxHeight, function(resizedDataUrl) {
      const data = new FormData()
      data.append('file', resizedDataUrl)
      data.append('filename', file.name)

      self.props
        .uploadImage(data)
        .then(imageUrl => {
          self.setState({ imageUploadStatus: 'success', imageUrl })
        })
        .catch(() => {
          self.setState({ imageUploadStatus: 'fail', imageUrl: null })
        })
    })
  }

  insertValue = () => {
    const { imageUrl, option, width, height } = this.state
    const output = {
      imageUrl,
      width,
      height
    }
    this.props.handleCloseModal(output, option)
  }

  handleClearInputValue = e => {
    e.target.value = ''
  }

  handleWidthInput = event => {
    const value = parseInt(event.target.value)
    if (!Number.isNaN(value)) {
      this.setState({
        width: value,
        height: 'auto'
      })
    } else {
      this.setState({
        width: 0,
        height: 'auto'
      })
    }
  }

  handleHeightInput = event => {
    const value = parseInt(event.target.value)
    if (!Number.isNaN(value)) {
      this.setState({
        width: 'auto',
        height: value
      })
    } else {
      this.setState({
        width: 'auto',
        height: 0
      })
    }
  }

  renderImageConfiguration = () => {
    const { width, height } = this.state
    return (
      <div className={styles.imageConfigContainer}>
        <div>
          <p>Width(px)</p>
          <input
            placeholder="Width"
            type="input"
            value={width}
            onChange={this.handleWidthInput}
          />
        </div>
        <div className={styles.imageConfig}>
          <p>Height(px)</p>
          <input
            placeholder="Height"
            type="input"
            value={height}
            onChange={this.handleHeightInput}
          />
        </div>
      </div>
    )
  }

  renderImageOptions = () => {
    const { option, imageUploadStatus } = this.state
    return (
      <div className={styles.imageOptionsContainer}>
        <span>Select an Option</span>
        <div className={styles.selectContainer}>
          <select value={option} onChange={this.handleImageOptionChange}>
            <option defaultValue value="" disabled>
              Select an Option
            </option>
            {imageOptions.map((item, index) => (
              <option key={`option_${index}`} value={item.value}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        {option === 'imageUpload' && (
          <div className={styles.imageUploadContainer}>
            {imageUploadStatus !== 'loading' &&
              imageUploadStatus !== 'success' && (
                <label>
                  <p>Please select an image</p>
                  <input
                    type="file"
                    name="body-image"
                    accept="image/*"
                    onClick={this.handleClearInputValue}
                    onChange={this.handleImageUpload}
                  />
                </label>
              )}
            {imageUploadStatus === 'loading' && <Loader />}
            {imageUploadStatus === 'fail' && (
              <div>Please upload a smaller image.</div>
            )}
          </div>
        )}
        {this.renderImageContent()}
        {this.renderImageConfiguration()}
        <div className={styles.buttonContainer}>
          <button
            className={classNames(
              styles.button,
              styles.buttonPrimary,
              !option ? styles.buttonDisable : ''
            )}
            onClick={this.insertValue}
          >
            Insert
          </button>
          <button
            className={classNames(styles.button, styles.buttonSecondary)}
            onClick={this.handleClose}
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  handleImageRemove = () => {
    this.setState({ imageUploadStatus: '', imageUrl: null })
  }

  renderImageContent = () => {
    const { imageUrl, option } = this.state
    if (!imageUrl && option !== 'imageUpload') return
    return (
      <div className={styles.imageContent}>
        <img src={imageUrl} />
        <div
          className={styles.imageRemove}
          onClick={() => {
            this.handleImageRemove()
          }}
        >
          <i className="material-icons">delete</i>
        </div>
      </div>
    )
  }

  render() {
    const { squarePosition } = this.props

    return (
      <div ref={node => (this.node = node)}>
        <div
          className={classNames(
            styles.imagePickerContainer,
            styles[`square${squarePosition}`]
          )}
        >
          <div className={styles.imagePickerContainerHeader}>Image Options</div>
          {this.renderImageOptions(imageOptions)}
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = {
  uploadImage
}

const withConnect = connect(
  null,
  mapDispatchToProps
)

export default withConnect(ImagePickerModal)
