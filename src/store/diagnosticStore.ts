import create from 'zustand';
import { BikeType, ConditionState } from '../types/bike';

type CategoryKey = 'frame' | 'fork' | 'brakes' | 'transmission' | 'wheels' | 'finishes';

export interface CategoryState {
  status?: ConditionState | string;
  impact?: number;
  blocking?: boolean;
}

interface DiagnosticState {
  dossierId?: string;
  bikeType?: BikeType;
  categories: Record<CategoryKey, CategoryState>;
  repairCosts: number;
  cleaningCosts: number;
  setDossier: (id: string, type?: BikeType) => void;
  setCategory: (key: CategoryKey, state: CategoryState) => void;
  setCosts: (repair: number, cleaning?: number) => void;
  reset: () => void;
}

const emptyCategories = (): DiagnosticState['categories'] => ({
  frame: {},
  fork: {},
  brakes: {},
  transmission: {},
  wheels: {},
  finishes: {}
});

export const useDiagnosticStore = create<DiagnosticState>((set) => ({
  dossierId: undefined,
  bikeType: 'mechanical',
  categories: emptyCategories(),
  repairCosts: 0,
  cleaningCosts: 0,
  setDossier: (id, type) => set({ dossierId: id, bikeType: type ?? 'mechanical' }),
  setCategory: (key, state) => set((s) => ({ categories: { ...s.categories, [key]: { ...s.categories[key], ...state } } })),
  setCosts: (repair, cleaning = 0) => set({ repairCosts: repair, cleaningCosts: cleaning }),
  reset: () => set({ dossierId: undefined, bikeType: 'mechanical', categories: emptyCategories(), repairCosts: 0, cleaningCosts: 0 })
}));
