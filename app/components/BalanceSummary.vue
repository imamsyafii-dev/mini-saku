<script setup lang="ts">
defineProps<{
  balance: number
  totalIncome: number
  totalExpense: number
  transactionCount: number
}>()

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}
</script>

<template>
  <section class="balance-card" aria-label="Ringkasan saldo">
    <div class="card-header">
      <span>Saldo tersedia</span>
      <span class="wallet-icon" aria-hidden="true">⌁</span>
    </div>
    <p class="balance">{{ formatCurrency(balance) }}</p>
    <p class="balance-note">
      {{ transactionCount ? `${transactionCount} transaksi tercatat` : 'Belum ada transaksi hari ini' }}
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
</template>

<style scoped>
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

@media (min-width: 640px) {
  .balance-card {
    padding: 2rem;
  }
}

@media (max-width: 420px) {
  .summary-item {
    padding: 0.85rem;
  }
}
</style>
