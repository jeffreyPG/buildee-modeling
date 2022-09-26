import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames'
import styles from './TemplateOptions.scss'
import { Loader } from 'utils/Loader'
import { Resize } from 'utils/Utils'
import {
  uploadImage,
  bodyTemplate,
  templateUpdateError
} from '../../../../routes/Template/modules/template'

export class Image extends Component {
  static propTypes = {
    closeAllOptions: PropTypes.bool.isRequired,
    bodyTemplate: PropTypes.func.isRequired,
    templateUpdateError: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    removeWidget: PropTypes.func.isRequired,
    setCloseAllOptions: PropTypes.func.isRequired,
    body: PropTypes.array.isRequired,
    uploadImage: PropTypes.func.isRequired,
    widget: PropTypes.object.isRequired
  }

  state = {
    optionsVisible: false,
    deleteToggleOpen: false,
    bodyImageStatus: '',
    preview: {
      type:
        this.props.body[this.props.index] &&
        this.props.body[this.props.index].type
          ? this.props.body[this.props.index].type
          : '',
      fields:
        this.props.body[this.props.index] &&
        this.props.body[this.props.index].fields
          ? this.props.body[this.props.index].fields
          : [],
      content:
        this.props.body[this.props.index] &&
        this.props.body[this.props.index].content
          ? this.props.body[this.props.index].content
          : ''
    }
  }

  componentDidUpdate = prevProps => {
    const { index, body } = this.props
    if (prevProps !== this.props) {
      if (
        body &&
        body[index] &&
        body[index].content &&
        body[index].content !== ''
      ) {
        this.setState({ bodyImageStatus: 'success' })
      }
      if (body[index] && body[index].fields) {
        let modifiedPreview = { ...this.state.preview }
        ;(modifiedPreview.fields = body[index].fields),
          this.setState({ preview: modifiedPreview })
      }
    }
  }

  componentWillUnmount = () => {
    this.props.setCloseAllOptions(true)
  }

  handleRemoveToggle = toggle => {
    if (toggle) {
      this.setState({ deleteToggleOpen: !this.state.deleteToggleOpen })
    } else {
      this.setState({ deleteToggleOpen: false })
    }
  }

  handleClickRemoveWidget = () => {
    this.setState({ deleteToggleOpen: false })
    this.props.removeWidget(this.props.index)
    let body = JSON.parse(JSON.stringify(this.props.body))
    body.splice(this.props.index, 1)
    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }

  handleImageRemove = () => {
    this.setState({ bodyImageStatus: '' })
    let body = JSON.parse(JSON.stringify(this.props.body))
    body[this.props.index].content = ''
    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }

  handleClearInputValue = e => {
    e.target.value = ''
  }

  handleImageUpload = e => {
    var file = e.target.files[0]
    var self = this
    var maxWidth = 2000
    var maxHeight = 2000
    this.setState({ bodyImageStatus: 'loading' })

    Resize(file, maxWidth, maxHeight, function(resizedDataUrl) {
      const data = new FormData()
      data.append('file', resizedDataUrl)
      data.append('filename', file.name)

      self.props
        .uploadImage(data)
        .then(imageUrl => {
          let body = JSON.parse(JSON.stringify(self.props.body))
          body[self.props.index].content = imageUrl
          self.props.bodyTemplate(body)
          self.props.templateUpdateError()
          self.setState({ bodyImageStatus: 'success' })
        })
        .catch(() => {
          self.setState({ bodyImageStatus: 'fail' })
        })
    })
  }

  handleClickSaveOption = event => {
    let body = JSON.parse(JSON.stringify(this.props.body))
    if (!body[this.props.index].fields) {
      body[this.props.index].fields = []
    }
    body[this.props.index].fields[0] = event.target.value
    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }

  renderImageOptions = array => {
    return array.map((field, i) => {
      const { index, body } = this.props
      const ids = 'list-style-' + field.value
      const checked = Boolean(
        body &&
          body[index] &&
          body[index].fields &&
          body[index].fields.length &&
          body[index].fields[0] === field.value
      )
      return (
        <label key={i} htmlFor={ids}>
          <input
            type="radio"
            id={ids}
            name="list-style"
            value={field.value}
            defaultChecked={checked}
            onChange={e => this.handleClickSaveOption(e)}
          />
          <span>{field.name}</span>
        </label>
      )
    })
  }

  handleClick = () => {
    if (this.node !== null) {
      this.props.setCloseAllOptions(false)
      if (!this.state.optionsVisible) {
        document.addEventListener('mouseDown', this.handleOutsideClick, false)
      } else {
        document.removeEventListener(
          'mouseDown',
          this.handleOutsideClick,
          false
        )
      }
      this.setState(prevState => ({
        optionsVisible: !prevState.optionsVisible
      }))
    }
  }

  handleOutsideClick = e => {
    if (this.node !== null && this.node.contains(e.target)) {
      return
    }
    this.handleClick()
  }

  renderControlOptions = () => {
    return (
      <div
        className={classNames(
          styles['content-options'],
          (!this.props.closeAllOptions && this.state.optionsVisible) ||
            this.state.deleteToggleOpen
            ? styles['optionsOpen']
            : ''
        )}
      >
        <i className={classNames('material-icons', styles['move'])}>gamepad</i>
        <i
          onClick={() => {
            this.handleClick()
          }}
          className="material-icons"
        >
          edit
        </i>
        <i
          onClick={() => {
            this.handleRemoveToggle(true)
          }}
          className="material-icons"
        >
          delete
        </i>

        {this.state.deleteToggleOpen && (
          <div className={styles['content-options__delete']}>
            <p>Delete this widget?</p>
            <div className={styles['content-options__delete-confirm']}>
              <div
                className={classNames(styles['content-options__btn-delete'])}
                onClick={() => this.handleClickRemoveWidget()}
              >
                Yes
              </div>
              <div
                className={classNames(styles['content-options__btn-cancel'])}
                onClick={() => this.handleRemoveToggle(false)}
              >
                No
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  render() {
    const { widget, index, closeAllOptions, body } = this.props
    const { optionsVisible } = this.state
    const imageOptions = [
      { name: 'Upload custom image', value: 'imageUpload' },
      { name: 'Pull main building image', value: 'buildingImage' }
    ]

    return (
      <div className={styles['editor-body']}>
        <div className={styles['editor-body__info']}>
          <i className="material-icons">insert_photo</i>
          <span>{widget.text}</span>
        </div>
        {this.renderControlOptions()}

        <div
          className={classNames(styles['editor-body__options'])}
          ref={node => {
            this.node = node
          }}
        >
          <div className={classNames(styles['editor-body__preview'])}>
            {this.state.preview.fields &&
              this.state.preview.fields.length === 0 && (
                <p>
                  <i>
                    Please click the pencil icon to select {widget.text} options
                  </i>
                </p>
              )}
            {this.state.preview.fields && this.state.preview.fields.length > 0 && (
              <p>
                {this.state.preview.fields.map((field, i) => {
                  var ret = [],
                    tmp
                  field.split('.').map(ele => {
                    tmp = ele.replace(/([A-Z])/g, ' $1').toLowerCase()
                    ret.push(tmp.charAt(0).toUpperCase() + tmp.slice(1))
                  })
                  if (this.state.preview.fields.length === i + 1) {
                    return <span key={i}>{ret[ret.length - 1]}</span>
                  } else {
                    return <span key={i}>{ret[ret.length - 1]} | </span>
                  }
                })}
              </p>
            )}
          </div>

          {!closeAllOptions && this.state.optionsVisible && (
            <div className={styles['editor-body__inner']}>
              {(this.state.bodyImageStatus === 'success' ||
                this.state.bodyImageStatus === '') &&
                body &&
                body[index] &&
                body[index].content &&
                this.state.preview &&
                this.state.preview.fields &&
                this.state.preview.fields[0] === 'imageUpload' && (
                  <div className={styles['editor-body__image']}>
                    <img src={body[index].content} />
                    <div
                      className={styles['editor-body__image-remove']}
                      onClick={() => {
                        this.handleImageRemove()
                      }}
                    >
                      <i className="material-icons">delete</i>
                    </div>
                  </div>
                )}

              <div
                className={classNames(
                  styles['editor-body__list-style'],
                  styles['editor-body__image-options']
                )}
              >
                <p>Choose an option:</p>
                {this.renderImageOptions(imageOptions)}
              </div>
              {body[index] &&
                body[index].fields &&
                body[index].fields.length > 0 &&
                body[index].fields[0] === 'imageUpload' && (
                  <div className={styles['editor-body__image-option']}>
                    {this.state.bodyImageStatus !== 'loading' &&
                      this.state.bodyImageStatus !== 'success' && (
                        <div className={styles['editor-body__image-input']}>
                          <label>
                            <p>Please select an image</p>
                            <input
                              type="file"
                              name="body-image"
                              accept="image/*"
                              onClick={e => {
                                this.handleClearInputValue(e)
                              }}
                              onChange={e => {
                                this.handleImageUpload(e)
                              }}
                            />
                          </label>
                        </div>
                      )}
                    {this.state.bodyImageStatus === 'loading' && <Loader />}
                    {this.state.bodyImageStatus === 'fail' && (
                      <p>Please upload a smaller image.</p>
                    )}
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = {
  bodyTemplate,
  templateUpdateError,
  uploadImage
}

const mapStateToProps = state => ({
  body: state.template.templateViewBody || []
})

const withConnect = connect(mapStateToProps, mapDispatchToProps)

export default withConnect(Image)
