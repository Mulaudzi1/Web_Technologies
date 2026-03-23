(function ($) {
  const storageKey = 'richfield-connect-profile';

  function parseInterests(value) {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function renderPreview() {
    const fullName = $('#fullName').val().trim();
    const campus = $('#campus').val().trim();
    const bio = $('#bio').val().trim();
    const interests = parseInterests($('#interests').val().trim());
    const initials = fullName
      ? fullName
          .split(/\s+/)
          .slice(0, 2)
          .map((part) => part.charAt(0).toUpperCase())
          .join('')
      : 'RC';

    $('#preview-name').text(fullName || 'Your Name');
    $('#preview-campus').text(campus || 'Campus / DL');
    $('#preview-bio').text(bio || 'Your bio will appear here as you type.');
    $('.preview-avatar').text(initials);

    const $previewInterests = $('#preview-interests');
    $previewInterests.empty();

    if (!interests.length) {
      $previewInterests.append('<span class="tag muted">Interests will appear here</span>');
      return;
    }

    interests.forEach((interest) => {
      $previewInterests.append($('<span>', { class: 'tag', text: interest }));
    });
  }

  function setError(fieldId, message) {
    $('#' + fieldId + '-error').text(message || '');
  }

  function clearErrors() {
    $('.error-message').text('');
  }

  function validate() {
    clearErrors();

    const values = {
      fullName: $('#fullName').val().trim(),
      studentNumber: $('#studentNumber').val().trim(),
      campus: $('#campus').val().trim(),
      email: $('#email').val().trim(),
      password: $('#password').val(),
      confirmPassword: $('#confirmPassword').val(),
      interests: $('#interests').val().trim(),
      bio: $('#bio').val().trim(),
    };

    let valid = true;

    if (values.fullName.length < 3) {
      setError('fullName', 'Please enter your full name.');
      valid = false;
    }

    if (!/^\d{6,}$/.test(values.studentNumber)) {
      setError('studentNumber', 'Use at least 6 digits for the student number.');
      valid = false;
    }

    if (!values.campus) {
      setError('campus', 'Please choose a campus or mode.');
      valid = false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      setError('email', 'Enter a valid email address.');
      valid = false;
    }

    if (values.password.length < 8) {
      setError('password', 'Password must be at least 8 characters.');
      valid = false;
    }

    if (values.confirmPassword !== values.password) {
      setError('confirmPassword', 'Passwords do not match.');
      valid = false;
    }

    if (!parseInterests(values.interests).length) {
      setError('interests', 'Add at least one interest.');
      valid = false;
    }

    if (values.bio.length < 20) {
      setError('bio', 'Write a short bio of at least 20 characters.');
      valid = false;
    }

    return valid ? values : null;
  }

  $(function () {
    $('#signup-form input, #signup-form textarea, #signup-form select').on('input change', renderPreview);
    renderPreview();

    const savedProfile = localStorage.getItem(storageKey);
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      $('#fullName').val(profile.fullName || '');
      $('#studentNumber').val(profile.studentNumber || '');
      $('#campus').val(profile.campus || '');
      $('#email').val(profile.email || '');
      $('#interests').val((profile.interests || []).join(', '));
      $('#bio').val(profile.bio || '');
      renderPreview();
    }

    $('#signup-form').on('submit', function (event) {
      event.preventDefault();
      const values = validate();
      if (!values) {
        return;
      }

      localStorage.setItem(
        storageKey,
        JSON.stringify({
          fullName: values.fullName,
          studentNumber: values.studentNumber,
          campus: values.campus,
          email: values.email,
          interests: parseInterests(values.interests),
          bio: values.bio,
          updatedAt: new Date().toISOString(),
        })
      );

      window.location.href = 'profile.html';
    });
  });
})(jQuery);
