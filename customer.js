db.customers.insert([
    {
        "first_name" : "Steven",
        "last_name" : "Smith",
    },
    {
        "first_name" : "Joam",
        "last_name" : "Johnson",
        "gender" : "female",
    },
]);

db.customers.update( { "first_name" : "John" }, { "first_name" : "John", "last_name" : "Doe", "female" : "male" } );
db.customers.update( { "first_name" : "Steven" }, { "$set": { "gender" : "male" } } );
db.customers.update( { "first_name" : "Steven" }, { "$set": { "age" : 45 } } );
db.customers.update( { "first_name" : "Steven" }, { "$inc": { "age" : 5 } } );
db.customers.update( { "first_name" : "Steven" }, { "$unset": { "age" : 0 } } );

db.customers.update( { "first_name" : "Mary" }, { "first_name": "Mary", "last_name" : "Simpson" } );
db.customers.update( { "first_name" : "Mary" }, { "first_name": "Mary", "last_name" : "Simpson" }, { "upsert" : true } );

db.customers.update( { "first_name" : "Steven" }, { "$rename" : { "gender" : "sex" } } );

db.customers.remove( { "first_name" : "Steven" } );
db.customers.remove( { "first_name" : "Steven" }, { "justOne" : true } );


db.customers.insert([
    {
        "first_name" : "Darien",
        "last_name" : "Hawkins",
        "gender" : "male",
        "age" : 43,
        "address": {
            "street" : "4 main st",
            "city" : "Boston",
            "state" : "MA",
        },
        "memberships" : [ "mem1" ],
        "balance" : 333.23,
    },
    {
        "first_name" : "Angeles",
        "last_name" : "Rouleau",
        "gender" : "female",
        "age" : 34,
        "address": {
            "street" : "4612  Ferry Street",
            "city" : "Florence",
            "state" : "AL",
        },
        "memberships" : [ "mem1", "mem2" ],
        "balance" : 373.23,
    },
    {
        "first_name" : "Ozie",
        "last_name" : "Yule",
        "gender" : "female",
        "age" : 25,
        "address": {
            "street" : "3504  Murphy Court",
            "city" : "Riverside",
            "state" : "CA",
        },
        "memberships" : [ "mem1", "mem3" ],
        "balance" : 266.23,
    },
    {
        "first_name" : "Clair",
        "last_name" : "Laux",
        "gender" : "male",
        "age" : 27,
        "address": {
            "street" : "2715  Circle Drive",
            "city" : "Houston",
            "state" : "TX",
        },
        "memberships" : [ "mem2" ],
        "balance" : 347.23,
    },
]);

db.customers.find( { "first_name" : "Clair" } ).pretty();
db.customers.find( { "$or" : [ { "first_name" : "Clair" }, { "first_name" : "Ozie" } ] } ).pretty();
db.customers.find( { "gender" : "male" } ).pretty();
db.customers.find( { "age" : { "$lt" : 40 } } ).pretty();
db.customers.find( { "age" : { "$gt" : 40 } } ).pretty();
db.customers.find( { "address.city" : "Houston" } ).pretty();
db.customers.find( { "memberships" : "mem3" } ).pretty();

db.customers.find().sort( { "last_name" : 1 } ).pretty();
db.customers.find().sort( { "last_name" : -1 } ).pretty();

db.customers.find().count();
db.customers.find( { "gender" : "female" } ).count();

db.customers.find().limit(4);
db.customers.find().limit(4).sort( { "balance" : 1 } );

db.customers.find().forEach( function(doc) { print("Customer name: " + doc.first_name ) } );
