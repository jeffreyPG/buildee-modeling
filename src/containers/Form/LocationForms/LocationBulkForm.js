import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Mutation } from 'react-apollo'

import styles from './LocationBulkForm.scss'
import stylesAsset from '../../../components/Asset/AssetView.scss'
import conditioningOptions from '../../../static/location-conditioning'
import floorOptions from '../../../static/location-floors'
import userOptions from '../../../static/location-users'
import useTypeOptions from '../../../static/building-types'
import { Formik, Form } from 'formik'
import { Field } from '../FormFields'
import {
  ADD_BUILDING_LOCATIONS,
  COPY_BUILDING_LOCATIONS,
  GET_BUILDING_LOCATIONS
} from '../../../utils/graphql/queries/location'
import { GET_BUILDING_EQUIPMENT } from '../../../utils/graphql/queries/equipment'

export class LocationBulkForm extends React.Component {
  static propTypes = {
    building: PropTypes.object.isRequired,
    buildingLocation: PropTypes.object,
    onClose: PropTypes.func.isRequired
  }

  state = {
    currentLocation:
      this.props.buildingLocation && this.props.buildingLocation.location,
    useTypeOptions,
    floorOptions,
    conditioningOptions,
    userOptions
  }

  validateForm = (values, type, errors = {}) => {
    if (!values.usetype || values.usetype == '') {
      errors.usetype = 'Enter Use Type'
    }
    if (!values.nameto || values.nameto == '') {
      errors.nameto = 'Enter Name To'
    }
    if (!values.namefrom || values.namefrom == '') {
      errors.namefrom = 'Enter Name From'
    }
    if (values.namefrom > 0 && values.nameto > 0) {
      if (values.namefrom > values.nameto) {
        errors.namefrom = 'Valid Name From'
      }
    }
    if (!values.floor || values.floor == '') {
      errors.floor = 'Enter Floor'
    }
    // if (!values.conditioning || values.conditioning == '') {
    //   errors.name = 'Enter conditioning'
    // }
    // if (!values.user || values.user == '') {
    //   errors.name = 'Enter user'
    // }
    if (type == 'submit') {
      return errors
    } else {
      return errors.length == 0
    }
  }

  onSubmit = (executeMutation, values) => {
    const input = {
      buildingId: this.props.building._id,
      usetype: values.usetype.toString(),
      namefrom: values.namefrom,
      nameto: values.nameto,
      conditioning: values.conditioning.toString(),
      user: values.user.toString(),
      floor: Number(values.floor)
    }

    if (this.props.buildingLocation) {
      return executeMutation({
        variables: {
          input: {
            ...input,
            buildingLocationId: this.props.buildingLocation._id
          }
        }
      }).then(this.props.onClose())
    }
    return executeMutation({
      variables: {
        input
      }
    }).then(this.props.onClose())
  }

  render() {
    const {
      useTypeOptions,
      currentLocation,
      conditioningOptions,
      userOptions,
      floorOptions
    } = this.state
    const { buildingLocation, building } = this.props

    const initialValues = {
      namefrom: '',
      nameto: '',
      usetype: (currentLocation && currentLocation.usetype.toLowerCase()) || '',
      floor: (currentLocation && currentLocation.floor) || '1',
      conditioning:
        (currentLocation && currentLocation.conditioning.toLowerCase()) || '',
      user: (currentLocation && currentLocation.user.toLowerCase()) || ''
    }

    const mutation = buildingLocation
      ? COPY_BUILDING_LOCATIONS
      : ADD_BUILDING_LOCATIONS

    return (
      <Mutation
        mutation={mutation}
        refetchQueries={result => [
          {
            query: GET_BUILDING_LOCATIONS,
            variables: { id: this.props.building._id }
          },
          {
            query: GET_BUILDING_EQUIPMENT,
            variables: { buildingId: this.props.building._id }
          }
        ]}
      >
        {(executeMutation, { data, loading }) => (
          <div
            className={classNames(stylesAsset.extras)}
            style={{ marginLeft: 0 }}
          >
            <div
              className={classNames(
                stylesAsset.extrasDropdown,
                stylesAsset.extrasDropdownRight,
                styles.bulkDropdownStyle
              )}
            >
              <div
                onClick={() => this.props.onClose()}
                className={styles.bulkLocationHeader}
              >
                <div>Bulk Copy a Location</div>
                <i className="material-icons">close</i>
              </div>
              <div className={styles.formWrapper}>
                <Formik
                  ref={this.formik}
                  initialValues={initialValues}
                  validate={values => this.validateForm(values, 'submit')}
                  isInitialValid={values =>
                    this.validateForm(values, 'initial')
                  }
                  onSubmit={buildingLocation =>
                    this.onSubmit(executeMutation, buildingLocation)
                  }
                >
                  {({ values, isSubmitting, isValid, setFieldValue }) => (
                    <Form className={styles.form} id={this.props.name}>
                      <div className={styles.formInputFields}>
                        <div className={styles.firstField}>
                          <Field
                            label="From"
                            component="input"
                            type="number"
                            name="namefrom"
                            placeholder="e.g. 100"
                            data-test="location-bulk-namefrom"
                          />
                        </div>
                        <div className={styles.secondField}>
                          <Field
                            label="To"
                            component="input"
                            type="number"
                            name="nameto"
                            placeholder="e.g. 110"
                            data-test="location-bulk-nameto"
                          />
                        </div>
                        <div className={styles.thirdField}>
                          <Field
                            label="Use Type"
                            component="select"
                            name="usetype"
                            placeholder="Select"
                            data-test="location-bulk-usetype"
                          >
                            <option defaultValue value="" disabled>
                              Select a use type
                            </option>
                            {useTypeOptions.map(({ name, value }) => (
                              <option key={value} value={value}>
                                {name}
                              </option>
                            ))}
                          </Field>
                        </div>
                        <div className={styles.fourthField}>
                          <Field
                            label="Floor"
                            component="select"
                            name="floor"
                            placeholder="Select"
                            data-test="location-bulk-floor"
                          >
                            <option defaultValue value="" disabled>
                              Select Floor
                            </option>
                            {floorOptions(building).map(({ name, value }) => (
                              <option key={value} value={value}>
                                {name}
                              </option>
                            ))}
                          </Field>
                        </div>
                        <div className={styles.fifthField}>
                          <Field
                            label="Conditioning"
                            component="select"
                            name="conditioning"
                            placeholder="Select"
                            data-test="location-bulk-conditioning"
                          >
                            <option defaultValue value="" disabled>
                              Select Conditioning
                            </option>
                            {conditioningOptions.map(({ name, value }) => (
                              <option key={value} value={value}>
                                {name}
                              </option>
                            ))}
                          </Field>
                        </div>
                        <div className={styles.sixthField}>
                          <Field
                            label="User"
                            component="select"
                            name="user"
                            placeholder="Select"
                            data-test="location-bulk-user"
                          >
                            <option defaultValue value="" disabled>
                              Select User
                            </option>
                            {userOptions.map(({ name, value }) => (
                              <option key={value} value={value}>
                                {name}
                              </option>
                            ))}
                          </Field>
                        </div>
                      </div>
                      <button
                        className={classNames(
                          styles.button,
                          styles.buttonPrimary,
                          { [styles.buttonDisable]: !isValid }
                        )}
                        type="submit"
                        disabled={!isValid}
                        style={{ width: '100%', margin: '1.2em 0' }}
                        data-test="location-bulk-add"
                      >
                        {this.props.buildingLocation ? 'Bulk Copy' : 'Bulk Add'}
                      </button>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          </div>
        )}
      </Mutation>
    )
  }
}

export default LocationBulkForm
