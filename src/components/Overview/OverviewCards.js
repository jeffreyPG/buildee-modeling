import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './OverviewCards.scss'
import {
  Benchmarking,
  OverviewAnnualCost,
  OverviewAnnualUsage,
  OverviewSummary,
  OverviewSystemsUsage,
  OverviewUtilitySummary,
  OverviewEndUse,
  OverviewGHG,
  OverviewMesuresProject
} from '.'
import { checkIsResidentalEndUse } from 'utils/Utils'

export class OverviewCards extends React.Component {
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
    lastTwelveUtilityMetrics: PropTypes.object.isRequired,
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
    monthlyUtilities: PropTypes.array.isRequired,
    originMonthlyUtilities: PropTypes.array.isRequired,
    yearsCovered: PropTypes.array.isRequired,
    routeParams: PropTypes.object.isRequired,
    onBuildingDetailsSubmit: PropTypes.func.isRequired,
    originMonthlyUtilities: PropTypes.array.isRequired
  }

  render() {
    const isResidentalEndUse = checkIsResidentalEndUse(
      this.props.building.buildingUse
    )

    return (
      <div className={styles.benchmarkCards}>
        <div className={classNames(styles.panel, styles.twoThirdBlock)}>
          <OverviewUtilitySummary
            building={this.props.building}
            allUtilities={this.props.utilities}
            monthlyUtilities={this.props.monthlyUtilities}
            originMonthlyUtilities={this.props.originMonthlyUtilities}
            utilityMetrics={this.props.utilityMetrics}
            lastTwelveUtilityMetrics={this.props.lastTwelveUtilityMetrics}
            endUse={this.props.endUse}
            loading={this.props.loadingUtilities}
            activeDates={this.props.activeDates}
            handleTabChange={this.props.handleTabChange}
            editBuilding={this.props.editBuilding}
            changeReRunProjects={this.props.changeReRunProjects}
            yearsCovered={this.props.yearsCovered}
          />
        </div>
        <div className={classNames(styles.panel, styles.oneThirdBlock)}>
          <OverviewMesuresProject
            building={this.props.building}
            allUtilities={this.props.utilities}
            utilityMetrics={this.props.utilityMetrics}
            endUse={this.props.endUse}
            loading={this.props.loadingUtilities}
            activeDates={this.props.activeDates}
            handleTabChange={this.props.handleTabChange}
            routeParams={this.props.routeParams}
          />
        </div>
        <div className={classNames(styles.panel, styles.benchmarkCard)}>
          <Benchmarking
            building={this.props.building}
            buildingUseName={this.props.buildingUseName}
            tempBenchmark={this.props.tempBenchmark}
            endUse={this.props.endUse}
            loading={this.props.loading}
            loadingUtilities={this.props.loadingUtilities}
            handleTabChange={this.props.handleTabChange}
            push={this.props.push}
            utilities={this.props.utilities}
            utilityMetrics={this.props.utilityMetrics}
            datePicker={this.props.datePicker}
            activeDates={this.props.activeDates}
            pmImportUpdate={this.props.pmImportUpdate}
            pmExportUpdate={this.props.pmExportUpdate}
            editBuilding={this.props.editBuilding}
            changeReRunProjects={this.props.changeReRunProjects}
            monthlyUtilities={this.props.monthlyUtilities}
            getOrganizationBuildings={this.props.getOrganizationBuildings}
            organization={this.props.organization}
            buildingList={this.props.buildingList}
            getEndUse={this.props.getEndUse}
            user={this.props.user}
            onBuildingDetailsSubmit={this.props.onBuildingDetailsSubmit}
          />
        </div>
        {/* <div className={styles.panel}>
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
          />
        </div>
        <div className={styles.panel}>
          <OverviewAnnualUsage
            endUse={this.props.endUse}
            squareFootage={this.props.building.squareFeet}
            buildingUse={this.props.buildingUseName}
            buildingUseType={this.props.building.buildingUse}
            hasUtilities={
              this.props.building.utilityIds &&
              this.props.building.utilityIds.length > 0
            }
            handleTabChange={this.props.handleTabChange}
          />
        </div>
        <div className={styles.panel}>
          <OverviewEndUse
            endUse={this.props.endUse}
            allUtilities={this.props.utilities}
            building={this.props.building}
            loading={this.props.loading}
            handleTabChange={this.props.handleTabChange}
            utilityMetrics={this.props.utilityMetrics}
          />
        </div>
        {!isResidentalEndUse && (
          <div className={styles.panel}>
            <OverviewSummary
              building={this.props.building}
              handleTabChange={this.props.handleTabChange}
              push={this.props.push}
              datePicker={this.props.datePicker}
              pmImportUpdate={this.props.pmImportUpdate}
              pmExportUpdate={this.props.pmExportUpdate}
            />
          </div>
        )} */}
        {/* <div className={styles.panel}>
          <OverviewSystemsUsage
            tempBenchmark={this.props.tempBenchmark}
            buildingUse={this.props.buildingUseName}
            handleTabChange={this.props.handleTabChange}
          />
        </div> */}
      </div>
    )
  }
}

export default OverviewCards
