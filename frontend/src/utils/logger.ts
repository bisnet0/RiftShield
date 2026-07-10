export function logSystemEvent(type: string, label: string, icon?: string) {
  window.dispatchEvent(new CustomEvent("hermes-system-event", {
    detail: { type, label, icon: icon || type },
  }));
}
