const fetch = require("node-fetch");

const handler = async (event) => {
  try {
    const { slug } = JSON.parse(event.body);

    const { SNIPCART_SECRET_API_KEY, DEPLOY_URL } = process.env;

    const result = await fetch('https://app.snipcart.com/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${Buffer.from(SNIPCART_SECRET_API_KEY + ':').toString('base64')}`,
      },
      body: JSON.stringify({ fetchUrl: `${DEPLOY_URL}/.netlify/functions/get-product-json?slug=${slug}` }),
    });

    return {
      statusCode: 201,
      body: JSON.stringify(result),
    };
  }
  catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
}

module.exports = { handler };
