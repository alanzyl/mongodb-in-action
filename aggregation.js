use e-commerce


db.reviews.aggregate([
    { $group: { "_id" : "$product_id",
                "count": {$sum: 1} } },
])

product = db.products.findOne({ "slug": "wheelbarrow-9092" })

db.reviews.aggregate([
    { $match: { "product_id": product["_id"] } },
    { $group: { "_id": "$product_id",
                "count": {$sum: 1} } }
]).next()   // returns the first document in the results


// average rating

db.reviews.aggregate([
    { $match: { "product_id": product["_id"] } },
    { $group: { "_id": "$product_id",
                "average": {$avg: '$rating'},
                "count": {$sum: 1} } }
]).next()


// COUNTING REVIEWS BY RATING

db.reviews.aggregate([
    { $match: { "product_id": product["_id"] } },
    { $group: { "_id": "$rating",
                "count": {$sum: 1} } }
]).toArray()


// JOINING COLLECTIONS

db.products.aggregate([
    { $group: { "_id": product["primary_category"],
                "count": {$sum: 1} } }
])

db.mainCategorySummary.remove({})
// can be very slow
db.products.aggregate([
    { $group: { "_id": "primary_category",
                "count": { $sum: 1 } } }
]).forEach(function(doc) {
    var category = db.categories.findOne({ "_id": doc._id });
    if (category !== null) {
        doc.category_name = category.name;
    } else {
        doc.category_name = 'not found';
    }
    db.mainCategorySummary.insert(doc);
})


// $OUT AND $PROJECT

db.products.aggregate([
    { $group: { "_id": "primary_category",
                "count": {$sum: 1} } },
    { $out: "mainCategorySummary" },        // save pipeline to mainCategorySummary
])

db.products.aggregate([
    { $project:  {"category_ids": 1} }
])


// FASTER JOINS WITH $UNWIND

db.products.aggregate([
    { $project: {"category_ids": 1} },
    { $unwind: "$category_ids" },
    { $group: { "_id": "category_ids",
                "count": {$sum: 1} } },
    { $out: "countsByCategory"},
])


// User and order

db.reviews.aggregate([
    { $group : {
        "_id": "$user_id",
        "count": {$sum: 1},
        "avg_helpful": {$avg: "$helpful_votes"},
    } }
])


// SUMMARIZING SALES BY YEAR AND MONTH

db.orders.aggregate([
    { $match: { "purchase_date": { $gt: new Date(2010, 0, 1) } } },
    { $group: {
        "_id": { "year": { $year: "$purchase_date" },
                 "month": { $month: "$purchase_date" } },
        "count": { $sum: 1 },
        "total": { $sum: "$sub_total" },
    } },
    { $sort: { "_id": -1 } }
])

upperManhattanOrders = { "shipping_address.zip": {$gte: 10019, $lt: 10040} }
sumByUserId = { "_id": "$user_id",
                "total": { $sum: "$sub_total" } }
orderTotalLarge = { "total": { $gt: 10000 } }
sortTotalDesc = { "total": -1 }

db.orders.aggregate([
    { $match: upperManhattanOrders },
    { $group: sumByUserId },
    { $match: orderTotalLarge},
    { $sort: sortTotalDesc },
    { $out: "targetedCustomers" },
])
