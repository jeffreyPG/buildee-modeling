import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './OverviewSummary.scss'
import PMlogo from '../../images/PM_logo.png'
import { BenchmarkingSettingModal } from '../../containers/Modal'
export class OverviewSummary extends React.Component {
  static propTypes = {
    building: PropTypes.object.isRequired,
    handleTabChange: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
    datePicker: PropTypes.object.isRequired,
    pmImportUpdate: PropTypes.func.isRequired,
    pmExportUpdate: PropTypes.func.isRequired,
    onBuildingDetailsSubmit: PropTypes.func.isRequired
  }

  state = {
    openBenchmarkingSettingModal: false
  }

  openBenchmarkingSettingModal = action => {
    this.setState({ openBenchmarkingSettingModal: action })
  }

  handleOpenPortfolio = () => this.props.push('/portfolio')

  getPmScore() {
    let pmScore
    if (
      this.props.building.benchmark.pmScores &&
      this.props.building.benchmark.pmScores.length
    ) {
      pmScore = this.props.building.benchmark.pmScores.find(
        score => score.year === Number(this.props.datePicker.startDate)
      )
    }
    return pmScore
  }

  pmImportUpdate() {
    const energyStarId = this.props.building.energystarIds[0]
    console.log(this.props.building)
    console.log(this.props.building)
    const payload = {
      buildingId: this.props.building._id,
      id: energyStarId.buildingId,
      accountId: energyStarId.accountId
    }
    this.props.pmImportUpdate([payload])
  }

  pmExportUpdate() {
    const energyStarId = this.props.building.energystarIds[0]
    this.props.pmExportUpdate(energyStarId.accountId, [this.props.building])
  }

  render() {
    const pmScore = this.getPmScore()
    return (
      <div className={styles.benchmarkSummary}>
        {/* <div className={styles.panelHeader}>
          <h3>Benchmarking</h3>
        </div> */}
        <h3 className={styles.settingIcon}>
          <i
            className='material-icons'
            onClick={() => {
              this.openBenchmarkingSettingModal(true)
            }}
          >
            settings
          </i>
        </h3>

        <div className={styles.panelContent}>
          {/* <div className={styles.benchmarkSummarySingle}>
            <p>Buildings like yours in this area</p>
            {this.props.tempBenchmark.general &&
              this.props.tempBenchmark.general.quantile && (
                <div className={styles.benchmarkSummaryScore}>
                  <h2>
                    {this.props.tempBenchmark.general['regional-quantile']
                      ? Math.round(
                          this.props.tempBenchmark.general[
                            'regional-quantile'
                          ] * 100
                        )
                      : Math.round(
                          this.props.tempBenchmark.general.quantile * 100
                        )}
                  </h2>
                  <span>/100</span>
                </div>
              )}
            {!this.props.tempBenchmark.general && <Loader />}
          </div> */}

          {/* <div className={styles.benchmarkSummarySingle}>
            <p>Buildings like yours nationwide</p>
            {this.props.tempBenchmark.general &&
              this.props.tempBenchmark.general.quantile && (
                <div className={styles.benchmarkSummaryScore}>
                  <h2>
                    {this.props.tempBenchmark.general['national-quantile']
                      ? Math.round(
                          this.props.tempBenchmark.general[
                            'national-quantile'
                          ] * 100
                        )
                      : Math.round(
                          this.props.tempBenchmark.general.quantile * 100
                        )}
                  </h2>
                  <span>/100</span>
                </div>
              )}
            {!this.props.tempBenchmark.general && <Loader />}
          </div> */}

          {pmScore && pmScore.score > 0 && (
            <div
              className={classNames(
                styles.benchmarkSummarySingle,
                styles.benchmarkSummaryPM
              )}
            >
              <img src={PMlogo} />
              <div className={styles.benchmarkSummaryScore}>
                <h2>{pmScore && pmScore.score}</h2>
                <span>/100</span>
              </div>
              <p>
                Your Energy Star Portfolio Manager benchmarking score is based
                on a 1-100 scale that compares your property to similar
                properties nationwide. A score of 50 represents median energy
                performance, while a score of 75 means your building is a top
                energy performer — and may be eligible for ENERGY STAR
                certification.
              </p>
              <div className={styles.link} onClick={this.handleOpenPortfolio}>
                Sync With Portfolio Manager{' '}
                <i className='material-icons'>keyboard_arrow_right</i>
              </div>
            </div>
          )}

          {(!this.props.building.energystarIds ||
            this.props.building.energystarIds.length === 0 ||
            !pmScore) && (
            <div
              className={classNames(
                styles.benchmarkSummarySingle,
                styles.benchmarkSummaryPM
              )}
            >
              <img src={PMlogo} />
              <div className={styles.empty}>
                <div className={styles.emptyBody}>
                  <div className={styles.emptyBodyTitle}>
                    Get a Portfolio Manager Benchmark Score
                  </div>
                  <div className={styles.emptyBodyDescription}>
                    Connect your ENERGY STAR Portfolio Manager to import.
                  </div>
                  <div className={styles.emptyButtons}>
                    <button
                      className={classNames(
                        styles.button,
                        styles.buttonPrimary
                      )}
                      onClick={this.handleOpenPortfolio}
                    >
                      Connect Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {this.props.building.energystarIds &&
            this.props.building.energystarIds.length > 0 &&
            pmScore &&
            pmScore.reasons &&
            pmScore.reasons.length > 0 && (
              <div>
                <div
                  className={classNames(
                    styles.benchmarkSummarySingle,
                    styles.benchmarkSummaryPM
                  )}
                >
                  <img src={PMlogo} />
                  <div className={styles.benchmarkSummaryScore}>
                    <h2>-</h2>
                  </div>
                  <p>
                    Your Energy Star Portfolio Manager benchmarking score is
                    based on a 1-100 scale that compares your property to
                    similar properties nationwide. A score of 50 represents
                    median energy performance, while a score of 75 means your
                    building is a top energy performer — and may be eligible for
                    ENERGY STAR certification.
                  </p>
                  <p>
                    Score cannot be calculated for the selected year. Reasons
                    are listed below:
                  </p>
                  {pmScore.reasons.map((reason, index) => {
                    return <p key={index}>{reason.name}</p>
                  })}
                </div>
                <div className={styles.link} onClick={this.handleOpenPortfolio}>
                  Sync With Portfolio Manager{' '}
                  <i className='material-icons'>keyboard_arrow_right</i>
                </div>
                <div
                  className={styles.link}
                  onClick={this.pmImportUpdate.bind(this)}
                >
                  Import
                </div>
                <div
                  className={styles.link}
                  onClick={this.pmExportUpdate.bind(this)}
                >
                  Export
                </div>
              </div>
            )}
        </div>
        {this.state.openBenchmarkingSettingModal && (
          <BenchmarkingSettingModal
            openBenchmarkingSettingModal={this.openBenchmarkingSettingModal}
            buildingInfo={this.props.building}
            onBuildingDetailsSubmit={this.props.onBuildingDetailsSubmit}
          ></BenchmarkingSettingModal>
        )}
        {/* <div className={styles.panelFooter}>
          <div
            className={styles.link}
            onClick={() => {
              this.props.handleTabChange(2, 'Utilities', true)
            }}
          >
            Add all meters to improve accuracy&nbsp;
            <i className="material-icons">keyboard_arrow_right</i>
          </div>
        </div> */}
      </div>
    )
  }
}

export default OverviewSummary
