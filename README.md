# NAPIM
Node API Maker built with polka and nodejs

# Overview
The idea is to make API development quick and easy. Every single end point is handled by one file that called service. One service include:
- Input validation
- DB transaction (optional)
- Input mapping
- Error handling

# Installation
1. Install Napim CLI globally

    `npm install -g napim-cli@beta`
    
    you can check by running `napim --version`
2. Generate Napim template
    
    `napim init project-name`
    
    change project name with your actual project name
    
    *for typescript support, ad -ts in the end* eg:`napim init project-name -ts`
    
3. Install dependency
  
    `cd project-name && npm install`


# File and Folder Structure
  
This is default folder structur for typescript mode:
``` php
.
|-- dist //compiled script will be here
|-- log //all error log will be here
|-- src
    |-- middleware
    |-- model
    |-- service
|-- stub //napim template generator, edit the template to match your needs
    |-- middleware.napim
    |-- model.napim
    |-- service.napim
    index.ts //your main js file
|-- .env
|-- .gitignore
|-- knexfile.js // by defaut napim use knex for Database Query Builder, delete it if you use nosql like mongo
|-- package.json
|-- router.json //this file will map your API endpoint to execute service file
|-- tsconfig.json
```
# Generate NAPIM File

- Generate Service
    
    `napim make:service service-name`
    
    by default service have method GET, you can change by append the method argument in the end, eg:
    
    `napim make:service login --post`
    
    this command will create file login_post.ts in service folder and append route data to router.json with tag: `"default"` inside `post` array, just check it :)
    
    By default, prefix for default tag is `api`, so you can execute the service by access endpoint POST:[host]/api/login
    
    If you want to add some tag, for example `secure` (You can add middleware like `Auth` later), add tag argument
    
    `napim make:service users --tag=secure`
    
    You can also make dynamic endpoint, for example find user by some id
    
    `napim make:service users/:id`

2. Generate Model
    
    If you use Model like Objection.js to you can generate Objection model by
    
    `napim make:model ModelName`
    
    if you prefer to use raw query, just `import {db} from "napim"` and use it like db.query(trx)... see knex documentation for detail
    
    If you want to use db transaction, just change transaction to true in your service file, ez
    
    You like NoSQL like mongo, just edit your .env add `DB_DRIVER=mongo` and create your own Model or Schema and import to your service like usually
    
    TODO: implement db transaction for mongo
  
3. Generate Middleware
  
    Want to make Auth, JWT, or handle uploaded file (eg: using multer) you can create it in middleware
    
    `napim make:middleware JWT`
    
    then use it in router, append it in middleware array for example:
    
    ``` json
    //router.json
    [
        {
            "tag": "default",
            "prefix": "/api",
            "middleware": [],
            "get": [],
            "post": [
                {
                    "path": "/login",
                    "service": "/login_post"
                }
            ]
        },
        {
            "tag": "secure",
            "prefix": "/api/secure",
            "middleware": [
                "JWT"
            ],
            "get": [
                {
                    "path": "/products/:id",
                    "service": "/products/_id_get"
                }
            ]
        },
        {
            "tag": "admin",
            "prefix": "/api/admin",
            "middleware": [
                "JWT",
                "Admin"
            ],
            "get": [
                {
                    "path": "/products",
                    "service": "/products_get"
                }
            ],
            "post": [
                {
                    "path": "/products",
                    "service": "/products_post"
                }
            ],
            "delete": [
                {
                    "path": "/products/:id",
                    "service": "/producst/_id_delete"
                }
            ],
            "patch": [
                {
                    "path": "/products/:id",
                    "service": "/producst/_id_patch"
                }
            ]
        }
    ]
    ```
    # Express App Instance
    
    If you want to access polka instance, just `import {app} from "napim"`
 
    
    
