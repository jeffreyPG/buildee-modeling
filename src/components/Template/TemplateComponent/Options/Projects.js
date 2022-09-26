import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './Projects.scss'
import { connect } from 'react-redux'
import {
  ProjectBulletedList,
  ProjectFullDetails,
  ProjectSummaryTable,
  ProjectEndUseTable,
  ProjectEnergyTable,
  ProjectCard
} from './'
import {
  bodyTemplate,
  templateUpdateError
} from 'routes/Template/modules/template'
import { isProdEnv, parentNodeHasClass } from 'utils/Utils'
import UserFeature from 'utils/Feature/UserFeature'

export class Projects extends Component {
  static propTypes = {
    closeAllOptions: PropTypes.bool.isRequired,
    bodyTemplate: PropTypes.func.isRequired,
    templateUpdateError: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    removeWidget: PropTypes.func.isRequired,
    setCloseAllOptions: PropTypes.func.isRequired,
    body: PropTypes.array.isRequired
  }

  state = {
    optionsVisible: false,
    deleteToggleOpen: false
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
    const portal = e.target.closest('#portal')
    if (parentNodeHasClass(e.target, 'extrasClick')) {
      return
    }
    if (
      (this.node !== null && this.node.contains(e.target)) ||
      icon === e.target ||
      portal
    ) {
      return
    }
    if (e.target.classList.contains('filter-option')) {
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

  renderControlOptions = () => {
    return (
      <div
        className={classNames(
          styles.contentOptions,
          (!this.props.closeAllOptions && this.state.optionsVisible) ||
            this.state.deleteToggleOpen
            ? styles.optionsOpen
            : ''
        )}
      >
        <i className={classNames('material-icons', styles.move)}>gamepad</i>
        <i
          onClick={() => {
            this.handleClick()
          }}
          className="material-icons"
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
          <div className={styles.contentOptionsDelete}>
            <p>Delete this widget?</p>
            <div className={styles.confirm}>
              <div
                className={classNames(styles.deleteBtn)}
                onClick={() => this.handleClickRemoveWidget()}
              >
                Yes
              </div>
              <div
                className={classNames(styles.cancelBtn)}
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

  saveRadioFields = e => {
    let body = JSON.parse(JSON.stringify(this.props.body))
    let card = body[this.props.index]
    if (!card.projectConfig) {
      card.projectConfig = {}
    }

    card.projectConfig.format = e.target.value
    if (
      card.projectConfig.format === 'fullDetails' &&
      e.target.value === 'fullDetails'
    ) {
      card.projectConfig = {
        ...card.projectConfig,
        styles: {
          chs: 'h1',
          phs: 'h2',
          layout: 'oneColumn'
        },
        content: []
      }
    } else {
      card.projectConfig = {
        ...card.projectConfig,
        styles: {},
        content: []
      }
    }
    // clear values if switching between formats
    card.projectConfig.filter = {
      type: [],
      category: [],
      application: [],
      technology: []
    }
    card.projectConfig.data = {}
    card.projectConfig.style = ''
    card.projectConfig.projectGrouping = ''

    if (
      card.projectConfig.format === 'bulletedList' &&
      e.target.value === 'bulletedList'
    ) {
      card.projectConfig.showimage = true
    } else {
      if (card.projectConfig.showimage !== undefined)
        delete card.projectConfig.showimage
    }
    if (
      (card.projectConfig.format === 'endUseTable' &&
        e.target.value === 'endUseTable') ||
      (card.projectConfig.format === 'energyTable' &&
        e.target.value === 'energyTable')
    ) {
      card.metaData = {}
      card = {
        ...card,
        projectConfig: {
          ...card.projectConfig,
          data: {
            fields: []
          }
        },
        metaData: {
          yearRange: '12',
          selectedEndMonth: '',
          selectedEndYear: '',
          selectedStartMonth: '',
          selectedStartYear: '',
          yearOption: 'SetOnExport'
        }
      }
    }

    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }

  radioFieldsFormat = array => {
    const { index, body } = this.props
    const card = body[index]

    return array.map((item, i) => {
      let checkboxChecked = false
      if (
        card &&
        card.projectConfig &&
        card.projectConfig.format === item.value
      ) {
        checkboxChecked = true
        if (
          card.projectConfig.format === 'fullDetails' &&
          card.projectConfig &&
          !card.projectConfig.styles &&
          !card.projectConfig.content
        ) {
          card.projectConfig = {
            ...card.projectConfig,
            styles: {
              chs: 'h1',
              phs: 'h2',
              layout: 'oneColumn'
            },
            content: []
          }
        }
      }
      return (
        <div key={i} className={styles.projectRadioOption}>
          <label>
            <input
              defaultChecked={checkboxChecked}
              value={item.value}
              name="Projects format"
              onChange={e => this.saveRadioFields(e)}
              className={classNames(checkboxChecked ? styles.checked : '')}
              type="radio"
            />
            <span>{item.name}</span>
          </label>
        </div>
      )
    })
  }

  handleChangeType = event => {
    let body = JSON.parse(JSON.stringify(this.props.body))
    let card = body[this.props.index]
    card.projectConfig = {}
    card.projectConfig.type = event.target.value
    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }

  handleChangeMeasureType = () => {
    let body = JSON.parse(JSON.stringify(this.props.body))
    let card = body[this.props.index]
    card.projectConfig = {}
    card.projectConfig.type = 'measure'
    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }

  render() {
    const { closeAllOptions, body, index } = this.props
    const projectFormattingFields = [
      { name: 'Bulleted List', value: 'bulletedList' },
      { name: 'Full Measure Details', value: 'fullDetails' },
      { name: 'Table', value: 'summaryTable' },
      { name: 'End-Use Impacts Table', value: 'endUseTable' },
      { name: 'Energy Impacts Table', value: 'energyTable' },
      { name: 'Card', value: 'card' }
    ]
    const card = body[index]
    const projectConfig = card ? card.projectConfig : null
    const previewFormatObject =
      projectConfig && projectConfig.format
        ? projectFormattingFields.find(
            item => item.value === projectConfig.format
          )
        : null
    let previeSelectionName = ''
    if (projectConfig) {
      if (projectConfig.type === 'measure') {
        previeSelectionName = 'All Measures'
      }
      if (projectConfig.type === 'proposal') {
        previeSelectionName = 'From a Proposal'
      }
    }

    return (
      <div className={styles.editorBody}>
        <div className={styles.editorBodyInfo}>
          <i className="material-icons">table_chart</i>
          <span>Measures</span>
          {projectConfig && projectConfig.format === '' && (
            <div className={styles.editorBodyWarning}>
              <i className="material-icons warning">warning</i>
              No fields selected
            </div>
          )}
        </div>

        {this.renderControlOptions()}

        <div
          className={classNames(styles.editorBodyOptions)}
          ref={node => {
            this.node = node
          }}
        >
          <div className={classNames(styles.editorBodyPreview)}>
            <p>{previeSelectionName || 'Measures'}</p>
            {(!projectConfig ||
              (projectConfig && projectConfig.type === '')) && (
              <p>
                <i>Please click the pencil icon to select measure options</i>
              </p>
            )}
            {previewFormatObject && <p>{previewFormatObject.name}</p>}
          </div>

          {!closeAllOptions && this.state.optionsVisible && (
            <div
              className={classNames(styles.editorBodyInner, styles.projects)}
            >
              <h3>Measures</h3>
              <UserFeature name="projectProposal">
                {({ enabled }) => {
                  if (!enabled) {
                    if (!projectConfig || !projectConfig.type)
                      this.handleChangeMeasureType()
                    return null
                  }
                  return (
                    <div className={styles.selectContainer}>
                      <select
                        onChange={this.handleChangeType}
                        value={(projectConfig && projectConfig.type) || ''}
                        name="measureType"
                        id="measureType"
                      >
                        <option defaultValue disabled value="">
                          Select
                        </option>
                        <option value="measure">All Measures</option>
                        <option value="proposal">From a Proposal</option>
                      </select>
                    </div>
                  )
                }}
              </UserFeature>

              {projectConfig && projectConfig.type && (
                <div>
                  <h3>Format</h3>
                  <div className={styles.selectContainer}>
                    <select
                      value={(projectConfig && projectConfig.format) || ''}
                      onChange={e => this.saveRadioFields(e)}
                    >
                      <option value="" defaultValue disabled>
                        Select Measure Format
                      </option>
                      {projectFormattingFields.map(({ name, value }) => (
                        <option key={value} value={value}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {projectConfig && projectConfig.format === 'bulletedList' && (
                    <ProjectBulletedList index={this.props.index} />
                  )}
                  {projectConfig && projectConfig.format === 'fullDetails' && (
                    <ProjectFullDetails index={this.props.index} />
                  )}
                  {projectConfig && projectConfig.format === 'summaryTable' && (
                    <ProjectSummaryTable index={this.props.index} />
                  )}
                  {projectConfig && projectConfig.format === 'endUseTable' && (
                    <ProjectEndUseTable index={this.props.index} />
                  )}
                  {projectConfig && projectConfig.format === 'energyTable' && (
                    <ProjectEnergyTable index={this.props.index} />
                  )}
                  {projectConfig && projectConfig.format === 'card' && (
                    <ProjectCard index={this.props.index} />
                  )}
                </div>
              )}
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

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps
)

export default withConnect(Projects)
