const { nanoid } = require("nanoid");
const knex = require('knex')({
    client: "pg",
    connection: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    }
  })

class Users {

    createUser = async (username, password_hash) => {
        return await knex("users")
        .insert({
            name: username,
            password_hash
        })
        .returning('id')
    }

    findUserByUsername = async username => {
        return await knex("users")
        .select()
        .where({ name: username })
        .limit(1)
        .then(data => data[0])
    }

    findUserById = async userId => {
        return await knex("users")
        .select()
        .where({ id: userId })
        .limit(1)
        .then(data => data[0])
    }

    findUserBySessionID = async sessionId => {  
        return await knex("users")
        .select()
        .where({ session_id: sessionId })
        .limit(1)
        .then(data => data[0])
    }

    createSession = async (userId) => {
        const sessionId = nanoid();
        await knex("users")
            .where({ id: userId })
            .update({
                session_id: sessionId
            })
        return sessionId
    }

    deleteSession = async sessionId => {
        const [id] = await knex("users")
            .where({ session_id: sessionId })
            .update({
                session_id: null
            }).returning('id')

        if(!id) throw new Error('Произошла ошибка удаления сессии')
        return id
    }
}

module.exports = new Users()