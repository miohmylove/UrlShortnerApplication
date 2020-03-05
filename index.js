const express = require('express')
const bodyParser = require('body-parser')
const path = require('path');
const http = require('http')
const mongoose = require('mongoose')
const config = require('./config')
const passport = require('passport')
const auth = require('./auth')
const cookieParser = require('cookie-parser')
const cookieSession = require('cookie-session')
const Url = require('./class/Url')

const PORT = config.PORT;

var app = express()
// set the view engine for the app
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, './views'))

app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

// oAuth Authentication
auth(passport)
app.use(passport.initialize())
app.use(cookieSession({
    name: 'session',
    keys: [config.session.sessionKey]
}))
app.use(cookieParser())

// Connect to MongoDB
var dbUrl = config.data.dbUrl
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
    console.log('mongodb connection ', err)
})

const url = new Url()

// send and empty response to the favicon or you can send any image you want for the icon
app.get('/favicon.ico', (req, res, next) => {
    // 204 - Empty response
    return res.sendStatus(204);
})

// define the route for the landing page
app.get('/', (req, res) => {
    res.render('index', {
        userSession: req.session.token
    })
})

// defining route for the oAuth call
app.get('/auth/google', passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/userinfo.profile']
}))

// defining route for oAuth callback function
app.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/'
    }),
    (req, res) => {
        req.session.token = req.user.token;
        res.redirect('/');
    }
)

// defining route for oAuth logout
app.get('/logout', (req, res) => {
    req.logout();
    req.session = null;
    res.redirect('/');
})

// api route to get the analytics data
app.get('/get_analtics', async (req, res) => {
    try {
        var urlList = await url.getAllUrls(req)

        res.send({
            urlList
        })
    }
    catch(err) {
        console.log(err)
        res.sendStatus(500)
    }
})

// api route to get the shortened url from the long url
app.post('/get_shortened_url', async (req, res) => {
    
    try {
        
        var { shortenedUrl }= await url.shortenUrl(req)

        shortenedUrl = req.protocol + '://' + req.get('host') + '/' + shortenedUrl
        console.log(shortenedUrl);

        res.send({
            status: 200,
            shortenedUrl
        });
    }
    catch(err) {
        console.log(err)
        res.sendStatus(500)
    }

})

// route definition to redirect to the original url
app.get('/:shortUrl', async (req, res) => {
    try {
        var shortUrl = req.params.shortUrl

        var originalUrl = await url.getOriginalUrl(shortUrl, true)

        if(originalUrl.originalUrl == null) {
            res.sendStatus(404)
        }
        else {
            res.redirect(originalUrl.originalUrl)
        }
    }
    catch(err) {
        console.log(err)
        res.sendStatus(500)
    }
})


app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}....`)
});