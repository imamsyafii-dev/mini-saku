<script setup lang="ts">
const transactionForm = ref<{ focusDescription: () => void } | null>(null)

const {
  activeTransactionFilter,
  transactions,
  deletionStatus,
  totalIncome,
  totalExpense,
  balance,
  filteredTransactions,
  addTransaction,
  removeTransaction,
} = useTransactions()

function handleRemoveTransaction(id: string) {
  removeTransaction(id, () => transactionForm.value?.focusDescription())
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
      @delete="handleRemoveTransaction"
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
