import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Loader } from '../../utils/Loader'
import buildingTypes from 'static/building-types'
import styles from './OverviewView.scss'

import { OverviewCards } from './'

export class OverviewView extends React.Component {
  static propTypes = {
    building: PropTypes.object.isRequired,
    tempBenchmark: PropTypes.object.isRequired,
    getBuildingData: PropTypes.func.isRequired,
    endUse: PropTypes.object.isRequired,
    datePicker: PropTypes.object.isRequired,
    activeDates: PropTypes.object.isRequired,
    yearsCovered: PropTypes.array.isRequired,
    handleChangeDates: PropTypes.func.isRequired,
    applyDates: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    loadingUtilities: PropTypes.bool.isRequired,
    handleTabChange: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
    checkBenchmark: PropTypes.func.isRequired,
    utilities: PropTypes.object.isRequired,
    utilityMetrics: PropTypes.object.isRequired,
    lastTwelveUtilityMetrics: PropTypes.object.isRequired,
    pmImportUpdate: PropTypes.func.isRequired,
    pmExportUpdate: PropTypes.func.isRequired,
    editBuilding: PropTypes.func.isRequired,
    changeReRunProjects: PropTypes.func.isRequired,
    routeParams: PropTypes.object.isRequired,
    getOrganizationBuildings: PropTypes.func.isRequired,
    organization: PropTypes.object.isRequired,
    buildingList: PropTypes.array.isRequired,
    getEndUse: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    onBuildingDetailsSubmit: PropTypes.func.isRequired
  }

  state = {
    buildingUseName: 'Office'
    // building: this.props.building
  }

  componentDidMount = () => {
    this.props.getBuildingData()
    this.setState({
      buildingUseName: this.findBuildingUseName(this.props.building.buildingUse)
    })
  }

  findBuildingUseName = buildingUse => {
    if (buildingUse) {
      let typeObject = buildingTypes.find(type => type.value === buildingUse)
      return typeObject ? typeObject.name : 'Office'
    } else {
      return 'Office'
    }
  }

  renderEmptyState = () => {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyBody}>
          <div className={styles.emptyBodyTitle}>Add Meter Data</div>
          <div className={styles.emptyBodyDescription}>
            Add data in Utilities or import from ENERGY STAR Portfolio Manager.
          </div>
          <div className={styles.emptyButtons}>
            <button
              className={classNames(styles.button, styles.buttonPrimary)}
              onClick={() => {
                this.props.handleTabChange(3, 'Utilities', true)
              }}
            >
              Go to utilities
            </button>
          </div>
        </div>
      </div>
    )
  }

  render() {
    const {
      datePicker,
      loading,
      loadingUtilities,
      handleChangeDates,
      applyDates,
      yearsCovered,
      loadingRate,
      utilities
    } = this.props
    const startDate = datePicker.startDate
    const monthlyUtilities =
      this.props.monthlyUtilities?.filter(item => {
        if (!this.props.applyDates?.startDate) return true
        return item.year == this.props.activeDates.startDate
      }) || []
    if (Object.keys(monthlyUtilities).length === 0)
      return this.renderEmptyState()

    return (
      <div className={styles.benchmark}>
        <div className={styles.benchmarkHeading}>
          <h2>Overview</h2>
          {/* <div className={styles.dates}>
            {yearsCovered.length > 0 && (
              <select
                className={styles.benchmarkDatePicker}
                value={startDate}
                onChange={e => handleChangeDates(e)}
              >
                {yearsCovered.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            )}
            {datePicker.startDate &&
              datePicker.endDate &&
              !datePicker.dateRangeError &&
              yearsCovered.length > 0 && (
                <div className={styles.datesButtons}>
                  {!(loadingUtilities || loadingRate) && (
                    <button
                      className={classNames(
                        styles.button,
                        styles.buttonPrimary
                      )}
                      onClick={applyDates}
                    >
                      <i className='material-icons'>check</i>
                    </button>
                  )}
                  {(loadingUtilities || loadingRate) && (
                    <button
                      className={classNames(
                        styles.button,
                        styles.buttonPrimary
                      )}
                      disabled
                    >
                      <Loader size='button' color='white' />
                    </button>
                  )}
                </div>
              )}
          </div> */}
        </div>

        {this.props.datePicker.dateRangeError !== '' && (
          <p className={styles.benchmarkDateRangeError}>
            {this.props.datePicker.dateRangeError}
          </p>
        )}

        <OverviewCards
          building={this.props.building}
          buildingUseName={this.state.buildingUseName}
          tempBenchmark={this.props.tempBenchmark}
          endUse={this.props.endUse}
          loading={loading}
          loadingUtilities={loadingUtilities}
          handleTabChange={this.props.handleTabChange}
          push={this.props.push}
          utilities={this.props.utilities}
          utilityMetrics={this.props.utilityMetrics}
          lastTwelveUtilityMetrics={this.props.lastTwelveUtilityMetrics}
          datePicker={this.props.datePicker}
          activeDates={this.props.activeDates}
          pmImportUpdate={this.props.pmImportUpdate}
          pmExportUpdate={this.props.pmExportUpdate}
          editBuilding={this.props.editBuilding}
          changeReRunProjects={this.props.changeReRunProjects}
          yearsCovered={this.props.yearsCovered}
          monthlyUtilities={monthlyUtilities}
          getOrganizationBuildings={this.props.getOrganizationBuildings}
          organization={this.props.organization}
          buildingList={this.props.buildingList}
          getEndUse={this.props.getEndUse}
          user={this.props.user}
          originMonthlyUtilities={this.props.monthlyUtilities}
          yearsCovered={yearsCovered}
          routeParams={this.props.routeParams}
          onBuildingDetailsSubmit={this.props.onBuildingDetailsSubmit}
        />
      </div>
    )
  }
}

export default OverviewView
