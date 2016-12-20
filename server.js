var express = require('express');
var morgan = require('morgan');
var path = require('path');
var directory = require('serve-index');

var app = express();

app.use(morgan('dev'));

app.use(express.static('build'));

app.use(directory('build', {'icons': true}));

app.listen(process.env.PORT || 8000, () => console.log('Listening on http://127.0.0.1:8000'));