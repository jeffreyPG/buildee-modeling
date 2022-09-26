import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './TemplateOptions.scss'
import {
  bodyTemplate,
  templateUpdateError
} from 'routes/Template/modules/template'

export class Address extends Component {
  static propTypes = {
    closeAllOptions: PropTypes.bool.isRequired,
    bodyTemplate: PropTypes.func.isRequired,
    templateUpdateError: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    removeWidget: PropTypes.func.isRequired,
    setCloseAllOptions: PropTypes.func.isRequired,
    body: PropTypes.array.isRequired,
    widget: PropTypes.object.isRequired
  }

  state = {
    optionsVisible: false,
    deleteToggleOpen: false,
    imageStatus: ''
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
    let body = JSON.parse(JSON.stringify(this.props.body))
    body.splice(this.props.index, 1)
    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
    this.props.removeWidget(this.props.index)
  }

  handleImageLoaded = () => {
    this.setState({ imageStatus: 'loaded' })
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
    if (this.node && this.node !== null && this.node.contains(e.target)) {
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
    const { widget, closeAllOptions } = this.props
    return (
      <div className={styles['editor-body']}>
        <div className={styles['editor-body__info']}>
          <i className="material-icons">place</i>
          <span>{widget.text}</span>
        </div>

        {this.renderControlOptions()}

        <div
          className={styles['editor-body__options']}
          ref={node => {
            this.node = node
          }}
        >
          {!this.state.optionsVisible && (
            <div className={classNames(styles['editor-body__preview'])}>
              Depending on the address of your building, a map pin will display
              for your building in this section of your template. Please check
              the building address before exporting a report.
            </div>
          )}

          {!closeAllOptions && this.state.optionsVisible && (
            <div className={styles['editor-body__address']}>
              {this.state.imageStatus === 'loaded' && (
                <div
                  className={classNames(styles['editor-body__address-text'])}
                >
                  <span>
                    Depending on the address of your building, a map pin will
                    display for your building in this section of your template.
                    Please check the building address before exporting a report.
                  </span>
                </div>
              )}
              <img
                onLoad={this.handleImageLoaded}
                src="https://maps.googleapis.com/maps/api/staticmap?center=Reno,NV&zoom=13&size=600x300&maptype=satellite&markers=color:red%7Clabel:S%7C40.702147,-74.015794&key=AIzaSyBwwnkl41oPPHk_hwbCFEZnRwReZi1BASA"
              />
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

export default withConnect(Address)
