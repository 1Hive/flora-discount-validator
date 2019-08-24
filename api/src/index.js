const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;

let db;

// Remember to change YOUR_USERNAME and YOUR_PASSWORD to your username and password!
MongoClient.connect("mongodb://localhost:27017", (err, database) => {
  if (err) return console.log(err);
  db = database.db("flora");
  app.listen(process.env.PORT || 3000, () => {
    console.log("listening on 3000");
  });
});

app.get("/:address", (req, res) => {
  try {
    db.collection("AddressGas")
      .find({ address: req.params.address })
      .toArray((err, result) => {
        if (err) return console.log(err);
        console.log("RESULT ", result);
        res.json(result);
      });
  } catch (error) {
    console.error(error);
  }
});
