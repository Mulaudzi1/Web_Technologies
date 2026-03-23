(function ($) {
  const storageKey = 'richfield-connect-profile';

  function renderProfile(profile) {
    $('#profile-name').text(profile.fullName);
    $('#profile-email').text(profile.email);
    $('#profile-student-number').text(profile.studentNumber);
    $('#profile-campus').text(profile.campus);
    $('#profile-bio').text(profile.bio);

    const $interests = $('#profile-interests');
    $interests.empty();
    (profile.interests || []).forEach((interest) => {
      $interests.append($('<span>', { class: 'tag', text: interest }));
    });
  }

  $(function () {
    const rawProfile = localStorage.getItem(storageKey);

    if (!rawProfile) {
      $('#profile-empty-state').removeClass('hidden');
      return;
    }

    const profile = JSON.parse(rawProfile);
    renderProfile(profile);
    $('#profile-content').removeClass('hidden');

    $('.toggle-button').each(function () {
      const targetSelector = $(this).data('target');
      const $target = $(targetSelector);
      $target.addClass('hidden-panel');
    });

    const $firstPanel = $($('.toggle-button').first().data('target'));
    $firstPanel.removeClass('hidden-panel');

    $('.toggle-button').on('click', function () {
      const targetSelector = $(this).data('target');
      $('.detail-section').addClass('hidden-panel');
      $(targetSelector).removeClass('hidden-panel');
    });
  });
})(jQuery);
