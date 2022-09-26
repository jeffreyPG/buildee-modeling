import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Loader } from 'utils/Loader'
import styles from './LoggedInHeader.scss'
import {
  parentNodeHasClass,
  truncateName,
  detectMobileTouch
} from 'utils/Utils'
import { sortFunction } from 'utils/Portfolio'
import UserFeature from '../../utils/Feature/UserFeature'

export class OrganizationDropdown extends React.Component {
  static propTypes = {
    getOrganizations: PropTypes.func.isRequired,
    getOrganization: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
    organizationView: PropTypes.object.isRequired,
    handleCloseMobileMenu: PropTypes.func,
    enabledPortfolio: PropTypes.bool,
    manageAllOrgSelected: PropTypes.bool,
    toggleManageAllOrgs: PropTypes.func
  }

  state = {
    showOrgDropdown: false,
    userOrgs: [],
    windowWidth: ''
  }

  UNSAFE_componentWillMount = () => {
    this.handleUpdateDimensions()
    document.addEventListener('mousedown', this.handleClick, false)
    window.addEventListener('resize', this.handleUpdateDimensions)
  }

  componentWillUnmount = () => {
    document.removeEventListener('mousedown', this.handleClick, false)
    window.removeEventListener('resize', this.handleUpdateDimensions)
  }

  componentDidMount = () => {
    this.getOrganizationList()
  }

  componentDidUpdate = prevProps => {
    if (prevProps.organizationView !== this.props.organizationView) {
      this.getOrganizationList()
    }
  }

  getOrganizationList = () => {
    // get all the organizations that the user is a part of
    this.props.getOrganizations().then(orgs => {
      let userOrgs = []
      let organizations = sortFunction(orgs, 'name')
      organizations.map(org => {
        userOrgs.push({
          name: org.name,
          id: org._id
        })
      })
      if (this.props.user) this.setState({ userOrgs: userOrgs })
    })
  }

  handleUpdateDimensions = () => {
    this.setState({ windowWidth: window.innerWidth })
  }

  handleClick = e => {
    // the click is inside, continue to menu links
    if (parentNodeHasClass(e.target, 'orgMenuClick')) return
    // otherwise, toggle (close) the app dropdown
    this.closeOrganizationDropdown()
  }

  closeOrganizationDropdown = () => {
    this.setState({ showOrgDropdown: false })
  }

  toggleOrganizationDropdown = () => {
    this.setState({ showOrgDropdown: !this.state.showOrgDropdown })
  }

  changeOrganization = orgId => {
    const { enabledPortfolio } = this.props
    this.props.clearDocuSignStore()
    if (enabledPortfolio && detectMobileTouch() !== 'mobile') {
      this.props.getOrganization(orgId).then(() => {
        this.props.updatePortfolioTab({ name: 'Overview' }).then(() => {
          this.props.push('/organization/' + orgId + '/portfolio')
        })
      })
    } else {
      this.props.push('/organization/' + orgId + '/building')
    }
    this.toggleOrganizationDropdown()
    this.props.toggleManageAllOrgs(false)
    if (this.props.handleCloseMobileMenu) {
      this.props.handleCloseMobileMenu()
    }
  }

  onManageAllOrgSelected = () => {
    const { enabledPortfolio } = this.props
    this.props.clearDocuSignStore()
    this.props.toggleManageAllOrgs(true)
    if (enabledPortfolio && detectMobileTouch() !== 'mobile') {
      this.props.updatePortfolioTab({ name: 'Overview' }).then(() => {
        this.props.push('/organization/all/portfolio')
      })
    } else {
      this.props.push('/organization/all/building')
    }
    this.toggleOrganizationDropdown()
    if (this.props.handleCloseMobileMenu) {
      this.props.handleCloseMobileMenu()
    }
  }

  manageOrganization = orgId => {
    this.props.push('/organization/' + orgId + '/manage')
    this.toggleOrganizationDropdown()
    if (this.props.handleCloseMobileMenu) {
      this.props.handleCloseMobileMenu()
    }
  }

  manageAllOrganization = () => {
    this.props.push('/organization/manage/all')
    this.toggleOrganizationDropdown()
    if (this.props.handleCloseMobileMenu) {
      this.props.handleCloseMobileMenu()
    }
  }

  render() {
    const { userOrgs, windowWidth, showOrgDropdown } = this.state
    const { organizationView, manageAllOrgSelected } = this.props

    return (
      <div>
        <a
          className={classNames(styles.link, 'orgMenuClick')}
          onClick={() => this.toggleOrganizationDropdown()}
          title="Organizations"
        >
          <span>
            {manageAllOrgSelected
              ? 'All'
              : truncateName(organizationView.name, 16)}
          </span>
          <i className="material-icons">expand_more</i>
        </a>
        {showOrgDropdown && (
          <ul
            className={classNames(
              windowWidth > 799 ? styles.organziationDropdown : '',
              windowWidth > 799 ? styles.wide : '',
              windowWidth <= 799 ? styles.mobileOrganziationDropdown : '',
              'orgMenuClick'
            )}
          >
            {!userOrgs ||
              (userOrgs.length <= 0 && (
                <div className={styles.loader}>
                  <Loader size="button" />
                </div>
              ))}

            {userOrgs.length > 0 && (
              <div>
                <span>CURRENT ORGANIZATION</span>
                {manageAllOrgSelected ? (
                  <UserFeature name="orgsetting" key={'manage-all-org-setting'}>
                    {({ enabled }) => {
                      return (
                        <li
                          onClick={() => {
                            if (enabled) this.manageAllOrganization()
                          }}
                          className={classNames(
                            styles.currentOrg,
                            !enabled ? styles.currentOrgDisabled : ''
                          )}
                        >
                          <div>Manage All</div>
                          {!!enabled && (
                            <i className="material-icons">settings</i>
                          )}
                        </li>
                      )
                    }}
                  </UserFeature>
                ) : (
                  userOrgs.map((org, index) => {
                    if (org.id === organizationView._id) {
                      return (
                        <UserFeature name="orgsetting" key={index}>
                          {({ enabled }) => {
                            return (
                              <li
                                onClick={() => {
                                  if (enabled) this.manageOrganization(org.id)
                                }}
                                className={classNames(
                                  styles.currentOrg,
                                  !enabled ? styles.currentOrgDisabled : ''
                                )}
                              >
                                <div>{org.name}</div>
                                {!!enabled && (
                                  <i className="material-icons">settings</i>
                                )}
                              </li>
                            )
                          }}
                        </UserFeature>
                      )
                    }
                  })
                )}
                {userOrgs.length > 1 && (
                  <>
                    <span className={styles.empty} />
                    <div className={styles.organizationScroll}>
                      <span>ORGANIZATIONS</span>
                      {[
                        userOrgs.length > 1 && !manageAllOrgSelected && (
                          <li
                            key={'MANAGE_ALL'}
                            onClick={this.onManageAllOrgSelected}
                          >
                            Manage All
                          </li>
                        ),
                        userOrgs.map((org, index) => {
                          if (
                            org.id !== organizationView._id ||
                            manageAllOrgSelected
                          ) {
                            return (
                              <li
                                key={index}
                                onClick={() => this.changeOrganization(org.id)}
                              >
                                {org.name}
                              </li>
                            )
                          }
                        })
                      ]}
                    </div>
                  </>
                )}
              </div>
            )}
          </ul>
        )}
      </div>
    )
  }
}

export default OrganizationDropdown
