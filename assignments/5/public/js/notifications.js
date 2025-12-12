document.addEventListener('DOMContentLoaded', () => {
    const notificationsList = document.getElementById('notificationsList');
    const loginBtn = document.getElementById('loginBtn');
    const userMenu = document.getElementById('userMenu');
    const usernameSpan = document.getElementById('username');
    const logoutBtn = document.getElementById('logoutBtn');

    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token) {
        window.location.href = 'auth/login.html';
        return;
    }

    // update header
    if (user) {
        const userData = JSON.parse(user);
        loginBtn.style.display = 'none';
        userMenu.style.display = 'flex';
        usernameSpan.textContent = '@' + userData.username;
    }

    // logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        });
    }

    // add button - go to home and compose
    const addBtn = document.querySelector('.add-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            window.location.href = 'index.html?compose=1';
        });
    }

    loadNotifications();
    markAllAsRead();

    async function markAllAsRead() {
        try {
            await fetch('/api/notifications/read', {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const badge = document.getElementById('notificationBadge');
            if (badge) badge.style.display = 'none';
        } catch (err) {
            console.error(err);
        }
    }

    async function loadNotifications() {
        try {
            const res = await fetch('/api/notifications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const notifications = await res.json();

            if (!res.ok) {
                notificationsList.innerHTML = '<p class="notifications-message">Failed to load notifications</p>';
                return;
            }

            if (notifications.length === 0) {
                notificationsList.innerHTML = '<p class="notifications-message">No notifications yet</p>';
                return;
            }

            notificationsList.innerHTML = notifications.map(n => {
                const initial = n.username.charAt(0).toUpperCase();
                const timeAgo = getTimeAgo(n.created_at);

                let text = '';
                let iconClass = '';
                let iconSymbol = '';
                let link = '';

                switch (n.type) {
                    case 'like':
                        text = `<strong>${n.username}</strong> liked your post`;
                        iconClass = 'like';
                        iconSymbol = '<i class="fa-solid fa-heart"></i>';
                        link = `/post.html?id=${n.post_id}`;
                        break;
                    case 'comment':
                        text = `<strong>${n.username}</strong> commented on your post`;
                        iconClass = 'comment';
                        iconSymbol = '<i class="fa-solid fa-comment"></i>';
                        link = `/post.html?id=${n.post_id}`;
                        break;
                    case 'follow':
                        text = `<strong>${n.username}</strong> started following you`;
                        iconClass = 'follow';
                        iconSymbol = '<i class="fa-solid fa-user-plus"></i>';
                        link = `/user/profile.html?id=${n.from_user_id}`;
                        break;
                    default:
                        text = `<strong>${n.username}</strong> interacted with you`;
                        iconClass = 'follow';
                        iconSymbol = '<i class="fa-solid fa-bell"></i>';
                        link = `/user/profile.html?id=${n.from_user_id}`;
                }

                return `
                    <a href="${link}" class="notification" data-id="${n.notification_id}">
                        <div class="notification-avatar">${initial}</div>
                        <div class="notification-content">
                            <p class="notification-text">${text}</p>
                            <span class="notification-time">${timeAgo}</span>
                        </div>
                        <div class="notification-icon ${iconClass}">${iconSymbol}</div>
                    </a>
                `;
            }).join('');

        } catch (err) {
            notificationsList.innerHTML = '<p class="notifications-message">Something went wrong</p>';
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
