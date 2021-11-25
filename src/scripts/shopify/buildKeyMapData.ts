import stateManager from './stateManager';

function fetchData(keyMapData: Object) {
  return fetch('https://api.pinmaps.co.uk/preview', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(keyMapData)
  })
}

function renderKeyMapType(type: string) {
  const typeArray = type.split(',')

  if (typeArray.length > 1) return typeArray[1]

  return type
}

async function renderKeyMap(keyMapData: any) {
  const type = renderKeyMapType(keyMapData.type)
  const data = await fetchData({ ...keyMapData, type });
  const response = await data.blob();
  const reader = new FileReader();

  reader.readAsDataURL(response);
  reader.onloadend = () => stateManager.keyMapCreated(reader.result as string);
}

function formatColor(color: string) {
  switch (color) {
    case '#F8C3D3':
      return 'Pink';
    case '#84B6F9':
      return 'Light Blue';
    case '#538B65':
      return 'Green';
    case '#9D89E6':
      return 'Purple';
    case '#FFFFFF':
      return 'White';
    case '#EDD771':
      return 'Yellow';
    case '#DE3947':
      return 'Red';
    case '#475A88':
      return 'Blue';
    case '#ED8733':
      return 'Orange';
    default:
      return 'Black';
  }
}

function formatPins(pin: any) {
  const title = pin.title ? ` - ${pin.title}` : '';

  return `${formatColor(pin.color)}${title}`;
}

function buildPropertyData(product: HTMLElement, keyMapData: any) {
  const basketButton = product.querySelector('[data-add-to-basket]');
  const pins = keyMapData.labels.map(formatPins).join(' || ');
  const propertyData = [
    { key: 'Title', value: keyMapData.title },
    { key: 'Size', value: keyMapData.frameSize },
    { key: 'Pins', value: pins },
    { key: 'Type', value: keyMapData.type },
    { key: 'Frame', value: keyMapData.frame }
  ]

  if (basketButton === null) return;

  const customAttributes = JSON.stringify(propertyData);

  basketButton.setAttribute('data-variant-options', customAttributes);
}

function buildLabelsData(color: FormDataEntryValue, keys: Array<FormDataEntryValue>, showKeyText: string) {
  const colorIndex = parseInt(color.toString().split('-')[1], 10);
  const hex = color.toString().split('-')[0];

  return {
    color: hex,
    title: showKeyText === 'yes' ? keys[colorIndex] : '',
    order: colorIndex
  }
}

function buildKeyMapData(product: HTMLElement, formdata: FormData, target: HTMLButtonElement | null) {
  const type = product.getAttribute('data-product-color');
  const size = formdata.get('size')?.toString().split(' (')[0].toLowerCase();
  const title = formdata.get('title');
  const frame = formdata.get('frame');
  const colors = formdata.getAll('colors');
  const showKeyText = formdata.get('show key text') as string;
  const keys = formdata.getAll('pin label');
  const labels = colors
    .map((color) => buildLabelsData(color, keys, showKeyText))
    .sort((a: any, b: any) => a.order - b.order);

  const keyMapData = {
    title,
    frameSize: size === 'x-large' ? 'extraLarge' : size,
    labels,
    type,
    frame
  };

  renderKeyMap(keyMapData);
  buildPropertyData(product, keyMapData);
  stateManager.showKeyMapModal(target as HTMLButtonElement);
}

export default buildKeyMapData;
