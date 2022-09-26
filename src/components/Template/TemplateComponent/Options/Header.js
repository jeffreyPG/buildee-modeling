import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './TemplateOptions.scss'
import {
  uploadImage,
  headerTemplate,
  templateUpdateError
} from '../../../../routes/Template/modules/template'
import { DividerBase } from './DividerBase'

const layoutOptions = [
  {
    name: 'Image (Left), Text (Right)',
    value: 'image_and_text'
  },
  {
    name: 'Image (Left), Page Number (Right)',
    value: 'image_and_pagenumber'
  },
  {
    name: 'Text (Left), Image (Right)',
    value: 'text_and_image'
  },
  {
    name: 'Text (Left), Page Number (Right)',
    value: 'text_and_pagenumber'
  },
  {
    name: 'Text (Center)',
    value: 'text_center'
  },
  {
    name: 'Image (Center)',
    value: 'image_center'
  },
  {
    name: 'None',
    value: 'none'
  }
]

const getLayouts = value => {
  const layout = []
  let float = ''
  switch (value) {
    case 'image_and_text':
      layout.push('image', 'text')
      break
    case 'image_and_pagenumber':
      layout.push('image', 'pageBreak')
      break
    case 'text_and_image':
      layout.push('text', 'image')
      break
    case 'text_and_pagenumber':
      layout.push('text', 'pageBreak')
      break
    case 'text_center':
      float = 'center'
      layout.push('text', 'center')
      break
    case 'image_center':
      float = 'center'
      layout.push('image')
      break
  }
  return { layout, float }
}

export class Header extends Component {
  static propTypes = {
    headerTemplate: PropTypes.func.isRequired,
    templateUpdateError: PropTypes.func.isRequired,
    headerTemplate: PropTypes.func.isRequired,
    header: PropTypes.object,
    uploadImage: PropTypes.func.isRequired
  }

  state = {
    headerShow: false,
    headerImageStatus: '',
    inputError: false,
    showDivider: false
  }

  componentDidUpdate = prevProps => {
    const { header } = this.props
    if (prevProps !== this.props) {
      if (header) {
        if (header.image && header.image !== '') {
          this.setState({ headerImageStatus: 'success' })
        }
        if (header.dividerConfig) {
          this.setState({ showDivider: true })
        }
        if (header.position) {
          this.setState({ layoutOption: header.position })
        } else {
          this.setState({ layoutOption: layoutOptions[0].value })
        }
        if (header.position) {
          this.setState({ headerShow: true })
        } else if (header.text === '') {
        } else if (header.text === undefined && header.image === undefined) {
          this.setState({
            headerShow: false,
            headerImageStatus: ''
          })
        }
      }
    }
  }

  handleClickHeaderDisplay = action => {
    if (action === 'add') {
      this.setState({ headerShow: true })
      this.props.headerTemplate({
        text: '',
        image: '',
        divider: null,
        position: layoutOptions[0].value
      })
    } else {
      this.props.headerTemplate({
        text: '',
        image: '',
        divider: null,
        position: null
      })
      this.props.templateUpdateError()
      this.setState({
        headerShow: false,
        headerImageStatus: '',
        showDivider: false
      })
    }
  }

  handleOutsideClick = e => {
    const icon = e.target.closest('i')
    if (
      (this.node !== null && this.node.contains(e.target)) ||
      icon === e.target
    ) {
      return
    }
    this.handleClick()
  }

  handleClick = () => {
    if (this.node !== null) {
      if (!this.state.headerShow) {
        document.addEventListener('click', this.handleOutsideClick, false)
      } else {
        document.removeEventListener('click', this.handleOutsideClick, false)
      }
    }
    this.setState(prevState => ({
      headerShow: !prevState.headerShow
    }))
  }

  handleTextInput = event => {
    let { header } = this.props
    this.props.headerTemplate({
      ...header,
      text: event.target.value
    })
    this.props.templateUpdateError()
  }

  handleImageRemove = () => {
    let { header } = this.props
    this.props.headerTemplate({
      ...header,
      image: ''
    })
    this.props.templateUpdateError()
    this.setState({ headerImageStatus: '' })
  }

  handleClearInputValue = e => {
    e.target.value = ''
  }

  handleImageUpload = e => {
    var file = e.target.files[0]
    var self = this
    this.setState({ headerImageStatus: 'loading' })

    const data = new FormData()
    data.append('file', file)
    data.append('filename', file.name)

    self.props
      .uploadImage(data)
      .then(imageUrl => {
        // update state in parent component
        let { header } = self.props
        self.props.headerTemplate({
          ...header,
          image: imageUrl
        })
        self.props.templateUpdateError()
        // update status in current component
        self.setState({ headerImageStatus: 'success' })
      })
      .catch(() => {
        self.setState({ headerImageStatus: 'fail' })
      })
  }

  handleClickLayoutOption = e => {
    const value = e.target.value
    let { header } = this.props
    this.props.headerTemplate({
      ...header,
      position: value
    })
    this.props.templateUpdateError()
  }

  handleChangeColor = color => {
    const { header } = this.props
    const dividerConfig = header.dividerConfig || {}
    dividerConfig.color = color
    this.props.headerTemplate({
      ...header,
      dividerConfig
    })
    this.props.templateUpdateError()
  }

  handleChangeWidth = event => {
    const { header } = this.props
    const dividerConfig = header.dividerConfig || {}
    dividerConfig.width = event.target.value
    this.props.headerTemplate({
      ...header,
      dividerConfig
    })
    this.props.templateUpdateError()
  }

  renderLayoutOption = () => {
    const { layoutOption } = this.state
    return (
      <div className={styles.selectContainer}>
        <select
          onChange={this.handleClickLayoutOption}
          value={layoutOption}
          name="Range"
          id="Range"
        >
          {layoutOptions.map((item, i) => {
            return (
              <option key={`item_${item.name}`} value={item.value}>
                {item.name}
              </option>
            )
          })}
        </select>
      </div>
    )
  }

  toggleShowDivider = () => {
    const { showDivider } = this.state
    const { header } = this.props
    this.setState({ showDivider: !showDivider })
    this.props.headerTemplate({
      ...header,
      dividerConfig: null
    })
  }
  renderImage = (index, float) => {
    const { header } = this.props
    return (
      <div
        key={`layoutOptions_${index}`}
        className={classNames(
          styles['editor-body__container'],
          styles.layoutContainer,
          styles[`layoutContainer-${float}`]
        )}
      >
        <div className={styles['editor-body__info']}>
          <i className="material-icons">insert_photo</i>
          <span>Image</span>
        </div>
        <br />
        <label className={styles['editor-header__file']}>
          {this.state.headerImageStatus !== 'success' && (
            <span className={styles['editor-header__img-add']}>Image file</span>
          )}
          <input
            type="file"
            name="header-logo"
            accept="image/*"
            onClick={e => {
              this.handleClearInputValue(e)
            }}
            onChange={e => {
              this.handleImageUpload(e)
            }}
          />
        </label>
        <div className={styles['editor-header__image']}>
          {this.state.headerImageStatus === 'success' && (
            <img src={header.image} />
          )}
          {this.state.headerImageStatus === 'success' && (
            <div
              className={styles['editor-header__img-remove']}
              onClick={() => {
                this.handleImageRemove()
              }}
            >
              <i className="material-icons">delete</i>
            </div>
          )}
        </div>
      </div>
    )
  }
  renderText = (index, float) => {
    const { header } = this.props
    return (
      <div
        key={`layoutOptions_${index}`}
        className={classNames(
          styles['editor-body__container'],
          styles.layoutContainer,
          styles[`layoutContainer-${float}`]
        )}
      >
        <div className={styles['editor-body__info']}>
          <i className="material-icons">text_fields</i>
          <span>Text</span>
        </div>
        <br />
        <label className={styles['editor-header__text']}>
          <input
            placeholder="Replace with your header text"
            defaultValue={header && header.text ? header.text : ''}
            type="text"
            name="header-text"
            onChange={e => {
              this.handleTextInput(e)
            }}
          />
        </label>
      </div>
    )
  }
  renderPageBreak = index => (
    <div
      key={`layoutOptions_${index}`}
      className={classNames(
        styles['editor-body__container'],
        styles.layoutContainer
      )}
    >
      <span>Pg</span>
    </div>
  )
  renderLayouts = (layouts, float) => {
    return layouts.map((layout, index) => {
      switch (layout) {
        case 'image':
          return this.renderImage(index, float)
        case 'text':
          return this.renderText(index, float)
        case 'pageBreak':
          return this.renderPageBreak(index)
      }
    })
  }
  render() {
    const { showDivider, layoutOption } = this.state
    const { header } = this.props
    const { layout, float } = getLayouts(layoutOption)
    return (
      <div
        className={classNames(
          styles['editor-header'],
          this.state.headerShow ? styles['headerShow'] : ''
        )}
      >
        <div className={styles['content-options']}>
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
              this.handleClickHeaderDisplay('remove')
            }}
            className="material-icons"
          >
            delete
          </i>
        </div>
        <div
          ref={node => {
            this.node = node
          }}
        >
          {!this.state.headerShow ? (
            <div
              className={styles['editor-header--show']}
              onClick={() => {
                this.handleClickHeaderDisplay('add')
              }}
            >
              <i className="material-icons">add</i>
              Add header content
            </div>
          ) : (
            <div className={styles['editor-header__content']}>
              <div className={styles['editor-body__info']}>
                <span>Header</span>
                {header &&
                  !(
                    (layout.indexOf('text') > -1 && header.text !== '') ||
                    (layout.indexOf('image') > -1 && header.image !== '')
                  ) && (
                    <div className={styles.editorBodyWarning}>
                      <i className="material-icons warning">warning</i>
                      No text added
                    </div>
                  )}
              </div>
              <br />
              <h3>Layout</h3>
              <div className={styles['editor-body__dropdown']}>
                {this.renderLayoutOption()}
              </div>
              {layout.length > 0 && <h3>Contents</h3>}
              <br />
              <div className={styles['editor-header__inner']}>
                {this.renderLayouts(layout, float)}
              </div>
              <br />
              <div
                className={classNames(
                  styles['editor-body__container'],
                  styles.layoutContainer
                )}
              >
                {!showDivider ? (
                  <button
                    className={classNames(
                      styles.button,
                      styles.buttonPrimary,
                      styles.buttonAddDivider
                    )}
                    onClick={this.toggleShowDivider}
                  >
                    Add Divider
                  </button>
                ) : (
                  <DividerBase
                    toggleShowDivider={this.toggleShowDivider}
                    handleChangeColor={this.handleChangeColor}
                    handleChangeWidth={this.handleChangeWidth}
                    dividerConfig={header.dividerConfig}
                  />
                )}
              </div>
              {this.state.headerImageStatus === 'fail' && (
                <span className={styles['content-options__error']}>
                  Please upload an image that does not exceed a height of 100px
                  or a width of 300px
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = {
  uploadImage,
  headerTemplate,
  templateUpdateError
}

const mapStateToProps = state => ({
  header: state.template.templateViewHeader
})

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps
)

export default withConnect(Header)
