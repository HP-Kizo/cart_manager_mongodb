const mongodb = require("mongodb");

const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
  MongoClient.connect(
    "mongodb+srv://anhyeuemlt001:hoimanchi@cluster0.uhveq97.mongodb.net/?retryWrites=true&w=majority"
  )
    .then((result) => {
      console.log("Connected");
      _db = result.db();
      callback();
    })
    .catch((err) => console.log(err));
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw "No database found";
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
