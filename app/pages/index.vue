<script setup lang="ts">
import type { Transaction, TransactionDraft, TransactionFilter } from '~/types/transaction'

const TRANSACTIONS_STORAGE_KEY = 'mini-saku-transactions'
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const activeTransactionFilter = ref<TransactionFilter>('all')

const transactions = ref<Transaction[]>([])
const hasLoadedTransactions = ref(false)
const deletionStatus = ref('')
const transactionForm = ref<{ focusDescription: () => void } | null>(null)

function isValidTransactionDate(value: string) {
  if (!DATE_PATTERN.test(value)) {
    return false
  }

  const parsedDate = new Date(`${value}T00:00:00Z`)

  return !Number.isNaN(parsedDate.getTime())
    && parsedDate.toISOString().slice(0, 10) === value
}

function isTransaction(value: unknown): value is Transaction {
  if (!value || typeof value !== 'object') {
    return false
  }

  const transaction = value as Record<string, unknown>

  return typeof transaction.id === 'string'
    && transaction.id.trim().length > 0
    && (transaction.type === 'income' || transaction.type === 'expense')
    && typeof transaction.description === 'string'
    && transaction.description.trim().length > 0
    && typeof transaction.amount === 'number'
    && Number.isFinite(transaction.amount)
    && transaction.amount > 0
    && typeof transaction.category === 'string'
    && transaction.category.trim().length > 0
    && typeof transaction.date === 'string'
    && isValidTransactionDate(transaction.date)
}

onMounted(() => {
  let shouldRemoveStoredTransactions = false
  let shouldSanitizeStoredTransactions = false

  try {
    const storedTransactions = window.localStorage.getItem(TRANSACTIONS_STORAGE_KEY)

    if (storedTransactions !== null) {
      const parsedTransactions: unknown = JSON.parse(storedTransactions)

      if (Array.isArray(parsedTransactions)) {
        const validTransactions = parsedTransactions.filter(isTransaction)

        transactions.value = validTransactions
        shouldSanitizeStoredTransactions = validTransactions.length !== parsedTransactions.length
      } else {
        shouldRemoveStoredTransactions = true
      }
    }
  } catch {
    shouldRemoveStoredTransactions = true
  } finally {
    hasLoadedTransactions.value = true

    try {
      if (shouldRemoveStoredTransactions) {
        window.localStorage.removeItem(TRANSACTIONS_STORAGE_KEY)
      } else if (shouldSanitizeStoredTransactions) {
        window.localStorage.setItem(
          TRANSACTIONS_STORAGE_KEY,
          JSON.stringify(transactions.value),
        )
      }
    } catch {
      // Keep the in-memory transactions usable when storage is unavailable.
    }
  }
})

watch(
  transactions,
  (updatedTransactions) => {
    if (!hasLoadedTransactions.value) {
      return
    }

    try {
      window.localStorage.setItem(
        TRANSACTIONS_STORAGE_KEY,
        JSON.stringify(updatedTransactions),
      )
    } catch {
      // Keep the in-memory transactions usable when storage is unavailable.
    }
  },
  { deep: true },
)

function removeTransaction(id: string) {
  const transaction = transactions.value.find((item) => item.id === id)

  if (!transaction || !window.confirm(`Hapus transaksi "${transaction.description}"?`)) {
    return
  }

  transactions.value = transactions.value.filter(
    (transaction) => transaction.id !== id,
  )
  deletionStatus.value = `Transaksi ${transaction.description} berhasil dihapus. ${transactions.value.length} transaksi tersisa.`

  nextTick(() => transactionForm.value?.focusDescription())
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

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

const filteredTransactions = computed(() => {
  if (activeTransactionFilter.value === 'all') {
    return transactions.value
  }

  return transactions.value.filter(
    (transaction) => transaction.type === activeTransactionFilter.value,
  )
})

function formatDate(date: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

function addTransaction(draft: TransactionDraft) {
  transactions.value.unshift({
    id: crypto.randomUUID(),
    ...draft,
  })
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

    <BalanceSummary
      :balance="balance"
      :total-income="totalIncome"
      :total-expense="totalExpense"
      :transaction-count="transactions.length"
    />

    <TransactionForm
      ref="transactionForm"
      :transaction-count="transactions.length"
      @submit="addTransaction"
    />

    <section class="transaction-history" aria-labelledby="history-title">
      <p class="sr-only" role="status" aria-live="polite">{{ deletionStatus }}</p>
      <div class="section-heading">
        <div>
          <p class="eyebrow">RIWAYAT</p>
          <h2 id="history-title">Transaksi terbaru</h2>
        </div>
        <span v-if="transactions.length" class="transaction-count">{{ transactions.length }}</span>
      </div>

      <div class="transaction-filters" aria-label="Filter riwayat transaksi">
        <button
          type="button"
          class="filter-button"
          :class="{ active: activeTransactionFilter === 'all' }"
          :aria-pressed="activeTransactionFilter === 'all'"
          @click="activeTransactionFilter = 'all'"
        >
          Semua
        </button>
        <button
          type="button"
          class="filter-button"
          :class="{ active: activeTransactionFilter === 'income' }"
          :aria-pressed="activeTransactionFilter === 'income'"
          @click="activeTransactionFilter = 'income'"
        >
          Pemasukan
        </button>
        <button
          type="button"
          class="filter-button"
          :class="{ active: activeTransactionFilter === 'expense' }"
          :aria-pressed="activeTransactionFilter === 'expense'"
          @click="activeTransactionFilter = 'expense'"
        >
          Pengeluaran
        </button>
      </div>

      <p v-if="!transactions.length" class="empty-state">
        Belum ada transaksi. Catat transaksi pertamamu di atas.
      </p>
      <p v-else-if="!filteredTransactions.length" class="empty-state">
        Belum ada transaksi {{ activeTransactionFilter === 'income' ? 'pemasukan' : 'pengeluaran' }}.
      </p>
      <ul v-else class="history-list">
        <li v-for="transaction in filteredTransactions" :key="transaction.id" class="history-item">
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

}

h2 {
  margin: 0.25rem 0 0;
  font-size: 1.35rem;
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

.transaction-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.filter-button {
  flex: 1 1 auto;
  padding: 0.6rem 0.75rem;
  border: 1px solid #cbd7c6;
  border-radius: 999px;
  background: #fffdf8;
  color: #526058;
  font-size: 0.82rem;
}

.filter-button:hover {
  background: #e5eee2;
}

.filter-button.active,
.filter-button.active:hover {
  border-color: #24563d;
  background: #24563d;
  color: #fffdf5;
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

  .transaction-filters {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .filter-button {
    min-width: 0;
    padding: 0.6rem 0.4rem;
    font-size: 0.75rem;
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
