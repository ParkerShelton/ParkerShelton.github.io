# Parker Shelton — Author Website

A simple, fast, no-build-tools website: plain HTML/CSS/JS. Four pages: Home, Books, About, Contact.

## Structure

- `index.html` — homepage with hero, featured books, newsletter signup
- `books.html` — full book catalog
- `about.html` — author bio
- `contact.html` — contact form + press/social links
- `css/styles.css` — all styling
- `js/main.js` — mobile nav toggle + form handling

## Replacing placeholder content

- **Book covers**: each book has a `.book-cover` div with a colored gradient and title text as a stand-in. Swap it for a real image: `<img src="images/book-cover.jpg" alt="Book Title cover" />` inside `.book-cover`, and add matching sizing in CSS if needed.
- **Author photo**: same idea — replace the `.author-photo` div in `about.html` with an `<img>`.
- **Bio, blurbs, buy links**: search each HTML file for the book titles / bio paragraphs and edit directly. Buy links currently point to `#` — replace with your real Amazon/retailer URLs.
- **Email address**: update `parkerkshelton@gmail.com` in `contact.html`.

## Wiring up the forms (currently stubs)

Both the newsletter signup and the contact form just show a "thanks" message locally — they don't send anything anywhere yet. To make them real:

**Newsletter signup** (`.signup-form` on `index.html` and `books.html`):
- Sign up for an email provider like Mailchimp, ConvertKit, or Buttondown.
- They'll give you a form `action` URL and field names — swap those into the `<form>` tag, or follow their embed instructions.

**Contact form** (`contact.html`):
- Easiest option: [Formspree](https://formspree.io) or [Netlify Forms](https://docs.netlify.com/forms/setup/) — both let a plain HTML form send you an email with just an `action` attribute (Formspree) or a `data-netlify="true"` attribute (Netlify, if you host there).

## Previewing locally

From this folder, run:

```
python -m http.server 5500
```

Then open `http://localhost:5500`.

## Deploying (free)

**Netlify (easiest, no git needed):**
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag this whole folder in — it's live in seconds with a free `.netlify.app` URL.
3. You can add a custom domain later in site settings.

**Vercel or GitHub Pages (if you want git-based deploys):**
1. Push this folder to a GitHub repo.
2. Import it in Vercel, or enable GitHub Pages in the repo settings.

If you go the Netlify Forms route above, deploying on Netlify also makes the contact form work with zero extra setup.
