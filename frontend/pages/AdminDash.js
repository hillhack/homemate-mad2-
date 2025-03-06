export default {
    template: `
        <div>
            <h1>Admin Dashboard</h1>
            <button v-for="section in ['professionals', 'customers', 'services']" @click="loadData(section)">
                Manage {{ section[0].toUpperCase() + section.slice(1) }}
            </button>
            <div v-if="activeSection">
                <h1>{{ activeSection[0].toUpperCase() + activeSection.slice(1) }} List</h1>
                <button v-if="activeSection === 'services'" @click="showServiceForm = true">Add Service</button>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th><th>Name</th><th v-if="activeSection !== 'services'">Contact</th><th v-if="activeSection === 'services'">Base Price</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in dataList" :key="item.id">
                            <td>{{ item.id }}</td>
                            <td>{{ item.name }}</td>
                            <td v-if="activeSection !== 'services'">{{ item.contact_no }}</td>
                            <td v-if="activeSection === 'services'">{{ item.base_price }}</td>
                            <td>
                                <button v-if="activeSection === 'professionals'" @click="selectProfessional(item)">View</button>
                                <button v-if="activeSection === 'customers'" @click="selectCustomer(item)">View</button>
                                <template v-if="activeSection === 'services'">
                                    <button @click="editService(item)">Edit</button>
                                    <button @click="deleteService(item.id)">Delete</button>
                                </template>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div v-if="editingService">
                <h2>Edit Service</h2>
                <form @submit.prevent="updateService">
                    <input v-model="editingService.name" placeholder="Name" required />
                    <input v-model.number="editingService.base_price" type="number" placeholder="Price" required />
                    <button type="submit">Save</button>
                    <button @click="cancelEdit">Cancel</button>
                </form>
            </div>
        </div>
    `,
    data: () => ({ dataList: [], activeSection: null, editingService: null }),
    methods: {
        async loadData(section) {
            this.activeSection = section;
            try {
                const res = await fetch(`/api/${section}`, { headers: { 'Authentication-Token': this.$store.state.auth_token } });
                if (res.ok) this.dataList = await res.json();
                else console.error(`Failed to fetch ${section}`);
            } catch (error) { console.error('Error fetching data:', error); }
        },
        selectProfessional(professional) {
            this.$router.push({ name: 'ProfStats', params: { id: professional.id } });
        },
        selectCustomer(customer){
            this.$router.push({name:'CusStats', params:{id: customer.user_id }});
        },
        editService(service) { this.editingService = { ...service }; },
        async updateService() {
            try {
                const res = await fetch(`/api/services/${this.editingService.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authentication-Token': this.$store.state.auth_token },
                    body: JSON.stringify(this.editingService),
                });
                if (res.ok) this.loadData('services');
                this.cancelEdit();
            } catch (error) { console.error('Error updating service:', error); }
        },
        async deleteService(serviceId) {
            if (!confirm('Are you sure?')) return;
            try {
                const res = await fetch(`/api/services/${serviceId}`, {
                    method: 'DELETE',
                    headers: { 'Authentication-Token': this.$store.state.auth_token },
                });
                if (res.ok) this.loadData('services');
            } catch (error) { console.error('Error deleting service:', error); }
        },
        cancelEdit() { this.editingService = null; },
    },
};