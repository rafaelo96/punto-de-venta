<template>
  <div class="h-full flex flex-col lg:flex-row overflow-hidden bg-[rgb(var(--surface-50))]">
    <div class="flex-1 flex flex-col min-w-0 h-full relative">
      <header class="bg-[rgb(var(--surface-100))] border-b border-[rgb(var(--neutral-200))] px-4 py-3 flex-shrink-0 z-10">
        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-3">
            <div class="relative group flex-1">
              <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-neutral-400 transition-colors"
                :style="{ color: 'rgb(var(--color-primary))' }" />
              <input
                ref="searchInput"
                v-model="searchQuery"
                type="text"
                placeholder="Buscar producto"
                class="w-full pl-10 pr-4 py-3 bg-[rgb(var(--surface-50))] border border-[rgb(var(--neutral-200))] rounded-lg shadow-none focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all hover:border-[rgb(var(--neutral-300))] text-sm"
                :style="{ '--tw-ring-color': `rgb(var(--color-primary))` }"
                @input="handleSearch"
                @keydown="handleSearchKeydown"
              />
            </div>
            <div class="flex items-center gap-1 p-1 rounded-lg bg-[rgb(var(--surface-200))] border border-[rgb(var(--neutral-200))]">
             <button @click="cambiarVista('cards')" class="p-2 rounded-md transition-all duration-200 shadow-none"
               :class="vista === 'cards' ? '' : 'bg-transparent text-[rgb(var(--neutral-600))] hover:bg-[rgb(var(--surface-100))]'"
               :style="vista === 'cards' ? { backgroundColor: 'rgb(var(--color-primary))', color: 'white' } : {}"
               title="Vista tarjetas">
               <LayoutGrid class="w-[18px] h-[18px]" />
             </button>
             <button @click="cambiarVista('lista')" class="p-2 rounded-md transition-all duration-200 shadow-none"
               :class="vista === 'lista' ? '' : 'bg-transparent text-[rgb(var(--neutral-600))] hover:bg-[rgb(var(--surface-100))]'"
               :style="vista === 'lista' ? { backgroundColor: 'rgb(var(--color-primary))', color: 'white' } : {}"
               title="Vista lista">
               <List class="w-[18px] h-[18px]" />
             </button>
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
             <button @click="categoriaSeleccionada = 'todos'" class="px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-2 shadow-none"
               :class="categoriaSeleccionada === 'todos' ? '' : 'bg-[rgb(var(--surface-50))] text-[rgb(var(--neutral-700))] hover:bg-[rgb(var(--surface-200))] border border-[rgb(var(--neutral-200))]'"
               :style="categoriaSeleccionada === 'todos' ? { backgroundColor: 'rgb(var(--color-primary))', color: 'white' } : {}">
               <LayoutGrid class="w-4 h-4" /> Todos
             </button>
             <button v-for="cat in categorias" :key="cat.id" @click="categoriaSeleccionada = cat.id"
               class="px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-2 shadow-none"
               :class="categoriaSeleccionada === cat.id ? '' : 'bg-[rgb(var(--surface-50))] text-[rgb(var(--neutral-700))] hover:bg-[rgb(var(--surface-200))] border border-[rgb(var(--neutral-200))]'"
               :style="categoriaSeleccionada === cat.id ? { backgroundColor: 'rgb(var(--color-primary))', color: 'white' } : {}">
               <Tag class="w-4 h-4" /> {{ cat.nombre }}
             </button>
          </div>
        </div>
      </header>

      <div class="flex-1 overflow-auto p-4 lg:p-5">
        <div v-if="loading" class="flex items-center justify-center h-full min-h-0">
          <div class="spinner w-10 h-10" :style="{ borderLeftColor: `rgb(var(--color-primary))` }"></div>
        </div>

        <div v-else-if="productosFiltrados.length === 0" class="flex flex-col items-center justify-center h-full min-h-0 text-neutral-400 animate-fade-in">
          <div class="w-16 h-16 mb-4 rounded-lg bg-[rgb(var(--surface-100))] border border-[rgb(var(--neutral-200))] flex items-center justify-center">
            <Package class="w-8 h-8 text-neutral-300" />
          </div>
          <p class="text-base font-semibold text-neutral-600">Sin productos</p>
          <p class="text-sm text-neutral-400">No se encontraron resultados</p>
        </div>

        <div v-else-if="vista === 'cards'" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 content-start">
          <div v-for="producto in productosFiltrados" :key="producto.id"
            @click="agregarAlCarrito(producto)"
            class="card-elevated product-card p-3 cursor-pointer flex flex-col justify-between h-full hover-lift"
            :class="{ 'product-card-added': recentlyAddedId === producto.id }">
            <div>
              <div class="aspect-square bg-[rgb(var(--surface-50))] rounded-lg mb-3 flex items-center justify-center overflow-hidden relative border border-[rgb(var(--neutral-200))]">
                <img v-if="producto.imagen" :src="producto.imagen" class="w-full h-full object-cover" @error="producto.imagen = null" />
                <Package v-else class="w-8 h-8 text-neutral-300" />
              </div>
              <h3 class="font-semibold text-neutral-800 text-sm leading-tight mb-2 line-clamp-2">{{ producto.nombre }}</h3>
            </div>
            <div class="flex items-end justify-between mt-2 gap-2">
              <span class="text-base font-bold" :style="{ color: `rgb(var(--color-primary))` }">${{ Number(producto.precio_venta).toFixed(2) }}</span>
              <span v-if="config.mostrar_stock" class="text-[11px] font-medium text-neutral-500 bg-[rgb(var(--surface-200))] px-2 py-1 rounded-md flex items-center gap-1.5">
                <Archive class="w-3 h-3" /> {{ producto.stock }}
              </span>
            </div>
          </div>
        </div>

        <div v-else-if="vista === 'lista'" class="space-y-2">
          <div v-for="producto in productosFiltrados" :key="producto.id"
            @click="agregarAlCarrito(producto)"
            class="card-elevated product-card p-3 cursor-pointer flex items-center gap-3 hover-lift"
            :class="{ 'product-card-added': recentlyAddedId === producto.id }">
            <div class="w-12 h-12 bg-[rgb(var(--surface-50))] rounded-lg border border-[rgb(var(--neutral-200))] flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img v-if="producto.imagen" :src="producto.imagen" class="w-full h-full object-cover" @error="producto.imagen = null" />
              <Package v-else class="w-6 h-6 text-neutral-300" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-neutral-800 text-sm truncate">{{ producto.nombre }}</h3>
              <p class="text-xs text-neutral-500">{{ producto.categoria_nombre }}</p>
            </div>
            <div class="flex items-center gap-3">
              <span v-if="config.mostrar_stock" class="text-[11px] font-medium text-neutral-500 bg-[rgb(var(--surface-200))] px-2 py-1 rounded-md">
                <Archive class="w-3 h-3 inline" /> {{ producto.stock }}
              </span>
              <span class="font-bold" :style="{ color: `rgb(var(--color-primary))` }">${{ Number(producto.precio_venta).toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="w-full lg:w-[380px] xl:w-[420px] bg-[rgb(var(--surface-100))] border-t lg:border-t-0 lg:border-l border-[rgb(var(--neutral-200))] flex flex-col h-full lg:h-auto z-20 relative">
      <div class="p-4 border-b border-[rgb(var(--neutral-200))] flex-shrink-0 bg-[rgb(var(--surface-100))] sticky top-0 z-10">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center" :style="{ backgroundColor: `rgb(var(--color-primary))` }">
              <ShoppingCart class="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 class="text-lg font-bold text-neutral-900 leading-tight tracking-tight">Carrito</h2>
              <p class="text-xs text-neutral-500 font-medium flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: totalItems > 0 ? `rgb(var(--color-primary))` : 'rgb(var(--neutral-300))' }"></span>
                {{ totalItems }} artículo{{ totalItems !== 1 ? 's' : '' }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button v-if="!estaVacio" @click="showItemDiscountModal = true; prepararItemDiscount()"
              class="p-2 bg-[rgb(var(--surface-50))] border border-[rgb(var(--neutral-200))] shadow-none rounded-lg transition-all duration-200 hover:bg-[rgb(var(--surface-200))]"
              :style="{ color: 'rgb(var(--color-primary))' }"
              title="Aplicar descuento">
              <Percent class="w-[18px] h-[18px]" />
            </button>
            <button v-if="!estaVacio" @click="limpiarCarrito"
              class="p-2 bg-[rgb(var(--surface-50))] border border-[rgb(var(--neutral-200))] shadow-none rounded-lg transition-all duration-200 hover:bg-[rgb(var(--surface-200))]"
              :style="{ color: 'rgb(var(--color-danger))' }"
              title="Limpiar carrito">
              <Trash2 class="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </div>

      <div class="flex-1 overflow-auto p-4 scrollbar-hide">
        <div v-if="estaVacio" class="flex flex-col items-center justify-center h-full text-neutral-400 py-12 animate-fade-in">
          <div class="w-16 h-16 mb-4 bg-[rgb(var(--surface-50))] border border-[rgb(var(--neutral-200))] rounded-lg flex items-center justify-center">
            <ShoppingCart class="w-7 h-7 text-neutral-300" />
          </div>
          <p class="text-base font-semibold text-neutral-600 mb-1">Carrito vacío</p>
          <p class="text-sm text-neutral-400 text-center max-w-[220px] leading-relaxed">Selecciona productos para iniciar la venta.</p>
        </div>

        <div v-else class="space-y-2">
          <div v-for="item in items" :key="item.id"
            class="flex items-center gap-3 p-3 bg-[rgb(var(--surface-50))] border border-[rgb(var(--neutral-200))] rounded-lg transition-all duration-200 group relative"
            :style="item.descuento > 0 ? { borderColor: 'rgb(var(--color-primary))', boxShadow: '0 0 0 3px rgb(var(--color-primary) / 0.08)' } : {}">
            <div class="w-12 h-12 bg-[rgb(var(--surface-100))] rounded-md flex items-center justify-center flex-shrink-0 relative overflow-hidden border border-[rgb(var(--neutral-200))]">
              <img v-if="item.imagen" :src="item.imagen" class="w-full h-full object-cover" @error="item.imagen = null" />
              <Package v-else class="w-5 h-5 text-neutral-300 group-hover:text-neutral-400 transition-colors" />
            </div>

            <div class="flex-1 min-w-0 py-1">
              <h4 class="font-semibold text-neutral-800 text-sm truncate">{{ item.nombre }}</h4>
              <p class="text-xs font-medium text-neutral-500 mt-1">
                ${{ Number(item.precioOriginal || item.precio).toFixed(2) }} c/u
                <span v-if="item.descuento > 0" class="font-bold ml-1" :style="{ color: 'rgb(var(--color-primary))' }">-{{ item.descuento }}%</span>
              </p>
            </div>

            <div class="flex flex-col items-end gap-2">
              <p class="font-bold text-neutral-900 text-base leading-none">${{ Number(item.precio * item.cantidad * (1 - item.descuento / 100)).toFixed(2) }}</p>

              <div class="flex items-center gap-1 bg-[rgb(var(--surface-100))] border border-[rgb(var(--neutral-200))] p-1 rounded-md">
                <button @click="actualizarCantidad(item.id, item.cantidad - 1)"
                  class="p-1.5 bg-transparent shadow-none rounded flex items-center justify-center hover:bg-[rgb(var(--surface-200))] transition-all active:scale-95"
                  :style="{ color: colorPrincipal }">
                  <Minus :color="colorPrincipal" class="w-3.5 h-3.5" />
                </button>
                <span class="w-7 text-center font-bold text-neutral-700 text-sm tabular-nums">{{ item.cantidad }}</span>
                <button @click="actualizarCantidad(item.id, item.cantidad + 1)"
                  class="p-1.5 bg-transparent shadow-none rounded flex items-center justify-center hover:bg-[rgb(var(--surface-200))] transition-all active:scale-95"
                  :style="{ color: colorPrincipal }">
                  <Plus :color="colorPrincipal" class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

              <button @click.stop="eliminarDelCarrito(item.id)"
                class="absolute p-1.5 top-2 right-2 bg-[rgb(var(--surface-100))] border border-[rgb(var(--neutral-200))] shadow-none rounded-md flex items-center justify-center hover:bg-[rgb(var(--surface-200))] opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
                :style="{ color: 'rgb(var(--color-danger))' }">
                <X class="w-3.5 h-3.5" />
              </button>
          </div>
        </div>
      </div>

      <div v-if="!estaVacio" class="p-4 border-t border-[rgb(var(--neutral-200))] bg-[rgb(var(--surface-100))] relative z-10">
        <div class="space-y-3 mb-5">
          <div class="flex justify-between text-sm font-medium items-center">
            <span class="text-neutral-500 flex items-center gap-2">Subtotal</span>
            <span class="text-neutral-900 font-semibold">${{ Number(subtotal).toFixed(2) }}</span>
          </div>

          <div class="flex items-center justify-between group">
            <span class="text-sm font-medium text-neutral-500 flex items-center gap-2 group-hover:text-neutral-700 transition-colors">
              Descuento global %
            </span>
            <div class="relative">
              <input v-model.number="descuentoInput" type="number" min="0" max="100" placeholder="0"
                class="w-20 pl-3 pr-8 py-2 border border-[rgb(var(--neutral-200))] bg-[rgb(var(--surface-50))] rounded-lg text-right text-sm font-bold focus:ring-2 focus:bg-[rgb(var(--surface-100))] focus:outline-none transition-all shadow-none"
                :style="{ '--tw-ring-color': `rgb(var(--color-primary))` }"
                @change="aplicarDescuento(descuentoInput)" />
              <Percent class="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
            </div>
          </div>

          <div v-if="descuentoGlobal > 0" class="flex justify-between text-sm font-medium animate-fade-in p-2.5 rounded-lg border"
            :style="{ backgroundColor: 'rgb(var(--color-primary) / 0.08)', borderColor: 'rgb(var(--color-primary) / 0.18)', color: 'rgb(var(--color-primary))' }">
            <span class="flex items-center gap-2"><Tag class="w-4 h-4" /> Descuento ({{ descuentoGlobal }}%)</span>
            <span class="font-bold">-${{ Number(montoDescuento).toFixed(2) }}</span>
          </div>
        </div>

        <div class="flex justify-between items-end pt-4 border-t border-[rgb(var(--neutral-200))] mb-5">
          <div class="flex flex-col">
            <span class="text-sm font-medium text-neutral-500 mb-1">Total a cobrar</span>
            <span class="text-3xl font-black tracking-tight tabular-nums" :style="{ color: `rgb(var(--color-primary))` }">${{ Number(total).toFixed(2) }}</span>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-2 mb-5">
             <button v-for="metodo in metodosPago" :key="metodo.id" @click="metodoPago = metodo.id"
               class="py-3 px-2 rounded-lg text-xs font-bold transition-all duration-200 flex flex-col items-center justify-center gap-1.5 border relative overflow-hidden group shadow-none"
               :class="metodoPago === metodo.id ? '' : 'bg-[rgb(var(--surface-50))] border-[rgb(var(--neutral-200))] text-[rgb(var(--neutral-700))] hover:border-[rgb(var(--neutral-300))] hover:bg-[rgb(var(--surface-200))]'"
               :style="metodoPago === metodo.id ? { backgroundColor: 'rgb(var(--color-primary) / 0.08)', color: 'rgb(var(--color-primary))', borderColor: 'rgb(var(--color-primary))' } : {}">
               <component :is="metodo.icon" class="w-5 h-5" />
               {{ metodo.nombre }}
             </button>
        </div>

        <button @click="finalizarVenta"
          class="w-full py-4 font-bold rounded-lg transition-all duration-200 hover-lift flex items-center justify-center gap-3 text-base shadow-none relative overflow-hidden group"
          :style="{ backgroundColor: 'rgb(var(--color-primary))', color: 'white' }">
          <DollarSign class="w-5 h-5" />
          <span>Cobrar venta</span>
        </button>
      </div>
    </div>

    <div v-if="showPagoModal" class="fixed inset-0 bg-neutral-900/55 flex items-center justify-center p-4 z-50 animate-fade-in" @click.self="showPagoModal = false">
      <div class="bg-[rgb(var(--surface-100))] rounded-xl p-6 w-full max-w-md shadow-2xl animate-scale-in overflow-hidden border border-[rgb(var(--neutral-200))]">
        <div class="flex justify-between items-center mb-5">
          <h3 class="text-xl font-bold text-neutral-900 flex items-center gap-3">
            <CreditCard class="w-6 h-6" :style="{ color: `rgb(var(--color-primary))` }" /> Cobro de venta
          </h3>
          <button @click="showPagoModal = false" class="p-2 rounded-lg bg-[rgb(var(--surface-50))] border border-[rgb(var(--neutral-200))] shadow-none transition-all hover:bg-[rgb(var(--surface-200))]" :style="{ color: 'rgb(var(--neutral-700))' }">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-5">
          <div class="bg-[rgb(var(--surface-50))] rounded-lg p-5 border border-[rgb(var(--neutral-200))] text-center">
            <p class="text-sm font-medium text-neutral-500 mb-1">Total a cobrar</p>
            <p class="text-4xl font-black tabular-nums" :style="{ color: `rgb(var(--color-primary))` }">${{ Number(total).toFixed(2) }}</p>
          </div>

          <div class="space-y-5">
            <div>
              <label class="block text-sm font-semibold text-neutral-700 mb-3">Método de Pago</label>
              <div class="grid grid-cols-3 gap-2">
                 <button v-for="metodo in metodosPago" :key="metodo.id" @click="metodoPago = metodo.id; calcularCambio()"
                   class="py-3 rounded-lg text-sm font-bold transition-all duration-200 flex flex-col items-center justify-center gap-2 border shadow-none"
                   :class="metodoPago === metodo.id ? '' : 'bg-[rgb(var(--surface-50))] border-[rgb(var(--neutral-200))] text-[rgb(var(--neutral-700))] hover:border-[rgb(var(--neutral-300))] hover:bg-[rgb(var(--surface-200))]'"
                   :style="metodoPago === metodo.id ? { backgroundColor: 'rgb(var(--color-primary))', color: 'white', borderColor: 'rgb(var(--color-primary))' } : {}">
                   <component :is="metodo.icon" class="w-5 h-5" /> {{ metodo.nombre }}
                 </button>
              </div>
            </div>

            <div v-if="metodoPago === 'efectivo'" class="space-y-4 animate-fade-in">
              <div>
                <label class="block text-sm font-semibold text-neutral-700 mb-2">Efectivo Recibido</label>
                <div class="relative">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-lg">$</span>
                  <input v-model.number="efectivoRecibido" type="number" step="0.01" @input="calcularCambio"
                    class="w-full pl-10 pr-4 py-3.5 bg-[rgb(var(--surface-50))] border border-[rgb(var(--neutral-200))] rounded-lg text-xl font-bold focus:ring-2 focus:outline-none transition-all"
                    :style="{ '--tw-ring-color': `rgb(var(--color-primary))` }" />
                </div>
              </div>
              <div class="rounded-lg p-4 border flex justify-between items-center"
                :style="{ backgroundColor: 'rgb(var(--color-primary) / 0.08)', borderColor: 'rgb(var(--color-primary) / 0.18)' }">
                <span class="text-base font-semibold" :style="{ color: colorPrincipal }">Cambio a entregar:</span>
                <span class="text-2xl font-black tabular-nums" :style="{ color: colorPrincipal }">${{ Number(cambio).toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <button @click="confirmarPago"
            class="w-full py-4 font-bold rounded-lg transition-all duration-200 hover-lift flex items-center justify-center gap-3 text-base shadow-none"
            :style="{ backgroundColor: 'rgb(var(--color-primary))', color: 'white' }">
            <Check class="w-5 h-5" /> Confirmar venta
          </button>
        </div>
      </div>
    </div>

    <div v-if="mostrarTicket" class="fixed inset-0 bg-neutral-900/45 flex items-center justify-center p-4 z-50 animate-fade-in" @click.self="mostrarTicket = false">
      <div class="bg-[rgb(var(--surface-100))] rounded-xl p-6 w-full max-w-sm text-center shadow-2xl animate-scale-in relative overflow-hidden border border-[rgb(var(--neutral-200))]">
        <div class="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4" :style="{ backgroundColor: `rgb(var(--color-primary))` }">
          <Check class="w-8 h-8 text-white" />
        </div>
        <h3 class="text-2xl font-black text-neutral-900 mb-3">Venta exitosa</h3>
        <p class="text-sm font-medium text-neutral-500 flex items-center justify-center gap-2 mb-6 bg-[rgb(var(--surface-50))] border border-[rgb(var(--neutral-200))] w-max mx-auto px-3 py-2 rounded-lg">
          <Receipt class="w-4 h-4" /> Folio: {{ ventaActual?.folio }}
        </p>

        <div class="bg-[rgb(var(--surface-50))] rounded-lg p-5 mb-6 border border-[rgb(var(--neutral-200))]">
          <p class="text-sm text-neutral-500 font-medium mb-2">Monto Cobrado</p>
          <p class="text-4xl font-black text-center mb-5 tabular-nums" :style="{ color: `rgb(var(--color-primary))` }">${{ Number(ticketData.total).toFixed(2) }}</p>

          <div class="space-y-3 pt-4 border-t border-[rgb(var(--neutral-200))]">
            <div class="flex justify-between text-sm font-medium text-neutral-600">
              <span class="flex items-center gap-2"><Wallet class="w-4 h-4 text-neutral-400" /> Recibido:</span>
              <span class="text-neutral-900">${{ Number(ticketData.recibido).toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-base font-bold">
              <span class="flex items-center gap-2"><Coins class="w-4 h-4 text-neutral-400" /> Su Cambio:</span>
              <span class="text-neutral-900">${{ Number(ticketData.cambio).toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <div class="flex gap-3">
          <button @click="imprimirTicket(ventaActual?.id)" 
            class="flex-1 py-3.5 font-bold rounded-lg transition-all duration-200 hover-lift flex items-center justify-center gap-2 bg-[rgb(var(--surface-50))] border border-[rgb(var(--neutral-200))] shadow-none"
            :style="{ color: 'rgb(var(--color-primary))' }">
            <Printer class="w-5 h-5" /> Imprimir
          </button>
          <button @click="mostrarTicket = false"
            class="flex-1 py-3.5 font-bold rounded-lg transition-all duration-200 hover-lift flex items-center justify-center gap-3 shadow-none"
            :style="{ backgroundColor: 'rgb(var(--color-primary))', color: 'white' }">
            <RotateCcw class="w-5 h-5" /> Siguiente
          </button>
        </div>
      </div>
    </div>

    <div v-if="showItemDiscountModal" class="fixed inset-0 bg-neutral-900/55 flex items-center justify-center p-4 z-50 animate-fade-in" @click.self="showItemDiscountModal = false">
      <div class="bg-[rgb(var(--surface-100))] rounded-xl p-6 w-full max-w-md shadow-2xl animate-scale-in border border-[rgb(var(--neutral-200))]">
        <div class="flex justify-between items-center mb-5">
          <h3 class="text-xl font-bold text-neutral-900 flex items-center gap-3">
            <Percent class="w-6 h-6" :style="{ color: `rgb(var(--color-primary))` }" /> Descuento por producto
          </h3>
          <button @click="showItemDiscountModal = false" class="p-2 rounded-lg bg-[rgb(var(--surface-50))] border border-[rgb(var(--neutral-200))] shadow-none hover:bg-[rgb(var(--surface-200))] transition-all">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-2 mb-5">
          <div v-for="item in items" :key="item.id"
            class="flex items-center justify-between p-3 bg-[rgb(var(--surface-50))] rounded-lg border border-[rgb(var(--neutral-200))]">
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-neutral-800 truncate">{{ item.nombre }}</p>
              <p class="text-sm text-neutral-500">${{ Number(item.precio).toFixed(2) }} c/u</p>
            </div>
            <div class="flex items-center gap-2">
              <input v-model.number="item.descuento" type="number" min="0" max="100" placeholder="0"
                class="w-20 px-3 py-2 border border-[rgb(var(--neutral-200))] rounded-lg text-center font-bold focus:ring-2 focus:outline-none bg-[rgb(var(--surface-100))]"
                :style="{ '--tw-ring-color': `rgb(var(--color-primary))` }" />
              <span class="text-neutral-400 font-bold">%</span>
            </div>
          </div>
        </div>

        <button @click="showItemDiscountModal = false"
          class="w-full py-3.5 font-bold rounded-lg transition-all duration-200 hover-lift flex items-center justify-center gap-3 shadow-none"
          :style="{ backgroundColor: 'rgb(var(--color-primary))', color: 'white' }">
          <Check class="w-5 h-5" /> Aplicar Descuentos
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useProductosStore } from '@/stores/productos'
import { useVentasStore } from '@/stores/ventas'
import { config, fetchConfig, saveConfig } from '@/stores/config'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import api from '@/api'
import {
  Search, Package, Tag, LayoutGrid, List, ShoppingCart, Trash2, Plus, Minus,
  Calculator, DollarSign, CreditCard, Banknote, ScanLine, X, Loader2, Archive,
  ArrowLeftRight, Send, Percent, Receipt, Wallet, Coins, RotateCcw, Check,
  Printer
} from 'lucide-vue-next'

const productosStore = useProductosStore()
const ventasStore = useVentasStore()
const toast = useToast()
const confirmDialog = useConfirm()

const searchQuery = ref('')
const categoriaSeleccionada = ref('todos')
const vista = ref('cards')
const descuentoInput = ref(0)
const metodoPago = ref('efectivo')
const mostrarTicket = ref(false)
const showPagoModal = ref(false)
const showItemDiscountModal = ref(false)
const efectivoRecibido = ref(0)
const cambio = ref(0)
const ticketData = ref({ total: 0, recibido: 0, cambio: 0, folio: '' })
const searchInput = ref(null)
const recentlyAddedId = ref(null)
let addFeedbackTimer = null

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
      p.nombre.toLowerCase().includes(q) || p.codigo_barras?.toLowerCase().includes(q)
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

const handleSearch = () => productosStore.setSearchQuery(searchQuery.value)

const handleSearchKeydown = (e) => {
  if (e.key === 'Escape') {
    searchQuery.value = ''
    searchInput.value?.blur()
  }
}

const agregarAlCarrito = (producto) => {
  ventasStore.agregarProducto(producto)
  recentlyAddedId.value = producto.id
  clearTimeout(addFeedbackTimer)
  addFeedbackTimer = setTimeout(() => {
    recentlyAddedId.value = null
  }, 260)
  if (config.sonido) {
    playBeep()
  }
}

const playBeep = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    const now = audioCtx.currentTime
    const masterGain = audioCtx.createGain()
    masterGain.gain.setValueAtTime(0.0001, now)
    masterGain.gain.exponentialRampToValueAtTime(0.16, now + 0.018)
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34)
    masterGain.connect(audioCtx.destination)

    const playTone = (frequency, start, duration, gain = 0.75) => {
      const toneGain = audioCtx.createGain()
      const fundamental = audioCtx.createOscillator()
      const shimmer = audioCtx.createOscillator()

      toneGain.gain.setValueAtTime(0.0001, now + start)
      toneGain.gain.exponentialRampToValueAtTime(gain, now + start + 0.012)
      toneGain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration)

      fundamental.type = 'sine'
      shimmer.type = 'triangle'
      fundamental.frequency.setValueAtTime(frequency, now + start)
      shimmer.frequency.setValueAtTime(frequency * 2, now + start)

      fundamental.connect(toneGain)
      shimmer.connect(toneGain)
      toneGain.connect(masterGain)

      fundamental.start(now + start)
      shimmer.start(now + start)
      fundamental.stop(now + start + duration + 0.02)
      shimmer.stop(now + start + duration + 0.02)
    }

    playTone(659.25, 0, 0.22, 0.55)
    playTone(987.77, 0.055, 0.24, 0.65)
    playTone(1318.51, 0.12, 0.2, 0.42)

    setTimeout(() => audioCtx.close?.(), 450)
  } catch (e) {
    console.warn('Audio not supported')
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

const prepararItemDiscount = () => {
  items.value.forEach(item => {
    if (item.descuento === undefined) {
      item.descuento = 0
    }
  })
}

const finalizarVenta = async () => {
  if (ventasStore.estaVacio) {
    toast.warning('El carrito está vacío')
    return
  }
  efectivoRecibido.value = total.value
  cambio.value = 0
  showPagoModal.value = true
}

const confirmarPago = async () => {
  if (metodoPago.value === 'efectivo' && efectivoRecibido.value < total.value) {
    toast.error('El monto recibido es menor al total')
    return
  }

  const itemsConDescuento = items.value.map(item => ({
    producto_id: item.id,
    cantidad: item.cantidad,
    precio_unitario: item.precio * (1 - (item.descuento || 0) / 100),
    descuento: item.descuento || 0
  }))

  const montoTotal = total.value
  const montoRecibido = efectivoRecibido.value
  const montoCambio = cambio.value

  const result = await ventasStore.registrarVenta({
    items: itemsConDescuento,
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
    
    // Imprimir automáticamente si está configurado
    if (config.emitir_ticket) {
      imprimirTicket(result.venta.id)
    }
  } else {
    toast.error(result.error || 'Error al registrar venta')
  }
}

const calcularCambio = () => {
  if (metodoPago.value === 'efectivo') {
    cambio.value = Math.max(0, efectivoRecibido.value - total.value)
  } else {
    cambio.value = 0
  }
}

const limpiarCarrito = async () => {
  const confirmed = await confirmDialog.requestConfirmation({
    title: 'Limpiar carrito',
    message: 'Se quitarán todos los productos de la venta actual.',
    confirmText: 'Limpiar',
    cancelText: 'Cancelar',
    tone: 'warning'
  })

  if (confirmed) {
    ventasStore.limpiarCarrito()
    toast.info('Carrito limpiado')
  }
}

const handleKeyboard = (e) => {
  if (showPagoModal.value || mostrarTicket.value || showItemDiscountModal.value) {
    if (e.key === 'Escape') {
      showPagoModal.value = false
      mostrarTicket.value = false
      showItemDiscountModal.value = false
    }
    if (e.key === 'Enter' && showPagoModal.value) {
      confirmarPago()
    }
    return
  }

  if (e.ctrlKey || e.metaKey) {
    switch (e.key.toLowerCase()) {
      case 'b':
        e.preventDefault()
        searchInput.value?.focus()
        break
      case 'd':
        e.preventDefault()
        if (!estaVacio.value) {
          prepararItemDiscount()
          showItemDiscountModal.value = true
        }
        break
      case 'x':
        e.preventDefault()
        if (!estaVacio.value) limpiarCarrito()
        break
      case '1':
        e.preventDefault()
        cambiarVista('cards')
        break
      case '2':
        e.preventDefault()
        cambiarVista('lista')
        break
      case 'enter':
        e.preventDefault()
        if (!estaVacio.value) finalizarVenta()
        break
    }
    return
  }

  if (e.key === 'Escape') {
    searchQuery.value = ''
  }
  if (e.key === 'Enter' && !estaVacio.value && document.activeElement.tagName !== 'INPUT') {
    e.preventDefault()
    finalizarVenta()
  }
}

watch(showPagoModal, (val) => {
  if (val) nextTick(() => {
    const input = document.querySelector('input[type="number"]')
    input?.focus()
  })
})

const imprimirTicket = async (ventaId) => {
  try {
    const token = localStorage.getItem('pos_token')
    if (!token) {
      toast.error('No hay sesión activa')
      return
    }
    const { data } = await api.get(`/ventas/ticket-token/${ventaId}`)
    const url = `/api/ventas/ticket/${ventaId}?token=${encodeURIComponent(data.token)}&paper=58`
    const printWindow = window.open(url, '_blank')
    if (!printWindow) {
      toast.warning('Permite ventanas emergentes para imprimir')
    }
  } catch (error) {
    console.error('Error printing ticket:', error)
    toast.error('Error al generar ticket para impresión')
  }
}

onMounted(async () => {
  await fetchConfig()
  await nextTick()
  vista.value = config.vista || 'cards'
  productosStore.fetchProductos()
  productosStore.fetchCategorias()
  window.addEventListener('keydown', handleKeyboard)
})

onUnmounted(() => {
  clearTimeout(addFeedbackTimer)
  window.removeEventListener('keydown', handleKeyboard)
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

.product-card {
  outline: 0 solid transparent;
}

.product-card-added {
  border-color: rgb(var(--color-primary));
  box-shadow: 0 0 0 3px rgb(var(--color-primary) / 0.14), var(--shadow-depth-2);
  transform: translateY(-1px) scale(0.995);
}
</style>
