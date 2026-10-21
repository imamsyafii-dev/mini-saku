<script setup lang="ts">
type TransactionType = 'income' | 'expense'

interface Transaction {
  id: string
  type: TransactionType
  description: string
  amount: number
  category: string
  date: string
}

const transactionType = ref<TransactionType>('expense')
const description = ref('')
const amount = ref<number | null>(null)
const category = ref('Makan')
const transactionDate = ref(new Date().toISOString().slice(0, 10))

const transactions = ref<Transaction[]>([])
const formError = ref('')
const deletionStatus = ref('')
const descriptionInput = ref<HTMLInputElement | null>(null)

function removeTransaction(id: string) {
  const transaction = transactions.value.find((item) => item.id === id)

  if (!transaction || !window.confirm(`Hapus transaksi "${transaction.description}"?`)) {
    return
  }

  transactions.value = transactions.value.filter(
    (transaction) => transaction.id !== id,
  )
  deletionStatus.value = `Transaksi ${transaction.description} berhasil dihapus. ${transactions.value.length} transaksi tersisa.`

  nextTick(() => descriptionInput.value?.focus())
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

const formattedAmount = computed(() => {
  return formatCurrency(amount.value ?? 0)
})

const totalIncome = computed(() => {
  return transactions.value
    .filter((transaction) => transaction.type === 'income')
    .reduce((total, transaction) => total + transaction.amount, 0)
})

const totalExpense = computed(() => {
  return transactions.value
    .filter((transaction) => transaction.type === 'expense')
    .reduce((total, transaction) => total + transaction.amount, 0)
})

const balance = computed(() => totalIncome.value - totalExpense.value)

function formatDate(date: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

function addTransaction() {
  const cleanDescription = description.value.trim()
  const transactionAmount = amount.value

  formError.value = ''

  if (!cleanDescription) {
    formError.value = 'Keterangan transaksi wajib diisi.'
    return
  }

  if (!transactionAmount || transactionAmount <= 0) {
    formError.value = 'Nominal harus lebih dari Rp0.'
    return
  }

  transactions.value.unshift({
    id: crypto.randomUUID(),
    type: transactionType.value,
    description: cleanDescription,
    amount: transactionAmount,
    category: category.value.trim() || 'Lainnya',
    date: transactionDate.value,
  })

  description.value = ''
  amount.value = null
}
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
      <p class="balance">{{ formatCurrency(balance) }}</p>
      <p class="balance-note">
        {{ transactions.length ? `${transactions.length} transaksi tercatat` : 'Belum ada transaksi hari ini' }}
      </p>
    </section>

    <section class="summary" aria-label="Ringkasan pemasukan dan pengeluaran">
      <article class="summary-item income-summary">
        <span>Pemasukan</span>
        <strong>{{ formatCurrency(totalIncome) }}</strong>
      </article>
      <article class="summary-item expense-summary">
        <span>Pengeluaran</span>
        <strong>{{ formatCurrency(totalExpense) }}</strong>
      </article>
    </section>

    <section class="transaction-form" aria-labelledby="form-title">
      <div>
        <p class="eyebrow">TRANSAKSI BARU</p>
        <h2 id="form-title">Isi transaksi pertama</h2>
      </div>

      <form @submit.prevent="addTransaction">
        <label>
          Jenis transaksi
          <select v-model="transactionType">
            <option value="expense">Pengeluaran</option>
            <option value="income">Pemasukan</option>
          </select>
        </label>

        <label>
          Keterangan
          <input ref="descriptionInput" v-model="description" type="text" placeholder="Contoh: Makan siang" />
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
        <button type="submit">Tambah transaksi</button>

        <p v-if="formError" class="form-error" role="alert">
          {{ formError }}
        </p>
      </form>

      <p class="draft-preview">
        Draft: {{ transactionType === 'income' ? 'Pemasukan' : 'Pengeluaran' }}
        {{ description || 'tanpa keterangan' }} sebesar {{ formattedAmount }}.
      </p>
      <p v-if="transactions.length" class="success-message">
        {{ transactions.length }} transaksi berhasil tersimpan sementara.
      </p>
    </section>

    <section class="transaction-history" aria-labelledby="history-title">
      <p class="sr-only" role="status" aria-live="polite">{{ deletionStatus }}</p>
      <div class="section-heading">
        <div>
          <p class="eyebrow">RIWAYAT</p>
          <h2 id="history-title">Transaksi terbaru</h2>
        </div>
        <span v-if="transactions.length" class="transaction-count">{{ transactions.length }}</span>
      </div>

      <p v-if="!transactions.length" class="empty-state">
        Belum ada transaksi. Catat transaksi pertamamu di atas.
      </p>
      <ul v-else class="history-list">
        <li v-for="transaction in transactions" :key="transaction.id" class="history-item">
          <span
            class="transaction-icon"
            :class="transaction.type"
            aria-hidden="true"
          >
            {{ transaction.type === 'income' ? '↗' : '↘' }}
          </span>
          <div class="transaction-details">
            <strong>{{ transaction.description }}</strong>
            <span>{{ transaction.category }} · {{ formatDate(transaction.date) }}</span>
          </div>
          <div class="transaction-actions">
            <strong class="transaction-amount" :class="transaction.type">
              {{ transaction.type === 'income' ? '+' : '−' }}{{ formatCurrency(transaction.amount) }}
            </strong>
            <button
              type="button"
              class="delete-transaction"
              :aria-label="`Hapus transaksi ${transaction.description}`"
              @click="removeTransaction(transaction.id)"
            >
              Hapus
            </button>
          </div>
        </li>
      </ul>
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

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
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

.summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
}

.summary-item {
  display: grid;
  gap: 0.35rem;
  padding: 1rem;
  border: 1px solid #dce4d8;
  border-radius: 1rem;
  background: #fffdf8;
}

.summary-item span {
  color: #65716a;
  font-size: 0.78rem;
  font-weight: 700;
}

.summary-item strong {
  font-size: clamp(0.95rem, 4vw, 1.15rem);
  letter-spacing: -0.03em;
}

.income-summary strong {
  color: #28704c;
}

.expense-summary strong {
  color: #b44d40;
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

button {
  padding: 0.9rem 1rem;
  border: 0;
  border-radius: 0.75rem;
  background: #24563d;
  color: #fffdf5;
  cursor: pointer;
  font: inherit;
  font-weight: 800;
}

button:hover {
  background: #1b432f;
}

.form-error {
  margin: 0;
  color: #b42318;
  font-size: 0.9rem;
}

.success-message {
  margin: 0;
  color: #2d6a46;
  font-size: 0.9rem;
  font-weight: 700;
}

.transaction-history {
  margin-top: 2rem;
}

.section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
}

.transaction-count {
  display: grid;
  width: 2rem;
  height: 2rem;
  place-items: center;
  border-radius: 50%;
  background: #e5eee2;
  color: #24563d;
  font-size: 0.8rem;
  font-weight: 800;
}

.empty-state {
  margin: 1rem 0 0;
  padding: 1.25rem;
  border: 1px dashed #cbd7c6;
  border-radius: 1rem;
  color: #65716a;
  line-height: 1.55;
  text-align: center;
}

.history-list {
  display: grid;
  gap: 0.75rem;
  margin: 1rem 0 0;
  padding: 0;
  list-style: none;
}

.history-item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid #dce4d8;
  border-radius: 1rem;
  background: #fffdf8;
}

.transaction-icon {
  display: grid;
  width: 2.25rem;
  height: 2.25rem;
  place-items: center;
  border-radius: 0.75rem;
  font-size: 1.2rem;
  font-weight: 800;
}

.transaction-icon.income {
  background: #e2f1e7;
  color: #28704c;
}

.transaction-icon.expense {
  background: #f8e7e3;
  color: #b44d40;
}

.transaction-details {
  display: grid;
  min-width: 0;
  gap: 0.2rem;
}

.transaction-details strong,
.transaction-amount {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.transaction-details span {
  overflow: hidden;
  color: #65716a;
  font-size: 0.78rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.transaction-amount {
  font-size: 0.9rem;
}

.transaction-actions {
  display: grid;
  justify-items: end;
  gap: 0.45rem;
}

.delete-transaction {
  padding: 0.35rem 0.55rem;
  border: 1px solid #e1b6ae;
  border-radius: 0.5rem;
  background: transparent;
  color: #a33f35;
  font-size: 0.78rem;
  font-weight: 800;
}

.delete-transaction:hover {
  background: #f8e7e3;
}

.transaction-amount.income {
  color: #28704c;
}

.transaction-amount.expense {
  color: #b44d40;
}

@media (max-width: 420px) {
  .landing-page {
    padding: 2.25rem 1rem;
  }

  .summary-item {
    padding: 0.85rem;
  }

  .history-item {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .transaction-actions {
    grid-column: 2;
    justify-items: start;
  }
}
</style>
