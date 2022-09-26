import React from 'react'
import PropTypes from 'prop-types'
import styles from './OrganizationManage.scss'
import classNames from 'classnames'
import { ManageUsers, ManageSettings } from './'

export class OrganizationManage extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    organizationView: PropTypes.object.isRequired,
    getOrganization: PropTypes.func.isRequired,
    getOrganizations: PropTypes.func.isRequired,
    getOrganizationUsers: PropTypes.func.isRequired,
    addOrganizationUser: PropTypes.func.isRequired,
    removeOrganizationUser: PropTypes.func.isRequired,
    uploadOrganizationImage: PropTypes.func.isRequired,
    updateOrganizationUser: PropTypes.func.isRequired,
    updateOrganization: PropTypes.func.isRequired,
    manageAllOrgSelected: PropTypes.bool.isRequired,
    organizationList: PropTypes.array.isRequired
  }

  state = {
    selectedTab: 'users',
    currentUserRole: 'user'
  }

  componentDidMount = () => {
    if (!this.props.manageAllOrgSelected) {
      this.props.getOrganization(this.props.params.organizationId)
    } else {
      this.props.getOrganizations()
    }
    this.setCurrentUserRole()
  }

  componentDidUpdate = prevProps => {
    if (prevProps.user !== this.props.user) {
      this.setCurrentUserRole()
    }
  }

  setCurrentUserRole = () => {
    const { user, organizationView } = this.props
    if (
      organizationView &&
      organizationView.users &&
      organizationView.users.length > 0
    ) {
      const currentUserObject = organizationView.users.filter(userFromOrg => {
        return userFromOrg.userId === user._id
      })
      if (currentUserObject && currentUserObject.length > 0) {
        this.setState({ currentUserRole: currentUserObject[0].userRole })
      }
    }
  }

  handleTabChange = tab => {
    if (tab !== this.state.selectedTab) {
      this.setState({ selectedTab: tab })
    }
  }

  render() {
    const {
      user,
      organizationView,
      organizationList,
      getOrganizationUsers,
      addOrganizationUser,
      removeOrganizationUser,
      uploadOrganizationImage,
      updateOrganizationUser,
      updateOrganization,
      manageAllOrgSelected
    } = this.props
    const { currentUserRole } = this.state

    return (
      <div className={styles.manage}>
        <div className={classNames(styles.container, styles.header)}>
          <div className={styles.manageWrap}>
            <div className={classNames(styles.panel, styles.manageMain)}>
              {this.state.selectedTab === 'users' && (
                <ManageUsers
                  currentUser={user}
                  organizationView={organizationView}
                  getOrganizationUsers={getOrganizationUsers}
                  addOrganizationUser={addOrganizationUser}
                  removeOrganizationUser={removeOrganizationUser}
                  updateOrganizationUser={updateOrganizationUser}
                  manageAllOrgSelected={manageAllOrgSelected}
                  organizationList={organizationList}
                />
              )}
              {this.state.selectedTab === 'settings' &&
                currentUserRole === 'owner' && (
                  <ManageSettings
                    currentUserRole={currentUserRole}
                    organizationView={organizationView}
                    updateOrganization={updateOrganization}
                    uploadOrganizationImage={uploadOrganizationImage}
                  />
                )}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default OrganizationManage
