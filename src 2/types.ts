// Central types file that re-exports from dummyData
// This allows components to import from '../types' instead of '../data/dummyData'

export type {
  Client,
  LoanProduct,
  Loan,
  LoanDocument,
  LoanApproval,
  LoanRestructure,
  Payment,
  Installment,
} from './data/dummyData';