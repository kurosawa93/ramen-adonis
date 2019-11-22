# ramen-adonis

`ramen-adonis` is `ramen` library for `Adonis.JS` framework. It offers dynamic query request from query string, dynamic upsert for each model, and also request authentication for each endpoint.

## Installation
You can install the package using command

    adonis install ramen-adonis

The installer will copy the following files into your project directory.

  - `config/ramen.js`
  - `app/Models/Traits/RamenModel.js`

These files should be located inside your project directory after a successfull installation.

## How to Use
Detailed instructions for how to integrate the package to your project can be found in [instruction.md](https://github.com/kurosawa93/ramen-adonis/blob/master/instructions.md)
file which will be automatically opened after a successfull installation.

## Features

### Request Parsing
#### Query String Parsing
`ramen-adonis` will parse any matched command found in the query string available in your endpoint, such as filtering, loading relations, ordering, and also pagination.
- **Filtering**

  To filter the query results, you can add your model property inside the query string. In case you have a `User` model, containing `id` and 'email',
  and you want to filter the query by `email`, add the following to query string `?email=something`. *Supported operator*
    - `=`
    - '=!='
    - '=<='
    - '=>='
- **Ordering**

  To order the result, you can use keyword `orderBy` and the column which will be sorted by. example `?orderBy=created_at`. you can
  also adding `direction` keyword, which will determain the direction of the order. Default is `asc`.
- **Relations**

  Relations is used to load relations data related to current object. You can also filter by adding query string to relations, like `relations=roles^id=something`
  
