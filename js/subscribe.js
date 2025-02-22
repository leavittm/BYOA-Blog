document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('subscribe-form');
    const messageDiv = document.getElementById('form-message');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = form.email.value;
            messageDiv.className = 'form-message';
            
            try {
                // Here you would typically send this to your backend
                // For now, we'll just show a success message
                messageDiv.textContent = 'Thanks for subscribing!';
                messageDiv.classList.add('success');
                form.reset();
                
            } catch (error) {
                messageDiv.textContent = 'Something went wrong. Please try again.';
                messageDiv.classList.add('error');
            }
        });
    }
});