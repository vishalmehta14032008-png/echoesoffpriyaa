/**
 * ✏️  Everything Priya reads lives in this file.
 * Edit the words here — no need to touch any component.
 */

export const content = {
  her: "Priya",
  /** How you appear in the chat by default — put your own name here (it can also be changed in the chat). */
  me: "Someone 🦋",

  site: {
    title: "Echoes of Priya",
    tagline: "A tiny world, made just for you.",
  },

  music: {
    /**
     * 🎵 Put your licensed copy of the song at: public/music/i-wanna-be-yours.mp3
     * (or change this path / use any https URL you have the rights to).
     * If the file is missing, a soft built-in music-box melody plays instead.
     */
    src: "/music/i-wanna-be-yours.mp3",
    title: "I Wanna Be Yours",
    artist: "Arctic Monkeys",
    fallbackTitle: "a little music box",
  },

  intro: {
    greeting: "Hi Priya…",
    lines: [
      "Some people enter your life quietly…",
      "and somehow make everything feel a little different.",
    ],
    cta: "Enter my little world",
    soundHint: "Best experienced with sound on 🎧",
  },

  echoes: {
    eyebrow: "Chapter two",
    title: "The Echoes",
    story: [
      "There's something about you…",
      "I can't really explain it.",
      "Maybe it's the way you stay in my thoughts a little longer than you should.",
      "Or maybe it's how one small moment with you keeps replaying in my head — like a song I didn't know I needed.",
      "Ever since we last saw each other, my days have had this quiet echo in them. It sounds a lot like you.",
    ],
    cardsHint: "tap a note to open it",
    cards: [
      {
        icon: "💭",
        label: "A thought.",
        note: "The one that shows up uninvited at 2 a.m. I never mind. It's usually you.",
      },
      {
        icon: "☺︎",
        label: "A smile.",
        note: "The one I catch on my own face whenever your name lights up my screen. I've stopped trying to hide it.",
      },
      {
        icon: "✧",
        label: "A memory.",
        note: "The last time we saw each other. I've replayed it more times than I'd ever admit out loud.",
      },
      {
        icon: "🦋",
        label: "A little reason to think about you.",
        note: "Your eyes. I still don't know what it is about them — I just know I keep falling for them, every single time.",
      },
    ],
    outro: "But there's something I haven't said yet…",
    next: "Keep going",
  },

  proposal: {
    eyebrow: "Chapter three",
    name: "Priya…",
    message: [
      "I'm not very good at saying things like this out loud, so I made you a little world instead.",
      "Lately you've been wandering through my days and my dreams, and honestly, I don't want either of them to be without you.",
      "I'm not asking for forever, or for anything you're not ready to give. I just wanted to be honest about how I feel —",
      "I really like you.",
    ],
    lead: "So… I wanted to ask you something.",
    reveal: "Tap to see",
    question: "Would you like to be a part of my little story?",
    yes: "Yes",
    think: "Let me think…",
    yesTitle: "You just made a whole little world very happy.",
    yesMessage:
      "Thank you, Priya. I promise to keep this story gentle, warm and full of good chapters — starting with this one. 🦋",
    thinkTitle: "Take your time.",
    thinkMessage:
      "Some answers are worth thinking about. 🌷 There's no rush and no wrong answer — this little world isn't going anywhere.",
    toCorner: "Come to our little corner 💌",
    changeMind: "Actually… yes 💗",
  },

  secret: {
    title: "You found a little secret. 🦋",
    message:
      "In my dreams, you're always there… and in real life, you've somehow become the dream. I wrote that first, got shy, and hid it here.",
  },

  easterEgg: {
    title: "Okay, you're officially curious. 🌙",
    message:
      "I like that about you. A tiny confession: I was smiling the entire time I was making this — every single line of it.",
  },

  corner: {
    title: "Our Little Corner",
    subtitle: "A private place, just for the two of us.",
    codeLabel: "Your secret word",
    codeHint: "The little password you were given. No phone numbers here — ever.",
    nameLabel: "What should I call you here?",
    empty: "It's quiet in here… say hi first? 🌸",
    placeholder: "Write something sweet…",
  },
};

export type Content = typeof content;
