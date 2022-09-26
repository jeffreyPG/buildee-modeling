import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './TemplateOptions.scss'
import ColorPicker from '../../../UI/ColorPicker'

const widthOptions = [
  { name: '1/2 pt', value: 1 / 2 },
  { name: '1/4 pt', value: 1 / 4 },
  { name: '3/4 pt', value: 3 / 4 },
  { name: '1 pt', value: 1 },
  { name: '1 1/2 pt', value: 3 / 2 },
  { name: '2 1/4 pt', value: 9 / 4 },
  { name: '3 pt', value: 3 },
  { name: '4 1/2 pt', value: 9 / 2 },
  { name: '6 pt', value: 6 }
]

export class DividerBase extends Component {
  static propTypes = {
    handleChangeColor: PropTypes.func.isRequired,
    handleChangeWidth: PropTypes.func.isRequired,
    toggleShowDivider: PropTypes.func.isRequired,
    color: PropTypes.string,
    width: PropTypes.number
  }

  state = {
    showDivider: false
  }

  render() {
    const {
      handleChangeWidth,
      handleChangeColor,
      dividerConfig,
      toggleShowDivider
    } = this.props
    const color = (dividerConfig && dividerConfig.color) || ''
    const width = (dividerConfig && dividerConfig.width) || ''
    let text
    if (color === '') text = 'Color is not selected'
    if (width === '') text = 'Width is not selected'
    if (color === '' && width === '') text = 'No fields selected'
    return (
      <div
        className={classNames(styles['editor-header'], styles['headerShow'])}
      >
        <div className={styles['editor-body__info']}>
          <span>Divider</span>
          {(color === '' || width === '') && (
            <div className={styles.editorBodyWarning}>
              <i className="material-icons warning">warning</i>
              {text}
            </div>
          )}
        </div>
        <p
          style={{
            backgroundColor: color,
            height: `${width}pt`
          }}
        />
        <div className={styles['content-options']}>
          <i onClick={toggleShowDivider} className="material-icons">
            delete
          </i>
        </div>
        <div className={classNames(styles['editor-divider'])}>
          <div className={classNames(styles['editor-divider__color'])}>
            <p>Color</p>
            <div>
              <span>#</span>
              <div>
                <ColorPicker
                  handleChangeColor={handleChangeColor}
                  color={color}
                />
                <div
                  className={classNames(styles['colorImg'])}
                  style={{ backgroundColor: color }}
                />
              </div>
            </div>
          </div>
          <div className={classNames(styles['editor-divider__width'])}>
            <p>Line Weight</p>
            <div className={styles.selectContainer}>
              <select value={width} onChange={handleChangeWidth}>
                <option defaultValue value="" disabled>
                  Select width
                </option>
                {widthOptions.map((field, i) => {
                  return (
                    <option key={i} value={field.value}>
                      {field.name}
                    </option>
                  )
                })}
              </select>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
