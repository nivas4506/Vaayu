import { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { Activity, ArrowRight, ChevronRight, HeartHandshake, Hospital, MapPin, Network, ShieldCheck, Siren, Smartphone, Stethoscope, WifiOff, type LucideIcon } from 'lucide-react';
import { GlassCard, PrimaryButton, SecondaryButton } from './ui';
import { useAppStore } from '../store';
import { t } from '../i18n';
import { landingCopy } from './landingCopy';
import NetworkBackdrop from '../scenes/NetworkBackdrop';

const VillageScene = lazy(() => import('../scenes/VillageScene'));
const rise = { initial: { opacity: 0, y: 22 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { duration: .55, ease: [0.22, 1, 0.36, 1] as const } };
const SectionIntro = ({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) => <div className="section-intro"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{copy && <p>{copy}</p>}</div>;

export default function Landing({ onStart }: { onStart: () => void }) {
  const { language } = useAppStore(s => ({ language: s.language }));
  const c = landingCopy[language];
  const scroll = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const steps: [LucideIcon, string, string][] = [[MapPin, c.steps[0], c.steps[1]], [Activity, c.steps[2], c.steps[3]], [ChevronRight, c.steps[4], c.steps[5]]];
  const cards: [string, string, LucideIcon][] = [[c.cards[0], c.cards[1], Network], [c.cards[2], c.cards[3], HeartHandshake], [c.cards[4], c.cards[5], Siren], [c.cards[6], c.cards[7], Smartphone]];
  const principles: [string, string][] = [[c.principles[0], c.principles[1]], [c.principles[2], c.principles[3]], [c.principles[4], c.principles[5]], [c.principles[6], c.principles[7]]];
  const resources: [string, string][] = [[c.resources[0], c.resources[1]], [c.resources[2], c.resources[3]], [c.resources[4], c.resources[5]], [c.resources[6], c.resources[7]]];
  const links = ['https://arogya.maharashtra.gov.in/', 'https://arogya.maharashtra.gov.in/', 'https://abdm.gov.in/', 'https://esanjeevani.mohfw.gov.in/'];
  const ladder: [string, string][] = [[c.ladder[0], c.ladder[1]], [c.ladder[2], c.ladder[3]], [c.ladder[4], c.ladder[5]], [c.ladder[6], c.ladder[7]], [c.ladder[8], c.ladder[9]]];
  return <main id="home" className="landing-shell">
    <section className="hero-shell" aria-labelledby="hero-title"><div className="hero-orb hero-orb-one" /><div className="hero-orb hero-orb-two" />
      <div className="hero-copy"><motion.p {...rise} className="eyebrow">{c.eyebrow}</motion.p><motion.h1 {...rise} transition={{ ...rise.transition, delay: .08 }} id="hero-title">{c.heroTitle}</motion.h1><motion.p {...rise} transition={{ ...rise.transition, delay: .16 }} className="hero-lead">{c.heroLead}</motion.p><motion.div {...rise} transition={{ ...rise.transition, delay: .24 }} className="hero-actions"><PrimaryButton onClick={onStart}>{c.find} <ArrowRight size={18} /></PrimaryButton><SecondaryButton onClick={() => scroll('how-it-works')}>{c.how}</SecondaryButton></motion.div><motion.div {...rise} transition={{ ...rise.transition, delay: .32 }} className="hero-note"><ShieldCheck size={17} /> {c.heroNote}</motion.div></div>
      <div className="hero-visual" aria-hidden="true"><Suspense fallback={<div className="scene-fallback" />}><VillageScene className="h-full w-full" /></Suspense><div className="scene-wash" /></div>
    </section>
    <section className="trust-strip" aria-label={c.eyebrow}>{[[c.trust[0], HeartHandshake], [c.trust[1], Activity], [c.trust[2], Network], [c.trust[3], WifiOff]].map(([label, Icon]) => <div key={String(label)}><Icon size={18} /><span>{String(label)}</span></div>)}</section>
    <section id="how-it-works" className="content-section problem-layout"><motion.div {...rise}><SectionIntro eyebrow={c.careEyebrow} title={c.careTitle} copy={c.careCopy} /></motion.div><motion.div {...rise} className="care-story glass-floating"><div className="story-pulse" /><p className="eyebrow">{c.path}</p>{steps.map(([Icon, title, copy]) => <div className="story-line" key={title}><span className="story-icon"><Icon size={20} /></span><div><b>{title}</b><p>{copy}</p></div></div>)}</motion.div></section>
    <section id="network" className="content-section network-section"><NetworkBackdrop className="network-backdrop" /><motion.div {...rise} className="network-heading"><SectionIntro eyebrow={c.networkEyebrow} title={c.networkTitle} copy={c.networkCopy} /></motion.div><motion.div {...rise} className="care-ladder" aria-label={c.networkEyebrow}>{ladder.map(([title, desc], i) => <div className="ladder-step" key={title}><span>{String(i + 1).padStart(2, '0')}</span><div><b>{title}</b><small>{desc}</small></div>{i < 4 && <i aria-hidden="true" />}</div>)}</motion.div></section>
    <section id="services" className="content-section service-section"><motion.div {...rise}><SectionIntro eyebrow={c.servicesEyebrow} title={c.servicesTitle} /></motion.div><div className="service-grid"><motion.article {...rise} className="service-feature glass-floating"><span className="feature-icon"><Stethoscope /></span><p className="eyebrow">{c.featureEyebrow}</p><h3>{c.featureTitle}</h3><p>{c.featureCopy}</p><button onClick={onStart}>{c.access} <ArrowRight size={16} /></button></motion.article>{cards.map(([title, copy, Icon]) => <motion.article {...rise} key={title} className="service-card glass"><span><Icon size={20} /></span><h3>{title}</h3><p>{copy}</p></motion.article>)}</div></section>
    <section id="guidelines" className="content-section principles-section"><motion.div {...rise}><SectionIntro eyebrow={c.principlesEyebrow} title={c.principlesTitle} copy={c.principlesCopy} /></motion.div><div className="principle-list">{principles.map(([title, copy]) => <motion.div {...rise} key={title} className="principle-item"><span><ShieldCheck size={18} /></span><div><h3>{title}</h3><p>{copy}</p></div></motion.div>)}</div></section>
    <section className="content-section community-section"><motion.div {...rise} className="community-copy"><SectionIntro eyebrow={c.communityEyebrow} title={c.communityTitle} copy={c.communityCopy} /><p className="community-footnote">{c.footnote}</p></motion.div><motion.div {...rise} className="community-panel glass-floating"><Hospital size={28} /><div><b>{c.panelTitle}</b><p>{c.panelCopy}</p></div></motion.div></section>
    <section id="resources" className="content-section resource-section"><motion.div {...rise}><SectionIntro eyebrow={c.resourcesEyebrow} title={c.resourcesTitle} copy={c.resourcesCopy} /></motion.div><div className="resource-grid">{resources.map(([title, copy], i) => <a key={title} className="resource-card glass" href={links[i]} target="_blank" rel="noreferrer"><span>{c.resourceLabel}</span><h3>{title}</h3><p>{copy}</p><ChevronRight size={18} /></a>)}</div></section>
    <section id="emergency" className="content-section"><motion.div {...rise} className="emergency-banner"><div><p className="eyebrow">{c.emergencyEyebrow}</p><h2>{c.emergencyTitle}</h2><p>{c.emergencyCopy}</p></div><a href="tel:112" className="emergency-call"><Siren size={19} /> {c.call}</a></motion.div></section>
    <section className="content-section final-cta"><motion.div {...rise} className="final-panel glass-floating"><p className="eyebrow">{c.finalEyebrow}</p><h2>{c.finalTitle}</h2><p>{c.finalCopy}</p><PrimaryButton onClick={onStart}>{t('access_portal', language)} <ArrowRight size={18} /></PrimaryButton></motion.div></section>
    <footer className="site-footer"><div><b>{t('app_title', language)}</b><p>{c.footerCopy}</p></div><nav aria-label={c.eyebrow}><a href="#network">{c.footerLinks[0]}</a><a href="#services">{c.footerLinks[1]}</a><a href="#guidelines">{c.footerLinks[2]}</a><a href="#resources">{c.footerLinks[3]}</a><a href="#emergency">{c.footerLinks[4]}</a></nav><p className="footer-disclaimer">{c.footnote}</p></footer>
  </main>;
}
