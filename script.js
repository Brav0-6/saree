// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const searchInput = document.getElementById('searchInput');
const cartBtn = document.getElementById('cartBtn');
const cartModal = document.getElementById('cartModal');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.querySelector('.cart-count');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutModal = document.getElementById('checkoutModal');
const closeCheckout = document.getElementById('closeCheckout');
const checkoutForm = document.getElementById('checkoutForm');
const priceRange = document.getElementById('priceRange');
const minPrice = document.getElementById('minPrice');
const maxPrice = document.getElementById('maxPrice');
const shopNowBtn = document.querySelector('.shop-now-btn');

// Cart State
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Initialize the page
function init() {
    displayProducts(products);
    updateCartCount();
    setupEventListeners();
    setupPriceRange();
    setupAnimations();
}

// Display Products
function displayProducts(productsToShow) {
    productsGrid.innerHTML = '';
    
    if (productsToShow.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search fa-3x"></i>
                <h3>No sarees found</h3>
                <p>Try adjusting your filters or search terms</p>
            </div>
        `;
        return;
    }
    
    productsToShow.forEach((product, index) => {
        const productCard = createProductCard(product, index);
        productsGrid.appendChild(productCard);
    });
}

// Create Product Card
function createProductCard(product, index) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.animationDelay = `${index * 0.1}s`;
    card.innerHTML = `
        <div class="product-image-container">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-overlay">
                <button class="quick-view-btn" onclick="quickView(${product.id})">
                    <i class="fas fa-eye"></i> Quick View
                </button>
            </div>
        </div>
        <div class="product-info">
            <div class="product-category">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</div>
            <h3 class="product-name">${product.name}</h3>
            <p class="product-price">₹${product.price.toLocaleString()}</p>
            <button class="add-to-cart" onclick="addToCart(${product.id})">
                <i class="fas fa-shopping-cart"></i> Add to Cart
            </button>
        </div>
    `;
    return card;
}

// Quick View Function
function quickView(productId) {
    const product = products.find(p => p.id === productId);
    
    const modal = document.createElement('div');
    modal.className = 'quick-view-modal';
    modal.innerHTML = `
        <div class="quick-view-content">
            <button class="close-quick-view">&times;</button>
            <div class="quick-view-details">
                <div class="quick-view-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="quick-view-info">
                    <h2>${product.name}</h2>
                    <p class="quick-view-category">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</p>
                    <p class="quick-view-price">₹${product.price.toLocaleString()}</p>
                    <p class="quick-view-description">${product.description}</p>
                    <button class="add-to-cart-large" onclick="addToCart(${product.id}); closeQuickView();">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
    
    const closeBtn = modal.querySelector('.close-quick-view');
    closeBtn.addEventListener('click', closeQuickView);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeQuickView();
    });
}

function closeQuickView() {
    const modal = document.querySelector('.quick-view-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
}

// Add to Cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    updateCart();
    showToast('Item added to cart!', 'success');
    
    // Animate cart button
    cartBtn.classList.add('pulse');
    setTimeout(() => cartBtn.classList.remove('pulse'), 500);
}

// Update Cart
function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    displayCartItems();
}

// Update Cart Count
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Animate cart count if it changes
    if (totalItems > 0) {
        cartCount.classList.add('bounce');
        setTimeout(() => cartCount.classList.remove('bounce'), 500);
    }
}

// Display Cart Items
function displayCartItems() {
    cartItems.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart fa-3x"></i>
                <p>Your cart is empty</p>
            </div>
        `;
        return;
    }

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>₹${item.price.toLocaleString()} × ${item.quantity}</p>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
            </div>
            <button class="remove-item" onclick="removeFromCart(${item.id})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        cartItems.appendChild(cartItem);
    });

    cartTotal.textContent = `₹${total.toLocaleString()}`;
}

// Update Quantity
function updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        updateCart();
    }
}

// Remove from Cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
    showToast('Item removed from cart!', 'error');
}

// Filter Products
function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategories = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);
    const minPriceValue = parseFloat(minPrice.value) || 0;
    const maxPriceValue = parseFloat(maxPrice.value) || Infinity;

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm);
        const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
        const matchesPrice = product.price >= minPriceValue && product.price <= maxPriceValue;
        return matchesSearch && matchesCategory && matchesPrice;
    });

    displayProducts(filteredProducts);
}

// Setup Price Range
function setupPriceRange() {
    const maxProductPrice = Math.max(...products.map(p => p.price));
    priceRange.max = maxProductPrice;
    maxPrice.value = maxProductPrice;
    
    priceRange.addEventListener('input', (e) => {
        maxPrice.value = e.target.value;
        filterProducts();
    });
}

// Show Toast Notification
function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Setup Animations
function setupAnimations() {
    // Animate elements on scroll
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.product-card');
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('animate');
            }
        });
    };
    
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Initial check
}

// Setup Event Listeners
function setupEventListeners() {
    // Cart Modal
    cartBtn.addEventListener('click', () => {
        cartModal.classList.add('show');
    });

    closeCart.addEventListener('click', () => {
        cartModal.classList.remove('show');
    });

    // Checkout Modal
    checkoutBtn.addEventListener('click', () => {
        cartModal.classList.remove('show');
        checkoutModal.classList.add('show');
        displayCheckoutSummary();
    });

    closeCheckout.addEventListener('click', () => {
        checkoutModal.classList.remove('show');
    });

    // Shop Now Button
    shopNowBtn.addEventListener('click', () => {
        window.scrollTo({
            top: document.querySelector('.container').offsetTop - 100,
            behavior: 'smooth'
        });
    });

    // Search and Filters
    searchInput.addEventListener('input', filterProducts);
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', filterProducts);
    });

    // Price Range
    minPrice.addEventListener('input', filterProducts);
    maxPrice.addEventListener('input', filterProducts);

    // Checkout Form
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (cart.length === 0) {
            showToast('Your cart is empty!', 'error');
            return;
        }
        
        // Simulate order processing
        const submitBtn = checkoutForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        
        setTimeout(() => {
            showToast('Order placed successfully!', 'success');
            cart = [];
            updateCart();
            checkoutModal.classList.remove('show');
            
            // Reset form
            checkoutForm.reset();
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Place Order';
        }, 1500);
    });
}

// Display Checkout Summary
function displayCheckoutSummary() {
    const checkoutItems = document.getElementById('checkoutItems');
    const checkoutTotal = document.getElementById('checkoutTotal');
    let total = 0;

    checkoutItems.innerHTML = '';
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const itemElement = document.createElement('div');
        itemElement.className = 'checkout-item';
        itemElement.innerHTML = `
            <p>${item.name} × ${item.quantity} - ₹${itemTotal.toLocaleString()}</p>
        `;
        checkoutItems.appendChild(itemElement);
    });

    checkoutTotal.textContent = `₹${total.toLocaleString()}`;
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', init); 