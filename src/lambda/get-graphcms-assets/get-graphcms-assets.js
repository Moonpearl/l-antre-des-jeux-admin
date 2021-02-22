const { GraphQLClient } = require('graphql-request');

const handler = async (event) => {
  const { GRAPHCMS_ENDPOINT, GRAPHCMS_MUTATION_TOKEN } = process.env;

  try {
    const graphcms = new GraphQLClient(
      GRAPHCMS_ENDPOINT,
      {
        headers: {
          authorization: `Bearer ${GRAPHCMS_MUTATION_TOKEN}`,
        }
      }
    );

    const data = await graphcms.request(
      `query MyQuery {
        products(stage: DRAFT) {
          id
          boardgameatlasId
        }
      }`
    );

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  }
  catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
}

module.exports = { handler };
