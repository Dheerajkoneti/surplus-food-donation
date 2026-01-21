const { MongoClient, ServerApiVersion } = require("mongodb");

const uri =
  "mongodb+srv://Dheeraj:Dheeraj2004@cluster0.uhz02rg.mongodb.net/foodDonation?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("✅ MongoDB connected successfully!");
  } catch (err) {
    console.error("❌ Connection error:", err.message);
  } finally {
    await client.close();
  }
}

run();
