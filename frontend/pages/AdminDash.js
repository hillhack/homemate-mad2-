export default {
    template: `
        <div>
            <h1>Admin Dashboard</h1>

            <!-- Buttons to manage different sections -->
            <button @click="loadData('professionals')">Manage Professionals</button>
            <button @click="loadData('customers')">Manage Customers</button>
            <button @click="loadData('services')">Manage Services</button>

            <!-- Professional List -->
            <div v-if="activeSection === 'professionals'">
                <h1>Professional List</h1>
                <table id="professionalsTable" class="display">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Contact</th>
                            <th>Address</th>
                            <th>Description</th>
                            <th>Experience</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in dataList" :key="item.id">
                            <td>{{ item.id }}</td>
                            <td>{{ item.name }}</td>
                            <td>{{ item.contact_no }}</td>
                            <td>{{ item.address }}</td>
                            <td>{{ item.description }}</td>
                            <td>{{ item.experience }}</td>
                            <td><button @click="selectProfessional(item)">View</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Customer List -->
            <div v-if="activeSection === 'customers'">
                <h1>Customer List</h1>
                <table id="customersTable" class="display">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Contact</th>
                            <th>Address</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in dataList" :key="item.id">
                            <td>{{ item.id }}</td>
                            <td>{{ item.name }}</td>
                            <td>{{ item.contact_no }}</td>
                            <td>{{ item.address }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Services List -->
            <div v-if="activeSection === 'services'">
                <h1>Service List</h1>
                <table id="servicesTable" class="display">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Base Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in dataList" :key="item.id">
                            <td>{{ item.id }}</td>
                            <td>{{ item.name }}</td>
                            <td>{{ item.base_price }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `,
    data() {
        return {
            dataList: [], 
            activeSection: null, 
            selectedProfessional: null, 
        };
    },
    methods: {
        async loadData(section) {
            this.activeSection = section; 
            this.dataList = []; 

            const apiEndpoints = {
                professionals: '/api/professionals',
                customers: '/api/customers',
                services: '/api/services'
            };

            try {
                const res = await fetch(`${location.origin}${apiEndpoints[section]}`, {
                    headers: {
                        'Authentication-Token': this.$store.state.auth_token
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    this.dataList = data;

                    this.$nextTick(() => {
                        if (!$.fn.dataTable.isDataTable(`#${section}Table`)) {
                            new DataTable(`#${section}Table`);
                        }
                    });

                } else {
                    console.error(`Failed to fetch ${section}:`, res.status, res.statusText);
                }
            } catch (error) {
                console.error(`Error while fetching ${section}:`, error);
            }
        },

        selectProfessional(professional) {
            this.selectedProfessional = professional;
            this.$router.push({ name: 'ProfStats', params: { id: professional.id } }); // Redirect to ProfStats with professional ID
        },
    },
};
