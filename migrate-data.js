const async = require('async')
const fs = require('fs')
const MongoClient = require('mongodb').MongoClient

const MASTER_FILE = '/data/m3-customer-data.json'
const ADDRESS_FILE = '/data/m3-customer-address-data.json'
const DB_URL = 'mongodb://localhost:27017/edx-lab3'
const COLLECTION = 'users'

// Main function
const migrate = async () => {
  console.log('Running migration')
  try {

    // Read in data from JSON files
    let master = require(__dirname + MASTER_FILE)
    let address = require(__dirname + ADDRESS_FILE)
    let size = parseInt(process.argv[2])


    if(!size) {
      console.log('batch size is not specified...')
      process.exit(1)
    }

    if(master.length != address.length) {
        console.log('Number of records in data files not matching, exiting...')
        process.exit(1)
    }

    console.log(`Master data records: ${master.length} , address data records: ${address.length}, bacth size: ${size}`)

    // First try to connect to DB
    let client = await MongoClient.connect(DB_URL)
    let db = client.db('edx-lab3')
    console.log('Connected to DB')

    // Create batch tasks
    let tasks = []
    for(i = 0; i < master.length;  ) {
      let start = i
      let end = (i + size) < master.length ? i + size : master.length
      //let masterBatch = master.slice(start, end)
      //let addressBatch = address.slice(start, end)

      console.log(`Adding batch task # ${i} start: ${start} end: ${end} `)

      tasks.push( async () => {
        console.log(`Processing records from ${start} to ${end}`)
        let data = []
        for(n = start; n < end; n++) {
          let obj = Object.assign(master[n], address[n])
          obj._id = obj.id
          data.push(obj)
        }
        let res = await db.collection(COLLECTION).insertMany(data)
        console.log(`Inserted ${res.result.n} objects`)
        return res.result
      })
      i = i + size
    }

    console.log(`Executing ${tasks.length} tasks`)
    let time = Date.now()

    async.parallel(tasks, async (err, result) => {
      if(err) {
        console.log('Error:', err)
        process.exit(1)
      }
      else {
        console.log('All tasks completed')
        await client.close()
        console.log('DB consolenection closed')
        console.log(`Done in ${ (Date.now() - time)/1000 } sec.`)
        process.exit(0)
      }
    })


  } catch(error) {
    console.log('Error: ', error)
    process.exit(1)
  }
}


migrate()
