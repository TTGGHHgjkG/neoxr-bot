const mongoose = require('mongoose');

module.exports = class MongoDB {
   constructor(db, collection, options = {
      useNewUrlParser: true,
      useUnifiedTopology: true
   }) {
      this._id = 1;
      this.db = db || 'database';
      this.options = options;
      this.init();
   }

   connection = process.env.DATABASE_URL;

   exec = async (collect) => {
      try {
         await mongoose.connect(this.connection, this.options);
         console.log('Connected to MongoDB');
         const schema = new mongoose.Schema({
            _id: {
               type: Number,
               required: true
            },
            data: {
               type: Object,
               required: true,
               default: {}
            }
         });
         const model = mongoose.models[collect] || mongoose.model(collect, schema);
         return model;
      } catch (e) {
         console.error('Error connecting to MongoDB:', e.message);
         process.exit(1);
      }
   }

   fetch = async () => {
      try {
         const Model = await this.exec('data');
         let json = await Model.findOne({ _id: this._id });
         if (!json) {
            await Model.create({
               _id: this._id,
               data: {}
            });
            return ({});
         } else {
            return json.data;
         }
      } catch (e) {
         console.error('Error fetching data:', e.message);
         process.exit(1);
      }
   }

   save = async data => {
      try {
         const Model = await this.exec('data');
         const is_data = data ? data : global.db ? global.db : {};
         let json = await Model.findOne({ _id: this._id });
         if (!json) {
            await Model.create({
               _id: this._id,
               data: is_data
            });
         } else {
            await Model.updateOne({
               _id: this._id
            }, {
               '$set': {
                  data: is_data
               }
            });
         }
      } catch (e) {
         console.error('Error saving data:', e.message);
         process.exit(1);
      }
   }

   init = async () => {
      try {
         await mongoose.connect(this.connection, this.options);
         const db = mongoose.connection.db;
         const collections = await db.listCollections().toArray();
         const collectionExists = collections.some(v => v.name === 'data');
         if (!collectionExists) {
            const schema = new mongoose.Schema({
               _id: {
                  type: Number,
                  required: true
               },
               data: {
                  type: Object,
                  required: true,
                  default: {}
               }
            });
            mongoose.model('data', schema);
         }
      } catch (e) {
         console.error('Error during initialization:', e.message);
         process.exit(1);
      }
   }
}
