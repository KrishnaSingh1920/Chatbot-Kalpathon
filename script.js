
// Modal Handling with Improved Accessibility
document.querySelectorAll('[data-modal]').forEach(button => {
  button.addEventListener('click', () => {
    const modal = document.getElementById(button.dataset.modal);
    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  });
});

document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal') || e.target.classList.contains('modal-close')) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  });
});

// Testimonial Slider with Dot Controls
let currentTestimonial = 0;
const testimonials = document.querySelectorAll('.testimonial');
const dots = document.querySelectorAll('.dot');

function showTestimonial(index) {
  if (index === currentTestimonial) return;

  const direction = index > currentTestimonial ? 'right' : 'left';

  testimonials.forEach((t, i) => {
    t.classList.remove('active', 'exit-left', 'exit-right');
    if (i === currentTestimonial) {
      t.classList.add(direction === 'right' ? 'exit-left' : 'exit-right');
    }
  });

  testimonials[index].classList.add('active');
  dots.forEach(d => d.classList.remove('active'));
  dots[index].classList.add('active');
  currentTestimonial = index;
}

const nextBtn = document.querySelector('.slider-next');
if (nextBtn) {
  nextBtn.addEventListener('click', () => {
    showTestimonial((currentTestimonial + 1) % testimonials.length);
  });
}

const prevBtn = document.querySelector('.slider-prev');
if (prevBtn) {
  prevBtn.addEventListener('click', () => {
    showTestimonial((currentTestimonial - 1 + testimonials.length) % testimonials.length);
  });
}

// FAQ Search Functionality
const faqSearch = document.querySelector('.faq-search input');
if (faqSearch) {
  faqSearch.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    document.querySelectorAll('.faq-item').forEach(item => {
      item.style.display = item.textContent.toLowerCase().includes(searchTerm) ? 'block' : 'none';
    });
  });
}

// Pricing Toggle Switch
const pricingToggle = document.getElementById('pricing-toggle');
if (pricingToggle) {
  pricingToggle.addEventListener('change', (e) => {
    const prices = document.querySelectorAll('.amount');
    const annualPrices = ['₹999', '₹2999', '₹5999'];
    const monthlyPrices = ['₹159', '₹499', '₹999'];
    
    prices.forEach((price, index) => {
      price.textContent = e.target.checked ? annualPrices[index] : monthlyPrices[index];
    });
    
    document.querySelectorAll('.period').forEach(period => {
      period.textContent = e.target.checked ? '/year' : '/month';
    });
  });
}

// Form Validation with Loading State
document.querySelectorAll('.auth-form').forEach(form => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const inputs = form.querySelectorAll('input');
    let isValid = true;

    inputs.forEach(input => {
      if (!input.checkValidity()) {
        isValid = false;
        input.classList.add('invalid');
      } else {
        input.classList.remove('invalid');
      }
    });

    if (isValid) {
      form.classList.add('loading');
      await new Promise(resolve => setTimeout(resolve, 1500));
      form.classList.remove('loading');
      form.reset();
      alert('Form submitted successfully!');
    }
  });
});

// Smooth Scroll Implementation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Loading Animation Handler
window.addEventListener('load', () => {
  const overlay = document.querySelector('.loading-overlay');
  if (overlay) overlay.style.display = 'none';
});

// Copy Embed Code Functionality
const embedButton = document.querySelector('.embed-code button');
if (embedButton) {
  embedButton.addEventListener('click', () => {
    const code = document.querySelector('.embed-code code').textContent;
    navigator.clipboard.writeText(code).then(() => {
    });
  });
};
