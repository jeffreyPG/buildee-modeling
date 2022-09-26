import React, { Component } from 'react'
import _ from 'lodash'
import { VariableSizeGrid as Grid } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import {
  _getValueFromObjPerPath,
  formatNumbersWithCommas,
  findBuildingUseName,
  truncateText
} from 'utils/Utils'
import {
  getValueArrayFromArray,
  getArrayFromBuildingTimeRange,
  getAverageOfArray
} from 'utils/Portfolio'

import ToolTip from 'components/ToolTip'
import UserFeature from 'utils/Feature/UserFeature'
import portFolioBuildingStyles from '../../Portfolio/PortfolioContainer.scss'
import styles from './PortfolioBuildingTable.scss'
let columnList = []
let buildingList = []
let timeRange = {}
let sort = {}
let push
let sortFunction
let buildingLoading
let setCurrentOrganization
let setBuildingTab
let setBuildingViewMode

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

const multiSelectChecker = (list = []) => list.every(item => item.isInGroup)

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
  let building = buildingList[rowIndex]
  let column = columnList[columnIndex]
  let label = '-'
  if (column) {
    let value = _getValueFromObjPerPath.call(building, column.value)
    if (column.value === 'updated' || column.value === 'created') {
      if (value === null) value = '-'
      else value = new Date(value).toLocaleDateString('en-US')
    } else if (column.value === 'projects')
      value = (building.projects && building.projects.length) || 0
    if (
      typeof value === 'number' &&
      value == +value &&
      column.value !== 'buildyear' &&
      column.value !== 'location_zipcode'
    )
      value = formatNumbersWithCommas(value)
    label = value ? value : '-'
    if (typeof value === 'boolean') label = value ? 'Yes' : 'No'
    if (column.value.includes('buildingUseTypes')) {
      const buildingUseTypes = _getValueFromObjPerPath.call(
        building,
        'buildingUseTypes'
      )
      value = getValueArrayFromArray(
        buildingUseTypes,
        column.value.substring(
          column.value.indexOf('buildingUseTypes') +
            'buildingUseTypes'.length +
            1
        )
      )
      value = value
        .map(item => {
          let string = item
          if (typeof string === 'number') {
            string = formatNumbersWithCommas(string)
            string = string ? string : ''
          } else if (column.value !== 'buildingUseTypes.use') {
            string =
              string[0].toUpperCase() + string.substring(1, string.length)
          } else {
            string = findBuildingUseName(string)
            if (string == '-') return ''
          }
          return string
        })
        .filter(item => item)
      if (column.value === 'buildingUseTypes.use') {
        let buildingUse = _getValueFromObjPerPath.call(building, 'buildinguse')
        if (!buildingUse && buildingUse.length) {
          buildingUse =
            buildingUse[0].toUpperCase() +
            buildingUse.substring(1, buildingUse.length)
        }
        value = value.filter(item => item != buildingUse)
      }
      label = value.join(', ')
      if (!label.length) label = '-'
    } else if (column.value.includes('monthlyUtilities')) {
      let monthlyUtilities =
        _getValueFromObjPerPath.call(building, 'monthlyUtilities') || []
      monthlyUtilities =
        getArrayFromBuildingTimeRange(monthlyUtilities, timeRange) || []
      value = getValueArrayFromArray(
        monthlyUtilities,
        column.value.substring(
          column.value.indexOf('monthlyUtilities') +
            'monthlyUtilities'.length +
            1
        )
      )
      value = getAverageOfArray(value)
      if (column.unit === 'MMBTU') value = (value * 1.0) / 1000
      value = _.round(value, 2)
      label = value != 0 ? formatNumbersWithCommas(value) : '-'
    } else if (column.value === 'buildingPmScores.score') {
      let buildingPmScores =
        _getValueFromObjPerPath.call(building, 'buildingPmScores') || []
      buildingPmScores =
        getArrayFromBuildingTimeRange(buildingPmScores, timeRange) || []
      value = getValueArrayFromArray(
        buildingPmScores,
        column.value.substring(
          column.value.indexOf('buildingPmScores') +
            'buildingPmScores'.length +
            1
        )
      )
      value = value.filter(item => !!item && !isNaN(item)).map(item => +item)
      value = getAverageOfArray(value)
      value = _.round(value, 2)
      label = value != 0 ? formatNumbersWithCommas(value) : '-'
    }
    if (column.value === 'buildinguse') {
      label = findBuildingUseName(label)
    }
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
        <div
          className={styles.showInTwoLine}
          style={{ WebkitBoxOrient: 'vertical' }}
        >
          {label}
        </div>
      </div>
    </div>
  )
}

const StickyHeader = ({
  stickyHeight,
  stickyWidth,
  headerColumns,
  editBuildingGroup,
  checkedAll,
  onGroupSelectAll
}) => {
  const baseStyle = {
    height: stickyHeight,
    width: stickyWidth + 7
  }
  const scrollableStyle = {
    left: stickyWidth + 7
  }
  return (
    <div className={styles.header}>
      <div className={styles.headerBuildingName} style={baseStyle}>
        {editBuildingGroup && (
          <div className={styles.checkboxContainer}>
            <label
              className={classNames(
                styles['__input'],
                styles['__input--checkboxes']
              )}
            >
              <input
                defaultChecked={checkedAll}
                value={checkedAll}
                onClick={onGroupSelectAll}
                className={classNames(checkedAll ? styles['checked'] : '')}
                type="checkbox"
                name="data"
              />
              <span></span>
            </label>
          </div>
        )}
        <div onClick={() => sortFunction('buildingname')}>
          <div
            className={classNames(
              sort.key === 'buildingname' ? styles.sortKey : ''
            )}
          >
            Name&nbsp;
            {sort &&
              sort.key === 'buildingname' &&
              sort.direction === 'ASC' && (
                <i className={classNames('material-icons')}>arrow_upward</i>
              )}
            {sort &&
              sort.key === 'buildingname' &&
              sort.direction !== 'ASC' && (
                <i className={classNames('material-icons')}>arrow_downward</i>
              )}
          </div>
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
        <p style={{ fontSize: '13px' }}>{buildingList.length}</p>
      </div>
      <div className={styles.headerScrollable} style={scrollableStyle}>
        {footerColumns.map(({ index, ...style }, i) => {
          let column = columnList[index]
          let label = '-'
          let total = 0
          if (column && column.total) {
            total =
              (buildingList.length &&
                buildingList.reduce((sum, building, index) => {
                  let value = _getValueFromObjPerPath.call(
                    building,
                    column.value
                  )
                  if (column.value === 'projects')
                    value = (building.projects && building.projects.length) || 0
                  else if (column.value.includes('monthlyUtilities')) {
                    let monthlyUtilities = _getValueFromObjPerPath.call(
                      building,
                      'monthlyUtilities'
                    )
                    monthlyUtilities = getArrayFromBuildingTimeRange(
                      monthlyUtilities,
                      timeRange
                    )
                    value = getValueArrayFromArray(
                      monthlyUtilities,
                      column.value.substring(
                        column.value.indexOf('monthlyUtilities') +
                          'monthlyUtilities'.length +
                          1
                      )
                    )
                    value = +getAverageOfArray(value)
                  }
                  if (typeof value === 'number') sum += value
                  return sum
                }, 0)) ||
              0
            if (total === +total) {
              if (column.unit === 'MMBTU') total = (total * 1.0) / 1000
              total = Math.trunc(total)
              total = _.round(total, 2)
              total = formatNumbersWithCommas(total)
            }
            if (column.value === 'buildyear') total = 0
            label = total ? total : '-'
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

const handleClickOpenBuilding = (building, tabName) => {
  setCurrentOrganization(building.organization._id).then(() => {
    setBuildingTab({ name: tabName }).then(() => {
      setBuildingViewMode('portfolio/building').then(() => {
        push(`/building/${building._id}/${tabName.toLowerCase()}`)
      })
    })
  })
}

const StickyHeaderColumns = ({
  rows,
  stickyHeight,
  stickyWidth,
  editBuildingGroup,
  onGroupSelected
}) => {
  const leftSideStyle = {
    top: stickyHeight,
    width: stickyWidth,
    height: `calc(100% - ${stickyHeight}px)`
  }
  return (
    <div className={styles.stickyColumnsContainer} style={leftSideStyle}>
      {rows.map(({ index, ...style }, i) => {
        let building = buildingList[index]

        return (
          <UserFeature name="buildingOverview" key={`BuildlingName${i}`}>
            {({ enabled }) => {
              return (
                <div
                  className={classNames(
                    styles.StickyColumnsRow,
                    index % 2 == 0 ? styles.rowEven : styles.rowOdd,
                    styles.shadow
                  )}
                  style={style}
                >
                  {editBuildingGroup && (
                    <div className={styles.checkboxContainer}>
                      <label
                        className={classNames(
                          styles['__input'],
                          styles['__input--checkboxes']
                        )}
                      >
                        <input
                          value={building.isInGroup}
                          className={
                            building.isInGroup
                              ? classNames(styles['checked'])
                              : ''
                          }
                          type="checkbox"
                          name="data"
                          onClick={onGroupSelected(building._id)}
                        />
                        <span></span>
                      </label>
                    </div>
                  )}
                  <div
                    onClick={e =>
                      handleClickOpenBuilding(
                        building,
                        enabled ? 'Overview' : 'Property'
                      )
                    }
                    className={classNames(styles.rowContainer)}
                  >
                    <div
                      className={classNames(
                        portFolioBuildingStyles.buildingListImage
                      )}
                    >
                      {building.buildingimage ? (
                        <img src={building.buildingimage} />
                      ) : (
                        <span>
                          <i className="material-icons">domain</i>
                        </span>
                      )}
                    </div>
                    <div
                      data-test="building-name"
                      className={classNames(
                        portFolioBuildingStyles.buildingListName,
                        portFolioBuildingStyles.buildingListInfo
                      )}
                    >
                      <ToolTip
                        content={
                          <span className={styles.whiteText}>
                            {building.buildingname}
                          </span>
                        }
                        direction="right"
                      >
                        <div>
                          <div
                            className={styles.buildingName}
                            style={{ WebkitBoxOrient: 'vertical' }}
                          >
                            {truncateText(building.buildingname, 30)}
                          </div>
                          <span>{building.location_address}</span>
                        </div>
                      </ToolTip>
                    </div>
                  </div>
                </div>
              )
            }}
          </UserFeature>
        )
      })}
    </div>
  )
}

class innerGridElementType extends React.Component {
  render() {
    const { children, ...rest } = this.props
    const {
      stickyHeight,
      stickyWidth,
      columnWidth,
      rowHeight,
      editBuildingGroup,
      onGroupSelected,
      onGroupSelectAll
    } = this.context
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
      pointerEvents: buildingLoading ? 'none' : 'auto'
    }
    const containerProps = {
      ...rest,
      style: containerStyle
    }
    const gridDataContainerStyle = {
      top: stickyHeight + 1,
      left: stickyWidth + 7
    }
    let checkedAll = editBuildingGroup && multiSelectChecker(buildingList)
    return (
      <div {...containerProps}>
        <StickyHeader
          headerColumns={headerColumns}
          stickyHeight={stickyHeight}
          stickyWidth={stickyWidth}
          editBuildingGroup={editBuildingGroup}
          checkedAll={checkedAll}
          onGroupSelectAll={onGroupSelectAll}
          {...children}
        />
        <StickyHeaderColumns
          rows={leftSideRows}
          stickyHeight={stickyHeight}
          stickyWidth={stickyWidth}
          editBuildingGroup={editBuildingGroup}
          onGroupSelected={onGroupSelected}
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
  rowHeight: PropTypes.func,
  editBuildingGroup: PropTypes.bool,
  onGroupSelected: PropTypes.func,
  onGroupSelectAll: PropTypes.func
}
class StickyGrid extends React.Component {
  getChildContext() {
    const {
      stickyHeight,
      stickyWidth,
      columnWidth,
      rowHeight,
      editBuildingGroup,
      onGroupSelected,
      onGroupSelectAll
    } = this.props
    return {
      stickyHeight,
      stickyWidth,
      columnWidth,
      rowHeight,
      editBuildingGroup,
      onGroupSelected,
      onGroupSelectAll
    }
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
    if (buildingList.length == 0) {
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
  rowHeight: PropTypes.func,
  editBuildingGroup: PropTypes.bool,
  onGroupSelected: PropTypes.func,
  onGroupSelectAll: PropTypes.func
}

function getColumnWidth(index) {
  let label = (columnList && columnList[index] && columnList[index].label) || ''
  let unit = (columnList && columnList[index] && columnList[index].unit) || ''
  label = label ? (unit ? label + '(' + unit + ')' : label) : ''
  if (label) {
    if (label.length >= 20 && length < 30) return 180
    if (label.length >= 30) return 220
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
      columnList[index].value === 'squarefeet'
    )
      return 170
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

class PortfolioBuildingTable extends Component {
  state = {
    height: window.innerHeight
  }

  UNSAFE_componentWillMount() {
    const {
      updateOrganization,
      pushFunc,
      sortFunc,
      updateBuildingTab,
      updateBuildingViewMode
    } = this.props
    push = pushFunc
    sortFunction = sortFunc
    setCurrentOrganization = updateOrganization
    setBuildingTab = updateBuildingTab
    setBuildingViewMode = updateBuildingViewMode
  }

  componentDidMount() {
    window.addEventListener('resize', this.resize)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize)
  }

  resize = () => {
    this.setState({ height: window.innerHeight })
  }

  render() {
    let {
      buildings,
      columns,
      user,
      sortOption,
      timeRangeOption,
      loading,
      editBuildingGroup,
      onGroupSelected,
      onGroupSelectAll
    } = this.props
    columns = columns.filter(column => column.value !== 'buildingname')
    if (!user.products || user.products.buildeeNYC !== 'access')
      columns = columns.filter(column => !column.value.includes('nycfields'))
    buildingList = buildings
    columnList = columns
    sort = sortOption
    timeRange = timeRangeOption
    buildingLoading = loading
    return (
      <AutoSizer>
        {({ width }) => {
          let maxLength = (this.state.height - 420) / 60
          maxLength = Math.trunc(maxLength)
          if (maxLength < 0) maxLength = 0
          let length =
            buildingList.length >= maxLength ? maxLength : buildingList.length
          let height = (length + 2) * 60 + 2
          if (navigator.appVersion.indexOf('Win') != -1) height += 17
          const style = {
            marginLeft: '-1px',
            zIndex: 0,
            background: 'rgb(249, 250, 251)',
            cursor: loading ? 'wait' : 'auto'
          }
          gparms.columnCount = columnList.length
          gparms.rowCount = buildingList.length
          if (columnList.length)
            return (
              <StickyGrid
                {...gparms}
                height={height}
                width={width}
                style={style}
                columnList={columnList}
                editBuildingGroup={editBuildingGroup}
                onGroupSelected={onGroupSelected}
                onGroupSelectAll={onGroupSelectAll}
              >
                {GridColumn}
              </StickyGrid>
            )
        }}
      </AutoSizer>
    )
  }
}
export default PortfolioBuildingTable
