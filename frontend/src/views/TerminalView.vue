<template>
  <div class="h-full flex flex-col lg:flex-row overflow-hidden bg-gradient-to-br from-neutral-50 to-neutral-100">
    <!-- Panel Izquierdo: Búsqueda + Categorías + Productos -->
    <div class="flex-1 flex flex-col min-w-0 h-full relative">
      <!-- Header: Buscador y Categorías -->
      <header class="bg-white/90 glass border-b border-neutral-200/50 p-5 flex-shrink-0 z-10">
        <div class="flex flex-col gap-4">
          <!-- Buscador + Vista -->
          <div class="flex items-center gap-4">
            <div class="relative group flex-1">
              <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-hover:text-primary transition-colors" 
                :style="{ color: 'rgb(var(--color-primary))' }" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Buscar producto por nombre o código..."
                class="w-full pl-12 pr-4 py-3.5 bg-white border border-neutral-200 rounded-2xl shadow-soft focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all hover:border-neutral-300 text-sm lg:text-base"
                :style="{ '--tw-ring-color': `rgb(var(--color-primary))` }"
                @input="handleSearch"
              />
            </div>
            <!-- Botones de Vista -->
            <div class="flex items-center gap-1 p-1.5 rounded-xl">
              <button
                @click="cambiarVista('cards')"
                class="p-2.5 rounded-xl transition-all duration-300 hover-lift"
                :class="vista === 'cards' ? 'btn' : 'btn-ghost'"
                :style="vista === 'cards' ? { backgroundColor: 'rgb(var(--color-primary))', color: 'white' } : {}"
                title="Vista de tarjetas"
              >
                <LayoutGrid class="w-5 h-5" />
              </button>
              <button
                @click="cambiarVista('lista')"
                class="p-2.5 rounded-xl transition-all duration-300 hover-lift"
                :class="vista === 'lista' ? 'btn' : 'btn-ghost'"
                :style="vista === 'lista' ? { backgroundColor: 'rgb(var(--color-primary))', color: 'white' } : {}"
                title="Vista de lista"
              >
                <List class="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <!-- Categorías -->
          <div class="flex flex-wrap gap-2">
            <button
              @click="categoriaSeleccionada = 'todos'"
              class="px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 hover-lift"
              :class="categoriaSeleccionada === 'todos' ? 'shadow-lg scale-[1.02]' : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200'"
              :style="categoriaSeleccionada === 'todos' ? { backgroundColor: 'rgb(var(--color-primary))', color: 'white', boxShadow: 'var(--shadow-depth-3)' } : {}"
            >
              <LayoutGrid class="w-4 h-4" />
              Todos
            </button>
            <button
              v-for="cat in categorias"
              :key="cat.id"
              @click="categoriaSeleccionada = cat.id"
              class="px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 hover-lift"
              :class="categoriaSeleccionada === cat.id ? 'shadow-lg scale-[1.02]' : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200'"
              :style="categoriaSeleccionada === cat.id ? { backgroundColor: 'rgb(var(--color-primary))', color: 'white', boxShadow: 'var(--shadow-depth-3)' } : {}"
            >
              <Tag class="w-4 h-4" />
              {{ cat.nombre }}
            </button>
          </div>
        </div>
      </header>

      <!-- Grid de Productos -->
      <div class="flex-1 overflow-auto p-6">
        <div v-if="loading" class="flex items-center justify-center h-full min-h-0">
          <div class="spinner w-10 h-10" :style="{ borderLeftColor: `rgb(var(--color-primary))` }"></div>
        </div>
        
        <div v-else-if="productosFiltrados.length === 0" class="flex flex-col items-center justify-center h-full min-h-0 text-neutral-400 animate-fade-in">
          <Package class="w-20 h-20 mb-4 text-neutral-200" />
          <p class="text-lg font-medium text-neutral-500">Sin productos</p>
          <p class="text-sm text-neutral-400">No se encontraron productos para esta búsqueda</p>
        </div>

        <!-- Vista de Tarjetas -->
        <div v-else-if="vista === 'cards'" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 content-start">
          <div
            v-for="producto in productosFiltrados"
            :key="producto.id"
            @click="agregarAlCarrito(producto)"
            class="card-elevated p-4 cursor-pointer flex flex-col justify-between h-full hover-lift"
          >
            <div>
              <div class="aspect-square bg-neutral-50 rounded-2xl mb-3 flex items-center justify-center overflow-hidden relative">
                <div class="absolute inset-0 bg-gradient-to-tr from-neutral-100/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <img v-if="producto.imagen" :src="producto.imagen" class="w-full h-full object-cover rounded-2xl" @error="producto.imagen = null" />
                <Package v-else class="w-10 h-10 text-neutral-300 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 class="font-semibold text-neutral-800 text-sm lg:text-base leading-tight mb-2 line-clamp-2" :title="producto.nombre">{{ producto.nombre }}</h3>
            </div>
            <div class="flex items-end justify-between mt-3">
              <span class="text-lg lg:text-xl font-bold" :style="{ color: `rgb(var(--color-primary))` }">${{ Number(producto.precio_venta).toFixed(2) }}</span>
              <span v-if="config.mostrar_stock" class="text-xs font-medium text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                <Archive class="w-3 h-3" /> {{ producto.stock }}
              </span>
            </div>
          </div>
        </div>

        <!-- Vista de Lista -->
        <div v-else-if="vista === 'lista'" class="space-y-3">
          <div
            v-for="producto in productosFiltrados"
            :key="producto.id"
            @click="agregarAlCarrito(producto)"
            class="card-elevated p-4 cursor-pointer flex items-center gap-4 hover-lift"
          >
            <div class="w-14 h-14 bg-neutral-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img v-if="producto.imagen" :src="producto.imagen" class="w-full h-full object-cover" @error="producto.imagen = null" />
              <Package v-else class="w-7 h-7 text-neutral-300" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-neutral-800 text-sm truncate">{{ producto.nombre }}</h3>
              <p class="text-xs text-neutral-500">{{ producto.categoria_nombre }}</p>
            </div>
            <div class="flex items-center gap-4">
              <span v-if="config.mostrar_stock" class="text-xs font-medium text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-lg">
                <Archive class="w-3 h-3 inline" /> {{ producto.stock }}
              </span>
              <span class="font-bold" :style="{ color: `rgb(var(--color-primary))` }">${{ Number(producto.precio_venta).toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel Derecho: Carrito -->
    <div class="w-full lg:w-[380px] xl:w-[420px] bg-white/80 glass shadow-[0_0_40px_rgba(0,0,0,0.05)] border-t lg:border-t-0 lg:border-l border-neutral-200/50 flex flex-col h-full lg:h-auto z-20 relative">
      <div class="p-5 border-b border-neutral-200/50 flex-shrink-0 bg-white/60 backdrop-blur-xl sticky top-0 z-10">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="relative">
              <div class="absolute inset-0 blur-md opacity-40 rounded-2xl" :style="{ backgroundColor: `rgb(var(--color-primary))` }"></div>
              <div class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg relative bg-gradient-to-br from-white/20 to-transparent" :style="{ backgroundColor: `rgb(var(--color-primary))` }">
                <ShoppingCart class="w-6 h-6 text-white drop-shadow-md" />
              </div>
            </div>
            <div>
              <h2 class="text-xl font-bold text-neutral-900 leading-tight tracking-tight">Carrito</h2>
              <p class="text-sm text-neutral-500 font-medium flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: totalItems > 0 ? `rgb(var(--color-primary))` : '#d4d4d8' }"></span>
                {{ totalItems }} artículo{{ totalItems !== 1 ? 's' : '' }}
              </p>
            </div>
          </div>
          <button
            v-if="!estaVacio"
            @click="limpiarCarrito"
            class="p-2.5 bg-red-500 text-white hover:bg-red-600 shadow-sm hover:shadow-md rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 group"
            title="Limpiar carrito"
          >
            <Trash2 class="w-5 h-5 group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-auto p-5 scrollbar-hide">
        <div v-if="estaVacio" class="flex flex-col items-center justify-center h-full text-neutral-400 py-12 animate-fade-in">
          <div class="relative mb-6">
            <div class="absolute inset-0 bg-neutral-200 blur-xl opacity-50 rounded-full animate-pulse"></div>
            <div class="w-24 h-24 bg-white shadow-soft rounded-full flex items-center justify-center relative">
              <ShoppingCart class="w-10 h-10 text-neutral-300" />
            </div>
          </div>
          <p class="text-xl font-bold text-neutral-600 mb-2">Carrito vacío</p>
          <p class="text-sm text-neutral-400 text-center max-w-[200px] leading-relaxed">Explora nuestros productos y agrégalos aquí para comenzar.</p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="item in items"
            :key="item.id"
            class="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm border border-neutral-100/80 shadow-sm rounded-2xl hover:shadow-md hover:border-neutral-200/60 transition-all duration-300 hover-lift group relative overflow-hidden"
          >
            <div class="absolute left-0 top-0 bottom-0 w-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-l-2xl" :style="{ backgroundColor: `rgb(var(--color-primary))` }"></div>
            
            <div class="w-14 h-14 bg-neutral-50/80 rounded-xl flex items-center justify-center shadow-inner flex-shrink-0 relative overflow-hidden">
               <img v-if="item.imagen" :src="item.imagen" class="w-full h-full object-cover" @error="item.imagen = null" />
               <Package v-else class="w-6 h-6 text-neutral-300 group-hover:text-neutral-400 transition-colors" />
            </div>
            
            <div class="flex-1 min-w-0 py-1">
              <h4 class="font-bold text-neutral-800 text-sm truncate" :title="item.nombre">
                {{ item.nombre }}
              </h4>
              <p class="text-xs font-medium text-neutral-500 mt-1">${{ Number(item.precio).toFixed(2) }} <span class="text-neutral-400 font-normal">c/u</span></p>
            </div>
            
            <div class="flex flex-col items-end gap-3">
              <p class="font-bold text-neutral-900 text-base leading-none">${{ (Number(item.precio) * item.cantidad).toFixed(2) }}</p>
              
              <div class="flex items-center gap-1.5 bg-neutral-50/80 border border-neutral-100 p-1 rounded-xl shadow-inner">
                <button
                  @click="actualizarCantidad(item.id, item.cantidad - 1)"
                  class="p-2 bg-white shadow-sm rounded-lg flex items-center justify-center hover:bg-neutral-50 transition-all active:scale-95"
                  :style="{ color: colorPrincipal }"
                >
                  <Minus :color="colorPrincipal" class="w-3.5 h-3.5" />
                </button>
                <span class="w-6 text-center font-bold text-neutral-700 text-sm">{{ item.cantidad }}</span>
                <button
                  @click="actualizarCantidad(item.id, item.cantidad + 1)"
                  class="p-2 bg-white shadow-sm rounded-lg flex items-center justify-center hover:bg-neutral-50 transition-all active:scale-95"
                  :style="{ color: colorPrincipal }"
                >
                  <Plus :color="colorPrincipal" class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            
            <!-- Botón flotante para eliminar (visible en hover o siempre en móviles) -->
            <button @click.stop="eliminarDelCarrito(item.id)" class="absolute p-4 -top-2 -right-2 bg-white text-red-500 border border-neutral-100 shadow-md rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-600 opacity-100 lg:opacity-0 lg:group-hover:opacity-100">
              <X color="#ef4444" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Footer del Carrito -->
      <div v-if="!estaVacio" class="p-6 border-t border-neutral-200/50 bg-white/80 backdrop-blur-xl relative z-10 before:absolute before:inset-0 before:bg-gradient-to-t before:from-white before:to-transparent before:-z-10 before:-top-6 before:h-6">
        <div class="space-y-3.5 mb-6">
          <div class="flex justify-between text-sm font-medium items-center">
            <span class="text-neutral-500 flex items-center gap-2">
              Subtotal
            </span>
            <span class="text-neutral-900 font-semibold">${{ Number(subtotal).toFixed(2) }}</span>
          </div>
          
          <div class="flex items-center justify-between group">
            <span class="text-sm font-medium text-neutral-500 flex items-center gap-2 group-hover:text-neutral-700 transition-colors">
              Descuento %
            </span>
            <div class="relative">
              <input
                v-model.number="descuentoInput"
                type="number"
                min="0"
                max="100"
                placeholder="0"
                class="w-20 pl-3 pr-8 py-2 border border-neutral-200 bg-neutral-50/50 rounded-xl text-right text-sm font-bold focus:ring-2 focus:bg-white focus:outline-none transition-all shadow-inner"
                :style="{ '--tw-ring-color': `rgb(var(--color-primary))` }"
                @change="aplicarDescuento(descuentoInput)"
              />
              <Percent class="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
            </div>
          </div>
          
          <div v-if="descuentoGlobal > 0" class="flex justify-between text-sm font-medium text-emerald-600 animate-fade-in bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/50">
            <span class="flex items-center gap-2">
              <Tag class="w-4 h-4" />
              Descuento ({{ descuentoGlobal }}%)
            </span>
            <span class="font-bold">-${{ Number(montoDescuento).toFixed(2) }}</span>
          </div>
        </div>
        
        <div class="flex justify-between items-end pt-5 border-t border-neutral-200/60 mb-6">
          <div class="flex flex-col">
            <span class="text-sm font-medium text-neutral-500 mb-1">Total a cobrar</span>
            <span class="text-4xl font-black tracking-tight" :style="{ color: `rgb(var(--color-primary))` }">${{ Number(total).toFixed(2) }}</span>
          </div>
        </div>

        <!-- Métodos de Pago -->
        <div class="grid grid-cols-3 gap-3 mb-6">
          <button
            v-for="metodo in metodosPago"
            :key="metodo.id"
            @click="metodoPago = metodo.id"
            class="py-3 px-2 rounded-2xl text-xs font-bold transition-all duration-300 flex flex-col items-center justify-center gap-2 border-2 relative overflow-hidden group"
            :class="metodoPago === metodo.id ? 'shadow-md scale-[1.02]' : 'bg-white border-neutral-100/80 shadow-sm text-neutral-500 hover:border-neutral-300 hover:bg-neutral-50'"
            :style="metodoPago === metodo.id ? { backgroundColor: 'white', color: 'rgb(var(--color-primary))', borderColor: 'rgb(var(--color-primary))' } : {}"
          >
            <div v-if="metodoPago === metodo.id" class="absolute inset-0 opacity-10" :style="{ backgroundColor: `rgb(var(--color-primary))` }"></div>
            <component :is="metodo.icon" class="w-5 h-5 transition-transform group-hover:scale-110" />
            {{ metodo.nombre }}
          </button>
        </div>

        <button
          @click="finalizarVenta"
          class="w-full py-4.5 font-bold rounded-2xl transition-all duration-300 hover-lift flex items-center justify-center gap-3 text-lg shadow-[0_8px_20px_-6px_rgba(0,0,0,0.3)] relative overflow-hidden group"
          :style="{ backgroundColor: 'rgb(var(--color-primary))', color: 'white' }"
        >
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          <DollarSign class="w-6 h-6" />
          <span>Cobrar Venta</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Modal Pago -->
    <div v-if="showPagoModal" class="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" @click.self="showPagoModal = false">
      <div class="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-scale-in overflow-hidden">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-bold text-neutral-900 flex items-center gap-3">
            <CreditCard class="w-7 h-7" :style="{ color: `rgb(var(--color-primary))` }" />
            Cobro de Venta
          </h3>
          <button @click="showPagoModal = false" class="p-2.5 rounded-xl transition-all hover-lift"
            :style="{ backgroundColor: 'rgb(var(--color-primary))', color: 'white' }">
            <X class="w-6 h-6" />
          </button>
        </div>

        <div class="space-y-6">
          <div class="bg-neutral-50 rounded-2xl p-6 border border-neutral-100 text-center">
            <p class="text-sm font-medium text-neutral-500 mb-2">Total a Cobrar</p>
            <p class="text-5xl font-black" :style="{ color: `rgb(var(--color-primary))` }">${{ Number(total).toFixed(2) }}</p>
          </div>

          <div class="space-y-5">
            <div>
              <label class="block text-sm font-semibold text-neutral-700 mb-3">Método de Pago</label>
<div class="grid grid-cols-3 gap-3">
    <button 
      v-for="metodo in metodosPago" 
      :key="metodo.id"
      @click="metodoPago = metodo.id; calcularCambio()"
      class="py-4 rounded-xl text-sm font-bold transition-all duration-300 flex flex-col items-center justify-center gap-2 border-2"
      :class="metodoPago === metodo.id ? 'shadow-lg' : 'bg-white border-neutral-200 text-neutral-500 hover:border-neutral-300 hover:bg-neutral-50'"
      :style="metodoPago === metodo.id ? { backgroundColor: 'rgb(var(--color-primary))', color: 'white', borderColor: 'rgb(var(--color-primary))', boxShadow: 'var(--shadow-depth-3)' } : {}"
    >
      <component :is="metodo.icon" class="w-5 h-5" />
      {{ metodo.nombre }}
    </button>
  </div>
            </div>

            <div v-if="metodoPago === 'efectivo'" class="space-y-4 animate-fade-in">
              <div>
                <label class="block text-sm font-semibold text-neutral-700 mb-2">Efectivo Recibido</label>
                <div class="relative">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-lg">$</span>
                  <input 
                    v-model.number="efectivoRecibido" 
                    type="number" 
                    step="0.01"
                    @input="calcularCambio"
                    class="w-full pl-10 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-xl text-xl font-bold focus:ring-2 focus:outline-none transition-all"
                    :style="{ '--tw-ring-color': `rgb(var(--color-primary))` }"
                  />
                </div>
              </div>
              <div class="bg-primary-50 rounded-2xl p-5 border border-primary/20 flex justify-between items-center">
                <span class="text-base font-semibold" :style="{ color: colorPrincipal }">Cambio a entregar:</span>
                <span class="text-2xl font-black" :style="{ color: colorPrincipal }">${{ Number(cambio).toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <button 
            @click="confirmarPago" 
            class="w-full py-5 font-bold rounded-2xl transition-all duration-300 hover-lift flex items-center justify-center gap-3 text-lg shadow-xl"
            :style="{ backgroundColor: 'rgb(var(--color-primary))', color: 'white', boxShadow: 'var(--shadow-depth-3)' }"
          >
            <Check class="w-7 h-7" />
            Confirmar Venta
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Ticket -->

  <div v-if="mostrarTicket" class="fixed inset-0 bg-neutral-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" @click.self="mostrarTicket = false">
    <div class="bg-white rounded-[2rem] p-10 w-full max-w-sm text-center shadow-2xl animate-scale-in relative overflow-hidden">
      <div class="absolute top-0 left-0 w-full h-3" :style="{ backgroundColor: `rgb(var(--color-primary))` }"></div>
      
      <div class="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 transform -rotate-3 shadow-xl" :style="{ backgroundColor: `rgb(var(--color-primary))` }">
        <Check class="w-10 h-10 text-white" />
      </div>
      <h3 class="text-3xl font-black text-neutral-900 mb-3">¡Venta Exitosa!</h3>
      <p class="text-sm font-medium text-neutral-500 flex items-center justify-center gap-2 mb-8 bg-neutral-50 w-max mx-auto px-4 py-2 rounded-xl">
        <Receipt class="w-4 h-4" />
        Folio: {{ ventaActual?.folio }}
      </p>
      
      <div class="bg-neutral-50 rounded-2xl p-6 mb-8 border border-neutral-100">
        <p class="text-sm text-neutral-500 font-medium mb-2">Monto Cobrado</p>
        <p class="text-5xl font-black text-center mb-6" :style="{ color: `rgb(var(--color-primary))` }">${{ Number(ticketData.total).toFixed(2) }}</p>
        
        <div class="space-y-3 pt-5 border-t border-neutral-200">
          <div class="flex justify-between text-sm font-medium text-neutral-600">
            <span class="flex items-center gap-2">
              <Wallet class="w-4 h-4 text-neutral-400" />
              Recibido:
            </span>
            <span class="text-neutral-900">${{ Number(ticketData.recibido).toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-base font-bold">
            <span class="flex items-center gap-2">
              <Coins class="w-4 h-4 text-neutral-400" />
              Su Cambio:
            </span>
            <span class="text-neutral-900">${{ Number(ticketData.cambio).toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <button @click="mostrarTicket = false" class="w-full py-4.5 font-bold rounded-xl transition-all duration-300 hover-lift flex items-center justify-center gap-3 shadow-xl"
        :style="{ backgroundColor: 'rgb(var(--color-primary))', color: 'white', boxShadow: 'var(--shadow-depth-3)' }"
      >
        <RotateCcw class="w-6 h-6" />
        Siguiente Venta
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useProductosStore } from '@/stores/productos'
import { useVentasStore } from '@/stores/ventas'
import { config, fetchConfig, saveConfig } from '@/stores/config'
import { 
  Search, Package, Tag, LayoutGrid, List, ShoppingCart, Trash2, Plus, Minus, 
  Calculator, DollarSign, CreditCard, Banknote, ScanLine, X, Loader2, Archive,
  ArrowLeftRight, Send, Percent, Receipt, Wallet, Coins, RotateCcw, Check
} from 'lucide-vue-next'

const productosStore = useProductosStore()
const ventasStore = useVentasStore()

const searchQuery = ref('')
const categoriaSeleccionada = ref('todos')
const vista = ref('cards')
const descuentoInput = ref(0)
const metodoPago = ref('efectivo')
const mostrarTicket = ref(false)
const showPagoModal = ref(false)
const efectivoRecibido = ref(0)
const cambio = ref(0)
const ticketData = ref({ total: 0, recibido: 0, cambio: 0, folio: '' })

const colorPrincipal = computed(() => config.color_principal || '#3b82f6')

const metodosPago = [
  { id: 'efectivo', nombre: 'Efectivo', icon: Banknote },
  { id: 'tarjeta', nombre: 'Tarjeta', icon: CreditCard },
  { id: 'transferencia', nombre: 'Transferencia', icon: Send }
]

const cambiarVista = async (nuevaVista) => {
  vista.value = nuevaVista
  try {
    await saveConfig({ vista: nuevaVista })
  } catch (e) {
    console.error(e)
  }
}

const productosFiltrados = computed(() => {
  let filtrados = productosStore.productos.filter(p => p.stock > 0)
  
  if (categoriaSeleccionada.value !== 'todos') {
    filtrados = filtrados.filter(p => p.categoria_id === categoriaSeleccionada.value)
  }
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    filtrados = filtrados.filter(p => 
      p.nombre.toLowerCase().includes(q) ||
      p.codigo_barras?.toLowerCase().includes(q)
    )
  }
  
  return filtrados
})

const loading = computed(() => productosStore.loading)
const categorias = computed(() => {
  const cats = productosStore.categorias
  const prods = productosStore.productos
  return cats.filter(c => prods.some(p => p.categoria_id === c.id))
})
const items = computed(() => ventasStore.items)
const estaVacio = computed(() => ventasStore.estaVacio)
const totalItems = computed(() => ventasStore.totalItems)
const subtotal = computed(() => ventasStore.subtotal)
const descuentoGlobal = computed(() => ventasStore.descuentoGlobal)
const montoDescuento = computed(() => ventasStore.montoDescuento)
const total = computed(() => ventasStore.total)
const ventaActual = computed(() => ventasStore.ventaActual)

const handleSearch = () => {
  productosStore.setSearchQuery(searchQuery.value)
}

const agregarAlCarrito = (producto) => {
  ventasStore.agregarProducto(producto)
  if (config.sonido) {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioCtx.destination)
    
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.1)
    
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15)
    
    oscillator.type = 'sine'
    oscillator.start()
    oscillator.stop(audioCtx.currentTime + 0.15)
  }
}

const actualizarCantidad = (productoId, cantidad) => {
  ventasStore.actualizarCantidad(productoId, cantidad)
}

const eliminarDelCarrito = (productoId) => {
  ventasStore.eliminarProducto(productoId)
}

const aplicarDescuento = (porcentaje) => {
  ventasStore.aplicarDescuento(porcentaje)
}

const finalizarVenta = async () => {
  if (ventasStore.estaVacio) {
    alert('El carrito está vacío')
    return
  }
  
  efectivoRecibido.value = total.value
  cambio.value = 0
  showPagoModal.value = true
}

const confirmarPago = async () => {
  if (metodoPago.value === 'efectivo' && efectivoRecibido.value < total.value) {
    alert('El monto recibido es menor al total')
    return
  }
  
  const montoTotal = total.value
  const montoRecibido = efectivoRecibido.value
  const montoCambio = cambio.value
  
  const result = await ventasStore.registrarVenta({
    metodo: metodoPago.value,
    efectivo: montoRecibido,
    cambio: montoCambio
  })
  
  if (result.success) {
    showPagoModal.value = false
    
    ticketData.value = { 
      total: montoTotal, 
      recibido: montoRecibido, 
      cambio: montoCambio, 
      folio: result.venta.folio 
    }
    
    mostrarTicket.value = true
    ventaActual.value = result.venta
    
    productosStore.fetchProductos()
  } else {
    alert('Error al registrar venta: ' + result.error)
  }
}

const calcularCambio = () => {
  if (metodoPago.value === 'efectivo') {
    cambio.value = Math.max(0, efectivoRecibido.value - total.value)
  } else {
    cambio.value = 0
  }
}

onMounted(async () => {
  await fetchConfig()
  await nextTick()
  console.log('Config vista:', config.vista)
  vista.value = config.vista || 'cards'
  console.log('Vista set to:', vista.value)
  productosStore.fetchProductos()
  productosStore.fetchCategorias()
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>