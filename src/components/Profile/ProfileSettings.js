import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import styles from './Profile.scss'
import classNames from 'classnames'

export class ProfileSettings extends React.Component {
  static propTypes = {
    user: PropTypes.object,
    organizations: PropTypes.array.isRequired,
    updateLEANOrgsSettings: PropTypes.func.isRequired
  }

  state = {}

  handleOrganizationIdCheck = e => {
    const { user } = this.props

    if (user && user.settings && user.settings.leanOrganizations) {
      let tempOrganizations = [...user.settings.leanOrganizations]
      if (e.target.checked) {
        // add to array
        // if it's not already in the array
        if (!tempOrganizations.includes(e.target.value)) {
          tempOrganizations.push(e.target.value)
        }
      } else {
        // filter from array
        tempOrganizations = tempOrganizations.filter(a => a !== e.target.value)
      }
      this.props.updateLEANOrgsSettings(tempOrganizations)
    }
  }

  render() {
    const { user } = this.props

    return (
      <div className={styles.profileSettings}>
        <h1>Settings</h1>

        <div className={styles.profileSetting}>
          <h3>Organizations to be included in LEAN analysis</h3>
          <p>
            These organizations will be applied by default for all LEAN analysis
            in the Utilities section for every building.
          </p>
          <div
            className={classNames(
              styles.orgSelection,
              styles.checkboxContainer
            )}
          >
            {this.props.organizations.map((org, index) => {
              let checked = false
              if (
                user &&
                user.settings &&
                user.settings.leanOrganizations &&
                user.settings.leanOrganizations.includes(org.id)
              ) {
                checked = true
              }
              return (
                <label key={index}>
                  <input
                    defaultChecked={checked}
                    value={org.id}
                    onChange={e => this.handleOrganizationIdCheck(e)}
                    className={classNames(checked ? styles['checked'] : '')}
                    type="checkbox"
                    name="organizations"
                  />
                  <span />
                  <small>{org.name}</small>
                </label>
              )
            })}
          </div>
        </div>
      </div>
    )
  }
}

export default ProfileSettings
