import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import styles from './Filter.scss'
import buildingStyles from '../Building/Building.scss'
import { sortFunction } from 'utils/Portfolio'

class DashBoardFilter extends Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    handleAddFilter: PropTypes.func.isRequired,
    FilterOptions: PropTypes.array.isRequired,
    handleToggleFilter: PropTypes.func.isRequired
  }

  state = {
    selectedMenu: null,
    selectedSubMenu: null,
    selectedItem: null
  }

  componentDidMount = () => {
    let { FilterOptions } = this.props
    if (FilterOptions.length == 1) {
      this.setState({
        selectedMenu: FilterOptions[0]
      })
    }
  }
  UNSAFE_componentWillMount = () => {
    document.addEventListener('mousedown', this.handleClick, false)
  }

  componentWillUnmount = () => {
    document.removeEventListener('mousedown', this.handleClick, false)
    this.props.handleToggleFilter(false)
  }

  handleClick = e => {
    if (this.node && this.node.contains(e.target)) {
      // the click is inside, continue to menu links
      return
    }
    // otherwise, toggle (close) the dropdowns
    this.props.handleToggleFilter(false)
  }

  handleToggle = () => {
    this.props.handleToggleFilter()
  }

  handleExpandMenu = item => {
    const { selectedMenu } = this.state
    this.setState({
      selectedMenu:
        selectedMenu && selectedMenu.value === item.value ? null : item
    })
  }

  handleExpandSubMenu = item => {
    const { selectedSubMenu } = this.state
    this.setState({
      selectedSubMenu:
        selectedSubMenu && selectedSubMenu.value === item.value ? null : item
    })
  }

  handleAddFilter = item => {
    this.setState({ selectedItem: item })
    this.props.handleToggleFilter(false)
    this.props.handleAddFilter(item)
  }

  render() {
    const { selectedMenu, selectedSubMenu, selectedItem } = this.state
    const { flagRight, user, FilterOptions } = this.props
    if (selectedItem) return <div></div>
    return (
      <div
        className={classNames(
          styles.filterContainer,
          flagRight ? buildingStyles.extrasDropdownRight : ''
        )}
        ref={node => (this.node = node)}
      >
        <div className={styles.filterContainerBody}>
          {FilterOptions.map((item, index) => {
            let subFields = item.subFields || []
            subFields = sortFunction(subFields, 'name')
            return (
              <div key={`filterOption-${index}`}>
                <div
                  className={styles.filterMenu}
                  onClick={() => this.handleExpandMenu(item)}
                >
                  {item.name}
                  {selectedMenu && selectedMenu.value === item.value ? (
                    <i className="material-icons">expand_less</i>
                  ) : (
                    <i className="material-icons">expand_more</i>
                  )}
                </div>
                {selectedMenu &&
                selectedMenu.value === item.value &&
                subFields.length ? (
                  <div className={styles.filterMenuSub}>
                    {subFields.map((field, index) => {
                      if (field.subFields) {
                        let subSubFields = field.subFields || []
                        subSubFields = sortFunction(subSubFields, 'name')
                        return (
                          <div key={`subsubmenu-${index}`}>
                            <div
                              className={styles.filterMenuSubMenu}
                              onClick={() => this.handleExpandSubMenu(field)}
                            >
                              {field.name}
                              {selectedSubMenu &&
                              selectedSubMenu.value === field.value ? (
                                <i className="material-icons">expand_less</i>
                              ) : (
                                <i className="material-icons">expand_more</i>
                              )}
                            </div>
                            {selectedSubMenu &&
                            selectedSubMenu.value === field.value &&
                            selectedSubMenu.subFields.length ? (
                              <div>
                                {subSubFields.map((subFieldFilter, ind) => {
                                  if (
                                    !user.products ||
                                    (user.products.buildeeNYC !== 'access' &&
                                      subFieldFilter.value.includes(
                                        'nycfields'
                                      ))
                                  )
                                    return null
                                  return (
                                    <div
                                      className={styles.filterMenuSubMenuItem}
                                      key={`sub-sub-${subFieldFilter.value} - ${ind}`}
                                      onClick={() =>
                                        this.handleAddFilter(subFieldFilter)
                                      }
                                    >
                                      {subFieldFilter.name}
                                    </div>
                                  )
                                })}
                              </div>
                            ) : null}
                          </div>
                        )
                      }
                      if (
                        !user.products ||
                        (user.products.buildeeNYC !== 'access' &&
                          field.value.includes('nycfields'))
                      )
                        return null
                      return (
                        <div
                          className={styles.filterMenuSubItem}
                          key={`sub-menu-${field.value} - ${index}`}
                          onClick={() => this.handleAddFilter(field)}
                        >
                          {field.name}
                        </div>
                      )
                    })}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}

export default DashBoardFilter
