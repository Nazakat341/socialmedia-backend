'use strict';

const jwt = require('jsonwebtoken');
const config = require('./environment');
const User = require('../api/user/user.model');

var common = require('../config/global-emitter');

module.exports = function (socketio) {
    socketio.of("/unauth")
        .on('connection', function (socket) {

            socket.on('hello', (name) => {
                socket.emit('hello', `My name is ${name}`)
            });

            socket.connectedAt = new Date();
            socket.address = `${socket.request.connection.remoteAddress} : ${socket.request.connection.remotePort}`;

            unauthenticatedConnect(socket);
            // console.info('[%s] CONNECTED', socket.address);

            socket.log = function (...data) {
                console.log(`SocketIO ${socket.nsp.name} [${socket.address}]`, ...data);
            };
        });

    socketio.of("/auth")
        .use(function (socket, next) {
            let { query } = socket.handshake;
            if (query && query['token']) {

                jwt.verify(query['token'], process.env.TOKEN_SECRET_SESSION, function (error, decoded) {
                    if (error) {
                        console.log(`*******Invalid Token`);
                        return next(new Error('Authentication error'));
                    }
                    socket['decoded'] = decoded;
                    next();
                });
            }
            else {
                console.log(`*******No Token`);
                next(new Error('Authentication error'));
            }
        }).use(async (socket, next) => {
            if (socket['decoded']['role'] !== 'user') return next(new Error('Only user can perform this action'));

            socket['user'] = await User.findById(socket['decoded']['_id']);
            if (!socket['user']) return next(new Error('You are unauthorized'));
            next();
        })
        .on('connection', function (socket) {
            socket.on('hello', (name) => {
                console.log(name);
                socket.emit('hello', `My name is ${name}`)
            });

            socket.connectedAt = new Date();

            socket.on('disconnect', () => onDisconnect(socket));

            socket.address = `${socket.request.connection.remoteAddress} : ${socket.request.connection.remotePort}`;
            onAuthSocketConnect(socket);

            // console.info('[%s] CONNECTED', socket.address);

            socket.log = function (...data) {
                console.log(`SocketIO ${socket.nsp.name} [${socket.address}]`, ...data);
            };
        })
        .on('disconnect', function (socket) {
            console.log(`************ disconnect FIRED`)
        })
};

function unauthenticatedConnect(socket) {
    socket.on('info', function (data) {
        console.info('[%s] %s', socket.address, JSON.stringify(data, null, 2));
    });

    require('../api/user/user.socket').register(socket);
}

async function onAuthSocketConnect(socket) {
    let onlineUsers = {};
    let keyName = socket["user"]["_id"].toString();
    require('../api/chat/chat.socket').register(socket);
    require('../api/post/post.socket').register(socket);


    onlineUsers[socket["user"]["_id"]] = {
        "name": socket["user"]["name"],
        "firstName": socket["user"]["firstName"],
        "lastname": socket["user"]["lastname"],
        "username": socket["user"]["username"],
        "gender": socket["user"]["gender"],
        "profilePicture": socket["user"]["profilePicture"],
        "followers": socket["user"]["followers"],
        "following": socket["user"]["following"],
        "friends": socket["user"]["friends"],
        "role": socket["user"]["role"],
        "username": socket["user"]["username"],
        "code": socket["user"]["code"],
        "description": socket["user"]["description"],
    };
    onlineUsers = JSON.stringify(onlineUsers)

    // save user in active:friends /////////  Redis  ////////////
    await redis.HSET("active:friends", keyName, onlineUsers);

    // Emit my online status to all my friends
    if (socket["user"]["friends"].length > 0) {
        for (let index = 0; index < socket["user"]["friends"].length; index++) {
            const friend = socket["user"]["friends"][index];
            // Send Refresh Chat History All Array to all of my friends
            const refreshed = await refreshChatHistory(socket, friend);

            socket["user"]["isOnline"] = true;

            socket.emit(`is:Online:${friend}`, { user: socket["user"] });
            socket.broadcast.emit(`is:Online:${friend}`, { user: socket["user"] });
            socket.emit(`chat:history:all:${friend}`, refreshed);
            socket.broadcast.emit(`chat:history:all:${friend}`, refreshed);


            // Send Active Friends Array to all of my friends
            const getAllActiveFriend = await getAllActiveFriends(socket, friend);
            socket.broadcast.emit(`active:friends:${friend}`, getAllActiveFriend);
        }

        console.log(`***** online`, socket["user"]["_id"])
    }



    socket.on('info', function (data) {
        console.info('[%s] %s', socket.address, JSON.stringify(data, null, 2));
        console.log('connected');
    });


}

async function onDisconnect(socket) {
    // console.info('[%s] DISCONNECTED', socket.address);
    console.info('[%s] DISCONNECTED HOLOLOLO', socket["decoded"]["_id"]);

    // Emit my offline status to all my friends
    if (socket["user"]["friends"].length > 0) {

        // socket["user"]["followers"].forEach(element => {
        //     socket.emit('is:Online:' + element, socket["user"]);
        //     socket.broadcast.emit('is:Online:' + element, socket["user"]);
        //     // console.log(`is:Online:${element}`)
        // });

        await redis.hdel('active:friends', socket["user"]["_id"].toString());

        for (let index = 0; index < socket["user"]["friends"].length; index++) {
            const friend = socket["user"]["friends"][index];

            socket["user"]["isOnline"] = false;
            socket.emit('is:Online:' + friend, { user: socket["user"] });
            socket.broadcast.emit('is:Online:' + friend, { user: socket["user"] });

            const refreshed = await refreshChatHistory(socket, friend);
            socket.emit(`chat:history:all:${friend}`, refreshed);
            socket.broadcast.emit(`chat:history:all:${friend}`, refreshed);

            // Send Active Friends Array to all of my friends
            const getAllActiveFriend = await getAllActiveFriends(socket, friend);
            console.log(`********* on offline`, friend)
            socket.broadcast.emit(`active:friends:${friend}`, getAllActiveFriend);
        }
    }

}