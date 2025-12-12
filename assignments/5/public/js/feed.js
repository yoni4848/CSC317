document.addEventListener('DOMContentLoaded', () => {
    const feed = document.querySelector('.userFeed');
    const tabs = document.querySelectorAll('.feed-tab');
    const textarea = document.querySelector('.postCreation textarea');
    const shareBtn = document.querySelector('.compose-meta button');
    const charCount = document.querySelector('.char-count');
    const loginBtn = document.getElementById('loginBtn');
    const userMenu = document.getElementById('userMenu');
    const usernameSpan = document.getElementById('username');
    const logoutBtn = document.getElementById('logoutBtn');
    let currentTab = 'explore';

    // check auth state
    checkAuth();
    loadNotificationBadge();

    function checkAuth() {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (token && user) {
            const userData = JSON.parse(user);
            loginBtn.style.display = 'none';
            userMenu.style.display = 'flex';
            usernameSpan.textContent = '@' + userData.username;
        } else {
            loginBtn.style.display = 'block';
            userMenu.style.display = 'none';
        }
    }

    // logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.reload();
        });
    }

    // add button - scroll to top and focus textarea
    const addBtn = document.querySelector('.add-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => {
                if (textarea) textarea.focus();
            }, 300);
        });
    }

    // check if coming from compose link
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('compose') === '1' && textarea) {
        textarea.focus();
        history.replaceState({}, '', '/');
    }

    // load explore on page load
    loadExplore();

    // character count
    if (textarea && charCount) {
        textarea.addEventListener('input', () => {
            const remaining = 280 - textarea.value.length;
            charCount.textContent = remaining;
            charCount.style.color = remaining < 0 ? '#ff3b30' : remaining < 20 ? '#ff9500' : '#999';
        });
    }

    // emoji picker
    const emojiBtn = document.querySelector('.emoji-btn');
    const emojiPicker = document.querySelector('.emoji-picker');
    const emojis = ['😀', '😂', '😍', '🥰', '😎', '🤔', '😢', '😡', '👍', '👎', '❤️', '🔥', '✨', '🎉', '💯', '🙏', '👀', '🤣', '😊', '🥺', '😭', '😤', '🤯', '💀'];

    if (emojiBtn && emojiPicker) {
        emojiPicker.innerHTML = emojis.map(e => `<span>${e}</span>`).join('');

        emojiBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'grid' : 'none';
        });

        emojiPicker.addEventListener('click', (e) => {
            if (e.target.tagName === 'SPAN') {
                textarea.value += e.target.textContent;
                textarea.focus();
                const remaining = 280 - textarea.value.length;
                charCount.textContent = remaining;
                charCount.style.color = remaining < 0 ? '#ff3b30' : remaining < 20 ? '#ff9500' : '#999';
            }
        });

        document.addEventListener('click', () => {
            emojiPicker.style.display = 'none';
        });
    }

    // share button
    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                window.location.href = '/auth/login.html';
                return;
            }

            const content = textarea.value.trim();
            if (!content) return;
            if (content.length > 280) return;

            try {
                const res = await fetch('/api/posts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ content })
                });

                if (!res.ok) {
                    const data = await res.json();
                    alert(data.error || 'Failed to post');
                    return;
                }

                textarea.value = '';
                charCount.textContent = '280';
                charCount.style.color = '#999';
                loadExplore();

            } catch (err) {
                alert('Something went wrong');
            }
        });
    }

    // tab click handlers
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;

            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentTab = tabName;

            if (tabName === 'explore') {
                loadExplore();
            } else {
                loadFeed();
            }
        });
    });

    async function loadExplore() {
        try {
            const res = await fetch('/api/explore');
            const posts = await res.json();

            if (!res.ok) {
                feed.innerHTML = '<p class="feed-message">Failed to load posts</p>';
                return;
            }

            if (posts.length === 0) {
                feed.innerHTML = '<p class="feed-message">No posts yet</p>';
                return;
            }

            renderPosts(posts);

        } catch (err) {
            feed.innerHTML = '<p class="feed-message">Something went wrong</p>';
        }
    }

    async function loadFeed() {
        const token = localStorage.getItem('token');

        if (!token) {
            feed.innerHTML = '<p class="feed-message">Please <a href="/auth/login.html">login</a> to see your feed</p>';
            return;
        }

        try {
            const res = await fetch('/api/timeline', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const posts = await res.json();

            if (!res.ok) {
                feed.innerHTML = '<p class="feed-message">Failed to load feed</p>';
                return;
            }

            if (posts.length === 0) {
                feed.innerHTML = '<p class="feed-message">Your feed is empty. Follow some users to see their posts!</p>';
                return;
            }

            renderPosts(posts);

        } catch (err) {
            feed.innerHTML = '<p class="feed-message">Something went wrong</p>';
        }
    }

    async function renderPosts(posts) {
        const token = localStorage.getItem('token');
        const user = token ? JSON.parse(localStorage.getItem('user')) : null;
        let likedPostIds = [];
        const postData = {};

        // get like counts, comment counts, and check if user liked
        for (const post of posts) {
            try {
                const [likesRes, commentsRes] = await Promise.all([
                    fetch(`/api/posts/${post.post_id}/likes`),
                    fetch(`/api/posts/${post.post_id}/comments`)
                ]);
                const likes = await likesRes.json();
                const comments = await commentsRes.json();

                postData[post.post_id] = {
                    likeCount: likes.length,
                    commentCount: comments.length
                };

                if (user && likes.some(l => l.user_id === user.user_id)) {
                    likedPostIds.push(post.post_id);
                }
            } catch (err) {
                console.error(err);
            }
        }

        feed.innerHTML = posts.map(post => {
            const initial = post.username.charAt(0).toUpperCase();
            const timeAgo = getTimeAgo(post.created_at);
            const isLiked = likedPostIds.includes(post.post_id);
            const heartClass = isLiked ? 'fa-solid' : 'fa-regular';
            const likedClass = isLiked ? 'liked' : '';
            const likeCount = postData[post.post_id]?.likeCount || 0;
            const commentCount = postData[post.post_id]?.commentCount || 0;

            return `
                <article class="userPost">
                    <div class="postContent">
                        <div class="post-header">
                            <a href="/user/profile.html?id=${post.user_id}" class="post-author">
                                <div class="avatar">${initial}</div>
                                <div class="profileInfo">
                                    <span class="profileName">${post.username}</span>
                                    <span class="profileHandle">@${post.username.toLowerCase()}</span>
                                </div>
                            </a>
                            <span class="post-time">${timeAgo}</span>
                        </div>
                        <p>${post.content}</p>
                        <div class="actionButtons">
                            <button class="comment-btn" data-postid="${post.post_id}"><span><i class="fa-regular fa-comment"></i></span> <span class="comment-count">${commentCount}</span></button>
                            <button class="like-btn ${likedClass}" data-postid="${post.post_id}"><span><i class="${heartClass} fa-heart"></i></span> <span class="like-count">${likeCount}</span></button>
                        </div>
                        <div class="comments-section" data-postid="${post.post_id}" style="display: none;">
                            <div class="comments-list"></div>
                            <div class="comment-input">
                                <input type="text" placeholder="Write a comment..." class="comment-text">
                                <button class="comment-submit"><i class="fa-solid fa-paper-plane"></i></button>
                            </div>
                        </div>
                    </div>
                </article>
            `;
        }).join('');

        // add like button handlers
        document.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', handleLike);
        });

        // add comment button handlers
        document.querySelectorAll('.comment-btn').forEach(btn => {
            btn.addEventListener('click', toggleComments);
        });

        // add comment submit handlers
        document.querySelectorAll('.comment-submit').forEach(btn => {
            btn.addEventListener('click', submitComment);
        });

        // load comment counts
        loadCommentCounts(posts);
    }

    async function loadCommentCounts(posts) {
        for (const post of posts) {
            try {
                const res = await fetch(`/api/posts/${post.post_id}/comments`);
                const comments = await res.json();
                const btn = document.querySelector(`.comment-btn[data-postid="${post.post_id}"]`);
                if (btn) {
                    btn.querySelector('.comment-count').textContent = comments.length;
                }
            } catch (err) {
                console.error(err);
            }
        }
    }

    async function toggleComments(e) {
        const btn = e.currentTarget;
        const postId = btn.dataset.postid;
        const section = document.querySelector(`.comments-section[data-postid="${postId}"]`);

        if (section.style.display === 'none') {
            section.style.display = 'block';
            await loadComments(postId);
        } else {
            section.style.display = 'none';
        }
    }

    async function loadComments(postId) {
        const section = document.querySelector(`.comments-section[data-postid="${postId}"]`);
        const list = section.querySelector('.comments-list');

        try {
            const res = await fetch(`/api/posts/${postId}/comments`);
            const comments = await res.json();

            if (comments.length === 0) {
                list.innerHTML = '<p class="no-comments">No comments yet</p>';
                return;
            }

            const user = token ? JSON.parse(localStorage.getItem('user')) : null;

            list.innerHTML = comments.map(comment => {
                const initial = comment.username.charAt(0).toUpperCase();
                const timeAgo = getTimeAgo(comment.created_at);
                const isOwnComment = user && comment.user_id === user.user_id;
                const deleteBtn = isOwnComment ? `<button class="delete-comment-btn" data-commentid="${comment.comment_id}"><i class="fa-regular fa-trash-can"></i></button>` : '';

                return `
                    <div class="comment" data-commentid="${comment.comment_id}">
                        <a href="/user/profile.html?id=${comment.user_id}" class="comment-author">
                            <div class="comment-avatar">${initial}</div>
                        </a>
                        <div class="comment-body">
                            <div class="comment-header">
                                <a href="/user/profile.html?id=${comment.user_id}" class="comment-username">${comment.username}</a>
                                <span class="comment-time">${timeAgo}</span>
                                ${deleteBtn}
                            </div>
                            <p class="comment-content">${comment.content}</p>
                        </div>
                    </div>
                `;
            }).join('');

            // add delete comment handlers
            list.querySelectorAll('.delete-comment-btn').forEach(btn => {
                btn.addEventListener('click', (e) => handleDeleteComment(e, postId));
            });

        } catch (err) {
            list.innerHTML = '<p class="no-comments">Failed to load comments</p>';
        }
    }

    async function submitComment(e) {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/auth/login.html';
            return;
        }

        const btn = e.currentTarget;
        const section = btn.closest('.comments-section');
        const postId = section.dataset.postid;
        const input = section.querySelector('.comment-text');
        const content = input.value.trim();

        if (!content) return;

        try {
            const res = await fetch(`/api/posts/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content })
            });

            if (!res.ok) {
                const data = await res.json();
                alert(data.error || 'Failed to post comment');
                return;
            }

            input.value = '';
            await loadComments(postId);

            // update count
            const commentBtn = document.querySelector(`.comment-btn[data-postid="${postId}"]`);
            const countSpan = commentBtn.querySelector('.comment-count');
            countSpan.textContent = parseInt(countSpan.textContent) + 1;

        } catch (err) {
            alert('Something went wrong');
        }
    }

    async function handleLike(e) {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/auth/login.html';
            return;
        }

        const btn = e.currentTarget;
        const postId = btn.dataset.postid;
        const isLiked = btn.classList.contains('liked');
        const icon = btn.querySelector('i');
        const countSpan = btn.querySelector('.like-count');
        let count = parseInt(countSpan.textContent);

        try {
            if (isLiked) {
                await fetch(`/api/posts/${postId}/like`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                btn.classList.remove('liked');
                icon.classList.remove('fa-solid');
                icon.classList.add('fa-regular');
                countSpan.textContent = count - 1;
            } else {
                await fetch(`/api/posts/${postId}/like`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                btn.classList.add('liked');
                icon.classList.remove('fa-regular');
                icon.classList.add('fa-solid');
                countSpan.textContent = count + 1;
            }
        } catch (err) {
            console.error(err);
        }
    }

    async function handleDeleteComment(e, postId) {
        const token = localStorage.getItem('token');
        const btn = e.currentTarget;
        const commentId = btn.dataset.commentid;

        if (!confirm('Delete this comment?')) return;

        try {
            const res = await fetch(`/api/comments/${commentId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                alert('Failed to delete comment');
                return;
            }

            const commentEl = document.querySelector(`.comment[data-commentid="${commentId}"]`);
            if (commentEl) commentEl.remove();

            // update count
            const commentBtn = document.querySelector(`.comment-btn[data-postid="${postId}"]`);
            if (commentBtn) {
                const countSpan = commentBtn.querySelector('.comment-count');
                countSpan.textContent = Math.max(0, parseInt(countSpan.textContent) - 1);
            }
        } catch (err) {
            alert('Something went wrong');
        }
    }

    function getTimeAgo(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'now';
        if (seconds < 3600) return Math.floor(seconds / 60) + 'm';
        if (seconds < 86400) return Math.floor(seconds / 3600) + 'h';
        if (seconds < 604800) return Math.floor(seconds / 86400) + 'd';

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    async function loadNotificationBadge() {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch('/api/notifications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const notifications = await res.json();
            const unread = notifications.filter(n => !n.is_read).length;
            const badge = document.getElementById('notificationBadge');

            if (badge && unread > 0) {
                badge.textContent = unread > 99 ? '99+' : unread;
                badge.style.display = 'flex';
            }
        } catch (err) {
            console.error(err);
        }
    }
});
