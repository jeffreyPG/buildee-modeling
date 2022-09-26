import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import styles from './Profile.scss'
import classNames from 'classnames'
import { ProfileTermsText, ProfilePrivacyText } from './'
import { Formik, Field, Form, ErrorMessage } from 'formik'
import { Field as FieldSelect } from '../../containers/Form/FormFields'
import { Loader } from 'utils/Loader'
import Switch from 'components/Switch/Switch'

export class ProfileDetails extends React.Component {
  static propTypes = {
    organizations: PropTypes.array.isRequired,
    push: PropTypes.func.isRequired,
    updateUserType: PropTypes.func.isRequired,
    user: PropTypes.object,
    userHasVerified: PropTypes.bool,
    verifyEmail: PropTypes.func.isRequired,
    verifyEmailSuccess: PropTypes.func.isRequired,
    setImageChanged: PropTypes.func,
    imageChanged: PropTypes.bool
  }

  state = {
    showContent: '',
    disableVerifyButton: this.props.userHasVerified || false,
    enableMFA: this.props.user.enableMFA || false,
    isDirty: false
  }

  handleToggleContent = (event, type) => {
    event.preventDefault()

    if (this.state.showContent === type) {
      this.setState({ showContent: '' })
    } else {
      this.setState({ showContent: type })
    }
  }

  handleClickVerifyEmail = event => {
    event.preventDefault()
    this.props
      .verifyEmail()
      .then(() => {
        this.setState({ disableVerifyButton: true })
      })
      .catch(err => {})
  }

  handleGoToOrg = orgId => {
    this.props.push('organization/' + orgId + '/building')
  }

  handleClickSaveOption = event => {
    this.props.updateUserType(event.target.value)
  }

  validateForm = values => {
    let errors = {}

    if (values.name.length === 0) {
      errors.name = 'Name is required'
    }

    if (values.email.length === 0) {
      errors.email = 'Email is required'
    }

    return errors
  }

  handleChanged = ({ event, setFieldValue, field }) => {
    setFieldValue(field, event.target.value)
  }

  handleSubmit = async values => {
    let payload = { ...values, enableMFA: this.state.enableMFA }
    this.props.updateProfile(payload)
    this.props.setImageChanged(false)
  }

  onToogleMFA = () => {
    const { enableMFA } = this.state
    this.setState({
      enableMFA: !enableMFA,
      isDirty: true
    })
  }

  render() {
    const { user, image } = this.props
    const { isDirty, enableMFA } = this.state
    const profileType = [
      { name: 'Building Owner/Manager', value: 'buildingOwner' },
      { name: 'Service Provider', value: 'serviceProvider' }
    ]

    var date = user.created
    var formatedDate = new Date(date).toLocaleDateString('en-US')
    let initialValues = {
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      bio: user.bio || '',
      image: image || ''
    }

    return (
      <div className={styles.profileDetails}>
        <h1>Details</h1>
        <Formik
          initialValues={initialValues}
          enableReinitialize
          validate={values => this.validateForm(values)}
          onSubmit={(values, { setSubmitting }) => {
            setSubmitting(true)
            this.handleSubmit(values).then(() => setSubmitting(false))
          }}
        >
          {({
            values,
            isSubmitting,
            isValid,
            setFieldValue,
            setSubmitting,
            resetForm
          }) => {
            return (
              <Form className={styles.detailForm}>
                <ErrorMessage
                  name="name"
                  component="div"
                  className={styles.formError}
                />
                <FieldSelect
                  className={styles.detailFormField}
                  id="name"
                  name="name"
                  component="input"
                  label="Name"
                  type="text"
                  value={values.name}
                  onChange={event =>
                    this.handleChanged({
                      event,
                      setFieldValue,
                      field: 'name'
                    })
                  }
                />
                <br />
                <ErrorMessage
                  name="email"
                  component="div"
                  className={styles.formError}
                />
                <FieldSelect
                  className={styles.detailFormField}
                  id="email"
                  name="email"
                  component="input"
                  label="Email"
                  type="text"
                  value={values.email}
                  onChange={event =>
                    this.handleChanged({
                      event,
                      setFieldValue,
                      field: 'email'
                    })
                  }
                />
                <br />
                <ErrorMessage
                  name="phoneNumber"
                  component="div"
                  className={styles.formError}
                />
                <FieldSelect
                  className={styles.detailFormField}
                  id="phoneNumber"
                  name="phoneNumber"
                  component="input"
                  label="Phone Number"
                  type="text"
                  value={values.phoneNumber}
                  onChange={event =>
                    this.handleChanged({
                      event,
                      setFieldValue,
                      field: 'phoneNumber'
                    })
                  }
                />
                <br />
                <ErrorMessage
                  name="bio"
                  component="div"
                  className={styles.formError}
                />
                <div>
                  <span className={styles.detailFormLabel}>Bio</span>
                  <Field
                    label="bio"
                    component="textarea"
                    name="bio"
                    value={values.bio}
                    onChange={event =>
                      this.handleChanged({
                        event,
                        setFieldValue,
                        field: 'bio'
                      })
                    }
                  />
                </div>
                <br />
                <div className={styles.mfaOption}>
                  <Switch
                    label="Multi Factor Authentication"
                    isSet={enableMFA}
                    onSwitchToggled={this.onToogleMFA}
                  />
                </div>
                {/* <div className={styles.profileDetail}>
          <h3>Email</h3>
          <p>{user.email}</p>

          {userHasVerified && <p>(Verified.)</p>}
          {!userHasVerified && (
            <button
              disabled={disableVerifyButton}
              className={classNames(styles.button, styles.buttonSecondary)}
              onClick={this.handleClickVerifyEmail}
            >
              <i className="material-icons">email</i> Verify Account By Email
            </button>
          )}
        </div> */}
                <div className={styles.profileDetail}>
                  <h3>Created</h3>
                  <p>{formatedDate}</p>
                </div>
                {/* <div className={styles.profileDetail}>
          <h3>Organizations</h3>
          {this.props.organizations.map((org, index) => {
            return (
              <p key={index} className={styles.profileOrgs}>
                <a onClick={() => this.handleGoToOrg(org.id)}>{org.name}</a>
              </p>
            )
          })}
        </div> */}

                {/* <div className={styles.profileDetail}>
          <h3>Please describe your profile</h3>
          <div className={styles.radioContainer}>
            {profileType.map((option, index) => {
              return (
                <label key={index}>
                  <input
                    type="radio"
                    name="open247"
                    value={option.value}
                    checked={user && user.type === option.value}
                    onChange={e => this.handleClickSaveOption(e)}
                  />
                  <span>{option.name}</span>
                </label>
              )
            })}
          </div>
        </div> */}

                <div className={styles.profileOptions}>
                  <a
                    className={classNames(
                      styles.button,
                      styles.buttonSecondary,
                      this.state.showPrivacy ? styles.profileShowPolicy : ''
                    )}
                    onClick={e => this.handleToggleContent(e, 'terms')}
                  >
                    <i className="material-icons">arrow_drop_down</i> Terms of
                    Use
                  </a>
                  <a
                    className={classNames(
                      styles.button,
                      styles.buttonSecondary,
                      this.state.showPrivacy ? styles.profileShowPolicy : ''
                    )}
                    onClick={e => this.handleToggleContent(e, 'privacy')}
                  >
                    <i className="material-icons">arrow_drop_down</i> Privacy
                    Policy
                  </a>
                </div>
                <div className={styles.footerButtonContainer}>
                  <button
                    className={classNames(
                      styles.button,
                      styles.buttonSecondary
                    )}
                    type="reset"
                    onClick={() => {
                      resetForm()
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className={classNames(styles.button, styles.buttonPrimary, {
                      [styles.buttonDisable]:
                        !isValid & !this.props.imageChanged && !isDirty
                    })}
                    disabled={!isValid && !this.props.imageChanged && !isDirty}
                    type="submit"
                    data-test="user-scenario-add-button"
                  >
                    {isSubmitting ? (
                      <Loader size="button" color="white" />
                    ) : (
                      'Save'
                    )}
                  </button>
                </div>
              </Form>
            )
          }}
        </Formik>
        {this.state.showContent === 'privacy' && (
          <div className={styles.profileTextContent}>
            <h3>Privacy Policy</h3>
            <ProfilePrivacyText />
          </div>
        )}

        {this.state.showContent === 'terms' && (
          <div className={styles.profileTextContent}>
            <h3>Terms of Use</h3>
            <ProfileTermsText />
          </div>
        )}
      </div>
    )
  }
}

export default ProfileDetails
