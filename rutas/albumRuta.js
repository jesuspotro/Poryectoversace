'use strict'
var express = require('express');
var albumControl = require('../control/albumControl');
var md_auth = require('../middleware/autenticar');
var api = express.Router();

var multipart = require('connect-multiparty');
var dir_fotos = multipart({ uploadDir: './cargas/' });

api.get('/getAlbum/:id', md_auth.validarAcceso, albumControl.getAlbum);
api.post('/registroAlbum/', md_auth.validarAcceso, albumControl.saveAlbum);

module.exports = api;