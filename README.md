# Workout Logbook Backend

Express JS application, backend of my workout logbook flutter project that you can access here https://github.com/AlessandroTrabucco/Workout-Logbook-frontend.

This application authenticates a client verifying Google Id Token, and then creating a Json Web Token, after that, the client can access its own workouts
, send request to create, update and delete workouts. The client can also send request to the API to update training sessions and save progresses. 

This app uses googleapis package to verify Google Id Token.

This frontend application sends requests to a rest API developed in Node.js that you can access here.
