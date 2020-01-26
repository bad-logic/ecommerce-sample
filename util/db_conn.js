// USING ODM => MONGOOSE

const mongoose = require('mongoose');

const connectToDb = () => mongoose.connect('mongodb://localhost:27017/nosql-ecommerce', {

    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true

});

exports.connectToDb = connectToDb;


// WITHOUT USING ODM

// const mongoDb = require('mongodb');
// const mongoClient = mongoDb.MongoClient;
// let _db;
// const dbConn = (cb) => {
//     mongoClient.connect('mongodb://localhost:27017/nosql-ecommerce', { useUnifiedTopology: true })
//         .then(client => {
//             _db = client.db(); //saving the database connectin in _db variable
//             cb();
//         })
//         .catch(err => {
//             console.log("error connecting to the database");
//             throw err;
//         });
// }

// const getDb = () => {
//     if (_db) {
//         return _db; // returning the database connection if available
//     }
//     throw 'No database found';
// }

// exports.dbConn = dbConn;
// exports.getDb = getDb;