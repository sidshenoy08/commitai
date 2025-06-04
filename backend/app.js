const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;

mongoose.connect(process.env.DB_URL);

const User = mongoose.model('User', {
    username: { type: String },
    password: { type: String }
});

function registerUser(userCredentials) {
    bcrypt.hash(userCredentials.password, Number(process.env.SALT_ROUNDS))
        .then(async (hashedPassword) => {
            await User.create({
                username: userCredentials.username,
                password: hashedPassword
            })
                .then((user) => {
                    console.log("New user created");
                })
                .catch((err) => {
                    console.log(err);
                })
        });
}

async function authenticateUser(userCredentials) {
    const user = await User.findOne({ username: userCredentials.username });
    if (user) {
        bcrypt.compare(userCredentials.password, user.password, function (err, result) {
            if (result) {
                console.log("Password matches!");
            } else {
                console.log("Passwords do not match!");
            }
        });
    } else {
        console.log("No such user exists!");
    }
}

app.post("/login", (request, response) => {
    authenticateUser(request.body);
    response.status(200).json({ message: 'Success' });
});

app.post("/register", (request, response) => {
    registerUser(request.body);
    response.status(200).json({ message: 'Success' });
});

app.listen(PORT, () => {
    console.log("Server listening on port number: ", PORT);
});