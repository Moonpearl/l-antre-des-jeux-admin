const { GraphQLClient, gql } = require("graphql-request");
const TurndownService = require("turndown");

const updateGameQuery = gql`
  mutation updateGame($ebpId: String, $lastReportedStock: Int) {
    updateProduct(
      where: { ebpId: $ebpId }
      data: { lastReportedStock: $lastReportedStock }
    ) {
      id
    }
  }
`;

const handler = async (event) => {
  const { GRAPHCMS_ENDPOINT, GRAPHCMS_MUTATION_TOKEN } = process.env;

  const turndownService = new TurndownService();

  try {
    const { ebpId, lastReportedStock } = JSON.parse(event.body);

    const graphcms = new GraphQLClient(GRAPHCMS_ENDPOINT, {
      headers: {
        authorization: `Bearer ${GRAPHCMS_MUTATION_TOKEN}`,
      },
    });

    const { updateProduct } = await graphcms.request(updateGameQuery, {
      ebpId,
      lastReportedStock,
    });

    return {
      statusCode: 200,
      "Content-Type": "application/json",
      body: JSON.stringify(updateProduct),
    };
  } catch (error) {
    return {
      statusCode: 500,
      "Content-Type": "application/json",
      body: error.toString(),
    };
  }
};

module.exports = { handler };
