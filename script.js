/**
 * white HUB - Core Application Scripts
 * Monochromatic & Responsive selection interface
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const body = document.body;
  const introScreen = document.getElementById('intro-screen');
  const enterBtn = document.getElementById('enter-btn');
  const appContent = document.getElementById('app-content');
  
  const carouselTrack = document.getElementById('carousel-track');
  const carouselSlides = Array.from(document.querySelectorAll('.carousel-slide'));
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  
  const infoSection = document.querySelector('.project-info-section');
  const activeTitle = document.getElementById('active-title');
  const activeTags = document.getElementById('active-tags');
  const activeDesc = document.getElementById('active-desc');
  const activeLink = document.getElementById('active-link');
  
  const contactTrigger = document.getElementById('contact-trigger');
  const contactPanel = document.getElementById('contact-panel');
  const panelCloseBtn = document.getElementById('panel-close-btn');

  // --- State Variables ---
  let activeIndex = 0;
  const totalSlides = carouselSlides.length;
  let introTimer = null;
  let isTransitioning = false;

  // --- Theme/Layout Computations ---
  const getSlideWidth = () => {
    return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--slide-width')) || 280;
  };

  const getSlideGap = () => {
    return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--slide-gap')) || 40;
  };

  // --- Helper Functions ---
  
  /**
   * Translates the carousel track to center the active slide
   */
  const alignTrack = () => {
    if (!carouselTrack) return;
    const viewport = carouselTrack.parentElement;
    if (!viewport) return;
    
    const viewportWidth = viewport.offsetWidth;
    const slideWidth = getSlideWidth();
    const gap = getSlideGap();
    
    // Mathematical center alignment formula
    const offset = (viewportWidth / 2) - (slideWidth / 2) - (activeIndex * (slideWidth + gap));
    carouselTrack.style.transform = `translateX(${offset}px)`;
  };

  /**
   * Updates slide active states in the DOM
   */
  const updateSlideClasses = () => {
    carouselSlides.forEach((slide, idx) => {
      if (idx === activeIndex) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });
  };

  /**
   * Smoothly transitions the project information block contents
   */
  const updateProjectInfo = () => {
    const activeSlide = carouselSlides[activeIndex];
    if (!activeSlide) return;

    // Get metadata from slide data attributes
    const title = activeSlide.getAttribute('data-title');
    const desc = activeSlide.getAttribute('data-desc');
    const tagsString = activeSlide.getAttribute('data-tags') || '';
    const link = activeSlide.getAttribute('data-link');

    // Trigger fade-out
    infoSection.classList.add('fading');

    // Swap content midway through the opacity transition
    setTimeout(() => {
      activeTitle.textContent = title;
      activeDesc.textContent = desc;
      activeLink.setAttribute('href', link);
      
      // Clear and re-render tags
      activeTags.innerHTML = '';
      const tags = tagsString.split('//').map(t => t.trim());
      tags.forEach(tag => {
        if (tag) {
          const tagSpan = document.createElement('span');
          tagSpan.textContent = tag;
          activeTags.appendChild(tagSpan);
        }
      });

      // Trigger fade-in
      infoSection.classList.remove('fading');
    }, 250);
  };

  /**
   * Fully updates the carousel state
   */
  const updateCarousel = () => {
    updateSlideClasses();
    alignTrack();
    updateProjectInfo();
  };

  /**
   * Move slider in a direction
   */
  const navigate = (direction) => {
    if (isTransitioning) return;
    activeIndex = (activeIndex + direction + totalSlides) % totalSlides;
    updateCarousel();
  };

  // --- Intro Reveal Transitions ---
  
  const transitionToApp = () => {
    if (body.classList.contains('intro-active')) return;
    
    // Clear auto-timeout
    if (introTimer) clearTimeout(introTimer);
    
    body.classList.add('intro-active');
    
    // Fade out intro overlay
    introScreen.classList.add('hidden');
    
    // Fade in main app contents
    appContent.classList.remove('hidden');
    
    // Short delay to allow browser to calculate layout sizes, then center slide
    setTimeout(() => {
      updateCarousel();
    }, 50);
  };

  // --- Event Listeners ---

  // Intro Skip Actions
  enterBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    transitionToApp();
  });
  
  introScreen.addEventListener('click', () => {
    transitionToApp();
  });

  // Automatically transition after 5 seconds of inactivity
  introTimer = setTimeout(transitionToApp, 5000);

  // Arrow controls
  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    navigate(-1);
  });
  
  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    navigate(1);
  });

  // Slide click behavior: Active slides launch application, adjacent ones slide over
  carouselSlides.forEach((slide, idx) => {
    slide.addEventListener('click', (e) => {
      e.stopPropagation();
      if (idx === activeIndex) {
        const link = slide.getAttribute('data-link');
        window.open(link, '_blank');
      } else {
        activeIndex = idx;
        updateCarousel();
      }
    });
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    // If we are in the main app
    if (body.classList.contains('intro-active')) {
      if (e.key === 'ArrowLeft') {
        navigate(-1);
      } else if (e.key === 'ArrowRight') {
        navigate(1);
      } else if (e.key === 'Enter') {
        // Open active project
        const activeSlide = carouselSlides[activeIndex];
        if (activeSlide) {
          const link = activeSlide.getAttribute('data-link');
          window.open(link, '_blank');
        }
      }
    } else {
      // In the intro screen
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        transitionToApp();
      }
    }
  });

  // Secure terminal contact console drawer
  contactTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = contactPanel.classList.toggle('open');
    contactTrigger.setAttribute('aria-expanded', isOpen);
  });

  panelCloseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    contactPanel.classList.remove('open');
    contactTrigger.setAttribute('aria-expanded', 'false');
  });

  document.addEventListener('click', (e) => {
    if (!contactPanel.contains(e.target) && e.target !== contactTrigger) {
      contactPanel.classList.remove('open');
      contactTrigger.setAttribute('aria-expanded', 'false');
    }
  });

  // Layout calculations on resize
  window.addEventListener('resize', () => {
    if (body.classList.contains('intro-active')) {
      alignTrack();
    }
  });

  // Live system status clock updates
  const updateClock = () => {
    const statusText = document.querySelector('.status-text');
    if (!statusText) return;
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    statusText.textContent = `SECURE CONSOLE // ACTIVE [ ${hours}:${minutes}:${seconds} ]`;
  };
  
  setInterval(updateClock, 1000);
  updateClock();
});
