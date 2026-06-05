/**
 * @fileoverview Toast Notification System
 */

const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR:   'error',
  WARNING: 'warning',
  INFO:    'info',
};

const TOAST_CONFIG = {
  DURATION:     4000,
  MAX_TOASTS:   5,
  CONTAINER_ID: 'toast-container',
};

const TYPE_CONFIG = {
  success: { bg: '#10b981', border: '#059669', icon: '✓' },
  error:   { bg: '#ef4444', border: '#dc2626', icon: '✕' },
  warning: { bg: '#f59e0b', border: '#d97706', icon: '!' },
  info:    { bg: '#3b82f6', border: '#2563eb', icon: 'i' },
};

function injectKeyframes() {
  if (document.getElementById('toast-keyframes')) return;
  const style = document.createElement('style');
  style.id = 'toast-keyframes';
  style.textContent = `
    @keyframes toastIn {
      from { transform: translateX(calc(100% + 1.5rem)); opacity: 0; }
      to   { transform: translateX(0);                  opacity: 1; }
    }
    @keyframes toastOut {
      from { transform: translateX(0);                  opacity: 1; }
      to   { transform: translateX(calc(100% + 1.5rem)); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

function getContainer() {
  let container = document.getElementById(TOAST_CONFIG.CONTAINER_ID);
  if (!container) {
    container = document.createElement('div');
    container.id = TOAST_CONFIG.CONTAINER_ID;
    container.style.cssText = [
      'position:fixed',
      'bottom:1.5rem',
      'right:1.5rem',
      'z-index:9999',
      'display:flex',
      'flex-direction:column',
      'align-items:flex-end',
      'gap:0.5rem',
      'pointer-events:none',
      'max-width:min(360px,calc(100vw - 3rem))',
      'width:100%',
    ].join(';');
    document.body.appendChild(container);
  }
  return container;
}

function dismiss(toast, animationDuration = 250) {
  if (!toast?.parentNode) return;
  toast.style.animation = `toastOut ${animationDuration}ms ease-in forwards`;
  setTimeout(() => toast.parentNode?.removeChild(toast), animationDuration);
}

function createToast(message, type = TOAST_TYPES.INFO, duration = TOAST_CONFIG.DURATION) {
  injectKeyframes();

  const container = getContainer();

  // Remove oldest toast (first child = topmost in stack) if limit reached
  while (container.children.length >= TOAST_CONFIG.MAX_TOASTS) {
    dismiss(container.firstElementChild, 150);
  }

  const config = TYPE_CONFIG[type] ?? TYPE_CONFIG.info;

  const toast = document.createElement('div');
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');
  toast.style.cssText = [
    `background:${config.bg}`,
    `border-left:4px solid ${config.border}`,
    'color:white',
    'padding:0.75rem 1rem',
    'border-radius:0.5rem',
    'box-shadow:0 4px 16px rgba(0,0,0,0.2)',
    'display:flex',
    'align-items:center',
    'gap:0.625rem',
    'font-size:0.875rem',
    'font-weight:500',
    'line-height:1.4',
    'width:360px',
    'max-width:100%',
    'pointer-events:auto',
    'will-change:transform,opacity',
    'animation:toastIn 0.3s cubic-bezier(0.21,1.02,0.73,1) forwards',
  ].join(';');

  // Icon badge
  const iconEl = document.createElement('span');
  iconEl.setAttribute('aria-hidden', 'true');
  iconEl.style.cssText = [
    'flex-shrink:0',
    'width:1.25rem',
    'height:1.25rem',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'background:rgba(255,255,255,0.25)',
    'border-radius:50%',
    'font-size:0.6875rem',
    'font-weight:700',
    'font-style:normal',
    'line-height:1',
  ].join(';');
  iconEl.textContent = config.icon;

  // Message
  const msgEl = document.createElement('span');
  msgEl.style.cssText = 'flex:1;word-break:break-word;min-width:0';
  msgEl.textContent = message;

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.setAttribute('aria-label', 'Close notification');
  closeBtn.innerHTML = '&times;';
  closeBtn.style.cssText = [
    'background:none',
    'border:none',
    'color:rgba(255,255,255,0.7)',
    'font-size:1.25rem',
    'line-height:1',
    'cursor:pointer',
    'padding:0',
    'flex-shrink:0',
    'transition:color 0.15s',
    'display:flex',
    'align-items:center',
  ].join(';');
  closeBtn.onmouseenter = () => { closeBtn.style.color = 'white'; };
  closeBtn.onmouseleave = () => { closeBtn.style.color = 'rgba(255,255,255,0.7)'; };

  toast.append(iconEl, msgEl, closeBtn);
  container.appendChild(toast);

  // Auto-dismiss timer
  let timer = null;
  const startTimer = (delay = duration) => {
    if (delay > 0) timer = setTimeout(() => dismiss(toast), delay);
  };
  const clearTimer = () => clearTimeout(timer);

  closeBtn.onclick = () => { clearTimer(); dismiss(toast); };

  // Pause on hover
  toast.onmouseenter = clearTimer;
  toast.onmouseleave = () => startTimer(1200);

  startTimer();

  return toast;
}

export const toast = {
  success: (message, duration) => createToast(message, TOAST_TYPES.SUCCESS, duration),
  error:   (message, duration) => createToast(message, TOAST_TYPES.ERROR,   duration),
  warning: (message, duration) => createToast(message, TOAST_TYPES.WARNING, duration),
  info:    (message, duration) => createToast(message, TOAST_TYPES.INFO,    duration),
  show:    (message, type, duration) => createToast(message, type, duration),
  clear:   () => {
    const container = document.getElementById(TOAST_CONFIG.CONTAINER_ID);
    if (container) container.innerHTML = '';
  },
};

export { TOAST_TYPES };
export default toast;
