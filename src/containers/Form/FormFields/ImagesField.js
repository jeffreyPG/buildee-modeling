import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Field } from '../FormFields'
import { uploadImage } from '../../../utils/Uploader/modules/uploader'
import styles from './ImagesField.scss'
import { Loader } from 'utils/Loader'
import ImageModal from '../../Modal/ImageModal'
import { Resize } from 'utils/Utils'
import classNames from 'classnames'

/*
 *
 * The Images Field takes care of uploading multiple images and viewing them in a modal
 * */

class ImagesField extends React.Component {
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

  static defaultProps = {
    maxWidth: 900,
    maxHeight: 900
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
    const { maxWidth, maxHeight } = this.props
    return new Promise((resolve, reject) => {
      Resize(file, maxWidth, maxHeight, function(resizedDataUrl) {
        resolve(
          Object.assign(file, { url: resizedDataUrl, originalUrl: file.url })
        )
      })
    })
  }

  handleFile = event => {
    this.setState({ status: 'loading' })
    const uploads = Object.values(event.currentTarget.files).map(async file => {
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

  handleHideRemoveConfirmation = keyToRemove => {
    this.setState({
      showRemoveConfirmation: this.state.showRemoveConfirmation.filter(
        key => key !== keyToRemove
      )
    })
  }

  handleImageRemove = key => {
    let images = Object.assign({}, this.props.images)
    delete images[key]
    console.log('images', images)
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
      <div className={styles.imagesField}>
        <div className={styles.imagesFieldInput}>
          <label htmlFor={this.props.name}>
            <span>Select Image</span>
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
        {this.props.images && Object.keys(this.props.images).length > 0 && (
          <div className={styles.imagesFieldContainer}>
            {Object.keys(this.props.images).map(key => {
              let image = this.props.images[key]
              const selectedImageIndex = selectedImages
                ? selectedImages.findIndex(
                    selectedImage => selectedImage === image.uploadUrl
                  )
                : -1
              const isChecked = selectedImageIndex > -1
              return (
                <div className={styles.imagesFieldImage} key={key}>
                  {(!image.uploadUrl || this.state.status === 'loading') && (
                    <div className={styles.imagesFieldImageLoader}>
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
                        className={styles.imagesFieldRemove}
                        onClick={() => {
                          this.handleShowRemoveConfirmation(key)
                        }}
                      >
                        <i className="material-icons">close</i>
                      </div>
                    )}
                  {showRemoveConfirmation.includes(key) && (
                    <div className={styles.imagesFieldRemoveConfirmation}>
                      <div>Are you sure?</div>
                      <div className={styles.confirmationButtons}>
                        <span
                          className={styles.yes}
                          onClick={() => {
                            this.handleImageRemove(key)
                          }}
                        >
                          Yes
                        </span>
                        <span
                          className={styles.no}
                          onClick={() => {
                            this.handleHideRemoveConfirmation(key)
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
)(ImagesField)
