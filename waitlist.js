/**
 * iOS Waitlist Modal Functionality
 * Handles modal display, form validation, submission, and analytics
 */

class WaitlistModal {
  constructor() {
    this.modal = document.getElementById('waitlist-modal');
    this.form = document.getElementById('waitlist-form');
    this.successDiv = document.getElementById('waitlist-success');
    this.counter = document.querySelector('.waitlist-counter');
    this.isSubmitting = false;
    this.contactMethod = 'email'; // 'email' or 'phone'
    this.prevFocus = null;
    this._boundKeydownHandler = null;
    this.pageLoadTime = Date.now();

    this.init();
  }

  init() {
    this.bindEvents();
    this.updateCounter();
    this.addPulseAnimation();
    this.setupExitIntent();
    this.setupScrollTrigger();
  }

  bindEvents() {
    // iOS waitlist button triggers
    document.querySelectorAll('.ios-waitlist-button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.open();
      });
    });

    // Modal close events
    document.querySelector('.waitlist-modal-close').addEventListener('click', () => {
      this.close();
    });

    document.querySelector('.waitlist-modal-backdrop').addEventListener('click', () => {
      this.close();
    });

    // ESC key close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('active')) {
        this.close();
      }
    });

    // Form submission
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Real-time validation
    this.form.querySelectorAll('input, select').forEach(input => {
      input.addEventListener('blur', () => {
        this.validateField(input);
      });
      
      input.addEventListener('input', () => {
        this.clearError(input);
      });
    });

    // Social sharing
    document.querySelectorAll('.waitlist-share-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.handleShare(btn.dataset.platform);
      });
    });

    // Contact method toggle
    document.getElementById('contact-toggle').addEventListener('click', () => {
      this.toggleContactMethod();
    });
  }

  open() {
    this.prevFocus = document.activeElement;
    this.modal.classList.add('active');
    this.modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Trap focus within the modal
    const focusable = this.modal.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    this._boundKeydownHandler = (e) => {
      if (e.key === 'Tab' && focusable.length) {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    this.modal.addEventListener('keydown', this._boundKeydownHandler);

    // Focus appropriate input
    setTimeout(() => {
      const target = this.contactMethod === 'phone' ? document.getElementById('waitlist-phone') : document.getElementById('waitlist-email');
      target && target.focus();
    }, 300);

    // Session gating flag
    try { sessionStorage.setItem('waitlist_shown', '1'); } catch (e) {}

    // Analytics
    this.trackEvent('waitlist_modal_open');
  }

  close() {
    this.modal.classList.remove('active');
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    // Remove focus trap
    if (this._boundKeydownHandler) {
      this.modal.removeEventListener('keydown', this._boundKeydownHandler);
      this._boundKeydownHandler = null;
    }

    // Always reset form after close
    this.resetForm();

    // Restore focus to trigger
    if (this.prevFocus && typeof this.prevFocus.focus === 'function') {
      this.prevFocus.focus();
    }
    this.prevFocus = null;

    // Analytics
    this.trackEvent('waitlist_modal_close');
  }

  async handleSubmit() {
    if (this.isSubmitting) return;

    const formData = new FormData(this.form);
    const data = {
      email: formData.get('email')?.trim() || '',
      phone: formData.get('phone')?.trim() || '',
      firstName: formData.get('firstName').trim(),
      userType: formData.get('userType') || 'not_specified',
      contactMethod: this.contactMethod,
      language: this.getCurrentLanguage(),
      timestamp: new Date().toISOString(),
      source: 'landing_page'
    };

    // Validate all fields
    if (!this.validateForm(data)) {
      return;
    }

    this.isSubmitting = true;
    this.setSubmitLoading(true);

    try {
      // Submit to backend/service
      const response = await this.submitToService(data);
      
      if (response.success) {
        this.showSuccess();
        this.updateCounter(response.totalCount);
        this.trackEvent('waitlist_signup_success', {
          user_type: data.userType,
          language: data.language
        });
      } else {
        throw new Error(response.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Waitlist submission error:', error);
      this.showError('submission', this.getErrorMessage('network_error'));
      this.trackEvent('waitlist_signup_error', {
        error: error.message
      });
    } finally {
      this.isSubmitting = false;
      this.setSubmitLoading(false);
    }
  }

  validateForm(data) {
    let isValid = true;

    // Contact method validation (email OR phone required)
    if (this.contactMethod === 'email') {
      if (!data.email) {
        this.showError('email', this.getErrorMessage('email_required'));
        isValid = false;
      } else if (!this.isValidEmail(data.email)) {
        this.showError('email', this.getErrorMessage('email_invalid'));
        isValid = false;
      }
    } else if (this.contactMethod === 'phone') {
      if (!data.phone) {
        this.showError('phone', this.getErrorMessage('phone_required'));
        isValid = false;
      } else if (!this.isValidPhone(data.phone)) {
        this.showError('phone', this.getErrorMessage('phone_invalid'));
        isValid = false;
      }
    }

    // Name validation
    if (!data.firstName) {
      this.showError('name', this.getErrorMessage('name_required'));
      isValid = false;
    } else if (data.firstName.length < 2) {
      this.showError('name', this.getErrorMessage('name_too_short'));
      isValid = false;
    }

    // Consent validation
    const consentEl = document.getElementById('waitlist-consent');
    if (consentEl && !consentEl.checked) {
      this.showError('consent', this.getErrorMessage('consent_required'));
      isValid = false;
    }

    return isValid;
  }

  validateField(input) {
    const value = input.value.trim();

    if (input.name === 'email' && this.contactMethod === 'email') {
      if (!value) {
        this.showError('email', this.getErrorMessage('email_required'));
        return false;
      } else if (!this.isValidEmail(value)) {
        this.showError('email', this.getErrorMessage('email_invalid'));
        return false;
      }
    }

    if (input.name === 'phone' && this.contactMethod === 'phone') {
      if (!value) {
        this.showError('phone', this.getErrorMessage('phone_required'));
        return false;
      } else if (!this.isValidPhone(value)) {
        this.showError('phone', this.getErrorMessage('phone_invalid'));
        return false;
      }
    }

    if (input.name === 'firstName') {
      if (!value) {
        this.showError('name', this.getErrorMessage('name_required'));
        return false;
      } else if (value.length < 2) {
        this.showError('name', this.getErrorMessage('name_too_short'));
        return false;
      }
    }

    this.clearError(input);
    return true;
  }

  showError(field, message) {
    let errorDiv, input;

    switch(field) {
      case 'email':
        errorDiv = document.getElementById('email-error');
        input = document.getElementById('waitlist-email');
        break;
      case 'phone':
        errorDiv = document.getElementById('phone-error');
        input = document.getElementById('waitlist-phone');
        break;
      case 'name':
        errorDiv = document.getElementById('name-error');
        input = document.getElementById('waitlist-name');
        break;
      case 'consent':
        errorDiv = document.getElementById('consent-error');
        input = document.getElementById('waitlist-consent');
        break;
      default:
        return;
    }

    if (errorDiv) errorDiv.textContent = message;
    if (input) {
      input.classList.add('error');
      input.setAttribute('aria-invalid', 'true');
    }
  }

  clearError(input) {
    if (!input) return;
    let errorDiv;

    switch(input.name) {
      case 'email':
        errorDiv = document.getElementById('email-error');
        break;
      case 'phone':
        errorDiv = document.getElementById('phone-error');
        break;
      case 'firstName':
        errorDiv = document.getElementById('name-error');
        break;
      case 'consent':
        errorDiv = document.getElementById('consent-error');
        break;
      default:
        return;
    }

    if (errorDiv) errorDiv.textContent = '';
    input.classList.remove('error');
    input.setAttribute('aria-invalid', 'false');
  }

  async submitToService(data) {
    const url = "https://spotted-civet-148.convex.site/waitlistSubmit";
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    // Keep simulated counter increment locally (backend doesn't return a count)
    const current = parseInt(this.counter.textContent.replace(/,/g, '')) || 0;
    const increment = Math.floor(Math.random() * 5) + 1;
    return { success: true, totalCount: current + increment };
  }

  showSuccess() {
    this.form.style.display = 'none';
    this.successDiv.style.display = 'block';
    
    // Auto-close after 5 seconds
    setTimeout(() => {
      this.close();
    }, 5000);
  }

  setSubmitLoading(loading) {
    const submitBtn = document.getElementById('waitlist-submit');
    if (loading) {
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;
    } else {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  }

  resetForm() {
    this.form.reset();
    this.form.style.display = 'block';
    this.successDiv.style.display = 'none';
    
    // Clear all errors
    this.form.querySelectorAll('.waitlist-form-error').forEach(error => {
      error.textContent = '';
    });
    
    this.form.querySelectorAll('.error').forEach(input => {
      input.classList.remove('error');
      input.setAttribute('aria-invalid', 'false');
    });
  }

  updateCounter(newCount) {
    if (newCount) {
      document.querySelectorAll('.waitlist-counter').forEach(el => {
        el.textContent = newCount.toLocaleString();
      });
    }
  }

  addPulseAnimation() {
    // Add subtle pulse animation to iOS buttons every 10 seconds
    setInterval(() => {
      document.querySelectorAll('.ios-waitlist-button').forEach(btn => {
        btn.classList.add('pulse');
        setTimeout(() => btn.classList.remove('pulse'), 2000);
      });
    }, 10000);
  }

  handleShare(platform) {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(this.getShareMessage());
    
    let shareUrl;
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${text}%20${url}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      this.trackEvent('waitlist_share', { platform });
    }
  }

  getCurrentLanguage() {
    const activeBtn = document.querySelector('nav.language-switcher button.active');
    return activeBtn ? activeBtn.dataset.lang : 'en';
  }

  getShareMessage() {
    const lang = this.getCurrentLanguage();
    const messages = {
      en: "I just joined the Imzad iOS waitlist! Join me:",
      fr: "Je viens de rejoindre la liste d'attente iOS d'Imzad ! Rejoignez-moi :",
      ar: "لقد انضممت للتو إلى قائمة انتظار Imzad iOS! انضم إلي:"
    };
    return messages[lang] || messages.en;
  }

  getErrorMessage(type) {
    const lang = this.getCurrentLanguage();
    const messages = {
      en: {
        email_required: "Please enter your email address",
        email_invalid: "Please enter a valid email address",
        phone_required: "Please enter your phone number",
        phone_invalid: "Please enter a valid phone number (e.g., +213 XXX XXX XXX)",
        name_required: "Please enter your first name",
        name_too_short: "Name must be at least 2 characters",
        consent_required: "Please consent to receive updates",
        network_error: "Something went wrong. Please try again."
      },
      fr: {
        email_required: "Veuillez saisir votre adresse e-mail",
        email_invalid: "Veuillez saisir une adresse e-mail valide",
        phone_required: "Veuillez saisir votre numéro de téléphone",
        phone_invalid: "Veuillez saisir un numéro valide (ex: +213 XXX XXX XXX)",
        name_required: "Veuillez saisir votre prénom",
        name_too_short: "Le nom doit contenir au moins 2 caractères",
        consent_required: "Veuillez donner votre consentement pour recevoir des mises à jour",
        network_error: "Une erreur s'est produite. Réessayez."
      },
      ar: {
        email_required: "يرجى إدخال عنوان بريدك الإلكتروني",
        email_invalid: "يرجى إدخال عنوان بريد إلكتروني صحيح",
        phone_required: "يرجى إدخال رقم هاتفك",
        phone_invalid: "يرجى إدخال رقم صحيح (مثال: +213 XXX XXX XXX)",
        name_required: "يرجى إدخال اسمك الأول",
        name_too_short: "يجب أن يكون الاسم على الأقل حرفين",
        consent_required: "يرجى الموافقة على تلقي التحديثات",
        network_error: "حدث خطأ. يرجى المحاولة مرة أخرى."
      }
    };
    return messages[lang]?.[type] || messages.en[type];
  }

  toggleContactMethod() {
    const emailGroup = document.getElementById('email-group');
    const phoneGroup = document.getElementById('phone-group');
    const divider = document.querySelector('.waitlist-contact-divider');
    const toggle = document.getElementById('contact-toggle');

    if (this.contactMethod === 'email') {
      // Switch to phone
      this.contactMethod = 'phone';
      emailGroup.style.display = 'none';
      phoneGroup.style.display = 'block';
      divider.style.display = 'block';

      // Update toggle text
      const lang = this.getCurrentLanguage();
      const toggleTexts = {
        en: '📧 Prefer email? Use email address instead',
        fr: '📧 Préférez l\'email ? Utilisez votre adresse e-mail',
        ar: '📧 تفضل الإيميل؟ استخدم عنوان البريد الإلكتروني'
      };
      toggle.querySelector(`[data-lang="${lang}"]`).textContent = toggleTexts[lang] || toggleTexts.en;

      // Focus phone input
      setTimeout(() => document.getElementById('waitlist-phone').focus(), 100);

      // Clear any stale errors
      this.clearError(document.getElementById('waitlist-email'));
      this.clearError(document.getElementById('waitlist-phone'));

      this.trackEvent('contact_method_switch', { to: 'phone' });
    } else {
      // Switch to email
      this.contactMethod = 'email';
      emailGroup.style.display = 'block';
      phoneGroup.style.display = 'none';
      divider.style.display = 'none';

      // Update toggle text
      const lang = this.getCurrentLanguage();
      const toggleTexts = {
        en: '💬 Prefer WhatsApp? Use phone number instead',
        fr: '💬 Préférez WhatsApp ? Utilisez votre numéro',
        ar: '💬 تفضل واتساب؟ استخدم رقم الهاتف'
      };
      toggle.querySelector(`[data-lang="${lang}"]`).textContent = toggleTexts[lang] || toggleTexts.en;

      // Focus email input
      setTimeout(() => document.getElementById('waitlist-email').focus(), 100);

      // Clear any stale errors
      this.clearError(document.getElementById('waitlist-email'));
      this.clearError(document.getElementById('waitlist-phone'));

      this.trackEvent('contact_method_switch', { to: 'email' });
    }
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone) {
    // Remove all non-digit characters for validation
    const cleanPhone = phone.replace(/\D/g, '');

    // Check for Algerian numbers (+213) or international format
    // Algerian mobile: +213 5XX XXX XXX, +213 6XX XXX XXX, +213 7XX XXX XXX
    const algerianMobile = /^(\+213|213|0)?[567]\d{8}$/;
    const internationalPhone = /^\+?[1-9]\d{7,14}$/;

    return algerianMobile.test(cleanPhone) || internationalPhone.test(cleanPhone);
  }

  setupExitIntent() {
    let hasTriggered = false;

    // Desktop exit intent
    if (window.innerWidth >= 768) {
      document.addEventListener('mouseleave', (e) => {
        const dwellOk = (Date.now() - this.pageLoadTime) > 25000; // 25s dwell
        const notShown = !sessionStorage.getItem('waitlist_shown');
        if (e.clientY <= 0 && !hasTriggered && !this.modal.classList.contains('active') && dwellOk && notShown) {
          hasTriggered = true;
          setTimeout(() => {
            this.open();
            this.trackEvent('waitlist_exit_intent_trigger');
          }, 500);
        }
      });
    }
  }

  setupScrollTrigger() {
    let hasTriggered = false;

    // Mobile scroll trigger (70% of page)
    if (window.innerWidth < 768) {
      window.addEventListener('scroll', () => {
        const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        const dwellOk = (Date.now() - this.pageLoadTime) > 20000; // 20s dwell
        const notShown = !sessionStorage.getItem('waitlist_shown');

        if (scrollPercent > 70 && !hasTriggered && !this.modal.classList.contains('active') && dwellOk && notShown) {
          hasTriggered = true;
          setTimeout(() => {
            this.open();
            this.trackEvent('waitlist_scroll_trigger');
          }, 1000);
        }
      });
    }
  }

  trackEvent(eventName, parameters = {}) {
    // Google Analytics 4 tracking
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, {
        event_category: 'waitlist',
        ...parameters
      });
    }

    // Console log for development
    console.log('Waitlist Event:', eventName, parameters);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new WaitlistModal();
});
