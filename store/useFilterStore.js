import { create } from "zustand";
import { persist } from "zustand/middleware";

const useFilterStore = create(
  persist(
    (set) => ({
      onlyVerified: false,
      toggleOnlyVerified: () => set((state) => ({ onlyVerified: !state.onlyVerified })),
    }),
    {
      name: "filter-storage", // Nome da chave no localStorage
    }
  )
);

export default useFilterStore;