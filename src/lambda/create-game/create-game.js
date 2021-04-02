const { GraphQLClient } = require('graphql-request');
const TurndownService = require('turndown');

const handler = async (event) => {
  const { GRAPHCMS_ENDPOINT, GRAPHCMS_MUTATION_TOKEN, DEPLOY_URL, SNIPCART_SECRET_API_KEY } = process.env;

  const turndownService = new TurndownService();

  try {
    const { id, name, description, price, handle, image_url, min_players, max_players, min_playtime, max_playtime, min_age, mechanics, categories } = JSON.parse(event.body);

    const graphcms = new GraphQLClient(
      GRAPHCMS_ENDPOINT,
      {
        headers: {
          authorization: `Bearer ${GRAPHCMS_MUTATION_TOKEN}`,
        }
      }
    );

    const slug = handle.split('-').filter(item => item !== '').join('-');

    const { createProduct } = await graphcms.request(
      `mutation createGame(
        $name: String,
        $slug: String,
        $boardgameatlasId: String,
        $description: String,
        $price: Float,
        $imageUrl: String,
        $minPlaytime: Int,
        $maxPlaytime: Int,
        $minPlayers: Int,
        $maxPlayers: Int,
        $minAge: Int,
        $mechanics: [MechanicWhereUniqueInput!],
        $categories: [CategoryWhereUniqueInput!]
      ) {
        createProduct(data: {localizations: {create: {data: {
            name: $name,
            description: $description
          }, locale: en}},
          name: $name,
          slug: $slug,
          boardgameatlasId: $boardgameatlasId,
          price: $price,
          imageUrl: $imageUrl,
          minPlaytime: $minPlaytime,
          maxPlaytime: $maxPlaytime,
          minPlayers: $minPlayers,
          maxPlayers: $maxPlayers,
          minAge: $minAge,
          mechanics: {connect: $mechanics},
          categories: {connect: $categories}
        }) {
          id
        }
      }`,
      {
        name,
        slug,
        boardgameatlasId: id,
        description: turndownService.turndown(description),
        price: Number(price),
        imageUrl: image_url,
        minPlaytime: min_playtime,
        maxPlaytime: max_playtime,
        minPlayers: min_players,
        maxPlayers: max_players,
        minAge: min_age,
        mechanics: mechanics.map(mechanic => ({ boardgameatlasId: mechanic.id })),
        categories: categories.map(category => ({ boardgameatlasId: category.id })),
      }
    );

    await fetch('https://app.snipcart.com/api/products', {
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
      body: JSON.stringify(createProduct),
    };
  }
  catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
}

module.exports = { handler };
