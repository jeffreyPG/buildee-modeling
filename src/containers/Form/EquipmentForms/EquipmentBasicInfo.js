import React, { useState, useEffect } from 'react'
import { Field } from 'formik'
import classNames from 'classnames'
import styles from './EquipmentBasicInfo.scss'
import Link from '../../../components/UI/Link'
import Categorization from 'components/Categorization'

const EquipmentBasicInfo = ({
  values,
  disabled,
  onCategoryChange,
  onTagChange,
  onIdChange,
  handleEditEquipmentDetails,
  isCreate,
  formValues,
  showTagField,
  showIdField
}) => {
  const [category, setCategory] = useState('')
  const [application, setApplication] = useState('')
  const [technology, setTechnology] = useState('')

  useEffect(() => {
    setCategory(
      !formValues.category ||
        formValues.category === 'default' ||
        formValues.category === 'all'
        ? ''
        : formValues.category
    )
  }, [formValues.category])

  useEffect(() => {
    setApplication(
      !formValues.application ||
        formValues.application === 'default' ||
        formValues.application === 'all'
        ? ''
        : formValues.application
    )
  }, [formValues.application])

  useEffect(() => {
    setTechnology(
      formValues.technology === '' ||
        formValues.technology === 'default' ||
        formValues.technology === 'all'
        ? ''
        : formValues.technology
    )
  }, [formValues.technology])

  return (
    <div>
      {!isCreate && (
        <Link
          title={'Edit'}
          className={styles.editEquipmentDetails}
          onClick={handleEditEquipmentDetails}
        />
      )}
      <div className={styles.baseInfoContainer}>
        {showTagField && (
          <div className={styles.baseInfoItem}>
            <label className={styles.label}>Tag</label>
            <Field
              name='Tag'
              component='input'
              type='text'
              value={values.tag}
              onChange={e => onTagChange(e.target.value)}
            />
          </div>
        )}
        {showIdField && (
          <div className={styles.baseInfoItem}>
            <label className={styles.label}>ID</label>
            <Field
              name='ID'
              component='input'
              type='text'
              value={values.id}
              onChange={e => onIdChange(e.target.value)}
            />
          </div>
        )}
      </div>
      <div className={classNames(styles.row, styles.schemaDropdowns)}>
        <Categorization
          category={category}
          application={application}
          technology={technology}
          hideAllOption={true}
          hideEmptyMenu={true}
          handleCategory={(value, hasSubMenu) => {
            let needToUpdate = category !== value
            setCategory(value)
            if (needToUpdate) {
              setApplication('')
              setTechnology('')
            }
            if (value === '' || !hasSubMenu) {
              onCategoryChange({
                category: value || '',
                application: '',
                technology: ''
              })
            }
          }}
          handleApplication={(value, hasSubMenu) => {
            let needToUpdate = application !== value
            setApplication(value)
            if (needToUpdate) {
              setTechnology('')
            }
            if (value === '' || !hasSubMenu) {
              onCategoryChange({
                category: category || '',
                application: value || '',
                technology: ''
              })
            }
          }}
          handleTechnology={value => {
            setTechnology(value)
            onCategoryChange({
              category: category || '',
              application: application || '',
              technology: value || ''
            })
          }}
          target='equipment'
        />
      </div>
    </div>
  )
}

export default EquipmentBasicInfo
