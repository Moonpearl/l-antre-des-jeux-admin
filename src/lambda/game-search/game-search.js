const axios = require('axios');

// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
const handler = async (event) => {
  try {
    const name = event.queryStringParameters.name;

    const { BOARDGAMEATLAS_CLIENT_ID } = process.env;

    const requestUrl = `https://api.boardgameatlas.com/api/search?name=${name}&pretty=true&client_id=${BOARDGAMEATLAS_CLIENT_ID}`;

    const response = await axios.get(requestUrl);

    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    }
    
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler }
