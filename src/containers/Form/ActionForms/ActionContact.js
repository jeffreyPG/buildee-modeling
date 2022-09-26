import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './ActionContact.scss'
import { Field } from '../FormFields'
import contactRoles from 'static/contact-roles.json'
import contactQualifications from 'static/contact-qualification.json'

const CamelCaseToTitle = string => {
  return string.split('').reduce((title, char, index) => {
    if (char === char.toUpperCase()) {
      // new word
      title += ' ' + char
    } else if (index === 0) {
      // first word
      title = char.toUpperCase()
    } else {
      title += char
    }
    return title
  }, '')
}

export class ActionContact extends React.Component {
  static propTypes = {
    contact: PropTypes.object.isRequired,
    fields: PropTypes.array.isRequired,
    mode: PropTypes.string,
    onRemoveContact: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired
  }

  static defaultProps = {
    fields: [
      'phoneNumber',
      'emailAddress',
      'address',
      'city',
      'state',
      'zip',
      'qualification',
      'company',
      'role',
      'certificateNumber',
      'certificationState',
      'expirationDate',
      'yearsOfExperience'
    ]
  }

  state = {
    // new, edit, view
    mode: this.props.mode
  }

  render() {
    const {
      contact: { title },
      index
    } = this.props
    const { mode } = this.state

    return (
      <div className={styles.actionContact}>
        <div className={styles.actionContactHeader}>
          <h3>{title || 'New Contact'}</h3>
          <i
            className={classNames('material-icons', styles.actionContactDelete)}
            onClick={() => this.props.onRemoveContact}
          >
            close
          </i>
        </div>
        {(mode === 'edit' || mode === 'new') && (
          <div className={styles.actionContactBody}>
            <div className={styles.actionContactRow}>
              {mode === 'new' && (
                <div className={styles.actionContactRowField}>
                  <Field
                    label="Title"
                    component="input"
                    name={`contacts[${index}].title`}
                    placeholder="Title"
                    data-test="action-contact-title"
                  />
                </div>
              )}
              <div className={styles.actionContactRowField}>
                <Field
                  label="First Name"
                  component="input"
                  name={`contacts[${index}].firstName`}
                  placeholder="First Name"
                  data-test="action-contact-first-name"
                />
              </div>
              <div className={styles.actionContactRowField}>
                <Field
                  label="Last Name"
                  component="input"
                  name={`contacts[${index}].lastName`}
                  placeholder="Last Name"
                  data-test="action-contact-last-name"
                />
              </div>
            </div>
            <div className={styles.actionContactRow}>
              {this.props.fields.map(fieldName => {
                let key = `contact-${title}-${fieldName}`
                if (fieldName === 'role') {
                  return (
                    <div key={key} className={styles.actionContactRowField}>
                      <Field
                        label={CamelCaseToTitle(fieldName)}
                        component="select"
                        name={`contacts[${index}].${fieldName}`}
                        placeholder={CamelCaseToTitle(fieldName)}
                        data-test="action-contact-role"
                      >
                        {contactRoles.reduce(
                          (acc, option, index) => {
                            return acc.concat(
                              <option key={index} value={option}>
                                {option}
                              </option>
                            )
                          },
                          [
                            <option
                              key={`${fieldName}-${index}-default`}
                              value=""
                            >
                              Select One
                            </option>
                          ]
                        )}
                      </Field>
                    </div>
                  )
                } else if (fieldName === 'qualification') {
                  return (
                    <div key={key} className={styles.actionContactRowField}>
                      <Field
                        label={CamelCaseToTitle(fieldName)}
                        component="select"
                        name={`contacts[${index}].${fieldName}`}
                        placeholder={CamelCaseToTitle(fieldName)}
                        data-test="action-contact-qualification"
                      >
                        {contactQualifications.reduce(
                          (acc, option, index) => {
                            return acc.concat(
                              <option key={index} value={option}>
                                {option}
                              </option>
                            )
                          },
                          [
                            <option
                              key={`${fieldName}-${index}-default`}
                              value=""
                            >
                              Select One
                            </option>
                          ]
                        )}
                      </Field>
                    </div>
                  )
                } else {
                  return (
                    <div key={key} className={styles.actionContactRowField}>
                      <Field
                        label={CamelCaseToTitle(fieldName)}
                        component="input"
                        name={`contacts[${index}].${fieldName}`}
                        placeholder={CamelCaseToTitle(fieldName)}
                        data-test={`action-contact-${fieldName}`}
                      />
                    </div>
                  )
                }
              })}
            </div>
          </div>
        )}
        {mode === 'view' && (
          <button
            className={classNames(
              styles.button,
              styles.buttonPrimary,
              styles.actionContactButton
            )}
            type="button"
            onClick={() => this.setState({ mode: 'edit' })}
          >
            {`Edit ${title || 'Contact'}`}
          </button>
        )}
      </div>
    )
  }
}

export default ActionContact
