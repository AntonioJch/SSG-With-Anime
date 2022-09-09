const CACHE_NAME = 'app-v1'

self.addEventListener('fetch', myCustomFetch)
self.addEventListener('active', clearCache)

function myCustomFetch(event) {
  const answer = cacheOrEvent(event)
  event.respondWith(answer)
}

async function cacheOrEvent(event) {
  // event.request contiene la informacion del request, -> la url
  // 1. Verifivar la respuesta que necesitamos ya se encuentra en el cache
  let answer = await caches.match(event.request)

  // 2. Si es cierto, retornamos la respuesta desde el cache > end
  if (answer) {
    return answer
  }

  // 3. Si no, hacemos un fetch al servidor para obtener la respuesta
  answer = await fetch(event.request)
  // respuesta no es valida > end
  if (
    !answer ||
    answer.status !== 200 ||
    answer.type !== 'basic' ||
    !isAssetCSS(event.request.url)
  ) {
    return answer
  }

  // 4. Cuanto tengamos la respuesta devuelta del sevidor, la almacenamos
  // en el cache para proximas respuestas.
  const clonedAnswer = answer.clone()
  caches.open(CACHE_NAME).then(cache => {
    cache.put(event.request, clonedAnswer) // estos parametros representa clave y valor
  })
  return answer
}

const assetsRegExp = /.png|.gif|.jpg|.jpeg|.css|.js/g
function isAssetCSS(url) {
  return assetsRegExp.test(url)
}

function clearCache(event) {
  const deletePromise = caches.delete(CACHE_NAME)
  event.waitUntil(deletePromise)
}
