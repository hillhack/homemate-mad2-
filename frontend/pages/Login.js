export default {
    template : `
    <div>
        <input placeholder="email"  v-model="email"/>  
        <input placeholder="password"  v-model="password"/>  
         <div>
            <!-- Option to select role -->
            <label for="role">Select Role</label>
            <select v-model="role" id="role">
                <option value="admin">Admin</option>
                <option value="professional">Professional</option>
                <option value="customer">Customer</option>
            </select>
        </div>
        <button class='btn btn-primary' @click="submitLogin"> Login </button>
    </div>
    `,
    data(){
        return {
            email : null,
            password : null,
            role: null
        } 
    },
    methods : {
        async submitLogin(){
            const res = await fetch(location.origin+'/login', 
                {
                    method : 'POST', 
                    headers: {'Content-Type' : 'application/json'}, 
                    body : JSON.stringify({'email': this.email,'password': this.password ,'role': this.role,})
                })
            if (res.ok){
                console.log('we are logged in')
                const data = await res.json()
                localStorage.setItem('user', JSON.stringify(data))
                this.$store.commit('setUser')
                 // Redirect based on role
                 if (data.role === 'admin') {
                    this.$router.push('/admin-dashboard');
                } 
                else if (data.role === 'professional') {
                    this.$router.push('/prof-dashboard');
                }
                else if (data.role === 'customer') {
                    this.$router.push('/cus-dashboard');


            }              
            }
        }
    }
}