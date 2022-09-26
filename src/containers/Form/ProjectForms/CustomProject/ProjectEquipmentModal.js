import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Query } from 'react-apollo'
import classNames from 'classnames'

import SortableList from 'components/UI/SortableList'
import ListSearch from 'components/UI/ListSearch'
import { getUseTypeDisplayName } from 'containers/Form/EquipmentForms/selectors'

import { GET_BUILDING_EQUIPMENT_LIST } from 'utils/graphql/queries/equipment'
import { EQUIPMENT_CATEGORIZATION } from 'utils/graphql/queries/equipmentschema'
import { multiSelectChecker } from 'utils/Portfolio'

import styles from './ProjectEquipmentModal.scss'

class ProjectEquipmentModal extends Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired
  }

  state = {
    isGroupChecked: false,
    groupName: '',
    filters: {
      category: 'default',
      useType: 'default',
      spaceType: 'default'
    },
    keyword: '',
    selectedItems: [],
    sortKeys: {
      category: 'category',
      useType: 'useType',
      spaceType: 'spaceType'
    },
    columns: {
      name: {
        header: 'Name',
        sortKey: 'name',
        getValue: e => e || '-'
      },
      category: {
        header: 'Category',
        sortKey: 'category',
        getValue: e => e || '-'
      },
      application: {
        header: 'Application',
        sortKey: 'application',
        getValue: e => e || '-'
      },
      useType: {
        header: 'Building Use Type',
        sortKey: 'useType',
        getValue: l => (l && getUseTypeDisplayName(l)) || '-'
      },
      spaceType: {
        header: 'Space Type',
        sortKey: 'spaceType',
        getValue: l => (l && getUseTypeDisplayName(l)) || '-'
      },
      locationName: {
        header: 'Location Name',
        sortKey: 'locationName',
        getValue: l => l || '-'
      }
    }
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClick, false)
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClick, false)
  }

  handleClick = e => {
    if (this.node && this.node.contains(e.target)) {
      return
    }
    this.props.onClose()
  }

  handleCheckItem = (id, buildingEquipment = []) => {
    const { selectedItems } = this.state
    const { selectedEquipments = [] } = this.props
    const allIds = buildingEquipment
      .map(item => item._id)
      .filter(id => !selectedEquipments.includes(id))

    if (id === 'all') {
      let checkedAll =
        multiSelectChecker(selectedItems, allIds) &&
        multiSelectChecker(allIds, selectedItems)
      this.setState({ selectedItems: checkedAll ? [] : allIds })
    } else {
      let ids = []
      if (!selectedItems.includes(id)) {
        ids = [...selectedItems, id]
      } else {
        ids = selectedItems.filter(item => item !== id)
      }
      ids = [...new Set(ids)]
      ids = ids.filter(item => allIds.includes(item))
      this.setState({ selectedItems: ids })
    }
  }

  filterData = buildingEquipment => {
    let filtered = Array.from(buildingEquipment)
    if (this.state.keyword) {
      filtered = buildingEquipment.filter(
        be =>
          JSON.stringify(be)
            .toLowerCase()
            .indexOf(this.state.keyword.toString().toLowerCase()) > -1
      )
    }
    Object.keys(this.state.filters).forEach(filter => {
      let filterValue = this.state.filters[filter]
      if (filterValue !== 'default' && filterValue !== 'all') {
        filtered = filtered.filter(be => {
          let value = (be && be[filter]) || ''
          return value === filterValue
        })
      }
    })

    return filtered
  }

  handleSearch = keyword => {
    this.setState({ keyword })
  }

  handleFilter = filters => {
    this.setState({ filters })
  }

  toggleGroupCheckbox = event => {
    this.setState({ isGroupChecked: event.target.checked })
  }

  handleGroupNameChange = event => {
    this.setState({ groupName: event.target.value })
  }

  handleSubmit = () => {
    const { isGroupChecked, groupName, selectedItems = [] } = this.state
    const { onSubmit } = this.props
    onSubmit({
      isChecked: isGroupChecked,
      name: groupName,
      equipmentIds: [...new Set(selectedItems)]
    })
  }

  renderBuildingEquipments() {
    const {
      building,
      currentProject = {},
      selectedEquipments = []
    } = this.props
    const buildingId = building._id
    const { fields = [] } = currentProject
    let filterEquipmentType = ''
    let exisitingV2Field = _.find(fields, { name: 'existing_equipment__v2' })
    if (exisitingV2Field) {
      let equipmentData = exisitingV2Field.equipment || {}
      filterEquipmentType = equipmentData.type || ''
    }

    return (
      <Query
        query={EQUIPMENT_CATEGORIZATION}
        variables={{
          categorization: {
            application: null,
            category: null,
            technology: null
          }
        }}
        fetchPolicy="network-only"
      >
        {({ data = {} }) => {
          const categorization = (data && data.equipmentCategorization) || []
          return (
            <Query
              skip={!buildingId}
              query={GET_BUILDING_EQUIPMENT_LIST}
              variables={{ buildingId }}
              fetchPolicy="network-only"
            >
              {({ loading, error, data = {} }) => {
                let { buildingEquipment = [] } = data
                buildingEquipment = buildingEquipment.filter(item => {
                  if (!item) return false
                  const { libraryEquipment = {} } = item
                  if (!libraryEquipment) return false
                  const { type = '' } = libraryEquipment
                  return type === filterEquipmentType
                })
                buildingEquipment = buildingEquipment.map(be => {
                  let categoryItem =
                    (be &&
                      be.libraryEquipment &&
                      be.libraryEquipment.category) ||
                    ''
                  let applicationItem =
                    (be &&
                      be.libraryEquipment &&
                      be.libraryEquipment.application) ||
                    ''
                  let { categories = [], applications = [] } = categorization
                  let selectedCategory = _.find(categories, {
                    value: categoryItem
                  })
                  let selectedApplication = _.find(applications, {
                    value: applicationItem
                  })
                  return {
                    _id: be._id,
                    name:
                      (be && be.libraryEquipment && be.libraryEquipment.name) ||
                      '',
                    category:
                      (selectedCategory && selectedCategory.displayName) || '',
                    application:
                      (selectedApplication &&
                        selectedApplication.displayName) ||
                      '',
                    useType: (be && be.location && be.location.usetype) || '',
                    spaceType:
                      (be && be.location && be.location.spaceType) || '',
                    locationName: (be && be.location && be.location.name) || ''
                  }
                })

                return (
                  <div>
                    <div>
                      <ListSearch
                        listData={buildingEquipment || []}
                        sortKeys={this.state.sortKeys}
                        filters={this.state.filters}
                        filtersOptions={{
                          category: {
                            template: value => {
                              return value
                            },
                            getValue: value => {
                              return value
                            },
                            title: 'Category'
                          },
                          useType: {
                            template: value => {
                              return getUseTypeDisplayName(value)
                            },
                            getValue: value => {
                              return value
                            },
                            title: 'Building Use Type'
                          },
                          spaceType: {
                            template: value => {
                              return getUseTypeDisplayName(value)
                            },
                            getValue: value => {
                              return value
                            },
                            title: 'Space Type'
                          }
                        }}
                        showFilters={true}
                        onSearch={this.handleSearch}
                        onFilter={this.handleFilter}
                        lookupDisplayName={[]}
                      />
                      {!loading && buildingEquipment.length === 0 ? (
                        <div className={styles.emptyData}>
                          We couldn’t find any equipment that is compatible with
                          this measure. Add equipment in the assets tab.
                        </div>
                      ) : (
                        <div className={styles.equipmentList}>
                          <SortableList
                            listData={this.filterData(buildingEquipment)}
                            loading={loading}
                            error={error}
                            columns={this.state.columns}
                            onItemClick={this.handleEditEquipment}
                            showTotals={false}
                            isCheckable={true}
                            handleSelectItem={id => {
                              this.handleCheckItem(id, buildingEquipment)
                            }}
                            selectedItems={this.state.selectedItems}
                            disabledSelectedItems={
                              this.props.selectedEquipments
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )
              }}
            </Query>
          )
        }}
      </Query>
    )
  }

  render() {
    const { onClose } = this.props
    const { isGroupChecked, groupName } = this.state

    return (
      <div className={styles.modal}>
        <div className={styles.modalInner} ref={node => (this.node = node)}>
          <div className={styles.modalHeading}>
            <div>
              <i className={classNames('material-icons')}>add</i>
              <h2>Equipment</h2>
            </div>
            <div className={styles.modalClose} onClick={onClose}>
              <i className="material-icons">close</i>
            </div>
          </div>
          <div className={styles.modalBody}>
            {this.renderBuildingEquipments()}
          </div>
          <div className={styles.modalFooter}>
            {this.state.selectedItems.length > 1 ? (
              <div className={styles.modalFooterLeft}>
                <label className={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    onChange={this.toggleGroupCheckbox}
                    defaultChecked={isGroupChecked}
                    className={classNames(isGroupChecked ? styles.checked : '')}
                  />
                  <span>
                    Group equipment selections for bulk measure editing.
                  </span>
                </label>
                {isGroupChecked && <label>Name the group:</label>}
                {isGroupChecked && (
                  <input
                    type="text"
                    value={groupName}
                    onChange={this.handleGroupNameChange}
                    className={styles.groupNameInput}
                  />
                )}
              </div>
            ) : (
              <div className={styles.modalFooterLeft} />
            )}
            <div className={styles.modalFooterRight}>
              <button
                type="button"
                className={classNames(styles.button, styles.buttonSecondary)}
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className={classNames(styles.button, styles.buttonPrimary)}
                onClick={this.handleSubmit}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
export default ProjectEquipmentModal
