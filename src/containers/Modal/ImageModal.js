import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './ImageModal.scss'

export class ImageModal extends React.Component {
  static propTypes = {
    imageUrl: PropTypes.string.isRequired
  }

  render() {
    return (
      <div className={styles.imageModal}>
        <div className={styles.imageModalInside}>
          <img src={this.props.imageUrl} />
          <div
            className={styles.imageModalClose}
            onClick={() => this.props.handleCloseImageModal()}
          >
            <i className="material-icons">close</i>
          </div>
        </div>
      </div>
    )
  }
}
export default ImageModal
