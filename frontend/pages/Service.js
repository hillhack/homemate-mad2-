export default {
    template: `<div>
      <h1>Manage Services</h1>
      <select v-model="selectedService" @change="loadServiceDetails">
        <option value="" disabled>-- Select Service --</option>
        <option v-for="service in services" :key="service.id" :value="service.id">
          {{ service.name }}
        </option>
        <option value="new">Add New Service</option>
      </select>
      
      <div v-if="selectedService === 'new'">
        <input v-model="newServiceName" placeholder="New Service Name" />
        <button @click="addService">Add</button>
      </div>
      
      <div v-if="selectedService && selectedService !== 'new'">
        <input v-model="selectedServiceName" placeholder="Edit Service Name" />
        <button @click="updateService">Update</button>
      </div>
    </div>`,
    data() {
      return {
        services: [],
        selectedService: '',
        newServiceName: '',
        selectedServiceName: ''
      };
    },
    methods: {
      async fetchServices() {
        try {
          const response = await fetch('/api/services');
          if (response.ok) this.services = await response.json();
        } catch { alert('Error fetching services.'); }
      },
      loadServiceDetails() {
        const service = this.services.find(s => s.id === this.selectedService);
        this.selectedServiceName = service ? service.name : '';
      },
      async addService() {
        if (!this.newServiceName) return alert('Enter a name.');
        try {
          const response = await fetch('/api/services', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: this.newServiceName })
          });
          if (response.ok) this.fetchServices();
        } catch { alert('Error adding service.'); }
      },
      async updateService() {
        if (!this.selectedServiceName) return alert('Enter a name.');
        try {
          const response = await fetch(`/api/services/${this.selectedService}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: this.selectedServiceName })
          });
          if (response.ok) this.fetchServices();
        } catch { alert('Error updating service.'); }
      }
    },
    mounted() { this.fetchServices(); }
  };
  