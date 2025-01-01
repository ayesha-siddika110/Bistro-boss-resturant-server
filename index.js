const express = require('express');
const cors = require('cors');
require('dotenv').config()


const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// console.log(process.env.DB_User);



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster0.331jm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const menusCollections = client.db("bistro-boss-DB").collection("menus")
    const reviewsCollections = client.db("bistro-boss-DB").collection("reviews")

    app.get('/menus', async(req,res)=>{
        const result = await menusCollections.find().toArray()
        res.send(result)
    })
    app.get('/reviews', async(req,res)=>{
        const result = await reviewsCollections.find().toArray()
        res.send(result)
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/',(req,res)=>{
    res.send('server is runing')
})
app.listen(port, ()=>{
    console.log(`server is runing in port ${port}`);
    
})