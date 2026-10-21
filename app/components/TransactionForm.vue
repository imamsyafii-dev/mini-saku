<script setup lang="ts">
import type { TransactionDraft, TransactionType } from '~/types/transaction'

defineProps<{
  transactionCount: number
}>()

const emit = defineEmits<{
  submit: [draft: TransactionDraft]
}>()

const transactionType = ref<TransactionType>('expense')
const description = ref('')
const amount = ref<number | null>(null)
const category = ref('Makan')
const transactionDate = ref(new Date().toISOString().slice(0, 10))
const formError = ref('')
const descriptionInput = ref<HTMLInputElement | null>(null)

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

const formattedAmount = computed(() => formatCurrency(amount.value ?? 0))

function submitTransaction() {
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

  emit('submit', {
    type: transactionType.value,
    description: cleanDescription,
    amount: transactionAmount,
    category: category.value.trim() || 'Lainnya',
    date: transactionDate.value,
  })

  description.value = ''
  amount.value = null
}

function focusDescription() {
  descriptionInput.value?.focus()
}

defineExpose({ focusDescription })
</script>

<template>
  <section class="transaction-form" aria-labelledby="form-title">
    <div>
      <p class="eyebrow">TRANSAKSI BARU</p>
      <h2 id="form-title">Isi transaksi pertama</h2>
    </div>

    <form @submit.prevent="submitTransaction">
      <label>
        Jenis transaksi
        <select v-model="transactionType">
          <option value="expense">Pengeluaran</option>
          <option value="income">Pemasukan</option>
        </select>
      </label>

      <label>
        Keterangan
        <input ref="descriptionInput" v-model="description" type="text" placeholder="Contoh: Makan siang">
      </label>

      <label>
        Nominal
        <input v-model.number="amount" type="number" min="0" placeholder="25000">
      </label>

      <label>
        Kategori
        <input v-model="category" type="text">
      </label>

      <label>
        Tanggal
        <input v-model="transactionDate" type="date">
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
    <p v-if="transactionCount" class="success-message">
      {{ transactionCount }} transaksi berhasil tersimpan sementara.
    </p>
  </section>
</template>

<style scoped>
.transaction-form {
  display: grid;
  gap: 1.25rem;
  margin-top: 2rem;
  padding: 1.5rem;
  border: 1px solid #dce4d8;
  border-radius: 1.5rem;
  background: #fffdf8;
}

.eyebrow {
  margin: 0 0 0.75rem;
  color: #527047;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.13em;
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

.draft-preview {
  margin: 0;
  color: #5b685f;
  line-height: 1.6;
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
</style>
