const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
require('dotenv').config()
const cors = require('cors')
const port = process.env.PORT || 5000;

// middleware 

app.use(cors())
app.use(express.json())

// Connect Mongodb


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.apl9htr.mongodb.net/?retryWrites=true&w=majority`;

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
        const servicesCollection = client.db("carDoctors").collection("services");
        const bookingsCollection = client.db("carDoctors").collection("bookings");

        await client.connect();


        // Services Apis

        app.get("/services", async (req, res) => {
            const result = await servicesCollection.find().toArray();
            res.send(result);
        })

        app.get("/services/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const options = {
                projection: { title: 1, price: 1, service_id: 1, img: 1 },
            };
            const result = await servicesCollection.findOne(query, options);
            res.send(result);
        })

        // Booking Apis 

        app.get("/bookings", async (req, res) => {
            let query = {}
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await bookingsCollection.find(query).toArray();
            res.send(result);
        })

        app.post("/bookings", async (req, res) => {
            const booking = req.body;
            console.log(booking)
            const result = await bookingsCollection.insertOne(booking)
            res.send(result);
        })


        app.patch("/bookings/:id", async (req, res) => {
            const id = req.params.id;
            const updateBookings = req.body;
            const filter = { _id: new ObjectId(id) }
            const updatedBooking = {
                $set: {
                    status: updateBookings.status
                },
            };

            const result = await bookingsCollection.updateOne(filter, updatedBooking)
            res.send(result);

        })

        app.delete("/bookings/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await bookingsCollection.deleteOne(query)
            res.send(result);
        })



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get("/", (req, res) => {
    res.send("Car doctors server is available")
})
app.listen(port, (req, res) => {
    console.log(`Car doctors server is available on port ${port}`)
})