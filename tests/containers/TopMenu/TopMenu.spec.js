import React from 'react'
import { bindActionCreators } from 'redux'
import { mount } from 'enzyme'

import { TopMenu } from 'containers/TopMenu/TopMenu'

describe('(Container) TopMenu', () => {
  let _props, _spies, _wrapper

  beforeEach(() => {
    _spies = {}
    _props = {
      user: {
        email: 'tester@testing.com',
        resetPassword: false
      },
      ...bindActionCreators({
        push: (_spies.push = sinon.spy()),

        logout: (_spies.logout = sinon.spy())
      }, _spies.dispatch = sinon.spy())
    }
    _wrapper = mount(<TopMenu {..._props} />)
  })

  // Check component state
  it('<TopMenu /> state defaults', () => {
    expect(_wrapper.state('isShow')).to.equal(false)
  })

  // Check component rendering
  it('renders as a <div>', () => {
    const topMenuContainerWrapper =_wrapper.find('.container-top-menu')
    expect(topMenuContainerWrapper).to.have.tagName('div')
  })
  it('renders the <TopMenu /> logo', () => {
    const topMenuLogoWrapper =_wrapper.find('.logo-sub-menu')
    expect(topMenuLogoWrapper).to.have.tagName('div')
  })
  it('renders the <TopMenu /> mid section', () => {
    const topMenuMidWrapper =_wrapper.find('.mid-sub-menu')
    expect(topMenuMidWrapper).to.have.tagName('div')
  })
  it('renders the <TopMenu /> user menu', () => {
    const topMenuUserMenuWrapper =_wrapper.find('.user-sub-menu')
    expect(topMenuUserMenuWrapper).to.have.tagName('div')
  })

  describe('Dropdown Menu', () => {
    let topMenuUserMenuWrapper

    beforeEach(() => {
      topMenuUserMenuWrapper = _wrapper.find('.user-sub-menu')
    })

    it('User menu initialized (closed menu)', () => {
      const dropDownButton = topMenuUserMenuWrapper.find('a.dropdown-toggle')
      expect(topMenuUserMenuWrapper).to.exist()
      expect(topMenuUserMenuWrapper).to.have.tagName('div')
      expect(dropDownButton).to.exist()
      expect(dropDownButton.find('span.user-display')).to.have.text('tester@testing.com')
      expect(dropDownButton.find('span.dropup')).to.not.exist()
      expect(dropDownButton.find('.dropdown-menu')).to.not.exist()
    })
    it('User menu clicked (opened menu)', () => {
      const dropDownButton = topMenuUserMenuWrapper.find('a.dropdown-toggle')
      expect(dropDownButton).to.exist()
      expect(_wrapper.state('isShow')).to.equal(false)

      dropDownButton.simulate('click')
      expect(_wrapper.state('isShow')).to.equal(true)
      expect(_wrapper.find('ul.dropdown-menu')).to.exist()
    })
    it('User menu profile item clicked (opened menu)', () => {
      const dropDownButton = topMenuUserMenuWrapper.find('a.dropdown-toggle')
      expect(dropDownButton).to.exist()
      dropDownButton.simulate('click')

      const dropDownProfileButton = _wrapper.find('li.menu-profile a')
      expect(dropDownProfileButton).to.exist()
      dropDownProfileButton.simulate('click')
      _spies.push.should.have.been.calledWith('/profile')
    })
    it('User menu logout item clicked (opened menu)', () => {
      const dropDownButton = topMenuUserMenuWrapper.find('a.dropdown-toggle')
      expect(dropDownButton).to.exist()
      dropDownButton.simulate('click')

      const dropDownLogoutButton = _wrapper.find('li.menu-logout a')
      expect(dropDownLogoutButton).to.exist()
      dropDownLogoutButton.simulate('click')
      _spies.logout.should.have.been.called()
    })

  })
})

describe('(Container) TopMenu - In password reset flow', () => {
  let _props, _spies, _wrapper

  beforeEach(() => {
    _spies = {}
    _props = {
      user: {
        email: 'tester@testing.com',
        resetPassword: true
      },
      ...bindActionCreators({
        push: (_spies.push = sinon.spy()),

        logout: (_spies.logout = sinon.spy())
      }, _spies.dispatch = sinon.spy())
    }
    _wrapper = mount(<TopMenu {..._props} />)
  })

  // Check component rendering
  it('ensure <TopMenu/> does not render when user "resetPassword" prop is set', () => {
    const topMenuContainerWrapper = _wrapper.find('.container-top-menu')
    expect(topMenuContainerWrapper).to.not.exist()
    expect(topMenuContainerWrapper.find('span')).to.be.empty()
  })

})
