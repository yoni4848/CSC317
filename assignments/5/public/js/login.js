document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = e.target;
    const username = form.username.value;
    const password = form.password.value;
    const errorDiv = document.getElementById('error-message');

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (!res.ok) {
            errorDiv.textContent = data.error || 'Login failed';
            errorDiv.style.display = 'block';
            return;
        }

        // store token and redirect
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/';

    } catch (err) {
        errorDiv.textContent = 'Something went wrong';
        errorDiv.style.display = 'block';
    }
});
