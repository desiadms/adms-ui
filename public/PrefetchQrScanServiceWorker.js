const addResourcesToCache = async (resources) => {
  const cache = await caches.open("v1");
  await cache.addAll(resources);
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    addResourcesToCache([
      "https://fastly.jsdelivr.net/npm/zxing-wasm@1.2.11/dist/reader/zxing_reader.wasm",
    ]),
  );
});
