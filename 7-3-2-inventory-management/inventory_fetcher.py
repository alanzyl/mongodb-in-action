from datetime import datetime

from pymongo.errors import OperationFailure


class InventoryFetchFailure(Exception):
    """Basic exception for errors raised by invetory"""

    def __init__(self, msg=None):
        super().__init__(msg)


class InventoryFetcher:
    AVAILABLE = 0
    IN_CART = 1
    PRE_ORDER = 2
    PURCHASED = 3

    def init(self, orders, inventory):
        self.orders = orders
        self.inventory = inventory

    def add_to_cart(self, order_id, *items):
        item_selectors = []
        for item in items:
            for i in range(item['quantity']):
                item_selectors.append({'sku': item['sku']})

        self.transition_state(order_id, item_selectors,
                              {'from': self.AVAILABLE, 'to': self.IN_CART})

    def transition_state(self, order_id, selectors, opts={}):
        items_transitioned = []
        try:
            for selector in selectors:
                query = selector.update({'state': opts['from']})
                physical_item = self.inventory.find_and_modify(query=query,
                                                               update={
                                                                   "$set": {
                                                                       'state': opts['to'],
                                                                       'ts': datetime.utcnow()
                                                                   }
                                                               })
                if not physical_item:
                    raise InventoryFetchFailure()

                items_transitioned.append(physical_item['_id'])
        except (InventoryFetchFailure, OperationFailure):
            self.rollback(order_id, items_transitioned, opts['from'], opts['to'])
            raise InventoryFetchFailure('An error occured with SKU {}'.format(selector['sku']))

        return items_transitioned.size

    def rollback(self, order_id, selectors, old_state, new_state):
        self.orders.update_one({'_id': order_id},
                               {'$pullAll': {'items_ids': items_ids}})
        for id in items_ids:
            self.inventory.find_one_and_update(
                query={
                    '_id': id,
                    'state': new_state,
                },
                update={
                    '$set': {
                        'state': old_state,
                        'ts': datetime.utcnow(),
                    }
                }
            )
