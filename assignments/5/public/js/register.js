document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = e.target;
    const username = form.username.value;
    const email = form.email.value;
    const password = form.password.value;
    const errorDiv = document.getElementById('error-message');

    try {
        const res = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            errorDiv.textContent = data.error || 'Registration failed';
            errorDiv.style.display = 'block';
            return;
        }

        // redirect to login page
        window.location.href = '/auth/login.html';

    } catch (err) {
        errorDiv.textContent = 'Something went wrong';
        errorDiv.style.display = 'block';
    }
});
