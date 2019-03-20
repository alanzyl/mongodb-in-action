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
