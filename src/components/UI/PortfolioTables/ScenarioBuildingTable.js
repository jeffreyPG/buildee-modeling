import React, { Component } from 'react'
import { VariableSizeGrid as Grid } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import ToolTip from 'components/ToolTip'
import { _getValueFromObjPerPath, formatNumbersWithCommas } from 'utils/Utils'
import {
  getValueArrayFromArray,
  getArrayFromBuildingTimeRange,
  getAverageOfArray
} from 'utils/Portfolio'
import UserFeature from 'utils/Feature/UserFeature'
import portFolioBuildingStyles from '../../Portfolio/PortfolioContainer.scss'
import styles from './PortfolioBuildingTable.scss'
import { multiSelectChecker } from 'utils/Portfolio'
let columnList = []
let buildingList = []
let timeRange = {}
let sort = {}
let push
let sortFunction
let buildingLoading
let ids = []
let setValue
let handleChangeBuildings
let setCurrentOrganization

const handleCheckBuilding = (event, id, building) => {
  event.stopPropagation()
  if (id == 'all') {
    event.stopPropagation()
    let buildings = buildingList.map(building => building._id)
    let allOrganizations = buildingList.map(building => {
      return {
        buildingId: building._id,
        organization: building.organization
      }
    })
    let checked =
      multiSelectChecker(buildings, ids) && multiSelectChecker(ids, buildings)
    handleChangeBuildings(
      setValue,
      checked ? [] : buildings,
      checked ? [] : buildingList,
      checked ? [] : allOrganizations
    )
  } else {
    let checked = ids.some(item => item === id)
    let list = ids
    if (checked) {
      list = list.filter(item => item != id)
      handleChangeBuildings(setValue, list, [], {
        buildingId: building._id,
        organization: building.organization
      })
    } else {
      handleChangeBuildings(
        setValue,
        [...list, id],
        [building],
        [
          {
            buildingId: building._id,
            organization: building.organization
          }
        ]
      )
    }
  }
}

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
          } else {
            string =
              string[0].toUpperCase() + string.substring(1, string.length)
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
      value = Math.trunc(value)
      label = value != 0 ? formatNumbersWithCommas(value) : '-'
    }
    if (column.value === 'buildinguse') {
      label = label[0].toUpperCase() + label.substring(1, label.length)
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

const StickyHeader = ({ stickyHeight, stickyWidth, headerColumns }) => {
  const baseStyle = {
    height: stickyHeight,
    width: stickyWidth + 7
  }
  const scrollableStyle = {
    left: stickyWidth + 7
  }
  let buildings = buildingList.map(building => building._id)
  let checked =
    multiSelectChecker(buildings, ids) && multiSelectChecker(ids, buildings)
  if (buildings.length == 0) checked = false
  return (
    <div className={styles.header}>
      <div className={styles.headerBuildingName} style={baseStyle}>
        {handleChangeBuildings && (
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
                onClick={e => handleCheckBuilding(e, 'all')}
                className={classNames(checked ? styles['checked'] : '')}
                type='checkbox'
                name='data'
              />
              <span></span>
            </label>
          </div>
        )}
        <div
          className={classNames(
            sort.key === 'buildingname' ? styles.sortKey : '',
            styles.checkAll
          )}
          onClick={() => sortFunction('buildingname')}
        >
          Name&nbsp;
          {sort && sort.key === 'buildingname' && sort.direction === 'ASC' && (
            <i className={classNames('material-icons')}>arrow_upward</i>
          )}
          {sort && sort.key === 'buildingname' && sort.direction !== 'ASC' && (
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
    push(`/building/${building._id}/${tabName.toLowerCase()}`)
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
        let building = buildingList[index]
        let checked = ids.some(id => id == building._id)
        return (
          <div
            key={`BuildlingName${i}`}
            className={classNames(
              styles.StickyColumnsRow,
              index % 2 == 0 ? styles.rowEven : styles.rowOdd,
              styles.shadow
            )}
            style={style}
          >
            {handleChangeBuildings && (
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
                    onClick={e =>
                      handleCheckBuilding(e, building._id, building)
                    }
                    className={classNames(checked ? styles['checked'] : '')}
                    type='checkbox'
                    name='data'
                  />
                  <span></span>
                </label>
              </div>
            )}

            <UserFeature name='buildingOverview' key={`BuildlingName${i}`}>
              {({ enabled }) => {
                return (
                  <div
                    className={styles.checkAll}
                    onClick={e => {
                      handleClickOpenBuilding(
                        building,
                        enabled ? 'Overview' : 'Property'
                      )
                    }}
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
                          <i className='material-icons'>domain</i>
                        </span>
                      )}
                    </div>
                    <div
                      data-test='building-name'
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
                        direction='right'
                      >
                        <div
                          className={styles.buildingName}
                          style={{ WebkitBoxOrient: 'vertical' }}
                        >
                          {building.buildingname}
                        </div>
                        <span>{building.location_address}</span>
                      </ToolTip>
                    </div>
                  </div>
                )
              }}
            </UserFeature>
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
          ref='grid'
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
        ref='grid'
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

class ScenarioBuildingTable extends Component {
  UNSAFE_componentWillMount() {
    let {
      setFieldValue,
      changeBuildings,
      buildingIds,
      updateOrganization
    } = this.props
    setValue = setFieldValue
    handleChangeBuildings = changeBuildings
    ids = buildingIds || []
    setCurrentOrganization = updateOrganization
  }

  UNSAFE_componentWillReceiveProps = nextProps => {
    if (nextProps.buildingIds != this.props.buildingIds) {
      ids = nextProps.buildingIds
    }
  }

  render() {
    let {
      buildings,
      columns,
      user,
      sortOption,
      timeRangeOption,
      pushFunc,
      sortFunc,
      loading
    } = this.props
    columns = columns.filter(column => column.value !== 'buildingname')
    if (!user.products || user.products.buildeeNYC !== 'access')
      columns = columns.filter(column => !column.value.includes('nycfields'))
    buildingList = buildings
    columnList = columns
    sort = sortOption
    timeRange = timeRangeOption
    push = pushFunc
    sortFunction = sortFunc
    buildingLoading = loading
    return (
      <AutoSizer>
        {({ width }) => {
          gparms.columnCount = columnList.length
          gparms.rowCount = buildingList.length
          let length = buildingList.length >= 8 ? 8 : buildingList.length
          let height = (length + 2) * 60 + 2
          if (navigator.appVersion.indexOf('Win') != -1) height += 17
          const style = {
            marginLeft: '-1px',
            zIndex: 0,
            background: 'rgb(249, 250, 251)',
            cursor: loading ? 'wait' : 'auto'
          }
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
export default ScenarioBuildingTable
