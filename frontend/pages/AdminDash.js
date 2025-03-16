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
                <h4>{{ activeSection[0].toUpperCase() + activeSection.slice(1) }} List</h4>
                
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
                <div class="table-responsive" style="max-width: 80%; margin: 0 auto;"> 
                    <table id="data-table" class="table table-sm table-bordered table-striped">
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
                                <td>
                                    <template v-if="editingId === item.id">
                                        <input v-model="editingService.name" class="form-control" />
                                    </template>
                                    <template v-else>
                                        {{ item.name }}
                                    </template>
                                </td>
                                <td v-if="activeSection !== 'services'">{{ item.contact_no }}</td>
                                <td v-if="activeSection === 'services'">
                                    <template v-if="editingId === item.id">
                                        <input v-model.number="editingService.base_price" type="number" class="form-control" />
                                    </template>
                                    <template v-else>
                                        {{ item.base_price }}
                                    </template>
                                </td>
                                <td>
                                    <template v-if="activeSection === 'services'">
                                        <template v-if="editingId === item.id">
                                            <button @click="updateService(item)" class="btn btn-success btn-sm">Save</button>
                                            <button @click="cancelEdit" class="btn btn-danger btn-sm">Cancel</button>
                                        </template>
                                        <template v-else>
                                            <button @click="editService(item)" class="btn btn-primary btn-sm">Edit</button>
                                            <button @click="deleteService(item.id)" class="btn btn-danger btn-sm">Delete</button>
                                        </template>
                                    </template>
                                    <template v-else>
                                        <button v-if="activeSection === 'professionals'" @click="selectProfessional(item)" class="btn btn-info btn-sm">View</button>
                                        <button v-if="activeSection === 'customers'" @click="selectCustomer(item)" class="btn btn-info btn-sm">View</button>
                                    </template>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `,

    data: () => ({
        dataList: [],
        activeSection: null,
        editingId: null, // Track which row is being edited
        editingService: { name: '', base_price: 0 }, // Store the edited service
        showServiceForm: false,
        newService: { name: '', base_price: 0 }, // Reset form
        dataTable: null, // Reference to DataTable instance
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
                    this.initDataTable(); // Initialize DataTable after data is loaded
                } else {
                    console.error(`Failed to fetch ${section}`);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        },

        initDataTable() {
            // Destroy existing DataTable instance if it exists
            if (this.dataTable) {
                this.dataTable.destroy();
                this.dataTable = null;
            }

            // Initialize DataTable
            this.$nextTick(() => {
                this.dataTable = $('#data-table').DataTable({
                    paging: true,
                    searching: true,
                    ordering: true,
                    responsive: true,
                    lengthMenu: [10, 25, 50, 100],
                    language: {
                        search: 'Search:',
                        lengthMenu: 'Display _MENU_ records',
                        info: 'Showing _START_ to _END_ of _TOTAL_ records',
                    },
                });
            });
        },

        editService(item) {
            if (this.dataTable) {
                this.dataTable.destroy(); // Destroy DataTable before editing
                this.dataTable = null;
            }
            this.editingId = item.id;
            this.editingService = { ...item }; // Copy the item to the editing object
        },

        async updateService(item) {
            try {
                const res = await fetch(`/api/services/${item.id}`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json', 
                        'Authentication-Token': this.$store.state.auth_token 
                    },
                    body: JSON.stringify(this.editingService),
                });
                if (res.ok) {
                    await this.loadData('services'); // Reload data after saving
                    this.cancelEdit();
                    this.initDataTable(); // Reinitialize DataTable after saving
                } else {
                    console.error('Failed to update service');
                }
            } catch (error) {
                console.error('Error updating service:', error);
            }
        },

        cancelEdit() {
            this.editingId = null;
            this.editingService = { name: '', base_price: 0 };
        },

        selectProfessional(professional) {
            this.$router.push({ name: 'ProfStats', params: { id: professional.id } });
        },

        selectCustomer(customer) {
            this.$router.push({ name: 'CusStats', params: { id: customer.user_id } });
        },

        toggleServiceForm() {
            this.showServiceForm = !this.showServiceForm;
            this.newService = { name: '', base_price: 0 };
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

        async create_csv() {
            try {
                const res = await fetch(`/export`, {
                    headers: { 'Authentication-Token': this.$store.state.auth_token }
                });

                if (res.ok) {
                    const { task_id } = await res.json();

                    const checkStatus = async () => {
                        const statusRes = await fetch(`/get-csv/${task_id}`);
                        if (statusRes.ok) {
                            window.open(`/get-csv/${task_id}`);
                        } else {
                            setTimeout(checkStatus, 3000);
                        }
                    };

                    checkStatus();
                }
            } catch (error) {
                console.error("Error creating CSV:", error);
            }
        },
    },

    mounted() {
        this.initDataTable(); // Initialize DataTable on mount
    },

    beforeUnmount() {
        if (this.dataTable) this.dataTable.destroy(); // Clean up DataTable instance
    },
};