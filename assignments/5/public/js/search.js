document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const userMenu = document.getElementById('userMenu');
    const usernameSpan = document.getElementById('username');
    const logoutBtn = document.getElementById('logoutBtn');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const tabs = document.querySelectorAll('.search-tab');

    let currentTab = 'posts';
    let debounceTimer;

    // check auth state
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
        const userData = JSON.parse(user);
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

    // tab handlers
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentTab = tab.dataset.tab;

            const query = searchInput.value.trim();
            if (query) {
                search(query);
            }
        });
    });

    // search on input
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        const query = searchInput.value.trim();

        if (!query) {
            searchResults.innerHTML = '<p class="search-message">Enter a keyword to search</p>';
            return;
        }

        debounceTimer = setTimeout(() => {
            search(query);
        }, 300);
    });

    async function search(query) {
        searchResults.innerHTML = '<p class="search-message">Searching...</p>';

        try {
            if (currentTab === 'posts') {
                await searchPosts(query);
            } else {
                await searchUsers(query);
            }
        } catch (err) {
            searchResults.innerHTML = '<p class="search-message">Something went wrong</p>';
        }
    }

    async function searchPosts(query) {
        const res = await fetch(`/api/search/posts?q=${encodeURIComponent(query)}`);
        const posts = await res.json();

        if (!res.ok) {
            searchResults.innerHTML = '<p class="search-message">Search failed</p>';
            return;
        }

        if (posts.length === 0) {
            searchResults.innerHTML = '<p class="search-message">No posts found</p>';
            return;
        }

        searchResults.innerHTML = posts.map(post => {
            const initial = post.username.charAt(0).toUpperCase();
            const timeAgo = getTimeAgo(post.created_at);

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
                        <p>${highlightText(post.content, query)}</p>
                    </div>
                </article>
            `;
        }).join('');
    }

    async function searchUsers(query) {
        const res = await fetch(`/api/search/users?q=${encodeURIComponent(query)}`);
        const users = await res.json();

        if (!res.ok) {
            searchResults.innerHTML = '<p class="search-message">Search failed</p>';
            return;
        }

        if (users.length === 0) {
            searchResults.innerHTML = '<p class="search-message">No users found</p>';
            return;
        }

        searchResults.innerHTML = users.map(u => {
            const initial = u.username.charAt(0).toUpperCase();

            return `
                <div class="user-result">
                    <a href="/user/profile.html?id=${u.user_id}" class="user-result-left">
                        <div class="user-result-avatar">${initial}</div>
                        <div class="user-result-info">
                            <span class="user-result-name">${highlightText(u.username, query)}</span>
                            <span class="user-result-handle">@${u.username.toLowerCase()}</span>
                            ${u.bio ? `<span class="user-result-bio">${u.bio}</span>` : ''}
                        </div>
                    </a>
                </div>
            `;
        }).join('');
    }

    function highlightText(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
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
