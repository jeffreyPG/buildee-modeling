import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './TemplateOptions.scss'
import ColorPicker from '../../../UI/ColorPicker'
import {
  bodyTemplate,
  templateUpdateError
} from 'routes/Template/modules/template'

const widthOptions = [
  { name: '1/2 pt', value: 1 / 2 },
  { name: '1/4 pt', value: 1 / 4 },
  { name: '3/4 pt', value: 3 / 4 },
  { name: '1 pt', value: 1 },
  { name: '1 1/2 pt', value: 3 / 2 },
  { name: '2 1/4 pt', value: 9 / 4 },
  { name: '3 pt', value: 3 },
  { name: '4 1/2 pt', value: 9 / 2 },
  { name: '6 pt', value: 6 }
]

export class Divider extends Component {
  static propTypes = {
    closeAllOptions: PropTypes.bool.isRequired,
    bodyTemplate: PropTypes.func.isRequired,
    templateUpdateError: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    removeWidget: PropTypes.func.isRequired,
    setCloseAllOptions: PropTypes.func.isRequired,
    widget: PropTypes.object.isRequired
  }

  state = {
    optionsVisible: false,
    deleteToggleOpen: false
  }

  handleChangeColor = color => {
    let body = JSON.parse(JSON.stringify(this.props.body))
    if (!body[this.props.index].dividerConfig)
      body[this.props.index].dividerConfig = {}
    body[this.props.index].dividerConfig.color = color
    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }

  handleChangeWidth = event => {
    let body = JSON.parse(JSON.stringify(this.props.body))
    if (!body[this.props.index].dividerConfig)
      body[this.props.index].dividerConfig = {}
    body[this.props.index].dividerConfig.width = event.target.value
    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }

  componentWillUnmount = () => {
    this.props.setCloseAllOptions(true)
  }

  handleClickRemoveWidget = () => {
    this.setState({ deleteToggleOpen: false })
    let body = JSON.parse(JSON.stringify(this.props.body))
    body.splice(this.props.index, 1)
    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
    this.props.removeWidget(this.props.index)
  }

  handleClick = () => {
    if (this.node !== null) {
      this.props.setCloseAllOptions(false)
      if (!this.state.optionsVisible) {
        document.addEventListener('click', this.handleOutsideClick, false)
      } else {
        document.removeEventListener('click', this.handleOutsideClick, false)
      }
      this.setState(prevState => ({
        optionsVisible: !prevState.optionsVisible
      }))
    }
  }

  handleOutsideClick = e => {
    const portal = e.target.closest('#portal')
    if ((this.node !== null && this.node.contains(e.target)) || portal) {
      return
    }
    this.handleClick()
  }

  handleRemoveToggle = toggle => {
    if (toggle) {
      this.setState({ deleteToggleOpen: !this.state.deleteToggleOpen })
    } else {
      this.setState({ deleteToggleOpen: false })
    }
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
    const { closeAllOptions, index, body, widget } = this.props
    const card = body[index]
    const dividerConfig = card ? card.dividerConfig : null
    const color = (dividerConfig && dividerConfig.color) || ''
    const width = (dividerConfig && dividerConfig.width) || ''
    let text
    if (color === '') text = 'Color is not selected'
    if (width === '') text = 'Width is not selected'
    if (color === '' && width === '') text = 'No fields selected'

    return (
      <div className={classNames(styles['editor-body'], styles['z-auto'])}>
        <div className={styles['editor-body__info']}>
          <span>{widget.text}</span>
          {(color === '' || width === '') && (
            <div className={styles.editorBodyWarning}>
              <i className="material-icons warning">warning</i>
              {text}
            </div>
          )}
        </div>

        {this.renderControlOptions()}
        <div
          className={classNames(
            styles['editor-body__options'],
            styles['editor-body__text-list']
          )}
          ref={node => {
            this.node = node
          }}
        >
          <p
            style={{
              backgroundColor: color,
              height: `${width}pt`
            }}
          />
          {!closeAllOptions && this.state.optionsVisible && (
            <div className={classNames(styles['editor-divider'])}>
              <div className={classNames(styles['editor-divider__color'])}>
                <p>Color</p>
                <div>
                  <span>#</span>
                  <div>
                    <ColorPicker
                      handleChangeColor={this.handleChangeColor}
                      color={color}
                      index={index}
                    />
                    <div
                      className={classNames(styles['colorImg'])}
                      style={{ backgroundColor: color }}
                    />
                  </div>
                </div>
              </div>
              <div className={classNames(styles['editor-divider__width'])}>
                <p>Line Weight</p>
                <div className={styles.selectContainer}>
                  <select
                    value={width}
                    onChange={e => this.handleChangeWidth(e)}
                  >
                    <option defaultValue value="" disabled>
                      Select width
                    </option>
                    {widthOptions.map((field, i) => {
                      return (
                        <option key={i} value={field.value}>
                          {field.name}
                        </option>
                      )
                    })}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = {
  bodyTemplate,
  templateUpdateError
}

const mapStateToProps = state => ({
  body: state.template.templateViewBody || []
})

const withConnect = connect(mapStateToProps, mapDispatchToProps)

export default withConnect(Divider)
