export default {
    template: `
      <div v-if="showNavbar" class="navbar">
        <router-link to='/'>Home</router-link>
        <router-link v-if="!$store.state.loggedIn" to='/login'>Login</router-link>
        <router-link v-if="!$store.state.loggedIn" to='/register'>Register</router-link>
  
        <router-link v-if="$store.state.loggedIn && $store.state.role == 'admin'" to='/admin-dashboard'>Admin Dash</router-link>
  
        <button class="btn btn-secondary" v-if="$store.state.loggedIn" @click="handleLogout">Logout</button>
      </div>
    `,
    computed: {
      showNavbar() {
        const excludedRoutes = ['/']; // Routes where navbar should not appear
        return !excludedRoutes.includes(this.$route.path);
        
      },
    },
    methods: {
        handleLogout() {
          this.$store.commit('logout'); // Update Vuex state
          this.$router.push('/login').catch(() => {}); // Redirect to login
        },
      },

  };