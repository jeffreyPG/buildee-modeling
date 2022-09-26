import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'

import classNames from 'classnames'
import styles from './Forgot.scss'

import Flash from 'utils/Flash/components/Flash'

export class Forgot extends React.Component {
  static propTypes = {
    forgot: PropTypes.func.isRequired
  }

  state = {
    validEmailFormat: false
  }

  handleInputChange = event => {
    this.setState({ validEmailFormat: false })
    // Check for valid email format and update state
    if (/.+\@.+\..+/.test(event.target.value)) {
      this.setState({ validEmailFormat: event.target.value })
    }
  }

  handleSubmit = event => {
    event.preventDefault()
    if (this.state.validEmailFormat) {
      this.props.forgot(this.state.validEmailFormat)
    }
  }

  render() {
    const { validEmailFormat } = this.state

    return (
      <div className={styles.forgot}>
        <div className={styles.containerSmall}>
          <Flash />

          <form className={styles.forgotForm} onSubmit={this.handleSubmit}>
            <p>Enter email address to receive a temporary password</p>

            <input
              type="text"
              ref="email"
              placeholder="Email Address"
              onChange={this.handleInputChange}
            />

            <a
              className={classNames(
                styles.button,
                styles.buttonPrimary,
                !validEmailFormat ? styles.buttonDisable : ''
              )}
              ref="submitbutton"
              onClick={this.handleSubmit}
              disabled={!validEmailFormat}
            >
              Get Temporary Password
            </a>
          </form>
        </div>
      </div>
    )
  }
}

export default Forgot
