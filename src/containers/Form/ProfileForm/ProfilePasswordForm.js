import React from 'react'
import PropTypes from 'prop-types'
import { reduxForm, Field } from 'redux-form'

import classNames from 'classnames'
import styles from '../../../components/Profile/Profile.scss'

import { RenderField } from '../FormFields'

const validate = values => {
  const errors = {}

  if (!values.currentPassword) {
    errors.currentPassword = 'Required'
  }
  if (!values.newPassword) {
    errors.newPassword = 'Required'
  }
  if (!values.verifyPassword) {
    errors.verifyPassword = 'Required'
  }
  if (
    !values.currentPassword ||
    !values.newPassword ||
    !values.verifyPassword
  ) {
    return errors
  }

  if (values.newPassword !== values.verifyPassword) {
    errors.newPassword = 'Passwords do not match'
    errors.verifyPassword = 'Passwords do not match'
  }

  return errors
}

class ProfilePasswordForm extends React.Component {
  state = {
    error: ''
  }
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    isPasswordReset: PropTypes.bool,
    userEmail: PropTypes.string.isRequired,
    resetPasswordOrgRequired: PropTypes.number.isRequired,
    processSubmit: PropTypes.func.isRequired,
    processBack: PropTypes.func.isRequired
  }

  submit = values => {
    return new Promise((resolve, reject) => {
      this.setState({ error: '' })
      delete values.error
      this.props
        .processSubmit(values, this.props.userEmail, this.props.isPasswordReset)
        .then(() => {
          resolve()
        })
        .catch(err => {
          this.setState({ error: err || 'Unable to update your password' })
          reject(err)
        })
    })
  }

  render() {
    const {
      handleSubmit,
      submitting,
      isPasswordReset,
      resetPasswordOrgRequired
    } = this.props
    const { error } = this.state
    return (
      <form
        onSubmit={handleSubmit(this.submit)}
        className={styles.passwordForm}
      >
        {error && <div className={styles.error}>{error}</div>}
        {isPasswordReset && (
          <span>
            <div>
              {resetPasswordOrgRequired > 0 && (
                <p>
                  For security purposes, your organization requires password
                  resets every {resetPasswordOrgRequired} days. Please reset
                  your password to continue use.
                </p>
              )}
              {resetPasswordOrgRequired <= 0 && (
                <p>Please update your temporary password with a new password</p>
              )}
            </div>
          </span>
        )}

        <Field
          label="Current Password"
          id="currentPassword"
          name="currentPassword"
          component={RenderField}
          type="password"
          autoComplete="off"
          placeholder="Enter Current Password"
          value=""
        />

        <small>
          Password must be 8 characters long and contain at least one uppercase
          letter, one lowercase letter, one number and one special character.
        </small>

        <Field
          label="New Password"
          id="newPassword"
          name="newPassword"
          component={RenderField}
          type="password"
          passwordValidation={true}
          autoComplete="off"
          placeholder="Enter New Password"
        />

        <Field
          label="Confirm New Password"
          id="verifyPassword"
          name="verifyPassword"
          component={RenderField}
          type="password"
          passwordValidation={true}
          autoComplete="off"
          placeholder="Re-Enter New Password"
        />

        <button
          type="submit"
          className={classNames(styles.button, styles.buttonPrimary)}
          disabled={submitting}
        >
          Change Password
        </button>
      </form>
    )
  }
}

export default reduxForm({
  form: 'profile-password',
  validate
})(ProfilePasswordForm)
