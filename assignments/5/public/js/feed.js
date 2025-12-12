document.addEventListener('DOMContentLoaded', () => {
    const feed = document.querySelector('.userFeed');
    const tabs = document.querySelectorAll('.feed-tab');
    let currentTab = 'explore';

    // load explore on page load
    loadExplore();

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
