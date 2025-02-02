export default {
  template: `
    <div>
      <h1>Customer Dashboard</h1>
      <button @click="currentSection = 'Profile'">Profile</button>
      <button @click="currentSection = 'Services'">Services</button>
      <button @click="currentSection = 'History'">History</button>

      <div v-if="currentSection === 'Profile'">
        <h3>Profile</h3>
        <form @submit.prevent="updateProfile">
          <input v-model="profile.name" placeholder="Name" required />
          <input v-model="profile.contact_no" placeholder="Contact Number" required />
          <input v-model="profile.address" placeholder="Address" required />
          <button type="submit">Update</button>
        </form>
      </div>

      <div v-if="currentSection === 'Services'">
        <h3>Available Services</h3>
        <ul>
          <li v-for="service in services" :key="service.id">
            {{ service.name }} - ₹{{ service.price }}
            <button @click="viewProfessionals(service)">View Professionals</button>
          </li>
        </ul>
      </div>
      
      <div v-if="professionals.length">
        <h3>Professionals</h3>
        <table>
          <thead><tr><th>Name</th><th>Experience</th><th>Rating</th><th>Action</th></tr></thead>
          <tbody>
            <tr v-for="pro in professionals" :key="pro.id">
              <td>{{ pro.name }}</td><td>{{ pro.experience }} years</td><td>⭐ {{ pro.rating }}/5</td>
              <td><button @click="bookService(pro.id)">Book</button></td>
            </tr>
          </tbody>
        </table>
        <button @click="closeProfessionals">Close</button>
      </div>
      
      <div v-if="currentSection === 'History'">
        <h3>Service History</h3>
        <ul><li v-for="history in serviceHistory" :key="history.id">{{ history.serviceName }} - ₹{{ history.amount }}</li></ul>
      </div>
    </div>
  `,

  data() {
    return {
      currentSection: 'Profile',
      profile: {},
      services: [],
      professionals: [],
      serviceHistory: [],
      selectedService: null,
      userId: JSON.parse(localStorage.getItem('user'))?.id || null,  // Handle null case
    };
  },

  methods: {
    async fetchData(url) {
      try {
        const res = await fetch(url, { headers: { 'Authentication-Token': this.$store.state.auth_token } });
        if (!res.ok) {
          throw new Error('Failed to fetch data');
        }
        return await res.json();
      } catch (error) {
        console.error(error);
        alert('An error occurred. Please try again later.');
        return [];
      }
    },

    async loadProfile() {
      if (this.userId) {
        this.profile = await this.fetchData(`/api/customer/profile/${this.userId}`);
      }
    },

    async updateProfile() {
      if (this.userId) {
        const res = await fetch(`/api/customer/profile/${this.userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authentication-Token': this.$store.state.auth_token },
          body: JSON.stringify(this.profile),
        });
        if (res.ok) {
          alert('Profile updated');
        } else {
          alert('Failed to update profile');
        }
      }
    },

    async loadServices() {
      this.services = await this.fetchData('/api/services');
    },

    async viewProfessionals(service) {
      this.selectedService = service;
      this.professionals = await this.fetchData(`/api/professionals?serviceId=${service.id}`);
    },

    closeProfessionals() {
      this.professionals = [];
    },

    // Book service without calling loadProfile() again (as profile is already loaded)
    async bookService(professionalId) {
      if (!this.profile.id) {
        alert('Profile not found!');
        return;
      }

      if (!this.selectedService) {
        alert('No service selected!');
        return;
      }

      const res = await fetch(`/api/requests/${this.profile.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authentication-Token': this.$store.state.auth_token },
        body: JSON.stringify({
          professional_id: professionalId,
          service_id: this.selectedService.id,
        }),
      });

      if (res.ok) {
        alert('Service booked');
        this.closeProfessionals();
        this.loadServiceHistory(); // Refresh service history after booking
      } else {
        alert('Failed to book service');
      }
    },

    // Load service history using profile.id
    async loadServiceHistory() {
      const role = 'customer';
      if (this.profile.id) {
        this.serviceHistory = await this.fetchData(`/api/requests/${this.profile.id}?role=${role}`);
      }
    },
  },

  mounted() {
    this.loadProfile();
    this.loadServices();
    this.loadServiceHistory();
  }
};
