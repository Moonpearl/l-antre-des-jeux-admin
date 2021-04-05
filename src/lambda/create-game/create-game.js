const { GraphQLClient } = require('graphql-request');
const TurndownService = require('turndown');

const handler = async (event) => {
  const { GRAPHCMS_ENDPOINT, GRAPHCMS_MUTATION_TOKEN } = process.env;

  const turndownService = new TurndownService();

  try {
    const {
      id,
      name,
      description,
      price,
      handle,
      image_url,
      min_players,
      max_players,
      min_playtime,
      max_playtime,
      min_age,
      mechanics,
      categories,
      ebpId,
      ebpName,
      stock,
    } = JSON.parse(event.body);

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
        $stock: Int,
        $ebpName: String,
        $name: String,
        $slug: String!,
        $boardgameatlasId: String,
        $ebpId: String!,
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
          lastReportedStock: $stock,
          name: $ebpName,
          slug: $slug,
          boardgameatlasId: $boardgameatlasId,
          ebpId: $ebpId,
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
        ebpId,
        ebpName,
        stock,
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
