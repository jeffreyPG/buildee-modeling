import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Link } from 'react-router'
import { ProfileDetails, ProfileSettings } from './'
import styles from './Profile.scss'
import ProfileImageUpload from './ProfileImageUpload/ProfileImageUpload'

export class Profile extends React.Component {
  static propTypes = {
    user: PropTypes.object,
    userHasVerified: PropTypes.bool,
    push: PropTypes.func.isRequired,
    get: PropTypes.func.isRequired,
    verifyEmail: PropTypes.func.isRequired,
    verifyEmailSuccess: PropTypes.func.isRequired,
    updateUserType: PropTypes.func.isRequired,
    getOrganizationName: PropTypes.func.isRequired,
    updateLEANOrgsSettings: PropTypes.func.isRequired,
    updateProfile: PropTypes.func.isRequired
  }

  state = {
    selectedTab: 'details',
    orgs: [],
    image: (this.props.user && this.props.user.image) || null,
    imageChanged: false
  }

  componentDidMount = () => {
    const { user } = this.props

    this.props
      .get()
      .then(() => {
        user.orgIds.map(orgId => {
          this.props.getOrganizationName(orgId).then(org => {
            let tempOrgName = [...this.state.orgs]
            tempOrgName.push({
              name: org.name,
              id: org._id
            })
            this.setState({ orgs: tempOrgName })
          })
        })
      })
      .catch(err => {})
  }

  handleTabChange = tab => {
    if (tab !== this.state.selectedTab) {
      this.setState({ selectedTab: tab })
    }
  }

  handleImageUpdate = async updatedImages => {
    console.log('images', updatedImages)
    let images = Object.keys(updatedImages).map(k => updatedImages[k].uploadUrl)
    if (images && images.length) {
      this.setState({ image: images[0] })
    } else {
      this.setState({ image: null })
    }
    this.setState({ imageChanged: true })
  }

  handleImageChanged = () => {
    this.setState({ imageChanged: false })
  }

  render() {
    const { user } = this.props
    const { image, imageChanged } = this.state
    let images = {}
    if (image) {
      let url = new URL(image)
      images[url.pathname] = {
        uploadUrl: url.href,
        preview: url.href
      }
    }

    return (
      <div className={styles.profile}>
        <div className={styles.container}>
          <h1>Profile</h1>

          <div className={styles.profileWrap}>
            <div className={styles.profileSidebar}>
              <div className={classNames(styles.panel, styles.panelContent)}>
                <h2>{user.name}</h2>
                <h3>{user.company}</h3>
                <Link
                  to="/profile/password"
                  className={classNames(styles.button, styles.buttonPrimary)}
                >
                  <i className="material-icons">vpn_key</i> Change Password
                </Link>
              </div>

              <div
                className={classNames(
                  styles.panel,
                  styles.panelContent,
                  styles.avatarContainer
                )}
              >
                <ProfileImageUpload
                  images={images}
                  onImageChange={this.handleImageUpdate}
                />
              </div>
            </div>

            <div className={classNames(styles.panel, styles.profileMain)}>
              <div className={styles.tabs}>
                <div
                  className={classNames(
                    styles.tab,
                    this.state.selectedTab === 'details' ? styles.tabActive : ''
                  )}
                  onClick={() => {
                    this.handleTabChange('details')
                  }}
                >
                  <p>Details</p>
                </div>
                {this.props.user &&
                  this.props.user.products &&
                  this.props.user.products.trend === 'show' && (
                    <div
                      className={classNames(
                        styles.tab,
                        this.state.selectedTab === 'settings'
                          ? styles.tabActive
                          : ''
                      )}
                      onClick={() => {
                        this.handleTabChange('settings')
                      }}
                    >
                      <p>Settings</p>
                    </div>
                  )}
              </div>

              <div className={styles.panelContent}>
                {this.state.selectedTab === 'details' && (
                  <ProfileDetails
                    organizations={this.state.orgs}
                    push={this.props.push}
                    updateUserType={this.props.updateUserType}
                    user={this.props.user}
                    userHasVerified={this.props.userHasVerified}
                    verifyEmail={this.props.verifyEmail}
                    verifyEmailSuccess={this.props.verifyEmailSuccess}
                    updateProfile={this.props.updateProfile}
                    image={image}
                    imageChanged={imageChanged}
                    setImageChanged={this.handleImageChanged}
                  />
                )}
                {this.state.selectedTab === 'settings' &&
                  this.props.user.products &&
                  this.props.user.products.trend === 'show' && (
                    <ProfileSettings
                      user={this.props.user}
                      organizations={this.state.orgs}
                      updateLEANOrgsSettings={this.props.updateLEANOrgsSettings}
                    />
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Profile
