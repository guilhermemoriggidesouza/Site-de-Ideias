var express  = require('express');
var app  = express();
var bodyParser = require('body-parser');
var consign = require('consign');
var session = require('express-session');
var multiparty = require('connect-multiparty');


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(multiparty());
app.use(express.json());
app.use(express.static("./public/"));
app.use(session({
    secret: 'sdaga',
    resave: false,
    saveUninitialized: true
  }))
// app.use(function(req, res, next){
//     // res.setHeader("Access-Control-Allow-Origin", "*");
//     // res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
//     // // res.setHeader("Access-Control-Allow-Headers", "content-types");
//     // res.setHeader("Access-Control-Allow-Credentials", true);
    
//     next();
// })

consign()
    .include('./api')
    .then('./app/paginas.js')
    .into(app);

module.exports = app;