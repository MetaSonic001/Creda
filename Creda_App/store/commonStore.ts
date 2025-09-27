import { create } from 'zustand';

interface StoreState {
  isBottomSheetOpen: boolean;
  openBottomSheet: (data: boolean) => void;
  closeBottomSheet: () => void;
  isListening: boolean;
  transcript: string;
  setTranscript: (t: string) => void;
  setListening: (v: boolean) => void;
}

const useStore = create<StoreState>((set) => ({
  isBottomSheetOpen: false,
  openBottomSheet: (data) => set({ isBottomSheetOpen: data }),
  closeBottomSheet: () => set({ isBottomSheetOpen: false }),
  isListening: false,
  transcript: '',
  setTranscript: (t) => set({ transcript: t }),
  setListening: (v) => set({ isListening: v }),

}));

export default useStore;
