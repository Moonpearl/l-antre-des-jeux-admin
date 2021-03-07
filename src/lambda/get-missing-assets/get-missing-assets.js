const axios = require('axios');
const { GraphQLClient } = require('graphql-request');

const queries = {
  categories: `query CategoriesQuery {
    categories(stage: DRAFT, first: 1000) {
      id
      boardgameatlasId
      name
      slug
    }
  }`,
  mechanics: `query MechanicsQuery {
    mechanics(stage: DRAFT, first: 1000) {
      id
      boardgameatlasId
      name
      slug
    }
  }`,
};

const handler = async (event, context) => {
  const { GRAPHCMS_ENDPOINT, GRAPHCMS_MUTATION_TOKEN, BOARDGAMEATLAS_CLIENT_ID } = process.env;
  const { resource } = event.queryStringParameters;

  try {
    const query = queries[resource];
    if (typeof query === 'undefined') {
      throw new Error(`Unknown resource type '${resource}.'`);
    }

    const graphcms = new GraphQLClient(
      GRAPHCMS_ENDPOINT,
      {
        headers: {
          authorization: `Bearer ${GRAPHCMS_MUTATION_TOKEN}`,
        }
      }
    );

    let response;

    // Fetch all existing assets from the CMS
    response = await graphcms.request(query);
    const cmsAssets = response[resource];

    // Fetch all assets from Board Game Atlas
    response = await axios.get(`https://api.boardgameatlas.com/api/game/${resource}?client_id=${BOARDGAMEATLAS_CLIENT_ID}`);
    const bgaAssets = response.data[resource];

    // Compute missing Board Game Atlas assets from the CMS
    const cmsBgaIds = cmsAssets.map(cmsAsset => cmsAsset.boardgameatlasId);
    const missingsAssets = bgaAssets.filter(bgaAsset => !cmsBgaIds.includes(bgaAsset.id));

    return {
      statusCode: 200,
      body: JSON.stringify(missingsAssets),
    };
  }
  catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
}

module.exports = { handler }
