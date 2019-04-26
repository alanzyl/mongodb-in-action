use e-commerce

// UNIQUE INDEXES
db.users.createIndex({"username": 1}, {"unique": true})

// SPARSE INDEXES
db.products.createIndex({"sku": 1}, {"unique": true, "sparse": true})
db.reviews.createIndex({"user_id": 1}, {"unique": true, "sparse": true})

// HASHED INDEXES
db.recipes.createIndex({"recipe_name": "hashed"})


// 8.2.2 Index administration
use green
spec = {
    "ns": "green.users",
    "key": {"addresses.zip": 1},
    "name": "zip"
}
db.systems.indexes.insert(spec, true)

db.green.getIndexes()

// BACKGROUND INDEXING
db.values.createIndex({"open": 1, "close": 1}, {"background": true})

// DEFRAGMENTING
db.values.reIndex()

// USING THE PROFILER

use stocks
db.setProfilingLevel(2)
db.system.profile.find().sort({$natural: -1}).limit(5).pretty()
