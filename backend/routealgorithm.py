import numpy as np
grocery_stores = ["Kroger", "Walmart", "Target"]
grocery_items = ["eggs", "bread", "butter"]
max_number_of_stores = 2

grocery_prices = {
    "products": {
        "eggs": {
            "Kroger": 2.49,
            "Walmart": 3.19,
            "Target": 3.39
        },
        "bread": {
            "Kroger": 2.79,
            "Walmart": 2.49,
            "Target": 2.99
        },
        "butter": {
            "Kroger": 4.59,
            "Walmart": 4.29,
            "Target": 1.49
        }
    }
}

def get_lowest_price(prices, item, stores):
    lowest = np.inf
    for i in stores:
        current = prices["products"][item][i]
        if current < lowest:
            lowest = current
            lowest_store = i
    return lowest, lowest_store

def calculate_total_costs(prices, items, stores):
    """Calculate the total cost per store for all items."""
    total_costs = {store: 0 for store in stores}
    for item in items:
        for store in stores:
            total_costs[store] += prices["products"][item].get(store, np.inf)
    return total_costs

def optimal_route(stores, items, max_stores):

    total_costs = calculate_total_costs(grocery_prices, items, stores)
    sorted_stores = sorted(total_costs, key=total_costs.get)[:max_stores]
    
    store_items = {store: [] for store in sorted_stores}
    
    for item in items:
        lowest_price, lowest_store = get_lowest_price(grocery_prices, item, sorted_stores)
        store_items[lowest_store].append({"item": item, "price": lowest_price})
    
    # Display it
    total = 0
    for store, data in store_items.items():
        print(f"Store: {store}")
        for entry in data:
            total += entry['price']
            print(f"  Item: {entry['item']}, Price: {entry['price']}")
    print(total)
optimal_route(grocery_stores, grocery_items, max_number_of_stores)
