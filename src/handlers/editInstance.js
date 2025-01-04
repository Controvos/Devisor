document.addEventListener('DOMContentLoaded', async () => {
    const editForm = document.getElementById('edit-form');
    const idInput = document.getElementById('id');

    // Fetch instance details if id is provided
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    if (id) {
        try {
            const response = await axios.get(`/state/${id}`);
            const instance = response.data;

            idInput.value = instance.Id;
            document.getElementById('image').value = instance.Image;
            document.getElementById('memory').value = instance.Memory;
            document.getElementById('cpu').value = instance.Cpu;
            document.getElementById('env').value = instance.Env.join('\n'); // Assuming Env is an array of strings

        } catch (error) {
            console.error('Failed to fetch instance details:', error);
        }
    }

    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(editForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await axios.put(`/instances/edit/${id}`, data);
            alert('Instance updated successfully');
            window.location.href = '/dashboard';
        } catch (error) {
            console.error('Failed to update instance:', error);
        }
    });
});
