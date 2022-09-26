import React from 'react'
import { bindActionCreators } from 'redux'
import { mount } from 'enzyme'

import { Footer } from 'containers/Footer/Footer'

describe('(Container) Footer', () => {
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
      }, _spies.dispatch = sinon.spy())
    }
    _wrapper = mount(<Footer {..._props} />)
  })

  // Check component rendering
  it('renders as a <div>', () => {
    const footerContainerWrapper =_wrapper.find('.container-footer')
    expect(footerContainerWrapper).to.have.tagName('div')
  })

  describe('Menu', () => {
    let footerMenuWrapper

    beforeEach(() => {
      footerMenuWrapper = _wrapper.find('.footer-menu')
    })

    it('renders with <Footer /> menu', () => {
      expect(footerMenuWrapper).to.exist()
      expect(footerMenuWrapper).to.have.tagName('div')
      expect(footerMenuWrapper.find('p')).to.have.text('Footer')
    })

  })
})

describe('(Container) Footer - In password reset flow', () => {
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
      }, _spies.dispatch = sinon.spy())
    }
    _wrapper = mount(<Footer {..._props} />)
  })

  // Check component rendering
  it('ensure <Footer/> menu does not render when user "resetPassword" prop is set', () => {
    const footerMenuWrapper = _wrapper.find('.footer-menu')
    expect(footerMenuWrapper).to.not.exist()
    expect(footerMenuWrapper.find('span')).to.be.empty()
  })

})
