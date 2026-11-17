"use client";

import Link from "next/link";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";

/** Progressive enhancement: content remains visible without JavaScript. */
export function PublicExperience({ children, contactHref, whatsappHref }: {
  children: ReactNode;
  contactHref?: string;
  whatsappHref?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const dock = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const container = root.current;
    if (!container) return;
    container.dataset.enhanced = "true";
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animations = new Set<Animation>();
    const reveal = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        reveal.unobserve(entry.target);
        if (motion.matches) continue;
        const animation = entry.target.animate(
          [{ opacity: .35, transform: "translateY(16px)" }, { opacity: 1, transform: "none" }],
          { duration: 480, easing: "cubic-bezier(.2,.7,.2,1)" },
        );
        animations.add(animation);
        animation.onfinish = () => animations.delete(animation);
      }
    }, { threshold: .08 });
    let observedReveals = false;
    const observeReveals = () => {
      if (motion.matches || observedReveals) return;
      observedReveals = true;
      container.querySelectorAll(".public-block:not(.block-hero) > .block-heading, .public-service-item, .public-steps li, .block-cta").forEach(element => reveal.observe(element));
    };
    const idle = window.requestIdleCallback?.(observeReveals, { timeout: 1000 });
    const timer = idle === undefined ? window.setTimeout(observeReveals, 250) : undefined;

    const form = container.querySelector("[data-contact-form]");
    let formVisible = false;
    const updateDock = () => {
      if (!dock.current) return;
      // Keep a focused link available until the visitor moves focus away.
      const focused = dock.current.contains(document.activeElement);
      const hidden = !!form && (formVisible || form.contains(document.activeElement)) && !focused;
      dock.current.dataset.hidden = String(hidden);
      dock.current.inert = hidden;
    };
    const contactObserver = new IntersectionObserver((entries) => {
      formVisible = entries.some((entry) => entry.isIntersecting);
      updateDock();
    });
    if (form) contactObserver.observe(form);
    updateDock();
    container.addEventListener("focusin", updateDock);
    container.addEventListener("focusout", updateDock);
    const updateMotion = () => {
      if (motion.matches) animations.forEach(animation => animation.cancel());
      else observeReveals();
    };
    motion.addEventListener("change", updateMotion);
    return () => {
      delete container.dataset.enhanced;
      if (idle !== undefined) window.cancelIdleCallback(idle);
      if (timer !== undefined) window.clearTimeout(timer);
      reveal.disconnect();
      contactObserver.disconnect();
      animations.forEach((animation) => animation.cancel());
      motion.removeEventListener("change", updateMotion);
      container.removeEventListener("focusin", updateDock);
      container.removeEventListener("focusout", updateDock);
    };
  }, [pathname]);

  return (
    <div ref={root} className="public-experience">
      {children}
      {(whatsappHref || contactHref) && (
        <nav ref={dock} className="public-contact-dock" aria-label="Contacto rápido">
          {whatsappHref
            ? <a href={whatsappHref} className="dock-primary" data-whatsapp-action><MessageCircle size={19} aria-hidden /> Consultar mi caso por WhatsApp</a>
            : contactHref && <Link href={contactHref} className="dock-primary">Consultar mi caso <ArrowUpRight size={18} aria-hidden /></Link>}
        </nav>
      )}
    </div>
  );
}
