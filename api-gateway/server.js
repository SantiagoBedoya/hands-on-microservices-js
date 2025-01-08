const express = require("express");
const apicache = require("apicache");
const axios = require("axios");
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 60000,
  max: 100,
  message: "Too many request, please slow down",
});

const app = express();

async function getAggregatedData(id) {
  const postResponse = await axios.get(`http://post-ms:3001/posts/${id}`);
  const userResponse = await axios.get(`http://user-ms:3002/users/${id}`);

  const aggregatedData = {
    data: {
      id: userResponse.data.login,
      followers_url: userResponse.data.followers_url,
      following_url: userResponse.data.following_url,
      subscriptions_url: userResponse.data.subscriptions_url,
      repos_url: userResponse.data.repos_url,
      post: postResponse.data,
    },
    location: userResponse.data.location,
  };

  return aggregatedData;
}

let cache = apicache.middleware;
app.use(cache("5 minutes"));

app.get("/users/:id", limiter, async (req, res) => {
  const id = req.params.id;
  try {
    const aggregatedData = await getAggregatedData(id);
    res.json(aggregatedData);
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, message: "Bad request" });
  }
});

app.listen(3000, () => {
  console.log("API Gateway listening on port 3000");
});
