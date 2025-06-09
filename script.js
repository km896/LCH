document.addEventListener('DOMContentLoaded', () => {
    let cart = [];

    try {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
    } catch (error) {
        console.error('Error al parsear localStorage:', error);
        localStorage.removeItem(' cart');
    }

    const cartModal = document.getElementById('cart-modal');
    const cartToggle = document.getElementById('cart-toggle');
    const cartClose = document.querySelector('.cart-close');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartCount = document.getElementById('cart-count');
    const checkoutButton = document.querySelector('.cart-checkout');
    const downloadButton = document.querySelector('.cart-download');
    const navLinks = document.querySelectorAll('nav ul li a:not(#cart-toggle)');
    const sections = document.querySelectorAll('.product-category');

    if (!cartModal || !cartToggle || !cartClose || !cartItems || !cartTotal || !cartCount || !checkoutButton || !downloadButton) {
        console.error('Uno o más elementos del carrito no se encontraron en el DOM.');
        alert('Error al cargar la página. Por favor, recarga la página.');
        return;
    }

    if (sections.length > 0) {
        sections.forEach(section => section.classList.remove('active'));
        sections[0].classList.add('active');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#herramientas') {
                link.classList.add('active');
            }
        });
    } else {
        console.error('No se encontraron secciones con la clase product-category.');
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection && targetSection.classList.contains('product-category')) {
                sections.forEach(section => section.classList.remove('active'));
                navLinks.forEach(nav => nav.classList.remove('active'));
                targetSection.classList.add('active');
                link.classList.add('active');
            } else {
                console.error(`No se encontró la sección con ID ${targetId} o no tiene la clase product-category.`);
            }
        });
    });

    cartToggle.addEventListener('click', (e) => {
        e.preventDefault();
        cartModal.style.display = 'block';
        updateCart();
    });

    cartClose.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });

    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', () => {
            const productCard = button.closest('.product-card');
            if (!productCard) {
                console.error('No se encontró la tarjeta de producto.');
                return;
            }

            const product = {
                id: productCard.dataset.id,
                name: productCard.dataset.name,
                price: parseFloat(productCard.dataset.price),
                quantity: 1
            };

            const existingItem = cart.find(item => item.id === product.id);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push(product);
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            updateCart();
        });
    });

    function updateCart() {
        cartItems.innerHTML = '';
        let total = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');
            cartItem.innerHTML = `
                <span>${item.name}</span>
                <span>$${item.price.toFixed(2)} x </span>
                <input type="number" min="1" value="${item.quantity}" data-id="${item.id}">
                <span>$${itemTotal.toFixed(2)}</span>
                <button data-id="${item.id}">Eliminar</button>
            `;
            cartItems.appendChild(cartItem);
        });

        cartTotal.textContent = total.toFixed(2);
        cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

        cartItems.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', (e) => {
                const id = e.target.dataset.id;
                const quantity = parseInt(e.target.value);
                const item = cart.find(item => item.id === id);
                if (quantity > 0) {
                    item.quantity = quantity;
                } else {
                    cart = cart.filter(item => item.id !== id);
                }
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCart();
            });
        });

        cartItems.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                cart = cart.filter(item => item.id !== id);
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCart();
            });
        });
    }

    checkoutButton.addEventListener('click', () => {
        if (cart.length > 0) {
            alert('Compra finalizada. ¡Gracias por su pedido!');
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCart();
            cartModal.style.display = 'none';
        } else {
            alert('El carrito está vacío.');
        }
    });

    downloadButton.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('El carrito está vacío.');
            return;
        }

        if (!window.jspdf) {
            console.error('La biblioteca jsPDF no está cargada.');
            alert('Error al generar el ticket. Por favor, intenta de nuevo.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const margin = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let y = margin;

        doc.setFillColor(211, 47, 47); // #d32f2f
        doc.rect(0, 0, pageWidth, 30, 'F');
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(20);
        doc.setTextColor(255, 255, 255); // Blanco
        doc.text('Ferretería Chavéz', margin, y + 10);
        doc.setFontSize(14);
        doc.text('Ticket de Compra', margin + 80, y + 10);
        y += 20;

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(51, 51, 51); // #333
        doc.text('Av. Principal 123, Ciudad, País', margin, y);
        doc.text('Teléfono: +123 456 7890', margin, y + 5);
        doc.text('Email: contacto@ferreteriaChavez.com', margin, y + 10);
        doc.text('Fecha: 09/06/2025 00:20 CST', pageWidth - margin - 50, y);
        y += 20;

        doc.setDrawColor(211, 47, 47); // #d32f2f
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 10;

        const tableX = margin;
        const colWidths = [20, 120, 30]; // Cantidad, Producto, Subtotal
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(12);
        doc.setFillColor(255, 235, 59); // #ffeb3b
        doc.rect(tableX, y, colWidths[0], 10, 'F');
        doc.rect(tableX + colWidths[0], y, colWidths[1], 10, 'F');
        doc.rect(tableX + colWidths[0] + colWidths[1], y, colWidths[2], 10, 'F');
        doc.setTextColor(51, 51, 51);
        doc.text('Cant.', tableX + 5, y + 7);
        doc.text('Producto', tableX + colWidths[0] + 5, y + 7);
        doc.text('Subtotal', tableX + colWidths[0] + colWidths[1] + 5, y + 7);
        y += 10;

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(10);
        let rowCount = 0;
        cart.forEach(item => {
            const itemTotal = (item.price * item.quantity).toFixed(2);
            const rowY = y;
            if (rowCount % 2 === 0) {
                doc.setFillColor(243, 243, 243); // #f3f3f3
                doc.rect(tableX, rowY, colWidths[0] + colWidths[1] + colWidths[2], 10, 'F');
            }
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.1);
            doc.rect(tableX, rowY, colWidths[0], 10);
            doc.rect(tableX + colWidths[0], rowY, colWidths[1], 10);
            doc.rect(tableX + colWidths[0] + colWidths[1], rowY, colWidths[2], 10);
            doc.setTextColor(51, 51, 51);
            doc.text(`${item.quantity}`, tableX + 5, rowY + 7);
            let productName = item.name;
            if (productName.length > 50) {
                productName = productName.substring(0, 47) + '...';
            }
            doc.text(productName, tableX + colWidths[0] + 5, rowY + 7);
            doc.text(`$${itemTotal}`, tableX + colWidths[0] + colWidths[1] + 5, rowY + 7);
            y += 10;
            rowCount++;
        });

        y += 5;
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(12);
        doc.setFillColor(255, 235, 59); // #ffeb3b
        doc.rect(tableX, y, colWidths[0] + colWidths[1] + colWidths[2], 10, 'F');
        doc.setTextColor(51, 51, 51);
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
        doc.text('Total:', tableX + colWidths[0] + 5, y + 7);
        doc.text(`$${total}`, tableX + colWidths[0] + colWidths[1] + 5, y + 7);
        y += 20;

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(211, 47, 47); // #d32f2f
        doc.text('¡Gracias por su compra! Esperamos verle de nuevo.', margin, y);
        y += 10;

        doc.setDrawColor(211, 47, 47);
        doc.setLineWidth(0.5);
        doc.line(margin, pageHeight - margin - 20, pageWidth - margin, pageHeight - margin - 20);
        doc.setFontSize(8);
        doc.setTextColor(51, 51, 51);
        doc.text('Ferretería Chavéz - Av. Principal 123, Ciudad, País', margin, pageHeight - margin - 15);
        doc.text('Teléfono: +123 456 7890 - Email: contacto@ferreteriaChavez.com', margin, pageHeight - margin - 10);

        doc.save('ticket.pdf');
    });

    updateCart();
});