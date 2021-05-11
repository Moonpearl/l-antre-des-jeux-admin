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
      `query ProductQuery {
        shelves(stage: DRAFT) {
          id
          name
        }
      }`
    );

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data.shelves),
    };
  }
  catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: error.toString(),
    };
  }
}

module.exports = { handler };
