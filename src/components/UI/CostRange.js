import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './CostRange.scss'

const costOptions = [
  { label: 'Less than', value: 'Less than' },
  { label: 'Equal to', value: 'Equal to' },
  { label: 'Greater than', value: 'Greater than' }
]

class CostRange extends Component {
  static propTypes = {
    handleFilterOptionSelect: PropTypes.func.isRequired,
    selectedItem: PropTypes.object.isRequired
  }

  state = {
    show: true,
    options: {
      option: costOptions[0].value,
      cost: 0
    }
  }

  UNSAFE_componentWillMount = () => {
    const { selectedItem } = this.props

    this.setState(prevState => ({
      options: {
        option:
          selectedItem.options && selectedItem.options.option
            ? selectedItem.options.option
            : prevState.options.option,
        cost:
          selectedItem.options && selectedItem.options.cost
            ? selectedItem.options.cost
            : prevState.options.cost
      }
    }))
    document.addEventListener('mousedown', this.handleClick, false)
  }

  componentWillUnmount = () => {
    document.removeEventListener('mousedown', this.handleClick, false)
    this.setState({ show: false })
  }

  handleClick = e => {
    if (this.node && this.node.contains(e.target)) {
      // the click is inside, continue to menu links
      return
    }
    // otherwise, toggle (close) the dropdowns
    this.handleToggle()
  }

  handleToggle = () => {
    this.setState({ show: false })
    this.props.handleFilterOptionSelect()
  }

  handleCostOption = (e, key) => {
    const { options } = this.state
    this.setState({
      options: {
        ...options,
        [key]: e.target.value
      }
    })
  }

  handleApplyOption = () => {
    const { options } = this.state
    this.props.handleFilterOptionSelect(options)
    this.setState({ show: false })
  }

  render() {
    const { show, options } = this.state
    if (!show) return <div></div>
    return (
      <div
        className={classNames(styles.costContainer)}
        ref={node => (this.node = node)}
      >
        <div className={styles.costContainerHeader}>
          <p>Cost</p>
          <i
            className={classNames('material-icons', styles.deleteIcon)}
            onClick={this.handleToggle}
          >
            close
          </i>
        </div>
        <div className={styles.costContainerBody}>
          <div
            className={classNames(styles.selectContainer, styles.costOption)}
          >
            <select
              defaultValue={options.option}
              onChange={e => this.handleCostOption(e, 'option')}
            >
              <option defaultValue disabled value="">
                Select option
              </option>
              {costOptions.map((item, index) => (
                <option
                  key={`options-${item.label}-${item.value}`}
                  value={item.value}
                >
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.costInputContainer}>
            <i className="material-icons">attach_money</i>
            <input
              className={styles.costInput}
              type="text"
              value={options.cost}
              onChange={e => this.handleCostOption(e, 'cost')}
            />
          </div>
        </div>
        <div className={styles.costContainerFooter}>
          <button
            className={classNames(styles.button, styles.buttonPrimary)}
            onClick={this.handleApplyOption}
          >
            Apply
          </button>
        </div>
      </div>
    )
  }
}
export default CostRange
