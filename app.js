function getLocalProducts() {
  const stored = localStorage.getItem('siteProducts');
  return stored ? JSON.parse(stored) : window.PRODUCTS.slice();
}

function saveLocalProducts(products) {
  localStorage.setItem('siteProducts', JSON.stringify(products));
}

function initProductStore() {
  if (!localStorage.getItem('siteProducts')) {
    saveLocalProducts(window.PRODUCTS);
  }
}

function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function formatPrice(amount) {
  return `Ksh ${amount.toLocaleString()}`;
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getQueryParameter(key) {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

function createProductCard(product) {
  return `
    <article class="card">
      <a class="card-media" href="product.html?id=${product.id}">
        <img src="${product.images[0]}" alt="${product.name}">
      </a>
      <div class="card-body">
        <p class="card-title">${product.name}</p>
        <p class="card-subtitle">${product.category} · ${product.size}</p>
        <div class="card-meta">
          <span class="badge">${formatPrice(product.price)}</span>
          <span class="badge">${product.condition}</span>
        </div>
        <div class="card-actions">
          <a class="btn" href="product.html?id=${product.id}">View</a>
          <button class="btn secondary" onclick="event.preventDefault(); addToCartFromCard('${product.id}')">Add to Cart</button>
        </div>
      </div>
    </article>
  `;
}

function addToCartFromCard(productId) {
  const products = getLocalProducts();
  const product = products.find((item) => item.id === productId);
  if (!product) return;
  const cart = getCart();
  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, image: product.images[0], quantity: 1 });
  }
  saveCart(cart);
  alert('Added to cart');
}

function renderFeaturedProducts() {
  const featured = document.getElementById('featuredProducts');
  if (!featured) return;
  const featuredCategories = ['Crop Tops', 'Pajama Trousers', 'Dresses', 'Sweater Vests', 'Leather Miniskirts', 'Jackets', 'Knitwear'];
  const products = getLocalProducts().filter((product) => featuredCategories.includes(product.category)).slice(0, 8);
  featured.innerHTML = products.map((product) => `
    <a class="card" href="product.html?id=${product.id}">
      <div class="card-media">
        <img src="${product.images[0]}" alt="${product.name}">
      </div>
    </a>
  `).join('');
}

function getCategoryPriority() {
  return ['Crop Tops', 'Pajama Trousers', 'Leather Miniskirts', 'Sweater Vests'];
}

function sortCategories(categories) {
  const priority = getCategoryPriority();
  return [...categories].sort((a, b) => {
    const aIndex = priority.indexOf(a);
    const bIndex = priority.indexOf(b);
    if (aIndex !== -1 || bIndex !== -1) {
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    }
    return a.localeCompare(b);
  });
}

function renderCategorySection() {
  const container = document.getElementById('categoriesGrid');
  if (!container) return;
  const products = getLocalProducts();
  const categories = sortCategories([...new Set(products.map((product) => product.category))]).filter(cat => cat !== 'Sweater Vests');
  container.innerHTML = categories.map((category) => `
    <a class="category-card" href="shop.html?category=${encodeURIComponent(category.toLowerCase())}">
      <h4>${category}</h4>
      <p>Shop the best ${category.toLowerCase()} picks.</p>
    </a>
  `).join('');
}

function renderTestimonials() {
  const testimonials = [
    { quote: 'Cozy Thrift made me feel like shopping at a boutique with secondhand prices. The pieces arrived beautifully packed.', author: 'Jane M.' },
    { quote: 'The product details were clear and the checkout via WhatsApp was fast and friendly. I love my thrifted jacket.', author: 'Victor N.' },
    { quote: 'Stylish finds, quick replies, and excellent service. Cozy Thrift KE is my new favorite secondhand shop.', author: 'Amina K.' }
  ];
  const container = document.getElementById('testimonialGrid');
  if (!container) return;
  container.innerHTML = testimonials.map((item) => `
    <article class="testimonial-card">
      <p>“${item.quote}”</p>
      <strong>– ${item.author}</strong>
    </article>
  `).join('');
}

function renderShopPage() {
  const grid = document.getElementById('shopGrid');
  if (!grid) return;
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const categoryFilter = getQueryParameter('category');
  let products = getLocalProducts();
  if (categoryFilter) {
    products = products.filter((product) => product.category.toLowerCase() === categoryFilter.toLowerCase());
  }
  if (searchInput) {
    searchInput.addEventListener('input', () => renderShopPage());
    const searchValue = searchInput.value.trim().toLowerCase();
    if (searchValue) {
      products = products.filter((product) => product.name.toLowerCase().includes(searchValue) || product.description.toLowerCase().includes(searchValue));
    }
  }
  if (sortSelect) {
    sortSelect.addEventListener('change', () => renderShopPage());
    const sortValue = sortSelect.value;
    if (sortValue === 'price-asc') products.sort((a, b) => a.price - b.price);
    if (sortValue === 'price-desc') products.sort((a, b) => b.price - a.price);
    if (sortValue === 'newest') products = [...products].reverse();
  }
  if (!categoryFilter) {
    const categoryOrder = getCategoryPriority();
    products.sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a.category);
      const bIndex = categoryOrder.indexOf(b.category);
      if (aIndex !== -1 || bIndex !== -1) {
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        if (aIndex !== bIndex) return aIndex - bIndex;
      }
      return a.name.localeCompare(b.name);
    });
  }
  const filters = document.getElementById('shopCategoryList');
  if (filters) {
    const categories = sortCategories([...new Set(getLocalProducts().map((product) => product.category))]).filter(cat => cat !== 'Sweater Vests');
    filters.innerHTML = categories.map((category) => {
      const isActive = categoryFilter && category.toLowerCase() === categoryFilter.toLowerCase();
      return `
        <a class="btn secondary${isActive ? ' active' : ''}" href="shop.html?category=${encodeURIComponent(category.toLowerCase())}">${category}</a>
      `;
    }).join('');
  }
  grid.innerHTML = products.length ? products.map(createProductCard).join('') : '<p>No products found for this search.</p>';
}

function renderProductPage() {
  const productContainer = document.getElementById('productDetail');
  if (!productContainer) return;
  const productId = getQueryParameter('id');
  const products = getLocalProducts();
  const product = products.find((item) => item.id === productId);
  if (!product) {
    productContainer.innerHTML = '<p>Product not found.</p>';
    return;
  }
  const thumbList = product.images.map((src, index) => `
    <button class="product-thumb${index === 0 ? ' active' : ''}" onclick="selectProductImage(${index})">
      <img src="${src}" alt="${product.name} thumbnail">
    </button>
  `).join('');
  productContainer.innerHTML = `
    <div class="product-gallery">
      <div class="product-main-image">
        <img id="mainProductImage" src="${product.images[0]}" alt="${product.name}">
      </div>
      <div class="product-thumbs">${thumbList}</div>
    </div>
    <div class="product-info">
      <h2>${product.name}</h2>
      <p class="product-subtitle">${product.category} · ${product.size}</p>
      <div class="product-meta">
        <span class="product-price">${formatPrice(product.price)}</span>
        <span class="product-condition">Condition: ${product.condition}</span>
      </div>
      <p class="section-note">${product.description}</p>
      <div class="product-actions">
        <button class="btn" onclick="addToCartFromCard('${product.id}')">Add to Cart</button>
        <button class="btn secondary" onclick="orderNow('${product.id}')">Order on WhatsApp</button>
      </div>
    </div>
  `;
}

function selectProductImage(index) {
  const productId = getQueryParameter('id');
  const product = getLocalProducts().find((item) => item.id === productId);
  if (!product) return;
  const mainImage = document.getElementById('mainProductImage');
  const thumbs = document.querySelectorAll('.product-thumb');
  mainImage.src = product.images[index];
  thumbs.forEach((thumb, thumbIndex) => thumb.classList.toggle('active', thumbIndex === index));
}

function orderNow(productId) {
  const products = getLocalProducts();
  const product = products.find((item) => item.id === productId);
  if (!product) return;
  const base = `https://wa.me/254797775228?text=`;
  const message = `Hello Cozy Thrift KE, I want to order: ${product.name} for ${formatPrice(product.price)}.`;
  window.open(base + encodeURIComponent(message), '_blank');
}

function renderCartPage() {
  const tableBody = document.getElementById('cartTableBody');
  const cartEmpty = document.getElementById('cartEmpty');
  const summaryTotal = document.getElementById('cartTotal');
  const checkoutButton = document.getElementById('checkoutButton');
  if (!tableBody || !cartEmpty || !summaryTotal) return;
  const cart = getCart();
  if (!cart.length) {
    cartEmpty.style.display = 'block';
    tableBody.innerHTML = '';
    summaryTotal.textContent = formatPrice(0);
    if (checkoutButton) checkoutButton.disabled = true;
    return;
  }
  cartEmpty.style.display = 'none';
  tableBody.innerHTML = cart.map((item, index) => `
    <tr>
      <td>
        <div class="cart-product">
          <img src="${item.image}" alt="${item.name}">
          <div>
            <strong>${item.name}</strong>
            <p>${formatPrice(item.price)}</p>
          </div>
        </div>
      </td>
      <td>
        <input class="quantity-select" type="number" min="1" value="${item.quantity}" onchange="updateQuantity(${index}, this.value)">
      </td>
      <td>${formatPrice(item.price * item.quantity)}</td>
      <td><button class="btn secondary" onclick="removeCartItem(${index})">Remove</button></td>
    </tr>
  `).join('');
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  summaryTotal.textContent = formatPrice(total);
  if (checkoutButton) checkoutButton.disabled = false;
}

function updateQuantity(index, value) {
  const cart = getCart();
  const quantity = Number(value);
  if (quantity < 1) return;
  cart[index].quantity = quantity;
  saveCart(cart);
  renderCartPage();
}

function removeCartItem(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCartPage();
}

function renderCheckoutPage() {
  const summary = document.getElementById('checkoutSummary');
  const notice = document.getElementById('checkoutNotice');
  const form = document.getElementById('checkoutForm');
  if (!summary || !form || !notice) return;
  const cart = getCart();
  if (!cart.length) {
    notice.textContent = 'Your cart is empty. Please add items before checking out.';
    form.style.display = 'none';
    return;
  }
  form.removeEventListener('submit', submitCheckout);
  form.addEventListener('submit', submitCheckout);
  form.style.display = 'grid';
  notice.textContent = 'Complete the form below and send your order via WhatsApp.';
  const lines = cart.map((item, index) => `${index + 1}. ${item.name} x${item.quantity} - ${formatPrice(item.price * item.quantity)}`);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  summary.innerHTML = `
    <div class="summary-card">
      <div class="summary-item"><span>Items</span><span>${cart.length}</span></div>
      ${lines.map((line) => `<div class="summary-item"><span>${line}</span></div>`).join('')}
      <div class="summary-total"><span>Total</span><span>${formatPrice(total)}</span></div>
    </div>
  `;
}

function submitCheckout(event) {
  event.preventDefault();
  const name = document.getElementById('checkoutName').value.trim();
  const phone = document.getElementById('checkoutPhone').value.trim();
  const location = document.getElementById('checkoutLocation').value.trim();
  const notes = document.getElementById('checkoutNotes').value.trim();
  if (!name || !phone || !location) {
    alert('Name, phone, and location are required.');
    return;
  }
  const cart = getCart();
  if (!cart.length) {
    alert('Cart is empty.');
    return;
  }
  const messageLines = [
    'Cozy Thrift KE order',
    ...cart.map((item, index) => `${index + 1}. ${item.name} x${item.quantity} - ${formatPrice(item.price * item.quantity)}`),
    `Total: ${formatPrice(cart.reduce((sum, item) => sum + item.price * item.quantity, 0))}`,
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Location: ${location}`
  ];
  if (notes) messageLines.push(`Notes: ${notes}`);
  const base = 'https://wa.me/254797775228?text=';
  window.open(base + encodeURIComponent(messageLines.join('\n')), '_blank');
  localStorage.removeItem('cart');
  event.target.reset();
  renderCheckoutPage();
}

function renderContactPage() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const message = document.getElementById('contactMessage').value.trim();
    if (!name || !message || !email.includes('@')) {
      alert('Please provide your name, valid email, and message.');
      return;
    }
    alert('Thank you! Your message has been received.');
    form.reset();
  });
}

function initFaq() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    const button = item.querySelector('.faq-question');
    button.addEventListener('click', () => {
      const answer = item.querySelector('.faq-answer');
      const isOpen = answer.classList.contains('open');
      document.querySelectorAll('.faq-answer.open').forEach((openItem) => openItem.classList.remove('open'));
      if (!isOpen) answer.classList.add('open');
    });
  });
}

function renderAdminPage() {
  const adminForm = document.getElementById('adminForm');
  const adminProducts = document.getElementById('adminProducts');
  const loginPanel = document.getElementById('adminLoginPanel');
  const panel = document.getElementById('adminPanel');
  const signOut = document.getElementById('signOutButton');
  if (!adminForm || !adminProducts || !loginPanel || !panel) return;
  const loggedIn = localStorage.getItem('adminLoggedIn') === 'true';
  if (!loggedIn) {
    loginPanel.style.display = 'block';
    panel.style.display = 'none';
  } else {
    loginPanel.style.display = 'none';
    panel.style.display = 'block';
    signOut.addEventListener('click', () => {
      localStorage.removeItem('adminLoggedIn');
      window.location.reload();
    });
    adminForm.addEventListener('submit', handleAdminSave);
    const cancelEdit = document.getElementById('adminCancelEdit');
    if (cancelEdit) cancelEdit.addEventListener('click', resetAdminForm);
    setupAdminMediaUpload();
    renderAdminCategoryDropdown();
    renderAdminConditionDropdown();
    renderAdminSizeDropdown();
    renderAdminProducts();
  }
}

function getAvailableCategories() {
  const products = getLocalProducts();
  const categories = [...new Set(products.map((product) => product.category))];
  return sortCategories(categories);
}

function renderAdminCategoryDropdown(selectedCategory = '') {
  const categorySelect = document.getElementById('adminCategory');
  if (!categorySelect) return;
  const categories = getAvailableCategories();
  categorySelect.innerHTML = `<option value="">Select category</option>` + categories.map((category) => `
    <option value="${category}"${category === selectedCategory ? ' selected' : ''}>${category}</option>
  `).join('');
}

function getAvailableConditions() {
  return ['Excellent', 'Very Good', 'Good', 'Fair'];
}

function renderAdminConditionDropdown(selectedCondition = '') {
  const conditionSelect = document.getElementById('adminCondition');
  if (!conditionSelect) return;
  const conditions = getAvailableConditions();
  conditionSelect.innerHTML = `<option value="">Select condition</option>` + conditions.map((condition) => `
    <option value="${condition}"${condition === selectedCondition ? ' selected' : ''}>${condition}</option>
  `).join('');
}

function getAvailableSizes() {
  return ['Large', 'Medium', 'Small'];
}

function renderAdminSizeDropdown(selectedSize = '') {
  const sizeSelect = document.getElementById('adminSize');
  if (!sizeSelect) return;
  const sizes = getAvailableSizes();
  sizeSelect.innerHTML = `<option value="">Select size</option>` + sizes.map((size) => `
    <option value="${size}"${size === selectedSize ? ' selected' : ''}>${size}</option>
  `).join('');
}

function setupAdminMediaUpload() {
  const dropzone = document.getElementById('adminDropzone');
  const fileInput = document.getElementById('adminMediaFile');
  const dropzoneText = document.getElementById('adminDropzoneText');
  if (!dropzone || !fileInput || !dropzoneText) return;
  const updateText = (file) => {
    dropzoneText.textContent = file ? `Selected: ${file.name}` : 'No file selected';
  };
  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropzone.classList.add('dragover');
  });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
  dropzone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropzone.classList.remove('dragover');
    const files = event.dataTransfer.files;
    if (files.length) {
      fileInput.files = files;
      updateText(files[0]);
    }
  });
  fileInput.addEventListener('change', () => {
    updateText(fileInput.files[0]);
  });
}

function handleAdminLogin(event) {
  event.preventDefault();
  const username = document.getElementById('adminUsername').value.trim();
  const password = document.getElementById('adminPassword').value.trim();
  if (username === 'lixxyshiko' && password === 'thrift2026') {
    localStorage.setItem('adminLoggedIn', 'true');
    window.location.reload();
  } else {
    alert('Invalid credentials.');
  }
}

async function handleAdminSave(event) {
  event.preventDefault();
  const name = document.getElementById('adminName').value.trim();
  const price = Number(document.getElementById('adminPrice').value.trim());
  const category = document.getElementById('adminCategory').value.trim();
  const size = document.getElementById('adminSize').value.trim();
  const condition = document.getElementById('adminCondition').value.trim();
  const description = document.getElementById('adminDescription').value.trim();
  const mediaInput = document.getElementById('adminMediaFile');
  const imageUrl = document.getElementById('adminImage').value.trim();
  let mediaSource = '';
  if (mediaInput && mediaInput.files.length) {
    const file = mediaInput.files[0];
    mediaSource = await toBase64(file);
  } else if (imageUrl) {
    mediaSource = imageUrl;
  }
  if (!name || !price || !category || !size || !condition || !description || !mediaSource) {
    alert('Please complete every field and add a media file or URL.');
    return;
  }
  const products = getLocalProducts();
  const editingId = document.getElementById('adminProductId').value;
  if (editingId) {
    const existingIndex = products.findIndex((item) => item.id === editingId);
    if (existingIndex !== -1) {
      const existing = products[existingIndex];
      existing.name = name;
      existing.price = price;
      existing.category = category;
      existing.size = size;
      existing.condition = condition;
      existing.description = description;
      existing.slug = name.toLowerCase().replace(/\s+/g, '-');
      existing.images = [mediaSource];
    }
  } else {
    const id = `p${Date.now()}`;
    products.push({ id, name, price, category, size, condition, slug: name.toLowerCase().replace(/\s+/g, '-'), description, images: [mediaSource], tags: [] });
  }
  saveLocalProducts(products);
  resetAdminForm();
  renderAdminProducts();
}

function resetAdminForm() {
  const adminForm = document.getElementById('adminForm');
  const adminProductId = document.getElementById('adminProductId');
  const adminDropzoneText = document.getElementById('adminDropzoneText');
  const adminSubmitButton = document.getElementById('adminSubmitButton');
  const adminCancelEdit = document.getElementById('adminCancelEdit');
  if (adminForm) adminForm.reset();
  if (adminProductId) adminProductId.value = '';
  if (adminDropzoneText) adminDropzoneText.textContent = 'No file selected';
  if (adminSubmitButton) adminSubmitButton.textContent = 'Add Product';
  if (adminCancelEdit) adminCancelEdit.style.display = 'none';
  renderAdminCategoryDropdown();
  renderAdminConditionDropdown();
  renderAdminSizeDropdown();
}

function renderAdminProducts() {
  const adminProducts = document.getElementById('adminProducts');
  const products = getLocalProducts();
  adminProducts.innerHTML = products.map((product) => `
    <div class="admin-card">
      <div class="product-row">
        <div>
          <strong>${product.name}</strong>
          <p>${product.category} · ${product.size} · ${product.condition}</p>
          <p>${formatPrice(product.price)}</p>
        </div>
        <div class="admin-actions">
          <button type="button" class="btn secondary" onclick="editProduct('${product.id}')">Edit</button>
          <button type="button" class="btn secondary" onclick="deleteProduct('${product.id}')">Delete</button>
        </div>
      </div>
    </div>
  `).join('');
}

function editProduct(productId) {
  const products = getLocalProducts();
  const product = products.find((item) => item.id === productId);
  if (!product) return;
  document.getElementById('adminProductId').value = product.id;
  document.getElementById('adminName').value = product.name;
  document.getElementById('adminPrice').value = product.price;
  renderAdminCategoryDropdown(product.category);
  renderAdminSizeDropdown(product.size);
  renderAdminConditionDropdown(product.condition);
  document.getElementById('adminDescription').value = product.description;
  document.getElementById('adminImage').value = product.images[0] || '';
  const adminDropzoneText = document.getElementById('adminDropzoneText');
  if (adminDropzoneText) adminDropzoneText.textContent = product.images[0] ? 'Current media will be used unless replaced' : 'No file selected';
  const adminSubmitButton = document.getElementById('adminSubmitButton');
  const adminCancelEdit = document.getElementById('adminCancelEdit');
  if (adminSubmitButton) adminSubmitButton.textContent = 'Save Changes';
  if (adminCancelEdit) adminCancelEdit.style.display = 'inline-flex';
}

window.editProduct = editProduct;

function deleteProduct(productId) {
  if (!confirm('Delete this product?')) return;
  const products = getLocalProducts().filter((product) => product.id !== productId);
  saveLocalProducts(products);
  renderAdminProducts();
}

function showWhatsAppButton() {
  const whatsApp = document.getElementById('floatingWhatsApp');
  if (!whatsApp) return;
  whatsApp.href = 'https://wa.me/254797775228?text=' + encodeURIComponent('Hello Cozy Thrift KE, I would like to place an order.');
}

function initPage() {
  initProductStore();
  renderFeaturedProducts();
  renderCategorySection();
  renderTestimonials();
  renderShopPage();
  renderProductPage();
  renderCartPage();
  renderCheckoutPage();
  renderContactPage();
  initFaq();
  renderAdminPage();
  showWhatsAppButton();
}

window.addEventListener('DOMContentLoaded', initPage);
