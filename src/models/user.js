const db = require('./db');
const bcrypt = require("bcryptjs");
const saltRounds = 10;

class User{
    constructor(id, username, email, organisation, password, refreshToken){
        this.id = id;
        this.username = username;
        this.email = email;
        this.organisation = organisation;
        this.password = password;
        this.refreshToken = refreshToken;
    }

    //static method to create a newly registered user
    // static async createNewUser(email, organisation){
    //     let id = 0;
    //     const username = email.split("@")[0];
    //     const [result] = await db.execute('INSERT INTO user (username, email, organisation) VALUES (?, ?, ?)', [username, email, organisation]);
    //     id = result.insertId;
    //     return new User(id, username, email, organisation)
    // }

    // Static method to find a user by ID
    static async findById(id) {
        const [users] = await db.execute('SELECT * FROM user WHERE id = ?', [id]);
        if (users.length === 0) {
            return null;
        }
        const user = users[0];
        return user;
    }

    // Static method to find a user by other field (username, email)
    static async findBy(field, value) {
        const [users] = await db.execute(`Select * From user Where ${field} = ?`, [value]);
        if (users.length === 0) {
            return null;
        }
        const user = users[0];
        return user;
    }

    // Static method to update the refresh token of the user upon login
    static async updateRefreshToken(refreshToken, id) {
        const user = await User.findById(id);
        await db.execute('UPDATE user SET refresh_token = ? WHERE id = ?', [refreshToken, id]);
    }
}

module.exports = User;