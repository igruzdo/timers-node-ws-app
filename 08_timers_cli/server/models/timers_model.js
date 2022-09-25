const clientPromise = require("../db/db");
const { ObjectId } = require("mongodb");

class Timers {
  constructor(clientPromise) {
    (async () => {
      this.clientPromise = await clientPromise;
      this.collection = this.clientPromise.db("users").collection("timers");
    })();
  }

  findTimersByUserId = async (userId) => {
    return await this.collection.find({ user_id: userId }).toArray();
  };

  createTimer = async ({ userId, description }) => {
    const { insertedId } = await this.collection.insertOne({
      description: description,
      user_id: userId,
      is_active: true,
      start: new Date(),
      end: "",
    });
    return insertedId.toString();
  };

  stopTimer = async (timerId) => {
    console.log(timerId)
    try{
      const { modifiedCount } = await this.collection.updateOne(
        {
          _id: ObjectId(timerId),
        },
        {
          $set: {
            is_active: false,
            end: new Date(),
          },
        }
      );
      return modifiedCount;
    } catch(err) {
      return 0;
    }

  };

  deleteTimer = async (timerId) => {
    const { deletedCount } = await this.collection.deleteOne({
      _id: ObjectId(timerId),
    });

    if (deletedCount === 0) throw new Error("Произошла ошибка создания сессии");
  };
}

module.exports = new Timers(clientPromise);
