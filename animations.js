(() => {
  // Check if GSAP is available
  if (typeof gsap === 'undefined') return;

  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Accessibility: Respect prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion) {
    // 1. Hero Entrance Stagger
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    heroTl
      .from('header', { y: -15, opacity: 0, duration: 0.7 })
      .from('.hero-copy h1', { y: 30, opacity: 0, duration: 0.9 }, '-=0.3')
      .from('.hero-copy .intro', { y: 20, opacity: 0, duration: 0.8 }, '-=0.6')
      .from('.hero-copy .button', { y: 15, opacity: 0, scale: 0.97, duration: 0.7 }, '-=0.5')
      .from('.hero-copy .small', { opacity: 0, duration: 0.6 }, '-=0.4')
      .from('.hero-photo', { opacity: 0, scale: 0.98, duration: 1.1 }, '-=0.8');

    // 2. Facts Bar
    gsap.from('.facts > div', {
      scrollTrigger: {
        trigger: '.facts',
        start: 'top 88%',
        toggleActions: 'play none none none'
      },
      y: 20,
      opacity: 0,
      duration: 0.7,
      stagger: 0.12,
      ease: 'power2.out'
    });

    // 3. Product Content Reveal
    gsap.from('.product-lead', {
      scrollTrigger: {
        trigger: '.product',
        start: 'top 82%'
      },
      y: 25,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out'
    });

    // 4. Feature Cards
    gsap.from('.feature-card', {
      scrollTrigger: {
        trigger: '.product-features-grid',
        start: 'top 85%'
      },
      y: 35,
      opacity: 0,
      duration: 0.9,
      stagger: 0.15,
      ease: 'power3.out'
    });

    // 5. Brand Film Showcase
    gsap.from('.brand-film-header', {
      scrollTrigger: {
        trigger: '.brand-film',
        start: 'top 80%'
      },
      y: 25,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out'
    });

    gsap.from('.brand-film .video-container', {
      scrollTrigger: {
        trigger: '.brand-film .video-container',
        start: 'top 85%'
      },
      scale: 0.97,
      opacity: 0,
      duration: 1.1,
      ease: 'power2.out'
    });

    // 6. Gallery Items
    gsap.from('.gallery-header', {
      scrollTrigger: {
        trigger: '.gallery',
        start: 'top 82%'
      },
      y: 25,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out'
    });

    gsap.from('.gallery-item', {
      scrollTrigger: {
        trigger: '.gallery-scroll',
        start: 'top 85%'
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out'
    });

    // 7. Journey Steps (01~04)
    gsap.from('.journey h2', {
      scrollTrigger: {
        trigger: '.journey',
        start: 'top 85%'
      },
      y: 20,
      opacity: 0,
      duration: 0.7,
      ease: 'power2.out'
    });

    gsap.from('.journey li', {
      scrollTrigger: {
        trigger: '.journey ol',
        start: 'top 85%'
      },
      y: 25,
      opacity: 0,
      duration: 0.7,
      stagger: 0.12,
      ease: 'power2.out'
    });

    // 8. Application Form Area
    gsap.from('.application .apply-intro, .application form', {
      scrollTrigger: {
        trigger: '.application',
        start: 'top 80%'
      },
      y: 25,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power2.out'
    });
  }

  // Brand Film Sound Toggle Interaction
  const video = document.getElementById('brandSpaceVideo');
  const soundBtn = document.getElementById('soundToggleBtn');

  if (video && soundBtn) {
    const iconMuted = soundBtn.querySelector('.icon-muted');
    const iconSound = soundBtn.querySelector('.icon-sound');
    const label = soundBtn.querySelector('span');

    soundBtn.addEventListener('click', () => {
      video.muted = !video.muted;
      if (video.muted) {
        if (iconMuted) iconMuted.style.display = 'block';
        if (iconSound) iconSound.style.display = 'none';
        if (label) label.textContent = '사운드 켜기';
        soundBtn.setAttribute('aria-label', '사운드 켜기');
      } else {
        if (iconMuted) iconMuted.style.display = 'none';
        if (iconSound) iconSound.style.display = 'block';
        if (label) label.textContent = '음소거';
        soundBtn.setAttribute('aria-label', '음소거');
        // Ensure playback continues when unmuted
        video.play().catch(() => {});
      }
    });
  }
})();
