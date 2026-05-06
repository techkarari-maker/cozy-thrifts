function getLocalProducts(): Product[] {
  const stored = localStorage.getItem("siteProducts");
  return stored ? (JSON.parse(stored) as Product[]) : window.PRODUCTS.slice();
}

function saveLocalProducts(products: Product[]): void {
  localStorage.setItem("siteProducts", JSON.stringify(products));
}

function normalizeProductCategories(products: Product[]): Product[] {
  return products.map((product) => ({
    ...product,
    category: product.category === "Sweater Vests" ? "Knitwear" : product.category
  }));
}

function initProductStore(): void {
  const stored = localStorage.getItem("siteProducts");
  if (!stored) {
    saveLocalProducts(normalizeProductCategories(window.PRODUCTS));
    return;
  }

  const products = normalizeProductCategories(JSON.parse(stored) as Product[]);
  saveLocalProducts(products);
}

function getCart(): CartItem[] {
  return JSON.parse(localStorage.getItem("cart") || "[]") as CartItem[];
}

function saveCart(cart: CartItem[]): void {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function formatPrice(amount: number): string {
  return `Ksh ${amount.toLocaleString()}`;
}

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function parseImageUrls(value: string): string[] {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getSelectedCategory(): string {
  const selectedCategory = (document.getElementById("adminCategory") as HTMLSelectElement | null)?.value.trim() || "";
  const customCategory = (document.getElementById("adminCustomCategory") as HTMLInputElement | null)?.value.trim() || "";
  return customCategory || selectedCategory;
}

function getQueryParameter(key: string): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

function createProductCard(product: Product): string {
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
          <button class="btn secondary" onclick="event.preventDefault(); window.addToCartFromCard('${product.id}')">Add to Cart</button>
        </div>
      </div>
    </article>
  `;
}

function createProductSlot(product?: Product): string {
  if (!product) {
    return `
      <article class="category-slot category-slot-empty">
        <div class="category-slot-media"></div>
        <div class="category-slot-copy">
          <strong>Open Slot</strong>
          <p>Waiting for the next product in this category.</p>
        </div>
      </article>
    `;
  }

  return `
    <a class="category-slot" href="product.html?id=${product.id}">
      <div class="category-slot-media">
        <img src="${product.images[0]}" alt="${product.name}">
      </div>
      <div class="category-slot-copy">
        <strong>${product.name}</strong>
        <p>${formatPrice(product.price)}</p>
      </div>
    </a>
  `;
}

function addToCartFromCard(productId: string): void {
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
  alert("Added to cart");
}

function renderFeaturedProducts(): void {
  const featured = document.getElementById("featuredProducts");
  if (!featured) return;

  const featuredCategories = ["Crop Tops", "Pajama Trousers", "Dresses", "Leather Miniskirts", "Jackets", "Knitwear"];
  const products = getLocalProducts().filter((product) => featuredCategories.includes(product.category)).slice(0, 8);
  featured.innerHTML = products.map((product) => `
    <a class="card" href="product.html?id=${product.id}">
      <div class="card-media">
        <img src="${product.images[0]}" alt="${product.name}">
      </div>
    </a>
  `).join("");
}

function renderHeroGallery(): void {
  const heroGallery = document.getElementById("heroGallery");
  if (!heroGallery) return;

  const products = getLocalProducts().slice(0, 4);
  heroGallery.innerHTML = products.map((product) => `
    <a class="hero-gallery-card" href="product.html?id=${product.id}">
      <img src="${product.images[0]}" alt="${product.name}">
    </a>
  `).join("");
}

function getCategoryPriority(): string[] {
  return ["Crop Tops", "Pajama Trousers", "Leather Miniskirts", "Knitwear"];
}

function shouldShowCategory(category: string): boolean {
  return category !== "Sweater Vests";
}

function sortCategories(categories: string[]): string[] {
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

function renderCategorySection(): void {
  const container = document.getElementById("categoriesGrid");
  if (!container) return;

  const products = getLocalProducts();
  const categories = sortCategories([...new Set(products.map((product) => product.category))]);
  container.innerHTML = categories.map((category) => `
    <a class="category-card" href="shop.html?category=${encodeURIComponent(category.toLowerCase())}">
      <h4>${category}</h4>
      <p>Shop the best ${category.toLowerCase()} picks.</p>
    </a>
  `).join("");
}

function renderTestimonials(): void {
  const testimonials: Testimonial[] = [
    { quote: "Cozy Thrift made me feel like shopping at a boutique with secondhand prices. The pieces arrived beautifully packed.", author: "Jane M." },
    { quote: "The product details were clear and the checkout via WhatsApp was fast and friendly. I love my thrifted jacket.", author: "Victor N." },
    { quote: "Stylish finds, quick replies, and excellent service. Cozy Thrift KE is my new favorite secondhand shop.", author: "Amina K." }
  ];

  const container = document.getElementById("testimonialGrid");
  if (!container) return;

  container.innerHTML = testimonials.map((item) => `
    <article class="testimonial-card">
      <p>"${item.quote}"</p>
      <strong>- ${item.author}</strong>
    </article>
  `).join("");
}

function renderShopPage(): void {
  const grid = document.getElementById("shopGrid");
  if (!grid) return;

  const searchInput = document.getElementById("searchInput") as HTMLInputElement | null;
  const sortSelect = document.getElementById("sortSelect") as HTMLSelectElement | null;
  const categoryFilter = getQueryParameter("category");
  let products = getLocalProducts();

  if (categoryFilter) {
    products = products.filter((product) => product.category.toLowerCase() === categoryFilter.toLowerCase());
  }

  if (searchInput) {
    if (!searchInput.dataset.bound) {
      searchInput.addEventListener("input", renderShopPage);
      searchInput.dataset.bound = "true";
    }
    const searchValue = searchInput.value.trim().toLowerCase();
    if (searchValue) {
      products = products.filter((product) => product.name.toLowerCase().includes(searchValue) || product.description.toLowerCase().includes(searchValue));
    }
  }

  if (sortSelect) {
    if (!sortSelect.dataset.bound) {
      sortSelect.addEventListener("change", renderShopPage);
      sortSelect.dataset.bound = "true";
    }
    const sortValue = sortSelect.value;
    if (sortValue === "price-asc") products.sort((a, b) => a.price - b.price);
    if (sortValue === "price-desc") products.sort((a, b) => b.price - a.price);
    if (sortValue === "newest") products = [...products].reverse();
    if (!categoryFilter && !sortValue) {
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
  }

  const filters = document.getElementById("shopCategoryList");
  if (filters) {
    const categories = sortCategories([...new Set(getLocalProducts().map((product) => product.category))]).filter(shouldShowCategory);
    filters.innerHTML = categories.map((category) => {
      const isActive = categoryFilter && category.toLowerCase() === categoryFilter.toLowerCase();
      return `<a class="btn secondary${isActive ? " active" : ""}" href="shop.html?category=${encodeURIComponent(category.toLowerCase())}">${category}</a>`;
    }).join("");
  }

  const visibleCategories = categoryFilter
    ? sortCategories([categoryFilter].map((category) => products.find((product) => product.category.toLowerCase() === category.toLowerCase())?.category || categoryFilter)).filter(Boolean)
    : sortCategories([...new Set(products.map((product) => product.category))]).filter(shouldShowCategory);

  if (!products.length || !visibleCategories.length) {
    grid.innerHTML = "<p>No products found for this search.</p>";
    return;
  }

  grid.className = "shop-category-sections";
  grid.innerHTML = visibleCategories.map((category) => {
    const categoryProducts = products.filter((product) => product.category.toLowerCase() === category.toLowerCase());
    const totalSlots = Math.max(20, categoryProducts.length);
    const slots = Array.from({ length: totalSlots }, (_, index) => createProductSlot(categoryProducts[index]));

    return `
      <section class="shop-category-section" id="category-${encodeURIComponent(category.toLowerCase())}">
        <div class="shop-category-header">
          <div>
            <h4>${category}</h4>
            <p>${categoryProducts.length} product${categoryProducts.length === 1 ? "" : "s"} in this category.</p>
          </div>
        </div>
        <div class="shop-slot-grid">
          ${slots.join("")}
        </div>
      </section>
    `;
  }).join("");
}

function renderProductPage(): void {
  const productContainer = document.getElementById("productDetail");
  if (!productContainer) return;

  const productId = getQueryParameter("id");
  const products = getLocalProducts();
  const product = products.find((item) => item.id === productId);
  if (!product) {
    productContainer.innerHTML = "<p>Product not found.</p>";
    return;
  }

  const thumbList = product.images.map((src, index) => `
    <button class="product-thumb${index === 0 ? " active" : ""}" onclick="window.selectProductImage(${index})">
      <img src="${src}" alt="${product.name} thumbnail">
    </button>
  `).join("");

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
        <button class="btn" onclick="window.addToCartFromCard('${product.id}')">Add to Cart</button>
        <button class="btn secondary" onclick="window.orderNow('${product.id}')">Order on WhatsApp</button>
      </div>
    </div>
  `;
}

function selectProductImage(index: number): void {
  const productId = getQueryParameter("id");
  const product = getLocalProducts().find((item) => item.id === productId);
  if (!product) return;

  const mainImage = document.getElementById("mainProductImage") as HTMLImageElement | null;
  const thumbs = document.querySelectorAll(".product-thumb");
  if (!mainImage) return;

  mainImage.src = product.images[index];
  thumbs.forEach((thumb, thumbIndex) => thumb.classList.toggle("active", thumbIndex === index));
}

function orderNow(productId: string): void {
  const products = getLocalProducts();
  const product = products.find((item) => item.id === productId);
  if (!product) return;

  const base = "https://wa.me/254797775228?text=";
  const message = `Hello Cozy Thrift KE, I want to order: ${product.name} for ${formatPrice(product.price)}.`;
  window.open(base + encodeURIComponent(message), "_blank");
}

function renderCartPage(): void {
  const tableBody = document.getElementById("cartTableBody");
  const cartEmpty = document.getElementById("cartEmpty");
  const summaryTotal = document.getElementById("cartTotal");
  const checkoutButton = document.getElementById("checkoutButton") as HTMLAnchorElement | null;
  if (!tableBody || !cartEmpty || !summaryTotal) return;

  const cart = getCart();
  if (!cart.length) {
    cartEmpty.style.display = "block";
    tableBody.innerHTML = "";
    summaryTotal.textContent = formatPrice(0);
    if (checkoutButton) checkoutButton.setAttribute("aria-disabled", "true");
    return;
  }

  cartEmpty.style.display = "none";
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
        <input class="quantity-select" type="number" min="1" value="${item.quantity}" onchange="window.updateQuantity(${index}, this.value)">
      </td>
      <td>${formatPrice(item.price * item.quantity)}</td>
      <td><button class="btn secondary" onclick="window.removeCartItem(${index})">Remove</button></td>
    </tr>
  `).join("");

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  summaryTotal.textContent = formatPrice(total);
  if (checkoutButton) checkoutButton.removeAttribute("aria-disabled");
}

function updateQuantity(index: number, value: string): void {
  const cart = getCart();
  const quantity = Number(value);
  if (quantity < 1 || !cart[index]) return;

  cart[index].quantity = quantity;
  saveCart(cart);
  renderCartPage();
}

function removeCartItem(index: number): void {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCartPage();
}

function renderCheckoutPage(): void {
  const summary = document.getElementById("checkoutSummary");
  const notice = document.getElementById("checkoutNotice");
  const form = document.getElementById("checkoutForm") as HTMLFormElement | null;
  if (!summary || !form || !notice) return;

  const cart = getCart();
  if (!cart.length) {
    notice.textContent = "Your cart is empty. Please add items before checking out.";
    form.style.display = "none";
    return;
  }

  form.removeEventListener("submit", submitCheckout);
  form.addEventListener("submit", submitCheckout);
  form.style.display = "grid";
  notice.textContent = "Complete the form below and send your order via WhatsApp.";

  const lines = cart.map((item, index) => `${index + 1}. ${item.name} x${item.quantity} - ${formatPrice(item.price * item.quantity)}`);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  summary.innerHTML = `
    <div class="summary-card">
      <div class="summary-item"><span>Items</span><span>${cart.length}</span></div>
      ${lines.map((line) => `<div class="summary-item"><span>${line}</span></div>`).join("")}
      <div class="summary-total"><span>Total</span><span>${formatPrice(total)}</span></div>
    </div>
  `;
}

function submitCheckout(event: SubmitEvent): void {
  event.preventDefault();

  const name = (document.getElementById("checkoutName") as HTMLInputElement | null)?.value.trim() || "";
  const phone = (document.getElementById("checkoutPhone") as HTMLInputElement | null)?.value.trim() || "";
  const location = (document.getElementById("checkoutLocation") as HTMLInputElement | null)?.value.trim() || "";
  const notes = (document.getElementById("checkoutNotes") as HTMLTextAreaElement | null)?.value.trim() || "";

  if (!name || !phone || !location) {
    alert("Name, phone, and location are required.");
    return;
  }

  const cart = getCart();
  if (!cart.length) {
    alert("Cart is empty.");
    return;
  }

  const messageLines = [
    "Cozy Thrift KE order",
    ...cart.map((item, index) => `${index + 1}. ${item.name} x${item.quantity} - ${formatPrice(item.price * item.quantity)}`),
    `Total: ${formatPrice(cart.reduce((sum, item) => sum + item.price * item.quantity, 0))}`,
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Location: ${location}`
  ];

  if (notes) messageLines.push(`Notes: ${notes}`);

  const base = "https://wa.me/254797775228?text=";
  window.open(base + encodeURIComponent(messageLines.join("\n")), "_blank");
  localStorage.removeItem("cart");
  (event.currentTarget as HTMLFormElement | null)?.reset();
  renderCheckoutPage();
}

function renderContactPage(): void {
  const form = document.getElementById("contactForm") as HTMLFormElement | null;
  if (!form || form.dataset.bound) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = (document.getElementById("contactName") as HTMLInputElement | null)?.value.trim() || "";
    const email = (document.getElementById("contactEmail") as HTMLInputElement | null)?.value.trim() || "";
    const message = (document.getElementById("contactMessage") as HTMLTextAreaElement | null)?.value.trim() || "";
    if (!name || !message || !email.includes("@")) {
      alert("Please provide your name, valid email, and message.");
      return;
    }
    alert("Thank you! Your message has been received.");
    form.reset();
  });

  form.dataset.bound = "true";
}

function initFaq(): void {
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    const button = item.querySelector(".faq-question");
    if (!button) return;

    button.addEventListener("click", () => {
      const answer = item.querySelector(".faq-answer");
      if (!answer) return;

      const isOpen = answer.classList.contains("open");
      document.querySelectorAll(".faq-answer.open").forEach((openItem) => openItem.classList.remove("open"));
      if (!isOpen) answer.classList.add("open");
    });
  });
}

function renderAdminPage(): void {
  const loginForm = document.getElementById("adminLoginForm") as HTMLFormElement | null;
  const adminForm = document.getElementById("adminForm") as HTMLFormElement | null;
  const adminProducts = document.getElementById("adminProducts");
  const loginPanel = document.getElementById("adminLoginPanel");
  const panel = document.getElementById("adminPanel");
  const signOut = document.getElementById("signOutButton");
  if (!loginForm || !adminForm || !adminProducts || !loginPanel || !panel) return;

  const loggedIn = localStorage.getItem("adminLoggedIn") === "true";
  if (!loggedIn) {
    if (!loginForm.dataset.bound) {
      loginForm.addEventListener("submit", handleAdminLogin);
      loginForm.dataset.bound = "true";
    }
    loginPanel.style.display = "block";
    panel.style.display = "none";
    return;
  }

  loginPanel.style.display = "none";
  panel.style.display = "block";

  if (signOut && !signOut.dataset.bound) {
    signOut.addEventListener("click", () => {
      localStorage.removeItem("adminLoggedIn");
      window.location.reload();
    });
    signOut.dataset.bound = "true";
  }

  if (!adminForm.dataset.bound) {
    adminForm.addEventListener("submit", handleAdminSave);
    adminForm.dataset.bound = "true";
  }

  const cancelEdit = document.getElementById("adminCancelEdit");
  if (cancelEdit && !cancelEdit.dataset.bound) {
    cancelEdit.addEventListener("click", resetAdminForm);
    cancelEdit.dataset.bound = "true";
  }

  setupAdminMediaUpload();
  renderAdminCategoryDropdown();
  renderAdminConditionDropdown();
  renderAdminSizeDropdown();
  renderAdminProducts();
}

function getAvailableCategories(): string[] {
  const products = getLocalProducts();
  const categories = [...new Set(products.map((product) => product.category))];
  return sortCategories(categories);
}

function renderAdminCategoryDropdown(selectedCategory = ""): void {
  const categorySelect = document.getElementById("adminCategory") as HTMLSelectElement | null;
  if (!categorySelect) return;

  const categories = getAvailableCategories();
  categorySelect.innerHTML = `<option value="">Select category</option>` + categories.map((category) => `
    <option value="${category}"${category === selectedCategory ? " selected" : ""}>${category}</option>
  `).join("");
}

function getAvailableConditions(): string[] {
  return ["Excellent", "Very Good", "Good", "Fair"];
}

function renderAdminConditionDropdown(selectedCondition = ""): void {
  const conditionSelect = document.getElementById("adminCondition") as HTMLSelectElement | null;
  if (!conditionSelect) return;

  const conditions = getAvailableConditions();
  conditionSelect.innerHTML = `<option value="">Select condition</option>` + conditions.map((condition) => `
    <option value="${condition}"${condition === selectedCondition ? " selected" : ""}>${condition}</option>
  `).join("");
}

function getAvailableSizes(): string[] {
  return ["Large", "Medium", "Small"];
}

function renderAdminSizeDropdown(selectedSize = ""): void {
  const sizeSelect = document.getElementById("adminSize") as HTMLSelectElement | null;
  if (!sizeSelect) return;

  const sizes = getAvailableSizes();
  sizeSelect.innerHTML = `<option value="">Select size</option>` + sizes.map((size) => `
    <option value="${size}"${size === selectedSize ? " selected" : ""}>${size}</option>
  `).join("");
}

function setupAdminMediaUpload(): void {
  const dropzone = document.getElementById("adminDropzone");
  const fileInput = document.getElementById("adminMediaFile") as HTMLInputElement | null;
  const dropzoneText = document.getElementById("adminDropzoneText");
  if (!dropzone || !fileInput || !dropzoneText || dropzone.dataset.bound) return;

  const updateText = (files?: FileList | null): void => {
    if (!files?.length) {
      dropzoneText.textContent = "No file selected";
      return;
    }

    dropzoneText.textContent = files.length === 1 ? `Selected: ${files[0].name}` : `${files.length} pictures selected`;
  };

  dropzone.addEventListener("click", () => fileInput.click());
  dropzone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropzone.classList.add("dragover");
  });
  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
  dropzone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropzone.classList.remove("dragover");
    const files = event.dataTransfer?.files;
    if (files?.length) {
      fileInput.files = files;
      updateText(files);
    }
  });
  fileInput.addEventListener("change", () => {
    updateText(fileInput.files);
  });

  dropzone.dataset.bound = "true";
}

function handleAdminLogin(event: SubmitEvent): void {
  event.preventDefault();

  const username = (document.getElementById("adminUsername") as HTMLInputElement | null)?.value.trim() || "";
  const password = (document.getElementById("adminPassword") as HTMLInputElement | null)?.value.trim() || "";

  if (username === "lixxyshiko" && password === "thrift2026") {
    localStorage.setItem("adminLoggedIn", "true");
    window.location.reload();
  } else {
    alert("Invalid credentials.");
  }
}

async function handleAdminSave(event: SubmitEvent): Promise<void> {
  event.preventDefault();

  const name = (document.getElementById("adminName") as HTMLInputElement | null)?.value.trim() || "";
  const price = Number((document.getElementById("adminPrice") as HTMLInputElement | null)?.value.trim() || "");
  const category = getSelectedCategory();
  const size = (document.getElementById("adminSize") as HTMLSelectElement | null)?.value.trim() || "";
  const condition = (document.getElementById("adminCondition") as HTMLSelectElement | null)?.value.trim() || "";
  const description = (document.getElementById("adminDescription") as HTMLTextAreaElement | null)?.value.trim() || "";
  const mediaInput = document.getElementById("adminMediaFile") as HTMLInputElement | null;
  const imageUrl = (document.getElementById("adminImage") as HTMLInputElement | null)?.value.trim() || "";
  const galleryUrls = parseImageUrls((document.getElementById("adminImageGallery") as HTMLTextAreaElement | null)?.value || "");

  let images: string[] = [];
  if (mediaInput?.files?.length) {
    images = await Promise.all(Array.from(mediaInput.files).map((file) => toBase64(file)));
  }
  if (imageUrl) {
    images.unshift(imageUrl);
  }
  if (galleryUrls.length) {
    images.push(...galleryUrls);
  }
  images = images.filter((image, index, list) => Boolean(image) && list.indexOf(image) === index);

  if (!name || !price || !category || !size || !condition || !description || !images.length) {
    alert("Please complete every field and add a media file or URL.");
    return;
  }

  const products = getLocalProducts();
  const editingId = (document.getElementById("adminProductId") as HTMLInputElement | null)?.value || "";
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
      existing.slug = name.toLowerCase().replace(/\s+/g, "-");
      existing.images = images;
    }
  } else {
    const id = `p${Date.now()}`;
    products.push({ id, name, price, category, size, condition, slug: name.toLowerCase().replace(/\s+/g, "-"), description, images, tags: [] });
  }

  saveLocalProducts(products);
  resetAdminForm();
  renderAdminProducts();
}

function resetAdminForm(): void {
  const adminForm = document.getElementById("adminForm") as HTMLFormElement | null;
  const adminProductId = document.getElementById("adminProductId") as HTMLInputElement | null;
  const adminCustomCategory = document.getElementById("adminCustomCategory") as HTMLInputElement | null;
  const adminDropzoneText = document.getElementById("adminDropzoneText");
  const adminSubmitButton = document.getElementById("adminSubmitButton");
  const adminCancelEdit = document.getElementById("adminCancelEdit");

  adminForm?.reset();
  if (adminProductId) adminProductId.value = "";
  if (adminCustomCategory) adminCustomCategory.value = "";
  if (adminDropzoneText) adminDropzoneText.textContent = "No file selected";
  if (adminSubmitButton) adminSubmitButton.textContent = "Add Product";
  if (adminCancelEdit) adminCancelEdit.style.display = "none";

  renderAdminCategoryDropdown();
  renderAdminConditionDropdown();
  renderAdminSizeDropdown();
}

function renderAdminProducts(): void {
  const adminProducts = document.getElementById("adminProducts");
  if (!adminProducts) return;

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
          <button type="button" class="btn secondary" onclick="window.editProduct('${product.id}')">Edit</button>
          <button type="button" class="btn secondary" onclick="window.deleteProduct('${product.id}')">Delete</button>
        </div>
      </div>
    </div>
  `).join("");
}

function editProduct(productId: string): void {
  const products = getLocalProducts();
  const product = products.find((item) => item.id === productId);
  if (!product) return;

  (document.getElementById("adminProductId") as HTMLInputElement | null)!.value = product.id;
  (document.getElementById("adminName") as HTMLInputElement | null)!.value = product.name;
  (document.getElementById("adminPrice") as HTMLInputElement | null)!.value = String(product.price);
  renderAdminCategoryDropdown(product.category);
  renderAdminSizeDropdown(product.size);
  renderAdminConditionDropdown(product.condition);
  (document.getElementById("adminDescription") as HTMLTextAreaElement | null)!.value = product.description;
  (document.getElementById("adminImage") as HTMLInputElement | null)!.value = product.images[0] || "";
  (document.getElementById("adminImageGallery") as HTMLTextAreaElement | null)!.value = product.images.slice(1).join("\n");
  const customCategoryInput = document.getElementById("adminCustomCategory") as HTMLInputElement | null;
  if (customCategoryInput) customCategoryInput.value = "";

  const adminDropzoneText = document.getElementById("adminDropzoneText");
  if (adminDropzoneText) {
    adminDropzoneText.textContent = product.images.length ? `${product.images.length} saved picture(s)` : "No file selected";
  }

  const adminSubmitButton = document.getElementById("adminSubmitButton");
  const adminCancelEdit = document.getElementById("adminCancelEdit");
  if (adminSubmitButton) adminSubmitButton.textContent = "Save Changes";
  if (adminCancelEdit) adminCancelEdit.style.display = "inline-flex";
}

function deleteProduct(productId: string): void {
  if (!confirm("Delete this product?")) return;

  const products = getLocalProducts().filter((product) => product.id !== productId);
  saveLocalProducts(products);
  renderAdminProducts();
}

function showWhatsAppButton(): void {
  const whatsApp = document.getElementById("floatingWhatsApp") as HTMLAnchorElement | null;
  if (!whatsApp) return;

  whatsApp.href = "https://wa.me/254797775228?text=" + encodeURIComponent("Hello Cozy Thrift KE, I would like to place an order.");
}

function initPage(): void {
  initProductStore();
  renderHeroGallery();
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

window.addToCartFromCard = addToCartFromCard;
window.selectProductImage = selectProductImage;
window.orderNow = orderNow;
window.updateQuantity = updateQuantity;
window.removeCartItem = removeCartItem;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.handleAdminLogin = handleAdminLogin;

window.addEventListener("DOMContentLoaded", initPage);
