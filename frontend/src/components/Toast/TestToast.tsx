import { useEffect, useState } from "react";
import { useToast } from "./components/ToastContext";

const COLORS = [
  { type: "success" as const, title: "Sucesso", msg: "Operação realizada com sucesso!" },
  { type: "error" as const, title: "Erro", msg: "Falha na operação." },
  { type: "info" as const, title: "Info", msg: "Informação importante." },
  { type: "warning" as const, title: "Aviso", msg: "Atenção! Algo precisa de revisão." },
];

export function TestToast() {
  const { showToast } = useToast();
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      const c = COLORS[idx % COLORS.length];
      showToast({ title: c.title, message: c.msg, type: c.type, duration: 3000 });
      setIdx((i) => i + 1);
    }, 3500);
    return () => clearInterval(interval);
  }, [idx, visible, showToast]);

  useEffect(() => {
    const handler = () => setVisible((v) => !v);
    window.addEventListener("toggle-test-toast", handler);
    return () => window.removeEventListener("toggle-test-toast", handler);
  }, []);

  return null;
}
