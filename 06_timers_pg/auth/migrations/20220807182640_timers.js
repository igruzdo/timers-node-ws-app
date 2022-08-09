exports.up = function(knex) {
    return knex.schema.createTable("timers", (table) => {
        table.increments("id");
        table.integer("user_id", 255).notNullable();
        table.string("description", 255).notNullable();
        table.boolean("is_active", 255).defaultTo(true);;
        table.timestamp("start", 255).defaultTo(knex.fn.now());
        table.timestamp("end", 255);
      });
};

exports.down = function(knex) {
    return knex.schema.dropTable("timers")
};