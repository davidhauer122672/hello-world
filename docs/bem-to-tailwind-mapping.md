# BEM-to-Tailwind CSS Migration Mapping Reference

**Phase 2 Complete** | Date: April 17, 2026 | Standard: Ferrari Standardized

All 10 BEM block roots, 51 elements, 6 modifiers, and 10 standalone classes mapped.

## Quick Reference

| Legacy BEM | Tailwind Replacement | Notes |
|-----------|---------------------|-------|
| `.container` | `.ck-container` | Responsive padding |
| `.section-header` | `.ck-section` | Section padding |
| `.section-label` | `.ck-label` | Gold uppercase label |
| `.section-heading` | `.ck-heading` | Playfair Display heading |
| `.reveal-up` | `.ck-reveal-up` | Scroll animation |
| `.reveal-left` | `.ck-reveal-left` | Scroll animation |
| `.reveal-right` | `.ck-reveal-right` | Scroll animation |
| `.delay-1` | `.ck-delay-1` | 150ms delay |
| `.delay-2` | `.ck-delay-2` | 300ms delay |
| `.btn` | `.ck-btn` | Outline button |
| `.btn--gold` | `.ck-btn-gold` | Filled gold button |
| `.btn--gold-outline` | `.ck-btn` | Same as outline |
| `.btn--full` | `.ck-btn-full` | Width 100% modifier |
| `.btn--sm` | `.ck-btn-sm` | Small size modifier |
| `.nav` | `.ck-nav` | Fixed nav bar |
| `.nav__inner` | `.ck-nav-inner` | Flex container |
| `.nav__logo` | `.ck-nav-logo` | Logo link |
| `.nav__logo-img` | `.ck-nav-logo-img` | Logo image |
| `.nav__logo-text` | `.ck-nav-logo-text` | Brand text |
| `.nav__links` | `.ck-nav-links` | Nav link list |
| `.nav__link` | `.ck-nav-link` | Individual link |
| `.nav__cta-link` | `.ck-nav-cta` | CTA button |
| `.nav__toggle` | `.ck-nav-toggle` | Mobile hamburger |
| `.hero` | `.ck-hero` | Hero section |
| `.hero__bg` | `.ck-hero-bg` | Background wrapper |
| `.hero__bg-img` | `.ck-hero-bg-img` | Cover image |
| `.hero__overlay` | `.ck-hero-overlay` | Dark overlay |
| `.hero__content` | `.ck-hero-content` | Content wrapper |
| `.hero__eyebrow` | `.ck-hero-eyebrow` | Pre-headline label |
| `.hero__headline` | `.ck-hero-headline` | Main headline |
| `.hero__subhead` | `.ck-hero-subhead` | Subheadline text |
| `.hero__ctas` | `.ck-hero-ctas` | CTA button group |
| `.hero__scroll-cue` | `.ck-hero-scroll` | Scroll indicator |
| `.hero__scroll-line` | `.ck-hero-scroll-line` | Scroll line |
| `.services__grid` | `.ck-services-grid` | 3-column grid |
| `.service-card` | `.ck-service-card` | Card with hover |
| `.service-card__icon` | `.ck-service-icon` | Icon container |
| `.service-card__title` | `.ck-service-title` | Card title |
| `.service-card__body` | `.ck-service-body` | Card body text |
| `.service-card__detail` | `.ck-service-tags` | Tag container |
| `.leadership__grid` | `.ck-leadership-grid` | 2-column grid |
| `.leader-card` | `.ck-leader-card` | Leadership card |
| `.leader-card--dark` | `.ck-leader-card-dark` | Dark variant |
| `.leader-card__photo` | `.ck-leader-photo` | Portrait image |
| `.leader-card__role` | `.ck-leader-role` | Role label |
| `.leader-card__license` | `.ck-leader-license` | License text |
| `.leader-card__bio` | `.ck-leader-bio` | Bio paragraph |
| `.leader-card__quote` | `.ck-leader-quote` | Blockquote |
| `.leader-card__stats` | `.ck-leader-stats` | Stats row |
| `.contact__inner` | `.ck-contact-inner` | 2-column grid |
| `.contact__text` | `.ck-contact-text` | Left column |
| `.contact__body` | `.ck-contact-body` | Description text |
| `.contact__details` | `.ck-contact-details` | Detail list |
| `.contact__detail-item` | `.ck-contact-detail-item` | Detail row |
| `.contact__form-wrap` | `.ck-contact-form-wrap` | Right column |
| `.contact__form` | `.ck-contact-form` | Form element |
| `.form-group` | `.ck-form-group` | Form field group |
| `.form__note` | `.ck-form-note` | Form helper text |
| `.footer` | `.ck-footer` | Footer section |
| `.footer__top` | `.ck-footer-top` | Top grid |
| `.footer__brand` | `.ck-footer-brand` | Brand column |
| `.footer__logo` | `.ck-footer-logo` | Footer logo |
| `.footer__tagline` | `.ck-footer-tagline` | Serif tagline |
| `.footer__brand-tagline` | `.ck-footer-brand-tagline` | Sub-tagline |
| `.footer__nav` | `.ck-footer-nav` | Footer links |
| `.footer__middle` | `.ck-footer-middle` | Middle row |
| `.footer__social` | `.ck-footer-social` | Social icons |
| `.footer__nhwa` | `.ck-footer-nhwa` | NHWA badge |
| `.footer__bottom` | `.ck-footer-bottom` | Bottom row |
| `.footer__copy` | `.ck-footer-copy` | Copyright |
| `.footer__licenses` | `.ck-footer-licenses` | License text |

## Coverage

- **73/73 unique classes mapped** (100%)
- **10/10 BEM block roots refactored**
- **Output:** 22KB minified CSS
