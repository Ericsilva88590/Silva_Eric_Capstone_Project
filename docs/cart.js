(function(){
    const CART_KEY = 'wp_cart_v1';
    const PENDING_KEY = 'wp_pending_checkouts';
    const cartEl = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    const checkoutModeSelect = document.getElementById('checkout-mode');
    const cartCheckoutBtn = document.getElementById('cart-checkout');
    const resumeBtn = document.getElementById('resume-checkout');

    let cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');

    function formatCurrency(v){ return '$' + Number(v).toFixed(2); }
    function findCartItem(id){ return cart.find(x => x.id === id); }

    function updateResumeButton(){
        const pending = JSON.parse(sessionStorage.getItem(PENDING_KEY) || '[]');
        resumeBtn.style.display = (pending && pending.length > 0) ? 'inline-block' : 'none';
    }

    function renderCart(){
        cartEl.innerHTML = '';
        if (!cart || cart.length === 0){
            cartEl.innerHTML = '<div>Your cart is empty</div>';
            totalEl.textContent = formatCurrency(0);
            updateResumeButton();
            return;
        }

        cart.forEach(item => {
            const row = document.createElement('div');
            row.style.marginBottom = '8px';
            const prodImg = document.querySelector('.product[data-id="' + item.id + '"] img');
            const thumb = prodImg ? prodImg.src : '';
            row.innerHTML =
                '<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">'
                + '<div style="display:flex;gap:8px;align-items:center;">'
                + (thumb ? ('<img src="' + thumb + '" alt="" style="width:56px;height:56px;object-fit:cover;border-radius:4px;">') : '')
                + '<div><strong>' + escapeHtml(item.name) + '</strong>'
                + '<div style="font-size:0.9em;color:#666">' + formatCurrency(item.price) + ' each</div></div></div>'
                + '<div style="display:flex;align-items:center;gap:8px;">'
                + '<input type="number" min="0" value="' + item.quantity + '" data-id="' + item.id + '" class="cart-qty" style="width:60px;padding:4px;" />'
                + '<button data-id="' + item.id + '" class="cart-remove">Remove</button>'
                + '</div></div>';
            cartEl.appendChild(row);
        });

        // wire up remove & qty handlers
        cartEl.querySelectorAll('.cart-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const idx = cart.findIndex(x => x.id === id);
                if (idx !== -1) cart.splice(idx, 1);
                persistAndRender();
            });
        });

        cartEl.querySelectorAll('.cart-qty').forEach(inp => {
            inp.addEventListener('change', () => {
                const id = inp.dataset.id;
                const val = Math.max(0, Number(inp.value || 0));
                const item = findCartItem(id);
                if (item) {
                    item.quantity = val;
                    if (item.quantity === 0){
                        const idx = cart.findIndex(x => x.id === id);
                        if (idx !== -1) cart.splice(idx, 1);
                    }
                }
                persistAndRender();
            });
        });

        const total = cart.reduce((s, it) => s + (Number(it.price) * it.quantity), 0);
        totalEl.textContent = formatCurrency(total);
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        updateResumeButton();
    }

    function persistAndRender(){
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        renderCart();
    }

    // simple HTML escape for names
    function escapeHtml(str){ return String(str).replace(/[&<>\"']/g, function(s){ return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":"&#39;"}[s]; }); }

    // Add-to-cart wiring
    document.querySelectorAll('.product').forEach(prodEl => {
        const addBtn = prodEl.querySelector('.add-to-cart');
        if (!addBtn) return;
        const id = prodEl.dataset.id;
        const price = prodEl.dataset.price;
        const name = prodEl.querySelector('h3')?.textContent || 'Product';
        addBtn.addEventListener('click', () => {
            const existing = findCartItem(id);
            if (existing) existing.quantity += 1;
            else cart.push({ id, price, name, quantity: 1 });
            persistAndRender();
        });
    });

    function openInNewTabs(queue){ queue.forEach(href => window.open(href, '_blank')); }
    function startSequential(queue){ if (!queue || queue.length === 0) return; const next = queue.slice(1); sessionStorage.setItem(PENDING_KEY, JSON.stringify(next)); window.location.href = queue[0]; }

    cartCheckoutBtn.addEventListener('click', () => {
        if (cart.length === 0){ alert('Your cart is empty'); return; }
        const queue = [];
        cart.forEach(item => {
            const prodEl = document.querySelector('.product[data-id="' + item.id + '"]');
            if (!prodEl) return;
            const link = prodEl.querySelector('.payment-link');
            if (!link) return;
            const href = link.href;
            for (let i=0;i<item.quantity;i++) queue.push(href);
        });
        if (queue.length === 0){ alert('No payment links found for items in cart.'); return; }
        const mode = checkoutModeSelect.value || 'tabs';
        if (mode === 'tabs'){
            if (queue.length > 5 && !confirm('This will open ' + queue.length + ' tabs. Continue?')) return;
            openInNewTabs(queue);
        } else {
            startSequential(queue);
        }
    });

    // Resume
    resumeBtn.addEventListener('click', () => {
        const pending = JSON.parse(sessionStorage.getItem(PENDING_KEY) || '[]');
        if (!pending || pending.length === 0){ alert('No pending checkouts.'); updateResumeButton(); return; }
        const next = pending.slice(1);
        sessionStorage.setItem(PENDING_KEY, JSON.stringify(next));
        window.location.href = pending[0];
    });

    // initial
    updateResumeButton();
    renderCart();
})();
