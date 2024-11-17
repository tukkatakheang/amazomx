class ProductForm {
    constructor() {
        this.products = [];
        this.currentEditId = null;
        this.initializeElements();
        this.attachEventListeners();
        this.isFormVisible = false;
        this.loadProducts();
    }

    initializeElements() {
        this.form = document.getElementById('productForm');
        this.showFormBtn = document.getElementById('showProductForm');
        this.generateCodeBtn = document.getElementById('generateCode');
        this.addBrandBtn = document.getElementById('addBrand');
        this.addCategoryBtn = document.getElementById('addCategory');
        this.addUnitBtn = document.getElementById('addUnit');
        this.cancelBtn = document.querySelector('.btn-cancel');
        this.productTable = document.getElementById('productTable');
        
        this.form.style.display = 'none';
        this.initializeQuantityButtons();
    }

    attachEventListeners() {
        this.showFormBtn.addEventListener('click', () => this.toggleForm());
        this.cancelBtn.addEventListener('click', () => this.hideForm());
        this.generateCodeBtn.addEventListener('click', () => this.generateProductCode());
        this.addBrandBtn.addEventListener('click', () => this.addNewOption('brand', 'ម៉ាក'));
        this.addCategoryBtn.addEventListener('click', () => this.addNewOption('category', 'ប្រភេទ'));
        this.addUnitBtn.addEventListener('click', () => this.addNewOption('unit', 'ឯកតា'));
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    initializeQuantityButtons() {
        // Quantity and stock buttons
        document.querySelectorAll('.btn-quantity').forEach(button => {
            button.addEventListener('click', (e) => {
                const input = e.target.closest('.input-with-buttons').querySelector('input');
                const action = e.target.dataset.action;
                const currentValue = parseInt(input.value) || 0;
                
                input.value = action === 'increase' 
                    ? currentValue + 1 
                    : Math.max(0, currentValue - 1);
            });
        });

        // Price buttons
        document.querySelectorAll('.btn-price').forEach(button => {
            button.addEventListener('click', (e) => {
                const input = e.target.closest('.input-with-buttons').querySelector('input');
                const action = e.target.dataset.action;
                const currentValue = parseFloat(input.value) || 0;
                
                input.value = action === 'increase'
                    ? (currentValue + 0.5).toFixed(2)
                    : Math.max(0, currentValue - 0.5).toFixed(2);
            });
        });

        // Allow manual number input
        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^\d]/g, '');
            });
            
            input.addEventListener('blur', (e) => {
                e.target.value = parseInt(e.target.value) || 0;
            });
        });

        document.querySelectorAll('.price-input').forEach(input => {
            input.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^\d.]/g, '');
            });
            
            input.addEventListener('blur', (e) => {
                const value = parseFloat(e.target.value) || 0;
                e.target.value = value.toFixed(2);
            });
        });
    }

    toggleForm() {
        this.isFormVisible ? this.hideForm() : this.showForm();
    }

    showForm() {
        this.form.style.display = 'block';
        this.form.classList.add('sliding-down');
        this.showFormBtn.innerHTML = `
            <span class="icon">−</span>
            លាក់ទម្រង់បញ្ចូល
        `;
        this.isFormVisible = true;
    }

    hideForm() {
        this.form.classList.add('sliding-up');
        setTimeout(() => {
            this.form.style.display = 'none';
            this.form.classList.remove('sliding-up');
        }, 280);
        
        this.showFormBtn.innerHTML = `
            <span class="icon">+</span>
            បន្ថែមទំនិញថ្មី
        `;
        
        this.isFormVisible = false;
        this.resetForm();
    }

    generateProductCode() {
        const timestamp = new Date().getTime().toString().slice(-6);
        const random = Math.random().toString(36).substring(2, 5).toUpperCase();
        document.getElementById('productCode').value = `PRD${timestamp}${random}`;
    }

    addNewOption(selectId, optionType) {
        const newValue = prompt(`បញ្ចូល${optionType}ថ្មី:`);
        if (newValue?.trim()) {
            const select = document.getElementById(selectId);
            const option = new Option(newValue.trim(), newValue.trim());
            select.add(option);
            select.value = newValue.trim();
        }
    }

    loadProducts() {
        const savedProducts = localStorage.getItem('products');
        if (savedProducts) {
            try {
                this.products = JSON.parse(savedProducts);
                this.renderProductTable();
            } catch (error) {
                console.error('Error loading products:', error);
                this.products = [];
            }
        }
    }

    saveProducts() {
        try {
            localStorage.setItem('products', JSON.stringify(this.products));
        } catch (error) {
            console.error('Error saving products:', error);
            alert('មានបញ្ហាក្នុងការរក្សាទុកទិន្នន័យ');
        }
    }

    renderProductTable() {
        const tbody = this.productTable.querySelector('tbody');
        tbody.innerHTML = '';

        this.products.forEach((product, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${this.escapeHtml(product.productCode)}</td>
                <td>${this.escapeHtml(product.productName)}</td>
                <td>${this.escapeHtml(product.brand || '-')}</td>
                <td>${this.escapeHtml(product.category || '-')}</td>
                <td>${product.quantity} ${this.escapeHtml(product.unit)}</td>
                <td>$${parseFloat(product.costPrice || 0).toFixed(2)}</td>
                <td>$${parseFloat(product.wholesalePrice || 0).toFixed(2)}</td>
                <td>$${parseFloat(product.retailPrice || 0).toFixed(2)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-edit" data-id="${product.productCode}">កែប្រែ</button>
                        <button class="btn-delete" data-id="${product.productCode}">លុប</button>
                    </div>
                </td>
            `;

            const editBtn = tr.querySelector('.btn-edit');
            const deleteBtn = tr.querySelector('.btn-delete');

            editBtn.addEventListener('click', () => this.editProduct(product.productCode));
            deleteBtn.addEventListener('click', () => this.deleteProduct(product.productCode));

            tbody.appendChild(tr);
        });
    }

    escapeHtml(unsafe) {
        return unsafe
            ? unsafe
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;")
            : '';
    }

    getFormData() {
        const formData = new FormData(this.form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            data[key] = value.trim();
        }

        // Convert values to numbers
        ['quantity', 'stockMin'].forEach(field => {
            data[field] = parseInt(data[field]) || 0;
        });

        ['costPrice', 'wholesalePrice', 'retailPrice'].forEach(field => {
            data[field] = parseFloat(data[field]) || 0;
        });

        return data;
    }

    handleSubmit(event) {
        event.preventDefault();
        
        if (!this.validateForm()) return;

        const productData = this.getFormData();

        if (this.currentEditId) {
            const index = this.products.findIndex(p => p.productCode === this.currentEditId);
            if (index !== -1) {
                this.products[index] = { ...this.products[index], ...productData };
            }
            this.currentEditId = null;
        } else {
            this.products.push(productData);
        }
        
        this.saveProducts();
        this.renderProductTable();
        this.resetForm();
        this.hideForm();
        
        alert('រក្សាទុកបានជោគជ័យ');
    }

    editProduct(productCode) {
        const product = this.products.find(p => p.productCode === productCode);
        if (!product) return;

        this.currentEditId = productCode;
        
        Object.keys(product).forEach(key => {
            const input = this.form.elements[key];
            if (input) {
                input.value = product[key];
            }
        });

        this.showForm();
    }

    deleteProduct(productCode) {
        if (confirm('តើអ្នកពិតជាចង់លុបទំនិញនេះមែនទេ?')) {
            this.products = this.products.filter(p => p.productCode !== productCode);
            this.saveProducts();
            this.renderProductTable();
            alert('លុបបានជោគជ័យ');
        }
    }

    resetForm() {
        this.form.reset();
        this.currentEditId = null;
        
        // Reset default values
        document.querySelectorAll('.quantity-input').forEach(input => {
            input.value = '0';
        });
        
        document.querySelectorAll('.price-input').forEach(input => {
            input.value = '0.00';
        });
    }

    validateForm() {
        const requiredFields = {
            productCode: 'លេខកូដទំនិញ',
            productName: 'ឈ្មោះទំនិញ'
        };

        for (const [fieldId, fieldName] of Object.entries(requiredFields)) {
            const field = document.getElementById(fieldId);
            if (!field.value.trim()) {
                alert(`សូមបញ្ចូល${fieldName}`);
                field.focus();
                return false;
            }
        }

        return true;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new ProductForm();
});