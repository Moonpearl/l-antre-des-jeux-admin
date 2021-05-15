const { GraphQLClient } = require('graphql-request');
const TurndownService = require('turndown');

const handler = async (event) => {
  const { GRAPHCMS_ENDPOINT, GRAPHCMS_MUTATION_TOKEN } = process.env;

  const turndownService = new TurndownService();

  try {
    const {
      boardgameatlasId,
      slug,
      name,
      description,
      price,
      imageUrl,
      minPlayers,
      maxPlayers,
      minPlaytime,
      maxPlaytime,
      minAge,
      lastReportedStock,
      mechanics,
      categories,
      variants,
      ebpId,
      ebpName,
      shelf,
    } = JSON.parse(event.body);

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
        $lastReportedStock: Int,
        $mechanics: [MechanicWhereUniqueInput!],
        $categories: [CategoryWhereUniqueInput!],
        $variants: [ProductVariantCreateInput!],
        $shelf: ShelfWhereUniqueInput!
      ) {
        createProduct(data: {localizations: {create: {data: {
            name: $name,
            description: $description
          }, locale: en}},
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
          lastReportedStock: $lastReportedStock,
          mechanics: {connect: $mechanics},
          categories: {connect: $categories},
          productVariants: {create: $variants},
          shelf: {connect: $shelf}
        }) {
          id
        }
      }`,
      {
        name,
        slug,
        boardgameatlasId,
        ebpId,
        ebpName,
        description: turndownService.turndown(description),
        price: Number(price),
        imageUrl,
        minPlayers,
        maxPlayers,
        minPlaytime,
        maxPlaytime,
        minAge,
        lastReportedStock,
        mechanics: mechanics.map(mechanic => ({ boardgameatlasId: mechanic.id })),
        categories: categories.map(category => ({ boardgameatlasId: category.id })),
        variants: variants.map(({ name, priceModifier }) => ({ name, priceModifier })),
        shelf: { id: shelf.id },
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
