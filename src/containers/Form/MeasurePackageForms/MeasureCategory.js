import React from 'react'
import _ from 'lodash'
import { Query } from 'react-apollo'
import { EQUIPMENT_CATEGORIZATION } from '../../../utils/graphql/queries/equipmentschema'
import { getUnique } from '../../../static/building-space-types'
import Categorization from 'components/Categorization'
import styles from './MeasureCategory.scss'

const getKeyIsDisabled = (values, searchKey) => {
  const prevKeys = {
    application: 'category',
    technology: 'application'
  }
  const prevKey = prevKeys[searchKey]

  if (prevKey) {
    let value = values[prevKey]
    if (value) value = value.value
    if (!value) return true
  }
  return false
}

const MeasureCategory = ({ values, onCategoryChange }) => {
  return (
    <Query
      query={EQUIPMENT_CATEGORIZATION}
      variables={{
        categorization: {
          category: '',
          application: '',
          technology: ''
        }
      }}
    >
      {({ data, loading }) => {
        const categorization = (data && data.equipmentCategorization) || {}
        let {
          categories = [],
          applications = [],
          technologies = []
        } = categorization
        categories = getUnique(categories, 'value')
        applications = getUnique(applications, 'value')
        technologies = getUnique(technologies, 'value')
        let disabledApplication = getKeyIsDisabled(values, 'application')
        let disabledTechnology = getKeyIsDisabled(values, 'technology')

        return (
          <div className={styles.wrapper}>
            <Categorization
              category={values['category']?.value}
              application={values['application']?.value}
              technology={values['technology']?.value}
              handleCategory={val => {
                let displayName = ''
                if (val) {
                  let item = _.find(categories, { value: val })
                  if (item) displayName = item.displayName
                }
                if (values['category']?.value !== val) {
                  onCategoryChange({
                    category: {
                      value: val,
                      displayName
                    },
                    application: {
                      value: '',
                      displayName: 'All Applications'
                    },
                    technology: {
                      value: '',
                      displayName: 'All Technologies'
                    }
                  })
                } else {
                  onCategoryChange({
                    category: {
                      value: val,
                      displayName
                    }
                  })
                }
              }}
              handleApplication={val => {
                let displayName = ''
                if (val) {
                  let item = _.find(applications, { value: val })
                  if (item) displayName = item.displayName
                }
                if (values['application']?.value !== val) {
                  onCategoryChange({
                    application: {
                      value: val,
                      displayName
                    },
                    technology: {
                      value: '',
                      displayName: 'All Technologies'
                    }
                  })
                } else {
                  onCategoryChange({
                    application: {
                      value: val,
                      displayName
                    }
                  })
                }
              }}
              handleTechnology={val => {
                let displayName = ''
                if (val) {
                  let item = _.find(applications, { value: val })
                  if (item) displayName = item.displayName
                }
                onCategoryChange({
                  technology: {
                    value: val,
                    displayName
                  }
                })
              }}
              target='measure'
            />
          </div>
        )
      }}
    </Query>
  )
}

export default MeasureCategory
