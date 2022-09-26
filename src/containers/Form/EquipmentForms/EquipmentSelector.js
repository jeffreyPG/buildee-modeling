import React from 'react'
import PropTypes from 'prop-types'
import { Query } from 'react-apollo'
import styles from './EquipmentSelector.scss'
import { EQUIPMENT_CATEGORIZATION } from '../../../utils/graphql/queries/equipmentschema'
import {
  SEARCH_EQUIPMENT,
  GET_RECENT_BUILDING_EQUIPMENT
} from '../../../utils/graphql/queries/equipment'
import SearchContext from '../../../components/UI/SearchContext'
import { getValueFromList } from './selectors'
import { Footer } from '../../../components/UI/Footer'

export class EquipmentSelector extends React.Component {
  static propTypes = {
    building: PropTypes.object,
    organization: PropTypes.object,
    onClear: PropTypes.func,
    onCreate: PropTypes.func,
    onSelect: PropTypes.func,
    onClose: PropTypes.func,
    onCategoryChange: PropTypes.func
  }

  state = {
    isSelected: false,
    notFound: false,
    refetchFunc: null,
    categoryObj: {
      technology: null,
      category: null,
      application: null
    }
  }

  handleClear = () => {
    const { onClear } = this.props

    this.setState({ isSelected: false })

    onClear()
  }

  handleCustom = selectedCategory => {
    const { onCreate } = this.props

    this.setState({ isSelected: true, notFound: false })

    onCreate(selectedCategory)
  }

  handleSelected = selected => {
    const { onSelect } = this.props
    if (selected.isCategorizationResult) {
      this.handleCustom(selected)
    } else {
      this.setState({ isSelected: true })
      onSelect(selected)
    }
  }

  handleCategorizationChange = (key, value) => {
    let { categoryObj } = this.state
    this.setState({
      categoryObj: {
        ...categoryObj,
        [key]: value
      }
    })
  }

  handleFilterChange = obj => {
    this.setState({
      categoryObj: obj
    })
  }

  render() {
    const { building, organization, onClose } = this.props

    const { isSelected, notFound, categoryObj } = this.state

    return (
      <div>
        <Query
          query={EQUIPMENT_CATEGORIZATION}
          variables={{
            categorization: categoryObj
          }}
        >
          {({ loading, error, data, refetch }) => {
            if (!this.state.refetchFunc) {
              this.setState({ refetchFunc: refetch })
            }
            const categorization = (data && data.equipmentCategorization) || {}
            const {
              categories = [],
              applications = [],
              technologies = []
            } = categorization

            if (isSelected) {
              return null
            }

            return (
              <Query
                query={GET_RECENT_BUILDING_EQUIPMENT}
                variables={{
                  buildingId: building._id,
                  recentEquipment: categoryObj
                }}
                fetchPolicy="cache-and-network"
              >
                {({ data, error }) => {
                  const initialData = data ? data.recentBuildingEquipment : []

                  return (
                    <SearchContext
                      searchPlaceholder="Search make, model, or equipment type"
                      query={SEARCH_EQUIPMENT}
                      filters={[
                        {
                          searchKey: 'category',
                          label: 'Category',
                          values: categories
                        },
                        {
                          searchKey: 'application',
                          label: 'Application',
                          values: applications
                        },
                        {
                          searchKey: 'technology',
                          label: 'Technology',
                          values: technologies
                        }
                      ]}
                      hasCategorization={true}
                      categoryFilter={this.state.categoryObj}
                      getSearchVariables={({ searchTerm, filters }) => ({
                        buildingId: building._id,
                        equipment: {
                          ...filters,
                          organization: organization._id
                        },
                        search: { value: searchTerm }
                      })}
                      columns={{
                        name: {
                          sortKey: 'name'
                        },
                        category: {
                          sortKey: 'category',
                          getValue: getValueFromList(categories)
                        },
                        application: {
                          sortKey: 'application',
                          getValue: getValueFromList(applications)
                        },
                        technology: {
                          sortKey: 'technology',
                          getValue: getValueFromList(technologies)
                        }
                      }}
                      initialData={initialData}
                      renderNoResults={() => (
                        <div>
                          No results for your search.{' '}
                          <a
                            className={styles.extrasInlineLink}
                            onClick={this.handleCustom}
                          >
                            Create Custom Equipment
                          </a>
                        </div>
                      )}
                      renderNoSearch={() => (
                        <div>
                          Search above or{' '}
                          <a
                            className={styles.extrasInlineLink}
                            onClick={this.handleCustom}
                          >
                            Create Custom Equipment
                          </a>
                        </div>
                      )}
                      onCreateCustom={this.handleCustom}
                      onItemClick={this.handleSelected}
                      onCategoryChange={this.handleCategorizationChange}
                      onFilter={this.handleFilterChange}
                      title="Recently Added"
                    />
                  )
                }}
              </Query>
            )
          }}
        </Query>
      </div>
    )
  }
}
export default EquipmentSelector
