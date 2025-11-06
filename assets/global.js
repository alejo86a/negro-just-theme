/**
 * NEGRO JUST Theme - Global JavaScript
 */

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
  const menuButton = document.querySelector('.header__icon--menu');
  const mobileMenu = document.getElementById('mobile-menu');
  const body = document.body;

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function() {
      const isOpen = mobileMenu.style.display === 'block';
      mobileMenu.style.display = isOpen ? 'none' : 'block';
      body.style.overflow = isOpen ? '' : 'hidden';
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      if (!mobileMenu.contains(event.target) && !menuButton.contains(event.target)) {
        mobileMenu.style.display = 'none';
        body.style.overflow = '';
      }
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && mobileMenu.style.display === 'block') {
        mobileMenu.style.display = 'none';
        body.style.overflow = '';
      }
    });
  }

  // Product Card Hover Effects
  const productCards = document.querySelectorAll('.product-card');
  productCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.classList.add('is-hovered');
    });

    card.addEventListener('mouseleave', function() {
      this.classList.remove('is-hovered');
    });
  });

  // Smooth Scroll for Anchor Links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href !== '#' && href !== '') {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  // Cart Count Update
  function updateCartCount() {
    fetch(window.routes.cart_url + '.js')
      .then(response => response.json())
      .then(cart => {
        const cartCount = document.querySelector('.cart-count-bubble span');
        if (cartCount) {
          cartCount.textContent = cart.item_count;
        }
      })
      .catch(error => {
        console.error('Error updating cart count:', error);
      });
  }

  // Update cart count on page load
  updateCartCount();

  // Quick Add to Cart
  document.querySelectorAll('.product-card__button, .featured-product__button').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const form = this.closest('form');
      if (!form) return;

      const formData = new FormData(form);
      const variantId = formData.get('id');

      if (!variantId) {
        console.error('No variant ID found');
        return;
      }

      // Disable button
      this.disabled = true;
      this.textContent = 'Agregando...';

      fetch(window.routes.cart_add_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [{
            id: variantId,
            quantity: 1
          }]
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.items) {
          updateCartCount();
          // Show success message (you can customize this)
          this.textContent = '¡Agregado!';
          setTimeout(() => {
            this.disabled = false;
            this.textContent = 'Agregar al carrito';
          }, 2000);
        } else {
          throw new Error('Failed to add to cart');
        }
      })
      .catch(error => {
        console.error('Error adding to cart:', error);
        this.disabled = false;
        this.textContent = 'Error. Intenta de nuevo.';
        setTimeout(() => {
          this.textContent = 'Agregar al carrito';
        }, 3000);
      });
    });
  });

  // Search functionality is now handled by the form in the header

  // Lazy Loading Images
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  // Rotating Promotional Messages (every 2 seconds) with swipe support
  const announcementBar = document.querySelector('.announcement-bar');
  const announcementMessages = document.querySelectorAll('.announcement-bar__message');
  
  if (announcementMessages.length > 1 && announcementBar) {
    let currentMessageIndex = 0;
    let autoRotateInterval;
    let touchStartX = 0;
    let touchEndX = 0;
    
    function showMessage(index, direction = 'next') {
      const current = announcementMessages[currentMessageIndex];
      const next = announcementMessages[index];
      
      // Remove current message
      current.classList.remove('active');
      if (direction === 'next') {
        current.classList.add('slide-out-left');
        next.classList.add('slide-in-right');
      } else {
        current.classList.add('slide-out-right');
        next.classList.add('slide-in-left');
      }
      
      // Show next message after a brief delay
      setTimeout(() => {
        current.classList.remove('slide-out-left', 'slide-out-right');
        next.classList.remove('slide-in-left', 'slide-in-right');
        next.classList.add('active');
        currentMessageIndex = index;
      }, 100);
    }
    
    function showNextMessage() {
      const nextIndex = (currentMessageIndex + 1) % announcementMessages.length;
      showMessage(nextIndex, 'next');
    }
    
    function showPrevMessage() {
      const prevIndex = (currentMessageIndex - 1 + announcementMessages.length) % announcementMessages.length;
      showMessage(prevIndex, 'prev');
    }
    
    // Auto-rotate messages every 2 seconds
    function startAutoRotate() {
      autoRotateInterval = setInterval(showNextMessage, 2000);
    }
    
    function stopAutoRotate() {
      clearInterval(autoRotateInterval);
    }
    
    startAutoRotate();
    
    // Touch/swipe support
    announcementBar.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoRotate();
    });
    
    announcementBar.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
      startAutoRotate();
    });
    
    // Mouse drag support
    let isDragging = false;
    let startX = 0;
    
    announcementBar.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      stopAutoRotate();
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
    });
    
    document.addEventListener('mouseup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      const endX = e.clientX;
      const diff = startX - endX;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          showNextMessage();
        } else {
          showPrevMessage();
        }
      }
      startAutoRotate();
    });
    
    function handleSwipe() {
      const swipeThreshold = 50;
      const diff = touchStartX - touchEndX;
      
      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          // Swiped left, show next
          showNextMessage();
        } else {
          // Swiped right, show previous
          showPrevMessage();
        }
      }
    }
  }

  // Hero Banner Carousel with working navigation
  const heroSlides = document.querySelectorAll('.hero-banner__slide');
  const heroDots = document.querySelectorAll('.hero-banner__dot');
  
  if (heroSlides.length > 1 && heroDots.length > 0) {
    let currentSlideIndex = 0;
    let heroAutoInterval;
    
    function showSlide(index) {
      // Remove active from all
      heroSlides.forEach(slide => slide.classList.remove('active'));
      heroDots.forEach(dot => dot.classList.remove('active'));
      
      // Add active to target
      if (heroSlides[index]) {
        heroSlides[index].classList.add('active');
      }
      if (heroDots[index]) {
        heroDots[index].classList.add('active');
      }
      
      currentSlideIndex = index;
    }
    
    function showNextSlide() {
      const nextIndex = (currentSlideIndex + 1) % heroSlides.length;
      showSlide(nextIndex);
    }
    
    // Start auto-advance
    function startHeroAutoplay() {
      heroAutoInterval = setInterval(showNextSlide, 5000);
    }
    
    function stopHeroAutoplay() {
      clearInterval(heroAutoInterval);
    }
    
    // Initialize
    showSlide(0);
    startHeroAutoplay();
    
    // Dot navigation with click events
    heroDots.forEach((dot, index) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        stopHeroAutoplay();
        showSlide(index);
        startHeroAutoplay();
      });
    });
  }

  // Collection Banners Carousel (every 3 seconds)
  const collectionGrids = document.querySelectorAll('.collection-banners__grid');
  
  if (collectionGrids.length > 1) {
    let currentCollectionIndex = 0;
    
    function showCollectionGrid(index) {
      collectionGrids.forEach(grid => grid.classList.remove('active'));
      if (collectionGrids[index]) {
        collectionGrids[index].classList.add('active');
      }
      currentCollectionIndex = index;
    }
    
    function showNextCollection() {
      const nextIndex = (currentCollectionIndex + 1) % collectionGrids.length;
      showCollectionGrid(nextIndex);
    }
    
    // Initialize
    showCollectionGrid(0);
    
    // Auto-rotate every 3 seconds
    setInterval(showNextCollection, 3000);
  }

  // Featured Product Carousel (alternates between products)
  const featuredSlides = document.querySelectorAll('.featured-product__slide');
  
  if (featuredSlides.length > 1) {
    let currentFeaturedIndex = 0;
    
    function showFeaturedSlide(index) {
      featuredSlides.forEach(slide => slide.classList.remove('active'));
      if (featuredSlides[index]) {
        featuredSlides[index].classList.add('active');
      }
      currentFeaturedIndex = index;
    }
    
    function showNextFeatured() {
      const nextIndex = (currentFeaturedIndex + 1) % featuredSlides.length;
      showFeaturedSlide(nextIndex);
    }
    
    // Initialize
    showFeaturedSlide(0);
    
    // Auto-rotate every 4 seconds
    setInterval(showNextFeatured, 4000);
  }

  // Header and Announcement Bar Hide/Show on Scroll
  const header = document.querySelector('.header-wrapper');
  const announcementBarEl = document.querySelector('.announcement-bar');
  let lastScroll = window.pageYOffset;
  let scrollThreshold = 20;

  window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset;
    
    if (Math.abs(currentScroll - lastScroll) > scrollThreshold) {
      if (currentScroll > lastScroll && currentScroll > 50) {
        // Scrolling down - hide both
        if (header) {
          header.classList.remove('visible');
          header.classList.add('hidden');
        }
        if (announcementBarEl) {
          announcementBarEl.classList.remove('visible');
          announcementBarEl.classList.add('hidden');
        }
      } else if (currentScroll < lastScroll || currentScroll <= 50) {
        // Scrolling up or at top - show both
        if (header) {
          header.classList.remove('hidden');
          header.classList.add('visible');
        }
        if (announcementBarEl) {
          announcementBarEl.classList.remove('hidden');
          announcementBarEl.classList.add('visible');
        }
      }
      
      lastScroll = currentScroll <= 0 ? 0 : currentScroll;
    }
  }, { passive: true });

  // Back to Top Button
  const backToTopButton = document.querySelector('.back-to-top');
  
  if (backToTopButton) {
    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 300) {
        backToTopButton.classList.add('visible');
      } else {
        backToTopButton.classList.remove('visible');
      }
    }, { passive: true });
    
    // Scroll to top when clicked
    backToTopButton.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // Newsletter Form Validation
  const newsletterForms = document.querySelectorAll('.newsletter-form');
  newsletterForms.forEach(form => {
    form.addEventListener('submit', function(e) {
      const emailInput = this.querySelector('input[type="email"]');
      if (emailInput && !emailInput.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        e.preventDefault();
        emailInput.classList.add('error');
        emailInput.focus();
        return false;
      }
    });
  });
});

// Export for use in other scripts
window.NegroJustTheme = {
  updateCartCount: function() {
    // This will be called from cart updates
    const cartCount = document.querySelector('.cart-count-bubble span');
    if (cartCount) {
      fetch(window.routes.cart_url + '.js')
        .then(response => response.json())
        .then(cart => {
          cartCount.textContent = cart.item_count;
        });
    }
  }
};

