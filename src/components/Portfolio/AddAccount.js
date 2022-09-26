import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'

import classNames from 'classnames'
import styles from './AddAccount.scss'

export class AddAccount extends React.Component {
  static propTypes = {
    push: PropTypes.func.isRequired,
    portfolioAddAccount: PropTypes.func.isRequired,
    cancelForm: PropTypes.func.isRequired
  }

  state = {
    buttonDisableUser: true,
    buttonDisableProperty: false,
    buttonDisableMeter: false,
    formValues: {
      email: '',
      username: ''
    }
  }

  handleInputChange = event => {
    let tempFormState = { ...this.state.formValues }
    tempFormState[event.target.name] = event.target.value
    this.setState({ formValues: tempFormState })
  }

  handleSubmit = event => {
    event.preventDefault()

    if (!this.state.formValues.username || !this.state.formValues.email) return

    // Ensure this is not a unit test
    let portfolioSyncInvitePromise =
      this.props.portfolioAddAccount(
        this.state.formValues.username,
        this.state.formValues.email
      ) || {}
    if (!portfolioSyncInvitePromise.then) return

    portfolioSyncInvitePromise
      .then(() => {
        this.setState({ username: '', password: '' })
        this.props.cancelForm()
      })
      .catch(err => {})
  }

  render() {
    return (
      <div className={styles.addAccount}>
        <form className={styles.panelContent}>
          <div>
            <p>
              Connect your Energy Star Portfolio Manager account with buildee to
              exchange building, meter and score data. Making this connection
              requires sharing access with buildee in your Portfolio Manager
              account, signing into this account on this page, and then sharing
              your buildings back in Portfolio Manager.
            </p>
            <p>
              Download our set-up guide&nbsp;
              <a href={'/PortfolioManagerInstructions.pdf'} target="_blank">
                here.
              </a>
            </p>
          </div>
          <div className={styles.addAccountDetail}>
            <label htmlFor="email">Email</label>
            <input
              value={this.state.formValues.email}
              autoComplete="email"
              name="email"
              type="email"
              placeholder="Email"
              onChange={this.handleInputChange.bind(this)}
            />
          </div>

          <div className={styles.addAccountDetail}>
            <label htmlFor="username">Username</label>
            <input
              value={this.state.formValues.Username}
              name="username"
              type="text"
              placeholder="Username"
              onChange={this.handleInputChange.bind(this)}
            />
          </div>
        </form>
        <div className={styles.panelActions}>
          <button
            onClick={this.props.cancelForm}
            className={classNames(styles.button, styles.buttonSecondary)}
          >
            Cancel
          </button>
          <button
            onClick={this.handleSubmit}
            className={classNames(styles.button, styles.buttonPrimary)}
          >
            Connect
          </button>
        </div>
      </div>
    )
  }
}

export default AddAccount
