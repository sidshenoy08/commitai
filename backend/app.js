const express = require('express');
const cors = require('cors');

const mongoose = require('mongoose');

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

async function authenticateUser(userCredentials) {
    const user = await User.findOne({ username: userCredentials.username });
    if (user) {
        console.log(user);
    } else {
        console.log("No such user");
    }
}

app.post("/login", (request, response) => {
    authenticateUser(request.body);
    response.status(200).json({ message: 'Success' });
})


app.listen(PORT, () => {
    console.log("Server listening on port number: ", PORT);
});