import { SearchClient } from 'algoliasearch/lite';

interface SearchResultTypes {
  objectID: string,
  title?: string,
  url?: string,
  image?: string
}

function Search(input: HTMLInputElement) {
  const results: Element | null = input.nextElementSibling;
  const status = results?.nextElementSibling;

  function renderResult(hit: SearchResultTypes) {
    const image = hit.image;

    if (!results) return;

    results.innerHTML += `
      <li class="flex flex-wrap justify-between items-center mb-16">
        <div class="mr-16 flex-1">
          <picture class="ratio-1-1 relative block bg-grey-fade">
            <source  type="image/webp" srcset="${image}_150x150.jpg.webp 1x, ${image}_300x300.jpg.webp 2x">

            <img class="absolute w-full h-full top-0 left-0 object-cover" srcset="${image}_150x150.jpg 1x, ${image}_300x300.jpg 2x" role="presentation" width="100" height="100" loading="lazy">
          </picture>
        </div>
        <a href="${hit.url}" class="text-xs leading-xs fvs-md text-grey flex-3" tabindex="0" data-search-result-link>${hit.title}</a>
      </li>
    `
  }

  function handleSearchResults(hits: SearchResultTypes[]) {
    if (status?.hasAttribute('data-search-results-status')) {
      status.textContent = `${hits.length} results found`;
    }

    if (hits.length > 0 && results?.hasAttribute('data-search-results')) {
      results.innerHTML = '';
      hits.forEach(renderResult);
    }

    if (hits.length === 0 && results?.hasAttribute('data-search-results')) {
      results.innerHTML = `<li class="text-xs leading-xs fvs-md flex flex-wrap justify-between items-center text-grey">No results found</li>`
    }
  }

  function searchItem(module: any, value: string) {
    const search: Function = module.default;
    const client: SearchClient = search('9R4CE6G9A3', '6e7ae6646b1c8ffe5fa627f46c476d99');
    const index = client.initIndex('docsearch__luna');
    const params = { attributesToRetrieve: ['title', 'url', 'image'] };

    index.search(value, params).then(({ hits }) => handleSearchResults(hits));
  }

  function handleSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;

    import('algoliasearch/lite').then(module => searchItem(module, value));
  }

  function handleFocus(event: FocusEvent) {
    const target = event.target as HTMLInputElement;
    const value = target.value;

    if (value !== '') {
      import('algoliasearch/lite').then(module => searchItem(module, value));
    }
  }

  function removeResults(event: FocusEvent) {
    const relatedTarget = event.relatedTarget as HTMLElement;

    if (relatedTarget && relatedTarget.hasAttribute('data-search-result-link') || relatedTarget && relatedTarget.hasAttribute('data-search-results')) return;

    if (results?.hasAttribute('data-search-results')) {
      results.innerHTML = '';
    }
  }

  function init() {
    input.addEventListener('input', handleSearch);
    input.addEventListener('focus', handleFocus);
    input.addEventListener('blur', removeResults);
  }

  return {
    init
  }
}

export default Search;
