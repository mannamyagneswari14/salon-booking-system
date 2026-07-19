/* ==========================================
   SALON & SPA BOOKING SYSTEM - JAVASCRIPT
   Fetch API Integration & Client-Side Controller
   ========================================== */

const API_BASE_URL = 'http://127.0.0.1:8000';

// Global state
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let currentRole = localStorage.getItem('currentRole') || null; // 'customer' or 'admin'

// Toast notifications helper
function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-message">${message}</span>
        </div>
    `;

    container.appendChild(toast);

    // Auto-remove after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'fadeInUp 0.3s ease-out reverse';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 4000);
}

// Fetch API Wrapper
async function apiFetch(endpoint, method = 'GET', body = null) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
    };

    const config = {
        method,
        headers,
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Something went wrong');
        }
        return data;
    } catch (error) {
        showToast(error.message, 'error');
        throw error;
    }
}

// Check auth state and update Navbar
function updateNavbar() {
    const navLinks = document.getElementById('nav-links');
    const navActions = document.getElementById('nav-actions');
    if (!navLinks || !navActions) return;

    // Standard navbar links
    let linksHtml = `
        <li><a href="index.html" id="link-home">Home</a></li>
        <li><a href="services.html" id="link-services">Services</a></li>
        <li><a href="stylists.html" id="link-stylists">Stylists</a></li>
        <li><a href="booking.html" id="link-book">Book Appointment</a></li>
    `;

    if (currentRole === 'admin') {
        linksHtml += `<li><a href="admin_dashboard.html" id="link-admin">Admin Panel</a></li>`;
    } else if (currentUser) {
        linksHtml += `<li><a href="customer_dashboard.html" id="link-dashboard">My Dashboard</a></li>`;
    }

    navLinks.innerHTML = linksHtml;

    // Login/Logout Action buttons
    if (currentUser) {
        navActions.innerHTML = `
            <span style="font-weight: 500; font-size: 0.9rem; color: var(--accent);">
                Hi, ${currentUser.full_name.split(' ')[0]}
            </span>
            <button class="btn btn-secondary btn-sm" id="btn-logout">Logout</button>
        `;
        document.getElementById('btn-logout').addEventListener('click', logout);
    } else {
        navActions.innerHTML = `
            <a href="login.html" class="btn btn-secondary btn-sm">Login</a>
            <a href="register.html" class="btn btn-primary btn-sm">Sign Up</a>
        `;
    }

    // Highlight current page active link
    const page = window.location.pathname.split('/').pop();
    if (page === 'index.html' || page === '') {
        setActiveLink('link-home');
    } else if (page === 'services.html') {
        setActiveLink('link-services');
    } else if (page === 'stylists.html') {
        setActiveLink('link-stylists');
    } else if (page === 'booking.html') {
        setActiveLink('link-book');
    } else if (page === 'customer_dashboard.html') {
        setActiveLink('link-dashboard');
    } else if (page === 'admin_dashboard.html') {
        setActiveLink('link-admin');
    }
}

function setActiveLink(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
}

// Logout handler
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentRole');
    currentUser = null;
    currentRole = null;
    showToast('Logged out successfully', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Setup Mobile Menu Toggle
function setupMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
}

// Password Visibility Toggle helper
function setupPasswordToggle() {
    const toggles = document.querySelectorAll('.pwd-toggle');
    toggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            const input = toggle.previousElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                toggle.textContent = '🙈';
            } else {
                input.type = 'password';
                toggle.textContent = '👁️';
            }
        });
    });
}


/* ==================================================
   PAGE INITIALIZERS
   ================================================== */

document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
    setupMobileMenu();
    setupPasswordToggle();

    // Route page execution based on page wrapper element IDs
    if (document.getElementById('home-page')) initHomePage();
    if (document.getElementById('login-page')) initLoginPage();
    if (document.getElementById('register-page')) initRegisterPage();
    if (document.getElementById('services-page')) initServicesPage();
    if (document.getElementById('stylists-page')) initStylistsPage();
    if (document.getElementById('booking-page')) initBookingPage();
    if (document.getElementById('payment-page')) initPaymentPage();
    if (document.getElementById('customer-dashboard-page')) initCustomerDashboardPage();
    if (document.getElementById('admin-dashboard-page')) initAdminDashboardPage();
});

// ================= Home Page Logic =================
async function initHomePage() {
    try {
        // Load featured services (Limit 3)
        const services = await apiFetch('/services/');
        const featuredContainer = document.getElementById('featured-services-container');
        if (featuredContainer && services.length > 0) {
            featuredContainer.innerHTML = services.slice(0, 3).map(service => `
                <div class="service-card">
                    <div class="service-img-wrapper">
                        <img src="${service.image_url || 'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=600&auto=format&fit=crop'}" alt="${service.service_name}">
                        <span class="service-badge">${service.category}</span>
                    </div>
                    <div class="service-info">
                        <h3 class="service-name">${service.service_name}</h3>
                        <p class="service-desc">${service.description}</p>
                        <div class="service-meta">
                            <span class="service-price">₹${service.price}</span>
                            <span class="service-duration">⏱️ ${service.duration} mins</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        // Load popular stylists (Limit 3)
        const stylists = await apiFetch('/stylists/');
        const popularContainer = document.getElementById('popular-stylists-container');
        if (popularContainer && stylists.length > 0) {
            popularContainer.innerHTML = stylists.slice(0, 3).map(stylist => `
                <div class="stylist-card">
                    <div class="stylist-avatar-wrapper">
                        <img class="stylist-avatar" src="${stylist.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop'}" alt="${stylist.stylist_name}">
                        <span class="status-indicator ${stylist.availability}"></span>
                    </div>
                    <h3 class="stylist-name">${stylist.stylist_name}</h3>
                    <p class="stylist-spec">${stylist.specialization}</p>
                    <span class="stylist-exp">${stylist.experience} Years Exp</span>
                    <div class="stylist-rating">⭐ ${stylist.rating || 4.8} / 5.0</div>
                </div>
            `).join('');
        }
    } catch (e) {
        console.error("Home page load failed:", e);
    }
}

// ================= Login Page Logic =================
function initLoginPage() {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            showToast('Please fill in all fields', 'warning');
            return;
        }

        try {
            const result = await apiFetch('/customers/login/', 'POST', { email, password });
            
            // Store session
            localStorage.setItem('currentUser', JSON.stringify(result.customer));
            localStorage.setItem('currentRole', result.role);
            
            showToast(result.message, 'success');
            
            setTimeout(() => {
                if (result.role === 'admin') {
                    window.location.href = 'admin_dashboard.html';
                } else {
                    // Check if redirect path from booking page exists
                    const next = localStorage.getItem('authRedirect');
                    if (next) {
                        localStorage.removeItem('authRedirect');
                        window.location.href = next;
                    } else {
                        window.location.href = 'customer_dashboard.html';
                    }
                }
            }, 1000);
        } catch (err) {
            // Error toast handled by apiFetch
        }
    });
}

// ================= Register Page Logic =================
function initRegisterPage() {
    const form = document.getElementById('register-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const full_name = document.getElementById('reg-name').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const phone = document.getElementById('reg-phone').value.trim();
        const gender = document.getElementById('reg-gender').value;
        const password = document.getElementById('reg-pwd').value;
        const confirmPassword = document.getElementById('reg-pwd-confirm').value;

        if (!full_name || !email || !phone || !gender || !password) {
            showToast('Please fill in all fields', 'warning');
            return;
        }

        if (password !== confirmPassword) {
            showToast('Passwords do not match', 'warning');
            return;
        }

        if (password.length < 6) {
            showToast('Password must be at least 6 characters long', 'warning');
            return;
        }

        try {
            const customer = await apiFetch('/customers/add/', 'POST', {
                full_name,
                email,
                phone,
                gender,
                password
            });

            showToast('Registration successful! Please login.', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        } catch (err) {
            // Error handled by apiFetch
        }
    });
}

// ================= Services Page (Search & Filters - Bonus) =================
async function initServicesPage() {
    const container = document.getElementById('services-list-container');
    const searchInput = document.getElementById('service-search');
    const categoryTabs = document.querySelectorAll('.filter-tab');
    if (!container) return;

    try {
        const services = await apiFetch('/services/');
        let activeCategory = 'All';
        let searchQuery = '';

        // Render function
        const render = () => {
            const filtered = services.filter(service => {
                const matchCategory = activeCategory === 'All' || service.category.toLowerCase() === activeCategory.toLowerCase();
                const matchSearch = service.service_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                    service.description.toLowerCase().includes(searchQuery.toLowerCase());
                return matchCategory && matchSearch;
            });

            if (filtered.length === 0) {
                container.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
                        No services found matching your criteria.
                    </div>
                `;
                return;
            }

            container.innerHTML = filtered.map(service => `
                <div class="service-card">
                    <div class="service-img-wrapper">
                        <img src="${service.image_url || 'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=600&auto=format&fit=crop'}" alt="${service.service_name}">
                        <span class="service-badge">${service.category}</span>
                    </div>
                    <div class="service-info">
                        <h3 class="service-name">${service.service_name}</h3>
                        <p class="service-desc">${service.description}</p>
                        <div class="service-meta" style="margin-bottom: 16px;">
                            <span class="service-price">₹${service.price}</span>
                            <span class="service-duration">⏱️ ${service.duration} mins</span>
                        </div>
                        <button class="btn btn-primary btn-sm" onclick="selectServiceForBooking('${service.service_name}', ${service.price})">
                            Book Now
                        </button>
                    </div>
                </div>
            `).join('');
        };

        // Search trigger
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value;
                render();
            });
        }

        // Category trigger
        categoryTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                categoryTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                activeCategory = tab.dataset.category;
                render();
            });
        });

        // Initial render
        render();

    } catch (e) {
        container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--danger);">Failed to load services.</div>`;
    }
}

// Global click handler to redirect to booking page with selected service
window.selectServiceForBooking = function(serviceName, price) {
    localStorage.setItem('selectedServiceName', serviceName);
    localStorage.setItem('selectedServicePrice', price);
    window.location.href = 'booking.html';
};

// ================= Stylists Page Logic =================
async function initStylistsPage() {
    const container = document.getElementById('stylists-list-container');
    if (!container) return;

    try {
        const stylists = await apiFetch('/stylists/');
        if (stylists.length === 0) {
            container.innerHTML = `<div style="grid-column:1/-1; text-align:center;">No stylists available.</div>`;
            return;
        }

        container.innerHTML = stylists.map(stylist => `
            <div class="stylist-card">
                <div class="stylist-avatar-wrapper">
                    <img class="stylist-avatar" src="${stylist.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop'}" alt="${stylist.stylist_name}">
                    <span class="status-indicator ${stylist.availability}"></span>
                </div>
                <h3 class="stylist-name">${stylist.stylist_name}</h3>
                <p class="stylist-spec">${stylist.specialization}</p>
                <span class="stylist-exp">${stylist.experience} Years Exp</span>
                <div class="stylist-rating">⭐ ${stylist.rating || 4.8} / 5.0</div>
                <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 20px;">
                    📞 ${stylist.phone}
                </div>
                <button class="btn btn-secondary btn-sm" 
                        style="width: 100%; border-color: var(--primary);" 
                        ${stylist.availability !== 'Available' ? 'disabled style="opacity:0.5;"' : ''}
                        onclick="selectStylistForBooking('${stylist.stylist_name}')">
                    ${stylist.availability === 'Available' ? 'Request Stylist' : stylist.availability}
                </button>
            </div>
        `).join('');
    } catch (e) {
        container.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:var(--danger);">Failed to load stylists.</div>`;
    }
}

window.selectStylistForBooking = function(stylistName) {
    localStorage.setItem('selectedStylistName', stylistName);
    window.location.href = 'booking.html';
};

// ================= Booking Page Logic =================
async function initBookingPage() {
    // If user is not logged in, redirect them to login first
    if (!currentUser) {
        showToast('Please login to book appointments', 'warning');
        localStorage.setItem('authRedirect', 'booking.html');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1200);
        return;
    }

    const serviceSelect = document.getElementById('book-service');
    const stylistSelect = document.getElementById('book-stylist');
    const bookingDate = document.getElementById('book-date');
    const timeSlotsContainer = document.getElementById('time-slots-container');
    const bookingForm = document.getElementById('booking-form');

    if (!serviceSelect || !stylistSelect || !bookingForm) return;

    // Load services & stylists
    try {
        const [services, stylists] = await Promise.all([
            apiFetch('/services/'),
            apiFetch('/stylists/')
        ]);

        // Populate Services
        serviceSelect.innerHTML = '<option value="">Select a service</option>' + 
            services.map(s => `<option value="${s.service_name}" data-price="${s.price}">${s.service_name} (₹${s.price})</option>`).join('');

        // Populate Stylists
        stylistSelect.innerHTML = '<option value="">Select a stylist</option>' + 
            stylists.map(st => `<option value="${st.stylist_name}" data-status="${st.availability}">${st.stylist_name} (${st.availability})</option>`).join('');

        // Check if values pre-selected from other pages
        const preSelectedService = localStorage.getItem('selectedServiceName');
        if (preSelectedService) {
            serviceSelect.value = preSelectedService;
            localStorage.removeItem('selectedServiceName');
            localStorage.removeItem('selectedServicePrice');
        }

        const preSelectedStylist = localStorage.getItem('selectedStylistName');
        if (preSelectedStylist) {
            stylistSelect.value = preSelectedStylist;
            localStorage.removeItem('selectedStylistName');
        }

        // Setup Datepicker limit (today onwards)
        const today = new Date().toISOString().split('T')[0];
        bookingDate.setAttribute('min', today);
        bookingDate.value = today;

        // Render Summary Invoice
        let selectedServicePrice = 0;
        let selectedTimeSlot = '';

        const updateSummary = () => {
            const svcName = serviceSelect.value;
            const opt = serviceSelect.options[serviceSelect.selectedIndex];
            selectedServicePrice = opt ? parseFloat(opt.dataset.price || 0) : 0;
            
            const styName = stylistSelect.value || 'Any Stylist';
            const dateVal = bookingDate.value || 'Not selected';
            const timeVal = selectedTimeSlot || 'Not selected';

            document.getElementById('sum-service').textContent = svcName || 'None';
            document.getElementById('sum-stylist').textContent = styName;
            document.getElementById('sum-date').textContent = dateVal;
            document.getElementById('sum-time').textContent = timeVal;
            document.getElementById('sum-price').textContent = `₹${selectedServicePrice}`;
            document.getElementById('sum-total').textContent = `₹${selectedServicePrice}`;
        };

        serviceSelect.addEventListener('change', updateSummary);
        stylistSelect.addEventListener('change', () => {
            updateSummary();
            renderTimeSlots(); // Re-render slots when stylist changes
        });
        bookingDate.addEventListener('change', () => {
            updateSummary();
            renderTimeSlots(); // Re-render slots when date changes
        });

        // Time slot simulation (Bonus: Stylist Availability visual slots)
        const renderTimeSlots = () => {
            const selectedStylist = stylistSelect.value;
            const selectedOpt = stylistSelect.options[stylistSelect.selectedIndex];
            const stylistStatus = selectedOpt ? selectedOpt.dataset.status : 'Available';

            timeSlotsContainer.innerHTML = '';
            selectedTimeSlot = '';
            updateSummary();

            const slots = [
                '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
            ];

            slots.forEach(slot => {
                const btn = document.createElement('div');
                btn.className = 'time-slot';
                btn.textContent = slot;

                // Simulate stylist busy/booked slots
                // If stylist is on 'Leave', all slots are booked/unavailable
                // If 'Busy', some slots are randomly locked
                // Also simulate '11:30' from test appointments as booked
                let isBooked = false;
                if (stylistStatus === 'Leave') {
                    isBooked = true;
                } else if (stylistStatus === 'Busy' && (slot === '10:00' || slot === '14:00' || slot === '16:00')) {
                    isBooked = true;
                }

                if (isBooked) {
                    btn.classList.add('booked');
                    btn.textContent += ' (Busy)';
                } else {
                    btn.addEventListener('click', () => {
                        document.querySelectorAll('.time-slot').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        selectedTimeSlot = slot;
                        updateSummary();
                    });
                }

                timeSlotsContainer.appendChild(btn);
            });
        };

        renderTimeSlots();
        updateSummary();

        // Submit Booking Form
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const service_name = serviceSelect.value;
            const stylist_name = stylistSelect.value;
            const appointment_date = bookingDate.value;

            if (!service_name) {
                showToast('Please select a service', 'warning');
                return;
            }
            if (!stylist_name) {
                showToast('Please select a stylist', 'warning');
                return;
            }
            if (!appointment_date) {
                showToast('Please select a date', 'warning');
                return;
            }
            if (!selectedTimeSlot) {
                showToast('Please choose an available time slot', 'warning');
                return;
            }

            try {
                // Submit Appointment
                const appointment = await apiFetch('/appointments/add/', 'POST', {
                    customer_name: currentUser.full_name,
                    stylist_name,
                    service_name,
                    appointment_date,
                    appointment_time: selectedTimeSlot,
                    total_amount: selectedServicePrice,
                    appointment_status: 'Booked'
                });

                showToast('Appointment reserved! Redirecting to checkout...', 'success');

                // Save booking details to pass to payment page
                localStorage.setItem('pendingAppointment', JSON.stringify(appointment));

                setTimeout(() => {
                    window.location.href = 'payment.html';
                }, 1200);

            } catch (err) {
                // Error handled by Fetch wrapper
            }
        });

    } catch (e) {
        console.error("Booking page init failed:", e);
    }
}

// ================= Payment Page Logic =================
function initPaymentPage() {
    const pendingAppt = JSON.parse(localStorage.getItem('pendingAppointment'));
    if (!pendingAppt) {
        showToast('No booking in progress. Redirecting...', 'warning');
        setTimeout(() => { window.location.href = 'booking.html'; }, 1000);
        return;
    }

    // Set invoice details
    document.getElementById('pay-service').textContent = pendingAppt.service_name;
    document.getElementById('pay-stylist').textContent = pendingAppt.stylist_name;
    document.getElementById('pay-datetime').textContent = `${pendingAppt.appointment_date} at ${pendingAppt.appointment_time}`;
    document.getElementById('pay-total').textContent = `₹${pendingAppt.total_amount}`;
    document.getElementById('pay-button-amount').textContent = `₹${pendingAppt.total_amount}`;

    // Handle payment method toggling UI (QR Code simulation for UPI, card form for cards)
    const paymentMethods = document.querySelectorAll('input[name="payment_method"]');
    const cardSection = document.getElementById('card-payment-details');
    const upiSection = document.getElementById('upi-payment-details');

    paymentMethods.forEach(method => {
        method.addEventListener('change', (e) => {
            if (e.target.value === 'Credit Card' || e.target.value === 'Debit Card') {
                cardSection.style.display = 'block';
                upiSection.style.display = 'none';
            } else if (e.target.value === 'UPI') {
                cardSection.style.display = 'none';
                upiSection.style.display = 'block';
            } else {
                cardSection.style.display = 'none';
                upiSection.style.display = 'none';
            }
        });
    });

    // Form Submit
    const form = document.getElementById('payment-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const method = document.querySelector('input[name="payment_method"]:checked').value;
        const today = new Date().toISOString().split('T')[0];

        try {
            // 1. Log payment on backend
            const payment = await apiFetch('/payments/add/', 'POST', {
                customer_name: currentUser.full_name,
                appointment_id: pendingAppt.appointment_id,
                amount: pendingAppt.total_amount,
                payment_method: method,
                payment_status: 'Paid',
                payment_date: today
            });

            // 2. Update appointment status (mark as Paid/Booked)
            await apiFetch(`/appointments/update/${pendingAppt.appointment_id}/`, 'PUT', {
                appointment_status: 'Booked'
            });

            showToast('Payment Successful! Appointment Booked.', 'success');
            localStorage.removeItem('pendingAppointment');

            setTimeout(() => {
                window.location.href = 'customer_dashboard.html';
            }, 1500);

        } catch (err) {
            // Handled
        }
    });
}

// ================= Customer Dashboard Page Logic =================
async function initCustomerDashboardPage() {
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('dashboard-user-name').textContent = currentUser.full_name;

    try {
        // Load customer appointments
        const appointments = await apiFetch(`/appointments/?customer_name=${encodeURIComponent(currentUser.full_name)}`);

        // Upcoming appointments
        const upcomingContainer = document.getElementById('upcoming-appointments-list');
        const upcoming = appointments.filter(a => a.appointment_status === 'Booked');

        // Render upcoming
        if (upcoming.length === 0) {
            upcomingContainer.innerHTML = `
                <div style="background-color: var(--bg-card); padding: 30px; border-radius: 12px; border: 1px solid var(--border-color); text-align: center;">
                    <p style="color: var(--text-muted); margin-bottom: 16px;">You don't have any upcoming appointments.</p>
                    <a href="booking.html" class="btn btn-primary btn-sm">Book An Appointment</a>
                </div>
            `;
            document.getElementById('next-appt-reminder').style.display = 'none';
        } else {
            upcomingContainer.innerHTML = upcoming.map(appt => `
                <div class="service-card" style="flex-direction: row; padding: 20px; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap;">
                    <div>
                        <span class="badge badge-success" style="margin-bottom: 8px;">Booked</span>
                        <h3 style="font-size: 1.3rem;">${appt.service_name}</h3>
                        <p style="color: var(--text-muted); font-size: 0.9rem;">With <strong>${appt.stylist_name}</strong></p>
                        <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 4px;">📅 ${appt.appointment_date} at ⏱️ ${appt.appointment_time}</p>
                    </div>
                    <div style="text-align: right; display:flex; flex-direction:column; gap:10px;">
                        <span style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: var(--accent);">₹${appt.total_amount}</span>
                        <button class="btn btn-secondary btn-sm" style="border-color: var(--danger); color: var(--danger);" onclick="cancelAppointment(${appt.appointment_id})">
                            Cancel
                        </button>
                    </div>
                </div>
            `).join('');

            // Setup upcoming countdown reminder (Bonus feature)
            setupCountdownTimer(upcoming[0]);
        }

        // Completed services
        const historyContainer = document.getElementById('completed-services-list');
        const history = appointments.filter(a => a.appointment_status === 'Completed' || a.appointment_status === 'Cancelled');

        if (history.length === 0) {
            historyContainer.innerHTML = `<p style="color: var(--text-muted); text-align: center;">No appointment history found.</p>`;
        } else {
            historyContainer.innerHTML = history.map(appt => `
                <div class="service-card" style="flex-direction: row; padding: 20px; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; opacity: 0.85;">
                    <div>
                        <span class="badge ${appt.appointment_status === 'Completed' ? 'badge-success' : 'badge-danger'}" style="margin-bottom: 8px;">
                            ${appt.appointment_status}
                        </span>
                        <h3 style="font-size: 1.2rem;">${appt.service_name}</h3>
                        <p style="color: var(--text-muted); font-size: 0.9rem;">With ${appt.stylist_name}</p>
                        <p style="color: var(--text-muted); font-size: 0.85rem;">Date: ${appt.appointment_date}</p>
                    </div>
                    <div>
                        <span style="font-size: 1.1rem; font-weight: 600; color: var(--text-main);">₹${appt.total_amount}</span>
                    </div>
                </div>
            `).join('');
        }

        // Payment history table
        const paymentBody = document.getElementById('payment-history-body');
        const allPayments = await apiFetch('/payments/');
        const userPayments = allPayments.filter(p => p.customer_name === currentUser.full_name);

        if (userPayments.length === 0) {
            paymentBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No payment transactions logged.</td></tr>`;
        } else {
            paymentBody.innerHTML = userPayments.map(p => `
                <tr>
                    <td>#PAY-${p.payment_id}</td>
                    <td>#APT-${p.appointment_id}</td>
                    <td>₹${p.amount}</td>
                    <td>${p.payment_method}</td>
                    <td><span class="badge badge-success">${p.payment_status}</span></td>
                </tr>
            `).join('');
        }

    } catch (e) {
        showToast('Failed to load dashboard data', 'error');
    }
}

// Countdown timer calculator (Bonus: Appointment Reminder System)
function setupCountdownTimer(nextAppt) {
    const reminderBox = document.getElementById('next-appt-reminder');
    const countdownEl = document.getElementById('countdown-timer');
    if (!reminderBox || !countdownEl) return;

    document.getElementById('reminder-service-name').textContent = nextAppt.service_name;
    document.getElementById('reminder-stylist').textContent = nextAppt.stylist_name;
    document.getElementById('reminder-time').textContent = nextAppt.appointment_time;

    reminderBox.style.display = 'block';

    const updateTimer = () => {
        // Parse date and time (YYYY-MM-DD and HH:MM)
        const targetStr = `${nextAppt.appointment_date}T${nextAppt.appointment_time}:00`;
        const targetDate = new Date(targetStr);
        const now = new Date();

        const diffMs = targetDate - now;

        if (diffMs <= 0) {
            countdownEl.textContent = 'Happening Now!';
            clearInterval(timerInterval);
            return;
        }

        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

        let countdownText = '';
        if (days > 0) countdownText += `${days}d `;
        countdownText += `${hours.toString().padStart(2, '0')}h : ${minutes.toString().padStart(2, '0')}m : ${seconds.toString().padStart(2, '0')}s`;

        countdownEl.textContent = countdownText;
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
}

// Cancel booking
window.cancelAppointment = async function(apptId) {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    try {
        await apiFetch(`/appointments/update/${apptId}/`, 'PUT', {
            appointment_status: 'Cancelled'
        });
        showToast('Appointment cancelled successfully', 'success');
        initCustomerDashboardPage(); // refresh
    } catch (e) {
        showToast('Cancellation failed', 'error');
    }
};


// ================= Admin Dashboard (Full CRUD panels) =================
let adminData = {
    customers: [],
    services: [],
    stylists: [],
    appointments: [],
    payments: []
};

async function initAdminDashboardPage() {
    if (currentRole !== 'admin') {
        window.location.href = 'login.html';
        return;
    }

    // Sidebar navigation togglers
    const tabs = document.querySelectorAll('.admin-tab');
    const sections = document.querySelectorAll('.admin-content-section');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            tab.classList.add('active');
            const targetSection = document.getElementById(`admin-sec-${tab.dataset.section}`);
            if (targetSection) targetSection.classList.add('active');
        });
    });

    // Load initial stats & database records
    await refreshAdminData();
}

async function refreshAdminData() {
    try {
        const [cust, serv, styl, appt, pay] = await Promise.all([
            apiFetch('/customers/'),
            apiFetch('/services/'),
            apiFetch('/stylists/'),
            apiFetch('/appointments/'),
            apiFetch('/payments/')
        ]);

        adminData.customers = cust;
        adminData.services = serv;
        adminData.stylists = styl;
        adminData.appointments = appt;
        adminData.payments = pay;

        // Render Statistics summary
        document.getElementById('stat-total-bookings').textContent = appt.length;
        document.getElementById('stat-total-customers').textContent = cust.length;
        document.getElementById('stat-active-stylists').textContent = styl.filter(s => s.availability === 'Available').length;
        
        const totalRevenue = pay.reduce((sum, p) => p.payment_status === 'Paid' ? sum + p.amount : sum, 0);
        document.getElementById('stat-total-income').textContent = `₹${totalRevenue}`;

        // Render Tables
        renderCustomersTable();
        renderServicesTable();
        renderStylistsTable();
        renderAppointmentsTable();
        renderPaymentsTable();

    } catch (e) {
        showToast('Admin data fetch failed', 'error');
    }
}

// 1. Customers Table CRUD
function renderCustomersTable() {
    const tbody = document.getElementById('admin-customers-body');
    if (!tbody) return;
    tbody.innerHTML = adminData.customers.map(c => `
        <tr>
            <td>${c.customer_id}</td>
            <td><strong>${c.full_name}</strong></td>
            <td>${c.email}</td>
            <td>${c.phone}</td>
            <td>${c.gender}</td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="openEditCustomerModal(${c.customer_id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteCustomer(${c.customer_id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

// 2. Services Table CRUD
function renderServicesTable() {
    const tbody = document.getElementById('admin-services-body');
    if (!tbody) return;
    tbody.innerHTML = adminData.services.map(s => `
        <tr>
            <td>${s.service_id}</td>
            <td><strong>${s.service_name}</strong></td>
            <td><span class="badge badge-success" style="background-color:rgba(139,92,246,0.1); color:var(--primary);">${s.category}</span></td>
            <td>⏱️ ${s.duration} min</td>
            <td>₹${s.price}</td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="openEditServiceModal(${s.service_id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteService(${s.service_id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

// 3. Stylists Table CRUD
function renderStylistsTable() {
    const tbody = document.getElementById('admin-stylists-body');
    if (!tbody) return;
    tbody.innerHTML = adminData.stylists.map(st => `
        <tr>
            <td>${st.stylist_id}</td>
            <td><strong>${st.stylist_name}</strong></td>
            <td>${st.specialization}</td>
            <td>${st.experience} Years</td>
            <td><span class="badge ${st.availability === 'Available' ? 'badge-success' : st.availability === 'Busy' ? 'badge-warning' : 'badge-danger'}">${st.availability}</span></td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="openEditStylistModal(${st.stylist_id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteStylist(${st.stylist_id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

// 4. Appointments Table CRUD
function renderAppointmentsTable() {
    const tbody = document.getElementById('admin-appointments-body');
    if (!tbody) return;
    tbody.innerHTML = adminData.appointments.map(a => `
        <tr>
            <td>#APT-${a.appointment_id}</td>
            <td><strong>${a.customer_name}</strong></td>
            <td>${a.service_name}</td>
            <td>${a.stylist_name}</td>
            <td>${a.appointment_date} at ${a.appointment_time}</td>
            <td>₹${a.total_amount}</td>
            <td><span class="badge ${a.appointment_status === 'Booked' ? 'badge-warning' : a.appointment_status === 'Completed' ? 'badge-success' : 'badge-danger'}">${a.appointment_status}</span></td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="openEditAppointmentModal(${a.appointment_id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteAppointment(${a.appointment_id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

// 5. Payments Table CRUD
function renderPaymentsTable() {
    const tbody = document.getElementById('admin-payments-body');
    if (!tbody) return;
    tbody.innerHTML = adminData.payments.map(p => `
        <tr>
            <td>#PAY-${p.payment_id}</td>
            <td><strong>${p.customer_name}</strong></td>
            <td>#APT-${p.appointment_id}</td>
            <td>₹${p.amount}</td>
            <td>${p.payment_method}</td>
            <td><span class="badge badge-success">${p.payment_status}</span></td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="openEditPaymentModal(${p.payment_id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deletePayment(${p.payment_id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

/* ==================================================
   CRUD MODAL CONTROLLERS & SUBMISSIONS
   ================================================== */

function showModal(id) {
    document.getElementById(id).style.display = 'flex';
}

window.closeModal = function(id) {
    document.getElementById(id).style.display = 'none';
};

// --- CUSTOMER CRUD ---
window.openAddCustomerModal = function() {
    document.getElementById('cust-modal-title').textContent = 'Add Customer';
    document.getElementById('cust-form-id').value = '';
    document.getElementById('cust-form-name').value = '';
    document.getElementById('cust-form-email').value = '';
    document.getElementById('cust-form-phone').value = '';
    document.getElementById('cust-form-gender').value = 'Male';
    document.getElementById('cust-form-pwd').value = '';
    showModal('modal-customer');
};

window.openEditCustomerModal = function(id) {
    const c = adminData.customers.find(x => x.customer_id === id);
    if (!c) return;
    document.getElementById('cust-modal-title').textContent = 'Edit Customer';
    document.getElementById('cust-form-id').value = c.customer_id;
    document.getElementById('cust-form-name').value = c.full_name;
    document.getElementById('cust-form-email').value = c.email;
    document.getElementById('cust-form-phone').value = c.phone;
    document.getElementById('cust-form-gender').value = c.gender;
    document.getElementById('cust-form-pwd').value = c.password;
    showModal('modal-customer');
};

window.saveCustomer = async function() {
    const id = document.getElementById('cust-form-id').value;
    const full_name = document.getElementById('cust-form-name').value.trim();
    const email = document.getElementById('cust-form-email').value.trim();
    const phone = document.getElementById('cust-form-phone').value.trim();
    const gender = document.getElementById('cust-form-gender').value;
    const password = document.getElementById('cust-form-pwd').value;

    const payload = { full_name, email, phone, gender, password };

    try {
        if (id) {
            await apiFetch(`/customers/update/${id}/`, 'PUT', payload);
            showToast('Customer updated', 'success');
        } else {
            await apiFetch('/customers/add/', 'POST', payload);
            showToast('Customer added', 'success');
        }
        closeModal('modal-customer');
        refreshAdminData();
    } catch (e) {}
};

window.deleteCustomer = async function(id) {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
        await apiFetch(`/customers/delete/${id}/`, 'DELETE');
        showToast('Customer deleted', 'success');
        refreshAdminData();
    } catch (e) {}
};

// --- SERVICE CRUD ---
window.openAddServiceModal = function() {
    document.getElementById('svc-modal-title').textContent = 'Add Service';
    document.getElementById('svc-form-id').value = '';
    document.getElementById('svc-form-name').value = '';
    document.getElementById('svc-form-category').value = 'Spa';
    document.getElementById('svc-form-duration').value = '';
    document.getElementById('svc-form-price').value = '';
    document.getElementById('svc-form-desc').value = '';
    document.getElementById('svc-form-img').value = '';
    showModal('modal-service');
};

window.openEditServiceModal = function(id) {
    const s = adminData.services.find(x => x.service_id === id);
    if (!s) return;
    document.getElementById('svc-modal-title').textContent = 'Edit Service';
    document.getElementById('svc-form-id').value = s.service_id;
    document.getElementById('svc-form-name').value = s.service_name;
    document.getElementById('svc-form-category').value = s.category;
    document.getElementById('svc-form-duration').value = s.duration;
    document.getElementById('svc-form-price').value = s.price;
    document.getElementById('svc-form-desc').value = s.description;
    document.getElementById('svc-form-img').value = s.image_url || '';
    showModal('modal-service');
};

window.saveService = async function() {
    const id = document.getElementById('svc-form-id').value;
    const service_name = document.getElementById('svc-form-name').value.trim();
    const category = document.getElementById('svc-form-category').value;
    const duration = parseInt(document.getElementById('svc-form-duration').value);
    const price = parseFloat(document.getElementById('svc-form-price').value);
    const description = document.getElementById('svc-form-desc').value.trim();
    const image_url = document.getElementById('svc-form-img').value.trim();

    const payload = { service_name, category, duration, price, description, image_url };

    try {
        if (id) {
            await apiFetch(`/services/update/${id}/`, 'PUT', payload);
            showToast('Service updated', 'success');
        } else {
            await apiFetch('/services/add/', 'POST', payload);
            showToast('Service added', 'success');
        }
        closeModal('modal-service');
        refreshAdminData();
    } catch (e) {}
};

window.deleteService = async function(id) {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
        await apiFetch(`/services/delete/${id}/`, 'DELETE');
        showToast('Service deleted', 'success');
        refreshAdminData();
    } catch (e) {}
};

// --- STYLIST CRUD ---
window.openAddStylistModal = function() {
    document.getElementById('sty-modal-title').textContent = 'Add Stylist';
    document.getElementById('sty-form-id').value = '';
    document.getElementById('sty-form-name').value = '';
    document.getElementById('sty-form-spec').value = '';
    document.getElementById('sty-form-exp').value = '';
    document.getElementById('sty-form-phone').value = '';
    document.getElementById('sty-form-avail').value = 'Available';
    document.getElementById('sty-form-avatar').value = '';
    showModal('modal-stylist');
};

window.openEditStylistModal = function(id) {
    const st = adminData.stylists.find(x => x.stylist_id === id);
    if (!st) return;
    document.getElementById('sty-modal-title').textContent = 'Edit Stylist';
    document.getElementById('sty-form-id').value = st.stylist_id;
    document.getElementById('sty-form-name').value = st.stylist_name;
    document.getElementById('sty-form-spec').value = st.specialization;
    document.getElementById('sty-form-exp').value = st.experience;
    document.getElementById('sty-form-phone').value = st.phone;
    document.getElementById('sty-form-avail').value = st.availability;
    document.getElementById('sty-form-avatar').value = st.avatar_url || '';
    showModal('modal-stylist');
};

window.saveStylist = async function() {
    const id = document.getElementById('sty-form-id').value;
    const stylist_name = document.getElementById('sty-form-name').value.trim();
    const specialization = document.getElementById('sty-form-spec').value.trim();
    const experience = parseInt(document.getElementById('sty-form-exp').value);
    const phone = document.getElementById('sty-form-phone').value.trim();
    const availability = document.getElementById('sty-form-avail').value;
    const avatar_url = document.getElementById('sty-form-avatar').value.trim();

    const payload = { stylist_name, specialization, experience, phone, availability, avatar_url };

    try {
        if (id) {
            await apiFetch(`/stylists/update/${id}/`, 'PUT', payload);
            showToast('Stylist updated', 'success');
        } else {
            await apiFetch('/stylists/add/', 'POST', payload);
            showToast('Stylist added', 'success');
        }
        closeModal('modal-stylist');
        refreshAdminData();
    } catch (e) {}
};

window.deleteStylist = async function(id) {
    if (!confirm('Are you sure you want to delete this stylist?')) return;
    try {
        await apiFetch(`/stylists/delete/${id}/`, 'DELETE');
        showToast('Stylist deleted', 'success');
        refreshAdminData();
    } catch (e) {}
};

// --- APPOINTMENT CRUD ---
window.openAddAppointmentModal = function() {
    document.getElementById('apt-modal-title').textContent = 'Add Appointment';
    document.getElementById('apt-form-id').value = '';
    document.getElementById('apt-form-cust').value = '';
    document.getElementById('apt-form-svc').value = '';
    document.getElementById('apt-form-sty').value = '';
    document.getElementById('apt-form-date').value = '';
    document.getElementById('apt-form-time').value = '';
    document.getElementById('apt-form-amount').value = '';
    document.getElementById('apt-form-status').value = 'Booked';
    showModal('modal-appointment');
};

window.openEditAppointmentModal = function(id) {
    const a = adminData.appointments.find(x => x.appointment_id === id);
    if (!a) return;
    document.getElementById('apt-modal-title').textContent = 'Edit Appointment';
    document.getElementById('apt-form-id').value = a.appointment_id;
    document.getElementById('apt-form-cust').value = a.customer_name;
    document.getElementById('apt-form-svc').value = a.service_name;
    document.getElementById('apt-form-sty').value = a.stylist_name;
    document.getElementById('apt-form-date').value = a.appointment_date;
    document.getElementById('apt-form-time').value = a.appointment_time;
    document.getElementById('apt-form-amount').value = a.total_amount;
    document.getElementById('apt-form-status').value = a.appointment_status;
    showModal('modal-appointment');
};

window.saveAppointment = async function() {
    const id = document.getElementById('apt-form-id').value;
    const customer_name = document.getElementById('apt-form-cust').value.trim();
    const service_name = document.getElementById('apt-form-svc').value.trim();
    const stylist_name = document.getElementById('apt-form-sty').value.trim();
    const appointment_date = document.getElementById('apt-form-date').value;
    const appointment_time = document.getElementById('apt-form-time').value;
    const total_amount = parseFloat(document.getElementById('apt-form-amount').value);
    const appointment_status = document.getElementById('apt-form-status').value;

    const payload = { customer_name, service_name, stylist_name, appointment_date, appointment_time, total_amount, appointment_status };

    try {
        if (id) {
            await apiFetch(`/appointments/update/${id}/`, 'PUT', payload);
            showToast('Appointment updated', 'success');
        } else {
            await apiFetch('/appointments/add/', 'POST', payload);
            showToast('Appointment added', 'success');
        }
        closeModal('modal-appointment');
        refreshAdminData();
    } catch (e) {}
};

window.deleteAppointment = async function(id) {
    if (!confirm('Are you sure you want to delete this appointment?')) return;
    try {
        await apiFetch(`/appointments/delete/${id}/`, 'DELETE');
        showToast('Appointment deleted', 'success');
        refreshAdminData();
    } catch (e) {}
};

// --- PAYMENT CRUD ---
window.openEditPaymentModal = function(id) {
    const p = adminData.payments.find(x => x.payment_id === id);
    if (!p) return;
    document.getElementById('pay-form-id').value = p.payment_id;
    document.getElementById('pay-form-cust').value = p.customer_name;
    document.getElementById('pay-form-apt').value = p.appointment_id;
    document.getElementById('pay-form-amount').value = p.amount;
    document.getElementById('pay-form-method').value = p.payment_method;
    document.getElementById('pay-form-status').value = p.payment_status;
    document.getElementById('pay-form-date').value = p.payment_date;
    showModal('modal-payment');
};

window.savePayment = async function() {
    const id = document.getElementById('pay-form-id').value;
    const customer_name = document.getElementById('pay-form-cust').value.trim();
    const appointment_id = parseInt(document.getElementById('pay-form-apt').value);
    const amount = parseFloat(document.getElementById('pay-form-amount').value);
    const payment_method = document.getElementById('pay-form-method').value;
    const payment_status = document.getElementById('pay-form-status').value;
    const payment_date = document.getElementById('pay-form-date').value;

    const payload = { customer_name, appointment_id, amount, payment_method, payment_status, payment_date };

    try {
        if (id) {
            await apiFetch(`/payments/update/${id}/`, 'PUT', payload);
            showToast('Payment transaction updated', 'success');
        } else {
            await apiFetch('/payments/add/', 'POST', payload);
            showToast('Payment logged', 'success');
        }
        closeModal('modal-payment');
        refreshAdminData();
    } catch (e) {}
};

window.deletePayment = async function(id) {
    if (!confirm('Are you sure you want to delete this payment record?')) return;
    try {
        await apiFetch(`/payments/delete/${id}/`, 'DELETE');
        showToast('Payment record deleted', 'success');
        refreshAdminData();
    } catch (e) {}
};
