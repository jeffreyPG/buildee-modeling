import { handleCreateUtilities } from '../building'
var expect = require('chai').expect

describe('#sum()', function () {
  // add a test hook
  beforeEach(function () {
    // ...some logic before each test is run
  })

  // test a functionality
  it('should add numbers', function () {
    // add an assertion
    expect(handleCreateUtilities(1, 2, 3, 4, 5)).to.equal(15)
  })

  // ...some more tests
})
