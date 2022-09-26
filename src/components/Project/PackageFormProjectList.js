import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './ProjectList.scss'
import scenarioListStyles from '../Portfolio/Scenario/ScenarioBuildingList.scss'
import { parentNodeHasClass } from 'utils/Utils'
import { multiSelectChecker } from 'utils/Portfolio'
import {
  numberWithCommas,
  formatStringUpperCase,
  sortProjectsAscending,
  sortProjectsDescending,
  getAnnualSavings,
  getProjectCost,
  getIncentive,
  getTotalEnergySavings,
  getEnergySavings,
  getROI,
  getSimplePayback,
  getNPV,
  getSIR,
  replaceHTMLEntities,
  getGHGSavingsCost,
  getGasSavingsCost,
  getDemandSavings,
  getEUL,
  getDisplayName,
  getMaintenanceSavings,
  getCalculationType,
  getCategory,
  getApplication,
  getTechnology
} from './ProjectHelpers'
import ProjectExtraDropdown from '../UI/ProjectExtraDropdown'
import { round } from 'lodash'

export class PackageFormProjectList extends React.Component {
  static propTypes = {
    projectsToShow: PropTypes.array.isRequired,
    handleEditProject: PropTypes.func.isRequired,
    handleOpenDeleteConfirmationModal: PropTypes.func.isRequired,
    buildingId: PropTypes.string.isRequired,
    isCheckable: PropTypes.bool
  }

  state = {
    items: [],
    sort: {
      key: 'updated',
      direction: 'ASC'
    },
    showExtras: '',
    windowWidth: '',
    expandProjectInfo: ''
  }

  componentDidMount = () => {
    this.setState({
      items: this.props.projectsToShow,
      windowWidth: window.innerWidth
    })
    this.handleClickSort('updated', this.props.projectsToShow)
    document.addEventListener('mousedown', this.handleClick, false)
    window.addEventListener('resize', this.handleUpdateDimensions)
  }

  componentWillUnmount = () => {
    this.setState({ showExtras: '', expandProjectInfo: '' })
    document.removeEventListener('mousedown', this.handleClick, false)
    window.removeEventListener('resize', this.handleUpdateDimensions)
  }

  componentDidUpdate = prevProps => {
    if (prevProps.projectsToShow !== this.props.projectsToShow) {
      this.setState({ items: this.props.projectsToShow })
      this.handleClickSort('updated', this.props.projectsToShow, 'DESC')
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
        return sortProjectsAscending(a, b, key, buildingId)
      })
    } else {
      projects = projects.sort(function(a, b) {
        return sortProjectsDescending(a, b, key, buildingId)
      })
    }
    this.setState({ items: projects, sort: tempSort })
  }

  projectResultsIncludeFuelType = (data, key) => {
    const { items } = this.state
    const { buildingId } = this.props

    // as soon as you get a truthy value, exit .some method and move on
    // meaning, at least one project has this value, so display the column
    // no need to continue on to the rest of the projects
    switch (data) {
      case 'electric':
      case 'water':
        return items.some(project => {
          return getEnergySavings(project, buildingId, data, 'sort', key)
        })
      case 'gas':
      case 'gas-savings':
      case 'gas-charge':
        return this.projectResultsIncludeGasType(data, key)
      case 'ghg':
      case 'ghg-cost':
        return items.some(project => {
          if (isFinite(getGHGSavingsCost(project, buildingId, data, key)))
            return getGHGSavingsCost(project, buildingId, data, key)
        })
      case 'totalEnergy': {
        const isElectricResult = items.some(project => {
          return getEnergySavings(project, buildingId, 'electric', 'sort', key)
        })
        const isGasResult = items.some(project => {
          return getGasSavingsCost(project, buildingId, 'gas', key)
        })
        return isElectricResult || isGasResult
      }
      // return true for everything else since we're not checking
      // for anything other than electric, gas, and water right meow
      default:
        return true
    }
  }
  projectResultsIncludeGHG = (data, key) => {
    const { items } = this.state
    const { buildingId } = this.props
    switch (data) {
      case 'ghg':
      case 'ghg-cost':
        return items.some(project => {
          if (isFinite(getGHGSavingsCost(project, buildingId, data, key)))
            return getGHGSavingsCost(project, buildingId, data, key)
        })
      default:
        return true
    }
  }
  projectResultsIncludeGasType = (data, key) => {
    const { items } = this.state
    const { buildingId } = this.props
    switch (data) {
      case 'gas':
      case 'gas-savings':
      case 'gas-charge':
        return items.some(project => {
          return getGasSavingsCost(project, buildingId, data, key)
        })
      default:
        return true
    }
  }

  render() {
    const {
      buildingId,
      total,
      isCheckable = false,
      selectedMeasureIds = []
    } = this.props
    const isElectricResult = this.projectResultsIncludeFuelType(
      'electric',
      'runResultsWithRate'
    )
    const isGasResult = this.projectResultsIncludeGasType(
      'gas',
      'runResultsWithRate'
    )
    const isWaterResult = this.projectResultsIncludeFuelType(
      'water',
      'runResultsWithRate'
    )
    const isGHGResult = this.projectResultsIncludeGHG(
      'ghg',
      'runResultsWithRate'
    )
    const isGHGCostResult = this.projectResultsIncludeGHG(
      'ghg-cost',
      'runResultsWithRate'
    )
    const isTotalEnergyResult = this.projectResultsIncludeFuelType(
      'totalEnergy',
      'runResults'
    )

    let projectColumns = [
      { name: 'Status', value: 'status', data: 'status' },
      { name: 'Type', value: 'type', data: 'type' },
      { name: 'Budget Type', value: 'budgetType', data: 'budgetType' },
      {
        name: 'Annual Cost Savings',
        value: 'annual-savings',
        data: 'annual-savings'
      },
      { name: 'Energy Savings', value: 'energy-savings', data: 'totalEnergy' },

      isElectricResult && {
        name: 'Electric Savings',
        value: 'electric-savings',
        data: 'electric'
      },
      {
        name: 'Demand Savings',
        value: 'demand-savings',
        data: 'demand'
      },
      isGasResult && { name: 'Natural Gas Savings', value: 'gas', data: 'gas' },
      isWaterResult && {
        name: 'Water Savings',
        value: 'water-savings',
        data: 'water'
      },
      isGHGResult && { name: 'GHG Savings', value: 'ghg', data: 'ghg' },
      isGHGCostResult && {
        name: 'GHG Savings Cost',
        value: 'ghg-cost',
        data: 'ghg-cost'
      },
      { name: 'Measure Cost', value: 'project_cost', data: 'project_cost' },
      { name: 'Incentive', value: 'incentive', data: 'incentive' },
      {
        name: 'Simple Payback',
        value: 'simple-payback',
        data: 'simple-payback'
      },
      { name: 'NPV', value: 'npv', data: 'npv' },
      { name: 'SIR', value: 'sir', data: 'sir' },
      { name: 'ROI', value: 'roi', data: 'roi' },
      {
        name: 'Maintenance Savings',
        value: 'maintenance_savings',
        data: 'maintenance_savings'
      },
      {
        name: 'Effective Useful Life',
        value: 'effective-useful-life',
        data: 'eul'
      },
      {
        name: 'Measure Category',
        value: 'project_category',
        data: 'category'
      },
      {
        name: 'Measure Application',
        value: 'project_application',
        data: 'application'
      },
      {
        name: 'Measure Technology',
        value: 'project_technology',
        data: 'technology'
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
    ].filter(item => !!item)

    let { target } = this.props
    if (target === 'MeasurePackage') {
      projectColumns = projectColumns.slice(3)
    }

    let columnlength = projectColumns.filter(column =>
      this.projectResultsIncludeFuelType(column.data)
    ).length

    let ids = this.state.items.map(item => item._id)
    let checkedAll = isCheckable
      ? multiSelectChecker(ids, selectedMeasureIds) &&
        multiSelectChecker(selectedMeasureIds, ids)
      : false

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
                              this.props.handleSelectMeasureIds(e, 'all')
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
                    <div onClick={() => this.handleClickSort('displayName')}>
                      Name&nbsp;
                      {this.state.sort.key === 'displayName' ? (
                        <i className="material-icons">arrow_downward</i>
                      ) : (
                        ''
                      )}
                    </div>
                  </div>
                </th>
                {projectColumns.map((column, index) => {
                  if (this.projectResultsIncludeFuelType(column.data)) {
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
                let { modeFrom } = this.props
                modeFrom = modeFrom || 'ProjectView'
                let key =
                  modeFrom === 'ProjectView'
                    ? 'runResults'
                    : 'runResultsWithRate'
                let calculatedProjectCost = getProjectCost(project)
                let calculatedIncentive = getIncentive(project, buildingId, key)
                let calculatedAnnualSavings = getAnnualSavings(
                  project,
                  buildingId,
                  'sort',
                  key
                )
                let calculatedROI = getROI(project, buildingId, key)
                let calculatedSimplePayback = getSimplePayback(
                  project,
                  buildingId,
                  key
                )
                let calculatedNPV = getNPV(project, buildingId, key)
                let calculatedSIR = getSIR(project, buildingId, key)
                let calculatedDemandSavings = getDemandSavings(
                  project,
                  buildingId,
                  key
                )
                let calculatedEUL = getEUL(project, buildingId, key)
                let maintenanceSavings = getMaintenanceSavings(project)
                let status = project.status || 'Identified'
                let type = project.type
                let budgetType = project.budgetType
                let updateDate = new Date(project.updated).toLocaleDateString(
                  'en-US'
                )
                let createDate = new Date(project.created).toLocaleDateString(
                  'en-US'
                )
                let authorName = project?.author?.name || ''
                let calculationType = getCalculationType(
                  project,
                  buildingId,
                  key
                )
                let category = getCategory(project)
                let application = getApplication(project)
                let technology = getTechnology(project)
                let checked = isCheckable
                  ? selectedMeasureIds.indexOf(project._id) !== -1
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
                                  this.props.handleSelectMeasureIds(
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
                          onClick={() => this.props.handleEditProject(project)}
                        >
                          {project.collectionTarget === 'measurePackage' && (
                            <i
                              className={classNames(
                                'material-icons',
                                styles.measurePackageIcon
                              )}
                            >
                              library_books
                            </i>
                          )}
                          <div className={styles.projectListName}>
                            {!project.isComplete &&
                              project.isComplete !== undefined && (
                                <i className="material-icons warning">
                                  warning
                                </i>
                              )}
                            <span>
                              {replaceHTMLEntities(getDisplayName(project))}
                            </span>
                            {project.location && project.location.length > 0 && (
                              <div
                                className={classNames(
                                  styles.tags,
                                  styles.tableMobileHide
                                )}
                              >
                                {project.location.length > 0 &&
                                  project.location.map((tag, index) => {
                                    return (
                                      <div key={index} className={styles.tag}>
                                        <small id={tag}>{tag}</small>
                                      </div>
                                    )
                                  })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    {target !== 'MeasurePackage' && (
                      <td>{status ? status : '-'}</td>
                    )}
                    {target !== 'MeasurePackage' && (
                      <td>{(type && formatStringUpperCase(type)) || '-'}</td>
                    )}
                    {target !== 'MeasurePackage' && (
                      <td>{budgetType ? budgetType : '-'}</td>
                    )}
                    <td>
                      {calculatedAnnualSavings
                        ? '$' +
                          numberWithCommas(
                            round(calculatedAnnualSavings, 2),
                            calculationType
                          )
                        : '-'}
                    </td>
                    {isTotalEnergyResult && (
                      <td>
                        {getTotalEnergySavings(project, buildingId, key)
                          ? numberWithCommas(
                              round(
                                getTotalEnergySavings(project, buildingId, key),
                                2
                              )
                            ) + ' kBtu'
                          : '-'}
                      </td>
                    )}
                    {isElectricResult && (
                      <td>
                        {getEnergySavings(
                          project,
                          buildingId,
                          'electric',
                          'sort',
                          key
                        )
                          ? numberWithCommas(
                              round(
                                getEnergySavings(
                                  project,
                                  buildingId,
                                  'electric',
                                  'sort',
                                  key
                                ),
                                2
                              ),
                              calculationType
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
                        {getGasSavingsCost(project, buildingId, 'gas', key)
                          ? numberWithCommas(
                              round(
                                getGasSavingsCost(
                                  project,
                                  buildingId,
                                  'gas',
                                  key
                                ),
                                2
                              ),
                              calculationType
                            ) + ' therms'
                          : '-'}
                      </td>
                    )}
                    {isWaterResult && (
                      <td>
                        {getEnergySavings(
                          project,
                          buildingId,
                          'water',
                          'sort',
                          key
                        )
                          ? numberWithCommas(
                              round(
                                getEnergySavings(
                                  project,
                                  buildingId,
                                  'water',
                                  'sort',
                                  key
                                ),
                                2
                              ),
                              calculationType
                            ) + ' kGal'
                          : '-'}
                      </td>
                    )}

                    {isGHGResult && (
                      <td>
                        {getGHGSavingsCost(project, buildingId, 'ghg', key) &&
                        calculationType !== null
                          ? numberWithCommas(
                              round(
                                getGHGSavingsCost(
                                  project,
                                  buildingId,
                                  'ghg',
                                  key
                                ),
                                2
                              ),
                              calculationType
                            ) + ` mtCO2e`
                          : '-'}
                      </td>
                    )}
                    {isGHGCostResult && (
                      <td>
                        {getGHGSavingsCost(
                          project,
                          buildingId,
                          'ghg-cost',
                          key
                        ) &&
                        isFinite(
                          getGHGSavingsCost(
                            project,
                            buildingId,
                            'ghg-cost',
                            key
                          )
                        ) &&
                        calculationType !== null
                          ? numberWithCommas(
                              round(
                                getGHGSavingsCost(
                                  project,
                                  buildingId,
                                  'ghg-cost',
                                  key
                                ),
                                2
                              ),
                              calculationType
                            ) + ` $/mtCO2e`
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
                      {calculatedROI
                        ? numberWithCommas(round(calculatedROI, 2)) + ' %'
                        : '-'}
                    </td>
                    <td>
                      {maintenanceSavings
                        ? '$' + numberWithCommas(round(maintenanceSavings, 2))
                        : '-'}
                    </td>
                    <td>
                      {calculatedEUL
                        ? numberWithCommas(round(calculatedEUL, 2))
                        : '-'}
                    </td>
                    <td>{category ? formatStringUpperCase(category) : '-'}</td>
                    <td>
                      {application ? formatStringUpperCase(application) : '-'}
                    </td>
                    <td>
                      {technology ? formatStringUpperCase(technology) : '-'}
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
                          deleteText={
                            project.collectionTarget === 'measure'
                              ? 'Delete measure'
                              : 'Delete measure package'
                          }
                          finishText={
                            project.collectionTarget === 'measure'
                              ? 'Finish measure'
                              : 'Finish measure package'
                          }
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
                  {target !== 'MeasurePackage' && <td>-</td>}
                  {target !== 'MeasurePackage' && <td>-</td>}
                  {target !== 'MeasurePackage' && <td>-</td>}
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
                    {total && total.roi
                      ? numberWithCommas(round(total.roi, 2)) + ' %'
                      : '-'}
                  </td>
                  <td>
                    {total && total.maintenanceSavings
                      ? '$' +
                        numberWithCommas(round(total.maintenanceSavings, 2))
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
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                  <td></td>
                </tr>
              )}
              {this.state.items.length === 0 && this.state.searchValue !== '' && (
                <tr>
                  <td className={styles.emptyList}>
                    Sorry, no measures to show.
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
              onClick={() => this.handleClickSort('displayName')}
            >
              Name&nbsp;
              {this.state.sort.key === 'displayName' ? (
                <i className="material-icons">arrow_downward</i>
              ) : (
                ''
              )}
            </div>
            {projectColumns.map((column, index) => {
              if (this.projectResultsIncludeFuelType(column.data)) {
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
            let { modeFrom } = this.props
            modeFrom = modeFrom || 'ProjectView'
            let key =
              modeFrom === 'ProjectView' ? 'runResults' : 'runResultsWithRate'
            let calculatedProjectCost = getProjectCost(project)
            let calculatedIncentive = getIncentive(project, buildingId, key)
            let calculatedAnnualSavings = getAnnualSavings(
              project,
              buildingId,
              'sort',
              key
            )
            let calculatedROI = getROI(project, buildingId, key)
            let calculatedSimplePayback = getSimplePayback(
              project,
              buildingId,
              key
            )
            let calculatedNPV = getNPV(project, buildingId, key)
            let calculatedSIR = getSIR(project, buildingId, key)
            let calculatedDemandSavings = getDemandSavings(
              project,
              buildingId,
              key
            )
            let calculatedEUL = getEUL(project, buildingId, key)
            let maintenanceSavings = getMaintenanceSavings(project)
            let status = project.status || 'Identified'
            let type = project.type
            let budgetType = project.budgetType
            let updateDate = new Date(project.updated).toLocaleDateString(
              'en-US'
            )
            let createDate = new Date(project.created).toLocaleDateString(
              'en-US'
            )
            let authorName = project?.author?.name || ''
            let calculationType = getCalculationType(project, buildingId, key)
            let category = getCategory(project)
            let application = getApplication(project)
            let technology = getTechnology(project)

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
                    {!project.isComplete &&
                      project.isComplete !== undefined && (
                        <i className="material-icons warning">warning</i>
                      )}
                    {project.collectionTarget === 'measurePackage' && (
                      <i
                        className={classNames(
                          'material-icons',
                          styles.measurePackageIcon
                        )}
                      >
                        library_books
                      </i>
                    )}
                    <span>{replaceHTMLEntities(getDisplayName(project))}</span>
                    {project.location && project.location.length > 0 && (
                      <div
                        className={classNames(
                          styles.tags,
                          styles.tableMobileHide
                        )}
                      >
                        {project.location.length > 0 &&
                          project.location.map((tag, index) => {
                            return (
                              <div key={index} className={styles.tag}>
                                <small id={tag}>{tag}</small>
                              </div>
                            )
                          })}
                      </div>
                    )}
                  </div>
                </div>

                {target !== 'MeasurePackage' && (
                  <div className={styles.tableRowItem}>
                    <label className={styles.tableMobileShow}>
                      Measure Status
                    </label>
                    <div style={{ wordBreak: 'break-all' }}>
                      {status ? status : '-'}
                    </div>
                  </div>
                )}

                {target !== 'MeasurePackage' && (
                  <div className={styles.tableRowItem}>
                    <label className={styles.tableMobileShow}>
                      Measure Type
                    </label>
                    {type ? formatStringUpperCase(type) : '-'}
                  </div>
                )}
                {target !== 'MeasurePackage' && (
                  <div className={styles.tableRowItem}>
                    <label className={styles.tableMobileShow}>
                      Measure Budget Type
                    </label>
                    {budgetType ? budgetType : '-'}
                  </div>
                )}
                <div className={styles.tableRowItem}>
                  <label className={styles.tableMobileShow}>
                    Annual Cost Savings
                  </label>
                  {calculatedAnnualSavings
                    ? '$' +
                      numberWithCommas(
                        round(calculatedAnnualSavings, 2),
                        calculationType
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
                    {getTotalEnergySavings(project, buildingId, key)
                      ? numberWithCommas(
                          round(
                            getTotalEnergySavings(project, buildingId, key),
                            2
                          )
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
                    {getEnergySavings(project, buildingId, 'electric', key)
                      ? numberWithCommas(
                          round(
                            getEnergySavings(
                              project,
                              buildingId,
                              'electric',
                              key
                            ),
                            2
                          ),
                          calculationType
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
                    {getGasSavingsCost(project, buildingId, 'gas', key) &&
                    !isNaN(getGasSavingsCost(project, buildingId, 'gas', key))
                      ? numberWithCommas(
                          round(
                            getGasSavingsCost(project, buildingId, 'gas'),
                            2
                          ),
                          calculationType
                        ) + ' therms'
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
                    {getEnergySavings(project, buildingId, 'water', key)
                      ? numberWithCommas(
                          round(
                            getEnergySavings(project, buildingId, 'water', key),
                            2
                          ),
                          calculationType
                        ) + ' kGal'
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
                    {getGHGSavingsCost(project, buildingId, 'ghg', key) &&
                    calculationType !== null
                      ? numberWithCommas(
                          round(
                            getGHGSavingsCost(project, buildingId, 'ghg', key),
                            2
                          ),
                          calculationType
                        ) + ` mtCO2e`
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
                    {getGHGSavingsCost(project, buildingId, 'ghg-cost', key) &&
                    !isFinite(
                      getGHGSavingsCost(project, buildingId, 'ghg-cost', key)
                    ) &&
                    calculationType !== null
                      ? numberWithCommas(
                          round(
                            getGHGSavingsCost(
                              project,
                              buildingId,
                              'ghg-cost',
                              key
                            ),
                            2
                          ),
                          calculationType
                        ) + ` $/mtCO2e`
                      : '-'}
                  </div>
                )}
                <div className={styles.tableRowItem}>
                  <label className={styles.tableMobileShow}>Measure Cost</label>
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
                  <label className={styles.tableMobileShow}>ROI</label>
                  {calculatedROI
                    ? numberWithCommas(round(calculatedROI, 2)) + ' %'
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
                  <label className={styles.tableMobileShow}>
                    Measure Category
                  </label>
                  {category ? formatStringUpperCase(category) : '-'}
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
                    Measure Application
                  </label>
                  {application ? formatStringUpperCase(application) : '-'}
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
                    Measure Technology
                  </label>
                  {technology ? formatStringUpperCase(technology) : '-'}
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
                    styles.tableMobileShow,
                    this.state.expandProjectInfo === project._id
                      ? ''
                      : styles.tableMobileCollapseColumns
                  )}
                >
                  <label className={styles.tableMobileShow}>Tags</label>
                  {project.location && project.location.length > 0 && (
                    <div className={styles.tags}>
                      {project.location.length > 0
                        ? project.location.map((tag, index) => {
                            return (
                              <div key={index} className={styles.tag}>
                                <small id={tag}>{tag}</small>
                              </div>
                            )
                          })
                        : null}
                    </div>
                  )}
                  {project.location && project.location.length === 0 && (
                    <span>-</span>
                  )}
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
                          measure
                        </div>
                      )}
                      <div
                        className={styles.extrasLink}
                        onClick={() =>
                          this.props.handleOpenDeleteConfirmationModal(project)
                        }
                      >
                        <i className="material-icons">delete</i>Delete Measure
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

              {target !== 'MeasurePackage' && (
                <div className={styles.tableRowItem}>
                  <label className={styles.tableMobileShow}>
                    Measure Status
                  </label>{' '}
                  -
                </div>
              )}

              {target !== 'MeasurePackage' && (
                <div className={styles.tableRowItem}>
                  <label className={styles.tableMobileShow}>Measure Type</label>{' '}
                  -
                </div>
              )}

              {target !== 'MeasurePackage' && (
                <div className={styles.tableRowItem}>
                  <label className={styles.tableMobileShow}>
                    Measure Budget Type
                  </label>{' '}
                  -
                </div>
              )}
              {/* <div className={styles.tableRowItem}>
                <label className={styles.tableMobileShow}>Project Name</label> -
              </div> */}
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
              <div className={styles.tableRowItem}>
                <label className={styles.tableMobileShow}>Measure Cost</label>
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
                <label className={styles.tableMobileShow}>ROI</label>
                {total && total.roi ? total.roi + ' %' : '-'}
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
                <label className={styles.tableMobileShow}>
                  Measure Application
                </label>{' '}
                -
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
                  Measure Category
                </label>{' '}
                -
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
                  Measure Technology
                </label>{' '}
                -
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
                <label className={styles.tableMobileShow}>Author</label> -
              </div>
              <div
                className={classNames(
                  styles.tableRowItem,
                  styles.tableMobileShow,
                  this.state.expandProjectInfo === 'total'
                    ? ''
                    : styles.tableMobileCollapseColumns
                )}
              >
                <label className={styles.tableMobileShow}>Tags</label>
                <span>-</span>
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
                Sorry, no measures to show.
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
}

export default PackageFormProjectList
