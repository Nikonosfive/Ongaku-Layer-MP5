const addResourcesToCache = async (resources) => {
  const cache = await caches.open("v1");
  await cache.addAll(resources);
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    addResourcesToCache([
      "/",
      "index.html",
      "manifest.json",
      "style.css",
      "script.js"
      "img/logo.ico"
      "img/logo_144.png"
      "img/logo_192.png"
      "img/logo_96.png"
      "img/logo_512.png"
      "img/logo.svg"
    ]),
  );
});
