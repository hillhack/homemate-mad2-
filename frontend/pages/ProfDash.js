export default {
  template: `
    <div>
      <h1>Hi {{ profile.name }}</h1>
      <button @click="currentSection = 'profile'">Edit Profile</button>
      <button @click="currentSection = 'pending'">Requests</button>
      <button @click="currentSection = 'work'">Current Work</button>
      <button @click="currentSection = 'history'">History</button>

      <!-- Profile Section -->
      <div v-if="currentSection === 'profile'" class="section">
        <h2>Edit Profile</h2>
        <div class="form-container">
          <div>
            <input v-model="profile.name" placeholder="Name" required />
          </div>
          <div>
            <input v-model="profile.contact_no" placeholder="Contact Number" required />
          </div>
          <div>
            <textarea v-model="profile.description" placeholder="Description"></textarea>
          </div>
          <div>
            <input v-model="profile.experience" type="number" placeholder="Experience (years)" min="0" />
          </div>

          <!-- Service Selection -->
          <div>
            <select v-model="profile.service_id" required>
              <option value="" disabled>Select a service</option>
              <option v-for="service in availableServices" :key="service.id" :value="service.id">
                {{ service.name }}
              </option>
              <option value="new">Add New Service...</option>
            </select>
          </div>

          <div v-if="profile.service_id === 'new'">
            <input 
              v-model="newServiceName" 
              placeholder="New Service Name" 
              required 
            />
          </div>
          
          <div>
            <button @click="updateProfile" :disabled="isSaving">
              {{ isSaving ? 'Saving...' : 'Save Profile' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Pending Requests -->
      <div v-if="currentSection === 'pending'" class="section">
        <h2>Pending Requests</h2>
        <ul v-if="pendingRequests.length">
          <li v-for="request in pendingRequests" :key="request.id">
            <p><strong>Service:</strong> {{ getServiceName(request.service_id) }}</p>
            <p><strong>Date:</strong> {{ formatDate(request.request_date) }}</p>
            <button @click="updateRequestStatus(request.id, 'Accepted')">Accept</button>
            <button @click="updateRequestStatus(request.id, 'Rejected')">Reject</button>
          </li>
        </ul>
        <p v-else>No pending requests found.</p>
      </div>

      <!-- Current Work -->
      <div v-if="currentSection === 'work'" class="section">
        <h2>Current Work</h2>
        <ul v-if="currentWork.length">
          <li v-for="work in currentWork" :key="work.id">
            <p><strong>Service:</strong> {{ getServiceName(work.service_id) }}</p>
            <p><strong>Started:</strong> {{ formatDate(work.request_date) }}</p>
          </li>
        </ul>
        <p v-else>No ongoing work.</p>
      </div>

      <!-- History Section -->
      <div v-if="currentSection === 'history'" class="section">
        <h2>Service History</h2>
        <ul>
          <li v-for="record in completed" :key="record.id">
            <p><strong>Completed Service:</strong> {{ getServiceName(record.service_id) }}</p>
            <p><strong>Completed Date:</strong> {{ formatDate(record.request_date) }}</p>
          </li>
          <li v-for="record in rejectedRequests" :key="record.id">
            <p><strong>Rejected Service:</strong> {{ getServiceName(record.service_id) }}</p>
            <p><strong>Request Date:</strong> {{ formatDate(record.request_date) }}</p>
          </li>
        </ul>
        <p v-if="!completed.length && !rejectedRequests.length">No past records.</p>
      </div>
    </div>
  `,

  data() {
    return {
      currentSection: 'profile',
      profile: {
        id: null,
        name: '',
        contact_no: '',
        description: '',
        experience: 0,
        service_id: null
      },
      availableServices: [],
      newServiceName: '',
      pendingRequests: [],
      currentWork: [],
      completed: [],
      rejectedRequests: [],
      isSaving: false
    };
  },

  methods: {
    async loadProfile() {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        alert('User not logged in');
        return;
      }
      try {
        const profileData = await this.fetchData(`/api/professional/profile/${user.id}`);
        this.profile = profileData;

        this.availableServices = await this.fetchData('/api/services');
        if (!this.availableServices.some(service => service.id === this.profile.service_id)) {
          this.profile.service_id = '';
        }
        await this.loadRequests();
      } catch (error) {
        console.error('Failed to load profile:', error);
        alert('Failed to load profile');
      }
    },

    async loadRequests() {
      if (!this.profile.id) return;
      try {
        const allRequests = await this.fetchData(`/api/requests/${this.profile.id}?role=professional`);
        this.pendingRequests = allRequests.filter(request => request.status === 'Pending');
        this.rejectedRequests = allRequests.filter(request => request.status === 'Rejected');
        this.currentWork = allRequests.filter(request => request.status === 'Accepted');
        this.completed = allRequests.filter(request => request.status === 'Completed');
      } catch (error) {
        console.error('Failed to load requests:', error);
        alert('Failed to load requests');
      }
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
        alert('Profile updated successfully');
        await this.loadProfile();
      } catch (error) {
        console.error('Update failed:', error);
        alert('Update failed');
      } finally {
        this.isSaving = false;
      }
    },

    async fetchData(url, method = 'GET', body = null) {
      try {
        const res = await fetch(url, {
          method,
          headers: {
            'Authentication-Token': this.$store.state.auth_token,
            'Content-Type': 'application/json'
          },
          body: body ? JSON.stringify(body) : null
        });

        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
        return await res.json();
      } catch (error) {
        console.error(`Fetch error: ${error}`);
        throw error;
      }
    },

    getServiceName(serviceId) {
      const service = this.availableServices.find(s => s.id === serviceId);
      return service ? service.name : 'Unknown Service';
    },

    formatDate(dateString) {
      const date = new Date(dateString);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    },

    async updateRequestStatus(requestId, status) {
      try {
        await this.fetchData(`/api/requests/${requestId}`, 'PUT', { status });
        alert(`Request ${status}`);
        await this.loadRequests();
      } catch (error) {
        console.error(`Failed to update request: ${error}`);
        alert('Failed to update request');
      }
    }
  },

  mounted() {
    this.loadProfile();
  }
};
