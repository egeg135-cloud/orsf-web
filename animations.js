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

    // 6. Gallery: Pinned Horizontal Scroll on Vertical Scroll
    const gallerySection = document.getElementById('gallerySection');
    const galleryTrack = document.getElementById('galleryTrack');
    const galleryViewport = document.getElementById('galleryViewport');
    const progressTrack = document.getElementById('galleryProgressTrack');
    const progressThumb = document.getElementById('galleryProgressThumb');

    if (gallerySection && galleryTrack && galleryViewport) {
      // Calculate exact overflow distance
      const getMaxDistance = () => {
        return Math.max(0, galleryTrack.scrollWidth - window.innerWidth);
      };

      // Header subtle reveal
      gsap.from('.gallery-header', {
        scrollTrigger: {
          trigger: gallerySection,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out'
      });

      // Horizontal Scroll Timeline driven by vertical page scroll
      const horizontalTl = gsap.timeline();

      // Scrub horizontal movement of the track
      horizontalTl.to(galleryTrack, {
        x: () => -getMaxDistance(),
        ease: 'none'
      }, 0);

      // Scrub progress bar thumb across track
      if (progressThumb && progressTrack) {
        horizontalTl.to(progressThumb, {
          x: () => {
            const trackW = progressTrack.clientWidth;
            const thumbW = progressThumb.clientWidth;
            return Math.max(0, trackW - thumbW);
          },
          ease: 'none'
        }, 0);
      }

      // Create ScrollTrigger pin
      ScrollTrigger.create({
        id: 'galleryPin',
        trigger: gallerySection,
        pin: true,
        scrub: 1, // Smooth 1s catch-up for pleasant momentum
        start: 'top top',
        end: () => `+=${Math.max(window.innerHeight * 1.3, getMaxDistance() * 1.2)}`,
        invalidateOnRefresh: true,
        animation: horizontalTl
      });

      // Trackpad horizontal gesture: converts deltaX into vertical page scroll
      gallerySection.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 6) {
          window.scrollBy({ top: e.deltaX * 0.9 });
        }
      }, { passive: true });

      // Click on progress track to jump/scroll to that location
      if (progressTrack) {
        progressTrack.addEventListener('click', (e) => {
          const rect = progressTrack.getBoundingClientRect();
          const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
          const st = ScrollTrigger.getById('galleryPin');
          if (st) {
            const targetY = st.start + ratio * (st.end - st.start);
            window.scrollTo({ top: targetY, behavior: 'smooth' });
          }
        });
      }

      // Touch swipe support (left/right drag converts to vertical scroll to drive ScrollTrigger)
      let touchStartX = 0;
      let touchStartY = 0;
      gallerySection.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
        }
      }, { passive: true });

      gallerySection.addEventListener('touchmove', (e) => {
        if (!touchStartX || !touchStartY || e.touches.length !== 1) return;
        const dx = touchStartX - e.touches[0].clientX;
        const dy = touchStartY - e.touches[0].clientY;
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
          window.scrollBy({ top: dx * 1.2 });
          touchStartX = e.touches[0].clientX;
        }
      }, { passive: true });

      // Mouse drag-to-scroll support on desktop
      let isDragging = false;
      let dragStartX = 0;
      galleryViewport.addEventListener('mousedown', (e) => {
        isDragging = true;
        dragStartX = e.clientX;
      });

      window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = dragStartX - e.clientX;
        if (Math.abs(dx) > 4) {
          window.scrollBy({ top: dx * 1.3 });
          dragStartX = e.clientX;
        }
      });

      window.addEventListener('mouseup', () => {
        isDragging = false;
      });
    }

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

  // Smart Scroll-Triggered Video Playback & Viewport Control
  // (스크롤 시 해당 영상 영역에서만 재생되고, 벗어나면 자동 일시정지)
  const allVideos = document.querySelectorAll('video');
  if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const vid = entry.target;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
          // Reached the video section: play
          if (vid.ended) {
            vid.currentTime = 0;
          }
          const playPromise = vid.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {});
          }
        } else if (!entry.isIntersecting || entry.intersectionRatio < 0.15) {
          // Scrolled away to other parts: pause immediately
          if (!vid.paused) {
            vid.pause();
          }
        }
      });
    }, {
      threshold: [0, 0.2, 0.5]
    });

    allVideos.forEach((vid) => {
      // Remove loop from brandSpaceVideo so it does not loop endlessly
      if (vid.id === 'brandSpaceVideo') {
        vid.removeAttribute('loop');
      }
      videoObserver.observe(vid);
    });
  }

  // Smooth scroll for in-page anchors
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // Soap Bubble Burst Interaction on Click (클릭 시 비눗방울 퐁퐁 피어오르는 효과)
  function spawnSoapBubbles(x, y) {
    const bubbleCount = Math.floor(Math.random() * 3) + 6; // 6 ~ 8 bubbles
    for (let i = 0; i < bubbleCount; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'soap-bubble';
      const size = Math.floor(Math.random() * 18) + 14; // 14px ~ 32px
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = `${x - size / 2}px`;
      bubble.style.top = `${y - size / 2}px`;
      document.body.appendChild(bubble);

      // Trajectory: random angle with strong upward buoyancy
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 45 + 20;
      const targetX = Math.cos(angle) * distance;
      // Floats up by 50~100px
      const targetY = Math.sin(angle) * distance - (Math.random() * 60 + 40);
      const duration = Math.random() * 0.4 + 0.75; // 0.75s ~ 1.15s

      if (typeof gsap !== 'undefined') {
        gsap.fromTo(bubble,
          { scale: 0.15, opacity: 0.95 },
          {
            x: targetX,
            y: targetY,
            scale: Math.random() * 0.4 + 0.9,
            opacity: 0,
            duration: duration,
            ease: 'power1.out',
            onComplete: () => {
              bubble.remove();
            }
          }
        );
      } else {
        setTimeout(() => bubble.remove(), 850);
      }
    }
  }

  // Pointerdown trigger for responsive immediate feedback on click
  window.addEventListener('pointerdown', (e) => {
    if (e.clientX >= 0 && e.clientY >= 0) {
      spawnSoapBubbles(e.clientX, e.clientY);
    }
  }, { passive: true });

  // Refresh ScrollTrigger calculations after everything loads
  window.addEventListener('load', () => {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  });
})();
