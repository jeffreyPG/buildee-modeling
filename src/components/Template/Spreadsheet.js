import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import styles from './Template.scss'
import { Loader } from '../../utils/Loader'
import { parentNodeHasClass } from '../../utils/Utils'

export class Spreadsheet extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    templateList: PropTypes.array.isRequired,
    push: PropTypes.func.isRequired,
    getOrganizationSpreadsheetTemplates: PropTypes.func.isRequired,
    clearData: PropTypes.func.isRequired
  }

  state = {
    templateList: [],
    originalList: [],
    loadingTemplates: true,
    loadingFailed: '',
    sort: {
      key: 'name',
      direction: 'ASC'
    },
    showExtras: '',
    searchValue: '',
    loadingSearch: false,
    windowWidth: '',
    expandTemplateInfo: ''
  }

  componentWillUnmount = () => {
    this.props.clearData()
    this.setState({ showExtras: '', expandTemplateInfo: '' })
    document.removeEventListener('mousedown', this.handleClick, false)
    window.removeEventListener('resize', this.handleUpdateDimensions)
  }

  componentDidMount = () => {
    this.props.clearData()
    this.props
      .getOrganizationSpreadsheetTemplates()
      .then(() => {
        this.setState({
          originalList: this.props.templateList,
          templateList: this.props.templateList,
          loadingTemplates: false
        })
        if (this.state.templateList && this.state.templateList.length > 0) {
          let templates = this.state.templateList.sort(this.compare)
          this.setState({ templateList: templates })
        }
      })
      .catch(() => {
        this.setState({
          loadingFailed:
            'Sorry, your templates did not load. Please refresh or try again later.'
        })
      })
    document.addEventListener('mousedown', this.handleClick, false)
    window.addEventListener('resize', this.handleUpdateDimensions)
  }

  UNSAFE_componentWillReceiveProps = nextProps => {
    if (nextProps.templateList !== this.props.templateList) {
      let templates = this.state.templateList.sort(this.compare)
      this.setState({ templateList: templates })
    }
  }
  compare = (a, b) => {
    if (a.name.toLowerCase() < b.name.toLowerCase()) return -1
    if (a.name.toLowerCase() > b.name.toLowerCase()) return 1
    return 0
  }
  handleUpdateDimensions = () => {
    this.setState({ windowWidth: window.innerWidth })
  }

  handleMobileTemplateInfo = templateId => {
    if (this.state.windowWidth <= 699) {
      // toggle off
      if (templateId === this.state.expandTemplateInfo) {
        this.setState({ expandTemplateInfo: '' })
        return
      }
      this.setState({ expandTemplateInfo: templateId })
    }
  }

  handleClick = e => {
    if (parentNodeHasClass(e.target, 'extrasClick')) {
      return
    }
    // otherwise, toggle (close) the extras dropdown
    this.setState({ showExtras: '', expandTemplateInfo: '' })
  }

  sortTemplateList = templates => {
    return new Promise(resolve => {
      templates.sort(function(a, b) {
        return a.updatedAt > b.updatedAt
          ? -1
          : b.updatedAt > a.updatedAt
          ? 1
          : 0
      })

      resolve(templates)
    })
  }

  handleClickSort = key => {
    let tempSort = { ...this.state.sort }

    if (key === tempSort.key) {
      if (tempSort.direction === 'ASC') {
        tempSort.direction = 'DESC'
      } else {
        tempSort.direction = 'ASC'
      }
    } else {
      tempSort.key = key
      tempSort.direction = 'ASC'
    }

    let templates = [...this.state.templateList]

    if (tempSort.direction === 'ASC') {
      templates.sort(function(a, b) {
        if (a[key] && b[key]) {
          if (key === 'name') {
            return a[key].toLowerCase() < b[key].toLowerCase()
              ? -1
              : b[key].toLowerCase() < a[key].toLowerCase()
              ? 1
              : 0
          } else if (key === 'type') {
            return a[key].toLowerCase() > b[key].toLowerCase()
              ? -1
              : b[key].toLowerCase() > a[key].toLowerCase()
              ? 1
              : 0
          } else if (key === 'updatedAt') {
            return a[key].toLowerCase() > b[key].toLowerCase()
              ? -1
              : b[key].toLowerCase() > a[key].toLowerCase()
              ? 1
              : 0
          } else if (key === 'createdAt') {
            return a[key].toLowerCase() > b[key].toLowerCase()
              ? -1
              : b[key].toLowerCase() > a[key].toLowerCase()
              ? 1
              : 0
          } else if (key === 'author') {
            return a['createdByUserId']?.email.toLowerCase() >
              b['createdByUserId']?.email.toLowerCase()
              ? -1
              : b['createdByUserId']?.email.toLowerCase() >
                a['createdByUserId']?.email.toLowerCase()
              ? 1
              : 0
          }
        }
      })
    } else {
      templates.sort(function(a, b) {
        if (a[key] && b[key]) {
          if (key === 'name') {
            return a[key].toLowerCase() > b[key].toLowerCase()
              ? -1
              : b[key].toLowerCase() > a[key].toLowerCase()
              ? 1
              : 0
          } else if (key === 'type') {
            return a[key].toLowerCase() < b[key].toLowerCase()
              ? -1
              : b[key].toLowerCase() < a[key].toLowerCase()
              ? 1
              : 0
          } else if (key === 'updatedAt') {
            return a[key].toLowerCase() < b[key].toLowerCase()
              ? -1
              : b[key].toLowerCase() < a[key].toLowerCase()
              ? 1
              : 0
          } else if (key === 'createdAt') {
            return a[key].toLowerCase() > b[key].toLowerCase()
              ? -1
              : b[key].toLowerCase() > a[key].toLowerCase()
              ? 1
              : 0
          } else if (key === 'author') {
            return a['createdByUserId']?.email.toLowerCase() >
              b['createdByUserId']?.email.toLowerCase()
              ? -1
              : b['createdByUserId']?.email.toLowerCase() >
                a['createdByUserId']?.email.toLowerCase()
              ? 1
              : 0
          }
        }
      })
    }
    this.setState({ templateList: templates, sort: tempSort })
  }

  filterList = event => {
    let searchBy = event.target.value
    let updatedList = this.state.originalList
    this.setState({ searchValue: searchBy, loadingSearch: true })

    if (searchBy) {
      this.handleFilter(searchBy)
    } else {
      this.setState({ templateList: updatedList, loadingSearch: false })
    }
  }

  handleFilter = searchBy => {
    let updatedList = this.state.originalList.filter(function(item) {
      if (item) {
        return (
          JSON.stringify(item)
            .toLowerCase()
            .indexOf(searchBy.toString().toLowerCase()) > -1
        )
      }
    })
    this.setState({ templateList: updatedList, loadingSearch: false })
  }

  handleToggleExtras = index => {
    // toggle off
    if (index === this.state.showExtras) {
      this.setState({ showExtras: '' })
      return
    }
    this.setState({ showExtras: index })
  }

  handleClickAddTemplate = event => {
    event.preventDefault()
    this.props.push('/spreadsheet/create')
  }

  handleClickEditTemplate = id => {
    this.props.push('/spreadsheet/template/' + id)
  }

  renderTemplateList = () => {
    const { templateList } = this.state

    if (this.state.loadingTemplates) {
      return (
        <div className={styles.templateLoading}>
          <Loader />
        </div>
      )
    }

    if (this.state.loadingFailed !== '' && !templateList.length) {
      return <p>{this.state.loadingFailed}</p>
    }

    if (!templateList.length) {
      return <p>No Templates</p>
    }

    return (
      <div className={classNames(styles.templateList, styles.table)}>
        <div
          className={classNames(
            styles.tableHeader,
            this.state.sort.direction === 'ASC'
              ? styles.tableHeaderSortASC
              : styles.tableHeaderSortDESC
          )}
        >
          <div
            className={classNames(styles.tableRowItem, styles.tableRowItem_3)}
            onClick={() => this.handleClickSort('name')}
          >
            Name{' '}
            {this.state.sort.key === 'name' ? (
              <i className="material-icons">arrow_downward</i>
            ) : (
              ''
            )}
          </div>
          <div
            className={styles.tableRowItem}
            onClick={() => this.handleClickSort('type')}
          >
            Type{' '}
            {this.state.sort.key === 'type' ? (
              <i className="material-icons">arrow_downward</i>
            ) : (
              ''
            )}
          </div>
          <div
            className={classNames(styles.tableRowItem, styles.tableRowItem_2)}
            onClick={() => this.handleClickSort('author')}
          >
            Author{' '}
            {this.state.sort.key === 'author' ? (
              <i className="material-icons">arrow_downward</i>
            ) : (
              ''
            )}
          </div>
          <div
            className={styles.tableRowItem}
            onClick={() => this.handleClickSort('createdAt')}
          >
            Created{' '}
            {this.state.sort.key === 'createdAt' ? (
              <i className="material-icons">arrow_downward</i>
            ) : (
              ''
            )}
          </div>
          <div
            className={styles.tableRowItem}
            onClick={() => this.handleClickSort('updatedAt')}
          >
            Updated{' '}
            {this.state.sort.key === 'updatedAt' ? (
              <i className="material-icons">arrow_downward</i>
            ) : (
              ''
            )}
          </div>
          <div className={styles.tableRowItem} />
        </div>

        {templateList.map((template, index) => {
          const formatedCreatedDate = template.createdAt
            ? new Date(template.createdAt).toLocaleDateString('en-US')
            : '-'
          const formatedUpdatedDate = template.updatedAt
            ? new Date(template.updatedAt).toLocaleDateString('en-US')
            : '-'
          let type = template.type == 'project' ? 'Measure' : 'Building'
          return (
            <div
              key={template._id}
              className={classNames(
                styles.tableRow,
                this.state.expandTemplateInfo === template._id
                  ? styles.tableMobileRowActive
                  : ''
              )}
            >
              <div
                className={classNames(
                  styles.tableRowItem,
                  styles.tableRowItem_3,
                  styles.templateListContent
                )}
                data-header="Template Name"
              >
                <div
                  className={styles.templateListName}
                  onClick={() => this.handleClickEditTemplate(template._id)}
                >
                  <span>
                    <i className="material-icons">insert_chart</i>
                  </span>
                  <p>{template.name}</p>
                </div>
                <div
                  className={classNames(
                    styles.tableMobileOpenInfo,
                    styles.tableMobileShow
                  )}
                  onClick={() => this.handleMobileTemplateInfo(template._id)}
                >
                  <i className="material-icons">expand_more</i>
                </div>
              </div>
              <div
                className={classNames(
                  styles.tableRowItem,
                  styles.tableMobileRowItem,
                  styles.tableMobileBoxTop,
                  styles.tableMobileBoxBottom,
                  this.state.expandTemplateInfo === template._id
                    ? styles.tableMobileRowItemActive
                    : ''
                )}
                data-header="Type"
              >
                <p>{type}</p>
                <div
                  className={classNames(
                    styles.tableMobileOpenInfo,
                    styles.tableMobileShow
                  )}
                  onClick={() => this.handleMobileTemplateInfo(template._id)}
                >
                  <i className="material-icons">expand_more</i>
                </div>
              </div>
              <div
                className={classNames(
                  styles.tableRowItem,
                  styles.tableRowItem_2,
                  styles.tableMobileRowItem,
                  styles.tableMobileBoxTop,
                  styles.tableMobileBoxBottom,
                  this.state.expandTemplateInfo === template._id
                    ? styles.tableMobileRowItemActive
                    : ''
                )}
                data-header="Author"
              >
                <label className={styles.tableMobileShow}>Author</label>
                {template.createdByUserId?.name || '-'}
              </div>
              <div
                className={classNames(
                  styles.tableRowItem,
                  styles.tableMobileRowItem,
                  styles.tableMobileBoxTop,
                  styles.tableMobileBoxBottom,
                  this.state.expandTemplateInfo === template._id
                    ? styles.tableMobileRowItemActive
                    : ''
                )}
                data-header="Created"
              >
                <label className={styles.tableMobileShow}>Created</label>
                {formatedCreatedDate}
              </div>
              <div
                className={classNames(
                  styles.tableRowItem,
                  styles.tableMobileRowItem,
                  styles.tableMobileBoxTop,
                  styles.tableMobileBoxBottom,
                  this.state.expandTemplateInfo === template._id
                    ? styles.tableMobileRowItemActive
                    : ''
                )}
                data-header="Updated"
              >
                <label className={styles.tableMobileShow}>Last Updated</label>
                {formatedUpdatedDate}
              </div>
              <div
                className={classNames(
                  styles.tableRowItem,
                  styles.templateListMore,
                  styles.tableMobileRowItem,
                  this.state.expandTemplateInfo === template._id
                    ? styles.tableMobileRowItemActive
                    : ''
                )}
                data-header="More"
              >
                <div
                  className={classNames(
                    styles.tableMobileShow,
                    styles.tableMobileRowItem_5
                  )}
                >
                  <button
                    className={classNames(styles.button, styles.buttonPrimary)}
                    onClick={() => this.handleClickEditTemplate(template._id)}
                  >
                    View Template
                  </button>
                </div>
                <div
                  onClick={() => this.handleToggleExtras(index)}
                  className={classNames(
                    styles.extras,
                    'extrasClick',
                    this.state.showExtras === index
                      ? styles.extrasShow
                      : styles.extrasHide
                  )}
                >
                  <span className={styles.extrasButton} />
                  <div
                    className={classNames(
                      styles.extrasDropdown,
                      styles.extrasDropdownRight
                    )}
                  >
                    <div
                      className={styles.extrasLink}
                      onClick={() => this.handleClickEditTemplate(template._id)}
                    >
                      <i className="material-icons">edit</i> Edit template
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  render() {
    return (
      <div className={styles.template}>
        <div className={styles.templateHeader}>
          <div className={styles.container}>
            <div className={styles.templateTitle}>
              <h2>Spreadsheet Templates</h2>
            </div>
            {this.props.templateList && this.props.templateList.length !== 0 && (
              <div className={styles.templateAdd}>
                <button
                  className={classNames(styles.button, styles.buttonPrimary)}
                  onClick={this.handleClickAddTemplate}
                >
                  <i className="material-icons">add</i> New Template
                </button>
              </div>
            )}
          </div>
        </div>
        {(this.state.loadingTemplates ||
          (this.props.templateList &&
            this.props.templateList.length !== 0)) && (
          <div className={styles.container}>
            <div className={styles.templateSearch}>
              <div className={styles.templateSearchInput}>
                <input
                  type="search"
                  value={this.state.searchValue}
                  className="form-control form-control-lg"
                  placeholder="Search for keywords"
                  onChange={this.filterList}
                />
                <i className="material-icons">search</i>
                {this.state.loadingSearch && <Loader size="button" />}
              </div>
            </div>
            {this.renderTemplateList()}
          </div>
        )}
        {!(
          this.state.loadingTemplates ||
          (this.props.templateList && this.props.templateList.length !== 0)
        ) && (
          <div className={styles.empty}>
            <div className={styles.emptyBody}>
              <div className={styles.emptyBodyTitle}>
                Add a template to start automating your reports
              </div>
              <div className={styles.emptyBodyDescription}>
                Spreadsheet templates generate MS Excel documents from building
                data.
              </div>
              <div className={styles.emptyButtons}>
                <button
                  className={classNames(styles.button, styles.buttonPrimary)}
                  onClick={this.handleClickAddTemplate}
                >
                  <i className="material-icons">add</i> Add Template
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
}

export default Spreadsheet
