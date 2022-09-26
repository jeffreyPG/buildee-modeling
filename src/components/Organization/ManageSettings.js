import React from 'react'
import PropTypes from 'prop-types'
import styles from './ManageSettings.scss'
import classNames from 'classnames'
import { Loader } from 'utils/Loader'
import { Resize } from 'utils/Utils'

export class ManageSettings extends React.Component {
  static propTypes = {
    currentUserRole: PropTypes.string.isRequired,
    organizationView: PropTypes.object.isRequired,
    updateOrganization: PropTypes.func.isRequired,
    uploadOrganizationImage: PropTypes.func.isRequired
  }

  state = {
    organizationName: this.props.organizationView.name || '',
    organizationImage: this.props.organizationView.imageURL || '',
    currentUserRole: this.props.currentUserRole || 'user',
    passwordExpiryDays: null,
    defaultRoles: ['owner', 'admin', 'editor', 'user', 'guest'],
    passwordExpiryRoles: [],
    settingsErrors: '',
    imageLoading: ''
  }

  componentDidMount = () => {
    this.setOrganizationSettings()
    this.setPasswordExpiryInfo()
  }

  componentDidUpdate = prevProps => {
    if (prevProps.organizationView !== this.props.organizationView) {
      this.setOrganizationSettings()
      this.setPasswordExpiryInfo()
    }
  }

  setOrganizationSettings = () => {
    this.setState({
      organizationName: this.props.organizationView.name,
      organizationImage: this.props.organizationView.imageURL
    })
  }

  setPasswordExpiryInfo = () => {
    const { organizationView } = this.props
    this.setState({
      passwordExpiryDays: organizationView.passwordExpiry.days,
      passwordExpiryRoles: organizationView.passwordExpiry.enabledRoles
    })
  }

  changeOrganizationName = e => {
    this.setState({ organizationName: e.target.value })
    if (e.target.value === '') {
      this.setState({ settingsErrors: 'Please give your organization a name.' })
    } else {
      this.setState({ settingsErrors: '' })
    }
  }

  clearImageInputValue = e => {
    e.target.value = ''
  }

  uploadImage = e => {
    var file = e.target.files[0]
    var self = this
    var maxWidth = 900
    var maxHeight = 900
    this.setState({ imageLoading: 'loading' })

    Resize(file, maxWidth, maxHeight, function(resizedDataUrl) {
      const data = new FormData()
      data.append('file', resizedDataUrl)
      data.append('filename', file.name)

      if (data) {
        self.props
          .uploadOrganizationImage(data)
          .then(imageUrl => {
            let tempState = { ...self.state }
            tempState.imageLoading = 'success'
            tempState.organizationImage = imageUrl
            self.setState(tempState)
          })
          .catch(() => {
            self.setState({ imageLoading: 'fail' })
          })
      } else {
        self.setState({ imageLoading: 'fail' })
      }
    })
  }

  handleImageRemove = () => {
    this.setState({ organizationImage: '' })
  }

  changePasswordExpiryDays = e => {
    this.setState({ passwordExpiryDays: e.target.value })
  }

  changePasswordExpiryRoles = e => {
    let tempRoles = [...this.state.passwordExpiryRoles]
    if (e.target.checked) {
      tempRoles.push(e.target.value)
    } else {
      tempRoles = tempRoles.filter(function(a) {
        return a !== e.target.value
      })
    }
    this.setState({ passwordExpiryRoles: tempRoles })
  }

  updateOrgSettings = () => {
    const {
      passwordExpiryDays,
      passwordExpiryRoles,
      organizationName,
      organizationImage
    } = this.state
    const { organizationView, updateOrganization } = this.props

    let roles = passwordExpiryDays >= 1 ? passwordExpiryRoles : []
    const payload = {
      name: organizationName,
      imageURL: organizationImage,
      passwordExpiry: {
        days: Math.round(passwordExpiryDays),
        enabledRoles: roles
      }
    }

    if (organizationView._id) {
      updateOrganization(organizationView._id, payload)
    }
  }

  render() {
    const {
      currentUserRole,
      passwordExpiryDays,
      passwordExpiryRoles,
      defaultRoles
    } = this.state

    // if the user is not an owner, don't render setting options
    if (currentUserRole !== 'owner') {
      return <span />
    }

    return (
      <div className={styles.settings}>
        <div className={styles.panelContent}>
          <div className={styles.settingsHeader}>
            <h1>Settings</h1>
          </div>

          <div className={styles.nameChange}>
            <h3>Organization Name</h3>
            <input
              value={this.state.organizationName || ''}
              type="text"
              onChange={e => this.changeOrganizationName(e)}
            />
            {this.state.settingsErrors ===
              'Please give your organization a name.' && (
              <p>{this.state.settingsErrors}</p>
            )}
          </div>

          <div className={styles.orgImage}>
            <h3>Organization Image</h3>

            {this.state.organizationImage &&
              this.state.imageLoading !== 'loading' && (
                <div className={styles.orgImageContainer}>
                  <img src={this.state.organizationImage} />
                  <div
                    className={styles.orgImageRemove}
                    onClick={() => {
                      this.handleImageRemove()
                    }}
                  >
                    <i className="material-icons">close</i>
                  </div>
                </div>
              )}

            {this.state.imageLoading === 'loading' && (
              <div className={styles.orgImageSpinner}>
                <Loader />
              </div>
            )}

            {this.state.imageLoading === 'fail' && (
              <p>
                Sorry, we couldn't upload this image. Please try again or upload
                a smaller image.
              </p>
            )}

            {!this.state.organizationImage && (
              <label>
                <input
                  type="file"
                  name="org-image"
                  accept="image/*"
                  onClick={e => {
                    this.clearImageInputValue(e)
                  }}
                  onChange={e => {
                    this.uploadImage(e)
                  }}
                />
                <span
                  className={classNames(styles.button, styles.buttonSecondary)}
                >
                  Add an organization image
                </span>
              </label>
            )}
          </div>

          <div className={styles.passwordExpiry}>
            <h3>Password Expiration</h3>
            <div className={styles.passwordExpiryDetail}>
              <p>
                After how many days should users be required to reset their
                password? Empty values won't require any password reset from
                users.
              </p>
              <input
                value={passwordExpiryDays || ''}
                name="passwordExpiryDays"
                type="number"
                autoComplete="off"
                step="1"
                min="1"
                onChange={e => this.changePasswordExpiryDays(e)}
                onWheel={e => e.target.blur()}
              />
            </div>
            {passwordExpiryDays > 0 && (
              <div className={styles.passwordExpiryDetail}>
                <p>Which roles should this apply to?</p>
                <div className={styles.checkboxContainer}>
                  {defaultRoles.map((role, i) => {
                    let checked = false
                    if (passwordExpiryRoles.includes(role)) {
                      checked = true
                    }
                    return (
                      <label key={i}>
                        <input
                          defaultChecked={checked}
                          value={role}
                          onChange={e => this.changePasswordExpiryRoles(e)}
                          className={classNames(
                            checked ? styles['checked'] : ''
                          )}
                          type="checkbox"
                        />
                        <span>
                          {role.charAt(0).toUpperCase() + role.substr(1)}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className={styles.panelActions}>
          {this.state.settingsErrors !== '' && (
            <button
              disabled
              className={classNames(
                styles.button,
                styles.buttonPrimary,
                styles.buttonDisable
              )}
            >
              Save
            </button>
          )}
          {this.state.settingsErrors === '' && (
            <button
              onClick={this.updateOrgSettings}
              className={classNames(styles.button, styles.buttonPrimary)}
            >
              Save
            </button>
          )}
        </div>
      </div>
    )
  }
}

export default ManageSettings
