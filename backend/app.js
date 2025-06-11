const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');

require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;
const options = { expiresIn: process.env.JWT_DURATION };

const upload = multer({dest: 'uploads/'});

mongoose.connect(process.env.DB_URL);

const User = mongoose.model('User', {
    username: { type: String },
    password: { type: String }
});

function generateJWT(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, options);
}

async function registerUser(userCredentials) {
    try {
        const hashedPassword = await bcrypt.hash(userCredentials.password, Number(process.env.SALT_ROUNDS));
        const user = await User.create({
            username: userCredentials.username,
            password: hashedPassword
        });
        if (user) {
            const token = generateJWT({ username: userCredentials.username });
            return token;
        } else {
            return null;
        }
    } catch (err) {
        console.log(err);
        return null;
    }
}

async function authenticateUser(userCredentials) {
    const user = await User.findOne({ username: userCredentials.username });
    if (user) {
        const result = await bcrypt.compare(userCredentials.password, user.password);
        if (result) {
            const token = generateJWT({ username: userCredentials.username });
            return token;
        } else {
            return null;
        }
    } else {
        return null;
    }
}

app.post("/login", async (request, response) => {
    const token = await authenticateUser(request.body);
    if (token) {
        response.status(200).json({ token: token });
    } else {
        response.status(401).json({ message: 'Invalid user credentials' });
    }
});

app.post("/register", async (request, response) => {
    const token = await registerUser(request.body);
    if (token) {
        response.status(201).json({ token: token });
    } else {
        response.status(500).json({ message: 'New user could not be created' });
    }
});

app.post("/upload", upload.array('images'), (request, response) => {
    const authTokenArray = request.header('authorization').split(" ");
    if (authTokenArray[0] !== 'Bearer') {
        response.status(401).json({ message: 'User token is not valid' });
    } else {
        try {
            response.status(200).json({ message: 'Images uploaded' });
        } catch (error) {
            console.log(error);
            response.status(401).json({ message: 'User token has expired or is not valid!' });
        }
    }
});

app.listen(PORT, () => {
    console.log("Server listening on port number: ", PORT);
});