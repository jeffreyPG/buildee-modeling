import React from 'react'
import PropTypes from 'prop-types'
import { reduxForm, Field } from 'redux-form'
import classNames from 'classnames'
import styles from './SignupForm.scss'

import { RenderField } from '../FormFields'

const valFields = {
  email: {
    required: true,
    maxChar: 50,
    test: /.+\@.+\..+/,
    testMessage: 'Format is email@domain.com'
  },
  name: {
    required: true,
    maxChar: 50
  },
  company: {
    required: true,
    maxChar: 50
  },
  password: {
    required: true
  },
  verifyPassword: {
    required: true
  },
  role: {
    required: true
  },
  expertRadius: {
    maxChar: 5
  },
  expertZipCode: {
    maxChar: 5
  }
}

const validate = values => {
  const errors = {}

  // Loop thru the values and test validation rules
  Object.keys(valFields).map(key => {
    if (valFields[key].required && !values[key]) {
      errors[key] = 'Required'
    }
    if (values[key]) {
      if (
        valFields[key].maxChar &&
        values[key].length > valFields[key].maxChar
      ) {
        errors[key] = 'Max length: ' + valFields[key].maxChar
      }
      if (valFields[key].test && !valFields[key].test.test(values[key])) {
        errors[key] = valFields[key].testMessage || 'Invalid format'
      }
    }
  })

  // require radius and zip fields if role is expert
  if (values.role === 'expert') {
    if (
      !values.expertRadius ||
      (values.expertRadius && values.expertRadius === '')
    ) {
      errors.expertRadius = 'This field is required if you are an expert'
    }
    if (
      !values.expertZipCode ||
      (values.expertZipCode && values.expertZipCode === '')
    ) {
      errors.expertZipCode = 'This field is required if you are an expert'
    }
  }

  // Dont verify password match until all other validations pass
  if (!values.password || !values.verifyPassword) {
    return errors
  }

  if (values.password !== values.verifyPassword) {
    errors.password = 'Passwords do not match'
    errors.verifyPassword = 'Passwords do not match'
  }

  return errors
}

class SignupForm extends React.Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    processSubmit: PropTypes.func.isRequired,
    openTermsModal: PropTypes.func.isRequired
  }

  state = {
    role: 'user',
    acceptedTerms: false
  }

  changeAcceptedTerms = e => {
    this.setState({ acceptedTerms: Boolean(e.target.checked) })
  }

  handleChangeRole = e => {
    if (e.target.value) {
      this.setState({ role: e.target.value })
    }
  }

  openTermsModal = () => {
    this.props.openTermsModal(true)
  }

  submit = values => {
    return new Promise((resolve, reject) => {
      delete values.error
      this.props
        .processSubmit(values, this.props.orgId)
        .then(() => {
          resolve()
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  render() {
    const { handleSubmit, submitting } = this.props

    return (
      <form onSubmit={handleSubmit(this.submit)}>
        <Field
          id="email"
          name="email"
          component={RenderField}
          label="Email Address"
          type="text"
          placeholder="Email Address"
          className={styles.field}
        />

        <Field
          id="name"
          name="name"
          component={RenderField}
          type="text"
          placeholder="Full Name"
          label="Full Name"
          className={styles.field}
        />

        <Field
          id="company"
          name="company"
          component={RenderField}
          type="text"
          placeholder="Company"
          label="Company"
          className={styles.field}
        />

        <small>
          Password must be 8 characters long and contain at least one uppercase
          letter, one lowercase letter, one number and one special character.
        </small>

        <Field
          id="password"
          name="password"
          component={RenderField}
          type="password"
          passwordValidation={true}
          placeholder="Password"
          label="Password"
          autoComplete="off"
          className={styles.field}
        />

        <Field
          id="verifyPassword"
          name="verifyPassword"
          component={RenderField}
          type="password"
          passwordValidation={true}
          placeholder="Re-enter Password"
          label="Re-enter Password"
          autoComplete="off"
          className={styles.field}
        />

        {this.state.role === 'expert' && (
          <div>
            <Field
              id="expertRadius"
              name="expertRadius"
              component={RenderField}
              type="number"
              placeholder="Expert Radius"
              maxLength="5"
            />

            <Field
              id="expertZipCode"
              name="expertZipCode"
              component={RenderField}
              type="number"
              placeholder="Expert Zip Code"
              maxLength="5"
            />
          </div>
        )}

        <div className={styles.terms}>
          <p>
            To get started, you must read and agree to the{' '}
            <span onClick={() => this.openTermsModal()}>Terms of Use</span>.
          </p>
          <div className={styles.checkboxContainer}>
            <label>
              <input
                value={this.state.acceptedTerms}
                onChange={e => this.changeAcceptedTerms(e)}
                className={classNames(
                  this.state.acceptedTerms ? styles['checked'] : ''
                )}
                type="checkbox"
              />
              <span>I have read and agree to the Terms of Use.</span>
            </label>
          </div>
        </div>

        {this.state.acceptedTerms && (
          <button
            type="submit"
            className={classNames(styles.button, styles.buttonPrimary)}
            disabled={submitting}
          >
            Sign Up
          </button>
        )}
        {!this.state.acceptedTerms && (
          <button
            className={classNames(
              styles.button,
              styles.buttonPrimary,
              styles.buttonDisable
            )}
            disabled={true}
          >
            Sign Up
          </button>
        )}
      </form>
    )
  }
}

export default reduxForm({
  form: 'signup',
  validate
})(SignupForm)
