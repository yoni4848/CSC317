document.addEventListener('DOMContentLoaded', () => {
    const notificationsList = document.getElementById('notificationsList');
    const markAllReadBtn = document.getElementById('markAllRead');

    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = 'auth/login.html';
        return;
    }

    loadNotifications();
    updateBadge();

    markAllReadBtn.addEventListener('click', async () => {
        try {
            await fetch('/api/notifications/read', {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            document.querySelectorAll('.notification.unread').forEach(n => {
                n.classList.remove('unread');
            });

            const badge = document.getElementById('notificationBadge');
            if (badge) badge.style.display = 'none';
        } catch (err) {
            console.error(err);
        }
    });

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
                const unreadClass = n.is_read ? '' : 'unread';

                let text = '';
                let iconClass = '';
                let iconSymbol = '';

                switch (n.type) {
                    case 'like':
                        text = `<a href="/user/profile.html?id=${n.from_user_id}">${n.username}</a> liked your post`;
                        iconClass = 'like';
                        iconSymbol = '<i class="fa-solid fa-heart"></i>';
                        break;
                    case 'comment':
                        text = `<a href="/user/profile.html?id=${n.from_user_id}">${n.username}</a> commented on your post`;
                        iconClass = 'comment';
                        iconSymbol = '<i class="fa-solid fa-comment"></i>';
                        break;
                    case 'follow':
                        text = `<a href="/user/profile.html?id=${n.from_user_id}">${n.username}</a> started following you`;
                        iconClass = 'follow';
                        iconSymbol = '<i class="fa-solid fa-user-plus"></i>';
                        break;
                    default:
                        text = `<a href="/user/profile.html?id=${n.from_user_id}">${n.username}</a> interacted with you`;
                        iconClass = 'follow';
                        iconSymbol = '<i class="fa-solid fa-bell"></i>';
                }

                return `
                    <div class="notification ${unreadClass}" data-id="${n.notification_id}">
                        <a href="/user/profile.html?id=${n.from_user_id}" class="notification-avatar">${initial}</a>
                        <div class="notification-content">
                            <p class="notification-text">${text}</p>
                            <span class="notification-time">${timeAgo}</span>
                        </div>
                        <div class="notification-icon ${iconClass}">${iconSymbol}</div>
                    </div>
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

    async function updateBadge() {
        try {
            const res = await fetch('/api/notifications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const notifications = await res.json();
            const unread = notifications.filter(n => !n.is_read).length;
            const badge = document.getElementById('notificationBadge');

            if (badge) {
                if (unread > 0) {
                    badge.textContent = unread > 99 ? '99+' : unread;
                    badge.style.display = 'flex';
                } else {
                    badge.style.display = 'none';
                }
            }
        } catch (err) {
            console.error(err);
        }
    }
});
