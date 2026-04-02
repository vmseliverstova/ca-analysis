const GA_ID = 'G-RK9F1ZXG0Q';

export function track(eventName, params = {}) {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, params);
}
