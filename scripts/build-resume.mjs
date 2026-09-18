// Builds public/resume.pdf from the portfolio's data files, so the résumé and
// the site can never disagree again. Edit src/data/, then run `pnpm resume`.
//
// Needs Node 23.6+ (the .ts data files are imported directly through Node's
// built-in type stripping) and Google Chrome, which prints the page. Set
// CHROME_PATH if Chrome isn't at the macOS default location.

import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { contact } from "../src/data/contact.ts";
import { persona } from "../src/data/persona.ts";
import { projects } from "../src/data/projects.ts";
import { resume } from "../src/data/resume.ts";
import { skills } from "../src/data/skills.ts";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUTPUT = path.join(ROOT, "public", "resume.pdf");
const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const SITE = "buildwithjazz.com";

const esc = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const bareUrl = (url) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
const span = (start, end) => (start === end ? start : `${start} – ${end}`);

/** "+639389036717" → "+63 938 903 6717"; other formats pass through untouched. */
function formatPhone(phone) {
  const ph = phone.match(/^\+63(\d{3})(\d{3})(\d{4})$/);
  return ph ? `+63 ${ph[1]} ${ph[2]} ${ph[3]}` : phone;
}

const bySlug = new Map(projects.map((project) => [project.slug, project]));
function pickProjects(slugs) {
  return slugs.map((slug) => {
    const project = bySlug.get(slug);
    if (!project) throw new Error(`resume.ts lists a project slug that doesn't exist: "${slug}"`);
    return project;
  });
}

function socialUrl(icon) {
  const social = contact.socials.find((entry) => entry.icon === icon);
  if (!social) throw new Error(`contact.ts has no "${icon}" social link`);
  return social.url;
}

function buildHtml() {
  const github = socialUrl("github");
  const linkedin = socialUrl("linkedin");
  const bullets = (items) => `<ul>${items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;

  const experience = resume.experience
    .map(
      (job) => `
      <div class="entry">
        <div class="entry-head">
          <h3>${esc(job.role)} <span class="muted">· ${esc(job.company)}</span></h3>
          <span class="dates">${esc(span(job.startDate, job.endDate))}</span>
        </div>
        ${job.highlights?.length ? bullets(job.highlights) : `<p>${esc(job.description)}</p>`}
      </div>`,
    )
    .join("");

  const earlier = resume.earlierExperience
    .map(
      (role) =>
        `<p><strong>${esc(role.role)}</strong>, ${esc(role.company)} (${esc(span(role.startDate, role.endDate))}). ${esc(role.summary)}</p>`,
    )
    .join("");

  const featured = pickProjects(resume.featuredProjects)
    .map((project) => {
      if (!project.resumeBullets?.length) throw new Error(`"${project.slug}" is featured but has no resumeBullets`);
      return `
      <div class="entry">
        <h3>${esc(project.title)} <span class="stack">${project.tech.slice(0, 6).map(esc).join(" · ")}</span></h3>
        ${bullets(project.resumeBullets)}
      </div>`;
    })
    .join("");

  const alsoBuilt = pickProjects(resume.alsoBuilt)
    .map((project) => esc(project.title))
    .join(" · ");

  const skillRows = skills
    .map((category) => {
      const names = category.items.filter((skill) => (skill.level ?? 2) >= 2).map((skill) => esc(skill.name));
      return `<div><dt>${esc(category.category)}</dt><dd>${names.join(", ")}</dd></div>`;
    })
    .join("");

  const education = resume.education
    .map(
      (school) =>
        `<p><strong>${esc(school.degree)} in ${esc(school.field)}</strong>, ${esc(school.school)} (${school.startYear} – ${school.endYear})</p>`,
    )
    .join("");

  const credentials = [
    ...resume.certificates.map(
      (cert) => `<li><strong>${esc(cert.name)}</strong>, ${esc(cert.issuer)} (${esc(cert.date)})</li>`,
    ),
    ...resume.learning.map(
      (item) => `<li><strong>${esc(item.name)}</strong> (${esc(item.date)}). ${esc(item.detail)}</li>`,
    ),
  ].join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(persona.name)} Résumé</title>
<style>
  @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap");
  @page { size: Letter; margin: 0.5in 0.55in; }
  :root { --ink: #111820; --muted: #3e4952; --accent: #008e92; --rule: #d2d8dd; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: "Poppins", "Helvetica Neue", Arial, sans-serif; font-size: 8.8pt; line-height: 1.38; color: var(--ink); }
  a { color: inherit; text-decoration: none; }
  h1 { font-size: 20pt; font-weight: 600; letter-spacing: -0.02em; line-height: 1.1; }
  .headline { font-size: 10.5pt; font-weight: 500; color: var(--accent); margin-top: 2pt; }
  .contact { color: var(--muted); font-size: 8.3pt; margin-top: 5pt; }
  .availability { font-size: 8.3pt; font-weight: 500; margin-top: 2pt; }
  section { margin-top: 9pt; }
  h2 { font-size: 8.3pt; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--accent);
       border-bottom: 0.75pt solid var(--rule); padding-bottom: 2pt; margin-bottom: 5pt; }
  .entry { margin-bottom: 6pt; break-inside: avoid; }
  .entry-head { display: flex; justify-content: space-between; align-items: baseline; gap: 12pt; }
  h3 { font-size: 9.3pt; font-weight: 600; }
  .muted { font-weight: 400; color: var(--muted); }
  .stack { font-size: 7.8pt; font-weight: 400; color: var(--muted); margin-left: 4pt; }
  .dates { color: var(--muted); font-size: 8.3pt; white-space: nowrap; }
  ul { margin: 2pt 0 0 11pt; }
  li { margin-bottom: 1.5pt; padding-left: 1pt; }
  li::marker { color: var(--accent); }
  .earlier p, .also { color: var(--muted); font-size: 8.3pt; margin-top: 2pt; }
  .skills div { display: flex; gap: 8pt; margin-bottom: 2pt; }
  dt { font-weight: 600; width: 1.3in; flex-shrink: 0; }
  ul.plain { margin-left: 11pt; }
</style>
</head>
<body>
  <header>
    <h1>${esc(persona.name)}</h1>
    <p class="headline">${esc(resume.headline)}</p>
    <p class="contact">
      <a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a> · ${esc(formatPhone(persona.phone))} (WhatsApp) · ${esc(persona.location)}<br>
      <a href="https://www.${SITE}">${SITE}</a> · <a href="${esc(github)}">${esc(bareUrl(github))}</a> · <a href="${esc(linkedin)}">${esc(bareUrl(linkedin))}</a>
    </p>
    <p class="availability">${esc(contact.availability)}. ${esc(contact.schedule)}.</p>
  </header>

  <section><h2>Summary</h2><p>${esc(resume.summary)}</p></section>

  <section><h2>Experience</h2>${experience}<div class="earlier">${earlier}</div></section>

  <section><h2>Selected Projects</h2>${featured}<p class="also"><strong>Also built:</strong> ${alsoBuilt}</p></section>

  <section><h2>Skills</h2><dl class="skills">${skillRows}</dl></section>

  <section><h2>Education</h2>${education}</section>

  <section><h2>Certifications &amp; Learning</h2><ul class="plain">${credentials}</ul></section>
</body>
</html>`;
}

/** Minimal Chrome DevTools Protocol client over Node's built-in WebSocket. */
async function connect(url) {
  const socket = new WebSocket(url);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  let nextId = 0;
  const pending = new Map();
  const waiters = new Map();
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
    } else if (message.method && waiters.has(message.method)) {
      waiters.get(message.method)();
      waiters.delete(message.method);
    }
  });
  return {
    send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = ++nextId;
        pending.set(id, { resolve, reject });
        socket.send(JSON.stringify({ id, method, params }));
      });
    },
    once(method) {
      return new Promise((resolve) => waiters.set(method, resolve));
    },
    close: () => socket.close(),
  };
}

/** Chrome writes the port it picked into DevToolsActivePort in its profile directory. */
async function waitForDevToolsPort(profile) {
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      const [port] = (await readFile(path.join(profile, "DevToolsActivePort"), "utf8")).split("\n");
      if (port) return port;
    } catch {
      // Not written yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Chrome didn't start. Is it installed at ${CHROME}? Set CHROME_PATH if not.`);
}

async function printToPdf(htmlPath) {
  const profile = await mkdtemp(path.join(tmpdir(), "resume-chrome-"));
  const chrome = spawn(
    CHROME,
    ["--headless=new", "--disable-gpu", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank"],
    { stdio: "ignore" },
  );
  try {
    const port = await waitForDevToolsPort(profile);
    const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    const cdp = await connect(targets.find((target) => target.type === "page").webSocketDebuggerUrl);
    await cdp.send("Page.enable");
    const loaded = cdp.once("Page.loadEventFired");
    await cdp.send("Page.navigate", { url: pathToFileURL(htmlPath).href });
    await loaded;
    const fonts = await cdp.send("Runtime.evaluate", {
      expression: 'document.fonts.ready.then(() => document.fonts.check("9pt Poppins"))',
      awaitPromise: true,
      returnByValue: true,
    });
    if (!fonts.result.value) console.warn("Poppins didn't load (offline?); the PDF uses the fallback font.");
    const { data } = await cdp.send("Page.printToPDF", { preferCSSPageSize: true, printBackground: true });
    cdp.close();
    return Buffer.from(data, "base64");
  } finally {
    chrome.kill();
    await rm(profile, { recursive: true, force: true });
  }
}

const workDir = await mkdtemp(path.join(tmpdir(), "resume-"));
try {
  const htmlPath = path.join(workDir, "resume.html");
  await writeFile(htmlPath, buildHtml());
  await writeFile(OUTPUT, await printToPdf(htmlPath));
  console.log(`Wrote ${path.relative(ROOT, OUTPUT)}`);
} finally {
  await rm(workDir, { recursive: true, force: true });
}
