const { MongoClient } = require('mongodb');

module.exports = class MongoDB {
   constructor(db, collection, options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: true,
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false
   }) {
      this._id = 1;
      this.db = db || 'database';
      this.options = options;
      this.client = new MongoClient(process.env.DATABASE_URL, this.options);
      this.init();
   }

   async exec(collect) {
      try {
         await this.client.connect();
         const db = await this.client.db(this.db).collection(collect);
         return db;
      } catch (e) {
         console.error('Error connecting to MongoDB:', e);
         process.exit(1);
      }
   }

   async fetch() {
      try {
         const collection = await this.exec('database');
         const json = await collection.findOne({ _id: this._id });
         if (!json) {
            await collection.insertOne({ _id: this._id, data: {} });
            return {};
         } else {
            return json.data;
         }
      } catch (e) {
         console.error('Error fetching data from MongoDB:', e);
         process.exit(1);
      }
   }

   async save(data) {
      try {
         const collection = await this.exec('database');
         const json = await collection.findOne({ _id: this._id });
         const is_data = data || global.db || {};
         if (!json) {
            await collection.insertOne({ _id: this._id, data: is_data });
         } else {
            await collection.updateOne({ _id: this._id }, { $set: { data: is_data } });
         }
      } catch (e) {
         console.error('Error saving data to MongoDB:', e);
         process.exit(1);
      }
   }

   async init() {
      try {
         await this.client.connect();
         const db = await this.client.db(this.db);
         const collectionExists = await db.listCollections({ name: 'data' }).hasNext();
         if (!collectionExists) await db.createCollection('data');
      } catch (e) {
         console.error('Error initializing MongoDB:', e);
         process.exit(1);
      }
   }
}
