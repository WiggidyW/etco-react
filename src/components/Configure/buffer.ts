import { useState } from "react";

const useFifoStack = <T>(cap: number) => {
  const [stack, setStack] = useState<T[]>([]);

  const clear = (): void => setStack([]);

  const push = (t: T): void => {
    if (stack.length >= cap) {
      setStack([...stack.slice(1, stack.length), t]);
    } else {
      setStack([...stack, t]);
    }
  };

  const canPop = stack.length > 0;

  const pop = (): T | null => {
    if (canPop) {
      const t = stack.pop();
      setStack([...stack]);
      return t as T;
    } else {
      return null;
    }
  };

  return { clear, push, pop, canPop };
};

export const useUndoRedoCurrent = <T>(
  initial: T,
  undoCap: number,
  redoCap: number
) => {
  const {
    push: pushUndo,
    pop: popUndo,
    canPop: canUndo,
    clear: clearUndo,
  } = useFifoStack<T>(undoCap);
  const {
    push: pushRedo,
    pop: popRedo,
    canPop: canRedo,
    clear: clearRedo,
  } = useFifoStack<T>(redoCap);
  const [current, _setCurrent] = useState<T>(initial);

  const redo = (): void => {
    if (!canRedo) return;
    const newT = popRedo() as T;
    pushUndo(current);
    _setCurrent(newT);
  };

  const undo = (): void => {
    if (!canUndo) return;
    const newT = popUndo() as T;
    pushRedo(current);
    _setCurrent(newT);
  };

  const setCurrent = (t: T): void => {
    pushUndo(current);
    _setCurrent(t);
    clearRedo();
  };

  const reset = (): void => {
    _setCurrent(initial);
    clearUndo();
    clearRedo();
  };

  return { current, setCurrent, undo, redo, canUndo, canRedo, reset };
};
