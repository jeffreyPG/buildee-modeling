import configureStore from 'redux-mock-store'

import {
  routerLoginCheck,
  sessionExpireCheck,

  normalDist,
  gaussian
} from 'utils/Utils'

let userStore = {
  login: {
    user: { }
  }
}
let userSession = {
  expiry: undefined
}

describe('(Utils) Utility Functions', () => {

  describe('(Utils) routerLoginCheck', () => {

    it('returns false by default for no user logged in', () => {
      expect(routerLoginCheck()).to.be.equal(false)
    })
    it('returns false if the store object does not have a user logged in', () => {
      userStore.login.user = {}
      expect(routerLoginCheck(userStore)).to.be.equal(false)
    })
    it('returns true if the store object has a user logged in', () => {
      userStore.login.user.email = 'tester@test.com'
      expect(routerLoginCheck(userStore)).to.be.equal(true)
    })
    it('returns true if the redux store has a user logged in with a mocked store', () => {
      userStore.login.user.email = 'tester@test.com'

      const mockStore = configureStore([])
      userStore = mockStore(userStore)

      expect(routerLoginCheck(userStore)).to.be.equal(true)
    })

  })

  describe('(Utils) sessionExpireCheck', () => {

    it('returns true by default for user contains expired session', () => {
      expect(sessionExpireCheck()).to.be.equal(true)
    })
    it('returns true if the store object for user contains expired session', () => {
      userSession.expiry = undefined
      expect(sessionExpireCheck(userSession)).to.be.equal(true)
    })
    it('returns true if the store object for user contains expired session', () => {
      userSession.expiry = 123456789011
      expect(sessionExpireCheck(userSession)).to.be.equal(true)
    })
    it('returns false if the store object for user contains a valid session', () => {
      userSession.expiry = 9999999999999
      expect(sessionExpireCheck(userSession)).to.be.equal(false)
    })

  })

  describe('(Utils) normalDist', () => {

    it('normalDist', () => {
      let samples = []
      for (let i = 0; i < 100; i += 1) {
        samples.push(normalDist())
      }
      expect(Math.min(...samples)).to.be.within(-5, 5)
      expect(Math.max(...samples)).to.be.within(-5, 5)
    })

  })

  describe('(Utils) gaussian', () => {

    it('gaussian', () => {
      expect(gaussian(1.7)).to.be.equal(0.09404907737688695)
      expect(gaussian(-1.7)).to.be.equal(0.09404907737688695)
      expect(gaussian(1.5)).to.be.equal(0.12951759566589174)
      expect(gaussian(-1.5)).to.be.equal(0.12951759566589174)
      expect(gaussian(0.7)).to.be.equal(0.31225393336676127)
      expect(gaussian(-0.7)).to.be.equal(0.31225393336676127)
    })

  })
})
