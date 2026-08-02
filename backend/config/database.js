const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'protricks',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function query(sql, params = []) {
    const [rows] = await pool.execute(sql, params);
    return rows;
}

async function getOne(sql, params = []) {
    const rows = await query(sql, params);
    return rows[0] || null;
}

async function insert(table, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
    const result = await query(sql, values);
    return result.insertId;
}

async function update(table, data, where, params = []) {
    const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), ...params];
    const sql = `UPDATE ${table} SET ${setClause} WHERE ${where}`;
    const result = await query(sql, values);
    return result.affectedRows;
}

async function deleteRows(table, where, params = []) {
    const sql = `DELETE FROM ${table} WHERE ${where}`;
    const result = await query(sql, params);
    return result.affectedRows;
}

module.exports = {
    pool,
    query,
    getOne,
    insert,
    update,
    deleteRows
};