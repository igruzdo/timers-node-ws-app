const { nanoid } = require("nanoid");
const clientPromise = require("../db/db");
const { ObjectId } = require("mongodb");

class Users {
  constructor(clientPromise) {
    (async () => {
      this.clientPromise = await clientPromise;
      this.collection = this.clientPromise.db("users").collection("users");
    })();
  }

  createUser = async (username, password_hash) => {
    const { insertedId } = await this.collection.insertOne({
      _id: new ObjectId(),
      name: username,
      password_hash,
    });
    return insertedId;
  };

  findUserByUsername = async (username) => {
    const usersArray = await this.collection.find({ name: username }).toArray();

    return usersArray[0];
  };

  findUserById = async (userId) => {
    const usersArray = await this.collection.find({ _id: ObjectId(userId) }).toArray();

    return usersArray[0];
  };

  findUserBySessionID = async (sessionId) => {
    const usersArray = await this.collection.find({ sessionId: sessionId }).toArray();

    return usersArray[0];
  };

  createSession = async (userId) => {
    const sessionId = nanoid();
    const { modifiedCount } = await this.collection.updateOne(
      {
        _id: userId,
      },
      {
        $set: {
          sessionId: sessionId,
        },
      }
    );
    if (modifiedCount === 0) throw new Error("Произошла ошибка создания сессии");
    return sessionId;
  };

  deleteSession = async (sessionId) => {
    const { modifiedCount } = await this.collection.updateOne(
      {
        sessionId: sessionId,
      },
      {
        $unset: {
          sessionId: "",
        },
      }
    );

    if (modifiedCount === 0) throw new Error("Произошла ошибка удаления сессии");

    return modifiedCount;
  };
}

module.exports = new Users(clientPromise);
