(function ($) {
  const postsKey = 'richfield-connect-posts';
  const profileKey = 'richfield-connect-profile';

  function readPosts() {
    const raw = localStorage.getItem(postsKey);
    return raw ? JSON.parse(raw) : [];
  }

  function savePosts(posts) {
    localStorage.setItem(postsKey, JSON.stringify(posts));
  }

  function timeLabel(isoDate) {
    return new Date(isoDate).toLocaleString();
  }

  function renderPosts() {
    const posts = readPosts();
    const $list = $('#post-list');
    const $empty = $('#feed-empty-state');

    $list.empty();

    if (!posts.length) {
      $empty.removeClass('hidden');
      return;
    }

    $empty.addClass('hidden');

    posts
      .slice()
      .reverse()
      .forEach((post) => {
        const $card = $('<article>', { class: 'card post-card' });
        $card.append(`
          <div class="post-header">
            <div>
              <strong>${post.author}</strong>
              <div class="post-meta">${timeLabel(post.createdAt)}</div>
            </div>
          </div>
          <p>${post.content}</p>
        `);

        const $actions = $('<div>', { class: 'post-actions' });
        const $likeButton = $('<button>', {
          class: 'text-button',
          type: 'button',
          text: `♥ Like (${post.likes || 0})`,
        });
        const $deleteButton = $('<button>', {
          class: 'text-button delete',
          type: 'button',
          text: 'Delete',
        });

        $likeButton.on('click', function () {
          const updatedPosts = readPosts().map((item) =>
            item.id === post.id ? { ...item, likes: (item.likes || 0) + 1 } : item
          );
          savePosts(updatedPosts);
          renderPosts();
        });

        $deleteButton.on('click', function () {
          const updatedPosts = readPosts().filter((item) => item.id !== post.id);
          savePosts(updatedPosts);
          renderPosts();
        });

        $actions.append($likeButton, $deleteButton);
        $card.append($actions);
        $list.append($card);
      });
  }

  $(function () {
    const profile = JSON.parse(localStorage.getItem(profileKey) || 'null');
    if (profile && profile.fullName) {
      $('#feed-user-message')
        .removeClass('hidden')
        .text(`Posting as ${profile.fullName}.`);
    }

    renderPosts();

    $('#post-form').on('submit', function (event) {
      event.preventDefault();
      const content = $('#postContent').val().trim();

      if (content.length < 5) {
        $('#post-error').text('Write at least 5 characters before posting.');
        return;
      }

      $('#post-error').text('');

      const posts = readPosts();
      posts.push({
        id: Date.now(),
        author: profile && profile.fullName ? profile.fullName : 'Richfield Student',
        content,
        likes: 0,
        createdAt: new Date().toISOString(),
      });

      savePosts(posts);
      $('#postContent').val('');
      renderPosts();
    });
  });
})(jQuery);
