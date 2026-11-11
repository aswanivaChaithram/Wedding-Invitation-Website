// Always begin the cinematic sequence from the very first frame on every load.
// Browsers restore the previous scroll position by default, which would start
// the film mid-sequence — disable that and jump to the top immediately.
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}
window.scrollTo(0, 0);

const frameCount = 76;
const frameBase = "./assets/frames/ezgif-frame-";
const frameExt = ".jpg";
const cinematicVideoSrc = "";
const frameImage = document.getElementById("filmFrame");
const filmVideo = document.getElementById("filmVideo");
const cinema = document.getElementById("cinema");
const loader = document.getElementById("loader");
const gallery = document.getElementById("gallery");
const galleryTrack = document.getElementById("galleryTrack");
const weddingMusic = document.getElementById("weddingMusic");
const musicPlayPause = document.getElementById("musicPlayPause");
const musicPlayPauseIcon = document.getElementById("musicPlayPauseIcon");
const musicMute = document.getElementById("musicMute");
const musicMuteIcon = document.getElementById("musicMuteIcon");
const musicVolume = document.getElementById("musicVolume");
const revealSections = document.querySelectorAll(".reveal-section");

const padFrame = (index) => String(index).padStart(3, "0");
const frameSrc = (index) => `${frameBase}${padFrame(index)}${frameExt}`;

// Replace this sequence with your own rendered JPG/WebP frames later.
// Or set cinematicVideoSrc to an MP4/WebM path; the same scroll timing drives video currentTime.
const frameCache = Array.from({ length: frameCount }, (_, i) => {
  const img = new Image();
  img.src = frameSrc(i + 1);
  return img;
});

const useVideo = Boolean(cinematicVideoSrc);
if (useVideo) {
  filmVideo.src = cinematicVideoSrc;
  filmVideo.hidden = false;
  frameImage.hidden = true;
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  {
    threshold: 0.15,
    rootMargin: "0px 0px -10% 0px"
  }
);

revealSections.forEach((section) => {
  revealObserver.observe(section);
});

// Only one BGM is used: ./assets/audio/wedding-background.mpeg.
const MUSIC_FADE_IN_MS = 2600;
const MUSIC_FADE_OUT_MS = 850;
let musicFadeFrame = 0;
let isMusicPlaying = false;
let isMusicMuted = false;
let preferredMusicVolume = 0.5;
let userPausedMusic = false;
let autoplayListenersAttached = false;

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function smoothstep(edge0, edge1, value) {
  const x = clamp((value - edge0) / (edge1 - edge0));
  return x * x * (3 - 2 * x);
}

function updateCinema() {
  const rect = cinema.getBoundingClientRect();
  const scrollable = rect.height - window.innerHeight;
  const progress = clamp(-rect.top / scrollable);

  if (useVideo && filmVideo.duration) {
    filmVideo.currentTime = clamp(progress, 0, 0.995) * filmVideo.duration;
  } else {
    const frameIndex = Math.min(frameCount, Math.max(1, Math.floor(progress * (frameCount - 1)) + 1));
    const nextSrc = frameSrc(frameIndex);
    if (!frameImage.src.endsWith(nextSrc.replace("./", ""))) {
      frameImage.src = nextSrc;
    }
  }

  const introFade = 1 - smoothstep(0.05, 0.26, progress);
  const detailsFade = smoothstep(0.54, 0.72, progress) * (1 - smoothstep(0.92, 1, progress));

  document.documentElement.style.setProperty("--film-scale", (1 + progress * 0.055).toFixed(3));
  document.documentElement.style.setProperty("--hero-opacity", introFade.toFixed(3));
  document.documentElement.style.setProperty("--hero-y", `${(-progress * 28).toFixed(1)}px`);
  document.documentElement.style.setProperty("--cue-opacity", (1 - smoothstep(0.02, 0.16, progress)).toFixed(3));

}


function updateGallery() {
  const rect = gallery.getBoundingClientRect();
  const scrollable = rect.height - window.innerHeight;
  const progress = clamp(-rect.top / scrollable);

  const overflow = Math.max(
    0,
    galleryTrack.scrollWidth - window.innerWidth + window.innerWidth * 0.08
  );

  // Reduce horizontal scrolling speed on mobile
  const isMobile = window.innerWidth <= 768;
  const speed = isMobile ? 0.55 : 1;

  galleryTrack.style.setProperty(
    "--gallery-x",
    `${-overflow * progress * speed}px`
  );

  [...galleryTrack.children].forEach((item, index) => {
    const wave = Math.sin(progress * Math.PI * 2 + index * 0.7) * 14;
    item.style.setProperty("--item-y", `${wave.toFixed(1)}px`);
  });
}


let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    updateCinema();
    updateGallery();
    ticking = false;
  });
}

function createPetals() {
  const petals = document.getElementById("petals");
  const sparkles = document.getElementById("sparkles");

  for (let i = 0; i < 30; i += 1) {
    const petal = document.createElement("i");
    petal.className = "petal";
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.setProperty("--start-x", `${Math.random() * 16 - 8}vw`);
    petal.style.setProperty("--end-x", `${Math.random() * 44 - 22}vw`);
    petal.style.setProperty("--fall-duration", `${8 + Math.random() * 8}s`);
    petal.style.animationDelay = `${Math.random() * -12}s`;
    petal.style.scale = `${0.65 + Math.random() * 0.9}`;
    petals.appendChild(petal);
  }

  for (let i = 0; i < 42; i += 1) {
    const spark = document.createElement("i");
    spark.className = "spark";
    spark.style.left = `${Math.random() * 100}%`;
    spark.style.top = `${Math.random() * 100}%`;
    spark.style.setProperty("--spark-duration", `${3 + Math.random() * 5}s`);
    spark.style.animationDelay = `${Math.random() * -4}s`;
    sparkles.appendChild(spark);
  }
}

function updateCountdown() {
  const weddingTime = new Date("2026-11-15T10:00:00+05:30").getTime();
  const now = Date.now();
  const diff = weddingTime - now;
  const today = document.getElementById("weddingToday");
  const countdown = document.getElementById("countdown");

  if (diff <= 0) {
    countdown.style.display = "none";
    today.classList.add("is-visible");
    today.textContent = "Today is the Wedding Day!";
    return;
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  document.getElementById("days").textContent = String(days).padStart(3, "0");
  document.getElementById("hours").textContent = String(hours).padStart(2, "0");
  document.getElementById("minutes").textContent = String(minutes).padStart(2, "0");
  document.getElementById("seconds").textContent = String(seconds).padStart(2, "0");
}

function setupCalendar() {

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Akshay Aswani Wedding//Invitation//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",

    "BEGIN:VEVENT",

    "UID:akshay-aswani-wedding-20261115@example.com",

    // 15 November 2026, 10:00 AM IST
    "DTSTART:20261115T043000Z",

    // 15 November 2026, 10:45 AM IST
    "DTEND:20261115T051500Z",

    "SUMMARY:Akshay & Aswani Wedding",

    "LOCATION:OMJ Convention Centre, Kerala, India",

    "DESCRIPTION:Wedding celebration of Akshay and Aswani.",

    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");


  const blob = new Blob(
    [ics],
    { type: "text/calendar;charset=utf-8" }
  );


  const url = URL.createObjectURL(blob);
  const button = document.getElementById("calendarButton");
  button.href = url;
  button.download = "akshay-aswani-wedding.ics";

}

function getSavedMusicVolume() {
  try {
    const saved = Number(localStorage.getItem("akshayAswaniMusicVolume"));
    if (Number.isFinite(saved)) {
      return clamp(saved, 0, 1);
    }
  } catch (error) {
    return 0.5;
  }
  return 0.5;
}

function saveMusicVolume(value) {
  try {
    localStorage.setItem("akshayAswaniMusicVolume", String(value));
  } catch (error) {
    // File previews can restrict storage; the player still works without persistence.
  }
}

function updateMusicButtons() {
  musicPlayPauseIcon.textContent = isMusicPlaying ? "Pause" : "Play";
  musicPlayPause.setAttribute("aria-label", isMusicPlaying ? "Pause music" : "Play music");

  const mutedState = isMusicMuted || preferredMusicVolume === 0;
  musicMuteIcon.textContent = mutedState ? "Muted" : "Sound";
  musicMute.setAttribute("aria-label", mutedState ? "Unmute music" : "Mute music");
  document.documentElement.style.setProperty("--music-glow", isMusicPlaying && !mutedState ? "0.72" : "0.32");
}

function fadeMusicTo(targetVolume, duration = MUSIC_FADE_IN_MS, afterFade) {
  cancelAnimationFrame(musicFadeFrame);
  const startVolume = weddingMusic.volume;
  const startTime = performance.now();

  function step(now) {
    const progress = clamp((now - startTime) / duration);
    const eased = progress * progress * (3 - 2 * progress);
    weddingMusic.volume = startVolume + (targetVolume - startVolume) * eased;

    if (progress < 1) {
      musicFadeFrame = requestAnimationFrame(step);
      return;
    }

    weddingMusic.volume = targetVolume;
    if (afterFade) afterFade();
  }

  musicFadeFrame = requestAnimationFrame(step);
}

async function playMusic() {

  try {

    weddingMusic.loop = true;

    weddingMusic.volume = 0;

    // Make sure the browser has loaded the audio
    if (weddingMusic.readyState === 0) {
      weddingMusic.load();
    }

    await weddingMusic.play();

    isMusicPlaying = true;

    userPausedMusic = false;

    isMusicMuted =
      preferredMusicVolume <= 0
        ? true
        : isMusicMuted;

    updateMusicButtons();

    fadeMusicTo(
      isMusicMuted ? 0 : preferredMusicVolume,
      MUSIC_FADE_IN_MS
    );

    removeAutoplayFallback();

  } catch (error) {

    console.error(
      "Wedding music could not be played:",
      error
    );

    isMusicPlaying = false;

    updateMusicButtons();

  }

}

function pauseMusic() {
  userPausedMusic = true;
  fadeMusicTo(0, MUSIC_FADE_OUT_MS, () => {
    weddingMusic.pause();
    isMusicPlaying = false;
    updateMusicButtons();
  });
}

function tryAutoplayMusic() {
  if (isMusicPlaying || userPausedMusic) return;
  playMusic();
}

function removeAutoplayFallback() {
  if (!autoplayListenersAttached) return;
  autoplayListenersAttached = false;
  ["pointerdown", "touchstart", "keydown", "scroll"].forEach((eventName) => {
    window.removeEventListener(eventName, tryAutoplayMusic);
  });
}

function attachAutoplayFallback() {
  if (autoplayListenersAttached) return;
  autoplayListenersAttached = true;
  ["pointerdown", "touchstart", "keydown", "scroll"].forEach((eventName) => {
    window.addEventListener(eventName, tryAutoplayMusic, { passive: true, once: true });
  });
}

function toggleMute() {
  const currentlyMuted = isMusicMuted || preferredMusicVolume === 0;
  isMusicMuted = !currentlyMuted;

  if (currentlyMuted && preferredMusicVolume === 0) {
    preferredMusicVolume = 0.5;
    musicVolume.value = "50";
    saveMusicVolume(preferredMusicVolume);
  }

  updateMusicButtons();

  if (!isMusicPlaying) return;
  fadeMusicTo(isMusicMuted ? 0 : preferredMusicVolume, 650);
}

function setupMusicPlayer() {
  preferredMusicVolume = getSavedMusicVolume();
  musicVolume.value = String(Math.round(preferredMusicVolume * 100));
  weddingMusic.volume = 0;
  weddingMusic.loop = true;
  updateMusicButtons();

  musicPlayPause.addEventListener("click", () => {
    if (isMusicPlaying) {
      pauseMusic();
    } else {
      playMusic();
    }
  });

  musicMute.addEventListener("click", toggleMute);

  musicVolume.addEventListener("input", (event) => {
    preferredMusicVolume = clamp(Number(event.target.value) / 100, 0, 1);
    saveMusicVolume(preferredMusicVolume);
    isMusicMuted = preferredMusicVolume === 0;
    updateMusicButtons();

    if (isMusicPlaying) {
      fadeMusicTo(isMusicMuted ? 0 : preferredMusicVolume, 220);
    }
  });

  // The "Tap to Enter" button guarantees music starts, because the tap is a
  // real user gesture — browsers always allow audio to begin on a click.
  const enterButton = document.getElementById("enterButton");
  if (enterButton) {
    enterButton.addEventListener("click", () => {
      loader.classList.add("is-hidden");
      // Start the experience from the first frame at the top of the page.
      window.scrollTo(0, 0);
      onScroll();
      userPausedMusic = false;
      playMusic();
    });
  }

  // Still try silent autoplay in the background. If the browser already trusts
  // this site (e.g. after previous visits), music starts before the tap.
  tryAutoplayMusic();
  attachAutoplayFallback();
  }
 
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onScroll);
window.addEventListener("load", () => {
  // Loader now stays until the visitor taps "Enter" (which also starts music).
  // Reset to the top so the cinematic sequence always starts at frame 1.
  window.scrollTo(0, 0);
  onScroll();
});

/* =========================================================
   RSVP FORM
   ========================================================= */

function setupRsvp() {

  const openRsvp = document.getElementById("openRsvp");
  const closeRsvp = document.getElementById("closeRsvp");
  const rsvpModal = document.getElementById("rsvpModal");
  const rsvpForm = document.getElementById("rsvpForm");
  const rsvpSuccess = document.getElementById("rsvpSuccess");
  const rsvpFormContainer = document.getElementById("rsvpFormContainer");
  const successClose = document.getElementById("successClose");
  const rsvpSubmit = document.getElementById("rsvpSubmit");


  if (!openRsvp || !rsvpModal || !rsvpForm) {
    return;
  }


  /* ---------------------------------------------------------
     Open RSVP
     --------------------------------------------------------- */

  function openModal() {

    rsvpModal.classList.add("is-open");

    rsvpModal.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";

    setTimeout(() => {
      document.getElementById("guestName")?.focus();
    }, 250);
  }


  /* ---------------------------------------------------------
     Close RSVP
     --------------------------------------------------------- */

  function closeModal() {

    rsvpModal.classList.remove("is-open");

    rsvpModal.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";
  }


  /* ---------------------------------------------------------
     Open button
     --------------------------------------------------------- */

  openRsvp.addEventListener("click", openModal);


  /* ---------------------------------------------------------
     Close button
     --------------------------------------------------------- */

  closeRsvp.addEventListener("click", closeModal);


  /* ---------------------------------------------------------
     Close after successful submission
     --------------------------------------------------------- */

  successClose.addEventListener("click", () => {

    closeModal();

    setTimeout(() => {

      rsvpSuccess.classList.remove("is-visible");

      rsvpFormContainer.style.display = "";

      rsvpForm.reset();

    }, 350);

  });


  /* ---------------------------------------------------------
     Click outside the RSVP box to close
     --------------------------------------------------------- */

  rsvpModal.addEventListener("click", (event) => {

    if (event.target === rsvpModal) {
      closeModal();
    }

  });


  /* ---------------------------------------------------------
     Escape key closes RSVP
     --------------------------------------------------------- */

  document.addEventListener("keydown", (event) => {

    if (
      event.key === "Escape" &&
      rsvpModal.classList.contains("is-open")
    ) {
      closeModal();
    }

  });


  /* ---------------------------------------------------------
     Submit RSVP
     --------------------------------------------------------- */

  rsvpForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    rsvpSubmit.disabled = true;

    rsvpSubmit.textContent = "Sending...";


    try {

      const formData = new FormData(rsvpForm);


      const response = await fetch(
        rsvpForm.action,
        {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json"
          }
        }
      );


      if (response.ok) {

        /* Hide form */
        rsvpFormContainer.style.display = "none";


        /* Show thank-you message */
        rsvpSuccess.classList.add("is-visible");


      } else {

        alert(
          "Sorry, we couldn't send your RSVP. Please try again."
        );

      }


    } catch (error) {

      console.error("RSVP submission error:", error);

      alert(
        "Something went wrong. Please check your internet connection and try again."
      );

    } finally {

      rsvpSubmit.disabled = false;

      rsvpSubmit.textContent = "Confirm";

    }

  });

}

createPetals();
setupCalendar();
setupMusicPlayer();
updateCountdown();
setInterval(updateCountdown, 1000);
onScroll();
setupRsvp();

