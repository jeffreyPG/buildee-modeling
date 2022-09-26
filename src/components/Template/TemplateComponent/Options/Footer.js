import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './TemplateOptions.scss'
import {
  uploadImage,
  footerTemplate,
  templateUpdateError
} from '../../../../routes/Template/modules/template'
import { DividerBase } from './DividerBase'

const layoutOptions = [
  {
    name: 'Page Number (Center)',
    value: 'pagenumber_center'
  },
  {
    name: 'Page Number (Left)',
    value: 'pagenumber_left'
  },
  {
    name: 'Page Number (Right)',
    value: 'pagenumber_right'
  },
  {
    name: 'Image (Left), Page Number (Right)',
    value: 'image_and_pagenumber'
  },
  {
    name: 'Text (Left), Page Number (Right)',
    value: 'text_and_pagenumber'
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
    case 'pagenumber_center':
      float = 'center'
      layout.push('pageBreak')
      break
    case 'pagenumber_left':
      layout.push('pageBreak')
      float = 'left'
      break
    case 'pagenumber_right':
      float = 'right'
      layout.push('pageBreak')
      break
    case 'image_and_pagenumber':
      layout.push('image', 'pageBreak')
      break
    case 'text_and_pagenumber':
      layout.push('text', 'pageBreak')
      break
  }
  return { layout, float }
}

export class Footer extends Component {
  static propTypes = {
    footerTemplate: PropTypes.func.isRequired,
    templateUpdateError: PropTypes.func.isRequired,
    footer: PropTypes.object,
    uploadImage: PropTypes.func.isRequired
  }

  state = {
    footerShow: false,
    footerImageStatus: '',
    showDivider: false
  }

  componentDidUpdate = prevProps => {
    const { footer } = this.props
    if (prevProps !== this.props) {
      if (footer) {
        if (footer.image && footer.image !== '') {
          this.setState({ footerImageStatus: 'success' })
        }
        if (footer.dividerConfig) {
          this.setState({ showDivider: true })
        }
        if (footer.position) {
          this.setState({ layoutOption: footer.position })
        } else {
          this.setState({ layoutOption: layoutOptions[0].value })
        }
        if (footer.position) {
          this.setState({ footerShow: true })
        } else if (footer.text === '') {
        } else if (footer.text === undefined && footer.image === undefined) {
          this.setState({
            footerShow: false,
            footerImageStatus: ''
          })
        }
      }
    }
  }

  handleClickFooterDisplay = action => {
    if (action === 'add') {
      this.setState({ footerShow: true })
      this.props.footerTemplate({
        text: '',
        image: '',
        divider: null,
        position: layoutOptions[0].value
      })
    } else {
      this.props.footerTemplate({
        text: '',
        image: '',
        divider: null,
        position: null
      })
      this.props.templateUpdateError()
      this.setState({ footerShow: false, showDivider: false })
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
      if (!this.state.footerShow) {
        document.addEventListener('click', this.handleOutsideClick, false)
      } else {
        document.removeEventListener('click', this.handleOutsideClick, false)
      }
    }
    this.setState(prevState => ({
      footerShow: !prevState.footerShow
    }))
  }

  handleTextInput = event => {
    const { footer } = this.props
    this.props.footerTemplate({
      ...footer,
      text: event.target.value
    })
    this.props.templateUpdateError()
  }

  handleChangeColor = color => {
    const { footer } = this.props
    const dividerConfig = footer.dividerConfig || {}
    dividerConfig.color = color
    this.props.footerTemplate({
      ...footer,
      dividerConfig
    })
    this.props.templateUpdateError()
  }

  handleChangeWidth = event => {
    const { footer } = this.props
    const dividerConfig = footer.dividerConfig || {}
    dividerConfig.width = event.target.value
    this.props.footerTemplate({
      ...footer,
      dividerConfig
    })
    this.props.templateUpdateError()
  }

  handleImageRemove = () => {
    let { footer } = this.props
    this.props.footerTemplate({
      ...footer,
      image: ''
    })
    this.props.templateUpdateError()
    this.setState({ footerImageStatus: '' })
  }

  handleClearInputValue = e => {
    e.target.value = ''
  }

  handleImageUpload = e => {
    var file = e.target.files[0]
    var self = this
    this.setState({ footerImageStatus: 'loading' })

    const data = new FormData()
    data.append('file', file)
    data.append('filename', file.name)

    self.props
      .uploadImage(data)
      .then(imageUrl => {
        // update state in parent component
        let { footer } = self.props
        self.props.footerTemplate({
          ...footer,
          image: imageUrl
        })
        self.props.templateUpdateError()
        // update status in current component
        self.setState({ footerImageStatus: 'success' })
      })
      .catch(() => {
        self.setState({ footerImageStatus: 'fail' })
      })
  }

  handleClickLayoutOption = e => {
    const value = e.target.value
    let { footer } = this.props
    this.props.footerTemplate({
      ...footer,
      position: value
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
          name="FooterRanger"
          id="Footer_Ranger"
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
    const { footer } = this.props
    this.setState({ showDivider: !showDivider })
    this.props.footerTemplate({
      ...footer,
      dividerConfig: null
    })
  }

  renderImage = index => {
    const { footer } = this.props
    return (
      <div
        key={`layoutOptions_${index}`}
        className={classNames(
          styles['editor-body__container'],
          styles.layoutContainer
        )}
      >
        <div className={styles['editor-body__info']}>
          <i className="material-icons">insert_photo</i>
          <span>Image</span>
        </div>
        <br />
        <label className={styles['editor-header__file']}>
          {this.state.footerImageStatus !== 'success' && (
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
          {this.state.footerImageStatus === 'success' && (
            <img src={footer.image} />
          )}
          {this.state.footerImageStatus === 'success' && (
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
  renderText = index => {
    const { footer } = this.props
    return (
      <div
        key={`layoutOptions_${index}`}
        className={classNames(
          styles['editor-body__container'],
          styles.layoutContainer
        )}
      >
        <div className={styles['editor-body__info']}>
          <i className="material-icons">text_fields</i>
          <span>Text</span>
        </div>
        <br />
        <label className={styles['editor-footer__inner']}>
          <input
            placeholder="Replace with your footer text"
            defaultValue={footer.text ? footer.text : ''}
            type="text"
            name="footer-text"
            onChange={e => {
              this.handleTextInput(e)
            }}
          />
        </label>
      </div>
    )
  }
  renderPageBreak = (index, float) => (
    <div
      key={`layoutOptions_${index}`}
      className={classNames(
        styles['editor-body__container'],
        styles.layoutContainer,
        styles[`layoutContainer-${float}`]
      )}
    >
      <span>Pg</span>
    </div>
  )
  renderLayouts = (layouts, float) => {
    return layouts.map((layout, index) => {
      switch (layout) {
        case 'image':
          return this.renderImage(index)
        case 'text':
          return this.renderText(index)
        case 'pageBreak':
          return this.renderPageBreak(index, float)
      }
    })
  }

  render() {
    const { footer } = this.props
    const { showDivider, layoutOption } = this.state
    const { layout, float } = getLayouts(layoutOption)
    return (
      <div
        className={classNames(
          styles['editor-footer'],
          this.state.footerShow ? styles['footerShow'] : ''
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
              this.handleClickFooterDisplay('remove')
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
          {!this.state.footerShow ? (
            <div
              className={styles['editor-footer--show']}
              onClick={() => {
                this.handleClickFooterDisplay('add')
              }}
            >
              <i className="material-icons">add</i>
              Add footer content
            </div>
          ) : (
            <div className={styles['editor-footer__content']}>
              <div className={styles['editor-body__info']}>
                <span>Footer</span>
                {layout.indexOf('text') > -1 && footer.text === '' && (
                  <div className={styles.editorBodyWarning}>
                    <i className="material-icons warning">warning</i>
                    No text added
                  </div>
                )}
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
                    dividerConfig={footer.dividerConfig}
                  />
                )}
              </div>
              <br />
              <h3>Layout</h3>
              <div className={styles['editor-body__dropdown']}>
                {this.renderLayoutOption()}
              </div>
              {layout.length > 0 && <h3>Contents</h3>}
              <div className={styles['editor-header__inner']}>
                {this.renderLayouts(layout, float)}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = {
  uploadImage,
  footerTemplate,
  templateUpdateError
}

const mapStateToProps = state => ({
  footer: state.template.templateViewFooter
})

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps
)

export default withConnect(Footer)
