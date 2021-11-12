const express = require('express');
const { ObjectId } = require('mongodb');

const app = express();
require('dotenv').config();
const cors = require('cors');
// const admin = require('firebase-admin');
// Middleware
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;

const { MongoClient } = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.j06rk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        // console.log('Connected to MongoDB');
        const db = client.db('cuteCatShop');
        const productsCollection = db.collection('products');
        const usersCollection = db.collection('users');
        const orderCollection = db.collection('orders');
        const reviewCollection = db.collection('reviews');

        app.get('/products', async (req, res) => {
            const products = await productsCollection.find({}).toArray();
            res.send(products);
        });
        app.get('/products/:id', async (req, res) => {
            const { id } = req.params;
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            console.log('load product  id:', id);
            res.send(product);
        });
        // post API
        app.post('/products', async (req, res) => {
            const newProduct = req.body;
            const result = await productsCollection.insertOne(newProduct);
            // console.log(`A document was inserted with the _id: ${result.insertedId}`);

            // console.log('hiting the post', req.body);
            res.json(result);
        });
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });

        app.get('/users/:email', async (req, res) => {
            const { email } = req.params;
            const query = { email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });

        app.put('/users', async (req, res) => {
            const user = req.body;
            // console.log('put', user);
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        app.post('/orders', async (req, res) => {
            const order = req.body;

            const result = await orderCollection.insertOne(order);
            res.json(result);
        });
        app.post('/reviews', async (req, res) => {
            const review = req.body;

            const result = await reviewCollection.insertOne(review);
            res.json(result);
        });

        app.put('/users/admin', async (req, res) => {
            const user = req.body;

            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        });
        app.put('/orders/:id', async (req, res) => {
            const { id } = req.params;

            const updatedStatus = req.body;
            const options = { upsert: true };
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: { status: updatedStatus.status },
            };
            const result = await orderCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });
        app.get('/orders', async (req, res) => {
            const orders = await orderCollection.find({}).toArray();
            res.json(orders);
        });
        app.get('/order/:id', async (req, res) => {
            const { id } = req.params;
            const query = { _id: ObjectId(id) };
            const order = await orderCollection.findOne(query);
            console.log('load package  id:', id);
            res.send(order);
        });
        app.delete('/orders/:id', async (req, res) => {
            const { id } = req.params;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.send(result);
        });
        app.get('/userOrders', async (req, res) => {
            const { customerEmail } = req.query;

            const query = { customerEmail };
            // console.log(query);
            const UserOrders = await orderCollection.find(query).toArray();
            res.json(UserOrders);
        });

        app.get('/reviews', async (req, res) => {
            const reviews = await reviewCollection.find({}).toArray();
            res.json(reviews);
        });
    } catch (e) {
        console.log(e);
    } finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello pets Shop!');
});

app.listen(port, () => {
    console.log(` listening at ${port}`);
});
