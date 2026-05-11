---
name: JobPilot
description: "Outil open-source de recherche d'emploi — centre de commande local"
colors:
  warm-ash-bg: "oklch(0.09 0.006 50)"
  warm-ash-bg-warm: "oklch(0.11 0.007 50)"
  warm-ash-surface: "oklch(0.13 0.007 50)"
  warm-ash-surface-2: "oklch(0.17 0.008 50)"
  warm-ash-border: "oklch(0.22 0.006 50)"
  warm-ash-border-bright: "oklch(0.32 0.008 50)"
  warm-ash-text: "oklch(0.94 0.006 70)"
  warm-ash-text-soft: "oklch(0.78 0.007 65)"
  warm-ash-text-mute: "oklch(0.48 0.005 60)"
  ember-accent: "oklch(0.65 0.18 41)"
  ember-dim: "oklch(0.19 0.05 41)"
  ember-glow: "oklch(0.65 0.18 41 / 0.2)"
  ember-deep: "oklch(0.45 0.18 41)"
  signal-good: "oklch(0.62 0.14 145)"
  signal-warn: "oklch(0.70 0.15 75)"
  signal-danger: "oklch(0.58 0.18 20)"
typography:
  display:
    fontFamily: "'Fraunces', 'Times New Roman', serif"
    fontWeight: 500
    lineHeight: 0.9
    letterSpacing: -2
  body:
    fontFamily: "'Inter Tight', -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "'JetBrains Mono', ui-monospace, monospace"
    fontWeight: 400
    letterSpacing: 0.5
rounded:
  sm: "4px"
  md: "8px"
  lg: "14px"
  xl: "22px"
  pill: "999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "36px"
  xxl: "44px"
components:
  button-default:
    backgroundColor: "{warm-ash-surface-2}"
    textColor: "{warm-ash-text}"
    borderColor: "{warm-ash-border-bright}"
    rounded: "{rounded.md}"
    padding: "0 14px"
  button-primary:
    backgroundColor: "{ember-accent}"
    textColor: "{warm-ash-surface}"
    borderColor: "{ember-accent}"
    rounded: "{rounded.md}"
    padding: "0 18px"
  button-danger:
    backgroundColor: "{signal-danger}"
    textColor: "{warm-ash-text}"
    borderColor: "{signal-danger}"
    rounded: "{rounded.md}"
  nav-item:
    backgroundColor: "{ember-dim}"
    textColor: "{ember-accent}"
    rounded: "6px"
    padding: "9px 12px"
  card:
    backgroundColor: "{warm-ash-surface}"
    borderColor: "{warm-ash-border}"
    rounded: "{rounded.lg}"
    padding: "14px"
  chip:
    backgroundColor: "{ember-dim}"
    textColor: "{ember-accent}"
    borderColor: "{ember-accent}"
    rounded: "{rounded.pill}"
    padding: "0 8px"
---

# Design System: JobPilot

## 1. Overview

**Creative North Star: "Le Centre de Commande Obscur"**

JobPilot est un cockpit sombre pour la recherche d'emploi. Tout est conçu pour mettre les données en avant et les distractions en arrière-plan. L'interface respire la compétence discrète d'un outil professionnel : elle ne cherche pas à séduire, elle cherche à être fiable.

La palette plonge dans des neutres chauds profonds (teinte 50°), créant une base tamisée qui réduit la fatigue visuelle pendant les longues sessions de recherche. L'accent orange vif — nommé Ember — agit comme un signal rare et précis, jamais décoratif. Les surfaces se distinguent par stratification tonale plutôt que par des ombres, donnant une profondeur calme et lisible.

Ce système rejette explicitement tout ce qui ressemble à une startup bling-bling : pas de gradients néon, pas de gamification, pas de glassmorphisme. Il rejette aussi les clichés SaaS corporate. C'est un outil pour des professionnels qui veulent avancer, pas pour des managers qui veulent impressionner.

**Key Characteristics:**
- Palette chaude profonde, dominante sombre
- Accent orange rare et précis
- Élévation par stratification tonale, ombres subsidiaires
- Typographie contrastée : serif display italique + sans corps + mono labels
- Rythme par espacement, pas par décor

## 2. Colors

Une palette restrainte qui suit la *Règle de la Braise* : l'accent Ember occupe ≤10% de chaque écran. Sa rareté est le point.

### Primary
- **Ember** (`oklch(0.65 0.18 41)` / `oklch(0.45 0.18 41)` deep): L'accent unique. Boutons primaires, liens actifs, indicateurs « en cours », bordures de focus. Ne jamais utilisé pour du texte long ou des fonds de section.
- **Ember Dim** (`oklch(0.19 0.05 41)`): Fond de l'élément de navigation actif. Subtile lueur orangée visible uniquement par comparaison directe.

### Signal
- **Good** (`oklch(0.62 0.14 145)`): Validation, succès, entretien, « ok » dans les étapes IA.
- **Warn** (`oklch(0.70 0.15 75)`): Attention, délai, « postulé en attente ».
- **Danger** (`oklch(0.58 0.18 20)`): Suppression, rejet, erreur.

Chaque signal a une variante `-dim` pour les fonds de badge/chip (chroma réduit de moitié).

### Neutral
- **Warm Ash BG** (`oklch(0.09 0.006 50)`): Fond de page. La pièce sombre. Presque noir mais avec une chaleur perceptible.
- **Warm Ash BG Warm** (`oklch(0.11 0.007 50)`): Fond légèrement plus clair pour les zones qui ont besoin de se distinguer du fond principal.
- **Warm Ash Surface** (`oklch(0.13 0.007 50)`): Cartes, panneaux, sidebar. Le plan de travail principal.
- **Warm Ash Surface-2** (`oklch(0.17 0.008 50)`): Boutons, inputs, surfaces secondaires. Un cran au-dessus du fond.
- **Warm Ash Border** (`oklch(0.22 0.006 50)`): Bordures standard, lignes de séparation.
- **Warm Ash Border Bright** (`oklch(0.32 0.008 50)`): Bordures de boutons, inputs. Plus visible que la bordure standard.
- **Warm Ash Text** (`oklch(0.94 0.006 70)`): Texte principal. Presque blanc avec une touche chaude.
- **Warm Ash Text Soft** (`oklch(0.78 0.007 65)`): Texte secondaire, métadonnées.
- **Warm Ash Text Mute** (`oklch(0.48 0.005 60)`): Texte tertiary, placeholder, inactif.

### Named Rules
**La Règle de la Braise.** Ember ne dépasse jamais 10% de la surface d'un écran. L'accent est un signal, pas un thème. Si une page semble « orange », c'est un échec.

## 3. Typography

**Display Font:** Fraunces (avec Times New Roman fallback)
**Body Font:** Inter Tight (avec -apple-system system-ui fallback)
**Label/Mono Font:** JetBrains Mono (avec ui-monospace fallback)

**Character:** Un contraste assumé entre la rondeur aristocratique de Fraunces en italique et la rigueur technique d'Inter Tight. La voix est professionnelle mais pas froide — le display italique apporte une chaleur mesurée.

### Hierarchy
- **Display** (Fraunces 500 italic, 52px, line-height 0.9, letter-spacing -2px): Salutation d'accueil, titres de section majeurs. Usage rare, réservé aux pages racines (dashboard home).
- **Title** (Inter Tight 600, 13-18px, line-height 1.3): Titres de cartes, en-têtes de sections secondaires.
- **Body** (Inter Tight 400, 12-13px, line-height 1.5): Texte courant. Cap à 70ch.
- **Label** (JetBrains Mono 400, 10-11px, letter-spacing 0.5-2px, uppercase optionnel): Métadonnées, dates, statuts, logs, boutons secondaires. Le mono ancre visuellement le système.

### Named Rules
**La Règle du Cockpit.** Les labels mono sont en uppercase avec letter-spacing. Ils ne crient pas ; ils s'alignent. Comme les instruments d'un avion.

## 4. Elevation

Flat par défaut. La profondeur est transmise par stratification tonale (bg → bg-warm → surface → surface-2), pas par des ombres. Les ombres sont subsidiaires : elles apparaissent seulement comme réponse à l'interaction (hover d'une carte, modal ouvert, popover).

**La Règle du Sol Plat.** Les surfaces sont plates au repos. Une ombre signifie qu'on peut interagir. Si tout a une ombre, rien n'est interactif.

### Shadow Vocabulary
- **Shadow SM** (`0 1px 3px rgba(0,0,0,0.3)`): Micro-élévations au hover des boutons.
- **Shadow MD** (`0 2px 8px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.2)`): Cartes au hover, survol de drag.
- **Shadow LG** (`0 8px 28px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.3)`): Modaux, overlays.
- **Shadow POP** (`0 16px 40px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.4)`): Fenêtres contextuelles, dropdowns.

## 5. Components

### Buttons
- **Shape:** Coins modérément arrondis (8px). Hauteur standard de 32-40px.
- **Default:** Fond `surface-2`, bordure `border-bright`, texte `text`. Au hover : bordure devient Ember. Transition rapide (150ms ease-out).
- **Primary:** Fond Ember, texte sur `surface`, aucune bordure visible (bordure = même couleur que fond). Au hover : Ember Deep, opacité réduite à 0.9.
- **Danger:** Fond Danger, texte clair. Même pattern que primary.
- **Ghost/Secondary:** Exprimés via la classe `.btn` standard. Fond `surface-2`, bordure. Jamais de remplissage complet hors primary/danger.
- **État pressé:** Scale(0.97) sur tous les boutons — retour tactile minimal.

### Chips / Badges
- **Shape:** Pill (999px). Hauteur 22px.
- **Style:** Fond `var(--X-dim)`, texte `var(--X)`, bordure 1px `var(--X)`. Le X varie selon le statut : Ember pour « CV prêt », Text pour « envoyé », Good pour « entretien ».
- **Contenu:** Toujours en mono ou 10-11px. Si accent, préfixé par `✦`.

### Cards
- **Shape:** Coins arrondis (14px). Bordure `line-soft` (1px).
- **Background:** `surface`. Au hover : bordure devient `text`, `shadow-lg`, translateY(-2px).
- **Internal Padding:** 14px horizontal, 10px vertical en bas, contenu variable en haut.
- **Nested:** Jamais de cartes imbriquées. Utiliser des diviseurs (1px border) ou des sections dans le flux.

### Inputs / Fields
- **Shape:** 8px radius. Fond `surface` ou `surface-2`. Bordure `border-bright`.
- **Focus:** `outline: 2px solid var(--accent)` au niveau global — appliqué à `:focus-visible` sur tous les éléments interactifs.
- **Style:** Réservé. Pas de remplissage coloré, pas de flottement. L'input est un contenant calme.

### Navigation (Sidebar)
- **Style:** Panneau latéral fixe (208px ouvert, 56px réduit). Fond `surface`. Bordure droite 1px `border`.
- **État actif:** Fond `accent-dim`, texte Ember, font-weight 600. Icône + label.
- **État inactif:** Texte `text-mute`, font-weight 400. Transition 120ms.
- **Logo:** Fraunces display italic 17px. Badge carré Ember 26×26px avec icône flèche.
- **Mobile:** Hamburger en haut à gauche, overlay semi-transparent, panel glissant.

### Progress Overlay (AiProgressOverlay)
- **Shape:** 8px radius. Fond `bg-warm`. Bordure 1px Ember.
- **Étapes:** Indicateur circulaire 6px par étape (gris → Ember → Good). Texte mono 12px. « ok » en Good quand complété.
- **Animation:** Pulsation Ember sur l'indicateur principal « IA en cours ». Points de progression.

### Modal
- **Shape:** 14px radius. Fond `surface`. Bordure `border-bright`. Shadow POP.
- **Overlay:** Fond noir semi-transparent (0.5). Clic en dehors ferme.
- **Boutons:** Annuler (ghost) + Supprimer/Confirmer (danger ou primary).

## 6. Do's and Don'ts

### Do:
- **Do** laisser l'accent Ember rare. Si une page est `<10%` orange, c'est réussi.
- **Do** utiliser la stratification tonale pour la hiérarchie : `bg` → `surface` → `surface-2`.
- **Do** garder les labels en mono uppercase avec letter-spacing.
- **Do** limiter Fraunces aux titres importants (salutation, titres de page rares).
- **Do** utiliser la grille de cartes avec espacement `xxl` (44px) pour aérer les dashboards.

### Don't:
- **Don't** utiliser l'accent Ember comme fond de section, texte long, ou élément décoratif. La Braise est un signal.
- **Don't** utiliser de gradient text (`background-clip: text`). Jamais.
- **Don't** utiliser de glassmorphisme (blur + fond semi-transparent) comme style par défaut.
- **Don't** utiliser la border-left colorée comme accent décoratif. Remplacer par des fonds complets.
- **Don't** mettre d'ombre sur les cartes au repos. La Règle du Sol Plat.
- **Don't** imbriquer des cartes. Jamais.
- **Don't** faire de gamification — pas de badges « niveau expert », pas de barres de progression « complétion du profil ».
- **Don't** utiliser d'émojis dans l'interface. Le lexique visuel est typographique et iconographique.
- **Don't** utiliser le template « hero-metric » (grand chiffre + petite étiquette + stats + gradient). Varier les présentations de données.
