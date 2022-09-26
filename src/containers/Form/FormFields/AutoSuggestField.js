import React from 'react'
import PropTypes from 'prop-types'
import Autosuggest from 'react-autosuggest'
import styles from './Form.scss'
import classNames from 'classnames'

export class AutoSuggestField extends React.Component {
  static propTypes = {
    label: PropTypes.string,
    searchKey: PropTypes.string,
    valueKey: PropTypes.string,
    dataSet: PropTypes.array.isRequired,
    placeholder: PropTypes.string,
    maxSuggestions: PropTypes.number,
    suggestInputValue: PropTypes.bool,
    name: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    initialValue: PropTypes.string,
    locked: PropTypes.bool
  }

  static defaultProps = {
    searchKey: 'name',
    valueKey: 'name',
    maxSuggestions: 10,
    suggestInputValue: false
  }

  state = {
    suggestions: [],
    value: this.props.initialValue || ''
  }

  clear = () => {
    this.autosuggest.input.value = ''
    this.setState({ value: '' })
    this.props.onChange({})
  }

  getSuggestionValue = suggestion => {
    return suggestion[this.props.valueKey]
  }

  getSuggestions = (value, dataSet) => {
    if (value === '') {
      return dataSet.slice(0, this.props.maxSuggestions)
    }
    const regex = new RegExp(value, 'i')
    const results = dataSet
      .filter(e => regex.test(e[this.props.searchKey]))
      .slice(0, this.props.maxSuggestions)
    if (results.length < 3 && this.props.suggestInputValue)
      results.unshift({ name: `"${value}"`, value })
    return results
  }

  renderSuggestion = suggestion => {
    return (
      <span data-test="suggestion">{suggestion[this.props.searchKey]}</span>
    )
  }

  handleChanged = (event, { newValue }) => {
    this.setState({ value: newValue })
  }

  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: this.getSuggestions(value, this.props.dataSet)
    })
  }

  onSuggestionsClearRequested = () => {
    this.setState({ suggestions: [] })
  }

  onSuggestionSelected = (event, { suggestion }) => {
    this.props.onChange(suggestion)
  }

  render() {
    const { name, placeholder, label, disabled, locked } = this.props
    const { suggestions, value } = this.state

    const inputProps = {
      name,
      onChange: this.handleChanged,
      placeholder,
      value,
      disabled
    }

    return (
      <div className={styles.formInput}>
        <label className={styles.formInputLabel}>{label}</label>
        <Autosuggest
          ref={input => (this.autosuggest = input)}
          focusInputOnSuggestionClick={false}
          getSuggestionValue={this.getSuggestionValue}
          inputProps={inputProps}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          onSuggestionSelected={this.onSuggestionSelected}
          renderSuggestion={this.renderSuggestion}
          shouldRenderSuggestions={() => !disabled && !locked}
          suggestions={suggestions}
        />
        {this.state.value && !locked && (
          <i
            className={classNames(styles.formInputClear, 'material-icons')}
            onClick={() => !locked && this.clear()}
          >
            close
          </i>
        )}
      </div>
    )
  }
}

export default AutoSuggestField
