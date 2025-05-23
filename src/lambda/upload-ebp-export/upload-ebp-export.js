const parser = require('lambda-multipart-parser');
const Papa = require('papaparse');
const { StringDecoder } = require('string_decoder');

const parsePrice = price => price ? Number(price.replace(',', '.')) : 0;

const handler = async (event) => {
  const parser = require('lambda-multipart-parser');

  const { files } = await parser.parse(event);
  const file = files[0];

  // TODO Fix source file encoding issue
  const decoder = new StringDecoder('latin1');
  const parsed = Papa.parse(decoder.write(file.content));
  const _headers = parsed.data.shift();

  const result = parsed.data.map(item => ({
    ebpId: item[0],
    name: item[1],
    family: item[2],
    provider: item[3],
    barCode: item[4],
    stock: Math.max(0, parsePrice(item[5])),
    buyingPrice: parsePrice(item[6]),
    price: parsePrice(item[7]),
    taxRate: parsePrice(item[8]),
    type: item[9],
  }));

  if (parsed.errors.length === 0) {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result),
    }
  } else {
    return { statusCode: 500, body: JSON.stringify(parsed.errors) };
  }
}

module.exports = { handler };
