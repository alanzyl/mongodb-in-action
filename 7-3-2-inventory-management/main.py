import pprint

from pymongo import MongoClient
from bson.objectid import ObjectId

from .inventory_fetcher import InventoryFetcher


AVAILABLE = 0
IN_CART = 1
PRE_ORDER = 2
PURCHASED = 3

# Connection
client = MongoClient('mongodb://root:password@localhost:27017/', tz_aware=True)
e_commerce_db = client['e-commerce']
orders = e_commerce_db['orders']
inventory = e_commerce_db['inventory']

for i in range(3):
    inventory.insert_one({
        'sku': 'shovel',
        'state': AVAILABLE,
    })
    inventory.insert_one({
        'sku': 'rake',
        'state': AVAILABLE,
    })
    inventory.insert_one({
        'sku': 'clippers',
        'state': AVAILABLE,
    })


# INVENTORY FETCHER

order_id = ObjectId('561297c5530a69dbc9000000')
orders.insert_one({
    '_id': order_id,
    'username': 'kbanker',
    'item_ids': []
})

inventory_fetcher = InvetoryFetcher(orders=orders,
                                    inventory=inventory)
inventory_fetcher.add_to_cart(order_id,
                              [
                                  {'sku': 'shovel', 'quantity': 3},
                                  {'sku': 'clippers', 'quantity': 1}
                              ])

for order in orders.find({'_id': order_id}):
    print("\nHere's the order: ", sep=' ')
    pprint.pprint(order)

    print("Here's each item: ")
    for item_id in order['item_ids']:
        for inventory_item in inventory.find({'_id': item_id}):
            pprint.pprint(inventory_item)
