import { create } from 'zustand';

interface Toast {
  id: number;
  texto: string;
  tipo: 'ok' | 'info' | 'erro';
}

interface Descanso {
  fimEm: number; // timestamp ms
  total: number; // segundos
  rotulo: string;
}

interface EstadoApp {
  toasts: Toast[];
  avisar: (texto: string, tipo?: Toast['tipo']) => void;
  remover: (id: number) => void;
  descanso: Descanso | null;
  iniciarDescanso: (seg: number, rotulo: string) => void;
  ajustarDescanso: (deltaSeg: number) => void;
  pararDescanso: () => void;
}

let seq = 1;

export const useApp = create<EstadoApp>((set, get) => ({
  toasts: [],
  avisar: (texto, tipo = 'ok') => {
    const id = seq++;
    set((s) => ({ toasts: [...s.toasts, { id, texto, tipo }] }));
    setTimeout(() => get().remover(id), 2600);
  },
  remover: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  descanso: null,
  iniciarDescanso: (seg, rotulo) => set({ descanso: { fimEm: Date.now() + seg * 1000, total: seg, rotulo } }),
  ajustarDescanso: (delta) =>
    set((s) => (s.descanso ? { descanso: { ...s.descanso, fimEm: s.descanso.fimEm + delta * 1000, total: Math.max(5, s.descanso.total + delta) } } : s)),
  pararDescanso: () => set({ descanso: null }),
}));

export const avisar = (texto: string, tipo?: Toast['tipo']) => useApp.getState().avisar(texto, tipo);
