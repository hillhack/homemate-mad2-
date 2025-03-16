export default {
  template: `
    <div>
      <h1 class="mb-4 text-center">Customer Dashboard</h1>

      <!-- Navigation Buttons -->
      <div class="d-flex gap-2 mb-4 justify-content-center">
        <button 
          v-for="section in sections" 
          :key="section" 
          @click="setSection(section)"
          class="btn btn-outline-primary"
        >
          {{ section }}
        </button>
      </div>

      <!-- Profile Section -->
      <div v-if="currentSection === 'Profile'" class="bg-dark-transparent p-4 rounded w-50 h-50">
        <h3 class="mb-4">Profile</h3>
        <form @submit.prevent="updateProfile">
          <div v-for="field in profileFields" :key="field" class="mb-3">
            <label class="form-label">{{ field }}:</label>
            <input 
              v-model="profile[field]" 
              :placeholder="field" 
              class="form-control bg-transparent text-white" 
              required 
            />
          </div>
          <button type="submit" class="btn btn-outline-light">Update</button>
        </form>
      </div>

      <!-- Services Section -->
      <div v-if="currentSection === 'Services'" class="bg-dark-transparent p-4 w-50 rounded">
        <h3 class="mb-4">Available Services</h3>

        <!-- Search Bar -->
        <div class="input-group mb-4">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search services..." 
            class="form-control bg-transparent text-white" 
          />
          <button @click="clearSearch" class="btn btn-outline-secondary">
            Clear
          </button>
        </div>

        <!-- Services List -->
        <ul class="list-group">
          <li 
            v-for="service in filteredServices" 
            :key="service.id" 
            class="list-group-item bg-transparent text-white d-flex justify-content-between align-items-center border-secondary"
          >
            <div>
              <strong>{{ service.name }}</strong> - ₹{{ service.base_price }}
            </div>
            <button 
              @click="toggleProfessionals(service)"
              class="btn btn-sm btn-outline-info"
            >
              {{ selectedService?.id === service.id ? 'Hide Professionals' : 'View Professionals' }}
            </button>
          </li>
        </ul>

        <!-- Professionals Section -->
        <div v-if="selectedService" class="mt-4">
          <h4>Professionals for {{ selectedService.name }}</h4>
          <div v-if="professionals.length" class="table-responsive">
            <table class="table table-dark table-striped">
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
                  <td>⭐ {{ pro.average_rating }}/5</td>
                  <td>
                    <button @click="bookService(pro.id)" class="btn btn-sm btn-success">
                      Book
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="alert alert-warning">
            Sorry, no professionals are available for this service yet.
          </div>
          <button @click="closeProfessionals" class="btn btn-sm btn-outline-secondary">
            Close
          </button>
        </div>
      </div>

      <!-- Current Services Section -->
      <div v-if="currentSection === 'CurrentServices'" class="bg-dark-transparent p-4 w-50 rounded">
        <h3 class="mb-4">Current Services</h3>
        <div v-if="currentServices.length" class="table-responsive">
          <table class="table-bordered table-hover">
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Professional ID</th>
                <th>Request Date</th>
                <th>Completion Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="service in currentServices" :key="service.id">
                <td>{{ service.name }}</td>
                <td>{{ service.professional_id }}</td>
                <td>{{ formatDate(service.request_date) }}</td>
                <td>{{ service.status }}</td>
                <td>
                  <input 
                    type="date" 
                    :value="formatCompletionDate(service.completion_date)" 
                    @input="service.completion_date = $event.target.value" 
                    :disabled="!service.isEditing" 
                    class="form-control"
                  />
                </td>
                <td>
                  <div class="d-flex gap-2 align-items-center">
                    <button 
                      @click="service.isEditing ? saveCompletionDate(service) : editCompletionDate(service)"
                      class="btn btn-sm btn-outline-primary"
                    >
                      {{ service.isEditing ? 'Save' : 'Edit' }}
                    </button>
                    <button 
                      @click="cancelService(service.id)" 
                      class="btn btn-sm btn-outline-danger"
                    >
                      Cancel
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="text-muted">No current services available.</p>
      </div>

      <!-- History Section -->
<div v-if="currentSection === 'History'" class="bg-dark-transparent p-4 rounded">
  <h3 class="mb-4">Service History</h3>
  <div v-if="serviceHistory.length" class="table-responsive">
    <table class="table table-dark table-striped">
      <thead>
        <tr>
          <th>Service Name</th>
          <th>ID</th>
          <th>Amount (₹)</th>
          <th>Professional ID</th>
          <th>Status</th>
          <th>Request Date</th>
          <th>Completion Date</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="history in serviceHistory" :key="history.id">
          <td>{{ history.name }}</td>
          <td>{{ history.id }}</td>
          <td>{{ history.amount }}</td>
          <td>{{ history.professional_id }}</td>
          <td>{{ history.status }}</td>
          <td>{{ formatDate(history.request_date) }}</td>
          <td>{{ formatCompletionDate(history.completion_date) || 'Pending' }}</td>
          <td>
            <!-- Show Feedback Options for Completed Services -->
            <div v-if="history.status === 'Completed'">
              <!-- If feedback exists, show "See Feedback" button -->
              <div v-if="history.review">
                <button 
                  class="btn btn-sm btn-outline-info" 
                  @click="toggleFeedbackDisplay(history)"
                >
                  {{ history.showFeedback ? 'Close Feedback' : 'See Feedback' }}
                </button>
                <!-- Display Feedback -->
                <div v-if="history.showFeedback" class="mt-3">
                  <p><strong>Rating:</strong> ⭐ {{ history.review.rating }}/5</p>
                  <p><strong>Review:</strong> {{ history.review.comment }}</p>
                </div>
              </div>
              <!-- If no feedback exists, show "Give Feedback" button and form -->
              <div v-else>
                <button 
                  class="btn btn-sm btn-outline-success" 
                  @click="history.showFeedbackForm = !history.showFeedbackForm"
                >
                  {{ history.showFeedbackForm ? 'Close Form' : 'Give Feedback' }}
                </button>
                <!-- Feedback Form -->
                <div v-if="history.showFeedbackForm" class="mt-3">
                  <form @submit.prevent="submitFeedback(history)">
                    <div class="mb-2">
                      <label for="rating" class="form-label">Rating (1-5):</label>
                      <input
                        type="number"
                        v-model="history.rating"
                        min="1"
                        max="5"
                        class="form-control bg-transparent text-white"
                        required
                      />
                    </div>
                    <div class="mb-2">
                      <label for="comment" class="form-label">Review:</label>
                      <textarea
                        v-model="history.comment"
                        class="form-control bg-transparent text-white"
                        rows="2"
                        required
                      ></textarea>
                    </div>
                    <button type="submit" class="btn btn-sm btn-outline-success">
                      Submit Feedback
                    </button>
                  </form>
                </div>
              </div>
            </div>
            <span v-else class="text-muted">No action required</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <p v-else class="text-muted">No service history available.</p>
</div>
  `,

  data() {
    return {
      sections: ['Profile', 'Services', 'CurrentServices', 'History'],
      currentSection: 'Profile',
      profile: { id: null, name: '', contact_no: '', address: '' },
      profileFields: ['name', 'contact_no', 'address'],
      services: [],
      searchQuery: '',
      professionals: [],
      serviceHistory: [],
      currentServices: [], // Holds services with status "Accepted"
      selectedService: null,
      userId: JSON.parse(localStorage.getItem('user'))?.id || null,
    };
  },

  computed: {
    filteredServices() {
      return this.services.filter(service =>
        service.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },

  methods: {
    // Format the completion_date for display in the input field
    formatCompletionDate(date) {
      if (!date) return ''; // Handle null or undefined dates
      const jsDate = new Date(date);
      return jsDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    },

    // Format any date for display
    formatDate(date) {
      if (!date) return ''; // Handle null or undefined dates
      const jsDate = new Date(date);
      return jsDate.toLocaleDateString(); // Format as locale-specific date
    },

    async makeRequest(url, method = 'GET', body = null) {
      try {
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.$store.state.auth_token,
          },
          body: body ? JSON.stringify(body) : null,
        });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
      } catch (error) {
        console.error('Request Error:', error);
        alert(`Error: ${error.message}`);
        return null;
      }
    },

    async loadData() {
      const endpoints = {
        Profile: `/api/customer/profile/${this.userId}`,
        Services: '/api/services',
        CurrentServices: `/api/requests/${this.profile.id}?role=customer`,
        History: `/api/requests/${this.profile.id}?role=customer`,
      };
    
      const data = await this.makeRequest(endpoints[this.currentSection]);
      if (data) {
        if (this.currentSection === 'Profile') this.profile = data;
        else if (this.currentSection === 'Services') this.services = data;
        else if (this.currentSection === 'CurrentServices') {
          this.currentServices = data.filter(req => req.status === 'Accepted' || req.status === 'Pending').map(req => ({ ...req, isEditing: false }));
        } else if (this.currentSection === 'History') {
          // Fetch reviews for completed services
          const historyWithReviews = await Promise.all(
            data.map(async (history) => {
              if (history.status === 'Completed') {
                const reviewResponse = await this.makeRequest(`/api/reviews?request_id=${history.id}`);
                // Handle empty reviews array
                const review = reviewResponse?.reviews?.length > 0 ? reviewResponse.reviews[0] : null;
                return { 
                  ...history, 
                  review: review, // Set to null if no review exists
                  rating: null, 
                  comment: '', 
                  showFeedbackForm: false, // Initialize feedback form visibility
                  showFeedback: false, // Initialize feedback display visibility
                };
              }
              return history;
            })
          );
          this.serviceHistory = historyWithReviews;
        }
      }
    },

    async updateProfile() {
      if (!this.profile.id) return alert('Profile not found!');
      const updated = await this.makeRequest(`/api/customer/profile/${this.userId}`, 'PUT', this.profile);
      if (updated) alert('Profile updated successfully');
    },

    async toggleProfessionals(service) {
      if (this.selectedService?.id === service.id) return this.closeProfessionals();
      this.selectedService = service;
      this.professionals = (await this.makeRequest(`/api/professionals?serviceId=${service.id}`) || []).filter(pro => pro.approved_status === 'approved');
    },

    closeProfessionals() {
      this.professionals = [];
      this.selectedService = null;
    },

    async bookService(professionalId) {
      if (!this.profile.id || !this.selectedService) return alert('Invalid selection!');
      const booked = await this.makeRequest(`/api/requests/${this.profile.id}`, 'POST', {
        professional_id: professionalId,
        service_id: this.selectedService.id,
      });
      if (booked) {
        alert('Service booked successfully');
        this.closeProfessionals();
        this.loadData();
      }
    },

    async cancelService(requestId) {
      if (!confirm('Are you sure you want to cancel this service request?')) return;

      try {
        const response = await this.makeRequest(
          `/api/requests/${this.profile.id}?role=customer`, 
          'PUT', 
          {
            request_id: requestId,
            status: 'Cancelled',
          }
        );

        if (response) {
          alert('Service request cancelled successfully');
          await this.loadData(); // Refresh the data to reflect the changes
        }
      } catch (error) {
        console.error('Error cancelling service request:', error);
        alert('Failed to cancel service request. Please try again.');
      }
    },

    async submitFeedback(history) {
      if (!history.rating || !history.comment) {
        alert('Please provide a rating and review.');
        return;
      }

      try {
        const response = await this.makeRequest(
          `/api/reviews`, 
          'POST', 
          {
            rating: history.rating,
            comment: history.comment,
            service_request_id: history.id,
          }
        );

        if (response) {
          alert('Feedback submitted successfully');
          await this.loadData(); // Refresh the data to reflect the changes
        }
      } catch (error) {
        console.error('Error submitting feedback:', error);
        alert('Failed to submit feedback. Please try again.');
      }
    },

    toggleFeedbackDisplay(history) {
      history.showFeedback = !history.showFeedback;
    },

    editCompletionDate(service) {
      service.isEditing = true;
    },

    async saveCompletionDate(service) {
      if (!service.completion_date) {
        alert('Please select a completion date.');
        return;
      }

      try {
        // Convert the completion_date to ISO format
        const completionDateISO = new Date(service.completion_date).toISOString();
        console.log('Sending completion_date to backend:', completionDateISO);

        // Send the update request to the backend
        const updated = await this.makeRequest(
          `/api/requests/${service.id}`, 
          'PUT', 
          {
            completion_date: completionDateISO,
          }
        );

        if (updated) {
          console.log('Backend response:', updated);
          alert('Completion date updated successfully');

          // Refresh the data to reflect the changes
          await this.loadData();

          // Disable editing mode
          service.isEditing = false;
        }
      } catch (error) {
        console.error('Error updating completion date:', error);
        alert('Failed to update completion date. Please try again.');
      }
    },

    setSection(section) {
      this.currentSection = section;
      this.selectedService = null;
      this.professionals = [];
      this.searchQuery = '';
      this.loadData();
    },

    clearSearch() {
      this.searchQuery = '';
    },
  },

  mounted() {
    this.setSection('Profile');
  },
};