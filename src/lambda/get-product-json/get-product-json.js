const { GraphQLClient } = require('graphql-request');

const handler = async (event) => {
  const { GRAPHCMS_ENDPOINT, GRAPHCMS_MUTATION_TOKEN } = process.env;

  try {
    const { slug } = event.queryStringParameters;
    const graphcms = new GraphQLClient(
      GRAPHCMS_ENDPOINT,
      {
        headers: {
          authorization: `Bearer ${GRAPHCMS_MUTATION_TOKEN}`,
        }
      }
    );

    const { product } = await graphcms.request(
      `query ProductJsonQuery(
        $slug: String!
      ) {
        product(where: {slug: $slug}, stage: DRAFT) {
          id
          name
          price
          imageUrl
        }
      }`,
      {
        slug
      }
    );

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: `/.netlify/functions/get-product-json?slug=${slug}`,
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.imageUrl,
      }),
    };
  }
  catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};

module.exports = { handler };