export default {
  template: `
    <div class="container mt-4">
      <h1 class="text-center mb-4">Hi {{ profile.name }}</h1>
      <div class="d-flex justify-content-center gap-2 mb-4">
        <button 
          @click="currentSection = 'profile'" 
          class="btn btn-outline-primary"
        >
          Edit Profile
        </button>
        <button 
          @click="currentSection = 'pending'" 
          class="btn btn-outline-primary"
        >
          Requests
        </button>
        <button 
          @click="currentSection = 'work'" 
          class="btn btn-outline-primary"
        >
          Current Work
        </button>
        <button 
          @click="currentSection = 'history'" 
          class="btn btn-outline-primary"
        >
          History
        </button>
      </div>

      <!-- Profile Section -->
      <div v-if="currentSection === 'profile'" class="bg-dark-transparent p-4 rounded w-50 h-50">
        <h2 class="card-title mb-4">Edit Profile</h2>
        <form @submit.prevent="updateProfile">
          <div class="mb-3">
            <input 
              v-model="profile.name" 
              placeholder="Name" 
              class="form-control" 
              required 
            />
          </div>
          <div class="mb-3">
            <input 
              v-model="profile.contact_no" 
              placeholder="Contact Number" 
              class="form-control" 
              required 
            />
          </div>
          <div class="mb-3">
            <textarea 
              v-model="profile.description" 
              placeholder="Description" 
              class="form-control"
            ></textarea>
          </div>
          <div class="mb-3">
            <input 
              v-model="profile.experience" 
              type="number" 
              placeholder="Experience (years)" 
              min="0" 
              class="form-control" 
            />
          </div>

          <!-- Service Selection -->
          <div class="mb-3">
            <select 
              v-model="profile.service_id" 
              class="form-select" 
              required
            >
              <option value="" disabled>Select a service</option>
              <option 
                v-for="service in availableServices" 
                :key="service.id" 
                :value="service.id"
              >
                {{ service.name }}
              </option>
              <option value="new">Add New Service...</option>
            </select>
          </div>

          <div v-if="profile.service_id === 'new'" class="mb-3">
            <input 
              v-model="newServiceName" 
              placeholder="New Service Name" 
              class="form-control" 
              required 
            />
          </div>
          
          <div>
            <button 
              @click="updateProfile" 
              :disabled="isSaving" 
              class="btn btn-success"
            >
              {{ isSaving ? 'Saving...' : 'Save Profile' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Pending Requests -->
      <div v-if="currentSection === 'pending'" class="bg-dark-transparent p-4 rounded">
        <h2 class="card-title mb-4">Pending Requests</h2>
        <div v-if="pendingRequests.length" class="table-responsive">
          <table class="table table-bordered">
            <thead class="table-dark">
              <tr>
                <th>Service</th>
                <th>Customer ID</th>
                <th>Request Date</th>
                <th>Completion Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="request in pendingRequests" :key="request.id">
                <td>{{ getServiceName(request.service_id) }}</td>
                <td>{{ request.customer_id }}</td>
                <td>{{ formatDate(request.request_date) }}</td>
                <td>
                  <input 
                    type="date" 
                    v-model="request.completion_date" 
                    class="form-control" 
                  />
                </td>
                <td>
                  <div class="d-flex gap-2">
                    <button 
                      @click="updateRequestStatus(request.id, 'Accepted')" 
                      class="btn btn-sm btn-success"
                    >
                      Accept
                    </button>
                    <button 
                      @click="updateRequestStatus(request.id, 'Rejected')" 
                      class="btn btn-sm btn-danger"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="text-muted">No pending requests found.</p>
      </div>

      <!-- Current Work -->
      <div v-if="currentSection === 'work'" class="card p-4 mb-4">
        <h2 class="card-title mb-4">Current Work</h2>
        <div v-if="currentWork.length" class="table-responsive">
          <table class="table table-bordered">
            <thead class="table-dark">
              <tr>
                <th>Service</th>
                <th>Started</th>
                <th>Completion Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="work in currentWork" :key="work.id">
                <td>{{ getServiceName(work.service_id) }}</td>
                <td>{{ formatDate(work.request_date) }}</td>
                <td>{{ work.completion_date ? formatDate(work.completion_date) : 'Not Set' }}</td>
                <td>
                  <button 
                    @click="markAsCompleted(work.id)" 
                    class="btn btn-sm btn-success"
                  >
                    Mark as Completed
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="text-muted">No ongoing work.</p>
      </div>

      <!-- History Section -->
      <div v-if="currentSection === 'history'" class="card p-4 mb-4">
        <h2 class="card-title mb-4">Work History</h2>
        <div v-if="completed.length || rejectedRequests.length" class="table-responsive">
          <table class="table table-bordered">
            <thead class="table-dark">
              <tr>
                <th>ID</th>
                <th>Service Name</th>
                <th>Service ID</th>
                <th>Customer ID</th>
                <th>Status</th>
                <th>Request Date</th>
                <th>Completion Date</th>
              </tr>
            </thead>
            <tbody>
              <!-- Completed Requests -->
              <tr v-for="record in completed" :key="record.id">
                <td>{{ record.id }}</td>
                <td>{{ record.service.name }}</td>
                <td>{{ record.service_id }}</td>
                <td>{{ record.customer_id }}</td>
                <td>{{ record.status }}</td>
                <td>{{ formatDate(record.request_date) }}</td>
                <td>{{ formatDate(record.completion_date) }}</td>
              </tr>
              <!-- Rejected Requests -->
              <tr v-for="record in rejectedRequests" :key="record.id">
                <td>{{ record.id }}</td>
                <td>{{ record.service.name }}</td>
                <td>{{ record.service_id }}</td>
                <td>{{ record.customer_id }}</td>
                <td>{{ record.status }}</td>
                <td>{{ formatDate(record.request_date) }}</td>
                <td>{{ formatDate(record.completion_date) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="text-muted">No past records.</p>
      </div>
    </div>
  `,

  data() {
    return {
      currentSection: 'profile', // Default section
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
        
        // Fetch service details for each request
        const requestsWithService = await Promise.all(
          allRequests.map(async (request) => {
            const service = await this.fetchData(`/api/services/${request.service_id}`);
            return { ...request, service };
          })
        );

        this.pendingRequests = requestsWithService.filter(request => request.status === 'Pending');
        this.rejectedRequests = requestsWithService.filter(request => request.status === 'Rejected');
        this.currentWork = requestsWithService.filter(request => request.status === 'Accepted');
        this.completed = requestsWithService.filter(request => request.status === 'Completed');
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
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    },

    async updateRequestStatus(requestId, status) {
      try {
        const payload = {
          request_id: requestId,
          status: status
        };

        if (status === 'Completed') {
          payload.completion_date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        }

        await this.fetchData(`/api/requests/${this.profile.id}?role=professional`, 'PUT', payload);
        alert(`Request ${status}`);
        await this.loadRequests(); // Refresh the data after updating
      } catch (error) {
        console.error(`Failed to update request: ${error}`);
        alert('Failed to update request');
      }
    },

    async markAsCompleted(requestId) {
      try {
        await this.updateRequestStatus(requestId, 'Completed');
        alert('Work marked as completed successfully');
        await this.loadRequests(); // Refresh the data after updating
      } catch (error) {
        console.error('Failed to mark as completed:', error);
        alert('Failed to mark as completed');
      }
    }
  },

  mounted() {
    this.loadProfile();
  }
};