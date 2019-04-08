use e-commerce

let product = {
  "_id": ObjectId("4c4b1476238d3b4dd5003981"),
  "slug": "wheelbarrow-9092",
  "sku": "9092",
  "name": "Extra Large Wheelbarrow",
  "description": "Heavy duty wheelbarrow...",
  "details": {
    "weight": 47,
    "weight_units": "lbs",
    "model_num": 4039283402,
    "manufacturer": "Acme",
    "color": "Green"
  },
  "total_reviews": 4,
  "average_review": 4.5,
  "pricing": {
    "retail": 589700,
    "sale": 489700
  },
  "price_history": [{
      "retail": 529700,
      "sale": 429700,
      "start": ISODate("2010-05-01T00:00:00Z"),
      "end": ISODate("2010-05-08T00:00:00Z")
    },
    {
      "retail": 529700,
      "sale": 529700,
      "start": ISODate("2010-05-09T00:00:00Z"),
      "end": ISODate("2010-05-16T00:00:00Z")
    }
  ],
  "primary_category": ObjectId("6a5b1476238d3b4dd5000048"),
  "category_ids": [
    ObjectId("6a5b1476238d3b4dd5000048"),
    ObjectId("6a5b1476238d3b4dd5000049")
  ],
  "main_cat_id": ObjectId("6a5b1476238d3b4dd5000048"),
  "tags": [
    "tools",
    "gardening",
    "soil"
  ]
}

db.products.insert(product)

// create the unique index
db.products.createIndex({ slug: 1 }, { unique: true })


let category = {
  "_id" : ObjectId("6a5b1476238d3b4dd5000048"),
  "slug" : "gardening-tools",
  "name" : "Gardening Tools",
  "description" : "Gardening gadgets galore!",
  "parent_id" : ObjectId("55804822812cb336b78728f9"),
  "ancestors" : [
    {
      "name" : "Home",  // denormalized category information
      "_id" : ObjectId("558048f0812cb336b78728fa"),
      "slug" : "home",  // denormalized category information
    },
    {
      "name" : "Outdoors",  // denormalized category information
      "_id" : ObjectId("55804822812cb336b78728f9"),
      "slug" : "outdoors",  // denormalized category information
    }
  ]
}

db.categories.insert(category)
db.products.find({ "primary_category": ObjectId("6a5b1476238d3b4dd5000048") }).pretty()
db.categories.find({ "_id": { $in: product['category_ids'] } }).pretty()

let order = {
  "_id" : ObjectId("6a5b1476238d3b4dd5000048"),
  "user_id" : ObjectId("4c4b1476238d3b4dd5000001"),
  "purchase_date": new Date(2016, 0, 1),
  "state" : "CART",
  "line_items" : [    // denormalized products information
    {
      "_id" : ObjectId("4c4b1476238d3b4dd5003981"),
      "sku" : "9092",
      "name" : "Extra Large Wheelbarrow",
      "quantity" : 1,
      "pricing" : {
        "retail" : 5897,
        "sale" : 4897
      }
    },
    {
      "_id" : ObjectId("4c4b1476238d3b4dd5003982"),
      "sku" : "10027",
      "name" : "Rubberized Work Glove, Black",
      "quantity" : 2,
      "pricing" : {
        "retail" : 1499,
        "sale" : 1299
      }
    }
  ],
  "shipping_address" : {
    "street" : "588 5th Street",
    "city" : "Brooklyn",
    "state" : "NY",
    "zip" : 11215
  },
  "sub_total" : 6196    // denormalized sum of sale prices
}

db.orders.insert(order)


let user = {
  "_id" : ObjectId("4c4b1476238d3b4dd5000001"),
  "username" : "kbanker",
  "email" : "kylebanker@gmail.com",
  "first_name" : "Kyle",
  "last_name" : "Banker",
  "hashed_password" : "bd1cfa194c3a603e7186780824b04419",
  "addresses" : [
    {
      "name" : "home",
      "street" : "588 5th Street",
      "city" : "Brooklyn",
      "state" : "NY",
      "zip" : 11215
    },
    {
      "name" : "work",
      "street" : "1 E. 23rd Street",
      "city" : "New York",
      "state" : "NY",
      "zip" : 10010
    }
  ],
  "payment_methods" : [
    {
      "name" : "VISA",
      "payment_token" : "43f6ba1dfda6b8106dc7"
    }
  ]
}

db.users.insert(user)


let review = {
  "_id" : ObjectId("4c4b1476238d3b4dd5000041"),
  "product_id" : ObjectId("4c4b1476238d3b4dd5003981"),
  "date" : ISODate("2010-06-07T00:00:00Z"),
  "title" : "Amazing",
  "text" : "Has a squeaky wheel, but still a darn good wheelbarrow.",
  "rating" : 4,
  "user_id" : ObjectId("4c4b1476238d3b4dd5000042"),
  "username" : "dgreenthumb",   // denormalized user information
  "helpful_votes" : 3,    // cached size, cause size doesn't use an index
  "voter_ids" : [
    ObjectId("4c4b1476238d3b4dd5000033"),
    ObjectId("7a4f0376238d3b4dd5000003"),
    ObjectId("92c21476238d3b4dd5000032")
  ]
}

db.reviews.insert(review)


// Products, categories, and reviews

product = db.products.findOne({ "slug": "wheelbarrow-9092" })
db.categories.findOne({ "_id": product["primary_category"] })
db.reviews.find({ "product_id": product["_id"] }).pretty()


// SKIP, LIMIT, ANDSORTQUERYOPTIONS

db.reviews.find({ "product_id": product["_id"] }).skip(0).limit(12)
db.reviews.find({ "product_id": product["_id"] }).sort({ "helpful_votes": -1 }).limit(12)

page_number = 1
product = db.products.findOne({ "slug": "wheelbarrow-9092" })
category = db.categories.findOne({ "_id": product["primary_category"] })
reviews_count = db.reviews.count({ "product_id": product_id })
reviews = db.reviews.find({ "product_id": product["_id"] })
            .skip( (page_number - 1) * 12)
            .limit(12)
            .sort({ "helpful_votes": -1 })


// PRODUCT LISTING PAGE

page_number = 1
category = db.categories.findOne({ "slug": "gardening-tools" })
siblings = db.categories.find({ "parent_id": category["_id"] })
products = db.products.find({ "category_ids": category["_id"] })
              .skip( (page_number - 1) * 12 )
              .limit(12)
              .sort({ "average_review": -1 })

categories = db.categories.find({ "parent_id": null })


// Users and orders

db.users.findOne({ "username": "kbanker",
                   "hashed_password": "bd1cfa194c3a603e7186780824b04419" },
                   { "_id": 1 })


// PARTIAL MATCH QUERIES IN USERS

db.users.find({ "last_name": /^Ba/ })   // RE


// QUERYING SPECIFIC RANGES

db.users.find({ "addresses.zip": { $gt: 10019, $lt: 10040} })


// SELECTOR MATCHING

db.users.find({ "first_name": "Smith", birth_year: 1975 })


// RANGES

db.users.find({ "birth_year": {$gt: 1985, $lt: 2015} })


// ARAYS

db.products.find({ "tags": "soil" })
db.products.find({ "tags.0": "soil" })

db.users.find({ "addresses.state":  "NY", "addresses.name": "home"}) // wrong
db.users.find({ "addresses": {  $elemMatch: { "state": "NY", "name": "home" } } })

db.users.find({ "addresses": { $size: 3 } })


// REGULAR EXPRESSIONS

db.reviews.find({ "user_id": ObjectId("4c4b1476238d3b4dd5000001"), "text": /best|worst/i})  // i prevents an index
db.reviews.find({ "user_id": ObjectId("4c4b1476238d3b4dd5000001"),
                  "text": {
                    $regex: "best|worst",
                    $options: "i",
                  }
                })


// MISCELLANEOUS QUERY OPERATORS

db.orders.find({ "sub_total": { $mod: [3, 0] } })   // sub_total is divisible by 3; $mod doesn't use an index


// PROJECTIONS

db.users.find({}, { "username": 1 })

db.products.find({}, { "reviews": { $slice: 12 } })   // for arrays
db.products.find({}, { "reviews": { $slice: [24, 12] } })    // for arrays
db.products.find({}, { "reviews": { $slice: [24, 12] }, "reviews.rating": 1 })    // will return only rating


// SORTING

db.reviews.find({}).sort({ "rating": -1 })


