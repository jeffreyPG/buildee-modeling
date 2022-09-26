import React from 'react'
import PropTypes from 'prop-types'
import Autosuggest from 'react-autosuggest'
import classNames from 'classnames'
import styles from './AutoSuggest.scss'

export class AutoSuggest extends React.Component {
  constructor(props) {
    super(props)
    this.autosuggest = null
  }

  static propTypes = {
    disabled: PropTypes.bool,
    getSuggestionValue: PropTypes.func.isRequired,
    name: PropTypes.string,
    onAdd: PropTypes.func,
    renderSuggestion: PropTypes.func,
    dontDisable: PropTypes.bool,
    values: PropTypes.arrayOf(PropTypes.object).isRequired
  }

  state = {
    suggestions: [],
    value: '',
    selected: false,
    selectedSuggestion: null
  }

  handleAdd = () => {
    this.props.onAdd(this.state.selectedSuggestion, this.state.value)
    this.handleSuggestionsClearRequested()
    this.setState({ value: '', selectedSuggestion: null, selected: false })
  }

  handleChange = (event, { newValue }) => this.setState({ value: newValue })

  handleSuggestionsRequested = ({ value }) => {
    const regex = new RegExp(value, 'i')
    const getValue = this.props.getSuggestionValue
    const suggestions = this.props.values
      .filter(doc => regex.test(getValue(doc)))
      .slice(0, 10)
    this.setState({ suggestions })
  }

  handleSuggestionsClearRequested = () => this.setState({ suggestions: [] })

  handleSuggestionSelected = (event, { suggestion }) => {
    this.setState({ selected: true, selectedSuggestion: suggestion })
  }

  render() {
    const { suggestions, value } = this.state
    const { disabled, name, dontDisable } = this.props

    const inputProps = {
      name,
      onChange: this.handleChange,
      value,
      disabled
    }

    return (
      <div className={styles.container}>
        <div className={styles.inputContainer}>
          <Autosuggest
            ref={ref => (this.autosuggest = ref)}
            getSuggestionValue={this.props.getSuggestionValue}
            inputProps={inputProps}
            onSuggestionsFetchRequested={this.handleSuggestionsRequested}
            onSuggestionsClearRequested={this.handleSuggestionsClearRequested}
            onSuggestionSelected={this.handleSuggestionSelected}
            renderSuggestion={this.props.renderSuggestion}
            suggestions={suggestions}
          />
        </div>
        <button
          data-test="autosuggest-button"
          className={classNames(
            styles.addButton,
            styles.button,
            styles.buttonPrimary,
            this.props.disabled ||
              (this.state.selectedSuggestion === null && !dontDisable)
              ? styles.buttonDisable
              : ''
          )}
          onClick={this.handleAdd}
          type="button"
          disabled={disabled}
        >
          <i className="material-icons">add</i>
          &nbsp;Add
        </button>
      </div>
    )
  }
}

export default AutoSuggest
