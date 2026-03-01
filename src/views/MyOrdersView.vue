<template>
  <div class="orders-page container">
    <h1 class="page-title">Minhas Compras</h1>

    <div v-if="loading" class="loading">
      <p>Carregando pedidos...</p>
    </div>

    <div v-else-if="!authStore.isLoggedIn" class="not-logged">
      <p>Faça login para ver seus pedidos</p>
      <router-link to="/login" class="btn-primary">
        Fazer Login
      </router-link>
    </div>

    <div v-else-if="orders.length === 0" class="no-orders">
      <p>Você ainda não tem nenhum pedido</p>
      <router-link to="/produtos" class="btn-primary">
        Ver Produtos
      </router-link>
    </div>

    <div v-else class="orders-list">
      <div v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-header">
          <div class="order-info">
            <span class="order-number">Pedido #{{ order.order_number }}</span>
            <span class="order-date">{{ formatDate(order.created_at) }}</span>
          </div>
          <div :class="['order-status', order.status]">
            {{ getStatusLabel(order.status) }}
          </div>
        </div>

        <div class="order-items">
          <div v-for="item in order.order_items" :key="item.id" class="order-item">
            <div class="item-info">
              <span class="item-name">{{ item.product_name }}</span>
              <span class="item-qty">x{{ item.quantity }}</span>
              <span v-if="item.size" class="item-size">Tamanho: {{ item.size }}</span>
            </div>
            <span class="item-price">R$ {{ (item.product_price * item.quantity).toFixed(2) }}</span>
          </div>
        </div>

        <div class="order-footer">
          <div class="order-total">
            <span>Total:</span>
            <span class="total-value">R$ {{ parseFloat(order.total).toFixed(2) }}</span>
          </div>
          <div class="order-payment">
            <span>{{ getPaymentLabel(order.payment_method) }}</span>
            <span :class="['payment-status', order.payment_status]">
              {{ getPaymentStatusLabel(order.payment_status) }}
            </span>
          </div>
        </div>

        <div class="order-actions">
          <button @click="viewOrderDetails(order)" class="btn-secondary">
            Ver Detalhes
          </button>
        </div>

        <div v-if="expandedOrder === order.id" class="order-details">
          <div class="details-section">
            <h4>Dados do Cliente</h4>
            <p><strong>Nome:</strong> {{ order.customer_name }}</p>
            <p><strong>Email:</strong> {{ order.customer_email }}</p>
            <p><strong>Telefone:</strong> {{ order.customer_phone }}</p>
            <p v-if="order.shipping_address"><strong>Endereço:</strong> {{ order.shipping_address }}</p>
          </div>

          <div class="details-section">
            <h4>Histórico de Status</h4>
            <div class="status-timeline">
              <div v-for="status in order.order_status_history" :key="status.id" class="status-item">
                <div class="status-dot" :class="status.status"></div>
                <div class="status-content">
                  <span class="status-label">{{ getStatusLabel(status.status) }}</span>
                  <span class="status-date">{{ formatDate(status.created_at) }}</span>
                  <p v-if="status.description" class="status-desc">{{ status.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showDetailsModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <button class="close-btn" @click="closeModal">×</button>
        
        <div v-if="selectedOrder" class="modal-content">
          <h2>Pedido #{{ selectedOrder.order_number }}</h2>
          
          <div :class="['status-badge', selectedOrder.status]">
            {{ getStatusLabel(selectedOrder.status) }}
          </div>

          <div class="modal-section">
            <h4>Itens</h4>
            <div v-for="item in selectedOrder.order_items" :key="item.id" class="modal-item">
              <span>{{ item.product_name }} (x{{ item.quantity }})</span>
              <span>R$ {{ (item.product_price * item.quantity).toFixed(2) }}</span>
            </div>
            <div class="modal-total">
              <strong>Total:</strong>
              <strong>R$ {{ parseFloat(selectedOrder.total).toFixed(2) }}</strong>
            </div>
          </div>

          <div class="modal-section">
            <h4>Pagamento</h4>
            <p><strong>Método:</strong> {{ getPaymentLabel(selectedOrder.payment_method) }}</p>
            <p><strong>Status:</strong> {{ getPaymentStatusLabel(selectedOrder.payment_status) }}</p>
          </div>

          <div class="modal-section">
            <h4>Contato</h4>
            <p>{{ selectedOrder.customer_name }}</p>
            <p>{{ selectedOrder.customer_email }}</p>
            <p>{{ selectedOrder.customer_phone }}</p>
          </div>

          <div v-if="selectedOrder.shipping_address" class="modal-section">
            <h4>Entrega</h4>
            <p>{{ selectedOrder.shipping_address }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useOrderStore } from '../stores/orders'

const authStore = useAuthStore()
const orderStore = useOrderStore()

const loading = ref(true)
const expandedOrder = ref(null)
const showDetailsModal = ref(false)
const selectedOrder = ref(null)

const orders = computed(() => orderStore.orders)

onMounted(async () => {
  if (authStore.isLoggedIn) {
    await orderStore.fetchOrders(authStore.user.id)
  }
  loading.value = false
})

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getStatusLabel(status) {
  const labels = {
    pending: 'Aguardando Pagamento',
    paid: 'Pagamento Confirmado',
    preparing: 'Preparando Pedido',
    shipped: 'Pedido Enviado',
    delivered: 'Entregue',
    cancelled: 'Cancelado'
  }
  return labels[status] || status
}

function getPaymentLabel(method) {
  const labels = {
    pix: 'PIX',
    mercadopago: 'Mercado Pago',
    paypal: 'PayPal',
    whatsapp: 'WhatsApp'
  }
  return labels[method] || method
}

function getPaymentStatusLabel(status) {
  const labels = {
    pending: 'Aguardando',
    paid: 'Pago',
    failed: 'Falhou',
    refunded: 'Estornado'
  }
  return labels[status] || status
}

function viewOrderDetails(order) {
  selectedOrder.value = order
  showDetailsModal.value = true
}

function closeModal() {
  showDetailsModal.value = false
  selectedOrder.value = null
}
</script>

<style scoped>
.orders-page {
  padding: 3rem 1rem;
  min-height: 60vh;
}

.page-title {
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 3rem;
}

.loading, .not-logged, .no-orders {
  text-align: center;
  padding: 4rem;
}

.not-logged p, .no-orders p {
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.btn-primary {
  display: inline-block;
  background: var(--accent-purple);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.order-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.order-number {
  font-weight: 700;
  font-size: 1.1rem;
}

.order-date {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.order-status {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.order-status.pending {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.order-status.paid, .order-status.preparing {
  background: rgba(123, 44, 191, 0.2);
  color: var(--accent-purple-light);
}

.order-status.shipped {
  background: rgba(0, 255, 65, 0.2);
  color: var(--accent-green);
}

.order-status.delivered {
  background: rgba(0, 255, 65, 0.3);
  color: var(--accent-green);
}

.order-items {
  margin-bottom: 1rem;
}

.order-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
}

.item-name {
  color: var(--text-primary);
}

.item-qty {
  color: var(--text-muted);
  margin-left: 0.5rem;
}

.item-size {
  color: var(--text-muted);
  margin-left: 0.5rem;
  font-size: 0.85rem;
}

.item-price {
  font-weight: 600;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.order-total {
  font-size: 1.1rem;
}

.total-value {
  color: var(--accent-green);
  font-weight: 700;
  margin-left: 0.5rem;
}

.order-payment {
  text-align: right;
  font-size: 0.9rem;
}

.payment-status {
  display: block;
  margin-top: 0.25rem;
}

.payment-status.paid {
  color: var(--accent-green);
}

.payment-status.pending {
  color: #ffc107;
}

.order-actions {
  margin-top: 1rem;
}

.btn-secondary {
  background: transparent;
  color: var(--text-secondary);
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  border-color: var(--accent-purple);
  color: var(--text-primary);
}

.order-details {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.details-section {
  margin-bottom: 1.5rem;
}

.details-section h4 {
  color: var(--accent-purple-light);
  margin-bottom: 0.75rem;
}

.details-section p {
  color: var(--text-secondary);
  margin: 0.25rem 0;
}

.status-timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.status-item {
  display: flex;
  gap: 1rem;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-top: 0.25rem;
}

.status-dot.pending { background: #ffc107; }
.status-dot.paid { background: var(--accent-purple); }
.status-dot.preparing { background: var(--accent-purple-light); }
.status-dot.shipped { background: var(--accent-green); }
.status-dot.delivered { background: var(--accent-green); }

.status-content {
  flex: 1;
}

.status-label {
  font-weight: 600;
}

.status-date {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin-left: 0.5rem;
}

.status-desc {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-top: 0.25rem;
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
  max-height: 90vh;
  overflow-y: auto;
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

.modal h2 {
  margin-bottom: 1rem;
}

.status-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.modal-section {
  margin-bottom: 1.5rem;
}

.modal-section h4 {
  color: var(--accent-purple-light);
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.modal-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  color: var(--text-secondary);
}

.modal-total {
  display: flex;
  justify-content: space-between;
  padding-top: 0.75rem;
  margin-top: 0.75rem;
  border-top: 1px solid var(--border-color);
  font-size: 1.1rem;
}
</style>
