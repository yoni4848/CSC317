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
    const editProfileBtn = document.getElementById('editProfileBtn');
    const editProfileForm = document.getElementById('editProfileForm');
    const bioInput = document.getElementById('bioInput');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const saveEditBtn = document.getElementById('saveEditBtn');

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
        loadNotificationBadge();
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

    // add button - go to home and compose
    const addBtn = document.querySelector('.add-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            window.location.href = '../index.html?compose=1';
        });
    }

    // close users list
    closeListBtn.addEventListener('click', () => {
        usersList.style.display = 'none';
    });

    // edit profile
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            editProfileBtn.style.display = 'none';
            editProfileForm.style.display = 'block';
            bioInput.value = profileBio.textContent || '';
            bioInput.focus();
        });
    }

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
            editProfileForm.style.display = 'none';
            editProfileBtn.style.display = 'block';
        });
    }

    if (saveEditBtn) {
        saveEditBtn.addEventListener('click', async () => {
            const bio = bioInput.value.trim();

            try {
                const res = await fetch(`/api/users/${userData.user_id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ bio })
                });

                if (!res.ok) {
                    alert('Failed to update profile');
                    return;
                }

                profileBio.textContent = bio;
                editProfileForm.style.display = 'none';
                editProfileBtn.style.display = 'block';
            } catch (err) {
                alert('Something went wrong');
            }
        });
    }

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

            // show edit button on own profile
            if (isOwnProfile && token) {
                editProfileBtn.style.display = 'block';
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

            // get like counts, comment counts, and check if user liked
            let likedPostIds = [];
            const postData = {};

            for (const post of posts) {
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

                if (token && userData && likes.some(l => l.user_id === userData.user_id)) {
                    likedPostIds.push(post.post_id);
                }
            }

            userPosts.innerHTML = posts.map(post => {
                const timeAgo = getTimeAgo(post.created_at);
                const isLiked = likedPostIds.includes(post.post_id);
                const heartClass = isLiked ? 'fa-solid' : 'fa-regular';
                const likedClass = isLiked ? 'liked' : '';
                const likeCount = postData[post.post_id]?.likeCount || 0;
                const commentCount = postData[post.post_id]?.commentCount || 0;
                const deleteBtn = isOwnProfile && token ? `<button class="delete-btn" data-postid="${post.post_id}"><i class="fa-regular fa-trash-can"></i></button>` : '';

                return `
                    <article class="userPost" data-postid="${post.post_id}">
                        <div class="postContent">
                            <div class="post-header">
                                <div class="post-author">
                                    <div class="avatar">${initial}</div>
                                    <div class="profileInfo">
                                        <span class="profileName">${username}</span>
                                        <span class="profileHandle">@${username.toLowerCase()}</span>
                                    </div>
                                </div>
                                <div class="post-header-right">
                                    <span class="post-time">${timeAgo}</span>
                                    ${deleteBtn}
                                </div>
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

            // add delete button handlers
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', handleDeletePost);
            });

        } catch (err) {
            userPosts.innerHTML = '<p class="no-posts">Error loading posts</p>';
        }
    }

    async function handleDeletePost(e) {
        const btn = e.currentTarget;
        const postId = btn.dataset.postid;

        if (!confirm('Are you sure you want to delete this post?')) return;

        try {
            const res = await fetch(`/api/posts/${postId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                alert('Failed to delete post');
                return;
            }

            const postEl = document.querySelector(`.userPost[data-postid="${postId}"]`);
            if (postEl) postEl.remove();
        } catch (err) {
            alert('Something went wrong');
        }
    }

    async function handleDeleteComment(e, postId) {
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

    async function handleLike(e) {
        if (!token) {
            window.location.href = '../auth/login.html';
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

            list.innerHTML = comments.map(comment => {
                const initial = comment.username.charAt(0).toUpperCase();
                const timeAgo = getTimeAgo(comment.created_at);
                const isOwnComment = userData && comment.user_id === userData.user_id;
                const deleteBtn = isOwnComment ? `<button class="delete-comment-btn" data-commentid="${comment.comment_id}"><i class="fa-regular fa-trash-can"></i></button>` : '';

                return `
                    <div class="comment" data-commentid="${comment.comment_id}">
                        <a href="profile.html?id=${comment.user_id}" class="comment-author">
                            <div class="comment-avatar">${initial}</div>
                        </a>
                        <div class="comment-body">
                            <div class="comment-header">
                                <a href="profile.html?id=${comment.user_id}" class="comment-username">${comment.username}</a>
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
        if (!token) {
            window.location.href = '../auth/login.html';
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
