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

    <TransactionHistory
      :transactions="transactions"
      :filtered-transactions="filteredTransactions"
      :active-filter="activeTransactionFilter"
      :deletion-status="deletionStatus"
      @select-filter="activeTransactionFilter = $event"
      @delete="removeTransaction"
    />

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

@media (max-width: 420px) {
  .landing-page {
    padding: 2.25rem 1rem;
  }
}
</style>
