export default {
    template: `
    <div class="container">
        <!-- Flash message -->
        <div v-if="flashMessage" :class="['flash-message', flashType]">
            {{ flashMessage }}
        </div>

        <div class ='form-container'>
            <input placeholder="Email" v-model="email" />
            <input type="password" placeholder="Password" v-model="password" />
        <div>
            <!-- Option to select role -->
            <label for="role">Select Role</label>
            <select v-model="role" id="role">
                <option value="admin">Admin</option>
                <option value="professional">Professional</option>
                <option value="customer">Customer</option>
            </select>
        </div>
        <button class="btn btn-primary" @click="submitLogin">Login</button>
        <img src= "https://onlinegiftools.com/images/examples-onlinegiftools/jump-hello-transparent.gif">
    </div>
    `,

    data() {
        return {
            email: null,
            password: null,
            role: null,
            flashMessage: '', // For displaying flash messages
            flashType: '' // Can be 'success', 'error', or 'warning'
        }
    },

    methods: {
        async submitLogin() {
            try {
                const res = await fetch(`${location.origin}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: this.email,
                        password: this.password,
                        role: this.role
                    })
                });

                const data = await res.json();

                if (res.ok) {
                    // ✅ Successful login
                    this.showFlashMessage(data.message || 'Login successful', 'success');
                    localStorage.setItem('user', JSON.stringify(data));
                    this.$store.commit('setUser');

                    // Redirect based on role
                    if (data.role === 'admin') {
                        this.$router.push('/admin-dashboard');
                    } else if (data.role === 'professional') {
                        this.$router.push('/prof-dashboard');
                    } else if (data.role === 'customer') {
                        this.$router.push('/cus-dashboard');
                    }
                } else {
                    this.showFlashMessage(data.message || 'Login failed', 'error');
                }
            } catch (err) {
                this.showFlashMessage('An error occurred while logging in.', 'error');
                console.error(err);
            }
        },

        // Flash message handler
        showFlashMessage(message, type) {
            this.flashMessage = message;
            this.flashType = type;

            // Hide message after 3 seconds
            setTimeout(() => {
                this.flashMessage = '';
                this.flashType = '';
            }, 3000);
        }
    }
}
