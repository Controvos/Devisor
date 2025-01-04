document.addEventListener('DOMContentLoaded', () => {
    const createForm = document.getElementById('create-form');

    createForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(createForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await axios.post('/instances/create', data);
            alert('Instance created successfully');
            window.location.href = '/dashboard';
        } catch (error) {
            console.error('Failed to create instance:', error);
        }
    });
});
