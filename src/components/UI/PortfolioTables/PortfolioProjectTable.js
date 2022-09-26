import React, { Component } from 'react'
import _ from 'lodash'
import { VariableSizeGrid as Grid } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import ToolTip from 'components/ToolTip'
import {
  _getValueFromObjPerPath,
  formatNumbersWithCommas,
  truncateText
} from 'utils/Utils'
import { formatStringUpperCase } from '../../Project/ProjectHelpers'
import { multiSelectChecker } from 'utils/Portfolio'
import styles from './PortfolioBuildingTable.scss'
let columnList = [],
  projectList = [],
  sort = {},
  push,
  sortFunction,
  projectLoading,
  setCurrentOrganization,
  updateTab,
  updateProjectTab,
  setBuildingViewMode,
  isCheckable,
  ids = [],
  handleSelectItems

const getRenderedCursor = children =>
  children.reduce(
    (
      [minRow, maxRow, minColumn, maxColumn],
      { props: { columnIndex, rowIndex } }
    ) => {
      if (rowIndex < minRow) {
        minRow = rowIndex
      }

      if (rowIndex > maxRow) {
        maxRow = rowIndex
      }

      if (columnIndex < minColumn) {
        minColumn = columnIndex
      }

      if (columnIndex > maxColumn) {
        maxColumn = columnIndex
      }

      return [minRow, maxRow, minColumn, maxColumn]
    },
    [
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      0,
      columnList.length ? columnList.length - 1 : Number.NEGATIVE_INFINITY
    ]
  )

const headerBuilder = (minColumn, maxColumn, columnWidth, stickyHeight) => {
  const columns = []
  let left = [0],
    pos = 0

  for (let c = 1; c <= maxColumn; c++) {
    pos += columnWidth(c - 1)
    left.push(pos)
  }

  for (let i = minColumn; i <= maxColumn; i++) {
    let label = (columnList && columnList[i] && columnList[i].label) || ''
    let unit = (columnList && columnList[i] && columnList[i].unit) || ''
    columns.push({
      height: stickyHeight,
      width: columnWidth(i),
      left: left[i],
      index: i,
      label: label ? (unit ? label + '(' + unit + ')' : label) : ''
    })
  }
  return columns
}

const columnsBuilder = (minRow, maxRow, rowHeight, stickyWidth) => {
  const rows = []
  let top = [0],
    pos = 0

  for (let c = 1; c <= maxRow; c++) {
    pos += rowHeight(c - 1)
    top.push(pos)
  }

  for (let i = minRow; i <= maxRow; i++) {
    rows.push({
      height: rowHeight(i),
      width: stickyWidth,
      top: top[i],
      label: `Sticky Row ${i}`,
      index: i
    })
  }

  return rows
}

const GridColumn = ({ rowIndex, columnIndex, style }) => {
  let project = projectList[rowIndex]
  let column = columnList[columnIndex]
  let label = '-'
  let originLabel = ''
  if (column) {
    let value = _getValueFromObjPerPath.call(project, column.value)
    if (column.value === 'updated' || column.value === 'created') {
      if (value === null) value = '-'
      else value = new Date(value).toLocaleDateString('en-US')
    }
    if (value === 'Infinity' || value == null || value == undefined) value = 0
    if (value == +value) value = formatNumbersWithCommas(value)
    label = value ? value : '-'
    if (typeof value === 'boolean') label = value ? 'Yes' : 'No'
  }
  label = formatStringUpperCase(label)
  if (column && column.value == 'building.buildingname') {
    originLabel = label
    label = truncateText(label, 28)
  }
  return (
    <div
      id={`Building_${rowIndex}_Grid_${columnIndex}`}
      className={classNames(
        styles.dataColumn,
        rowIndex % 2 == 0 ? styles.rowEven : styles.rowOdd
      )}
      style={style}
    >
      <div className={styles.showColumn}>
        {column && column.value === 'building.buildingname' ? (
          <ToolTip
            content={<span className={styles.whiteText}>{originLabel}</span>}
            direction="right"
          >
            <div
              className={classNames(
                styles.showInTwoLine,
                styles.projectBuildingName
              )}
              style={{ WebkitBoxOrient: 'vertical' }}
            >
              {label}
            </div>
          </ToolTip>
        ) : (
          <div
            className={classNames(styles.showInTwoLine)}
            style={{ WebkitBoxOrient: 'vertical' }}
          >
            {label}
          </div>
        )}
      </div>
    </div>
  )
}

const StickyHeader = ({ stickyHeight, stickyWidth, headerColumns }) => {
  const baseStyle = {
    height: stickyHeight,
    width: stickyWidth + 7
  }
  const scrollableStyle = {
    left: stickyWidth + 7
  }
  let projects = projectList.map(project => project._id)
  let checked =
    multiSelectChecker(projects, ids) && multiSelectChecker(ids, projects)
  if (projects.length == 0) checked = false
  return (
    <div className={styles.header}>
      <div className={styles.headerBuildingName} style={baseStyle}>
        {isCheckable && (
          <div className={styles.checkboxContainer}>
            <label
              className={classNames(
                styles['__input'],
                styles['__input--checkboxes']
              )}
            >
              <input
                defaultChecked={checked}
                value={true}
                onClick={e => handleSelectItems(e, 'all')}
                className={classNames(checked ? styles['checked'] : '')}
                type="checkbox"
                name="data"
              />
              <span></span>
            </label>
          </div>
        )}
        <div
          className={classNames(
            sort.key === 'displayname' ? styles.sortKey : ''
          )}
          onClick={() => sortFunction('displayname')}
        >
          Name&nbsp;
          {sort && sort.key === 'displayname' && sort.direction === 'ASC' && (
            <i className={classNames('material-icons')}>arrow_upward</i>
          )}
          {sort && sort.key === 'displayname' && sort.direction !== 'ASC' && (
            <i className={classNames('material-icons')}>arrow_downward</i>
          )}
        </div>
      </div>
      <div className={styles.headerScrollable} style={scrollableStyle}>
        {headerColumns.map(({ label, index, ...style }, i) => {
          let column = (columnList && columnList[index]) || []
          return (
            <div
              className={classNames(
                styles.headerScrollableColumn,
                sort && column && sort.key === column.value
                  ? styles.sortKey
                  : ''
              )}
              style={style}
              key={i}
              onClick={() => sortFunction(column.value)}
            >
              {label}&nbsp;
              {column &&
                sort &&
                sort.key === column.value &&
                sort.direction === 'ASC' && (
                  <i className={classNames('material-icons')}>arrow_upward</i>
                )}
              {column &&
                sort &&
                sort.key === column.value &&
                sort.direction !== 'ASC' && (
                  <i className={classNames('material-icons')}>arrow_downward</i>
                )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const StickyFooter = ({ footerColumns }) => {
  const baseStyle = {
    height: 60,
    width: 381
  }
  const scrollableStyle = {
    left: 387
  }
  return (
    <div className={styles.footer}>
      <div
        className={classNames(styles.footerTotal, styles.shadow)}
        style={baseStyle}
      >
        Total
        <p style={{ fontSize: '13px' }}>{projectList.length}</p>
      </div>
      <div className={styles.headerScrollable} style={scrollableStyle}>
        {footerColumns.map(({ index, ...style }, i) => {
          let column = columnList[index]
          let label = '-'
          let total = 0
          if (column && column.total) {
            total =
              (projectList.length &&
                projectList.reduce((sum, project, index) => {
                  let value = _getValueFromObjPerPath.call(
                    project,
                    column.value
                  )
                  if (
                    value === 'Infinity' ||
                    value == null ||
                    value == undefined
                  )
                    value = 0
                  if (value == +value) value = +value
                  if (typeof value === 'number') sum += value
                  return sum
                }, 0)) ||
              0
            if (total === +total) total = formatNumbersWithCommas(total)
            label = total ? total : '-'
          }
          if (column && column.value === 'building.buildingname') {
            let allBuildings =
              (projectList.length &&
                projectList.map(project => project.building)) ||
              []
            let buildingSet = new Set()
            let buildings = []
            for (let item of allBuildings) {
              if (!buildingSet.has(item._id)) {
                buildingSet.add(item._id)
                buildings.push(item)
              }
            }
            label = buildings.length > 0 ? buildings.length : '-'
          }
          return (
            <div className={styles.footerItem} style={style} key={i}>
              {label}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const handleClickOpenBuilding = project => {
  updateTab({ name: 'Projects' }).then(() => {
    updateProjectTab({ name: 'Measures' }).then(() => {
      setCurrentOrganization(project.organization._id).then(() => {
        setBuildingViewMode('portfolio/measure').then(() => {
          push(`/building/${project.building_id}/project/measure`)
        })
      })
    })
  })
}

const StickyHeaderColumns = ({ rows, stickyHeight, stickyWidth }) => {
  const leftSideStyle = {
    top: stickyHeight,
    width: stickyWidth,
    height: `calc(100% - ${stickyHeight}px)`
  }
  return (
    <div className={styles.stickyColumnsContainer} style={leftSideStyle}>
      {rows.map(({ index, ...style }, i) => {
        let project = projectList[index]
        let checked = ids.some(id => id == project._id)
        let firstProject = _.find(projectList, { _id: ids[0] })
        let firstOrg =
          (firstProject &&
            firstProject.organization &&
            firstProject.organization._id) ||
          ''
        let currentOrg =
          (project && project.organization && project.organization._id) || ''
        let isDisabled =
          firstOrg && currentOrg ? firstOrg !== currentOrg : false

        return (
          <div
            key={`projectName${i}`}
            onClick={e => {
              if (!isCheckable) handleClickOpenBuilding(project)
            }}
            className={classNames(
              styles.StickyColumnsRow,
              index % 2 == 0 ? styles.rowEven : styles.rowOdd,
              styles.shadow,
              styles.projectName,
              styles.initalCusor
            )}
            style={style}
          >
            {isCheckable && (
              <div className={styles.checkboxContainer}>
                <label
                  className={classNames(
                    styles['__input'],
                    styles['__input--checkboxes']
                  )}
                >
                  <input
                    defaultChecked={checked}
                    value={true}
                    onClick={e => {
                      if (!isDisabled) handleSelectItems(e, project._id)
                    }}
                    className={classNames(checked ? styles['checked'] : '')}
                    type="checkbox"
                    name="data"
                    disabled={isDisabled}
                  />
                  <span
                    className={classNames(
                      styles.projectCheckSpan,
                      isDisabled ? styles['checkboxDisabled'] : ''
                    )}
                  ></span>
                </label>
              </div>
            )}
            <ToolTip
              content={
                <span className={styles.whiteText}>{project.displayname}</span>
              }
              direction="right"
            >
              <div
                style={{
                  WebkitBoxOrient: 'vertical',
                  maxWidth: `${
                    isCheckable ? 'calc(100% - 40px)' : 'calc(100%)'
                  }`,
                  wordBreak: 'break-all'
                }}
                className={styles.projectDisplayName}
              >
                {project.displayname}
              </div>
            </ToolTip>
          </div>
        )
      })}
    </div>
  )
}

class innerGridElementType extends React.Component {
  render() {
    const { children, ...rest } = this.props
    const { stickyHeight, stickyWidth, columnWidth, rowHeight } = this.context
    const [minRow, maxRow, minColumn, maxColumn] = getRenderedCursor(children) // TODO maybe there is more elegant way to get this

    const headerColumns = headerBuilder(
      minColumn,
      maxColumn,
      columnWidth,
      stickyHeight
    )
    const footerColumns = headerBuilder(minColumn, maxColumn, columnWidth, 60)
    const leftSideRows = columnsBuilder(minRow, maxRow, rowHeight, stickyWidth)
    const containerStyle = {
      ...rest.style,
      width: `${parseFloat(rest.style.width) + stickyWidth}px`,
      height: `${parseFloat(rest.style.height) + stickyHeight}px`,
      pointerEvents: projectLoading ? 'none' : 'auto'
    }
    const containerProps = {
      ...rest,
      style: containerStyle
    }
    const gridDataContainerStyle = {
      top: stickyHeight + 1,
      left: stickyWidth + 7
    }
    return (
      <div {...containerProps}>
        <StickyHeader
          headerColumns={headerColumns}
          stickyHeight={stickyHeight}
          stickyWidth={stickyWidth}
          {...children}
        />
        <StickyHeaderColumns
          rows={leftSideRows}
          stickyHeight={stickyHeight}
          stickyWidth={stickyWidth}
          {...children}
        />
        <div className={styles.dataContainer} style={gridDataContainerStyle}>
          {children}
        </div>
        <StickyFooter
          footerColumns={footerColumns}
          stickyHeight={stickyHeight}
          stickyWidth={stickyWidth + 1}
        />
      </div>
    )
  }
}
innerGridElementType.contextTypes = {
  stickyHeight: PropTypes.number,
  stickyWidth: PropTypes.number,
  columnWidth: PropTypes.func,
  rowHeight: PropTypes.func
}
class StickyGrid extends React.Component {
  getChildContext() {
    const { stickyHeight, stickyWidth, columnWidth, rowHeight } = this.props
    return { stickyHeight, stickyWidth, columnWidth, rowHeight }
  }

  UNSAFE_componentWillUpdate(nextProps, nextState) {
    if (nextProps.columnList != this.props.columnList) {
      if (this.refs.grid) {
        this.refs.grid.resetAfterIndices({
          columnIndex: 0,
          shouldForceUpdate: false
        })
      }
    }
  }

  render() {
    const {
      stickyHeight,
      stickyWidth,
      columnWidth,
      rowHeight,
      children,
      ...rest
    } = this.props
    if (projectList.length == 0) {
      let total = columnList.reduce((sum, column, i) => {
        return sum + getColumnWidth(i)
      }, 0)
      if (columnList.length) total = total / columnList.length
      else total = 180
      return (
        <Grid
          columnWidth={columnWidth}
          rowHeight={rowHeight}
          innerElementType={innerGridElementType}
          estimatedColumnWidth={total}
          ref="grid"
          {...rest}
        >
          {children}
        </Grid>
      )
    }
    return (
      <Grid
        columnWidth={columnWidth}
        rowHeight={rowHeight}
        innerElementType={innerGridElementType}
        ref="grid"
        {...rest}
      >
        {children}
      </Grid>
    )
  }
}

StickyGrid.childContextTypes = {
  stickyHeight: PropTypes.number,
  stickyWidth: PropTypes.number,
  columnWidth: PropTypes.func,
  rowHeight: PropTypes.func
}

function getColumnWidth(index) {
  let label = (columnList && columnList[index] && columnList[index].label) || ''
  let unit = (columnList && columnList[index] && columnList[index].unit) || ''
  label = label ? (unit ? label + '(' + unit + ')' : label) : ''
  if (label) {
    if (
      columnList &&
      columnList[index] &&
      columnList[index].value.includes('buildingUseTypes')
    )
      return 150
    if (
      columnList &&
      columnList[index] &&
      columnList[index].value &&
      columnList[index].value === 'building.buildingname'
    )
      return 250
    if (label.includes('Effective Useful Life')) return 150
    if (label.length >= 20 && length < 30) return 180
    if (label.length >= 30) return 220
  }
  return 110
}

var gparms = {
  rowCount: 0,
  rowHeight: () => 60,
  columnWidth: getColumnWidth,
  stickyHeight: 60,
  stickyWidth: 380
}

class PortfolioProjectTable extends Component {
  state = {
    height: window.innerHeight
  }

  UNSAFE_componentWillMount() {
    const {
      updateOrganization,
      pushFunc,
      sortFunc,
      updateBuildingTab,
      updateProjectViewTab,
      updateBuildingViewMode,
      isCheckable: checkable,
      handleSelectItems: handleSelecteProjectItems,
      selectedItems
    } = this.props
    push = pushFunc
    sortFunction = sortFunc
    setCurrentOrganization = updateOrganization
    updateTab = updateBuildingTab
    updateProjectTab = updateProjectViewTab
    setBuildingViewMode = updateBuildingViewMode
    isCheckable = checkable
    handleSelectItems = handleSelecteProjectItems
    ids = selectedItems || []
  }

  componentDidMount() {
    window.addEventListener('resize', this.resize)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize)
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.isCheckable !== this.props.isCheckable) {
      isCheckable = nextProps.isCheckable
    }
    if (nextProps.selectedItems != this.props.selectedItems) {
      ids = nextProps.selectedItems
    }
  }

  resize = () => {
    this.setState({ height: window.innerHeight })
  }

  render() {
    let { projects, columns, sortOption, loading } = this.props
    columns = columns.filter(column => column.value !== 'displayname')
    projectList = projects
    columnList = columns
    sort = sortOption
    projectLoading = loading
    return (
      <AutoSizer>
        {({ width }) => {
          let maxLength = (this.state.height - 420) / 60
          maxLength = Math.trunc(maxLength)
          if (maxLength < 0) maxLength = 0
          let length =
            projectList.length >= maxLength ? maxLength : projectList.length
          let height = (length + 2) * 60 + 2
          if (navigator.appVersion.indexOf('Win') != -1) height += 17
          const style = {
            marginLeft: '-1px',
            zIndex: 0,
            background: 'rgb(249, 250, 251)',
            cursor: loading ? 'wait' : 'auto'
          }
          gparms.columnCount = columnList.length
          gparms.rowCount = projectList.length
          if (columnList.length)
            return (
              <StickyGrid
                {...gparms}
                height={height}
                width={width}
                style={style}
                columnList={columnList}
              >
                {GridColumn}
              </StickyGrid>
            )
        }}
      </AutoSizer>
    )
  }
}
export default PortfolioProjectTable
