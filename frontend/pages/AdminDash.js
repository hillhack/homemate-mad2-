export default {
    template: `
        <div>
            <h1>Admin Dashboard</h1>
            
            <!-- Manage Section Buttons -->
            <button v-for="section in ['professionals', 'customers', 'services']" 
                    :key="section" 
                    @click="loadData(section)">
                Manage {{ section[0].toUpperCase() + section.slice(1) }}
            </button>
            <button @click="create_csv">Requests Data</button>
            
            <div v-if="activeSection">
                <h1>{{ activeSection[0].toUpperCase() + activeSection.slice(1) }} List</h1>
                
                <!-- Add Service Button -->
                <button v-if="activeSection === 'services'" @click="toggleServiceForm">Add Service</button>

                <!-- Add Service Form -->
                <div v-if="showServiceForm">
                    <h2>Add Service</h2>
                    <form @submit.prevent="addService">
                        <input v-model="newService.name" placeholder="Service Name" required />
                        <input v-model.number="newService.base_price" type="number" placeholder="Price" required />
                        <button type="submit">Save</button>
                        <button type="button" @click="toggleServiceForm">Cancel</button>
                    </form>
                </div>

                <!-- Table Displaying Data -->
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th v-if="activeSection !== 'services'">Contact</th>
                            <th v-if="activeSection === 'services'">Base Price</th>
                            <th>Actions</th>
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

            <!-- Edit Service Form -->
            <div v-if="editingService">
                <h2>Edit Service</h2>
                <form @submit.prevent="updateService">
                    <input v-model="editingService.name" placeholder="Service Name" required />
                    <input v-model.number="editingService.base_price" type="number" placeholder="Price" required />
                    <button type="submit">Save</button>
                    <button type="button" @click="cancelEdit">Cancel</button>
                </form>
            </div>
        </div>
    `,

    data: () => ({
        dataList: [],
        activeSection: null,
        editingService: null,
        showServiceForm: false,
        newService: { name: '', base_price: 0 }, // Reset form
    }),

    methods: {
        async loadData(section) {
            this.activeSection = section;
            try {
                const res = await fetch(`/api/${section}`, {
                    headers: { 'Authentication-Token': this.$store.state.auth_token }
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

        selectProfessional(professional) {
            this.$router.push({ name: 'ProfStats', params: { id: professional.id } });
        },

        selectCustomer(customer) {
            this.$router.push({ name: 'CusStats', params: { id: customer.user_id } });
        },

        toggleServiceForm() {
            this.showServiceForm = !this.showServiceForm;
            if (this.showServiceForm) {
                this.newService = { name: '', base_price: 0 }; // Reset form
            }
        },

        async addService() {
            try {
                const res = await fetch(`/api/services`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json', 
                        'Authentication-Token': this.$store.state.auth_token 
                    },
                    body: JSON.stringify(this.newService),
                });
                if (res.ok) {
                    this.loadData('services');
                    this.toggleServiceForm();
                } else {
                    console.error('Failed to add service');
                }
            } catch (error) {
                console.error('Error adding service:', error);
            }
        },

        editService(service) {
            this.editingService = { ...service };
        },

        async updateService() {
            try {
                const res = await fetch(`/api/services/${this.editingService.id}`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json', 
                        'Authentication-Token': this.$store.state.auth_token 
                    },
                    body: JSON.stringify(this.editingService),
                });
                if (res.ok) {
                    this.loadData('services');
                    this.cancelEdit();
                } else {
                    console.error('Failed to update service');
                }
            } catch (error) {
                console.error('Error updating service:', error);
            }
        },

        async create_csv() {
            try {
                const res = await fetch(`${location.origin}/export`, {
                    headers: { 'Authentication-Token': this.$store.state.auth_token }
                });

                if (!res.ok) throw new Error("Failed to start export");

                const task_id = (await res.json()).task_id;
                console.log(`Export task started with ID: ${task_id}`);

                const interval = setInterval(async () => {
                    try {
                        const res = await fetch(`${location.origin}/get-csv/${task_id}`);
                        if (res.ok) {
                            console.log('Data is ready for download');
                            window.open(`${location.origin}/get-csv/${task_id}`);
                            clearInterval(interval);
                        }
                    } catch (err) {
                        console.error("Error checking CSV export status:", err);
                    }
                }, 5000);
            } catch (error) {
                console.error("Error creating CSV:", error);
            }
        },

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

        cancelEdit() {
            this.editingService = null;
        },
    },
};
