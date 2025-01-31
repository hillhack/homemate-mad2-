export default {
  template: `
    <div class="dashboard">
      <h1>Welcome, Professional</h1>
      <!-- Navigation Menu -->
      <nav>
        <button @click="currentSection = 'profile'">Edit Profile</button>
        <button @click="currentSection = 'service'">Edit Service</button>
      </nav>
      <hr />

      <!-- Profile Section -->
      <div v-if="currentSection === 'profile'">
        <h2>Update Profile</h2>
        <input placeholder="Name" v-model="profile.name" />
        <input placeholder="Contact Number" v-model="profile.contact_no" />
        <textarea placeholder="Description" v-model="profile.description"></textarea>
        <input
          placeholder="Experience (in years)"
          type="number"
          v-model="profile.experience"
        />
        <button class="btn btn-primary" @click="updateProfile">Save Profile</button>
      </div>

      <!-- Service Section -->
      <div v-if="currentSection === 'service'">
        <h2>Edit Services</h2>
        <div class="form-group">
          <label for="serviceSelect">Select or Add Service</label>
          <select class="form-control" id="serviceSelect" v-model="selectedService">
            <option value="" disabled>-- Select Service --</option>
            <option v-for="service in services" :key="service.id" :value="service.name">
              {{ service.name }}
            </option>
            <option value="new">Add New Service</option>
          </select>
        </div>

        <div v-if="selectedService === 'new'" class="form-group">
          <label for="newServiceName">New Service Name</label>
          <input
            type="text"
            class="form-control"
            v-model="newServiceName"
            placeholder="Enter service name"
          />
        </div>

        <button class="btn btn-primary" @click="submitService">Submit</button>
      </div>
    </div>
  `,
  data() {
    return {
      currentSection: 'profile', // Default section
      profile: {
        name: '',
        contact_no: '',
        description: '',
        experience: 0,
      },
      services: [], // List of services
      selectedService: '', // Selected service
      newServiceName: '', // New service name
    };
  },
  methods: {
    async loadProfile() {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const res = await fetch(`/api/professional/profile/${user.id}`, {
          headers: {
            'Authentication-Token': this.$store.state.auth_token,
            'Content-Type': 'application/json',
          },
        });
        if (res.ok) {
          this.profile = await res.json();
        } else {
          console.error('Failed to load profile:', await res.text());
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    },
    async updateProfile() {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const res = await fetch(`/api/professional/profile/${user.id}`, {
          method: 'PUT',
          headers: {
            'Authentication-Token': this.$store.state.auth_token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.profile),
        });
        if (res.ok) {
          alert('Profile updated successfully');
        } else {
          console.error('Failed to update profile:', await res.text());
        }
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    },
    async loadServices() {
      try {
        const res = await fetch('/api/services');
        if (res.ok) {
          this.services = await res.json();
        } else {
          console.error('Failed to load services:', await res.text());
        }
      } catch (error) {
        console.error('Error loading services:', error);
      }
    },
    async submitService() {
      try {
        const serviceName =
          this.selectedService === 'new' ? this.newServiceName : this.selectedService;
        if (!serviceName) {
          alert('Please enter a valid service name.');
          return;
        }

        const res = await fetch('/api/services', {
          method: 'POST',
          headers: {
            'Authentication-Token': this.$store.state.auth_token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: serviceName }),
        });

        if (res.ok) {
          alert('Service submitted successfully');
          this.loadServices(); // Refresh services
        } else {
          console.error('Failed to submit service:', await res.text());
        }
      } catch (error) {
        console.error('Error submitting service:', error);
      }
    },
  },
  watch: {
    currentSection(newSection) {
      if (newSection === 'profile') {
        this.loadProfile();
      } else if (newSection === 'service') {
        this.loadServices();
      }
    },
  },
  mounted() {
    this.loadProfile();
    this.loadServices();
  },
};