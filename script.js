// ---- Shared typewriter helper: reveals `text` into `el` one character at a
// time, calling `cb` once fully typed. ----
function typeInto(el, text, speed, cb) {
  let i = 0;
  (function tick() {
    el.textContent = text.slice(0, i++);
    if (i <= text.length) setTimeout(tick, speed);
    else if (cb) cb();
  })();
}

// ---- Hero greeting: the avatar is static — only a transient bubble says
// "Hi!". "I'm" and the name are already visible; once the bubble disappears
// the intro line glitches into the professional line. Runs once, right after
// the intro loader. ----
function startHeroGreeting() {
  const bubble = document.getElementById("heroBubble");
  if (!bubble) return;

  const meta = document.getElementById("heroMeta");
  const avatarStack = document.getElementById("heroAvatarStack");
  const avatarBase = document.getElementById("heroAvatarBase");
  const avatarAlt = document.getElementById("heroAvatarAlt");
  const greetLine = document.getElementById("heroGreet");
  const greetEl = document.getElementById("heroGreetText");
  const caret = document.getElementById("heroCaret");
  const WELCOME = "Nice to meet you.";
  const INTRO = "I'm an aspiring AI Engineer passionate about building production-ready AI products from intelligent models and scalable backends to polished user experiences and deployment.";
  const SCROLL_PROMPT = "Scroll down to know more about me.";

  const revealScrollPrompt = () => {
    if (avatarBase) avatarBase.classList.remove("is-active");
    if (avatarAlt) avatarAlt.classList.add("is-active");
    bubble.textContent = SCROLL_PROMPT;
    bubble.dataset.text = SCROLL_PROMPT;
    bubble.classList.add("is-in");
  };
  // 1. hide "Hi" bubble -> 2. wait ~300ms -> 3./4./5. glitch (white flash) +
  // cross-fade the pose images + reveal new bubble, all in place, the
  // avatar container/box never moves -> 6. settle (remove glitch).
  const revealScrollPromptWithGlitch = () => {
    bubble.classList.remove("is-in");
    setTimeout(() => {
      if (avatarStack) avatarStack.classList.add("is-glitching");
      bubble.classList.add("is-glitching");
      revealScrollPrompt();
      setTimeout(() => {
        if (avatarStack) avatarStack.classList.remove("is-glitching");
        bubble.classList.remove("is-glitching");
      }, 400);
    }, 300);
  };

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    if (meta) meta.classList.add("is-in");
    greetLine.classList.add("is-in");
    greetEl.textContent = INTRO;
    caret.classList.add("is-done");
    revealScrollPrompt();
    return;
  }

  if (meta) {
    setTimeout(() => {
      meta.classList.add("is-in");
      setTimeout(() => {
        meta.classList.add("is-glitching");
        setTimeout(() => meta.classList.remove("is-glitching"), 420);
      }, 400);
    }, 300);
  }

  setTimeout(() => bubble.classList.add("is-in"), 900);
  setTimeout(() => bubble.classList.remove("is-in"), 2900);
  setTimeout(() => {
    greetEl.textContent = WELCOME;
    greetLine.classList.add("is-in");
  }, 3300);
  setTimeout(() => {
    greetLine.dataset.text = WELCOME;
    greetLine.classList.add("is-glitching");
  }, 4300);
  setTimeout(() => {
    greetLine.classList.remove("is-glitching");
    greetEl.textContent = "";
    typeInto(greetEl, INTRO, 28, () => {
      caret.classList.add("is-done");
      setTimeout(revealScrollPromptWithGlitch, 600);
    });
  }, 4750);
}

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
  startHeroGreeting();
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
// The subtitle below it types in once the heading has settled.
const aboutTitle = document.getElementById("aboutTitle");
if (aboutTitle) {
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const aboutSubtitle = document.querySelector(".manifesto__subtitle");
  const subtitleText = aboutSubtitle ? aboutSubtitle.textContent : "";
  if (aboutSubtitle && !reduceMotion) aboutSubtitle.textContent = "";
  const ioTitle = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      aboutTitle.classList.add("is-in");
      if (!reduceMotion) {
        setTimeout(() => {
          aboutTitle.classList.add("is-glitching");
          setTimeout(() => aboutTitle.classList.remove("is-glitching"), 420);
        }, 400);
        if (aboutSubtitle) setTimeout(() => typeInto(aboutSubtitle, subtitleText, 30), 900);
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

  // Architecture diagrams: a single pulse travels down the pipeline once,
  // lighting up each node in sequence as it arrives — connector grows and
  // glows, the node brightens and lifts 3px, then everything settles.
  document.querySelectorAll(".arch").forEach((arch) => {
    const nodes = [...arch.querySelectorAll(".arch__node")];
    const lines = [...arch.querySelectorAll(".arch__line")];
    const tl = gsap.timeline({ scrollTrigger: { trigger: arch, start: "top 78%" } });

    const activate = (node) => {
      tl.add(() => node.classList.add("is-active"));
      tl.to(node, { y: -3, duration: 0.16, ease: "power2.out", yoyo: true, repeat: 1 }, "<");
    };

    tl.from(nodes[0], { opacity: 0, y: 22, duration: 0.45, ease: "power3.out" });
    activate(nodes[0]);

    nodes.slice(1).forEach((node, i) => {
      const line = lines[i];
      tl.add(() => line.classList.add("is-pulsing"));
      tl.fromTo(line, { scaleY: 0 }, { scaleY: 1, duration: 0.4, ease: "power1.inOut", transformOrigin: "top" }, "<");
      tl.from(node, { opacity: 0, y: 22, duration: 0.4, ease: "power3.out" }, "-=0.15");
      activate(node);
    });
  });

  // Project media: fade up + gentle scale-in, plus a slight parallax drift
  document.querySelectorAll("[data-media]").forEach((media) => {
    gsap.from(media, {
      opacity: 0,
      y: 30,
      scale: 0.96,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: { trigger: media, start: "top 85%" },
    });
    gsap.fromTo(media, { yPercent: -6 }, {
      yPercent: 6,
      ease: "none",
      scrollTrigger: { trigger: media, start: "top bottom", end: "bottom top", scrub: true },
    });
  });

  // ---- Screenshot galleries: deck → lightbox ----
  const lightbox = document.getElementById("lightbox");
  if (lightbox) {
    const lightboxImg = document.getElementById("lightboxImg");
    const galleries = {};
    let activeGallery = null;
    let activeIndex = 0;

    const showSlide = () => {
      const item = galleries[activeGallery][activeIndex];
      lightboxImg.src = item.src;
      lightboxImg.alt = item.alt;
    };
    const openLightbox = (name, index) => {
      activeGallery = name;
      activeIndex = index;
      showSlide();
      lightbox.classList.add("is-open");
      document.body.style.overflow = "hidden";
    };
    const closeLightbox = () => {
      lightbox.classList.remove("is-open");
      document.body.style.overflow = "";
    };
    const step = (dir) => {
      const len = galleries[activeGallery].length;
      activeIndex = (activeIndex + dir + len) % len;
      showSlide();
    };

    document.querySelectorAll("[data-gallery]").forEach((deck) => {
      const name = deck.dataset.gallery;
      const items = [...deck.querySelectorAll(".work__deck-item")];
      galleries[name] = items.map((btn) => {
        const img = btn.querySelector("img");
        return { src: img.src, alt: img.alt };
      });
      items.forEach((btn, i) => {
        btn.addEventListener("click", () => openLightbox(name, i));
      });
    });

    document.getElementById("lightboxClose").addEventListener("click", closeLightbox);
    document.getElementById("lightboxPrev").addEventListener("click", () => step(-1));
    document.getElementById("lightboxNext").addEventListener("click", () => step(1));
    lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    });
  }

  // ---- Pinned capabilities: one technology at a time ----
  const techs = [
    ["PYTHON", "Language", "skills_logos/Python.png"],
    ["SQL", "Language", "skills_logos/sql.png"],
    ["C++", "Language", "skills_logos/c++.webp"],
    ["FASTAPI", "Framework", "skills_logos/fastapi.svg"],
    ["FLASK", "Framework", "skills_logos/flask.png"],
    ["RAG", "AI Systems", "skills_logos/RAG.png"],
    ["LLM AGENTS", "AI Systems", "skills_logos/llm_agents.png"],
    ["PROMPT ENGINEERING", "AI Systems", "skills_logos/prompt-engineering-logo.png"],
    ["VECTOR EMBEDDINGS", "AI Systems", "skills_logos/vector_embeddings.png"],
    ["SEMANTIC SEARCH", "AI Systems", "skills_logos/semantic_search.png"],
    ["SENTENCE TRANSFORMERS", "AI Systems", "skills_logos/sentence_transformers.png"],
    ["GEMINI API", "AI Systems", "skills_logos/Google_Gemini.webp"],
    ["PINECONE", "Data", "skills_logos/Pinecone.png"],
    ["POSTGRESQL", "Data", "skills_logos/Postgresql_elephant.svg.webp"],
    ["SUPABASE", "Data", "skills_logos/supabase.webp"],
    ["REDIS", "Data", "skills_logos/redis.webp"],
    ["DOCKER", "Infrastructure", "skills_logos/docker.png"],
    ["AZURE", "Cloud", "skills_logos/Microsoft_Azure.svg.webp"],
    ["GOOGLE CLOUD", "Cloud", "skills_logos/google-cloud-logo-icon-free-png.webp"],
    ["GIT", "Tools", "skills_logos/git.svg"],
    ["GITHUB", "Tools", "skills_logos/github.webp"],
  ];
  // Preload + decode every capability logo up front. setTech() only ever
  // assigns one <img src> at a time as the user scrolls, so without this the
  // browser wouldn't start fetching a given logo until the exact moment it's
  // needed — causing the pop-in this fixes. This is scoped to just these
  // ~20 small logos, not a global eager-load of every image on the site.
  techs.forEach(([, , src]) => {
    const preloadImg = new Image();
    preloadImg.src = src;
    if (preloadImg.decode) preloadImg.decode().catch(() => {});
  });
  const wordEl = document.getElementById("stackWord");
  const catEl = document.getElementById("stackCat");
  const idxEl = document.getElementById("stackIdx");
  const logoEl = document.getElementById("stackLogo");
  const logoImgEl = document.getElementById("stackLogoImg");
  const wordwrapEl = document.getElementById("stackWordwrap");
  const BASE_LOGO_OPACITY = 0.12;
  document.getElementById("stackTotal").textContent = String(techs.length).padStart(2, "0");
  let current = -1;

  const setTech = (i) => {
    if (i === current) return;
    current = i;
    wordEl.textContent = techs[i][0];
    wordEl.style.fontSize = `min(${Math.min(9.1, 83 / techs[i][0].length).toFixed(1)}vw, 9.1rem)`;
    catEl.textContent = techs[i][1];
    idxEl.textContent = String(i + 1).padStart(2, "0");
    wordEl.classList.toggle("is-ghost", i % 2 === 1);
    logoImgEl.src = techs[i][2];
    gsap.fromTo(wordEl, { opacity: 0, scale: 0.92, filter: "blur(6px)" },
      { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.35, ease: "power2.out", overwrite: true });
    gsap.fromTo(logoEl, { opacity: 0, scale: 0.9 },
      { opacity: BASE_LOGO_OPACITY, scale: 1, duration: 0.45, ease: "power2.out", overwrite: true });
  };
  setTech(0);

  // Hover: logo brightens slightly, text pops — desktop only
  if (matchMedia("(pointer: fine)").matches) {
    wordwrapEl.addEventListener("mouseenter", () => {
      gsap.to(wordEl, { filter: "brightness(1.2)", scale: 1.03, duration: 0.3, overwrite: "auto" });
      gsap.to(logoEl, { opacity: BASE_LOGO_OPACITY + 0.1, scale: 1.04, duration: 0.3, overwrite: "auto" });
    });
    wordwrapEl.addEventListener("mouseleave", () => {
      gsap.to(wordEl, { filter: "brightness(1) blur(0px)", scale: 1, duration: 0.3, overwrite: "auto" });
      gsap.to(logoEl, { opacity: BASE_LOGO_OPACITY, scale: 1, duration: 0.3, overwrite: "auto" });
    });
  }

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
  document.getElementById("stackWordwrap").outerHTML =
    `<p style="font-size:clamp(1.3rem,2.6vw,2rem);font-weight:700;text-transform:uppercase;line-height:1.6;max-width:60rem">
      Python · SQL · C++ · FastAPI · Flask · RAG · LLM Agents · Prompt Engineering ·
      Vector Embeddings · Semantic Search · Sentence Transformers · Gemini API · Pinecone · PostgreSQL ·
      Supabase · Redis · Docker · Azure · Google Cloud · Git · GitHub</p>`;
}

// ---- Project videos: play only while visible, pause otherwise ----
const projectVideos = document.querySelectorAll(".work__video");
if (projectVideos.length) {
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const vid = entry.target;
      if (entry.isIntersecting) vid.play().catch(() => {});
      else vid.pause();
    });
  }, { threshold: 0.25 });
  projectVideos.forEach((v) => videoObserver.observe(v));
}
