/*
  Imzad Landing Page Scripts

  Provides simple interactivity for the landing page: language switching,
  tabbed content for the “How It Works” section, and expandable FAQ
  accordions. There are no external dependencies; all behaviour is
  implemented in vanilla JavaScript to ensure quick load times.
*/

// Performance optimization: Use passive event listeners where possible
document.addEventListener('DOMContentLoaded', () => {
  // Language switcher - Cache DOM queries for performance
  const langButtons = document.querySelectorAll('nav.language-switcher button');
  const htmlElement = document.documentElement;
  const bodyElement = document.body;
  langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      setLanguage(lang);
      langButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
    });
  });

  // Cache language elements for better performance
  const langElements = document.querySelectorAll('[data-lang]');

  function setLanguage(lang) {
    // Save language preference to localStorage for persistence across pages
    localStorage.setItem('imzad-language', lang);

    // Add fade transition class to body
    bodyElement.style.transition = 'opacity 0.2s ease-in-out';
    bodyElement.style.opacity = '0.7';

    // Use requestAnimationFrame for smoother transitions
    requestAnimationFrame(() => {
      setTimeout(() => {
        // Iterate over cached elements
        langElements.forEach(el => {
          // Do not hide language switcher buttons themselves
          if (el.closest('nav.language-switcher')) {
            el.style.display = '';
            return;
          }

          // Handle waitlist modal elements
          if (el.closest('#waitlist-modal')) {
            const langs = el.getAttribute('data-lang').split(/\s+/);
            el.style.display = langs.includes(lang) ? '' : 'none';
            return;
          }

          const langs = el.getAttribute('data-lang').split(/\s+/);
          el.style.display = langs.includes(lang) ? '' : 'none';
        });

        // Set dir attribute on html for RTL when Arabic is selected
        htmlElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

        // Update form placeholders and select option labels
        updateFormPlaceholders(lang);
        updateSelectLabels(lang);

        // Restore opacity
        bodyElement.style.opacity = '1';

        // Announce language change to screen readers
        announceLanguageChange(lang);
      }, 100);
    });
  }

  function updateFormPlaceholders(lang) {
    const placeholders = {
      en: { email: 'your@email.com', phone: '+213 5X XX XX XX', name: 'Your first name' },
      fr: { email: 'votre@email.com', phone: '+213 5X XX XX XX', name: 'Votre prénom' },
      ar: { email: 'your@email.com', phone: '+213 5X XX XX XX', name: 'اسمك الأول' }
    };

    const emailInput = document.getElementById('waitlist-email');
    const phoneInput = document.getElementById('waitlist-phone');
    const nameInput = document.getElementById('waitlist-name');

    if (emailInput && placeholders[lang]) {
      emailInput.placeholder = placeholders[lang].email;
    }
    if (phoneInput && placeholders[lang]) {
      phoneInput.placeholder = placeholders[lang].phone;
    }
    if (nameInput && placeholders[lang]) {
      nameInput.placeholder = placeholders[lang].name;
    }
  }

  function updateSelectLabels(lang) {
    const select = document.getElementById('waitlist-type');
    if (!select) return;
    Array.from(select.options).forEach(opt => {
      const label = opt.getAttribute(`data-label-${lang}`);
      if (label) opt.textContent = label;
    });
  }

  function announceLanguageChange(lang) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
    announcement.textContent = `Language changed to ${lang === 'ar' ? 'Arabic' : lang === 'fr' ? 'French' : 'English'}`;
    bodyElement.appendChild(announcement);
    setTimeout(() => bodyElement.removeChild(announcement), 1000);
  }

  // Initialize language from localStorage or default to English
  const savedLanguage = localStorage.getItem('imzad-language') || 'en';
  setLanguage(savedLanguage);

  // Set the active state on the correct language button
  const activeLangBtn = document.querySelector(`nav.language-switcher button[data-lang="${savedLanguage}"]`);
  if (activeLangBtn) {
    activeLangBtn.classList.add('active');
    activeLangBtn.setAttribute('aria-pressed', 'true');
  }

  // Tabs for how it works section
  const tabContainers = document.querySelectorAll('.tabs');
  tabContainers.forEach(container => {
    const buttons = container.querySelectorAll('button');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        activateTab(btn, buttons);
      });

      // Add keyboard navigation
      btn.addEventListener('keydown', (e) => {
        let targetButton = null;

        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const currentIndex = Array.from(buttons).indexOf(btn);
          if (e.key === 'ArrowRight') {
            targetButton = buttons[currentIndex + 1] || buttons[0];
          } else {
            targetButton = buttons[currentIndex - 1] || buttons[buttons.length - 1];
          }
          targetButton.focus();
          activateTab(targetButton, buttons);
        }
      });
    });

    function activateTab(btn, buttons) {
      const target = btn.getAttribute('data-target');
      const contentWrapper = btn.closest('section').querySelectorAll('.tab-content');
      contentWrapper.forEach(el => el.classList.remove('active'));
      btn.closest('section').querySelector(`#${target}`).classList.add('active');
      buttons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
        b.setAttribute('tabindex', '-1');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      btn.setAttribute('tabindex', '0');
    }
    // set first tab active by default
    if (buttons.length > 0) {
      buttons[0].click();
      buttons[0].setAttribute('tabindex', '0');
    }
  });

  // FAQ accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      item.classList.toggle('open');
      question.setAttribute('aria-expanded', !isOpen);
    });
  });
});