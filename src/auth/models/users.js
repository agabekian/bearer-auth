'use strict';
require('dotenv').config();

const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const SECRET = process.env.SECRET;
const userSchema = (sequelize, DataTypes) => {
    const model = sequelize.define('User', {
        username: {type: DataTypes.STRING, allowNull: false, unique: true},
        password: {type: DataTypes.STRING, allowNull: false,},
        token: {
            type: DataTypes.VIRTUAL,
            get()
            {   //method
                return jwt.sign({username: this.username}, SECRET);
            },
            set(tokenObj)
            {
                return jwt.sign(tokenObj, SECRET);
            }
        }
    });

    model.beforeCreate(async (user) => {
        let hashedPass = await bcrypt.hash(user.password, 10); //AWAIT was missing! BUGGGG
        user.password = hashedPass;
    });

    // Basic AUTH: Validating strings (username, password)
    model.authenticateBasic = async function (username, password) {
        console.log("received", username, password);
        const user = await this.findOne({where:{username:"ara"}});
        const valid = await bcrypt.compare(password, user.password)
        if (valid) {
            return user;
        }
        throw new Error('Invalid User Sir');
    }

    // Bearer AUTH: Validating a token
    model.authenticateToken = async function (token) {
        try {
            const parsedToken = jwt.verify(token, SECRET);
            const user = this.findOne({username: parsedToken.username})
            if (user) {
                return user;
            }
            throw new Error("User Not Found");
        } catch (e) {
            throw new Error(e.message)
        }
    }

    return model;
}

module.exports = userSchema;
