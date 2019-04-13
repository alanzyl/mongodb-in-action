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

product_id = ObjectId("4c4b1476238d3b4dd5003981")
doc = db.products.findOne({ "_id": product_id })
doc["total_reviews"] += 1
doc.products.update({ "_id": product_id }, doc)

db.products.update({ "_id": product_id }, { $inc: { "total_reviews": 1 } })


// AVERAGE PRODUCT RATINGS

product_id = ObjectId("4c4b1476238d3b4dd5003981")
count = 0
total = 0
db.reviews.find({ "product_id": product_id }, { "rating": 1 }).forEach(
  function(review) {
    total += review.rating;
    count += 1;
  }
)
average = total/count

// alternative with the aggregation
stat = db.reviews.aggregate([
  { $match: { "product_id": product_id } },
  { $group: { "_id": "product_id",
              "average": { $avg: "$rating" },
              "count": { $sum: 1 }, }
  },
]).next()
average = stat.average
count = stat.count

db.products.update({ "_id": product_id }, { $set: { "total_reviews": count, "average_review": average } })


// THE CATEGORY HIERARCHY

var generate_ancestors = function(_id, parent_id) {
  ancestor_list = []
  var cursor = db.categories.find({ "_id": parent_id })
  while (cursor.size() > 0) {
    parent = cursor.next()
    ancestor_list.push({ "_id": parent._id, "name": parent.name, "slug": parent.slug })
    parent_id = parent.parent_id
    cursor = db.categories.find({ "_id": parent_id })
  }

  db.categories.update({ "_id": _id }, { $set: { "ancestors": ancestor_list } })
}

parent_id = ObjectId("6a5b1476238d3b4dd5000048")
slug = "gardening-child"
category = {
  parent_id: parent_id,
  slug: slug,
  name: "Gardening child",
  description: "All gardening implements, tools, seeds, and soil."
}

db.categories.save(category)  // save puts "_id" in an original document

category = db.categories.findOne({ "slug": slug })
generate_ancestors(category._id, parent_id)

// change the categories hierarchy
db.categories.update( { "_id": outdoors_id }, { $set: { "parent_id": gardening_id } } )
db.categories.find( { "ancestors.id": outdoors_id } ).forEach(
  function(category) {
    generate_ancestors(category._id, outdoors_id)
  }
)

// change category name
doc = db.categories.findOne( { "_id": outdoors_id })
doc.name = "The Great Outdoors"
db.categories.update( { "_id": outdoors_id }, doc )
db.categories.update( { "ancestors.id": outdoors_id}, { $set: { "ancestors.$": doc } }, { "multi": true } )

// the positional operator
db.users.update( { "_id": ObjectId("4c4b1476238d3b4dd5000001"), "addresses.name": "work" },
                 { $set: { "addresses.$.street": "155 E 31st St." } } )
