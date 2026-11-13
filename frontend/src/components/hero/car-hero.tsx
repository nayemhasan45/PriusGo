import Image from "next/image";
import { FleetCount } from "@/components/fleet-count";

/** Server-rendered photo composition. The interactive 3D stage is a later phase. */
export function CarHero() {
  return (
    <section className="car-hero" aria-labelledby="car-hero-title">
      <div className="car-hero__topline">
        <span>Hybrid car rental</span><span>Šiauliai, Lithuania</span>
      </div>
      <div className="car-hero__layout">
        <div className="car-hero__copy">
          <p className="car-hero__eyebrow"><span aria-hidden="true" /> Your next move starts here</p>
          <h1 id="car-hero-title" className="font-heading">Rent a Toyota{" "}<br /><span>Prius</span> in{" "}<br />Šiauliai.</h1>
          <p className="car-hero__description">Affordable hybrid car rental for daily use, business trips, and city movement. Simple booking, direct contact, no hassle.</p>
          <div className="car-hero__actions">
            <a className="car-hero__primary" href="#cars">Choose a car <span aria-hidden="true">↗</span></a>
            <a className="car-hero__secondary" href="#process">See how it works <span aria-hidden="true">↓</span></a>
          </div>
          <dl className="car-hero__rates">
            <div><dt>per day</dt><dd>€20</dd></div>
            <div><dt>per week</dt><dd>€100</dd></div>
            <div><dt>cars in fleet</dt><dd><FleetCount /></dd></div>
          </dl>
        </div>
        <figure className="car-hero__stage">
          <div className="car-hero__wordmark font-heading" aria-hidden="true">PRIUS</div>
          <div className="car-hero__photo">
            <Image src="/images/prius-hero.jpg" alt="Black Toyota Prius on a city street — photograph" fill sizes="(min-width: 1024px) 58vw, 100vw" preload />
          </div>
          <figcaption className="car-hero__caption"><span>Toyota Prius</span><span>Hybrid / Automatic / 5 seats</span></figcaption>
          <p className="car-hero__photo-label">Vehicle photograph</p>
        </figure>
      </div>
      <div className="car-hero__footer"><span>Less fuel. More possibilities.</span><a href="#cars">Explore the fleet <span aria-hidden="true">↓</span></a></div>
    </section>
  );
}
