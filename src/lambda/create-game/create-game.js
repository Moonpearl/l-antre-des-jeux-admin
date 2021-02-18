const { GraphQLClient } = require('graphql-request');
const TurndownService = require('turndown');

const handler = async (event) => {
  const { GRAPHCMS_ENDPOINT, GRAPHCMS_MUTATION_TOKEN } = process.env;

  const turndownService = new TurndownService();

  try {
    const { name, description, price, handle, image_url } = JSON.parse(event.body);

    const graphcms = new GraphQLClient(
      GRAPHCMS_ENDPOINT,
      {
        headers: {
          authorization: `Bearer ${GRAPHCMS_MUTATION_TOKEN}`,
        }
      }
    );

    const { createProduct } = await graphcms.request(
      `mutation createGame(
        $name: String,
        $slug: String,
        $description: String,
        $price: Float,
        $imageUrl: String
      ) {
        createProduct(data: {localizations: {create: {data: {
            name: $name,
            description: $description
          }, locale: en}},
          slug: $slug,
          price: $price,
          imageUrl: $imageUrl
        }) {
          id
        }
      }`,
      {
        name,
        slug: handle,
        description: turndownService.turndown(description),
        price: Number(price),
        imageUrl: image_url
      }
    );

    return {
      statusCode: 201,
      body: JSON.stringify(createProduct),
    };
  }
  catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
}

module.exports = { handler };
