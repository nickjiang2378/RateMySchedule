const express = require('express');
const router = require('./routes')

// Loads env variables
//require('dotenv').config()
// Initalizes express server
const app = express();

// specifies what port to run the server on
let PORT = process.env.PORT;
if (PORT == null || PORT == "") {
  PORT = 3001;
}

// Adds json parsing middleware to incoming requests
app.use(express.json());

// makes the app aware of routes in another folder
app.use('/', router)

// console.log that your server is up and running
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

app.on("listening", () => {
    console.log("Server is running")
})

