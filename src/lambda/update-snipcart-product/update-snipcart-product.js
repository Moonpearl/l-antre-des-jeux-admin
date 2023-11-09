const axios = require('axios');

const handler = async (event) => {
  const { id, stock } = JSON.parse(event.body);

  const { SNIPCART_SECRET_API_KEY } = process.env;

  try {
    const response = await axios({
      method: 'PUT',
      url: `https://app.snipcart.com/api/products/${id}`,
      data: { inventoryManagementMethod: 'Single', stock },
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
