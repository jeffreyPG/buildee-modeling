import React from 'react'
import PropTypes from 'prop-types'
import styles from './Visualization.scss'

export class BuildingBenchmarkChart extends React.Component {
  static propTypes = {
    projectType: PropTypes.string.isRequired,
    benchmark: PropTypes.object.isRequired
  }

  state = {}

  renderTestBarChart() {
    const score = this.props.benchmark
    let bldgScore = 0

    if (
      score &&
      score[this.props.projectType] &&
      !isNaN(score[this.props.projectType].quantile)
    ) {
      bldgScore = Math.round(score[this.props.projectType].quantile * 100)
    }

    return (
      <g>
        <rect
          className={styles.bar}
          x={`${bldgScore}%`}
          width="100%"
          height="20"
        />
      </g>
    )
  }

  getProjectName = type => {
    let obj = this.projectTypeMap.find(o => o.name === type)
    return obj.newName
  }

  projectTypeMap = [
    { name: 'general', newName: 'General' },
    { name: 'heating', newName: 'Heating' },
    { name: 'cooling', newName: 'Cooling' },
    { name: 'lighting', newName: 'Lighting' },
    { name: 'dhw', newName: 'Water Heating' },
    { name: 'water', newName: 'Water' }
  ]

  calculatePercentage = () => {
    let score = Math.round(
      this.props.benchmark[this.props.projectType].quantile * 100
    )
    let text = ''

    if (50 - score > 0) {
      text = 'worse'
    } else if (50 - score < 0) {
      text = 'better'
    }

    let percentage = Math.abs(50 - score)

    if (percentage === 0) {
      return 'equal'
    } else {
      return `${percentage}% ${text}`
    }
  }

  render() {
    const { benchmark } = this.props

    return (
      <div className={styles.visualization}>
        <div className={styles.visualizationHeading}>
          {benchmark && Object.keys(benchmark).length === 0 && <p>System</p>}
          {benchmark && Object.keys(benchmark).length > 0 && (
            <p>{this.getProjectName(this.props.projectType)}</p>
          )}
        </div>
        <div className={styles.visualizationWrapper}>
          <div className={styles.visualizationSVG}>
            <div className={styles.visualizationBar}>
              {benchmark && Object.keys(benchmark).length > 0 && (
                <svg
                  className={styles.visualizationHeatMap}
                  ref={node => (this.node = node)}
                  height="20"
                >
                  <g>{this.renderTestBarChart()}</g>
                </svg>
              )}
              {benchmark && Object.keys(benchmark).length === 0 && (
                <svg
                  className={styles.visualizationLoading}
                  ref={node => (this.node = node)}
                  height="20"
                />
              )}
            </div>
            <div className={styles.visualizationLabels}>
              <div className={styles.visualizationLabel}>Worst</div>
              <div className={styles.visualizationLabel}>Median</div>
              <div className={styles.visualizationLabel}>Best</div>
            </div>
          </div>
          <div className={styles.visualizationPercentage}>
            {benchmark && Object.keys(benchmark).length === 0 && <p>Loading</p>}
            {benchmark && Object.keys(benchmark).length > 0 && (
              <p>{this.calculatePercentage()}</p>
            )}
          </div>
        </div>
      </div>
    )
  }
}

export default BuildingBenchmarkChart
