import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './ProjectRates.scss'

export class ProjectRates extends React.Component {
  static propTypes = {
    onRatesSubmit: PropTypes.func.isRequired,
    initialValues: PropTypes.object.isRequired,
    handleHideForm: PropTypes.func.isRequired,
    hideProjectsRate: PropTypes.bool
  }

  state = {
    formInputs: {
      financeRate: '',
      discountRate: '',
      reinvestmentRate: '',
      inflationRate: '',
      investmentPeriod: '',
      electric: '',
      gas: '',
      water: '',
      steam: '',
      fuelOil2: '',
      fuelOil4: '',
      fuelOil56: '',
      diesel: '',
      other: '',
      electricGHG: '',
      gasGHG: '',
      steamGHG: '',
      fuelOil2GHG: '',
      fuelOil4GHG: '',
      fuelOil56GHG: '',
      dieselGHG: ''
    },
    inputExceedError: ''
  }

  componentDidMount = () => {
    let tempFormInputs = { ...this.state.formInputs }
    Object.keys(tempFormInputs).forEach(thingy => {
      tempFormInputs[thingy] = this.props.initialValues
        ? this.props.initialValues[thingy]
        : ''
    })
    this.setState({ formInputs: tempFormInputs })
  }

  handleOnChange = event => {
    let tempFormInput = { ...this.state.formInputs }
    tempFormInput[event.target.name] = event.target.value
    this.setState({ formInputs: tempFormInput })
  }

  exceedNumber = value => {
    return value > 100
  }

  handleSubmit = () => {
    const { formInputs } = this.state

    // check if any values in the form input are greater than 100
    var formValuesArray = Object.keys(formInputs).map(val => formInputs[val])
    if (formValuesArray.some(this.exceedNumber)) {
      this.setState({
        inputExceedError: 'Rates cannot exceed 100. Please change and re-submit'
      })
    } else {
      if (this.props.setFieldValue)
        this.props.onRatesSubmit(
          formInputs,
          this.props.setFieldValue,
          this.props.formValues,
          this.props.setFieldTouched
        )
      else this.props.onRatesSubmit(formInputs)
      this.props.handleHideForm()
    }
  }

  handleChange = event => {
    let tempRates = { ...this.state.formInputs }
    const value = event.target.value.replace(/-/g, '')
    tempRates[event.target.name] = value
    this.setState({ formInputs: tempRates })
  }

  render() {
    let { modeFrom = 'other' } = this.props
    let isScenarioMode = modeFrom === 'Scenario'
    return (
      <div className={styles.projectRate}>
        <form
          className={classNames(
            styles.projectRateForm,
            styles.panelContent,
            this.props.hideProjectsRate ? styles.panelContentHide : ''
          )}
        >
          <div className={styles.projectRateBody}>
            <div className={styles.projectRateBodyFinancial}>
              <label className={styles.description}>Financial Analysis</label>
              <div className={styles.projectRateField}>
                <label htmlFor="investmentPeriod">Investment Period: </label>
                <input
                  type="number"
                  step=".0001"
                  max="100"
                  name="investmentPeriod"
                  required
                  value={this.state.formInputs.investmentPeriod}
                  onChange={this.handleOnChange}
                />
                <span>&nbsp;yrs</span>
              </div>
              <div className={styles.projectRateField}>
                <label htmlFor="inflationRate">Inflation Rate: </label>
                <input
                  type="number"
                  step=".0001"
                  max="100"
                  name="inflationRate"
                  required
                  value={this.state.formInputs.inflationRate}
                  onChange={this.handleOnChange}
                />
                <span>&nbsp;&nbsp;&nbsp;%</span>
              </div>
              <div className={styles.projectRateField}>
                <label htmlFor="discountRate">Discount Rate: </label>
                <input
                  type="number"
                  step=".0001"
                  max="100"
                  name="discountRate"
                  required
                  value={this.state.formInputs.discountRate}
                  onChange={this.handleOnChange}
                />
                <span>&nbsp;&nbsp;&nbsp;%</span>
              </div>
              <div className={styles.projectRateField}>
                <label htmlFor="financeRate">Finance Rate: </label>
                <input
                  type="number"
                  step=".0001"
                  max="100"
                  name="financeRate"
                  value={this.state.formInputs.financeRate}
                  onChange={this.handleOnChange}
                />
                <span>&nbsp;&nbsp;&nbsp;%</span>
              </div>
              <div className={styles.projectRateField}>
                <label htmlFor="reinvestmentRate">Reinvestment Rate: </label>
                <input
                  type="number"
                  step=".0001"
                  max="100"
                  name="reinvestmentRate"
                  value={this.state.formInputs.reinvestmentRate}
                  onChange={this.handleOnChange}
                />
                <span>&nbsp;&nbsp;&nbsp;%</span>
              </div>
              <div className={styles.sourceLink}>
                *Default values from &nbsp;
                <a
                  href="https://nvlpubs.nist.gov/nistpubs/ir/2020/NIST.IR.85-3273-35.pdf "
                  target="_blank"
                >
                  2020 NIST Handbook 135.
                </a>
              </div>
            </div>
            <div className={styles.projectRateBodyBlended}>
              <label className={styles.description}>Blended Rates</label>
              <div
                className={classNames(
                  styles.projectRateBodyBlendedContainer,
                  isScenarioMode ? styles.scenarioContainer : ''
                )}
              >
                <div className={styles.section}>
                  <div className={styles.sectionField}>
                    <label htmlFor="electric">
                      <i className="material-icons">flash_on</i>Electricity
                    </label>
                    <div className={styles.input}>
                      $
                      <input
                        name="electric"
                        onChange={e => this.handleChange(e)}
                        value={this.state.formInputs.electric || ''}
                        type="number"
                        step=".01"
                      />
                      /kWh
                    </div>
                  </div>
                  <div className={styles.sectionField}>
                    <label htmlFor="gas">
                      <i className="material-icons">whatshot</i>Natural Gas
                    </label>
                    <div className={styles.input}>
                      $
                      <input
                        name="gas"
                        onChange={e => this.handleChange(e)}
                        value={this.state.formInputs.gas || ''}
                        type="number"
                        step=".01"
                      />
                      /therm
                    </div>
                  </div>
                  <div className={styles.sectionField}>
                    <label htmlFor="water">
                      <i className="material-icons">waves</i>Water
                    </label>
                    <div className={styles.input}>
                      $
                      <input
                        name="water"
                        onChange={e => this.handleChange(e)}
                        value={this.state.formInputs.water || ''}
                        type="number"
                        step=".01"
                      />
                      /ccf
                    </div>
                  </div>
                  <div className={styles.sectionField}>
                    <label htmlFor="steam">
                      <i className="material-icons">scatter_plot</i>Steam
                    </label>
                    <div className={styles.input}>
                      $
                      <input
                        name="steam"
                        onChange={e => this.handleChange(e)}
                        value={this.state.formInputs.steam || ''}
                        type="number"
                        step=".01"
                      />
                      /Mlb
                    </div>
                  </div>
                  <div className={styles.sectionField}>
                    <label htmlFor="fuelOil2">
                      <svg xmlns="http://www.w3.org/2000/svg">
                        <g fill="none" fillRule="evenodd">
                          <path
                            fill="#2C3444"
                            d="M34 24.955C34 18.303 22 0 22 0S10 18.303 10 24.955C10 31.607 15.373 37 22 37c6.628 0 12-5.393 12-12.045z"
                          />
                          <path
                            stroke="#FFF"
                            strokeWidth="2"
                            d="M17.356 18C16.006 20.851 15 23.542 15 25.206c0 4.245 2.978 7.807 7 8.794"
                          />
                          <path
                            fill="#2C3444"
                            d="M9 9.443C9 6.926 4.5 0 4.5 0S0 6.926 0 9.443C0 11.96 2.015 14 4.5 14S9 11.96 9 9.443z"
                          />
                        </g>
                      </svg>
                      Fuel Oil 2
                    </label>
                    <div className={styles.input}>
                      $
                      <input
                        name="fuelOil2"
                        onChange={e => this.handleChange(e)}
                        value={this.state.formInputs.fuelOil2 || ''}
                        type="number"
                        step=".01"
                      />
                      /gal
                    </div>
                  </div>
                </div>
                <div className={styles.section}>
                  <div className={styles.sectionField}>
                    <label htmlFor="fuelOil4">
                      <svg xmlns="http://www.w3.org/2000/svg">
                        <g fill="none" fillRule="evenodd">
                          <path
                            fill="#2C3444"
                            d="M34 24.955C34 18.303 22 0 22 0S10 18.303 10 24.955C10 31.607 15.373 37 22 37c6.628 0 12-5.393 12-12.045z"
                          />
                          <path
                            stroke="#FFF"
                            strokeWidth="2"
                            d="M17.356 18C16.006 20.851 15 23.542 15 25.206c0 4.245 2.978 7.807 7 8.794"
                          />
                          <path
                            fill="#2C3444"
                            d="M9 9.443C9 6.926 4.5 0 4.5 0S0 6.926 0 9.443C0 11.96 2.015 14 4.5 14S9 11.96 9 9.443z"
                          />
                        </g>
                      </svg>
                      Fuel Oil 4
                    </label>
                    <div className={styles.input}>
                      $
                      <input
                        name="fuelOil4"
                        onChange={e => this.handleChange(e)}
                        value={this.state.formInputs.fuelOil4 || ''}
                        type="number"
                        step=".01"
                      />
                      /gal
                    </div>
                  </div>
                  <div className={styles.sectionField}>
                    <label htmlFor="fuelOil56">
                      <svg xmlns="http://www.w3.org/2000/svg">
                        <g fill="none" fillRule="evenodd">
                          <path
                            fill="#2C3444"
                            d="M34 24.955C34 18.303 22 0 22 0S10 18.303 10 24.955C10 31.607 15.373 37 22 37c6.628 0 12-5.393 12-12.045z"
                          />
                          <path
                            stroke="#FFF"
                            strokeWidth="2"
                            d="M17.356 18C16.006 20.851 15 23.542 15 25.206c0 4.245 2.978 7.807 7 8.794"
                          />
                          <path
                            fill="#2C3444"
                            d="M9 9.443C9 6.926 4.5 0 4.5 0S0 6.926 0 9.443C0 11.96 2.015 14 4.5 14S9 11.96 9 9.443z"
                          />
                        </g>
                      </svg>
                      Fuel Oil 5 & 6
                    </label>
                    <div className={styles.input}>
                      $
                      <input
                        name="fuelOil56"
                        onChange={e => this.handleChange(e)}
                        value={this.state.formInputs.fuelOil56 || ''}
                        type="number"
                        step=".01"
                      />
                      /gal
                    </div>
                  </div>

                  <div className={styles.sectionField}>
                    <label htmlFor="diesel">
                      <svg xmlns="http://www.w3.org/2000/svg">
                        <g fill="none" fillRule="evenodd">
                          <path
                            fill="#2C3444"
                            d="M34 24.955C34 18.303 22 0 22 0S10 18.303 10 24.955C10 31.607 15.373 37 22 37c6.628 0 12-5.393 12-12.045z"
                          />
                          <path
                            stroke="#FFF"
                            strokeWidth="2"
                            d="M17.356 18C16.006 20.851 15 23.542 15 25.206c0 4.245 2.978 7.807 7 8.794"
                          />
                          <path
                            fill="#2C3444"
                            d="M9 9.443C9 6.926 4.5 0 4.5 0S0 6.926 0 9.443C0 11.96 2.015 14 4.5 14S9 11.96 9 9.443z"
                          />
                        </g>
                      </svg>
                      Diesel
                    </label>
                    <div className={styles.input}>
                      $
                      <input
                        name="diesel"
                        onChange={e => this.handleChange(e)}
                        value={this.state.formInputs.diesel || ''}
                        type="number"
                        step=".01"
                      />
                      /gal
                    </div>
                  </div>
                  <div className={styles.sectionField}>
                    <label htmlFor="other">
                      <i className="material-icons">scatter_plot</i>Other
                    </label>
                    <div className={styles.input}>
                      $
                      <input
                        name="other"
                        onChange={e => this.handleChange(e)}
                        value={this.state.formInputs.other || ''}
                        type="number"
                        step=".01"
                      />
                      /kWh
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {this.state.inputExceedError !== '' && (
            <p className={styles.projectRateError}>
              {this.state.inputExceedError}
            </p>
          )}
        </form>

        <div
          className={classNames(
            styles.panelActions,
            this.props.hideProjectsRate ? styles.panelActionsHide : ''
          )}
        >
          <button
            onClick={this.props.handleHideForm}
            className={classNames(styles.button, styles.buttonSecondary)}
          >
            Cancel
          </button>
          <button
            onClick={this.handleSubmit}
            className={classNames(styles.button, styles.buttonPrimary)}
          >
            Save
          </button>
        </div>
      </div>
    )
  }
}

export default ProjectRates
