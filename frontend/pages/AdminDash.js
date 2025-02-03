export default {
    template: `
        <div>
            <h1>Admin Dashboard</h1>
            <!-- Buttons to manage different sections -->
            <button v-for="section in ['professionals', 'customers', 'services']" @click="loadData(section)">
                Manage {{ section.charAt(0).toUpperCase() + section.slice(1) }}
            </button>

            <!-- Professional List -->
            <div v-if="activeSection === 'professionals'">
                <h1>Professional List</h1>
                <table class="table">
                    <thead>
                        <tr><th>ID</th><th>Name</th><th>Contact</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in dataList" :key="item.id">
                            <td>{{ item.id }}</td>
                            <td>{{ item.name }}</td>
                            <td>{{ item.contact_no }}</td>
                            <td><button @click="selectProfessional(item)">View</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Customer List -->
            <div v-if="activeSection === 'customers'">
                <h1>Customer List</h1>
                <table class="table">
                    <thead>
                        <tr><th>ID</th><th>Name</th><th>Contact</th></tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in dataList" :key="item.id">
                            <td>{{ item.id }}</td>
                            <td>{{ item.name }}</td>
                            <td>{{ item.contact_no }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Services List -->
            <div v-if="activeSection === 'services'">
                <h1>Service List</h1>
                <table class="table">
                    <thead>
                        <tr><th>ID</th><th>Name</th><th>Base Price</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in dataList" :key="item.id">
                            <td>{{ item.id }}</td>
                            <td>{{ item.name }}</td>
                            <td>{{ item.base_price }}</td>
                            <td>
                                <button @click="editService(item)">Edit</button>
                                <button @click="deleteService(item.id)">Delete</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Edit Service Form -->
            <div v-if="editingService">
                <h2>Edit Service</h2>
                <form @submit.prevent="updateService">
                    <input v-model="editingService.name" placeholder="Name" required />
                    <input v-model="editingService.base_price" type="number" placeholder="Price" required />
                    <button type="submit">Save</button>
                    <button @click="cancelEdit">Cancel</button>
                </form>
            </div>
        </div>
    `,
    data() {
        return {
            dataList: [],
            activeSection: null,
            editingService: null,
        };
    },
    methods: {
        // Load data based on the selected section (professionals, customers, services)
        async loadData(section) {
            this.activeSection = section;
            const endpoints = {
                professionals: '/api/professionals',
                customers: '/api/customers',
                services: '/api/services',
            };

            try {
                const res = await fetch(`${location.origin}${endpoints[section]}`, {
                    headers: { 'Authentication-Token': this.$store.state.auth_token },
                });

                if (res.ok) {
                    this.dataList = await res.json();
                } else {
                    console.error(`Failed to fetch ${section}`);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        },

        // View Professional details
        selectProfessional(professional) {
            this.$router.push({ name: 'ProfStats', params: { id: professional.id } });
        },

        // Edit Service details
        editService(service) {
            this.editingService = { ...service };
        },

        // Update Service details
        async updateService() {
            try {
                const res = await fetch(`/api/services/${this.editingService.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authentication-Token': this.$store.state.auth_token },
                    body: JSON.stringify(this.editingService),
                });

                if (res.ok) {
                    this.loadData('services');
                    this.editingService = null;
                } else {
                    console.error('Failed to update service');
                }
            } catch (error) {
                console.error('Error updating service:', error);
            }
        },

        // Delete a Service
        async deleteService(serviceId) {
            if (!confirm('Are you sure?')) return;
            try {
                const res = await fetch(`/api/services/${serviceId}`, {
                    method: 'DELETE',
                    headers: { 'Authentication-Token': this.$store.state.auth_token },
                });

                if (res.ok) {
                    this.loadData('services');
                } else {
                    console.error('Failed to delete service');
                }
            } catch (error) {
                console.error('Error deleting service:', error);
            }
        },

        // Cancel the edit form
        cancelEdit() {
            this.editingService = null;
        },
    },
};
