// Glassy bento profile card rendered as a global footer beneath every route.
// Pure presentational — no state, no I/O — so it's safe to mount once per app.

const GITHUB_URL = 'https://github.com/asfalanoij';
const LINKEDIN_URL = 'https://www.linkedin.com/in/rudyprasetiya/';
const EMAIL = 'prasetiyarudy@gmail.com';

const AVATAR_URL = `${import.meta.env.BASE_URL}rudy.png`;

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.327-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23a11.5 11.5 0 016 0c2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

export function BentoProfileCard() {
  return (
    <div className="mx-auto w-full max-w-sm px-4">
      <article
        data-testid="bento-profile-card"
        className="relative overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-br from-slate-100/80 via-slate-200/60 to-slate-400/40 p-8 shadow-xl backdrop-blur-md"
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 rounded-full bg-white/50 p-1 ring-4 ring-white/60 backdrop-blur-sm">
            <img
              src={AVATAR_URL}
              alt="Rudy Prasetiya avatar"
              className="h-28 w-28 rounded-full bg-white object-cover"
              width={112}
              height={112}
              loading="lazy"
            />
          </div>
          <h3 className="text-xl font-bold text-ink">Rudy Prasetiya</h3>
          <p className="mt-1 text-sm text-ink-3">GRC - ERM Engineer</p>
          <div className="mt-5 flex items-center gap-3">
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="LinkedIn profile"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-ink-2 ring-1 ring-white/60 backdrop-blur-sm transition hover:bg-white hover:text-ink"
            >
              <LinkedInIcon />
            </a>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="GitHub profile"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-ink-2 ring-1 ring-white/60 backdrop-blur-sm transition hover:bg-white hover:text-ink"
            >
              <GitHubIcon />
            </a>
            <a
              href={`mailto:${EMAIL}`}
              aria-label={`Email ${EMAIL}`}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-ink-2 ring-1 ring-white/60 backdrop-blur-sm transition hover:bg-white hover:text-ink"
            >
              <MailIcon />
            </a>
          </div>
        </div>
      </article>
    </div>
  );
}
