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
            dataList: [], // Holds the data for the active section
            activeSection: null, // Tracks the currently active section ('professionals', 'customers', or 'services')
        };
    },
    methods: {
        async loadData(section) {
            // Update the active section
            this.activeSection = section;

            // Define API endpoints for each section
            const apiEndpoints = {
                professionals: '/api/professionals',
                customers: '/api/customers',
                services: '/api/services'
            };

            // Clear the data list and fetch data for the selected section
            this.dataList = [];
            try {
                const res = await fetch(`${location.origin}${apiEndpoints[section]}`, {
                    headers: {
                        'Authentication-Token': this.$store.state.auth_token
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    this.dataList = data;

                    // Initialize DataTable for the active section
                    this.$nextTick(() => {
                        if (!$.fn.dataTable.isDataTable(`#${section}Table`)) {
                            new DataTable(`#${section}Table`);
                        }
                    });

                    console.log(`${section} data:`, data);
                } else {
                    console.error(`Failed to fetch ${section}:`, res.status, res.statusText);
                }
            } catch (error) {
                console.error(`An error occurred while fetching ${section}:`, error);
            }
        }
    }
};
