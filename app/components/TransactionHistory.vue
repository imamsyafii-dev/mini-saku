<script setup lang="ts">
import type { Transaction, TransactionFilter } from '~/types/transaction'

defineProps<{
  transactions: Transaction[]
  filteredTransactions: Transaction[]
  activeFilter: TransactionFilter
  deletionStatus: string
}>()

const emit = defineEmits<{
  'select-filter': [filter: TransactionFilter]
  delete: [id: string]
}>()

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}
</script>

<template>
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
        :class="{ active: activeFilter === 'all' }"
        :aria-pressed="activeFilter === 'all'"
        @click="emit('select-filter', 'all')"
      >
        Semua
      </button>
      <button
        type="button"
        class="filter-button"
        :class="{ active: activeFilter === 'income' }"
        :aria-pressed="activeFilter === 'income'"
        @click="emit('select-filter', 'income')"
      >
        Pemasukan
      </button>
      <button
        type="button"
        class="filter-button"
        :class="{ active: activeFilter === 'expense' }"
        :aria-pressed="activeFilter === 'expense'"
        @click="emit('select-filter', 'expense')"
      >
        Pengeluaran
      </button>
    </div>

    <p v-if="!transactions.length" class="empty-state">
      Belum ada transaksi. Catat transaksi pertamamu di atas.
    </p>
    <p v-else-if="!filteredTransactions.length" class="empty-state">
      Belum ada transaksi {{ activeFilter === 'income' ? 'pemasukan' : 'pengeluaran' }}.
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
            @click="emit('delete', transaction.id)"
          >
            Hapus
          </button>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
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

h2 {
  margin: 0.25rem 0 0;
  font-size: 1.35rem;
}

.eyebrow {
  margin: 0 0 0.75rem;
  color: #527047;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.13em;
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
