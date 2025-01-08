const express = require("express");
const axios = require("axios");

const app = express();
const port = 3002;

app.get("/users/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const response = await axios.get(`https://api.github.com/users/${userId}`);
    const user = response.data;

    if (user) {
      res.json(user);
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("internal server error");
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
