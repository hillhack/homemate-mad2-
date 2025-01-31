export default {
  template: `
  <div>
    <nav>
      <button @click="currentSection = 'profile'">Edit Profile</button>
      <button @click="currentSection = 'history'">History</button>
    </nav>
    
    <div v-if="currentSection === 'profile'">
      <h2>Update Profile</h2>
      <input placeholder="Name" v-model="profile.name" required />
      <input placeholder="Contact Number" v-model="profile.contact_no" required />
      <textarea placeholder="Description" v-model="profile.description"></textarea>
      <input type="number" placeholder="Experience (years)" v-model="profile.experience" min="0" />
      <select v-model="profile.service_id" required>
        <option value="" disabled>Select a service</option>
        <option v-for="service in availableServices" :key="service.id" :value="service.id">{{ service.name }}</option>
        <option value="new">Add New Service...</option>
      </select>
      <input v-if="profile.service_id === 'new'" placeholder="New Service Name" v-model="newServiceName" required />
      <button @click="updateProfile" :disabled="isSaving">{{ isSaving ? 'Saving...' : 'Save Profile' }}</button>
    </div>

    <div v-if="currentSection === 'history'">
      <h2>Service History</h2>
      <p>Past service records...</p>
    </div>
  </div>
  `,
  data() {
    return {
      currentSection: 'profile',
      profile: { name: '', contact_no: '', description: '', experience: 0, service_id: null },
      availableServices: [],
      newServiceName: '',
      isSaving: false
    };
  },
  methods: {
    async loadProfile() {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        this.profile = await this.fetchData(`/api/professional/profile/${user.id}`);
      } catch { alert('Failed to load profile'); }
    },
    async updateProfile() {
      if (this.isSaving) return;
      try {
        this.isSaving = true;
        const user = JSON.parse(localStorage.getItem('user'));
        if (this.profile.service_id === 'new' && this.newServiceName.trim()) {
          const newService = await this.fetchData('/api/services', 'POST', { name: this.newServiceName.trim() });
          this.profile.service_id = newService.id;
          this.newServiceName = '';
        }
        await this.fetchData(`/api/professional/profile/${user.id}`, 'PUT', this.profile);
        alert('Profile updated');
      } catch { alert('Update failed'); }
      finally { this.isSaving = false; }
    },
    async fetchData(url, method = 'GET', body = null) {
      const res = await fetch(url, {
        method,
        headers: { 'Authentication-Token': this.$store.state.auth_token, 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : null
      });
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      return res.json();
    }
  },
  mounted() {
    this.loadProfile();
  }
};
