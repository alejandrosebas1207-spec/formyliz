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
    { phrase: "Contigo hasta los días grises se ven bonitos.", source: "Inspirado en “Razón”, de Los Caligaris" },
    { phrase: "Volví a sonreír de verdad desde que estás tú.", source: "Inspirado en “Razón”, de Los Caligaris" },
    { phrase: "Eres la razón por la que todo pesa menos.", source: "Inspirado en “Razón”, de Los Caligaris" },
    { phrase: "Contigo, hasta lo que dolía dejó de doler.", source: "Inspirado en “Razón”, de Los Caligaris" },
    { phrase: "No hay mucha explicación, solo sé que eres tú.", source: "Inspirado en “Razón”, de Los Caligaris" },
    { phrase: "No dejo de pensar en ti, ni lo intento.", source: "Inspirado en “Agua”, de Jarabe de Palo" },
    { phrase: "Cada vez que la escucho, pienso en ti.", source: "Inspirado en “Agua”, de Jarabe de Palo" },
    { phrase: "Hay canciones que ya no puedo separar de ti.", source: "Inspirado en “Agua”, de Jarabe de Palo" },
    { phrase: "Me acuerdo de ti hasta en lo más simple.", source: "Inspirado en “Agua”, de Jarabe de Palo" },
    { phrase: "Esa canción y tú ya son la misma cosa para mí.", source: "Inspirado en “Agua”, de Jarabe de Palo" },
    { phrase: "No me da miedo decirte que te quiero.", source: "Inspirado en “El lado oscuro”, de Jarabe de Palo" },
    { phrase: "Contigo no hace falta fingir nada.", source: "Inspirado en “El lado oscuro”, de Jarabe de Palo" },
    { phrase: "Te quiero tal como eres, sin condiciones.", source: "Inspirado en “El lado oscuro”, de Jarabe de Palo" },
    { phrase: "No necesito una razón para elegirte cada día.", source: "Inspirado en “El lado oscuro”, de Jarabe de Palo" },
    { phrase: "Contigo, hasta lo imperfecto se siente bien.", source: "Inspirado en “El lado oscuro”, de Jarabe de Palo" }
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
    nextSection.scrollTop = 0;
    nextSection.style.opacity = '0';
    nextSection.style.transform = 'translateX(24px)';
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
      x: -24,
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
            if (nextSection.id === 'mapa') initLoveMap();
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

  // Botón "Descargar certificado"
  const certBtn = document.getElementById('certButton');
  if (certBtn) {
    certBtn.addEventListener('click', generateCertificate);
  }

  function generateCertificate() {
    const canvas = document.createElement('canvas');
    const W = 1400, H = 1100;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // ===== FONDO =====
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#09090B');
    bg.addColorStop(0.5, '#0D0D14');
    bg.addColorStop(1, '#16161D');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Halo púrpura sutil
    const glow = ctx.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, 900);
    glow.addColorStop(0, 'rgba(179, 157, 219, 0.08)');
    glow.addColorStop(0.5, 'rgba(179, 157, 219, 0.03)');
    glow.addColorStop(1, 'rgba(9, 9, 11, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // Marca de agua: corazón grande tenue
    ctx.save();
    ctx.translate(W / 2, H / 2 + 50);
    ctx.font = '400px Arial';
    ctx.fillStyle = 'rgba(179, 157, 219, 0.015)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('❤', 0, 0);
    ctx.restore();

    // ===== MARCOS ORNAMENTALES =====
    ctx.strokeStyle = 'rgba(179, 157, 219, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 50, W - 100, H - 100);

    ctx.strokeStyle = 'rgba(192, 57, 43, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(70, 70, W - 140, H - 140);

    // Esquinas ornamentales
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

    // ===== ESTRELLAS DECORATIVAS =====
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

    // ===== SELLO CIRCULAR =====
    function drawSeal(cx, cy, r) {
      ctx.save();
      ctx.translate(cx, cy);
      // Círculo exterior
      ctx.strokeStyle = 'rgba(192, 57, 43, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
      // Círculo interior
      ctx.strokeStyle = 'rgba(179, 157, 219, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, r - 8, 0, Math.PI * 2);
      ctx.stroke();
      // Corazón en el centro
      ctx.font = '24px Arial';
      ctx.fillStyle = 'rgba(192, 57, 43, 0.7)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('❤', 0, 0);
      // Texto alrededor
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

    // ===== NÚMERO DE CERTIFICADO =====
    ctx.fillStyle = 'rgba(179, 157, 219, 0.4)';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('CERT. No. 001  —  Serie: Eterna', 90, 100);

    // ===== ENCABEZADO =====
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

    // ===== TÍTULO PRINCIPAL =====
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 72px "Cormorant Garamond", Georgia, serif';
    ctx.fillText('Nuestra Historia', W / 2, 290);

    // Subrayado decorativo
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

    // ===== SUBTÍTULO =====
    ctx.fillStyle = '#B39DDB';
    ctx.font = 'italic 26px Georgia, serif';
    ctx.fillText('Certificado de Amor Eterno', W / 2, 360);

    // ===== FECHA ESPECIAL =====
    ctx.fillStyle = 'rgba(192, 57, 43, 0.7)';
    ctx.font = '16px Georgia, serif';
    ctx.fillText('Desde el 24 de abril de 2026', W / 2, 400);

    // ===== TEXTO PRINCIPAL =====
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
      'nuestras caídas en la pista de patinaje,',
      'y todas las páginas que aún nos faltan por escribir.'
    ];
    lines.forEach((line, i) => {
      if (line === 'Elizabeth Zambrano Saltos') {
        // Glow effect para el nombre
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

    // ===== FRASE FINAL =====
    ctx.fillStyle = 'rgba(179, 157, 219, 0.6)';
    ctx.font = 'italic 16px Georgia, serif';
    ctx.fillText('Este certificado no tiene fecha de vencimiento', W / 2, 770);

    // ===== LÍNEA DECORATIVA =====
    const lineY = 810;
    ctx.strokeStyle = 'rgba(179, 157, 219, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 100, lineY);
    ctx.lineTo(W / 2 + 100, lineY);
    ctx.stroke();

    // ===== FECHA DE EMISIÓN =====
    const today = new Date();
    const fecha = today.toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' });
    ctx.fillStyle = '#B5B5C3';
    ctx.font = '16px Georgia, serif';
    ctx.fillText('Emitido el ' + fecha, W / 2, 850);

    // ===== CORAZÓN DECORATIVO =====
    ctx.font = '40px Arial';
    ctx.fillStyle = 'rgba(192, 57, 43, 0.8)';
    ctx.fillText('❤', W / 2, 900);

    // ===== FIRMAS =====
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'italic 22px "Cormorant Garamond", Georgia, serif';
    ctx.fillText('Con todo mi amor,', W / 2, 960);
    ctx.font = 'italic 28px "Cormorant Garamond", Georgia, serif';
    ctx.fillText('Alejandro', W / 2, 1000);

    // Líneas de firma decorativas
    ctx.strokeStyle = 'rgba(179, 157, 219, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 120, 1015);
    ctx.lineTo(W / 2 + 120, 1015);
    ctx.stroke();

    // ===== DESCARGAR =====
    const link = document.createElement('a');
    link.download = 'certificado-nuestra-historia.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

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
  // 6b. SWIPE TÁCTIL — DESACTIVADO
  // =========================================
  // El swipe táctil para navegar entre secciones ha sido desactivado
  // porque interfería con el scroll y con la interacción del mapa.
  // Ahora la navegación se hace solo con:
  //   - Botones "Siguiente"
  //   - Dots del menú de progreso
  //   - Teclado (flecha derecha / espacio)
  // =========================================

  // =========================================
  // 6c. REPRODUCTOR DE CANCIONES (YouTube embebido bajo demanda)
  // =========================================
  document.querySelectorAll('.playlist-track').forEach((track) => {
    const btn = track.querySelector('.play-track-btn');
    const playerBox = track.querySelector('.track-player');
    const videoId = track.dataset.videoId;
    if (!btn || !playerBox || !videoId) return;

    btn.addEventListener('click', () => {
      const isPlaying = btn.classList.contains('playing');

      // Detener cualquier otra canción que esté sonando
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
  // 7. CONTADOR DE TIEMPO JUNTOS (días, semanas y horas desde el 24 de abril de 2026)
  // =========================================
  function updateCounter() {
    const start = new Date('2026-04-24T00:00:00');
    const now = new Date();
    const diffMs = now - start;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const safeDays = days >= 0 ? days : 0;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const safeHours = hours >= 0 ? hours : 0;
    const weeks = Math.floor(safeDays / 7);

    const dayEl = document.getElementById('dayCounter');
    if (dayEl) dayEl.textContent = safeDays;

    const weekEl = document.getElementById('weekCounter');
    if (weekEl) weekEl.textContent = weeks;

    const hourEl = document.getElementById('hourCounter');
    if (hourEl) hourEl.textContent = safeHours.toLocaleString('es-EC');
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
  // 7d. MAPA DE NUESTROS LUGARES (Leaflet, carga perezosa)
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

    // Forzar recalculo de tamaño (el mapa se crea mientras el contenedor está animándose)
    setTimeout(() => { if (loveMapInstance) loveMapInstance.invalidateSize(); }, 400);
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

    // Muestra la frase al tocar una estrella
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
        showThought(star.dataset.thought);
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
        showThought(star.dataset.thought);
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