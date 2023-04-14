const axios = require("axios");
const nlp = require("compromise");
const readline = require("readline");
const openai = require("openai");
const opencage = require("opencage-api-client");

const OPENAI_API_KEY = ""; // Replace with your OpenAI API key
const openWeatherApiKey = ""; // API key for OpenWeatherMap
const weatherEndpoint = ""; // API endpoint for OpenWeatherMap
const opencagedataApiKey = "";

// Use an NLP library like 'natural' to extract the location from the input
// Return the location as a string - returns an empty string if no valid location is found
async function extractLocation(input) {
  let location = "";
  const doc = nlp(input);
  const places = doc.places().json();
  if (places.length > 0) {
    location = places[0].text;
  }
  console.log(location);
  return location;
}

// Use OpenCageData API to check if the location is a valid city
// Return true if it is, false otherwise
async function checkValidCity(location) {
  try {
    const response = await opencage.geocode({
      q: location,
      key: opencagedataApiKey,
      no_annotations: 1,
      limit: 1,
      language: "en",
      min_confidence: 5,
      pretty: 0,
    });

    if (response.status.code === 200 && response.results.length > 0) {
      const firstResult = response.results[0];
      const components = firstResult.components;
      console.log(components.city);
      return components.city !== undefined;
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}

// Use OpenWeatherMap API to fetch weather data for the location
// Return the weather data as an object
async function fetchWeatherData(location) {
    // Remove any trailing special characters from the location
    location = location.replace(/[^\w\s]/gi, "");
  
    // Construct the API URL with the location and API key
    const url = `${weatherEndpoint}?q=${location}&appid=${openWeatherApiKey}`;
  
    // Fetch the weather data from the API
    const response = await axios.get(url);
  
    // Return the weather data as an object
    return response.data;
  }

// Use OpenAI's language model to generate a response
// Incorporate the weather data into the response
// Return the response as a string
async function generateResponse(prompt, weatherData, maxTokensToSample = 100) {
  const promptWithoutPeriod = prompt.replace(/\.$/, "");
  const openaiResponse = await axios.post(
    "https://api.openai.com/v1/engines/text-davinci-003/completions",
    {
      prompt: `${promptWithoutPeriod} The weather in ${weatherData.name} is currently ${weatherData.weather[0].description}.`,
      max_tokens: maxTokensToSample,
      n: 1,
      stop: "\n",
    },
    {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
    }
  );
  return openaiResponse.data.choices[0].text;
}

async function conversation() {
  console.log("Welcome to the conversation!");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  while (true) {
    const user_input = await new Promise((resolve) =>
      rl.question("You: ", resolve)
    );
    if (user_input.trim() === "") {
      continue;
    }
    if (user_input.toLowerCase() === "quit") {
      console.log("Goodbye!");
      rl.close();
      break;
    }
    const location = await extractLocation(user_input);
    const isValidCity = await checkValidCity(location);
    if (!isValidCity) {
      console.log(
        "Bot: Sorry, I couldn't find the location you're asking about."
      );
      continue;
    }
    const weatherData = await fetchWeatherData(location);
    const response = await generateResponse(
      `You said: ${user_input}`,
      weatherData
    );
    console.log("Bot:", response);
  }
}

conversation();

async function generateConversationResponse(prompt) {
    const location = await extractLocation(prompt);
    const isValidCity = await checkValidCity(location);
    if (!isValidCity) {
      return "Sorry, I couldn't find the location you're asking about.";
    }
    const weatherData = await fetchWeatherData(location);
    const response = await generateResponse(
      `You said: ${prompt}`,
      weatherData
    );
    return response;
  }

module.exports = {generateConversationResponse}
  