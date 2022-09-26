import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames'
import styles from './ProjectForm.scss'
import ImagesField from '../FormFields/ImagesField'
import { Loader } from 'utils/Loader'
import { replaceHTMLEntities } from 'components/Project/ProjectHelpers'

import {
  ProjectFields,
  ProjectIncentive,
  ProjectFinancial,
  ProjectImplementation
} from '.'

export class ScenarioProjectForm extends React.Component {
  static propTypes = {
    currentProject: PropTypes.object.isRequired,
    submitFunction: PropTypes.func.isRequired,
    eaAudit: PropTypes.object.isRequired,
    handleGoBack: PropTypes.func.isRequired,
    handleCloseAddProjects: PropTypes.func,
    currentView: PropTypes.string.isRequired,
    isSubmitting: PropTypes.bool.isRequired,
    // errorRunningProject: PropTypes.bool.isRequired,
    zipCode: PropTypes.string,
    library: PropTypes.bool
  }

  state = {
    loadingStatus: '',
    didMount: false,

    showSource: false,

    formIsValid: false,
    formValues: {},
    extraFinancialFields: [
      { name: 'Material Cost', label: 'material_cost' },
      { name: 'Labor Cost', label: 'labor_cost' },
      { name: 'Design Fees', label: 'design_fees' },
      { name: 'Construction Management', label: 'construction_management' },
      {
        name: 'Site-Specific Installation Factors',
        label: 'installation_factors'
      },
      { name: 'Permits', label: 'permits' },
      { name: 'Temporary Services', label: 'temporary_services' },
      { name: 'Test and Balancing', label: 'test_and_balancing' },
      { name: 'Utility Service Upgrades', label: 'utility_service_upgrades' },
      { name: 'Commissioning', label: 'commissioning' },
      { name: 'Taxes', label: 'taxes' },
      { name: 'Profit', label: 'profit' }
    ],

    auditObj: {},
    eaComponents: {},
    currentEaComponent: {},
    eaComponentType: '',

    eaImages: [],
    originalEaImages: [],
    eaImagesButtonDisable: false,
    eaImagesLoading: false,

    locationModalOpen: false,
    locationName: '',
    locations: []
  }

  componentDidMount = () => {
    const { eaAudit } = this.props
    this.setFormValues()

    setTimeout(() => {
      this.setState({ didMount: true })
    }, 0)

    // if there is an eaAudit in the building object from props
    if (eaAudit.constructor === Object && Object.keys(eaAudit).length !== 0) {
      this.setState({ auditObj: eaAudit })
      this.getEaComponents(eaAudit)
    }
  }

  setFormValues = () => {
    const { currentProject } = this.props
    if (currentProject.initialValues && currentProject.dataAlreadyFromEA) {
      let tempFormObj = Object.assign(
        { ...this.state.formValues },
        currentProject.initialValues
      )
      tempFormObj['displayName'] = currentProject.displayName
      tempFormObj['description'] = currentProject.description
      this.setState({ formValues: tempFormObj })
      this.calculateIncentive(tempFormObj)
    } else if (currentProject.initialValues) {
      let tempFormObj = Object.assign(
        { ...this.state.formValues },
        currentProject.initialValues
      )
      if (currentProject.type == 'Portfolio') {
        for (let field of currentProject.fields) {
          if (!tempFormObj[field.name]) {
            let value
            if (field.type == 'number') value = field.default || '0'
            else value = field.default || ''
            tempFormObj[field.name] = value
          }
        }
      }
      this.setState({ formValues: tempFormObj })
      this.isFormValid(tempFormObj)
    } else {
      let tempFormObj = { ...this.state.formValues }
      tempFormObj['displayName'] = currentProject.displayName
      tempFormObj['description'] = currentProject.description

      if (
        currentProject.fields &&
        currentProject.fields.find(o => o.name === 'zipcode') &&
        this.props.zipCode
      ) {
        tempFormObj['zipcode'] = this.props.zipCode
      }

      if (
        currentProject.initialValues &&
        currentProject.initialValues.location
      ) {
        tempFormObj.location = currentProject.initialValues.location
      }

      if (
        currentProject &&
        currentProject.incentive &&
        currentProject.incentive.incentive_type !== 'none' &&
        currentProject.incentive.input_map
      ) {
        this.calculateIncentive(tempFormObj)
      } else {
        if (currentProject.type == 'Portfolio') {
          for (let field of currentProject.fields) {
            let value
            if (field.type == 'number') value = field.default || '0'
            else value = field.default || ''
            tempFormObj[field.name] = value
          }
        }
        this.isFormValid(tempFormObj)
        this.setState({ formValues: tempFormObj })
      }
    }
    if (currentProject.locations) {
      this.setState({
        locations: currentProject.locations
      })
    }
  }

  handleChange = (event, inputType) => {
    const { currentProject } = this.props
    const { extraFinancialFields, formValues } = this.state
    var extraFieldsArray = Object.keys(extraFinancialFields).map(
      k => extraFinancialFields[k].label
    )

    let tempformValues = { ...this.state.formValues }
    if (inputType === 'boolean') {
      tempformValues[event.target.name] =
        event.target.value === 'true' ? true : false
      // calculate project cost when extra financial field are edited
    } else if (extraFieldsArray.indexOf(event.target.name) > -1) {
      tempformValues[event.target.name] = event.target.value
      tempformValues.project_cost = Number(event.target.value)
      extraFieldsArray.forEach(field => {
        if (formValues[field] && field !== event.target.name) {
          tempformValues.project_cost += Number(formValues[field])
        }
      })
    } else {
      tempformValues[event.target.name] = event.target.value
    }
    this.isFormValid(tempformValues)

    if (
      event.target.name !== 'input' &&
      event.target.name !== 'project_cost' &&
      event.target.name !== 'maintenance_savings' &&
      event.target.name !== 'displayName' &&
      event.target.name !== 'description' &&
      currentProject &&
      currentProject.incentive &&
      currentProject.incentive.incentive_type !== 'none'
    ) {
      this.calculateIncentive(tempformValues)
    } else {
      this.setState({ formValues: tempformValues })
    }
  }

  isFormValid = tempformValues => {
    const { currentProject } = this.props
    let formIsValid = true

    if (!tempformValues.displayName) {
      formIsValid = false
    }

    if (
      this.props.currentProject.fields &&
      this.props.currentProject.fields.length > 0
    ) {
      this.props.currentProject.fields.map(field => {
        if (!tempformValues[field.name]) {
          formIsValid = false
        }
      })
    } else {
      formIsValid = true
    }

    if (
      currentProject &&
      currentProject.incentive &&
      currentProject.incentive.incentive_type &&
      currentProject.incentive.incentive_type !== 'none'
    ) {
      if (!tempformValues.input) {
        formIsValid = false
      }
    }

    if (formIsValid) {
      this.setState({ formIsValid: true })
    } else {
      if (this.state.formValues) {
        this.setState({ formIsValid: false })
      }
    }
  }

  calculateIncentive = tempFormObj => {
    const { currentProject } = this.props
    if (currentProject.incentive.input_map) {
      if (
        typeof currentProject.incentive.input_map === 'string' &&
        currentProject.incentive.input_map.includes('calculation')
      ) {
        let calulationName = currentProject.incentive.input_map.split('.').pop()
        let tempIncentiveInput = 0

        //pull out into util

        switch (calulationName) {
          case 'wattsReduced':
            tempIncentiveInput =
              (tempFormObj['existing_wattage'] -
                tempFormObj['replacement_wattage']) *
              tempFormObj['quantity']
            break
          case 'existingDemandTons':
            tempIncentiveInput = tempFormObj['capacity_cooling'] / 12000.0
            break
          case 'existingDemandHP':
            tempIncentiveInput = tempFormObj['existing_demand'] * 1.34102
            break
          case 'capacityTons':
            tempIncentiveInput = tempFormObj['capacity'] / 12000.0
            break
          case 'capacityKWtoTons':
            tempIncentiveInput =
              (tempFormObj['capacity'] || tempFormObj['existing_demand']) *
              0.284345
            break
          default:
            tempIncentiveInput = 0
        }
        tempFormObj['input'] = tempIncentiveInput
      } else if (currentProject.incentive.input_map.includes('analysis')) {
        currentProject.runAnalysis = true
        tempFormObj['input'] = 0
      } else {
        if (currentProject.fields && currentProject.fields.length > 0) {
          currentProject.fields.map(field => {
            if (field.name === currentProject.incentive.input_map) {
              tempFormObj['input'] = tempFormObj[field.name]
            }
          })
        }
      }
    } else {
      tempFormObj['input'] = this.state.formValues['input'] || 0
    }

    this.setState({ formValues: tempFormObj })
  }

  toggleSource = () => {
    this.setState(prevState => ({
      showSource: !prevState.showSource
    }))
  }

  getEaComponents = auditObj => {
    const { currentProject } = this.props
    let componentType = ''
    let componentTypes = []

    if (
      currentProject &&
      currentProject.fields &&
      currentProject.fields.length > 0
    ) {
      currentProject.fields.map(field => {
        if (field.firebase_input) {
          let substring = field.firebase_input.substring(
            0,
            field.firebase_input.indexOf('.')
          )
          if (substring !== 'info') {
            componentType = substring
          }
        }
      })
    }

    if (componentType && auditObj[componentType]) {
      this.setState({
        eaComponents: auditObj[componentType],
        eaComponentType: componentType
      })
    }
  }

  handleImageUpload = uploadedImages => {
    this.setState({
      formValues: { ...this.state.formValues, uploadedImages }
    })
  }

  handleCloseLocationModal = location => {
    if (location) {
      this.setState({ locations: this.state.locations.concat(location._id) })
    }
    this.setState({ locationModalOpen: false, locationName: '' })
  }

  handleAddLocation = (addedLocation, locationName) => {
    if (addedLocation !== null) {
      this.setState({
        locations: this.state.locations.concat(addedLocation._id),
        locationName: ''
      })
    } else {
      this.setState({ locationModalOpen: true, locationName })
    }
  }

  handleUpdateLocations = nextLocations => {
    this.setState({
      locations: nextLocations
    })
  }

  checkImplementationStrategy = currentProject => {
    if (
      currentProject.incentive &&
      currentProject.incentive.incentive_meta &&
      currentProject.incentive.incentive_meta.length > 0
    ) {
      if (
        currentProject.incentive.incentive_meta.every(
          obj => obj.label !== 'Implementation Strategy'
        )
      ) {
        return true
      } else {
        return false
      }
    } else {
      return true
    }
  }

  render() {
    const { currentProject } = this.props
    let renderFields = (currentProject && currentProject.fields) || []
    if (currentProject.type === 'Portfolio') {
      if (currentProject.name === 'boilerTuneUpNY') {
        renderFields = renderFields.filter(
          field =>
            field.name === 'baseline_efficiency' || field.name === 'load_factor'
        )
      } else if (currentProject.name === 'lightingNY') {
        renderFields = []
      }
    }
    return (
      <div className={styles.projectForm}>
        <form className={styles.container}>
          <div className={styles.projectFormSection}>
            <div className={styles.projectFormSectionDescription}>
              <p>Details</p>
              <span>Add Basic information about your measure</span>
            </div>

            <div className={styles.projectFormSectionInputs}>
              <div className={styles.projectFormSectionInput}>
                <label htmlFor="displayName">Measure Name</label>
                <input
                  type="text"
                  value={
                    replaceHTMLEntities(this.state.formValues['displayName']) ||
                    ''
                  }
                  name="displayName"
                  onChange={this.handleChange.bind(this)}
                />
              </div>

              {currentProject &&
                currentProject.incentive &&
                currentProject.incentive.utility_company && (
                  <div className={styles.projectFormSectionInput}>
                    <label>Utility</label>
                    <p>{currentProject.incentive.utility_company}</p>
                  </div>
                )}

              {currentProject &&
                currentProject.incentive &&
                currentProject.incentive.program_period && (
                  <div className={styles.projectFormSectionInput}>
                    <label>Program Period</label>
                    <p>{currentProject.incentive.program_period}</p>
                  </div>
                )}

              <div className={styles.projectFormSectionInput}>
                <label htmlFor="description">Measure Description</label>
                <textarea
                  value={replaceHTMLEntities(
                    this.state.formValues['description']
                  )}
                  name="description"
                  onChange={this.handleChange.bind(this)}
                />
              </div>

              {currentProject &&
                currentProject.incentive &&
                currentProject.incentive.existing_requirements && (
                  <div className={styles.projectFormSectionInput}>
                    <label>Existing Requirements</label>
                    <p>
                      {replaceHTMLEntities(
                        currentProject.incentive.existing_requirements
                      )}
                    </p>
                  </div>
                )}

              {currentProject &&
                currentProject.incentive &&
                currentProject.incentive.design_requirements && (
                  <div className={styles.projectFormSectionInput}>
                    <label>Design Requirements</label>
                    <p>
                      {replaceHTMLEntities(
                        currentProject.incentive.design_requirements
                      )}
                    </p>
                  </div>
                )}

              {currentProject &&
                currentProject.incentive &&
                currentProject.incentive.qualified_products && (
                  <div className={styles.projectFormSectionInput}>
                    <label>Qualified Products List</label>
                    <p>
                      <a
                        href={currentProject.incentive.qualified_products}
                        target="_blank"
                      >
                        {currentProject.incentive.qualified_products}
                      </a>
                    </p>
                  </div>
                )}

              {currentProject &&
                currentProject.incentive &&
                currentProject.incentive.rebate_code && (
                  <div className={styles.projectFormSectionInput}>
                    <label>Rebate Code</label>
                    <p>{currentProject.incentive.rebate_code}</p>
                  </div>
                )}

              {currentProject &&
                currentProject.incentive &&
                currentProject.incentive.application_link && (
                  <div className={styles.projectFormSectionInput}>
                    <label>Link to Application</label>
                    <p>
                      <a
                        href={currentProject.incentive.application_link}
                        target="_blank"
                      >
                        {currentProject.incentive.application_link}
                      </a>
                    </p>
                  </div>
                )}

              {currentProject && currentProject.source && (
                <div className={styles.projectFormSectionInput}>
                  <div className={styles.projectFormSource}>
                    <small onClick={this.toggleSource}>
                      {this.state.showSource
                        ? 'Hide Calculation Description '
                        : 'Show Calculation Description '}
                    </small>
                    {this.state.showSource && (
                      <a
                        href={currentProject.source.match(
                          /(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w\.-]*)*\/?\S/g
                        )}
                        target="_blank"
                      >
                        {currentProject.source.replace(
                          /(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w\.-]*)*\/?\S/g,
                          ''
                        )}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {renderFields.length > 0 && (
            <div className={styles.projectFormSection}>
              <div className={styles.projectFormSectionDescription}>
                <p>Design</p>
                <span>
                  Add design information to determine savings potential. You can
                  update this later.
                </span>
              </div>
              <div className={styles.projectFormSectionInputs}>
                <ProjectFields
                  fields={renderFields}
                  formValues={this.state.formValues}
                  handleChange={this.handleChange}
                />
              </div>
            </div>
          )}

          {currentProject.incentive &&
            currentProject.incentive.incentive_meta &&
            currentProject.incentive.incentive_meta.length > 0 && (
              <div className={styles.projectFormSection}>
                <div className={styles.projectFormSectionDescription}>
                  <p>Implementation</p>
                </div>
                <div className={styles.projectFormSectionInputs}>
                  <ProjectImplementation
                    fields={currentProject.incentive.incentive_meta}
                    formValues={this.state.formValues}
                    handleChange={this.handleChange}
                  />
                </div>
              </div>
            )}

          {currentProject &&
            currentProject.incentive &&
            currentProject.incentive.incentive_type !== 'none' && (
              <div className={styles.projectFormSection}>
                <div className={styles.projectFormSectionDescription}>
                  <p>Incentive</p>
                  <span>
                    Provide details to determine the impact of incentives on
                    your measure.
                  </span>
                </div>
                <div className={styles.projectFormSectionInputs}>
                  <ProjectIncentive
                    incentive={currentProject.incentive}
                    formValues={this.state.formValues}
                    handleChange={this.handleChange}
                    runAnalysis={currentProject.runAnalysis ? true : false}
                  />
                </div>
              </div>
            )}

          {currentProject.category !== 'description' &&
            this.checkImplementationStrategy(currentProject) && (
              <div className={styles.projectFormSection}>
                <div className={styles.projectFormSectionDescription}>
                  <p>Financial Modeling</p>
                </div>
                <div className={styles.projectFormSectionInputs}>
                  <ProjectFinancial
                    formValues={this.state.formValues}
                    extraFinancialFields={this.state.extraFinancialFields}
                    handleChange={this.handleChange}
                  />
                </div>
              </div>
            )}

          <div className={styles.projectFormSection}>
            <div className={styles.projectFormSectionDescription}>
              <p>Comments</p>
              <span>Add comments related to the measure.</span>
            </div>
            <div className={styles.projectFormSectionInputs}>
              <div className={styles.projectFormSectionInput}>
                <label htmlFor="comment">Comments</label>
                <textarea
                  value={this.state.formValues['comment']}
                  name="comment"
                  onChange={this.handleChange.bind(this)}
                  placeholder="Add comments about this measure"
                />
              </div>
            </div>
          </div>

          <div className={styles.projectFormSection}>
            <div className={styles.projectFormSectionDescription}>
              <p>Images</p>
              <span>
                Take photos or import images related to the measure. Note images
                are compressed.
              </span>
            </div>
            <div className={styles.projectFormSectionInputs}>
              <ImagesField
                images={
                  this.state.formValues.uploadedImages &&
                  this.state.formValues.uploadedImages.reduce((acc, image) => {
                    let url = new URL(image)
                    return Object.assign(acc, {
                      [url.pathname]: {
                        uploadUrl: url.href,
                        preview: url.href
                      }
                    })
                  }, {})
                }
                onFieldUpdate={images => {
                  const uploadedImages = Object.keys(images).map(
                    k => images[k].uploadUrl
                  )
                  this.handleImageUpload(uploadedImages)
                }}
              />
            </div>
          </div>
        </form>
        <div className={styles.projectFormFooter}>
          <div className={styles.container}>
            {this.props.currentView !== 'projectEdit' && (
              <div
                className={styles.projectFormFooterBack}
                onClick={this.props.handleGoBack}
              >
                <i className="material-icons">arrow_back_ios</i>
                <small>Back</small>
              </div>
            )}

            <div className={styles.projectFormFooterButtons}>
              {!this.props.library && (
                <button
                  className={classNames(styles.button, styles.buttonSecondary)}
                  onClick={() => this.props.handleCloseAddProjects()}
                >
                  Cancel
                </button>
              )}

              {this.props.isSubmitting && (
                <button
                  className={classNames(
                    styles.button,
                    styles.buttonPrimary,
                    styles.buttonDisable
                  )}
                  type="button"
                >
                  <Loader size="button" color="white" />
                </button>
              )}

              {!this.props.isSubmitting && (
                // && !this.props.errorRunningProject
                <button
                  onClick={() =>
                    this.props.submitFunction(
                      Object.assign({}, this.state.formValues, {
                        locations: this.state.locations
                      }),
                      true
                    )
                  }
                  className={classNames(styles.button, styles.buttonPrimary)}
                  type="button"
                >
                  {this.props.isSubmitting ? (
                    <Loader size="button" color="white" />
                  ) : this.props.currentView === 'projectAdd' ||
                    this.props.currentProject.dataAlreadyFromEA ? (
                    this.state.formIsValid ? (
                      'Add Measure'
                    ) : (
                      'Add Measure'
                    )
                  ) : this.props.currentView === 'projectEdit' ||
                    this.props.currentProject.dataAlreadyFromEA === false ? (
                    'Edit Measure'
                  ) : (
                    'Copy Measure'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  buildingId:
    (state.building &&
      state.building.buildingView &&
      state.building.buildingView._id) ||
    ''
})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(ScenarioProjectForm)
