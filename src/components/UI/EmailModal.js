import React, { Component } from 'react'
import classNames from 'classnames'
import { Formik, Field, Form, ErrorMessage } from 'formik'
import { Field as FieldSelect } from '../../containers/Form/FormFields'
import { Loader } from 'utils/Loader'
import styles from './EmailModal.scss'
import formFieldStyles from '../../containers/Form/FormFields/Field.module.scss'

const initialValues = {
  to: '',
  cc: '',
  subject: '',
  message: ''
}

class EmailModal extends Component {
  handleChanged = ({ event, setFieldValue, field }) => {
    setFieldValue(field, event.target.value)
  }

  render() {
    const {
      title,
      onSubmit,
      onClose,
      defaultValues = initialValues,
      messageComponent
    } = this.props

    return (
      <div className={styles.modal}>
        <div className={styles.modalEmailInner}>
          <div className={styles.modalHeading}>
            <h2>{title}</h2>
            <div className={styles.modalClose} onClick={onClose}>
              <i className="material-icons">close</i>
            </div>
          </div>
          <Formik
            initialValues={defaultValues}
            validate={values => {
              let errors = {}

              if (values.to.length === 0) {
                errors.to = 'Email is required'
              }
              if (values.subject.length === 0) {
                errors.subject = 'Subject is required'
              }
              return errors
            }}
          >
            {({
              values,
              isSubmitting,
              isValid,
              setFieldValue,
              setSubmitting
            }) => (
              <Form className={styles.form}>
                <div className={styles.modalEmailBody}>
                  <ErrorMessage
                    name="to"
                    component="div"
                    className={styles.formError}
                  />
                  <FieldSelect
                    id="toEmail"
                    name="toEmail"
                    component="input"
                    label="To"
                    type="text"
                    value={values.to}
                    onChange={event =>
                      this.handleChanged({
                        event,
                        setFieldValue,
                        field: 'to'
                      })
                    }
                  />
                  <br />
                  <FieldSelect
                    id="CC"
                    name="cc"
                    component="input"
                    label="Cc"
                    type="text"
                    value={values.cc}
                    onChange={event =>
                      this.handleChanged({
                        event,
                        setFieldValue,
                        field: 'cc'
                      })
                    }
                  />
                  <br />
                  <ErrorMessage
                    name="subject"
                    component="div"
                    className={styles.formError}
                  />
                  <FieldSelect
                    id="subject"
                    name="subject"
                    component="input"
                    label="Subject"
                    type="text"
                    value={values.subject}
                    onChange={event =>
                      this.handleChanged({
                        event,
                        setFieldValue,
                        field: 'subject'
                      })
                    }
                  />
                  <br />
                  <div>
                    <span className={formFieldStyles.label}>Message</span>
                    <Field
                      label="Message"
                      component={
                        messageComponent ? messageComponent : 'textarea'
                      }
                      name="message"
                      data-test="docu-email-message"
                      placeholder=""
                      onChange={event =>
                        this.handleChanged({
                          event,
                          setFieldValue,
                          field: 'message'
                        })
                      }
                    />
                  </div>
                </div>
                <div className={styles.modalEmailFooter}>
                  <button
                    data-test="user-package-add-button"
                    onClick={event => {
                      event.preventDefault()
                      setSubmitting(true)
                      onSubmit(values).then(() => {
                        setSubmitting(false)
                      })
                      event.stopPropagation()
                    }}
                    className={classNames(styles.button, styles.buttonPrimary, {
                      [styles.buttonDisable]: !isValid
                    })}
                    disabled={!isValid}
                  >
                    {isSubmitting ? (
                      <Loader size="button" color="white" />
                    ) : (
                      'Send'
                    )}
                  </button>

                  <button
                    className={classNames(
                      styles.button,
                      styles.buttonSecondary
                    )}
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    )
  }
}

export default EmailModal
