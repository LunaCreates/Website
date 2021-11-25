const fetch = require('node-fetch');

function containsMap(item) {
  return item.name === 'Type';
}

function buildData(item) {
  return item.properties.reduce((obj, item) => (obj[item.name.toLowerCase()] = item.value, obj), {});
}

function formatColor(color) {
  switch (color) {
    case 'Pink':
      return '#F8C3D3';
    case 'Light Blue':
      return '#84B6F9';
    case 'Green':
      return '#538B65';
    case 'Purple':
      return '#9D89E6';
    case 'White':
      return '#FFFFFF';
    case 'Yellow':
      return '#EDD771';
    case 'Red':
      return '#DE3947';
    case 'Blue':
      return '#475A88';
    case 'Orange':
      return '#ED8733';
    default:
      return '#000000';
  }
}

function formatLabels(item) {
  const property = item.split(' - ');
  const color = formatColor(property[0]);
  const title = property.length > 1 ? property[1] : '';

  return { color, title };
}

function formatType(type) {
  if (type.includes('americanstatesblack')) {
    return 'americanStatesBlack'
  }

  if (type.includes('americanstateswhite')) {
    return 'americanStatesWhite'
  }

  return type
}

function formatData(item) {
  const labels = item.pins.split(' || ').map(formatLabels);
  const type = formatType(item.type)

  item.labels = { ...labels };
  item.frameSize = item.size;
  item.type = type

  delete item.pins;
  delete item.size;
  delete item.frame;

  return item;
}

function formatResultData(item) {
  return { properties: [{ name: 'map', value: { ...item } }] };
}

exports.handler = async (event) => {
  const data = JSON.parse(event.body);
  const items = data.line_items;
  const isMap = items.some(item => item.properties.some(containsMap));

  console.log(event.body, 'body');

  try {
    if (isMap) {
      const mapProps = items.filter(item => item.properties.find(containsMap));
      const mapData = mapProps.map(buildData);
      const formattedMapData = mapData.map(formatData);
      const result = formattedMapData.map(formatResultData);
      const body = { line_items: result };

      await fetch('https://api.pinmaps.co.uk/generate', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(body)
      })
    }

    return {
      statusCode: 200,
    }
  } catch (error) {
    console.log(error)
  }
}
