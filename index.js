var express = require("express");
var app = express();
var path = require("path");
var server = require("http").createServer(app);
var axios = require("axios");
var querystring = require("querystring");
var Pusher = require("pusher");

require("dotenv").config();

var pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER
});

var bodyParser = require("body-parser");
app.use(bodyParser.json());

// express sets "/" as home screen
app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname + "/index.html"));
});

var instance = axios.create({
  baseURL: "https://api.imgur.com/3/",
  headers: { Authorization: "Client-ID " + process.env.IMGUR_CLIENT_ID }
});

app.get("/search/:query", function(req, res) {
  const url =
    "gallery/search/top/0/?" + querystring.stringify({ q: req.params.query });
  instance
    .get(url)
    .then(function(result) {
      res.send(
        result.data.data.filter(
          item => !item.is_album && !item.nsfw && !item.animated
        )
      );
    })
    .catch(function(error) {
      console.log(error);
    });
});
// pusher updates data
app.post("/cart_update", function(req, res) {
  pusher.trigger("cart", "update", req.body);
});

app.use("/node_modules", express.static(path.join(__dirname, "node_modules")));
app.use("/public", express.static(path.join(__dirname, "public")));

if (process.env.NODE_ENV !== "production") {
  require("reload")(server, app);
}

// consoles that server is listening
server.listen(process.env.PORT, function() {
  console.log("Listening on port ".concat(process.env.PORT));
});
