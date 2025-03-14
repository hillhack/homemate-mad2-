export default {
    template: `
    <div class="container">
        <div class="form-container">
            <!-- Flash Message -->
            <div v-if="flashMessage" :class="['flash-message', flashType]">
                {{ flashMessage }}
            </div>
            
            <input type="email" placeholder="Email" v-model="email" />  
            <input type="password" placeholder="Password" v-model="password" />  

            <select v-model="role">
                <option value="" disabled>Select Role</option>
                <option value="admin">Admin</option>
                <option value="professional">Professional</option>
                <option value="customer">Customer</option>
            </select>

            <button @click="submitRegister">Register</button>
            <img src ="https://media.tenor.com/XMhYYgxCfFoAAAAj/house-penguin.gif">
        </div>
        
    </div>
    `,
    data() {
        return {
            email: '',
            password: '',
            role: '',
            flashMessage: '',
            flashType: '',
        };
    },
    methods: {
        async submitRegister() {
            this.clearFlashMessage();

            if (!this.email || !this.password || !this.role) {
                this.showFlashMessage('All fields are required!', 'warning');
                return;
            }

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

                const data = await response.json();

                if (response.ok) {
                    this.showFlashMessage(data.message || 'Registration successful!', 'success');
                    setTimeout(() => {
                        this.$router.push('/login');
                    }, 1500);
                } else {
                    this.showFlashMessage(data.message || 'Registration failed!', 'error');
                }
            } catch (error) {
                this.showFlashMessage('Network error. Please try again.', 'error');
            }
        },
        showFlashMessage(message, type) {
            this.flashMessage = message;
            this.flashType = type;

            // Auto-hide after 3 seconds
            setTimeout(() => {
                this.clearFlashMessage();
            }, 3000);
        },
        clearFlashMessage() {
            this.flashMessage = '';
            this.flashType = '';
        },
    },
};
