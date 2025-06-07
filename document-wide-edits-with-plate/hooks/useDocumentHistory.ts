import { useState, useCallback, useRef } from 'react';

interface DocumentSnapshot {
  id: string;
  content: string;
  timestamp: Date;
  transformation?: string;
  description: string;
}

interface HistoryState {
  snapshots: DocumentSnapshot[];
  currentIndex: number;
  maxHistorySize: number;
}

export function useDocumentHistory(maxHistorySize: number = 50) {
  const [state, setState] = useState<HistoryState>({
    snapshots: [],
    currentIndex: -1,
    maxHistorySize,
  });

  const nextIdRef = useRef(0);

  const saveSnapshot = useCallback((
    content: string,
    description: string,
    transformation?: string
  ) => {
    const snapshot: DocumentSnapshot = {
      id: `snapshot-${nextIdRef.current++}`,
      content,
      timestamp: new Date(),
      transformation,
      description,
    };

    setState(prev => {
      const newSnapshots = [
        ...prev.snapshots.slice(0, prev.currentIndex + 1),
        snapshot
      ];

      // Trim history if it exceeds max size
      const trimmedSnapshots = newSnapshots.slice(-prev.maxHistorySize);
      const newCurrentIndex = trimmedSnapshots.length - 1;

      return {
        ...prev,
        snapshots: trimmedSnapshots,
        currentIndex: newCurrentIndex,
      };
    });

    return snapshot.id;
  }, []);

  const undo = useCallback((): DocumentSnapshot | null => {
    let result: DocumentSnapshot | null = null;
    setState(prev => {
      if (prev.currentIndex <= 0) return prev;
      
      const newIndex = prev.currentIndex - 1;
      result = prev.snapshots[newIndex];
      
      return { ...prev, currentIndex: newIndex };
    });
    
    return result;
  }, []);

  const redo = useCallback((): DocumentSnapshot | null => {
    let result: DocumentSnapshot | null = null;
    setState(prev => {
      if (prev.currentIndex >= prev.snapshots.length - 1) return prev;
      
      const newIndex = prev.currentIndex + 1;
      result = prev.snapshots[newIndex];
      
      return { ...prev, currentIndex: newIndex };
    });
    
    return result;
  }, []);

  const goToSnapshot = useCallback((snapshotId: string): DocumentSnapshot | null => {
    let result: DocumentSnapshot | null = null;
    setState(prev => {
      const index = prev.snapshots.findIndex(s => s.id === snapshotId);
      if (index === -1) return prev;
      
      result = prev.snapshots[index];
      return { ...prev, currentIndex: index };
    });
    
    return result;
  }, []);

  const clearHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      snapshots: [],
      currentIndex: -1,
    }));
    nextIdRef.current = 0;
  }, []);

  const getCurrentSnapshot = useCallback((): DocumentSnapshot | null => {
    return state.currentIndex < 0 || state.currentIndex >= state.snapshots.length
      ? null
      : state.snapshots[state.currentIndex];
  }, [state.currentIndex, state.snapshots]);

  const canUndo = state.currentIndex > 0;
  const canRedo = state.currentIndex < state.snapshots.length - 1;

  return {
    snapshots: state.snapshots,
    currentIndex: state.currentIndex,
    canUndo,
    canRedo,
    saveSnapshot,
    undo,
    redo,
    goToSnapshot,
    clearHistory,
    getCurrentSnapshot,
  };
} 