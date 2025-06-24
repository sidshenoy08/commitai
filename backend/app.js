const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');

require('dotenv').config();

const app = express();

app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ['GET', 'POST']
    }
});

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

const Group = mongoose.model('Group', {
    name: { type: String },
    members: { type: [String] },
    messages: { type: [String] }
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

app.post("/fetch-posts", async (request, response) => {
    const authTokenArray = request.header('authorization').split(" ");
    if (authTokenArray[0] !== 'Bearer') {
        response.status(401).json({ message: 'User token is not valid' });
    } else {
        try {
            jwt.verify(authTokenArray[1], process.env.JWT_SECRET, options, async (error, decodedToken) => {
                if (error) {
                    throw error;
                } else {
                    const posts = await Post.find({ uploadedBy: decodedToken.username });
                    if (posts) {
                        response.status(200).json({ posts: posts, message: 'Posts fetched successfully' });
                    } else {
                        response.status(200).json({ posts: [], message: 'Posts fetched successfully' });
                    }
                }
            });
        } catch (error) {
            console.log(error);
            response.status(401).json({ message: 'User token has expired or is not valid!' });
        }
    }
});

app.post("/delete-post", async (request, response) => {
    const authTokenArray = request.header('authorization').split(" ");
    if (authTokenArray[0] !== 'Bearer') {
        response.status(401).json({ message: 'User token is not valid' });
    } else {
        try {
            jwt.verify(authTokenArray[1], process.env.JWT_SECRET, options, async (error, decodedToken) => {
                if (error) {
                    throw error;
                } else {
                    const result = await Post.deleteOne({ _id: request.body.postId, uploadedBy: request.body.username });
                    if (result.deletedCount === 1) {
                        response.status(200).json({ message: 'Post deleted successfully' });
                    } else {
                        response.status(500).json({ message: 'Post could not be deleted!' });
                    }
                }
            });
        } catch (error) {
            console.log(error);
            response.status(401).json({ message: 'User token has expired or is not valid!' });
        }
    }
});

app.post("/fetch-users", async (request, response) => {
    const authTokenArray = request.header('authorization').split(" ");
    if (authTokenArray[0] !== 'Bearer') {
        response.status(401).json({ message: 'User token is not valid' });
    } else {
        try {
            jwt.verify(authTokenArray[1], process.env.JWT_SECRET, options, async (error, decodedToken) => {
                if (error) {
                    throw error;
                } else {
                    let usernames = [];
                    const users = await User.find({ username: { $ne: decodedToken.username } }, '-password -__v -_id');
                    if (users) {
                        users.map((user) => {
                            usernames.push(user.username);
                        });
                        response.status(200).json({ users: usernames, message: 'Usernames fetched successfully' });
                    } else {
                        response.status(200).json({ users: usernames, message: 'Usernames fetched successfully' });
                    }
                }
            });
        } catch (error) {
            console.log(error);
            response.status(401).json({ message: 'User token has expired or is not valid!' });
        }
    }
});

app.post("/create-group", async (request, response) => {
    const authTokenArray = request.header('authorization').split(" ");
    if (authTokenArray[0] !== 'Bearer') {
        response.status(401).json({ message: 'User token is not valid' });
    } else {
        try {
            jwt.verify(authTokenArray[1], process.env.JWT_SECRET, options, async (error, decodedToken) => {
                if (error) {
                    throw error;
                } else {
                    const allMembers = request.body.members.concat(decodedToken.username);
                    const group = await Group.create({
                        name: request.body.name,
                        members: allMembers
                    });
                    if (group) {
                        response.status(200).json({ message: 'Group created' });
                    } else {
                        response.status(500).json({ message: 'Your group could not be created!' });
                    }
                }
            });
        } catch (error) {
            console.log(error);
            response.status(401).json({ message: 'User token has expired or is not valid!' });
        }
    }
});

app.post("/fetch-groups", async (request, response) => {
    const authTokenArray = request.header('authorization').split(" ");
    if (authTokenArray[0] !== 'Bearer') {
        response.status(401).json({ message: 'User token is not valid' });
    } else {
        try {
            jwt.verify(authTokenArray[1], process.env.JWT_SECRET, options, async (error, decodedToken) => {
                if (error) {
                    throw error;
                } else {
                    let groupNames = [];
                    const groups = await Group.find({ members: decodedToken.username }, 'name -_id');
                    if (groups) {
                        groups.map((group) => {
                            groupNames.push(group.name)
                        });
                        response.status(200).json({ groups: groupNames, message: 'Groups fetched successfully' });
                    } else {
                        response.status(200).json({ groups: groupNames, message: 'Groups fetched successfully' });
                    }
                }
            });
        } catch (error) {
            console.log(error);
            response.status(401).json({ message: 'User token has expired or is not valid!' });
        }
    }
});

io.on('connection', (socket) => {
    console.log("A user logged in!");

    socket.on('joinRoom', (groupName) => {
        socket.join(groupName);
        console.log(`User joined group: ${groupName}`);
    });

    socket.on('messageToRoom', (data) => {
        io.to(data.groupName).emit('receiveMessage', data.message);
    });

    socket.on('disconnect', () => {
        console.log("A user disconnected!");
    })
});

server.listen(PORT, () => {
    console.log("Server listening on port number: ", PORT);
});