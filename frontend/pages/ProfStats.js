export default {
    data: () => ({
        selectedProfessional: null,
        loading: true,
        error: null,
        stats: { pending: 0, accepted: 0, completed: 0 }, // Initialize stats
        chart: null,
        view: 'profile', // Track which view is active
    }),

    template: `
        <div>
            <!-- Header with Profile and Analytics Buttons -->
            <div class="header mb-3 d-flex justify-content-start">
                <button 
                    class="btn btn-outline-primary me-2" 
                    @click="view = 'profile'">
                    Profile
                </button>
                <button 
                    class="btn btn-outline-secondary" 
                    @click="view = 'analytics'; loadAnalytics()">
                    Analytics
                </button>
            </div>

            <!-- Loading State -->
            <div v-if="loading">
                <p>Loading...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="error">
                <p class="text-danger">{{ error }}</p>
            </div>

            <!-- Professional Details View -->
            <div v-else-if="view === 'profile' && selectedProfessional">
                <h2 class="mb-4 text-primary">Professional Details</h2>
                <div class="row mb-3">
                    <div class="col-sm-2 font-weight-bold">ID:</div>
                    <div class="col-sm-8">{{ selectedProfessional.id || "N/A" }}</div>
                </div>

                <div class="row mb-3">
                    <div class="col-sm-2 font-weight-bold">Name:</div>
                    <div class="col-sm-8">{{ selectedProfessional.name || "N/A" }}</div>
                </div>

                <div class="row mb-3">
                    <div class="col-sm-2 font-weight-bold">Address:</div>
                    <div class="col-sm-8">{{ selectedProfessional.address || "N/A" }}</div>
                </div>

                <div class="row mb-3">
                    <div class="col-sm-2 font-weight-bold">Contact No:</div>
                    <div class="col-sm-8">{{ selectedProfessional.contact_no || "N/A" }}</div>
                </div>

                <div class="row mb-3">
                    <div class="col-sm-2 font-weight-bold">Rating:</div>
                    <div class="col-sm-8">{{ selectedProfessional.average_rating || "N/A" }}</div>
                </div>

                <div class="row mb-3">
                    <div class="col-sm-2 font-weight-bold">Status:</div>
                    <div class="col-sm-8">
                        <button 
                            class="btn btn-outline-danger" 
                            @click="toggleBlock">
                            {{ selectedProfessional.block === 1 ? 'Unblock' : 'Block' }}
                        </button>
                    </div>
                </div>

                <div class="row mb-3">
                    <div class="col-sm-2 font-weight-bold">Approval:</div>
                    <div class="col-sm-8">
                        <button 
                            class="btn btn-outline-success" 
                            @click="toggleApproval">
                            {{ selectedProfessional.approved_status === 'approved' ? 'Disapprove' : 'Approve' }}
                        </button>
                    </div>
                </div>

                <div class="row mb-4">
                    <div class="col-sm-2 font-weight-bold">Created:</div>
                    <div class="col-sm-8">{{ formatDate(selectedProfessional.date_created) }}</div>
                </div>
            </div>

            <!-- Analytics View -->
            <div v-else-if="view === 'analytics'">
                <div v-if="stats">
                    <h2 class="mb-4 text-primary">Service Requests Analytics</h2>
                    <div class="chart-container">
                        <canvas id="chart" width="300" height="150"></canvas>
                    </div>
                </div>
                <div v-else>
                    <p>No analytics data available.</p>
                </div>
            </div>
        </div>
    `,

    methods: {
        async fetchDetails() {
            this.loading = true;
            this.error = null;

            try {
                const id = this.$route.params.id;
                const res = await fetch(`/api/professional/stats/${id}`, {
                    headers: { 'Authentication-Token': this.$store.state.auth_token }
                });

                if (!res.ok) throw new Error("Failed to fetch professional details");

                this.selectedProfessional = await res.json();
            } catch (e) {
                this.error = e.message;
            } finally {
                this.loading = false;
            }
        },

        async toggleBlock() {
            try {
                const newStatus = this.selectedProfessional.block === 1 ? 0 : 1;
                await this.updateProfessional({ block: newStatus });
                this.selectedProfessional.block = newStatus;
            } catch (e) {
                console.error(e.message);
            }
        },

        async toggleApproval() {
            try {
                const newStatus = this.selectedProfessional.approved_status === "approved" ? "disapproved" : "approved";
                await this.updateProfessional({ approved_status: newStatus });
                this.selectedProfessional.approved_status = newStatus;
            } catch (e) {
                console.error(e.message);
            }
        },

        async updateProfessional(data) {
            const res = await fetch(`/api/professional/stats/${this.selectedProfessional.id}`, {
                method: "PUT",
                headers: {
                    'Authentication-Token': this.$store.state.auth_token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error("Failed to update professional details");
        },

        async loadAnalytics() {
            try {
                const res = await fetch(`/api/requests/${this.selectedProfessional.id}?role=${this.selectedProfessional?.role || 'customer'}`, {
                    headers: { 'Authentication-Token': this.$store.state.auth_token }
                });

                if (!res.ok) throw new Error("Failed to load analytics data");

                const data = await res.json();
                console.log("API Response:", data); // Debugging: Log the API response

                // Extract status distribution from the first request object
                if (data.length > 0) {
                    this.stats = {
                        pending: data[0].pending || 0,
                        accepted: data[0].accepted || 0,
                        completed: data[0].completed || 0
                    };
                }

                this.$nextTick(() => {
                    this.renderChart(); // Ensure chart is rendered after DOM is ready
                });
            } catch (e) {
                console.error(e.message);
            }
        },

        renderChart() {
            if (this.chart) this.chart.destroy();

            const canvas = document.getElementById('chart');
            if (!canvas) {
                console.error("Chart canvas not found");
                return;
            }

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                console.error("Cannot get chart context");
                return;
            }

            this.chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Pending', 'Accepted', 'Completed'],
                    datasets: [{
                        label: 'Service Requests',
                        data: [
                            this.stats.pending || 0,
                            this.stats.accepted || 0,
                            this.stats.completed || 0
                        ],
                        backgroundColor: ['#ff6384', '#36a2eb', '#4bc0c0'],
                        borderColor: ['#ff6384', '#36a2eb', '#4bc0c0'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true } }
                }
            });
        },

        formatDate(date) {
            if (!date) return "N/A";
            return new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
        }
    },

    mounted() {
        this.fetchDetails();
    }
};