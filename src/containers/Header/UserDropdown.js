import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './LoggedInHeader.scss'
import { parentNodeHasClass } from 'utils/Utils'
import { withAuth0 } from '@auth0/auth0-react'

export class UserDropdown extends React.Component {
  static propTypes = {
    push: PropTypes.func.isRequired,
    logout: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired
  }

  state = {
    showUserDropdown: false
  }

  UNSAFE_componentWillMount = () => {
    document.addEventListener('mousedown', this.handleClick, false)
  }

  componentWillUnmount = () => {
    document.removeEventListener('mousedown', this.handleClick, false)
  }

  handleClick = e => {
    // the click is inside, continue to menu links
    if (parentNodeHasClass(e.target, 'userMenuClick')) return
    // otherwise, toggle (close) the app dropdown
    this.closeUserDropdown()
  }

  closeUserDropdown = () => {
    this.setState({ showUserDropdown: false })
  }

  toggleUserDropdown = () => {
    this.setState({ showUserDropdown: !this.state.showUserDropdown })
  }

  handleClickProfile = event => {
    event.preventDefault()
    this.toggleUserDropdown()
    this.props.push('/profile')
  }

  handleClickLogout = event => {
    event.preventDefault()
    this.toggleUserDropdown()
    this.props.logout()
    this.props.auth0.logout({ returnTo: window.location.origin })
  }

  handleDisplayUserInitials = () => {
    let name = this.props.user.name
    if (name) {
      var initials = name.match(/\b\w/g) || []
      initials = (
        (initials.shift() || '') + (initials.pop() || '')
      ).toUpperCase()
      return initials
    }
  }

  render() {
    return (
      <div>
        <a
          className={'userMenuClick'}
          onClick={() => this.toggleUserDropdown()}
          title="Profile"
        >
          <div className={styles.accountName}>{this.props.user.name}</div>
          <div className={styles.avatar}>
            {/* {this.props.user.avatar &&
              <img src={this.props.user.avatar} />
            } */}
            {!this.props.user.avatar && (
              <div className={styles.avatarCircle}>
                <span>{this.handleDisplayUserInitials()}</span>
              </div>
            )}
          </div>
          <i className="material-icons">expand_more</i>
        </a>
        {this.state.showUserDropdown && (
          <ul
            className={classNames(styles.userDropdown, 'userMenuClick')}
            ref={node => (this.node = node)}
          >
            <li onClick={this.handleClickProfile}>
              <i className="material-icons">person</i>
              My Profile
            </li>
            <li onClick={this.handleClickLogout}>
              <i className="material-icons">exit_to_app</i>
              Log Out
            </li>
          </ul>
        )}
      </div>
    )
  }
}

export default withAuth0(UserDropdown)
