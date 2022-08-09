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

class Timers {

    findTimersByUserId = async userId => {
        return knex("timers")
        .select()
        .where({ user_id: userId })
    }

    createTimer = async ({ userId, description }) => { 
        return knex("timers").insert({
            description: description,
            user_id: userId,
        }).returning('id')
    }

    stopTimer = async (timerId) => {
        return knex("timers").where({ id: timerId }).update({
            is_active: false,
            end: knex.fn.now()
        })
    }

    deleteTimer = async timerId => {
        knex("timers")
         .where({id: timerId})
         .delete()
    }
}

module.exports = new Timers()