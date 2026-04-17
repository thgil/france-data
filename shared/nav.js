// Injects the shared masthead into every story page.
// Usage: <script src="[path]/shared/nav.js" defer></script>

(function () {
  const mount = document.getElementById('masthead');
  if (!mount) return;

  // Derive the site root from this script's own src (works on GitHub Pages
  // where the site lives at /repo-name/ instead of /).
  const navScript = document.currentScript
    || document.querySelector('script[src*="nav.js"]');
  const rootUrl = navScript
    ? navScript.src.replace(/shared\/nav\.js.*$/, '')
    : './';

  const now = new Date();
  const month = now.toLocaleString('en-US', { month: 'short' });
  const year = now.getFullYear();

  mount.className = 'masthead';
  mount.innerHTML = `
    <a href="${rootUrl}" class="wordmark">France, by the numbers</a>
    <span class="meta">${month} ${year}</span>
  `;
})();
