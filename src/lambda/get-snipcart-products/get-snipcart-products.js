const axios = require("axios");

const handler = async (event) => {
  const { SNIPCART_SECRET_API_KEY, SITE_URL } = process.env;

  try {
    const response = await axios({
      method: "GET",
      url: "https://app.snipcart.com/api/products",
      params: {
        limit: 10000,
      },
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${Buffer.from(
          SNIPCART_SECRET_API_KEY + ":"
        ).toString("base64")}`,
      },
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify(error) };
  }
};

module.exports = { handler };
