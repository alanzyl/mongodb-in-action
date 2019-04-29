// MONGODB TEXT SEARCH: A SIMPLE EXAMPLE
use e-commerce

db.products.createIndex({
    "name": "text",
    "description": "text",
    "tags": "text",
})
db.products.find(
    {"$text": {"$search": "gardens"}},
    {"_id": 0, "name": 1, "description": 1, "tags": 1}
).pretty()


// Manning book catalog data download
$ mongoimport --username root --db catalog --collection books --type json --file catalog.books.json --authenticationDatabase admin

// Defining text search indexes
use books
db.books.createIndex(
    {
        "title": "text",
        "shortDescription": "text",
        "longDescription": "text",
        "author": "text",
        "categories": "text"
    },
    {
        "weights": {
            "title": 10,
            "categories": 5
        },
        "name": "books_text_index"
    }
)

// WILDCARD FIELD NAME
db.books.createIndex(
    {
        "$**": "text",
    },
    {
        "weights": {
            "title": 10,
            "categories": 5
        },
    }
)

// Basic text search
db.books.find({"$text": {"$search": "action"}}, {"title": 1})
db.books.find({"$text": {"$search": "MongoDB in action"}}, {"title": 1})

// EXACT MATCH ON WORD OR PHRASE
db.books.find({"$text": {"$search": '"MongoDB" in action'}}, {"title": 1})
db.books.find({"$text": {"$search": '"MongoDB" "second edition"'}}, {"title": 1})

// EXCLUDING DOCUMENTS WITH SPECIFIC WORDS OR PHRASES
db.books.find({"$text": {"$search": "mongodb -second"}}, {"title": 1})
db.books.find({"$text": {"$search": 'mongodb -"second edition"'}}, {"title": 1})

// Text search scores
db.books.find({"$text": {"$search": "MongoDB in action"}},
              {"title": 1, "score": {"$meta": "textScore"}})

// Sorting results by text search score
db.books.find(
    {"$text": {"$search": "MongoDB in action"}},
    {"title": 1, "score": {"$meta": "textScore"}}
).sort({ "score": {"$meta": "textScore"} })


// Aggregation framework text search

db.books.aggregate(
    [
        {
            "$match": { "$text": {"$search": 'mongodb in action'} }
        },
        {
            "$sort": { "score": {"$meta": "textScore"} }
        },
        {
            "$project": { "title": 1, "score": {"$meta": "textScore"} }
        }
    ]
)

// Where’s MongoDB in Action, Second Edition?

db.books.aggregate(
    [
        {
            "$match": { "$text": {"$search": 'mongodb in action'} }
        },
        {
            "$project": {
                "title": 1,
                "score": {"$meta": "textScore"},
                "multiplier": {"$cond": ["$longDescription", 1.0, 2.0]}
            }
        },
        {
            "$project": {
                "title": 1,
                "score": 1,
                "multiplier": 1,
                "adjScore": {"$multiply": ["$score", "$multiplier"]},
            }
        },
        {
            "$sort": { "adjScore": -1 }
        },
    ]
)


// Text search languages

// Specifying language in the index
db.books.dropIndex("books_text_index")

db.books.createIndex(
    {
        "$**": "text",
    },
    {
        "weights": {
            "title": 10,
            "categories": 5,
        },
        "name": "books_text_index",

        "default_language": "french",
    }
)
db.books.find({"$text": {"$search": "in"}}).count()

// Specifying the language in the document

db.books.insert({
    _id: 999,
    title: 'Le Petite Prince',
    pageCount: 85,
    publishedDate:  ISODate('1943-01-01T01:00:00Z'),
    shortDescription: "Le Petit Prince est une œuvre de langue française,la plus connue d'Antoine de Saint-Exupéry. Publié en 1943 à New Yorksimultanément en anglais et en français. C'est un conte poétique etphilosophique sous l'apparence d'un conte pour enfants.",
    status: 'PUBLISH',
    authors: ['Antoine de Saint-Exupéry'],
    language: 'french'
})

// Specifying the language in a search
db.books.find({"$text": {"$search": "Petit", "$language": "french"}},
              {"title": 1})

db.books.find({"$text": {"$search": "prince"}},
              {"title": 1})
