import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import _ from 'lodash'
import styles from './OverviewMesuresProject.scss'
import { Loader } from 'utils/Loader'
import { formatNumbersWithCommas, defaultUtilUnitsFromType } from 'utils/Utils'
import { connect } from 'react-redux'
import { getPortfolioDashboard } from 'routes/Portfolio/modules/portfolio'
import { getOrganizationIds } from 'utils/Portfolio'
import ToolTip from 'components/ToolTip'
import { ENABLED_FEATURES } from 'utils/graphql/queries/user'
import { Query } from 'react-apollo'

export class OverviewMesuresProject extends React.Component {
  static propTypes = {
    building: PropTypes.object.isRequired,
    allUtilities: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    handleTabChange: PropTypes.func.isRequired,
    organizationList: PropTypes.array.isRequired,
    organizationView: PropTypes.object.isRequired,
    measureList: PropTypes.array.isRequired,
    proposalList: PropTypes.array.isRequired,
    projectPackageList: PropTypes.array.isRequired,
    routeParams: PropTypes.object.isRequired
  }

  state = {
    measures: {},
    proposals: {},
    progressProjects: {},
    completedProjects: {}
  }

  componentDidMount() {
    const orgId = this.props.building._partition.substring(6)

    let organizationIds = getOrganizationIds(
      [],
      this.props.organizationView,
      this.props.organizationList,
      orgId
    )
    this.props.getPortfolioDashboard(orgId, organizationIds)
  }

  componentDidUpdate = prevProps => {
    if (prevProps.measureList !== this.props.measureList) {
      this.createMeasureData()
    }
    if (prevProps.proposalList !== this.props.proposalList) {
      this.createProposalData()
    }
    if (prevProps.projectPackageList !== this.props.projectPackageList) {
      this.createProjectData()
    }
  }

  createProposalData = () => {
    const { buildingId } = this.props.routeParams
    const { proposalList } = this.props
    let proposals = {
      costSaving: 0,
      annualElectricSavings: 0,
      annualGasSavings: 0,
      energySaving: 0,
      ghgSaving: 0,
      totalNum: 0
    }
    const notOpenProposalStatus = ['Accepted', 'Rejected']
    proposalList.forEach(el => {
      if (
        !notOpenProposalStatus.includes(el.status) &&
        el.buildingIds.includes(buildingId)
      ) {
        proposals.costSaving += el.total.annualSavings
        proposals.annualElectricSavings += el.total.annualElectricSavings
        proposals.annualGasSavings += el.total.annualGasSavings
        proposals.energySaving += el.total.energySavings
        proposals.ghgSaving += el.ghgSavings
        proposals.totalNum += 1
      }
    })
    this.setState({
      proposals: proposals
    })
  }

  createMeasureData = () => {
    const { buildingId } = this.props.routeParams
    const { measureList } = this.props
    let measures = {
      costSaving: 0,
      annualElectricSavings: 0,
      annualGasSavings: 0,
      energySaving: 0,
      ghgSaving: 0,
      totalNum: 0
    }
    const notOpenMeasureStatus = [
      'In Progress',
      'On Hold',
      'Completed',
      'M&V',
      'Verified',
      'Unsatisfactory'
    ]
    measureList.forEach(el => {
      if (
        !notOpenMeasureStatus.includes(el.status) &&
        el.building_id == buildingId
      ) {
        measures.costSaving += el.metric_annualsavings
        measures.annualElectricSavings += el.metric_annualelectricsavings
        measures.annualGasSavings += el.metric_annualgassavings
        measures.energySaving += el.metric_energysavings
        measures.ghgSaving += el.metric_ghgsavings
        measures.totalNum += 1
      }
    })
    this.setState({
      measures: measures
    })
  }

  createProjectData = () => {
    const { buildingId } = this.props.routeParams
    const { projectPackageList } = this.props
    let progressProjects = {
      costSaving: 0,
      annualElectricSavings: 0,
      annualGasSavings: 0,
      energySaving: 0,
      ghgSaving: 0,
      totalNum: 0
    }
    let completedProjects = {
      costSaving: 0,
      energySaving: 0,
      ghgSaving: 0,
      totalNum: 0
    }
    const progressStatus = ['In Progress', 'On Hold', 'Unsatisfactory']
    const completedStatus = ['Completed', 'M&V', 'Verified']
    projectPackageList.forEach(el => {
      if (el.buildingid == buildingId) {
        if (progressStatus.includes(el.status)) {
          progressProjects.costSaving += el.total_annualsavings || 0
          progressProjects.annualElectricSavings +=
            el.total_annualelectricsavings || 0
          progressProjects.annualGasSavings += el.total_annualgassavings || 0
          progressProjects.energySaving += el.total_energysavings || 0
          progressProjects.ghgSaving += el.total_ghgsavings || 0
          progressProjects.totalNum += 1
        } else if (completedStatus.includes(el.status)) {
          completedProjects.costSaving += el.total_annualsavings || 0
          completedProjects.annualElectricSavings +=
            el.total_annualelectricsavings || 0
          completedProjects.annualGasSavings += el.total_annualgassavings || 0
          completedProjects.energySaving += el.total_energysavings || 0
          completedProjects.ghgSaving += el.total_ghgsavings || 0
          completedProjects.totalNum += 1
        }
      }
    })
    this.setState({
      progressProjects: progressProjects,
      completedProjects: completedProjects
    })
  }

  checkEmptyState = () => {
    const { allUtilities } = this.props
    const keys = (allUtilities && Object.keys(allUtilities)) || []
    return keys.length === 0
  }

  customTooltip = type => {
    const {
      measures,
      proposals,
      completedProjects,
      progressProjects
    } = this.state
    let costSaving, annualElectricSavings, annualGasSavings
    switch (type) {
      case 'measures': {
        costSaving = measures.costSaving
        annualElectricSavings = measures.annualElectricSavings
        annualGasSavings = measures.annualGasSavings
        break
      }
      case 'proposals': {
        costSaving = proposals.costSaving
        annualElectricSavings = proposals.annualElectricSavings
        annualGasSavings = proposals.annualGasSavings
        break
      }
      case 'completedProjects': {
        costSaving = completedProjects.costSaving
        annualElectricSavings = completedProjects.annualElectricSavings
        annualGasSavings = completedProjects.annualGasSavings
        break
      }
      case 'progressProjects': {
        costSaving = progressProjects.costSaving
        annualElectricSavings = progressProjects.annualElectricSavings
        annualGasSavings = progressProjects.annualGasSavings
        break
      }
    }
    return (
      <div className={styles.toolTipContainer}>
        <p>Total: ${formatNumbersWithCommas(costSaving) || 0}</p>
        <p>
          Electricity: ${formatNumbersWithCommas(annualElectricSavings) || 0}
        </p>
        <p>Natural Gas: ${formatNumbersWithCommas(annualGasSavings) || 0}</p>
      </div>
    )
  }

  render() {
    const { allUtilities } = this.props
    const {
      measures,
      proposals,
      progressProjects,
      completedProjects
    } = this.state
    const emptyState = this.checkEmptyState()

    return (
      <div className={styles.utilitySummary}>
        <div className={styles.panelHeader}>
          <h3>
            {
              <Query query={ENABLED_FEATURES}>
                {({ loading, error, data }) => {
                  if (loading || !data) return 'Projects'
                  const enabledFeatures = data.enabledFeatures
                  let isProposalEnabled =
                    enabledFeatures &&
                    enabledFeatures.some(
                      feature => feature.name === 'projectProposal'
                    )
                  let isProjectEnabled =
                    enabledFeatures &&
                    enabledFeatures.some(
                      feature => feature.name === 'projectProject'
                    )
                  return isProposalEnabled || isProjectEnabled
                    ? 'Projects'
                    : 'Measures'
                }}
              </Query>
            }
          </h3>
        </div>
        <div className={styles.panelContent}>
          {allUtilities && emptyState && (
            <div className={styles.empty}>
              <div className={styles.emptyBody}>
                <div className={styles.emptyBodyTitle}>Add Meter Data</div>
                <div className={styles.emptyBodyDescription}>
                  Add data in Utilities or import from ENERGY STAR Portfolio
                  Manager.
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
          )}

          {allUtilities && !emptyState && (
            <div>
              <div>
                <p className={styles.subTitle}>
                  Open Measures ({measures.totalNum})
                </p>
                <div className={styles.utilitySummaryRow}>
                  <div>
                    <p>Cost Savings</p>
                    <div className={styles.breakdownTooltip}>
                      {measures.costSaving != 0 ? (
                        <ToolTip content={this.customTooltip('measures')}>
                          <h2>
                            ${formatNumbersWithCommas(measures.costSaving)}
                          </h2>
                        </ToolTip>
                      ) : (
                        <h2>$0</h2>
                      )}
                    </div>
                  </div>
                  <div>
                    <p>Energy Savings</p>
                    <h2>
                      {measures.energySaving
                        ? formatNumbersWithCommas(measures.energySaving / 1000)
                        : 0}{' '}
                      mBtu
                    </h2>
                  </div>
                  <div>
                    <p>GHG Savings</p>
                    <h2>
                      {measures.ghgSaving
                        ? formatNumbersWithCommas(measures.ghgSaving)
                        : 0}{' '}
                      mtCO2e
                    </h2>
                  </div>
                </div>
              </div>
              <div>
                <p className={styles.subTitle}>
                  Open Proposals ({proposals.totalNum})
                </p>
                <div className={styles.utilitySummaryRow}>
                  <div>
                    <p>Cost Savings</p>
                    {proposals.costSaving != 0 ? (
                      <ToolTip content={this.customTooltip('proposals')}>
                        <h2>
                          ${formatNumbersWithCommas(proposals.costSaving)}
                        </h2>
                      </ToolTip>
                    ) : (
                      <h2>$0</h2>
                    )}
                  </div>
                  <div>
                    <p>Energy Savings</p>
                    <h2>
                      {proposals.energySaving
                        ? formatNumbersWithCommas(proposals.energySaving / 1000)
                        : 0}{' '}
                      mBtu
                    </h2>
                  </div>
                  <div>
                    <p>GHG Savings</p>
                    <h2>
                      {proposals.ghgSaving
                        ? formatNumbersWithCommas(proposals.ghgSaving)
                        : 0}{' '}
                      mtCO2e
                    </h2>
                  </div>
                </div>
              </div>
              <div>
                <p className={styles.subTitle}>
                  Projects in Progress ({progressProjects.totalNum})
                </p>
                <div className={styles.utilitySummaryRow}>
                  <div>
                    <p>Cost Savings</p>
                    {progressProjects.costSaving != 0 ? (
                      <ToolTip content={this.customTooltip('progressProjects')}>
                        <h2>
                          $
                          {formatNumbersWithCommas(progressProjects.costSaving)}
                        </h2>
                      </ToolTip>
                    ) : (
                      <h2>$0</h2>
                    )}
                  </div>
                  <div>
                    <p>Energy Savings</p>
                    <h2>
                      {progressProjects.energySaving
                        ? formatNumbersWithCommas(
                            progressProjects.energySaving / 1000
                          )
                        : 0}{' '}
                      mBtu
                    </h2>
                  </div>
                  <div>
                    <p>GHG Savings</p>
                    <h2>
                      {progressProjects.ghgSaving
                        ? formatNumbersWithCommas(progressProjects.ghgSaving)
                        : 0}{' '}
                      mtCO2e
                    </h2>
                  </div>
                </div>
              </div>
              <div>
                <p className={styles.subTitle}>
                  Completed Projects ({completedProjects.totalNum})
                </p>
                <div
                  className={classNames(
                    styles.utilitySummaryRow,
                    styles.lastItem
                  )}
                >
                  <div>
                    <p>Cost Savings</p>
                    {completedProjects.costSaving != 0 ? (
                      <ToolTip
                        content={this.customTooltip('completedProjects')}
                      >
                        <h2>
                          $
                          {formatNumbersWithCommas(
                            completedProjects.costSaving
                          )}
                        </h2>
                      </ToolTip>
                    ) : (
                      <h2>$0</h2>
                    )}
                  </div>
                  <div>
                    <p>Energy Savings</p>
                    <h2>
                      {completedProjects.energySaving
                        ? formatNumbersWithCommas(
                            completedProjects.energySaving / 1000
                          )
                        : 0}{' '}
                      mBtu
                    </h2>
                  </div>
                  <div>
                    <p>GHG Savings</p>
                    <h2>
                      {completedProjects.ghgSaving
                        ? formatNumbersWithCommas(completedProjects.ghgSaving)
                        : 0}{' '}
                      mtCO2e
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          )}

          {this.props.loading && <Loader />}
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = {
  getPortfolioDashboard
}

const mapStateToProps = state => ({
  measureList: state.portfolio.dashboard.projects || [],
  proposalList: state.portfolio.dashboard.proposals || [],
  projectPackageList: state.portfolio.dashboard.projectPackages || [],
  organizationList: state.organization.organizationList || [],
  organizationView: state.organization.organizationView || {}
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OverviewMesuresProject)
