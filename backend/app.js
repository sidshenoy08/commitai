const express = require('express');
const cors = require('cors');

require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;

app.post("/test", (request, response) => {
    response.status(200).json({ message: 'Success' });
})


app.listen(PORT, () => {
    console.log("Server listening on port number: ", PORT);
});