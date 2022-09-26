import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { withApollo } from 'react-apollo'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import styles from './LoggedInHeader.scss'
import { logout } from 'routes/Login/modules/login'
import Logo from '../../components/Svg'
import {
  getOrganizations,
  getOrganization,
  toggleManageAllOrgs
} from 'routes/Organization/modules/organization'
import { updatePortfolioTab } from 'routes/Portfolio/modules/portfolio'
import { updateUserProducts } from 'routes/Profile/modules/profile'
import { clearDocuSignStore } from 'routes/DocuSign/modules/docuSign'
import { AppDropdown, UserDropdown, OrganizationDropdown } from './'
import { detectMobileTouch, parentNodeHasClass, isProdEnv } from 'utils/Utils'
import UserFeature from '../../utils/Feature/UserFeature'
import { withAuth0 } from '@auth0/auth0-react'

const defaultTheme = {
  primaryColor: '#48A272',
  secondaryColor: '#17253F',
  linkColor: '#54BE85',
  headerTextColor: '#FFFFFF',
  primaryTextColor: '#17253F'
}

const applyBrandTheme = theme => {
  const {
    primaryColor,
    secondaryColor,
    linkColor,
    headerTextColor,
    primaryTextColor
  } = theme
  document.documentElement.style.setProperty('--primary-color', primaryColor)
  document.documentElement.style.setProperty(
    '--secondary-color',
    secondaryColor
  )
  document.documentElement.style.setProperty(
    '--header-text-color',
    headerTextColor
  )
  document.documentElement.style.setProperty('--link-color', linkColor)
  document.documentElement.style.setProperty(
    '--primary-text-color',
    primaryTextColor
  )
}

export class LoggedInHeader extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    organizationView: PropTypes.object.isRequired,
    push: PropTypes.func.isRequired,
    getOrganizations: PropTypes.func.isRequired,
    getOrganization: PropTypes.func.isRequired,
    updateUserProducts: PropTypes.func.isRequired,
    logout: PropTypes.func.isRequired
  }
  state = {
    activeTab: '',
    openMobile: false,
    tabs: [
      { name: 'Documents', active: true, featureFlag: 'reportDocuments' },
      { name: 'Spreadsheets', active: true, featureFlag: 'reportSpreadsheets' }
    ],
    showOrgDropdown: false,
    windowWidth: ''
  }

  UNSAFE_componentWillMount = () => {
    this.handleUpdateDimensions()
    document.addEventListener('mousedown', this.handleClick, false)
    document.addEventListener('mousedown', this.handleReportsClick, false)
    applyBrandTheme(this.props.theme)
  }

  handleUpdateDimensions = () => {
    this.setState({ windowWidth: window.innerWidth })
  }

  setupIntercomTrack = () => {
    const { user } = this.props
    if (isProdEnv(process.env.DOMAIN_ENV)) {
      window.Intercom('boot', {
        app_id: 'gqgtysua',
        name: user.name,
        email: user.email,
        created_at: user.created,
        custom_launcher_selector: '#IntercomHelp'
      })
    }
  }

  componentWillUnmount = () => {
    document.removeEventListener('mousedown', this.handleClick, false)
    document.removeEventListener('mousedown', this.handleReportsClick, false)
    this.setState({ openMobile: false })
    if (isProdEnv(process.env.DOMAIN_ENV)) {
      window.Intercom('shutdown', {
        app_id: 'gqgtysua'
      })
    }
  }

  componentDidMount = () => {
    this.handleActiveTab()
    this.setupIntercomTrack()
  }

  componentDidUpdate = prevProps => {
    if (prevProps !== this.props) {
      this.handleActiveTab()
    }
  }

  UNSAFE_componentWillUpdate = nextProps => {
    if (nextProps.organizationView !== this.props.organizationView) {
      applyBrandTheme(nextProps.theme)
    }
  }

  handleReportsClick = e => {
    // the click is inside, continue to menu links
    if (parentNodeHasClass(e.target, 'reportsClick')) return
    // otherwise, toggle (close) the dropdowns
    this.setState({ showOrgDropdown: false })
  }
  handleClick = e => {
    // the click is inside, continue to menu links
    if (this.node && this.node.contains(e.target)) return
    // otherwise, toggle (close) the dropdowns
    this.setState({ openMobile: false })
  }

  handleOpenMobileMenu = () => {
    this.setState(prevState => ({
      openMobile: !prevState.openMobile
    }))
  }

  handleCloseMobileMenu = () => {
    this.setState({ openMobile: false })
  }

  handleClickLogo = (event, enabled) => {
    event.preventDefault()
    if (enabled) {
      this.props.push(
        '/organization/' + this.props.organizationView._id + '/portfolio'
      )
      this.setState({ activeTab: 'portfolio' })
    } else {
      this.props.push(
        '/organization/' + this.props.organizationView._id + '/building'
      )
    }
    this.setState({ openMobile: false })
  }

  handleClickPortfolio = (event, info = 'dashboard') => {
    event.preventDefault()
    this.props.push(
      '/organization/' +
        this.props.organizationView._id +
        '/portfolio/' +
        `${info}`
    )
    let activeTab = 'portfolio'
    switch (info) {
      case 'building':
        activeTab = 'building'
        break
      case 'measure':
        activeTab = 'measure'
        break
      case 'project':
        activeTab = 'project'
        break
      case 'scenario':
        activeTab = 'scenario'
        break
      case 'proposal':
        activeTab = 'proposal'
        break
    }
    this.setState({ activeTab: activeTab, openMobile: false })
  }

  handleClickBuildings = event => {
    event.preventDefault()
    this.props.push(
      '/organization/' + this.props.organizationView._id + '/building'
    )
    this.setState({ activeTab: 'buildings', openMobile: false })
  }

  handleClickLibrary = event => {
    event.preventDefault()
    this.props.push(
      '/organization/' + this.props.organizationView._id + '/library'
    )
    this.setState({ activeTab: 'library', openMobile: false })
  }

  handleClickTemplates = value => {
    if (value == 'Documents') {
      this.props.push(
        '/organization/' + this.props.organizationView._id + '/template'
      )
      this.setState({ activeTab: 'templates', openMobile: false })
    } else if (value == 'Spreadsheets') {
      this.props.push('/spreadsheet/templatelist')
      this.setState({ activeTab: 'spreadsheets', openMobile: false })
    }
    this.closeOrganizationDropdown()
  }

  handleActiveTab = () => {
    if (window.location.href.indexOf('building') > -1) {
      this.setState({ activeTab: 'buildings' })
    }
    if (window.location.href.indexOf('template') > -1) {
      this.setState({ activeTab: 'templates' })
    }
    if (window.location.href.indexOf('spreadsheet') > -1) {
      this.setState({ activeTab: 'spreadsheets' })
    }
    if (window.location.href.indexOf('library') > -1) {
      this.setState({ activeTab: 'library' })
    }
    if (window.location.href.indexOf('dashboard') > -1) {
      this.setState({ activeTab: 'dashboard' })
    }
    if (window.location.href.indexOf('portfolio') > -1) {
      this.setState({ activeTab: 'portfolio' })
    }
    if (window.location.href.indexOf('portfolio/project') > -1) {
      this.setState({ activeTab: 'project' })
    }
    if (window.location.href.indexOf('portfolio/building') > -1) {
      this.setState({ activeTab: 'building' })
    }
    if (window.location.href.indexOf('portfolio/measure') > -1) {
      this.setState({ activeTab: 'measure' })
    }
    if (window.location.href.indexOf('portfolio/team') > -1) {
      this.setState({ activeTab: 'team' })
    }
    if (window.location.href.indexOf('portfolio/scenario') > -1) {
      this.setState({ activeTab: 'scenario' })
    }
    if (window.location.href.indexOf('portfolio/proposal') > -1) {
      this.setState({ activeTab: 'proposal' })
    }
  }

  handleLogout = () => {
    this.props.auth0.logout({ returnTo: window.location.origin })
    this.props.logout().then(() => {
      this.props.client.resetStore()
    })
  }

  toggleOrganizationDropdown = () => {
    this.setState({ showOrgDropdown: !this.state.showOrgDropdown })
  }
  closeOrganizationDropdown = () => {
    this.setState({ showOrgDropdown: false })
  }
  handleChartDashboard = () => {
    this.props.push('/chart/dashboard')
    this.setState({ activeTab: 'dashboard', openMobile: false })
  }
  render() {
    const { user, theme } = this.props
    const { windowWidth } = this.state
    // If the user is in the forgot password flow then do not render the top menu
    if (user.resetPassword) {
      return <span />
    }

    return (
      <div className={styles.headerNav} id="headerNav">
        <div
          className={classNames(
            styles.headerNavMobile,
            this.state.openMobile ? styles.active : ''
          )}
        >
          <div
            className={classNames(
              styles.headerNavMobileInner,
              this.state.openMobile ? styles.active : ''
            )}
            ref={node => (this.node = node)}
          >
            <UserFeature name="portfolio">
              {({ enabled }) => {
                return (
                  <div
                    className={styles.logo}
                    onClick={e => this.handleClickLogo(e, enabled)}
                  >
                    <Logo maxHeight={'home'} theme={theme} />
                  </div>
                )
              }}
            </UserFeature>
            {user.acceptedTerms && (
              <div className={classNames(styles.orgDropdown, 'menuClick')}>
                <UserFeature name="portfolio">
                  {({ enabled }) => {
                    return (
                      <OrganizationDropdown
                        push={this.props.push}
                        user={this.props.user}
                        organizationView={this.props.organizationView}
                        getOrganizations={this.props.getOrganizations}
                        manageAllOrgSelected={this.props.manageAllOrgSelected}
                        getOrganization={this.props.getOrganization}
                        handleCloseMobileMenu={this.handleCloseMobileMenu}
                        enabledPortfolio={enabled}
                        updatePortfolioTab={this.props.updatePortfolioTab}
                        clearDocuSignStore={this.props.clearDocuSignStore}
                        toggleManageAllOrgs={this.props.toggleManageAllOrgs}
                      />
                    )
                  }}
                </UserFeature>
              </div>
            )}

            {user.acceptedTerms && (
              <div className={styles.links}>
                <UserFeature name="portfolio">
                  {({ enabled }) => {
                    if (enabled && detectMobileTouch() !== 'mobile')
                      return (
                        <div
                          className={styles.link}
                          onClick={this.handleClickPortfolio}
                        >
                          <span>PortFolio</span>
                          <i className="material-icons">domain</i>
                        </div>
                      )
                    return (
                      <div
                        className={styles.link}
                        onClick={this.handleClickBuildings}
                      >
                        <span>Buildings</span>
                        <i className="material-icons">domain</i>
                      </div>
                    )
                  }}
                </UserFeature>

                <UserFeature name="library">
                  {({ enabled }) => {
                    if (!enabled) return null
                    return (
                      <div
                        className={styles.link}
                        onClick={this.handleClickLibrary}
                      >
                        <span>Library</span>
                        <i className="material-icons">library_books</i>
                      </div>
                    )
                  }}
                </UserFeature>
                {detectMobileTouch() === 'desktop' && (
                  <div
                    className={styles.link}
                    onClick={() => this.handleClickTemplates('Documents')}
                  >
                    <span>Reports</span>
                    <i className="material-icons">bar_chart</i>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={styles.container} data-test="logged-in-header">
          <div className={styles.headerNavMain}>
            <div
              className={styles.headerNavMobileClick}
              onClick={() => this.handleOpenMobileMenu()}
            >
              <span />
            </div>
            <UserFeature name="portfolio">
              {({ enabled }) => {
                return (
                  <div
                    className={styles.headerNavLogo}
                    onClick={e => this.handleClickLogo(e, enabled)}
                  >
                    <Logo maxHeight={'twenty'} theme={theme} />
                  </div>
                )
              }}
            </UserFeature>
            {user.acceptedTerms && (
              <div
                className={classNames(
                  styles.headerNavDesktop,
                  styles.headerNavDesktopShow
                )}
              >
                <div className={classNames(styles.menus, styles.orgs)}>
                  <UserFeature name="portfolio">
                    {({ enabled }) => {
                      return (
                        <OrganizationDropdown
                          push={this.props.push}
                          user={this.props.user}
                          organizationView={this.props.organizationView}
                          getOrganizations={this.props.getOrganizations}
                          getOrganization={this.props.getOrganization}
                          manageAllOrgSelected={this.props.manageAllOrgSelected}
                          enabledPortfolio={enabled}
                          updatePortfolioTab={this.props.updatePortfolioTab}
                          clearDocuSignStore={this.props.clearDocuSignStore}
                          toggleManageAllOrgs={this.props.toggleManageAllOrgs}
                        />
                      )
                    }}
                  </UserFeature>
                </div>
                <UserFeature name="portfolio">
                  {({ enabled }) => {
                    if (!enabled || detectMobileTouch() == 'mobile')
                      return (
                        <div
                          className={classNames(
                            styles.link,
                            this.state.activeTab === 'buildings'
                              ? styles.active
                              : ''
                          )}
                          onClick={this.handleClickBuildings}
                        >
                          Buildings
                        </div>
                      )
                    return (
                      <div
                        className={classNames(
                          styles.link,
                          this.state.activeTab === 'portfolio'
                            ? styles.active
                            : ''
                        )}
                        onClick={event =>
                          this.handleClickPortfolio(event, 'dashboard')
                        }
                      >
                        Dashboard
                      </div>
                    )
                  }}
                </UserFeature>
                <UserFeature name="portfolio">
                  {({ enabled }) => {
                    if (!enabled) return null
                    return (
                      <UserFeature name="portfolioBuilding">
                        {({ enabled }) => {
                          if (!enabled) return null
                          return (
                            <div
                              className={classNames(
                                styles.link,
                                this.state.activeTab === 'building'
                                  ? styles.active
                                  : ''
                              )}
                              onClick={event =>
                                this.handleClickPortfolio(event, 'building')
                              }
                            >
                              Buildings
                            </div>
                          )
                        }}
                      </UserFeature>
                    )
                  }}
                </UserFeature>
                <UserFeature name="portfolio">
                  {({ enabled }) => {
                    if (!enabled) return null
                    return (
                      <UserFeature name="buildingProjects">
                        {({ enabled }) => {
                          if (!enabled) return null
                          return (
                            <div
                              className={classNames(
                                styles.link,
                                this.state.activeTab === 'measure'
                                  ? styles.active
                                  : ''
                              )}
                              onClick={event =>
                                this.handleClickPortfolio(event, 'measure')
                              }
                            >
                              Measures
                            </div>
                          )
                        }}
                      </UserFeature>
                    )
                  }}
                </UserFeature>

                <UserFeature name="portfolio">
                  {({ enabled }) => {
                    if (!enabled) return null
                    return (
                      <UserFeature name="projectProposal">
                        {({ enabled }) => {
                          if (!enabled) return null
                          return (
                            <div
                              className={classNames(
                                styles.link,
                                this.state.activeTab === 'proposal'
                                  ? styles.active
                                  : ''
                              )}
                              onClick={event =>
                                this.handleClickPortfolio(event, 'proposal')
                              }
                            >
                              Proposals
                            </div>
                          )
                        }}
                      </UserFeature>
                    )
                  }}
                </UserFeature>
                <UserFeature name="portfolio">
                  {({ enabled }) => {
                    if (!enabled) return null
                    return (
                      <UserFeature name="projectProject">
                        {({ enabled }) => {
                          if (!enabled) return null
                          return (
                            <div
                              className={classNames(
                                styles.link,
                                this.state.activeTab === 'project'
                                  ? styles.active
                                  : ''
                              )}
                              onClick={event =>
                                this.handleClickPortfolio(event, 'project')
                              }
                            >
                              Projects
                            </div>
                          )
                        }}
                      </UserFeature>
                    )
                  }}
                </UserFeature>
                <UserFeature name="portfolio">
                  {({ enabled }) => {
                    if (!enabled) return null
                    return (
                      <UserFeature name="team">
                        {({ enabled }) => {
                          if (!enabled) return null
                          return (
                            <div
                              className={classNames(
                                styles.link,
                                this.state.activeTab === 'team'
                                  ? styles.active
                                  : ''
                              )}
                              onClick={event =>
                                this.handleClickPortfolio(event, 'team')
                              }
                            >
                              Teams
                            </div>
                          )
                        }}
                      </UserFeature>
                    )
                  }}
                </UserFeature>
                <UserFeature name="scenario">
                  {({ enabled }) => {
                    if (!enabled) return null
                    return (
                      <div
                        className={classNames(
                          styles.link,
                          this.state.activeTab === 'scenario'
                            ? styles.active
                            : ''
                        )}
                        onClick={event =>
                          this.handleClickPortfolio(event, 'scenario')
                        }
                      >
                        Scenarios
                      </div>
                    )
                  }}
                </UserFeature>
                {/* <UserFeature name="library">
                  {({ enabled }) => {
                    if (!enabled) return null
                    return (
                      <div
                        className={classNames(
                          styles.link,
                          this.state.activeTab === 'library'
                            ? styles.active
                            : ''
                        )}
                        onClick={this.handleClickLibrary}
                      >
                        Library
                      </div>
                    )
                  }}
                </UserFeature> */}
                {/* {detectMobileTouch() === 'desktop' && (
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
                                className={classNames(
                                  styles.link,
                                  'reportsClick'
                                )}
                                onClick={() =>
                                  this.toggleOrganizationDropdown()
                                }
                                data-test="reports-header-link"
                              >
                                <span>Reports</span>
                                <i className="material-icons">expand_more</i>
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
                                    value="Documents"
                                    data-test="documents-header-link"
                                  >
                                    Documents
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
                                    value="Spreadsheets"
                                    data-test="spreadsheets-header-link"
                                  >
                                    Spreadsheets
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
                            data-test="reports-header-link"
                          >
                            Reports
                          </div>
                        )
                      }}
                    </Query>
                  </div>
                )} */}
              </div>
            )}
          </div>

          <div className={styles.headerNavDesktop}>
            {user &&
              ((user.firebaseRefs &&
                user.firebaseRefs.orgId &&
                user.firebaseRefs.userId) ||
                (user.products &&
                  user.products.buildeeNYC &&
                  (user.products.buildeeNYC === 'show' ||
                    user.products.buildeeNYC === 'access'))) && (
                <div className={styles.menus}>
                  <AppDropdown
                    push={this.props.push}
                    products={this.props.user.products}
                    updateUserProducts={this.props.updateUserProducts}
                  />
                </div>
              )}
            {!!isProdEnv(process.env.DOMAIN_ENV) && (
              <div
                id="IntercomHelp"
                className={classNames(styles.helpContainer, styles.menus)}
              >
                <i id="helpIcon" className="material-icons">
                  help_outline
                </i>
              </div>
            )}
            <div className={styles.menus}>
              <UserDropdown
                push={this.props.push}
                logout={this.handleLogout}
                user={this.props.user}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = {
  getOrganizations,
  getOrganization,
  updateUserProducts,
  push,
  updatePortfolioTab,
  logout,
  clearDocuSignStore,
  toggleManageAllOrgs
}

const mapStateToProps = state => {
  const currentOrg = state.organization.organizationList.find(org => {
    if (state.organization.organizationView) {
      return org._id === state.organization.organizationView._id
    }
  })
  return {
    user: state.login.user || {},
    organizationView: state.organization.organizationView || {},
    manageAllOrgSelected: state.organization.manageAllOrgSelected || false,
    theme: (currentOrg && currentOrg.theme) || defaultTheme
  }
}

export default withApollo(
  connect(mapStateToProps, mapDispatchToProps)(withAuth0(LoggedInHeader))
)
