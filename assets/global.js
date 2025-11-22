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
  for (const card of productCards) {
    card.addEventListener('mouseenter', function() {
      this.classList.add('is-hovered');
    });

    card.addEventListener('mouseleave', function() {
      this.classList.remove('is-hovered');
    });
  }

  // Smooth Scroll for Anchor Links
  for (const anchor of document.querySelectorAll('a[href^="#"]')) {
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
  }

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
  for (const button of document.querySelectorAll('.product-card__button, .featured-product__button')) {
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
  }

  // Search functionality is now handled by the form in the header

  // Lazy Loading Images
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        }
      }
    });

    for (const img of document.querySelectorAll('img[data-src]')) {
      imageObserver.observe(img);
    }
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
      for (const slide of heroSlides) {
        slide.classList.remove('active');
      }
      for (const dot of heroDots) {
        dot.classList.remove('active');
      }
      
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
    for (const [index, dot] of heroDots.entries()) {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        stopHeroAutoplay();
        showSlide(index);
        startHeroAutoplay();
      });
    }
  }

  // Collection Banners Carousel (every 3 seconds)
  const collectionGrids = document.querySelectorAll('.collection-banners__grid');
  
  if (collectionGrids.length > 1) {
    let currentCollectionIndex = 0;
    
    function showCollectionGrid(index) {
      for (const grid of collectionGrids) {
        grid.classList.remove('active');
      }
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
      for (const slide of featuredSlides) {
        slide.classList.remove('active');
      }
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
  for (const form of newsletterForms) {
    form.addEventListener('submit', function(e) {
      const emailInput = this.querySelector('input[type="email"]');
      if (emailInput && !emailInput.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        e.preventDefault();
        emailInput.classList.add('error');
        emailInput.focus();
        return false;
      }
    });

  // Product Page Functionality
  const productSection = document.querySelector('.product');
  if (productSection) {
    // Product Description Enhancement
    const descriptionContainer = productSection.querySelector('[data-product-description]');
    if (descriptionContainer) {
      const descriptionContent = descriptionContainer.querySelector('.product__description-content');
      if (descriptionContent) {
        const html = descriptionContent.innerHTML;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Find first paragraph for intro
        const firstP = tempDiv.querySelector('p:first-of-type');
        let introText = '';
        let featureList = null;
        
        if (firstP) {
          introText = firstP.outerHTML;
          firstP.remove();
        }
        
        // Find list (ul or ol) and convert to our styled list
        const list = tempDiv.querySelector('ul, ol');
        if (list) {
          // Convert existing list to our styled format
          const listItems = list.querySelectorAll('li');
          featureList = '<ul class="product__description-features">';
          for (const item of listItems) {
            const text = item.textContent.trim();
            if (text.includes(':')) {
              const colonIndex = text.indexOf(':');
              const label = text.substring(0, colonIndex).trim();
              const value = text.substring(colonIndex + 1).trim();
              featureList += `<li><strong>${label}:</strong> ${value}</li>`;
            } else {
              featureList += `<li>${text}</li>`;
            }
          }
          featureList += '</ul>';
          list.remove();
        }
        
        // If no list but has colons, create list from lines
        if (!featureList && tempDiv.textContent.includes(':')) {
          const lines = tempDiv.textContent.split('\n').filter(line => line.trim() && line.includes(':'));
          if (lines.length > 0) {
            featureList = '<ul class="product__description-features">';
            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed) {
                // Highlight text before colon
                const colonIndex = trimmed.indexOf(':');
                if (colonIndex > 0) {
                  const label = trimmed.substring(0, colonIndex).trim();
                  const value = trimmed.substring(colonIndex + 1).trim();
                  featureList += `<li><strong>${label}:</strong> ${value}</li>`;
                } else {
                  featureList += `<li>${trimmed}</li>`;
                }
              }
            }
            featureList += '</ul>';
          }
        }
        
        // Rebuild content
        let newContent = '';
        if (introText) {
          newContent += `<div class="product__description-intro">${introText}</div>`;
        }
        if (featureList) {
          newContent += featureList;
        }
        
        // If we have remaining content, add it
        const remaining = tempDiv.innerHTML.trim();
        if (remaining && !featureList) {
          newContent += `<div class="product__description-fallback rte">${remaining}</div>`;
        } else if (remaining) {
          newContent += `<div class="product__description-remaining rte">${remaining}</div>`;
        }
        
        // If no structure found, keep original
        if (!introText && !featureList) {
          newContent = html;
        }
        
        descriptionContent.innerHTML = newContent;
      }
    }
    // Product Media Gallery
    const productThumbnails = productSection.querySelectorAll('.product__media-thumbnail');
    const productMediaItems = productSection.querySelectorAll('.product__media-item');
    
    // Initialize: Set first thumbnail and media item as active if not already set
    if (productThumbnails.length > 0 && productMediaItems.length > 0) {
      const activeThumbnail = productSection.querySelector('.product__media-thumbnail.active');
      const activeMediaItem = productSection.querySelector('.product__media-item.active');
      
      // If no active thumbnail, set the first one
      if (!activeThumbnail && productThumbnails[0]) {
        productThumbnails[0].classList.add('active');
      }
      
      // If no active media item, set the first one
      if (!activeMediaItem && productMediaItems[0]) {
        productMediaItems[0].classList.add('active');
      }
      
      // Ensure the active thumbnail matches the active media item
      const currentActiveMedia = productSection.querySelector('.product__media-item.active');
      if (currentActiveMedia) {
        const activeMediaId = currentActiveMedia.dataset.mediaId;
        for (const thumb of productThumbnails) {
          if (thumb.dataset.mediaId === activeMediaId) {
            thumb.classList.add('active');
          } else {
            thumb.classList.remove('active');
          }
        }
      }
    }
    
    for (const thumbnail of productThumbnails) {
      thumbnail.addEventListener('click', function() {
        const mediaId = this.dataset.mediaId;
        
        // Remove active from all
        for (const thumb of productThumbnails) {
          thumb.classList.remove('active');
        }
        for (const item of productMediaItems) {
          item.classList.remove('active');
        }
        
        // Add active to selected
        this.classList.add('active');
        const targetMedia = productSection.querySelector(`[data-media-id="${mediaId}"]`);
        if (targetMedia) {
          targetMedia.classList.add('active');
        }
      });
    }

    // Variant Selection
    const variantSelects = productSection.querySelectorAll('.select__select');
    const productForm = productSection.querySelector('form[data-type="add-to-cart-form"]');
    
    if (variantSelects.length > 0 && productForm) {
      for (const select of variantSelects) {
        select.addEventListener('change', function() {
          updateVariant();
        });
      }
    }

    function updateVariant() {
      const formData = new FormData(productForm);
      const selectedOptions = {};
      
      for (const select of variantSelects) {
        const optionName = select.name.replace('options[', '').replace(']', '');
        selectedOptions[optionName] = select.value;
      }

      // Find matching variant
      const productData = JSON.parse(document.querySelector('[data-product-json]')?.textContent || '{}');
      if (productData.variants) {
        const matchingVariant = productData.variants.find(variant => {
          return variant.options.every((option, index) => {
            const optionName = productData.options[index];
            return selectedOptions[optionName] === option;
          });
        });

        if (matchingVariant) {
          // Update hidden input
          const variantInput = productForm.querySelector('input[name="id"]');
          if (variantInput) {
            variantInput.value = matchingVariant.id;
          }

          // Update price
          const priceElement = productSection.querySelector('.product__price');
          if (priceElement && matchingVariant.price) {
            const price = matchingVariant.price;
            const comparePrice = matchingVariant.compare_at_price;
            
            if (comparePrice && comparePrice > price) {
              const priceFormatted = (price / 100).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
              const comparePriceFormatted = (comparePrice / 100).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
              priceElement.innerHTML = `<span class="product__price--sale">${priceFormatted}</span> <span class="product__price--compare">${comparePriceFormatted}</span>`;
            } else {
              const priceFormatted = (price / 100).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
              priceElement.textContent = priceFormatted;
            }
          }

          // Update availability
          const submitButton = productForm.querySelector('.product-form__submit');
          if (submitButton) {
            if (matchingVariant.available) {
              submitButton.disabled = false;
              submitButton.querySelector('span').textContent = 'Agregar al Carrito';
            } else {
              submitButton.disabled = true;
              submitButton.querySelector('span').textContent = 'Agotado';
            }
          }

          // Update featured media if variant has different image
          if (matchingVariant.featured_media) {
            const sectionId = productSection.dataset.sectionId;
            const newMediaId = `${sectionId}-${matchingVariant.featured_media.id}`;
            const newMediaItem = productSection.querySelector(`[data-media-id="${newMediaId}"]`);
            if (newMediaItem) {
              for (const item of productMediaItems) {
                item.classList.remove('active');
              }
              newMediaItem.classList.add('active');
              
              // Update thumbnail
              for (const thumb of productThumbnails) {
                thumb.classList.remove('active');
              }
              const thumbnailButton = Array.from(productThumbnails).find(thumb => thumb.dataset.mediaId === newMediaId);
              if (thumbnailButton) {
                thumbnailButton.classList.add('active');
              }
            }
          }
        }
      }
    }

    // Quantity Input
    const quantityInput = productSection.querySelector('.quantity__input');
    const quantityButtons = productSection.querySelectorAll('.quantity__button');
    
    if (quantityInput) {
      for (const button of quantityButtons) {
        button.addEventListener('click', function() {
          const currentValue = parseInt(quantityInput.value) || 1;
          if (this.name === 'plus') {
            quantityInput.value = currentValue + 1;
          } else if (this.name === 'minus' && currentValue > 1) {
            quantityInput.value = currentValue - 1;
          }
        });
      }
    }

    // Product Form Submission
    if (productForm) {
      productForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const submitButton = this.querySelector('.product-form__submit');
        const originalText = submitButton.querySelector('span').textContent;
        
        submitButton.disabled = true;
        submitButton.querySelector('span').textContent = 'Agregando...';

        fetch(window.routes.cart_add_url, {
          method: 'POST',
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          if (data.items) {
            submitButton.querySelector('span').textContent = '¡Agregado!';
            updateCartCount();
            
            setTimeout(() => {
              submitButton.disabled = false;
              submitButton.querySelector('span').textContent = originalText;
            }, 2000);
          } else {
            throw new Error('Failed to add to cart');
          }
        })
        .catch(error => {
          console.error('Error adding to cart:', error);
          submitButton.disabled = false;
          submitButton.querySelector('span').textContent = 'Error. Intenta de nuevo.';
          setTimeout(() => {
            submitButton.querySelector('span').textContent = originalText;
          }, 3000);
        });
      });
    }
  }

  // Collection Page Functionality
  const collectionPage = document.querySelector('.collection-page');
  if (collectionPage) {
    // Mobile Filter Toggle
    const filterTrigger = collectionPage.querySelector('[data-filter-trigger]');
    const filterClose = collectionPage.querySelector('[data-filter-close]');
    const filters = collectionPage.querySelector('[data-filters]');
    const filterOverlay = document.createElement('div');
    filterOverlay.className = 'collection-filters__overlay';
    filterOverlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7); z-index: 999; display: none;';
    
    if (filterTrigger && filters) {
      filterTrigger.addEventListener('click', function() {
        filters.classList.add('active');
        filterOverlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
        if (!document.body.contains(filterOverlay)) {
          document.body.appendChild(filterOverlay);
        }
      });

      const closeFilters = () => {
        filters.classList.remove('active');
        filterOverlay.style.display = 'none';
        document.body.style.overflow = '';
      };

      if (filterClose) {
        filterClose.addEventListener('click', closeFilters);
      }

      filterOverlay.addEventListener('click', closeFilters);
    }

    // Accordion Functionality
    const accordionTriggers = collectionPage.querySelectorAll('[data-accordion-trigger]');
    for (const trigger of accordionTriggers) {
      trigger.addEventListener('click', function() {
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        const content = this.nextElementSibling;
        
        if (isExpanded) {
          this.setAttribute('aria-expanded', 'false');
          if (content) {
            content.style.display = 'none';
          }
        } else {
          this.setAttribute('aria-expanded', 'true');
          if (content) {
            content.style.display = 'flex';
          }
        }
      });
    }

    // Load More Functionality
    const loadMoreButton = collectionPage.querySelector('[data-load-more]');
    const productGrid = collectionPage.querySelector('[data-product-grid]');
    const sectionId = collectionPage.dataset.sectionId;
    
    if (loadMoreButton && productGrid) {
      loadMoreButton.addEventListener('click', function() {
        const nextPageUrl = this.dataset.nextPage;
        if (!nextPageUrl) {
          this.style.display = 'none';
          return;
        }

        const originalText = this.textContent;
        const button = this;
        button.disabled = true;
        button.textContent = 'Cargando...';

        fetch(nextPageUrl)
          .then(response => response.text())
          .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Buscar la sección específica de la colección usando el section ID
            const collectionSection = doc.querySelector(`#CollectionSection-${sectionId}`);
            let newProducts = null;
            let newLoadMore = null;
            
            if (collectionSection) {
              newProducts = collectionSection.querySelector('[data-product-grid]');
              newLoadMore = collectionSection.querySelector('[data-load-more]');
            } else {
              // Fallback: buscar en toda la página pero solo la primera sección de colección
              const allCollectionSections = doc.querySelectorAll('.collection-page');
              if (allCollectionSections.length > 0) {
                newProducts = allCollectionSections[0].querySelector('[data-product-grid]');
                newLoadMore = allCollectionSections[0].querySelector('[data-load-more]');
              }
            }

            if (newProducts) {
              const products = Array.from(newProducts.querySelectorAll('.product-card'));
              const existingProductIds = new Set();
              
              // Obtener IDs de productos existentes para evitar duplicados
              const existingProducts = productGrid.querySelectorAll('[data-product-id]');
              for (const existing of existingProducts) {
                const productId = existing.getAttribute('data-product-id');
                if (productId) {
                  existingProductIds.add(productId);
                }
              }
              
              const fragment = document.createDocumentFragment();
              
              for (const product of products) {
                const productId = product.getAttribute('data-product-id');
                
                // Solo agregar si no existe ya
                if (productId && !existingProductIds.has(productId)) {
                  // Clonar el nodo profundamente para evitar problemas de referencia
                  const clonedProduct = product.cloneNode(true);
                  
                  // Asegurar que los enlaces funcionen correctamente
                  const links = clonedProduct.querySelectorAll('a[href]');
                  for (const link of links) {
                    const href = link.getAttribute('href');
                    if (href && !href.startsWith('http') && !href.startsWith('//')) {
                      // Convertir URL relativa a absoluta si es necesario
                      try {
                        const url = new URL(href, window.location.origin);
                        link.setAttribute('href', url.pathname);
                      } catch (e) {
                        // Si falla, mantener el href original
                        console.warn('Error processing product link:', href);
                      }
                    }
                  }
                  
                  fragment.appendChild(clonedProduct);
                  existingProductIds.add(productId);
                }
              }
              
              if (fragment.children.length > 0) {
                productGrid.appendChild(fragment);
              } else {
                // Si no se agregaron productos nuevos, puede que ya estén todos cargados
                console.log('No new products to add - may have reached end or duplicates detected');
              }
            }

            if (newLoadMore && newLoadMore.dataset.nextPage) {
              button.dataset.nextPage = newLoadMore.dataset.nextPage;
              button.disabled = false;
              button.textContent = originalText;
            } else {
              // Ocultar el botón si no hay más páginas
              const loadMoreContainer = button.closest('[data-load-more-container]');
              if (loadMoreContainer) {
                loadMoreContainer.style.display = 'none';
              } else {
                button.style.display = 'none';
              }
            }
          })
          .catch(error => {
            console.error('Error loading more products:', error);
            button.disabled = false;
            button.textContent = originalText;
          });
      });
    }

    // Filter Functionality (Basic - can be enhanced)
    const filterForm = collectionPage.querySelector('[data-filter-form]');
    const filterCheckboxes = collectionPage.querySelectorAll('[data-filter-checkbox]');
    const sortSelect = collectionPage.querySelector('[data-sort-select]');
    const clearFilters = collectionPage.querySelector('[data-filter-clear]');

    if (sortSelect) {
      sortSelect.addEventListener('change', function() {
        const url = new URL(window.location);
        url.searchParams.set('sort_by', this.value);
        window.location.href = url.toString();
      });
    }

    if (clearFilters) {
      clearFilters.addEventListener('click', function() {
        for (const checkbox of filterCheckboxes) {
          checkbox.checked = false;
        }
        if (sortSelect) {
          sortSelect.value = 'manual';
        }
        // Reload page without filters
        window.location.href = window.location.pathname;
      });
    }
  }
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

