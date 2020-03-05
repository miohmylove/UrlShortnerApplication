const { UrlModel, UserUrls } = require('./Mongoose')
var crypto = require('crypto')

class Url {

    constructor() {
    }

    // Function to increment the number of times the short url is hit
    async increaseHitCount(shortUrl, noOfHits) {
        await UrlModel.findOneAndUpdate({ shortenedUrl: shortUrl }, { noOfHits: noOfHits + 1 })
    }

    // Function to shorten and store the URL to DB
    async shortenUrl(req) {
        var longUrl = req.body.url;
        var originalUrl = longUrl;

        // hash and encode the URL
        var shasum = crypto.createHash('sha1')
        var hashedUrl = shasum.update(longUrl).digest('hex')
        var hashedEncodedUrl = Buffer.from(hashedUrl).toString('base64')

        var shortenedUrl = hashedEncodedUrl.substr(0, 6);

        // Check if url alreasy exist
        var exists = await this.getOriginalUrl(shortenedUrl)

        // check id user is logged in
        if (req.session.token) {
            // check if user has the url
            var existInUser = await this.getUserUrl(shortenedUrl)
            
            // when the user does not have the url - add the url to the user
            if(existInUser.userUrl == null || existInUser.userUrl.length == 0) {
                var storedUserUrl = await this.storeUserUrl(req.session.passport.user.profile.id, shortenedUrl)
            }
        }

        // if the url exists return the shortenedurl
        if (exists.originalUrl != null) {
            return {
                shortenedUrl
            }
        }

        var creationDate = new Date();
        var noOfHits = 0;

        // create a model for the url
        var url = new UrlModel({
            originalUrl,
            shortenedUrl,
            creationDate,
            noOfHits
        })

        // save the url details
        var savedUrl = await url.save()

        var { shortenedUrl } = savedUrl
        return {
            shortenedUrl
        }

    }

    // Function to get the original url from DB
    async getOriginalUrl(shortUrl, fromUrl = false) {
        // check the db for the short url
        var originalUrl = await UrlModel.findOne({ shortenedUrl: shortUrl });

        if (originalUrl != null) {

            // increate the hit count when the short url is accessed from the browser
            if (fromUrl) {
                var hits = await this.increaseHitCount(shortUrl, originalUrl.noOfHits)
            }

            originalUrl = originalUrl.originalUrl
        }

        return {
            originalUrl
        }
    }

    // Function to get all the URL available totally or for the user
    async getAllUrls(req = {}) {
        
        var filter = {};

        // check if the user is logged in
        if(req.session.token) {
            
            // get all the shortened urls for the user
            var userShortenedUrls = await this.getUserUrl(req.session.passport.user.profile.id);

            // convert the object to array
            var userUrlArray = await userShortenedUrls.userUrl.map((url) => {
                return url.shortenedUrl;
            })

            if(userUrlArray.length == 0) {
                return {};
            }
            else {
                filter = { shortenedUrl: {$in: userUrlArray} }
            }
        }

        // get the urls based on the filter
        var allUrl = await UrlModel.find(filter)

        if (allUrl.length) {
            return allUrl.map((url) => {
                return {
                    originalUrl: url.originalUrl,
                    shortenedUrl: req.protocol + '://' + req.get('host') + '/' + url.shortenedUrl,
                    noOfHits: url.noOfHits
                }
            });
        }
        else {
            return {};
        }
    }

    // Function to get the url for the user
    async getUserUrl(userId, shortenedUrl = '') {
        
        // filter setup
        var filter = shortenedUrl == '' ? { userId: userId } : { userId: userId, shortenedUrl: shortenedUrl }

        var userUrl = await UserUrls.find(filter)

        return {
            userUrl
        }

    }

    // Function to store the url for the user/map the url for the user
    async storeUserUrl(userId, shortenedUrl) {

        var userUrl = new UserUrls({
            userId,
            shortenedUrl
        })

        var savedUserUrl = await userUrl.save()

        return {
            savedUserUrl
        }

    }

}


module.exports = Url