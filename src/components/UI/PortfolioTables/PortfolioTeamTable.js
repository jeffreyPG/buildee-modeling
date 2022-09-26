import React, { Component } from 'react'
import { VariableSizeGrid as Grid } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import ToolTip from 'components/ToolTip'
import { _getValueFromObjPerPath, formatNumbersWithCommas } from 'utils/Utils'
import {
  formatUnit,
  filterOrganizationsForTeam,
  getOrganizationsForTeamToolTip
} from 'utils/Portfolio'
import styles from './PortfolioBuildingTable.scss'
let columnList = [],
  teamList = [],
  sort = {},
  sortFunction,
  teamLoading,
  filterList = [],
  organizationView = {}

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
    columns.push({
      height: stickyHeight,
      width: columnWidth(i),
      left: left[i],
      index: i,
      label:
        columnList && columnList[i] && columnList[i].label
          ? columnList[i].label
          : '-'
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
  let team = teamList[rowIndex]
  let column = columnList[columnIndex]
  let label = '-'
  if (column) {
    let value = _getValueFromObjPerPath.call(team, column.value)
    if (
      column.value === 'updated' ||
      column.value === 'created' ||
      column.value === 'estimatedstartdate' ||
      column.value === 'estimatedcompletiondate' ||
      column.value === 'actualstartdate' ||
      column.value === 'actualcompletiondate'
    ) {
      if (value === null) value = '-'
      else value = new Date(value).toLocaleDateString('en-US')
    }
    if (column.value === 'organization.name') {
      let organizations = team.organizations || []
      organizations = filterOrganizationsForTeam(
        organizations,
        filterList,
        organizationView
      )
      let names = organizations.map(organization => organization.name)
      value = names.join(', ')
    }
    if (value === 'Infinity' || value == null || value == undefined) value = 0
    if (typeof value === 'number' && value == +value)
      value = formatNumbersWithCommas(value)
    label = value ? formatUnit(column.unit, value) : '-'
    if (typeof value === 'boolean') label = value ? 'Yes' : 'No'
  }

  if (column.value === 'organization.name') {
    let allTeamLabel = ''
    let organizations = team.organizations || []
    organizations = getOrganizationsForTeamToolTip(
      organizations,
      filterList,
      organizationView
    )
    let names = organizations.map(organization => organization.name)
    allTeamLabel = names.join(', ')
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
          <ToolTip
            content={<span className={styles.whiteText}>{allTeamLabel}</span>}
            direction="right"
          >
            <div
              className={classNames(styles.showInTwoLine)}
              style={{ WebkitBoxOrient: 'vertical' }}
            >
              {label}
            </div>
          </ToolTip>
        </div>
      </div>
    )
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
          className={classNames(styles.showInTwoLine)}
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
  return (
    <div className={styles.header}>
      <div
        className={styles.headerBuildingName}
        style={baseStyle}
        onClick={() => sortFunction('name')}
      >
        <div className={classNames(sort.key === 'name' ? styles.sortKey : '')}>
          Name&nbsp;
          {sort && sort.key === 'name' && sort.direction === 'ASC' && (
            <i className={classNames('material-icons')}>arrow_upward</i>
          )}
          {sort && sort.key === 'name' && sort.direction !== 'ASC' && (
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
        <p style={{ fontSize: '13px' }}>{teamList.length}</p>
      </div>
      <div className={styles.headerScrollable} style={scrollableStyle}>
        {footerColumns.map(({ index, ...style }, i) => {
          let column = columnList[index]
          let label = '-'
          let total = 0
          if (column && column.total) {
            total =
              (teamList.length &&
                teamList.reduce((sum, team, index) => {
                  let value = _getValueFromObjPerPath.call(team, column.value)
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
            label = total ? formatUnit(column.unit, total) : '-'
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

const StickyHeaderColumns = ({ rows, stickyHeight, stickyWidth }) => {
  const leftSideStyle = {
    top: stickyHeight,
    width: stickyWidth,
    height: `calc(100% - ${stickyHeight}px)`
  }
  return (
    <div className={styles.stickyColumnsContainer} style={leftSideStyle}>
      {rows.map(({ index, ...style }, i) => {
        let team = teamList[index]
        return (
          <div
            key={`teamName${i}`}
            className={classNames(
              styles.StickyColumnsRow,
              index % 2 == 0 ? styles.rowEven : styles.rowOdd,
              styles.shadow,
              styles.teamName
            )}
            style={style}
          >
            <ToolTip
              content={<span className={styles.whiteText}>{team.name}</span>}
              direction="right"
            >
              <div
                style={{ WebkitBoxOrient: 'vertical' }}
                className={styles.teamNameContainer}
              >
                {team.name}
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
      pointerEvents: teamLoading ? 'none' : 'auto'
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
    if (teamList.length == 0) {
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
  if (columnList && columnList[index] && columnList[index].label) {
    if (columnList[index].label.length > 20) return 150
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

class PortfolioTeamTable extends Component {
  state = {
    height: window.innerHeight
  }

  UNSAFE_componentWillMount() {
    const { sortFunc } = this.props
    sortFunction = sortFunc
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
    let { teams, columns, sortOption, loading } = this.props
    columns = columns.filter(column => column.value !== 'name')
    teamList = teams
    columnList = columns
    sort = sortOption
    teamLoading = loading
    filterList = this.props.filterList || []
    organizationView = this.props.organizationView || {}

    return (
      <AutoSizer>
        {({ width }) => {
          let maxLength = (this.state.height - 480) / 60
          maxLength = Math.trunc(maxLength)
          if (maxLength < 0) maxLength = 0
          let length =
            teamList.length >= maxLength ? maxLength : teamList.length
          let height = (length + 2) * 60 + 2
          if (navigator.appVersion.indexOf('Win') != -1) height += 17
          const style = {
            marginLeft: '-1px',
            zIndex: 0,
            background: 'rgb(249, 250, 251)',
            cursor: loading ? 'wait' : 'auto'
          }
          gparms.columnCount = columnList.length
          gparms.rowCount = teamList.length
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
export default PortfolioTeamTable
