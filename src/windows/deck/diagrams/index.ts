import type { ComponentType } from 'react'
import type { DiagramName } from '../slideTypes'
import ReconcileLoop from './ReconcileLoop'

export const DIAGRAMS: Record<DiagramName, ComponentType> = {
  ReconcileLoop,
}
