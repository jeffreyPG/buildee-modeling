import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { connect } from 'react-redux'

import classes from './Flash.scss'

import { flashDisplayed, hideFlash } from '../modules/flash'

export class Flash extends React.Component {
  static propTypes = {
    flash: PropTypes.object.isRequired,
    flashDisplayed: PropTypes.func.isRequired,
    hideFlash: PropTypes.func.isRequired
  }

  componentWillUnmount() {
    this.props.hideFlash()
  }

  componentDidMount() {
    if (this.props.flash && this.props.flash.text) {
      this.props.flashDisplayed()
    }
  }

  UNSAFE_componentWillReceiveProps(newProps) {
    if (newProps.flash && newProps.flash.text && !newProps.flash.displayed) {
      newProps.flashDisplayed()
    }
  }

  hideFlash = event => {
    event.preventDefault()
    this.props.hideFlash()
  }

  renderDynamicIconClass = flashType => {
    switch (flashType) {
      case 'success':
        return 'check'
      case 'error':
        return 'close'
      case 'warning':
        return 'warning'
      default:
        return 'warning'
    }
  }

  render() {
    const { flash } = this.props

    return (
      <div
        className={classNames(classes.flash, classes['flash--' + flash.status])}
      >
        <div
          className={classNames(classes['flash--' + flash.type])}
          onClick={this.hideFlash}
        >
          <i className="material-icons">
            {this.renderDynamicIconClass(flash.type)}
          </i>
          {flash && flash.text ? flash.text : ''}
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  flash: state.flash
})
export default connect(
  mapStateToProps,
  {
    hideFlash,
    flashDisplayed
  }
)(Flash)
