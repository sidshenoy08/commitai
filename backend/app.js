const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;
const options = { expiresIn: process.env.JWT_DURATION };

const storage = multer.diskStorage({
    destination: (request, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (request, file, cb) => {
        cb(null, file.originalname + "-" + Date.now());
    }
});

const upload = multer({ storage: storage });

mongoose.connect(process.env.DB_URL);

const User = mongoose.model('User', {
    username: { type: String },
    password: { type: String }
});

const Post = mongoose.model('Post', {
    caption: { type: String },
    paths: { type: [String] },
    uploadedBy: { type: String },
    uploadedOn: { type: Date }
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

app.post("/upload", upload.array('images'), async (request, response) => {
    const authTokenArray = request.header('authorization').split(" ");
    if (authTokenArray[0] !== 'Bearer') {
        response.status(401).json({ message: 'User token is not valid' });
    } else {
        try {
            jwt.verify(authTokenArray[1], process.env.JWT_SECRET, options, async (error, decodedToken) => {
                if (error) {
                    throw error;
                } else {
                    const paths = []

                    request.files.map((file) => {
                        paths.push(file.path);
                    });

                    const post = await Post.create({
                        caption: request.body.caption,
                        paths: paths,
                        uploadedBy: decodedToken.username,
                        uploadedOn: Date.now()
                    });

                    if (post) {
                        response.status(200).json({ message: 'Images uploaded' });
                    } else {
                        response.status(500).json({ message: 'Your post could not be published!' });
                    }
                }
            });

        } catch (error) {
            console.log(error);
            response.status(401).json({ message: 'User token has expired or is not valid!' });
        }
    }
});

app.post("/fetch-posts", (request, response) => {
    const authTokenArray = request.header('authorization').split(" ");
    if (authTokenArray[0] !== 'Bearer') {
        response.status(401).json({ message: 'User token is not valid' });
    } else {
        try {
            jwt.verify(authTokenArray[1], process.env.JWT_SECRET, options, async (error, decodedToken) => {
                if (error) {
                    throw error;
                } else {
                    console.log(decodedToken);
                    response.status(200).json({ message: 'Posts fetched successfully' });
                }
            });

        } catch (error) {
            console.log(error);
            response.status(401).json({ message: 'User token has expired or is not valid!' });
        }
    }
});

app.listen(PORT, () => {
    console.log("Server listening on port number: ", PORT);
});