import React, { Component } from 'react'
import PropTypes from 'prop-types'
import NewBuildingFormFirstPage from './NewBuildingFormFirstPage'
import NewBuildingFormSecondPage from './NewBuildingFormSecondPage'
import NewBuildingFormThirdPage from './NewBuildingFormThirdPage'
import NewBuildingFormFourthPage from './NewBuildingFormFourthPage'
import NewBuildingFormFifthPage from './NewBuildingFormFifthPage'
import NewBuildingFormSixthPage from './NewBuildingFormSixthPage'
import NewBuildingFormLastPage from './NewBuildingFormLastPage'
import { connect } from 'react-redux'
import { reset } from 'redux-form'

class NewBuildingForm extends Component {
  static propTypes = {
    building: PropTypes.object.isRequired,
    organizationView: PropTypes.object.isRequired,
    organizationList: PropTypes.array.isRequired,
    manageAllOrgSelected: PropTypes.bool.isRequired
  }

  constructor(props) {
    super(props)
    this.state = {
      page: 1,
      options: (props.organizationView && props.organizationView.options) || {},
      blendedRates:
        (props.organizationView && props.organizationView.blendedRates) || {}
    }
  }

  componentDidMount() {
    const { page, options = {} } = this.state
    const { disabledCreateBuildingPages = [] } = options
    if (disabledCreateBuildingPages.includes(page)) {
      this.nextPage()
    }
    this.props.dispatch(reset('newBuilding'))
  }

  findNextPage = page => {
    const { disabledCreateBuildingPages = [] } = this.state.options
    let maxPage = 7
    while (disabledCreateBuildingPages.includes(page) && page < maxPage) {
      page++
    }
    return Math.min(maxPage, page)
  }

  findPreviousPage = page => {
    let { disabledCreateBuildingPages = [] } = this.state.options
    disabledCreateBuildingPages.sort()
    let minPage = 1
    if (disabledCreateBuildingPages.length) {
      const { overviewEnabled } = this.props
      let pages = [1, 2, 3, 4, 5, 6]
      if (overviewEnabled) {
        pages.push(7)
      }
      pages = pages.filter(page => !disabledCreateBuildingPages.includes(page))
      pages.sort()
      if (pages.length) {
        minPage = pages[0]
      }
    }
    while (disabledCreateBuildingPages.includes(page) && page > 1) {
      page--
    }
    return Math.max(page, minPage)
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.organizationView !== this.props.organizationView) {
      this.setState({
        options:
          (nextProps.organizationView && nextProps.organizationView.options) ||
          {}
      })
    }
  }

  nextPage = () => {
    let { overviewEnabled } = this.props
    let page = this.state.page + 1
    if (!overviewEnabled && page == 6) page = 7

    let newPage = this.findNextPage(page)

    this.setState({ page: newPage })
  }

  previousPage = () => {
    let { overviewEnabled } = this.props
    let page = this.state.page - 1
    if (!overviewEnabled && page == 6) page = 5
    let newPage = this.findPreviousPage(page)
    this.setState({ page: newPage })
  }

  getLastPage = () => {
    let { overviewEnabled } = this.props
    const { options } = this.state
    const { disabledCreateBuildingPages = [] } = options
    let maxPage = overviewEnabled ? 7 : 6
    while (maxPage && disabledCreateBuildingPages.includes(maxPage)) {
      maxPage--
    }
    return Math.max(maxPage, 1)
  }

  render() {
    const {
      onSubmit,
      disableSubmit,
      overviewEnabled,
      organizationList,
      manageAllOrgSelected
    } = this.props
    const { page, options, blendedRates } = this.state
    const lastPage = this.getLastPage()
    return (
      <div>
        {page === 1 && (
          <NewBuildingFormFirstPage
            onSubmit={page === lastPage ? onSubmit : this.nextPage}
            options={options}
            overviewEnabled={overviewEnabled}
            isEnd={page === lastPage}
            organizationList={organizationList}
            manageAllOrgSelected={manageAllOrgSelected}
          />
        )}
        {page === 2 && (
          <NewBuildingFormSecondPage
            previousPage={this.previousPage}
            onSubmit={page === lastPage ? onSubmit : this.nextPage}
            options={options}
            isEnd={page === lastPage}
          />
        )}
        {page === 3 && (
          <NewBuildingFormThirdPage
            previousPage={this.previousPage}
            onSubmit={page === lastPage ? onSubmit : this.nextPage}
            options={options}
            isEnd={page === lastPage}
          />
        )}
        {page === 4 && (
          <NewBuildingFormFourthPage
            previousPage={this.previousPage}
            onSubmit={page === lastPage ? onSubmit : this.nextPage}
            options={options}
            isEnd={page === lastPage}
          />
        )}
        {page === 5 && (
          <NewBuildingFormFifthPage
            previousPage={this.previousPage}
            onSubmit={page === lastPage ? onSubmit : this.nextPage}
            options={options}
            isEnd={page === lastPage}
          />
        )}
        {page === 6 && overviewEnabled && (
          <NewBuildingFormSixthPage
            previousPage={this.previousPage}
            onSubmit={page === lastPage ? onSubmit : this.nextPage}
            options={options}
            isEnd={page === lastPage}
            blendedRates={blendedRates}
          />
        )}
        {page === 7 && (
          <NewBuildingFormLastPage
            previousPage={this.previousPage}
            onSubmit={onSubmit}
            disableSubmit={disableSubmit}
            options={options}
            isEnd={page === lastPage}
          />
        )}
      </div>
    )
  }
}

NewBuildingForm.propTypes = {
  onSubmit: PropTypes.func.isRequired
}

export default connect()(NewBuildingForm)
