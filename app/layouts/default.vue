<template>
  <div class="app-shell">
    <header class="app-header">
      <NuxtLink to="/" class="brand">Mini Saku</NuxtLink>

      <nav aria-label="Navigasi utama">
        <NuxtLink to="/" class="nav-link">Dashboard</NuxtLink>
        <NuxtLink to="/about" class="nav-link">Tentang</NuxtLink>
      </nav>
    </header>

    <div class="app-content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: #f7f7f2;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 42rem;
  margin: 0 auto;
  padding: 1rem 1.5rem;
}

.brand {
  color: #1d2a22;
  font-weight: 900;
  letter-spacing: -0.04em;
  text-decoration: none;
}

nav {
  display: flex;
  gap: 0.3rem;
}

.nav-link {
  padding: 0.45rem 0.65rem;
  border-radius: 0.55rem;
  color: #5c6a61;
  font-size: 0.88rem;
  text-decoration: none;
}

.nav-link.router-link-active {
  background: #e5eee1;
  color: #24563d;
  font-weight: 800;
}

@media (max-width: 380px) {
  .app-header {
    align-items: flex-start;
    gap: 0.75rem;
    flex-direction: column;
  }
}
</style>