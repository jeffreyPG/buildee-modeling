import React from 'react'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import { shallow, mount } from 'enzyme'

import LoggedOutLayoutConnected, { LoggedOutLayout } from 'layouts/LoggedOutLayout/LoggedOutLayout'

import LoggedOutHeaderConnected, { LoggedOutHeader } from 'components/LoggedOutHeader/LoggedOutHeader'

import FooterConnected, { Footer } from 'containers/Footer/Footer'

import FlashConnected, { Flash } from 'utils/Flash/components/Flash'

describe('(Layout) LoggedOutLayout', () => {
  const mockStore = configureStore([])
  const store = mockStore({
    login: {
      user: {}
    },
    flash: {}
  })
  let wrapper

  beforeEach(() => {
    wrapper = mount(
      <Provider store={store}>
        <LoggedOutLayout children={<span />} />
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
      <LoggedOutLayout>
        <Child />
      </LoggedOutLayout>
    )
      .find('.logged-out-layout__viewport')
      .should.contain(<Child />)
  })

  // Test nested components
  it('contains <Flash/> component', function () {
    expect(wrapper.find(Flash)).to.have.length(1)
  })
  it('contains <LoggedOutHeader/> component', function () {
    expect(wrapper.find(LoggedOutHeader)).to.have.length(1)
  })
  it('contains <Footer/> component', function () {
    expect(wrapper.find(Footer)).to.have.length(1)
  })

  // Test nested component details
  it('ensure <Footer/> component renders when user is not set', function () {
    const FooterWrapper = wrapper.find(Footer)
    expect(FooterWrapper).to.have.length(1)
    expect(FooterWrapper).to.not.be.empty()
  })

})
