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
  "helpful_votes" : 3,
  "voter_ids" : [
    ObjectId("4c4b1476238d3b4dd5000033"),
    ObjectId("7a4f0376238d3b4dd5000003"),
    ObjectId("92c21476238d3b4dd5000032")
  ]
}

db.reviews.insert(review)
