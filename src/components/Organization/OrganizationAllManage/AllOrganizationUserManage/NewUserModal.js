import React, { useMemo, useState } from 'react'

import classNames from 'classnames'

import { Loader } from 'utils/Loader'

import { ErrorMessage, Formik, Form } from 'formik'
import { Field as FieldSelect } from 'containers/Form/FormFields'

import DropdownCheckbox from 'components/DropdownCheckbox'
import BaseModal from 'components/BaseModal'

import { formatFeatureFlagName } from 'utils/Utils'

import styles from './NewUserModal.scss'

export const NewUserModal = props => {
  const [selectedFeatureFlags, setSelectedFeatureFlags] = useState([])
  const { refetch, onClose, organizationList } = props

  const getCanDoAdminActions = organizationData => {
    const currentUserId = props.user?._id || null
    if (!currentUserId) return true
    const organizationRoles = (organizationData && organizationData.roles) || {}
    const organizationRole =
      (currentUserId && organizationRoles[currentUserId]) || 'editor'
    return organizationRole === 'admin' || organizationRole === 'owner'
  }

  const availableOrganizationList = useMemo(() => {
    return organizationList.filter(organization =>
      getCanDoAdminActions(organization)
    )
  }, [organizationList])

  const handleSubmitNewUser = async (values, { setSubmitting }) => {
    const payload = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      orgIds: values.organizationList,
      userRoles: values.organizationObj,
      featureFlags: selectedFeatureFlags
    }
    try {
      setSubmitting(true)
      await props.inviteNewUser(payload)
    } catch (error) {
      console.log('error', error)
    } finally {
      setSubmitting(false)
      onClose()
      refetch()
    }
  }

  const initialValues = {
    firstName: '',
    lastName: '',
    email: '',
    organizationList: [],
    organizationObj: {}
  }

  const validateForm = values => {
    let errors = {}
    if (values.firstName.length === 0) {
      errors.firstName = 'First Name is required'
    }
    if (values.lastName.length === 0) {
      errors.lastName = 'Last Name is required'
    }
    if (values.email.length === 0) {
      errors.email = 'Email is required'
    }

    if (values.organizationList.length === 0) {
      errors.organizationList = 'Organization is required'
    }
    const obj = Object.assign({}, values.organizationObj)
    if (values.organizationList.some(key => !obj[key])) {
      errors.organizationList = 'User Role is required'
    }

    return errors
  }

  const header = <div>Add User</div>

  const renderFeatureFlag = featureFlag => {
    if (!featureFlag) return null
    const isChecked = selectedFeatureFlags.includes(featureFlag._id)
    return (
      <div className={styles.featureFlagItem}>
        <div className={classNames(styles.checkboxContainer)}>
          <label>
            <input
              checked={isChecked}
              onChange={e => {
                setSelectedFeatureFlags(prevState =>
                  e.target.checked
                    ? [...prevState, featureFlag._id]
                    : prevState.filter(id => id !== featureFlag._id)
                )
              }}
              className={classNames(isChecked ? styles['checked'] : '')}
              type='checkbox'
            />
            <span></span>
          </label>
        </div>
        <span>{formatFeatureFlagName(featureFlag.name)}</span>
      </div>
    )
  }

  const renderFeatureFlagList = () => {
    const featureFlags =
      props.featureFlagList.filter(feature => feature.name !== 'docuSign') || []
    const length = featureFlags.length
    return (
      <>
        {featureFlags.map((featureFlag, index) => {
          let secondIndex
          if (length % 2 === 0) {
            if (index >= length / 2) return null
            secondIndex = length / 2 + index
          } else {
            if (index >= (length + 1) / 2) return null
            secondIndex = (length + 1) / 2 + index
          }
          return (
            <div className={styles.featureFlagRow}>
              {renderFeatureFlag(featureFlag)}
              {secondIndex < length &&
                renderFeatureFlag(featureFlags[secondIndex])}
            </div>
          )
        })}
      </>
    )
  }

  const body = (
    <div>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validate={values => validateForm(values)}
        onSubmit={handleSubmitNewUser}
      >
        {({
          values,
          isSubmitting,
          isValid,
          setFieldValue,
          setFieldTouched,
          errors
        }) => {
          return (
            <Form className={styles.form}>
              <div className={styles.formBody}>
                <div
                  className={classNames(styles.formRow, styles.formTwoColumns)}
                >
                  <div>
                    <FieldSelect
                      id={'firstName'}
                      name={'firstName'}
                      component='input'
                      placeholder={'First Name'}
                      type='text'
                      value={values['firstName']}
                    />
                    <ErrorMessage
                      name='firstName'
                      component='div'
                      className={styles.formError}
                    />
                  </div>
                  <div>
                    <FieldSelect
                      id={'lastName'}
                      name={'lastName'}
                      component='input'
                      placeholder={'Last Name'}
                      type='text'
                      value={values['lastName']}
                    />
                    <ErrorMessage
                      name='lastName'
                      component='div'
                      className={styles.formError}
                    />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <FieldSelect
                    id={'email'}
                    name={'email'}
                    component='input'
                    placeholder={'Email Address'}
                    type='text'
                    value={values['email']}
                  />
                  <ErrorMessage
                    name='email'
                    component='div'
                    className={styles.formError}
                  />
                </div>
                <div className={styles.selectFormRow}>
                  <DropdownCheckbox
                    options={availableOrganizationList.map(org => ({
                      value: org._id,
                      label: org.name
                    }))}
                    secondOptions={[
                      {
                        value: 'owner',
                        label: 'Owner'
                      },
                      {
                        value: 'admin',
                        label: 'Admin'
                      },
                      {
                        value: 'editor',
                        label: 'Editor'
                      }
                    ]}
                    hasSecondDropdown
                    selectedValues={values.organizationList || []}
                    selectedSecondValues={values.organizationObj || {}}
                    handleSelect={values => {
                      setFieldValue('organizationList', values)
                      setFieldTouched('organizationList')
                      setFieldTouched('organizationObj')
                    }}
                    handleSelectSecond={values => {
                      setFieldValue('organizationObj', values)
                      setFieldTouched('organizationList')
                      setFieldTouched('organizationObj')
                    }}
                    title='Organizations & Roles'
                    truncatTextLength={40}
                    isCentered={true}
                  />
                  <ErrorMessage
                    name='organizationList'
                    component='div'
                    className={styles.formError}
                  />
                </div>
                <div className={styles.featureFlagContainer}>
                  <div className={styles.featureFlag}>
                    {renderFeatureFlagList()}
                  </div>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <div className={styles.modalFooterRight}>
                  <button
                    type='submit'
                    className={classNames(styles.button, styles.buttonPrimary, {
                      [styles.buttonDisable]: !isValid || isSubmitting
                    })}
                    disabled={!isValid || isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader size='button' color='white' />
                    ) : (
                      'Invite'
                    )}
                  </button>
                </div>
              </div>
            </Form>
          )
        }}
      </Formik>
    </div>
  )

  return (
    <BaseModal
      onClose={onClose}
      header={header}
      body={body}
      footer={null}
      className={styles}
    />
  )
}

export default NewUserModal
