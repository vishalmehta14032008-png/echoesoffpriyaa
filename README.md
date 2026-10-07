# Echoes of Priya 🦋

A tiny, dreamy, interactive world made for one person: Priya. It's built as three cinematic chapters that end in a gentle question, plus a private two-way chat called **Our Little Corner 💌**.

- **Chapter 1, "A Little Something For You":** an animated greeting with an "Enter my little world ✨" button. Clicking it starts the music, sends a flock of butterflies across the screen and wakes up the fireflies and petals.
- **Chapter 2, "The Echoes":** a short story, then four little notes that flip open on tap to show hidden messages.
- **Chapter 3, "The Proposal":** a dusk-lit, slower chapter that ends with *"Would you like to be a part of my little story?"* and two honest buttons: 💗 Yes / 🌸 Let me think…
- **Our Little Corner (`/corner`):** a private chat between Priya and you. It doesn't use phone numbers or WhatsApp.
- **Surprises:** a faint butterfly hidden on the first screen, plus an easter egg (tap the little moon in the top-left 5 times, or type `priya`). There's also a cursor trail on desktop, swipe navigation on phones, and parallax from tilt or pointer.

## Tech

React 19 + Vite · Framer Motion · hand-written CSS (glassmorphism, no CSS framework) · canvas particle systems · Netlify Functions · Netlify Database (managed Postgres) with Drizzle ORM.

---

## 1. Install dependencies

```bash
npm install
```

## 2. Run locally

Use the Netlify CLI so the chat API and database work locally too:

```bash
cp .env.example .env        # then fill in two secret words
netlify dev
```

If you only want the front-end (no chat), `npm run dev` works too.

## 3. Build

```bash
npm run build      # outputs to dist/
```

## 4. Deploy to Netlify

1. Push this repo to GitHub/GitLab and click **Add new site → Import an existing project** in Netlify. You can also run `netlify deploy --prod`.
2. Build settings are already set in `netlify.toml` (build: `npm run build`, publish: `dist`, functions: `netlify/functions`).
3. SPA routing is handled by the `/* → /index.html 200` redirect, so `/corner` and refreshes always work.
4. Add the environment variables below, then **redeploy**.

## 5. Required environment variables

Set these in **Netlify → Site configuration → Environment variables**:

| Variable | What it is |
| --- | --- |
| `PRIYA_ACCESS_CODE` | Priya's secret word for the chat. Make it long and unique. |
| `OWNER_ACCESS_CODE` | Your secret word for the chat. It must be different from Priya's. |

These only exist on the server. They are never bundled into the front-end. The database needs no variables because Netlify Database connects automatically.

Until both are set, the chat page shows a soft "still being decorated" message instead of an error.

## 6. Backend / database setup

You don't need to do anything by hand:

- Netlify Database (Postgres) is provisioned automatically on first deploy.
- The schema lives in `db/schema.ts`, and its migration is already generated in `netlify/database/migrations/`. Netlify applies it automatically on deploy.
- There are two tables:
  - `messages`: `id`, `author_role` (`priya` | `owner`), `author_name`, `body`, `created_at`
  - `presence`: one row per person, holding `typing_at` (for the typing indicator) and `last_seen`

If you change the schema later, run `npx drizzle-kit generate --name describe_change` and commit the new migration.

## 7. Where to put the music file 🎵

The song **"I Wanna Be Yours"** is copyrighted, so it isn't included. To add your licensed copy:

1. Save it as **`public/music/i-wanna-be-yours.mp3`**, or point `content.music.src` in `src/content.ts` at any URL you have the rights to use.
2. Redeploy.

Until the file is there, the player plays a soft, generated music-box lullaby instead, so the site is never silent and never throws errors. Music only starts after Priya taps a button, and the player sits above the router, so it **never restarts** when she changes chapters or opens the chat.

## 8. Where to edit Priya's messages

All of the text is in **`src/content.ts`**: the greeting, story lines, the four notes, the proposal, the answers, the secret, the easter egg and the chat labels. Edit the words there and redeploy. You don't need to touch any component. Set `me` to the name you want to appear in the chat.

## 9. How the chat works

- **Identity without phone numbers.** Each person has a secret word (the env vars above). On `/corner`, the person enters their word and the server decides whether they are `priya` or `owner`. The browser can't choose its own role. After that, each person picks a display name.
- **Your (owner) side.** Open `https://<your-site>/corner` and enter `OWNER_ACCESS_CODE`. Your bubbles are lavender. Priya's are blush pink.
- **Priya's side.** Send her `https://<your-site>/corner#k=HER_SECRET_WORD`. The link logs her straight in and then removes the code from the address bar. You can also just send the plain `/corner` link and tell her the word.
- **Live updates.** The chat checks for new messages every 2.5 seconds while it's open, and slows down when the tab is in the background to save battery. The typing indicator and "here now / seen 5 min ago" status come from the `presence` table.
- **Storage.** Messages are stored in Netlify Database (Postgres) and stay there permanently. The device only remembers who is logged in, in `localStorage`. "Leave this device" in the ⋮ menu forgets it.

### Securing the chat

- Use long, unguessable secret words. Change them anytime in Netlify and redeploy, which logs out every device.
- Server-side code compares codes in constant time and limits messages to 2,000 characters and names to 40 characters.
- The site sends `noindex`, `X-Frame-Options: DENY` and `Referrer-Policy: no-referrer`.
- No phone number, Instagram handle or WhatsApp link appears anywhere on the site.
- Only share Priya's magic link with her privately.

## 10. Changing content later

| What | Where |
| --- | --- |
| All words | `src/content.ts` |
| Colours, fonts, spacing | CSS variables at the top of `src/styles.css` |
| Music | `public/music/` + `content.music` |
| Chapter order / behaviour | `src/pages/Experience.tsx` and `src/slides/*` |
| Chat API | `netlify/functions/chat.mts` |
| Favicon | `public/favicon.svg` |

## Accessibility & performance

- Respects `prefers-reduced-motion`: animations are softened, the drifting butterflies are hidden, and the proposal shows instantly.
- Particles are drawn from pre-rendered sprites on two canvases. Counts drop on phones, the pixel ratio is capped, and the animation pauses when the tab is hidden.
- All controls are real buttons with labels. Inputs use 16px text so phones don't zoom in. The layout resizes with the mobile keyboard.
