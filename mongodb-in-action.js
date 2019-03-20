use tutorial

db.users.insert({username: "smith"})
db.users.insert({username: "jones"})
db.users.count()

// find
db.users.find()
db.users.find({ _id : ObjectId("5c926c3809c0d25a02433e6f"), username : "smith" })
db.users.find({ $and: [ { _id : ObjectId("5c926c3809c0d25a02433e6f") }, { username : "smith" } ] })
db.users.find({ $or: [ { username : "smith" }, { username : "jones" } ] })

// update
db.users.update({ username: "smith" }, { $set: { country: "Canada" } })
db.users.update({ username: "smith" }, { country: "Canada" })
db.users.update({ country: "Canada" }, { $set: { username: "smith" } })
db.users.update({ username: "smith" }, { $unset: { country: 1 } })

// updating complex data
db.users.update({ username: "smith" },
  {
    $set: {
      favorites: {
        cities: ["Chicago", "Cheyenne"],
        movies: ["Casablanca", "For a Few Dollars More", "The Sting"]
      }
    }
  }
)
db.users.update({ username: "jones" },
  {
    $set: {
      favorites: {
        cities: ["Chicago", "Rocky"],
      }
    }
  }
)
db.users.find({ "favorites.movies": "Casablanca" })

// more advanced updates
db.users.update({ "favorites.movies": "Casablanca" },
  { $addToSet: { "favorites.movies": "The Maltese Falcon" } },
  false,
  true)

// deleting data
db.foo.remove()
db.users.remove({ "favorites.cities": "Cheyenne" })
db.users.drop()

// indexes
for (i = 0; i < 20000; i++) {
  db.numbers.insert({ num: i });
}

// range queries
db.numbers.find({ num: { $gt: 19995 } })
db.numbers.find({ num: { $lt: 5 } })

// Indexing and explain( )
db.numbers.find({ num: { $gt: 19995 } }).explain("executionStats")
db.numbers.createIndex({ num: 1 })
db.numbers.getIndexes()

// getting database information
show dbs
show collections
db.stats()
