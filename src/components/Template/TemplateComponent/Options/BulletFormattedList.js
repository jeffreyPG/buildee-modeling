import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import styles from './TemplateOptions.scss'
import {
  bodyTemplate,
  templateUpdateError
} from 'routes/Template/modules/template'

export class BulletFormattedList extends Component {
  static propTypes = {
    bodyTemplate: PropTypes.func.isRequired,
    templateUpdateError: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    body: PropTypes.array
  }

  state = {
    selectedStyleFormats: []
  }

  handleClickSaveFormatStyle = event => {
    let { body } = this.props
    if (this.props.IsProject) {
      body[this.props.index].projectConfig.styleFormat = event.target.value
    } else {
      body[this.props.index].styleFormat = event.target.value
    }
    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }

  render() {
    const { index, body } = this.props
    var styleFormat = ''
    var bulletType = ''
    if (this.props.IsProject) {
      styleFormat = body[index].projectConfig.styleFormat
      bulletType = body[index] ? body[index].projectConfig.style : ''
    } else {
      styleFormat = body[index].styleFormat
      bulletType = body[index] ? body[index].type : ''
    }
    bulletType = bulletType.replace('-text', '')
    var selectedStyleFormats = []
    switch (bulletType) {
      case 'unordered-list':
        selectedStyleFormats = [
          { value: 'square', name: 'Square' },
          { value: 'disc', name: 'Disc' },
          { value: 'circle', name: 'Circle' }
        ]
        break

      case 'ordered-list':
        selectedStyleFormats = [
          { value: 'decimal', name: 'Numbers' },
          { value: 'upper-roman', name: 'Upper Roman' },
          { value: 'lower-roman', name: 'Lower Roman' },
          { value: 'upper-alpha', name: 'Upper Alpha' },
          { value: 'lower-alpha', name: 'Lower Alpha' }
        ]
        break

      default:
        selectedStyleFormats = []
        break
    }
    return (
      <div className={styles.selectContainer}>
        <select
          value={styleFormat}
          onChange={e => this.handleClickSaveFormatStyle(e)}
        >
          {selectedStyleFormats.map((field, i) => {
            return (
              <option key={i} value={field.value}>
                {field.name}
              </option>
            )
          })}
        </select>
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

export default withConnect(BulletFormattedList)
