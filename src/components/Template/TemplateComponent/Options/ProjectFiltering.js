import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import projectFilters from 'static/project-filters.json'
import { ProjectOrdering } from './'
import { ProjectConfiguration } from './'
import { formatCamelCaseNotation, isProdEnv } from 'utils/Utils'
import {
  bodyTemplate,
  templateUpdateError
} from 'routes/Template/modules/template'
import Categorization from 'components/Categorization'
import ProjectCardOrdering from './ProjectCardOrdering'
import styles from './Projects.scss'

export class ProjectFiltering extends Component {
  static propTypes = {
    bodyTemplate: PropTypes.func.isRequired,
    templateUpdateError: PropTypes.func.isRequired,
    body: PropTypes.array.isRequired,
    index: PropTypes.number.isRequired
  }

  state = {
    filteringFields: {
      type: {
        open: false,
        data: [
          'Energy Efficiency Measure (EEM)',
          'Generation Measure',
          'O&M Measure',
          'RCx Measure (RCM)'
        ]
      },
      category: { open: false, data: [] },
      application: { open: false, data: [] },
      technology: { open: false, data: [] }
    },
    application: '',
    category: '',
    technology: '',
    allCategorizationData: []
  }

  componentDidMount = () => {
    // populate category data on load
    let tempFilteringFields = { ...this.state.filteringFields }
    const betaCheckFlag = isProdEnv(process.env.DOMAIN_ENV)
    const xcelOrgId = '5f32b52ce21cdd0011ba2f7c'
    const myOrgId = '5e84e3722f10c40010b46f33'
    const specificOrgId = betaCheckFlag ? xcelOrgId : myOrgId
    const pecoOrgID = '5fd127af86d7900011443308'
    if (
      this.props.organizationView &&
      this.props.organizationView._id === specificOrgId
    ) {
      tempFilteringFields = {
        ...tempFilteringFields,
        type: {
          open: false,
          data: [
            'CEEM',
            'CEEM/DI',
            'CO',
            'Energy Efficiency Measure (EEM)',
            'Generation Measure',
            'O&M Measure',
            'RCx Measure (RCM)'
          ]
        }
      }
    }
    if (this.props.organizationView) {
      const isPecoOrg =
        betaCheckFlag && this.props.organizationView._id === pecoOrgID
      if (
        isPecoOrg &&
        tempFilteringFields.type &&
        tempFilteringFields.type.data
      ) {
        tempFilteringFields.type.data = tempFilteringFields.type.data.concat(
          'Survey'
        )
      }
    }
    let categories = { open: false, data: [] }
    Object.keys(projectFilters).map(category => {
      categories.data.push(category)
    })
    categories.data = categories.data.filter(item => item !== 'LL87')
    tempFilteringFields.category = categories
    tempFilteringFields.application = this.populateApplicationData()
    tempFilteringFields.technology = this.populateTechnologyData()
    const allCategorizationData = this.getAllCategorizationData()
    this.setState({
      filteringFields: tempFilteringFields,
      allCategorizationData
    })
  }

  openDropdown = (option, override) => {
    let tempFilteringFields = { ...this.state.filteringFields }
    Object.keys(tempFilteringFields).map(filter => {
      if (override === 'close') {
        tempFilteringFields[filter].open = false
        return
      }
      // if you're clicking on a drop down that is already open
      if (filter === option && tempFilteringFields[filter].open) {
        tempFilteringFields[filter].open = false
        // else, just toggle open it and close all others
      } else {
        tempFilteringFields[filter].open = filter === option ? true : false
      }
    })
    this.setState({ filteringFields: tempFilteringFields })
  }

  valueExists = (filter, value) => {
    let { body } = this.props
    let card = body[this.props.index]
    if (card.projectConfig.filter[filter]) {
      return card.projectConfig.filter[filter].some(el => {
        return el.name === value
      })
    } else {
      return false
    }
  }

  removeTemplateFilters = (filter, array) => {
    let body = JSON.parse(JSON.stringify(this.props.body))
    let card = body[this.props.index]
    if (card.projectConfig.filter && card.projectConfig.filter[filter]) {
      card.projectConfig.filter[filter] = card.projectConfig.filter[
        filter
      ].filter(a => {
        return array.indexOf(a.name) !== -1
      })
    }
    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }

  populateApplicationData = () => {
    let applications = { open: false, data: [] }
    Object.keys(projectFilters).map(category => {
      if (this.valueExists('category', category)) {
        Object.keys(projectFilters[category]).map(application => {
          applications.data.push(application)
        })
      }
    })
    this.removeTemplateFilters('application', applications.data)
    return applications
  }

  populateTechnologyData = () => {
    let technologies = { open: false, data: [] }
    Object.keys(projectFilters).map(category => {
      if (this.valueExists('category', category)) {
        Object.keys(projectFilters[category]).map(application => {
          if (this.valueExists('application', application)) {
            technologies.data = technologies.data.concat(
              projectFilters[category][application]
            )
          }
        })
      }
    })
    this.removeTemplateFilters('technology', technologies.data)
    return technologies
  }

  populateFilterOptions = filter => {
    // populate application and technology filters
    let tempFilteringFields = { ...this.state.filteringFields }
    if (filter === 'category') {
      tempFilteringFields.application = this.populateApplicationData()
      tempFilteringFields.technology = this.populateTechnologyData()
    } else if (filter === 'application') {
      tempFilteringFields.technology = this.populateTechnologyData()
    }
    this.setState({ filteringFields: tempFilteringFields })
  }

  addFilterOption = (option, filter) => {
    let body = JSON.parse(JSON.stringify(this.props.body))
    let card = body[this.props.index]
    // create an array for the filter if it doesn't already exist
    if (!card.projectConfig.filter[filter]) {
      card.projectConfig.filter[filter] = []
    }
    if (filter === 'category' || filter === 'application') {
      if (card.projectConfig.format === 'fullDetails') {
        card.projectConfig = {
          ...card.projectConfig,
          styles: {
            chs: 'h1',
            phs: 'h2',
            layout: 'oneColumn'
          },
          content: []
        }
      }
      card.projectConfig.filter[filter].push({
        name: option,
        description: '',
        order: card.projectConfig.filter[filter].length + 1
      })
    } else {
      card.projectConfig.filter[filter].push({ name: option })
    }
    this.populateFilterOptions(filter)
    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }

  removeFilterOption = (option, filter) => {
    let body = JSON.parse(JSON.stringify(this.props.body))
    let card = body[this.props.index]
    card.projectConfig.filter[filter] = card.projectConfig.filter[
      filter
    ].filter(a => a.name !== option)
    // close the drop down when you remove an option
    this.openDropdown(filter, 'close')
    // reset order when you remove an option
    card.projectConfig.filter[filter].forEach(
      (option, index) => (option.order = index + 1)
    )
    // remove items from the filtering lists, if necessary
    this.populateFilterOptions(filter)
    this.props.bodyTemplate(body)
    this.props.templateUpdateError()
  }

  alphabetizeFilters = (a, b) => {
    return a.name > b.name ? 1 : -1
  }

  getAllCategorizationData = () => {
    let list = []
    for (let categoryKey in projectFilters) {
      let applicationObj = projectFilters[categoryKey] || {}
      let hasCategoryData = false
      if (categoryKey === 'LL87') continue
      for (let applicationKey in applicationObj) {
        let hasApplicationData = false
        if (!hasCategoryData) hasCategoryData = true
        let technologyObj = applicationObj[applicationKey] || {}
        for (let technologykey in technologyObj) {
          if (!hasApplicationData) hasApplicationData = true
          list.push({
            category: {
              displayName: categoryKey,
              value: categoryKey
            },
            application: {
              displayName: applicationKey,
              value: applicationKey
            },
            technology: {
              displayName: technologykey,
              value: technologykey
            }
          })
        }
        if (!hasApplicationData) {
          list.push({
            category: {
              displayName: categoryKey,
              value: categoryKey
            },
            application: {
              displayName: applicationKey,
              value: applicationKey
            },
            technology: {
              displayName: null,
              value: null
            }
          })
        }
      }
      if (!hasCategoryData) {
        list.push({
          category: {
            displayName: categoryKey,
            value: categoryKey
          },
          application: {
            displayName: null,
            value: null
          },
          technology: {
            displayName: null,
            value: null
          }
        })
      }
    }
    return list
  }

  render() {
    const { index, body } = this.props
    const projectConfig = body[index].projectConfig
    const { filteringFields, allCategorizationData } = this.state
    return (
      <div className={styles.filter}>
        <h3>Filter your measures</h3>
        <div className={styles.projectFilterDropdown}>
          {Object.keys(filteringFields).map((filter, index) => {
            if (
              filter === 'category' ||
              filter === 'application' ||
              filter === 'technology'
            )
              return null
            return (
              <div className={styles.dropdownSingle} key={index}>
                {filteringFields[filter].data.length > 0 && (
                  <div className={styles.dropdownSelect}>
                    <p>{formatCamelCaseNotation(filter)}</p>
                    <span onClick={e => this.openDropdown(filter)}>
                      <i className='material-icons'>expand_more</i>
                    </span>
                  </div>
                )}

                {filteringFields[filter].open &&
                  filteringFields[filter].data.length > 0 && (
                    <div className={styles.dropdownOptions}>
                      {filteringFields[filter].data.map((option, index) => {
                        // don't show anything if the option is already in the filter list
                        if (
                          projectConfig &&
                          projectConfig.filter &&
                          projectConfig.filter[filter] &&
                          projectConfig.filter[filter].length &&
                          projectConfig.filter[filter].filter(
                            e => e.name === option
                          ).length > 0
                        ) {
                          return
                        }
                        if (
                          this.props.user.products.buildeeNYC !== 'access' &&
                          option === 'NYC LL87 RCM'
                        ) {
                          return
                        }
                        return (
                          <p
                            key={index}
                            className='filter-option'
                            onClick={() => this.addFilterOption(option, filter)}
                          >
                            {option}
                          </p>
                        )
                      })}
                    </div>
                  )}

                <div className={styles.dropdownDisplay}>
                  {projectConfig &&
                    projectConfig.filter &&
                    projectConfig.filter[filter] &&
                    projectConfig.filter[filter].length > 0 && (
                      <div>
                        {projectConfig.filter[filter]
                          .sort(this.alphabetizeFilters)
                          .map((option, index) => {
                            return (
                              <p key={index}>
                                {option.name}
                                <span
                                  className='filter-option'
                                  onClick={() => {
                                    this.removeFilterOption(option.name, filter)
                                  }}
                                >
                                  <i className='material-icons filter-option'>
                                    close
                                  </i>
                                </span>
                              </p>
                            )
                          })}
                      </div>
                    )}
                </div>
              </div>
            )
          })}
          <div className={styles.categorizationContainer}>
            <div className={styles.categorizationContainerInput}>
              <Categorization
                category={this.state.category}
                application={this.state.application}
                technology={this.state.technology}
                handleCategory={val => {
                  this.setState({
                    category: val
                  })
                  this.addFilterOption(val, 'category')
                }}
                handleApplication={val => {
                  this.setState({
                    application: val
                  })
                  this.addFilterOption(val, 'application')
                }}
                handleTechnology={val => {
                  this.setState({
                    technology: val
                  })
                  this.addFilterOption(val, 'technology')
                }}
                hideAllOption={true}
                hideEmptyMenu={true}
                showOnlyCategory={true}
                target='measure'
              />
            </div>
            <div className={styles.categorizationContainerSelected}>
              {['category', 'application', 'technology'].map((filter, idx) => {
                return (
                  <div className={styles.dropdownDisplay} key={idx}>
                    {projectConfig &&
                      projectConfig.filter &&
                      projectConfig.filter[filter] &&
                      projectConfig.filter[filter].length > 0 && (
                        <div>
                          <div>
                            {filter === 'category'
                              ? 'Category'
                              : filter === 'application'
                              ? 'Application'
                              : 'Technology'}
                          </div>
                          {projectConfig.filter[filter]
                            .sort(this.alphabetizeFilters)
                            .map((option, index) => {
                              return (
                                <p key={index}>
                                  {option.name}
                                  <span
                                    className='filter-option'
                                    onClick={() => {
                                      this.removeFilterOption(
                                        option.name,
                                        filter
                                      )
                                    }}
                                  >
                                    <i className='material-icons filter-option'>
                                      close
                                    </i>
                                  </span>
                                </p>
                              )
                            })}
                        </div>
                      )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {projectConfig &&
          projectConfig.format !== 'summaryTable' &&
          projectConfig.format !== 'card' &&
          projectConfig.filter &&
          ((projectConfig.filter.category &&
            projectConfig.filter.category.length > 0) ||
            (projectConfig.filter.application &&
              projectConfig.filter.application.length > 0)) && (
            <ProjectOrdering
              handleUpdateTemplateState={this.props.handleUpdateTemplateState}
              index={this.props.index}
              filteringFields={this.state.filteringFields}
            />
          )}
        {projectConfig && projectConfig.format === 'fullDetails' && (
          <ProjectConfiguration
            handleUpdateTemplateState={this.props.handleUpdateTemplateState}
            index={this.props.index}
            filteringFields={this.state.filteringFields}
          />
        )}

        {projectConfig &&
          projectConfig.format === 'card' &&
          projectConfig.filter &&
          ((projectConfig.filter.category &&
            projectConfig.filter.category.length > 0) ||
            (projectConfig.filter.application &&
              projectConfig.filter.application.length > 0)) && (
            <ProjectCardOrdering
              handleUpdateTemplateState={this.props.handleUpdateTemplateState}
              index={this.props.index}
              filteringFields={this.state.filteringFields}
            />
          )}
      </div>
    )
  }
}

const mapDispatchToProps = {
  bodyTemplate,
  templateUpdateError
}

const mapStateToProps = state => ({
  body: state.template.templateViewBody || [],
  user: state.login.user || {},
  organizationView: state.organization.organizationView || {}
})

const withConnect = connect(mapStateToProps, mapDispatchToProps)

export default withConnect(ProjectFiltering)
