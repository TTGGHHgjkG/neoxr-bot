const mongoose = require('mongoose')

module.exports = class MongoDB {
      options = {
         useNewUrlParser: true,
         useUnifiedTopology: true
      }
      connection = process.env.DATABASE_URL
      model = {
         database: {}
      }
      data = {}
      
      fetch = async () => {
         mongoose.connect(this.connection, {
            ...this.options
         })
         try {
            const schemaData = new mongoose.Schema({
               data: {
                  type: Object,
                  required: true,
                  default: {}
               }
            })
            this.model.database = mongoose.model('database', schemaData)
         } catch {
            this.model.database = mongoose.model('database')
         }
         this.data = await this.model.database.findOne({})
         if (!this.data) {
            (new this.model.database({
               data: {}
            })).save()
            this.data = await this.model.database.findOne({})
            return this.data.data
         } else return this.data.data
      }

      save = async (data) => {
         const obj = data ? data : global.db
         if (this.data && !this.data.data) return (new this.model.database({
            data: obj
         })).save()
         this.model.database.findById(this.data._id, (error, document) => {
            if (error) return
            if (!document.data) document.data = {}
            document.data = global.db
            document.save()
         })
      }
   }