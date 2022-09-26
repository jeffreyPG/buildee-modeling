import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { uploadImage } from 'utils/Uploader/modules/uploader'
import styles from './CardIconUpload.scss'
import { Loader } from 'utils/Loader'
import ImageModal from '../../containers/Modal/ImageModal'
import { Resize, checkImageSize } from 'utils/Utils'
import classNames from 'classnames'

/*
 *
 * The Images Field takes care of uploading multiple images and viewing them in a modal
 * */

class CardIconUpload extends React.Component {
  static propTypes = {
    images: PropTypes.object,
    onFieldUpdate: PropTypes.func.isRequired,
    uploadImage: PropTypes.func.isRequired,
    maxWidth: PropTypes.number,
    maxHeight: PropTypes.number,
    showAddToReports: PropTypes.bool,
    onAddToReports: PropTypes.func,
    selectedImages: PropTypes.array,
    onOrderChange: PropTypes.func
  }

  state = {
    status: '',
    showRemoveConfirmation: [],
    preview: false
  }

  showPreview = url => {
    this.setState({ preview: url })
  }

  hidePreview = () => {
    this.setState({ preview: false })
  }

  handleResize = file => {
    return new Promise((resolve, reject) => {
      Resize(file, 100, 100, function(resizedDataUrl) {
        resolve(
          Object.assign(file, { url: resizedDataUrl, originalUrl: file.url })
        )
      })
    })
  }

  checkImageSize = file => {
    return new Promise((resolve, reject) => {
      checkImageSize(file, function(isValid) {
        if (isValid) resolve(true)
        else reject('Image size is too large')
      })
    })
  }

  handleFile = event => {
    this.setState({ status: 'loading' })
    const uploads = Object.values(event.currentTarget.files).map(async file => {
      // const checkSize = await this.checkImageSize(file)
      // if (checkSize === 0) throw new Error('failed')
      const resizedFile = await this.handleResize(file)
      const data = new FormData()
      data.append('file', resizedFile.url)
      data.append('filename', resizedFile.name)
      const uploadUrl = await this.props.uploadImage(data)

      return { [file.name]: Object.assign(file, { uploadUrl }) }
    })

    Promise.all(uploads)
      .then(this.handleUploadSuccess)
      .catch(err => {
        console.error(err)
        this.setState({ status: 'fail' })
      })
    event.target.value = null //clears out the event that persists in the input tag.
  }

  handleUploadSuccess = imagesArray => {
    const images = imagesArray.reduce(
      (acc, image) => ({ ...acc, ...image }),
      Object.assign({}, this.props.images)
    )

    this.setState({
      status: 'success'
    })
    this.props.onFieldUpdate(images)
  }

  handleShowRemoveConfirmation = key => {
    this.setState({
      showRemoveConfirmation: this.state.showRemoveConfirmation.concat(key)
    })
  }

  handleHideRemoveConfirmation = (event, keyToRemove) => {
    event.preventDefault()
    event.stopPropagation()
    this.setState({
      showRemoveConfirmation: this.state.showRemoveConfirmation.filter(
        key => key !== keyToRemove
      )
    })
  }

  handleImageRemove = (event, key) => {
    event.preventDefault()
    event.stopPropagation()
    let images = Object.assign({}, this.props.images)
    delete images[key]
    this.props.onFieldUpdate(images)
  }

  render() {
    const { showRemoveConfirmation } = this.state
    const {
      showAddToReports,
      onAddToReports,
      selectedImages,
      onOrderChange
    } = this.props
    return (
      <div className={styles.cardUpload}>
        {!(this.props.images && Object.keys(this.props.images).length > 0) && (
          <div className={styles.cardUploadInput}>
            <label htmlFor={this.props.name}>
              <span>Upload</span>
              <input
                aria-label="File upload form input"
                type="file"
                name={this.props.name}
                accept="image/*"
                onChange={this.handleFile}
                data-test="file-input"
                multiple
              />
            </label>
          </div>
        )}
        {this.props.images && Object.keys(this.props.images).length > 0 ? (
          <div className={styles.cardUploadContainer}>
            {Object.keys(this.props.images).map(key => {
              let image = this.props.images[key]
              const selectedImageIndex = selectedImages
                ? selectedImages.findIndex(
                    selectedImage => selectedImage === image.uploadUrl
                  )
                : -1
              const isChecked = selectedImageIndex > -1
              return (
                <div className={styles.cardUploadImage} key={key}>
                  {(!image.uploadUrl || this.state.status === 'loading') && (
                    <div className={styles.cardUploadImageLoader}>
                      <Loader />
                    </div>
                  )}
                  {!image.uploadUrl && (
                    <img src={image.preview} className={styles.loading} />
                  )}
                  {image.uploadUrl && (
                    <img
                      onClick={() => {
                        this.showPreview(image.uploadUrl)
                      }}
                      data-test="image-preview"
                      src={image.preview}
                    />
                  )}
                  {showAddToReports && (
                    <div>
                      <div className={styles.checkboxContainer}>
                        <input
                          defaultChecked={isChecked}
                          onClick={e =>
                            onAddToReports(image.uploadUrl, e.target.checked)
                          }
                          value={'asdf'}
                          className={classNames(
                            isChecked ? styles['checked'] : ''
                          )}
                          type="checkbox"
                        />
                        <span>Include in reports</span>
                      </div>
                      {isChecked && (
                        <div className={styles.field}>
                          <span>Order: </span>
                          <select
                            id={'image_order'}
                            className={styles.input}
                            value={selectedImageIndex}
                            onChange={onOrderChange(
                              image.uploadUrl,
                              selectedImageIndex
                            )}
                          >
                            {[...Array(selectedImages.length).keys()].reduce(
                              (acc, _, index) =>
                                acc.concat(
                                  <option key={index} value={index}>
                                    {index + 1}
                                  </option>
                                ),
                              [
                                <option key="default" value="" disabled={true}>
                                  Select Order
                                </option>
                              ]
                            )}
                          </select>
                          <div className={styles.selectIcons}>
                            <i
                              className={classNames(
                                'material-icons',
                                styles.selectArrow
                              )}
                            >
                              arrow_drop_down
                            </i>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {image.uploadUrl &&
                    !image.isRemovable &&
                    !showRemoveConfirmation.includes(key) && (
                      <div
                        className={styles.cardUploadRemove}
                        onClick={() => {
                          this.handleShowRemoveConfirmation(key)
                        }}
                      >
                        <i className="material-icons">close</i>
                      </div>
                    )}
                  {showRemoveConfirmation.includes(key) && (
                    <div className={styles.cardUploadRemoveConfirmation}>
                      <div>Are you sure?</div>
                      <div className={styles.confirmationButtons}>
                        <span
                          className={classNames(styles.yes, 'extrasClick')}
                          onClick={event => {
                            this.handleImageRemove(event, key)
                          }}
                        >
                          Yes
                        </span>
                        <span
                          className={classNames(styles.no, 'extrasClick')}
                          onClick={event => {
                            this.handleHideRemoveConfirmation(event, key)
                          }}
                        >
                          No
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div></div>
        )}

        {this.state.status === 'fail' && (
          <p>
            Sorry, we couldn't upload this image. Please try again or upload a
            smaller image.
          </p>
        )}

        {this.state.preview && (
          <ImageModal
            handleCloseImageModal={this.hidePreview}
            imageUrl={this.state.preview}
          />
        )}
      </div>
    )
  }
}

const mapStateToProps = state => ({
  uploader: state.uploader
})

export default connect(
  mapStateToProps,
  {
    uploadImage
  }
)(CardIconUpload)
