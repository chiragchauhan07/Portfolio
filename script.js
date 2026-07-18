// ---- Intro sequence: नमस्ते → glitch → Hello! → reveal homepage ----
const loader = document.getElementById("loader");
const loaderWord = document.getElementById("loaderWord");
const loaderImg = document.getElementById("loaderImg");
let introDone = false;

const finishIntro = () => {
  if (introDone) return;
  introDone = true;
  loader.classList.add("is-done");
  document.body.classList.add("is-loaded");
};

if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
  finishIntro();
} else {
  setTimeout(() => {
    loaderWord.textContent = "Hello!";
    loaderWord.dataset.text = "Hello!";
    loaderImg.src = "excited_hello.png";
    loaderWord.classList.add("is-glitching");
    loaderImg.classList.add("is-glitching");
  }, 800);
  setTimeout(finishIntro, 2300);
  loader.addEventListener("click", finishIntro);
}

// ---- Footer year ----
document.getElementById("year").textContent = new Date().getFullYear();

// ---- Smooth anchor scrolling (CSS scroll-behavior breaks ScrollTrigger) ----
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const target = document.querySelector(a.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  });
});

// ---- Nav: active section indicator ----
const spyLinks = [...document.querySelectorAll("[data-spy]")];
const spyObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    spyLinks.forEach((l) =>
      l.classList.toggle("is-active", l.dataset.spy === entry.target.id));
  });
}, { rootMargin: "-40% 0px -55% 0px" });
["about", "work", "skills", "experience", "contact"]
  .forEach((id) => spyObserver.observe(document.getElementById(id)));

// ---- Pointer-fine interactions (magnetic hover, avatar parallax) ----
if (matchMedia("(pointer: fine)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  // Magnetic hover
  document.querySelectorAll(".magnetic").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${dx * 0.25}px, ${dy * 0.25}px)`;
    });
    el.addEventListener("mouseleave", () => { el.style.transform = ""; });
  });

  // Hero avatar: very subtle mouse parallax (static otherwise)
  const heroVisual = document.getElementById("heroVisual");
  const heroSection = document.querySelector(".hero");
  if (heroVisual && heroSection) {
    let px = 0, py = 0, ptx = 0, pty = 0;
    heroSection.addEventListener("mousemove", (e) => {
      const r = heroSection.getBoundingClientRect();
      ptx = ((e.clientX - r.left) / r.width - 0.5) * 10;
      pty = ((e.clientY - r.top) / r.height - 0.5) * 8;
    }, { passive: true });
    heroSection.addEventListener("mouseleave", () => { ptx = 0; pty = 0; });
    (function parallaxLoop() {
      px += (ptx - px) * 0.08;
      py += (pty - py) * 0.08;
      heroVisual.style.transform = `translate(${px}px, ${py}px)`;
      requestAnimationFrame(parallaxLoop);
    })();
  }
}

// ---- About headline: reveal once, then a single subtle glitch pulse ----
const aboutTitle = document.getElementById("aboutTitle");
if (aboutTitle) {
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ioTitle = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      aboutTitle.classList.add("is-in");
      if (!reduceMotion) {
        setTimeout(() => {
          aboutTitle.classList.add("is-glitching");
          setTimeout(() => aboutTitle.classList.remove("is-glitching"), 420);
        }, 400);
      }
      ioTitle.unobserve(aboutTitle);
    });
  }, { threshold: 0.4 });
  ioTitle.observe(aboutTitle);
}

// ---- GSAP scroll experiences ----
if (window.gsap && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  gsap.registerPlugin(ScrollTrigger);

  // Chapter titles: masked slide reveal
  document.querySelectorAll(".chapter, .contact").forEach((ch) => {
    const masks = ch.querySelectorAll(".chapter__mask span, .contact__line span");
    if (!masks.length) return;
    gsap.from(masks, {
      yPercent: 110,
      duration: 1.1,
      stagger: 0.1,
      ease: "power4.out",
      scrollTrigger: { trigger: ch, start: "top 78%" },
    });
  });

  // Hero sinks as you leave (avatar stays put — static, not idle)
  gsap.to(".hero__title", {
    yPercent: 18,
    opacity: 0.15,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });

  // Work: ghost numeral parallax + title unmask + block reveals
  document.querySelectorAll(".work").forEach((work) => {
    gsap.fromTo(work.querySelector(".work__ghost"),
      { yPercent: 25 }, {
        yPercent: -25,
        ease: "none",
        scrollTrigger: { trigger: work, start: "top bottom", end: "bottom top", scrub: true },
      });
    gsap.from(work.querySelector(".work__title"), {
      yPercent: 105,
      duration: 1.1,
      ease: "power4.out",
      scrollTrigger: { trigger: work, start: "top 70%" },
    });
    gsap.from(work.querySelectorAll(".work__block, .work__link"), {
      opacity: 0,
      y: 40,
      duration: 0.9,
      stagger: 0.12,
      ease: "power3.out",
      scrollTrigger: { trigger: work.querySelector(".work__blocks"), start: "top 80%" },
    });
  });

  // Architecture diagrams: nodes slide in, lines grow
  document.querySelectorAll(".arch").forEach((arch) => {
    gsap.from(arch.querySelectorAll(".arch__node"), {
      opacity: 0,
      x: -30,
      duration: 0.6,
      stagger: 0.1,
      ease: "power3.out",
      scrollTrigger: { trigger: arch, start: "top 82%" },
    });
    gsap.from(arch.querySelectorAll(".arch__line"), {
      scaleY: 0,
      transformOrigin: "top",
      duration: 0.5,
      stagger: 0.1,
      delay: 0.15,
      ease: "power2.out",
      scrollTrigger: { trigger: arch, start: "top 82%" },
    });
  });

  // ---- Pinned capabilities: one technology at a time ----
  const techs = [
    ["PYTHON", "Language"], ["SQL", "Language"], ["C++", "Language"],
    ["FASTAPI", "Framework"], ["FLASK", "Framework"],
    ["RAG", "AI Systems"], ["LLM AGENTS", "AI Systems"], ["PROMPT ENGINEERING", "AI Systems"],
    ["VECTOR EMBEDDINGS", "AI Systems"], ["SEMANTIC SEARCH", "AI Systems"],
    ["SENTENCE TRANSFORMERS", "AI Systems"],
    ["PINECONE", "Data"], ["POSTGRESQL", "Data"], ["SUPABASE", "Data"], ["REDIS", "Data"],
    ["DOCKER", "Infrastructure"], ["AZURE", "Cloud"], ["GOOGLE CLOUD", "Cloud"],
  ];
  const wordEl = document.getElementById("stackWord");
  const catEl = document.getElementById("stackCat");
  const idxEl = document.getElementById("stackIdx");
  document.getElementById("stackTotal").textContent = String(techs.length).padStart(2, "0");
  let current = -1;

  const setTech = (i) => {
    if (i === current) return;
    current = i;
    wordEl.textContent = techs[i][0];
    wordEl.style.fontSize = `min(${Math.min(11, 100 / techs[i][0].length).toFixed(1)}vw, 11rem)`;
    catEl.textContent = techs[i][1];
    idxEl.textContent = String(i + 1).padStart(2, "0");
    wordEl.classList.toggle("is-ghost", i % 2 === 1);
    gsap.fromTo(wordEl, { opacity: 0, scale: 0.92, filter: "blur(6px)" },
      { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.35, ease: "power2.out", overwrite: true });
  };
  setTech(0);

  document.querySelector(".stack").style.height = `${techs.length * 34}vh`;
  ScrollTrigger.create({
    trigger: ".stack",
    start: "top top",
    end: "bottom bottom",
    pin: ".stack__pin",
    onUpdate: (self) => {
      setTech(Math.min(techs.length - 1, Math.floor(self.progress * techs.length)));
    },
  });

  // Pinning the capabilities section changes total page height after the
  // earlier triggers already measured their positions — recalculate everyone.
  ScrollTrigger.refresh();
} else {
  // No-motion fallback: capabilities as a static list
  const pin = document.querySelector(".stack__pin");
  pin.style.height = "auto";
  pin.style.padding = "clamp(5rem, 12vh, 9rem) var(--pad)";
  pin.style.alignItems = "flex-start";
  pin.style.textAlign = "left";
  pin.querySelector(".stack__hint").remove();
  pin.querySelector(".stack__count").remove();
  document.getElementById("stackCat").remove();
  document.querySelector(".chapter--overlay").style.position = "static";
  document.getElementById("stackWord").outerHTML =
    `<p style="font-size:clamp(1.3rem,2.6vw,2rem);font-weight:700;text-transform:uppercase;line-height:1.6;max-width:60rem">
      Python · SQL · C++ · FastAPI · Flask · RAG · LLM Agents · Prompt Engineering ·
      Vector Embeddings · Semantic Search · Sentence Transformers · Pinecone · PostgreSQL ·
      Supabase · Redis · Docker · Azure · Google Cloud</p>`;
}
