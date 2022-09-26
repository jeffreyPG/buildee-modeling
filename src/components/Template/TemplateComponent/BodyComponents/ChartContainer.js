import React, { Component } from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames'
import styles from '../Options/TemplateOptions.scss'
import { Chart } from './Chart'
import { getChartReports } from 'routes/Template/modules/template'

const layoutOptions = [
  {
    value: 'One Column',
    label: 'One Column'
  },
  {
    value: 'Two Columns',
    label: 'Two Columns'
  }
]

class ChartContainer extends Component {
  state = {
    layoutOption: ''
  }

  componentDidUpdate = prevProps => {
    if (prevProps !== this.props) {
      const index = this.props.index
      let body = JSON.parse(JSON.stringify(this.props.body))
      let widget = body[index]
      let layoutOption = widget.layoutOption || 'One Column'
      if (this.state.layoutOption !== layoutOption) {
        this.setState({ layoutOption })
        if (!widget.layoutOption) {
          widget = {
            ...widget,
            layoutOption,
            options: [
              {
                fields: [],
                metaData: {
                  yearOption: 'SetOnExport'
                }
              }
            ]
          }
          body[index] = widget
          this.props.handleUpdateTemplateState(body)
        }
      }
    }
  }

  handleClickLayoutOption = e => {
    const value = e.target.value
    const { index } = this.props
    let body = JSON.parse(JSON.stringify(this.props.body))
    let widget = body[index]
    widget = {
      ...widget,
      layoutOption: value,
      options: [
        {
          fields: [],
          metaData: {
            yearOption: 'SetOnExport'
          }
        },
        {
          fields: [],
          metaData: {
            yearOption: 'SetOnExport'
          }
        }
      ]
    }
    body[index] = widget
    this.setState({ layoutOption: value })
    this.props.handleUpdateTemplateState(body)
  }

  renderLayoutOption = () => {
    const { layoutOption } = this.state
    return (
      <div className={styles.selectContainer}>
        <select
          onChange={this.handleClickLayoutOption}
          value={layoutOption}
          name="Layout"
          id="Layout"
        >
          {layoutOptions.map((item, i) => {
            return (
              <option key={`item_${item.label}`} value={item.value}>
                {item.label}
              </option>
            )
          })}
        </select>
      </div>
    )
  }

  render() {
    let { layoutOption } = this.state
    layoutOption = layoutOption || 'One Column'
    return (
      <div>
        <h3>Layout</h3>
        <div>{this.renderLayoutOption()}</div>
        <br />
        {layoutOption === 'One Column' && (
          <div
            className={classNames(
              styles['editor-body__container'],
              styles.chartContainer
            )}
          >
            <Chart
              index={this.props.index}
              layoutOption={layoutOption}
              layoutIndex={0}
              handleUpdateTemplateState={this.props.handleUpdateTemplateState}
              getChartReports={this.props.getChartReports}
              views={this.props.views}
              body={this.props.body}
            />
          </div>
        )}
        {layoutOption === 'Two Columns' && (
          <div className={classNames(styles['editor-header__inner'])}>
            <div
              className={classNames(
                styles['editor-body__container'],
                styles.chartContainer,
                styles.twoColumnChart
              )}
            >
              <Chart
                index={this.props.index}
                layoutOption={layoutOption}
                layoutIndex={0}
                handleUpdateTemplateState={this.props.handleUpdateTemplateState}
                getChartReports={this.props.getChartReports}
                views={this.props.views}
                body={this.props.body}
              />
            </div>
            <div
              className={classNames(
                styles['editor-body__container'],
                styles.chartContainer,
                styles.twoColumnChart
              )}
            >
              <Chart
                index={this.props.index}
                layoutOption={layoutOption}
                layoutIndex={1}
                handleUpdateTemplateState={this.props.handleUpdateTemplateState}
                getChartReports={this.props.getChartReports}
                views={this.props.views}
                body={this.props.body}
              />
            </div>
          </div>
        )}
      </div>
    )
  }
}

const mapDispatchToProps = { getChartReports }

const mapStateToProps = state => ({
  body: state.template.templateViewBody || [],
  views: state.template.views || []
})

const withConnect = connect(mapStateToProps, mapDispatchToProps)

export default withConnect(ChartContainer)
