export default {
    template: `
    <div>
        <input placeholder="email" v-model="email" />  
        <input type="password" placeholder="password" v-model="password" />  
        <input placeholder="role" v-model="role" />  
        <button @click="submitRegister">Register</button>
    </div>
    `,
    data() {
        return {
            email: null,
            password: null,
            role: null,
        };
    },
    methods: {
        async submitRegister() {
            try {
                const response = await fetch(`${location.origin}/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: this.email,
                        password: this.password,
                        role: this.role,
                    }),
                });

                if (response.ok) {
                    console.log('Registration successful');
                    // Redirect to login page
                    this.$router.push('/login');
                } else {
                    const errorData = await response.json();
                    console.error('Registration failed:', errorData.message || 'Unknown error');
                }
            } catch (error) {
                console.error('Error during registration:', error);
            }
        },
    },
};
