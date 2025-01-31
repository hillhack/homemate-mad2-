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
                <p><strong>Status:</strong> {{ selectedProfessional.block ? 'Blocked' : 'Active' }}</p>
                <p><strong>Approval:</strong> {{ selectedProfessional.approved_status }}</p>
                <p><strong>Created:</strong> {{ formatDate(selectedProfessional.date_created) }}</p>
                <button @click="toggle('block', !selectedProfessional.block)">
                    {{ selectedProfessional.block ? 'Unblock' : 'Block' }}
                </button>
                <button @click="toggle('approved_status', selectedProfessional.approved_status === 'approved' ? 'disapproved' : 'approved')">
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
                const res = await fetch(`/api/professional/stats/${id}`, { headers: { 'Authentication-Token': this.$store.state.auth_token } });
                if (!res.ok) throw new Error(res.statusText);
                this.selectedProfessional = await res.json();
            } catch (e) {
                this.error = e.message;
            } finally {
                this.loading = false;
            }
        },
        async toggle(field, value) {
            try {
                await fetch(`/api/professional/stats/${this.selectedProfessional.id}`, {
                    method: "PUT",
                    headers: { 'Authentication-Token': this.$store.state.auth_token, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ [field]: value }),
                });
                this.selectedProfessional[field] = value;
            } catch (e) {
                console.error(e.message);
            }
        },
        formatDate: date => new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }),
    },
    mounted() {
        this.fetchDetails();
    },
};
