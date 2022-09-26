import React from 'react'
import PropTypes from 'prop-types'
import styles from './UtilityCards.scss'
import { UtilityRates, UtilitySummary } from './'
import { OverviewGHG } from '../Overview'

export class UtilityCards extends React.Component {
  static propTypes = {
    building: PropTypes.object.isRequired,
    editBuilding: PropTypes.func.isRequired,
    endUse: PropTypes.object.isRequired,
    allUtilities: PropTypes.object.isRequired,
    utilityMetrics: PropTypes.object.isRequired,
    changeReRunProjects: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    datePicker: PropTypes.object.isRequired,
    activeDates: PropTypes.object.isRequired
  }

  render() {
    return (
      <div className={styles.utilityCards}>
        <div className={styles.panel}>
          <UtilitySummary
            building={this.props.building}
            allUtilities={this.props.allUtilities}
            utilityMetrics={this.props.utilityMetrics}
            datePicker={this.props.datePicker}
            activeDates={this.props.activeDates}
            commoditySettings={this.props.commoditySettings}
          />
        </div>
        <div className={styles.panel}>
          <OverviewGHG
            building={this.props.building}
            allUtilities={this.props.allUtilities}
            editBuilding={this.props.editBuilding}
            changeReRunProjects={this.props.changeReRunProjects}
            handleTabChange={this.props.handleTabChange}
            modeFrom='utility'
            monthlyUtilities={this.props.monthlyUtilities}
          />
        </div>
      </div>
    )
  }
}

export default UtilityCards
