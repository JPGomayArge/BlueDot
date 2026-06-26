import { create } from 'zustand';

const SCALES = [
  { label: '1 vuelta = 1 año',     yearsPerOrbit: 1     },
  { label: '1 vuelta = 1 década',  yearsPerOrbit: 10    },
  { label: '1 vuelta = 1 siglo',   yearsPerOrbit: 100   },
  { label: '1 vuelta = 1 milenio', yearsPerOrbit: 1000  },
];

const LAYERS = [
  { id: 'politics',   label: 'Política',    color: '#378ADD', active: true  },
  { id: 'religion',   label: 'Religión',    color: '#EF9F27', active: false },
  { id: 'economy',    label: 'Economía',    color: '#1D9E75', active: false },
  { id: 'migration',  label: 'Migraciones', color: '#D4537E', active: false },
  { id: 'science',    label: 'Ciencia',     color: '#7F77DD', active: false },
  { id: 'people',     label: 'Personas',    color: '#D85A30', active: false },
];

export const useTimeStore = create((set, get) => ({
  // Tiempo
  currentYear: 2000,
  setYear: (year) => set({ currentYear: Math.round(year) }),

  // Escala orbital
  scaleIndex: 0,
  scales: SCALES,
  currentScale: () => SCALES[get().scaleIndex],
  setScaleIndex: (i) => set({ scaleIndex: Math.max(0, Math.min(i, SCALES.length - 1)) }),

  // Capas
  layers: LAYERS,
  toggleLayer: (id) => set((state) => ({
    layers: state.layers.map((l) =>
      l.id === id ? { ...l, active: !l.active } : l
    ),
  })),
  activeLayers: () => get().layers.filter((l) => l.active).map((l) => l.id),

  // Modo cinemático
  cinematicPlaying: false,
  cinematicSpeed: 10,
  setCinematicSpeed: (speed) => set({ cinematicSpeed: speed }),
  toggleCinematic: () => set((state) => ({ cinematicPlaying: !state.cinematicPlaying })),
}));
