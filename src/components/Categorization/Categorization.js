import React, { useState, useEffect, useMemo } from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames'
import _ from 'lodash'
import { getAllCategorizationdata } from 'routes/Organization/modules/organization'
import { parentNodeHasClass } from 'utils/Utils'
import { Loader } from 'utils/Loader'

import styles from './Categorization.scss'
import headerStyles from 'containers/Header/LoggedInHeader.scss'

const Categorization = props => {
  const [categorizationData, setCategorizationData] = useState([])
  const [category, setCategory] = useState('')
  const [application, setApplication] = useState('')
  const [technology, setTechnology] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [firstDropdownOpen, setFirstDropdownOpen] = useState(false)
  const [secondDropdownOpen, setSecondDropdownOpen] = useState(false)
  const [thirdDropdownOpen, setThirdDropdownOpen] = useState(false)

  const {
    getAllCategorizationdata,
    categorizationList,
    hideAllOption = false,
    hideEmptyMenu = false,
    hasPopulateOption = false,
    populateData = {},
    showOnlyCategory = false,
    target = 'equipment'
  } = props

  useEffect(() => {
    setCategory(
      !props.category ||
        props.category === 'default' ||
        props.category === 'all'
        ? ''
        : props.category
    )
  }, [props.category])

  useEffect(() => {
    setApplication(
      !props.application ||
        props.application === 'default' ||
        props.application === 'all'
        ? ''
        : props.application
    )
  }, [props.application])

  useEffect(() => {
    setTechnology(
      props.technology === '' ||
        props.technology === 'default' ||
        props.technology === 'all'
        ? ''
        : props.technology
    )
  }, [props.technology])

  useEffect(async () => {
    try {
      setIsLoading(true)
      await getAllCategorizationdata(target)
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const handleClick = e => {
      if (parentNodeHasClass(e.target, 'reportsClick')) return
      setFirstDropdownOpen(false)
      setSecondDropdownOpen(false)
      setThirdDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClick, false)
    return () => {
      document.removeEventListener('mousedown', handleClick, false)
    }
  }, [])

  const setAllData = () => {
    const groupedByCategory = _.groupBy(categorizationList, 'category.value')
    let newCategoryItems = []
    let keys = Object.keys(groupedByCategory).sort((itemA, itemB) => {
      return itemA.toLowerCase() > itemB.toLowerCase()
        ? 1
        : itemB.toLowerCase() > itemA.toLowerCase()
        ? -1
        : 0
    })
    if (!hideAllOption) {
      newCategoryItems.push({
        value: null,
        displayName: 'All Categories',
        subItems: []
      })
    }
    let categorySet = new Set()
    for (let categoryKey of keys) {
      const items = groupedByCategory[categoryKey] || []
      let categoryName = items?.[0]?.category?.displayName ?? categoryKey
      if (categoryKey === null || categoryKey === 'null') continue
      if (hasPopulateOption) {
        let populateCategories = populateData?.['category'] || []
        if (!populateCategories.includes(categoryName)) continue
      }
      let newCategoryItem = {
        value: categoryKey,
        displayName: categoryName,
        subItems: []
      }
      if (categorySet.has(categoryName)) continue
      categorySet.add(categoryName)
      const groupedByApplication = _.groupBy(items, 'application.value')
      let newApplicationItems = []

      if (!hideAllOption) {
        newApplicationItems.push({
          value: null,
          displayName: 'All Applications',
          subItems: []
        })
      }
      const applicationKeys = Object.keys(groupedByApplication).sort(
        (itemA, itemB) => {
          return itemA.toLowerCase() > itemB.toLowerCase()
            ? 1
            : itemB.toLowerCase() > itemA.toLowerCase()
            ? -1
            : 0
        }
      )

      let applicationSet = new Set()
      for (let applicationKey of applicationKeys) {
        const items = groupedByApplication[applicationKey] || []
        let applicationName =
          items?.[0]?.application?.displayName ?? applicationKey
        if (applicationKey === null || applicationKey === 'null') continue
        if (hasPopulateOption) {
          let populatedApplications = populateData?.['app'] || []
          if (!populatedApplications.includes(applicationName)) continue
        }
        if (applicationSet.has(applicationName)) continue
        applicationSet.add(applicationName)
        const technologies = items.map(item => ({
          value: item.technology?.value || null,
          displayName: item.technology?.displayName || null
        }))
        const hasNullTechnologies =
          technologies.filter(item => !item.displayName || !item.value).length >
          0

        const newApplicationItem = {
          value: applicationKey,
          displayName: applicationName,
          subItems: (!hasNullTechnologies
            ? [
                ...technologies.filter(
                  item => !!item.displayName && !!item.value
                )
              ].sort((itemA, itemB) => {
                const valueA = itemA.displayName
                const valueB = itemB.displayName
                return valueA.toLowerCase() > valueB.toLowerCase()
                  ? 1
                  : valueB.toLowerCase() > valueA.toLowerCase()
                  ? -1
                  : 0
              })
            : [
                {
                  value: null,
                  displayName: 'All Technologies'
                },
                ...technologies
                  .filter(item => !!item.displayName && !!item.value)
                  .sort((itemA, itemB) => {
                    const valueA = itemA.displayName
                    const valueB = itemB.displayName
                    return valueA.toLowerCase() > valueB.toLowerCase()
                      ? 1
                      : valueB.toLowerCase() > valueA.toLowerCase()
                      ? -1
                      : 0
                  })
              ]
          ).filter(item => {
            if (item.displayName === 'All Technologies') return true
            if (hasPopulateOption) {
              let populatedTechnologies = populateData?.['tech'] || []
              return populatedTechnologies.includes(item.displayName)
            }
            return true
          })
        }
        if (newApplicationItem.subItems.length === 1) {
          const subItems = newApplicationItem.subItems || []
          if (subItems[0].displayName === 'All Technologies') {
            newApplicationItem = Object.assign({}, newApplicationItem, {
              subItems: []
            })
          }
        }
        newApplicationItems.push(newApplicationItem)
      }
      newCategoryItem['subItems'] = newApplicationItems
      if (showOnlyCategory) {
        newCategoryItem['subItems'] = []
      }
      newCategoryItems.push(newCategoryItem)
    }
    setCategorizationData(newCategoryItems)
  }

  const handleOpenDropdown = () => {
    setFirstDropdownOpen(true)
  }

  const handleOpenSecondDropdown = (value, hasSubMenu) => {
    props.handleCategory(value, hasSubMenu)
    if (hasSubMenu) setSecondDropdownOpen(true)
    else {
      setFirstDropdownOpen(false)
    }
  }

  const handleOpenThirdDropdown = (value, hasSubMenu) => {
    props.handleApplication(value, hasSubMenu)
    if (hasSubMenu) setThirdDropdownOpen(true)
    else {
      setFirstDropdownOpen(false)
      setSecondDropdownOpen(false)
    }
  }

  const handleCloseThirdDropdown = value => {
    props.handleTechnology(value)
    setThirdDropdownOpen(false)
    setSecondDropdownOpen(false)
    setFirstDropdownOpen(false)
  }

  useEffect(() => {
    setAllData()
  }, [categorizationList, populateData, hasPopulateOption])

  const label = useMemo(() => {
    if (isLoading) return 'Select Category'
    if (technology && technology !== 'default') {
      const findTechnology = _.find(
        categorizationList,
        item => item.technology && item.technology.value === technology
      )
      return findTechnology?.technology?.displayName || 'All Technologies'
    }
    if (application && application !== 'default') {
      const findApplication = _.find(
        categorizationList,
        item => item.technology && item.application.value === application
      )
      return findApplication?.application?.displayName || 'All Applications'
    }
    if (category && category !== 'default') {
      const findCategory = _.find(categorizationData, { value: category })
      return findCategory?.displayName || 'All Categories'
    }
    return 'Select Category'
  }, [
    category,
    isLoading,
    categorizationData,
    categorizationList,
    technology,
    application
  ])

  return (
    <div
      className={classNames(
        styles.dropdown,
        headerStyles.link,
        'reportsClick',
        {
          [styles.disabled]: isLoading
        }
      )}
      onClick={handleOpenDropdown}
      data-test='category'
    >
      {isLoading ? (
        <Loader size='button' />
      ) : (
        <>
          <span>{label}</span>
          <div
            className={classNames(styles.selectIcons, {
              [styles['selectIcons-opened']]: firstDropdownOpen
            })}
          >
            <i className={classNames('material-icons', styles.selectArrow)}>
              arrow_drop_down
            </i>
          </div>
        </>
      )}

      {firstDropdownOpen && (
        <ul className={styles.firstDropdown}>
          {categorizationData.map(categoryItem => {
            return (
              <li
                key={categoryItem.value}
                onClick={event => {
                  event.stopPropagation()
                  handleOpenSecondDropdown(
                    categoryItem.value,
                    categoryItem.subItems.length
                  )
                }}
              >
                <div
                  className={classNames(styles.label, {
                    [styles.active]: category === categoryItem.value
                  })}
                >
                  {categoryItem.displayName}
                </div>
                {secondDropdownOpen &&
                  category === categoryItem.value &&
                  categoryItem.subItems.length > 0 && (
                    <ul className={styles.secondDropdown}>
                      {categoryItem.subItems.map(applicationItem => (
                        <li
                          key={applicationItem.value}
                          onClick={event => {
                            event.stopPropagation()
                            handleOpenThirdDropdown(
                              applicationItem.value,
                              applicationItem.subItems.length
                            )
                          }}
                        >
                          <div
                            className={classNames(styles.label, {
                              [styles.active]:
                                application === applicationItem.value
                            })}
                          >
                            {applicationItem.displayName}
                          </div>
                          {thirdDropdownOpen &&
                            application === applicationItem.value &&
                            applicationItem.subItems.length > 0 && (
                              <ul className={styles.thirdDropdown}>
                                {applicationItem.subItems.map(
                                  technologyItem => (
                                    <div key={technologyItem.value}>
                                      <li
                                        onClick={event => {
                                          event.stopPropagation()
                                          handleCloseThirdDropdown(
                                            technologyItem.value
                                          )
                                        }}
                                      >
                                        <div
                                          className={classNames(styles.label, {
                                            [styles.active]:
                                              technology ===
                                              technologyItem.value
                                          })}
                                        >
                                          {technologyItem.displayName}
                                        </div>
                                      </li>
                                    </div>
                                  )
                                )}
                              </ul>
                            )}
                        </li>
                      ))}
                    </ul>
                  )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

const mapStateToProps = state => ({
  categorizationList: state.organization.categorizationData || []
})

const mapDispatchToProps = {
  getAllCategorizationdata
}

export default connect(mapStateToProps, mapDispatchToProps)(Categorization)
