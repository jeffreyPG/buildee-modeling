import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './ProjectList.scss'
import scenarioListStyles from '../Portfolio/Scenario/ScenarioBuildingList.scss'
import { parentNodeHasClass } from 'utils/Utils'
import { multiSelectChecker } from 'utils/Portfolio'
import {
  numberWithCommas,
  sortProjectPackagesAscending,
  sortProjectPackagesDescending,
  calculateEnergySavings,
  replaceHTMLEntities,
  calculateGHGSavingsCost,
  calculateGasSavingsCost
} from './ProjectHelpers'
import ProjectExtraDropdown from '../UI/ProjectExtraDropdown'
import { round } from 'lodash'

export class ProposalFormProjectPackageList extends React.Component {
  static propTypes = {
    projectPackages: PropTypes.array.isRequired,
    handleEditProject: PropTypes.func.isRequired,
    handleOpenDeleteConfirmationModal: PropTypes.func.isRequired,
    buildingId: PropTypes.string.isRequired,
    isCheckable: PropTypes.bool
  }

  state = {
    items: [],
    sort: {
      key: 'updated',
      direction: 'DESC'
    },
    showExtras: '',
    windowWidth: '',
    expandProjectInfo: ''
  }

  componentDidMount = () => {
    this.setState({
      items: this.props.projectPackages,
      windowWidth: window.innerWidth
    })
    this.handleClickSort('updated', this.props.projectPackages, 'ASC')
    document.addEventListener('mousedown', this.handleClick, false)
    window.addEventListener('resize', this.handleUpdateDimensions)
  }

  componentWillUnmount = () => {
    this.setState({ showExtras: '', expandProjectInfo: '' })
    document.removeEventListener('mousedown', this.handleClick, false)
    window.removeEventListener('resize', this.handleUpdateDimensions)
  }

  componentDidUpdate = prevProps => {
    if (prevProps.projectPackages !== this.props.projectPackages) {
      this.setState({ items: this.props.projectPackages })
      this.handleClickSort('updated', this.props.projectPackages, 'ASC')
    }
  }

  handleClick = e => {
    const portal = e.target.closest('#portal')
    if (
      parentNodeHasClass(e.target, 'extrasClick') ||
      parentNodeHasClass(e.target, 'tableMoreInfo') ||
      portal
    ) {
      return
    }
    // otherwise, toggle (close) the extras dropdown
    this.setState({ showExtras: '', expandProjectInfo: '' })
  }

  handleUpdateDimensions = () => {
    this.setState({ windowWidth: window.innerWidth })
  }

  handleToggleExtras = index => {
    // toggle off
    if (index === this.state.showExtras) {
      this.setState({ showExtras: '' })
      return
    }
    this.setState({ showExtras: index })
  }

  handleMobileProjectInfo = projectId => {
    if (this.state.windowWidth <= 699) {
      // toggle off
      if (projectId === this.state.expandProjectInfo) {
        this.setState({ expandProjectInfo: '' })
        return
      }
      this.setState({ expandProjectInfo: projectId })
    }
  }

  handleClickSort = (key, projects, direction) => {
    const { buildingId } = this.props

    if (!projects) {
      projects = [...this.state.items]
    }
    if (!direction) {
      direction = this.state.sort.direction
    }
    let tempSort = { ...this.state.sort }

    if (key === tempSort.key) {
      if (direction === 'ASC') {
        tempSort.direction = 'DESC'
      } else {
        tempSort.direction = 'ASC'
      }
    } else {
      tempSort.key = key
      tempSort.direction = 'ASC'
    }

    if (tempSort.direction === 'ASC') {
      projects = projects.sort(function(a, b) {
        return sortProjectPackagesAscending(a, b, key)
      })
    } else {
      projects = projects.sort(function(a, b) {
        return sortProjectPackagesDescending(a, b, key)
      })
    }
    this.setState({ items: projects, sort: tempSort })
  }

  measureResultsIncludeFuelType = (data, key) => {
    const { items } = this.state
    let results = items.map(item =>
      this.projectResultsIncludeFuelType(data, item.projects, key)
    )
    return results.filter(item => item === true).length ? true : false
  }

  projectResultsIncludeFuelType = (data, items, key) => {
    const { buildingId } = this.props
    // as soon as you get a truthy value, exit .some method and move on
    // meaning, at least one project has this value, so display the column
    // no need to continue on to the rest of the projects
    switch (data) {
      case 'electric':
      case 'water':
        return items.some(project => {
          return calculateEnergySavings(project, buildingId, data, key)
        })
      case 'gas':
      case 'gas-savings':
      case 'gas-charge':
        return items.some(project => {
          return calculateGasSavingsCost(project, buildingId, data, key)
        })
      case 'ghg':
      case 'ghg-cost':
        return items.some(project => {
          return calculateGHGSavingsCost(project, buildingId, data, key)
        })
      case 'totalEnergy': {
        const isElectricResult = items.some(project => {
          return calculateEnergySavings(project, buildingId, 'electric', key)
        })
        const isGasResult = items.some(project => {
          return calculateGasSavingsCost(project, buildingId, 'gas', key)
        })
        return isElectricResult || isGasResult
      }
      // return true for everything else since we're not checking
      // for anything other than electric, gas, and water right meow
      default:
        return true
    }
  }

  measureResultsIncludeGHG = (data, key) => {
    const { items } = this.state
    let results = items.map(item =>
      this.projectResultsIncludeGHG(data, item.projects, key)
    )
    return results.filter(item => item === true).length ? true : false
  }

  projectResultsIncludeGHG = (data, items, key) => {
    const { buildingId } = this.props
    switch (data) {
      case 'ghg':
      case 'ghg-cost':
        return items.some(project => {
          return calculateGHGSavingsCost(project, buildingId, data, key)
        })
      default:
        return true
    }
  }

  measureResultsIncludeGasType = (data, key) => {
    const { items } = this.state
    let results = items.map(item =>
      this.projectResultsIncludeGasType(data, item.projects, key)
    )
    return results.filter(item => item === true).length ? true : false
  }

  projectResultsIncludeGasType = (data, items, key) => {
    const { buildingId } = this.props
    switch (data) {
      case 'gas':
      case 'gas-savings':
      case 'gas-charge':
        return items.some(project => {
          return calculateGasSavingsCost(project, buildingId, data, key)
        })
      default:
        return true
    }
  }

  render() {
    const {
      total,
      isCheckable = false,
      selectedProjectPackageIds = []
    } = this.props
    const isElectricResult = this.measureResultsIncludeFuelType(
      'electric',
      'runResultsWithRate'
    )
    const isGasResult = this.measureResultsIncludeGasType(
      'gas',
      'runResultsWithRate'
    )
    const isWaterResult = this.measureResultsIncludeFuelType(
      'water',
      'runResultsWithRate'
    )
    const isGHGResult = this.measureResultsIncludeGHG(
      'ghg',
      'runResultsWithRate'
    )
    const isGHGCostResult = this.measureResultsIncludeGHG(
      'ghg-cost',
      'runResultsWithRate'
    )
    const isTotalEnergyResult = this.measureResultsIncludeFuelType(
      'totalEnergy',
      'runResults'
    )
    const projectColumns = [
      { name: 'Status', value: 'status', data: 'status' },
      {
        name: 'Construction Status',
        value: 'constructionStatus',
        data: 'constructionStatus'
      },
      {
        value: 'estimatedstartdate',
        name: 'Construction Estimated Start Date',
        data: 'estimatedstartdate'
      },
      {
        value: 'estimatedcompletiondate',
        name: 'Construction Estimated End Date',
        data: 'estimatedcompletiondate'
      },
      {
        value: 'actualstartdate',
        name: 'Construction Actual Start Date',
        data: 'actualstartdate'
      },
      {
        value: 'actualcompletiondate',
        name: 'Construction Actual End Date',
        data: 'actualcompletiondate'
      },
      {
        name: 'Number of Measures',
        value: 'project_number',
        data: 'project_number'
      },
      {
        name: 'Annual Cost Savings',
        value: 'annual-savings',
        data: 'annual-savings'
      },
      { name: 'Energy Savings', value: 'energy-savings', data: 'totalEnergy' },
      { name: 'Electric Savings', value: 'electric-savings', data: 'electric' },
      {
        name: 'Demand Savings',
        value: 'demand-savings',
        data: 'demand'
      },
      { name: 'Natural Gas Savings', value: 'gas', data: 'gas' },
      { name: 'GHG Savings', value: 'ghg', data: 'ghg' },
      { name: 'GHG Savings Cost', value: 'ghg-cost', data: 'ghg-cost' },
      { name: 'Water Savings', value: 'water-savings', data: 'water' },
      { name: 'Project Cost', value: 'project_cost', data: 'project_cost' },
      { name: 'Incentive', value: 'incentive', data: 'incentive' },
      {
        name: 'Maintenance Savings',
        value: 'maintenance_savings',
        data: 'maintenance_savings'
      },
      { name: 'ROI', value: 'roi', data: 'roi' },
      {
        name: 'Simple Payback',
        value: 'simple-payback',
        data: 'simple-payback'
      },
      { name: 'NPV', value: 'npv', data: 'npv' },
      { name: 'SIR', value: 'sir', data: 'sir' },
      {
        name: 'Effective Useful Life',
        value: 'effective-useful-life',
        data: 'eul'
      },
      {
        name: 'Updated',
        value: 'updated',
        data: 'updated'
      },
      {
        name: 'Created',
        value: 'created',
        data: 'created'
      },
      {
        name: 'Author',
        value: 'author',
        data: 'author'
      }
    ]

    const columnlength = projectColumns.filter(column =>
      this.measureResultsIncludeFuelType(column.data)
    ).length
    let ids = this.state.items.map(item => item._id)
    let checkedAll = isCheckable
      ? multiSelectChecker(ids, selectedProjectPackageIds) &&
        multiSelectChecker(selectedProjectPackageIds, ids)
      : false

    let numberOfMeasures = this.state.items.reduce((preV, curV) => {
      let measure = (curV && curV.projects && curV.projects.length) || 0
      return preV + measure
    }, 0)

    if (this.state.windowWidth > 699) {
      return (
        <div
          className={styles.scrollTableContainer}
          style={{ marginBottom: isCheckable ? '100px' : '0px' }}
        >
          <table>
            <thead>
              <tr
                className={classNames(
                  this.state.sort.direction === 'ASC' ? styles.sortASC : ''
                )}
              >
                <th className={styles.firstColumnWithCheckbox}>
                  <div>
                    {isCheckable && (
                      <div className={scenarioListStyles.checkboxContainer}>
                        <label
                          className={classNames(
                            scenarioListStyles['__input'],
                            scenarioListStyles['__input--checkboxes']
                          )}
                        >
                          <input
                            defaultChecked={checkedAll}
                            value={true}
                            onClick={e =>
                              this.props.handleSelectProjectPackageIds(e, 'all')
                            }
                            className={classNames(
                              checkedAll ? scenarioListStyles['checked'] : ''
                            )}
                            type="checkbox"
                            name="data"
                          />
                          <span></span>
                        </label>
                      </div>
                    )}
                    <div onClick={() => this.handleClickSort('name')}>
                      Name&nbsp;
                      {this.state.sort.key === 'name' ? (
                        <i className="material-icons">arrow_downward</i>
                      ) : (
                        ''
                      )}
                    </div>
                  </div>
                </th>
                {projectColumns.map((column, index) => {
                  if (
                    this.measureResultsIncludeFuelType(
                      column.data,
                      'runResultsWithRate'
                    )
                  ) {
                    return (
                      <th key={'header' + index}>
                        <div onClick={() => this.handleClickSort(column.value)}>
                          {column.name}{' '}
                          {this.state.sort.key === column.value ? (
                            <i className="material-icons">arrow_downward</i>
                          ) : (
                            ''
                          )}
                        </div>
                      </th>
                    )
                  }
                })}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {this.state.items.map((project, index) => {
                let calculatedProjectCost =
                  (project.total && project.total.projectCost) || 0
                let calculatedIncentive =
                  (project.total && project.total.incentive) || 0
                let calculatedAnnualSavings =
                  (project.total && project.total.annualSavings) || 0
                let calculatedROI = (project.total && project.total.roi) || 0
                let calculatedSimplePayback =
                  (project.total && project.total.simplePayBack) || 0
                let calculatedNPV = (project.total && project.total.npv) || 0
                let calculatedSIR = (project.total && project.total.sir) || 0
                let calculatedDemandSavings =
                  (project.total && project.total.demandSavings) || 0
                let calculatedEUL = (project.total && project.total.eul) || 0
                let maintenanceSavings =
                  (project.total && project.total.maintenanceSavings) || 0
                let updateDate = new Date(project.updated).toLocaleDateString(
                  'en-US'
                )
                let createDate = new Date(project.created).toLocaleDateString(
                  'en-US'
                )
                let authorName = project?.author?.name || ''
                let estimatedstartdate = project.estimatedStartDate
                  ? new Date(project.estimatedStartDate).toLocaleDateString(
                      'en-US'
                    )
                  : '-'
                let estimatedcompletiondate = project.estimatedCompletionDate
                  ? new Date(
                      project.estimatedCompletionDate
                    ).toLocaleDateString('en-US')
                  : '-'
                let actualstartdate = project.actualStartDate
                  ? new Date(project.actualStartDate).toLocaleDateString(
                      'en-US'
                    )
                  : '-'
                let actualcompletiondate = project.actualCompletionDate
                  ? new Date(project.actualCompletionDate).toLocaleDateString(
                      'en-US'
                    )
                  : '-'
                let checked = isCheckable
                  ? selectedProjectPackageIds.indexOf(project._id) !== -1
                  : false

                return (
                  <tr key={index} className={styles.trItem}>
                    <td className={styles.firstColumnWithCheckbox}>
                      <div>
                        {isCheckable && (
                          <div className={scenarioListStyles.checkboxContainer}>
                            <label
                              className={classNames(
                                scenarioListStyles['__input'],
                                scenarioListStyles['__input--checkboxes']
                              )}
                            >
                              <input
                                defaultChecked={checked}
                                value={true}
                                onClick={e =>
                                  this.props.handleSelectProjectPackageIds(
                                    e,
                                    project._id
                                  )
                                }
                                className={classNames(
                                  checked ? scenarioListStyles['checked'] : ''
                                )}
                                type="checkbox"
                                name="data"
                              />
                              <span></span>
                            </label>
                          </div>
                        )}
                        <div
                          className={styles.projectListName}
                          onClick={() => this.props.handleEditProject(project)}
                        >
                          <span>{replaceHTMLEntities(project.name)}</span>
                        </div>
                      </div>
                    </td>
                    <td>{(project && project.status) || 'Identified'}</td>
                    <td>
                      {(project && project.constructionStatus) ||
                        'Conceptual design'}
                    </td>
                    <td>{estimatedstartdate}</td>
                    <td>{estimatedcompletiondate}</td>
                    <td>{actualstartdate}</td>
                    <td>{actualcompletiondate}</td>
                    <td>
                      {(project &&
                        project.projects &&
                        project.projects.length) ||
                        '-'}
                    </td>
                    <td>
                      {calculatedAnnualSavings
                        ? '$' +
                          numberWithCommas(
                            round(calculatedAnnualSavings, 2),
                            (project.total && project.total.calculationType) ||
                              ''
                          )
                        : '-'}
                    </td>
                    {isTotalEnergyResult && (
                      <td>
                        {project.total && project.total.energySavings
                          ? numberWithCommas(
                              round(project.total.energySavings, 2)
                            ) + ' kBtu'
                          : '-'}
                      </td>
                    )}
                    {isElectricResult && (
                      <td>
                        {project.total && project.total.electric
                          ? numberWithCommas(
                              round(project.total.electric, 2),
                              (project.total &&
                                project.total.calculationType) ||
                                ''
                            ) + ' kWh'
                          : '-'}
                      </td>
                    )}
                    <td>
                      {calculatedDemandSavings
                        ? numberWithCommas(round(calculatedDemandSavings, 2)) +
                          ' kW'
                        : '-'}
                    </td>
                    {isGasResult && (
                      <td>
                        {project.total && project.total.gasSavings
                          ? numberWithCommas(
                              project.total.gasSavings,
                              (project.total &&
                                project.total.calculationType) ||
                                ''
                            ) + ' therms'
                          : '-'}
                      </td>
                    )}
                    {isGHGResult && (
                      <td>
                        {project.total &&
                        project.total.ghgSavings &&
                        project.total.calculationType
                          ? numberWithCommas(
                              round(project.total.ghgSavings, 2),
                              (project.total &&
                                project.total.calculationType) ||
                                ''
                            ) + ' mtCO2e'
                          : '-'}
                      </td>
                    )}
                    {isGHGCostResult && (
                      <td>
                        {project.total &&
                        project.total.ghgSavingsCost &&
                        project.total.ghgSavingsCost != 'Infinity' &&
                        project.total.calculationType
                          ? numberWithCommas(
                              round(project.total.ghgSavingsCost, 2),
                              (project.total &&
                                project.total.calculationType) ||
                                ''
                            ) + ' $/mtCO2e'
                          : '-'}
                      </td>
                    )}
                    {isWaterResult && (
                      <td>
                        {project.total && project.total.waterSavings
                          ? numberWithCommas(
                              project.total.waterSavings,
                              (project.total &&
                                project.total.calculationType) ||
                                ''
                            ) + ' kGal'
                          : '-'}
                      </td>
                    )}
                    <td>
                      {calculatedProjectCost
                        ? '$' +
                          numberWithCommas(round(calculatedProjectCost, 2))
                        : '-'}
                    </td>
                    <td>
                      {calculatedIncentive
                        ? '$' + numberWithCommas(round(calculatedIncentive, 2))
                        : '-'}
                    </td>
                    <td>
                      {maintenanceSavings
                        ? '$' + numberWithCommas(round(maintenanceSavings, 2))
                        : '-'}
                    </td>
                    <td>
                      {calculatedROI
                        ? numberWithCommas(round(calculatedROI, 2)) + ' %'
                        : '-'}
                    </td>
                    <td>
                      {calculatedSimplePayback
                        ? (calculatedSimplePayback > 0
                            ? numberWithCommas(
                                round(calculatedSimplePayback, 2)
                              )
                            : 0) + ' yrs'
                        : '-'}
                    </td>
                    <td>
                      {calculatedNPV
                        ? '$' + numberWithCommas(round(calculatedNPV, 2))
                        : '-'}
                    </td>
                    <td>
                      {calculatedSIR
                        ? numberWithCommas(round(calculatedSIR, 2))
                        : '-'}
                    </td>
                    <td>
                      {calculatedEUL
                        ? numberWithCommas(round(calculatedEUL, 2))
                        : '-'}
                    </td>
                    <td>{updateDate}</td>
                    <td>{createDate}</td>
                    <td>{authorName}</td>
                    <td>
                      <div className={styles.scrollExtra}>
                        <ProjectExtraDropdown
                          key={index}
                          index={index}
                          currentIndex={this.state.showExtras}
                          project={project}
                          handleEditProject={this.props.handleEditProject}
                          handleOpenDeleteConfirmationModal={
                            this.props.handleOpenDeleteConfirmationModal
                          }
                          handleToggleExtras={this.handleToggleExtras}
                          deleteText="Delete project"
                          finishText="Finish project"
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}

              {this.state.items.length > 0 && !this.props.reCalculating && (
                <tr>
                  <td>
                    <div className={styles.total}>
                      <span>Total</span>
                      <span>{this.state.items.length}</span>
                    </div>
                  </td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                  <td>{numberOfMeasures}</td>
                  <td>
                    {total && total.annualSavings
                      ? '$' + numberWithCommas(total.annualSavings)
                      : '-'}
                  </td>
                  {isTotalEnergyResult && (
                    <td>
                      {total && total.energySavings
                        ? numberWithCommas(round(total.energySavings, 2)) +
                          ' kBtu'
                        : '-'}
                    </td>
                  )}
                  {isElectricResult && (
                    <td>
                      {total && total.electric
                        ? numberWithCommas(total.electric) + ' kWh'
                        : '-'}
                    </td>
                  )}
                  <td>
                    {total && total.demandSavings
                      ? numberWithCommas(round(total.demandSavings, 2)) + 'kW'
                      : '-'}
                  </td>
                  {isGasResult && (
                    <td>
                      {total && total.gasSavings
                        ? numberWithCommas(total.gasSavings) + ' therms'
                        : '-'}
                    </td>
                  )}
                  {isGHGResult && (
                    <td>
                      {total && total.ghgSavings
                        ? numberWithCommas(
                            round(total.ghgSavings, 2),
                            (total && total.calulationType) || ''
                          ) + ` mtCO2e`
                        : '-'}
                    </td>
                  )}
                  {isGHGCostResult && (
                    <td>
                      {total && total.ghgSavingsCost
                        ? numberWithCommas(
                            round(total.ghgSavingsCost, 2),
                            (total && total.calulationType) || ''
                          ) + ` $/mtCO2e`
                        : '-'}
                    </td>
                  )}
                  {isWaterResult && (
                    <td>
                      {total && total.waterSavings
                        ? numberWithCommas(
                            total.waterSavings,
                            (total && total.calulationType) || ''
                          ) + ' kGal'
                        : '-'}
                    </td>
                  )}
                  <td>
                    {total && total.projectCost
                      ? '$' + numberWithCommas(total.projectCost)
                      : '-'}
                  </td>
                  <td>
                    {total && total.incentive
                      ? '$' + numberWithCommas(total.incentive)
                      : '-'}
                  </td>
                  <td>
                    {total && total.maintenanceSavings
                      ? '$' +
                        numberWithCommas(round(total.maintenanceSavings, 2))
                      : '-'}
                  </td>
                  <td>
                    {total && total.roi
                      ? numberWithCommas(round(total.roi, 2)) + ' %'
                      : '-'}
                  </td>
                  <td>
                    {total && total.simplePayBack
                      ? (total.simplePayBack > 0
                          ? numberWithCommas(round(total.simplePayBack, 2))
                          : 0) + ' yrs'
                      : '-'}
                  </td>
                  <td>
                    {total && total.npv
                      ? '$' + numberWithCommas(round(total.npv, 2))
                      : '-'}
                  </td>
                  <td>
                    {total && total.sir
                      ? numberWithCommas(round(total.sir, 2))
                      : '-'}
                  </td>
                  <td>
                    {total && total.eul
                      ? numberWithCommas(round(total.eul, 2))
                      : '-'}
                  </td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                  <td></td>
                </tr>
              )}
              {this.state.items.length === 0 && this.state.searchValue !== '' && (
                <tr>
                  <td className={styles.emptyList}>
                    Sorry, no projects to show.
                  </td>
                  <td colSpan={columnlength}></td>
                  <td></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )
    }
    return (
      <div className={styles.projectList}>
        <div className={styles.table}>
          <div
            className={classNames(
              styles.tableHeader,
              this.state.sort.direction === 'ASC'
                ? styles.tableHeaderSortASC
                : styles.tableHeaderSortDESC
            )}
          >
            <div
              className={classNames(styles.tableRowItem, styles.tableRowItem_2)}
              onClick={() => this.handleClickSort('name')}
            >
              Name&nbsp;
              {this.state.sort.key === 'name' ? (
                <i className="material-icons">arrow_downward</i>
              ) : (
                ''
              )}
            </div>
            {projectColumns.map((column, index) => {
              if (this.measureResultsIncludeFuelType(column.data)) {
                return (
                  <div
                    key={index}
                    className={styles.tableRowItem}
                    onClick={() => this.handleClickSort(column.value)}
                  >
                    {column.name}{' '}
                    {this.state.sort.key === column.value ? (
                      <i className="material-icons">arrow_downward</i>
                    ) : (
                      ''
                    )}
                  </div>
                )
              }
            })}
            <div className={styles.tableRowItem} />
          </div>

          {this.state.items.map((project, index) => {
            let calculatedProjectCost =
              (project.total && project.total.projectCost) || 0
            let calculatedIncentive =
              (project.total && project.total.incentive) || 0
            let calculatedAnnualSavings =
              (project.total && project.total.annualSavings) || 0
            let calculatedROI = (project.total && project.total.roi) || 0
            let calculatedSimplePayback =
              (project.total && project.total.simplePayBack) || 0
            let calculatedNPV = (project.total && project.total.npv) || 0
            let calculatedSIR = (project.total && project.total.sir) || 0
            let calculatedDemandSavings =
              (project.total && project.total.demandSavings) || 0
            let calculatedEUL = (project.total && project.total.eul) || 0
            let maintenanceSavings =
              (project.total && project.total.maintenanceSavings) || 0
            let updateDate = new Date(project.updated).toLocaleDateString(
              'en-US'
            )
            let createDate = new Date(project.created).toLocaleDateString(
              'en-US'
            )
            let authorName = project?.author?.name || ''

            let estimatedstartdate = project.estimatedStartDate
              ? new Date(project.estimatedStartDate).toLocaleDateString('en-US')
              : '-'
            let estimatedcompletiondate = project.estimatedStartDate
              ? new Date(project.estimatedCompletionDate).toLocaleDateString(
                  'en-US'
                )
              : '-'
            let actualstartdate = project.actualStartDate
              ? new Date(project.actualStartDate).toLocaleDateString('en-US')
              : '-'
            let actualcompletiondate = project.actualCompletionDate
              ? new Date(project.actualCompletionDate).toLocaleDateString(
                  'en-US'
                )
              : '-'

            return (
              <div key={index} className={styles.tableRow}>
                <div
                  className={classNames(
                    styles.tableRowItem,
                    styles.tableRowItem_2
                  )}
                  onClick={() => this.props.handleEditProject(project)}
                >
                  <div className={styles.projectListName}>
                    <span>{replaceHTMLEntities(project.name)}</span>
                  </div>
                </div>
                <div className={styles.tableRowItem}>
                  <label className={styles.tableMobileShow}>
                    Project Status
                  </label>
                  {(project && project.status) || 'Identified'}
                </div>
                <div className={styles.tableRowItem}>
                  <label className={styles.tableMobileShow}>
                    Project Construction Status
                  </label>
                  {(project && project.constructionStatus) ||
                    'Conceptual design'}
                </div>
                <div className={styles.tableRowItem}>
                  <label className={styles.tableMobileShow}>
                    Construction Estimated Start Date
                  </label>
                  {estimatedstartdate}
                </div>
                <div className={styles.tableRowItem}>
                  <label className={styles.tableMobileShow}>
                    Construction Estimated End Date
                  </label>
                  {estimatedcompletiondate}
                </div>
                <div className={styles.tableRowItem}>
                  <label className={styles.tableMobileShow}>
                    Construction Actual Start Date
                  </label>
                  {actualstartdate}
                </div>
                <div className={styles.tableRowItem}>
                  <label className={styles.tableMobileShow}>
                    Construction Actual End Date
                  </label>
                  {actualcompletiondate}
                </div>
                <div className={styles.tableRowItem}>
                  <label className={styles.tableMobileShow}>
                    Number of Measures
                  </label>
                  {(project && project.projects && project.projects.length) ||
                    '-'}
                </div>
                <div className={styles.tableRowItem}>
                  <label className={styles.tableMobileShow}>
                    Annual Cost Savings
                  </label>
                  {calculatedAnnualSavings
                    ? '$' +
                      numberWithCommas(
                        round(calculatedAnnualSavings, 2),
                        (project.total && project.total.calculationType) || ''
                      )
                    : '-'}
                </div>
                {isTotalEnergyResult && (
                  <div
                    className={classNames(
                      styles.tableRowItem,
                      this.state.expandProjectInfo === project._id
                        ? ''
                        : styles.tableMobileCollapseColumns
                    )}
                  >
                    <label className={styles.tableMobileShow}>
                      Energy Savings
                    </label>
                    {project.total && project.total.energySavings
                      ? numberWithCommas(
                          round(project.total.energySavings, 2)
                        ) + ' kBtu'
                      : '-'}
                  </div>
                )}
                {isElectricResult && (
                  <div
                    className={classNames(
                      styles.tableRowItem,
                      this.state.expandProjectInfo === project._id
                        ? ''
                        : styles.tableMobileCollapseColumns
                    )}
                  >
                    <label className={styles.tableMobileShow}>
                      Electric Savings
                    </label>
                    {project.total && project.total.electric
                      ? numberWithCommas(
                          project.total.electric,
                          (project.total && project.total.calculationType) || ''
                        ) + ' kWh'
                      : '-'}
                  </div>
                )}
                <div
                  className={classNames(
                    styles.tableRowItem,
                    this.state.expandProjectInfo === project._id
                      ? ''
                      : styles.tableMobileCollapseColumns
                  )}
                >
                  <label className={styles.tableMobileShow}>
                    Demand Savings
                  </label>
                  {calculatedDemandSavings
                    ? numberWithCommas(round(calculatedDemandSavings, 2)) +
                      ' kW'
                    : '-'}
                </div>
                {isGasResult && (
                  <div
                    className={classNames(
                      styles.tableRowItem,
                      this.state.expandProjectInfo === project._id
                        ? ''
                        : styles.tableMobileCollapseColumns
                    )}
                  >
                    <label className={styles.tableMobileShow}>
                      Natural Gas Savings
                    </label>
                    {project.total && project.total.gasSavings
                      ? numberWithCommas(
                          round(project.total.gasSavings, 2),
                          (project.total && project.total.calculationType) || ''
                        ) + ' therms'
                      : '-'}
                  </div>
                )}
                {isGHGResult && (
                  <div
                    className={classNames(
                      styles.tableRowItem,
                      this.state.expandProjectInfo === project._id
                        ? ''
                        : styles.tableMobileCollapseColumns
                    )}
                  >
                    <label className={styles.tableMobileShow}>
                      GHG Savings
                    </label>
                    {project.total &&
                    project.total.ghgSavings &&
                    project.total.calculationType
                      ? numberWithCommas(
                          round(project.total.ghgSavings, 2),
                          (project.total && project.total.calculationType) || ''
                        ) + ' mtCO2e'
                      : '-'}
                  </div>
                )}
                {isGHGCostResult && (
                  <div
                    className={classNames(
                      styles.tableRowItem,
                      this.state.expandProjectInfo === project._id
                        ? ''
                        : styles.tableMobileCollapseColumns
                    )}
                  >
                    <label className={styles.tableMobileShow}>
                      GHG Savings Cost
                    </label>
                    {project.total &&
                    project.total.ghgSavingsCost &&
                    project.total.ghgSavingsCost != 'Infinity' &&
                    project.total.calculationType
                      ? numberWithCommas(
                          round(project.total.ghgSavingsCost, 2),
                          (project.total && project.total.calculationType) || ''
                        ) + ' $/mtCO2e'
                      : '-'}
                  </div>
                )}
                {isWaterResult && (
                  <div
                    className={classNames(
                      styles.tableRowItem,
                      this.state.expandProjectInfo === project._id
                        ? ''
                        : styles.tableMobileCollapseColumns
                    )}
                  >
                    <label className={styles.tableMobileShow}>
                      Water Savings
                    </label>
                    {project.total && project.total.waterSavings
                      ? numberWithCommas(
                          round(project.total.waterSavings, 2),
                          (project.total && project.total.calculationType) || ''
                        ) + ' kGal'
                      : '-'}
                  </div>
                )}
                <div className={styles.tableRowItem}>
                  <label className={styles.tableMobileShow}>Project Cost</label>
                  {calculatedProjectCost
                    ? '$' + numberWithCommas(round(calculatedProjectCost, 2))
                    : '-'}
                </div>
                <div
                  className={classNames(
                    styles.tableRowItem,
                    this.state.expandProjectInfo !== project._id &&
                      calculatedIncentive === null
                      ? styles.tableMobileCollapseColumns
                      : ''
                  )}
                >
                  <label className={styles.tableMobileShow}>Incentive</label>
                  {calculatedIncentive
                    ? '$' + numberWithCommas(round(calculatedIncentive, 2))
                    : '-'}
                </div>
                <div
                  className={classNames(
                    styles.tableRowItem,
                    this.state.expandProjectInfo === project._id
                      ? ''
                      : styles.tableMobileCollapseColumns
                  )}
                >
                  <label className={styles.tableMobileShow}>
                    Maintenance Savings
                  </label>
                  {maintenanceSavings
                    ? '$' + numberWithCommas(round(maintenanceSavings, 2))
                    : '-'}
                </div>
                <div
                  className={classNames(
                    styles.tableRowItem,
                    this.state.expandProjectInfo === project._id
                      ? ''
                      : styles.tableMobileCollapseColumns
                  )}
                >
                  <label className={styles.tableMobileShow}>ROI</label>
                  {calculatedROI
                    ? numberWithCommas(round(calculatedROI, 2)) + ' %'
                    : '-'}
                </div>
                <div className={styles.tableRowItem}>
                  <label className={styles.tableMobileShow}>
                    Simple Payback
                  </label>
                  {calculatedSimplePayback
                    ? (calculatedSimplePayback > 0
                        ? numberWithCommas(round(calculatedSimplePayback, 2))
                        : 0) + ' yrs'
                    : '-'}
                </div>
                <div
                  className={classNames(
                    styles.tableRowItem,
                    this.state.expandProjectInfo === project._id
                      ? ''
                      : styles.tableMobileCollapseColumns
                  )}
                >
                  <label className={styles.tableMobileShow}>NPV</label>
                  {calculatedNPV
                    ? '$' + numberWithCommas(round(calculatedNPV, 2))
                    : '-'}
                </div>
                <div
                  className={classNames(
                    styles.tableRowItem,
                    this.state.expandProjectInfo === project._id
                      ? ''
                      : styles.tableMobileCollapseColumns
                  )}
                >
                  <label className={styles.tableMobileShow}>SIR</label>
                  {calculatedSIR
                    ? numberWithCommas(round(calculatedSIR, 2))
                    : '-'}
                </div>
                <div
                  className={classNames(
                    styles.tableRowItem,
                    this.state.expandProjectInfo === project._id
                      ? ''
                      : styles.tableMobileCollapseColumns
                  )}
                >
                  <label className={styles.tableMobileShow}>
                    Effective Useful Life
                  </label>
                  {calculatedEUL
                    ? numberWithCommas(round(calculatedEUL, 2))
                    : '-'}
                </div>

                <div
                  className={classNames(
                    styles.tableRowItem,
                    this.state.expandProjectInfo === project._id
                      ? ''
                      : styles.tableMobileCollapseColumns
                  )}
                >
                  <label className={styles.tableMobileShow}>Updated</label>
                  {updateDate}
                </div>
                <div
                  className={classNames(
                    styles.tableRowItem,
                    this.state.expandProjectInfo === project._id
                      ? ''
                      : styles.tableMobileCollapseColumns
                  )}
                >
                  <label className={styles.tableMobileShow}>Created</label>
                  {createDate}
                </div>

                <div
                  className={classNames(
                    styles.tableRowItem,
                    this.state.expandProjectInfo === project._id
                      ? ''
                      : styles.tableMobileCollapseColumns
                  )}
                >
                  <label className={styles.tableMobileShow}>Author</label>
                  {authorName}
                </div>
                <div
                  className={classNames(
                    styles.tableRowItem,
                    this.state.expandProjectInfo === project._id
                      ? ''
                      : styles.tableMobileCollapseColumns
                  )}
                >
                  <div
                    onClick={() => this.handleToggleExtras(index)}
                    className={classNames(
                      styles.extras,
                      'extrasClick',
                      this.state.showExtras === index
                        ? styles.extrasShow
                        : styles.extrasHide
                    )}
                  >
                    <span className={styles.extrasButton} />

                    <div
                      className={classNames(
                        styles.extrasDropdown,
                        styles.extrasDropdownRight
                      )}
                    >
                      {!project.isComplete && (
                        <div
                          className={styles.extrasLink}
                          onClick={() => this.props.handleEditProject(project)}
                        >
                          <i className="material-icons">warning</i>Finish
                          project
                        </div>
                      )}
                      <div
                        className={styles.extrasLink}
                        onClick={() =>
                          this.props.handleOpenDeleteConfirmationModal(project)
                        }
                      >
                        <i className="material-icons">delete</i>Delete Project
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={classNames(
                    styles.tableRowItem,
                    styles.tableMobileShow,
                    styles.tableMoreInfo
                  )}
                  onClick={() => this.handleMobileProjectInfo(project._id)}
                >
                  <span>
                    {this.state.expandProjectInfo === project._id
                      ? 'Less info'
                      : 'More info'}
                    {this.state.expandProjectInfo === project._id ? (
                      <i className="material-icons">expand_less</i>
                    ) : (
                      <i className="material-icons">expand_more</i>
                    )}
                  </span>
                </div>
              </div>
            )
          })}

          {this.state.items.length != 0 && (
            <div className={styles.tableRow}>
              <div
                className={classNames(
                  styles.tableRowItem,
                  styles.tableRowItem_2
                )}
              >
                <label className={styles.tableMobileShow}>Total</label>
                {`${this.state.items.length}`}
              </div>

              <div className={styles.tableRowItem}>
                <label className={styles.tableMobileShow}>Project Status</label>{' '}
                -
              </div>

              <div className={styles.tableRowItem}>
                <label className={styles.tableMobileShow}>
                  Project Construction Status
                </label>{' '}
                -
              </div>

              <div className={styles.tableRowItem}>
                <label className={styles.tableMobileShow}>
                  Construction Estimated Start Date
                </label>{' '}
                -
              </div>
              <div className={styles.tableRowItem}>
                <label className={styles.tableMobileShow}>
                  Construction Estimated End Date
                </label>
                -
              </div>
              <div className={styles.tableRowItem}>
                <label className={styles.tableMobileShow}>
                  Construction Actual Start Date
                </label>
                -
              </div>
              <div className={styles.tableRowItem}>
                <label className={styles.tableMobileShow}>
                  Construction Actual End Date
                </label>
                -
              </div>

              <div className={styles.tableRowItem}>
                <label className={styles.tableMobileShow}>
                  Number of Measures
                </label>
                {numberOfMeasures || '-'}
              </div>
              <div className={styles.tableRowItem}>
                <label className={styles.tableMobileShow}>
                  Annual Cost Savings
                </label>
                {total && total.annualSavings
                  ? '$' + numberWithCommas(total.annualSavings)
                  : '-'}
              </div>
              {isTotalEnergyResult && (
                <div className={styles.tableRowItem}>
                  <label className={styles.tableMobileShow}>
                    Energy Savings
                  </label>
                  {total && total.energySavings
                    ? numberWithCommas(round(total.energySavings, 2)) + ' kBtu'
                    : '-'}
                </div>
              )}
              {isElectricResult && (
                <div
                  className={classNames(
                    styles.tableRowItem,
                    this.state.expandProjectInfo === 'total'
                      ? ''
                      : styles.tableMobileCollapseColumns
                  )}
                >
                  <label className={styles.tableMobileShow}>
                    Electric Savings
                  </label>
                  {total && total.electric
                    ? numberWithCommas(total.electric) + ' kWh'
                    : '-'}
                </div>
              )}
              <div
                className={classNames(
                  styles.tableRowItem,
                  this.state.expandProjectInfo === 'total'
                    ? ''
                    : styles.tableMobileCollapseColumns
                )}
              >
                <label className={styles.tableMobileShow}>Demand Savings</label>
                {total && total.demandSavings
                  ? numberWithCommas(round(total.demandSavings, 2))
                  : '-'}
              </div>
              {isGasResult && (
                <div
                  className={classNames(
                    styles.tableRowItem,
                    this.state.expandProjectInfo === 'total'
                      ? ''
                      : styles.tableMobileCollapseColumns
                  )}
                >
                  <label className={styles.tableMobileShow}>
                    Natural Gas Savings
                  </label>
                  {total && total.gasSavings
                    ? numberWithCommas(total.gasSavings) + ' therms'
                    : '-'}
                </div>
              )}
              {isGHGResult && (
                <div
                  className={classNames(
                    styles.tableRowItem,
                    this.state.expandProjectInfo === 'total'
                      ? ''
                      : styles.tableMobileCollapseColumns
                  )}
                >
                  <label className={styles.tableMobileShow}>GHG Savings</label>
                  {total && total.ghgSavings
                    ? numberWithCommas(
                        total.ghgSavings,
                        (total && total.calulationType) || ''
                      ) + ` mtCO2e`
                    : '-'}
                </div>
              )}
              {isGHGCostResult && (
                <div
                  className={classNames(
                    styles.tableRowItem,
                    this.state.expandProjectInfo === 'total'
                      ? ''
                      : styles.tableMobileCollapseColumns
                  )}
                >
                  <label className={styles.tableMobileShow}>
                    GHG Savings Cost
                  </label>
                  {total && total.ghgSavingsCost
                    ? numberWithCommas(
                        total.ghgSavingsCost,
                        (total && total.calulationType) || ''
                      ) + ` $/mtCO2e`
                    : '-'}
                </div>
              )}
              {isWaterResult && (
                <div
                  className={classNames(
                    styles.tableRowItem,
                    this.state.expandProjectInfo === 'total'
                      ? ''
                      : styles.tableMobileCollapseColumns
                  )}
                >
                  <label className={styles.tableMobileShow}>
                    Water Savings
                  </label>
                  {total && total.waterSavings
                    ? numberWithCommas(
                        total.waterSavings,
                        (total && total.calulationType) || ''
                      ) + ' kGal'
                    : '-'}
                </div>
              )}
              <div className={styles.tableRowItem}>
                <label className={styles.tableMobileShow}>Project Cost</label>
                {total && total.projectCost
                  ? '$' + numberWithCommas(total.projectCost)
                  : '-'}
              </div>
              <div
                className={classNames(
                  styles.tableRowItem,
                  this.state.expandProjectInfo === 'total'
                    ? ''
                    : styles.tableMobileCollapseColumns
                )}
              >
                <label className={styles.tableMobileShow}>Incentive</label>
                {total && total.incentive
                  ? '$' + numberWithCommas(total.incentive)
                  : '-'}
              </div>
              <div
                className={classNames(
                  styles.tableRowItem,
                  this.state.expandProjectInfo === 'total'
                    ? ''
                    : styles.tableMobileCollapseColumns
                )}
              >
                <label className={styles.tableMobileShow}>
                  Maintenance Savings
                </label>
                {total && total.maintenanceSavings
                  ? '$' + numberWithCommas(round(total.maintenanceSavings, 2))
                  : '-'}
              </div>
              <div
                className={classNames(
                  styles.tableRowItem,
                  this.state.expandProjectInfo === 'total'
                    ? ''
                    : styles.tableMobileCollapseColumns
                )}
              >
                <label className={styles.tableMobileShow}>ROI</label>
                {total && total.roi ? total.roi + ' %' : '-'}
              </div>
              <div className={styles.tableRowItem}>
                <label className={styles.tableMobileShow}>Simple Payback</label>
                {total && total.simplePayBack
                  ? (total.simplePayBack > 0
                      ? numberWithCommas(round(total.simplePayBack, 2))
                      : 0) + ' yrs'
                  : '-'}
              </div>
              <div
                className={classNames(
                  styles.tableRowItem,
                  this.state.expandProjectInfo === 'total'
                    ? ''
                    : styles.tableMobileCollapseColumns
                )}
              >
                <label className={styles.tableMobileShow}>NPV</label>
                {total && total.npv
                  ? '$' + numberWithCommas(round(total.npv, 2))
                  : '-'}
              </div>
              <div
                className={classNames(
                  styles.tableRowItem,
                  this.state.expandProjectInfo === 'total'
                    ? ''
                    : styles.tableMobileCollapseColumns
                )}
              >
                <label className={styles.tableMobileShow}>SIR</label>
                {total && total.sir
                  ? numberWithCommas(round(total.sir, 2))
                  : '-'}
              </div>
              <div
                className={classNames(
                  styles.tableRowItem,
                  this.state.expandProjectInfo === 'total'
                    ? ''
                    : styles.tableMobileCollapseColumns
                )}
              >
                <label className={styles.tableMobileShow}>
                  Effective Useful Life
                </label>
                {total && total.eul
                  ? numberWithCommas(round(total.eul, 2))
                  : '-'}
              </div>
              <div
                className={classNames(
                  styles.tableRowItem,
                  this.state.expandProjectInfo === 'total'
                    ? ''
                    : styles.tableMobileCollapseColumns
                )}
              >
                <label className={styles.tableMobileShow}>Updated</label> -
              </div>

              <div
                className={classNames(
                  styles.tableRowItem,
                  this.state.expandProjectInfo === 'total'
                    ? ''
                    : styles.tableMobileCollapseColumns
                )}
              >
                <label className={styles.tableMobileShow}>Created</label> -
              </div>
              <div
                className={classNames(
                  styles.tableRowItem,
                  this.state.expandProjectInfo === 'total'
                    ? ''
                    : styles.tableMobileCollapseColumns
                )}
              >
                <div style={{ height: '38px' }}></div>
              </div>
              <div
                className={classNames(
                  styles.tableRowItem,
                  styles.tableMobileShow,
                  styles.tableMoreInfo
                )}
                onClick={() => this.handleMobileProjectInfo('total')}
              >
                <span>
                  {this.state.expandProjectInfo === 'total'
                    ? 'Less info'
                    : 'More info'}
                  {this.state.expandProjectInfo === 'total' ? (
                    <i className="material-icons">expand_less</i>
                  ) : (
                    <i className="material-icons">expand_more</i>
                  )}
                </span>
              </div>
            </div>
          )}

          {this.state.items.length === 0 && this.state.searchValue !== '' && (
            <div className={styles.tableRow}>
              <div className={styles.tableRowItem}>
                Sorry, no projects to show.
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
}
export default ProposalFormProjectPackageList
