import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './TrendView.scss'
import { TrendVisualization } from './'
import { Loader } from 'utils/Loader'

export class TrendView extends React.Component {
  static propTypes = {
    applyTrendDates: PropTypes.func.isRequired,
    building: PropTypes.object.isRequired,
    trendDates: PropTypes.object.isRequired,
    yearsCovered: PropTypes.array.isRequired,
    getChangePointAnalysis: PropTypes.func.isRequired,
    getOrganizations: PropTypes.func.isRequired,
    getOrganizationBuildings: PropTypes.func.isRequired,
    handleChangeTrendDates: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    organization: PropTypes.object.isRequired,
    rerunTrend: PropTypes.bool.isRequired,
    stopRerunTrend: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    utilities: PropTypes.object.isRequired
  }

  state = {}

  render() {
    const {
      applyTrendDates,
      building,
      trendDates,
      getChangePointAnalysis,
      getOrganizations,
      getOrganizationBuildings,
      handleChangeTrendDates,
      loading,
      organization,
      rerunTrend,
      stopRerunTrend,
      user,
      utilities,
      yearsCovered
    } = this.props
    const startDate = trendDates.startDate
    const endDate = trendDates.endDate
    const years = yearsCovered

    // If the user does not have the trends project paid for
    if (user.products.trend !== 'show') {
      return <span />
    }

    return (
      <div className={styles.trend}>
        <div className={styles.trendHeading}>
          <h2>Trend</h2>
          <div className={styles.dates}>
            <select
              className={styles.trendDatePicker}
              value={startDate}
              onChange={e => handleChangeTrendDates(e, 'startDate')}
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <span>to</span>
            <select
              className={styles.trendDatePicker}
              value={endDate}
              onChange={e => handleChangeTrendDates(e, 'endDate')}
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            {trendDates.startDate &&
              trendDates.endDate &&
              !trendDates.dateRangeError && (
                <div className={styles.datesButtons}>
                  {!loading && (
                    <button
                      className={classNames(
                        styles.button,
                        styles.buttonPrimary
                      )}
                      onClick={applyTrendDates}
                    >
                      <i className="material-icons">check</i>
                    </button>
                  )}
                  {loading && (
                    <button
                      className={classNames(
                        styles.button,
                        styles.buttonPrimary
                      )}
                      disabled
                    >
                      <Loader size="button" color="white" />
                    </button>
                  )}
                </div>
              )}
          </div>
        </div>

        {trendDates.dateRangeError !== '' && (
          <p className={styles.trendDateRangeError}>
            {trendDates.dateRangeError}
          </p>
        )}

        {utilities && building._id && (
          <TrendVisualization
            building={building}
            getChangePointAnalysis={getChangePointAnalysis}
            getOrganizations={getOrganizations}
            getOrganizationBuildings={getOrganizationBuildings}
            organization={organization}
            rerunTrend={rerunTrend}
            stopRerunTrend={stopRerunTrend}
            utilities={utilities}
            utilsForAnalysis={this.state.utilsForAnalysis}
          />
        )}
      </div>
    )
  }
}

export default TrendView
