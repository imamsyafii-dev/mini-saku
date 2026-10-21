import type { Transaction, TransactionDraft, TransactionFilter } from '~/types/transaction'

const TRANSACTIONS_STORAGE_KEY = 'mini-saku-transactions'
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

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

export function useTransactions() {
  const activeTransactionFilter = ref<TransactionFilter>('all')
  const transactions = ref<Transaction[]>([])
  const hasLoadedTransactions = ref(false)
  const deletionStatus = ref('')

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

  function removeTransaction(id: string, onRemoved?: () => void) {
    const transaction = transactions.value.find((item) => item.id === id)

    if (!transaction || !window.confirm(`Hapus transaksi "${transaction.description}"?`)) {
      return
    }

    transactions.value = transactions.value.filter(
      (item) => item.id !== id,
    )
    deletionStatus.value = `Transaksi ${transaction.description} berhasil dihapus. ${transactions.value.length} transaksi tersisa.`

    nextTick(onRemoved)
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

  return {
    activeTransactionFilter,
    transactions,
    deletionStatus,
    totalIncome,
    totalExpense,
    balance,
    filteredTransactions,
    addTransaction,
    removeTransaction,
  }
}
