# All Dinder APIs


## authRouter
- POST /signup 
- POST /login
- POST /logout

## profileRouter
- GET /profile/view
- PATCH /profile/edit
- PATCH /profile/password

## connectionRequestRouter
- POST request/send/:status/:userId
    - POST request/send/interested/:userId
    - POST request/send/ignored/:userId

- POST request/review/:status/:requestId
    - POST request/review/accept/:requestId
    - POST request/review/reject/:requestId

## userRouter
- GET user/feed
- GET user/connection
- GET user/requests

- GET /search/

Status: ignore, interested, accepted, rejected