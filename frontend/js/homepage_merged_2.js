// SkillSwap JavaScript functionality
let currentSection = 'home';
let editMode = false;
let navigationHistory = [];

// Sample data
const userData = {
    name: 'Divya Sharma',
    username: '@divya_sharma',
    email: 'divya.sharma@email.com',
    phone: '+91 9876543210',
    location: 'Mumbai, India',
    bio: 'Passionate web developer and photographer. Love sharing knowledge and learning new skills. Always excited to connect with fellow learners and teachers!',
    teachingSkills: ['HTML/CSS', 'Photography', 'UI/UX Design'],
    learningSkills: ['Python', 'Public Speaking'],
    availability: {
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        timeSlots: ['morning', 'evening'],
        mode: 'online'
    }
};



const searchSuggestions = [
    { type: 'skill', name: 'Python Programming', icon: 'fab fa-python' },
    { type: 'skill', name: 'Guitar Playing', icon: 'fas fa-guitar' },
    { type: 'skill', name: 'Photography', icon: 'fas fa-camera' },
    { type: 'skill', name: 'Public Speaking', icon: 'fas fa-microphone' },
    { type: 'skill', name: 'Web Development', icon: 'fas fa-code' },
    { type: 'category', name: 'Tech', icon: 'fas fa-laptop-code' },
    { type: 'category', name: 'Music', icon: 'fas fa-music' },
    { type: 'category', name: 'Art & Design', icon: 'fas fa-palette' },
    { type: 'user', name: 'Aman Kumar', icon: 'fas fa-user' },
    { type: 'user', name: 'Sara Johnson', icon: 'fas fa-user' },
    { type: 'user', name: 'John Smith', icon: 'fas fa-user' }
];


// Mobile dropdown functionality
function showCategoryDropdown(category) {
    if (window.innerWidth <= 768) return;
    const dropdown = document.getElementById(`${category}-dropdown`);
    if (dropdown) {
        dropdown.style.maxHeight = '300px';
    }
}

function hideCategoryDropdown(category) {
    if (window.innerWidth <= 768) return;
    const dropdown = document.getElementById(`${category}-dropdown`);
    if (dropdown) {
        dropdown.style.maxHeight = '0';
    }
}

// For mobile - toggle dropdown on click
document.addEventListener('DOMContentLoaded', function() {
    if (window.innerWidth <= 768) {
        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach(card => {
            card.addEventListener('click', function(e) {
                // Don't toggle if clicking on a dropdown item
                if (e.target.classList.contains('dropdown-item')) {
                    return;
                }
                
                // Close all other dropdowns
                document.querySelectorAll('.category-card').forEach(otherCard => {
                    if (otherCard !== card) {
                        otherCard.classList.remove('active');
                        const otherDropdown = otherCard.querySelector('.category-dropdown');
                        if (otherDropdown) {
                            otherDropdown.style.display = 'none';
                        }
                    }
                });
                
                // Toggle current dropdown
                card.classList.toggle('active');
                const dropdown = card.querySelector('.category-dropdown');
                if (dropdown) {
                    dropdown.style.display = card.classList.contains('active') ? 'block' : 'none';
                }
            });
        });
    }
});
// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    initShell();
});

/* Resolve an avatar URL from a user or profile object (falls back to default) */
function avatarSrc(o) {
    if (!o) return './images/user.png';
    const p = o.profilePicture || (o.profile && o.profile.profilePicture) || '';
    if (!p) return './images/user.png';
    return p.startsWith('/uploads') ? (API_BASE_URL + p) : p;
}
window.avatarSrc = avatarSrc;

function initializeApp() {
    // Show home section by default
    showSection('home');
}

/* App shell: sidebar toggle (mobile), overlay, active nav link */
function initShell() {
    const sidebar = document.getElementById('appSidebar');
    const toggle = document.getElementById('sidebarToggle');
    const overlay = document.getElementById('sidebarOverlay');

    function openSidebar() { sidebar && sidebar.classList.add('open'); overlay && overlay.classList.add('show'); }
    function closeSidebar() { sidebar && sidebar.classList.remove('open'); overlay && overlay.classList.remove('show'); }
    window.__closeSidebar = closeSidebar;

    if (toggle) toggle.addEventListener('click', () => {
        sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
    });
    if (overlay) overlay.addEventListener('click', closeSidebar);

    // Conversation search filter
    const chatSearch = document.getElementById('chatSearchInput');
    if (chatSearch) {
        chatSearch.addEventListener('input', function () {
            const q = this.value.toLowerCase();
            document.querySelectorAll('#chatList .chat-item').forEach(item => {
                item.style.display = item.textContent.toLowerCase().includes(q) ? '' : 'none';
            });
        });
    }

    setActiveNav('home');
}

/* Highlight the active sidebar link */
function setActiveNav(sectionName) {
    document.querySelectorAll('.side-link[data-section]').forEach(l => {
        l.classList.toggle('active', l.getAttribute('data-section') === sectionName);
    });
}

function updateTimeGreeting() {
    const now = new Date();
    const hours = now.getHours();
    let greeting = 'Good Morning';
    
    if (hours >= 12 && hours < 17) {
        greeting = 'Good Afternoon';
    } else if (hours >= 17) {
        greeting = 'Good Evening';
    }
    
    const greetingElement = document.getElementById('timeGreeting');
    if (greetingElement) {
        greetingElement.textContent = `${greeting}, ${userData.name}!`;
    }
}
function showSection(sectionName) {
  const id = sectionName.endsWith('Section') ? sectionName : `${sectionName}Section`;

  // Hide all sections
  document.querySelectorAll('.content-section').forEach(sec => sec.style.display = 'none');

  // Show target section
  const targetSection = document.getElementById(id);
  if (targetSection) {
    targetSection.style.display = 'block';
  }

  // Push history state (optional)
  if (history.state?.section !== id) {
    history.pushState({ section: id }, '', '#' + id);
  }

  // Sidebar active state + close drawer on mobile
  const baseName = id.replace(/Section$/, '');
  setActiveNav(baseName);
  if (window.__closeSidebar) window.__closeSidebar();

  // Reset mobile chat single-pane state when leaving messages
  const msgSec = document.getElementById('messagesSection');
  if (msgSec && baseName !== 'messages') msgSec.classList.remove('chat-open');

  // scroll app main to top on section change
  const main = document.querySelector('.app-main');
  if (main) main.scrollTo ? main.scrollTo(0, 0) : (main.scrollTop = 0);
  window.scrollTo(0, 0);

  // Back button logic
  const backButtonContainer = document.getElementById('backButtonContainer');
  if (backButtonContainer) {
    backButtonContainer.style.display = (baseName === 'home') ? 'none' : 'block';
  }

  // Section-specific loaders
  if (baseName === 'connections') {
    loadConnections();
  } else if (baseName === 'requests') {
    loadRequests();
  } else if (baseName === 'messages') {
    initMessages();
  } else if (baseName === 'viewProfile') {
    loadViewProfileSection();
  } else if (baseName === 'home') {
    loadRecommendedPartners();
  } else if (baseName === 'dashboard') {
    loadDashboardProfile();
    updateSkillSummary();
    loadRecentChats();
    loadDashboardRecommendedPartners();
  } else if (baseName === 'profile') {
    fetchAndPopulateProfile();
  }
}




function goBack() {
    if (navigationHistory.length > 0) {
        const previousSection = navigationHistory.pop();
        showSection(previousSection);
    } else {
        showSection('home');
    }
}

/**
 * Logs the user out by clearing credentials from local storage
 * and redirecting to the landing page.
 */
async function logout() {
    const ok = await confirmDialog({
        title: 'Log out?',
        message: 'You will need to sign in again to access your account.',
        confirmText: 'Log out',
        kind: 'warning'
    });
    if (!ok) return;
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('openChatUserId');
    window.location.href = 'newindex.html';
}

// Search functionality
function initializeSearch() {
    const searchToggle = document.getElementById('searchToggle');
    const searchExpandable = document.getElementById('searchExpandable');
    const searchBack = document.getElementById('searchBack');
    const searchInput = document.getElementById('searchInput');
    const searchSuggestionsContainer = document.getElementById('searchSuggestions');
    
    searchToggle.addEventListener('click', function() {
        searchExpandable.classList.add('active');
        searchInput.focus();
    });
    
    searchBack.addEventListener('click', function() {
        searchExpandable.classList.remove('active');
        searchInput.value = '';
        searchSuggestionsContainer.innerHTML = '';
    });
    
    // Close search when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchExpandable.contains(e.target) && !searchToggle.contains(e.target)) {
            searchExpandable.classList.remove('active');
            searchInput.value = '';
            searchSuggestionsContainer.innerHTML = '';
        }
    });
    
    // Search input functionality
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        if (query.length > 0) {
            const filteredSuggestions = searchSuggestions.filter(item => 
                item.name.toLowerCase().includes(query)
            );
            displaySearchSuggestions(filteredSuggestions);
        } else {
            searchSuggestionsContainer.innerHTML = '';
        }
    });
    
    // Close search with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && searchExpandable.classList.contains('active')) {
            searchExpandable.classList.remove('active');
            searchInput.value = '';
            searchSuggestionsContainer.innerHTML = '';
        }
    });
}

function displaySearchSuggestions(suggestions) {
    const container = document.getElementById('searchSuggestions');
    container.innerHTML = '';
    
    suggestions.forEach(item => {
        const suggestionElement = document.createElement('div');
        suggestionElement.className = 'search-suggestion-item';
        suggestionElement.innerHTML = `
            <i class="${item.icon}"></i>
            <span>${item.name}</span>
        `;
        
        suggestionElement.addEventListener('click', function() {
            handleSearchSelection(item);
        });
        
        container.appendChild(suggestionElement);
    });
}

function handleSearchSelection(item) {
    const searchExpandable = document.getElementById('searchExpandable');
    const searchInput = document.getElementById('searchInput');
    const searchSuggestions = document.getElementById('searchSuggestions');
    
    // Close search
    searchExpandable.classList.remove('active');
    searchInput.value = '';
    searchSuggestions.innerHTML = '';
    
    // Navigate based on selection type
    if (item.type === 'skill') {
        showSection('skillCategory');
        // In a real app, you'd filter by the specific skill
        showNotification(`Showing results for: ${item.name}`, 'info');
    } else if (item.type === 'category') {
        showSection('skillCategory');
        showCategorySkills(item.name);
    } else if (item.type === 'user') {
        showSection('profile');
        // In a real app, you'd show the user's profile
        showNotification(`Viewing profile: ${item.name}`, 'info');
    }

}


// Skill Categories functionality
function populateSkillCategories() {
    const categoryGrid = document.getElementById('categoryGrid');
    if (!categoryGrid) return;
    
    categoryGrid.innerHTML = '';
    
    Object.keys(skillCategories).forEach(categoryName => {
        const category = skillCategories[categoryName];
        const categoryCard = document.createElement('div');
        categoryCard.className = 'col-lg-2 col-md-3 col-6 mb-3';
        categoryCard.innerHTML = `
            <div class="category-detail-card" onclick="showCategorySkills('${categoryName}')">
                <div class="category-icon">
                    <i class="${category.icon}"></i>
                </div>
                <h6>${categoryName}</h6>
                <p class="text-muted">${category.skills.length} skills</p>
            </div>
        `;
        categoryGrid.appendChild(categoryCard);
    });
}

function showCategorySkills(categoryName) {
    const category = skillCategories[categoryName];
    if (!category) return;
    
    // Highlight selected category
    const categoryCards = document.querySelectorAll('.category-detail-card');
    categoryCards.forEach(card => {
        card.classList.remove('highlighted');
    });
    
    event.target.closest('.category-detail-card').classList.add('highlighted');
    
    // Show category users section
    const categoryUsersSection = document.getElementById('categoryUsersSection');
    const categoryUsersTitle = document.getElementById('categoryUsersTitle');
    const categoryUsersList = document.getElementById('categoryUsersList');
    
    categoryUsersTitle.textContent = `${categoryName} Skills & Teachers`;
    categoryUsersSection.style.display = 'block';
    
    // Populate users list
    categoryUsersList.innerHTML = '';
    
    category.skills.forEach(skill => {
        const skillCard = document.createElement('div');
        skillCard.className = 'col-md-6 col-lg-4 mb-3';
        skillCard.innerHTML = `
            <div class="user-teaching-card">
                <h6 class="text-primary">${skill.name}</h6>
                <div class="teachers-list">
                    ${skill.users.map(user => `
                        <div class="teacher-item d-flex align-items-center mb-2">
                            <div class="user-avatar me-2">
                                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" alt="${user}">
                            </div>
                            <div class="teacher-info flex-grow-1">
                                <p class="mb-0 fw-semibold">${user}</p>
                                <div class="rating">
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <span>4.8</span>
                                </div>
                            </div>
                            <div class="teacher-actions">
                                <button class="btn btn-sm btn-outline-primary" onclick="sendSkillRequest('${user}', '${skill.name}')">
                                    Request
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        categoryUsersList.appendChild(skillCard);
    });
}

function sendSkillRequest(teacherName, skillName) {
    showNotification(`Request sent to ${teacherName} for ${skillName}!`, 'success');
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function createSkillListItem({ skillName, skillLevel, categoriesText }) {
    const li = document.createElement('li');
    li.innerHTML = `
        <span style="font-weight:500;">${escapeHtml(skillName)}</span>
        <span style="font-size:0.85em; color:#6c757d;"> (${escapeHtml(skillLevel)})</span>
        ${categoriesText ? `<small style="font-size:0.8em; color:#495057;"> • ${escapeHtml(categoriesText)}</small>` : ''}
        <button type="button" class="remove" title="Remove"><i class="fas fa-times-circle"></i></button>
    `;
    li.querySelector('button.remove').addEventListener('click', () => li.remove());
    return li;
}


// Dashboard functionality




function selectChat(userId) {
    const chatData_user = chatData[userId];
    if (!chatData_user) return;
    
    // Update active chat in sidebar
    const chatItems = document.querySelectorAll('.chat-item');
    chatItems.forEach(item => item.classList.remove('active'));
    document.querySelector(`[onclick="selectChat('${userId}')"]`).classList.add('active');
    
    // Update chat header
    document.getElementById('currentChatAvatar').src = chatData_user.avatar;
    document.getElementById('currentChatName').textContent = chatData_user.name;
    document.getElementById('currentChatStatus').textContent = chatData_user.status;
    
    // Update messages
    displayMessages(chatData_user.messages);
}

function displayMessages(messages) {
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.innerHTML = '';
    
    messages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.type}`;
        messageElement.innerHTML = `
            <div class="message-content">
                ${message.content}
                <div class="message-time">${message.time}</div>
            </div>
        `;
        messagesContainer.appendChild(messageElement);
    });
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}



function initTagify() {
    if (typeof Tagify === 'undefined') { console.warn('Tagify not found — skipping tag inputs'); return; }
    const skillsInputs = document.querySelectorAll('#skillsOfferedInput, #skillsWantedInput');
    skillsInputs.forEach(input => {
        if (input.tagify) input.tagify.destroy();
        new Tagify(input, {
            whitelist: [
                "JavaScript", "Python", "Graphic Design", "UI/UX", "React", "Node.js",
                "Photoshop", "Writing", "Marketing", "HTML/CSS", "Java", "C++", "DSA",
                "SQL", "Machine Learning", "Data Science", "3D Modelling", "Motion Graphics",
                "Game Design", "Interior Design", "Guitar", "Piano", "Singing & Vocal",
                "Oil Painting", "Sketching & Drawing", "Sculpture Making", "English",
                "Spanish", "French", "Telugu", "Hindi", "Baking", "Food Presentation",
                "Italian Cuisine", "Pastry Making", "Grilling & Barbecue"
            ],
            dropdown: { maxItems: 10, enabled: 1, closeOnSelect: false },
            originalInputValueFormat: valuesArr => valuesArr.map(item => item.value).join(',')
        });
    });
}


/**
 * Fetches profile data and populates the dedicated #viewProfileSection
 */
async function loadViewProfileSection() {
  // Get the user ID from where the click handler stored it
  const userId = localStorage.getItem('viewProfileUserId');
  const context = localStorage.getItem('viewProfileContext');
  const token = localStorage.getItem('token');

  const titleEl = document.getElementById("viewProfileTitle");
  const bodyEl = document.getElementById("viewProfileBody");

  if (!userId) {
    titleEl.textContent = "Error";
    bodyEl.innerHTML = '<div class="card-body"><p class="text-danger">No user ID was provided.</p></div>';
    return;
  }

  // Set loading state
  titleEl.textContent = "Loading Profile...";
  bodyEl.innerHTML = '<div class="card-body"><p class="text-center">Please wait...</p></div>';

  try {
    // 1. Fetch data
    const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      headers: { "x-auth-token": token }
    });
    if (!res.ok) throw new Error('Could not load profile');
    
    const user = await res.json();
    const profile = user.profile || {};

    // 2. Build HTML
    let content = `
      <div class="d-flex align-items-center mb-3">
        <img src="${avatarSrc(user)}" class="rounded-circle me-3" width="70" height="70" style="object-fit:cover"/>
        <div>
          <h4 class="mb-0">${escapeHtml(profile.fullName || "Unnamed User")}</h4>
          <small class="text-muted">@${escapeHtml(profile.username || "unknown")}</small>
        </div>
      </div>
      <p><strong>Bio:</strong> ${escapeHtml(profile.bio || "No bio")}</p>
      <p><strong>Skills Offered:</strong> ${
        (profile.skillsOffered || []).map(s => `${escapeHtml(s.skillName)} (${escapeHtml(s.level)})`).join(", ") || "None"
      }</p>
      <p><strong>Skills to Learn:</strong> ${
        (profile.skillsToLearn || []).map(s => `${escapeHtml(s.skillName)}`).join(", ") || "None"
      }</p>
    `;

    const avail = profile.availability || {};
    const availDays = (avail.days || []).join(', ') || "Not specified";
    const availTime = avail.time || "Not specified";
    content += `
      <hr>
      <p class="mb-1"><strong>Availability:</strong> ${escapeHtml(availDays)}</p>
      <p class="mb-0"><strong>Time:</strong> ${escapeHtml(availTime)} (${escapeHtml(avail.timezone || "N/A")})</p>
    `;

    // Only show private contact info if they are a "connection"
    if (context === "connections") {
      content += `
        <hr>
        <p class="mb-1"><strong>Email:</strong> ${escapeHtml(user.email || "Not provided")}</p>
        <p class="mb-0"><strong>Phone:</strong> ${escapeHtml(user.phoneNumber || "Not provided")}</p>
      `;
    }

    // 3. Populate the card
    titleEl.textContent = `${escapeHtml(profile.fullName || "User")}'s Profile`;
    bodyEl.innerHTML = `<div class="card-body">${content}</div>`;
    
  } catch (err) {
    console.error("Error loading profile:", err);
    titleEl.textContent = "Error";
    bodyEl.innerHTML = '<div class="card-body"><p class="text-danger">Could not load the user profile. Please try again.</p></div>';
  }
}


// ==================================
//      VIEW PROFILE (NEW SECTION) HANDLER
// ==================================
document.addEventListener("click", (e) => {
  const viewBtn = e.target.closest(".view-profile-btn");
  
  if (viewBtn) {
    const userId = viewBtn.dataset.userid;
    const context = viewBtn.dataset.context;

    if (!userId) {
      console.error("View Profile button clicked but no userId found.");
      return;
    }
    
    // 1. Store the ID/Context for the new section to read
    localStorage.setItem('viewProfileUserId', userId);
    localStorage.setItem('viewProfileContext', context || 'category'); // Default context

    // 2. Go to the new section. 
    // Your showSection() function will automatically handle the back button!
    showSection('viewProfile');
  }
});

// function showSection(sectionId) {
//     document.querySelectorAll('.content-section').forEach(sec => {
//         sec.style.display = 'none';
//     });
//     document.getElementById(sectionId).style.display = 'block';
// }
//CATEGORY CLICK HANDLER
document.querySelectorAll('.category-card').forEach(card => {
  card.addEventListener('click', async () => {
    const category = card.getAttribute('data-category');
    console.log("📌 Category clicked:", category); // DEBUG

    try {
      const token = localStorage.getItem('token');
      console.log("📌 Sending request to:", `api/profile/category/${encodeURIComponent(category)}`); // DEBUG

      const response = await fetch(`${API_BASE_URL}/api/profile/category/${encodeURIComponent(category)}`, {
        headers: {
            "x-auth-token": token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error("Failed to fetch users for this category");

      const users = await response.json();
      console.log("📌 Users fetched:", users); // DEBUG

      const categoryResults = document.getElementById('categoryResults');
      categoryResults.innerHTML = `
        <h3 class="mb-3">${category} - Available Users</h3>
        <div id="userProfiles" class="row"></div>
      `;
      categoryResults.style.display = "block"; // ✅ Show results

      const userProfiles = document.getElementById('userProfiles');

      if (!users || users.length === 0) {
        userProfiles.innerHTML = `<p class="text-muted">No users found in this category.</p>`;
      } else {
        users.forEach(user => {
          console.log("📌 Rendering user:", user.profile?.username); // DEBUG
          userProfiles.innerHTML += `
            <div class="col-md-6">
              <div class="cards mb-3 shadow-sm">
                <div class="card-body">
                <div class="user-header d-flex align-items-center gap-2 mb-2">
                <img src="${avatarSrc(user)}" alt="User avatar" class="rounded-circle" style="width:44px; height:44px; object-fit:cover;">
                  <h3 class="card-title mb-0" style="font-size:1.1rem">${user.profile?.fullName || "Unnamed User"}</h3>
                  </div>
                  <p class="card-text">
                    <strong>Username:</strong> ${user.profile?.username || "Unnamed"}<br>
                    <strong>Skills Offered:</strong> 
                    ${
                        user.profile?.skillsOffered?.length 
                        ? user.profile.skillsOffered.map(s => `${s.skillName} (${s.level || "Unknown"})`).join(", ")
                        : "None"
                    }<br>
                    
                    <strong>Skills To Learn:</strong> 
                    ${
                        user.profile?.skillsToLearn?.length 
                        ? user.profile.skillsToLearn.map(s => `${s.skillName} (${s.level || "Unknown"})`).join(", ")
                        : "None"
                    }<br>
                    <strong>Availability days:</strong> ${user.profile?.availability?.days || "Not specified"}<br>
                    <strong>Availability time:</strong> ${user.profile?.availability?.time || "Not specified"} (${user.profile?.availability?.timezone || "Not specified"})<br>
                    <strong>Bio:</strong> ${user.profile?.bio || "No bio available"}<br>
                     <div class="cards-buttons mt-2">
                        <button class="btn btn-primary view-profile-btn" data-context="category" data-userid="${user._id}">View Profile</button>
                        <button class="btn btn-success request-btn" data-userid="${user._id}">Request</button>
                    </div>
                  </p>
                </div>
              </div>
            </div>
          `;
        });
      }
    } catch (err) {
      console.error("❌ Error loading category users:", err);
      toast("Failed to load users for this category. Please try again.", "error");
    }
  });
});

// REQUEST FEATURE

// Send Request (button inside user card)
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("request-btn")) {
    const toUser = e.target.getAttribute("data-userid");
    const token = localStorage.getItem("token");

    if (!token) return toast("Please log in first.", "warning");

    try {
      const res = await fetch(`${API_BASE_URL}/api/requests/send`, {
        method: "POST",
        headers: {
          "x-auth-token": token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ toUser })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send request");

      // Update button state
      e.target.innerHTML = '<i class="fas fa-check"></i> Requested';
      e.target.disabled = true;
      toast("Request sent successfully!", "success");

      loadRequests(); // Refresh requests lists
    } catch (err) {
      toast(err.message || "Error sending request", "error");
    }
  }
});

//LOAD REQUESTS
async function loadRequests() {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    // Received Requests
    const resReceived = await fetch(`${API_BASE_URL}/api/requests/received`, {
      headers: { "x-auth-token": token }
    });
    const received = await resReceived.json();

    const receivedDiv = document.getElementById("receivedRequests");
    receivedDiv.innerHTML = "";

    if (received.length === 0) {
      receivedDiv.innerHTML = `<p class="text-muted">No requests received.</p>`;
    } else {
      received.forEach(req => {
        const profile = req.fromUser?.profile || {};
        const offers = profile.skillsOffered?.map(s => `${escapeHtml(s.skillName)} (${escapeHtml(s.level || '')})`).join(", ") || "None";
        const learns = profile.skillsToLearn?.map(s => `${escapeHtml(s.skillName)}`).join(", ") || "None";

        receivedDiv.innerHTML += `
            <div class="request-item">
              <div class="d-flex align-items-start gap-2">
                <img src="${avatarSrc(req.fromUser)}" alt="User" class="rounded-circle" width="46" height="46">
                <div class="flex-grow-1">
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <h5>${escapeHtml(profile.fullName || "Unnamed")}</h5>
                      <h6>@${escapeHtml(profile.username || "unknown")}</h6>
                    </div>
                    ${req.status === "pending"
                      ? ''
                      : `<span class="pill pill-${req.status === "accepted" ? "success" : "danger"}">${req.status}</span>`}
                  </div>
                  <div class="mt-2" style="font-size:.83rem;color:var(--text-soft)">
                    <div><strong>Offers:</strong> ${offers}</div>
                    <div><strong>Wants to learn:</strong> ${learns}</div>
                    ${profile.bio ? `<div class="mt-1"><strong>Bio:</strong> ${escapeHtml(profile.bio)}</div>` : ''}
                  </div>
                  <small class="d-block mt-1">${new Date(req.createdAt).toLocaleString()}</small>
                  ${req.status === "pending" ? `
                    <div class="mt-2 d-flex gap-2">
                      <button class="btn btn-sm btn-success accept-btn" data-id="${req._id}"><i class="fas fa-check"></i> Accept</button>
                      <button class="btn btn-sm btn-outline-danger reject-btn" data-id="${req._id}"><i class="fas fa-xmark"></i> Reject</button>
                    </div>` : ''}
                </div>
              </div>
            </div>
        `;
        });
    }

    //Sent Requests
    const resSent = await fetch(`${API_BASE_URL}/api/requests/sent`, {
      headers: { "x-auth-token": token }
    });
    const sent = await resSent.json();

    const sentDiv = document.getElementById("sentRequests");
    sentDiv.innerHTML = "";

    if (sent.length === 0) {
      sentDiv.innerHTML = `<p class="text-muted">No requests sent.</p>`;
    } else {
      sent.forEach(req => {
        const tp = req.toUser?.profile || {};
        const learns = tp.skillsToLearn?.map(s => `${escapeHtml(s.skillName)}`).join(", ") || "None";
        sentDiv.innerHTML += `
          <div class="request-item">
            <div class="d-flex align-items-center gap-2">
              <img src="${avatarSrc(req.toUser)}" alt="User" class="rounded-circle" width="46" height="46">
              <div class="flex-grow-1">
                <div class="d-flex justify-content-between align-items-center">
                  <h5>${escapeHtml(tp.fullName || "Unnamed")}</h5>
                  <span class="pill pill-${req.status === "pending" ? "warning" : req.status === "accepted" ? "success" : "danger"}">${req.status}</span>
                </div>
                <small class="text-muted d-block">Wants to learn: ${learns}</small>
                ${req.status === "pending"
                  ? `<button class="btn btn-sm btn-outline-danger cancel-btn mt-2" data-id="${req._id}"><i class="fas fa-xmark"></i> Cancel</button>`
                  : ""}
              </div>
            </div>
          </div>
        `;
      });
    }
  } catch (err) {
    console.error("Error loading requests:", err);
  }
}

//HANDLE ACCEPT / REJECT / CANCEL
document.addEventListener("click", async (e) => {
  const acceptBtn = e.target.closest(".accept-btn");
  const rejectBtn = e.target.closest(".reject-btn");
  const cancelBtn = e.target.closest(".cancel-btn");
  if (!acceptBtn && !rejectBtn && !cancelBtn) return;

  const token = localStorage.getItem("token");
  if (!token) return toast("Please log in first.", "warning");

  try {
    if (acceptBtn) {
      await fetch(`${API_BASE_URL}/api/requests/${acceptBtn.getAttribute("data-id")}/accept`, { method: "PATCH", headers: { "x-auth-token": token } });
      toast("Request accepted — you're now connected!", "success");
    } else if (rejectBtn) {
      await fetch(`${API_BASE_URL}/api/requests/${rejectBtn.getAttribute("data-id")}/reject`, { method: "PATCH", headers: { "x-auth-token": token } });
      toast("Request rejected.", "info");
    } else if (cancelBtn) {
      await fetch(`${API_BASE_URL}/api/requests/${cancelBtn.getAttribute("data-id")}/cancel`, { method: "PATCH", headers: { "x-auth-token": token } });
      toast("Request cancelled.", "info");
    }
    loadRequests();
  } catch (err) {
    toast("Something went wrong. Please try again.", "error");
  }
});

//INITIAL LOAD
document.addEventListener("DOMContentLoaded", loadRequests);


/* message-btn handled by the unified handler below */



// ==================== CONNECTIONS FEATURE ====================
// ==================== CONNECTIONS FEATURE ====================
// helper parseJwt if not already defined
function parseJwt(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch (e) {
    return {};
  }
}

// Updated loadConnections
async function loadConnections() {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE_URL}/api/connections`, {
      headers: { "x-auth-token": token }
    });
    const data = await res.json();

    console.log("Connections API data:", data); // debug

    const container = document.getElementById("connectionsList");
    if (!container) {
      console.error("❌ #connectionsList not found in DOM");
      return;
    }

    container.innerHTML = "";

    if (!Array.isArray(data) || !data.length) {
      container.innerHTML = "<p>No connections yet.</p>";
      return;
    }

    // extract logged-in user id
    const payload = parseJwt(token);
    const userId = payload.user?.id;

    data.forEach(conn => {
      const fromId = conn.fromUser?._id?.toString();
      const toId = conn.toUser?._id?.toString();

      let other = null;
      if (fromId === userId) {
        other = conn.toUser;
      } else if (toId === userId) {
        other = conn.fromUser;
      } else {
        console.warn("⚠️ Neither side matched logged-in user:", conn);
        return;
      }

      const profile = other.profile || {};
      const isCompleted = conn.status === "completed";
      const completedByMe = Array.isArray(conn.completedBy) && conn.completedBy.map(id => id.toString()).includes(userId);
      const completedCount = Array.isArray(conn.completedBy) ? conn.completedBy.length : 0;

      // include connection id in data-connectionid attribute
      container.innerHTML += `
        <div class="col-md-6 col-lg-4">
          <div class="card h-100">
            <div class="card-body d-flex flex-column">
              <div class="d-flex align-items-center gap-2 mb-2">
                <img src="${avatarSrc(other)}" class="rounded-circle" width="48" height="48" style="object-fit:cover" />
                <div>
                  <h5>${escapeHtml(profile.fullName || "Unnamed User")}</h5>
                  <small class="text-muted">@${escapeHtml(profile.username || "unknown")}</small>
                </div>
                ${isCompleted ? `<span class="pill pill-success ms-auto"><i class="fas fa-check"></i> Completed</span>` : ''}
              </div>
              <p class="card-text small mb-3"><strong>Offers:</strong> ${
                (profile.skillsOffered || []).map(s => `${escapeHtml(s.skillName)} (${escapeHtml(s.level || '')})`).join(", ") || "None"
              }</p>
              <div class="connection-actions">
                <button class="btn btn-sm btn-outline-primary view-profile-btn" data-context="connections" data-userid="${other._id}"><i class="fas fa-eye"></i> Profile</button>
                <button class="btn btn-sm btn-primary message-btn" data-id="${other._id}"><i class="fas fa-comment"></i> Message</button>
                ${
                  isCompleted
                    ? `<button class="btn btn-sm btn-secondary" disabled><i class="fas fa-check-double"></i> Done (${completedCount})</button>`
                    : `<button class="btn btn-sm btn-warning mark-complete-btn" data-connectionid="${conn._id}" data-userid="${other._id}">
                         ${completedByMe ? "Marked ✓" : "Mark Complete"}${completedCount ? ` (${completedCount})` : ""}
                       </button>`
                }
              </div>
            </div>
          </div>
        </div>
      `;
    });

    console.log("✅ Connections rendered:", data.length);
  } catch (err) {
    console.error("Error loading connections:", err);
  }
}

// New click handler for Mark As Complete
document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".mark-complete-btn");
  if (!btn) return;

  const connectionId = btn.dataset.connectionid;
  if (!connectionId) return toast("Connection ID missing.", "error");

  const token = localStorage.getItem("token");
  if (!token) return toast("Please log in first.", "warning");

  try {
    btn.disabled = true;
    btn.innerText = "Marking…";

    const res = await fetch(`${API_BASE_URL}/api/connections/${connectionId}/complete`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token
      }
    });

    const result = await res.json();
    if (res.ok) {
      toast("Marked as complete.", "success");
      await loadConnections();
    } else {
      toast(result.message || "Could not mark complete", "error");
      btn.disabled = false;
      btn.innerText = "Mark Complete";
    }
  } catch (err) {
    console.error("Error marking connection complete:", err);
    toast("Something went wrong", "error");
    btn.disabled = false;
    btn.innerText = "Mark Complete";
  }
});

// 1. Initialize the modal instance ONCE in the global scope.
// const profileModalEl = document.getElementById("profileModal");
// const profileModalInstance = new bootstrap.Modal(profileModalEl);

// Helper function to prevent XSS attacks from user-generated content
function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

// Handle View Profile button click
// ==================================
//      VIEW PROFILE MODAL HANDLER



// Load conversations
async function loadConversations() {
  const token = localStorage.getItem("token");
  if (!token) return;

  const res = await fetch(`${API_BASE_URL}/api/messages`, {
    headers: { "x-auth-token": token }
  });
  const conversations = await res.json();

  const sidebar = document.getElementById("chatList");
  sidebar.innerHTML = "";

  conversations.forEach(conv => {
    const user = conv.user.profile || {};
    const lastMsg = conv.lastMessage?.text || "No messages yet.";

    sidebar.innerHTML += `
      <div class="conversation-item p-2 border-bottom" data-id="${conv.user._id}">
        <strong>${user.fullName || "Unnamed"}</strong><br>
        <small class="text-muted">@${user.username || "unknown"} – ${lastMsg}</small>
      </div>
    `;
  });
}

// Open chat with a specific user
async function openChat(userId) {
  const token = localStorage.getItem("token");

  // Load user info
  const resUser = await fetch(`${API_BASE_URL}/api/users/` + userId, {
    headers: { "x-auth-token": token }
  });
  const other = await resUser.json();
  const profile = other.profile || {};

  document.getElementById("chatHeader").innerHTML =
    `<h5>${profile.fullName || "User"}</h5>`;

  // Load messages
  const res = await fetch(`${API_BASE_URL}/api/messages/` + userId, {
    headers: { "x-auth-token": token }
  });
  const messages = await res.json();

  const chatBox = document.getElementById("chatMessages");
  chatBox.innerHTML = "";
  const myId = parseJwt(token).id;

  messages.forEach(msg => {
    const isMe = msg.sender === myId;
    chatBox.innerHTML += `
      <div class="chat-bubble ${isMe ? 'me' : 'them'}">${msg.text}</div>
    `;
  });

  chatBox.scrollTop = chatBox.scrollHeight;

  // Send new message
  document.getElementById("sendMessageBtn").onclick = async () => {
    const text = document.getElementById("chatInput").value;
    if (!text) return;

    await fetch(`${API_BASE_URL}/api/messages/` + userId, {
      method: "POST",
      headers: {
        "x-auth-token": token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text })
    });

    document.getElementById("chatInput").value = "";
    openChat(userId);
  };
}

// Sidebar click
document.addEventListener("click", e => {
  if (e.target.closest(".conversation-item")) {
    const userId = e.target.closest(".conversation-item").dataset.id;
    openChat(userId);
  }
});

// Redirect from Connections → Messages (unified handler)
document.addEventListener("click", e => {
  const btn = e.target.closest(".message-btn");
  if (!btn) return;
  const userId = btn.dataset.id;
  localStorage.setItem("openChatUserId", userId);
  showSection("messages");
});

// Auto load when messages section is opened
// Auto load when messages section is opened
function initMessages() {
  loadChatSidebar();   // ✅ use connections, not messages
  const pendingUser = localStorage.getItem("openChatUserId");
  if (pendingUser) {
    // Fetch profile info if needed
    openChat(pendingUser);
    localStorage.removeItem("openChatUserId");
  }
}


const socket = io(API_BASE_URL);

// ✅ Join with logged-in userId
const token = localStorage.getItem("token");
if (token) {
  const payload = parseJwt(token);
  const userId = payload.user?.id;
  if (userId) {
    socket.emit("join", userId);
  }
}



let activeChatUserId = null; // track which user we’re chatting with

// Load conversations into sidebar
// Load conversations into sidebar
async function loadChatSidebar() {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE_URL}/api/messages`, {
      headers: { "x-auth-token": token }
    });
    const conversations = await res.json();

    const chatList = document.getElementById("chatList");
    chatList.innerHTML = "";

    if (!conversations.length) {
      chatList.innerHTML = "<p class='text-muted p-2'>No conversations yet.</p>";
      return;
    }

    conversations.forEach(conv => {
      const other = conv.user;
      const profile = other?.profile || {};

      // ✅ preview text
      let preview = "";
      if (conv.lastMessage) {
        if (conv.lastMessage.text) preview = conv.lastMessage.text;
        else if (conv.lastMessage.fileType === "image") preview = "📷 Image";
        else if (conv.lastMessage.fileType === "video") preview = "🎥 Video";
        else if (conv.lastMessage.fileType === "document") preview = "📄 Document";
        else preview = "Attachment";
      }

      const unread = conv.unreadCount || 0;

      const chatItem = document.createElement("button");

      // 🌟 --- THE FIX --- 🌟
      // Start with the base classes
      let itemClasses = "list-group-item list-group-item-action chat-item d-flex justify-content-between align-items-center";
      
      // Check if this item's ID matches the active chat ID
      if (other._id === activeChatUserId) {
        itemClasses += " active"; // Add the .active class!
      }
      
      chatItem.className = itemClasses;
      // 🌟 --- END OF FIX --- 🌟

      chatItem.id = `chat-${other._id}`;
      chatItem.innerHTML = `
        <div class="d-flex align-items-center">
          <img src="${avatarSrc(other)}" class="rounded-circle me-2" width="44" height="44" style="object-fit:cover" />
          <div>
            <strong>${escapeHtml(profile.fullName || "Unnamed")}</strong><br>
            <small class="text-muted">${escapeHtml(preview)}</small>
          </div>
        </div>
        ${
          unread > 0
            ? `<span class="badge bg-success rounded-pill">${unread}</span>`
            : ""
        }
      `;

      chatItem.onclick = () => openChat(other._id, other);
      chatList.appendChild(chatItem);
    });

    // Auto-open first chat only on desktop (mobile starts on the list)
    if (!activeChatUserId && conversations.length > 0 && window.innerWidth > 768) {
      const firstOther = conversations[0].user;
      openChat(firstOther._id, firstOther);
    }

  } catch (err) {
    console.error("Error loading chat sidebar:", err);
  }
}



// STUN / TURN config (yours)
const servers = {
  iceServers: [
    { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] },
    { urls: "turn:relay.metered.ca:80", username: "openai", credential: "openai123" },
    { urls: "turn:relay.metered.ca:443", username: "openai", credential: "openai123" }
  ]
};

// reuse existing global socket if present, otherwise create one that connects to same origin
// if (!window.socket) window.socket = io(); 
// const socket = window.socket;

// ---------- Globals ----------
let peerConnection = null;
let localStream = null;
let remoteStream = null;
let currentRoomId = null;
let screenSharing = false;
let savedCameraTrack = null;

// buffer ICE candidates keyed by roomId until remoteDescription is set
const iceBuffer = {}; // { [roomId]: [candidate, ...] }

// user id from localStorage (set at signin)
const currentUserId = localStorage.getItem("userId");
if (!currentUserId) console.warn("⚠️ No userId in localStorage — calls will fail unless userId is saved at signin.");

// notify server what user this socket belongs to (do this after socket connects)
socket.on("connect", () => {
  console.log("🔌 socket connected:", socket.id);
  if (currentUserId) {
    socket.emit("join", currentUserId);
    console.log("🟢 joined personal socket room for user:", currentUserId);
  }
});

// ---------- Helper: create and wire RTCPeerConnection ----------
function createPeerConnection(roomId) {
  console.log("🧩 Creating RTCPeerConnection for room:", roomId);
  peerConnection = new RTCPeerConnection(servers);

  // ensure we have a remoteStream container
  remoteStream = new MediaStream();
  const mainVideo = document.getElementById("mainVideo");
  if (mainVideo) mainVideo.srcObject = remoteStream;

  // when we receive remote tracks, attach to remoteStream
  peerConnection.ontrack = (event) => {
    console.log("🎥 Remote track event:", event.streams);

    if (event.streams && event.streams[0]) {
      // merge all incoming tracks
      event.streams[0].getTracks().forEach(track => {
        console.log("➕ adding remote track:", track.kind, track.id);
        remoteStream.addTrack(track);
      });

      const mainVideo = document.getElementById("mainVideo");
      if (mainVideo) {
        mainVideo.srcObject = remoteStream;
        mainVideo.autoplay = true;
        mainVideo.playsInline = true;
        mainVideo.muted = false; // ✅ allow sound
        mainVideo.volume = 1.0;  // ✅ ensure full volume

        mainVideo.onloadedmetadata = () => {
          mainVideo.play()
            .then(() => console.log("▶️ Remote video/audio playing"))
            .catch(err => console.warn("🔇 Autoplay blocked:", err));
        };
      }

      console.log("✅ Remote stream attached to main video");
    }
  };


  // ICE -> send to server with roomId
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      console.log("🧊 Sending ICE candidate for room:", roomId);
      socket.emit("ice-candidate", { roomId, candidate: event.candidate });
    }
  };

  peerConnection.onconnectionstatechange = () => {
    console.log("🔗 PeerConnection state:", peerConnection.connectionState);
  };

  // prepare buffer for this room if not exists
  if (!iceBuffer[roomId]) iceBuffer[roomId] = [];

  return peerConnection;
}

// ---------- Helper: add ICE candidate or buffer ----------
async function addIceCandidateOrBuffer(candidate, roomId) {
  if (!peerConnection) {
    console.warn("⚠️ No peerConnection yet — buffering ICE candidate for room:", roomId);
    if (!iceBuffer[roomId]) iceBuffer[roomId] = [];
    iceBuffer[roomId].push(candidate);
    return;
  }
  // if remoteDescription not set yet, buffer
  const remoteDesc = peerConnection.remoteDescription;
  if (!remoteDesc || !remoteDesc.type) {
    console.log("⏳ Remote description not set yet — buffering ICE candidate for room:", roomId);
    if (!iceBuffer[roomId]) iceBuffer[roomId] = [];
    iceBuffer[roomId].push(candidate);
    return;
  }

  try {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    console.log("✅ ICE candidate added successfully");
  } catch (err) {
    console.error("❌ Error adding ICE candidate:", err);
  }
}

// ---------- Helper: flush buffered ICE candidates for a room ----------
async function flushIceBuffer(roomId) {
  const buf = iceBuffer[roomId] || [];
  if (!buf.length) return;
  console.log(`🧊 Flushing ${buf.length} buffered ICE candidate(s) for room: ${roomId}`);
  while (buf.length) {
    const cand = buf.shift();
    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(cand));
      console.log("✅ Buffered ICE candidate added");
    } catch (err) {
      console.error("❌ Error adding buffered ICE candidate:", err);
    }
  }
}

// ---------- GLOBAL SOCKET LISTENERS (always active) ----------

// Incoming call invitation -> pop confirm
socket.on("incoming-call", async ({ from, roomId }) => {
  console.log("📲 Incoming call from:", from, "room:", roomId);
  const accept = await confirmDialog({
    title: "Incoming video call",
    message: "Someone is calling you. Would you like to answer?",
    confirmText: "Answer",
    cancelText: "Decline",
    kind: "info"
  });
  if (accept) {
    console.log("✅ Accepting call from", from);
    // Tell caller we accepted (server will relay to caller)
    socket.emit("call-accepted", { from: currentUserId, to: from, roomId });
    // Open UI for chat/call and start callee flow
    await openChat(from, {});            // open chat UI
    await startCall(false /*isCaller*/, roomId); // start as callee
  } else {
    console.log("❌ Declining call from", from);
    socket.emit("call-declined", { from: currentUserId, to: from });
  }
});

// Caller side: callee accepted -> start caller's call flow
socket.on("call-accepted", async ({ from, roomId }) => {
  console.log("✅ User", from, "accepted call in room:", roomId);
  currentRoomId = roomId;
  await startCall(true /*isCaller*/, roomId);
});

// Caller side: callee declined
socket.on("call-declined", ({ from }) => {
  console.log("🚫 Call declined by", from);
  toast("Your call was declined.", "warning");
});

// Signaling: offer (callee receives)
socket.on("offer", async ({ sdp, roomId }) => {
  console.log("📩 Received offer for room:", roomId);
  try {
    currentRoomId = roomId;
    if (!peerConnection) createPeerConnection(roomId);

    // set remote description (offer)
    await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
    console.log("✅ Remote description set (offer)");

    // create & send answer
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    console.log("📤 Sending answer (with roomId):", roomId);
    socket.emit("answer", { roomId, sdp: answer });

    // flush any buffered ICE candidates for this room
    await flushIceBuffer(roomId);
  } catch (err) {
    console.error("❌ Error handling incoming offer:", err);
  }
});

// Signaling: answer (caller receives)
socket.on("answer", async ({ sdp, roomId }) => {
  console.log("📩 Received answer for room:", roomId);
  try {
    // set remote description (answer)
    await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
    console.log("✅ Remote description set (answer)");

    // flush ICE buffer for this room
    await flushIceBuffer(roomId);
  } catch (err) {
    console.error("❌ Error handling answer:", err);
  }
});

// Signaling: ICE candidate relay
socket.on("ice-candidate", async ({ candidate, roomId }) => {
  console.log("📩 Received ICE candidate for room:", roomId);
  try {
    await addIceCandidateOrBuffer(candidate, roomId);
  } catch (err) {
    console.error("❌ Error adding ICE candidate:", err);
  }
});

// Reflect mic on/off state in the modal button
function setMicButtonState(enabled) {
  const btn = document.getElementById("toggleMicBtn");
  if (!btn) return;
  btn.classList.toggle("muted", !enabled);
  btn.title = enabled ? "Mute microphone" : "Unmute microphone";
  btn.innerHTML = enabled ? '<i class="fas fa-microphone"></i>' : '<i class="fas fa-microphone-slash"></i>';
}

// Delete an entire conversation
async function deleteConversation(userId, name) {
  const ok = await confirmDialog({
    title: "Delete conversation?",
    message: `This permanently removes your message history with ${name}. This cannot be undone.`,
    confirmText: "Delete",
    kind: "danger"
  });
  if (!ok) return;
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/api/messages/${userId}`, {
      method: "DELETE",
      headers: { "x-auth-token": token }
    });
    if (!res.ok) throw new Error("Failed");
    toast("Conversation deleted.", "success");
    const msgSec = document.getElementById("messagesSection");
    if (msgSec) msgSec.classList.remove("chat-open");
    activeChatUserId = null;
    const chatHeader = document.getElementById("chatHeader");
    if (chatHeader) chatHeader.innerHTML = '<h5 class="text-muted">Select a conversation</h5>';
    const chatMessages = document.getElementById("chatMessages");
    if (chatMessages) chatMessages.innerHTML = '<div class="chat-empty"><div class="chat-empty-ico"><i class="fas fa-comments"></i></div><h5>Your messages</h5><p class="text-muted">Pick a conversation from the left to start chatting.</p></div>';
    await loadChatSidebar();
  } catch (err) {
    console.error(err);
    toast("Could not delete the conversation.", "error");
  }
}
window.deleteConversation = deleteConversation;

// ---------- START CALL (used for both caller & callee) ----------
// isCaller: true = the caller (will create offer after other joins)
// roomId: the shared stable room id
async function startCall(isCaller, roomId) {
  console.log("🎬 Starting call as", isCaller ? "CALLER" : "CALLEE", "room:", roomId);
  currentRoomId = roomId;

  // open modal/UI
  const callModal = document.getElementById("videoCallModal");
  if (callModal) callModal.style.display = "flex";

  // get local media
  try {
    console.log("🎥 Requesting webcam + mic...");
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    console.log("✅ Got media stream:", localStream);
    setMicButtonState(true); // start un-muted

    // my preview -> small video
    const smallVideo = document.getElementById("smallVideo");
    if (smallVideo) {
      smallVideo.srcObject = localStream;
      smallVideo.muted = true;
      try { await smallVideo.play(); } catch(e) { /* autoplay warnings */ }
    }
  } catch (err) {
    console.error("🚨 getUserMedia error:", err);
    toast("Camera / microphone not accessible: " + err.message, "error");
    return;
  }

  // create peerConnection for this room if not exists
  if (!peerConnection) createPeerConnection(roomId);

  // add local tracks to peer
  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
    console.log("🎙️ Added local track:", track.kind);
  });

  // prepare remote stream container and attach to mainVideo
  remoteStream = new MediaStream();
  const mainVideo = document.getElementById("mainVideo");
  if (mainVideo) {
    mainVideo.srcObject = remoteStream;
    mainVideo.autoplay = true;
    mainVideo.playsInline = true;
  }

  // Join the shared room (so offers/answers/ice relays to the correct room)
  console.log("📡 Joining shared call room:", roomId);
  socket.emit("join-room", { roomId, userId: currentUserId });

  // If caller -> wait for the other peer to join (server will emit 'user-joined' to the room)
  if (isCaller) {
    // create offer when other user joins the room
    const handleUserJoined = async (joinedUserId) => {
      try {
        console.log("🟢 other user joined room:", joinedUserId, " — creating offer now");
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        console.log("📤 Sending offer (with roomId):", roomId);
        socket.emit("offer", { roomId, sdp: offer });
      } catch (err) {
        console.error("❌ Error creating/sending offer:", err);
      }
    };

    // use once to avoid duplicate triggers
    socket.once("user-joined", handleUserJoined);

    // also set a fallback timeout — if user-joined not received in Xs still try to send offer
    setTimeout(async () => {
      if (!peerConnection.remoteDescription || !peerConnection.remoteDescription.type) {
        console.warn("⏱ user-joined not seen yet — attempting to send offer anyway (fallback)");
        try {
          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);
          socket.emit("offer", { roomId, sdp: offer });
        } catch (err) {
          console.error("❌ Fallback offer error:", err);
        }
      }
    }, 2000);
  }

  // ensure we flush buffer once remote description eventually set (see offer/answer handlers)
  console.log("✅ startCall finished setup for room:", roomId);
}

// ---------- UI Wiring in openChat (integrated) ----------

/* Replace your openChat function with this integrated version (or merge changes).
   It sets up the call button and end/toggle handlers while preserving your existing logic.
*/
async function openChat(userId, userOrProfile) {
  activeChatUserId = userId;
  console.log("💬 Opening chat with user:", userId);

  // Normalize: accept a full user object OR a bare profile object
  let userObj = userOrProfile || null;
  let profile = (userOrProfile && userOrProfile.profile) ? userOrProfile.profile : (userOrProfile || {});

  // If we don't have a name, fetch the user so the header is complete
  if (!profile || !profile.fullName) {
    try {
      const r = await fetch(`${API_BASE_URL}/api/users/${userId}`, { headers: { "x-auth-token": localStorage.getItem("token") } });
      if (r.ok) { userObj = await r.json(); profile = userObj.profile || {}; }
    } catch (e) { /* ignore */ }
  }

  // Mobile: switch to the chat pane
  const msgSec = document.getElementById("messagesSection");
  if (msgSec) msgSec.classList.add("chat-open");

  // UI highlight
  document.querySelectorAll(".chat-item").forEach(el => el.classList.remove("active"));
  const chatItem = document.getElementById(`chat-${userId}`);
  if (chatItem) chatItem.classList.add("active");

  // Reset video modal + stop previous streams
  const callModal = document.getElementById("videoCallModal");
  if (callModal) callModal.style.display = "none";

  ["mainVideo", "smallVideo"].forEach(id => {
    const el = document.getElementById(id);
    if (el?.srcObject) {
      el.srcObject.getTracks().forEach(t => t.stop());
      el.srcObject = null;
    }
  });

  // Header UI
  document.getElementById("chatHeader").innerHTML = `
    <div class="d-flex align-items-center justify-content-between w-100">
      <div class="d-flex align-items-center">
        <button class="btn-icon btn-sm d-md-none me-1" id="chatBackBtn" title="Back"><i class="fas fa-arrow-left"></i></button>
        <img src="${avatarSrc(userObj || profile)}" class="rounded-circle me-2" width="46" height="46" style="object-fit:cover" />
        <div>
          <h5 class="mb-0">${escapeHtml(profile?.fullName || "Chat")}</h5>
          <small class="text-muted">@${escapeHtml(profile?.username || "")}</small>
        </div>
      </div>
      <div class="chat-header-actions">
        <button class="btn-icon btn-sm btn-outline-primary" id="startVideoCallBtn" title="Start video call"><i class="fas fa-video"></i></button>
        <button class="btn-icon btn-sm btn-outline-danger" id="deleteChatBtn" title="Delete conversation"><i class="fas fa-trash-can"></i></button>
      </div>
    </div>
  `;

  // Mobile back-to-list
  const chatBackBtn = document.getElementById("chatBackBtn");
  if (chatBackBtn) chatBackBtn.onclick = () => { if (msgSec) msgSec.classList.remove("chat-open"); activeChatUserId = null; };

  // Delete conversation
  const deleteChatBtn = document.getElementById("deleteChatBtn");
  if (deleteChatBtn) deleteChatBtn.onclick = () => deleteConversation(userId, profile?.fullName || "this user");

  // Call button → send invite
  const videoCallBtn = document.getElementById("startVideoCallBtn");
  if (videoCallBtn) {
    videoCallBtn.onclick = () => {
      if (!currentUserId) return toast("You must be logged in to start a call.", "warning");
      toast("Calling…", "info", { duration: 2500 });
      currentRoomId = [currentUserId, activeChatUserId].sort().join("-");
      console.log("📞 Calling user:", activeChatUserId, "room:", currentRoomId);
      // invite the remote user (server will relay to the receiver's personal room)
      socket.emit("call-user", { from: currentUserId, to: activeChatUserId, roomId: currentRoomId });
    };
  }

  // Mute / unmute microphone
  const micBtn = document.getElementById("toggleMicBtn");
  if (micBtn) {
    micBtn.onclick = () => {
      if (!localStream) return toast("Microphone is available once the call connects.", "info");
      const audioTrack = localStream.getAudioTracks()[0];
      if (!audioTrack) return;
      audioTrack.enabled = !audioTrack.enabled;
      setMicButtonState(audioTrack.enabled);
      toast(audioTrack.enabled ? "Microphone on" : "Microphone muted", "info", { duration: 1600, title: null });
    };
  }

  // End call handler
  const endCallBtn = document.getElementById("endCallBtn");
  if (endCallBtn) {
    endCallBtn.onclick = () => {
      console.log("❌ Ending call...");
      const callModal = document.getElementById("videoCallModal");
      if (callModal) callModal.style.display = "none";

      if (localStream) localStream.getTracks().forEach(t => t.stop());
      if (remoteStream) remoteStream.getTracks().forEach(t => t.stop());
      if (peerConnection) {
        try { peerConnection.close(); } catch(e) {}
        peerConnection = null;
      }
      document.getElementById("mainVideo").srcObject = null;
      document.getElementById("smallVideo").srcObject = null;
      screenSharing = false;
      savedCameraTrack = null;
      localStream = null;
      setMicButtonState(true);
      toast("Call ended.", "info");
    };
  }

  // Toggle screen-share
  const toggleScreenShareBtn = document.getElementById("toggleScreenShareBtn");
  if (toggleScreenShareBtn) {
    toggleScreenShareBtn.onclick = async () => {
      try {
        if (!peerConnection) return console.warn("No active peerConnection");
        const sender = peerConnection.getSenders().find(s => s.track && s.track.kind === "video");
        if (!sender) return console.warn("No video sender found");

        if (!screenSharing) {
          console.log("🖥️ Starting screen share");
          const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          const screenTrack = screenStream.getVideoTracks()[0];
          savedCameraTrack = localStream.getVideoTracks()[0];
          await sender.replaceTrack(screenTrack);
          // local view: show the screenshare in mainVideo
          document.getElementById("mainVideo").srcObject = screenStream;
          screenSharing = true;
          screenTrack.onended = () => {
            // restore camera
            sender.replaceTrack(savedCameraTrack);
            document.getElementById("mainVideo").srcObject = remoteStream;
            screenSharing = false;
          };
        } else {
          // stop sharing -> restore camera
          await sender.replaceTrack(savedCameraTrack);
          document.getElementById("mainVideo").srcObject = remoteStream;
          screenSharing = false;
        }
      } catch (err) {
        console.error("❌ Screen share error:", err);
      }
    };
  }

  // === FULLSCREEN TOGGLE ===
  // const fullscreenBtn = document.getElementById("toggleFullscreenBtn");
  // if (fullscreenBtn) {
  //   fullscreenBtn.onclick = () => {
  //     const modal = document.getElementById("videoCallModal");
  //     if (!modal) return;

  //     if (modal.classList.contains("fullscreen")) {
  //       modal.classList.remove("fullscreen");
  //       fullscreenBtn.innerText = "⛶"; // restore icon
  //       console.log("⬜ Exited fullscreen mode");
  //     } else {
  //       modal.classList.add("fullscreen");
  //       fullscreenBtn.innerText = "🗗"; // alternate icon
  //       console.log("🖥️ Entered fullscreen mode");
  //     }
  //   };
  // }
  // === FULLSCREEN TOGGLE ===
const fullscreenBtn = document.getElementById("toggleFullscreenBtn");
if (fullscreenBtn) {
  fullscreenBtn.onclick = () => {
    const modal = document.getElementById("videoCallModal");
    if (!modal) return;

    if (modal.classList.contains("fullscreen")) {
      modal.classList.remove("fullscreen");
      fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
    } else {
      modal.classList.add("fullscreen");
      fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
    }
  };

  // Exit fullscreen with Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const modal = document.getElementById("videoCallModal");
      if (modal?.classList.contains("fullscreen")) {
        modal.classList.remove("fullscreen");
        fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
      }
    }
  });
}


  // === MINIMIZE TOGGLE ===
  const minimizeBtn = document.getElementById("minimizeCallBtn");
  if (minimizeBtn) {
    minimizeBtn.onclick = () => {
      const modal = document.getElementById("videoCallModal");
      if (!modal) return;

      // toggle minimized class
      if (modal.classList.contains("minimized")) {
        modal.classList.remove("minimized");
        minimizeBtn.innerText = "🔽";
        console.log("🔼 Restored full window size");
      } else {
        modal.classList.remove("fullscreen"); // exit fullscreen if any
        modal.classList.add("minimized");
        minimizeBtn.innerText = "🔼";
        console.log("🔽 Minimized video window");
      }
    };
  }


  // Mark messages as read + reload messages + refresh UI (your existing calls)
  const token = localStorage.getItem("token");
  try {
    await fetch(`${API_BASE_URL}/api/messages/${userId}/read`, { method: "PUT", headers: { "x-auth-token": token } });
  } catch (e) { /* ignore */ }

  await loadMessages(userId);
  await loadChatSidebar();
}

// flush buffers when page unloads / close
window.addEventListener("beforeunload", () => {
  if (peerConnection) peerConnection.close();
});



function getDateLabel(date) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
  }
}




// Load messages with user
async function loadMessages(userId) {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${API_BASE_URL}/api/messages/${userId}`, {
      headers: { "x-auth-token": token }
    });
    const messages = await res.json();

    const chatMessages = document.getElementById("chatMessages");
    chatMessages.innerHTML = "";

    if (!messages.length) {
      chatMessages.innerHTML = "<p class='text-muted'>No messages yet.</p>";
      return;
    }

    const payload = parseJwt(token);
    const currentUserId = payload.user?.id;

    let lastDate = null;

    messages.forEach(msg => {
      const senderId = typeof msg.sender === "object" ? msg.sender._id : msg.sender;
      const isMine = senderId?.toString() === currentUserId?.toString();

      const msgDate = new Date(msg.createdAt);
      const msgDay = msgDate.toDateString();

      if (lastDate !== msgDay) {
        const dateLabel = getDateLabel(msgDate);
        const wrapper = document.createElement("div");
        wrapper.className = "date-divider-wrapper";

        const divider = document.createElement("div");
        divider.className = "date-divider";
        divider.innerText = dateLabel;

        wrapper.appendChild(divider);
        chatMessages.appendChild(wrapper);

        lastDate = msgDay;
      }

      const time = msgDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      // ✅ Build message content
      // ✅ Build message content
      let content = "";

      // Show text if present
      if (msg.text) {
        content += `<div>${msg.text}</div>`;
      }

      // Handle file attachments
      if (msg.fileUrl) {
        const filePath = msg.fileUrl.startsWith('/uploads') ? (API_BASE_URL + msg.fileUrl) : msg.fileUrl;
        const fileName = msg.fileName || "file";

        switch (msg.fileType) {
          case "image":
            content += `
              <img src="${filePath}" 
                  class="img-fluid rounded mt-2" 
                  style="max-width:200px; display:block; cursor:pointer;" 
                  onclick="window.open('${filePath}', '_blank')" />
            `;
            break;

          case "video":
            content += `
              <video controls class="mt-2 rounded" style="max-width:250px; display:block;">
                <source src="${filePath}" type="video/mp4" />
                Your browser does not support video playback.
              </video>
            `;
            break;

          case "audio":
            content += `
              <audio controls class="mt-2">
                <source src="${filePath}" type="audio/mpeg" />
                Your browser does not support audio playback.
              </audio>
            `;
            break;

          default: // documents and others
            content += `
              <a href="${filePath}" target="_blank" 
                class="btn btn-sm btn-outline-secondary mt-2">
                📄 ${fileName}
              </a>
            `;
            break;
        }
      }


      const msgDiv = document.createElement("div");
      msgDiv.className = `mb-2 d-flex ${isMine ? "justify-content-end" : "justify-content-start"}`;
      msgDiv.innerHTML = `
        <div class="chat-bubble ${isMine ? "me" : "them"}">
          ${content}
          <div class="chat-timestamp">${time}</div>
        </div>
      `;
      chatMessages.appendChild(msgDiv);
    });

    chatMessages.scrollTop = chatMessages.scrollHeight;
  } catch (err) {
    console.error("Error loading messages:", err);
  }
}



// ---------- MESSAGE COMPOSER (Enter to send, Shift+Enter = newline) ----------
function clearFileChip() {
  const chip = document.getElementById("fileChip");
  if (chip) chip.classList.remove("show");
}

async function sendCurrentMessage() {
  const input = document.getElementById("messageInput");
  const fileInput = document.getElementById("fileInput");
  if (!input) return;
  const text = input.value.trim();
  const file = fileInput && fileInput.files[0];

  if (!text && !file) return;
  if (!activeChatUserId) { toast("Open a conversation first.", "info"); return; }

  const token = localStorage.getItem("token");
  const formData = new FormData();
  if (text) formData.append("text", text);
  if (file) formData.append("file", file);

  try {
    const res = await fetch(`${API_BASE_URL}/api/messages/${activeChatUserId}`, {
      method: "POST",
      headers: { "x-auth-token": token },
      body: formData
    });
    if (!res.ok) throw new Error("send failed");
    const savedMessage = await res.json();

    socket.emit("sendMessage", savedMessage);

    input.value = "";
    input.style.height = "auto";
    if (fileInput) fileInput.value = "";
    clearFileChip();
    await loadMessages(activeChatUserId);
    loadChatSidebar();
  } catch (err) {
    console.error("Error sending message:", err);
    toast("Could not send message. Please try again.", "error");
  }
}
window.sendCurrentMessage = sendCurrentMessage;

(function wireComposer() {
  const btn = document.getElementById("sendMessageBtn");
  const input = document.getElementById("messageInput");
  const fileInput = document.getElementById("fileInput");
  const attachBtn = document.getElementById("attachBtn");
  const fileChip = document.getElementById("fileChip");
  const fileChipName = document.getElementById("fileChipName");
  const fileChipRemove = document.getElementById("fileChipRemove");

  if (btn) btn.addEventListener("click", (e) => { e.preventDefault(); sendCurrentMessage(); });

  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();      // no newline, no form submit
        sendCurrentMessage();
      }
      // Shift+Enter falls through → newline
    });
    // Auto-grow textarea
    input.addEventListener("input", () => {
      input.style.height = "auto";
      input.style.height = Math.min(input.scrollHeight, 120) + "px";
    });
  }

  if (attachBtn && fileInput) attachBtn.addEventListener("click", () => fileInput.click());

  if (fileInput) fileInput.addEventListener("change", () => {
    const f = fileInput.files[0];
    if (f && fileChip) { fileChipName.textContent = f.name; fileChip.classList.add("show"); }
    else clearFileChip();
  });

  if (fileChipRemove) fileChipRemove.addEventListener("click", () => {
    if (fileInput) fileInput.value = "";
    clearFileChip();
  });
})();


socket.on("receiveMessage", (message) => {
  const senderId = message.sender && typeof message.sender === "object" ? message.sender._id : message.sender;
  // If it belongs to the open chat, reload the thread (handles text + attachments)
  if (activeChatUserId && senderId && activeChatUserId.toString() === senderId.toString()) {
    loadMessages(activeChatUserId);
  }
  // Refresh sidebar so last message + unread badge update
  loadChatSidebar();
});




/**
 * Populates the entire profile form from a user object.
 * This is the single source of truth for displaying profile data.
 * @param {object} user - The full user object (matching User.js schema)
 */
function populateProfileForm(user) {
  if (!user) {
    console.error("populateProfileForm: No user data provided.");
    return;
  }

  const profile = user.profile || {};

  try {
    // --- Basic Info Tab ---
    document.getElementById('fullName').value = profile.fullName || '';
    document.getElementById('username').value = profile.username || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('phone').value = user.phoneNumber || '';
    document.getElementById('location').value = profile.location || '';
    document.getElementById('bio').value = profile.bio || '';

    // --- Social Links ---
    const social = profile.socialLinks || {};
    document.querySelector('input[name="linkedin"]').value = social.linkedin || '';
    // Map 'github' from schema to 'portfolio' input in HTML
    document.querySelector('input[name="portfolio"]').value = social.github || '';

    // --- Skills Tab ---
    populateSkillsList('skillsOfferedList', profile.skillsOffered || []);
    populateSkillsList('skillsWantedList', profile.skillsToLearn || []);

    // --- Availability Tab ---
    const avail = profile.availability || {};
    const days = avail.days || [];
    document.querySelectorAll('input[name="availabilityDays"]').forEach(cb => {
      cb.checked = days.includes(cb.value);
    });

    // Handle time range
    const time = avail.time || "";
    const [start, end] = time.split(' - ').map(t => t.trim());
    document.getElementById('availabilityStart').value = start || '';
    document.getElementById('availabilityEnd').value = end || '';

    document.getElementById('availabilityTimezone').value = avail.timezone || '';

    // --- Profile Header (Left Card) ---
    document.getElementById('displayName').textContent = profile.fullName || 'Unnamed User';
    document.querySelector('.username').textContent = profile.username ? `@${profile.username}` : '';
    const avatarImg = document.getElementById('profileAvatar');
    if (avatarImg) avatarImg.src = avatarSrc(user);

  } catch (err) {
    console.error("Error populating profile form:", err);
  }
}

/**
 * Fetches the user's profile from the API, stores it globally,
 * and calls populateProfileForm to display it.
 */
async function fetchAndPopulateProfile() {
  const token = getToken();
  if (!token) {
    console.warn('fetchAndPopulateProfile: no token found.');
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.status}`);
    }

    const user = await response.json();

    // CRITICAL: Store fetched data in the global userData variable
    window.userData = user;
    if (!window.userData.profile) {
      window.userData.profile = {}; // Ensure profile object exists
    }

    // Populate the form with the new data
    populateProfileForm(window.userData);

    // Sync top-bar avatar
    if (window.userData.profilePicture) {
      const pbtn = document.getElementById('profileDropdown');
      if (pbtn) pbtn.innerHTML = `<img src="${avatarSrc(window.userData)}" alt="me" />`;
    }

  } catch (err) {
    console.error('fetchAndPopulateProfile error', err);
  }
}

/**
 * Populates a <ul> with skill items.
 * @param {string} listId - The ID of the <ul> element.
 * @param {Array} skillsArray - The array of skill objects.
 */
function populateSkillsList(listId, skillsArray) {
  const listEl = document.getElementById(listId);
  if (!listEl) {
    console.warn(`populateSkillsList: Element with ID "${listId}" not found.`);
    return;
  }

  listEl.innerHTML = ''; // Clear existing skills

  if (!Array.isArray(skillsArray) || skillsArray.length === 0) {
    listEl.innerHTML = `<li class="text-muted small">No skills listed.</li>`;
    return;
  }

  skillsArray.forEach(skill => {
    const skillName = skill.skillName || 'Unknown Skill';
    const level = skill.level || '';
    const categoryArr = skill.category || [];

    const catsText = categoryArr.length ? ` • ${categoryArr.join(', ')}` : '';
    const levelText = level ? ` (${level})` : '';

    const li = document.createElement('li');
    li.className = 'skill-item-display'; // Use a class for styling
    li.innerHTML = `
      <span class="skill-name">${escapeHtml(skillName)}</span>
      <span class="skill-level">${escapeHtml(levelText)}</span>
      <span class="skill-categories">${escapeHtml(catsText)}</span>
      <button type="button" class="remove-skill-btn" data-skill-name="${escapeHtml(skillName)}" style="display: none;">×</button>
    `;

    listEl.appendChild(li);
  });

  // Re-attach remove-skill-btn listeners if in edit mode
  if (editMode) {
    attachRemoveSkillListeners();
    document.querySelectorAll('.remove-skill-btn').forEach(btn => {
      btn.style.display = 'inline-block';
    });
  }
}

/**
 * Toggles the profile page between view and edit modes.
 */
function toggleEditMode() {
  editMode = !editMode;
  const editBtn = document.getElementById('editProfileBtn');
  const editButtons = document.getElementById('editButtons');
  const profileInputs = document.querySelectorAll('#profileSection input, #profileSection textarea, #profileSection select');

  if (editMode) {
    // --- ENTERING EDIT MODE ---
    editBtn.innerHTML = '<i class="fas fa-times me-2"></i>Cancel Edit';
    editBtn.className = 'btn btn-secondary';
    editButtons.style.display = 'block';

    profileInputs.forEach(input => {
      // Don't allow editing email
      if (input.id !== 'email') {
        input.removeAttribute('readonly');
        input.removeAttribute('disabled');
      }
    });

    // Show skill add fields
    document.querySelectorAll('.skill-edit-fields').forEach(el => el.style.display = 'block');
    // Show skill remove buttons
    document.querySelectorAll('.remove-skill-btn').forEach(btn => btn.style.display = 'inline-block');
    // Show avatar edit button
    const aeb = document.getElementById('avatarEditBtn');
    if (aeb) aeb.classList.add('show');

    // Init Tagify for skill inputs
    initTagify();

    // Attach add/remove skill events
    document.getElementById('addOfferedBtn').onclick = () => addSkill('Offered');
    document.getElementById('addWantedBtn').onclick = () => addSkill('Wanted');
    attachRemoveSkillListeners();

  } else {
    // --- EXITING EDIT MODE ---
    editBtn.innerHTML = '<i class="fas fa-edit me-2"></i>Edit Profile';
    editBtn.className = 'btn btn-primary';
    editButtons.style.display = 'none';

    profileInputs.forEach(input => {
      if (input.tagName.toLowerCase() === 'textarea') {
        input.setAttribute('readonly', 'readonly');
      } else if (['checkbox', 'radio'].includes(input.type) || input.tagName.toLowerCase() === 'select') {
        input.setAttribute('disabled', 'disabled');
      } else {
        input.setAttribute('readonly', 'readonly');
      }
    });

    // Hide skill add/remove UI
    document.querySelectorAll('.skill-edit-fields').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.remove-skill-btn').forEach(btn => btn.style.display = 'none');
    const aeb = document.getElementById('avatarEditBtn');
    if (aeb) aeb.classList.remove('show');
  }
}

/* ---------- Profile picture upload ---------- */
(function wireAvatarUpload() {
  document.addEventListener('DOMContentLoaded', () => {
    const editBtn = document.getElementById('avatarEditBtn');
    const fileInput = document.getElementById('avatarUploadInput');
    if (!editBtn || !fileInput) return;

    editBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async () => {
      const file = fileInput.files[0];
      if (!file) return;
      if (!/^image\//.test(file.type)) { toast('Please choose an image file.', 'warning'); return; }
      if (file.size > 5 * 1024 * 1024) { toast('Image must be under 5 MB.', 'warning'); return; }

      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('image', file);

      const avatarImg = document.getElementById('profileAvatar');
      const prev = avatarImg ? avatarImg.src : '';
      // instant local preview
      if (avatarImg) avatarImg.src = URL.createObjectURL(file);

      try {
        const res = await fetch(`${API_BASE_URL}/api/profile/picture`, {
          method: 'POST',
          headers: { 'x-auth-token': token },
          body: fd
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || 'Upload failed');

        const url = avatarSrc({ profilePicture: data.profilePicture });
        if (avatarImg) avatarImg.src = url;
        // keep global + dashboard in sync
        if (window.userData) window.userData.profilePicture = data.profilePicture;
        const dashAvatar = document.querySelector('.user-overview .avatar');
        if (dashAvatar) dashAvatar.src = url;
        // top-bar avatar
        const pbtn = document.getElementById('profileDropdown');
        if (pbtn) pbtn.innerHTML = `<img src="${url}" alt="me" />`;

        toast('Profile picture updated!', 'success');
      } catch (err) {
        console.error(err);
        if (avatarImg) avatarImg.src = prev;
        toast(err.message || 'Could not upload picture.', 'error');
      } finally {
        fileInput.value = '';
      }
    });
  });
})();

/**
 * Saves the "Basic Info" and "Availability" tabs.
 * Skills are saved separately by addSkill/removeSkill.
 */
async function saveProfile() {
  // 1. Collect Availability Data
  const availableDays = Array.from(document.querySelectorAll('input[name="availabilityDays"]:checked'))
    .map(cb => cb.value);

  const startTime = document.getElementById('availabilityStart').value;
  const endTime = document.getElementById('availabilityEnd').value;
  const timeString = (startTime && endTime) ? `${startTime} - ${endTime}` : "";

  const availability = {
    days: availableDays,
    time: timeString,
    timezone: document.getElementById('availabilityTimezone').value
  };

  // 2. Collect Basic Info Data
  const updatedProfile = {
    fullName: document.getElementById('fullName').value,
    username: document.getElementById('username').value,
    phoneNumber: document.getElementById('phone').value,
    location: document.getElementById('location').value,
    bio: document.getElementById('bio').value,
    socialLinks: {
      linkedin: document.querySelector('input[name="linkedin"]').value,
      // Map 'portfolio' input (HTML) back to 'github' (Schema)
      github: document.querySelector('input[name="portfolio"]').value
    },
    availability: availability, // Add availability object
    // so the server doesn't erase them.
    skillsOffered: window.userData.profile.skillsOffered || [],
    skillsToLearn: window.userData.profile.skillsToLearn || []
  };

  // 3. Send API Request
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/api/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "x-auth-token": token
      },
      // Send ONLY the fields we are updating
      body: JSON.stringify(updatedProfile)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to update profile');
    }

    const updatedUser = await res.json();

    // 4. Update global state and exit edit mode
    window.userData = updatedUser; // Update global data with response
    populateProfileForm(window.userData); // Re-populate form with saved data
    toast('Profile updated successfully!', 'success');
    toggleEditMode(); // Exit edit mode

  } catch (err) {
    console.error(err);
    toast('Error updating profile: ' + err.message, 'error');
  }
}

/**
 * Cancels the edit operation by re-populating the form
 * from the last-saved global userData state.
 */
function cancelEdit() {
  // Reset form to original values by re-populating
  if (window.userData) {
    populateProfileForm(window.userData);
  }
  toggleEditMode(); // Exit edit mode
}

/**
 * Adds a new skill to the user's profile and saves immediately.
 * @param {string} kind - 'Offered' or 'Wanted'
 */
async function addSkill(kind) {
  const lower = kind.toLowerCase();
  const isOffered = lower === 'offered';

  // 1. Get values from form
  const inputEl = document.getElementById(isOffered ? 'skillsOfferedInput' : 'skillsWantedInput');
  const levelEl = document.getElementById(isOffered ? 'skillLevelOffered' : 'skillLevelWanted');
  const categoryName = isOffered ? 'offered_category' : 'wanted_category';
  const categories = Array.from(document.querySelectorAll(`input[name="${categoryName}"]:checked`)).map(cb => cb.value);

  const tagifyInst = inputEl?.tagify || null;
  const tags = (tagifyInst && Array.isArray(tagifyInst.value)) ? tagifyInst.value : [];
  let skillName = tags.length ? tags[0].value.trim() : (inputEl?.value.trim() || '');
  const skillLevel = levelEl?.value.trim() || '';

  // 2. Validate
  if (!skillName) { toast('Please enter or select a skill name.', 'warning'); return; }
  if (!skillLevel) { toast('Please select a skill level.', 'warning'); return; }
  if (categories.length === 0) { toast('Please select at least one category.', 'warning'); return; }

  // 3. Ensure global data is loaded
  if (!window.userData || !window.userData.profile) {
    toast('Your data is still loading — please try again.', 'warning');
    return;
  }

  // 4. Create new skill and add to LOCAL copy
  const newSkill = {
    skillName,
    level: skillLevel,
    category: categories
  };
  const skillArray = isOffered ? window.userData.profile.skillsOffered : window.userData.profile.skillsToLearn;

  // Check for duplicates
  if (skillArray.find(s => s.skillName.toLowerCase() === skillName.toLowerCase())) {
    toast('You have already added this skill.', 'info');
    return;
  }

  skillArray.push(newSkill);

  // 5. Send API request with the *entire* updated profile
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/api/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "x-auth-token": token
      },
      // Send the entire profile object
      body: JSON.stringify(window.userData.profile)
    });

    if (!res.ok) {
      // Rollback: remove skill from local array if save failed
      skillArray.pop();
      throw new Error('Failed to save skill');
    }

    const updatedUser = await res.json();
    window.userData.profile = updatedUser.profile; // Update global data

    // 6. Update UI
    // Re-populate just the skill lists
    populateSkillsList('skillsOfferedList', window.userData.profile.skillsOffered || []);
    populateSkillsList('skillsWantedList', window.userData.profile.skillsToLearn || []);

    // 7. Clear inputs
    if (tagifyInst?.removeAllTags) tagifyInst.removeAllTags();
    else if (inputEl) inputEl.value = '';
    if (levelEl) levelEl.value = '';
    document.querySelectorAll(`input[name="${categoryName}"]:checked`).forEach(cb => cb.checked = false);

    toast(`${skillName} added.`, 'success');
  } catch (err) {
    console.error(err);
    toast('Error adding skill. Please try again.', 'error');
  }
}

/**
 * Attaches click listeners to all '.remove-skill-btn' buttons.
 */
function attachRemoveSkillListeners() {
  document.querySelectorAll('.remove-skill-btn').forEach(btn => {
    // Remove old listener to prevent duplicates
    btn.onclick = null;
    btn.onclick = (e) => {
      const skillName = e.target.closest('button').dataset.skillName;
      const listId = e.target.closest('ul').id;
      const type = (listId === 'skillsOfferedList') ? 'Offered' : 'Wanted';
      removeSkill(type, skillName);
    };
  });
}

/**
 * Removes a skill from the user's profile and saves immediately.
 * @param {string} type - 'Offered' or 'Wanted'
 * @param {string} skillName - The name of the skill to remove.
 */
async function removeSkill(type, skillName) {
  const ok = await confirmDialog({
    title: 'Remove skill?',
    message: `Remove "${skillName}" from your profile?`,
    confirmText: 'Remove',
    kind: 'danger'
  });
  if (!ok) return;

  if (!window.userData || !window.userData.profile) {
    toast('Your data is still loading — please try again.', 'warning');
    return;
  }

  const isOffered = type.toLowerCase() === 'offered';
  let skillArray = isOffered ? window.userData.profile.skillsOffered : window.userData.profile.skillsToLearn;

  // Find and remove from local array
  const originalSkillArray = [...skillArray];
  skillArray = skillArray.filter(s => s.skillName.toLowerCase() !== skillName.toLowerCase());

  if (isOffered) {
    window.userData.profile.skillsOffered = skillArray;
  } else {
    window.userData.profile.skillsToLearn = skillArray;
  }

  // Send API request
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/api/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "x-auth-token": token
      },
      body: JSON.stringify(window.userData.profile)
    });

    if (!res.ok) {
      // Rollback: restore original array
      if (isOffered) window.userData.profile.skillsOffered = originalSkillArray;
      else window.userData.profile.skillsToLearn = originalSkillArray;
      throw new Error('Failed to remove skill');
    }

    const updatedUser = await res.json();
    window.userData.profile = updatedUser.profile; // Update global data

    // Update UI
    populateSkillsList(isOffered ? 'skillsOfferedList' : 'skillsWantedList', skillArray);
    toast(`${skillName} removed.`, 'info');

  } catch (err) {
    console.error(err);
    toast('Error removing skill. Please try again.', 'error');
  }
}



//Dashboard section
// ===============================
// DASHBOARD: USER PROFILE INFO
// ===============================

// Reuse your token function
function getToken() {
  return localStorage.getItem('token');
}

async function loadDashboardProfile() {
  const token = getToken();
  if (!token) {
    console.warn('Dashboard: no token found in localStorage.');
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    });

    const user = await res.json();

    if (!res.ok) {
      console.error('Dashboard: failed to fetch profile', user);
      return;
    }

    const profile = user.profile || {};

    // Basic info
    const fullName = profile.fullName || user.fullName || 'Unnamed User';
    const username = profile.username || user.username || '';
    const avatarEl = document.querySelector('.user-overview .avatar');
    const nameEl = document.getElementById('userName');
    const usernameEl = document.getElementById('userUsername');
    const learnEl = document.getElementById('skillsToLearn');
    const teachEl = document.getElementById('skillsToTeach');

    // Set Name & Username
    if (nameEl) nameEl.textContent = fullName;
    if (usernameEl) usernameEl.textContent = username ? `${username}` : '';

    // Avatar from uploaded profile picture (falls back to default)
    if (avatarEl) {
      avatarEl.src = avatarSrc(user);
    }

    // Handle Skills Offered & Skills To Learn
    const skillsOffered = Array.isArray(profile.skillsOffered)
      ? profile.skillsOffered.map(skill => `${skill.skillName} (${skill.level})`)
      : [];

    const skillsToLearn = Array.isArray(profile.skillsToLearn)
      ? profile.skillsToLearn.map(skill => `${skill.skillName} (${skill.level})`)
      : [];

    if (teachEl) {
      teachEl.textContent = skillsOffered.length
        ? skillsOffered.join(', ')
        : 'No skills to teach listed';
    }

    if (learnEl) {
      learnEl.textContent = skillsToLearn.length
        ? skillsToLearn.join(', ')
        : 'No skills to learn listed';
    }

  } catch (err) {
    console.error('Dashboard: error while loading profile', err);
  }
}

document.addEventListener('DOMContentLoaded', loadDashboardProfile);


async function updateSkillSummary() {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE_URL}/api/connections`, {
      headers: { "x-auth-token": token }
    });

    const data = await res.json();
    if (!Array.isArray(data)) {
      console.error("Invalid connections data:", data);
      return;
    }

    // Extract logged-in user ID
    const payload = parseJwt(token);
    const userId = payload.user?.id;

    // Calculate metrics
    const totalConnections = data.filter(conn => {
      const fromId = conn.fromUser?._id?.toString();
      const toId = conn.toUser?._id?.toString();
      return fromId === userId || toId === userId;
    }).length;

    const completedSwaps = data.filter(conn => conn.status === "completed").length;

    const ongoingSwaps = data.filter(conn =>
      ["accepted", "active"].includes(conn.status)
    ).length;

    // Update UI
    document.getElementById("totalConnections").textContent = totalConnections;
    document.getElementById("completedSwaps").textContent = completedSwaps;
    document.getElementById("ongoingSwaps").textContent = ongoingSwaps;

    console.log("✅ Skill Summary updated:", { totalConnections, completedSwaps, ongoingSwaps });
  } catch (err) {
    console.error("Error updating skill summary:", err);
  }
}

// Call both functions together when dashboard loads
document.addEventListener("DOMContentLoaded", () => {
  loadConnections();
  updateSkillSummary();
});




async function loadRecentChats() {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE_URL}/api/messages`, {
      headers: { "x-auth-token": token }
    });
    const conversations = await res.json();

    const recentChatsList = document.getElementById("recentChatsList");
    recentChatsList.innerHTML = "";

    if (!conversations.length) {
      recentChatsList.innerHTML = `<li class="text-muted">No recent chats yet.</li>`;
      return;
    }

    const payload = parseJwt(token);
    const currentUserId = payload.user?.id;

    // Sort by last updated
    conversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    conversations.slice(0, 5).forEach(conv => {
      // Determine the chat partner
      const otherUser =
        conv.participants?.find(u => u._id !== currentUserId) ||
        conv.user ||
        conv.receiver ||
        conv.sender;

      const partnerName = otherUser?.profile?.fullName || "User";
      const partnerUsername = otherUser?.username
        ? `@${otherUser.username}`
        : "";
      const partnerAvatar = avatarSrc(otherUser);

      const lastMsg = conv.lastMessage;
      let lastMsgText = "";
      let time = "";

      if (lastMsg) {
        if (lastMsg.text) {
          lastMsgText = lastMsg.text.length > 40
            ? lastMsg.text.slice(0, 40) + "..."
            : lastMsg.text;
        } else if (lastMsg.fileType) {
          switch (lastMsg.fileType) {
            case "image":
              lastMsgText = "🖼️ Image";
              break;
            case "video":
              lastMsgText = "🎥 Video";
              break;
            case "audio":
              lastMsgText = "🎧 Audio";
              break;
            default:
              lastMsgText = "📎 Attachment";
          }
        } else {
          lastMsgText = "No message text";
        }

        time = new Date(lastMsg.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        });
      }

      // Build HTML for each chat item
      const li = document.createElement("li");
      li.className = "recent-chat-item d-flex align-items-center p-2 mb-2 rounded";
      li.style.cursor = "pointer";
      li.style.transition = "background 0.2s";
      li.onmouseover = () => (li.style.background = "#f8f9fa");
      li.onmouseout = () => (li.style.background = "transparent");

      li.innerHTML = `
        <img src="${partnerAvatar}" width="45" height="45" class="rounded-circle me-2" />
        <div class="flex-grow-1">
          <div class="d-flex justify-content-between align-items-center">
            <h6 class="mb-0">${partnerName}</h6>
            <small class="text-muted">${time || ""}</small>
          </div>
          <small class="text-muted">${lastMsgText}</small><br>
          <small class="text-muted">${partnerUsername}</small>
        </div>
      `;

      // On click → open chat (redirect to chat page)
      // On click → open chat inside homepage.html
      li.onclick = () => {
        localStorage.setItem("openChatUserId", otherUser?._id);
        showSection("messages");
        openChat(otherUser?._id, otherUser?.profile || otherUser);
      };


      recentChatsList.appendChild(li);
    });
  } catch (err) {
    console.error("Error loading recent chats:", err);
  }
}

// Call it with others
document.addEventListener("DOMContentLoaded", () => {
  updateSkillSummary();
  loadConnections();
  loadRecentChats();
});








// 🔍 Search functionality
async function searchUsers(query) { // 1. Changed argument to query
  const resultsContainer = document.getElementById("searchResultsContainer");
  const headerSearchInput = document.getElementById('searchInput');

  // 2. Set the header search bar's value so the user sees their query
  if (headerSearchInput) {
    headerSearchInput.value = query;
  }
  resultsContainer.innerHTML = "";

  if (!query) {
    resultsContainer.innerHTML = "<p class='text-muted text-center'>Please enter a search term.</p>";
    return;
  }

  const token = localStorage.getItem("token");
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/search?query=${encodeURIComponent(query)}`, {
      headers: { "x-auth-token": token }
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ Search failed:", response.status, text);
      resultsContainer.innerHTML = `<p class='text-danger text-center'>Server Error (${response.status})</p>`;
      return;
    }

    const users = await response.json();
    if (!users.length) {
      resultsContainer.innerHTML = "<p class='text-center text-muted'>No matching users found.</p>";
      return;
    }

    users.forEach(user => {
      const profile = user.profile || {};
      const card = document.createElement("div");
      card.className = "search-card";

      const skillsOffered = profile.skillsOffered?.map(s => escapeHtml(s.skillName)).join(", ") || "None";
      const skillsToLearn = profile.skillsToLearn?.map(s => escapeHtml(s.skillName)).join(", ") || "None";

      card.innerHTML = `
        <div class="d-flex align-items-center gap-2 mb-2">
          <img src="${avatarSrc(user)}" class="rounded-circle" width="48" height="48" style="object-fit:cover"/>
          <div>
            <h5>${escapeHtml(profile.fullName || "Unnamed User")}</h5>
            <small class="text-muted">@${escapeHtml(profile.username || "unknown")}</small>
          </div>
        </div>
        <p><strong>Teaches:</strong> ${skillsOffered}</p>
        <p><strong>Wants to learn:</strong> ${skillsToLearn}</p>
        <div class="d-flex gap-2 mt-2">
          <button class="btn btn-sm btn-outline-primary view-profile-btn" data-context="category" data-userid="${user._id}"><i class="fas fa-eye"></i> Profile</button>
          <button class="btn btn-sm btn-success request-btn" data-userid="${user._id}"><i class="fas fa-user-plus"></i> Request</button>
        </div>
      `;

      // Handle Request button
      // card.querySelector("button").addEventListener("click", () => {
      //   sendSkillRequest(user._id);
      // });

      resultsContainer.appendChild(card);
    });
  } catch (err) {
    console.error("Error performing search:", err);
    resultsContainer.innerHTML = "<p class='text-danger text-center'>Something went wrong. Please try again.</p>";
  }
}


// 🔹 Show search section (from navbar or anywhere)
// 🔹 New: Handle search from the main header bar (#searchInput)
// 🔹 Handle search from the main header bar (#searchInput)
const headerSearchInput = document.getElementById('searchInput');
if (headerSearchInput) {
  headerSearchInput.addEventListener('keydown', function(e) {
    // Check if the key pressed was "Enter"
    if (e.key === 'Enter') {
      e.preventDefault(); 
      const query = headerSearchInput.value.trim();

      if (query === "") {
        return; // Don't search for nothing
      }

      // 1. Switch to the search results page
      showSection('searchResultsSection');
      
      // 2. Run your search function directly with the query
      searchUsers(query);
      
      // 3. We DON'T clear the header bar. The user should see their query.
    }
  });
}

// 🔹 Back button
document.getElementById("backToHomeBtn").addEventListener("click", () => {
  showSection("home");
});

// ==================================
//      HELP & FEEDBACK FORM
// ==================================
document.addEventListener('DOMContentLoaded', () => {
  const feedbackForm = document.getElementById('feedbackForm');
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', async function(e) {
      e.preventDefault(); // Stop the form from reloading the page
      
      const subject = document.getElementById('feedbackSubject').value;
      const message = document.getElementById('feedbackMessage').value;
      const token = localStorage.getItem('token');

      if (!token) {
        showNotification('You must be logged in to submit feedback.', 'danger');
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/feedback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          body: JSON.stringify({ subject, message })
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Failed to submit feedback.');
        }

        // Use your existing notification function on success
        showNotification('Thank you for your feedback!', 'success');
        
        // Reset the form
        feedbackForm.reset();

      } catch (err) {
        console.error('Feedback Error:', err);
        showNotification(err.message, 'danger');
      }
    });
  }
});



/**
 * Fetches and displays recommended skill partners on the home dashboard.
 * Uses the /api/profile/recommended route.
 */
async function loadRecommendedPartners() {
  const token = localStorage.getItem("token");
  if (!token) return;

  const container = document.getElementById("recommendedPartnersList");
  const loadingMsg = document.getElementById("recommendedLoadingMsg");
  if (!container || !loadingMsg) return;

  // Show loading state
  loadingMsg.style.display = "block";
  loadingMsg.textContent = "Loading recommendations...";
  // Clear old results
  container.innerHTML = ""; 

 try {
    const res = await fetch(`${API_BASE_URL}/api/profile/recommended`, {
        headers: {
            "x-auth-token": token
        }
    });

    if (!res.ok) {
        throw new Error("Failed to fetch recommendations");
    }

    const users = await res.json();
    loadingMsg.style.display = "none";

    if (!users.length) {
        container.innerHTML = `<p class="text-muted">No recommendations found. Try adding more skills to your "Skills to Learn" list in your profile!</p>`;
        return;
    }

 // Create a card for each recommended user
users.slice(0, 4).forEach(user => {
    const profile = user.profile || {};

    const skillsOffered = (profile.skillsOffered || [])
        .map(s => `${s.skillName} (${s.level})`)
        .join(", ") || "No skills listed";

    const card = document.createElement("div");
    card.className = "col-md-6 col-lg-4 mb-3";

    card.innerHTML = `
        <div class="card h-100 shadow-sm">
            <div class="card-body d-flex flex-column">
                
                <div class="d-flex align-items-center mb-2">
                    <img 
                        src="${avatarSrc(user)}" style="object-fit:cover" 
                        width="45" 
                        height="45" 
                        class="rounded-circle me-2"
                    />

                    <div>
                        <h5 class="card-title mb-0">
                            ${profile.fullName || "Unnamed User"}
                        </h5>

                        <small class="text-muted">
                            @${profile.username || "unknown"}
                        </small>
                    </div>
                </div>

                <p class="card-text small">
                    <strong>Offers:</strong> ${escapeHtml(skillsOffered)}
                </p>

                <div class="mt-auto d-flex justify-content-between">
                    
                    <button 
                        class="btn btn-sm btn-outline-primary view-profile-btn"
                        data-context="category"
                        data-userid="${user._id}"
                    >
                        View Profile
                    </button>

                    <button 
                        class="btn btn-sm btn-success request-btn"
                        data-userid="${user._id}"
                    >
                        Request
                    </button>

                </div>
            </div>
        </div>
    `;

    container.appendChild(card);
});

} catch (err) {

    console.error("Error loading recommended partners:", err);

    loadingMsg.style.display = "none";

    container.innerHTML = `
        <p class="text-danger">
            Could not load recommendations. Please try again.
        </p>
    `;
}
}

/**
 * Fetches and displays recommended partners for the separate Dashboard section.
 */
async function loadDashboardRecommendedPartners() {
  const token = localStorage.getItem("token");
  if (!token) return;

  // 🌟 THE ONLY CHANGES ARE THESE TWO LINES 🌟
  const container = document.getElementById("dashboard-recommendedPartnersList");
  const loadingMsg = document.getElementById("dashboard-recommendedLoadingMsg");
  // 🌟 END OF CHANGES 🌟

  if (!container || !loadingMsg) return;

  // Show loading state
  loadingMsg.style.display = "block";
  loadingMsg.textContent = "Loading recommendations...";
  // Clear old results
  container.innerHTML = ""; 

try {
    const res = await fetch(`${API_BASE_URL}/api/profile/recommended`, {
        headers: {
            "x-auth-token": token
        }
    });

    if (!res.ok) {
        throw new Error("Failed to fetch recommendations");
    }

    const users = await res.json();

    loadingMsg.style.display = "none";

    if (!users.length) {
        container.innerHTML = `
            <p class="text-muted">
                No recommendations found. Try adding more skills to your
                "Skills to Learn" list in your profile!
            </p>
        `;
        return;
    }

    // Create a card for each recommended user
    users.slice(0, 4).forEach(user => {
        const profile = user.profile || {};

        const skillsOffered = (profile.skillsOffered || [])
            .map(s => `${s.skillName} (${s.level})`)
            .join(", ") || "No skills listed";

        const card = document.createElement("div");
        card.className = "col-md-6 col-lg-4 mb-3";

        card.innerHTML = `
            <div class="card h-100 shadow-sm">
                <div class="card-body d-flex flex-column">

                    <div class="d-flex align-items-center mb-2">
                        <img
                            src="${avatarSrc(user)}" style="object-fit:cover"
                            width="45"
                            height="45"
                            class="rounded-circle me-2"
                        />

                        <div>
                            <h5 class="card-title mb-0">
                                ${profile.fullName || "Unnamed User"}
                            </h5>

                            <small class="text-muted">
                                @${profile.username || "unknown"}
                            </small>
                        </div>
                    </div>

                    <p class="card-text small">
                        <strong>Offers:</strong>
                        ${escapeHtml(skillsOffered)}
                    </p>

                    <div class="mt-auto d-flex justify-content-between">

                        <button
                            class="btn btn-sm btn-outline-primary view-profile-btn"
                            data-context="category"
                            data-userid="${user._id}"
                        >
                            View Profile
                        </button>

                        <button
                            class="btn btn-sm btn-success request-btn"
                            data-userid="${user._id}"
                        >
                            Request
                        </button>

                    </div>

                </div>
            </div>
        `;

        container.appendChild(card);
    });

} catch (err) {
    console.error("Error loading dashboard recommended partners:", err);

    loadingMsg.style.display = "none";

    container.innerHTML = `
        <p class="text-danger">
            Could not load recommendations. Please try again.
        </p>
    `;
}
}

/**
 * Sets the welcome greeting using the name from local storage.
 */
function setWelcomeMessage() {
    const fullName = localStorage.getItem("fullName");

    const greetingElement = document.getElementById("welcomeGreeting");

    if (fullName && greetingElement) {
        greetingElement.textContent = `Welcome back, ${fullName}!`;
    }
}

/* ensure fetch runs on DOMContentLoaded */
document.addEventListener('DOMContentLoaded', function() {

    setTimeout(() => {
        fetchAndPopulateProfile();
    }, 200);

    loadRecommendedPartners();
    loadDashboardRecommendedPartners();
    setWelcomeMessage();

});
