const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = process.env.MONGO_URI;
const port = process.env.PORT;

// middleware
app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
app.get("/", (req, res) => {
  res.send("Server Is Ok");
});

async function run() {
  try {
    await client.connect();
    const db = client.db("IdeaVault");
    const ideasCollection = db.collection("Ideas");
    const ideaCategoriesCollection = db.collection("ideaCategories");
    const usersCollection = db.collection("user");
    // ideas get api
    app.get("/ideas", async (req, res) => {
      try {
        const { search, category } = req.query;
        const query = {};
        // search
        if (search) {
          query.ideaTitle = {
            $regex: search,
            $options: "i",
          };
        }
        // category
        if (category) {
          query.category = category;
        }
        const result = await ideasCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        res.status(500).json({
          message: error.message,
        });
      }
    });

    // idea categories get api
    app.get("/idea-categories", async (req, res) => {
      const result = await ideaCategoriesCollection.find().toArray();
      res.send(result);
    });

    // add -idea api
    app.post("/add-idea", async (req, res) => {
      const newIdea = req.body;
      const result = await ideasCollection.insertOne(newIdea);
      res.send(result);
    });

    // my-ideas api
    app.get("/my-ideas/:userId", async (req, res) => {
      const { userId } = req.params;
      const result = await ideasCollection.find({ userId: userId }).toArray();
      res.send(result);
    });

    // idea update api
    app.patch("/ideas/:id", async (req, res) => {
      const { id } = req.params;
      const updatedIdea = req.body;
      const result = await ideasCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: updatedIdea,
        },
      );
      res.send(result);
    });

    // idea delete
    app.delete("/ideas/:id", async (req, res) => {
      const { id } = req.params;
      const result = await ideasCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // users update api
    app.patch("/users/:userId", async (req, res) => {
      const { userId } = req.params;
      const updatedUser = req.body;
      const result = await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: updatedUser,
        },
      );
      res.send(result);
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
