export default {
    data: () => ({
        selectedProfessional: null,
        loading: true,
        error: null,
    }),
    template: `
        <div class="professional-detail-container">
            <div v-if="loading">Loading...</div>
            <div v-if="error">
                <p>{{ error }}</p>
                <button @click="fetchDetails">Retry</button>
            </div>
            <div v-if="!loading && !error && selectedProfessional">
                <h2>Professional Details</h2>
                <p><strong>Name:</strong> {{ selectedProfessional.name || "N/A" }}</p>
                <p><strong>ID:</strong> {{ selectedProfessional.id }}</p>
                <p><strong>Rating:</strong> {{ selectedProfessional.average_rating || "N/A" }}</p>
                <p><strong>Status:</strong> {{ selectedProfessional.block === 1 ? 'Blocked' : 'Unblocked' }}</p>
                <p><strong>Approval:</strong> {{ selectedProfessional.approved_status }}</p>
                <p><strong>Created:</strong> {{ formatDate(selectedProfessional.date_created) }}</p>

                <button @click="toggleBlock">
                    {{ selectedProfessional.block === 1 ? 'Unblock' : 'Block' }}
                </button>
                <button @click="toggleApproval">
                    {{ selectedProfessional.approved_status === 'approved' ? 'Disapprove' : 'Approve' }}
                </button>
                <button @click="selectedProfessional = null">Close</button>
            </div>
        </div>
    `,
    methods: {
        async fetchDetails() {
            const id = this.$route.params.id;
            this.loading = true;
            this.error = null;
            try {
                const res = await fetch(`/api/professional/stats/${id}`, { 
                    headers: { 'Authentication-Token': this.$store.state.auth_token } 
                });
                if (!res.ok) throw new Error(res.statusText);
                this.selectedProfessional = await res.json();
            } catch (e) {
                this.error = e.message;
            } finally {
                this.loading = false;
            }
        },

        async toggleBlock() {
            try {
                const newStatus = this.selectedProfessional.block === 1 ? 0 : 1; // Toggle between 1 (Blocked) and 0 (Unblocked)
                const res = await fetch(`/api/professional/stats/${this.selectedProfessional.id}`, {
                    method: "PUT",
                    headers: { 
                        'Authentication-Token': this.$store.state.auth_token, 
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({ block: newStatus }),
                });

                if (!res.ok) throw new Error("Failed to update block status");

                // Ensure Vue updates the UI reactively
                this.$set(this.selectedProfessional, "block", newStatus);

            } catch (e) {
                console.error(e.message);
            }
        },

        async toggleApproval() {
            try {
                const newStatus = this.selectedProfessional.approved_status === "approved" ? "disapproved" : "approved";
                const res = await fetch(`/api/professional/stats/${this.selectedProfessional.id}`, {
                    method: "PUT",
                    headers: { 
                        'Authentication-Token': this.$store.state.auth_token, 
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({ approved_status: newStatus }),
                });

                if (!res.ok) throw new Error("Failed to update approval status");

                this.$set(this.selectedProfessional, "approved_status", newStatus);

            } catch (e) {
                console.error(e.message);
            }
        },

        formatDate(date) {
            return new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
        }
    },
    mounted() {
        this.fetchDetails();
    },
};
