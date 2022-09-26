import React from 'react'
import PropTypes from 'prop-types'
import Gallery from 'react-photo-gallery'
import styles from './GalleryView.scss'
import Measure from 'react-measure'

export class GalleryView extends React.Component {
  static propTypes = {
    urls: PropTypes.array.isRequired,
    onImageClick: PropTypes.func
  }
  state = {
    columns: 5
  }
  getPhotos = urls => {
    return urls.map((url, index) => {
      return {
        src: url,
        width: 1,
        height: 1,
        key: `${url}_${index}`,
        buildingId: '1234'
      }
    })
  }
  onWindowRezise = ({ bounds: { width } }) => {
    let { columns } = this.state
    if (width <= 800 && width > 600) {
      columns = 4
    } else if (width <= 600 && width > 500) {
      columns = 3
    } else if (width <= 500 && width > 400) {
      columns = 2
    } else if (width <= 400) {
      columns = 1
    }
    this.setState({ columns })
  }
  render() {
    const { urls, onImageClick } = this.props
    const { columns } = this.state
    return (
      <Measure bounds onResize={this.onWindowRezise}>
        {({ measureRef }) => (
          <div ref={measureRef} className={styles.container}>
            {urls.length > 0 ? (
              <Gallery
                photos={this.getPhotos(urls)}
                direction="column"
                columns={columns}
                onClick={onImageClick}
              />
            ) : (
              'No Images found'
            )}
          </div>
        )}
      </Measure>
    )
  }
}

export default GalleryView
