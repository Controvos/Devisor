document.addEventListener('DOMContentLoaded', () => {
    const instancesList = document.getElementById('instances-list');

    async function fetchInstances() {
        try {
            const response = await axios.get('/instances');
            const instances = response.data.instances;

            instancesList.innerHTML = '';
            instances.forEach(instance => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <p>ID: ${instance.Id}</p>
                    <p>Image: ${instance.Image}</p>
                    <p>Memory: ${instance.Memory} MB</p>
                    <p>CPU: ${instance.Cpu} cores</p>
                    <a href="/instances/edit/${instance.Id}" class="btn">Edit</a>
                    <button onclick="deleteInstance('${instance.Id}')" class="btn">Delete</button>
                `;
                instancesList.appendChild(listItem);
            });
        } catch (error) {
            console.error('Failed to fetch instances:', error);
        }
    }

    async function deleteInstance(id) {
        try {
            await axios.delete(`/instances/${id}`);
            alert('Instance deleted successfully');
            fetchInstances();
        } catch (error) {
            console.error('Failed to delete instance:', error);
        }
    }

    fetchInstances();
});
