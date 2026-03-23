(function ($) {
  $(function () {
    const $navToggle = $('.nav-toggle');
    const $navLinks = $('.nav-links');

    $navToggle.on('click', function () {
      $navLinks.toggleClass('open');
    });

    $navLinks.find('a').on('click', function () {
      $navLinks.removeClass('open');
    });
  });
})(jQuery);
