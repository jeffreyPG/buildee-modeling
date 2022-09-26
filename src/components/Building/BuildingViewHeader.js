import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { GenerateReportsModal } from '../../containers/Modal'
import buildingTypes from 'static/building-types'
import styles from './BuildingViewHeader.scss'
import buildingStyles from './Building.scss'
import { truncateName, detectMobileTouch, isProdEnv } from 'utils/Utils'
import UserFeature from '../../utils/Feature/UserFeature'
import { formatNumbersWithCommas } from 'utils/Utils'

export class BuildingViewHeader extends React.Component {
  static propTypes = {
    allBuildingsLink: PropTypes.func.isRequired,
    buildingInfo: PropTypes.object.isRequired,
    datePicker: PropTypes.object.isRequired,
    getOrganizationTemplates: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    getOrganizationSpreadsheetTemplates: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    archiveBuilding: PropTypes.func.isRequired,
    getAllOrganizationTemplates: PropTypes.func.isRequired,
    manageAllOrgSelected: PropTypes.bool.isRequired
  }

  state = {
    openReportsModal: false,
    windowWidth: '',
    showExtras: false
  }

  componentDidMount = () => {
    this.handleUpdateDimensions()
    window.addEventListener('resize', this.handleUpdateDimensions)
    document.addEventListener('mousedown', this.handleClick, false)
  }

  componentWillUnmount = () => {
    window.removeEventListener('resize', this.handleUpdateDimensions)
    document.removeEventListener('mousedown', this.handleClick, false)
  }

  handleUpdateDimensions = () => {
    this.setState({ windowWidth: window.innerWidth })
  }

  handleClick = e => {
    if (this.node && this.node.contains(e.target)) {
      // the click is inside, continue to menu links
      return
    }
    // otherwise, toggle (close) the dropdowns
    this.setState({ showExtras: false })
  }

  handleToggleExtras = () => {
    this.setState(prevState => ({
      showExtras: !prevState.showExtras
    }))
  }

  openReportsModal = action => {
    this.setState({ openReportsModal: action })
  }

  handleClickArchiveBuilding = portfolioEnalbed => {
    let buildingId = this.props.buildingInfo && this.props.buildingInfo._id
    this.props
      .archiveBuilding(buildingId, { archived: true })
      .then(() => {
        this.props.allBuildingsLink(portfolioEnalbed)
      })
      .catch(err => {})
  }

  findBuildingUseName = buildingUse => {
    if (buildingUse) {
      let typeObject = buildingTypes.find(type => type.value === buildingUse)
      return typeObject ? typeObject.name : 'Undefined'
    } else {
      return 'Undefined'
    }
  }

  render() {
    const { buildingInfo } = this.props
    const iOS =
      !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform)

    return (
      <div className={styles.buildingHeader}>
        <div className={styles.container}>
          {detectMobileTouch() === 'mobile' && (
            <div
              className={styles.buildingHeaderBack}
              onClick={() => {
                this.props.allBuildingsLink()
              }}
            >
              <i className='material-icons'>arrow_back</i>
              Back to Buildings
            </div>
          )}
          <div className={styles.wrap}>
            <div className={styles.display}>
              <div className={styles.image}>
                {buildingInfo.buildingImage && (
                  <img src={buildingInfo.buildingImage} />
                )}
                {!buildingInfo.buildingImage && (
                  <i className='material-icons'>domain</i>
                )}
              </div>

              <div className={styles.header}>
                {buildingInfo.buildingName && (
                  <h1>
                    {this.state.windowWidth < 600
                      ? truncateName(buildingInfo.buildingName, 25)
                      : buildingInfo.buildingName}
                  </h1>
                )}
                <p>
                  {!!buildingInfo.location.address && (
                    <span>
                      {buildingInfo.location.address}
                      {buildingInfo.location.city &&
                        ', ' + buildingInfo.location.city}
                      {buildingInfo.location.state &&
                        ', ' + buildingInfo.location.state}
                    </span>
                  )}
                  {!!buildingInfo.location.address &&
                    (!!buildingInfo.buildingUse || !!buildingInfo.squareFeet) &&
                    '\xa0\xa0\xa0|\xa0\xa0\xa0'}
                  {!!buildingInfo.buildingUse && (
                    <span>
                      {this.findBuildingUseName(buildingInfo.buildingUse)}
                    </span>
                  )}
                  {!!buildingInfo.buildingUse &&
                    !!buildingInfo.squareFeet &&
                    '\xa0\xa0\xa0|\xa0\xa0\xa0'}
                  {!!buildingInfo.squareFeet && (
                    <span>
                      {buildingInfo.squareFeet
                        ? formatNumbersWithCommas(
                            _.round(buildingInfo.squareFeet)
                          )
                        : 0}{' '}
                      ft
                      {'\u00B2'}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className={buildingStyles.buildingButtons}>
              <div className={styles.buttons}>
                <button
                  className={classNames(styles.button, styles.buttonSecondary)}
                  onClick={() => {
                    this.openReportsModal(true)
                  }}
                  disabled={this.props.loading}
                >
                  Export
                </button>
              </div>
              <div
                onClick={this.handleToggleExtras}
                className={classNames(
                  buildingStyles.buildingButtonsMore,
                  buildingStyles.extras,
                  this.state.showExtras
                    ? buildingStyles.extrasShow
                    : buildingStyles.extrasHide,
                  styles.centerAlign
                )}
                ref={node => (this.node = node)}
              >
                <span
                  className={classNames(
                    buildingStyles.extrasButton,
                    styles.extrasButton
                  )}
                />
                <div
                  className={classNames(
                    buildingStyles.extrasDropdown,
                    buildingStyles.extrasDropdownRight
                  )}
                >
                  <UserFeature name='portfolio'>
                    {({ enabled }) => {
                      return (
                        <div
                          className={styles.extrasLink}
                          onClick={() =>
                            this.handleClickArchiveBuilding(enabled)
                          }
                        >
                          <i className='material-icons'>archive</i>Archive
                          Building
                        </div>
                      )
                    }}
                  </UserFeature>
                </div>
              </div>
            </div>
          </div>

          {this.state.openReportsModal && (
            <UserFeature name='projectProposal'>
              {({ enabled }) => {
                return (
                  <GenerateReportsModal
                    building={this.props.buildingInfo}
                    datePicker={this.props.datePicker}
                    getOrganizationTemplates={
                      this.props.getOrganizationTemplates
                    }
                    openReportsModal={this.openReportsModal}
                    getOrganizationSpreadsheetTemplates={
                      this.props.getOrganizationSpreadsheetTemplates
                    }
                    user={this.props.user}
                    proposalEnabled={enabled}
                    getAllOrganizationTemplates={
                      this.props.getAllOrganizationTemplates
                    }
                    manageAllOrgSelected={this.props.manageAllOrgSelected}
                  />
                )
              }}
            </UserFeature>
          )}
        </div>
      </div>
    )
  }
}

export default BuildingViewHeader
