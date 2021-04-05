const parser = require('lambda-multipart-parser');
const Papa = require('papaparse');
const { StringDecoder } = require('string_decoder');

const handler = async (event) => {
  const parser = require('lambda-multipart-parser');

  const { files } = await parser.parse(event);
  const file = files[0];

  // TODO Fix source file encoding issue
  const decoder = new StringDecoder('latin1');
  const parsed = Papa.parse(decoder.write(file.content));

  const result = parsed.data.map(item => ({
    ebpId: item[0],
    name: item[1],
    code: item[2],
    price: item[4] && Number(item[4].replace(',', '.')),
    barCode: item[7],
    stock: Number(item[9]),
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
