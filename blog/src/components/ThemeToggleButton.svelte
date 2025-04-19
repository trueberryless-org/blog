<script>
  const rootEl = typeof document !== 'undefined' ? document.documentElement : null;
  let theme = 'dark';

  // Check localStorage or system preference
  if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
    theme = localStorage.getItem('theme');
  } else if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches) {
    theme = 'light';
  }

  $: {
    // Update root class based on theme
    if (rootEl) {
      if (theme === 'dark') {
        rootEl.classList.add('theme-dark');
        rootEl.classList.remove('theme-light');
      } else {
        rootEl.classList.remove('theme-dark');
        rootEl.classList.add('theme-light');
      }
    }
    // Save theme to localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
  }

  function toggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark';
  }
</script>

<button class="theme-toggle" on:click={toggleTheme} aria-label="Toggle theme" title="Toggle theme">
  {#if theme === 'dark'}
  <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m18 2 .6 1.2.6 1 .5.6 1 .6L22 6l-1.2.6-1 .6a3 3 0 0 0-.6.5l-.6 1L18 10l-.6-1.2-.6-1a3 3 0 0 0-.5-.6l-1-.6L14 6l1.2-.6 1-.6.6-.5.6-1L18 2ZM21 13.4A7.6 7.6 0 1 1 10.6 3 9.5 9.5 0 1 0 21 13.4Z"/></svg>
  {:else}
  <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2v2m0 16v2M4 12H2m4.3-5.7L5 5m12.8 1.4L19 5M6.3 17.7 5 19m12.8-1.4L19 19M22 12h-2m-3 0a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z"/></svg>
  {/if}
</button>

<style>
  .theme-toggle {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: currentColor;
    margin: 0;
  }
</style>
