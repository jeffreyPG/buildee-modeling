import React from 'react'
import { bindActionCreators } from 'redux'
import { mount } from 'enzyme'

import { Home } from 'routes/Home/components/Home'

const BUILDING_LIST = [
  {
    _id: 1,
    zip: '80000'
  },
  {
    _id: 2,
    zip: '80001'
  }
]

// Setup component lifecycle watchers
sinon.spy(Home.prototype, 'componentDidMount')

describe('(Component) Home - User Logged In', () => {
  let _props, _spies, _wrapper

  beforeEach(() => {
    _spies = {}
    _props = {
      user: {
        email: 'tester@testing.com'
      },
      isExpired: false,
      buildingList: [],
      ...bindActionCreators({
        push: (_spies.push = sinon.spy()),

        getProfile: (_spies.getProfile = sinon.spy()),
        getUserBuildings  : (_spies.getUserBuildings = sinon.spy()),
        startProject  : (_spies.startProject = sinon.spy()),
      }, _spies.dispatch = sinon.spy())
    }
    _wrapper = mount(<Home {..._props} />)
  })

  // Check component lifecycle functions
  it('<Home /> lifecycle "componentDidMount" called', () => {
    expect(Home.prototype.componentDidMount.calledOnce).to.equal(true)
    _spies.getProfile.should.have.been.called()
    _spies.getUserBuildings.should.have.been.called()
  })

  // Check component state
  it('<Home /> state defaults', () => {
    expect(_wrapper.state('validLogin')).to.equal(true)
    expect(_wrapper.state('isSelected')).to.equal(false)
    expect(_wrapper.state('projectType')).to.equal('')
  })

  // Check component rendering
  it('renders as a <div>', () => {
    const homeComponentWrapper =_wrapper.find('.component-home')
    expect(homeComponentWrapper).to.have.tagName('div')
  })

  describe('Project Form', () => {
    let buildingFormWrapper, buildingFormSelectWrapper

    beforeEach(() => {
      buildingFormWrapper = _wrapper.find('.home-building-form')
      buildingFormSelectWrapper = _wrapper.find('.home-building-form select.form-control')
    })

    it('renders with <Home /> form', () => {
      expect(buildingFormWrapper).to.exist()
      expect(buildingFormWrapper).to.have.tagName('form')
      expect(buildingFormWrapper.find('button.btn-home-next')).to.have.attr('disabled')
    })
    it('handleChange <Home /> form should change state and update the form', () => {
      expect(_wrapper.state('isSelected')).to.equal(false)
      buildingFormSelectWrapper.simulate('change', {target: {name: 'Lighting', value: 'Lighting'}})
      expect(_wrapper.state('isSelected')).to.equal(true)
      expect(_wrapper.find('button.btn-home-next')).to.not.have.attr('disabled')
    })
    it('handleSubmit <Home /> form should not submit without setting select menu item', () => {
      buildingFormWrapper.simulate('submit')
      _spies.startProject.should.have.not.been.called()
    })
    it('handleSubmit <Home /> form should submit after setting select menu item and redirect to building page', () => {
      buildingFormWrapper.find('select.form-control').simulate('change', {target: {name: 'Lighting', value: 'Lighting'}})
      buildingFormWrapper.simulate('submit')

      _spies.dispatch.should.have.been.called()
      _spies.startProject.should.have.been.calledWith('Lighting')
      _spies.push.should.have.been.calledWith('/building/info')
    })

  })

  describe('Building List', () => {
    let userBuildingListWrapper

    beforeEach(() => {
      userBuildingListWrapper = _wrapper.find('.home-building-list')
    })

    it('render with <Home /> user building list - no buildings', () => {
      expect(userBuildingListWrapper).to.exist()
      expect(userBuildingListWrapper.childAt(0)).to.have.text('My Buildings (tester@testing.com)')
      expect(userBuildingListWrapper.childAt(1)).to.have.text('No Buildings')
    })
    it('render with <Home /> user building list - with buildings', () => {
      _wrapper.setProps({ buildingList: BUILDING_LIST, user: { email: 'newTester@testing.com' } })

      expect(userBuildingListWrapper).to.exist()
      expect(userBuildingListWrapper.childAt(0)).to.have.text('My Buildings (newTester@testing.com)')

      const userBuildingListTagWrapper = userBuildingListWrapper.find('ul')

      expect(userBuildingListTagWrapper).to.exist()
      expect(userBuildingListTagWrapper.find('li')).to.have.length(2)
      expect(userBuildingListTagWrapper.childAt(0)).to.have.text('123 Main Street - Denver CO, 80000')
      expect(userBuildingListTagWrapper.childAt(1)).to.have.text('1234 Main Street - Denver CO, 80001')
    })

  })
})

describe('(Component) Home - No User Loged In', () => {
  let _props, _spies, _wrapper

  beforeEach(() => {
    _spies = {}
    _props = {
      user: {},
      isExpired: false,
      buildingList: [],
      ...bindActionCreators({
        push: (_spies.push = sinon.spy()),

        getProfile: (_spies.getProfile = sinon.spy()),
        getUserBuildings  : (_spies.getUserBuildings = sinon.spy()),
        startProject  : (_spies.startProject = sinon.spy()),
      }, _spies.dispatch = sinon.spy())
    }
    _wrapper = mount(<Home {..._props} />)
  })

  // Check component lifecycle functions
  it('<Home /> lifecycle "componentDidMount" called', () => {
    _spies.getProfile.should.not.have.been.called()
    _spies.getUserBuildings.should.not.have.been.called()
  })

  describe('Project Form', () => {
    let buildingFormWrapper, buildingFormSelectWrapper

    beforeEach(() => {
      buildingFormWrapper = _wrapper.find('.home-building-form')
      buildingFormSelectWrapper = _wrapper.find('.home-building-form select.form-control')
    })

    it('renders with <Home /> form', () => {
      expect(buildingFormWrapper).to.exist()
      expect(buildingFormWrapper).to.have.tagName('form')
      expect(buildingFormWrapper.find('button.btn-home-next')).to.have.attr('disabled')
    })
    it('handleChange <Home /> form should change state and update the form', () => {
      expect(_wrapper.state('isSelected')).to.equal(false)
      buildingFormSelectWrapper.simulate('change', {target: {name: 'Water', value: 'Water'}})
      expect(_wrapper.state('isSelected')).to.equal(true)
      expect(_wrapper.find('button.btn-home-next')).to.not.have.attr('disabled')
    })
    it('handleSubmit <Home /> form should not submit without setting select menu item', () => {
      buildingFormWrapper.simulate('submit')
      _spies.startProject.should.have.not.been.called()
    })
    it('handleSubmit <Home /> form should submit after setting select menu item and redirect to login page', () => {
      buildingFormWrapper.find('select.form-control').simulate('change', {target: {name: 'Water', value: 'Water'}})
      buildingFormWrapper.simulate('submit')

      _spies.dispatch.should.have.been.called()
      _spies.startProject.should.have.been.calledWith('Water')
      _spies.push.should.have.been.calledWith('/login')
    })
  })

  describe('Building List', () => {

    it('should not render <Home /> building list with no user logged in', () => {
      expect(_wrapper.find('.home-building-list')).to.not.exist()
    })

  })
})
