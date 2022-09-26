import React from 'react'
import classNames from 'classnames'
import styles from './RenderField.scss'

const renderField = ({
  id,
  label,
  input,
  type,
  placeholder,
  description,
  className,
  passwordValidation,
  required = true,
  meta: { touched, error },
  icon
}) => (
  <div className={className}>
    <label htmlFor={id}>
      {label}
      <small>{description}</small>
    </label>
    <div
      className={classNames(
        touched && error ? 'invalid' : '',
        !!icon ? styles.inputIConContainer : ''
      )}
    >
      {icon && <i className="material-icons">{icon}</i>}
      {passwordValidation && (
        <input
          {...input}
          placeholder={placeholder}
          type={type}
          required={required}
          pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,30}$"
          title="Password must be 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character."
        />
      )}
      {!passwordValidation && (
        <input
          {...input}
          placeholder={placeholder}
          type={type}
          required={required}
        />
      )}
      {touched && error && <span>{error}</span>}
    </div>
  </div>
)

export default renderField
