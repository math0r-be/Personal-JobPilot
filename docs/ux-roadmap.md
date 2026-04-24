# JobPilot — UX Roadmap & Feature Backlog

Ce fichier est conçu pour être lu par des agents IA travaillant de façon autonome.
Chaque section "Agent X" est auto-suffisante : l'agent n'a pas besoin de contexte externe pour démarrer.

---

## Contexte projet global

**JobPilot** est un outil open-source de gestion de recherche d'emploi, 100% local (pas de cloud, pas d'auth externe). Il tourne en Next.js 14 App Router avec une base SQLite via Prisma. Il est packagé en app Electron mais la majorité du code vit dans Next.js.

### Stack technique
- **Framework** : Next.js 14 App Router (`src/app/`)
- **Base de données** : SQLite via Prisma ORM (`prisma/schema.prisma`, fichier DB : `prisma/local.db`)
- **Styling** : CSS inline + variables CSS globales définies dans `src/app/globals.css`
- **Validation** : Zod, schémas dans `src/lib/schemas.ts`
- **AI** : OpenAI SDK avec baseURL dynamique (`src/lib/ai.ts`) — providers : OpenRouter, OpenAI, Ollama, Custom
- **Email** : Nodemailer (`src/lib/email.ts`)
- **Export** : `@react-pdf/renderer` (PDF), `docx` (Word)

### Commandes utiles
```bash
npm run dev          # Démarre le dev server sur localhost:3000
npm run db:push      # Applique les changements de schéma Prisma (sans migration file)
npm run db:generate  # Régénère le client Prisma après un changement de schéma
npm run lint         # ESLint
```

### Conventions de code dans ce projet
- **Pas de Tailwind** — le projet utilise des variables CSS et des styles inline (ex: `style={{ color: 'var(--accent)' }}`)
- **Variables CSS disponibles** : `--bg`, `--surface`, `--border`, `--text`, `--text-mute`, `--accent`, `--accent-mute`, `--danger`, `--good`, `--warn`, `--font-display`, `--font-body`, `--font-mono`
- **Server Components par défaut** — les pages sont des Server Components qui fetchent les données directement via Prisma. Les composants interactifs sont marqués `'use client'`
- **Settings via Server Actions** — `src/actions/settings.ts` (pas de routes `/api/settings/`)
- **Pas de librairie de composants UI** — tout est fait maison avec des styles inline
- **Contenu des CVs** : `Cv.content` est un JSON stringifié. Toujours `JSON.parse()` après lecture et `JSON.stringify()` avant écriture
- **Pas de commentaires** dans le code sauf si le WHY est non-obvious

### Architecture des pages dashboard
Toutes les pages dashboard partagent le layout `src/app/dashboard/layout.tsx` qui inclut la `Sidebar`. La structure est :
```
src/app/dashboard/
  layout.tsx          ← Sidebar + contenu principal
  page.tsx            ← Home (Mission Control) : stats, action items, CVs récents
  cv/
    page.tsx          ← Liste des CVs
    new/page.tsx      ← Crée un CV et redirige vers l'éditeur
    [id]/page.tsx     ← Éditeur CV complet
  jobs/
    page.tsx          ← Pipeline Kanban (6 colonnes)
    new/page.tsx      ← Formulaire nouveau job
    [id]/page.tsx     ← Détail job : texte brut, parsedData, CVs liés, emails liés
  emails/
    page.tsx          ← Liste des emails avec filtres (all/draft/sent/error)
    new/page.tsx      ← Composer un nouvel email
  match/page.tsx      ← Outil AI : coller une offre → obtenir un CV adapté
  templates/page.tsx  ← Galerie de templates CV
  settings/page.tsx   ← Settings (Server Component)
  settings/SettingsClient.tsx ← UI settings (Client Component, tabs: Profile/AI/SMTP)
```

### Modèle de données (résumé)
```prisma
Profile        { id, name, email, phone, location, summary }
AiConfig       { id, provider, apiKey, baseUrl, model }
SmtpConfig     { id, host, port, secure, user, pass, fromName, fromEmail }
Cv             { id, title, content (JSON string), templateId, jobPostingId?, createdAt, updatedAt }
CoverLetter    { id, body, cvId, jobPostingId? }
JobPosting     { id, title, company, location, url?, rawText, parsedData (JSON string), status, createdAt, updatedAt }
Email          { id, to, subject, body, status (draft|sent|error), jobPostingId?, createdAt }
```

### Statuts des jobs (dans l'ordre du pipeline)
`new` → `applied` → `interview` → `offer` → `rejected` / `archived`

---

## Agent A — UI Polish (Frontend uniquement, aucun changement de schéma)

### Mission
Améliorer la qualité perçue de l'interface : états vides, skeletons, feedback utilisateur, et responsive de base. Ce sont des changements purement frontend qui n'affectent pas les API ni le schéma Prisma.

### Fichiers à modifier (et seulement ceux-là)
- `src/app/dashboard/page.tsx` — home dashboard
- `src/app/dashboard/cv/page.tsx` — liste CVs
- `src/app/dashboard/jobs/page.tsx` — pipeline Kanban
- `src/app/dashboard/emails/page.tsx` — liste emails
- `src/components/DashboardCards.tsx` — composants CVCard, NewCvCard
- `src/app/dashboard/layout.tsx` — sidebar (pour responsive)
- `src/app/globals.css` — si ajout d'animations CSS globales

### Règles strictes pour cet agent
- Ne pas modifier le schéma Prisma
- Ne pas modifier les routes API
- Ne pas installer de nouvelles dépendances sans vérifier `package.json` d'abord
- Utiliser uniquement les variables CSS existantes (`var(--accent)`, etc.) — pas de couleurs hardcodées
- Pas de Tailwind — styles inline uniquement
- Lire chaque fichier avant de le modifier

### Tâches

#### 1. États vides
- [x] **`/dashboard/cv`** : empty state avec CTA vers `/dashboard/cv/new`
- [x] **`/dashboard/jobs`** : empty state avec CTA vers `/dashboard/match`
- [x] **`/dashboard/emails`** : empty state avec CTA vers `/dashboard/emails/new`
- [x] **`/dashboard` (home)** : onboarding 3 étapes si `cvCount === 0 && applicationCount === 0`

#### 2. Skeleton Screens
- [x] `src/app/dashboard/cv/loading.tsx` : skeleton grille CVs avec pulse animation
- [x] `src/app/dashboard/jobs/loading.tsx` : skeleton Kanban 6 colonnes
- [x] `src/app/dashboard/emails/loading.tsx` : skeleton liste emails
- [x] **`/dashboard/jobs/[id]`** : skeleton pendant parse (via `parsing` state + AiProgressOverlay)

#### 3. Feedback & États interactifs
- [x] **`cursor-pointer`** : tous les éléments cliquables ont `cursor: 'pointer'` dans inline styles
- [x] **Active state** : `.btn-primary:active { transform: scale(0.97); opacity: 0.85; }` dans globals.css
- [x] **Focus ring** : `:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }` dans globals.css
- [x] **Confirmation suppression** : `confirm('Supprimer...')` sur CV (cv/page.tsx), jobs (JobsKanban.tsx), emails (emails/page.tsx)
- [x] **Messages d'erreur précis** : les catch blocks utilisent `err.message` quand disponible

#### 4. Responsive (breakpoint minimal 768px)
- [x] **Sidebar** : hamburger en mobile (<768px) avec overlay + slide-in panel. État géré via `useState` + `matchMedia`
- [x] **Dashboard home** : `gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'` sur stat cards
- [x] **Kanban** : conteneur `minWidth: 900px` + `overflow: auto` pour scroll horizontal
- [x] **CV editor** : CSS media query cache nav sidebar et passe editor en 1 colonne sous 768px

---

## Agent B — Pipeline & Navigation (Frontend + appels aux API existantes)

### Mission
Améliorer le workflow du pipeline Kanban et la navigation globale. Cet agent utilise les API REST existantes (pas de modifications de schéma) mais peut faire des appels `fetch` côté client pour des mises à jour optimistes.

### Fichiers à modifier
- `src/app/dashboard/jobs/page.tsx` — page principale du Kanban
- `src/app/dashboard/jobs/[id]/page.tsx` — détail d'un job
- `src/app/dashboard/layout.tsx` — sidebar (badge d'interviews)
- `src/app/dashboard/emails/new/page.tsx` — composer un email
- `src/components/` — si des composants Kanban sont extraits

### Règles strictes
- Ne pas modifier le schéma Prisma ni les routes API
- Lire chaque fichier avant de le modifier
- Pour le drag & drop, vérifier d'abord que `@dnd-kit/core` n'est pas déjà dans `package.json`
- Les mises à jour de statut utilisent `PUT /api/jobs/[id]` avec `{ status: newStatus }` dans le body

### Architecture actuelle du Kanban à comprendre avant de coder
La page `src/app/dashboard/jobs/page.tsx` est un Server Component qui charge tous les jobs via Prisma, puis les distribue dans des colonnes côté serveur. Pour rendre le drag & drop possible, il faudra extraire la logique de rendu des colonnes dans un Client Component séparé qui gère l'état local des jobs.

Pattern à suivre :
1. `jobs/page.tsx` (Server Component) : fetch les jobs, passe les données à un Client Component
2. `JobsKanban.tsx` (Client Component, `'use client'`) : gère l'état local + drag & drop

### Tâches

#### 1. Kanban Drag & Drop
- [x] **Installer les dépendances** : `@dnd-kit/core` et `@dnd-kit/utilities` installés
- [x] **Créer `src/components/JobsKanban.tsx`** : Client Component avec `DndContext`, `useDroppable` (colonnes), `useDraggable` (cards). Exporte le type `KanbanJob`.
- [x] **Mise à jour optimiste** : rollback via `useRef` si le `PUT /api/jobs/[id]` échoue
- [x] **Compteur par colonne** : badge circulaire dans chaque header de colonne

#### 2. Quick Actions sur les Cards
- [x] **Menu contextuel** : bouton `···` sur chaque card, dropdown inline avec Ouvrir / Statut → / Supprimer. Overlay transparent (`position: fixed, inset: 0`) ferme le menu au clic extérieur. `onPointerDown stopPropagation` évite de déclencher le drag depuis le menu.
- [x] **Badge "Inactif"** : badge `7j+` si `updatedAt` > 7 jours (couleur `var(--text-mute)`)
- [x] **Bouton email rapide** : lien `✉ email` sur les cards `applied` et `interview` → `/dashboard/emails/new?jobId=`

#### 3. Score de Match persisté
- [x] **`matchScore` sur Cv** : champ `matchScore Int?` ajouté au modèle `Cv` dans Prisma schema. Rempli par `/api/match` lors de la création d'un CV adapté.
- [x] **Affichage dans `/dashboard/jobs/[id]`** : badge coloré (vert/orange/rouge selon score) sur chaque CV lié dans la section "CV adaptés".

#### 4. Navigation & Orientation
- [x] **Badge interviews dans la Sidebar** : `useEffect` dans `Sidebar.tsx` fetch `/api/jobs` au changement de route (`pathname`), compte les `status === 'interview'`, affiche un badge vert. Présent dans les deux rendus (desktop + mobile).
- [x] **Breadcrumb** : déjà présent dans `jobs/[id]/page.tsx` (`← Candidatures | Titre`) — conforme.
- [x] **Email pré-rempli depuis URL** : `emails/new/page.tsx` lit `?jobId=` via `useSearchParams()` (Suspense boundary ajouté). Champ jobPostingId pré-rempli à l'initialisation du state.
- [x] **Lien email dans jobs/[id]** : corrigé vers `/dashboard/emails/new?jobId=` (était `/dashboard/emails?jobId=`)

---

## Agent C — Data Model (Schéma Prisma + nouvelles routes API)

### Mission
Étendre le modèle de données pour supporter les nouvelles features des Agents D et E. Cet agent travaille sur le schéma Prisma et crée les routes API nécessaires. Il ne touche pas au frontend.

### Fichiers à modifier
- `prisma/schema.prisma` — schéma de la base
- `src/app/api/jobs/[id]/route.ts` — route PUT existante à étendre
- `src/app/api/jobs/[id]/activity/route.ts` — nouvelle route à créer
- `src/lib/schemas.ts` — schémas Zod à mettre à jour

### Commandes à exécuter après chaque modification de schéma
```bash
npm run db:push      # Applique le schéma (SQLite : pas besoin de migration file)
npm run db:generate  # Régénère le client Prisma TypeScript
```

### Règles strictes
- Lire `prisma/schema.prisma` en entier avant de modifier
- Lire `src/lib/schemas.ts` avant de modifier
- Tous les nouveaux champs sont optionnels (`?`) pour ne pas casser l'existant
- Après `db:push`, redémarrer le dev server pour que les types soient pris en compte
- Ne pas modifier de fichiers frontend

### Tâches

#### 1. Ajouts au modèle `JobPosting`

Lire `prisma/schema.prisma` pour voir le modèle actuel, puis ajouter :

- [x] `source      String?` — origine du job (LinkedIn, Indeed, Referral, Direct, Other)
- [x] `salary      String?` — fourchette salariale en texte libre (ex: "45-55k€")
- [x] `notes       String?` — notes libres sur le poste / recruteur (champ déjà existant dans le schéma)
- [x] `followUpDate DateTime?` — date de relance planifiée

Après ajout : `npm run db:push && npm run db:generate`

- [x] **Mettre à jour `PUT /api/jobs/[id]`** (`src/app/api/jobs/[id]/route.ts`) : lire la route existante, puis ajouter `source`, `salary`, `notes`, `followUpDate` dans le `prisma.jobPosting.update()`. Valider ces champs avec Zod (les ajouter dans `src/lib/schemas.ts` dans le schéma existant des jobs, tous optionnels).

#### 2. Ajouts au modèle `Cv`

- [x] `matchScore  Int?` — score AI de correspondance (0–100), rempli par `/api/match`

Après ajout : `npm run db:push && npm run db:generate`

#### 3. Nouveau modèle `ActivityLog`

Ajouter dans `prisma/schema.prisma` :

```prisma
model ActivityLog {
  id          String     @id @default(cuid())
  jobId       String
  job         JobPosting @relation(fields: [jobId], references: [id], onDelete: Cascade)
  type        String     // CV_SENT | EMAIL_SENT | STATUS_CHANGED | PARSED | NOTE_ADDED
  description String
  createdAt   DateTime   @default(now())
}
```

Ajouter aussi la relation inverse sur `JobPosting` :
```prisma
activities  ActivityLog[]
```

Après ajout : `npm run db:push && npm run db:generate`

- [x] **Créer `src/app/api/jobs/[id]/activity/route.ts`** :
  - `GET` : retourne `prisma.activityLog.findMany({ where: { jobId }, orderBy: { createdAt: 'desc' } })`
  - `POST` : crée un log avec `{ type, description }` dans le body

- [x] **Brancher la création de logs** sur les routes existantes. Lire chaque route avant de modifier :
  - `PUT /api/jobs/[id]` : si le champ `status` change, créer un log `STATUS_CHANGED` avec description `"Statut changé vers [newStatus]"`
  - `POST /api/jobs/[id]/parse` (`src/app/api/jobs/[id]/parse/route.ts`) : après parse réussi, créer un log `PARSED`
  - `POST /api/emails/send` (`src/app/api/emails/send/route.ts`) : si l'email a un `jobPostingId`, créer un log `EMAIL_SENT` sur ce job
  - `POST /api/match` : après création du CV adapté, si `jobPostingId` est présent, créer un log `CV_SENT`

---

## Agent D — Nouvelles Features UI (dépend de Agent C)

### Prérequis obligatoire
**Agent C doit avoir terminé et appliqué les migrations** avant de démarrer cet agent. Vérifier que les champs suivants existent dans le schéma Prisma avant de coder :
- `JobPosting.source`, `JobPosting.salary`, `JobPosting.notes`, `JobPosting.followUpDate`
- Modèle `ActivityLog` avec route `GET /api/jobs/[id]/activity`

Pour vérifier : lire `prisma/schema.prisma` et faire un test GET sur la route d'activité.

### Mission
Ajouter les UI pour les nouveaux champs du modèle et implémenter la timeline d'activité par job.

### Fichiers à modifier
- `src/app/dashboard/jobs/[id]/page.tsx` — page détail job (principale cible)
- `src/app/dashboard/jobs/new/page.tsx` — formulaire nouveau job
- `src/app/dashboard/page.tsx` — home dashboard (section relances)

### Règles
- Styles inline uniquement, variables CSS existantes
- Lire chaque fichier cible en entier avant de modifier
- Les appels fetch doivent utiliser `PUT /api/jobs/[id]` pour les mises à jour
- Pas de nouvelles dépendances

### Tâches

#### 1. Champs Source et Salaire

- [x] **Formulaire `/dashboard/jobs/new`** (`src/app/dashboard/jobs/new/page.tsx`) : ajouter un champ `source` de type `<select>` avec les options : LinkedIn, Indeed, Referral, Direct, Autre. Et un champ `salary` texte libre (ex: placeholder "45-55k€"). Ces champs sont optionnels. Ils doivent être inclus dans le `POST /api/jobs`.

- [x] **Page détail `/dashboard/jobs/[id]`** : ajouter une section "Informations" (ou intégrer aux champs existants) avec :
  - Affichage/édition de `source` (select identique)
  - Affichage/édition de `salary` (input texte)
  - Bouton "Sauvegarder" qui appelle `PUT /api/jobs/[id]` avec les champs modifiés

#### 2. Notes par Job

- [x] Dans `/dashboard/jobs/[id]` : ajouter une section "Notes" avec un `<textarea>` pré-rempli avec `job.notes`. Implémenter un auto-save avec debounce de 1 seconde : à chaque keystroke, attendre 1s d'inactivité puis appeler `PUT /api/jobs/[id]` avec `{ notes: value }`. Afficher un indicateur discret "Sauvegardé" / "Sauvegarde…" à côté du titre de la section.

  Pattern debounce en React sans librairie :
  ```tsx
  const timerRef = useRef<NodeJS.Timeout>()
  const handleChange = (value: string) => {
    setNotes(value)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => saveNotes(value), 1000)
  }
  ```

#### 3. Date de Relance

- [x] Dans `/dashboard/jobs/[id]` : ajouter un champ `<input type="date">` pour `followUpDate`. Sauvegarder via `PUT /api/jobs/[id]` au changement (via bouton "Sauvegarder" de la section Informations).

- [x] Dans le Kanban (`src/app/dashboard/jobs/page.tsx` ou le composant extrait par Agent B) : si `job.followUpDate` existe et est dans les 2 prochains jours, afficher un badge "Relance J-X" sur la card avec la couleur `var(--warn)`.

#### 4. Timeline d'Activité

- [x] Dans `/dashboard/jobs/[id]` : ajouter une section "Activité" en bas de la page (après les sections CVs liés et Emails liés). Cette section est un Client Component (`'use client'`) qui appelle `GET /api/jobs/[id]/activity` au montage.

  Afficher une liste verticale chronologique. Pour chaque log :
  - Icône selon le `type` : utiliser des caractères simples (`→` pour STATUS_CHANGED, `✉` pour EMAIL_SENT, `◎` pour PARSED, `✦` pour CV_SENT)
  - Description du log
  - Timestamp relatif : calculer "il y a 2j", "il y a 1h" depuis `createdAt` (pas de librairie — implémenter une fonction utilitaire `timeAgo(date: Date): string`)

#### 5. Section "Relances à faire" sur le Dashboard

- [x] Dans `src/app/dashboard/page.tsx` (Server Component) : ajouter une requête Prisma pour récupérer les jobs dont `followUpDate <= new Date()` et `status NOT IN ['rejected', 'archived']`. Afficher ces jobs dans une section "Relances du jour" sous forme de liste simple avec le titre du job, l'entreprise et un lien vers `/dashboard/jobs/[id]`.

---

## Agent E — Features AI (peut démarrer partiellement en parallèle d'Agent C)

### Prérequis
- **Interview Prep** : aucun prérequis — les données nécessaires (`parsedData`, CV lié) existent déjà
- **Auto-save CV** : aucun prérequis
- **Match score** : nécessite qu'Agent C ait ajouté `Cv.matchScore` (vérifier avant de coder cette partie)

### Mission
Ajouter ou améliorer les features utilisant l'IA : interview prep, auto-save CV editor, amélioration de la génération d'emails.

### Architecture AI à comprendre avant de coder
Lire `src/lib/ai.ts` en entier. Toutes les fonctions AI suivent ce pattern :
```ts
export async function maFonctionAI(input: ...) {
  const client = await getAiClient()  // Lit la config depuis la DB
  const model = await getModel()
  const response = await client.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    ...
  })
  return response.choices[0].message.content
}
```
`stripJson(str)` dans le même fichier nettoie les backticks markdown des réponses JSON de l'AI.

### Fichiers à modifier
- `src/lib/ai.ts` — nouvelles fonctions AI
- `src/app/api/jobs/[id]/interview-prep/route.ts` — nouvelle route à créer
- `src/app/dashboard/jobs/[id]/page.tsx` — bouton + affichage interview prep
- `src/components/cv/CVEditor.tsx` — auto-save

### Tâches

#### 1. Interview Prep

- [x] **Ajouter `generateInterviewPrep()` dans `src/lib/ai.ts`** : prend en paramètres `parsedData: string` et `cvContent: string`. Retourne JSON avec 10 questions et hints.
- [x] **Créer `src/app/api/jobs/[id]/interview-prep/route.ts`** : route `POST`, trouve le CV lié le plus récent, appelle `generateInterviewPrep()`.
- [x] **Ajouter le bouton dans `/dashboard/jobs/[id]`** : affiché uniquement si `job.status === 'interview'` et qu'un CV lié existe. Affiche les questions dans une section expandable.

#### 2. Auto-save sur le CV Editor

- [x] **Debounce 30s** : `useRef` timer, sauvegarde auto après 30s d'inactivité. Empêche les doubles saves si < 5s depuis dernière sauvegarde.
- [x] **Indicateur d'état** : "✓ Sauvegardé" / "…" en cours / "✕ erreur" à côté du bouton.
- [x] **Pas de double save** : bouton manuel désactivé si < 5s depuis auto-save.

#### 3. Génération d'Objet Email par AI

- [x] **Ajouter `generateEmailSubject()` dans `src/lib/ai.ts`** : prend `jobTitle`, `company`, `applicantName`. Retourne un string (objet de l'email).
- [x] **Intégrer dans `emails/new/page.tsx`** : bouton "✦ Générer" à côté du champ subject, appelé si `form.jobPostingId` est présent et subject vide.

---

## Ordre de déploiement

```
Phase 1 (entièrement parallèle)
  ├── Agent A  — UI Polish
  ├── Agent B  — Pipeline & Navigation
  └── Agent C  — Data Model

Phase 2 (après que Agent C est terminé et migrations appliquées)
  ├── Agent D  — Nouvelles Features UI
  └── Agent E  — Features AI (partiellement démarrables avant)
```

---

## Glossaire des statuts de tâche

| Symbole | Signification |
|---------|--------------|
| `- [ ]` | À faire |
| `- [x]` | Terminé |
| `- [-]` | Abandonné / hors scope |
| `- [~]` | En cours |
