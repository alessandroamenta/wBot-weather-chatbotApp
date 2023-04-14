const express = require('express'); // import the 'express' library
const cors = require('cors'); // import the 'cors' library
const axios = require('axios'); // import the 'axios' library
const admin = require('firebase-admin'); // import the 'firebase-admin' library
const serviceAccount = require('./weatherapp-d86fd-firebase-adminsdk-2fr2e-23c2b921a7.json'); // load the service account file for Firebase
const {generateConversationResponse} = require('./convo');


const app = express(); // create an instance of the Express application

app.use(cors()); // allow cross-origin resource sharing
app.use(express.json()); // use the JSON middleware for parsing incoming requests

const openWeatherApiKey = ''; // API key for OpenWeatherMap
const weatherEndpoint = ''; // API endpoint for OpenWeatherMap

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount), // load the credentials for Firebase
});

const db = admin.firestore(); // create a Firestore database instance

// POST endpoint for interacting with weather bot
app.post('/conversation', async (req, res) => {
    const prompt = req.body.prompt;
    const response = await generateConversationResponse(prompt);
    res.send(response);
  });  
  


// API endpoint for getting weather data
app.get('/weather', async (req, res) => {
  const { location } = req.query; // extract the location from the query parameters
  const locationQuery = encodeURIComponent(location); // encode the location for use in the URL
  const weatherUrl = `${weatherEndpoint}?q=${locationQuery}&appid=${openWeatherApiKey}&units=metric`; // construct the URL for the OpenWeatherMap API

  try {
    const weatherResponse = await axios.get(weatherUrl); // make a GET request to the OpenWeatherMap API
    const weatherData = weatherResponse.data; // extract the weather data from the response
    res.json(weatherData); // send the weather data as a JSON response
  } catch (error) {
    console.error(error); // log any errors
    res.status(500).send('Error fetching weather data'); // send an error response
  }
});

// API endpoint for adding a favorite city
app.post('/favorites', async (req, res) => {
  const { idToken, city } = req.body; // extract the user's ID token and favorite city from the request body
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken); // verify the user's ID token
    const userId = decodedToken.uid; // extract the user ID from the decoded token
    const userRef = admin.firestore().collection('users').doc(userId); // get a reference to the user's document in Firestore
    await userRef.update({ // update the user's favorites array
      favorites: admin.firestore.FieldValue.arrayUnion(city)
    });
    res.status(200).send(`Favorite city ${city} added successfully! ${idToken}`); // send a success response
  } catch (error) {
    console.error('Error adding favorite city:', error); // log any errors
    res.status(500).send('Failed to add favorite city'); // send an error response
  }
});

// Endpoint for deleting a favorite city
app.delete('/favorites/:city', async (req, res) => {
    // Extract the city name from the URL parameters
    const { city } = req.params;
    // Extract the ID token from the request body
    const { idToken } = req.body;
    console.log(`Deleting ${city} for user with ID token ${idToken}`);
  
    try {
      // Verify the user's ID token using Firebase Authentication
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const userId = decodedToken.uid;
      // Get a reference to the user's document in Firestore
      const userRef = admin.firestore().collection('users').doc(userId);
      console.log(`User reference: ${userRef.path}`);
      // Remove the specified city from the user's favorites array
      await userRef.update({
        favorites: admin.firestore.FieldValue.arrayRemove(city)
      });
      console.log(`Successfully removed ${city} from user favorites`);
      // Send a success message back to the client
      res.send('City deleted from favorites');
    } catch (error) {
      console.error(error);
      // Send an error message back to the client if there was a problem
      res.status(500).send('Error removing favorite city');
    }
  });
  
  // Set the server to listen on port 5000 and log a message when it starts
  const port = 5000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
  