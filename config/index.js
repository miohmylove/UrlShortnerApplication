module.exports = {
    PORT: 3000,
    data: {
        dbUrl: 'mongodb+srv://<dbUserName>:<dbPassword>@cluster0-apsjg.mongodb.net/<dbCollectionName>?retryWrites=true&w=majority'
    },
    session: {
        sessionKey: '<Your secret key>'
    }
}