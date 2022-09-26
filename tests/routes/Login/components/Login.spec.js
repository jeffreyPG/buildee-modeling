import React from 'react'
import { bindActionCreators } from 'redux'
import { mount } from 'enzyme'

import Login from 'components/Login/Login'

// Setup component lifecycle watchers
sinon.spy(Login.prototype, 'UNSAFE_componentWillMount')

describe('(Component) Login - User Logged In', () => {
  let _props, _spies, _wrapper

  beforeEach(() => {
    _spies = {}
    _props = {
      user: {
        email: 'tester@testing.com'
      },
      loggingIn: false,
      isExpired: false,
      ...bindActionCreators({
        push: (_spies.push = sinon.spy()),

        login: (_spies.login = sinon.spy()),
        logout  : (_spies.logout = sinon.spy()),
      }, _spies.dispatch = sinon.spy())
    }
    _wrapper = mount(<Login {..._props} />)
  })

  // Check component lifecycle functions
  it('<Login /> lifecycle "UNSAFE_componentWillMount" called, and issues a redirect to dashboard', () => {
    expect(Login.prototype.UNSAFE_componentWillMount.calledOnce).to.equal(true)
    _spies.push.should.have.been.calledWith('/dashboard')
  })

  // Check component state
  it('<Login /> state defaults', () => {
    expect(_wrapper.state('buttonDisable')).to.equal(true)
    expect(_wrapper.state('username')).to.equal('')
    expect(_wrapper.state('password')).to.equal('')
  })

})

describe('(Component) Login - User Session Expired', () => {
  let _props, _spies, _wrapper

  beforeEach(() => {
    _spies = {}
    _props = {
      user: {
        email: 'tester@testing.com'
      },
      loggingIn: false,
      isExpired: true,
      ...bindActionCreators({
        push: (_spies.push = sinon.spy()),

        login: (_spies.login = sinon.spy()),
        logout: (_spies.logout = sinon.spy()),
      }, _spies.dispatch = sinon.spy())
    }
    _wrapper = mount(<Login {..._props} />)
  })

  // Check component rendering
  it('render as a <div>', () => {
    const loginComponentWrapper =_wrapper.find('.component-login')
    expect(loginComponentWrapper).to.have.tagName('div')
  })

  it('should not redirect a user when their session is no longer valid', () => {
    _spies.push.should.not.have.been.called()
  })

})

describe('(Component) Login - New Visitor', () => {
  let _props, _spies, _wrapper

  beforeEach(() => {
    _spies = {}
    _props = {
      user: { },
      loggingIn: false,
      isExpired: false,
      ...bindActionCreators({
        push: (_spies.push = sinon.spy()),

        login: (_spies.login = sinon.spy()),
        logout: (_spies.logout = sinon.spy()),
      }, _spies.dispatch = sinon.spy())
    }
    _wrapper = mount(<Login {..._props} />)
  })

  // Check component rendering
  it('should not render as a <div> when a redirect was issued to a logged in user', () => {
    const loginComponentWrapper =_wrapper.find('.component-login')
    expect(loginComponentWrapper).to.have.tagName('div')
  })

  it('should not redirect a user when their session is no longer valid', () => {
    _spies.push.should.not.have.been.called()
  })

  describe('Login Form', () => {
    let loginFormWrapper, inputUsernameWrapper, inputPasswordWrapper

    beforeEach(() => {
      loginFormWrapper = _wrapper.find('.login-form')
      inputUsernameWrapper = _wrapper.find('input[name="username"]')
      inputPasswordWrapper = _wrapper.find('input[name="password"]')
    })

    it('renders with <Login /> form', () => {
      expect(loginFormWrapper).to.exist()
      expect(loginFormWrapper).to.have.tagName('form')
      expect(loginFormWrapper.find('button.btn-login')).to.have.attr('disabled')
    })
    it('handleChange <Login /> form should change state and update the form', () => {
      expect(_wrapper.state('buttonDisable')).to.equal(true)
      inputUsernameWrapper.simulate('change', {target: {name: 'username', value: 'tester'}})
      expect(_wrapper.state('buttonDisable')).to.equal(true)
      inputPasswordWrapper.simulate('change', {target: {name: 'password', value: 'password123'}})
      expect(_wrapper.state('buttonDisable')).to.equal(false)
      expect(loginFormWrapper.find('button.btn-login')).to.not.have.attr('disabled')
    })
    it('handleSubmit <Login /> form should not submit without setting username/password', () => {
      loginFormWrapper.simulate('submit')
      _spies.login.should.have.not.been.called()
    })
    it('handleSubmit <Login /> form should submit only when both username/password is set', () => {
      inputUsernameWrapper.simulate('change', {target: {name: 'username', value: 'tester'}})
      loginFormWrapper.simulate('submit')
      _spies.login.should.have.not.been.called()
    })
    it('handleSubmit <Login /> form should submit and attempt login when username/password is set', () => {
      inputUsernameWrapper.simulate('change', {target: {name: 'username', value: 'tester'}})
      inputUsernameWrapper.simulate('change', {target: {name: 'password', value: 'password1234'}})
      loginFormWrapper.simulate('submit')
      _spies.login.should.have.been.calledWith('tester', 'password1234')
    })

  })
})
