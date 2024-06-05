'use strict'

const bcrypt = require('bcrypt');
var usuariosModelo = require('../modelo/usuarios');
var usuario = new usuariosModelo();
var jwt = require('../servicio/jwt');
var fs = require('fs'); //fileStream
var path = require('path');

function prueba(req, res) {
    console.log("PROCESANDO");
    res.status(200).send([{ "0": "", "id": "", "1": "", "origen": "", "2": "", "destino": "" }, { "0": "1", "id": "1", "1": "CDMX", "origen": "CDMX", "2": "ACAPULCO", "destino": "ACAPULCO" }, { "0": "10", "id": "10", "1": "Guadalajara", "origen": "Guadalajara", "2": "usa", "destino": "usa" }, { "0": "12", "id": "12", "1": "Wuan China", "origen": "Wuan China", "2": "City M\u00c3\u00a9xico", "destino": "City M\u00c3\u00a9xico" }, { "0": "2", "id": "2", "1": "CDMX", "origen": "CDMX", "2": "CHETUMAL", "destino": "CHETUMAL" }, { "0": "3", "id": "3", "1": "CDMX", "origen": "CDMX", "2": "MAZATLAN", "destino": "MAZATLAN" }, { "0": "4", "id": "4", "1": "MERIDA", "origen": "MERIDA", "2": "CDMX", "destino": "CDMX" }, { "0": "5", "id": "5", "1": "CDMX", "origen": "CDMX", "2": "FRANCIA", "destino": "FRANCIA" }, { "0": "6", "id": "6", "1": "Israel", "origen": "Israel", "2": "Egipto", "destino": "Egipto" }, { "0": "7", "id": "7", "1": "Tlapala state", "origen": "Tlapala state", "2": "Neza city", "destino": "Neza city" }, { "0": "8", "id": "8", "1": "Venustiano Carranza", "origen": "Venustiano Carranza", "2": "Milpa Alta", "destino": "Milpa Alta" }, { "0": "9", "id": "9", "1": "Chalco", "origen": "Chalco", "2": "Amecameca", "destino": "Amecameca" }]);
}

function registrarUsuario(req, res) {
    var params = req.body; //recibe todos los datos por Por el Metodo POST
    //console.log(params);

    usuario.nombre = params.nombre;
    usuario.apellido = params.apellido;
    usuario.email = params.email;
    usuario.rol = 'ROLE_ADMIN';
    usuario.imagen = 'null';

    if (params.password) {
        bcrypt.hash(params.password, 10, function(err, hash) {
            usuario.password = hash;
            if (usuario.nombre != null && usuario.apellido != null && usuario.email != null) {
                //guardar el ususario en BD
                usuario.save((err, usuarioAlmacenado) => {
                    if (err) {
                        res.status(500).send({ mesagge: 'Error al guardar el usuario' });
                    } else {
                        if (!usuarioAlmacenado) {
                            res.status(404).send({ mesagge: 'No se ha registrado el usuario' });
                        } else {
                            //nos devuelve un objeto con los datos del usuario guardado
                            res.status(200).send([{
                                "id": usuarioAlmacenado._id,
                                "nombre": usuarioAlmacenado.nombre,
                                "apellido": usuarioAlmacenado.apellido,
                                "email": usuarioAlmacenado.email,
                                "password": usuarioAlmacenado.password
                            }]);
                            console.log(usuarioAlmacenado);
                        }
                    }
                });
            } else {
                res.status(404).send({ mesagge: 'Introduce todos los campos' });
            }
        });

    } else {
        res.status(404).send({ mesagge: 'Introduce la contraseña' });
    }

}

function accesoUsuario(req, res) {
    var params = req.body;
    var email = params.email;
    var password = params.password;

    usuariosModelo.findOne({ email: email }, (err, user) => {
        if (err) {
            res.status(500).send({ mesagge: 'Error en la peticion al servidor' });
        } else {
            if (!user) {
                res.status(404).send({ mesagge: 'El usuario no existe' });
            } else {
                bcrypt.compare(password, usuario.password, function(err, check) {
                    if (check) {
                        console.log('coincide el password')
                        if (params.gethash) {
                            res.status(200).send({
                                token: jwt.createToken(user)
                            });
                            //devolver un token de jwt
                        } else {
                            res.status(200).send({ user: user });
                        }
                    } else {
                        res.status(404).send({ mesagge: 'El usuario no se ha identificado' });
                    }
                });
            }
        }
    });
}

function actualizarUsuario(req, res) { //PUT
    var userId = req.params.id; //GET
    var update = req.body //POST

    usuariosModelo.findByIdAndUpdate(userId, update, (err, userUpdate) => {
        if (err) {
            res.status(500).send({ message: 'Error al actualizar el usuario en el servidor' });
        } else {
            if (!userUpdate) {
                res.status(404).send({ message: 'No se ha podido encontar el usuario' });
            } else {
                res.status(200).send({ user: userUpdate });
            }
        }
    });
}

function actualizarFoto(req, res) {
    var UserId = req.params.id;
    if (req.files) {
        var file_path = req.files.image.path;
        console.log(file_path);
        var file_split = file_path.split('\\');
        //     cargas\usuario\foto.jpg
        var file_name = file_split[2];
        var extension = file_name.split('\.');
        var file_ext = extension[1];

        if (file_ext == 'png' || file_ext == 'gif' || file_ext == 'jpg') {
            usuariosModelo.findByIdAndUpdate(UserId, { imagen: file_name[2] }, (err, user) => {
                if (err) {
                    res.status(500).send({ mesagge: 'Error al buscar el usuario' });
                }
                if (!user) {
                    res.status(404).send({ mesagge: 'Error en el id' });
                } else {
                    res.status(200).send({
                        user: user
                    });
                }
            })
        } else {
            res.status(404).send({ mesagge: 'El formato no es adecuado' });
        }
    } else {
        res.status(404).send({ mesagge: 'No cargo el archivo.....' });
    }
}

function actualizarFoto2(req, res) {
    //var UserId = req.params.id;
    if (req.files) {
        var file_path = req.files.image.path;
        /*var file_arreglo = file_path.split('\\'); //     cargas\usuario\foto.jpg
        var file_name = file.split[2];
        var extension = file_arreglo[2].split('\.');
        if (extension[1] == 'png' || extension[1] == 'gif' || extension[1] == 'jpg') {
            usuariosModelo.findByIdAndUpdate(UserId, { imagen: file_arreglo[2] }, (err, user) => {
                if (err) {
                    res.status(500).send({ mesagge: 'Error al buscar el usuario' });
                }
                if (!user) {
                    res.status(404).send({ mesagge: 'Error en el id' });
                } else {
                    res.status(200).send({
                        image: file_name,
                        user: user
                    });
                }
            })
        } else {
            res.status(404).send({ mesagge: 'El formato no es adecuado' });
        }]*/
        res.status(200).send({ mesagge: 'cargo el archivo éxito' });
    } else {
        res.status(404).send({ mesagge: 'No cargo el archivo.....' });
    }
}

function getFoto(req, res) {
    var imageFile = req.params.imageFile;
    var rutaFoto = './cargas/usuario/' + imageFile;
    console.log(imageFile);
    fs.exists(rutaFoto, function(existe) {
        if (existe) {
            res.sendFile(path.resolve(rutaFoto));
        } else {
            res.status(404).send({ mesagge: 'No has cargado una imagen con ese nombre' });
        }
    })

}


function borra(req, res) {
    var usId = req.params.id;
    console.log(usId);
    usuariosModelo.findByIdAndRemove(usId, (err, us) => {
        if (err) {
            res.status(500).send('Error en el servidor');
        } else if (!us) {
            res.status(404).send('No se encontró el usuario');
        } else {
            res.status(200).json({ usuario: us });
        }
    });
}


module.exports = {
    prueba,
    registrarUsuario,
    accesoUsuario,
    actualizarUsuario,
    actualizarFoto,
    actualizarFoto2,
    getFoto,
    borra
};