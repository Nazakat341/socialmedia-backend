/**
 * Broadcast updates to client when the model changes
 */

'use strict';

let User = require('./user.model');

exports.register = (socket) => {
    process.on('notifyOnFanActive', async function (starDetails) {
        let users = await User.find({role: 'user', type: 'Fan', status: 'Registered'}).select({name: 1});
        let response = {
            data: {
                starName: starDetails['name'],
                starAvatar: starDetails['profilePicture'],
                starBio: starDetails['biography'],
                starProfession: starDetails['profession'],
            }
        }
        users.forEach(user=> {
            response['message'] = `Hey ${user['name']}, The Star ${starDetails['name']} is online right now! He is able to receive calls`;
            socket.emit(`starActive:${user['_id']}`, response);
        });
    });
}

function onSave(socket, doc, cb) {
    socket.emit('address:save', doc);
}

function onRemove(socket, doc, cb) {
    socket.emit('address:remove', doc);
}