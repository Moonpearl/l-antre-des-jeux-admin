const { GraphQLClient } = require('graphql-request');

const queries = {
  categories: `mutation CreateCategoryMutation(
    $boardgameatlasId: String,
    $name: String,
    $slug: String
  ) {
    createCategory(data: {
      boardgameatlasId: $boardgameatlasId,
      slug: $slug
      name: $name
    }) {
      id
    }
    publishCategory(
      where: {
        boardgameatlasId: $boardgameatlasId
      },
      to: PUBLISHED
    ) {
      id
    }
  }`,
  mechanics: `mutation CreateMechanicMutation(
    $boardgameatlasId: String,
    $name: String
    $slug: String
  ) {
    createMechanic(data: {
      boardgameatlasId: $boardgameatlasId,
      slug: $slug
      name: $name
    }) {
      id
    }
    publishMechanic(
      where: {
        boardgameatlasId: $boardgameatlasId
      },
      to: PUBLISHED
    ) {
      id
    }
  }`,
};

const handler = async (event) => {
  const { GRAPHCMS_ENDPOINT, GRAPHCMS_MUTATION_TOKEN } = process.env;
  const { resource } = event.queryStringParameters;

  try {
    const query = queries[resource];
    if (typeof query === 'undefined') {
      throw new Error(`Unknown resource type '${resource}.'`);
    }

    const payload = JSON.parse(event.body);

    const graphcms = new GraphQLClient(
      GRAPHCMS_ENDPOINT,
      {
        headers: {
          authorization: `Bearer ${GRAPHCMS_MUTATION_TOKEN}`,
        }
      }
    );

    const response = await graphcms.request(query, payload);

    return {
      statusCode: 201,
      body: JSON.stringify(response),
    };
  }
  catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
}

module.exports = { handler };
