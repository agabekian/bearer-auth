'use strict';

const base64 = require('base-64');
const {users} = require('../models/index.js');

module.exports = async (req, res, next) => {
    console.log("INCOMING", req.headers.authorization)
    if (!req.headers.authorization) {
        next("Auth not possible");
        // return _authError();
    }
    let basic = req.headers.authorization;
    // let [username, password] = base64.decode(basic).split(' ');
    let codedPart = basic.split(' ').pop();
    let [username, password] = base64.decode(codedPart).split(':');
    console.log("decoded password", username, password);

    try {
        req.user = await users.authenticateBasic(username, password)
        next();
    } catch (e) {
        console.error(e);
        res.status(403).send('Invalid Login Sirrrrr');
    }
}

