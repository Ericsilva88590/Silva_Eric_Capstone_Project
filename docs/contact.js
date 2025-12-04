document.addEventListener('DOMContentLoaded', function () {
  const contactSection = document.getElementById('contact');
  if (!contactSection) return;

  const form = contactSection.querySelector('form');
  if (!form) return;

  function setFieldError(input, message) {
    let err = input.parentNode.querySelector('.field-error');
    if (!err) {
      err = document.createElement('div');
      err.className = 'field-error';
      input.parentNode.insertBefore(err, input.nextSibling);
    }
    err.textContent = message || '';
    if (message) {
      input.setAttribute('aria-invalid', 'true');
    } else {
      input.removeAttribute('aria-invalid');
      if (err) err.remove();
    }
  }

  function clearFieldErrors() {
    form.querySelectorAll('.field-error').forEach(el => el.remove());
    form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
  }

  function showAlert(message, type = 'info') {
    const existing = document.querySelector('.site-alert');
    if (existing) existing.remove();
    const div = document.createElement('div');
    div.className = 'site-alert site-alert-' + type;
    div.setAttribute('role', 'alert');
    div.innerHTML = '<span class="site-alert-message">' + message + '</span>' +
      '<button class="site-alert-close" aria-label="Close alert">&times;</button>';
    const main = document.querySelector('main') || document.body;
    main.parentNode.insertBefore(div, main);
    div.querySelector('.site-alert-close').addEventListener('click', () => div.remove());
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    clearFieldErrors();

    const name = form.querySelector('#name');
    const email = form.querySelector('#email');
    const topic = form.querySelector('#topic');
    const message = form.querySelector('#message');

    let valid = true;

    if (!name.value.trim() || name.value.trim().length < 2) {
      setFieldError(name, 'Please enter your name (at least 2 characters).');
      valid = false;
    }
    if (!validateEmail(email.value.trim())) {
      setFieldError(email, 'Please enter a valid email address.');
      valid = false;
    }
    if (!topic.value) {
      setFieldError(topic, 'Please select a topic.');
      valid = false;
    }
    if (!message.value.trim() || message.value.trim().length < 10) {
      setFieldError(message, 'Please enter a message (at least 10 characters).');
      valid = false;
    }

    if (!valid) {
      showAlert('Please fix the errors in the form and try again.', 'error');
      // focus first invalid field
      const firstInvalid = form.querySelector('[aria-invalid]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    showAlert('Thanks for your message we appreciate you! (Demo submission it doesnt really send to email.)', 'success');
    form.reset();
  });
});
