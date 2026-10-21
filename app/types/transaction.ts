export type TransactionType = 'income' | 'expense'

export type TransactionFilter = 'all' | TransactionType

export interface Transaction {
  id: string
  type: TransactionType
  description: string
  amount: number
  category: string
  date: string
}

export interface TransactionDraft {
  type: TransactionType
  description: string
  amount: number
  category: string
  date: string
}
