import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './BenchmarkSystemsUsage.scss'
import { BuildingBenchmarkChart } from 'components/Visualization'

export class BenchmarkSystemsUsage extends React.Component {
  static propTypes = {
    tempBenchmark: PropTypes.object.isRequired,
    buildingUse: PropTypes.string.isRequired,
    handleTabChange: PropTypes.func.isRequired
  }

  state = {
    iterationCount: 5,
    benchmarkReorder: {}
  }

  UNSAFE_componentWillMount = () => {
    if (Object.keys(this.props.tempBenchmark).length > 0) {
      this.updateIteration(this.props.tempBenchmark)
      this.updateOrder(this.props.tempBenchmark)
    }
  }

  componentDidUpdate = prevProps => {
    if (
      this.props !== prevProps &&
      Object.keys(this.props.tempBenchmark).length > 0
    ) {
      this.updateIteration(this.props.tempBenchmark)
      this.updateOrder(this.props.tempBenchmark)
    }
  }

  updateIteration = benchmark => {
    if (
      benchmark.water &&
      benchmark.water !== 0 &&
      Object.keys(benchmark.water).length > 0
    ) {
      this.setState({ iterationCount: 6 })
    }
  }

  updateOrder = benchmark => {
    this.setState({
      benchmarkReorder: {
        general: benchmark.general,
        lighting: benchmark.lighting,
        heating: benchmark.heating,
        cooling: benchmark.cooling,
        dhw: benchmark.dhw,
        water: benchmark.water
      }
    })
  }

  render() {
    return (
      <div className={styles.benchmarkSystemsUsage}>
        <div className={styles.panelHeader}>
          <h3>
            Typical Systems Usage for <span>{this.props.buildingUse}</span>{' '}
            Buildings
          </h3>
        </div>

        <div className={styles.panelContent}>
          {[...Array(this.state.iterationCount)].map((x, i) => (
            <div key={i}>
              <BuildingBenchmarkChart
                projectType={
                  Object.keys(this.state.benchmarkReorder)[i] || 'general'
                }
                benchmark={this.state.benchmarkReorder}
              />
            </div>
          ))}
        </div>

        <div className={styles.panelFooter}>
          <div
            className={styles.link}
            onClick={() => {
              this.props.handleTabChange(2, 'Utilities', true)
            }}
          >
            Add meters to benchmark your building{' '}
            <i className="material-icons">keyboard_arrow_right</i>
          </div>
        </div>
      </div>
    )
  }
}

export default BenchmarkSystemsUsage
