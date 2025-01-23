export default {
    template: `
        <div>
            <h1>This is Customer Dashboard</h1>
            <button @click="loadProfessionals">Manage Professionals</button>
            <button @click="loadServices">Manage Services</button>
        </div>
    `,
    methods: {
        async loadProfessionals() {
            try {
                const res = await fetch(`${location.origin}/api/professionals`, {
                    headers: {
                        'Authentication-Token': this.$store.state.auth_token
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    console.log('Professionals:', data);
                } else {
                    console.error('Failed to fetch professionals:', res.status, res.statusText);
                }
            } catch (error) {
                console.error('An error occurred while fetching professionals:', error);
            }
        },
    }
};