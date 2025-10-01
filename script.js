/*
  Imzad Landing Page Scripts

  Provides simple interactivity for the landing page: language switching,
  tabbed content for the “How It Works” section, and expandable FAQ
  accordions. There are no external dependencies; all behaviour is
  implemented in vanilla JavaScript to ensure quick load times.
*/

document.addEventListener('DOMContentLoaded', () => {
  // Language switcher
  const langButtons = document.querySelectorAll('nav.language-switcher button');
  langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      setLanguage(lang);
      langButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  function setLanguage(lang) {
    document.querySelectorAll('[data-lang]').forEach(el => {
      el.style.display = el.getAttribute('data-lang') === lang ? '' : 'none';
    });
    // Set dir attribute on html for RTL when Arabic is selected
    if (lang === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }
  }

  // default to English
  setLanguage('en');
  document.querySelector('nav.language-switcher button[data-lang="en"]').classList.add('active');

  // Tabs for how it works section
  const tabContainers = document.querySelectorAll('.tabs');
  tabContainers.forEach(container => {
    const buttons = container.querySelectorAll('button');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        const contentWrapper = btn.closest('section').querySelectorAll('.tab-content');
        contentWrapper.forEach(el => el.classList.remove('active'));
        btn.closest('section').querySelector(`#${target}`).classList.add('active');
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
    // set first tab active by default
    if (buttons.length > 0) {
      buttons[0].click();
    }
  });

  // FAQ accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      item.classList.toggle('open');
    });
  });
});