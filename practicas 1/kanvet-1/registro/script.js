
            const stored = localStorage.getItem('kanvet_cart');

            document.addEventListener('DOMContentLoaded', function() {

                let cart = [];
                const checkoutItems = document.getElementById('checkout-items');
                const checkoutTotal = document.getElementById('checkout-total');
                const whatsappBtn = document.getElementById('send-voucher-btn');
                const btnTotal = document.getElementById('btn-whatsapp-total');

                function loadCart() {
                    const stored = localStorage.getItem('kanvet_cart');
                    if (stored) {
                        try {
                            cart = JSON.parse(stored);
                        } 
                        catch {
                            cart = [];
                        }
                    } 

                    else {
                        cart = [];
                    }
                    
                    if (cart.length === 0) {
                        checkoutItems.innerHTML = `
                            <div style="text-align: center; padding: 40px 0; color: var(--text-light);">
                                <i class="fas fa-shopping-cart" style="font-size: 48px; opacity: 0.3; display: block; margin-bottom: 16px;"></i>
                                <p>Tu carrito está vacío</p>
                                <a href="../index/index.html" style="color: var(--primary); font-weight: 600; display: inline-block; margin-top: 10px;">
                                    ← Volver a la tienda
                                </a>
                            </div>
                        `;
                        checkoutTotal.textContent = 'S/. 0.00';
                        if (btnTotal) btnTotal.textContent = 'S/. 0.00';
                        if (whatsappBtn) whatsappBtn.disabled = true;
                        return;
                    }
                    
                    renderCart();
                }

                function renderCart() {
                    let html = '';
                    let total = 0;

                    cart.forEach((item, index) => {
                        const subtotal = item.price * item.quantity;
                        total += subtotal;

                        html += `
                            <div class="checkout-item" style="animation-delay: ${index * 0.05}s;">
                                <span class="item-name">
                                    <span class="item-icon">🛒</span>
                                    ${item.name}
                                </span>
                                <span class="item-qty">×${item.quantity}</span>
                                <span class="item-price">S/. ${subtotal.toFixed(2)}</span>
                            </div>
                        `;
                    });

                    checkoutItems.innerHTML = html;

                    const totalFormatted = 'S/. ' + total.toFixed(2);
                    checkoutTotal.textContent = totalFormatted;
                    if (btnTotal) btnTotal.textContent = totalFormatted;
                }

                function sendToWhatsApp() {
                    if (cart.length === 0) {
                        showNotification('❌ No hay productos en el carrito');
                        return;
                    }

                    const methodSelected = document.querySelector('input[name="payment-method"]:checked');
                    const method = methodSelected ? methodSelected.value : 'transferencia';
                    const methodLabel = method === 'transferencia' ? 'Transferencia Bancaria' : 'Yape';

                    let total = 0;
                    cart.forEach(item => {
                        total += item.price * item.quantity;
                    });

                    let message = '🐾 *NUEVO PEDIDO - KANVET* 🐾\n\n';
                    
                    message += '🛒 *PRODUCTOS SOLICITADOS*\n';
                    cart.forEach((item, index) => {
                        const subtotal = item.price * item.quantity;
                        message += `${index + 1}. ${item.name} ×${item.quantity} → S/. ${subtotal.toFixed(2)}\n`;
                    });
                    
                    message += '\n💰 *TOTAL: S/. ' + total.toFixed(2) + '*\n\n';
                    message += `💳 *MÉTODO DE PAGO:* ${methodLabel}\n\n`;
                    message += '📍 *ENTREGA*\n';
                    message += 'Por favor, coordinar dirección de entrega por este chat.\n\n';
                    message += '📤 *COMPROBANTE DE PAGO*\n';
                    message += 'Adjuntar captura del pago realizado.\n\n';
                

                    const encodedMessage = encodeURIComponent(message);

                    const phoneNumber = '51958237946'; 

                    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
                    window.open(whatsappUrl, '_blank');
                    
                    showNotification('📤 Abriendo WhatsApp...');
                }

                function showNotification(message) {
                    const existing = document.querySelector('.notification');
                    if (existing) existing.remove();

                    const notif = document.createElement('div');
                    notif.className = 'notification';
                    notif.textContent = message;
                    document.body.appendChild(notif);

                    setTimeout(() => notif.classList.add('show'), 10);

                    setTimeout(() => {
                        notif.classList.remove('show');
                        setTimeout(() => notif.remove(), 400);
                    }, 3000);
                }

                // ===== EVENTOS =====

                const methodCards = document.querySelectorAll('.payment-method');
                const radioButtons = document.querySelectorAll('input[name="payment-method"]');

                radioButtons.forEach(radio => {
                    radio.addEventListener('change', function() {
                        methodCards.forEach(card => card.classList.remove('selected'));
                        
                        if (this.id === 'method-transfer') {
                            document.getElementById('method-transfer-card').classList.add('selected');
                            document.getElementById('transfer-details').style.display = 'block';
                            document.getElementById('yape-details').style.display = 'none';
                        } 
                        else if (this.id === 'method-yape') {
                            document.getElementById('method-yape-card').classList.add('selected');
                            document.getElementById('transfer-details').style.display = 'none';
                            document.getElementById('yape-details').style.display = 'block';
                        }
                    });
                });

                methodCards.forEach(card => {
                    card.addEventListener('click', function(e) {
                        if (e.target.closest('input') || e.target.closest('label')) return;
                        const radio = this.querySelector('input[type="radio"]');
                        if (radio) {
                            radio.checked = true;
                            radio.dispatchEvent(new Event('change'));
                        }
                    });
                });

                if (whatsappBtn) {
                    whatsappBtn.addEventListener('click', sendToWhatsApp);
                }

                loadCart();



                console.log('✅ Checkout simplificado cargado correctamente');
                console.log('📦 Carrito:', cart);

            });
    console.log("Hola mundo");
    console.log("Hola mundo");
    console.log("Hola mundo");