import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { TrendChangePoint, TrendLEANAnalysis } from './'
import { formatHyphenNotationLabel } from 'utils/Utils'
import { yearDifference } from '../Utility/UtilityHelpers'
import styles from './TrendVisualization.scss'
import { Loader } from 'utils/Loader'

export class TrendVisualization extends React.Component {
  static propTypes = {
    building: PropTypes.object.isRequired,
    getChangePointAnalysis: PropTypes.func.isRequired,
    getOrganizations: PropTypes.func.isRequired,
    getOrganizationBuildings: PropTypes.func.isRequired,
    organization: PropTypes.object.isRequired,
    rerunTrend: PropTypes.bool.isRequired,
    stopRerunTrend: PropTypes.func.isRequired,
    utilities: PropTypes.object.isRequired
  }

  state = {
    dateRanges: {},
    buildingModeling: {},
    buildingConsumption: {},
    heatMapData: {},
    changePointError: false,
    heatMapError: false,
    organizationSelections: [],
    loadingNewOrgSelection: false,
    checkedOrganizations: [],
    utilsForAnalysis: ['electric', 'natural-gas', 'steam', 'other']
  }

  componentDidMount = () => {
    const { building, utilities, rerunTrend } = this.props
    this.populateDefaultCheckedOrgs()
    this.populateOrgSelections()

    // if you have utilities that are in utilsForAnalysis but don't have change point data on the building
    let someMissingData = Object.keys(utilities).some(utility => {
      if (this.state.utilsForAnalysis.includes(utility)) {
        return !(utility in building.changePointModels)
      }
    })

    // if we're missing data or if the rerunTrend flag is set to true, get all utilities and rerun change point model
    if (someMissingData || rerunTrend) {
      this.getUtilitiesDateRange(true)
      // if we already have all the data, grab it from the building model and store in state
    } else {
      this.setState({
        buildingModeling: building.changePointModels,
        buildingConsumption: building.changePointModels
      })
      // still run date ranges and consumption points to get heat map data from other orgs
      this.getUtilitiesDateRange()
      this.populateDefaultCheckedOrgs().then(() => {
        this.getNewConsumptionPoints()
      })
    }
  }

  componentDidUpdate = prevProps => {
    if (prevProps.utilities !== this.props.utilities) {
      // reset all data
      this.setState({
        changePointError: '',
        heatMapError: '',
        dateRanges: {},
        buildingModeling: {},
        buildingConsumption: {},
        heatMapData: {}
      })
      this.getUtilitiesDateRange(true)
    }
    if (
      prevProps.user !== this.props.user ||
      prevProps.organization !== this.props.organization
    ) {
      this.populateDefaultCheckedOrgs()
    }
  }

  populateOrgSelections = () => {
    return new Promise((resolve, reject) => {
      let tempOrgSelection = [...this.state.organizationSelections]
      this.props.getOrganizations().then(orgs => {
        orgs.forEach(org => {
          tempOrgSelection.push({
            _id: org._id,
            name: org.name
          })
        })
        this.setState({ organizationSelections: tempOrgSelection }, () =>
          resolve()
        )
      })
    })
  }

  populateDefaultCheckedOrgs = () => {
    return new Promise((resolve, reject) => {
      const { user, organization } = this.props
      let tempCheckedOrgs = [...this.state.checkedOrganizations]
      // add organzition ids from global user settings
      if (user && user.settings && user.settings.leanOrganizations) {
        user.settings.leanOrganizations.forEach(orgId => {
          tempCheckedOrgs.push(orgId)
        })
      }
      // if it's not already in there, add current org id in array
      if (!tempCheckedOrgs.includes(organization._id)) {
        tempCheckedOrgs.push(organization._id)
      }
      this.setState({ checkedOrganizations: tempCheckedOrgs }, () => resolve())
    })
  }

  handleOrganizationIdCheck = e => {
    let tempCheckedOrgs = [...this.state.checkedOrganizations]
    if (e.target.checked) {
      // add to array
      // if it's not already in the array
      if (!tempCheckedOrgs.includes(e.target.value)) {
        tempCheckedOrgs.push(e.target.value)
      }
    } else {
      // filter from array
      tempCheckedOrgs = tempCheckedOrgs.filter(a => a !== e.target.value)
    }
    this.setState({ checkedOrganizations: tempCheckedOrgs })
  }

  getUtilitiesDateRange = runAnalysis => {
    const { utilities } = this.props
    let allMeterData = {}
    let tempUtilDateRanges = { ...this.state.dateRanges }
    let latestEndDate = {}

    Object.keys(utilities).forEach((utility, index) => {
      if (this.state.utilsForAnalysis.includes(utility)) {
        let singleUtilMeterData = []
        let utilDateRange

        // get all meter data for this utility
        if (utilities[utility].length > 0) {
          utilities[utility].forEach(util => {
            if (util.meterData && util.meterData.length > 0) {
              util.meterData.forEach(meter => {
                singleUtilMeterData.push(meter)
              })
            }
          })
        }
        // sort by start date and end date
        let orderedByStartDate = singleUtilMeterData.sort((a, b) => {
          return new Date(b.startDate) - new Date(a.startDate)
        })
        let orderedByEndDate = singleUtilMeterData.sort((a, b) => {
          return new Date(b.endDate) - new Date(a.endDate)
        })

        // if there isn't data (no start date), just set the date range to 0
        if (!orderedByStartDate || orderedByStartDate.length <= 0) {
          utilDateRange = 0
        } else {
          // find date range, by year, between the earliest start date
          // and the latest end date for all meters
          utilDateRange = yearDifference(
            new Date(orderedByStartDate.slice(-1)[0].startDate),
            new Date(orderedByEndDate[0].endDate)
          )
        }

        // set date range to 0 if it's not a number
        if (isNaN(utilDateRange)) {
          utilDateRange = 0
        }
        // set error if date range is less than a year
        if (utilDateRange < 0.95) {
          this.setState({
            changePointError:
              'Please add at least a full year of data for the change point analysis.',
            heatMapError:
              'Please add at least a full year of data for the LEAN analysis.'
          })
        }

        // only set this util type in all meter data if there is data and if the date range is a full year
        if (
          singleUtilMeterData &&
          singleUtilMeterData.length > 0 &&
          utilDateRange >= 0.95
        ) {
          allMeterData[utility] = singleUtilMeterData
          latestEndDate[utility] =
            orderedByEndDate && orderedByEndDate[0]
              ? orderedByEndDate[0].endDate
              : 0
        }
        // still set date range for this utility
        tempUtilDateRanges[utility] = utilDateRange
      }
    })

    this.setState({ dateRanges: tempUtilDateRanges })
    // run the change point if the meter data is full
    let meterDataKeys = Object.keys(allMeterData)
    if (meterDataKeys.length && meterDataKeys.length > 0 && runAnalysis) {
      this.handleChangePointAnalysisCall(
        allMeterData,
        tempUtilDateRanges,
        latestEndDate
      )
    }

    // set an error if the there are utilities that aren't included in the meterDataKeys
    Object.keys(utilities).forEach((utility, index) => {
      if (this.state.utilsForAnalysis.includes(utility)) {
        if (!meterDataKeys.includes(utility)) {
          this.setState({
            changePointError:
              'Please add at least a full year of data for the change point analysis.',
            heatMapError:
              'Please add at least a full year of data for the LEAN analysis.'
          })
        }
      }
    })
  }

  handleChangePointAnalysisCall = (meterData, dateRanges, latestEndDate) => {
    let sendMeterData = {}

    Object.keys(meterData).forEach((utility, index) => {
      if (this.state.utilsForAnalysis.includes(utility)) {
        // if meter data is more than two years, only grab 2 recent years
        if (dateRanges[utility] > 2) {
          let tempMeterData = [...meterData[utility]]
          let shortenedMeterData = []
          let start = new Date(
            new Date(latestEndDate[utility]).setFullYear(
              new Date(latestEndDate[utility]).getFullYear() - 2
            )
          )
          let end = new Date(latestEndDate[utility])

          tempMeterData.forEach(meter => {
            let meterStartDate = new Date(meter.startDate)
            let meterEndDate = new Date(meter.endDate)
            let median = new Date(
              (meterStartDate.getTime() + meterEndDate.getTime()) / 2
            )
            // if median of meter data is between start and end dates, push to array
            if (median > start && median < end) {
              shortenedMeterData.push(meter)
            }
          })
          sendMeterData[utility] = shortenedMeterData
          // if meter data does not need to be altered
        } else {
          sendMeterData[utility] = meterData[utility]
        }
      }
    })

    // send meter data to analysis API
    this.props
      .getChangePointAnalysis(sendMeterData, this.props.building._id)
      .then(results => {
        this.setState({
          buildingModeling: results.modelingData,
          buildingConsumption: results.buildingConsumptionData
        })
        // get new consumption data after the change point has been run for the current building
        this.getNewConsumptionPoints()
        // set rerun trend state boolean in parent to false
        this.props.stopRerunTrend()
      })
      .catch(err => {
        this.setState({
          changePointError: err || true,
          heatMapError: err || true,
          loadingNewOrgSelection: false,
          loadingAll: false
        })
      })
  }

  reRunLeanScores = orgToggleClosed => {
    if (orgToggleClosed) {
      this.getNewConsumptionPoints()
    }
  }

  getNewConsumptionPoints = () => {
    const { buildingConsumption, checkedOrganizations } = this.state
    let allBuildings = []
    let promises = []
    let self = this

    var buildingsArray = () => {
      return new Promise((resolve, reject) => {
        if (checkedOrganizations && checkedOrganizations.length > 0) {
          var orgIdsMap = checkedOrganizations.map(orgId => {
            var getOrg = new Promise((resolve, reject) => {
              self.props
                .getOrganizationBuildings(orgId, true)
                .then(array => {
                  array.forEach(building => {
                    allBuildings.push(building)
                  })
                  resolve()
                })
                .catch(err => {
                  reject(err)
                })
            })
            promises.push(getOrg)
          })

          Promise.all(orgIdsMap).then(() => {
            return Promise.all(promises)
              .then(() => {
                resolve(allBuildings)
              })
              .catch(err => {
                reject(err)
              })
          })
        } else {
          reject()
        }
      })
    }

    if (buildingConsumption) {
      this.setState({ loadingNewOrgSelection: true })
      buildingsArray()
        .then(allBuildingsArray => {
          if (allBuildingsArray && allBuildingsArray.length > 0) {
            this.getBuildingsConsumption(
              allBuildingsArray,
              this.props.building,
              buildingConsumption
            )
              .then(consumptionObject => {
                // set consumption array from all other buildings
                // and current building's new consumption from analysis API call
                this.setState({
                  heatMapData: consumptionObject,
                  loadingNewOrgSelection: false
                })
              })
              .catch(() => {
                this.setState({ loadingNewOrgSelection: false })
              })
          } else {
            this.setState({
              heatMapError: 'No buildings available to pull data from.',
              loadingNewOrgSelection: false
            })
          }
        })
        .catch(() => {
          this.setState({
            heatMapError: 'No buildings available to pull data from.',
            loadingNewOrgSelection: false
          })
        })
    }
  }

  getBuildingsConsumption = (
    buildingList,
    currentBuilding,
    buildingConsumption
  ) => {
    let consumptionObject = {}

    return new Promise(function(resolve, reject) {
      if (buildingList && buildingList.length > 0) {
        var buildingListMap = buildingList.map(building => {
          // and is of the same type as the current building
          // and if it's unarchived
          if (
            building.info.buildingUse === currentBuilding.buildingUse &&
            !building.archived &&
            building.changePointModels
          ) {
            // for each utility in the consumption object
            Object.keys(buildingConsumption).forEach(utility => {
              // create the object if it doesn't exist
              if (!consumptionObject[utility]) {
                consumptionObject[utility] = {}
              }

              if (building.changePointModels[utility]) {
                // check if the building has each of the items in the consumption object
                Object.keys(buildingConsumption[utility]).forEach(key => {
                  // if the values on the building aren't null
                  if (building.changePointModels[utility][key]) {
                    // create the array if it doesn't exist and add to it
                    if (!consumptionObject[utility][key]) {
                      consumptionObject[utility][key] = []
                      consumptionObject[utility][key].push(
                        building.changePointModels[utility][key]
                      )
                    } else {
                      consumptionObject[utility][key].push(
                        building.changePointModels[utility][key]
                      )
                    }
                  }
                })
              }
            })
          }
        })
        Promise.all(buildingListMap)
          .then(() => {
            resolve(consumptionObject)
          })
          .catch(() => {
            reject()
          })
      } else {
        reject()
      }
    })
  }

  renderLoadingCard = (utility, title) => {
    // determine the error
    let error = ''
    if (title === 'Change Point' && this.state.changePointError) {
      error = this.state.changePointError
    }
    if (title === 'LEAN' && this.state.heatMapError) {
      error = this.state.heatMapError
    }

    return (
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h3>
            {formatHyphenNotationLabel(utility)} - {title}
          </h3>
        </div>
        <div className={styles.panelContent}>
          {error && !this.state.loadingNewOrgSelection && <p>{error}</p>}
          {(!error || this.state.loadingNewOrgSelection) && <Loader />}
        </div>
      </div>
    )
  }

  render() {
    const {
      dateRanges,
      buildingModeling,
      buildingConsumption,
      heatMapData,
      utilsForAnalysis,
      loadingNewOrgSelection
    } = this.state

    return (
      <div className={styles.trendVisualization}>
        {this.props.utilities &&
          // give a set order to displaying the trend charts
          utilsForAnalysis.map((utility, index) => {
            // if it exists in the utilities props
            if (this.props.utilities.hasOwnProperty(utility)) {
              return (
                <div key={index} className={styles.trendVisualizationWrap}>
                  {buildingModeling[utility] && dateRanges[utility] >= 0.95 && (
                    <TrendChangePoint
                      changePointData={buildingModeling[utility].results}
                      fitData={buildingModeling[utility].fit}
                      scatterPlotData={buildingModeling[utility].data}
                      utilityName={utility}
                    />
                  )}
                  {(!buildingModeling[utility] || dateRanges[utility] < 0.95) &&
                    this.renderLoadingCard(utility, 'Change Point')}

                  {buildingConsumption[utility] &&
                    heatMapData[utility] &&
                    dateRanges[utility] >= 0.95 &&
                    !loadingNewOrgSelection && (
                      <TrendLEANAnalysis
                        buildingConsumption={buildingConsumption[utility]}
                        checkedOrganizations={this.state.checkedOrganizations}
                        handleOrganizationIdCheck={
                          this.handleOrganizationIdCheck
                        }
                        heatMapData={heatMapData[utility]}
                        organization={this.props.organization}
                        organizationSelections={
                          this.state.organizationSelections
                        }
                        reRunLeanScores={this.reRunLeanScores}
                        utilityName={utility}
                      />
                    )}
                  {((!buildingConsumption[utility] && !heatMapData[utility]) ||
                    dateRanges[utility] < 0.95 ||
                    loadingNewOrgSelection) &&
                    this.renderLoadingCard(utility, 'LEAN')}

                  {this.state.dateRanges[utility] > 2 &&
                    buildingModeling[utility] &&
                    buildingConsumption[utility] &&
                    heatMapData[utility] && (
                      <p>
                        Date range is greater than 2 years. For better results,
                        the visualizations above have been reduced to the most
                        recent 2 years of data selected.
                      </p>
                    )}
                </div>
              )
            }
          })}
        {Object.keys(this.props.utilities).length === 0 &&
          this.props.utilities.constructor === Object && (
            <div className={classNames(styles.panel, styles.panelContent)}>
              <p>Please add Utilities to run the Trend analysis.</p>
            </div>
          )}
      </div>
    )
  }
}

export default TrendVisualization
