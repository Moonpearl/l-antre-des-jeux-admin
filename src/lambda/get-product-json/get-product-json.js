const { GraphQLClient } = require("graphql-request");

const handler = async (event, context) => {
  console.log({ event, context });

  const { GRAPHCMS_ENDPOINT, GRAPHCMS_MUTATION_TOKEN } = process.env;

  try {
    const { slug } = event.queryStringParameters;
    const graphcms = new GraphQLClient(GRAPHCMS_ENDPOINT, {
      headers: {
        authorization: `Bearer ${GRAPHCMS_MUTATION_TOKEN}`,
      },
    });

    const { product } = await graphcms.request(
      `query ProductJsonQuery(
        $slug: String!
      ) {
        product(where: {slug: $slug}, stage: DRAFT) {
          ebpId
          name
          price
          imageUrl
          lastReportedStock
          description
          productVariants {
            name
            priceModifier
          }
        }
      }`,
      {
        slug,
      }
    );

    const { productVariants } = product;

    const url = new URL(event.path, process.env.SITE_URL);
    Object.entries(event.queryStringParameters).forEach(([key, value]) =>
      url.searchParams.append(key, value)
    );

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: product.ebpId,
        name: product.name,
        url: url.toString(),
        price: product.price,
        image: product.imageUrl,
        stock: product.lastReportedStock,
        description: product.description,
        inventoryManagementMethod:
          productVariants.length === 0 ? "Single" : "Variant",
        allowOutOfStockPurchases:
          productVariants.length === 0 ? false : undefined,
        variants:
          productVariants.length === 0
            ? undefined
            : [
                {
                  variation: productVariants.map((variant) => ({
                    name: "Variante",
                    option: variant.name,
                  })),
                  stock: product.lastReportedStock,
                  allowOutOfStockPurchases: true,
                },
              ],
        customFields:
          productVariants.length === 0
            ? []
            : [
                {
                  name: "Variante",
                  options: productVariants
                    .map(
                      (variant) =>
                        `${variant.name}${
                          variant.priceModifier !== 0
                            ? `[${variant.priceModifier}]`
                            : ""
                        }`
                    )
                    .join("|"),
                  type: "dropdown",
                },
              ],
      }),
    };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};

module.exports = { handler };
