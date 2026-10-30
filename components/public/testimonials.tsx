"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Pause, Play, Quote } from "lucide-react";
import type { Testimonial } from "@/lib/content/testimonials";

export function Testimonials({ items }: { items: Testimonial[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [canAnimate, setCanAnimate] = useState(false);
  const [visible, setVisible] = useState(false);
  const [manual, setManual] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const currentIndex = index % Math.max(1, items.length);
  const running = items.length > 1 && canAnimate && visible && !paused && !hovered && !focused;
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setCanAnimate(!preference.matches);
    update();
    preference.addEventListener("change", update);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .25 });
    if (ref.current) observer.observe(ref.current);
    return () => { preference.removeEventListener("change", update); observer.disconnect(); };
  }, []);
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      setManual(false);
      setIndex(value => (value + 1) % items.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [running, items.length]);
  if (!items.length) return null;
  const item = items[currentIndex];
  const move = (step: number) => { setManual(true); setIndex((currentIndex + step + items.length) % items.length); };
  return (
    <div ref={ref} className="public-testimonials" role="group" aria-roledescription="carrusel" aria-label="Testimonios de clientes"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false); }}>
      <div className="testimonial-stage" aria-live={manual ? "polite" : "off"} aria-atomic="true">
        <figure key={item.id} className="testimonial-slide" role="group" aria-roledescription="diapositiva" aria-label={`${currentIndex + 1} de ${items.length}`}>
          <Quote className="testimonial-mark" size={36} aria-hidden />
          <blockquote><p>{item.quote}</p></blockquote>
          <figcaption><span className="testimonial-avatar" aria-hidden>{item.author_name.trim().charAt(0).toLocaleUpperCase("es-CL")}</span><span><cite>{item.author_name}</cite>{item.context && <span className="testimonial-context">{item.context}</span>}</span></figcaption>
        </figure>
      </div>
      {items.length > 1 && <div className="testimonial-controls">
        <span>{currentIndex + 1} <span aria-hidden>/</span><span className="sr-only">de</span> {items.length}</span>
        <div>
          <button type="button" aria-label="Testimonio anterior" onClick={() => move(-1)}><ArrowLeft size={18} aria-hidden /></button>
          <button type="button" aria-label={paused ? "Activar avance automático" : "Pausar avance automático"} aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? <Play size={17} aria-hidden /> : <Pause size={17} aria-hidden />}</button>
          <button type="button" aria-label="Testimonio siguiente" onClick={() => move(1)}><ArrowRight size={18} aria-hidden /></button>
        </div>
      </div>}
    </div>
  );
}
