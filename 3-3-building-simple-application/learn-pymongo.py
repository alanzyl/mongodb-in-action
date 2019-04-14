import pprint

from pymongo import MongoClient
from bson.objectid import ObjectId

# Connection
client = MongoClient('mongodb://root:password@localhost:27017/', tz_aware=True)
tutorial_db = client['tutorial']
user_collection = tutorial_db['user']

# Inserting
smith = {"last_name": "smith", "age": 30}
user_collection.insert_one(smith)

jones = {"last_name": "jones", "age": 40}
kelly = {"last_name": "kelly", "age": 50}
user_collection.insert_many([jones, kelly])

# Finding
for user in user_collection.find({"age": {"$gt": 30}}):
    pprint.pprint(user)

pprint.pprint(user_collection.find_one({"last_name": "smith"}))
pprint.pprint(user_collection.find({"age": {"$gt": 30}}))

# Counting
user_collection.count_documents({})

# Updating
user_collection.update_one({"last_name": "smith"}, {"$set": {"city": "New York"}})
user_collection.update_many({"age": {"$gt": 30}}, {"$set": {"city": "Chicago"}})

# Deleting
user_collection.delete_one({"age": {"$lt": 20}})
user_collection.drop()

# Database commands
for db in client.list_databases():
    pprint.pprint(db)

admin_db = client['admin']

# Object ID generation
smith_doc = user_collection.find_one({"last_name": "smith"})
smith_doc['_id'].generation_time
