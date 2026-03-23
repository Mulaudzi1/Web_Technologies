(function ($) {
  const postsKey = 'richfield-connect-posts';
  const profileKey = 'richfield-connect-profile';
  const reactionOptions = ['🔥', '👏', '🎉', '💡', '🤝'];

  function readPosts() {
    const raw = localStorage.getItem(postsKey);
    return raw ? JSON.parse(raw) : [];
  }

  function savePosts(posts) {
    localStorage.setItem(postsKey, JSON.stringify(posts));
  }

  function getCurrentAuthor() {
    const profile = JSON.parse(localStorage.getItem(profileKey) || 'null');
    return profile && profile.fullName ? profile.fullName : 'Richfield Student';
  }

  function timeLabel(isoDate) {
    return new Date(isoDate).toLocaleString();
  }

  function createReactionSummary(reactions) {
    const entries = Object.entries(reactions || {}).filter((entry) => entry[1] > 0);

    if (!entries.length) {
      return 'No reactions yet';
    }

    return entries
      .map((entry) => `${entry[0]} ${entry[1]}`)
      .join(' • ');
  }

  function updateHeroStats(posts) {
    const totals = posts.reduce(
      (accumulator, post) => {
        accumulator.comments += (post.comments || []).length;
        accumulator.reactions += Object.values(post.reactions || {}).reduce(
          (sum, count) => sum + count,
          0
        );
        return accumulator;
      },
      { comments: 0, reactions: 0 }
    );

    $('#hero-post-count').text(posts.length);
    $('#hero-comment-count').text(totals.comments);
    $('#hero-reaction-count').text(totals.reactions);
  }

  function renderCommentList($container, comments) {
    $container.empty();

    if (!comments.length) {
      $container.append(
        $('<p>', {
          class: 'comment-empty-state',
          text: 'No comments yet. Be the first student to join the conversation.',
        })
      );
      return;
    }

    comments.forEach((comment) => {
      const $item = $('<div>', { class: 'comment-item' });
      const $meta = $('<div>', { class: 'comment-meta' });

      $meta.append(
        $('<strong>', { text: comment.author }),
        $('<span>', { text: timeLabel(comment.createdAt) })
      );

      $item.append($meta, $('<p>', { text: comment.content }));
      $container.append($item);
    });
  }

  function renderPosts() {
    const posts = readPosts();
    const $list = $('#post-list');
    const $empty = $('#feed-empty-state');

    $list.empty();
    updateHeroStats(posts);

    if (!posts.length) {
      $empty.removeClass('hidden');
      return;
    }

    $empty.addClass('hidden');

    posts
      .slice()
      .reverse()
      .forEach((post) => {
        const comments = post.comments || [];
        const reactions = post.reactions || {};
        const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);

        const $card = $('<article>', { class: 'card post-card' });
        const $header = $('<div>', { class: 'post-header' });
        const $authorGroup = $('<div>');
        const $badge = $('<span>', { class: 'tag muted post-engagement-tag' }).text(
          `${comments.length} comment${comments.length === 1 ? '' : 's'} • ${totalReactions} reaction${totalReactions === 1 ? '' : 's'}`
        );

        $authorGroup.append(
          $('<strong>', { text: post.author }),
          $('<div>', { class: 'post-meta', text: timeLabel(post.createdAt) })
        );
        $header.append($authorGroup, $badge);

        const $body = $('<div>', { class: 'post-body' }).append($('<p>', { text: post.content }));

        const $actions = $('<div>', { class: 'post-actions' });
        const $likeButton = $('<button>', {
          class: 'action-chip',
          type: 'button',
          text: `♥ Like ${post.likes || 0}`,
        });
        const $deleteButton = $('<button>', {
          class: 'action-chip delete',
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

        const $reactionPanel = $('<div>', { class: 'reaction-panel' });
        const $reactionTitle = $('<div>', { class: 'reaction-title' }).text('Quick emoji reactions');
        const $reactionButtons = $('<div>', { class: 'reaction-buttons' });
        const $reactionSummary = $('<p>', {
          class: 'reaction-summary',
          text: createReactionSummary(reactions),
        });

        reactionOptions.forEach((emoji) => {
          const count = reactions[emoji] || 0;
          const $button = $('<button>', {
            class: 'reaction-button',
            type: 'button',
            html: `<span>${emoji}</span><strong>${count}</strong>`,
            'aria-label': `React with ${emoji}`,
          });

          $button.on('click', function () {
            const updatedPosts = readPosts().map((item) => {
              if (item.id !== post.id) {
                return item;
              }

              return {
                ...item,
                reactions: {
                  ...(item.reactions || {}),
                  [emoji]: ((item.reactions || {})[emoji] || 0) + 1,
                },
              };
            });

            savePosts(updatedPosts);
            renderPosts();
          });

          $reactionButtons.append($button);
        });

        $reactionPanel.append($reactionTitle, $reactionButtons, $reactionSummary);

        const $commentSection = $('<section>', { class: 'comment-section' });
        const $commentHeader = $('<div>', { class: 'comment-header' }).append(
          $('<h3>', { text: 'Comments' }),
          $('<span>', { class: 'tag muted', text: `${comments.length} total` })
        );
        const $commentList = $('<div>', { class: 'comment-list' });
        const $commentForm = $('<form>', { class: 'comment-form', novalidate: true });
        const $commentInput = $('<textarea>', {
          rows: 3,
          placeholder: 'Write a helpful comment, answer, or suggestion…',
        });
        const $commentError = $('<small>', { class: 'error-message' });
        const $commentButton = $('<button>', {
          class: 'button secondary-button',
          type: 'submit',
          text: 'Add Comment',
        });

        renderCommentList($commentList, comments);

        $commentForm.append(
          $('<label>', { class: 'sr-only', text: 'Add a comment' }),
          $commentInput,
          $('<small>', { class: 'helper-text', text: 'Keep it kind, clear, and useful for classmates.' }),
          $commentError,
          $commentButton
        );

        $commentForm.on('submit', function (event) {
          event.preventDefault();
          const content = $commentInput.val().trim();

          if (content.length < 2) {
            $commentError.text('Please write at least 2 characters before commenting.');
            return;
          }

          $commentError.text('');

          const updatedPosts = readPosts().map((item) => {
            if (item.id !== post.id) {
              return item;
            }

            return {
              ...item,
              comments: [
                ...(item.comments || []),
                {
                  id: Date.now(),
                  author: getCurrentAuthor(),
                  content,
                  createdAt: new Date().toISOString(),
                },
              ],
            };
          });

          savePosts(updatedPosts);
          renderPosts();
        });

        $commentSection.append($commentHeader, $commentList, $commentForm);
        $card.append($header, $body, $actions, $reactionPanel, $commentSection);
        $list.append($card);
      });
  }

  $(function () {
    const profile = JSON.parse(localStorage.getItem(profileKey) || 'null');
    if (profile && profile.fullName) {
      $('#feed-user-message')
        .removeClass('hidden')
        .text(`Posting and commenting as ${profile.fullName}.`);
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
        author: getCurrentAuthor(),
        content,
        likes: 0,
        reactions: {},
        comments: [],
        createdAt: new Date().toISOString(),
      });

      savePosts(posts);
      $('#postContent').val('');
      renderPosts();
    });
  });
})(jQuery);
