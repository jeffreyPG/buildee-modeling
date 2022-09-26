import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { withApollo } from 'react-apollo'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import styles from './SubHeader.scss'
import UserFeature from '../../utils/Feature/UserFeature'
import { Query } from 'react-apollo'
import { detectMobileTouch, parentNodeHasClass } from 'utils/Utils'
import { ENABLED_FEATURES } from '../../utils/graphql/queries/user'

class SubHeader extends React.Component {
  state = {
    activeTab: 'manage',
    tabs: [
      { name: 'Documents', active: true, featureFlag: 'reportDocuments' },
      { name: 'Spreadsheets', active: true, featureFlag: 'reportSpreadsheets' }
    ],
    showOrgDropdown: false,
    showLibraryDropDown: false,
    showAllOrganizationDropdown: false,
    windowWidth: ''
  }

  UNSAFE_componentWillMount = () => {
    this.handleUpdateDimensions()
    document.addEventListener('mousedown', this.handleReportsClick, false)
    window.addEventListener('resize', this.handleUpdateDimensions)
  }

  handleUpdateDimensions = () => {
    this.setState({ windowWidth: window.innerWidth })
  }

  componentDidMount = () => {
    this.handleActiveTab()
  }

  componentDidUpdate = prevProps => {
    if (prevProps !== this.props) {
      this.handleActiveTab()
    }
  }

  componentWillUnmount = () => {
    document.removeEventListener('mousedown', this.handleReportsClick, false)
    window.removeEventListener('resize', this.handleUpdateDimensions)
  }

  handleActiveTab = () => {
    if (window.location.href.indexOf('manage') > -1) {
      if (window.location.href.includes('users')) {
        this.setState({ activeTab: 'users' })
      } else if (window.location.href.includes('features')) {
        this.setState({ activeTab: 'features' })
      } else this.setState({ activeTab: 'manage' })
    }
    if (window.location.href.indexOf('library/my') > -1) {
      this.setState({ activeTab: 'myLibrary' })
      return
    }
    if (window.location.href.indexOf('library/public') > -1) {
      this.setState({ activeTab: 'publicLibrary' })
      return
    }
    if (window.location.href.indexOf('library') > -1) {
      this.setState({ activeTab: 'myLibrary' })
      return
    }
    if (window.location.href.indexOf('spreadsheet') > -1) {
      this.setState({ activeTab: 'spreadsheets' })
      return
    }
    if (window.location.href.indexOf('template') > -1) {
      this.setState({ activeTab: 'templates' })
      return
    }
    if (window.location.href.indexOf('settings') > -1) {
      this.setState({ activeTab: 'settings' })
      return
    }
  }

  handleReportsClick = e => {
    // the click is inside, continue to menu links
    if (parentNodeHasClass(e.target, 'libraryClick')) {
      this.setState({ showOrgDropdown: false })
      this.setState({ showAllOrganizationDropdown: false })
      return
    }
    if (parentNodeHasClass(e.target, 'reportsClick')) {
      this.setState({ showLibraryDropDown: false })
      this.setState({ showAllOrganizationDropdown: false })
      return
    }
    if (parentNodeHasClass(e.target, 'allOrganizationClick')) {
      this.setState({ showOrgDropdown: false })
      this.setState({ showLibraryDropDown: false })
      return
    }
    // otherwise, toggle (close) the dropdowns
    this.setState({ showOrgDropdown: false })
    this.setState({ showLibraryDropDown: false })
    this.setState({ showAllOrganizationDropdown: false })
  }

  checkRoute = () => {
    if (window.location.href.indexOf('manage') > -1) {
      return true
    }
    if (window.location.href.indexOf('library') > -1) {
      return true
    }
    if (window.location.href.indexOf('spreadsheet') > -1) {
      return true
    }
    if (window.location.href.indexOf('template') > -1) {
      return true
    }
    if (window.location.href.indexOf('settings') > -1) {
      return true
    }
    return false
  }

  toggleOrganizationDropdown = () => {
    this.setState({ showOrgDropdown: !this.state.showOrgDropdown })
  }

  toggleLibraryDropdown = () => {
    this.setState({ showLibraryDropDown: !this.state.showLibraryDropDown })
  }

  toggleAllOrganizationDropdown = () => {
    this.setState({
      showAllOrganizationDropdown: !this.state.showAllOrganizationDropdown
    })
  }

  closeOrganizationDropdown = () => {
    this.setState({ showOrgDropdown: false })
  }

  closeLibraryDropdown = () => {
    this.setState({ showLibraryDropDown: false })
  }

  closeAllOrganizationDropdown = () => {
    this.setState({ showAllOrganizationDropdown: false })
  }

  handleClickManage = event => {
    event.preventDefault()
    if (this.props.manageAllOrgSelected) {
      this.props.push('/organization/manage/all')
      this.setState({ activeTab: 'manage' })
    } else {
      this.props.push(
        '/organization/' + this.props.organizationView._id + '/manage'
      )
      this.setState({ activeTab: 'manage' })
    }
  }

  handleClickSettings = event => {
    event.preventDefault()
    this.props.push(
      '/organization/' + this.props.organizationView._id + '/settings'
    )
    this.setState({ activeTab: 'settings' })
  }

  handleClickTemplates = value => {
    if (value == 'Documents') {
      if (this.props.manageAllOrgSelected) {
        this.props.push('/organization/template/all')
      } else {
        this.props.push(
          '/organization/' + this.props.organizationView._id + '/template'
        )
      }

      this.setState({ activeTab: 'templates' })
    } else if (value == 'Spreadsheets') {
      this.props.push('/spreadsheet/templatelist')
      this.setState({ activeTab: 'spreadsheets' })
    }
    this.closeOrganizationDropdown()
  }

  handleClickLibraries = value => {
    if (value == 'myLibrary') {
      if (this.props.manageAllOrgSelected) {
        this.props.push('/organization/library/my')
      } else {
        this.props.push(
          '/organization/' + this.props.organizationView._id + '/library/my'
        )
      }

      this.setState({ activeTab: 'myLibrary' })
    } else if (value == 'publicLibrary') {
      if (this.props.manageAllOrgSelected) {
        this.props.push('/organization/library/public')
      } else {
        this.props.push(
          '/organization/' + this.props.organizationView._id + '/library/public'
        )
      }
      this.setState({ activeTab: 'publicLibrary' })
    }
    this.closeLibraryDropdown()
  }

  handleClickAllOrganization = value => {
    let tab = ''
    switch (value) {
      case 'users':
        tab = '/users'
        break
      case 'features':
        tab = '/features'
        break
      default:
        break
    }
    let url = `/organization/manage/all`
    if (!this.props.manageAllOrgSelected) {
      url = '/organization/' + this.props.organizationView._id + '/manage'
    }
    this.props.push(tab ? `${url}${tab}` : url)
    this.closeAllOrganizationDropdown()
  }

  handleClickSettings = () => {
    const url = '/organization/' + this.props.organizationView._id + '/settings'
    this.props.push(url)
    this.setState({
      activeTab: 'settings'
    })
  }

  renderAllOrganizationDropdownText = () => {
    const { activeTab } = this.state
    switch (activeTab) {
      case 'users':
        return 'Users'
      case 'features':
        return 'Feature Flags'
      default:
        return 'Organization'
    }
  }

  render() {
    const { windowWidth, showAllOrganizationDropdown, activeTab } = this.state
    const { manageAllOrgSelected } = this.props
    let check = this.checkRoute()
    if (!check || windowWidth < 799) return null

    return (
      <div className={styles.SubHeaderNav}>
        <div className={styles.container}>
          <div
            className={classNames(
              styles.SubHeaderNavDesktop,
              styles.SubHeaderNavDesktopShow
            )}
          >
            <div
              className={classNames(
                styles.link,
                'allOrganizationClick',
                activeTab === 'manage' ||
                  activeTab === 'users' ||
                  activeTab === 'features'
                  ? styles.active
                  : ''
              )}
            >
              <a
                className={classNames(styles.link, 'allOrganization')}
                onClick={() => this.toggleAllOrganizationDropdown()}
                data-test='reports-header-link'
              >
                <span>{this.renderAllOrganizationDropdownText()}</span>
                <i className='material-icons'>expand_more</i>
              </a>
              {showAllOrganizationDropdown && (
                <ul
                  className={classNames(
                    styles.organziationDropdown,
                    'allOrganization'
                  )}
                >
                  <li
                    className={
                      activeTab == 'manage' ? styles['link-active'] : ''
                    }
                    onClick={() => this.handleClickAllOrganization('manage')}
                    value='OrganizationManage'
                    data-test='AllOrganization-header-link'
                  >
                    Organizations
                  </li>
                  <li
                    className={
                      activeTab == 'users' ? styles['link-active'] : ''
                    }
                    onClick={() => this.handleClickAllOrganization('users')}
                    value='UserManage'
                    data-test='AllOrganizationUsers-header-link'
                  >
                    Users
                  </li>
                </ul>
              )}
            </div>

            {/* <div
                className={classNames(
                  styles.link,
                  styles.manage,
                  this.state.activeTab === 'manage' ? styles.active : ''
                )}
                onClick={this.handleClickManage}
              >
                Users
              </div> */}

            <Query query={ENABLED_FEATURES}>
              {({ data }) => {
                if (!data) return null
                const enabledFeatures = data.enabledFeatures || []
                const { showLibraryDropDown, activeTab } = this.state
                const isLibaryEnabled = enabledFeatures.some(
                  feature => feature.name === 'library'
                )
                const isMyLibraryEnabled = enabledFeatures.some(
                  feature => feature.name === 'myLibrary'
                )
                const isPublicLibraryEnabled = enabledFeatures.some(
                  feature => feature.name === 'publicLibrary'
                )
                if (
                  !isLibaryEnabled ||
                  (!isMyLibraryEnabled && !isPublicLibraryEnabled)
                )
                  return null
                return (
                  <div
                    className={classNames(
                      styles.link,
                      'libraryClick',
                      activeTab === 'myLibrary' || activeTab === 'publicLibrary'
                        ? styles.active
                        : ''
                    )}
                  >
                    <a
                      className={classNames(styles.link, 'libraryClick')}
                      onClick={() => this.toggleLibraryDropdown()}
                      data-test='reports-header-link'
                    >
                      <span>Measure Library</span>
                      <i className='material-icons'>expand_more</i>
                    </a>
                    {showLibraryDropDown && (
                      <ul
                        className={classNames(
                          windowWidth > 799 ? styles.organziationDropdown : '',
                          windowWidth > 799 ? styles.wide : '',
                          windowWidth <= 799
                            ? styles.mobileOrganziationDropdown
                            : '',
                          'libraryClick'
                        )}
                      >
                        {isMyLibraryEnabled && (
                          <li
                            className={
                              activeTab == 'myLibrary'
                                ? styles['link-active']
                                : ''
                            }
                            onClick={() =>
                              this.handleClickLibraries('myLibrary')
                            }
                            value='Documents'
                            data-test='documents-header-link'
                          >
                            My Library
                          </li>
                        )}
                        {isPublicLibraryEnabled && (
                          <li
                            className={
                              activeTab == 'publicLibrary'
                                ? styles['link-active']
                                : ''
                            }
                            onClick={() =>
                              this.handleClickLibraries('publicLibrary')
                            }
                            value='Spreadsheets'
                            data-test='spreadsheets-header-link'
                          >
                            Public Library
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                )
              }}
            </Query>
            {detectMobileTouch() === 'desktop' && (
              <div>
                <Query query={ENABLED_FEATURES}>
                  {({ data }) => {
                    if (!data) return null
                    const enabledFeatures = data.enabledFeatures || []
                    const { showOrgDropdown, activeTab } = this.state
                    const tabs = this.state.tabs.filter(
                      ({ name, featureFlag }) =>
                        enabledFeatures.some(
                          feature => feature.name === featureFlag
                        )
                    )
                    if (tabs.length === 0) return null
                    if (tabs.length > 1) {
                      return (
                        <div
                          className={classNames(
                            styles.link,
                            'reportsClick',
                            activeTab === 'templates' ||
                              activeTab === 'spreadsheets'
                              ? styles.active
                              : ''
                          )}
                        >
                          <a
                            className={classNames(styles.link, 'reportsClick')}
                            onClick={() => this.toggleOrganizationDropdown()}
                            data-test='reports-header-link'
                          >
                            <span>Report Templates</span>
                            <i className='material-icons'>expand_more</i>
                          </a>
                          {showOrgDropdown && (
                            <ul
                              className={classNames(
                                windowWidth > 799
                                  ? styles.organziationDropdown
                                  : '',
                                windowWidth > 799 ? styles.wide : '',
                                windowWidth <= 799
                                  ? styles.mobileOrganziationDropdown
                                  : '',
                                'reportsClick'
                              )}
                            >
                              <li
                                className={
                                  activeTab == 'templates'
                                    ? styles['link-active']
                                    : ''
                                }
                                onClick={() =>
                                  this.handleClickTemplates('Documents')
                                }
                                value='Documents'
                                data-test='documents-header-link'
                              >
                                Documents Templates
                              </li>
                              <li
                                className={
                                  activeTab == 'spreadsheets'
                                    ? styles['link-active']
                                    : ''
                                }
                                onClick={() =>
                                  this.handleClickTemplates('Spreadsheets')
                                }
                                value='Spreadsheets'
                                data-test='spreadsheets-header-link'
                              >
                                Spreadsheets Templates
                              </li>
                            </ul>
                          )}
                        </div>
                      )
                    }
                    let tab = tabs[0]
                    return (
                      <div
                        className={classNames(
                          styles.link,
                          this.state.activeTab === 'templates' ||
                            this.state.activeTab === 'spreadsheets'
                            ? styles.active
                            : ''
                        )}
                        name={tab.name}
                        id={`${tab.name}`}
                        value={tab.name}
                        onClick={() => this.handleClickTemplates(tab.name)}
                        data-test='reports-header-link'
                      >
                        Reports
                      </div>
                    )
                  }}
                </Query>
              </div>
            )}
            <div
              className={classNames(
                styles.link,
                styles.settings,
                this.state.activeTab === 'settings' ? styles.active : ''
              )}
              onClick={this.handleClickSettings}
            >
              Settings
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = {
  push
}

const mapStateToProps = state => ({
  user: state.login.user || {},
  organizationView: state.organization.organizationView || {},
  organizationList: state.organization.organizationList || [],
  manageAllOrgSelected: state.organization.manageAllOrgSelected || false
})

export default withApollo(
  connect(mapStateToProps, mapDispatchToProps)(SubHeader)
)
