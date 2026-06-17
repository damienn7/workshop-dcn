import type { BuybackCase } from './api.types';

type Listener = (c: BuybackCase | null) => void;

let currentCase: BuybackCase | null = null;
let listeners: Listener[] = [];

export function setCurrentCase(c: BuybackCase | null) {
  currentCase = c;
  listeners.slice().forEach((l) => l(c));
}

export function getCurrentCase() {
  return currentCase;
}

export function subscribeCurrentCase(fn: Listener) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

export default { setCurrentCase, getCurrentCase, subscribeCurrentCase };
