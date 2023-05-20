const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
require("dotenv").config();

// middleware
app.use(cors());
app.use(express.json());

// mongodb

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6ypoazf.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const categoryCollections = client
      .db("categoryCollections")
      .collection("Toys");
    const ToysCollection = client.db("ToysCollection").collection("allToys");

    app.get("/addToys", async (req, res) => {
      const cursor = ToysCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/addToysGetByEmail", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { sellerEmail: req.query.email };
      }

      const result = await ToysCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/categories", async (req, res) => {
      const cursor = categoryCollections.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/addToys", async (req, res) => {
      const newToys = req.body;
      console.log(newToys);
      const result = await ToysCollection.insertOne(newToys);
      res.send(result);
    });

    app.delete("/addToys/:id", async (req, res) => {
    
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await ToysCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/addToy/:email", async (req, res) => {
      console.log(req.query.email);
      let query = {};
      if (req.query.email) {
        query = { email: req.query.email };
      }
      const cursor = ToysCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/addToys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await ToysCollection.findOne(query);
      res.send(result);
    }); 



    app.put('/addToys/:id', async(req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id)}
      const options = { upsert: true };
      const updatedToys = req.body;

      const toys= {
          $set: {
            pictureUrl:updatedToys.pictureUrl,
            name:updatedToys.name,
            sellerEmail:updatedToys.sellerEmail,
            sellerName:updatedToys.sellerName,
            subCategory:updatedToys.subCategory,
            price:updatedToys.price,
            rating:updatedToys.rating,
            quantity:updatedToys.quantity,
            description:updatedToys.description
          }
       }
      const result = await ToysCollection.updateOne(filter, toys, options);
      res.send(result);
  })




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Avenger Toy server is running!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
