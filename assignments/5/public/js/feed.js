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

    function renderPosts(posts) {
        feed.innerHTML = posts.map(post => {
            const initial = post.username.charAt(0).toUpperCase();
            const timeAgo = getTimeAgo(post.created_at);

            return `
                <article class="userPost">
                    <div class="postContent">
                        <div class="post-header">
                            <div class="post-author">
                                <div class="avatar">${initial}</div>
                                <div class="profileInfo">
                                    <span class="profileName">${post.username}</span>
                                    <span class="profileHandle">@${post.username.toLowerCase()}</span>
                                </div>
                            </div>
                            <span class="post-time">${timeAgo}</span>
                        </div>
                        <p>${post.content}</p>
                        <div class="actionButtons">
                            <button><span><i class="fa-regular fa-comment"></i></span> <span>0</span></button>
                            <button><span><i class="fa-solid fa-heart"></i></span> <span>${post.like_count || 0}</span></button>
                        </div>
                    </div>
                </article>
            `;
        }).join('');
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
});
