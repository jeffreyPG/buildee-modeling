import React from 'react'
import classNames from 'classnames'
import styles from './CheckboxGroup.scss'

class CheckboxGroup extends React.Component {
  checkboxGroup() {
    let { label, required, options, input, meta } = this.props

    return options.map((option, index) => {
      let checked = input.value.indexOf(option.name) !== -1
      return (
        <label key={index}>
          <input
            type="checkbox"
            name={`${input.name}[${index}]`}
            className={classNames(checked ? styles['checked'] : '')}
            value={option.name}
            defaultChecked={checked}
            onChange={event => {
              const newValue = [...input.value]
              if (event.target.checked) {
                newValue.push(option.name)
              } else {
                newValue.splice(newValue.indexOf(option.name), 1)
              }

              return input.onChange(newValue)
            }}
          />
          <span />
          <small>{option.name}</small>
        </label>
      )
    })
  }

  render() {
    let { options = [] } = this.props
    return (
      <div
        className={classNames(styles.checkboxContainer, {
          [styles.checkboxContainerTwo]:
            options.length === 4 || options.length === 2
        })}
      >
        {this.checkboxGroup()}
      </div>
    )
  }
}

export default CheckboxGroup
