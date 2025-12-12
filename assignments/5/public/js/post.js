document.addEventListener('DOMContentLoaded', () => {
    const postContainer = document.getElementById('postContainer');
    const loginBtn = document.getElementById('loginBtn');
    const userMenu = document.getElementById('userMenu');
    const usernameSpan = document.getElementById('username');
    const logoutBtn = document.getElementById('logoutBtn');

    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const userData = user ? JSON.parse(user) : null;

    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (!postId) {
        postContainer.innerHTML = '<p class="feed-message">Post not found</p>';
        return;
    }

    // update header
    if (token && userData) {
        loginBtn.style.display = 'none';
        userMenu.style.display = 'flex';
        usernameSpan.textContent = '@' + userData.username;
        loadNotificationBadge();
    }

    // logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        });
    }

    loadPost();

    async function loadPost() {
        try {
            const res = await fetch(`/api/posts/${postId}`);
            const post = await res.json();

            if (!res.ok) {
                postContainer.innerHTML = '<p class="feed-message">Post not found</p>';
                return;
            }

            const [likesRes, commentsRes] = await Promise.all([
                fetch(`/api/posts/${postId}/likes`),
                fetch(`/api/posts/${postId}/comments`)
            ]);
            const likes = await likesRes.json();
            const comments = await commentsRes.json();

            const likeCount = likes.length;
            const commentCount = comments.length;
            const isLiked = userData && likes.some(l => l.user_id === userData.user_id);

            const initial = post.username.charAt(0).toUpperCase();
            const timeAgo = getTimeAgo(post.created_at);
            const heartClass = isLiked ? 'fa-solid' : 'fa-regular';
            const likedClass = isLiked ? 'liked' : '';

            postContainer.innerHTML = `
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
                        <div class="comments-section" data-postid="${post.post_id}" style="display: block;">
                            <div class="comments-list"></div>
                            <div class="comment-input">
                                <input type="text" placeholder="Write a comment..." class="comment-text">
                                <button class="comment-submit"><i class="fa-solid fa-paper-plane"></i></button>
                            </div>
                        </div>
                    </div>
                </article>
            `;

            document.querySelector('.like-btn').addEventListener('click', handleLike);
            document.querySelector('.comment-submit').addEventListener('click', submitComment);

            loadComments();

        } catch (err) {
            postContainer.innerHTML = '<p class="feed-message">Something went wrong</p>';
        }
    }

    async function loadComments() {
        const list = document.querySelector('.comments-list');

        try {
            const res = await fetch(`/api/posts/${postId}/comments`);
            const comments = await res.json();

            if (comments.length === 0) {
                list.innerHTML = '<p class="no-comments">No comments yet</p>';
                return;
            }

            list.innerHTML = comments.map(comment => {
                const initial = comment.username.charAt(0).toUpperCase();
                const timeAgo = getTimeAgo(comment.created_at);

                return `
                    <div class="comment">
                        <a href="/user/profile.html?id=${comment.user_id}" class="comment-author">
                            <div class="comment-avatar">${initial}</div>
                        </a>
                        <div class="comment-body">
                            <div class="comment-header">
                                <a href="/user/profile.html?id=${comment.user_id}" class="comment-username">${comment.username}</a>
                                <span class="comment-time">${timeAgo}</span>
                            </div>
                            <p class="comment-content">${comment.content}</p>
                        </div>
                    </div>
                `;
            }).join('');

        } catch (err) {
            list.innerHTML = '<p class="no-comments">Failed to load comments</p>';
        }
    }

    async function handleLike(e) {
        if (!token) {
            window.location.href = 'auth/login.html';
            return;
        }

        const btn = e.currentTarget;
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

    async function submitComment(e) {
        if (!token) {
            window.location.href = 'auth/login.html';
            return;
        }

        const input = document.querySelector('.comment-text');
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
            await loadComments();

            const countSpan = document.querySelector('.comment-count');
            countSpan.textContent = parseInt(countSpan.textContent) + 1;

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
