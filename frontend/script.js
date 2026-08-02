// ============================================================
// API CONFIGURATION
// ============================================================
const API_URL = 'http://localhost:5000/api';

// ============================================================
// STATE
// ============================================================
let cart = [];
let currentUser = null;
let currentPage = 'home';

// ============================================================
// DOM ELEMENTS
// ============================================================
const pageContainer = document.getElementById('page-container');
const navLinks = document.querySelectorAll('.nav-links a');
const navCartBadge = document.getElementById('navCartBadge');
const loginIcon = document.getElementById('loginIcon');
const loginModal = document.getElementById('loginModal');
const closeLogin = document.getElementById('closeLogin');
const loginForm = document.getElementById('loginForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginMessage = document.getElementById('loginMessage');
const userStatus = document.getElementById('userStatus');
const toast = document.getElementById('toast');

// ============================================================
// API FUNCTIONS
// ============================================================

// ---------- Get all products ----------
async function fetchProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const data = await response.json();
        if (data.success) return data.data;
        return [];
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

// ---------- Get featured products ----------
async function fetchFeaturedProducts() {
    try {
        const response = await fetch(`${API_URL}/products/featured`);
        const data = await response.json();
        if (data.success) return data.data;
        return [];
    } catch (error) {
        console.error('Error fetching featured products:', error);
        return [];
    }
}

// ---------- Login ----------
async function loginUser(email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (data.success) {
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            currentUser = data.data.user;
            userStatus.textContent = currentUser.name;
            return data;
        }
        return data;
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: 'Login failed' };
    }
}

// ---------- Add to cart ----------
async function addToCartApi(productId, quantity = 1) {
    const token = localStorage.getItem('token');
    if (!token) {
        showToast('Please login first!', true);
        openLogin();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/cart/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productId, quantity })
        });
        const data = await response.json();
        if (data.success) {
            showToast('Added to cart!');
            updateCartBadges();
            return data;
        }
        return data;
    } catch (error) {
        console.error('Add to cart error:', error);
        showToast('Failed to add to cart', true);
    }
}

// ---------- Get cart ----------
async function getCartApi() {
    const token = localStorage.getItem('token');
    if (!token) return { items: [], subtotal: 0 };

    try {
        const response = await fetch(`${API_URL}/cart`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) return data.data;
        return { items: [], subtotal: 0 };
    } catch (error) {
        console.error('Get cart error:', error);
        return { items: [], subtotal: 0 };
    }
}

// ---------- Remove from cart ----------
async function removeFromCartApi(cartId) {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(`${API_URL}/cart/items/${cartId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
            showToast('Removed from cart');
            updateCartBadges();
            if (currentPage === 'cart') renderCartPage();
            return data;
        }
    } catch (error) {
        console.error('Remove from cart error:', error);
        showToast('Failed to remove', true);
    }
}

// ---------- Update cart quantity ----------
async function updateCartQuantityApi(cartId, quantity) {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(`${API_URL}/cart/items/${cartId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ quantity })
        });
        const data = await response.json();
        if (data.success) {
            updateCartBadges();
            if (currentPage === 'cart') renderCartPage();
            return data;
        }
    } catch (error) {
        console.error('Update cart error:', error);
        showToast('Failed to update', true);
    }
}

// ---------- Clear cart ----------
async function clearCartApi() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(`${API_URL}/cart/clear`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
            showToast('Cart cleared');
            updateCartBadges();
            if (currentPage === 'cart') renderCartPage();
            return data;
        }
    } catch (error) {
        console.error('Clear cart error:', error);
        showToast('Failed to clear cart', true);
    }
}

// ---------- Create order ----------
async function createOrder(shippingAddress, paymentMethod) {
    const token = localStorage.getItem('token');
    if (!token) {
        showToast('Please login first!', true);
        return;
    }

    try {
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ shippingAddress, paymentMethod })
        });
        const data = await response.json();
        if (data.success) {
            showToast(`✅ Order placed!`);
            updateCartBadges();
            if (currentPage === 'cart') renderCartPage();
            return data;
        }
        return data;
    } catch (error) {
        console.error('Create order error:', error);
        showToast('Failed to create order', true);
    }
}

// ============================================================
// RENDER PAGE
// ============================================================
function renderPage(page) {
    const pages = {
        home: `
            <section class="page active-page">
                <div class="hero-box">
                    <h2><i class="fas fa-bolt"></i> Gear up. Dominate.</h2>
                    <p>ProTricks – premium sports equipment for champions. From basketball to running, we deliver pro-level gear.</p>
                    <div class="hero-badges">
                        <span><i class="fas fa-trophy"></i> 100+ pro items</span>
                        <span><i class="fas fa-shield-alt"></i> secure checkout</span>
                    </div>
                </div>
                <div class="category-title"><i class="fas fa-star"></i> Featured · top picks</div>
                <div class="product-grid" id="featuredGrid"></div>
            </section>
        `,
        products: `
            <section class="page active-page">
                <div class="category-title"><i class="fas fa-tshirt"></i> All sports gear</div>
                <div class="product-grid" id="productGrid"></div>
            </section>
        `,
        cart: `
            <section class="page active-page cart-page">
                <div class="category-title"><i class="fas fa-shopping-cart"></i> Your Shopping Cart</div>
                <div id="cartPageItems"></div>
            </section>
        `,
        about: `
            <section class="page active-page">
                <div class="hero-box">
                    <h2><i class="fas fa-users"></i> About ProTricks</h2>
                    <p>We are a team of sports enthusiasts dedicated to bringing you the highest quality gear. Founded in 2020, we combine innovation with performance.</p>
                </div>
                <div class="about-grid">
                    <div class="about-card"><i class="fas fa-medal"></i><h3>Mission</h3><p>Empower athletes with pro-grade equipment that enhances performance.</p></div>
                    <div class="about-card"><i class="fas fa-eye"></i><h3>Vision</h3><p>Become the most trusted sports brand worldwide, known for quality and security.</p></div>
                    <div class="about-card"><i class="fas fa-shield-alt"></i><h3>Security</h3><p>We encrypt every transaction and protect your data with advanced 2FA.</p></div>
                </div>
            </section>
        `,
        contact: `
            <section class="page active-page">
                <div class="hero-box">
                    <h2><i class="fas fa-paper-plane"></i> Contact us</h2>
                    <p>We’d love to hear from you. Reach out for support, partnerships, or just to say hi!</p>
                </div>
                <div class="contact-grid">
                    <div><i class="fas fa-envelope"></i><h4>Email</h4><p>support@protricks.com</p></div>
                    <div><i class="fas fa-phone-alt"></i><h4>Phone</h4><p>+1 (800) 555‑SPORT</p></div>
                    <div><i class="fas fa-map-marker-alt"></i><h4>HQ</h4><p>123 Champion Ave, Sports City</p></div>
                </div>
            </section>
        `
    };

    // Insert the page HTML
    pageContainer.innerHTML = pages[page] || pages.home;

    // Render products if on home or products page
    if (page === 'home' || page === 'products') {
        renderProducts(page);
    }

    // Render cart if on cart page
    if (page === 'cart') {
        renderCartPage();
    }

    // Update active nav link
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === page) link.classList.add('active');
    });

    currentPage = page;
    updateCartBadges();
}

// ============================================================
// RENDER PRODUCTS
// ============================================================
async function renderProducts(page) {
    const gridId = page === 'home' ? 'featuredGrid' : 'productGrid';
    const grid = document.getElementById(gridId);
    if (!grid) return;

    // Fetch products from API
    let displayProducts;
    if (page === 'home') {
        displayProducts = await fetchFeaturedProducts();
    } else {
        displayProducts = await fetchProducts();
    }

    // If no products, show message
    if (!displayProducts || displayProducts.length === 0) {
        grid.innerHTML = `
            <div style="text-align:center;padding:3rem;grid-column:1/-1;">
                <i class="fas fa-box-open" style="font-size:3rem;color:#c8b09a;"></i>
                <p style="margin-top:1rem;color:#8a7a6a;">No products found. Please check your backend.</p>
            </div>
        `;
        return;
    }

    // Render products
    grid.innerHTML = displayProducts.map(p => `
        <div class="product-card">
            <i class="fas fa-${p.category || 'dumbbell'}"></i>
            <h3>${p.name}</h3>
            <div class="price">$${p.price.toFixed(2)}</div>
            <span class="badge">${p.is_featured ? '⭐ Featured' : 'New'}</span>
            <button class="add-to-cart" data-id="${p.id}">
                <i class="fas fa-plus"></i> Add to Cart
            </button>
        </div>
    `).join('');

    // Add event listeners to "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = parseInt(this.dataset.id);
            addToCartApi(id);
            // Show feedback
            this.innerHTML = ' ✓ In Cart';
            this.classList.add('in-cart');
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-plus"></i> Add to Cart';
                this.classList.remove('in-cart');
            }, 1500);
        });
    });
}

// ============================================================
// RENDER CART PAGE
// ============================================================
async function renderCartPage() {
    const container = document.getElementById('cartPageItems');
    if (!container) return;

    const cartData = await getCartApi();
    const items = cartData.items || [];

    // If cart is empty
    if (items.length === 0) {
        container.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-cart"></i>
                <h3>Your cart is empty</h3>
                <p>Browse our products and add items you love!</p>
                <button class="btn btn-primary" onclick="renderPage('products')" style="margin-top:1rem;">
                    <i class="fas fa-arrow-left"></i> Start Shopping
                </button>
            </div>
        `;
        return;
    }

    // Calculate total
    const total = items.reduce((sum, item) => sum + item.quantity * item.product_price, 0);

    // Render cart items
    container.innerHTML = `
        <div class="cart-items-list">
            ${items.map(item => `
                <div class="cart-item-row">
                    <div class="item-info">
                        <i class="fas fa-${item.category || 'dumbbell'}"></i>
                        <div class="item-details">
                            <span class="item-name">${item.product_name}</span>
                            <span class="item-price">$${item.product_price.toFixed(2)}</span>
                        </div>
                    </div>
                    <div class="item-actions">
                        <div class="qty-control">
                            <button onclick="updateCartQuantityApi(${item.id}, ${item.quantity - 1})">−</button>
                            <span>${item.quantity}</span>
                            <button onclick="updateCartQuantityApi(${item.id}, ${item.quantity + 1})">+</button>
                        </div>
                        <button class="remove-btn" onclick="removeFromCartApi(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>

        <div class="cart-summary">
            <div class="total-info">
                <span class="total-label">Total Items: <strong>${items.reduce((s, i) => s + i.quantity, 0)}</strong></span>
                <span class="total-amount">$${total.toFixed(2)}</span>
            </div>
            <div class="summary-actions">
                <button class="btn btn-secondary" onclick="clearCartApi()">
                    <i class="fas fa-trash-alt"></i> Clear Cart
                </button>
                <button class="btn btn-primary" onclick="checkout()">
                    <i class="fas fa-check"></i> Checkout
                </button>
            </div>
        </div>
    `;
}

// ============================================================
// CHECKOUT
// ============================================================
async function checkout() {
    const token = localStorage.getItem('token');
    if (!token) {
        showToast('Please login first!', true);
        openLogin();
        return;
    }

    const cartData = await getCartApi();
    if (!cartData.items || cartData.items.length === 0) {
        showToast('Your cart is empty!', true);
        return;
    }

    // Sample shipping address (in real app, you'd get this from user input)
    const shippingAddress = {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'USA'
    };

    const result = await createOrder(shippingAddress, 'cash_on_delivery');
    if (result && result.success) {
        setTimeout(() => renderPage('home'), 1000);
    }
}

// ============================================================
// UPDATE CART BADGE
// ============================================================
async function updateCartBadges() {
    const token = localStorage.getItem('token');
    let total = 0;

    if (token) {
        const cartData = await getCartApi();
        if (cartData.items) {
            total = cartData.items.reduce((sum, item) => sum + item.quantity, 0);
        }
    }

    if (navCartBadge) {
        navCartBadge.textContent = total;
        navCartBadge.style.display = total > 0 ? 'inline' : 'none';
    }
}

// ============================================================
// LOGIN FUNCTIONS
// ============================================================
function openLogin() {
    loginModal.classList.add('show');
    loginMessage.textContent = '';
}

function closeLoginModal() {
    loginModal.classList.remove('show');
    loginMessage.textContent = '';
}

loginIcon.addEventListener('click', openLogin);
closeLogin.addEventListener('click', closeLoginModal);
loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) closeLoginModal();
});

// Login form submit
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();

    const result = await loginUser(email, password);
    if (result.success) {
        loginMessage.textContent = '✅ Login successful!';
        loginMessage.className = 'login-message success';
        showToast('Welcome back!');
        setTimeout(closeLoginModal, 800);
        renderPage(currentPage);
        updateCartBadges();
    } else {
        loginMessage.textContent = '❌ ' + (result.message || 'Invalid credentials');
        loginMessage.className = 'login-message error';
    }
});

// Check if user is already logged in
function checkLoggedIn() {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (userData && token) {
        try {
            currentUser = JSON.parse(userData);
            userStatus.textContent = currentUser.name;
            return true;
        } catch (e) {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
    }
    return false;
}

// ============================================================
// TOAST NOTIFICATION
// ============================================================
let toastTimeout;

function showToast(message, isError = false) {
    toast.textContent = message;
    toast.className = 'toast' + (isError ? ' error' : '');
    toast.classList.add('show');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// ============================================================
// NAVIGATION
// ============================================================
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        renderPage(link.dataset.page);
    });
});

// ============================================================
// INIT
// ============================================================
checkLoggedIn();
renderPage('home');
updateCartBadges();

console.log('🚀 ProTricks Frontend connected to backend API:', API_URL);