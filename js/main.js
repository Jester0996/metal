// ========== Data ==========
const products = [
  { id: 1, name: 'Ручка дверная', sku: 'L422WH', price: 355, oldPrice: 400, image: 'img/1.jpg', material: 'metal', discount: true },
  { id: 2, name: 'Ручка дверная', sku: 'L423WH', price: 355, oldPrice: 400, image: 'img/1.jpg', material: 'metal', discount: true },
  { id: 3, name: 'Ручка, нержавеющ сталь', sku: 'S101SS', price: 99, oldPrice: 136, image: 'img/2.jpg', material: 'steel', discount: true },
  { id: 4, name: 'Стандартные петли', sku: 'H200ST', price: 75, oldPrice: null, image: 'img/3.jpg', material: 'metal', discount: false },
  { id: 5, name: 'Петля со стопором', sku: 'H300SP', price: 200, oldPrice: 270, image: 'img/4.jpg', material: 'metal', discount: true },
  { id: 6, name: 'Ручка дверная', sku: 'L424WH', price: 355, oldPrice: null, image: 'img/1.jpg', material: 'metal', discount: false },
  { id: 7, name: 'Стандартные петли', sku: 'H201ST', price: 75, oldPrice: null, image: 'img/3.jpg', material: 'metal', discount: false },
  { id: 8, name: 'Ручка, нержавеющ сталь', sku: 'S102SS', price: 99, oldPrice: 136, image: 'img/2.jpg', material: 'steel', discount: true },
  { id: 9, name: 'Ручка, нержавеющ сталь', sku: 'S103SS', price: 99, oldPrice: null, image: 'img/2.jpg', material: 'steel', discount: false },
  { id: 10, name: 'Петля со стопором', sku: 'H301SP', price: 200, oldPrice: 270, image: 'img/4.jpg', material: 'metal', discount: true },
  { id: 11, name: 'Стандартные петли', sku: 'H202ST', price: 75, oldPrice: null, image: 'img/3.jpg', material: 'metal', discount: false },
  { id: 12, name: 'Ручка дверная', sku: 'L425WH', price: 355, oldPrice: 400, image: 'img/1.jpg', material: 'metal', discount: true }
];

// ========== State ==========
let state = {
  products: [...products],
  filter: 'all',
  sort: 'default',
  search: '',
  view: 'grid',
  cart: JSON.parse(localStorage.getItem('cart') || '[]'),
  favorites: JSON.parse(localStorage.getItem('favorites') || '[]')
};

// ========== DOM Elements ==========
const grid = document.getElementById('products-grid');
const countEl = document.getElementById('products-count');
const emptyState = document.getElementById('empty-state');
const searchInput = document.getElementById('search-input');
const searchClear = document.getElementById('search-clear');
const activeFilters = document.getElementById('active-filters');
const resetBtn = document.getElementById('reset-filters');

// Drawers
const drawerOverlay = document.getElementById('drawer-overlay');
const drawerCart = document.getElementById('drawer-cart');
const drawerFav = document.getElementById('drawer-fav');
const btnCart = document.getElementById('btn-cart');
const btnFav = document.getElementById('btn-fav');
const closeCart = document.getElementById('close-cart');
const closeFav = document.getElementById('close-fav');
const cartItems = document.getElementById('cart-items');
const favItems = document.getElementById('fav-items');
const cartFooter = document.getElementById('cart-footer');
const cartTotal = document.getElementById('cart-total');
const cartCount = document.getElementById('cart-count');
const favCount = document.getElementById('fav-count');
const badgeCart = document.getElementById('badge-cart');
const badgeFav = document.getElementById('badge-fav');

// Modal
const modalOverlay = document.getElementById('modal-overlay');
const modal = document.getElementById('quick-view-modal');
const closeModalBtn = document.getElementById('close-modal');
const modalContent = document.getElementById('modal-content');

// Toast
const toastContainer = document.getElementById('toast-container');

// ========== Helpers ==========
const formatPrice = (price) => price.toLocaleString('ru-RU') + ' ₽';

const saveState = () => {
  localStorage.setItem('cart', JSON.stringify(state.cart));
  localStorage.setItem('favorites', JSON.stringify(state.favorites));
};

const getPlaceholder = (name) => {
  const colors = ['c9a96e', '8b7355', '6b6b6b', 'a89f91'];
  const color = colors[name.length % colors.length];
  return `https://placehold.co/600x450/${color}/ffffff?text=${encodeURIComponent(name)}`;
};

// ========== Toast ==========
const showToast = (message, type = 'success') => {
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'toast--error' : ''}`;
  toast.innerHTML = `
    <span class="toast__icon">${type === 'success' ? '✓' : '×'}</span>
    <span class="toast__text">${message}</span>
  `;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast--exit');
    toast.addEventListener('animationend', () => toast.remove());
  }, 3000);
};

// ========== Custom Selects ==========
const initSelect = (selectEl, callback) => {
  const trigger = selectEl.querySelector('.select__trigger');
  const options = selectEl.querySelector('.select__options');
  const optionItems = selectEl.querySelectorAll('.select__option');
  const valueEl = selectEl.querySelector('.select__value');

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = options.classList.contains('open');
    closeAllSelects();
    options.classList.toggle('open', !isOpen);
    trigger.setAttribute('aria-expanded', !isOpen);
  });

  optionItems.forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      optionItems.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      valueEl.textContent = opt.textContent;
      options.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
      callback(opt.dataset.value);
    });
  });
};

const closeAllSelects = () => {
  document.querySelectorAll('.select__options').forEach(el => el.classList.remove('open'));
  document.querySelectorAll('.select__trigger').forEach(el => el.setAttribute('aria-expanded', 'false'));
};

document.addEventListener('click', closeAllSelects);

// ========== Filtering & Sorting ==========
const getFilteredProducts = () => {
  let result = [...state.products];

  if (state.filter !== 'all') {
    result = result.filter(p => p.material === state.filter);
  }

  if (state.search.trim()) {
    const q = state.search.toLowerCase();
    result = result.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.sku.toLowerCase().includes(q)
    );
  }

  switch (state.sort) {
    case 'price-asc':
      result.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      result.sort((a, b) => b.price - a.price);
      break;
    case 'name':
      result.sort((a, b) => a.name.localeCompare(b.name));
      break;
  }

  return result;
};

const updateActiveFilters = () => {
  activeFilters.innerHTML = '';

  if (state.filter !== 'all') {
    const names = { metal: 'Металл', plastic: 'Пластик', steel: 'Нержавеющая сталь' };
    addFilterTag(`Материал: ${names[state.filter] || state.filter}`, () => {
      state.filter = 'all';
      document.querySelector('#material-select .select__option[data-value="all"]').click();
      render();
    });
  }

  if (state.search.trim()) {
    addFilterTag(`Поиск: "${state.search}"`, () => {
      state.search = '';
      searchInput.value = '';
      searchClear.classList.remove('visible');
      render();
    });
  }
};

const addFilterTag = (text, onRemove) => {
  const tag = document.createElement('div');
  tag.className = 'filter-tag';
  tag.innerHTML = `
    <span>${text}</span>
    <button class="filter-tag__remove" aria-label="Удалить фильтр">×</button>
  `;
  tag.querySelector('button').addEventListener('click', onRemove);
  activeFilters.appendChild(tag);
};

// ========== Rendering ==========
const render = () => {
  const filtered = getFilteredProducts();
  countEl.textContent = filtered.length;

  updateActiveFilters();

  if (filtered.length === 0) {
    grid.hidden = true;
    emptyState.hidden = false;
    return;
  }

  grid.hidden = false;
  emptyState.hidden = true;

  grid.innerHTML = filtered.map(p => {
    const imgSrc = p.image || getPlaceholder(p.name);
    return `
    <article class="product-card" data-id="${p.id}">
      ${p.discount ? '<span class="product-card__badge">Скидка</span>' : ''}

      <div class="product-card__actions">
        <button class="product-card__action-btn ${isFav(p.id) ? 'active' : ''}" 
                onclick="toggleFav(${p.id})" 
                aria-label="${isFav(p.id) ? 'Удалить из избранного' : 'Добавить в избранное'}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="${isFav(p.id) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        </button>
        <button class="product-card__action-btn" onclick="openQuickView(${p.id})" aria-label="Быстрый просмотр">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        </button>
      </div>

      <div class="product-card__image">
        <img src="${imgSrc}" alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src='${getPlaceholder(p.name)}'">
        <div class="product-card__quick">
          <button class="product-card__quick-btn" onclick="openQuickView(${p.id})">Быстрый просмотр</button>
        </div>
      </div>

      <div class="product-card__body">
        <div>
          <div class="product-card__sku">${p.sku}</div>
          <h2 class="product-card__title">${p.name}</h2>
        </div>
        <div class="product-card__footer">
          <div class="product-card__prices">
            <span class="product-card__price">${formatPrice(p.price)}</span>
            ${p.oldPrice ? `<span class="product-card__price--old">${formatPrice(p.oldPrice)}</span>` : ''}
          </div>
          <button class="product-card__cart" onclick="addToCart(${p.id})" aria-label="Добавить в корзину">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
          </button>
        </div>
      </div>
    </article>
  `}).join('');
};

// ========== Cart ==========
const isInCart = (id) => state.cart.some(item => item.id === id);
const isFav = (id) => state.favorites.includes(id);

const addToCart = (id) => {
  const product = products.find(p => p.id === id);
  if (!product) return;

  const existing = state.cart.find(item => item.id === id);
  if (existing) {
    existing.qty++;
  } else {
    state.cart.push({ ...product, qty: 1 });
  }

  saveState();
  updateBadges();
  renderCart();
  showToast(`${product.name} добавлен в корзину`);
};

const removeFromCart = (id) => {
  state.cart = state.cart.filter(item => item.id !== id);
  saveState();
  updateBadges();
  renderCart();
};

const updateQty = (id, delta) => {
  const item = state.cart.find(i => i.id === id);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(id);
    return;
  }

  saveState();
  updateBadges();
  renderCart();
};

const renderCart = () => {
  if (state.cart.length === 0) {
    cartItems.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty__icon">🛒</div>
        <p class="cart-empty__text">Корзина пуста</p>
        <button class="btn btn--primary btn--sm" id="continue-shopping">Продолжить покупки</button>
      </div>
    `;
    document.getElementById('continue-shopping')?.addEventListener('click', closeDrawers);
    cartFooter.hidden = true;
    return;
  }

  const total = state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalQty = state.cart.reduce((s, i) => s + i.qty, 0);

  cartTotal.textContent = formatPrice(total);
  cartCount.textContent = totalQty + ' товар' + (totalQty === 1 ? '' : totalQty < 5 ? 'а' : 'ов');

  cartItems.innerHTML = state.cart.map(item => {
    const imgSrc = item.image || getPlaceholder(item.name);
    return `
    <div class="cart-item">
      <div class="cart-item__image">
        <img src="${imgSrc}" alt="${item.name}" onerror="this.onerror=null;this.src='${getPlaceholder(item.name)}'">
      </div>
      <div class="cart-item__info">
        <div class="cart-item__title">${item.name}</div>
        <div class="cart-item__meta">
          <div class="cart-item__qty">
            <button onclick="updateQty(${item.id}, -1)" aria-label="Уменьшить">−</button>
            <span>${item.qty}</span>
            <button onclick="updateQty(${item.id}, 1)" aria-label="Увеличить">+</button>
          </div>
          <div class="cart-item__price">${formatPrice(item.price * item.qty)}</div>
        </div>
      </div>
      <button class="cart-item__remove" onclick="removeFromCart(${item.id})" aria-label="Удалить">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
  `}).join('');

  cartFooter.hidden = false;
};

// ========== Favorites ==========
const toggleFav = (id) => {
  const idx = state.favorites.indexOf(id);
  const product = products.find(p => p.id === id);

  if (idx > -1) {
    state.favorites.splice(idx, 1);
    showToast(`${product.name} удалена из избранного`, 'error');
  } else {
    state.favorites.push(id);
    showToast(`${product.name} добавлена в избранное`);
  }

  saveState();
  updateBadges();
  render();
  renderFav();
};

const renderFav = () => {
  const favQty = state.favorites.length;
  favCount.textContent = favQty + ' товар' + (favQty === 1 ? '' : favQty < 5 ? 'а' : 'ов');

  if (state.favorites.length === 0) {
    favItems.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty__icon">♡</div>
        <p class="cart-empty__text">Нет избранных товаров</p>
      </div>
    `;
    return;
  }

  const favProducts = products.filter(p => state.favorites.includes(p.id));
  favItems.innerHTML = favProducts.map(p => {
    const imgSrc = p.image || getPlaceholder(p.name);
    return `
    <div class="cart-item">
      <div class="cart-item__image">
        <img src="${imgSrc}" alt="${p.name}" onerror="this.onerror=null;this.src='${getPlaceholder(p.name)}'">
      </div>
      <div class="cart-item__info">
        <div class="cart-item__title">${p.name}</div>
        <div class="cart-item__price">${formatPrice(p.price)}</div>
        <div style="display:flex;gap:0.8rem;margin-top:0.8rem;">
          <button class="btn btn--sm btn--primary" onclick="addToCart(${p.id})" style="padding:0.6rem 1.2rem;font-size:1.2rem;">В корзину</button>
          <button class="btn btn--sm" onclick="toggleFav(${p.id})" style="padding:0.6rem 1.2rem;font-size:1.2rem;background:var(--color-bg);color:var(--color-text);">Удалить</button>
        </div>
      </div>
    </div>
  `}).join('');
};

// ========== Badges ==========
const updateBadges = () => {
  const cartQty = state.cart.reduce((sum, i) => sum + i.qty, 0);
  badgeCart.textContent = cartQty;
  badgeCart.classList.toggle('visible', cartQty > 0);

  badgeFav.textContent = state.favorites.length;
  badgeFav.classList.toggle('visible', state.favorites.length > 0);
};

// ========== Drawers ==========
const openDrawer = (drawer) => {
  drawerOverlay.hidden = false;
  drawer.hidden = false;

  requestAnimationFrame(() => {
    drawerOverlay.classList.add('visible');
    drawer.classList.add('visible');
  });

  document.body.style.overflow = 'hidden';
};

const closeDrawers = () => {
  [drawerCart, drawerFav].forEach(d => d.classList.remove('visible'));
  drawerOverlay.classList.remove('visible');

  setTimeout(() => {
    drawerOverlay.hidden = true;
    drawerCart.hidden = true;
    drawerFav.hidden = true;
    document.body.style.overflow = '';
  }, 300);
};

btnCart.addEventListener('click', () => { renderCart(); openDrawer(drawerCart); });
btnFav.addEventListener('click', () => { renderFav(); openDrawer(drawerFav); });
closeCart.addEventListener('click', closeDrawers);
closeFav.addEventListener('click', closeDrawers);
drawerOverlay.addEventListener('click', closeDrawers);

// ========== Quick View Modal ==========
const openQuickView = (id) => {
  const p = products.find(x => x.id === id);
  if (!p) return;

  const imgSrc = p.image || getPlaceholder(p.name);

  modalContent.innerHTML = `
    <div class="modal__image">
      <img src="${imgSrc}" alt="${p.name}" onerror="this.onerror=null;this.src='${getPlaceholder(p.name)}'">
    </div>
    <div class="modal__details">
      <div class="modal__sku">Артикул: ${p.sku}</div>
      <h2 class="modal__title">${p.name}</h2>
      <div class="modal__price">
        <span class="modal__price-current">${formatPrice(p.price)}</span>
        ${p.oldPrice ? `<span class="modal__price-old">${formatPrice(p.oldPrice)}</span>` : ''}
      </div>
      <p class="modal__desc">Качественная фурнитура для стеллажных систем. Изготовлена из прочных материалов, рассчитана на длительный срок эксплуатации. Подходит для сборки стеллажей любой конфигурации.</p>
      <div class="modal__tags">
        <span class="modal__tag">Материал: ${p.material === 'steel' ? 'Нержавеющая сталь' : p.material === 'metal' ? 'Металл' : 'Пластик'}</span>
        <span class="modal__tag">В наличии</span>
        ${p.discount ? '<span class="modal__tag">Акция</span>' : ''}
      </div>
      <div class="modal__actions">
        <button class="btn btn--primary btn--full" onclick="addToCart(${p.id}); closeModalFn();">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
          В корзину
        </button>
        <button class="btn ${isFav(p.id) ? 'btn--primary' : ''}" onclick="toggleFav(${p.id}); this.classList.toggle('btn--primary');" style="width:48px;padding:0;display:flex;align-items:center;justify-content:center;background:${isFav(p.id) ? 'var(--color-accent)' : 'var(--color-bg)'};color:${isFav(p.id) ? 'white' : 'var(--color-text)'};">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="${isFav(p.id) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        </button>
      </div>
    </div>
  `;

  modalOverlay.hidden = false;
  modal.hidden = false;

  requestAnimationFrame(() => {
    modalOverlay.classList.add('visible');
    modal.classList.add('visible');
  });

  document.body.style.overflow = 'hidden';
};

const closeModalFn = () => {
  modal.classList.remove('visible');
  modalOverlay.classList.remove('visible');

  setTimeout(() => {
    modal.hidden = true;
    modalOverlay.hidden = true;
    document.body.style.overflow = '';
  }, 300);
};

closeModalBtn.addEventListener('click', closeModalFn);
modalOverlay.addEventListener('click', closeModalFn);

// ========== Event Listeners ==========
searchInput.addEventListener('input', (e) => {
  state.search = e.target.value;
  searchClear.classList.toggle('visible', state.search.length > 0);
  render();
});

searchClear.addEventListener('click', () => {
  state.search = '';
  searchInput.value = '';
  searchClear.classList.remove('visible');
  render();
});

resetBtn.addEventListener('click', () => {
  state.filter = 'all';
  state.sort = 'default';
  state.search = '';
  searchInput.value = '';
  searchClear.classList.remove('visible');

  document.querySelectorAll('.select__option').forEach(o => o.classList.remove('active'));
  document.querySelector('#sort-select .select__option[data-value="default"]').classList.add('active');
  document.querySelector('#sort-select .select__value').textContent = 'По умолчанию';
  document.querySelector('#material-select .select__option[data-value="all"]').classList.add('active');
  document.querySelector('#material-select .select__value').textContent = 'Все';

  render();
});

// View toggle
const viewBtns = document.querySelectorAll('.view-btn');
viewBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    viewBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.view = btn.dataset.view;
    grid.dataset.view = state.view;
  });
});

// Custom selects
initSelect(document.getElementById('sort-select'), (value) => {
  state.sort = value;
  render();
});

initSelect(document.getElementById('material-select'), (value) => {
  state.filter = value;
  render();
});

// ========== Init ==========
updateBadges();
render();

// Keyboard: Escape to close
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeDrawers();
    closeModalFn();
  }
});