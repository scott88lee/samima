const db = require('../db');

const findUserByUsername = async (username) => {
    let SQL = `SELECT * FROM users WHERE username = '${username}'`;
    let result = await db.query(SQL);

    if (result.length > 0) {
        return result.rows[0];
    } else {
        return false;
    }
}

const create = async (user) => {
    let SQL = `INSERT INTO users (username, email, password_hash) VALUES ('${user.username}', '${user.email}', '${user.password_hash}')`;
    let result = await db.query(SQL);

    if (result.rowCount > 0) {
        return true;
    } else {
        return false;
    }
}


module.exports = {
    findUserByUsername,
    create
}
