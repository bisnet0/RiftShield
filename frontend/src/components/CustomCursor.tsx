import { useEffect, useRef, useState } from "react";
import { useColorModeValue } from "@chakra-ui/react";
import api from "../middleware/api";

export function CustomCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const trail = useRef({ x: -100, y: -100 });
  const target = useRef({ x: -100, y: -100 });
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const ringDelay = 0.06;
  const dotDelay = 0.12;

  const borderColor = useColorModeValue("#e65c00", "#e6b800");
  const dotColor = useColorModeValue("#e65c00", "#e6b800");

  const nextRingRadius = useRef(18);
  const currentRingRadius = useRef(18);

  const loadState = () => {
    api.get("/users/me").then((r) => {
      setEnabled(r.data.user?.custom_cursor_enabled !== false);
    }).catch(() => {});
  };

  useEffect(() => { loadState(); }, []);

  useEffect(() => {
    const handler = () => loadState();
    window.addEventListener("cursor-toggle", handler);
    return () => window.removeEventListener("cursor-toggle", handler);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const existingStyle = document.getElementById("rift-cursor-style");
    if (existingStyle) existingStyle.remove();

    if (!enabled) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      document.body.style.cursor = "";
      const els = document.querySelectorAll("*");
      els.forEach((el) => {
        (el as HTMLElement).style.cursor = "";
      });
      return;
    }

    const style = document.createElement("style");
    style.setAttribute("id", "rift-cursor-style");
    style.textContent = "*:not([vw] *):not(.vw-plugin-top-wrapper *):not([vw-access-button]) { cursor: none !important; }";
    document.head.appendChild(style);

    const interactiveTags = ["a", "button", "input", "select", "textarea", "[role=button]", "label", '[onclick]', '[style*="cursor: pointer"]', '[style*="cursor:pointer"]', '[cursor="pointer"]'];

    const onMouseOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      const isInteractive = interactiveTags.some((tag) => {
        if (tag.startsWith("[")) return el.matches(tag);
        return el.tagName.toLowerCase() === tag || el.closest(tag);
      });
      nextRingRadius.current = isInteractive ? 28 : 18;
      setIsHovering(isInteractive);
    };

    const onMouse = (e: MouseEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
      onMouseOver(e);
    };

    const onLeave = () => {
      target.current.x = -100;
      target.current.y = -100;
    };

    document.addEventListener("mousemove", onMouse);
    document.addEventListener("mouseleave", onLeave);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    let animId: number;
    const animate = () => {
      const dx = target.current.x - trail.current.x;
      const dy = target.current.y - trail.current.y;
      trail.current.x += dx * dotDelay;
      trail.current.y += dy * dotDelay;

      const tdx = target.current.x - pos.current.x;
      const tdy = target.current.y - pos.current.y;
      pos.current.x += tdx * ringDelay;
      pos.current.y += tdy * ringDelay;

      const radiusDiff = nextRingRadius.current - currentRingRadius.current;
      currentRingRadius.current += radiusDiff * 0.08;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const px = pos.current.x;
      const py = pos.current.y;
      const r = currentRingRadius.current;

      if (r > 20) {
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = borderColor;
        ctx.globalAlpha = 0.08;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = r > 20 ? 0.8 : 0.6;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(trail.current.x, trail.current.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = dotColor;
      ctx.globalAlpha = 0.9;
      ctx.fill();

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      document.removeEventListener("mousemove", onMouse);
      document.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
      const s = document.getElementById("rift-cursor-style");
      if (s) s.remove();
      document.body.style.cursor = "";
      const els = document.querySelectorAll("*");
      els.forEach((el) => {
        (el as HTMLElement).style.cursor = "";
      });
    };
  }, [borderColor, dotColor, enabled]);

  if (enabled === null) return null;
  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 99999,
        pointerEvents: "none",
      }}
    />
  );
}
