import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { find, findIndex } from 'lodash'
import CollapseSection from 'components/UI/CollapseSection'
import { ProjectFiltering } from './'
import { formatProjectFields } from 'utils/Utils'
import BulletFormattedList from './BulletFormattedList'
import {
  bodyTemplate,
  templateUpdateError
} from 'routes/Template/modules/template'
import styles from './Projects.scss'
import tableStyles from '../BodyComponents/TemplateTarget.scss'

export class ProjectBulletedList extends Component {
  static propTypes = {
    bodyTemplate: PropTypes.func.isRequired,
    templateUpdateError: PropTypes.func.isRequired,
    body: PropTypes.array.isRequired,
    index: PropTypes.number.isRequired
  }

  saveRadioFields = (e, type) => {
    let body = JSON.parse(JSON.stringify(this.props.body))
    let card = body[this.props.index]
    card.projectConfig[type] = e.target.value
    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }
  componentDidMount() {
    let body = JSON.parse(JSON.stringify(this.props.body))
    let widget = body[this.props.index]
    if (!widget.tableLayout) {
      widget.tableLayout = 'horizontal'
    }
    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }
  saveCheckboxFields = e => {
    let body = JSON.parse(JSON.stringify(this.props.body))
    let card = body[this.props.index]
    // if it doesn't already exist
    if (!card.projectConfig.data) {
      card.projectConfig.data = {}
    }
    if (!card.projectConfig.data.fields) {
      card.projectConfig.data.fields = []
    }
    if (e.target.checked) {
      card.projectConfig.data.fields.push(e.target.value)
    } else {
      card.projectConfig.data.fields = card.projectConfig.data.fields.filter(
        item => item !== e.target.value
      )
    }
    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }
  saveLayout(e) {
    let body = JSON.parse(JSON.stringify(this.props.body))
    let widget = body[this.props.index]

    if (!widget.tableLayout) {
      widget.tableLayout = e.target.value
    } else {
      widget.tableLayout = e.target.value
    }
    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }
  // tableLayout() {
  //   const layoutList = [
  //     { label: 'Horizontal', value: 'horizontal' },
  //     { label: 'Vertical', value: 'vertical' }
  //   ]
  //   let widget = this.props.body[this.props.index]
  //   let templateLayout = widget.tableLayout || 'horizontal'

  //   return (
  //     <label
  //       className={classNames(
  //         targetStyles['target__select'],
  //         targetStyles['target__table-type']
  //       )}
  //     >
  //       <span>Select table layout:</span>
  //       <div className={targetStyles.radioContainer}>
  //         {layoutList.map((item, i) => {
  //           return (
  //             <label key={i}>
  //               <input
  //                 type="radio"
  //                 name="layout"
  //                 value={item.value}
  //                 defaultChecked={templateLayout === item.value}
  //                 onChange={e => this.saveLayout(e)}
  //               />
  //               <span>{item.label}</span>
  //             </label>
  //           )
  //         })}
  //       </div>
  //     </label>
  //   )
  // }

  saveHeading = (selectedField, value = '') => {
    let body = JSON.parse(JSON.stringify(this.props.body))
    let card = body[this.props.index]
    let customLabels =
      card &&
      card.projectConfig &&
      card.projectConfig.data &&
      card.projectConfig.data.customLabels
    if (!customLabels) customLabels = []
    const index = findIndex(customLabels, { field: selectedField.value })
    if (index > -1) customLabels.splice(index, 1)
    if (value) {
      customLabels.push({
        field: selectedField.value,
        value
      })
    }
    card.projectConfig.data.customLabels = customLabels
    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }

  clearDataFields = () => {
    let body = JSON.parse(JSON.stringify(this.props.body))
    let card = body[this.props.index]
    card.projectConfig.data.customLabels = []
    card.projectConfig.data.fields = []
    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }

  radioFieldsFormat = (array, type) => {
    const { index, body } = this.props
    const card = body[index]

    return array.map((item, i) => {
      let checkboxChecked = false
      if (
        type === 'projectGrouping' &&
        card &&
        card.projectConfig &&
        card.projectConfig.projectGrouping === item.value
      ) {
        checkboxChecked = true
      }
      if (
        type === 'style' &&
        card &&
        card.projectConfig &&
        card.projectConfig.style === item.value
      ) {
        checkboxChecked = true
      }
      return (
        <label key={i}>
          <input
            defaultChecked={checkboxChecked}
            value={item.value}
            name={'Projects ' + type}
            onChange={e => this.saveRadioFields(e, type)}
            className={classNames(checkboxChecked ? styles.checked : '')}
            type="radio"
          />
          <span>{item.name}</span>
        </label>
      )
    })
  }

  checkboxFieldsFormat = (array, type) => {
    const { index, body } = this.props
    const card = body[index]
    const customLabels =
      (card &&
        card.projectConfig &&
        card.projectConfig.data &&
        card.projectConfig.data.customLabels) ||
      []
    const { selectedField, customHeading } = this.state

    return array.map((item, i) => {
      let checkboxChecked = false
      if (
        type === 'data' &&
        card &&
        card.projectConfig &&
        card.projectConfig.data &&
        card.projectConfig.data.fields &&
        card.projectConfig.data.fields.includes(item.value)
      ) {
        checkboxChecked = true
      }
      let name = item.name
      if (customLabels && customLabels.length > 0) {
        const customLabel = find(customLabels, { field: item.value })
        if (customLabel) name = customLabel.value
      }
      if (selectedField && selectedField.value === item.value) {
        name = customHeading
      }
      return (
        <label key={i}>
          <input
            defaultChecked={checkboxChecked}
            value={item.value}
            name={'Projects ' + type}
            onChange={e => this.saveCheckboxFields(e, type)}
            className={classNames(checkboxChecked ? styles.checked : '')}
            type="checkbox"
          />
          <span className={styles.customLabelSpan}>
            {(!selectedField || selectedField.value !== item.value) && (
              <div className={tableStyles.fieldNameContainer}>
                {name}
                {checkboxChecked && (
                  <i
                    className="material-icons"
                    onClick={e => this.selectHeading(e, item, name)}
                  >
                    edit
                  </i>
                )}
              </div>
            )}
            {selectedField && selectedField.value === item.value && (
              <div className={tableStyles.fieldNameContainer}>
                <input
                  className={tableStyles.customHeadingInput}
                  type="text"
                  value={name}
                  onChange={e => {
                    this.handleUpdateHeading(e)
                  }}
                  ref={node => {
                    if (!this.state.node) this.setState({ node: node })
                  }}
                />
                <i
                  className="material-icons"
                  onClick={e => this.saveHeading(e)}
                >
                  close
                </i>
              </div>
            )}
          </span>
        </label>
      )
    })
  }

  showHideImages = e => {
    let body = JSON.parse(JSON.stringify(this.props.body))
    let card = body[this.props.index]
    // if it doesn't already exist
    if (!card.projectConfig.showimage) {
      card.projectConfig.showimage = true
    }

    card.projectConfig.showimage = e.target.checked

    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }

  showHideTimestamp = e => {
    let body = JSON.parse(JSON.stringify(this.props.body))
    let card = body[this.props.index]
    // if it doesn't already exist
    if (!card.projectConfig.showTimestamp) {
      card.projectConfig.showTimestamp = true
    }

    card.projectConfig.showTimestamp = e.target.checked

    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }

  showImageContainer = () => {
    const { index, body } = this.props
    const card = body[index]

    return (
      <div>
        <label>
          <input
            value={card.projectConfig.showimage}
            checked={card.projectConfig.showimage}
            name={'Projects Images'}
            onChange={e => this.showHideImages(e)}
            className={classNames(
              card.projectConfig.showimage ? styles.checked : ''
            )}
            type="checkbox"
          />
          <span>{card.projectConfig.showimage ? 'Show' : 'Hide'} Images</span>
        </label>
        {card.projectConfig.showimage && (
          <label>
            <input
              value={card.projectConfig.showTimestamp}
              checked={card.projectConfig.showTimestamp}
              name={'Projects Images'}
              onChange={e => this.showHideTimestamp(e)}
              className={classNames(
                card.projectConfig.showTimestamp ? styles.checked : ''
              )}
              type="checkbox"
            />
            <span className={styles.projectTimestampOption}>
              Add a Timestamp
            </span>
          </label>
        )}
      </div>
    )
  }

  renderText = (projectConfig, customLabels = []) => {
    let fields =
      (projectConfig && projectConfig.data && projectConfig.data.fields) || []
    let textList = fields.map(item => {
      const customLabel =
        customLabels.length > 0 ? find(customLabels, { field: item }) : null
      if (customLabel) return customLabel.value
      let label = item.includes('.') ? item.split('.')[1] : item
      return formatProjectFields(label)
    })
    return textList.join(', ')
  }

  render() {
    const { index, body } = this.props
    const projectConfig = body[index].projectConfig
    const layoutFields = [
      { name: 'Individual Measure', value: 'individual' },
      { name: 'Group by Category', value: 'groupCategory' },
      { name: 'Group by Category and Location', value: 'groupCategoryLocation' }
    ]

    const styleFields = [
      { name: 'Bulleted List', value: 'unordered-list' },
      { name: 'Numbered List', value: 'ordered-list' }
    ]

    const card = body[index]
    const customLabels =
      (card &&
        card.projectConfig &&
        card.projectConfig.data &&
        card.projectConfig.data.customLabels) ||
      []
    const selectedFields =
      (card &&
        card.projectConfig &&
        card.projectConfig.data &&
        card.projectConfig.data.fields) ||
      []

    return (
      <div>
        <h3>Measure Grouping</h3>
        <div className={styles.selectContainer}>
          <select
            value={(projectConfig && projectConfig.projectGrouping) || ''}
            onChange={e => this.saveRadioFields(e, 'projectGrouping')}
          >
            <option value="" defaultValue disabled>
              Select Type
            </option>
            {layoutFields.map(({ name, value }) => (
              <option key={value} value={value}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <ProjectFiltering index={this.props.index} />
        {/* <div>{this.tableLayout()}</div> */}
        <h3>Show Images</h3>
        <div className={styles.checkboxContainer}>
          {this.showImageContainer()}
        </div>

        <div className={styles.fieldSelector}>
          <div className={styles.fieldSelectorTitle}>Fields</div>
          <div className={styles.fieldSelectorDescription}>
            Select the fields for your table in the order they should appear.
          </div>
        </div>

        <div className={styles.fieldContainer}>
          <div className={styles.fieldContainerItem}>
            <div className={styles.fieldContainerTitle}>
              Order: {this.renderText(projectConfig, customLabels)}
            </div>
          </div>
          <div
            className={styles.fieldContainerClear}
            onClick={this.clearDataFields}
          >
            Clear Fields
          </div>
        </div>

        <CollapseSection
          customLabels={customLabels}
          addField={this.saveCheckboxFields}
          saveHeading={this.saveHeading}
          fields={selectedFields}
        />

        <h3>Bullet Style</h3>
        <div className={styles.radioContainer}>
          {this.radioFieldsFormat(styleFields, 'style')}
        </div>

        <h3>Bullet Style Format</h3>
        <div>
          <BulletFormattedList index={this.props.index} IsProject={true} />
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

export default withConnect(ProjectBulletedList)
