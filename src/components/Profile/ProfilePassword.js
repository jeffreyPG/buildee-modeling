import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import styles from './Profile.scss'

import { ProfilePasswordForm } from 'containers/Form/ProfileForm'

export class ProfilePasswordUpdate extends React.Component {
  static propTypes = {
    user: PropTypes.object,

    push: PropTypes.func.isRequired,
    updatePassword: PropTypes.func.isRequired
  }

  processBack = () => {
    this.props.push('/profile')
  }

  render() {
    const { user, updatePassword } = this.props
    const isPasswordReset =
      user.resetPassword || user.resetPassword === 'true' ? true : false
    const resetPasswordOrgRequired =
      this.props.location &&
      this.props.location.query &&
      this.props.location.query.resetPasswordOrgRequired
        ? parseInt(this.props.location.query.resetPasswordOrgRequired)
        : 0

    return (
      <div className={styles.profilePassword}>
        <div className={styles.containerSmall}>
          <h1 className={styles.profilePasswordTitle}>Profile Password</h1>
          <div className={styles.profilePasswordUpdate}>
            <ProfilePasswordForm
              isPasswordReset={isPasswordReset}
              userEmail={user.email}
              processSubmit={updatePassword}
              processBack={this.processBack}
              resetPasswordOrgRequired={resetPasswordOrgRequired}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default ProfilePasswordUpdate
