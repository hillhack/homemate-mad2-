const Home = {
    template : `<h1> this is home </h1>`
}
import AdminDashboardPage from "../pages/AdminDash.js";
import LoginPage from "../pages/Login.js";
import CusPage from "../pages/CusDash.js";
import ProfPage from "../pages/ProfDash.js";
import RegisterPage from "../pages/Register.js";
import ProfessionalDetail from '../pages/ProfStats.js';
import store from './store.js'


const routes = [
    {path : '/', component : Home},
    {path : '/login', component : LoginPage},
    {path : '/register', component : RegisterPage},
    {path : '/prof-dashboard', component : ProfPage, meta : {requiresLogin : true, role : "professional"}},
    {path : '/admin-dashboard', component : AdminDashboardPage, meta : {requiresLogin : true, role : "admin"}},
    { path: '/cus-dashboard', component: CusPage, meta: { requiresLogin: true, role: 'customer' } },
    {path: '/professional/stats/:id',component: ProfessionalDetail,name: 'ProfStats',props: true, },
    
]

const router = new VueRouter({
    routes
})

// navigation guards
router.beforeEach((to, from, next) => {
    if (to.matched.some((record) => record.meta.requiresLogin)){
        if (!store.state.loggedIn){
            next({path : '/login'})
        } else if (to.meta.role && to.meta.role != store.state.role){
            alert('role not authorized')
             next({path : '/'})
        } else {
            next();
        }
    } else {
        next();
    }
})


export default router;