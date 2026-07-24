function initApp() {

  // =========================================
  // CONSTANTES Y CONFIGURACIÓN
  // =========================================
  const SECTION_IDS = [
    'intro', 'capitulo1', 'capitulo2', 'capitulo3', 'capitulo4', 'capitulo5',
    'mapa', 'galeria', 'lo-que-amo', 'playlist', 'tiempo', 'carta', 'promesas',
    'capitulo-futuro', 'sorpresa', 'final'
  ];
  const SECTION_LABELS = [
    'Inicio', 'Capítulo I · El encuentro', 'Capítulo II · La universidad',
    'Capítulo III · Patinar', 'Capítulo IV · Las vacaciones', 'Capítulo V · 24 de abril',
    'Nuestros lugares', 'Galería de fotos', 'Lo que amo de ti', 'Canciones que me recordaban a ti', 'Tiempo juntos',
    'Una carta para ti', 'Lo que prometo', 'El próximo capítulo', 'Sorpresa', 'Final'
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

    gsap.to(star, {
      opacity: 0.2 + Math.random() * 0.6,
      duration: 2 + Math.random() * 4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }

  // Efecto parallax con movimiento del mouse
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function updateParallax() {
    parallaxLayers.forEach((layer, layerIndex) => {
      const speed = (layerIndex + 1) * 8;
      layer.forEach(star => {
        const x = parseFloat(star.style.left);
        const y = parseFloat(star.style.top);
        star.style.transform = `translate(${mouseX * speed}px, ${mouseY * speed}px)`;
      });
    });
    requestAnimationFrame(updateParallax);
  }
  updateParallax();

  // =========================================
  // 3. CORAZONES FLOTANTES
  // =========================================
  const heartsContainer = document.getElementById('hearts-container');
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
  // 4. MENÚ DE PROGRESO (DOTS)
  // =========================================
  const progressNav = document.getElementById('progress-nav');
  SECTION_IDS.forEach((id, index) => {
    const dot = document.createElement('button');
    dot.className = 'progress-dot';
    dot.dataset.index = index;
    dot.setAttribute('aria-label', `Ir a: ${SECTION_LABELS[index]}`);
    dot.setAttribute('title', SECTION_LABELS[index]);
    dot.addEventListener('click', () => goToSection(index));
    progressNav.appendChild(dot);
  });
  const dots = progressNav.querySelectorAll('.progress-dot');

  function updateProgress(index) {
    dots.forEach((dot, i) => {
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
      '.chapter-content, .gallery-grid, .love-list, .playlist-list, .counter-wrapper, .letter-wrapper, #starfield, .slideshow-container, .final-qr-section, .final-goodbye'
    );
    gsap.set(innerTargets, { opacity: 0, y: 25 });

    // Animar salida de la sección actual con partículas
    gsap.to(currentSection, {
      opacity: 0,
      x: -24,
      duration: 0.4,
      ease: 'power2.inOut',
      onComplete: () => {
        currentSection.style.display = 'none';
        currentSection.classList.remove('active');

        // Partículas al entrar
        createTransitionParticles();

        const tl = gsap.timeline({
          onComplete: () => {
            currentIndex = index;
            updateProgress(index);
            isTransitioning = false;

            // Ejecutar funciones especiales
            if (nextSection.id === 'mapa') initLoveMap();
            if (nextSection.id === 'sorpresa') initStarfield();
            if (nextSection.id === 'carta') unfoldLetter();
            if (nextSection.id === 'final') { initSlideshow(); initSignature(); }

            // Activar máquina de escribir en la cita del capítulo
            activateTypewriter(nextSection);
          }
        });

        tl.to(nextSection, {
          opacity: 1,
          x: 0,
          duration: 0.6,
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
  document.querySelectorAll('.next-btn').forEach(btn => {
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

  function resetToHero() {
    if (window.slideshowInterval) {
      clearInterval(window.slideshowInterval);
      window.slideshowInterval = null;
    }
    if (window.starfieldTimers) {
      window.starfieldTimers.forEach(t => clearTimeout(t));
      window.starfieldTimers = [];
    }
    stopMusicBox();

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
  // 7. TECLADO
  // =========================================
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      if (isTransitioning) return;
      const nextIndex = currentIndex + 1;
      if (nextIndex < sections.length) {
        goToSection(nextIndex);
      }
    }
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal.show').forEach(m => m.classList.remove('show'));
    }
  });

  // =========================================
  // 8. MÁQUINA DE ESCRIBIR EN CITAS
  // =========================================
  function activateTypewriter(section) {
    const quote = section.querySelector('.chapter-quote');
    if (!quote || quote.dataset.typed === 'true') return;

    const text = quote.textContent;
    quote.dataset.typed = 'true';
    quote.textContent = '';
    quote.classList.remove('typewriter-done');

    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    quote.appendChild(cursor);

    let i = 0;
    const speed = 45; // ms por letra

    function typeChar() {
      if (i < text.length) {
        quote.insertBefore(document.createTextNode(text.charAt(i)), cursor);
        i++;
        setTimeout(typeChar, speed);
      } else {
        quote.classList.add('typewriter-done');
      }
    }

    // Retraso para que se vea después de que entra la sección
    setTimeout(typeChar, 800);
  }

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
  // 10. CONTADOR DE TIEMPO JUNTOS (ANIMADO)
  // =========================================
  let counterAnimated = false;

  function updateCounter(animate = false) {
    const start = new Date('2026-04-24T00:00:00');
    const now = new Date();
    const diffMs = now - start;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const safeDays = days >= 0 ? days : 0;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const safeHours = hours >= 0 ? hours : 0;
    const weeks = Math.floor(safeDays / 7);

    const dayEl = document.getElementById('dayCounter');
    const weekEl = document.getElementById('weekCounter');
    const hourEl = document.getElementById('hourCounter');

    if (animate && !counterAnimated) {
      counterAnimated = true;
      animateNumber(dayEl, 0, safeDays, 1500);
      animateNumber(weekEl, 0, weeks, 1500);
      animateNumber(hourEl, 0, safeHours, 1500);
    } else {
      if (dayEl) dayEl.textContent = safeDays;
      if (weekEl) weekEl.textContent = weeks;
      if (hourEl) hourEl.textContent = safeHours.toLocaleString('es-EC');
    }
  }

  function animateNumber(element, start, end, duration) {
    if (!element) return;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const current = Math.floor(start + (end - start) * easeProgress);
      element.textContent = current.toLocaleString('es-EC');

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = end.toLocaleString('es-EC');
        element.classList.add('counter-animated');
        setTimeout(() => element.classList.remove('counter-animated'), 500);
      }
    }

    requestAnimationFrame(update);
  }

  updateCounter();
  setInterval(() => updateCounter(false), 60000);

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
    const closeModal = document.querySelector('.close-modal');

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
  // 18. CERTIFICADO MEJORADO
  // =========================================
  function generateCertificate() {
    const canvas = document.createElement('canvas');
    const W = 1400, H = 1100;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#09090B');
    bg.addColorStop(0.5, '#0D0D14');
    bg.addColorStop(1, '#16161D');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const glow = ctx.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, 900);
    glow.addColorStop(0, 'rgba(179, 157, 219, 0.08)');
    glow.addColorStop(0.5, 'rgba(179, 157, 219, 0.03)');
    glow.addColorStop(1, 'rgba(9, 9, 11, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.translate(W / 2, H / 2 + 50);
    ctx.font = '400px Arial';
    ctx.fillStyle = 'rgba(179, 157, 219, 0.015)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('❤', 0, 0);
    ctx.restore();

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

    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    for (let i = 0; i < 60; i++) {
      const x = 100 + Math.random() * (W - 200);
      const y = 100 + Math.random() * (H - 200);
      const r = Math.random() * 1.2;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.textAlign = 'center';

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
      ctx.fillText('❤', 0, 0);
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

    ctx.fillStyle = 'rgba(179, 157, 219, 0.4)';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('CERT. No. 001  —  Serie: Eterna', 90, 100);

    ctx.textAlign = 'center';
    ctx.strokeStyle = 'rgba(179, 157, 219, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 150, 160);
    ctx.lineTo(W / 2 + 150, 160);
    ctx.stroke();

    ctx.fillStyle = '#C0392B';
    ctx.font = '300 18px Georgia, serif';
    ctx.fillText('C E R T I F I C A D O   D E', W / 2, 200);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 72px "Cormorant Garamond", Georgia, serif';
    ctx.fillText('Nuestra Historia', W / 2, 290);

    ctx.strokeStyle = 'rgba(192, 57, 43, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 180, 310);
    ctx.lineTo(W / 2 + 180, 310);
    ctx.stroke();

    ctx.fillStyle = 'rgba(179, 157, 219, 0.6)';
    function drawDiamond(cx, cy, size) {
      ctx.beginPath();
      ctx.moveTo(cx, cy - size);
      ctx.lineTo(cx + size, cy);
      ctx.lineTo(cx, cy + size);
      ctx.lineTo(cx - size, cy);
      ctx.closePath();
      ctx.fill();
    }
    drawDiamond(W / 2 - 200, 310, 4);
    drawDiamond(W / 2 + 200, 310, 4);

    ctx.fillStyle = '#B39DDB';
    ctx.font = 'italic 26px Georgia, serif';
    ctx.fillText('Certificado de Amor Eterno', W / 2, 360);

    ctx.fillStyle = 'rgba(192, 57, 43, 0.7)';
    ctx.font = '16px Georgia, serif';
    ctx.fillText('Desde el 24 de abril de 2026', W / 2, 400);

    ctx.fillStyle = '#B5B5C3';
    ctx.font = '18px Georgia, serif';
    const lines = [
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
      'nuestras aventuras y nuestros silencios complices,',
      'y todas las páginas que aún nos faltan por escribir.'
    ];
    lines.forEach((line, i) => {
      if (line === 'Elizabeth Zambrano Saltos') {
        ctx.shadowColor = 'rgba(179, 157, 219, 0.5)';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#B39DDB';
        ctx.font = 'italic 38px "Cormorant Garamond", Georgia, serif';
        ctx.fillText(line, W / 2, 450 + i * 32);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#B5B5C3';
        ctx.font = '18px Georgia, serif';
      } else if (line === '') {
        // línea vacía
      } else {
        ctx.fillText(line, W / 2, 450 + i * 32);
      }
    });

    ctx.fillStyle = 'rgba(179, 157, 219, 0.6)';
    ctx.font = 'italic 16px Georgia, serif';
    ctx.fillText('Este certificado no tiene fecha de vencimiento', W / 2, 770);

    const lineY = 810;
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
    ctx.fillText('Emitido el ' + fecha, W / 2, 850);

    ctx.font = '40px Arial';
    ctx.fillStyle = 'rgba(192, 57, 43, 0.8)';
    ctx.fillText('❤', W / 2, 900);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'italic 22px "Cormorant Garamond", Georgia, serif';
    ctx.fillText('Con todo mi amor,', W / 2, 960);
    ctx.font = 'italic 28px "Cormorant Garamond", Georgia, serif';
    ctx.fillText('Alejandro', W / 2, 1000);

    ctx.strokeStyle = 'rgba(179, 157, 219, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 120, 1015);
    ctx.lineTo(W / 2 + 120, 1015);
    ctx.stroke();

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

}

// =========================================
// ARRANQUE
// =========================================
function bootstrap() {
  if (typeof gsap === 'undefined') {
    document.body.classList.add('no-gsap');
    document.addEventListener('gsap-ready', bootstrap, { once: true });
    return;
  }
  initApp();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}

// =========================================
// ARRANQUE: espera al DOM y a que GSAP esté disponible
// (si el CDN falló, index.html carga vendor/gsap.min.js y
// dispara el evento 'gsap-ready' cuando termina)
// =========================================
function bootstrap() {
  if (typeof gsap === 'undefined') {
    document.addEventListener('gsap-ready', bootstrap, { once: true });
    return;
  }
  initApp();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}