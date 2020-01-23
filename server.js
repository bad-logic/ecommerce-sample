const { app } = require('./app');


// DATABASE CONNECTION WITH ODM=>MONGOOSE
const { connectToDb } = require('./util/db_conn');
connectToDb()
    .then(connection => {
        console.log("database connection successfull");
        app.listen(3000, (err, done) => {
            if (err) {
                console.log("error starting the server");
            } else {
                console.log("server has started at port 3000");
            }
        });
    })
    .catch(err => {
        console.log("error>>", err);
    });



// WITHOUT ODM=> MONGOOSE
// const { dbConn } = require('./util/db_conn');

// dbConn(() => {
//     console.log("successfully connected to the database");
//     app.listen(3000, (err, done) => {
//         if (err) {
//             console.log("unable to start the server");
//         } else {
//             console.log("server is listening at localhost:3000");
//         }
//     });
// });