import React from 'react'
import PropTypes from 'prop-types'
import styles from './Building.scss'
import { Loader } from 'utils/Loader'
import BuildingList from './BuildingList'
import { BuildingListHeader } from './BuildingListHeader'
import TargetModal from 'containers/Modal/TargetModal'

export class Building extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    building: PropTypes.object.isRequired,
    organization: PropTypes.object.isRequired,
    push: PropTypes.func.isRequired,
    getOrganizationBuildings: PropTypes.func.isRequired,
    updateOrganization: PropTypes.func.isRequired,
    deleteBuilding: PropTypes.func.isRequired,
    archiveBuilding: PropTypes.func.isRequired,
    clearInfo: PropTypes.func.isRequired,
    createBuildingFromEA: PropTypes.func.isRequired,
    getEaBuildings: PropTypes.func.isRequired,
    updateBuildingListStatus: PropTypes.func.isRequired,
    updateBuildingTab: PropTypes.func.isRequired,
    updateProjectViewTab: PropTypes.func.isRequired,
    updateBuildingViewMode: PropTypes.func.isRequired,
    createSampleBuilding: PropTypes.func.isRequired
  }

  state = {
    getEaBuildings: true,
    uniqueEaBuildings: [],
    loadingEABuildings: false,
    loadingOrgBuildings: false,
    showTargetModal: false
  }

  UNSAFE_componentWillMount = () => {
    this.props.clearInfo()
  }

  componentDidMount = () => {
    if (this.props.user.resetPassword) {
      this.props.push('/profile/password')
    }
    this.fetchOrgBuildings()
    window.addEventListener('beforeunload', this.componentCleanup)
  }

  componentDidUpdate = prevProps => {
    if (prevProps.params.organizationId !== this.props.params.organizationId) {
      this.fetchOrgBuildings()
    }
  }

  componentCleanup = () => {
    this.props.updateBuildingListStatus('buildings')
  }

  componentWillUnmount() {
    this.componentCleanup()
    window.removeEventListener('beforeunload', this.componentCleanup)
  }

  fetchOrgBuildings = () => {
    this.setState({ loadingOrgBuildings: true })
    this.props
      .getOrganizationBuildings(this.props.params.organizationId)
      .then(() => {
        this.setState({ loadingOrgBuildings: false })
      })
      .catch(() => {
        this.setState({ loadingOrgBuildings: false })
      })
  }

  getUniqueEaBuildings = () => {
    this.props
      .getEaBuildings(
        this.props.params.organizationId,
        this.props.user.firebaseRefs.orgId
      )
      .then(allUsersBuildings => {
        let tempArr = []
        let buildingIds = []

        this.props.building.buildingList.map(existingbuilding => {
          if (
            existingbuilding.firebaseRefs &&
            existingbuilding.firebaseRefs.buildingId
          ) {
            buildingIds.push(existingbuilding.firebaseRefs.buildingId)
          }
        })

        allUsersBuildings.map((eaBuilding, index) => {
          // make sure the bldRef is there AND it is unique
          if (
            eaBuilding.bldRef &&
            buildingIds.indexOf(eaBuilding.bldRef) === -1
          ) {
            buildingIds.push(eaBuilding.bldRef)
            tempArr.push(eaBuilding)
          }
        })
        this.setState({ uniqueEaBuildings: tempArr })
        // if there are unique, new buildings, call the batch endpoint to create new ones
        if (tempArr.length) {
          this.handleCreateEaBuildings(tempArr)
          // otherwise, just remove the loader, and show flash message that EA buildings have already been retrieved
        } else {
          this.props.gotEaBuildings()
          this.setState({ loadingEABuildings: false })
        }
      })
      .catch(err => {})
  }

  handleCreateEaBuildings = buildingsToCreate => {
    let payload = []

    buildingsToCreate.map((uniqueBuilding, index) => {
      let singleBuilding = {}

      function isValidUSCanadaZip(zip) {
        return /(^\d{5}(-\d{4})?$)|(^[ABCEGHJKLMNPRSTVXY]{1}\d{1}[A-Z]{1} *\d{1}[A-Z]{1}\d{1}$)/.test(
          zip
        )
      }
      let zipCode = ''

      if (uniqueBuilding.info && uniqueBuilding.info.zipcode) {
        zipCode = isValidUSCanadaZip(uniqueBuilding.info.zipcode)
          ? uniqueBuilding.info.zipcode
          : ''
      }
      singleBuilding.clientName = uniqueBuilding.clientName || ''
      singleBuilding.siteName = uniqueBuilding.siteName || ''
      singleBuilding.buildingName = uniqueBuilding.name || ''
      singleBuilding.floorCount = uniqueBuilding.levels
        ? Object.keys(uniqueBuilding.levels).length
        : ''
      singleBuilding.squareFeet =
        uniqueBuilding.info && uniqueBuilding.info.squareFeet
          ? uniqueBuilding.info.squareFeet
          : ''
      singleBuilding.buildYear =
        uniqueBuilding.info && uniqueBuilding.info.yearBuilt
          ? uniqueBuilding.info.yearBuilt
          : ''
      singleBuilding.open247 = 'no'
      singleBuilding.buildingUse =
        uniqueBuilding.info &&
        uniqueBuilding.info.type &&
        uniqueBuilding.info.type.value
          ? this.handleMapBuildingUse(uniqueBuilding.info.type.value)
          : ''
      singleBuilding.location = {
        address:
          uniqueBuilding.info && uniqueBuilding.info.street
            ? uniqueBuilding.info.street
            : '',
        city:
          uniqueBuilding.info && uniqueBuilding.info.city
            ? uniqueBuilding.info.city
            : '',
        state:
          uniqueBuilding.info && uniqueBuilding.info.state
            ? uniqueBuilding.info.state
            : '',
        zipCode: zipCode
      }
      singleBuilding.firebaseRefs = {
        orgId: this.props.user.firebaseRefs.orgId,
        userId: uniqueBuilding.userRef,
        buildingId: uniqueBuilding.bldRef,
        auditId: uniqueBuilding.auditRef
      }
      singleBuilding.projectIds = []
      singleBuilding.archived = false
      payload.push(singleBuilding)
    })

    this.props
      .createBuildingFromEA(this.props.params.organizationId, payload)
      .then(() => {
        this.setState({ loadingEABuildings: false })
      })
      .catch(err => {
        this.setState({ loadingEABuildings: false })
      })
  }

  handleMapBuildingUse = buildingUse => {
    switch (buildingUse) {
      case 'quick_service_restaurant':
        return 'fast-food'
      case 'large_hotel':
      case 'small_hotel':
        return 'hotel'
      case 'primary_school':
      case 'secondary_school':
        return 'school'
      case 'high_rise_apartment':
      case 'mid_rise_apartment':
        return 'multifamily-housing'
      case 'warehouse':
        return 'non-refrigerated'
      case 'full_service_restaurant':
        return 'restaurants'
      case 'retail':
        return 'retail-store'
      case 'hospital':
      case 'outpatient':
        return 'urgent-care'
      case 'other':
        return 'other-other'
      case 'strip_mall':
        return 'strip-mall'
      case 'mixeduse':
        return 'mixed-use'
      // return original building use variable since it will be validated
      default:
        return buildingUse
    }
  }

  handleClickImportEA = () => {
    if (
      this.props.user.firebaseRefs &&
      this.props.user.firebaseRefs.userId &&
      this.props.user.firebaseRefs.orgId &&
      this.state.getEaBuildings
    ) {
      this.state.getEaBuildings = false
      this.state.loadingEABuildings = true
      this.getUniqueEaBuildings()
    }
  }

  onTargetsSave = updatedTargets => {
    const { updateOrganization, organization } = this.props
    const payload = {
      ...organization,
      targets: updatedTargets
    }
    updateOrganization(organization._id, payload)
  }

  onToggleTargetModal = () => {
    const { showTargetModal } = this.state
    this.setState({ showTargetModal: !showTargetModal })
  }

  isOrganizationOwner = () => {
    const { user, organization } = this.props
    if (organization && organization.users) {
      const currentUser = organization.users.find(
        data => data.userId === user._id
      )
      if (currentUser) return currentUser.userRole === 'owner'
    }
    return false
  }

  render() {
    const { building, push, user, organization } = this.props
    const { showTargetModal } = this.state

    // If the user is in the forgot password flow then do not render the building list
    if (user.resetPassword) {
      return <span />
    }

    return (
      <div className={styles.building}>
        {showTargetModal && (
          <TargetModal
            targets={organization.targets}
            onSave={this.onTargetsSave}
            onDismiss={this.onToggleTargetModal}
          />
        )}
        <BuildingListHeader
          building={building}
          user={this.props.user}
          push={push}
          handlePopulateBuildingList={this.props.updateBuildingListStatus}
          handleClickImportEA={this.handleClickImportEA}
          buildingListStatus={building.buildingListStatus}
          getEaBuildings={this.state.getEaBuildings}
          loadingEABuildings={this.state.loadingEABuildings}
          toggleTargetModal={this.onToggleTargetModal}
          isOrganizationOwner={this.isOrganizationOwner()}
          createSampleBuilding={this.props.createSampleBuilding}
        />

        <div className={styles.container}>
          {this.state.loadingOrgBuildings && (
            <div className={styles.buildingLoading}>
              <Loader />
            </div>
          )}
          <BuildingList
            buildingList={building.buildingList}
            buildingListStatus={building.buildingListStatus}
            push={push}
            deleteBuilding={this.props.deleteBuilding}
            archiveBuilding={this.props.archiveBuilding}
            updateBuildingTab={this.props.updateBuildingTab}
            updateBuildingViewMode={this.props.updateBuildingViewMode}
            createSampleBuilding={this.props.createSampleBuilding}
          />
        </div>
        {this.state.loadingEABuildings && (
          <div className={styles.buildingLoading}>
            <Loader />
          </div>
        )}
      </div>
    )
  }
}

export default Building
