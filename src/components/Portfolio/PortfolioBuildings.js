import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import styles from './PortfolioBuildings.scss'
import PortfolioBuildingList from './PortfolioBuildingList'

class PortfolioBuildings extends Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    push: PropTypes.func.isRequired,
    timeRange: PropTypes.object.isRequired,
    handleTimeRangeChange: PropTypes.func.isRequired,
    reloadFlag: PropTypes.bool,
    hardReload: PropTypes.func.isRequired
  }

  state = {
    selectData: 'All',
    dataList: [
      {
        value: 'All',
        title: 'All building data',
        text:
          'Cras quis nulla commodo, aliquam lectus sed, blandit angue. Cras ullamcorper bibendum bibendum. Duis tincidunt urna non.'
      },
      {
        value: '1',
        title: 'Another report',
        text:
          'Cras quis nulla commodo, aliquam lectus sed, blandit angue. Cras ullamcorper bibendum bibendum. Duis tincidunt urna non.'
      },
      {
        value: '2',
        title: 'Another report',
        text:
          'Cras quis nulla commodo, aliquam lectus sed, blandit angue. Cras ullamcorper bibendum bibendum. Duis tincidunt urna non.'
      },
      {
        value: '3',
        title: 'Another report',
        text:
          'Cras quis nulla commodo, aliquam lectus sed, blandit angue. Cras ullamcorper bibendum bibendum. Duis tincidunt urna non.'
      },
      {
        value: '4',
        title: 'Another report',
        text:
          'Cras quis nulla commodo, aliquam lectus sed, blandit angue. Cras ullamcorper bibendum bibendum. Duis tincidunt urna non.'
      },
      {
        value: '5',
        title: 'Another report',
        text:
          'Cras quis nulla commodo, aliquam lectus sed, blandit angue. Cras ullamcorper bibendum bibendum. Duis tincidunt urna non.'
      },
      {
        value: '6',
        title: 'Another report',
        text:
          'Cras quis nulla commodo, aliquam lectus sed, blandit angue. Cras ullamcorper bibendum bibendum. Duis tincidunt urna non.'
      },
      {
        value: '7',
        title: 'Another report',
        text:
          'Cras quis nulla commodo, aliquam lectus sed, blandit angue. Cras ullamcorper bibendum bibendum. Duis tincidunt urna non.'
      },
      {
        value: '8',
        title: 'Another report',
        text:
          'Cras quis nulla commodo, aliquam lectus sed, blandit angue. Cras ullamcorper bibendum bibendum. Duis tincidunt urna non.'
      }
    ]
  }

  handleSelectReport = item => {
    this.setState({ selectData: item })
  }

  render() {
    const { selectData, dataList } = this.state
    return (
      <div>
        {selectData === null ? (
          <div className={styles.reportContainer}>
            {dataList.map((item, index) => (
              <div
                key={`report-${index}`}
                onClick={() => this.handleSelectReport(item)}
                className={styles.reportContainerItem}
              >
                <div className={styles.title}>{item.title}</div>
                <div className={styles.description}>{item.text}</div>
              </div>
            ))}
          </div>
        ) : (
          <PortfolioBuildingList
            handleTimeRangeChange={this.props.handleTimeRangeChange}
            timeRange={this.props.timeRange}
            routeOrganizationId={this.props.routeOrganizationId}
            hardReload={this.props.hardReload}
          />
        )}
      </div>
    )
  }
}

const mapDispatchToProps = {
  push
}

const mapStateToProps = state => ({
  user: state.login.user || {}
})

export default connect(mapStateToProps, mapDispatchToProps)(PortfolioBuildings)
