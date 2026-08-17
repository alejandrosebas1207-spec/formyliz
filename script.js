// Configuración de Supabase (compartida entre los dos dispositivos)
var SUPABASE_URL = 'https://rkukomuuqfcccaywvfqk.supabase.co';
var SUPABASE_KEY = 'sb_publishable_O3-INhLVYd9nd284UiPVZQ_TjbnXQW0';

function initApp() {

  // =========================================
  // CONSTANTES Y CONFIGURACIÓN
  // =========================================
  const SECTION_IDS = [
    'intro',
    'historia',
    'cielo-24-abril',
    'mapa',
    'galeria',
    'playlist',
    'propositos',
    'frasco-citas',
    'muro',
    'cartas-programadas',
    'capsula-tiempo',
    'sorpresa',
    'final'
  ];
  const SECTION_LABELS = [
    'Inicio · Portada',
    'Historia · Capítulos',
    'Cielo · 24 de Abril',
    'Mapa · Lugares',
    'Galería · Lo que amo de ti',
    'Playlist · Canciones',
    'Metas · Este semestre',
    'Citas · Frasco de citas',
    'Muro · Recuerdos',
    'Cartas · Para abrir',
    'Cápsula · 2027',
    'Sorpresa · Estrellas',
    'Final · Despedida'
  ];
  const THOUGHTS = [
    "Contigo hasta los días grises se ven bonitos.",
    "Volví a sonreír de verdad desde que estás tú.",
    "Eres la razón por la que todo pesa menos.",
    "Contigo, hasta lo que dolía dejó de doler.",
    "No hay mucha explicación, solo sé que eres tú.",
    "No dejo de pensar en ti, ni lo intento.",
    "Cada vez que pienso en ti, todo se siente diferente.",
    "Hay momentos que ya no puedo separar de ti.",
    "Me acuerdo de ti hasta en lo más simple.",
    "Eres la misma cosa que mi felicidad.",
    "No me da miedo decirte que te quiero.",
    "Contigo no hace falta fingir nada.",
    "Te quiero tal como eres, sin condiciones.",
    "No necesito una razón para elegirte cada día.",
    "Contigo, hasta lo imperfecto se siente bien."
  ];

  // Contexto de audio compartido
  let audioCtx = null;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function getAudioCtx() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audioCtx = new AC();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  // Sonido sutil de "pasar página"
  function playPageTurn() {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const duration = 0.28;
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(1800, ctx.currentTime);
      bandpass.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + duration);
      bandpass.Q.value = 0.7;

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.06, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      noise.connect(bandpass);
      bandpass.connect(gainNode);
      gainNode.connect(ctx.destination);
      noise.start();
      noise.stop(ctx.currentTime + duration);
    } catch (e) { /* silencioso */ }
  }

  // Sonido de caja de música ambiental
  let musicBoxInterval = null;
  function playMusicBox() {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      // Melodía simple: Mi - Sol - Si - Sol - Mi
      const notes = [659.25, 783.99, 987.77, 783.99, 659.25];
      let noteIndex = 0;

      function playNote() {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = notes[noteIndex];
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.8);

        noteIndex = (noteIndex + 1) % notes.length;
      }

      playNote();
      musicBoxInterval = setInterval(playNote, 1200);
    } catch (e) { /* silencioso */ }
  }

  function stopMusicBox() {
    if (musicBoxInterval) {
      clearInterval(musicBoxInterval);
      musicBoxInterval = null;
    }
  }

  // Confeti de corazones/estrellas
  function launchConfetti(originX, originY) {
    const symbols = ['❤️', '✨', '💜', '⭐'];
    const count = 22;
    for (let i = 0; i < count; i++) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      piece.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      piece.style.left = originX + 'px';
      piece.style.top = originY + 'px';
      document.body.appendChild(piece);

      const angle = Math.random() * Math.PI * 2;
      const distance = 90 + Math.random() * 140;
      const endX = Math.cos(angle) * distance;
      const endY = Math.sin(angle) * distance - 40;
      const rotation = (Math.random() - 0.5) * 360;

      if (typeof gsap !== 'undefined') {
        gsap.to(piece, {
          x: endX,
          y: endY,
          rotation: rotation,
          opacity: 0,
          scale: 0.6 + Math.random() * 0.8,
          duration: 1 + Math.random() * 0.6,
          ease: 'power2.out',
          onComplete: () => piece.remove()
        });
      } else {
        setTimeout(() => piece.remove(), 1200);
      }
    }
  }

  // =========================================
  // 1. LOADER
  // =========================================
  const loader = document.getElementById('loader');
  setTimeout(() => {
    loader.classList.add('hidden');
  }, 1500);

  // =========================================
  // 2. ESTRELLAS DE FONDO CON PARALLAX (80 estrellas en capas)
  // =========================================
  const starsBg = document.getElementById('stars-bg');
  const parallaxLayers = [[], [], []]; // 3 capas de profundidad

  for (let i = 0; i < 80; i++) {
    const star = document.createElement('span');
    star.className = 'star-bg parallax-star';
    const size = Math.random() * 2 + 1;
    const layer = Math.floor(Math.random() * 3);
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.opacity = 0.3 + Math.random() * 0.7;
    star.dataset.layer = layer;
    star.dataset.speed = (layer + 1) * 0.2;
    starsBg.appendChild(star);
    parallaxLayers[layer].push(star);

    if (!reduceMotion) {
      gsap.to(star, {
        opacity: 0.2 + Math.random() * 0.6,
        duration: 2 + Math.random() * 4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }
  }

  // Efecto parallax con movimiento del mouse + scroll
  let mouseX = 0, mouseY = 0, scrollSpeed = 0, lastScrollY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });
  document.addEventListener('scroll', () => {
    const sy = window.scrollY || document.documentElement.scrollTop;
    scrollSpeed = Math.min(Math.abs(sy - lastScrollY) * 0.3, 15);
    lastScrollY = sy;
    setTimeout(() => { scrollSpeed = Math.max(0, scrollSpeed - 1); }, 100);
  }, { passive: true });

  function updateParallax() {
    if (!document.hidden && !reduceMotion) {
      const baseX = mouseX * 5 + scrollSpeed * 0.7;
      const baseY = mouseY * 5 + scrollSpeed * 0.5;
      parallaxLayers.forEach((layer, layerIndex) => {
        const speed = (layerIndex + 1) * 2.5;
        layer.forEach(star => {
          star.style.transform = `translate(${baseX * speed}px, ${baseY * speed}px)`;
        });
      });
    }
    requestAnimationFrame(updateParallax);
  }
  updateParallax();

  // =========================================
  // 3. CORAZONES FLOTANTES
  // =========================================
  const heartsContainer = document.getElementById('hearts-container');
  if (reduceMotion && heartsContainer) {
    heartsContainer.style.display = 'none';
  }
  function createHeart() {
    const heart = document.createElement('div');
    heart.className = 'heart-float';
    const symbols = ['❤️', '♥️', '💜', '❤️‍🔥'];
    heart.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    heart.style.left = Math.random() * 100 + '%';
    heart.style.fontSize = (0.8 + Math.random() * 1.5) + 'rem';
    heart.style.animationDuration = (8 + Math.random() * 12) + 's';
    heartsContainer.appendChild(heart);
    setTimeout(() => heart.remove(), 20000);
  }
  let heartsInterval = setInterval(createHeart, 3000);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearInterval(heartsInterval);
    } else {
      heartsInterval = setInterval(createHeart, 3000);
    }
  });

  // =========================================
  // 4. LÍNEA DE TIEMPO LATERAL
  // =========================================
  const timeline = document.getElementById('timeline-nav');
  if (timeline) {
    SECTION_IDS.forEach((id, index) => {
      const dot = document.createElement('button');
      dot.className = 'timeline-dot';
      dot.dataset.index = index;
      dot.setAttribute('aria-label', `Ir a: ${SECTION_LABELS[index]}`);
      dot.setAttribute('title', SECTION_LABELS[index]);
      const label = document.createElement('span');
      label.className = 'timeline-label';
      label.textContent = SECTION_LABELS[index].split(' · ')[0];
      dot.appendChild(label);
      dot.addEventListener('click', () => goToSection(index));
      timeline.appendChild(dot);
    });
  }
  const timelineDots = timeline ? timeline.querySelectorAll('.timeline-dot') : [];

  function updateProgress(index) {
    timelineDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  // =========================================
  // 5. PARTÍCULAS DE TRANSICIÓN
  // =========================================
  function createTransitionParticles(onComplete) {
    const container = document.createElement('div');
    container.className = 'transition-particles';
    document.body.appendChild(container);

    const colors = ['#B39DDB', '#C0392B', '#FFFFFF'];
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
      const p = document.createElement('div');
      p.className = 'transition-particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = Math.random() * 100 + '%';
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.width = (2 + Math.random() * 4) + 'px';
      p.style.height = p.style.width;
      container.appendChild(p);

      gsap.to(p, {
        x: (Math.random() - 0.5) * 300,
        y: (Math.random() - 0.5) * 300,
        opacity: 0.8,
        scale: 0,
        duration: 0.8 + Math.random() * 0.4,
        ease: 'power2.out',
        onComplete: () => {
          if (i === particleCount - 1) {
            container.remove();
            if (onComplete) onComplete();
          }
        }
      });
    }
  }

  // =========================================
  // 6. NAVEGACIÓN PRINCIPAL CON TRANSICIONES CINEMATOGRÁFICAS
  // =========================================
  const sections = document.querySelectorAll('.section');
  let currentIndex = 0;
  let isTransitioning = false;

  function goToSection(index) {
    if (isTransitioning) return;
    if (index < 0 || index >= sections.length) return;
    if (index === currentIndex && sections[index].classList.contains('active')) return;
    isTransitioning = true;
    playPageTurn();

    const currentSection = sections[currentIndex];
    const nextSection = sections[index];

    // Preparar la siguiente sección
    nextSection.style.display = 'flex';
    nextSection.scrollTop = 0;
    nextSection.style.opacity = '0';
    nextSection.style.transform = 'translateX(24px)';
    nextSection.classList.add('active');
    nextSection.dataset.animated = 'false';

    const innerTargets = nextSection.querySelectorAll(
      '.chapter-content, .gallery-grid, .love-list, .playlist-list, .letter-wrapper, #starfield, .slideshow-container, .final-qr-section, .final-goodbye'
    );
    gsap.set(innerTargets, { opacity: 0, y: 25 });

    // Animar salida con efecto de página que se voltea
    gsap.set(currentSection, { transformOrigin: 'left center' });
    gsap.to(currentSection, {
      opacity: 0,
      rotateY: -40,
      x: -20,
      duration: 0.45,
      ease: 'power2.in',
      onComplete: () => {
        currentSection.style.display = 'none';
        currentSection.classList.remove('active');
        gsap.set(currentSection, { rotateY: 0, x: 0 });

        createTransitionParticles();

        gsap.set(nextSection, { x: 30, rotateY: 10, transformOrigin: 'right center' });
        const tl = gsap.timeline({
          onComplete: () => {
            currentIndex = index;
            updateProgress(index);
            isTransitioning = false;

            // Ejecutar funciones especiales
            if (nextSection.id === 'cielo-24-abril') initSkyObservatory();
            if (nextSection.id === 'mapa') initLoveMap();
            if (nextSection.id === 'frasco-citas') initJarOfDates();
            if (nextSection.id === 'capsula-tiempo') initCapsuleVault();
            if (nextSection.id === 'sorpresa') initStarfield();
            if (nextSection.id === 'final') { initSlideshow(); initSignature(); }
          }
        });

        tl.to(nextSection, {
          opacity: 1,
          x: 0,
          rotateY: 0,
          duration: 0.5,
          ease: 'power2.out'
        }, 0);

        if (innerTargets.length) {
          tl.to(innerTargets, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.08,
            ease: 'power2.out',
            clearProps: 'all'
          }, 0.05);
        }

        nextSection.dataset.animated = 'true';
      }
    });
  }

  // Inicializar: solo el hero visible
  sections.forEach((sec, i) => {
    if (i === 0) {
      sec.classList.add('active');
      sec.style.display = 'flex';
      sec.style.opacity = '1';
      sec.style.transform = 'translateX(0)';
      sec.dataset.animated = 'true';
    } else {
      sec.classList.remove('active');
      sec.style.display = 'none';
      sec.style.opacity = '1';
      sec.style.transform = 'translateX(0)';
      sec.dataset.animated = 'false';
    }
  });
  updateProgress(0);

  // Animación de entrada del hero (staggered)
  setTimeout(() => {
    const hero = document.getElementById('intro');
    if (hero) {
      hero.classList.add('hero-animated');
    }
  }, 1800); // Después del loader

  // Botón "Comenzar"
  document.getElementById('startButton').addEventListener('click', () => {
    goToSection(1);
  });

  // Botones "Siguiente"
  document.querySelectorAll('.next-btn:not(#certButton):not(#restartButton)').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (isTransitioning) return;
      const nextId = btn.dataset.next;
      const nextIndex = SECTION_IDS.indexOf(nextId);
      if (nextIndex !== -1) {
        goToSection(nextIndex);
      }
    });
  });

  // Botón "Volver a empezar"
  document.getElementById('restartButton').addEventListener('click', () => {
    document.getElementById('confirm-modal').classList.add('show');
  });

  document.getElementById('confirmYes').addEventListener('click', () => {
    document.getElementById('confirm-modal').classList.remove('show');
    resetToHero();
  });
  document.getElementById('confirmNo').addEventListener('click', () => {
    document.getElementById('confirm-modal').classList.remove('show');
  });

  // Botón "Descargar certificado"
  const certBtn = document.getElementById('certButton');
  if (certBtn) {
    certBtn.addEventListener('click', generateCertificate);
  }

  // Botón de música ambiental
  const ambientBtn = document.getElementById('ambient-audio');
  let ambientPlaying = false;
  if (ambientBtn) {
    ambientBtn.addEventListener('click', () => {
      ambientPlaying = !ambientPlaying;
      if (ambientPlaying) {
        playMusicBox();
        ambientBtn.classList.add('playing');
        ambientBtn.querySelector('.audio-label').textContent = 'Pausar';
        ambientBtn.setAttribute('aria-pressed', 'true');
      } else {
        stopMusicBox();
        ambientBtn.classList.remove('playing');
        ambientBtn.querySelector('.audio-label').textContent = 'Música';
        ambientBtn.setAttribute('aria-pressed', 'false');
      }
    });
  }

  function resetToHero() {
    if (window.slideshowInterval) {
      clearInterval(window.slideshowInterval);
      window.slideshowInterval = null;
    }
    if (window.starfieldTimers) {
      window.starfieldTimers.forEach(t => clearTimeout(t));
      window.starfieldTimers = [];
    }
    letterOpened = false;
    const envelope = document.querySelector('.envelope');
    if (envelope) envelope.remove();
    stopMusicBox();
    if (ambientBtn) {
      ambientPlaying = false;
      ambientBtn.classList.remove('playing');
      ambientBtn.querySelector('.audio-label').textContent = 'Música';
      ambientBtn.setAttribute('aria-pressed', 'false');
    }

    sections.forEach(sec => {
      sec.classList.remove('active');
      sec.style.display = 'none';
      sec.dataset.animated = 'false';
    });

    const hero = document.getElementById('intro');
    hero.style.display = 'flex';
    hero.style.opacity = '1';
    hero.style.transform = 'translateX(0)';
    hero.classList.add('active');
    hero.dataset.animated = 'true';
    hero.classList.remove('hero-animated');

    currentIndex = 0;
    updateProgress(0);

    const starfield = document.getElementById('starfield');
    if (starfield) starfield.innerHTML = '';
    window.starfieldInitialized = false;

    const track = document.getElementById('slideshowTrack');
    if (track) track.innerHTML = '';
    const indicators = document.getElementById('slideshowIndicators');
    if (indicators) indicators.innerHTML = '';

    const sig = document.getElementById('signatureReveal');
    if (sig) {
      sig.dataset.animated = 'false';
      gsap.set(sig, { clipPath: 'inset(0 100% 0 0)' });
    }

    // Re-animar entrada del hero
    setTimeout(() => {
      hero.classList.add('hero-animated');
    }, 100);
  }

  // =========================================
  // 6b. SELECTOR DE CAPÍTULOS DE HISTORIA
  // =========================================
  function initStoryTabs() {
    const tabsContainer = document.getElementById('storyTabs');
    const panels = document.querySelectorAll('.story-panel');
    const heading = document.getElementById('storySectionHeading');
    const prevBtn = document.getElementById('prevStoryChapBtn');
    const nextBtn = document.getElementById('nextStoryChapBtn');

    if (!tabsContainer) return;

    const chapterTitles = {
      '1': 'Cómo empezó todo',
      '2': 'La universidad y la práctica',
      '3': 'Nuestra primera cita patinando',
      '4': 'Las vacaciones y el reencuentro',
      '5': 'El 24 de abril, nuestro día',
      '6': 'Lo que prometo construir contigo',
      '7': 'Esta página sigue en blanco'
    };

    let currentChap = 1;

    function showChapter(chapNum) {
      currentChap = Number(chapNum);
      tabsContainer.querySelectorAll('.story-tab').forEach(tab => {
        tab.classList.toggle('active', Number(tab.dataset.chap) === currentChap);
      });
      panels.forEach(p => {
        p.classList.toggle('active', Number(p.dataset.chapPanel) === currentChap);
      });
      if (heading && chapterTitles[currentChap]) {
        heading.textContent = chapterTitles[currentChap];
      }
      playPageTurn();
    }

    tabsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.story-tab');
      if (!btn) return;
      showChapter(btn.dataset.chap);
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        const target = currentChap > 1 ? currentChap - 1 : 7;
        showChapter(target);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const target = currentChap < 7 ? currentChap + 1 : 1;
        showChapter(target);
      });
    }
  }

  initStoryTabs();

  // =========================================
  // 7. TECLADO
  // =========================================
  document.addEventListener('keydown', (e) => {
    if (document.querySelector('.modal.show')) {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal.show').forEach(m => m.classList.remove('show'));
      }
      return;
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (isTransitioning) return;
      const nextIndex = currentIndex + 1;
      if (nextIndex < sections.length) {
        goToSection(nextIndex);
      }
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (isTransitioning) return;
      const prevIndex = currentIndex - 1;
      if (prevIndex >= 0) {
        goToSection(prevIndex);
      }
    }
    if (e.key === ' ') {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;
      const current = sections[currentIndex];
      const atBottom = current.scrollHeight - current.scrollTop - current.clientHeight < 40;
      if (atBottom) {
        e.preventDefault();
        if (isTransitioning) return;
        const nextIndex = currentIndex + 1;
        if (nextIndex < sections.length) {
          goToSection(nextIndex);
        }
      }
    }
  });

  // =========================================
  // 7b. GESTOS TÁCTILES (swipe izquierda/derecha)
  // =========================================
  let touchStartX = 0;
  let touchStartY = 0;
  document.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    if (document.querySelector('.modal.show')) return;
    if (isTransitioning) return;

    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    // Solo gestos claramente horizontales y con recorrido suficiente
    if (absX < 60 || absX < absY * 1.2) return;

    if (dx < 0) {
      const nextIndex = currentIndex + 1;
      if (nextIndex < sections.length) goToSection(nextIndex);
    } else {
      const prevIndex = currentIndex - 1;
      if (prevIndex >= 0) goToSection(prevIndex);
    }
  }, { passive: true });

  // =========================================
  // 9. REPRODUCTOR DE CANCIONES
  // =========================================
  document.querySelectorAll('.playlist-track').forEach((track) => {
    const btn = track.querySelector('.play-track-btn');
    const playerBox = track.querySelector('.track-player');
    const videoId = track.dataset.videoId;
    if (!btn || !playerBox || !videoId) return;

    btn.addEventListener('click', () => {
      const isPlaying = btn.classList.contains('playing');

      document.querySelectorAll('.play-track-btn.playing').forEach((otherBtn) => {
        if (otherBtn !== btn) {
          otherBtn.classList.remove('playing');
          otherBtn.textContent = '▶ Escuchar';
          const otherBox = otherBtn.closest('.playlist-track').querySelector('.track-player');
          if (otherBox) otherBox.innerHTML = '';
        }
      });

      if (isPlaying) {
        playerBox.innerHTML = '';
        btn.classList.remove('playing');
        btn.textContent = '▶ Escuchar';
      } else {
        playerBox.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1" title="Reproductor de canción" allow="autoplay; encrypted-media" allowfullscreen loading="lazy"></iframe>`;
        btn.classList.add('playing');
        btn.textContent = '⏸ Ocultar';
      }
    });
  });

  // =========================================
  // 10. CONTADOR EN VIVO DEL INICIO
  // =========================================
  const RELATIONSHIP_START = new Date('2026-04-24T00:00:00');

  function getRelationshipTime() {
    const now = new Date();
    let diffMs = now - RELATIONSHIP_START;
    if (diffMs < 0) diffMs = 0;

    // Meses calendario completos desde el 24 de abril de 2026
    let months = (now.getFullYear() - RELATIONSHIP_START.getFullYear()) * 12
      + (now.getMonth() - RELATIONSHIP_START.getMonth());
    if (now.getDate() < RELATIONSHIP_START.getDate()) months -= 1;
    if (months < 0) months = 0;

    // Lo que sobra después de esos meses
    const base = new Date(RELATIONSHIP_START);
    base.setMonth(base.getMonth() + months);

    const restMs = now - base;
    const days = Math.floor(restMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((restMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((restMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((restMs % (1000 * 60)) / 1000);

    return { months, days, hours, minutes, seconds };
  }

  function formatUnit(value, singular, plural) {
    return value + ' ' + (value === 1 ? singular : plural);
  }

  function updateHeroCounter() {
    const el = document.getElementById('heroTimeLine');
    if (!el) return;
    const t = getRelationshipTime();
    el.textContent = [
      formatUnit(t.months, 'mes', 'meses'),
      formatUnit(t.days, 'día', 'días'),
      formatUnit(t.hours, 'hora', 'horas'),
      t.minutes + ' min',
      t.seconds + ' s'
    ].join(' · ');
  }

  updateHeroCounter();
  setInterval(updateHeroCounter, 1000);

  // =========================================
  // 11. FIRMA ANIMADA
  // =========================================
  function initSignature() {
    const sig = document.getElementById('signatureReveal');
    if (!sig || sig.dataset.animated === 'true') return;
    sig.dataset.animated = 'true';
    gsap.set(sig, { clipPath: 'inset(0 100% 0 0)' });
    gsap.to(sig, {
      clipPath: 'inset(0 0% 0 0)',
      duration: 1.4,
      ease: 'power2.inOut',
      delay: 0.4
    });
  }

  // =========================================
  // 12. CONFETI AL TOCAR "TE AMO"
  // =========================================
  const teAmoTrigger = document.getElementById('teAmoTrigger');
  if (teAmoTrigger) {
    const handleTeAmo = (e) => {
      const rect = teAmoTrigger.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      launchConfetti(x, y);
      playChimeGlobal();
    };
    teAmoTrigger.addEventListener('click', handleTeAmo);
    teAmoTrigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleTeAmo(e);
      }
    });
  }

  function playChimeGlobal() {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 900 + Math.random() * 300;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) { /* silencio */ }
  }

  // =========================================
  // 12b. EL CIELO DE NUESTRA NOCHE (24 DE ABRIL DE 2026)
  // =========================================
  let skyObservatoryInitialized = false;
  let skyAnimId = null;

  function initSkyObservatory() {
    const canvas = document.getElementById('skyCanvas');
    if (!canvas) return;
    if (skyObservatoryInitialized) return;
    skyObservatoryInitialized = true;

    const ctx = canvas.getContext('2d');
    const W = 800;
    const H = 500;
    canvas.width = W;
    canvas.height = H;

    // Generar fondo de estrellas
    const backgroundStars = [];
    for (let i = 0; i < 150; i++) {
      backgroundStars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.5 + 0.5,
        baseAlpha: 0.2 + Math.random() * 0.7,
        alpha: 0.5,
        twinkleSpeed: 0.02 + Math.random() * 0.04,
        phase: Math.random() * Math.PI * 2
      });
    }

    // Constelaciones sobre Quito (24 de abril)
    const constellations = [
      {
        name: 'Cruz del Sur',
        desc: 'Visible brillante en el cielo de Quito. Simboliza nuestra guía.',
        quote: '«Incluso en las noches más oscuras, siempre supiste ser mi norte.»',
        color: '#D9A441',
        stars: [
          { x: 560, y: 280, name: 'Acrux', r: 3.5, main: true },
          { x: 530, y: 220, name: 'Mimosa', r: 3.2, main: true },
          { x: 560, y: 160, name: 'Gacrux', r: 3.4, main: true },
          { x: 590, y: 210, name: 'Imai', r: 2.8, main: true }
        ],
        lines: [
          [0, 2], // Acrux - Gacrux
          [1, 3]  // Mimosa - Imai
        ]
      },
      {
        name: 'Orión',
        desc: 'El gigante del firmamento andino. Simboliza la fuerza de nuestro amor.',
        quote: '«Fuerte, constante y presente en cada uno de nuestros pasos.»',
        color: '#7AA2F7',
        stars: [
          { x: 260, y: 180, name: 'Betelgeuse', r: 3.8, color: '#FF7B72', main: true },
          { x: 380, y: 190, name: 'Bellatrix', r: 3.0, main: true },
          { x: 280, y: 340, name: 'Saiph', r: 2.8, main: true },
          { x: 400, y: 330, name: 'Rigel', r: 3.8, color: '#79C0FF', main: true },
          // Cinturón
          { x: 320, y: 260, name: 'Alnitak', r: 2.5, main: true },
          { x: 335, y: 255, name: 'Alnilam', r: 2.6, main: true },
          { x: 350, y: 250, name: 'Mintaka', r: 2.5, main: true }
        ],
        lines: [
          [0, 1], [0, 4], [1, 6], [4, 5], [5, 6], [2, 4], [3, 6], [2, 3]
        ]
      },
      {
        name: 'Constelación de Elizabeth & Alejandro',
        desc: 'Las estrellas que se alinearon el 24 de abril de 2026.',
        quote: '«No fue casualidad coincidir entre tanta gente aquel día; fue destino.»',
        color: '#E06C75',
        stars: [
          { x: 670, y: 110, name: 'Punto de Encuentro', r: 3.0, main: true },
          { x: 710, y: 90, name: 'El Cielito', r: 3.2, main: true },
          { x: 750, y: 120, name: 'Río Intag', r: 3.0, main: true },
          { x: 710, y: 170, name: '24 de Abril', r: 4.2, color: '#D9A441', main: true }
        ],
        lines: [
          [0, 1], [1, 2], [2, 3], [3, 0]
        ]
      }
    ];

    // Estrellas fugaces
    let shootingStar = null;
    function spawnShootingStar() {
      if (Math.random() < 0.015 && !shootingStar) {
        shootingStar = {
          x: Math.random() * W * 0.8,
          y: Math.random() * (H * 0.4),
          len: 80 + Math.random() * 60,
          speed: 12 + Math.random() * 8,
          angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
          opacity: 1
        };
      }
    }

    // Dibujar luna en cuarto creciente / gibosa (61% iluminada)
    function drawMoon(ctx, x, y, r) {
      ctx.save();
      // Glow exterior
      const glow = ctx.createRadialGradient(x, y, r * 0.8, x, y, r * 2.8);
      glow.addColorStop(0, 'rgba(217, 164, 65, 0.35)');
      glow.addColorStop(0.5, 'rgba(217, 164, 65, 0.08)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, r * 2.8, 0, Math.PI * 2);
      ctx.fill();

      // Disco base oscuro
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();

      // Zona iluminada (Cuarto creciente brillante)
      ctx.fillStyle = '#FDF6E2';
      ctx.beginPath();
      ctx.arc(x, y, r, -Math.PI / 2, Math.PI / 2, false);
      ctx.bezierCurveTo(x + r * 0.3, y + r, x + r * 0.3, y - r, x, y - r);
      ctx.fill();

      // Cráteres suaves
      ctx.fillStyle = 'rgba(180, 160, 120, 0.2)';
      ctx.beginPath();
      ctx.arc(x + r * 0.4, y - r * 0.2, r * 0.18, 0, Math.PI * 2);
      ctx.arc(x + r * 0.25, y + r * 0.3, r * 0.12, 0, Math.PI * 2);
      ctx.arc(x + r * 0.55, y + r * 0.1, r * 0.14, 0, Math.PI * 2);
      ctx.fill();

      // Borde suave
      ctx.strokeStyle = 'rgba(253, 246, 226, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    }

    let activeConstellation = null;
    let hoveredStar = null;

    function renderSky() {
      ctx.clearRect(0, 0, W, H);

      // Fondo de gradiente profundo
      const bgGrad = ctx.createRadialGradient(W / 2, H, 50, W / 2, H / 2, W * 0.7);
      bgGrad.addColorStop(0, '#101c30');
      bgGrad.addColorStop(0.6, '#090e1a');
      bgGrad.addColorStop(1, '#04060c');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Dibujar luna
      drawMoon(ctx, 110, 100, 32);

      // Silueta sutil de las montañas de Quito en el horizonte
      ctx.fillStyle = 'rgba(8, 12, 22, 0.85)';
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(0, H - 40);
      ctx.bezierCurveTo(W * 0.2, H - 75, W * 0.35, H - 35, W * 0.5, H - 65);
      ctx.bezierCurveTo(W * 0.65, H - 95, W * 0.85, H - 45, W, H - 55);
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();

      // Dibujar estrellas de fondo
      backgroundStars.forEach((star) => {
        star.phase += star.twinkleSpeed;
        star.alpha = star.baseAlpha + Math.sin(star.phase) * 0.25;
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, star.alpha)})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Dibujar constelaciones y líneas
      constellations.forEach((c) => {
        const isHovered = activeConstellation === c;

        // Líneas de conexión
        ctx.strokeStyle = isHovered ? c.color : 'rgba(180, 200, 240, 0.2)';
        ctx.lineWidth = isHovered ? 2 : 1;
        ctx.setLineDash(isHovered ? [] : [3, 4]);

        c.lines.forEach(([i1, i2]) => {
          const s1 = c.stars[i1];
          const s2 = c.stars[i2];
          ctx.beginPath();
          ctx.moveTo(s1.x, s1.y);
          ctx.lineTo(s2.x, s2.y);
          ctx.stroke();
        });
        ctx.setLineDash([]);

        // Estrellas de la constelación
        c.stars.forEach((s) => {
          const starColor = s.color || c.color;
          const isStarHovered = hoveredStar === s;

          // Glow de estrella principal
          if (isHovered || isStarHovered) {
            ctx.fillStyle = starColor;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r * 2.8, 0, Math.PI * 2);
            ctx.globalAlpha = 0.25;
            ctx.fill();
            ctx.globalAlpha = 1.0;
          }

          ctx.fillStyle = isHovered || isStarHovered ? '#FFFFFF' : starColor;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * (isStarHovered ? 1.4 : 1), 0, Math.PI * 2);
          ctx.fill();

          // Nombre de la estrella si está activa
          if (isHovered || isStarHovered) {
            ctx.font = '11px "JetBrains Mono", monospace';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.fillText(s.name, s.x + 8, s.y - 6);
          }
        });

        // Etiqueta de la constelación
        if (isHovered && c.stars.length) {
          const centerStar = c.stars[0];
          ctx.font = 'italic 15px "Cormorant Garamond", Georgia, serif';
          ctx.fillStyle = c.color;
          ctx.fillText(`✦ ${c.name}`, centerStar.x - 20, centerStar.y + 24);
        }
      });

      // Dibujar estrella fugaz
      spawnShootingStar();
      if (shootingStar) {
        ctx.save();
        ctx.strokeStyle = `rgba(255, 255, 255, ${shootingStar.opacity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(shootingStar.x, shootingStar.y);
        ctx.lineTo(
          shootingStar.x - Math.cos(shootingStar.angle) * shootingStar.len,
          shootingStar.y - Math.sin(shootingStar.angle) * shootingStar.len
        );
        ctx.stroke();
        ctx.restore();

        shootingStar.x += Math.cos(shootingStar.angle) * shootingStar.speed;
        shootingStar.y += Math.sin(shootingStar.angle) * shootingStar.speed;
        shootingStar.opacity -= 0.025;
        if (shootingStar.opacity <= 0 || shootingStar.x > W || shootingStar.y > H) {
          shootingStar = null;
        }
      }

      skyAnimId = requestAnimationFrame(renderSky);
    }

    renderSky();

    // Detección de interacción (mouse/touch)
    function handlePointer(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width;
      const scaleY = H / rect.height;
      const x = (clientX - rect.left) * scaleX;
      const y = (clientY - rect.top) * scaleY;

      let foundConstellation = null;
      let foundStar = null;

      for (const c of constellations) {
        for (const s of c.stars) {
          const dist = Math.hypot(s.x - x, s.y - y);
          if (dist < 26) {
            foundConstellation = c;
            foundStar = s;
            break;
          }
        }
        if (foundConstellation) break;
      }

      if (foundConstellation !== activeConstellation) {
        activeConstellation = foundConstellation;
        hoveredStar = foundStar;
        if (foundConstellation) {
          playChimeGlobal();
          const legend = document.getElementById('skyLegend');
          const quoteCard = document.getElementById('skyCardInfo');
          if (legend) legend.innerHTML = `<strong>✨ ${foundConstellation.name}:</strong> ${foundConstellation.desc}`;
          if (quoteCard) {
            quoteCard.innerHTML = `<div class="sky-card-quote">${foundConstellation.quote}</div>`;
          }
        }
      }
    }

    canvas.addEventListener('mousemove', (e) => handlePointer(e.clientX, e.clientY));
    canvas.addEventListener('click', (e) => handlePointer(e.clientX, e.clientY));
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length) handlePointer(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
  }

  // =========================================
  // 13. MAPA DE NUESTROS LUGARES
  // =========================================
  let loveMapInstance = null;
  function initLoveMap() {
    const mapEl = document.getElementById('lovemap');
    if (!mapEl || loveMapInstance || typeof L === 'undefined') return;

    const PLACES = [
      {
        name: 'Escuela Politécnica Nacional',
        icon: '🎓',
        lat: -0.2095662,
        lng: -78.4895334,
        note: 'El lugar donde más compartimos, y donde surgió todo.'
      },
      {
        name: 'BLIZZ',
        icon: '⛸️',
        lat: -0.2171063,
        lng: -78.4383212,
        note: 'Nuestras súper prácticas de patinaje, donde te caíste.'
      },
      {
        name: 'Parque Itchimbía · "El cielito"',
        icon: '✨',
        lat: -0.2223173,
        lng: -78.4990989,
        note: 'Aquí está el rincón al que le pusimos "el cielito".'
      },
      {
        name: 'Café Río Intag',
        icon: '☕',
        lat: -0.2086487,
        lng: -78.4829176,
        note: 'El mejor lugar de Quito, donde fuimos desarrollando nuestro amor.'
      },
      {
        name: 'El Panecillo',
        icon: '🌄',
        lat: -0.2303178,
        lng: -78.5192298,
        note: 'Nuestra súper primera cita. Parecíamos adolescentes.'
      }
    ];

    loveMapInstance = L.map('lovemap', {
      zoomControl: true,
      scrollWheelZoom: false
    }).setView([-0.213, -78.485], 12);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap, © CARTO',
      maxZoom: 19
    }).addTo(loveMapInstance);

    const bounds = [];
    PLACES.forEach((place) => {
      const icon = L.divIcon({
        className: '',
        html: `<div class="love-marker"><span>${place.icon}</span></div>`,
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -34]
      });
      L.marker([place.lat, place.lng], { icon })
        .addTo(loveMapInstance)
        .bindPopup(`<p class="map-popup-title">${place.name}</p><p class="map-popup-note">${place.note}</p>`);
      bounds.push([place.lat, place.lng]);
    });

    loveMapInstance.fitBounds(bounds, { padding: [30, 30] });
    setTimeout(() => { if (loveMapInstance) loveMapInstance.invalidateSize(); }, 400);
  }

  // =========================================
  // 14. CARTA CON EFECTO DE SOBRE
  // =========================================
  let letterOpened = false;

  function unfoldLetter() {
    if (letterOpened) return;
    letterOpened = true;

    const wrapper = document.querySelector('.letter-wrapper');
    if (!wrapper) return;

    // Crear el sobre si no existe
    let envelope = wrapper.querySelector('.envelope');
    const letter = wrapper.querySelector('.letter');

    if (!envelope) {
      envelope = document.createElement('div');
      envelope.className = 'envelope';
      envelope.innerHTML = `
        <div class="envelope-body"></div>
        <div class="envelope-flap"></div>
        <div class="envelope-seal">❤</div>
        <div class="envelope-label">Toca para abrir</div>
      `;
      wrapper.insertBefore(envelope, letter);

      // Ocultar la carta inicialmente
      gsap.set(letter, { opacity: 0, y: 30, scale: 0.95 });

      envelope.addEventListener('click', () => {
        envelope.classList.add('open');

        // Animar la carta saliendo del sobre
        gsap.to(letter, {
          opacity: 1,
          y: -60,
          scale: 1,
          duration: 1,
          ease: 'power2.out',
          delay: 0.3
        });

        // Reproducir sonido de abrir sobre
        try {
          const ctx = getAudioCtx();
          if (ctx) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(400, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.5);
          }
        } catch (e) {}
      });
    }
  }

  // =========================================
  // 15. SORPRESA: CIELO ESTRELLADO
  // =========================================
  window.starfieldInitialized = false;
  window.starfieldTimers = [];

  function initStarfield() {
    if (window.starfieldInitialized) return;
    window.starfieldInitialized = true;

    const container = document.getElementById('starfield');
    if (!container) return;
    container.innerHTML = '';

    const modal = document.getElementById('thought-modal');
    const thoughtText = document.getElementById('thought-text');
    const closeModal = modal ? modal.querySelector('.close-modal') : null;

    function showThought(phrase) {
      thoughtText.textContent = phrase;
      modal.classList.add('show');
      gsap.from('.modal-content', {
        scale: 0.8,
        opacity: 0,
        duration: 0.6,
        ease: 'back.out(1.7)'
      });
    }

    function playChime() {
      try {
        const ctx = getAudioCtx();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 1200 + Math.random() * 400;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      } catch (e) { /* silencio */ }
    }

    function drawLetter(letter, startX, startY, scale = 1) {
      const points = [];
      const size = 4 * scale;
      if (letter === 'A') {
        const pts = [
          [0, 0], [2, -4], [4, 0],
          [3.5, -1], [0.5, -1],
          [1, -2.5], [3, -2.5]
        ];
        pts.forEach(([x, y]) => {
          points.push({ x: startX + x * size, y: startY + y * size });
        });
      } else if (letter === 'L') {
        const pts = [
          [0, 0], [0, 4], [3, 4]
        ];
        pts.forEach(([x, y]) => {
          points.push({ x: startX + x * size, y: startY + y * size });
        });
      }
      return points;
    }

    const numStars = 60;
    for (let i = 0; i < numStars; i++) {
      const star = document.createElement('div');
      star.className = 'star-interactive';
      const size = 2 + Math.random() * 5;
      star.style.width = size + 'px';
      star.style.height = size + 'px';
      star.style.left = Math.random() * 92 + 4 + '%';
      star.style.top = Math.random() * 92 + 4 + '%';
      star.style.opacity = 0.3 + Math.random() * 0.6;
      const thoughtIndex = Math.floor(Math.random() * THOUGHTS.length);
      star.dataset.thought = THOUGHTS[thoughtIndex];
      container.appendChild(star);

      gsap.to(star, {
        opacity: 0.2 + Math.random() * 0.6,
        duration: 2 + Math.random() * 4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      star.addEventListener('click', (e) => {
        e.stopPropagation();
        playChime();
        showThought(star.dataset.thought);
      });
    }

    const cw = container.offsetWidth;
    const ch = container.offsetHeight;
    const scale = Math.min(cw, ch) / 300;

    const aPoints = drawLetter('A', 20, 30, scale);
    const lPoints = drawLetter('L', 60, 30, scale);
    const allSpecial = [...aPoints, ...lPoints];

    allSpecial.forEach((p) => {
      const star = document.createElement('div');
      star.className = 'star-interactive special';
      const size = 6 + Math.random() * 4;
      star.style.width = size + 'px';
      star.style.height = size + 'px';
      star.style.left = p.x + '%';
      star.style.top = p.y + '%';
      star.style.opacity = 0.9;
      const thought = THOUGHTS[Math.floor(Math.random() * THOUGHTS.length)];
      star.dataset.thought = thought;
      container.appendChild(star);

      gsap.to(star, {
        opacity: 0.6 + Math.random() * 0.4,
        duration: 1.5 + Math.random() * 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      star.addEventListener('click', (e) => {
        e.stopPropagation();
        playChime();
        showThought(star.dataset.thought);
      });
    });

    closeModal.addEventListener('click', () => {
      modal.classList.remove('show');
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('show');
    });
  }

  // =========================================
  // 16. POLAROID DEL CAPÍTULO FUTURO (INTERACTIVO)
  // =========================================
  const futurePolaroid = document.getElementById('futurePolaroid');
  const futureModal = document.getElementById('future-modal');
  const closeFutureModal = document.getElementById('closeFutureModal');

  if (futurePolaroid && futureModal) {
    futurePolaroid.addEventListener('click', () => {
      futureModal.classList.add('show');
      gsap.from('#future-modal .modal-content', {
        scale: 0.8,
        opacity: 0,
        duration: 0.6,
        ease: 'back.out(1.7)'
      });
    });

    futurePolaroid.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        futurePolaroid.click();
      }
    });
  }

  if (closeFutureModal && futureModal) {
    closeFutureModal.addEventListener('click', () => {
      futureModal.classList.remove('show');
    });
    futureModal.addEventListener('click', (e) => {
      if (e.target === futureModal) futureModal.classList.remove('show');
    });
  }

  // =========================================
  // 17. SLIDESHOW DEL FINAL
  // =========================================
  function initSlideshow() {
    if (window.slideshowInterval) {
      clearInterval(window.slideshowInterval);
      window.slideshowInterval = null;
    }

    const track = document.getElementById('slideshowTrack');
    const indicatorsContainer = document.getElementById('slideshowIndicators');
    if (!track) return;
    track.innerHTML = '';
    if (indicatorsContainer) indicatorsContainer.innerHTML = '';

    const images = [
      'assets/images/ending/foto1.jpg',
      'assets/images/ending/foto2.jpg',
      'assets/images/ending/foto3.jpg',
      'assets/images/ending/foto4.jpg',
      'assets/images/ending/foto5.jpg'
    ];

    let validImages = 0;
    const loadedImages = [];

    images.forEach((src) => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = 'Momento especial';
      img.loading = 'lazy';
      img.onerror = () => { validImages--; };
      img.onload = () => { validImages++; };
      track.appendChild(img);
      loadedImages.push(img);
    });

    setTimeout(() => {
      if (validImages === 0 && loadedImages.length > 0) {
        track.innerHTML = '';
        const placeholder = document.createElement('div');
        placeholder.style.cssText = 'width:100%;height:100%;display:flex;justify-content:center;align-items:center;color:var(--text-sec);font-size:1.2rem;';
        placeholder.textContent = 'Fotos próximamente 📸';
        track.appendChild(placeholder);
        return;
      }

      const total = images.length;
      if (indicatorsContainer) {
        for (let i = 0; i < total; i++) {
          const dot = document.createElement('button');
          dot.className = 'dot';
          dot.dataset.index = i;
          dot.setAttribute('aria-label', `Ir a foto ${i + 1}`);
          dot.addEventListener('click', () => goToSlide(i));
          indicatorsContainer.appendChild(dot);
        }
      }

      let currentSlide = 0;
      const dots = indicatorsContainer ? indicatorsContainer.querySelectorAll('.dot') : [];

      function goToSlide(index) {
        if (index < 0 || index >= total) return;
        currentSlide = index;
        const width = track.parentElement.clientWidth;
        gsap.to(track, {
          x: -index * width,
          duration: 0.8,
          ease: 'power2.inOut'
        });
        dots.forEach((d, i) => {
          d.classList.toggle('active', i === index);
        });
      }

      const resizeHandler = () => {
        const width = track.parentElement.clientWidth;
        gsap.set(track, { x: -currentSlide * width });
      };
      if (track._resizeHandler) {
        window.removeEventListener('resize', track._resizeHandler);
      }
      window.addEventListener('resize', resizeHandler);

      window.slideshowInterval = setInterval(() => {
        const next = (currentSlide + 1) % total;
        goToSlide(next);
      }, 3500);

      setTimeout(() => goToSlide(0), 300);
      track._resizeHandler = resizeHandler;

    }, 500);
  }

  // =========================================
  // 18. CERTIFICADO MEJORADO (CORREGIDO)
  // =========================================
  function generateCertificate() {
    const canvas = document.createElement('canvas');
    const W = 1400, H = 1100;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // Dibuja un corazón vectorial (evita el bug de iOS que fuerza el emoji
    // a color sin importar el fillStyle que se le ponga en canvas)
    function drawHeart(context, centerX, centerY, size, color) {
      const width = size;
      const height = size;
      const x = centerX;
      const y = centerY - height / 2;
      const topCurveHeight = height * 0.3;
      context.save();
      context.beginPath();
      context.moveTo(x, y + topCurveHeight);
      context.bezierCurveTo(x, y, x - width / 2, y, x - width / 2, y + topCurveHeight);
      context.bezierCurveTo(x - width / 2, y + (height + topCurveHeight) / 2, x, y + (height + topCurveHeight) / 2, x, y + height);
      context.bezierCurveTo(x, y + (height + topCurveHeight) / 2, x + width / 2, y + (height + topCurveHeight) / 2, x + width / 2, y + topCurveHeight);
      context.bezierCurveTo(x + width / 2, y, x, y, x, y + topCurveHeight);
      context.closePath();
      context.fillStyle = color;
      context.fill();
      context.restore();
    }

    // ---- Fondo ----
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#09090B');
    bg.addColorStop(0.5, '#0D0D14');
    bg.addColorStop(1, '#16161D');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // ---- Glow central ----
    const glow = ctx.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, 900);
    glow.addColorStop(0, 'rgba(179, 157, 219, 0.08)');
    glow.addColorStop(0.5, 'rgba(179, 157, 219, 0.03)');
    glow.addColorStop(1, 'rgba(9, 9, 11, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // ---- Corazón de fondo (más pequeño) ----
    drawHeart(ctx, W / 2, H / 2 + 50, 190, 'rgba(179, 157, 219, 0.015)');

    // ---- Bordes y esquinas ----
    ctx.strokeStyle = 'rgba(179, 157, 219, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 50, W - 100, H - 100);
    ctx.strokeStyle = 'rgba(192, 57, 43, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(70, 70, W - 140, H - 140);

    function drawCorner(x, y, rotation) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.strokeStyle = 'rgba(179, 157, 219, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -25);
      ctx.lineTo(0, 0);
      ctx.lineTo(25, 0);
      ctx.stroke();
      ctx.fillStyle = 'rgba(192, 57, 43, 0.8)';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    drawCorner(50, 50, 0);
    drawCorner(W - 50, 50, Math.PI / 2);
    drawCorner(W - 50, H - 50, Math.PI);
    drawCorner(50, H - 50, -Math.PI / 2);

    // ---- Estrellas decorativas ----
    const starPositions = [
      [120, 120], [W - 120, 120], [W - 120, H - 120], [120, H - 120],
      [200, 200], [W - 200, 200], [W - 200, H - 200], [200, H - 200],
      [W / 2, 90], [W / 2, H - 90], [90, H / 2], [W - 90, H / 2]
    ];
    starPositions.forEach(([sx, sy]) => {
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Fondo de estrellas aleatorias
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    for (let i = 0; i < 60; i++) {
      const x = 100 + Math.random() * (W - 200);
      const y = 100 + Math.random() * (H - 200);
      const r = Math.random() * 1.2;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // ---- Sello ----
    function drawSeal(cx, cy, r) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.strokeStyle = 'rgba(192, 57, 43, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(179, 157, 219, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, r - 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = '24px Arial';
      ctx.fillStyle = 'rgba(192, 57, 43, 0.7)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      drawHeart(ctx, 0, -2, 22, 'rgba(192, 57, 43, 0.7)');
      ctx.font = '10px Arial';
      ctx.fillStyle = 'rgba(179, 157, 219, 0.6)';
      const text = 'CERTIFICADO OFICIAL';
      const angleStep = (Math.PI * 2) / text.length;
      for (let i = 0; i < text.length; i++) {
        ctx.save();
        ctx.rotate(i * angleStep - Math.PI / 2);
        ctx.fillText(text[i], 0, -(r - 4));
        ctx.restore();
      }
      ctx.restore();
    }
    drawSeal(W - 140, 140, 45);

    // ---- Número de certificado ----
    ctx.fillStyle = 'rgba(179, 157, 219, 0.4)';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('CERT. No. 001  —  Serie: Eterna', 90, 100);

    // ---- Título ----
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#C0392B';
    ctx.font = '300 18px Georgia, serif';
    ctx.fillText('C E R T I F I C A D O   D E', W / 2, 160);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 72px "Cormorant Garamond", Georgia, serif';
    ctx.fillText('Nuestra Historia', W / 2, 190);

    ctx.strokeStyle = 'rgba(192, 57, 43, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 180, 270);
    ctx.lineTo(W / 2 + 180, 270);
    ctx.stroke();

    function drawDiamond(cx, cy, size) {
      ctx.beginPath();
      ctx.moveTo(cx, cy - size);
      ctx.lineTo(cx + size, cy);
      ctx.lineTo(cx, cy + size);
      ctx.lineTo(cx - size, cy);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(179, 157, 219, 0.6)';
    drawDiamond(W / 2 - 200, 270, 4);
    drawDiamond(W / 2 + 200, 270, 4);

    ctx.fillStyle = '#B39DDB';
    ctx.font = 'italic 26px Georgia, serif';
    ctx.fillText('Certificado de Amor Eterno', W / 2, 290);

    ctx.fillStyle = 'rgba(192, 57, 43, 0.7)';
    ctx.font = '16px Georgia, serif';
    ctx.fillText('Desde el 24 de abril de 2026', W / 2, 330);

    // ---- CUERPO DEL TEXTO (con interlineado mejorado) ----
    const bodyLines = [
      'Por la presente se certifica que',
      '',
      'Elizabeth Zambrano Saltos',
      '',
      'ha demostrado ser la persona que ilumina cada día,',
      'la razón por la que todo pesa menos,',
      'y la compañía que se elige una y otra vez.',
      '',
      'Este documento certifica nuestro amor,',
      'nuestras risas, nuestros desayunos,',
      'nuestras aventuras y nuestros silencios cómplices,',
      'y todas las páginas que aún nos faltan por escribir.'
    ];

    const startY = 380;
    const lineHeight = 38;
    const fontSize = 16;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = `${fontSize}px Georgia, serif`;
    ctx.fillStyle = '#B5B5C3';

    bodyLines.forEach((line, idx) => {
      const y = startY + idx * lineHeight;
      if (line === 'Elizabeth Zambrano Saltos') {
        ctx.shadowColor = 'rgba(179, 157, 219, 0.5)';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#B39DDB';
        ctx.font = 'italic 32px "Cormorant Garamond", Georgia, serif';
        ctx.fillText(line, W / 2, y);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#B5B5C3';
        ctx.font = `${fontSize}px Georgia, serif`;
      } else if (line === '') {
        // salto de línea vacío
      } else {
        ctx.fillText(line, W / 2, y);
      }
    });

    // ---- Pie de página ----
    const footerY = startY + bodyLines.length * lineHeight + 40;
    ctx.fillStyle = 'rgba(179, 157, 219, 0.6)';
    ctx.font = 'italic 16px Georgia, serif';
    ctx.fillText('Este certificado no tiene fecha de vencimiento', W / 2, footerY);

    const lineY = footerY + 40;
    ctx.strokeStyle = 'rgba(179, 157, 219, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 100, lineY);
    ctx.lineTo(W / 2 + 100, lineY);
    ctx.stroke();

    const today = new Date();
    const fecha = today.toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' });
    ctx.fillStyle = '#B5B5C3';
    ctx.font = '16px Georgia, serif';
    ctx.fillText('Emitido el ' + fecha, W / 2, lineY + 40);

    // Corazón final (más pequeño)
    drawHeart(ctx, W / 2, lineY + 118, 34, 'rgba(192, 57, 43, 0.8)');

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'italic 22px "Cormorant Garamond", Georgia, serif';
    ctx.fillText('Con todo mi amor,', W / 2, lineY + 150);
    ctx.font = 'italic 28px "Cormorant Garamond", Georgia, serif';
    ctx.fillText('Alejandro', W / 2, lineY + 190);

    ctx.strokeStyle = 'rgba(179, 157, 219, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 120, lineY + 205);
    ctx.lineTo(W / 2 + 120, lineY + 205);
    ctx.stroke();

    // ---- Descarga ----
    const link = document.createElement('a');
    link.download = 'certificado-nuestra-historia.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  // =========================================
  // 19. CERRAR MODAL DE CONFIRMACIÓN
  // =========================================
  document.getElementById('confirm-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      e.target.classList.remove('show');
    }
  });

  // =========================================
  // 20. PRELOAD ESTRATÉGICO DE IMÁGENES
  // =========================================
  function preloadNextImages(currentIdx) {
    const nextIdx = currentIdx + 1;
    if (nextIdx >= SECTION_IDS.length) return;

    const nextSection = document.getElementById(SECTION_IDS[nextIdx]);
    if (!nextSection) return;

    const images = nextSection.querySelectorAll('img[data-src], img[src]');
    images.forEach(img => {
      const src = img.dataset.src || img.src;
      if (src && !src.startsWith('data:')) {
        const preloadImg = new Image();
        preloadImg.src = src;
      }
    });
  }

  // Preload cuando se llega a una sección
  const originalGoToSection = goToSection;
  goToSection = function(index) {
    preloadNextImages(index);
    return originalGoToSection(index);
  };

  // =========================================
  // 21. PROPÓSITOS DEL SEMESTRE
  // =========================================
  const PROPOSITOS_DEFAULT = [
    {
      titulo: 'Alejandro',
      items: [
        ''
      ]
    },
    {
      titulo: 'Elizabeth',
      items: [
        'Comprar lonchera',
        'Comprar blusitas, pañitos húmedos, desmaquillante y maquillaje',
        'Comprar cosas que faltan en la casita',
        'Buscar prácticas preprofesionales',
        'Aprender Excel, Civil 3D, AutoCAD, planillaje, presupuestos de ing civil, Revit y R',
        'Nunca faltar a clases'
      ]
    },
    {
      titulo: 'Juntos',
      items: [
        'Planificación de comidas',
        'Ahorro en pareja',
        'Horas de vinculación',
        'Planificación del semestre académico',
        'Ir a ver Avengers en diciembre',
        'Mantener organizada la casita',
        'Matricularse juntos',
        'Pedir material pasado',
        'Ser cepillines',
        'Planear citas, viajes y experiencias en pareja'
      ]
    }
  ];

  const PROPOSITOS_KEY = 'propositos_semestre_v1';
  let propositosData = getLocalPropositos();
  let propositosEditing = false;

  function getLocalPropositos() {
    try {
      const raw = localStorage.getItem(PROPOSITOS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length === PROPOSITOS_DEFAULT.length) {
          return parsed.map((col, i) => ({
            titulo: col.titulo || PROPOSITOS_DEFAULT[i].titulo,
            items: Array.isArray(col.items)
              ? col.items.map((item, orden) => typeof item === 'string'
                ? { id: null, texto: item, orden, completado: false }
                : { id: null, texto: item.texto || '', orden, completado: !!item.completado })
              : []
          }));
        }
      }
    } catch (e) {}
    return PROPOSITOS_DEFAULT.map(col => ({
      titulo: col.titulo,
        items: col.items.filter(Boolean).map((texto, orden) => ({ id: null, texto, orden, completado: false }))
    }));
  }

  function savePropositos() {
    try {
      localStorage.setItem(PROPOSITOS_KEY, JSON.stringify(propositosData.map(col => ({
        titulo: col.titulo,
        items: col.items.map(item => ({ texto: item.texto, completado: !!item.completado }))
      }))));
    } catch (e) {}
  }

  function propositosHeaders() {
    return {
      apikey: SUPABASE_KEY,
      Authorization: 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json'
    };
  }

  async function syncPropositos() {
    try {
      const res = await fetch(SUPABASE_URL + '/rest/v1/propositos?select=*&order=categoria,orden,id', {
        headers: propositosHeaders()
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      let rows = await res.json();

      if (!rows.length) {
        const seed = propositosData.flatMap(col => col.items
          .filter(item => item.texto.trim())
          .map((item, orden) => ({ categoria: col.titulo, texto: item.texto.trim(), orden, completado: !!item.completado })));
        if (seed.length) {
          const seedRes = await fetch(SUPABASE_URL + '/rest/v1/propositos', {
            method: 'POST',
            headers: { ...propositosHeaders(), Prefer: 'return=representation' },
            body: JSON.stringify(seed)
          });
          if (!seedRes.ok) throw new Error('HTTP ' + seedRes.status);
          rows = await seedRes.json();
        }
      }

      const byCategory = PROPOSITOS_DEFAULT.map(col => ({
        titulo: col.titulo,
        items: rows.filter(row => row.categoria === col.titulo)
          .sort((a, b) => a.orden - b.orden)
          .map(row => ({ id: row.id, texto: row.texto, orden: row.orden, completado: !!row.completado }))
      }));
      propositosData = byCategory;
      savePropositos();
      renderPropositos();
    } catch (e) {
      // La vista local sigue disponible si Supabase no responde.
    }
  }

  function renderPropositos() {
    const grid = document.getElementById('propGrid');
    if (!grid) return;

    const editing = propositosEditing;

    if (grid.dataset.bound !== 'true') {
      grid.dataset.bound = 'true';

      grid.addEventListener('input', (e) => {
        if (e.target && e.target.classList.contains('prop-input')) {
          const ci = Number(e.target.dataset.ci);
          const ii = Number(e.target.dataset.ii);
          const item = propositosData[ci] && propositosData[ci].items[ii];
          if (item) {
            item.texto = e.target.value;
            savePropositos();
          }
        }
      });

      grid.addEventListener('change', async (e) => {
        if (!e.target || !e.target.classList.contains('prop-input')) return;
        const ci = Number(e.target.dataset.ci);
        const ii = Number(e.target.dataset.ii);
        const item = propositosData[ci] && propositosData[ci].items[ii];
        if (!item || !item.texto.trim()) return;
        const payload = { categoria: propositosData[ci].titulo, texto: item.texto.trim(), orden: ii, completado: !!item.completado };
        try {
          const url = item.id
            ? SUPABASE_URL + '/rest/v1/propositos?id=eq.' + item.id
            : SUPABASE_URL + '/rest/v1/propositos';
          const res = await fetch(url, {
            method: item.id ? 'PATCH' : 'POST',
            headers: { ...propositosHeaders(), Prefer: 'return=representation' },
            body: JSON.stringify(payload)
          });
          if (!res.ok) throw new Error('HTTP ' + res.status);
          if (!item.id) {
            const saved = await res.json();
            if (saved[0]) item.id = saved[0].id;
          }
          savePropositos();
        } catch (error) {
          // El texto queda en localStorage y se reintenta en la próxima edición.
        }
      });

      grid.addEventListener('click', (e) => {
        const complete = e.target.closest('.prop-complete');
        if (complete) {
          const ci = Number(complete.dataset.ci);
          const ii = Number(complete.dataset.ii);
          const item = propositosData[ci] && propositosData[ci].items[ii];
          if (!item) return;
          item.completado = !item.completado;
          savePropositos();
          if (item.id) {
            fetch(SUPABASE_URL + '/rest/v1/propositos?id=eq.' + item.id, {
              method: 'PATCH',
              headers: { ...propositosHeaders(), Prefer: 'return=minimal' },
              body: JSON.stringify({ completado: item.completado })
            });
          }
          renderPropositos();
          return;
        }
        const del = e.target.closest('.prop-del');
        if (del) {
        const ci = Number(del.dataset.ci);
        const ii = Number(del.dataset.ii);
          const item = propositosData[ci].items[ii];
          propositosData[ci].items.splice(ii, 1);
          savePropositos();
          if (item && item.id) {
            fetch(SUPABASE_URL + '/rest/v1/propositos?id=eq.' + item.id, {
              method: 'DELETE',
              headers: propositosHeaders()
            });
          }
          redrawPropositos();
        }
      });
    }

    const cols = propositosData.map((categoria, ci) => {
      const col = document.createElement('div');
      col.className = 'prop-col';

      const head = document.createElement('div');
      head.className = 'prop-col-head';
      head.innerHTML = `<h3>${categoria.titulo}</h3>`;
      col.appendChild(head);

      const list = document.createElement('div');
      list.className = 'prop-list';

      categoria.items.forEach((texto, ii) => {
        if (!editing && texto.texto.trim() === '') return;
        list.appendChild(buildPropItem(ci, ii, editing));
      });

      if (editing) {
        const addBtn = document.createElement('button');
        addBtn.className = 'prop-add';
        addBtn.innerHTML = '+ Agregar';
        addBtn.addEventListener('click', () => {
          propositosData[ci].items.push({ id: null, texto: '', orden: propositosData[ci].items.length });
          savePropositos();
          redrawPropositos();
          const newRows = document.querySelectorAll('.prop-col');
          const inputs = newRows[ci] ? newRows[ci].querySelectorAll('.prop-input') : [];
          if (inputs.length) inputs[inputs.length - 1].focus();
        });
        list.appendChild(addBtn);
      }

      col.appendChild(list);
      return col;
    });

    grid.replaceChildren(...cols);
  }

  function buildPropItem(ci, ii, editing) {
    const row = document.createElement('div');
    row.className = editing ? 'prop-row' : 'prop-item';
    if (propositosData[ci].items[ii].completado) row.classList.add('is-completed');
    row.setAttribute('aria-label', `Propósito de ${propositosData[ci].titulo}`);
    const item = propositosData[ci].items[ii];

    if (editing) {
      const input = document.createElement('input');
      input.className = 'prop-input';
      input.type = 'text';
      input.value = item.texto;
      input.placeholder = 'Escribe un propósito…';
      input.dataset.ci = ci;
      input.dataset.ii = ii;
      row.appendChild(input);

      const complete = document.createElement('button');
      complete.className = 'prop-complete';
      complete.textContent = item.completado ? '✓' : '○';
      complete.dataset.ci = ci;
      complete.dataset.ii = ii;
      complete.setAttribute('aria-label', item.completado ? 'Marcar como pendiente' : 'Marcar como cumplido');
      complete.setAttribute('aria-pressed', String(item.completado));
      row.appendChild(complete);

      const del = document.createElement('button');
      del.className = 'prop-del';
      del.innerHTML = '✕';
      del.dataset.ci = ci;
      del.dataset.ii = ii;
      del.setAttribute('aria-label', 'Eliminar propósito');
      row.appendChild(del);
    } else {
      const span = document.createElement('span');
      span.className = 'prop-text';
      span.textContent = item.texto;
      row.appendChild(span);

      const complete = document.createElement('button');
      complete.className = 'prop-complete';
      complete.textContent = item.completado ? 'Cumplido ✓' : 'Marcar cumplido';
      complete.dataset.ci = ci;
      complete.dataset.ii = ii;
      complete.setAttribute('aria-pressed', String(item.completado));
      row.appendChild(complete);
    }

    return row;
  }

  function redrawPropositos() {
    const grid = document.getElementById('propGrid');
    if (!grid) return;
    renderPropositos();
    syncPropToggle();
  }

  function syncPropToggle() {
    const btn = document.getElementById('propToggle');
    if (!btn) return;
    if (propositosEditing) {
      btn.textContent = 'Guardar';
      btn.setAttribute('aria-pressed', 'true');
    } else {
      btn.textContent = 'Editar';
      btn.setAttribute('aria-pressed', 'false');
    }
  }

  function initPropToggle() {
    const btn = document.getElementById('propToggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
      if (propositosEditing) {
        propositosData = propositosData.map(col => ({
          titulo: col.titulo,
          items: col.items.filter(item => item.texto.trim())
        }));
        savePropositos();
      }
      propositosEditing = !propositosEditing;
      renderPropositos();
      syncPropToggle();
    });
    syncPropToggle();
  }

  renderPropositos();
  initPropToggle();
  syncPropositos();

  // =========================================
  // 21b. EL FRASCO DE NUESTRAS CITAS
  // =========================================
  const DEFAULT_CITAS = [];

  const CITAS_KEY = 'frasco_citas_v2';
  let citasData = getLocalCitas();
  let currentDrawnDate = null;
  let jarInitialized = false;

  function getLocalCitas() {
    try {
      const raw = localStorage.getItem(CITAS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return DEFAULT_CITAS;
  }

  function saveCitas() {
    try {
      localStorage.setItem(CITAS_KEY, JSON.stringify(citasData));
    } catch (e) {}
    updateJarStats();
  }

  async function syncCitasFromCloud() {
    try {
      const res = await fetch(SUPABASE_URL + '/rest/v1/citas?select=*&order=created_at.desc', {
        headers: muroAuthHeaders()
      });
      if (res.ok) {
        const cloudCitas = await res.json();
        if (Array.isArray(cloudCitas) && cloudCitas.length > 0) {
          citasData = cloudCitas;
          saveCitas();
        }
      }
    } catch (e) {}
  }

  function updateJarStats() {
    const remEl = document.getElementById('jarRemainingCount');
    const compEl = document.getElementById('jarCompletedCount');
    const pending = citasData.filter(c => !c.completada).length;
    const completed = citasData.filter(c => c.completada).length;
    if (remEl) {
      remEl.textContent = pending === 0
        ? (citasData.length === 0 ? 'Frasco vacío · ¡Agreguen su primera cita abajo! ✍️' : '¡Todas las citas realizadas! 🎉')
        : `${pending} ${pending === 1 ? 'cita pendiente' : 'citas en el frasco'}`;
    }
    if (compEl) compEl.textContent = `${completed} realizadas ❤️`;
    renderJarPaperChips();
  }

  function renderJarPaperChips() {
    const jarPapers = document.getElementById('jarPapers');
    if (!jarPapers) return;
    jarPapers.innerHTML = '';
    const pending = citasData.filter(c => !c.completada);
    if (pending.length === 0) {
      const emptyHint = document.createElement('span');
      emptyHint.style.cssText = 'font-size: 0.75rem; color: var(--text-sec); opacity: 0.6; text-align: center; margin-top: 50px;';
      emptyHint.textContent = 'Vacío';
      jarPapers.appendChild(emptyHint);
      return;
    }
    const colors = ['#D9A441', '#D77A61', '#7AA2F7', '#B39DDB', '#9ECE6A'];

    const count = Math.min(pending.length, 24);
    for (let i = 0; i < count; i++) {
      const chip = document.createElement('div');
      chip.className = 'jar-paper-chip';
      const rot = (Math.sin(i * 1.5) * 35).toFixed(1);
      const color = colors[i % colors.length];
      chip.style.backgroundColor = color;
      chip.style.transform = `rotate(${rot}deg) translateY(${Math.sin(i) * 4}px)`;
      chip.style.opacity = '0.85';
      jarPapers.appendChild(chip);
    }
  }

  function initJarOfDates() {
    if (jarInitialized) return;
    jarInitialized = true;

    updateJarStats();
    syncCitasFromCloud();

    let drawFilterCategory = 'todas';
    const drawFilterSelector = document.getElementById('jarDrawFilter');
    const drawBtn = document.getElementById('drawDateBtn');
    const toggleAddBtn = document.getElementById('addDateToggleBtn');
    const addBox = document.getElementById('jarAddBox');
    const ticketModal = document.getElementById('jarTicketModal');
    const closeTicketBtn = document.getElementById('closeTicketBtn');
    const completeDateBtn = document.getElementById('completeDateBtn');
    const catSelector = document.getElementById('jarCatSelector');

    if (drawFilterSelector) {
      drawFilterSelector.addEventListener('click', (e) => {
        const btn = e.target.closest('.jar-cat-btn');
        if (!btn) return;
        drawFilterSelector.querySelectorAll('.jar-cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        drawFilterCategory = btn.dataset.cat;
      });
    }

    if (drawBtn) {
      drawBtn.addEventListener('click', () => {
        let eligible = citasData;
        if (drawFilterCategory !== 'todas') {
          eligible = citasData.filter(c => c.cat === drawFilterCategory);
        }

        if (eligible.length === 0) {
          if (addBox) {
            addBox.style.display = 'block';
            if (catSelector && drawFilterCategory !== 'todas') {
              catSelector.querySelectorAll('.jar-cat-btn').forEach(b => {
                const isMatch = b.dataset.cat === drawFilterCategory;
                b.classList.toggle('active', isMatch);
                if (isMatch) {
                  selectedCat = b.dataset.cat;
                  selectedCatLabel = b.textContent;
                }
              });
            }
            const input = document.getElementById('newDateTitle');
            if (input) input.focus();
          }
          alert(drawFilterCategory === 'todas'
            ? '¡El frasco está esperando sus primeras citas! Escribe una abajo para comenzar ✨'
            : '¡Aún no hay citas guardadas en esta categoría! Añadan una abajo para comenzar ✨');
          return;
        }

        const available = eligible.filter(c => !c.completada);
        const pool = available.length > 0 ? available : eligible;

        const picked = pool[Math.floor(Math.random() * pool.length)];
        currentDrawnDate = picked;

        // Animación de sonido y confeti
        playPageTurn();
        playChimeGlobal();

        // Animar frasco
        const jar = document.getElementById('jarGlass');
        if (jar) {
          gsap.fromTo(jar, { scale: 0.95, rotate: -3 }, { scale: 1, rotate: 0, duration: 0.4, ease: 'back.out(2)' });
        }

        // Mostrar ticket
        const catEl = document.getElementById('ticketCategory');
        const titleEl = document.getElementById('ticketTitle');
        const descEl = document.getElementById('ticketDesc');

        if (catEl) catEl.textContent = picked.cat_label || picked.catLabel || 'Cita Especial ✨';
        if (titleEl) titleEl.textContent = picked.titulo;
        if (descEl) descEl.textContent = picked.descripcion || picked.desc || 'Una hermosa oportunidad para disfrutar juntos.';

        if (ticketModal) {
          ticketModal.style.display = 'block';
          if (addBox) addBox.style.display = 'none';
          const rect = drawBtn.getBoundingClientRect();
          launchConfetti(rect.left + rect.width / 2, rect.top);
        }
      });
    }

    if (closeTicketBtn && ticketModal) {
      closeTicketBtn.addEventListener('click', () => {
        ticketModal.style.display = 'none';
      });
    }

    if (completeDateBtn && ticketModal) {
      completeDateBtn.addEventListener('click', async () => {
        if (currentDrawnDate) {
          currentDrawnDate.completada = true;
          saveCitas();
          try {
            if (currentDrawnDate.id) {
              fetch(SUPABASE_URL + '/rest/v1/citas?id=eq.' + currentDrawnDate.id, {
                method: 'PATCH',
                headers: { ...muroAuthHeaders(), Prefer: 'return=minimal' },
                body: JSON.stringify({ completada: true })
              });
            }
          } catch (e) {}
          playChimeGlobal();
          const rect = completeDateBtn.getBoundingClientRect();
          launchConfetti(rect.left + rect.width / 2, rect.top);
          completeDateBtn.textContent = '¡Celebrado! 🎉';
          setTimeout(() => {
            ticketModal.style.display = 'none';
            completeDateBtn.textContent = '¡Ya la hicimos! ❤️';
          }, 1000);
        }
      });
    }

    // Toggle de agregar cita
    if (toggleAddBtn && addBox) {
      toggleAddBtn.addEventListener('click', () => {
        const isHidden = addBox.style.display === 'none';
        addBox.style.display = isHidden ? 'block' : 'none';
        if (ticketModal) ticketModal.style.display = 'none';
      });
    }

    const cancelAddBtn = document.getElementById('cancelNewDateBtn');
    if (cancelAddBtn && addBox) {
      cancelAddBtn.addEventListener('click', () => {
        addBox.style.display = 'none';
      });
    }

    // Categorías del selector de creación
    let selectedCat = 'tranqui';
    let selectedCatLabel = 'Tranqui ☕';
    if (catSelector) {
      catSelector.addEventListener('click', (e) => {
        const btn = e.target.closest('.jar-cat-btn');
        if (!btn) return;
        catSelector.querySelectorAll('.jar-cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedCat = btn.dataset.cat;
        selectedCatLabel = btn.textContent;
      });
    }

    // Guardar nueva cita
    const saveNewDateBtn = document.getElementById('saveNewDateBtn');
    if (saveNewDateBtn) {
      saveNewDateBtn.addEventListener('click', async () => {
        const titleInput = document.getElementById('newDateTitle');
        const descInput = document.getElementById('newDateDesc');
        const title = titleInput ? titleInput.value.trim() : '';
        const desc = descInput ? descInput.value.trim() : '';

        if (!title) return;

        const newDate = {
          titulo: title,
          descripcion: desc,
          desc: desc,
          cat: selectedCat,
          cat_label: selectedCatLabel,
          catLabel: selectedCatLabel,
          completada: false
        };

        try {
          const res = await fetch(SUPABASE_URL + '/rest/v1/citas', {
            method: 'POST',
            headers: { ...muroAuthHeaders(), Prefer: 'return=representation' },
            body: JSON.stringify({
              titulo: title,
              descripcion: desc,
              cat: selectedCat,
              cat_label: selectedCatLabel,
              completada: false
            })
          });
          if (res.ok) {
            const saved = await res.json();
            if (saved && saved[0]) newDate.id = saved[0].id;
          }
        } catch (e) {
          if (!newDate.id) newDate.id = 'cita_' + Date.now();
        }

        citasData.unshift(newDate);
        saveCitas();

        if (titleInput) titleInput.value = '';
        if (descInput) descInput.value = '';
        if (addBox) addBox.style.display = 'none';

        playChimeGlobal();
        const rect = saveNewDateBtn.getBoundingClientRect();
        launchConfetti(rect.left + rect.width / 2, rect.top);
      });
    }
  }

  // =========================================
  // 22. CARTAS PROGRAMADAS (DINÁMICAS)
  // =========================================
  const DEFAULT_CARTAS = [
    {
      id: 'carta-24-abril',
      autor: 'Alejandro',
      titulo: 'Carta del 24 de agosto',
      fecha: '2026-08-24T12:00:00-05:00',
      password: 'desfogue',
      texto: 'Aquí quedará la carta del 24 de agosto.'
    }
  ];

  const CARTAS_STORAGE_KEY = 'cartas_programadas_list_v2';
  let cartasProgramadasData = getLocalCartasProgramadas();
  let cartasCountdownTimer = null;
  const cartasAbiertas = {};
  let scheduledLetterAuthor = 'Alejandro';

  function getLocalCartasProgramadas() {
    try {
      const raw = localStorage.getItem(CARTAS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_CARTAS;
  }

  function saveLocalCartasProgramadas(list) {
    try {
      localStorage.setItem(CARTAS_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {}
  }

  async function syncCartasProgramadasFromCloud() {
    try {
      const res = await fetch(SUPABASE_URL + '/rest/v1/cartas_programadas?select=*&order=fecha.asc', {
        headers: muroAuthHeaders()
      });
      if (res.ok) {
        const cloudCartas = await res.json();
        if (Array.isArray(cloudCartas) && cloudCartas.length > 0) {
          cartasProgramadasData = cloudCartas;
          saveLocalCartasProgramadas(cartasProgramadasData);
          renderCartasProgramadas();
        }
      }
    } catch (e) {}
  }

  function cartasDesbloqueadas() {
    try { return JSON.parse(localStorage.getItem('cartas_desbloqueadas_v1') || '{}'); } catch (e) { return {}; }
  }

  function saveCartaDesbloqueada(id) {
    const unlocked = cartasDesbloqueadas();
    unlocked[id] = true;
    localStorage.setItem('cartas_desbloqueadas_v1', JSON.stringify(unlocked));
  }

  function formatCartaDate(date) {
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  function updateCartasCountdown() {
    let expired = false;
    document.querySelectorAll('.scheduled-countdown').forEach((counter) => {
      const remaining = new Date(counter.dataset.release).getTime() - Date.now();
      if (remaining <= 0) {
        expired = true;
        return;
      }
      const seconds = Math.floor(remaining / 1000);
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      counter.textContent = `${days} días · ${String(hours).padStart(2, '0')} h · ${String(minutes).padStart(2, '0')} m · ${String(secs).padStart(2, '0')} s`;
    });
    if (expired) renderCartasProgramadas();
  }

  function renderCartasProgramadas() {
    const container = document.getElementById('scheduledLetters');
    if (!container) return;
    const unlocked = cartasDesbloqueadas();
    container.innerHTML = '';

    cartasProgramadasData.forEach((carta) => {
      const isUnlocked = unlocked[carta.id] || new Date() >= new Date(carta.fecha);
      const card = document.createElement('article');
      card.className = 'scheduled-letter ' + (isUnlocked ? 'is-unlocked' : 'is-locked');
      const authorLabel = carta.autor ? ` · De ${escapeHtml(carta.autor)}` : '';

      if (isUnlocked && cartasAbiertas[carta.id] === false) {
        card.innerHTML =
          '<div class="scheduled-envelope">✉️</div>' +
          '<p class="scheduled-letter-meta">Carta desbloqueada' + authorLabel + '</p>' +
          '<h3>' + escapeHtml(carta.titulo) + '</h3>' +
          '<button type="button" class="scheduled-letter-action scheduled-open">Abrir carta</button>';
      } else if (isUnlocked) {
        card.innerHTML =
          '<div class="scheduled-letter-meta">Carta abierta' + authorLabel + ' · ' + formatCartaDate(carta.fecha) + '</div>' +
          '<h3>' + escapeHtml(carta.titulo) + '</h3>' +
          '<div class="scheduled-letter-paper"><p>' + escapeHtml(carta.texto) + '</p><span>Con cariño,<br>' + escapeHtml(carta.autor || 'Alejandro') + '.</span></div>' +
          '<button type="button" class="scheduled-letter-action scheduled-close">Cerrar carta</button>';
      } else {
        card.innerHTML =
          '<div class="scheduled-envelope">✉️</div>' +
          '<p class="scheduled-letter-date">Se abre el ' + formatCartaDate(carta.fecha) + authorLabel + '</p>' +
          '<h3>' + escapeHtml(carta.titulo) + '</h3>' +
          '<div class="scheduled-countdown" data-release="' + carta.fecha + '"></div>' +
          (carta.password ? (
            '<form class="scheduled-unlock-form">' +
              '<input type="password" placeholder="Contraseña" aria-label="Contraseña de la carta" />' +
              '<button type="submit">Desbloquear</button>' +
            '</form>' +
            '<small class="scheduled-hint">También puedes probarla con la contraseña.</small>'
          ) : '<small class="scheduled-hint" style="margin-top:10px;">Esperando la fecha fijada ⏳</small>');

        const form = card.querySelector('form');
        if (form) {
          form.addEventListener('submit', (event) => {
            event.preventDefault();
            const input = form.querySelector('input');
            if (input && input.value.trim() === (carta.password || '').trim()) {
              saveCartaDesbloqueada(carta.id);
              renderCartasProgramadas();
            } else if (input) {
              input.value = '';
              input.placeholder = 'Contraseña incorrecta';
              input.classList.add('is-wrong');
            }
          });
        }
      }

      const openButton = card.querySelector('.scheduled-open');
      if (openButton) {
        openButton.addEventListener('click', () => {
          cartasAbiertas[carta.id] = true;
          renderCartasProgramadas();
        });
      }
      const closeButton = card.querySelector('.scheduled-close');
      if (closeButton) {
        closeButton.addEventListener('click', () => {
          cartasAbiertas[carta.id] = false;
          renderCartasProgramadas();
        });
      }

      container.appendChild(card);
    });
    clearInterval(cartasCountdownTimer);
    cartasCountdownTimer = setInterval(updateCartasCountdown, 1000);
    updateCartasCountdown();
  }

  function initScheduledLetterModal() {
    const openBtn = document.getElementById('openNewLetterModalBtn');
    const modal = document.getElementById('newScheduledLetterModal');
    const closeBtn = document.getElementById('closeScheduledLetterModalBtn');
    const saveBtn = document.getElementById('saveScheduledLetterBtn');
    const authorSeg = document.getElementById('letterAuthorSeg');

    if (authorSeg) {
      authorSeg.addEventListener('click', (e) => {
        const btn = e.target.closest('.muro-seg-btn');
        if (!btn) return;
        authorSeg.querySelectorAll('.muro-seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        scheduledLetterAuthor = btn.dataset.autor;
      });
    }

    if (openBtn && modal) {
      openBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
      });
    }

    if (saveBtn && modal) {
      saveBtn.addEventListener('click', async () => {
        const titleEl = document.getElementById('newLetterTitle');
        const dateEl = document.getElementById('newLetterDate');
        const passEl = document.getElementById('newLetterPassword');
        const textEl = document.getElementById('newLetterText');
        const statusEl = document.getElementById('scheduledLetterStatus');

        const title = titleEl ? titleEl.value.trim() : '';
        const dateVal = dateEl ? dateEl.value : '';
        const password = passEl ? passEl.value.trim() : '';
        const texto = textEl ? textEl.value.trim() : '';

        if (!title || !dateVal || !texto) {
          if (statusEl) {
            statusEl.textContent = 'Por favor completa el título, la fecha y el texto de la carta ✍️';
            statusEl.classList.add('error');
          }
          return;
        }

        const payload = {
          autor: scheduledLetterAuthor,
          titulo: title,
          fecha: new Date(dateVal).toISOString(),
          password: password || null,
          texto: texto,
          created_at: new Date().toISOString()
        };

        try {
          const res = await fetch(SUPABASE_URL + '/rest/v1/cartas_programadas', {
            method: 'POST',
            headers: { ...muroAuthHeaders(), Prefer: 'return=representation' },
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            const saved = await res.json();
            if (saved && saved[0]) payload.id = saved[0].id;
          }
        } catch (e) {
          if (!payload.id) payload.id = 'carta_' + Date.now();
        }

        cartasProgramadasData.push(payload);
        saveLocalCartasProgramadas(cartasProgramadasData);
        renderCartasProgramadas();

        if (titleEl) titleEl.value = '';
        if (dateEl) dateEl.value = '';
        if (passEl) passEl.value = '';
        if (textEl) textEl.value = '';

        playChimeGlobal();
        if (statusEl) {
          statusEl.textContent = '¡Carta programada con éxito! ✉️💜';
          statusEl.classList.remove('error');
        }

        setTimeout(() => {
          if (statusEl) statusEl.textContent = '';
          modal.style.display = 'none';
        }, 1200);
      });
    }
  }

  renderCartasProgramadas();
  initScheduledLetterModal();
  syncCartasProgramadasFromCloud();

  // =========================================
  // 22b. CÁPSULA DEL TIEMPO (PRIMER ANIVERSARIO)
  // =========================================
  const CAPSULE_TARGET = new Date('2027-04-24T00:00:00-05:00');
  const CAPSULE_STORAGE_KEY = 'capsula_tiempo_mensajes_v2';
  let capsuleCountdownTimer = null;
  let capsuleAuthor = 'Alejandro';

  const DEFAULT_CAPSULE_MESSAGES = [];

  function getLocalCapsuleMessages() {
    try {
      const raw = localStorage.getItem(CAPSULE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return DEFAULT_CAPSULE_MESSAGES;
  }

  function saveCapsuleMessages(list) {
    try {
      localStorage.setItem(CAPSULE_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {}
    updateCapsuleStats();
  }

  async function syncCapsuleFromCloud() {
    try {
      const res = await fetch(SUPABASE_URL + '/rest/v1/capsula_tiempo?select=*&order=created_at.asc', {
        headers: muroAuthHeaders()
      });
      if (res.ok) {
        const cloudMessages = await res.json();
        if (Array.isArray(cloudMessages) && cloudMessages.length > 0) {
          saveCapsuleMessages(cloudMessages);
        }
      }
    } catch (e) {}
  }

  function updateCapsuleCountdown() {
    const now = new Date();
    const diff = CAPSULE_TARGET - now;

    const daysEl = document.getElementById('vDays');
    const hoursEl = document.getElementById('vHours');
    const minEl = document.getElementById('vMinutes');
    const secEl = document.getElementById('vSeconds');

    if (diff <= 0) {
      if (daysEl) daysEl.textContent = '000';
      if (hoursEl) hoursEl.textContent = '00';
      if (minEl) minEl.textContent = '00';
      if (secEl) secEl.textContent = '00';
      unlockCapsuleVault();
      return;
    }

    const totalSecs = Math.floor(diff / 1000);
    const days = Math.floor(totalSecs / 86400);
    const hours = Math.floor((totalSecs % 86400) / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;

    if (daysEl) daysEl.textContent = String(days).padStart(3, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minEl) minEl.textContent = String(minutes).padStart(2, '0');
    if (secEl) secEl.textContent = String(seconds).padStart(2, '0');
  }

  function updateCapsuleStats() {
    const list = getLocalCapsuleMessages();
    const badge = document.getElementById('vaultItemsBadge');
    if (badge) {
      badge.textContent = list.length === 0
        ? '💌 Cápsula vacía · ¡Sellen su primer recuerdo!'
        : `💌 ${list.length} ${list.length === 1 ? 'recuerdo sellado adentro' : 'recuerdos sellados adentro'}`;
    }
  }

  function unlockCapsuleVault() {
    const lockIcon = document.getElementById('vaultLockIcon');
    const title = document.getElementById('vaultStatusTitle');
    const listContainer = document.getElementById('vaultUnlockedMessages');

    if (lockIcon) lockIcon.textContent = '🔓';
    if (title) title.textContent = '¡Cápsula Desbloqueada! 🎉';

    if (listContainer) {
      listContainer.style.display = 'flex';
      const messages = getLocalCapsuleMessages();
      listContainer.innerHTML = '';
      messages.forEach(msg => {
        const card = document.createElement('div');
        card.className = 'vault-message-card';
        card.innerHTML = `
          <div class="vault-message-header">
            <span class="vault-message-author">${escapeHtml(msg.autor)}</span>
            <span class="vault-message-date">${formatMuroDate(msg.created_at || msg.fecha)}</span>
          </div>
          <p style="color: var(--text); line-height: 1.6;">${escapeHtml(msg.texto)}</p>
        `;
        listContainer.appendChild(card);
      });
    }
  }

  function initCapsuleVault() {
    updateCapsuleStats();
    syncCapsuleFromCloud();
    clearInterval(capsuleCountdownTimer);
    capsuleCountdownTimer = setInterval(updateCapsuleCountdown, 1000);
    updateCapsuleCountdown();

    const depositBtn = document.getElementById('openDepositBtn');
    const depositModal = document.getElementById('vaultDepositModal');
    const closeDepositBtn = document.getElementById('closeDepositBtn');
    const sealBtn = document.getElementById('sealMessageBtn');
    const emergencyBtn = document.getElementById('vaultEmergencyBtn');
    const authorSeg = document.getElementById('capsuleAuthorSeg');

    if (authorSeg) {
      authorSeg.addEventListener('click', (e) => {
        const btn = e.target.closest('.muro-seg-btn');
        if (!btn) return;
        authorSeg.querySelectorAll('.muro-seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        capsuleAuthor = btn.dataset.autor;
      });
    }

    if (depositBtn && depositModal) {
      depositBtn.addEventListener('click', () => {
        depositModal.style.display = 'flex';
      });
    }

    if (closeDepositBtn && depositModal) {
      closeDepositBtn.addEventListener('click', () => {
        depositModal.style.display = 'none';
      });
    }

    if (sealBtn && depositModal) {
      sealBtn.addEventListener('click', async () => {
        const textEl = document.getElementById('capsuleMessageText');
        const text = textEl ? textEl.value.trim() : '';
        if (!text) return;

        const payload = {
          autor: capsuleAuthor,
          texto: text,
          created_at: new Date().toISOString()
        };

        try {
          const res = await fetch(SUPABASE_URL + '/rest/v1/capsula_tiempo', {
            method: 'POST',
            headers: { ...muroAuthHeaders(), Prefer: 'return=representation' },
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            const saved = await res.json();
            if (saved && saved[0]) payload.id = saved[0].id;
          }
        } catch (e) {
          if (!payload.id) payload.id = 'cap_' + Date.now();
        }

        const messages = getLocalCapsuleMessages();
        messages.push(payload);
        saveCapsuleMessages(messages);

        if (textEl) textEl.value = '';

        playChimeGlobal();
        const statusEl = document.getElementById('capsuleStatus');
        if (statusEl) statusEl.textContent = 'Mensaje sellado con éxito 🔒💜';

        setTimeout(() => {
          if (statusEl) statusEl.textContent = '';
          depositModal.style.display = 'none';
        }, 1200);
      });
    }

    if (emergencyBtn) {
      emergencyBtn.addEventListener('click', () => {
        const pass = prompt('Introduce la clave para abrir la cápsula:');
        if (pass === 'desfogue' || pass === 'aniversario2027' || pass === '24deabril') {
          unlockCapsuleVault();
          playChimeGlobal();
        } else if (pass !== null) {
          alert('Clave incorrecta. La cápsula sigue sellada hasta el 24 de abril de 2027 🔒');
        }
      });
    }
  }

  // =========================================
  // 23. NUESTRO MURO (CON FILTROS Y REACCIONES)
  // =========================================
  let muroAutor = 'Alejandro';
  let muroTipo = 'nota';
  let muroFotoData = null;
  let muroLoaded = false;
  let muroFilter = 'todos';
  let rawMuroEntries = [];

  const REACTION_EMOJIS = ['❤️', '🥺', '✨', '🔥', '🛵'];
  const MURO_REACTIONS_KEY = 'muro_reacciones_v1';

  function getLocalReactions() {
    try {
      return JSON.parse(localStorage.getItem(MURO_REACTIONS_KEY) || '{}');
    } catch (e) {
      return {};
    }
  }

  function saveLocalReactions(map) {
    try {
      localStorage.setItem(MURO_REACTIONS_KEY, JSON.stringify(map));
    } catch (e) {}
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function muroAuthHeaders() {
    return {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json'
    };
  }

  function setMuroStatus(msg, isError) {
    const el = document.getElementById('muroStatus');
    if (el) {
      el.textContent = msg || '';
      el.classList.toggle('error', !!isError);
    }
  }

  async function loadMuro() {
    try {
      const res = await fetch(SUPABASE_URL + '/rest/v1/entradas?select=*&order=created_at.asc', {
        headers: muroAuthHeaders()
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      rawMuroEntries = Array.isArray(data) ? data : [];
      renderMuro(rawMuroEntries);
      muroLoaded = true;
    } catch (e) {
      setMuroStatus('No se pudo conectar. Revisa la conexión.', true);
    }
  }

  function formatMuroDate(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) + ' · ' +
        d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  }

  function getYouTubeId(url) {
    const match = String(url || '').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([A-Za-z0-9_-]{11})/);
    return match ? match[1] : '';
  }

  async function loadComentarios(entradaId, box) {
    try {
      const res = await fetch(SUPABASE_URL + '/rest/v1/comentarios?entrada_id=eq.' + entradaId + '&select=*&order=created_at.asc', {
        headers: muroAuthHeaders()
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      renderComentarios(await res.json(), box, entradaId);
    } catch (e) {
      box.innerHTML = '<p class="muro-comments-error">No se pudieron cargar los comentarios.</p>';
    }
  }

  function renderComentarios(comentarios, box, entradaId) {
    const list = comentarios.map(comment =>
      '<div class="muro-comment"><strong>' + escapeHtml(comment.autor) + '</strong><span>' + escapeHtml(comment.texto) + '</span></div>'
    ).join('');
    box.innerHTML =
      '<div class="muro-comment-list">' + (list || '<span class="muro-no-comments">Sin comentarios todavía</span>') + '</div>' +
      '<form class="muro-comment-form" data-entry-id="' + entradaId + '">' +
        '<select class="muro-comment-author" aria-label="Autor del comentario"><option>Alejandro</option><option>Elizabeth</option></select>' +
        '<input class="muro-comment-input" type="text" maxlength="240" placeholder="Añadir comentario…" />' +
        '<button type="submit" aria-label="Publicar comentario">＋</button>' +
      '</form>';
    box.querySelector('.muro-comment-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const input = form.querySelector('.muro-comment-input');
      const texto = input.value.trim();
      if (!texto) return;
      const res = await fetch(SUPABASE_URL + '/rest/v1/comentarios', {
        method: 'POST',
        headers: { ...muroAuthHeaders(), Prefer: 'return=representation' },
        body: JSON.stringify({
          entrada_id: entradaId,
          autor: form.querySelector('.muro-comment-author').value,
          texto
        })
      });
      if (res.ok) loadComentarios(entradaId, box);
    });
  }

  function renderMuro(entradas) {
    const grid = document.getElementById('muroGrid');
    const vacio = document.getElementById('muroVacio');
    if (!grid) return;

    const filtered = muroFilter === 'todos'
      ? entradas
      : entradas.filter(e => e.tipo === muroFilter);

    if (vacio) vacio.style.display = filtered.length ? 'none' : 'block';
    grid.innerHTML = '';

    const reactionsMap = getLocalReactions();

    const columns = {};
    [
      ['nota', '✍️', 'Mensajes'],
      ['cancion', '🎵', 'Canciones'],
      ['foto', '📸', 'Fotos']
    ].forEach(([tipo, icono, titulo]) => {
      const column = document.createElement('div');
      column.className = 'muro-column';
      column.innerHTML = '<h3 class="muro-column-title"><span>' + icono + '</span>' + titulo + '</h3>' +
        '<div class="muro-column-list"></div>';
      grid.appendChild(column);
      columns[tipo] = column.querySelector('.muro-column-list');
    });

    filtered.forEach((e) => {
      const card = document.createElement('article');
      card.className = 'muro-card muro-card--' + (e.tipo || 'nota');
      card.setAttribute('data-id', e.id);

      const autorCls = e.autor === 'Elizabeth' ? 'muro-autor-elizabeth' : 'muro-autor-alejandro';
      const icono = e.tipo === 'cancion' ? '🎵' : (e.tipo === 'foto' ? '📸' : '💌');

      let body = '';
      if (e.tipo === 'foto' && e.url) {
        body += '<img class="muro-foto" src="' + escapeHtml(e.url) + '" alt="' + escapeHtml(e.texto || 'foto') + '" loading="lazy" />';
      }
      const songUrl = e.tipo === 'cancion' ? (e.url || (e.texto && e.texto.match(/^https?:\/\//) ? e.texto : '')) : '';
      const songId = getYouTubeId(songUrl);

      if (e.texto && !(e.tipo === 'cancion' && e.texto.match(/^https?:\/\//))) {
        body += '<p class="muro-texto">' + escapeHtml(e.texto) + '</p>';
      }
      if (e.tipo === 'cancion' && songUrl) {
        if (songId) {
          body += '<a class="muro-song" href="' + escapeHtml(songUrl) + '" target="_blank" rel="noopener">' +
            '<img class="muro-song-thumb" src="https://i.ytimg.com/vi/' + songId + '/hqdefault.jpg" alt="Miniatura de la canción" loading="lazy" />' +
            '<span class="muro-song-link">▶ Escuchar en YouTube</span></a>';
        } else {
          body += '<a class="muro-enlace" href="' + escapeHtml(songUrl) + '" target="_blank" rel="noopener">Escuchar 🎧</a>';
        }
      }

      // Reacciones con emojis
      const cloudReactions = (e.reacciones && typeof e.reacciones === 'object') ? e.reacciones : {};
      const localUserReactions = reactionsMap[e.id] || {};
      const reactionsHtml = REACTION_EMOJIS.map(emoji => {
        const count = cloudReactions[emoji] || localUserReactions[emoji] || 0;
        const userReacted = localUserReactions['_user_' + emoji] ? 'user-reacted' : '';
        return `<button type="button" class="muro-reaction-btn ${userReacted}" data-emoji="${emoji}" data-id="${e.id}"><span>${emoji}</span> <span class="muro-reaction-count">${count > 0 ? count : ''}</span></button>`;
      }).join('');

      card.innerHTML =
        '<div class="muro-card-head">' +
          '<span class="muro-icon">' + icono + '</span>' +
          '<span class="muro-autor ' + autorCls + '">' + escapeHtml(e.autor) + '</span>' +
        '</div>' +
        body +
        '<div class="muro-reactions-bar">' + reactionsHtml + '</div>' +
        '<div class="muro-card-foot">' + formatMuroDate(e.created_at) + '</div>' +
        '<div class="muro-comments"></div>';

      // Event listener para reacciones sincronizadas
      card.querySelectorAll('.muro-reaction-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const emoji = btn.dataset.emoji;
          const entryId = btn.dataset.id;
          const map = getLocalReactions();
          if (!map[entryId]) map[entryId] = {};

          const currentCloud = (e.reacciones && typeof e.reacciones === 'object') ? { ...e.reacciones } : {};
          const userKey = '_user_' + emoji;

          if (map[entryId][userKey]) {
            map[entryId][userKey] = false;
            map[entryId][emoji] = Math.max(0, (map[entryId][emoji] || 1) - 1);
            currentCloud[emoji] = Math.max(0, (currentCloud[emoji] || 1) - 1);
          } else {
            map[entryId][userKey] = true;
            map[entryId][emoji] = (map[entryId][emoji] || 0) + 1;
            currentCloud[emoji] = (currentCloud[emoji] || 0) + 1;
            playChimeGlobal();
          }

          e.reacciones = currentCloud;
          saveLocalReactions(map);
          renderMuro(rawMuroEntries);

          try {
            fetch(SUPABASE_URL + '/rest/v1/entradas?id=eq.' + entryId, {
              method: 'PATCH',
              headers: { ...muroAuthHeaders(), Prefer: 'return=minimal' },
              body: JSON.stringify({ reacciones: currentCloud })
            });
          } catch (err) {}
        });
      });

      loadComentarios(e.id, card.querySelector('.muro-comments'));

      (columns[e.tipo] || columns.nota).appendChild(card);
    });
  }

  async function enviarMuro() {
    const textoEl = document.getElementById('muroTexto');
    const texto = textoEl ? textoEl.value.trim() : '';

    if (muroTipo === 'foto') {
      if (!muroFotoData) {
        setMuroStatus('Elige una foto primero 📷', true);
        return;
      }
    } else if (!texto) {
      setMuroStatus('Escribe algo antes de publicar ✍️', true);
      return;
    }

    const payload = {
      tipo: muroTipo,
      autor: muroAutor,
      titulo: null,
      texto: texto || null,
      url: muroTipo === 'foto' ? muroFotoData : (muroTipo === 'cancion' && texto.match(/^https?:\/\//) ? texto : null)
    };

    try {
      let res = await fetch(SUPABASE_URL + '/rest/v1/entradas', {
        method: 'POST',
        headers: { ...muroAuthHeaders(), Prefer: 'return=representation' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);

      if (textoEl) textoEl.value = '';
      muroFotoData = null;
      const nombre = document.getElementById('muroNombreFoto');
      if (nombre) nombre.textContent = '';
      setMuroStatus('Dejado en el muro 💜', false);
      loadMuro();
    } catch (e) {
      setMuroStatus('No se pudo publicar. Intenta de nuevo.', true);
    }
  }

  function initMuro() {
    const autorSeg = document.getElementById('muroAutor');
    const tipoSeg = document.getElementById('muroTipo');
    const archivo = document.getElementById('muroArchivo');
    const enviar = document.getElementById('muroEnviar');
    const filterContainer = document.getElementById('muroFilters');

    if (filterContainer) {
      filterContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.muro-filter-btn');
        if (!btn) return;
        filterContainer.querySelectorAll('.muro-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        muroFilter = btn.dataset.filter || 'todos';
        renderMuro(rawMuroEntries);
      });
    }

    if (autorSeg) {
      autorSeg.addEventListener('click', (e) => {
        const btn = e.target.closest('.muro-seg-btn');
        if (!btn) return;
        autorSeg.querySelectorAll('.muro-seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        muroAutor = btn.dataset.autor;
      });
    }

    if (tipoSeg) {
      tipoSeg.addEventListener('click', (e) => {
        const btn = e.target.closest('.muro-seg-btn');
        if (!btn) return;
        tipoSeg.querySelectorAll('.muro-seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        muroTipo = btn.dataset.tipo;

        const textoEl = document.getElementById('muroTexto');
        const fotoField = document.getElementById('muroFieldFoto');
        if (textoEl) {
          if (muroTipo === 'cancion') {
            textoEl.placeholder = 'Pega el nombre o el enlace de YouTube de la canción…';
          } else if (muroTipo === 'foto') {
            textoEl.placeholder = 'Pie de foto (opcional)…';
          } else {
            textoEl.placeholder = 'Escribe tu nota aquí…';
          }
        }
        if (fotoField) fotoField.style.display = muroTipo === 'foto' ? 'block' : 'none';
      });
    }

    if (archivo) {
      archivo.addEventListener('change', () => {
        const file = archivo.files && archivo.files[0];
        if (!file) return;
        if (!file.type.match(/^image\//)) {
          setMuroStatus('Ese archivo no es una imagen.', true);
          return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
          const img = new Image();
          img.onload = () => {
            const maxW = 900;
            const scale = Math.min(1, maxW / img.width);
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            muroFotoData = canvas.toDataURL('image/jpeg', 0.75);
            const nombre = document.getElementById('muroNombreFoto');
            if (nombre) nombre.textContent = '✓ ' + file.name;
            setMuroStatus('', false);
          };
          img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
      });
    }

    if (enviar) enviar.addEventListener('click', enviarMuro);

    loadMuro();
  }

  initMuro();

  // =========================================
  // 24. MOTOR DE SINCRONIZACIÓN EN TIEMPO REAL
  // =========================================
  function syncAllRealTime() {
    if (document.hidden) return;
    loadMuro();
    syncPropositos();
    syncCitasFromCloud();
    syncCapsuleFromCloud();
    syncCartasProgramadasFromCloud();
  }

  // Polling automático cada 5 segundos
  setInterval(syncAllRealTime, 5000);

  // Sincronizar inmediatamente al volver a la pestaña o desbloquear celular
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) syncAllRealTime();
  });
  window.addEventListener('focus', syncAllRealTime);

}

// =========================================
// ARRANQUE
// =========================================
function tryLoadLocalGsap() {
  if (typeof gsap !== 'undefined') return;
  const s = document.createElement('script');
  s.src = 'vendor/gsap.min.js';
  s.onload = () => document.dispatchEvent(new Event('gsap-ready'));
  document.head.appendChild(s);
}

function showStaticHeroFallback() {
  document.body.classList.add('no-gsap');
  const loaderEl = document.getElementById('loader');
  if (loaderEl) loaderEl.classList.add('hidden');
  const hero = document.getElementById('intro');
  if (hero) {
    hero.style.display = 'flex';
    hero.style.opacity = '1';
    hero.style.transform = 'translateX(0)';
    hero.classList.add('active', 'hero-animated');
  }
  const nav = document.getElementById('progress-nav');
  if (nav) nav.style.display = 'none';
  const startBtn = document.getElementById('startButton');
  if (startBtn) startBtn.style.display = 'none';
  const musicBtn = document.getElementById('ambient-audio');
  if (musicBtn) musicBtn.style.display = 'none';
}

function bootstrap() {
  if (typeof gsap === 'undefined') {
    document.body.classList.add('no-gsap');
    document.addEventListener('gsap-ready', bootstrap, { once: true });
    // Red de seguridad: reintenta el archivo local y, si nada funciona,
    // muestra la portada estática en lugar de dejar la página en blanco.
    setTimeout(tryLoadLocalGsap, 2000);
    setTimeout(() => {
      if (typeof gsap === 'undefined') showStaticHeroFallback();
    }, 6000);
    return;
  }
  initApp();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
