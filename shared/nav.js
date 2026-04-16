// Injects the shared masthead into every story page.
// Usage: <script src="/shared/nav.js" defer></script> at the top of <body>.

(function () {
  const mount = document.getElementById('masthead');
  if (!mount) return;

  const now = new Date();
  const month = now.toLocaleString('en-US', { month: 'short' });
  const year = now.getFullYear();

  mount.className = 'masthead';
  mount.innerHTML = `
    <a href="/" class="wordmark">France, by the numbers</a>
    <span class="meta">${month} ${year}</span>
  `;
})();
