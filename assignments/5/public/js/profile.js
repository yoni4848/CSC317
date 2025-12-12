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
    const followingBtn = document.getElementById('followingBtn');
    const followersBtn = document.getElementById('followersBtn');
    const followBtn = document.getElementById('followBtn');
    const usersList = document.getElementById('usersList');
    const usersListTitle = document.getElementById('usersListTitle');
    const usersListContent = document.getElementById('usersListContent');
    const closeListBtn = document.getElementById('closeListBtn');
    const userPosts = document.getElementById('userPosts');

    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const userData = user ? JSON.parse(user) : null;

    // get user id from URL or use logged in user
    const urlParams = new URLSearchParams(window.location.search);
    const profileUserId = urlParams.get('id') || (userData ? userData.user_id : null);
    const isOwnProfile = userData && profileUserId == userData.user_id;

    let isFollowing = false;
    let followersData = [];
    let followingData = [];

    if (!profileUserId) {
        window.location.href = '../auth/login.html';
        return;
    }

    // update header based on auth
    if (token && userData) {
        loginBtn.style.display = 'none';
        userMenu.style.display = 'flex';
    } else {
        loginBtn.style.display = 'block';
        userMenu.style.display = 'none';
    }

    // logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '../index.html';
        });
    }

    // close users list
    closeListBtn.addEventListener('click', () => {
        usersList.style.display = 'none';
    });

    // show following list
    followingBtn.addEventListener('click', () => {
        showUsersList('Following', followingData);
    });

    // show followers list
    followersBtn.addEventListener('click', () => {
        showUsersList('Followers', followersData);
    });

    // follow/unfollow button
    followBtn.addEventListener('click', async () => {
        if (!token) {
            window.location.href = '../auth/login.html';
            return;
        }

        try {
            if (isFollowing) {
                await fetch(`/api/users/${profileUserId}/follow`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                isFollowing = false;
                followBtn.textContent = 'Follow';
                followBtn.classList.remove('following');
            } else {
                await fetch(`/api/users/${profileUserId}/follow`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                isFollowing = true;
                followBtn.textContent = 'Following';
                followBtn.classList.add('following');
            }
            // refresh counts
            loadFollowData(profileUserId);
        } catch (err) {
            console.error(err);
        }
    });

    loadProfile(profileUserId);

    async function loadProfile(userId) {
        try {
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

            await loadFollowData(userId);

            // show follow button if viewing other user's profile
            if (!isOwnProfile && token) {
                followBtn.style.display = 'block';
                // check if already following
                const amFollowing = followersData.some(f => f.user_id == userData.user_id);
                if (amFollowing) {
                    isFollowing = true;
                    followBtn.textContent = 'Following';
                    followBtn.classList.add('following');
                }
            }

            loadUserPosts(userId, userInfo.username);

        } catch (err) {
            profileName.textContent = 'Error loading profile';
        }
    }

    async function loadFollowData(userId) {
        const [followersRes, followingRes] = await Promise.all([
            fetch(`/api/users/${userId}/followers`),
            fetch(`/api/users/${userId}/following`)
        ]);

        followersData = await followersRes.json();
        followingData = await followingRes.json();

        followersCount.textContent = followersData.length || 0;
        followingCount.textContent = followingData.length || 0;
    }

    function showUsersList(title, users) {
        usersListTitle.textContent = title;
        usersList.style.display = 'block';

        if (users.length === 0) {
            usersListContent.innerHTML = `<p class="empty-list">No ${title.toLowerCase()} yet</p>`;
            return;
        }

        usersListContent.innerHTML = users.map(u => {
            const initial = u.username.charAt(0).toUpperCase();
            const isSelf = userData && u.user_id == userData.user_id;

            // check if logged in user follows this person
            let btnHtml = '';
            if (token && !isSelf) {
                btnHtml = `<button class="user-item-btn follow" data-userid="${u.user_id}">Follow</button>`;
            }

            return `
                <div class="user-item">
                    <a href="profile.html?id=${u.user_id}" class="user-item-left">
                        <div class="user-item-avatar">${initial}</div>
                        <div class="user-item-info">
                            <span class="user-item-name">${u.username}</span>
                            <span class="user-item-handle">@${u.username.toLowerCase()}</span>
                        </div>
                    </a>
                    ${btnHtml}
                </div>
            `;
        }).join('');

        // check follow status for each user in list
        if (token && userData) {
            checkFollowStatus();
        }
    }

    async function checkFollowStatus() {
        try {
            const res = await fetch(`/api/users/${userData.user_id}/following`);
            const myFollowing = await res.json();
            const followingIds = myFollowing.map(f => f.user_id);

            document.querySelectorAll('.user-item-btn').forEach(btn => {
                const userId = parseInt(btn.dataset.userid);
                if (followingIds.includes(userId)) {
                    btn.textContent = 'Following';
                    btn.classList.remove('follow');
                    btn.classList.add('following');
                }
            });

            // add click handlers
            document.querySelectorAll('.user-item-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    const userId = btn.dataset.userid;
                    const isCurrentlyFollowing = btn.classList.contains('following');

                    try {
                        if (isCurrentlyFollowing) {
                            await fetch(`/api/users/${userId}/follow`, {
                                method: 'DELETE',
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            btn.textContent = 'Follow';
                            btn.classList.remove('following');
                            btn.classList.add('follow');
                        } else {
                            await fetch(`/api/users/${userId}/follow`, {
                                method: 'POST',
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            btn.textContent = 'Following';
                            btn.classList.remove('follow');
                            btn.classList.add('following');
                        }
                    } catch (err) {
                        console.error(err);
                    }
                });
            });
        } catch (err) {
            console.error(err);
        }
    }

    async function loadUserPosts(userId, username) {
        try {
            const res = await fetch('/api/posts');
            const allPosts = await res.json();

            const posts = allPosts.filter(post => post.user_id == userId);

            if (posts.length === 0) {
                userPosts.innerHTML = '<p class="no-posts">No posts yet</p>';
                return;
            }

            const initial = username.charAt(0).toUpperCase();

            userPosts.innerHTML = posts.map(post => {
                const timeAgo = getTimeAgo(post.created_at);

                return `
                    <article class="userPost">
                        <div class="postContent">
                            <div class="post-header">
                                <div class="post-author">
                                    <div class="avatar">${initial}</div>
                                    <div class="profileInfo">
                                        <span class="profileName">${username}</span>
                                        <span class="profileHandle">@${username.toLowerCase()}</span>
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
