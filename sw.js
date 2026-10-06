// Service worker minimo: existe para o Chrome do Android instalar o painel como
// app (e assim ele aparecer no "Compartilhar" do WhatsApp). NAO guarda nada em
// cache: pendencia e dinheiro de cliente lidos de cache velho levariam a erro.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
