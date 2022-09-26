import ApiClient from 'utils/ApiClient'

const HMACREGEX = /^(hmac theuserid:+([0-9])+(:)+([0-9a-z])).*$/
const XDATEREGEX = /^[0-9]{10}/
const SECRET = 'thesecrecttousewithhmacauthrequests'
const USERID = 'theuserid'

describe('(Utils) ApiClient', () => {

  it('returns a function to create new clients objects for http requests', () => {
    const client = new ApiClient()
    expect(ApiClient).to.be.a('function')
    expect(client).to.be.an('object')
    expect(client.get).to.be.a('function')
    expect(client.post).to.be.a('function')
    expect(client.put).to.be.a('function')
    expect(client.patch).to.be.a('function')
    expect(client.del).to.be.a('function')
  })
  it('ensure the ApiClient object returns a promise', () => {
    const client = new ApiClient()
    expect(client.get() instanceof Promise).to.be.equal(true)
    expect(client.post() instanceof Promise).to.be.equal(true)
    expect(client.put() instanceof Promise).to.be.equal(true)
    expect(client.patch() instanceof Promise).to.be.equal(true)
    expect(client.del() instanceof Promise).to.be.equal(true)
  })
  it('returns an http client for Basic Authentication requests - GET /auth/token', () => {
    const client = new ApiClient(() => {}, { login: {} }, true)

    return client.get('/auth/token', {
      hmac: false,
      headers: {
        'Authorization': 'basic ' + 'user:password'
      }
    }).then(() => { }, (httpClient) => {
      expect(httpClient.method).to.be.equal('GET')
      expect(httpClient.url).to.be.match(/\/api\/auth\/token/)
      expect(httpClient.header.Authorization).to.be.equal('basic user:password')
    })

  })
  it('returns an http client for HMAC Authentication requests - DELETE /auth/token', () => {
    const client = new ApiClient(() => {}, {
      login: { secret: SECRET, user: { _id: 'theuserid' } },
    }, true)

    return client.del('/auth/token').then(() => { },
      (httpClient) => {
        expect(httpClient.method).to.be.equal('DELETE')
        expect(httpClient.url).to.be.match(/\/api\/auth\/token/)
        expect(httpClient.header.Authorization).to.be.match(HMACREGEX)
        expect(httpClient.header.x_date).to.be.match(XDATEREGEX)
    })

  })
  it('returns an http client for HMAC Authentication requests - POST /building', () => {
    const client = new ApiClient(() => {}, {
      login: { secret: SECRET, user: { _id: USERID } },
    }, true)
    const payload = {
      name: 'the building name',
      location: {
        address: '123 test street',
        city: 'test city'
      }
    }

    return client.post('/building', { data: payload }).then(() => { },
      (httpClient) => {
        expect(httpClient.method).to.be.equal('POST')
        expect(httpClient.url).to.be.match(/\/api\/building/)
        expect(httpClient.header.Authorization).to.be.match(HMACREGEX)
        expect(httpClient.header.x_date).to.be.match(XDATEREGEX)
        expect(httpClient.header['Content-Type']).to.equal('application/json')
        expect(httpClient._data).to.eql(payload)
    })

  })
  it('returns an http client for HMAC Authentication requests - GET with params /measure', () => {
    const client = new ApiClient(() => {}, {
      login: { secret: SECRET, user: { _id: USERID } },
    }, true)
    const params = {
      projectType: 'Lighting'
    }

    return client.get('/measure', { params: params }).then(() => { },
      (httpClient) => {
        expect(httpClient.method).to.be.equal('GET')
        expect(httpClient.url).to.be.match(/\/api\/measure/)
        expect(httpClient.header.Authorization).to.be.match(HMACREGEX)
        expect(httpClient.header.x_date).to.be.match(XDATEREGEX)
        expect(httpClient._query).to.eql(['projectType=Lighting'])
    })

  })
  it('returns an http client for HMAC Authentication requests - PUT /building', () => {
    const client = new ApiClient(() => {}, {
      login: { secret: SECRET, user: { _id: USERID } },
    }, true)
    const payload = {
      name: 'the updated building name',
      location: {
        address: '123 test street updated',
        city: 'test city updated'
      }
    }

    return client.put('/building', { data: payload }).then(() => { },
      (httpClient) => {
        expect(httpClient.method).to.be.equal('PUT')
        expect(httpClient.url).to.be.match(/\/api\/building/)
        expect(httpClient.header.Authorization).to.be.match(HMACREGEX)
        expect(httpClient.header.x_date).to.be.match(XDATEREGEX)
        expect(httpClient.header['Content-Type']).to.equal('application/json')
        expect(httpClient._data).to.eql(payload)
    })

  })
  it('returns an http client for HMAC Authentication requests - PATCH /user', () => {
    const client = new ApiClient(() => {}, {
      login: { secret: SECRET, user: { _id: USERID } },
    }, true)
    const payload = {
      name: 'patch user name',
      location: {
        address: '123 test street patch',
        city: 'test city patch'
      }
    }

    return client.patch('/user', { data: payload }).then(() => { },
      (httpClient) => {
        expect(httpClient.method).to.be.equal('PATCH')
        expect(httpClient.url).to.be.match(/\/api\/user/)
        expect(httpClient.header.Authorization).to.be.match(HMACREGEX)
        expect(httpClient.header.x_date).to.be.match(XDATEREGEX)
        expect(httpClient.header['Content-Type']).to.equal('application/json')
        expect(httpClient._data).to.eql(payload)
    })

  })

})
