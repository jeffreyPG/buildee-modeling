import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './TargetModal.scss'

const TargetFields = [
  {
    name: 'name',
    type: 'text'
  },
  {
    name: 'description',
    type: 'text'
  },
  {
    name: 'baselineYear',
    type: 'number',
    maxLength: 4
  },
  {
    name: 'targetYear',
    type: 'number',
    maxLength: 4
  },
  {
    name: 'reduction',
    type: 'number'
  }
]
export class TargetModal extends React.Component {
  static propTypes = {
    onDismiss: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    targets: PropTypes.object
  }
  constructor(props) {
    super(props)
    this.state = {
      targets: props.targets || [],
      didMount: false
    }
  }

  componentDidMount = () => {
    setTimeout(() => {
      this.setState({ didMount: true })
    }, 0)
  }

  addTarget = () => {
    const { targets } = this.state
    targets.push({
      name: '',
      description: '',
      baselineYear: '',
      targetYear: '',
      reduction: '',
      isEditable: true
    })
    this.setState({ targets })
  }

  saveTargets = () => {
    const { onSave, onDismiss } = this.props
    const { targets } = this.state
    const updatedTargets = targets.map(target => {
      const { name, description, baselineYear, targetYear, reduction } = target
      return { name, description, baselineYear, targetYear, reduction }
    })
    onSave(updatedTargets)
    onDismiss()
  }

  handleTargetClick = index => () => {
    const { targets } = this.state
    const selectedTarget = targets[index]
    if (selectedTarget) {
      if (selectedTarget.isEditable) {
        targets.splice(index, 1)
      } else {
        selectedTarget.isEditable = true
        targets[index] = selectedTarget
      }
    }
    this.setState({ targets })
  }

  handleChange = index => event => {
    const name = event.target.name
    const value = event.target.value
    const { targets } = this.state
    const selectedTarget = targets[index]
    selectedTarget[name] = value
    targets[index] = selectedTarget
    this.setState({ targets })
  }

  render() {
    const { onDismiss } = this.props
    const { targets, didMount } = this.state
    return (
      <div
        className={classNames(
          styles.modal,
          styles.templatesModal,
          styles['fade-in'],
          didMount ? styles.visible : ''
        )}
      >
        <div className={classNames(styles.modalOuter)}>
          <div className={styles.modalInner}>
            <div className={styles.templates}>
              <div className={styles.templatesHeading}>
                <div className={styles.templatesHeadingText}>
                  <h2>Manage Targets</h2>
                  <h4>
                    Create and manage targets aligned with your sustainability
                    and cost reduction goals.
                  </h4>
                </div>
                <div className={styles.modalClose} onClick={onDismiss}>
                  <i className="material-icons">close</i>
                </div>
              </div>
              <div className={styles.templatesContent}>
                {targets.length > 0 ? (
                  <table className={classNames(styles.tableContainer)}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Baseline Year</th>
                        <th>Target Year</th>
                        <th>Reduction %</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {targets.map((target, index) => {
                        return (
                          <tr key={`field_${index}`}>
                            {TargetFields.map(
                              ({ name, type, ...restProps }) => (
                                <th key={`field_${name}_${index}`}>
                                  <input
                                    type={type}
                                    name={name}
                                    value={target[name]}
                                    disabled={!target.isEditable}
                                    onChange={this.handleChange(index)}
                                    {...restProps}
                                  />
                                </th>
                              )
                            )}
                            <th>
                              <button
                                className={classNames(
                                  styles.button,
                                  target.isEditable
                                    ? styles.buttonError
                                    : styles.buttonPrimary
                                )}
                                onClick={this.handleTargetClick(index)}
                              >
                                <i className="material-icons">
                                  {target.isEditable ? 'delete' : 'create'}
                                </i>
                                <span />
                              </button>
                            </th>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className={styles.noTargetText}>No Targets Added</div>
                )}
                <button
                  className={classNames(
                    styles.button,
                    styles.buttonPrimary,
                    styles.addTarget
                  )}
                  onClick={this.addTarget}
                >
                  <i className="material-icons">add</i>Add Target
                  <span />
                </button>
              </div>
              <button
                className={classNames(
                  styles.button,
                  styles.buttonPrimary,
                  styles.saveTarget
                )}
                onClick={this.saveTargets}
              >
                Save
                <span />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
export default TargetModal
