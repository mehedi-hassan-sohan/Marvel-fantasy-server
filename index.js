const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
require("dotenv").config();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB
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

// Function to handle server logic
async function run() {
  try {
    // Connect the client to the server 
    await client.connect();

    const categoryCollections = client
      .db("categoryCollections")
      .collection("Toys");
    const ToysCollection = client.db("ToysCollection").collection("allToys");

    // GET endpoint to retrieve all toys
    app.get("/addToys", async (req, res) => {
      const cursor = ToysCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // GET endpoint to retrieve toys by seller email
    app.get("/addToysGetByEmail", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { sellerEmail: req.query.email };
      }

      const result = await ToysCollection.find(query).toArray();
      res.send(result);
    });

    // GET endpoint to retrieve all categories
    app.get("/categories", async (req, res) => {
      const cursor = categoryCollections.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // POST endpoint to add a new toy
    app.post("/addToys", async (req, res) => {
      const newToys = req.body;
      console.log(newToys);
      const result = await ToysCollection.insertOne(newToys);
      res.send(result);
    });

    // DELETE endpoint to delete a toy by ID
    app.delete("/addToys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await ToysCollection.deleteOne(query);
      res.send(result);
    });

    // GET endpoint to retrieve toys by email
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

    // GET endpoint to retrieve a toy by ID
    app.get("/addToys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await ToysCollection.findOne(query);
      res.send(result);
    });

    // PUT endpoint to update a toy by ID
    app.put('/addToys/:id', async(req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedToys = req.body;

      const toys = {
        $set: {
          pictureUrl: updatedToys.pictureUrl,
          name: updatedToys.name,
          sellerEmail: updatedToys.sellerEmail,
          sellerName: updatedToys.sellerName,
          subCategory: updatedToys.subCategory,
          price: updatedToys.price,
          rating: updatedToys.rating,
          quantity: updatedToys.quantity,
          description: updatedToys.description
        }
      };
      const result = await ToysCollection.updateOne(filter, toys, options);
      res.send(result);
    });  

 
    app.get('/sort/:price', async (req, res) => {
      
      if (req.params.price == 'acc') {
          const result = await ToysCollection.find().sort({ price: 1 }).toArray();
          res.send(result)
      } else {
          const result = await ToysCollection.find().sort({ price: -1 }).toArray();
          res.send(result)
      }
  })
    // search curd operation 
    app.get('/addToys', async (req, res) => {
      const sort = req.query.sort;
      const search = req.query.search;
      console.log(search);
     
      const query = {title: { $regex: search, $options: 'i'}}
      const options = {
          sort: { 
              "price": sort === 'asc' ? 1 : -1
          },
          limit: 20 
      };
      const cursor = ToysCollection.find(query, options);
      const result = await cursor.toArray();
      res.send(result);
  })




    // Send a ping to confirm a successful connection to MongoDB
     await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Close the MongoDB client when finished/error
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
