import React from 'react'
import PropTypes from 'prop-types'
import styles from './Profile.scss'
import Logo from '../../components/Svg'
import classNames from 'classnames'
import { ProfileTermsText } from './'

export class ProfileTerms extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    acceptTerms: PropTypes.func.isRequired
  }

  state = {
    acceptedTerms: false
  }

  changeAcceptedTerms = e => {
    this.setState({ acceptedTerms: Boolean(e.target.checked) })
  }

  render() {
    return (
      <div className={styles.profileTerms}>
        <div className={classNames(styles.container, styles.inner)}>
          <div className={styles.profileTermsHeader}>
            <h3>Welcome to</h3>
            <Logo maxHeight={'home'} />
            <h3>
              To get started, you must read and agree to the Terms of Use.
            </h3>
          </div>
          <div className={styles.profileTermsWrapper}>
            <ProfileTermsText />
          </div>
        </div>

        {!this.props.user.acceptedTerms && (
          <div className={styles.panelActions}>
            <div className={styles.container}>
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
              {this.state.acceptedTerms && (
                <button
                  className={classNames(styles.button, styles.buttonPrimary)}
                  onClick={() => this.props.acceptTerms()}
                >
                  Get Started
                </button>
              )}
              {!this.state.acceptedTerms && (
                <button
                  className={classNames(
                    styles.button,
                    styles.buttonPrimary,
                    styles.buttonDisable
                  )}
                >
                  Get Started
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }
}

export default ProfileTerms
