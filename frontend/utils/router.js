const Welcome = {
    template: `
      <div class="container">
        <h1>Welcome to Homemate</h1>
        <p class="welcome-text">
          Your one-stop solution for all household services. Book trusted professionals with ease.
        </p>
        <div>
        <button class="btn btn-primary mt-3" @click="goToHome">Let's Get Started</button>
        </div>
        <img src="https://i.pinimg.com/originals/8c/3b/1c/8c3b1c3dfbd96e736518450bbab3eda4.gif" alt="Household Services" class="hero-gif">
    </div>
    `,
    methods: {
      goToHome() {
        this.$router.push('/home');
      }
    }
  };
  
  import HomePage from '../pages/Home.js';
  import AdminDashboardPage from "../pages/AdminDash.js";
  import LoginPage from "../pages/Login.js";
  import CusPage from "../pages/CusDash.js";
  import ProfPage from "../pages/ProfDash.js";
  import RegisterPage from "../pages/Register.js"
  import ProfessionalDetail from '../pages/ProfStats.js';
  import store from './store.js';
  import CustomerDetail from '../pages/CusStats.js';
  
  const routes = [
    { path: '/', component: Welcome },
    { path: '/home', component: HomePage },
    { path: '/login', component: LoginPage },
    { path: '/register', component: RegisterPage },
    { 
      path: '/prof-dashboard', 
      component: ProfPage, 
      meta: { requiresLogin: true, role: "professional" } 
    },
    { 
      path: '/admin-dashboard', 
      component: AdminDashboardPage, 
      meta: { requiresLogin: true, role: "admin" } 
    },
    { 
      path: '/cus-dashboard', 
      component: CusPage, 
      meta: { requiresLogin: true, role: 'customer' } 
    },
    { 
      path: '/professional/stats/:id', 
      component: ProfessionalDetail, 
      name: 'ProfStats', 
      props: true 
    },
    { 
      path: '/customer/stats/:id', 
      component: CustomerDetail, 
      name: 'CusStats', 
      props: true 
    },
    // ✅ Fallback route for unmatched paths
    { path: '*', redirect: '/' }
  ];
  
  const router = new VueRouter({
    routes
  });
  
  // ✅ Navigation Guards
  router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.requiresLogin)) {
      if (!store.state.loggedIn) {
        next({ path: '/login' });
      } else if (to.meta.role && to.meta.role !== store.state.role) { // ✅ Use strict equality
        alert('Role not authorized');
        next({ path: '/' });
      } else {
        next();
      }
    } else {
      next();
    }
  });
  
  export default router;
  