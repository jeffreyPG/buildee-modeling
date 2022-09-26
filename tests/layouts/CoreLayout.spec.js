import React from 'react'
import CoreLayout from 'layouts/CoreLayout/CoreLayout'
import { shallow } from 'enzyme'

describe('(Layout) CoreLayout', () => {
  it('renders as a <div>', () => {
    shallow(<CoreLayout children={<span />} />).should.have.tagName('div')
  })

  it('renders its children inside of the viewport', () => {
    const Child = () => <h2>child</h2>
    shallow(
      <CoreLayout>
        <Child />
      </CoreLayout>
    )
      .find('.core-layout__viewport')
      .should.contain(<Child />)
  })
})
