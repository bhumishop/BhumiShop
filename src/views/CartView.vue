<template>
  <div class="cart-page container">
    <h1 class="page-title">Carrinho</h1>

    <div v-if="cartStore.items.length > 0" class="cart-layout">
      <div class="cart-items">
        <div v-for="item in cartStore.items" :key="item.id" class="cart-item">
          <div class="item-image">
            <div class="placeholder-image">{{ item.category || 'produto' }}</div>
          </div>
          
          <div class="item-info">
            <h3 class="item-name">{{ item.name }}</h3>
            <p v-if="item.size" class="item-size">Tamanho: {{ item.size }}</p>
            <p class="item-price">R$ {{ item.price.toFixed(2) }}</p>
          </div>

          <div class="item-quantity">
            <button @click="updateQty(item.id, item.quantity - 1)">-</button>
            <span>{{ item.quantity }}</span>
            <button @click="updateQty(item.id, item.quantity + 1)">+</button>
          </div>

          <div class="item-total">
            R$ {{ (item.price * item.quantity).toFixed(2) }}
          </div>

          <button class="remove-btn" @click="removeItem(item.id)">×</button>
        </div>
      </div>

      <div class="cart-summary">
        <h2>Resumo do Pedido</h2>
        
        <div class="summary-row">
          <span>Subtotal ({{ cartStore.totalItems }} itens)</span>
          <span>R$ {{ cartStore.totalPrice.toFixed(2) }}</span>
        </div>
        
        <div class="summary-row">
          <span>Frete</span>
          <span class="shipping-note">A calcular</span>
        </div>

        <div class="client-data">
          <h3>Dados do Cliente</h3>
          <input v-model="clientData.name" placeholder="Nome completo" class="input-field">
          <input v-model="clientData.email" type="email" placeholder="Email" class="input-field">
          <input v-model="clientData.phone" placeholder="WhatsApp" class="input-field">
          <input v-model="clientData.address" placeholder="Endereço de entrega" class="input-field">
        </div>

        <div class="payment-methods">
          <h3>Forma de Pagamento</h3>
          <div class="payment-options">
            <label :class="{ active: cartStore.paymentMethod === 'pix' }">
              <input type="radio" v-model="cartStore.paymentMethod" value="pix">
              <span>📱 PIX</span>
            </label>
            <label :class="{ active: cartStore.paymentMethod === 'mercadopago' }">
              <input type="radio" v-model="cartStore.paymentMethod" value="mercadopago">
              <span>💰 Mercado Pago</span>
            </label>
            <label :class="{ active: cartStore.paymentMethod === 'paypal' }">
              <input type="radio" v-model="cartStore.paymentMethod" value="paypal">
              <span>🅿️ PayPal</span>
            </label>
            <label :class="{ active: cartStore.paymentMethod === 'whatsapp' }">
              <input type="radio" v-model="cartStore.paymentMethod" value="whatsapp">
              <span>💬 WhatsApp</span>
            </label>
          </div>
        </div>

        <div class="summary-total">
          <span>Total</span>
          <span>R$ {{ cartStore.totalPrice.toFixed(2) }}</span>
        </div>

        <button class="btn-primary checkout-btn" @click="checkout">
          Finalizar Compra
        </button>
      </div>
    </div>

    <div v-else class="empty-cart">
      <p>Seu carrinho está vazio.</p>
      <router-link to="/produtos" class="btn-primary">
        Ver Produtos
      </router-link>
    </div>

    <div v-if="showCheckoutModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal checkout-modal">
        <button class="close-btn" @click="closeModal">×</button>
        
        <div v-if="checkoutStep === 'form'" class="checkout-form">
          <h2>Confirmar Pedido</h2>
          <div class="order-summary">
            <p><strong>Itens:</strong> {{ cartStore.totalItems }}</p>
            <p><strong>Total:</strong> R$ {{ cartStore.totalPrice.toFixed(2) }}</p>
            <p><strong>Forma de Pagamento:</strong> {{ getPaymentMethodName(cartStore.paymentMethod) }}</p>
          </div>
          
          <button class="btn-primary" @click="processPayment">
            Confirmar Pedido
          </button>
        </div>

        <div v-else-if="checkoutStep === 'pix'" class="payment-pix">
          <h2>💳 Pagamento PIX</h2>
          <p class="total-value">Total: R$ {{ cartStore.totalPrice.toFixed(2) }}</p>
          
          <div class="pix-qrcode" v-if="pixQRCode">
            <img :src="pixQRCode" alt="QR Code PIX" class="qrcode-img">
          </div>
          
          <div class="pix-key-section">
            <label>Ou copie a chave PIX:</label>
            <div class="key-copy">
              <input readonly :value="shopConfig.pixKey" class="key-input">
              <button @click="copyPixKey" class="btn-secondary">📋 Copiar</button>
            </div>
          </div>

          <div class="pix-instructions">
            <p>1. Escaneie o QR Code ou copie a chave PIX</p>
            <p>2. Faça o pagamento de <strong>R$ {{ cartStore.totalPrice.toFixed(2) }}</strong></p>
            <p>3. Clique em "Já Paguei" após confirmar o pagamento</p>
          </div>

          <div class="pix-actions">
            <button class="btn-primary" @click="confirmPixPayment">
              ✅ Já Paguei
            </button>
            <button class="btn-secondary" @click="sendPixReceipt">
              📱 Enviar Comprovante
            </button>
          </div>
        </div>

        <div v-else-if="checkoutStep === 'mercadopago'" class="payment-mercadopago">
          <h2>💰 Mercado Pago</h2>
          <p class="total-value">Total: R$ {{ cartStore.totalPrice.toFixed(2) }}</p>
          <p>Clique no botão abaixo para pagar via Mercado Pago:</p>
          <button class="btn-primary mercadopago-btn" @click="payWithMercadoPago">
            Pagar com Mercado Pago
          </button>
        </div>

        <div v-else-if="checkoutStep === 'paypal'" class="payment-paypal">
          <h2>🅿️ PayPal</h2>
          <p class="total-value">Total: R$ {{ cartStore.totalPrice.toFixed(2) }}</p>
          <button class="btn-primary paypal-btn" @click="payWithPayPal">
            Pagar com PayPal
          </button>
        </div>

        <div v-else-if="checkoutStep === 'whatsapp'" class="payment-whatsapp">
          <h2>💬 WhatsApp</h2>
          <p>Seu pedido será enviado via WhatsApp:</p>
          <a :href="whatsappOrderLink" class="btn-primary whatsapp-btn">
            📱 Enviar Pedido
          </a>
        </div>

        <div v-else-if="checkoutStep === 'success'" class="success-message">
          <div class="success-icon">✅</div>
          <h2>Pedido Enviado!</h2>
          <p class="order-number">Número do pedido: #{{ orderNumber }}</p>
          <p>Obrigado pela sua compra! Em breve entraremos em contato.</p>
          <div class="success-details">
            <p><strong>Total:</strong> R$ {{ cartStore.totalPrice.toFixed(2) }}</p>
            <p><strong>Pagamento:</strong> {{ getPaymentMethodName(cartStore.paymentMethod) }}</p>
          </div>
          <router-link to="/" class="btn-secondary">
            Continuar Comprando
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'
import { useOrderStore } from '../stores/orders'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()
const orderStore = useOrderStore()

const showCheckoutModal = ref(false)
const checkoutStep = ref('form')
const orderNumber = ref('')
const pixQRCode = ref('')
const savingOrder = ref(false)

const CONFIG_KEY = 'bhumi-shop-config'
const defaultConfig = {
  pixKey: 'sua-chave-pix@email.com',
  whatsapp: '5511999999999',
  paypalEmail: '',
  mercadopagoToken: ''
}

const shopConfig = ref({ ...defaultConfig })

const clientData = ref({
  name: '',
  email: '',
  phone: '',
  address: ''
})

onMounted(() => {
  loadConfig()
  window.addEventListener('storage', loadConfig)
})

onUnmounted(() => {
  window.removeEventListener('storage', loadConfig)
})

function loadConfig() {
  try {
    const saved = localStorage.getItem(CONFIG_KEY)
    if (saved) {
      shopConfig.value = { ...defaultConfig, ...JSON.parse(saved) }
    }
  } catch (e) {
    console.error('Erro ao carregar config:', e)
  }
}

function updateQty(productId, quantity) {
  cartStore.updateQuantity(productId, quantity)
}

function removeItem(productId) {
  cartStore.removeItem(productId)
}

function closeModal() {
  showCheckoutModal.value = false
  checkoutStep.value = 'form'
  if (checkoutStep.value === 'success') {
    cartStore.clearCart()
  }
}

function getPaymentMethodName(method) {
  const names = {
    pix: 'PIX',
    mercadopago: 'Mercado Pago',
    paypal: 'PayPal',
    whatsapp: 'WhatsApp'
  }
  return names[method] || method
}

function checkout() {
  if (!clientData.value.name || !clientData.value.phone) {
    alert('Por favor, preencha nome e WhatsApp.')
    return
  }
  
  if (!authStore.isLoggedIn) {
    alert('Faça login ou cadastre-se para finalizar a compra.')
    router.push('/login')
    return
  }
  
  showCheckoutModal.value = true
  checkoutStep.value = 'form'
}

async function processPayment() {
  savingOrder.value = true
  
  try {
    const orderData = {
      userId: authStore.user.id,
      total: cartStore.totalPrice,
      paymentMethod: cartStore.paymentMethod,
      items: cartStore.items,
      customerName: clientData.value.name,
      customerEmail: clientData.value.email,
      customerPhone: clientData.value.phone,
      shippingAddress: clientData.value.address
    }
    
    const order = await orderStore.createOrder(orderData)
    orderNumber.value = order.order_number
    
    if (cartStore.paymentMethod === 'pix') {
      generatePixQRCode()
    }
    checkoutStep.value = cartStore.paymentMethod
  } catch (error) {
    console.error('Erro ao criar pedido:', error)
    alert('Erro ao processar pedido. Tente novamente.')
  } finally {
    savingOrder.value = false
  }
}

function generatePixQRCode() {
  const total = cartStore.totalPrice.toFixed(2).replace('.', '')
  const pixValue = shopConfig.value.pixKey
  const merchantName = 'BHUMI SHOP'
  const merchantCity = 'SAO PAULO'
  
  const payload = generatePixPayload(pixValue, total, merchantName, merchantCity)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(payload)}`
  pixQRCode.value = qrCodeUrl
}

function generatePixPayload(pixKey, amount, merchantName, merchantCity) {
  const format = '000201'
  const gui = '0014BR.GOV.BCB.PIX01'
  const key = pixKey.length > 99 ? pixKey.substring(0, 99) : pixKey
  const keyLength = String(key.length).padStart(2, '0')
  const merchantAccountInfo = `${gui}${keyLength}${key}52040000`
  const payloadFormat = '6304'
  
  const payload = `${format}${merchantAccountInfo}01${amount.toString().padStart(10, '0')}0266${merchantName}26${merchantCity}${payloadFormat}`
  
  const crc = calculateCRC16(payload)
  return payload + crc
}

function calculateCRC16(data) {
  let crc = 0xFFFF
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i)
    for (let j = 0; j < 8; j++) {
      if (crc & 0x0001) {
        crc = (crc >> 1) ^ 0xA001
      } else {
        crc = crc >> 1
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

function copyPixKey() {
  navigator.clipboard.writeText(shopConfig.value.pixKey)
  alert('Chave PIX copiada!')
}

function confirmPixPayment() {
  checkoutStep.value = 'success'
  cartStore.clearCart()
}

function sendPixReceipt() {
  const phone = shopConfig.value.whatsapp
  const msg = `Olá, realizei o pagamento PIX de R$ ${cartStore.totalPrice.toFixed(2)}. Segue comprovante.`
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank')
}

function payWithMercadoPago() {
  alert('Em breve: integração com Mercado Pago')
  checkoutStep.value = 'success'
  cartStore.clearCart()
}

function payWithPayPal() {
  alert('Em breve: integração com PayPal')
  checkoutStep.value = 'success'
  cartStore.clearCart()
}

function generateOrderNumber() {
  orderNumber.value = Date.now().toString().slice(-8)
}

const whatsappOrderLink = computed(() => {
  const phone = shopConfig.value.whatsapp
  let msg = `🛒 *Novo Pedido*\n\n`
  msg += `*Cliente:* ${clientData.value.name}\n`
  msg += `*WhatsApp:* ${clientData.value.phone}\n`
  msg += `*Endereço:* ${clientData.value.address}\n\n`
  msg += `*Itens:*\n`
  cartStore.items.forEach(item => {
    msg += `- ${item.name} (${item.quantity}x) - R$ ${(item.price * item.quantity).toFixed(2)}\n`
  })
  msg += `\n*Total:* R$ ${cartStore.totalPrice.toFixed(2)}\n`
  msg += `*Pagamento:* ${getPaymentMethodName(cartStore.paymentMethod)}`
  
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
})
</script>

<style scoped>
.cart-page {
  padding: 3rem 1rem;
  min-height: 60vh;
}

.page-title {
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 3rem;
}

.cart-layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 3rem;
  align-items: start;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-item {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  display: grid;
  grid-template-columns: 80px 1fr auto auto auto;
  gap: 1rem;
  align-items: center;
}

.item-image {
  width: 80px;
  height: 80px;
  background: var(--bg-secondary);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-image {
  font-size: 0.7rem;
  color: var(--text-muted);
  text-transform: uppercase;
}

.item-name {
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.item-size {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.item-price {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.item-quantity button {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.item-quantity button:hover {
  border-color: var(--accent-green);
}

.item-quantity span {
  min-width: 30px;
  text-align: center;
}

.item-total {
  font-weight: 700;
  color: var(--accent-green);
  min-width: 80px;
  text-align: right;
}

.remove-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.3s ease;
}

.remove-btn:hover {
  color: #ff4444;
}

.cart-summary {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 2rem;
  position: sticky;
  top: 100px;
}

.cart-summary h2 {
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-color);
}

.shipping-note {
  color: var(--text-muted);
  font-style: italic;
}

.client-data {
  margin: 1.5rem 0;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.client-data h3 {
  font-size: 0.9rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 1rem;
}

.input-field {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: 4px;
}

.input-field:focus {
  border-color: var(--accent-green);
  outline: none;
}

.payment-methods {
  margin: 1.5rem 0;
}

.payment-methods h3 {
  font-size: 0.9rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 1rem;
}

.payment-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.payment-options label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.3s ease;
}

.payment-options label:hover {
  border-color: var(--accent-purple);
}

.payment-options label.active {
  border-color: var(--accent-green);
  background: rgba(0, 255, 65, 0.1);
}

.payment-options input {
  display: none;
}

.payment-options span {
  font-weight: 600;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 1.5rem 0;
}

.summary-total span:last-child {
  color: var(--accent-green);
}

.checkout-btn {
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
}

.empty-cart {
  text-align: center;
  padding: 4rem;
}

.empty-cart p {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1.5rem;
  cursor: pointer;
}

.checkout-modal h2 {
  margin-bottom: 1.5rem;
  color: var(--accent-green);
}

.order-summary {
  background: var(--bg-secondary);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.order-summary p {
  margin: 0.5rem 0;
}

.payment-instructions {
  text-align: center;
}

.total-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent-green);
  margin: 1rem 0;
}

.pix-key {
  margin: 1.5rem 0;
}

.pix-key label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}

.key-input {
  width: 100%;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.copy-note {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 1rem 0;
}

.instruction {
  color: var(--text-secondary);
  margin: 1rem 0;
}

.whatsapp-btn, .mercadopago-btn, .paypal-btn {
  display: block;
  width: 100%;
  padding: 1rem;
  margin-top: 1rem;
  font-size: 1rem;
}

.success-message {
  text-align: center;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.order-number {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--accent-green);
  margin-bottom: 1rem;
}

.success-details {
  background: var(--bg-secondary);
  padding: 1rem;
  border-radius: 8px;
  margin: 1.5rem 0;
  text-align: left;
}

.success-details p {
  margin: 0.5rem 0;
}

.pix-qrcode {
  display: flex;
  justify-content: center;
  margin: 1.5rem 0;
}

.qrcode-img {
  width: 200px;
  height: 200px;
  border-radius: 8px;
  border: 2px solid var(--accent-green);
}

.pix-key-section {
  margin: 1.5rem 0;
}

.pix-key-section label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}

.key-copy {
  display: flex;
  gap: 0.5rem;
}

.key-copy .key-input {
  flex: 1;
  margin-bottom: 0;
}

.pix-instructions {
  background: var(--bg-secondary);
  padding: 1rem;
  border-radius: 8px;
  margin: 1.5rem 0;
  text-align: left;
}

.pix-instructions p {
  margin: 0.5rem 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.pix-instructions strong {
  color: var(--accent-green);
}

.pix-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.pix-actions .btn-primary,
.pix-actions .btn-secondary {
  width: 100%;
}

.payment-pix,
.payment-mercadopago,
.payment-paypal,
.payment-whatsapp {
  text-align: center;
}

.payment-pix h2,
.payment-mercadopago h2,
.payment-paypal h2,
.payment-whatsapp h2 {
  color: var(--accent-green);
  margin-bottom: 1rem;
}

.payment-pix p,
.payment-mercadopago p,
.payment-paypal p,
.payment-whatsapp p {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

@media (max-width: 900px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }
  
  .cart-summary {
    position: static;
  }

  .cart-item {
    grid-template-columns: 60px 1fr auto;
  }
  
  .item-quantity,
  .item-total {
    grid-column: 2;
  }
  
  .remove-btn {
    grid-column: 3;
    grid-row: 1 / 3;
  }
}

.success-message h2 {
  color: var(--accent-green);
  margin-bottom: 1rem;
}

.success-message p {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

@media (max-width: 900px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }
  
  .cart-summary {
    position: static;
  }

  .cart-item {
    grid-template-columns: 60px 1fr auto;
  }
  
  .item-quantity,
  .item-total {
    grid-column: 2;
  }
  
  .remove-btn {
    grid-column: 3;
    grid-row: 1 / 3;
  }
}
</style>
