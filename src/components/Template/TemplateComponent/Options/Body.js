import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './TemplateOptions.scss'
import {
  Data,
  Table,
  DataList,
  EquipmentDocument,
  Chart
} from '../BodyComponents'
import {
  bodyTemplate,
  templateUpdateError
} from 'routes/Template/modules/template'
import {
  formatProComponentNames,
  formatBenchmarkFields,
  formatUtilityFields,
  formatLocationFields,
  formatOverviewFields,
  formatEndUseBreakDownFields,
  formatCamelCaseNotation
} from 'utils/Utils'
import { find } from 'lodash'
import ChartContainer from '../BodyComponents/ChartContainer'
import UserFeature from 'utils/Feature/UserFeature'

export class Body extends Component {
  static propTypes = {
    closeAllOptions: PropTypes.bool.isRequired,
    bodyTemplate: PropTypes.func.isRequired,
    templateUpdateError: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    removeWidget: PropTypes.func.isRequired,
    setCloseAllOptions: PropTypes.func.isRequired,
    body: PropTypes.array,
    widget: PropTypes.object.isRequired,
    getChartReports: PropTypes.func,
    views: PropTypes.array
  }

  state = {
    optionsVisible: false,
    deleteToggleOpen: false,
    preview: {}
  }

  componentDidUpdate = prevProps => {
    const { index, body } = this.props
    let fields
    let mField
    let temp
    if (prevProps !== this.props && body && body[index]) {
      if (body[index].type === 'equipment') return
      if (body[index].type === 'chart') {
        let updatedPreview = { ...this.state.preview }
        if (body[index].target) {
          updatedPreview.target = body[index].target
        }
        let options = body[index].options || []
        let fields1 = (options[0] && options[0].fields) || []
        let fields2 = (options[1] && options[1].fields) || []
        let fields = [...fields1, ...fields2]

        if (fields && fields.length > 0) {
          if (
            fields[0].substring(0, fields[0].indexOf('.')) == 'chart' ||
            fields[0].substring(0, fields[0].indexOf('.')) == 'year'
          ) {
            updatedPreview.mainField = ''
          } else {
            temp = fields[0].substring(0, fields[0].indexOf('.'))
            mField = formatCamelCaseNotation(temp)
            fields = fields
            fields.map((each, i) => {
              let tem = formatCamelCaseNotation(
                each.substring(0, each.indexOf('.'))
              )
              if (!mField.includes(tem)) {
                mField = mField + `,${tem}`
              }
            })
            updatedPreview.mainField = mField
          }
          updatedPreview.fields = fields
          updatedPreview.customLabels = []
        } else {
          updatedPreview.mainField = ''
          updatedPreview.fields = []
          updatedPreview.customLabels = []
        }
      } else {
        let updatedPreview = { ...this.state.preview }
        if (body[index].target) {
          updatedPreview.target = body[index].target
        }
        if (
          body[index] &&
          body[index].fields &&
          body[index].fields.length > 0
        ) {
          if (
            body[index].fields[0].substring(
              0,
              body[index].fields[0].indexOf('.')
            ) == 'chart' ||
            body[index].fields[0].substring(
              0,
              body[index].fields[0].indexOf('.')
            ) == 'year'
          ) {
            updatedPreview.mainField = ''
          } else {
            temp = body[index].fields[0].substring(
              0,
              body[index].fields[0].indexOf('.')
            )
            mField = formatCamelCaseNotation(temp)
            fields = body[index].fields
            fields.map((each, i) => {
              let tem = formatCamelCaseNotation(
                each.substring(0, each.indexOf('.'))
              )
              if (!mField.includes(tem)) {
                mField = mField + `,${tem}`
              }
            })
            updatedPreview.mainField = mField
          }
          updatedPreview.fields = body[index].fields
          updatedPreview.customLabels = body[index].customLabels || []
        } else {
          updatedPreview.mainField = ''
          updatedPreview.fields = []
          updatedPreview.customLabels = body[index].customLabels || []
        }
        if (body[index].metaData) updatedPreview.metaData = body[index].metaData
        this.setState({ preview: updatedPreview })
      }
    }
  }

  componentDidMount = () => {
    const preview = this.handleInitialPreview()
    this.setState({ preview })
  }

  componentWillUnmount = () => {
    this.props.setCloseAllOptions(true)
  }

  handleInitialPreview = () => {
    const { body, index } = this.props
    const card = body[index]
    if (card && ['equipment', 'equipmentBlock'].includes(card.target)) {
      return this.handleEquipmentPreview(card)
    } else if (card && ['charts'].includes(card.target)) {
      return this.handleChartPreview(card)
    } else {
      return {
        target: (card && card.target) || '',
        label: '',
        mainField: '',
        fields: (card && card.fields) || [],
        customLabels: (card && card.customLabels) || [],
        formatType: ''
      }
    }
  }

  handleEquipmentPreview = card => {
    const equipmentConfig = card.equipmentConfig || {}
    const preview = equipmentConfig && equipmentConfig.preview
    const label =
      preview &&
      `Equipment - ${[preview.category, preview.application, preview.technology]
        .filter(displayName => displayName && displayName.length)
        .join(' / ')}`
    const defaultLabel =
      (card.applicationType && `Equipment - ${card.applicationType}`) ||
      'Equipment'
    return {
      ...this.state.preview,
      label: label || defaultLabel,
      fields: Array.from(equipmentConfig.fields || []),
      configs: Array.from(equipmentConfig.configs || []),
      order: Array.from(equipmentConfig.order || []),
      formatType: equipmentConfig.format || '',
      target: card.target || ''
    }
  }

  handleChartPreview = card => {
    const label = `Chart`
    const defaultLabel = 'Chart'
    let options = card.options || {}
    return {
      ...this.state.preview,
      label: label || defaultLabel,
      mainField: '',
      fields: [
        ...((options[0] && options[0].fields) || []),
        ...((options[1] && options[1].fields) || [])
      ],
      target: card.target || ''
    }
  }

  handleClick = () => {
    if (this.node !== null) {
      this.props.setCloseAllOptions(false)
      if (!this.state.optionsVisible) {
        document.addEventListener('click', this.handleOutsideClick, false)
      } else {
        document.removeEventListener('click', this.handleOutsideClick, false)
      }
      this.setState(prevState => ({
        optionsVisible: !prevState.optionsVisible
      }))
    }
  }

  handleOutsideClick = e => {
    const icon = e.target.closest('i')
    if (
      (this.node !== null && this.node.contains(e.target)) ||
      icon === e.target
    ) {
      return
    }
    this.handleClick()
  }

  handleRemoveToggle = toggle => {
    if (toggle) {
      this.setState({ deleteToggleOpen: !this.state.deleteToggleOpen })
    } else {
      this.setState({ deleteToggleOpen: false })
    }
  }

  handleClickRemoveWidget = () => {
    this.setState({ deleteToggleOpen: false })
    let body = JSON.parse(JSON.stringify(this.props.body))
    body.splice(this.props.index, 1)
    this.props.bodyTemplate(body)
    this.props.removeWidget(this.props.index)
    this.props.templateUpdateError()
  }

  handleClickSelectTarget = event => {
    let body = JSON.parse(JSON.stringify(this.props.body))
    body[this.props.index].target = event.target.value
    body[this.props.index].fields = []
    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }

  handleEquipmentUpdated = body => {
    const { index } = this.props
    const card = body[index]
    this.setState({
      preview: this.handleEquipmentPreview(card)
    })
    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }

  handleChartUpdated = body => {
    const { index } = this.props
    const card = body[index]
    this.setState({
      preview: this.handleChartPreview(card)
    })
    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }

  renderDynamicIconClass = () => {
    return this.props.widget.icon
  }

  renderControlOptions = () => {
    return (
      <div
        className={classNames(
          styles['content-options'],
          (!this.props.closeAllOptions && this.state.optionsVisible) ||
            this.state.deleteToggleOpen
            ? styles['optionsOpen']
            : ''
        )}
      >
        <i className={classNames('material-icons', styles['move'])}>gamepad</i>
        <i
          onClick={() => {
            this.handleClick()
          }}
          data-test={`editor-body-edit-${this.props.widget.text.toLowerCase()}-icon`}
          className={classNames(
            'material-icons',
            !this.props.closeAllOptions && this.state.optionsVisible
              ? styles['editing']
              : ''
          )}
        >
          edit
        </i>
        <i
          onClick={() => {
            this.handleRemoveToggle(true)
          }}
          className="material-icons"
        >
          delete
        </i>
        {this.state.deleteToggleOpen && (
          <div className={styles['content-options__delete']}>
            <p>Delete this widget?</p>
            <div className={styles['content-options__delete-confirm']}>
              <div
                className={classNames(styles['content-options__btn-delete'])}
                onClick={() => this.handleClickRemoveWidget()}
              >
                Yes
              </div>
              <div
                className={classNames(styles['content-options__btn-cancel'])}
                onClick={() => this.handleRemoveToggle(false)}
              >
                No
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  renderTargetOptions = () => {
    const { widget, index, body } = this.props
    let fieldList = body[index].fields || []
    let configList = body[index].configs || []
    switch (widget.text) {
      case 'Data':
        return (
          <div className={styles['editor-body__select']}>
            <span>Choose your data source:</span>
            <div className={styles.selectContainer}>
              <select
                value={body[index].target ? body[index].target : 'select'}
                onChange={this.handleClickSelectTarget}
              >
                <option disabled value="select">
                  Select Data
                </option>
                <option value="overview">Overview</option>
                <option value="building">Property</option>
                <option value="user">User</option>
                <option value="utility">Utilities</option>
                <option value="endusebreakdown">End Use Breakdown</option>
              </select>
            </div>
          </div>
        )
      case 'Table':
        return (
          <div className={styles['editor-body__select']}>
            <span>Choose your data source:</span>
            <div className={styles.selectContainer}>
              <select
                value={body[index].target ? body[index].target : 'select'}
                onChange={this.handleClickSelectTarget}
              >
                <option disabled value="select">
                  Select Data
                </option>
                <option value="overview">Overview</option>
                <option value="endusebreakdown">End Use Breakdown</option>
                <option value="utility">Utilities</option>
                <option value="operation">Operation</option>
                <UserFeature name="buildingConstruction">
                  {({ enabled }) => {
                    if (!enabled) return null
                    return <option value="construction">Construction</option>
                  }}
                </UserFeature>
                <option value="location">Locations</option>
                <option value="contact">Contact</option>
              </select>
            </div>
          </div>
        )
      case 'Equipment':
        return (
          ((body[index].target = 'equipmentBlock'),
          (body[index].fields = fieldList || []),
          (body[index].configs = configList || [])),
          null
        )
      case 'Chart':
        return (
          (body[index].target = 'charts'),
          (body[index].fields = fieldList || []),
          null
        )
      case 'Data List':
        return (
          <div className={styles['editor-body__select']}>
            <span>Please select where you'd like your data to come from:</span>
            <div className={styles.selectContainer}>
              <select
                value={body[index].target ? body[index].target : 'select'}
                onChange={this.handleClickSelectTarget}
              >
                <option disabled value="select">
                  Select Data
                </option>
                <option value="overview">Overview</option>
                <option value="utility">Utilities</option>
                <option value="endusebreakdown">End Use Breakdown</option>
              </select>
            </div>
          </div>
        )
    }
  }

  renderBodyComponents = () => {
    const { index } = this.props
    switch (this.props.widget.text) {
      case 'Data':
        return <Data index={index} target={this.state.preview.target} />
      case 'Table':
        return <Table index={index} target={this.state.preview.target} />
      case 'Equipment':
        return (
          <EquipmentDocument
            index={index}
            handleUpdateTemplateState={this.handleEquipmentUpdated}
          />
        )
      case 'Chart':
        return (
          <ChartContainer
            index={index}
            handleUpdateTemplateState={this.handleChartUpdated}
          />
        )
      case 'Data List':
        return <DataList index={index} target={this.state.preview.target} />
    }
  }

  handlePreviewName = previewName => {
    switch (previewName) {
      case 'audit':
        return 'buildee Pro'
      case 'building':
        return 'Property'
      case 'utility':
        return 'Utilities'
      case 'overview':
        return 'Overview'
      case 'endusebreakdown':
        return 'End Use Breakdown'
      case 'operation':
        return 'Operation'
      case 'construction':
        return 'Construction'
      case 'location':
        return 'Locations'
      case 'charts':
        return this.state.preview.label
      case 'equipmentBlock':
        return this.state.preview.label
      case 'contact':
        return 'Contact'
      default:
        return previewName
    }
  }
  renderTimePeriod = metaData => {
    const { preview } = this.state
    const left = preview && preview.fields && preview.fields.length ? ' |' : ''
    if (
      (preview.target != 'overview' &&
        preview.target != 'endusebreakdown' &&
        preview.target != 'utility' &&
        preview.target != 'charts') ||
      !metaData ||
      (metaData && metaData.yearOption === 'SetOnExport')
    )
      return <span></span>

    if (metaData.yearRange === '12' || metaData.yearRange === 'Last 12 months')
      return <span>{left}Time Period - Last 12 months</span>
    if (metaData.yearRange === '24' || metaData.yearRange === 'Last 24 months')
      return <span>{left}Time Period - Last 24 months</span>
    if (metaData.yearRange === '36' || metaData.yearRange === 'Last 36 months')
      return <span>{left}Time Period - Last 36 months</span>
    if (metaData.yearRange === 'Custom')
      return (
        <span>
          {left}
          {`Time Period - From ${metaData.selectedStartMonth}/${metaData.selectedStartYear} to ${metaData.selectedEndMonth}/${metaData.selectedEndYear}`}
        </span>
      )
    return (
      <span>
        {left}Time Period - {metaData.yearRange}
      </span>
    )
  }

  checkEmptyChart = () => {
    const { widget = {} } = this.props
    const options = widget.options || []
    return !options.every(option => (option.fields || []).length > 0)
  }

  render() {
    const { closeAllOptions, index, body, widget } = this.props
    return (
      <div
        className={styles['editor-body']}
        data-test={`editor-body-${widget.text.toLowerCase()}-element`}
      >
        <div className={styles['editor-body__info']}>
          <i className="material-icons">{this.renderDynamicIconClass()}</i>
          <span>{widget.text}</span>
          {this.state.preview.target === 'equipmentBlock' &&
            this.state.preview.formatType.includes('table') &&
            this.state.preview.fields &&
            this.state.preview.fields.length === 0 && (
              <div className={styles['editor-body__warning']}>
                <i className="material-icons warning">warning</i>
                No fields selected
              </div>
            )}
          {this.state.preview.target !== 'equipmentBlock' &&
            this.state.preview.target !== 'charts' &&
            this.state.preview.fields &&
            this.state.preview.fields.length === 0 && (
              <div className={styles['editor-body__warning']}>
                <i className="material-icons warning">warning</i>
                No fields selected
              </div>
            )}

          {this.state.preview.target === 'charts' && this.checkEmptyChart() && (
            <div className={styles['editor-body__warning']}>
              <i className="material-icons warning">warning</i>
              No fields selected
            </div>
          )}
        </div>

        {this.renderControlOptions()}

        <div
          className={classNames(styles['editor-body__options'])}
          ref={node => {
            this.node = node
          }}
        >
          <div className={classNames(styles['editor-body__preview'])}>
            <p>
              {this.state.preview && this.state.preview.target ? (
                this.handlePreviewName(this.state.preview.target)
              ) : (
                <i>
                  Please click the pencil icon to select {widget.text} options
                </i>
              )}
              {this.state.preview && this.state.preview.mainField && (
                <span>
                  {' '}
                  - {formatProComponentNames(this.state.preview.mainField)}
                </span>
              )}
            </p>
            <p>
              {this.state.preview.fields &&
                this.state.preview.fields.length > 0 && (
                  <span>
                    {this.state.preview.fields.map((field, i) => {
                      var ret = [],
                        tmp
                      if (field.includes('chart')) {
                        if (!field.includes('Url')) {
                          if (!field.includes('param')) {
                            if (field.split('.')[1].indexOf('year') != -1) {
                              if (field.split('.')[2].indexOf('Custom') != -1) {
                                let parts = field.split('.')
                                const format = `Time Period - From ${parts[3]}/${parts[4]} To ${parts[5]}/${parts[6]}`
                                ret.push(format)
                              } else {
                                field.split('.').map(ele => {
                                  tmp = `Time Period: ${ele}`
                                  ret.push(tmp)
                                })
                              }
                            } else if (
                              field.split('.')[1].indexOf('Date') != -1
                            ) {
                              field.split('.').map(ele => {
                                tmp = ele
                                ret.push(tmp)
                              })
                            } else {
                              field.split('.').map(ele => {
                                tmp = `Chart Name: ${ele}`
                                ret.push(tmp)
                              })
                            }
                          } else {
                            tmp = 'Param'
                            ret.push(tmp)
                          }
                        } else {
                          tmp = 'URL'
                          ret.push(tmp)
                        }
                      } else {
                        field.split('.').map(ele => {
                          tmp = ele.replace(/([A-Z])/g, ' $1').toLowerCase()
                          ret.push(tmp.charAt(0).toUpperCase() + tmp.slice(1))
                        })
                      }

                      let display = ''
                      switch (this.state.preview.target) {
                        case 'utility':
                          display = formatUtilityFields(field)
                          break
                        case 'overview':
                          display = formatOverviewFields(field)
                          break
                        case 'location':
                          display = formatLocationFields(field)
                          break
                        case 'endusebreakdown':
                          display = formatEndUseBreakDownFields(field)
                          break
                        default:
                          display = ret[ret.length - 1]
                      }
                      if (this.state.preview.customLabels) {
                        const customLabel = find(
                          this.state.preview.customLabels,
                          { field }
                        )
                        const options = display.split(' – ')
                        if (customLabel) {
                          if (options.length >= 2) {
                            display = options[0] + ' – ' + customLabel.value
                          } else {
                            display = customLabel.value
                          }
                        }
                      }
                      if (this.state.preview.fields.length === i + 1) {
                        return (
                          <span key={i}>
                            {display === 'Open247' ? 'Open 24/7' : display}
                          </span>
                        )
                      } else {
                        return (
                          <span key={i}>
                            {display === 'Open247' ? 'Open 24/7' : display} |
                            {''}
                          </span>
                        )
                      }
                    })}
                  </span>
                )}
              {this.state.preview.fields !== undefined &&
                this.state.preview.fields.length > 0 &&
                this.renderTimePeriod(this.state.preview.metaData)}
            </p>
            {this.state.preview.configs &&
              this.state.preview.configs.length > 0 && (
                <p>
                  {this.state.preview.configs.map((config, i) => {
                    var ret = [],
                      tmp
                    config.split('.').map(ele => {
                      tmp = ele.replace(/([A-Z])/g, ' $1').toLowerCase()
                      ret.push(tmp.charAt(0).toUpperCase() + tmp.slice(1))
                    })
                    let display = ''
                    switch (this.state.preview.target) {
                      case 'benchmark':
                        display = formatBenchmarkFields(field)
                        break
                      case 'overview':
                        display = formatOverviewFields(field)
                        break
                      case 'utility':
                        display = formatUtilityFields(field)
                        break
                      case 'location':
                        display = formatLocationFields(field)
                        break
                      case 'endusebreakdown':
                        display = formatEndUseBreakDownFields(field)
                        break
                      default:
                        display = ret[ret.length - 1]
                    }
                    if (this.state.preview.configs.length === i + 1) {
                      return (
                        <span key={i}>
                          {display === 'Open247' ? 'Open 24/7' : display}
                        </span>
                      )
                    } else {
                      return (
                        <span key={i}>
                          {display === 'Open247' ? 'Open 24/7' : display} |{' '}
                        </span>
                      )
                    }
                  })}
                </p>
              )}
          </div>
          {!closeAllOptions && this.state.optionsVisible && (
            <div className={styles['editor-body__inner']}>
              {this.renderTargetOptions()}
              {body[index].target && this.renderBodyComponents()}
            </div>
          )}
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = {
  bodyTemplate,
  templateUpdateError
}

const mapStateToProps = state => ({
  body: state.template.templateViewBody || []
})

const withConnect = connect(mapStateToProps, mapDispatchToProps)

export default withConnect(Body)
