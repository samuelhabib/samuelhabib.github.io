import type { ComponentType } from 'react'
import type { DiagramName } from '../slideTypes'
import ReconcileLoop from './ReconcileLoop'
import ReferralPipeline from './ReferralPipeline'
import RecallVsCost from './RecallVsCost'

export const DIAGRAMS: Record<DiagramName, ComponentType> = {
  ReconcileLoop,
  ReferralPipeline,
  RecallVsCost,
}
