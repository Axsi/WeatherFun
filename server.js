const env = require('dotenv').config();
const express = require('express');
const fs = require('fs');
const app = express();

const submit = require('./routes/submit');


//express.static exposes a directory or a file to a particular URL so it's contents can be publicly accessed
app.use(express.static(__dirname + '/public/'));

//app.get routes HTTP GET requests to the specified path with the specified callback functions. '/' is the root path
//It seems this app.get is called when the localhost is loaded, which then redirects to the Mainpage.html and loads that page
app.get('/', function(req, res){
    res.redirect('/MainPage');
});

//res.sendFile transfers the file at the given path. Sets the Content-Type resposne HTTP header field based on the filename's extension.
//root is for the root directory for relative filenames, __dirname is a global variable which is the same as the path.dirname() function
//it will give you the directory in which the executing file is located. In this case the executing file is server.js which is located in WeatherFun which is why you + '/public' to get to
//MainPage.html
app.get('/MainPage', function(req, res){
    res.sendFile('MainPage.html', {root: __dirname + '/public'});
});

// app.set('views', __dirname + '/public');
app.use('/', submit);

// app.get('/submit', function(req, res){
//     console.log(req);
// });

app.listen(process.env.PORT || 8100, function (){
    console.log('Server running on http://localhost:8100/');
    // console.log(process.env);
});