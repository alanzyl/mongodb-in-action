use e - commerce

{
    _id: ObjectId("4c4b1476238d3b4dd5000001"),
    username: "kbanker",
    email: "kylebanker@gmail.com",
    first_name: "Kyle",
    last_name: "Banker",
    hashed_password: "bd1cfa194c3a603e7186780824b04419",
    addresses: [{
        name: "work",
        street: "1 E. 23rd Street",
        city: "New York",
        state: "NY",
        zip: 10010
    }]
}


// Modify by replacement

user_id = ObjectId("4c4b1476238d3b4dd5000001")
doc = db.users.findOne({ "_id": user_id })
doc["email"] = 'mongodb-user@mongodb.com'
print('updating ' + user_id)
db.users.update({ "_id": user_id }, doc)


// Modify by operator

user_id = ObjectId("4c4b1476238d3b4dd5000001")
db.users.update({ "_id": user_id }, { $set: { "email": 'mongodb-user@mongodb.com' } })


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
average = total / count

// alternative with the aggregation
stat = db.reviews.aggregate([
    { $match: { "product_id": product_id } },
    {
        $group: {
            "_id": "product_id",
            "average": { $avg: "$rating" },
            "count": { $sum: 1 },
        }
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

db.categories.save(category) // save puts "_id" in an original document

category = db.categories.findOne({ "slug": slug })
generate_ancestors(category._id, parent_id)

// change the categories hierarchy
db.categories.update({ "_id": outdoors_id }, { $set: { "parent_id": gardening_id } })
db.categories.find({ "ancestors.id": outdoors_id }).forEach(
    function(category) {
        generate_ancestors(category._id, outdoors_id)
    }
)

// change category name
doc = db.categories.findOne({ "_id": outdoors_id })
doc.name = "The Great Outdoors"
db.categories.update({ "_id": outdoors_id }, doc)
db.categories.update({ "ancestors.id": outdoors_id }, { $set: { "ancestors.$": doc } }, { "multi": true })

// the positional operator
db.users.update({ "_id": ObjectId("4c4b1476238d3b4dd5000001"), "addresses.name": "work" }, { $set: { "addresses.$.street": "155 E 31st St." } })


// Reviews

query_selector = {
    "_id": ObjectId("4c4b1476238d3b4dd5000041"),
    "voter_ids": { $ne: ObjectId("4c4b1476238d3b4dd5000001") }
}
db.reviews.update(query_selector, {
    $push: { "voter_ids": ObjectId("4c4b1476238d3b4dd5000001") },
    $inc: { "helpful_votes": 1 }
})


// Orders

cart_item = {
    _id: ObjectId("4c4b1476238d3b4dd5003981"),
    slug: "wheel-barrow-9092",
    sku: "9092",
    name: "Extra Large Wheel Barrow",
    pricing: {
        retail: 5897,
        sale: 4897
    }
}

selector = {
    user_id: ObjectId("4c4b1476238d3b4dd5000001"),
    state: 'CART',
    "line_items._id": { "$ne": cart_item._id }
}
update = {
    $inc: { "sub_total": cart_item["pricing"]["sale"] }
}
db.orders.update(selector, update, { "upsert": true })

selector = {
    "user_id": ObjectId("4c4b1476238d3b4dd5000001"),
    "state": 'CART',
    "line_items._id": { "$ne": cart_item._id }
}
update = { "$push": { "line_items": cart_item } }
db.orders.update(selector, update)

// ANOTHER UPDATE FOR QUANTITIES
selector = {
    "user_id": ObjectId("4c4b1476238d3b4dd5000001"),
    "state": 'CART',
    "line_items._id": cart_item._id
}
update = {
    "$inc": {
        "line_items.$.quantity": 1
    }
}
db.orders.update(selector, update)


// Order state transitions

// PREPARE THE ORDER FOR CHECKOUT
newDoc = db.orders.findAndModify({
    "query": {
        "user_id": ObjectId("4c4b1476238d3b4dd5000001"),
        "state": "CART",
    },
    "update": {
        "$set": {
            "state": "PRE-AUTHORIZE"
        }
    },
    "new": true,
})

// VERIFY THE ORDER AND AUTHORIZE
oldDoc = db.orders.findAndModify({
    "query": {
        "user_id": ObjectId("4c4b1476238d3b4dd5000001"),
        "sub_total": 11093, // here verification
        "state": "PRE-AUTHORIZE"
    },
    "update": {
        "$set": {
            "state": "AUTHORIZING"
        }
    }
})

// FINISHING THE ORDER
auth_doc = {
    "ts": new Date(),
    "cc": 3432003948293040,
    "id": 2923838291029384483949348,
    "gateway": "Authorize.net"
}
db.orders.findAndModify({
    "query": {
        "user_id": ObjectId("4c4b1476238d3b4dd5000001"),
        "state": "AUTHORIZING",
    },
    "update": {
        "$set": {
            "state": "PRE-SHIPPING",
            "authorization": auth_doc,
        }
    }
})


// Update operators

// $inc
db.readings.update({ "_id": 324 }, { "$inc": { "temp": 1 } }, { "upsert": true })

// $set/$unset
db.readings.update({ "_id": 324 }, { "$set": { "temp": 1 } })
db.readings.update({ "_id": 324 }, { "$set": { "temp": { "key": "value" } } })
db.readings.update({ "_id": 324 }, { "$unset": { "temp": 1 } })

// $set/$pop
db.readings.update({ "_id": 324 }, { "$set": { "temp": ["value1", "value2", "value3"] } })
db.readings.update({ "_id": 324 }, { "$pop": { "temp": -1 } })

// $rename
db.readings.update({ "_id": 324 }, { "$set": { "temp": { "key": "value" } } })
db.readings.update({ "_id": 324 }, { "$rename": { "temp": "temperature" } })
db.readings.update({ "_id": 324 }, { "$rename": { "temp.key": "new_key" } })

// $setOnInsert
db.products.update({ "slug": "hammer" }, {
    "$inc": { "quantity": 1 },
    "$setOnInsert": { "state": "AVAILABLE" },
}, { "upsert": true })

// ARRAY UPDATE OPERATORS
db.products.update({ "slug": "hammer" }, { "$push": { "temp": "value4" } })
db.products.update({ "slug": "hammer" }, { "$push": { "temp": "value4" } })

// $each
db.products.update({ "slug": "hammer" }, { "$push": { "temp": { "$each": ["value5", "value6"] } } })

// $slice
db.products.update({ "slug": "hammer" }, { "$push": { "temp": { "$each": ["value7", "value8"], "$slice": -2 } } })

// $sort
db.products.update({ "slug": "hammer" }, {
    "$set": {
        "temp": [
            { day: 6, temp: 90 },
            { day: 5, temp: 95 }
        ]
    }
})
db.products.update({ "slug": "hammer" }, {
    "$push": {
        "temp": {
            "$each": [
                { "day": 7, "temp": 92 }
            ],
            "$slice": -2,
            "$sort": {
                "day": 1
            },
        }
    }
})


// $addToSet and $each
db.products.update({ "slug": "hammer" }, {
    "$addToSet": {
        "temp": { "day": 7, "temp": 92 }
    }
})
db.products.update({ "slug": "hammer" }, {
    "$addToSet": {
        "temp": {
            "$each": [
                { "day": 6, "temp": 90 },
                { "day": 7, "temp": 92 },
                { "day": 8, "temp": 94 },
            ]
        }
    }
})

// $pop
db.products.update({ "slug": "hammer" }, {
    "$pop": {
        "temp": 1
    }
})
db.products.update({ "slug": "hammer" }, {
    "$pop": {
        "temp": -1
    }
})

// $bit
db.permissions.insert({
    "_id": 15,
    "permission": NumberInt(4),
})
db.permissions.update({ "_id": 15 }, {
    "$bit": {
        "permission": {
            "or": NumberInt(2)
        }
    }
})

// $pull and pullAll
db.products.update({ "slug": "hammer" }, {
    "$push": {
        "prices": {
            "$each": [97.6, 98.4, 100.5, 99.1, 101.2]
        }
    }
})
db.products.update({ "slug": "hammer" }, {
    "$pull": {
        "prices": 97.6
    }
})
db.products.update({ "slug": "hammer" }, {
    "$pullAll": {
        "prices": [98.4, 100.5]
    }
})
db.products.update({ "slug": "hammer" }, {
    "$pull": {
        "prices": {
            "$gt": 100
        }
    }
})

// POSITIONAL UPDATES
order = {
  _id: ObjectId("6a5b1476238d3b4dd5000048"),
    line_items: [
    {
      _id: ObjectId("4c4b1476238d3b4dd5003981"),
      sku: "9092",
      name: "Extra Large Wheelbarrow",
      quantity: 1,
      pricing: {
        retail: 5897,
        sale: 4897
      }
    },
    {
      _id: ObjectId("4c4b1476238d3b4dd5003982"),
      sku: "10027",
      name: "Rubberized Work Glove, Black",
      quantity: 2,
      pricing: {
          retail: 1499,
          sale: 1299
      }
    }
  ]
}
db.orders.insertOne(order)

query = {
  "_id": ObjectId("6a5b1476238d3b4dd5000048"),
  "line_items.sku": "10027"
}
update = {
  "$set": {
    "line_items.$.quantity": 5
  }
}
db.orders.update(query, update)

// Deletes
db.orders.remove({})
