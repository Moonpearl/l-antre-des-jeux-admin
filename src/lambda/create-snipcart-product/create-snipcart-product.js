const axios = require('axios');

const handler = async (event) => {
  const { slug } = JSON.parse(event.body);

  const { SNIPCART_SECRET_API_KEY, SITE_URL } = process.env;

  try {
    const response = await axios({
      method: 'POST',
      url: 'https://app.snipcart.com/api/products',
      data: { fetchUrl: `${SITE_URL}/.netlify/functions/get-product-json?slug=${slug}` },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${Buffer.from(SNIPCART_SECRET_API_KEY + ':').toString('base64')}`,
      },
    })

    return {
      statusCode: 201,
      body: JSON.stringify(response.data),
    };
  }
  catch (error) {
    return { statusCode: 500, body: JSON.stringify(error) };
  }
}

module.exports = { handler };
