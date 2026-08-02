const { query, getOne, insert, update } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class User {
    static async findByEmail(email) {
        return await getOne('SELECT * FROM users WHERE email = ?', [email]);
    }

    static async findById(id) {
        return await getOne('SELECT id, email, name, role, is_admin, is_verified, created_at FROM users WHERE id = ?', [id]);
    }

    static async create(data) {
        const { email, password, name } = data;
        const hashedPassword = await bcrypt.hash(password, 12);

        const userId = await insert('users', {
            email,
            password: hashedPassword,
            name,
            is_admin: 0,
            is_verified: 1,
            created_at: new Date()
        });

        return await this.findById(userId);
    }

    static async comparePassword(user, candidatePassword) {
        return await bcrypt.compare(candidatePassword, user.password);
    }

    static generateToken(user) {
        return jwt.sign(
            { id: user.id, email: user.email, role: user.role || 'user' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );
    }
}

module.exports = User;