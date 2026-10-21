<script setup lang="ts">
const transactionType = ref<'income' | 'expense'>('expense')
const description = ref('')
const amount = ref<number | null>(null)
const category = ref('Makan')
const transactionDate = ref(new Date().toISOString().slice(0, 10))

const formattedAmount = computed(() => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount.value ?? 0)
})
</script>

<template>
  <main class="landing-page">
    <section class="hero" aria-labelledby="page-title">
      <p class="eyebrow">CATAT KEUANGANMU</p>
      <h1 id="page-title">Mini Saku</h1>
      <p class="description">
        Teman sederhana untuk melihat kondisi keuanganmu setiap hari.
        Mulai dari langkah kecil, untuk rencana yang lebih tenang.
      </p>
    </section>

    <section class="balance-card" aria-label="Ringkasan saldo">
      <div class="card-header">
        <span>Saldo tersedia</span>
        <span class="wallet-icon" aria-hidden="true">⌁</span>
      </div>
      <p class="balance">Rp0</p>
      <p class="balance-note">Belum ada transaksi hari ini</p>
    </section>

    <section class="transaction-form" aria-labelledby="form-title">
      <div>
        <p class="eyebrow">TRANSAKSI BARU</p>
        <h2 id="form-title">Isi transaksi pertama</h2>
      </div>

      <form @submit.prevent>
        <label>
          Jenis transaksi
          <select v-model="transactionType">
            <option value="expense">Pengeluaran</option>
            <option value="income">Pemasukan</option>
          </select>
        </label>

        <label>
          Keterangan
          <input v-model="description" type="text" placeholder="Contoh: Makan siang" />
        </label>

        <label>
          Nominal
          <input v-model.number="amount" type="number" min="0" placeholder="25000" />
        </label>

        <label>
          Kategori
          <input v-model="category" type="text" />
        </label>

        <label>
          Tanggal
          <input v-model="transactionDate" type="date" />
        </label>
      </form>

      <p class="draft-preview">
        Draft: {{ transactionType === 'income' ? 'Pemasukan' : 'Pengeluaran' }}
        {{ description || 'tanpa keterangan' }} sebesar {{ formattedAmount }}.
      </p>
    </section>

    <p class="encouragement">Yuk, mulai catat pemasukan dan pengeluaranmu.</p>
  </main>
</template>

<style scoped>
:global(*) {
  box-sizing: border-box;
}

:global(body) {
  min-width: 320px;
  margin: 0;
  background: #f7f7f2;
  color: #1d2a22;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.landing-page {
  display: grid;
  align-content: center;
  min-height: 100vh;
  max-width: 42rem;
  margin: 0 auto;
  padding: 3rem 1.5rem;
}

.hero {
  max-width: 34rem;
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
  font-size: clamp(2.8rem, 11vw, 4.75rem);
  letter-spacing: -0.065em;
  line-height: 0.96;
}

.description {
  max-width: 31rem;
  margin: 1.25rem 0 2.5rem;
  color: #59645d;
  font-size: 1.05rem;
  line-height: 1.65;
}

.balance-card {
  padding: 1.5rem;
  overflow: hidden;
  border-radius: 1.5rem;
  background: #24563d;
  box-shadow: 0 20px 45px rgba(30, 74, 50, 0.2);
  color: #fffdf5;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #dce9d7;
  font-size: 0.95rem;
  font-weight: 650;
}

.wallet-icon {
  display: grid;
  width: 2.25rem;
  height: 2.25rem;
  place-items: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  color: #f4d96f;
  font-size: 1.5rem;
  font-weight: 800;
}

.balance {
  margin: 2.5rem 0 0.25rem;
  font-size: clamp(2.6rem, 10vw, 4rem);
  font-weight: 750;
  letter-spacing: -0.055em;
  line-height: 1;
}

.balance-note {
  margin: 0;
  color: #c3d7c1;
  font-size: 0.88rem;
}

.encouragement {
  margin: 1.5rem 0 0;
  color: #65716a;
  font-size: 0.94rem;
  text-align: center;
}

@media (min-width: 640px) {
  .landing-page {
    padding: 5rem 2.5rem;
  }

  .balance-card {
    padding: 2rem;
  }
}

.transaction-form {
  display: grid;
  gap: 1.25rem;
  margin-top: 2rem;
  padding: 1.5rem;
  border: 1px solid #dce4d8;
  border-radius: 1.5rem;
  background: #fffdf8;
}

h2 {
  margin: 0.25rem 0 0;
  font-size: 1.35rem;
}

form {
  display: grid;
  gap: 1rem;
}

label {
  display: grid;
  gap: 0.45rem;
  color: #334139;
  font-size: 0.9rem;
  font-weight: 700;
}

input,
select {
  width: 100%;
  padding: 0.8rem 0.9rem;
  border: 1px solid #cbd7c6;
  border-radius: 0.75rem;
  background: white;
  color: #1d2a22;
  font: inherit;
}

.draft-preview {
  margin: 0;
  color: #5b685f;
  line-height: 1.6;
}
</style>
