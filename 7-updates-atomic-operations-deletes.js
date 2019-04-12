use e - commerce

{
  _id: ObjectId("4c4b1476238d3b4dd5000001"),
  username: "kbanker",
  email: "kylebanker@gmail.com",
  first_name: "Kyle",
  last_name: "Banker",
  hashed_password: "bd1cfa194c3a603e7186780824b04419",
  addresses: [
    {
      name: "work",
      street: "1 E. 23rd Street",
      city: "New York",
      state: "NY",
      zip: 10010
    }
  ]
}


// Modify by replacement

user_id = ObjectId("4c4b1476238d3b4dd5000001")
doc = db.users.findOne({ "_id": user_id })
doc["email"] = 'mongodb-user@mongodb.com'
print('updating ' + user_id)
db.users.update({ "_id": user_id }, doc)


// Modify by operator

user_id = ObjectId("4c4b1476238d3b4dd5000001")
db.users.update({ "_id": user_id },
                 { $set: { "email": 'mongodb-user@mongodb.com' } })


// Both methods compared

product_id = ObjectId("4c4b1476238d3b4dd5003982")
doc = db.products.findOne({ "_id": product_id })
doc["total_reviews"] += 1
doc.products.update({ "_id": product_id }, doc)

db.products.update({ "_id": product_id }, { $inc: { "total_reviews": 1 } })
