const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.DB_CONNECTION);

const dbconnection = client.connect();
const database = client.db(process.env.DB_NAME);
const mediaCollection = database.collection(process.env.COLLECTION);
console.log(`Connected to DB ... `);

module.exports.client = client;
module.exports.dbconnection = dbconnection;
module.exports.database = database;
module.exports.mediaCollection = mediaCollection;
