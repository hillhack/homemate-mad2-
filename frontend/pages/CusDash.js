export default {
  template: `
    <div class="mb-1 p-4 ">
      <h1>Customer Dashboard</h1>

    <div class="mb-1 p-4">
      <button @click="setSection('Profile')">Profile</button>
      <button @click="setSection('Services')">Services</button>
      <button @click="setSection('History')">History</button>
    </div>

      <!-- Profile Section -->
      <div v-if="currentSection === 'Profile'">
        <h3>Profile</h3>
        <form @submit.prevent="updateProfile" class="profile-form">
          <div>
            <label>Name:</label>
            <input v-model="profile.name" placeholder="Name" required />
          </div>

          <div>
            <label>Contact Number:</label>
            <input v-model="profile.contact_no" placeholder="Contact Number" required />
          </div>

          <div>
            <label>Address:</label>
            <input v-model="profile.address" placeholder="Address" required />
          </div>

          <div>
            <button type="submit">Update</button>
          </div>
        </form>
      </div>

      <!-- Services Section -->
      <div  v-if="currentSection === 'Services'">
        <h3>Available Services</h3>

        <!-- Bootstrap Search Bar -->
        <div class="input-group mb-3" style="max-width: 500px; width: 20%;">
          <input 
            type="text" 
            class="form-control" 
            v-model="searchQuery" 
            placeholder="Search services..." 
          />
          <div class="input-group-append">
            <button class="btn btn-outline-secondary" type="button" @click="clearSearch">
              Clear
            </button>
          </div>
        </div>

        <ul>
          <li 
            v-for="service in filteredServices" 
            :key="service.id"
          >
            {{ service.name }} - ₹{{ service.price }}
            <button class="btn btn-outline-secondary" @click="toggleProfessionals(service)">
              {{ selectedService?.id === service.id ? 'Hide Professionals' : 'View Professionals' }}
            </button>

            <!-- Professionals Section -->
            <div class = "form-container" v-if="selectedService?.id === service.id">
              <h4>Professionals for {{ selectedService.name }}</h4>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Experience</th>
                    <th>Rating</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="pro in professionals" :key="pro.id">
                    <td>{{ pro.name }}</td>
                    <td>{{ pro.experience }} years</td>
                    <td>⭐ {{ pro.rating }}/5</td>
                    <td>
                      <button @click="bookService(pro.id)">Book</button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <button class="btn btn-outline-secondary" @click="closeProfessionals">Close</button>
            </div>
          </li>
        </ul>
      </div>

      <!-- History Section -->
      <div v-if="currentSection === 'History'">
        <h3>Service History</h3>
        <table v-if="serviceHistory.length" border="1">
          <thead>
            <tr>
              <th>Service Name</th>
              <th>Amount (₹)</th>
              <th>Professional ID</th>
              <th>Status</th>
              <th>Request Date</th>
              <th>Completion Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="history in serviceHistory" :key="history.id">
              <td>{{ history.name }}</td>
              <td>{{ history.amount }}</td>
              <td>{{ history.professional_id }}</td>
              <td>{{ history.status }}</td>
              <td>{{ history.request_date }}</td>
              <td>{{ history.completion_date || 'Pending' }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else>No service history available.</p>
      </div>
    </div>
  `,

  data() {
    return {
      currentSection: 'Profile',
      profile: {
        id: null,
        name: '',
        contact_no: '',
        address: '',
      },
      services: [],
      searchQuery: '',
      professionals: [],
      serviceHistory: [],
      selectedService: null,
      userId: JSON.parse(localStorage.getItem('user'))?.id || null,
    };
  },

  computed: {
    filteredServices() {
      if (!this.searchQuery) return this.services;
      return this.services.filter(service =>
        service.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },

  methods: {
    async makeRequest(url, method = 'GET', body = null) {
      try {
        const options = {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.$store.state.auth_token,
          },
          body: body ? JSON.stringify(body) : null,
        };

        const response = await fetch(url, options);
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
      } catch (error) {
        console.error('Request Error:', error);
        alert(`Error: ${error.message}`);
        return null;
      }
    },

    async loadData(section) {
      if (section === 'Profile' && this.userId) {
        const data = await this.makeRequest(`/api/customer/profile/${this.userId}`);
        if (data) this.profile = data;
      } 

      if (section === 'Services') {
        this.services = await this.makeRequest('/api/services') || [];
      } 

      if (section === 'History' && this.profile.id) {
        this.serviceHistory = await this.makeRequest(`/api/requests/${this.profile.id}?role=customer`) || [];
      }
    },

    async updateProfile() {
      if (!this.profile.id) return alert('Profile not found!');
      const updated = await this.makeRequest(`/api/customer/profile/${this.userId}`, 'PUT', this.profile);
      if (updated) alert('Profile updated successfully');
    },

    async toggleProfessionals(service) {
      if (this.selectedService?.id === service.id) {
        this.closeProfessionals();
        return;
      }
      this.selectedService = service;
      this.professionals = await this.makeRequest(`/api/professionals?serviceId=${service.id}`) || [];
    },

    closeProfessionals() {
      this.professionals = [];
      this.selectedService = null;
    },

    async bookService(professionalId) {
      if (!this.profile.id) return alert('Profile not found!');
      if (!this.selectedService) return alert('No service selected!');

      const body = {
        professional_id: professionalId,
        service_id: this.selectedService.id,
      };

      const booked = await this.makeRequest(`/api/requests/${this.profile.id}`, 'POST', body);
      if (booked) {
        alert('Service booked successfully');
        this.closeProfessionals();
        this.loadData('History');
      }
    },

    setSection(section) {
      this.currentSection = section;
      this.selectedService = null;
      this.professionals = [];
      this.searchQuery = '';
      this.loadData(section);
    },

    clearSearch() {
      this.searchQuery = '';
    },
  },

  mounted() {
    this.setSection('Profile');
  },
};
