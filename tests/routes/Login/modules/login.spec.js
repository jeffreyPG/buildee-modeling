import {
  LOGIN,
  LOGOUT,
  UPDATE_USER,
  CLEAR_AUTH_STATE,

  actions,
  login,
  logout,
  updateUser,

  default as loginReducer
} from 'routes/Login/modules/login'

const initialState = {
  loggingIn: false
}

describe('(Redux Module) Login', () => {

  // Check the constants/triggers
  it('Should export a constant LOGIN', () => {
    expect(LOGIN).to.equal('AUTH/LOGIN')
  })
  it('Should export a constant LOGOUT', () => {
    expect(LOGOUT).to.equal('AUTH/LOGOUT')
  })
  it('Should export a constant UPDATE_USER', () => {
    expect(UPDATE_USER).to.equal('AUTH/UPDATE_USER')
  })

  describe('(Reducer)', () => {

    it('Reducer should return a function', () => {
      expect(loginReducer).to.be.a('function')
    })

    // Check initialState is set
    it('Check the default initialState', () => {
      expect(loginReducer(undefined, {})).to.be.eql(initialState)
    })
    it('Should return the previous state if an action was not matched', () => {
      let state = loginReducer(undefined, {})
      expect(state).to.be.eql(initialState)
      state = loginReducer(state, { type: '@@@@@@@' })
      expect(state).to.be.eql(initialState)
    })

  })

  describe('(Action Creator) login', () => {
    let _globalState
    let _dispatchSpy
    let _getStateSpy

    beforeEach(() => {
      _globalState = {
        login: loginReducer(undefined, {})
      }
      _dispatchSpy = sinon.spy((action) => {
        _globalState = {
          ..._globalState,
          login: loginReducer(_globalState.login, action)
        }
      })
      _getStateSpy = sinon.spy(() => {
        return _globalState
      })
    })

    it('Should be exported as a function', () => {
      expect(login).to.be.a('function')
    })
    it('Should return a function (is a thunk)', () => {
      expect(login()).to.be.a('function')
    })
    it('Should return a promise from that thunk that gets fulfilled', () => {
      return login()(_dispatchSpy, _getStateSpy).should.eventually.be.fulfilled
    })
    it('Should modify state per action appropriately', () => {
      const actionLoginSuccess = {
        type: 'AUTH/LOGIN_SUCCESS',
        user: {
          name: 'testname'
        },
        secret: 'testsecret',
        expiry: 'testexpiry'
      }
      const state = loginReducer(undefined, actionLoginSuccess)
      expect(state.user.name).to.be.equal('testname')
      expect(state.secret).to.be.equal('testsecret')
      expect(state.expiry).to.be.equal('testexpiry')
      expect(state.loggingIn).to.be.equal(false)

      const actionLoginSuccessUpdate = {
        type: 'AUTH/LOGIN_SUCCESS',
        user: {
          name: 'nametestupdate'
        },
        secret: 'testsecretupdate',
        expiry: 'testexpiryupdate'
      }
      const stateUpdate = loginReducer(state, actionLoginSuccessUpdate)
      expect(stateUpdate.user.name).to.be.equal('nametestupdate')
      expect(stateUpdate.secret).to.be.equal('testsecretupdate')
      expect(stateUpdate.expiry).to.be.equal('testexpiryupdate')
      expect(stateUpdate.loggingIn).to.be.equal(false)
    })

  })

  describe('(Action Creator) logout', () => {
    let _globalState
    let _dispatchSpy
    let _getStateSpy

    beforeEach(() => {
      _globalState = {
        logout: loginReducer(undefined, {})
      }
      _dispatchSpy = sinon.spy((action) => {
        _globalState = {
          ..._globalState,
          logout: loginReducer(_globalState.logout, action)
        }
      })
      _getStateSpy = sinon.spy(() => {
        return _globalState
      })
    })

    it('Should be exported as a function', () => {
      expect(logout).to.be.a('function')
    })
    it('Should return a function (is a thunk)', () => {
      expect(logout()).to.be.a('function')
    })
    it('Should return a promise from that thunk that gets fulfilled', () => {
      return logout()(_dispatchSpy, _getStateSpy).should.eventually.be.fulfilled
    })
    it('Should modify state per action appropriately', () => {
      const actionLogout = {
        type: 'AUTH/LOGOUT'
      }
      const state = loginReducer(undefined, actionLogout)
      expect(state).to.be.eql({})
    })

  })

  describe('(Action Creator) updateUser', () => {
    let _globalState
    let _dispatchSpy
    let _getStateSpy

    beforeEach(() => {
      _globalState = {
        updateUser: loginReducer(undefined, {})
      }
      _dispatchSpy = sinon.spy((action) => {
        _globalState = {
          ..._globalState,
          updateUser: loginReducer(_globalState.updateUser, action)
        }
      })
      _getStateSpy = sinon.spy(() => {
        return _globalState
      })
    })

    it('Should be exported as a function', () => {
      expect(updateUser).to.be.a('function')
    })
    it('Should return an action object', () => {
      expect(updateUser({})).to.be.a('object')
    })
    it('Should modify state per action appropriately', () => {
      const actionUpdateUser = {
        type: 'AUTH/UPDATE_USER',
        user: {
          name: 'testnameupdatecall',
          key: 'value'
        }
      }
      const state = loginReducer(undefined, actionUpdateUser)
      expect(state.user.name).to.be.equal('testnameupdatecall')
      expect(state.user.key).to.be.equal('value')
      expect(state.loggingIn).to.be.equal(false)
    })

  })
})
