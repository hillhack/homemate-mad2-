export default {
    template: `
        <div>
            <div class="header">
                <button @click="view = 'profile'">Profile</button>
                <button @click="view = 'analytics'; loadAnalytics()">Analytics</button>
            </div>

            <div v-if="view === 'profile'">
                <h3>Customer Details</h3>
                <div v-if="customer">
                    <p>ID: {{ customer.id }}</p>
                    <p>Name: {{ customer.name }}</p>
                    <p>Contact: {{ customer.contact_no }}</p>
                    <p>Address: {{ customer.address }}</p>
                    <p>Blocked: {{ customer.block ? "Yes" : "No" }}</p>
                    <button @click="toggleBlock">{{ customer.block ? 'Unblock' : 'Block' }}</button>
                </div>
                <p v-else>Loading...</p>
            </div>

            <div v-if="view === 'analytics'">
                <h3>Service Request Analytics</h3>
                <canvas id="chart" width="400" height="300"></canvas>
            </div>
        </div>
    `,

    props: ["id"],

    data() {
        return {
            customer: null,
            view: "profile",
            chart: null,
            stats: {
                pending: 0,
                accepted: 0,
                completed: 0
            }
        };
    },

    mounted() {
        this.fetchData(`/api/customer/profile/${this.id}`, data => this.customer = data);
    },

    methods: {
        async fetchData(url, callback) {
            try {
                const res = await fetch(url, { headers: { 'Authentication-Token': this.$store.state.auth_token } });
                if (res.ok) callback(await res.json());
            } catch (e) {
                console.error(`Error fetching data:`, e);
            }
        },

        async toggleBlock() {
            try {
                const updatedBlockStatus = !this.customer.block;
                const res = await fetch(`/api/customer/profile/${this.id}`, {
                    method: "PUT",
                    headers: {
                        'Authentication-Token': this.$store.state.auth_token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ block: updatedBlockStatus })
                });
                if (res.ok) this.customer.block = updatedBlockStatus;
            } catch (e) {
                console.error('Error updating block status:', e);
            }
        },

        async loadAnalytics() {
            this.fetchData(`/api/requests/${this.customer.id}?role=${this.customer?.role || 'customer'}`, data => {
                // Extract status distribution from the first request object
                if (data.length > 0) {
                    this.stats = {
                        pending: data[0].pending || 0,
                        accepted: data[0].accepted || 0,
                        completed: data[0].completed || 0
                    };
                }
                this.renderChart();
            });
        },

        renderChart() {
            if (this.chart) this.chart.destroy();

            const ctx = document.getElementById('chart').getContext('2d');
            this.chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Pending', 'Accepted', 'Completed'],
                    datasets: [{
                        label: 'Service Requests',
                        data: [this.stats.pending, this.stats.accepted, this.stats.completed],
                        backgroundColor: ['#ff6384', '#36a2eb', '#4bc0c0'],
                        borderColor: ['#ff6384', '#36a2eb', '#4bc0c0'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: false,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true } }
                }
            });
        }
    }
};