<template>
  <section class="about-page" aria-labelledby="about-title">
    <p class="eyebrow">TENTANG APLIKASI</p>
    <h1 id="about-title">Mini Saku</h1>

    <p>
      Mini Saku adalah aplikasi latihan pencatat keuangan pribadi yang dibuat
      dengan Vue dan Nuxt.
    </p>

    <p>
      Data transaksi tersimpan di browser perangkat ini melalui localStorage.
    </p>

    <NuxtLink to="/" class="back-link">
      Kembali ke dashboard
    </NuxtLink>
  </section>
</template>

<style scoped>
.about-page {
  min-height: calc(100vh - 65px);
  max-width: 42rem;
  margin: 0 auto;
  padding: 4rem 1.5rem;
  color: #1d2a22;
}

.eyebrow {
  margin: 0 0 0.75rem;
  color: #527047;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.13em;
}

h1 {
  margin: 0;
  font-size: clamp(2.5rem, 10vw, 4.5rem);
  letter-spacing: -0.06em;
}

p {
  max-width: 34rem;
  color: #59645d;
  line-height: 1.7;
}

.back-link {
  display: inline-block;
  margin-top: 1rem;
  color: #24563d;
  font-weight: 800;
}
</style>