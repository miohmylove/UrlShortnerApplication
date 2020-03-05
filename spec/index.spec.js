var request = require('request')

describe('get analytics list', () => {
    it('should return 200 OK', (done) => {
        request.get('http://localhost:3000/get_analtics', (err, res) => {
            expect(res.statusCode).toEqual(200)
            done()
        })
    })
})