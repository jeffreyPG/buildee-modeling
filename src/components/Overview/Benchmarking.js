import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './Benchmarking.scss'
import { OverviewAnnualCost, OverviewSummary, OverviewEndUse } from '.'
import { checkIsResidentalEndUse } from 'utils/Utils'

export class Benchmarking extends React.Component {
  static propTypes = {
    building: PropTypes.object.isRequired,
    buildingUseName: PropTypes.string.isRequired,
    endUse: PropTypes.object.isRequired,
    tempBenchmark: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    loadingUtilities: PropTypes.bool.isRequired,
    handleTabChange: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
    utilities: PropTypes.object.isRequired,
    utilityMetrics: PropTypes.object.isRequired,
    datePicker: PropTypes.object.isRequired,
    activeDates: PropTypes.object.isRequired,
    pmImportUpdate: PropTypes.func.isRequired,
    pmExportUpdate: PropTypes.func.isRequired,
    editBuilding: PropTypes.func.isRequired,
    changeReRunProjects: PropTypes.func.isRequired,
    getOrganizationBuildings: PropTypes.func.isRequired,
    organization: PropTypes.object.isRequired,
    buildingList: PropTypes.array.isRequired,
    getEndUse: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    onBuildingDetailsSubmit: PropTypes.func.isRequired
  }

  componentDidMount = () => {
    this.props.getOrganizationBuildings(this.props.organization._id)
  }

  render() {
    const isResidentalEndUse = checkIsResidentalEndUse(
      this.props.building.buildingUse
    )
    return (
      <div className={styles.benchmarking}>
        <div className={styles.panelHeader}>
          <h3>Benchmarking</h3>
        </div>

        <div className={styles.panelContent}>
          <div className={classNames(styles.panel, styles.annualCost)}>
            <OverviewAnnualCost
              endUse={this.props.endUse}
              squareFootage={this.props.building.squareFeet}
              buildingUse={this.props.buildingUseName}
              hasUtilities={
                this.props.building.utilityIds &&
                this.props.building.utilityIds.length > 0
              }
              handleTabChange={this.props.handleTabChange}
              buildingUseType={this.props.building.buildingUse}
              buildingList={this.props.buildingList}
              getEndUse={this.props.getEndUse}
              user={this.props.user}
              getOrganizationBuildings={this.props.getOrganizationBuildings}
              organization={this.props.organization}
              building={this.props.building}
            />
          </div>
          <div className={classNames(styles.panel, styles.endUse)}>
            <OverviewEndUse
              endUse={this.props.endUse}
              allUtilities={this.props.utilities}
              building={this.props.building}
              loading={this.props.loading}
              handleTabChange={this.props.handleTabChange}
              utilityMetrics={this.props.utilityMetrics}
              buildingList={this.props.buildingList}
              getEndUse={this.props.getEndUse}
              user={this.props.user}
              getOrganizationBuildings={this.props.getOrganizationBuildings}
              organization={this.props.organization}
            />
          </div>
          {!isResidentalEndUse && (
            <div className={classNames(styles.panel, styles.overviewSummary)}>
              <OverviewSummary
                building={this.props.building}
                handleTabChange={this.props.handleTabChange}
                push={this.props.push}
                datePicker={this.props.datePicker}
                pmImportUpdate={this.props.pmImportUpdate}
                pmExportUpdate={this.props.pmExportUpdate}
                onBuildingDetailsSubmit={this.props.onBuildingDetailsSubmit}
              />
            </div>
          )}
        </div>
      </div>
    )
  }
}

export default Benchmarking
