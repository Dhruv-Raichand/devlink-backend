- Create a repository
- Initialize the repository
- node_modules, package.json, package-lock.json
- Install express
- Create a server
- Listen to port 7777
- Write request handlers for /test , /hello
- Install nodemon and update scripts inside package.json
- What are dependecies
- What is the use of "-g" while npm install
- Difference between caret and tilde ( ^ vs ~ )


- initialize git
- . gitignore
- Create a remote repo on github
- Push all code to remote origin
- Play with routes and route extensions ex. /hello, /, hello/2, /xyz
- Order of the routes matter a lot
- Install Postman app and make a workspace/cottectio > test API call
- Write logic to handle GET, POST, PATCH, DELETE API Calls and test them on Postman
- Explore routing and use of ? , + , (), * in the routes
- Use of regex in routes /a/, / • *fly$/l
- Reading the query params in the routes
- Reading the dynamic routes


- Multiple Route Handlers - Play with the code
- next()
- next function and errors along with res.send()
- app.use("/route", rH, [rH2, rH3], rH4, rh5);
- Wat is a Middleware
- How express JS basically handles requests behind the scenes
- Difference app.use and app.all
- Write a dummy auth middleware for admin
- Write a dummy auth middleware for all user routes, except /user/login
- Error Handling using app.use("/", (err, req, res,next)=>{});


- Create a free cluster on MongoDB official website (MongoDB Atlas)
- Install mongoose library
- Connect your application to the Database "Connection-url"/Dinder
- Call the connectDB function and connect to the Database before starting application on 3000
- Create a userSchema & User Model
- Create a POST /signup API to add data to database
- Push some documents using API calls from postman
- Error Handing using try, catch

- JS object vs JSON (difference)
- Add the express.json middleware to your app
- Make your /signup API dynamic to recieve data from the end user
- User.findOne with duplicate emali ids, which object returned
- API- get user by email
- API- Feed API - GET /feed - get all the users from the database
- API- get user by id
- Create a delete user API
- Difference between PUT and PATCH
- API - Update a user
- Exlore the Mongoose Documentation for Models methods
- What are the options in a Model.findOneAndUpdate method, explore more about it
- API - Update the user with email ID

- Explore schematype options from the documention
- add required, unique, lowercase, min, minLength, trim
- Add default
- Create a custom validate function for gender
- Improve the DB schema - PUT all appropiate validations on each field in Schema
- Add timestamps to the userSchema
- Add API level validation on PATCH request & signup post api
- Data sanitizing - Add API validation for each field
- Install validator
- Explore validator library function and use validator function for password, email, & url
- NEVER TRUST req.body

- Validate data in signup API
- Install bcrypt package
- Create PasswordHash using bcrpt.hash & save the user with encrypted password
- Create login API
- Compare passwords and throw error if email or password is invalid

- Install cookie parser
- just send a dummy cookie to user
- create GET /profile API and check if you get the coookie back
- Install jsonwebtoken
- In login API, after email and password validation, create a JWT token and send it to user in cookies
- read the cookies inside your profile API and find the logged in user
- userAuth middleware
- Add the userAuth middleware in profile API and a sendConnectionRequest API
- Set the expiry of JWT token And cookies to 7 days
- Create userSchema method to getJWT()
- Create userSchema method to comparePasswords(passwordInputByUser)

- Explore tinder APIs
- Create a list of all API you can think of Dinder
- Group multiple routes under respective  routes
- Create authRoute, profileRouter, requesstRouter
- Import these routers in app.js
- Create POST /logout
- Create PATCH /profile/edit
- Create PATCH /profile/password
- Validate all data in every POST, PATCH APIs

- Create Connnection Request Schema
- Send Connection Request API
- Proper validation of Data
- Think about ALL corner cases
- $or query $and query in mongoose - https://www.mongodb.com/docs/manual/reference/operator/query-logical/
- schema.pre("save") function
- Read more about indexes in MongoDB
- Why do we need index in DB?
- What is the advantages and disadvantage of creating indexes? 
- Read this arcticte about compond indexes - https://www.mongodb.com/docs/manual/core/indexes/index-types/index-compound/
- ALWAYS THINK ABOUT ALL CORNER CASES

- Write code with proper validation for POST /request/review/:status/:requestId
- Thought process - POST vs GET
- Read about ref and populate https://mongoosejs.com/docs/api/document.html#Document.prototype.populate()
- Create GET /user/requests/received with all the checks
- Create GET /user/connections

- Logic for GET /feed API
- Explore the $nin, $and, $ne, and other comparison operators