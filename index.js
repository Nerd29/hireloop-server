const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const dns = require('dns'); // 1. Import dns module
require('dotenv').config();

// 2. Override DNS servers to Google's public DNS
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGO_DB_URI);


async function connectToMongoDB() {
  try {
    await client.connect();
   
    // Connect to the "sample_mflix" database and access its "movies" collection
    const database = client.db("hireloop_db");
    const jobsCollection = database.collection("jobs");
    // const movies = database.collection("movies");

    app.get('/api/jobs', async (req, res) => {
        const query = {};
        if(req.query.companyId){
            query.companyId = req.query.companyId;
        }
        if(req.query.status){
            query.status = req.query.status;
        }
        const cursor = jobsCollection.find(query);
        const results = await cursor.toArray();
        res.send(results);
    });
  app.post('/api/jobs', async (req, res) => {
    const job = req.body;
    const result = await jobsCollection.insertOne(job);
    res.send(result);
  });
    console.log("You successfully connected to MongoDB!");
    return client;

    
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

connectToMongoDB();



app.get('/', (req, res) => {
  res.send('HireLoop Server Running');
});

app.listen(port, () => {
  console.log(`HireLoop server listening on port ${port}`);
});