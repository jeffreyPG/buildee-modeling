import React from 'react'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import { shallow, mount } from 'enzyme'

import LoggedInLayoutConnected, { LoggedInLayout } from 'layouts/LoggedInLayout/LoggedInLayout'

import TopMenuConnected, { TopMenu } from 'containers/TopMenu/TopMenu'
import FooterConnected, { Footer } from 'containers/Footer/Footer'

import FlashConnected, { Flash } from 'utils/Flash/components/Flash'

describe('(Layout) LoggedInLayout', () => {
  const mockStore = configureStore([])
  const store = mockStore({
    login: {
      user: {
        email: 'tester@testing.com'
      }
    },
    flash: {}
  })
  let wrapper

  beforeEach(() => {
    wrapper = mount(
      <Provider store={store}>
        <LoggedInLayout children={<span />} />
      </Provider>
    )
    store.clearActions()
  })

  // Test component
  it('renders as a <div>', () => {
    wrapper.should.have.tagName('div')
  })
  it('renders its children inside of the viewport', () => {
    const Child = () => <h2>child</h2>
    shallow(
      <LoggedInLayout>
        <Child />
      </LoggedInLayout>
    )
      .find('.logged-in-layout__viewport')
      .should.contain(<Child />)
  })

  // Test nested components
  it('contains <Flash/> component', function () {
    expect(wrapper.find(Flash)).to.have.length(1)
  })
  it('contains <TopMenu/> component', function () {
    expect(wrapper.find(TopMenu)).to.have.length(1)
  })
  it('contains <Footer/> component', function () {
    expect(wrapper.find(Footer)).to.have.length(1)
  })

  // Test nested component details
  it('ensure <TopMenu/> component displays user email', function () {
    const TopMenuComponentWrapper = wrapper.find(TopMenu)
    expect(TopMenuComponentWrapper).to.have.length(1)

    const UserTagWrapper = TopMenuComponentWrapper.find('.user-display')
    expect(UserTagWrapper).to.have.length(1)
    expect(UserTagWrapper).to.have.text('tester@testing.com')
  })

})

describe('(Layout) LoggedInLayout - Password Reset Flow', () => {
  const mockStore = configureStore([])
  const store = mockStore({
    login: {
      user: {
        email: 'tester@testing.com',
        resetPassword: true
      }
    },
    flash: {}
  })
  let wrapper

  beforeEach(() => {
    wrapper = mount(
      <Provider store={store}>
        <LoggedInLayout children={<span />} />
      </Provider>
    )
    store.clearActions()
  })

  it('ensure <TopMenu/> component does not render when user "resetPassword" prop is set', function () {
    const TopMenuWrapper = wrapper.find(TopMenu)
    expect(TopMenuWrapper).to.have.length(1)
    expect(TopMenuWrapper).to.be.empty()
  })
  it('ensure <Footer/> component does not render when user "resetPassword" prop is set', function () {
    const FooterWrapper = wrapper.find(Footer)
    expect(FooterWrapper).to.have.length(1)
    expect(FooterWrapper).to.be.empty()
  })

})
