const express = require('express');
const cors = require('cors');
require('dotenv').config()
var jwt = require('jsonwebtoken');


const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// console.log(process.env.DB_User);



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const cartsCollections = client.db("bistro-boss-DB").collection("carts")
    const usersCollections = client.db("bistro-boss-DB").collection("users")

    //sent jwt 
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_Token, {
        expiresIn: '1h'
      })
      console.log(token)
      res.send({ token })
    })
    //verifyToken midddleware
    const verifyToken = (req, res, next) => {
      console.log('inside verifyToken ', req.headers.authorization)
      if (!req.headers.authorization) {
        return res.send(401).send({ message: 'unAuthorized access' })
      }
      const token = req.headers.authorization.split(' ')[1]
      jwt.verify(token, process.env.ACCESS_Token, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: 'unAuthorized access' })
        }
        req.decoded = decoded;
        next()
      })
    }


    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await usersCollections.findOne(query);
      const isAdmin = user?.role === 'admin';
      if (!isAdmin) {
        return res.status(403).send({ message: 'forbidden access' });
      }
      next();
    }


    app.get('/menus', async (req, res) => {
      const result = await menusCollections.find().toArray()
      res.send(result)
    })
    app.post('/carts', async (req, res) => {
      const newCart = req.body
      const result = await cartsCollections.insertOne(newCart)
      res.send(result)
    })
    app.post('/users', async (req, res) => {
      const newUser = req.body;
      const query = { email: newUser.email }
      const existingUser = await usersCollections.findOne(query)
      if (existingUser) {
        return res.send({ message: 'User data already exist', insertedId: null })
      }
      const result = await usersCollections.insertOne(newUser)
      res.send(result)

    })
    // delete user
    app.delete('/users/:id',verifyToken,verifyAdmin, async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await usersCollections.deleteOne(query)
      res.send(result)
    })
    app.patch('/users/admin/:id',verifyToken,verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const updateDoc = {
        $set: {
          role: 'admin'
        }
      }
      const result = await usersCollections.updateOne(filter, updateDoc)
      res.send(result)
    })

    app.get('/users', verifyToken,verifyAdmin, async (req, res) => {
      // console.log(req.headers);
      const result = await usersCollections.find().toArray()
      res.send(result)
    })

    // verifywith admin email
    app.get('/users/admin/:email', verifyToken,verifyAdmin, async (req, res) => {
      const email = req.params.email;

      if (email !== req.decoded.email) {
        return res.status(403).send({ message: 'forbidden access' })
      }

      const query = { email: email };
      const user = await usersCollections.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role === 'admin';
      }
      res.send({ admin });
    })
    app.get('/carts', async (req, res) => {
      // const newCart = req.body
      const email = req.query.email;
      const query = { buyeremail: email }
      const result = await cartsCollections.find(query).toArray()
      res.send(result)
    })
    app.get('/reviews', async (req, res) => {
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



app.get('/', (req, res) => {
  res.send('server is runing')
})
app.listen(port, () => {
  console.log(`server is runing in port ${port}`);

})