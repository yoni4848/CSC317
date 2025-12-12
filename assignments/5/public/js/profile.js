document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const userMenu = document.getElementById('userMenu');
    const logoutBtn = document.getElementById('logoutBtn');
    const profileAvatar = document.getElementById('profileAvatar');
    const profileName = document.getElementById('profileName');
    const profileHandle = document.getElementById('profileHandle');
    const profileBio = document.getElementById('profileBio');
    const followingCount = document.getElementById('followingCount');
    const followersCount = document.getElementById('followersCount');
    const userPosts = document.getElementById('userPosts');

    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
        window.location.href = '../auth/login.html';
        return;
    }

    const userData = JSON.parse(user);

    // update header
    loginBtn.style.display = 'none';
    userMenu.style.display = 'flex';

    // logout
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '../index.html';
    });

    loadProfile(userData.user_id);

    async function loadProfile(userId) {
        try {
            // fetch user data
            const userRes = await fetch(`/api/users/${userId}`);
            const userInfo = await userRes.json();

            if (!userRes.ok) {
                profileName.textContent = 'User not found';
                return;
            }

            profileAvatar.textContent = userInfo.username.charAt(0).toUpperCase();
            profileName.textContent = userInfo.username;
            profileHandle.textContent = '@' + userInfo.username.toLowerCase();
            profileBio.textContent = userInfo.bio || '';

            // fetch followers and following counts
            const [followersRes, followingRes] = await Promise.all([
                fetch(`/api/users/${userId}/followers`),
                fetch(`/api/users/${userId}/following`)
            ]);

            const followers = await followersRes.json();
            const following = await followingRes.json();

            followersCount.textContent = followers.length || 0;
            followingCount.textContent = following.length || 0;

            // fetch user posts
            loadUserPosts(userId);

        } catch (err) {
            profileName.textContent = 'Error loading profile';
        }
    }

    async function loadUserPosts(userId) {
        try {
            const res = await fetch('/api/posts');
            const allPosts = await res.json();

            const posts = allPosts.filter(post => post.user_id === userId);

            if (posts.length === 0) {
                userPosts.innerHTML = '<p class="no-posts">No posts yet</p>';
                return;
            }

            userPosts.innerHTML = posts.map(post => {
                const initial = userData.username.charAt(0).toUpperCase();
                const timeAgo = getTimeAgo(post.created_at);

                return `
                    <article class="userPost">
                        <div class="postContent">
                            <div class="post-header">
                                <div class="post-author">
                                    <div class="avatar">${initial}</div>
                                    <div class="profileInfo">
                                        <span class="profileName">${userData.username}</span>
                                        <span class="profileHandle">@${userData.username.toLowerCase()}</span>
                                    </div>
                                </div>
                                <span class="post-time">${timeAgo}</span>
                            </div>
                            <p>${post.content}</p>
                            <div class="actionButtons">
                                <button><span><i class="fa-regular fa-comment"></i></span> <span>0</span></button>
                                <button><span><i class="fa-solid fa-heart"></i></span> <span>0</span></button>
                            </div>
                        </div>
                    </article>
                `;
            }).join('');

        } catch (err) {
            userPosts.innerHTML = '<p class="no-posts">Error loading posts</p>';
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
});
