function initApp() {

  // =========================================
  // CONSTANTES Y CONFIGURACIÓN
  // =========================================
  const SECTION_IDS = [
    'intro', 'capitulo1', 'capitulo2', 'capitulo3', 'capitulo4', 'capitulo5',
    'galeria', 'lo-que-amo', 'playlist', 'tiempo', 'carta', 'promesas',
    'capitulo-futuro', 'sorpresa', 'final'
  ];
  const SECTION_LABELS = [
    'Inicio', 'Capítulo I · El encuentro', 'Capítulo II · La universidad',
    'Capítulo III · Patinar', 'Capítulo IV · Las vacaciones', 'Capítulo V · 24 de abril',
    'Galería de fotos', 'Lo que amo de ti', 'Nuestra playlist', 'Tiempo juntos',
    'Una carta para ti', 'Lo que prometo', 'El próximo capítulo', 'Sorpresa', 'Final'
  ];
  const THOUGHTS = [
    "Gracias por aquel abrazo cuando más lo necesitaba.",
    "Nunca olvidaré nuestra primera salida a patinar.",
    "Ojalá nunca dejemos de reírnos así.",
    "Ese día en la práctica de drones, no sabía que estaba a punto de conocer a la persona más importante de mi vida.",
    "Tu sonrisa en la gira de Resistencia, con ese rojo que te quedaba tan bien, fue mi perdición.",
    "Aquella tarde pintando, mientras esperábamos notas, fue cuando supe que quería quedarme contigo para siempre.",
    "Cada desayuno contigo sabe a gloria.",
    "Eres mi lugar seguro.",
    "Recuerdo tu mirada aquella tarde en la biblioteca.",
    "El 24 de abril no es solo una fecha, es el día en que mi vida cambió para siempre.",
    "Gracias por ser tú, sin filtros.",
    "Eres la mejor parte de mi día.",
    "Alejandro siempre te llevará en su corazón.",
    "Liz, eres mi estrella favorita."
  ];

  // Contexto de audio compartido (usado por el chime de estrellas y el sonido de página)
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

  // Sonido sutil de "pasar página" (ruido filtrado, sin archivos externos)
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
    } catch (e) { /* silencioso si el navegador bloquea audio */ }
  }

  // Confeti de corazones/estrellas al tocar "Te amo"
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
  // 2. ESTRELLAS DE FONDO (80 estrellas)
  // =========================================
  const starsBg = document.getElementById('stars-bg');
  for (let i = 0; i < 80; i++) {
    const star = document.createElement('span');
    star.className = 'star-bg';
    const size = Math.random() * 2 + 1;
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.opacity = 0.3 + Math.random() * 0.7;
    starsBg.appendChild(star);
    gsap.to(star, {
      opacity: 0.2 + Math.random() * 0.6,
      duration: 2 + Math.random() * 4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }

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
  // 5. NAVEGACIÓN PRINCIPAL (CORREGIDA - SIN REBOTE)
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

    // --- Preparar la siguiente sección ---
    // Mostrar pero invisible y desplazada
    nextSection.style.display = 'flex';
    nextSection.style.opacity = '0';
    nextSection.style.transform = 'translateX(40px)';
    nextSection.classList.add('active');
    // Marcar como no animada internamente
    nextSection.dataset.animated = 'false';

    // Seleccionar elementos internos que deben animarse
    const innerTargets = nextSection.querySelectorAll(
      '.chapter-content, .gallery-grid, .love-list, .playlist-list, .counter-wrapper, .letter-wrapper, #starfield, .slideshow-container, .final-qr-section, .final-goodbye'
    );
    // Fijar su estado inicial (invisible y desplazados hacia abajo)
    gsap.set(innerTargets, { opacity: 0, y: 25 });

    // --- Animar salida de la sección actual ---
    gsap.to(currentSection, {
      opacity: 0,
      x: -40,
      duration: 0.6,
      ease: 'power2.inOut',
      onComplete: () => {
        // Ocultar completamente la actual
        currentSection.style.display = 'none';
        currentSection.classList.remove('active');

        // --- Animar entrada de la siguiente sección Y sus elementos internos ---
        const tl = gsap.timeline({
          onComplete: () => {
            currentIndex = index;
            updateProgress(index);
            isTransitioning = false;
            // Ejecutar funciones especiales para ciertas secciones (solo una vez)
            if (nextSection.id === 'sorpresa') initStarfield();
            if (nextSection.id === 'carta') unfoldLetter();
            if (nextSection.id === 'final') { initSlideshow(); initSignature(); }
          }
        });

        // Animar la sección completa
        tl.to(nextSection, {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: 'power2.out'
        }, 0);

        // Animar los elementos internos con un pequeño retraso y stagger
        if (innerTargets.length) {
          tl.to(innerTargets, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.08,
            ease: 'power2.out',
            clearProps: 'all' // para que no queden estilos inline
          }, 0.05); // comienza un poco después para que no solape con la sección
        }

        // Marcar como animada para que no se repita
        nextSection.dataset.animated = 'true';
      }
    });
  }

  // Inicializar: solo el hero visible, con sus elementos ya visibles
  sections.forEach((sec, i) => {
    if (i === 0) {
      sec.classList.add('active');
      sec.style.display = 'flex';
      sec.style.opacity = '1';
      sec.style.transform = 'translateX(0)';
      sec.dataset.animated = 'true';
      // Asegurar que los elementos internos del hero están visibles (no los animamos)
      const heroInner = sec.querySelectorAll('.subtitle, h1, #startButton, .made');
      gsap.set(heroInner, { opacity: 1, y: 0 });
    } else {
      sec.classList.remove('active');
      sec.style.display = 'none';
      sec.style.opacity = '1';
      sec.style.transform = 'translateX(0)';
      sec.dataset.animated = 'false';
    }
  });
  updateProgress(0);

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

  // Botón "Volver a empezar" (modal de confirmación)
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

  // Cerrar modal de confirmación con click fuera
  document.getElementById('confirm-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      e.target.classList.remove('show');
    }
  });

  function resetToHero() {
    // Limpiar intervalos
    if (window.slideshowInterval) {
      clearInterval(window.slideshowInterval);
      window.slideshowInterval = null;
    }
    if (window.starfieldTimers) {
      window.starfieldTimers.forEach(t => clearTimeout(t));
      window.starfieldTimers = [];
    }
    // Ocultar todo
    sections.forEach(sec => {
      sec.classList.remove('active');
      sec.style.display = 'none';
      sec.dataset.animated = 'false';
    });
    // Mostrar hero
    const hero = document.getElementById('intro');
    hero.style.display = 'flex';
    hero.style.opacity = '1';
    hero.style.transform = 'translateX(0)';
    hero.classList.add('active');
    hero.dataset.animated = 'true';
    currentIndex = 0;
    updateProgress(0);
    // Limpiar starfield y slideshow
    const starfield = document.getElementById('starfield');
    if (starfield) starfield.innerHTML = '';
    window.starfieldInitialized = false;
    const track = document.getElementById('slideshowTrack');
    if (track) track.innerHTML = '';
    const indicators = document.getElementById('slideshowIndicators');
    if (indicators) indicators.innerHTML = '';
    // Reiniciar la firma animada para que se pueda volver a ver
    const sig = document.getElementById('signatureReveal');
    if (sig) {
      sig.dataset.animated = 'false';
      gsap.set(sig, { clipPath: 'inset(0 100% 0 0)' });
    }
    // Animar entrada del hero (solo la sección, los elementos internos ya están visibles)
    gsap.from(hero, { opacity: 0, y: 20, duration: 0.8, ease: 'power2.out' });
  }

  // =========================================
  // 6. TECLADO (flecha derecha / espacio)
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
  // 6b. SWIPE TÁCTIL (izquierda = siguiente, derecha = atrás)
  // =========================================
  let touchStartX = 0;
  let touchStartY = 0;

  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    if (isTransitioning) return;
    // No interceptar swipes dentro de zonas con su propia interacción táctil
    if (e.target.closest('#starfield, .modal, .slideshow-container, #progress-nav')) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Ignorar si el gesto fue más vertical que horizontal (scroll normal)
    if (Math.abs(deltaX) < 60 || Math.abs(deltaX) < Math.abs(deltaY)) return;

    if (deltaX < 0) {
      // Swipe hacia la izquierda -> avanzar
      goToSection(currentIndex + 1);
    } else {
      // Swipe hacia la derecha -> retroceder
      goToSection(currentIndex - 1);
    }
  }, { passive: true });

  // =========================================
  // 7. CONTADOR DE DÍAS (solo días)
  // =========================================
  function updateCounter() {
    const start = new Date('2026-04-24');
    const now = new Date();
    const diffMs = now - start;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    document.getElementById('dayCounter').textContent = days >= 0 ? days : 0;
  }
  updateCounter();
  setInterval(updateCounter, 60000);

  // =========================================
  // 7b. FIRMA ANIMADA (aparece letra por letra al llegar al final)
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
  // 7c. CONFETI AL TOCAR "TE AMO"
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

  // Chime reutilizable para el confeti (independiente del starfield)
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
  // 8. CARTA (EFECTO DESPLIEGUE)
  // =========================================
  function unfoldLetter() {
    const letter = document.querySelector('.letter');
    if (!letter) return;
    // Si ya se animó, no hacer nada
    if (letter.classList.contains('visible')) return;
    // Forzar estado inicial (por si acaso)
    gsap.set(letter, { scale: 0.9, rotationX: 5, opacity: 0 });
    // Animar
    gsap.to(letter, {
      scale: 1,
      rotationX: 0,
      opacity: 1,
      duration: 1.2,
      ease: 'power2.out',
      delay: 0.1,
      onStart: () => letter.classList.add('visible')
    });
  }

  // =========================================
  // 9. SORPRESA: CIELO ESTRELLADO CON INICIALES "A" y "L"
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

    // Audio para sonido de campanita (usa el contexto de audio compartido)
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

    // Función para generar puntos de letras
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

    // Estrellas de fondo (normales)
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
        thoughtText.textContent = star.dataset.thought;
        modal.classList.add('show');
        gsap.from('.modal-content', {
          scale: 0.8,
          opacity: 0,
          duration: 0.6,
          ease: 'back.out(1.7)'
        });
      });
    }

    // Dibujar iniciales "A" y "L"
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
        thoughtText.textContent = star.dataset.thought;
        modal.classList.add('show');
        gsap.from('.modal-content', {
          scale: 0.8,
          opacity: 0,
          duration: 0.6,
          ease: 'back.out(1.7)'
        });
      });
    });

    // Cerrar modal
    closeModal.addEventListener('click', () => {
      modal.classList.remove('show');
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('show');
    });
  }

  // =========================================
  // 10. SLIDESHOW DEL FINAL (GSAP + INDICADORES)
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