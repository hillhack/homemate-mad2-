export default {
  template: `
    <div>
      <h1>Customer Dashboard</h1>
      <button @click="toggleServices">{{ showServices ? 'Hide Services' : 'View Services' }}</button>
      <button @click="loadServiceHistory">Service History</button>

      <!-- Services Table -->
      <div v-if="showServices">
        <h2>Available Services</h2>
        <div v-if="services.length > 0">
          <table class="service-table">
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Description</th>
                <th>Price</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="service in services" :key="service.id">
                <td>{{ service.name }}</td>
                <td>{{ service.description }}</td>
                <td>₹{{ service.price }}</td>
                <td>
                  <button 
                    class="btn-view" 
                    @click="viewProfessionals(service.id)"
                  >
                    View Professionals
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="no-data">
          No services available
        </div>
      </div>

      <!-- Professionals Modal -->
      <div v-if="showProfessionalsModal" class="modal-overlay">
        <div class="modal-content">
          <h3>Available Professionals for {{ selectedServiceName }}</h3>
          <div v-if="selectedProfessionals.length > 0">
            <table class="professional-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Experience</th>
                  <th>Rating</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="pro in selectedProfessionals" :key="pro.id">
                  <td>{{ pro.name }}</td>
                  <td>{{ pro.experience }} years</td>
                  <td>⭐ {{ pro.rating }}/5</td>
                  <td>{{ pro.description }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="no-data">
            No professionals available
          </div>
          <button class="btn-close" @click="closeModal">Close</button>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      services: [],
      selectedProfessionals: [],
      showServices: false,
      showProfessionalsModal: false,
      selectedServiceName: ""
    };
  },

  methods: {
    async toggleServices() {
      this.showServices = !this.showServices;
      if (this.showServices && this.services.length === 0) {
        await this.loadServices();
      }
    },

    async loadServices() {
      try {
        const token = this.$store.state.auth_token;
        const response = await fetch(`${location.origin}/api/services`, {
          headers: { 'Authentication-Token': token }
        });
        this.services = await response.json();
      } catch (error) {
        console.error("Error loading services:", error);
      }
    },

    async viewProfessionals(serviceId) {
      try {
        const token = this.$store.state.auth_token;
        const response = await fetch(`${location.origin}/api/professionals?serviceId=${serviceId}`, {
          headers: { 'Authentication-Token': token }
        });
        
        this.selectedProfessionals = await response.json();
        this.selectedServiceName = this.services.find(s => s.id === serviceId)?.name || "";
        this.showProfessionalsModal = true;
      } catch (error) {
        console.error("Error loading professionals:", error);
      }
    },

    closeModal() {
      this.showProfessionalsModal = false;
      this.selectedProfessionals = [];
    },

    loadServiceHistory() {
      console.log("Service history functionality placeholder");
    }
  }
};