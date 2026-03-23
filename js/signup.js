(function ($) {
  const storageKey = 'richfield-connect-profile';
  let hasSavedProfile = false;
  let formLocked = false;

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

  function showStatus(message) {
    $('#profile-status').removeClass('hidden').text(message);
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

    const passwordProvided = values.password.length > 0 || values.confirmPassword.length > 0;
    const passwordRequired = !hasSavedProfile || passwordProvided;
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

    if (passwordRequired && values.password.length < 8) {
      setError('password', 'Password must be at least 8 characters.');
      valid = false;
    }

    if (passwordRequired && values.confirmPassword !== values.password) {
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

  function setFormLocked(locked, message) {
    formLocked = locked;

    $('#signup-form')
      .find('input, textarea, select')
      .prop('disabled', locked)
      .closest('.field-group')
      .toggleClass('is-locked', locked);

    $('#save-profile-button').toggleClass('hidden', locked);
    $('#edit-profile-button').toggleClass('hidden', !locked);
    $('#view-profile-button').toggleClass('hidden', !hasSavedProfile);
    $('#profile-lock-indicator').toggleClass('hidden', !locked).text(locked ? 'Locked' : 'Editing');

    if (locked) {
      showStatus(message || 'Profile saved. Fields are greyed out until you click Edit Profile.');
      $('#password').val('');
      $('#confirmPassword').val('');
    } else if (message) {
      showStatus(message);
    }
  }

  function fillForm(profile) {
    $('#fullName').val(profile.fullName || '');
    $('#studentNumber').val(profile.studentNumber || '');
    $('#campus').val(profile.campus || '');
    $('#email').val(profile.email || '');
    $('#interests').val((profile.interests || []).join(', '));
    $('#bio').val(profile.bio || '');
    $('#password').val('');
    $('#confirmPassword').val('');
    renderPreview();
  }

  $(function () {
    $('#signup-form input, #signup-form textarea, #signup-form select').on('input change', renderPreview);
    renderPreview();

    const savedProfile = localStorage.getItem(storageKey);
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      hasSavedProfile = true;
      fillForm(profile);
      setFormLocked(true, 'Saved profile loaded. Click Edit Profile to unlock the form.');
    } else {
      $('#view-profile-button').addClass('hidden');
    }

    $('#edit-profile-button').on('click', function () {
      setFormLocked(false, 'Editing enabled. Update your details and save again when you are ready.');
      $('#profile-lock-indicator').removeClass('hidden').text('Editing');
      $('#fullName').trigger('focus');
    });

    $('#signup-form').on('submit', function (event) {
      event.preventDefault();

      if (formLocked) {
        return;
      }

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
          hasPassword: true,
          updatedAt: new Date().toISOString(),
        })
      );

      hasSavedProfile = true;
      setFormLocked(true, 'Profile saved successfully. Fields are now greyed out until you click Edit Profile.');
      renderPreview();
    });
  });
})(jQuery);
