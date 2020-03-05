var mongoose = require('mongoose')

// Model for URL
const UrlModel = mongoose.model('urls', {
    originalUrl: String,
    shortenedUrl: String,
    creationDate: Date,
    expirationDate: Date,
    noOfHits: Number
})

// Model for userUrls
const UserUrls = mongoose.model('userUrls', {
    userId: String,
    shortenedUrl: String
})

module.exports = { UrlModel, UserUrls }