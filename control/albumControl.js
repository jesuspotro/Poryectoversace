var fs = require('fs');
var path = require('path');
var mongoosePagina = require('mongoose-pagination');

var artModelo = require('../modelo/artistas');
var Album = require('../modelo/album');
var Cancion = require('../modelo/cancion');

function getAlbum(req, res) {
    var albumId = req.params.id;
    //path artista tambien funciona sin el path y las llaves, "artista" esta en el modelo del album
    Album.findById(albumId).populate({ path: 'artista' }).exec((err, album) => {
        if (err) {
            res.status(500).send({ message: 'Error en la petición' });
        } else {
            if (!album) {
                res.status(404).send({ message: 'El album no existe' });
            } else {
                res.status(200).send({ album });
            }
        }

    });
}

function saveAlbum(req, res) {
    var album = new Album;

    var params = req.body;
    album.titulo = params.titulo;
    album.descripcion = params.descripcion;
    album.year = params.year;
    album.imagen = "null";
    album.artista = params.artista;
    console.log(params);
    album.save((err, albumAlmacenado) => {
        if (err) {
            res.status(500).send({ message: 'Error en el servidor' });
        } else {
            if (!albumAlmacenado) {
                res.status(404).send({ message: 'No se ha gurado el album' });
            } else {
                res.status(200).send({ album: albumAlmacenado });
            }
        }
    });

}

module.exports = {
    getAlbum,
    saveAlbum
}