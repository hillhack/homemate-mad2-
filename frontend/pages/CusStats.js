export default {
    template: `<div>
        <h3>Customer Details</h3>
        <p v-if="customer">Customer ID: {{ customer.id }}</p>
        <p v-if="customer">Name: {{ customer.name }}</p>
        <p v-if="customer">Contact: {{ customer.contact_no }}</p>
        <p v-if="customer">Address: {{ customer.address }}</p>
        <p v-if="customer">Blocked: {{ customer.block ? "Yes" : "No" }}</p>
        
        <!-- Block/Unblock Button -->
        <button v-if="customer" 
            @click="toggleBlock"
            :style="{ backgroundColor: customer.block ? 'red' : 'green', color: 'white', padding: '10px', border: 'none', cursor: 'pointer' }">
            {{ customer.block ? "Unblock" : "Block" }}
        </button>

        <p v-else>Loading customer details...</p>
      </div>`,

    props: ["id"],

    data() {
        return { customer: null };
    },

    async mounted() {
        try {
            console.log("Fetching customer details for ID:", this.id);

            const response = await fetch(`/api/customer/profile/${this.id}`, {
                headers: { 'Authentication-Token': this.$store.state.auth_token }
            });

            console.log("Response status:", response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            this.customer = await response.json();
        } catch (error) {
            console.error("Error fetching customer:", error);
        }
    },

    methods: {
        async toggleBlock() {
            if (!this.customer) return;

            const newBlockStatus = !this.customer.block; // Toggle block status

            try {
                const response = await fetch(`/api/customer/profile/${this.id}`, {
                    method: "PUT",
                    headers: {
                        'Authentication-Token': this.$store.state.auth_token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ block: newBlockStatus })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const result = await response.json();
                console.log("Block status updated:", result);

                // Ensure the API response actually contains the updated status
                if (result.block !== undefined) {
                    this.customer.block = result.block;
                }
            } catch (error) {
                console.error("Error updating block status:", error);
            }
        }
    }
};
