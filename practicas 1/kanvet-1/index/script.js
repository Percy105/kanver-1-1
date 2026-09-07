// ============================================
// SCRIPT PRINCIPAL - KanVet TIENDA
// ============================================

// ============================================
// SCRIPT PRINCIPAL - KanVet TIENDA
// ============================================

// ===== VARIABLES GLOBALES =====
let cart = [];
let notificationTimeout = null;

// ===== DOM ELEMENTOS =====
const cartCount = document.getElementById('cart-count');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const cartToggle = document.getElementById('cart-toggle');
const cartDropdown = document.getElementById('cart-dropdown');
const checkoutBtn = document.getElementById('checkout-btn');

// ===== INICIALIZAR =====
document.addEventListener('DOMContentLoaded', function() {
    loadCartFromStorage();
    setupBuyButtons();
    renderCart();
    // document.addEventListener('click', closeCartOnClickOutside);
});

// ===== FUNCIÓN: Configurar botones comprar =====
function setupBuyButtons() {
    const buyButtons = document.querySelectorAll('.item button[type="button"]');
    buyButtons.forEach(button => {
        button.removeEventListener('click', handleBuyClick);
        button.addEventListener('click', handleBuyClick);
    });
}

// ===== MANEJADOR: Click en comprar =====
function handleBuyClick(e) {
    const button = e.currentTarget;
    const item = button.closest('.item');
    
    let productName = item.dataset.productName;
    let productPrice = parseFloat(item.dataset.productPrice);
    let productId = item.dataset.productId || Date.now() + Math.random();
    
    if (!productName) {
        const nameEl = item.querySelector('h3 a, h3');
        if (nameEl) productName = nameEl.textContent.trim();
    }
    
    if (!productPrice || isNaN(productPrice)) {
        const priceEl = item.querySelector('.current');
        if (priceEl) {
            const priceText = priceEl.textContent.replace(/[^0-9.]/g, '');
            productPrice = parseFloat(priceText) || 0;
        }
    }
    
    if (!productName || productPrice === 0) {
        showNotification('⚠️ No se pudo agregar el producto');
        return;
    }
    
    addToCart({
        id: productId,
        name: productName,
        price: productPrice
    });
}

// ===== FUNCIÓN: Agregar al carrito (con límite de 500) =====
function addToCart(product) {
    // Buscar si el producto ya está en el carrito
    const existing = cart.find(item => item.id === product.id);

    // Si ya existe y tiene 500 o más, mostrar advertencia y salir
    if (existing && existing.quantity >= 500) {
        showNotification(`⚠️ Ya tienes 500 unidades de "${product.name}". No puedes agregar más.`);
        return;
    }

    let cantidadActual = 1;

    if (existing) {
        // Si existe y tiene menos de 500, incrementamos en 1
        const newQuantity = existing.quantity + 1;
        if (newQuantity > 500) {
            showNotification(`⚠️ No puedes tener más de 500 unidades de "${product.name}".`);
            return;
        }
        existing.quantity = newQuantity;
        cantidadActual = existing.quantity;
    } else {
        // Nuevo producto, se agrega con cantidad 1
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }

    saveCartToStorage();
    renderCart();

    let mensaje;
    if (cantidadActual === 1) {
        mensaje = `✅ ${product.name} agregado al carrito`;
    } else {
        mensaje = `✅ ${product.name} agregado al carrito (${cantidadActual} unidades)`;
    }
    showNotification(mensaje);
    animateCartCount();
    openCart();
}

// ===== FUNCIÓN: Eliminar del carrito =====
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCartToStorage();
    renderCart();
}

// ===== FUNCIÓN: Cambiar cantidad con botones + / - (con límite 500) =====
function updateQuantity(productId, change) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    const newQuantity = item.quantity + change;

    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }

    if (newQuantity > 500) {
        showNotification(`⚠️ No puedes tener más de 500 unidades de "${item.name}"`);
        return;
    }

    item.quantity = newQuantity;
    saveCartToStorage();
    renderCart();
}

// ===== FUNCIÓN: Cambiar cantidad desde input numérico (con límite 500) =====
function updateQuantityInput(productId, newValue) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    let quantity = parseInt(newValue, 10);

    // Si no es un número válido o es menor o igual a 0, eliminar el producto
    if (isNaN(quantity) || quantity <= 0) {
        removeFromCart(productId);
        return;
    }

    // Si el valor ingresado supera 500, limitarlo a 500 y notificar
    if (quantity > 500) {
        quantity = 500;
        showNotification(`⚠️ El máximo permitido es 500 unidades. Se ajustó a 500.`);
    }

    item.quantity = quantity;
    saveCartToStorage();
    renderCart();
}

// ===== FUNCIÓN: Renderizar carrito (con input limitado a 500) =====
function renderCart() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    if (cart.length === 0) {
        cartItems.innerHTML = `<p class="empty-cart">🛒 Tu carrito está vacío</p>`;
        cartTotal.textContent = 'S/. 0.00';
        return;
    }

    let html = '';
    let total = 0;

    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;

        html += `
            <div class="cart-item">
                <span class="cart-item-name">${item.name}</span>
                <div class="cart-item-controls">
                    <button class="qty-btn" onclick="updateQuantity('${item.id}', -1)">−</button>
                    <input type="number" 
                                style="width:30px; 
                                background:transparent; 
                                color:#C9B542; border:none; 
                                -webkit-appearance:none; 
                                -moz-appearance:textfield; 
                                text-align: center;" 
                                class="qty-input" 
                           value="${item.quantity}" 
                           min="1" 
                           max="500" 
                           onchange="updateQuantityInput('${item.id}', this.value)" 
                           onfocus="this.select()">
                    <button class="qty-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                </div>
                <span class="cart-item-price">S/. ${subtotal.toFixed(2)}</span>
                <button class="remove-item" onclick="removeFromCart('${item.id}')">✕</button>
            </div>
        `;
    });

    cartItems.innerHTML = html;
    cartTotal.textContent = `S/. ${total.toFixed(2)}`;
}

// ===== FUNCIÓN: Abrir carrito =====
function openCart() {
    cartDropdown.classList.remove('cart-hidden');
    cartDropdown.style.pointerEvents = 'auto';
    cartDropdown.style.visibility = 'visible';
    cartDropdown.style.opacity = '1';
    cartDropdown.style.transform = 'scale(1) translateY(0)';
}

// ===== FUNCIÓN: Cerrar carrito =====
function closeCart() {
    cartDropdown.classList.add('cart-hidden');
    cartDropdown.style.pointerEvents = 'none';
    cartDropdown.style.visibility = 'hidden';
    cartDropdown.style.opacity = '0';
    cartDropdown.style.transform = 'scale(0.85) translateY(20px)';
}

// ===== FUNCIÓN: Toggle carrito =====
function toggleCart() {
    if (cartDropdown.classList.contains('cart-hidden')) {
        openCart();
    } else {
        closeCart();
    }
}

// ===== FUNCIÓN: Cerrar al hacer clic fuera =====
function closeCartOnClickOutside(e) {
    const container = document.getElementById('cart-container');
    if (container && !container.contains(e.target)) {
        closeCart();
    }
}

// ===== FUNCIÓN: Guardar en localStorage =====
function saveCartToStorage() {
    localStorage.setItem('kanvet_cart', JSON.stringify(cart));
}

// ===== FUNCIÓN: Cargar desde localStorage =====
function loadCartFromStorage() {
    const stored = localStorage.getItem('kanvet_cart');
    if (stored) {
        try {
            cart = JSON.parse(stored);
        } catch {
            cart = [];
        }
    } else {
        cart = [];
    }
}

// ===== FUNCIÓN: Notificación =====
function showNotification(message) {
    const oldNotif = document.querySelector('.notification');
    if (oldNotif) oldNotif.remove();
    
    const notif = document.createElement('div');
    notif.className = 'notification';
    
    if (message.includes('unidades')) {
        const match = message.match(/\((\d+)\s*unidades\)/);
        if (match) {
            const cantidad = match[1];
            const texto = message.replace(/\(\d+\s*unidades\)/, '').trim();
            notif.innerHTML = `
                ${texto}
                <span style="
                    background: #C9B542; 
                    color: #03132D; 
                    padding: 2px 14px; 
                    border-radius: 20px; 
                    font-weight: bold;
                    margin-left: 8px;
                    font-size: 14px;
                ">✕${cantidad}</span>
            `;
        } else {
            notif.textContent = message;
        }
    } else {
        notif.textContent = message;
    }
    
    document.body.appendChild(notif);
    setTimeout(() => notif.classList.add('show'), 10);
    clearTimeout(notificationTimeout);
    notificationTimeout = setTimeout(() => {
        notif.classList.remove('show');
        setTimeout(() => notif.remove(), 400);
    }, 3000);
}

// ===== FUNCIÓN: Animación del contador =====
function animateCartCount() {
    const count = document.getElementById('cart-count');
    if (count) {
        count.style.transform = 'scale(1.5)';
        count.style.color = '#C9B542';
        setTimeout(() => {
            count.style.transform = 'scale(1)';
            count.style.color = 'white';
        }, 300);
    }
}

// ===== EVENTO: Toggle carrito =====
cartToggle.addEventListener('click', toggleCart);

// ===== INICIALIZAR SWIPER =====
if (typeof Swiper !== 'undefined') {
    const swiper = new Swiper('.myslider', {
        slidesPerView: 1,
        loop: true,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
        effect: 'fade',
        fadeEffect: {
            crossFade: true
        },
        // ===== NUEVO: PAGINACIÓN Y NAVEGACIÓN =====
        pagination: {
            el: '.swiper-pagination',   // selector del contenedor de puntos
            clickable: true,            // permite saltar a una diapo al hacer clic en un punto
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        }
    });
}

console.log('🛒 KanVet Tienda cargada correctamente');
console.log('📦 Carrito:', cart);

function guardarCarrito(){
    localStorage.setItem('kanvet_cart', JSON.stringify(cart));
    console.log("¡Carrito guardado con éxito en la memoria!");
}
guardarCarrito();

// ============================================
// MODAL DE PRODUCTO
// ============================================

const modalOverlay = document.getElementById('product-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalImg = document.getElementById('modal-img');
const modalTitle = document.getElementById('modal-title');
const modalDescription = document.getElementById('modal-description');
const modalPrice = document.getElementById('modal-price');
const modalBuyBtn = document.getElementById('modal-buy-btn');

let currentModalProduct = null;

// Abrir modal
function openProductModal(productItem) {
    // Imagen
    const imgElement = productItem.querySelector('.thumbnail img, .image img');
    modalImg.src = imgElement ? imgElement.getAttribute('src') : '';
    modalImg.alt = imgElement ? imgElement.alt : 'Producto';

    // Título
    let title = productItem.dataset.productName;
    if (!title) {
        const titleEl = productItem.querySelector('h3 a, h3');
        if (titleEl) title = titleEl.textContent.trim();
    }
    modalTitle.textContent = title || 'Producto';

    // Descripción
    let desc = '';
    const descEl = productItem.querySelector('.mini-text p');
    if (descEl) {
        desc = descEl.textContent.trim();
    } else {
        const h3El = productItem.querySelector('h3');
        if (h3El) desc = h3El.textContent.trim();
    }
    modalDescription.textContent = desc || 'Sin descripción disponible.';

    // Precio
    let price = parseFloat(productItem.dataset.productPrice);
    if (isNaN(price)) {
        const priceEl = productItem.querySelector('.current');
        if (priceEl) {
            const priceText = priceEl.textContent.replace(/[^0-9.]/g, '');
            price = parseFloat(priceText) || 0;
        }
    }
    modalPrice.textContent = `S/. ${price.toFixed(2)}`;

    // Guardar producto para el botón del modal
    currentModalProduct = {
        id: productItem.dataset.productId || Date.now() + Math.random(),
        name: title,
        price: price,
        itemElement: productItem
    };

    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Cerrar modal
function closeProductModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Evento: clic en producto (excepto en botón comprar)
document.addEventListener('click', function(e) {
    const item = e.target.closest('.item');
    if (!item) return;

    // Si el clic fue en el botón "comprar", no abrir modal
    if (e.target.closest('button[type="button"]')) {
        return;
    }

    e.preventDefault();
    openProductModal(item);
});

// Cerrar con botón
modalCloseBtn.addEventListener('click', closeProductModal);
// Cerrar al hacer clic fuera del contenido
modalOverlay.addEventListener('click', function(e) {
    if (e.target === modalOverlay) {
        closeProductModal();
    }
});

// Cerrar con tecla ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
        closeProductModal();
    }
});

// Botón "Añadir al carrito" dentro del modal
modalBuyBtn.addEventListener('click', function() {
    if (currentModalProduct) {
        addToCart({
            id: currentModalProduct.id,
            name: currentModalProduct.name,
            price: currentModalProduct.price
        });
        // Opcional: cerrar modal después de agregar
        // closeProductModal();
    }
});
















