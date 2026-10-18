import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, RouterLink, Router } from "@angular/router";
import { OrderStore } from "../../core/services/order-store.service";
import { PRODUCTS } from "../../core/data/mock-data";
import { Product } from "../../core/models/product.model";
import { PwaService } from "../../core/services/pwa.service";

@Component({
  selector: "app-customer-page",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: ` <div class="site-root">
    <div class="announcement">
      <div class="container announce-inner">
        <span>✦ Hecho al momento, servido con sabor.</span
        ><span class="announcement-right"
          >Pedidos para recojo en tienda <span class="bullet">•</span> Lima,
          Perú</span
        >
      </div>
    </div>
    <header class="site-header">
      <div class="container header-inner">
        <a
          routerLink="/inicio"
          class="brandmark"
          aria-label="FastOrder - ir al inicio"
          ><img
            src="assets/fastorder-logo.png"
            alt="FastOrder - hamburguesas"
            width="244"
            height="59"
        /></a>
        <nav class="desktop-nav" aria-label="Navegación principal">
          <a
            routerLink="/inicio"
            [class.active]="view === 'menu' || view === 'offline'"
            >Inicio</a
          ><a
            routerLink="/productos"
            [class.active]="view === 'products' || view === 'detail'"
            >Nuestro menú</a
          ><a
            routerLink="/pedidos"
            [class.active]="view === 'history' || view === 'tracking'"
            >Mis pedidos</a
          ><a routerLink="/cocina"
            >Panel de cocina <span class="demo-tag">DEMO</span></a
          >
        </nav>
        <div class="header-actions">
          <a routerLink="/login" class="login-action"
            >◯ <span>Mi cuenta</span></a
          ><a routerLink="/carrito" class="cart-action" aria-label="Ver carrito"
            ><span>🛒</span><b>{{ store.quantity() }}</b></a
          ><button
            class="hamburger"
            (click)="mobileMenu = !mobileMenu"
            aria-label="Abrir navegación"
          >
            ☰
          </button>
        </div>
      </div>
      <nav *ngIf="mobileMenu" class="mobile-nav" (click)="mobileMenu = false">
        <a routerLink="/inicio">Inicio</a
        ><a routerLink="/productos">Nuestro menú</a
        ><a routerLink="/pedidos">Mis pedidos</a
        ><a routerLink="/perfil">Mi perfil</a
        ><a routerLink="/cocina">Panel de cocina</a>
      </nav>
    </header>
    <div *ngIf="!pwa.isOnline()" class="offline-ribbon" role="status">
      Sin conexión: los pedidos quedan pendientes y se enviarán al recuperar
      internet si el servidor está disponible.
    </div>
    <div *ngIf="pwa.updateReady()" class="pwa-notice" role="status">
      Hay una versión actualizada disponible.
      <button (click)="pwa.applyUpdate()">Actualizar</button>
    </div>
    <div *ngIf="view === 'offline'" class="offline-ribbon">
      ◉ Sin conexión: el catálogo guardado sigue disponible. Los pedidos nuevos
      se conservarán hasta poder enviarse al servidor.
    </div>

    <ng-container *ngIf="view === 'menu' || view === 'offline'">
      <section class="hero">
        <div class="container hero-inner">
          <div class="hero-copy">
            <span class="eyebrow-light"><i></i> SABOR QUE NO ESPERA</span>
            <h1>El antojo<br />es ahora<span>.</span></h1>
            <p>
              Hamburguesas irresistibles, ingredientes frescos y todo el sabor
              que te encanta. Elige, personaliza y pide en minutos.
            </p>
            <div class="hero-actions">
              <a class="button button-red" routerLink="/productos"
                >Explorar el menú <span>↗</span></a
              ><a class="button button-outline-light" routerLink="/pedidos"
                >Ver mis pedidos →</a
              >
            </div>
            <div class="hero-trust">
              <span class="trust-stars">★★★★★</span>
              <span>Preparado al momento · Calidad FastOrder</span>
            </div>
          </div>
          <div
            class="hero-image"
            role="img"
            aria-label="Hamburguesa de la casa"
          >
            <div class="hero-glow"></div>
            <img src="assets/burger.jpg" alt="Hamburguesa gourmet" />
            <div class="hero-sticker">
              <strong>100%</strong><span>sabor<br />auténtico</span>
            </div>
          </div>
        </div>
      </section>
      <section class="benefit-bar">
        <div class="container benefit-grid">
          <div>
            <span class="benefit-symbol">✳</span
            ><span
              ><b>Ingredientes frescos</b
              ><small>Calidad en cada bocado</small></span
            >
          </div>
          <div>
            <span class="benefit-symbol">◷</span
            ><span
              ><b>Pedido fácil y rápido</b
              ><small>Sin filas ni complicaciones</small></span
            >
          </div>
          <div>
            <span class="benefit-symbol">♨</span
            ><span
              ><b>Preparado para ti</b
              ><small>Recógelo en nuestro local</small></span
            >
          </div>
        </div>
      </section>
      <section class="section container categories-section">
        <div class="section-heading">
          <div>
            <span class="overline">ENCUENTRA TU FAVORITO</span>
            <h2>¿Qué se te antoja <em>hoy?</em></h2>
          </div>
          <a routerLink="/productos" class="text-link"
            >Ver todo el menú <span>↗</span></a
          >
        </div>
        <div class="category-tiles">
          <a
            class="category-photo-card"
            routerLink="/productos"
            [queryParams]="{ categoria: 'Hamburguesas' }"
            aria-label="Ver hamburguesas"
            ><img
              src="assets/clasica.jpg"
              alt="Hamburguesa con vegetales y pan artesanal"
              loading="lazy"
            /><span class="category-photo-copy"
              ><b>Hamburguesas</b
              ><small
                >Sabores que conquistan <span aria-hidden="true">↗</span></small
              ></span
            ></a
          >
          <a
            class="category-photo-card"
            routerLink="/productos"
            [queryParams]="{ categoria: 'Papas' }"
            aria-label="Ver papas y extras"
            ><img
              src="assets/papasfritas.jpg"
              alt="Papas fritas doradas"
              loading="lazy"
            /><span class="category-photo-copy"
              ><b>Papas y extras</b
              ><small
                >Para acompañar <span aria-hidden="true">↗</span></small
              ></span
            ></a
          >
          <a
            class="category-photo-card"
            routerLink="/productos"
            [queryParams]="{ categoria: 'Bebidas' }"
            aria-label="Ver bebidas"
            ><img
              src="assets/bebida.jpg"
              alt="Bebidas refrescantes"
              loading="lazy"
            /><span class="category-photo-copy"
              ><b>Bebidas</b
              ><small
                >Refresca tu momento <span aria-hidden="true">↗</span></small
              ></span
            ></a
          >
          <a
            class="category-photo-card"
            routerLink="/productos"
            aria-label="Explorar todo el menú"
            ><img
              src="assets/menu.jpg"
              alt="Selección de comidas del menú"
              loading="lazy"
            /><span class="category-photo-copy"
              ><b>Todo el menú</b
              ><small
                >Descubre más <span aria-hidden="true">↗</span></small
              ></span
            ></a
          >
        </div>
      </section>
      <section class="section feature-section">
        <div class="container">
          <div class="section-heading">
            <div>
              <span class="overline">LOS MÁS ELEGIDOS</span>
              <h2>Favoritos de la <em>casa.</em></h2>
              <p>Estos son algunos de nuestros productos más populares.</p>
            </div>
            <a routerLink="/productos" class="text-link"
              >Explorar todos <span>↗</span></a
            >
          </div>
          <div class="product-grid">
            <article class="web-product" *ngFor="let p of products.slice(0, 4)">
              <a
                routerLink="/producto"
                [queryParams]="{ id: p.id }"
                class="product-visual"
                [style.background]="productBackground(p)"
                ><span class="popular-badge" *ngIf="p.popular">★ FAVORITO</span
                ><img
                  [src]="productImage(p)"
                  [alt]="p.name"
                  loading="lazy"
                /><span class="image-fallback">{{ p.icon }}</span></a
              >
              <div class="product-details">
                <small>{{ p.category }}</small>
                <h3>{{ p.name }}</h3>
                <p>{{ p.description }}</p>
                <div class="product-bottom">
                  <strong>S/ {{ p.price.toFixed(2) }}</strong
                  ><a
                    class="round-add"
                    routerLink="/producto"
                    [queryParams]="{ id: p.id }"
                    aria-label="Ver detalle de producto"
                    >+</a
                  >
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
      <section class="container how-section">
        <div class="how-banner">
          <div>
            <span class="overline">ASÍ DE FÁCIL</span>
            <h2>Tú eliges.<br /><em>Nosotros cocinamos.</em></h2>
            <p>
              Explora nuestro menú, personaliza tus favoritos y sigue tu pedido
              desde cualquier dispositivo.
            </p>
            <a routerLink="/productos" class="button button-dark"
              >Comenzar mi pedido ↗</a
            >
          </div>
          <div class="how-steps">
            <div>
              <span>01</span><b>Elige tus favoritos</b
              ><small>Descubre el menú completo.</small>
            </div>
            <div>
              <span>02</span><b>Personalízalos</b
              ><small>Haz tu pedido a tu manera.</small>
            </div>
            <div>
              <span>03</span><b>Recoge y disfruta</b
              ><small>Te avisaremos cuando esté listo.</small>
            </div>
          </div>
        </div>
      </section>
    </ng-container>

    <section class="container inner-page" *ngIf="view === 'products'">
      <div class="inner-intro">
        <span class="overline">FASTORDER / CARTA</span>
        <h1>Un menú para <em>antojarse.</em></h1>
        <p>
          Encuentra tu favorito. Diseñado para pedir desde cualquier pantalla.
        </p>
      </div>
      <div class="catalog-layout">
        <aside class="catalog-sidebar">
          <h3>Categorías</h3>
          <button
            *ngFor="let cat of categories"
            (click)="category = cat"
            [class.chosen]="category === cat"
          >
            {{ cat }} <span>›</span>
          </button>
          <div class="sidebar-help">
            ✦<br /><b>¿No sabes qué pedir?</b>
            <p>Prueba uno de los favoritos de la casa.</p>
          </div>
        </aside>
        <div class="catalog-main">
          <div class="catalog-toolbar">
            <div class="filter-chips">
              <button
                *ngFor="let cat of categories"
                (click)="category = cat"
                [class.chosen]="category === cat"
              >
                {{ cat }}
              </button>
            </div>
            <label class="search-field"
              >⌕
              <input
                type="search"
                [(ngModel)]="query"
                placeholder="Buscar productos..."
            /></label>
          </div>
          <p class="result-count">
            Mostrando {{ filteredProducts.length }} productos
          </p>
          <div class="product-grid">
            <article class="web-product" *ngFor="let p of filteredProducts">
              <a
                routerLink="/producto"
                [queryParams]="{ id: p.id }"
                class="product-visual"
                [style.background]="productBackground(p)"
                ><img
                  [src]="productImage(p)"
                  [alt]="p.name"
                  loading="lazy"
                /><span class="image-fallback">{{ p.icon }}</span></a
              >
              <div class="product-details">
                <small>{{ p.category }}</small>
                <h3>{{ p.name }}</h3>
                <p>{{ p.description }}</p>
                <div class="product-bottom">
                  <strong>S/ {{ p.price.toFixed(2) }}</strong
                  ><a
                    class="round-add"
                    routerLink="/producto"
                    [queryParams]="{ id: p.id }"
                    >+</a
                  >
                </div>
              </div>
            </article>
          </div>
          <p *ngIf="!filteredProducts.length" class="empty-result">
            No encontramos productos con esa búsqueda.
          </p>
        </div>
      </div>
    </section>

    <section
      *ngIf="view === 'detail' && selectedProduct"
      class="container inner-page"
    >
      <a routerLink="/productos" class="crumb">← Volver al menú</a>
      <div class="detail-layout">
        <div class="detail-photo">
          <img
            [src]="productImage(selectedProduct)"
            [alt]="selectedProduct.name"
          />
        </div>
        <div class="detail-information">
          <span class="overline"
            >{{ selectedProduct.category | uppercase }} / FASTORDER</span
          >
          <h1>{{ selectedProduct.name }}</h1>
          <p class="detail-desc">{{ selectedProduct.description }}</p>
          <h2>S/ {{ detailTotal.toFixed(2) }}</h2>
          <div class="detail-options">
            <h3>Hazlo a tu manera</h3>
            <label *ngFor="let option of extraOptions"
              ><input
                type="checkbox"
                [checked]="selectedExtras.includes(option.name)"
                (change)="toggleExtra(option.name)"
              />
              {{ option.name }} <b>+ S/ {{ option.price.toFixed(2) }}</b></label
            >
            <h3>Indicaciones especiales</h3>
            <textarea
              [(ngModel)]="notes"
              maxlength="240"
              placeholder="Por ejemplo: sin cebolla, salsa aparte..."
            ></textarea>
            <h3>Cantidad</h3>
            <div class="quantity-control">
              <button
                (click)="changeDetailQuantity(-1)"
                aria-label="Reducir cantidad"
              >
                −</button
              ><strong>{{ detailQuantity }}</strong
              ><button
                (click)="changeDetailQuantity(1)"
                aria-label="Aumentar cantidad"
              >
                +
              </button>
            </div>
          </div>
          <button
            (click)="addSelectedToCart()"
            class="button button-red full-button"
          >
            Agregar al carrito · S/ {{ detailTotal.toFixed(2) }} →
          </button>
        </div>
      </div>
    </section>

    <section *ngIf="view === 'cart'" class="container inner-page">
      <div class="inner-intro compact">
        <span class="overline">TU SELECCIÓN</span>
        <h1>Tu <em>carrito.</em></h1>
        <p>Revisa las cantidades y los ingredientes antes de confirmar.</p>
      </div>
      <div class="checkout-layout">
        <div class="checkout-items">
          <div class="checkout-line" *ngFor="let item of store.cart()">
            <img
              class="cart-item-photo"
              [src]="productImage(item.product)"
              [alt]="item.product.name"
            />
            <div>
              <h3>{{ item.product.name }}</h3>
              <p>
                {{ item.extras.join(", ") || "Sin extras" }}
                {{ item.notes ? " · " + item.notes : "" }}
              </p>
              <div class="quantity-control">
                <button
                  (click)="store.changeQuantity(item.key, -1)"
                  aria-label="Disminuir"
                >
                  −</button
                ><strong>{{ item.quantity }}</strong
                ><button
                  (click)="store.changeQuantity(item.key, 1)"
                  aria-label="Aumentar"
                >
                  +
                </button>
              </div>
            </div>
            <div class="cart-line-end">
              <strong
                >S/ {{ (item.unitPrice * item.quantity).toFixed(2) }}</strong
              ><button class="remove-line" (click)="store.remove(item.key)">
                Eliminar
              </button>
            </div>
          </div>
          <div *ngIf="!store.cart().length" class="empty-cart">
            <h2>Tu carrito está vacío.</h2>
            <p>Explora el menú y agrega algo delicioso.</p>
            <a routerLink="/productos" class="button button-red">Ver menú →</a>
          </div>
          <a class="text-link" routerLink="/productos">← Seguir explorando</a>
        </div>
        <aside class="summary-card">
          <h2>Resumen del pedido</h2>
          <div>
            <span>Productos ({{ store.quantity() }})</span
            ><b>S/ {{ store.subtotal().toFixed(2) }}</b>
          </div>
          <div><span>Recojo en tienda</span><b>Gratis</b></div>
          <div class="summary-total">
            <span>Total</span><b>S/ {{ store.subtotal().toFixed(2) }}</b>
          </div>
          <a
            *ngIf="store.cart().length"
            routerLink="/tipo-pedido"
            class="button button-red full-button"
            >Continuar pedido →</a
          >
          <p>
            Sin conexión, tu pedido se conserva en el navegador hasta recuperar
            comunicación con el servidor.
          </p>
        </aside>
      </div>
    </section>

    <section
      *ngIf="view === 'orderType' || view === 'confirm'"
      class="container inner-page narrow-page"
    >
      <a class="crumb" routerLink="/carrito">← Regresar</a
      ><span class="overline"
        >PASO {{ view === "orderType" ? "1" : "2" }} DE 2</span
      >
      <h1>
        {{
          view === "orderType"
            ? "¿Cómo recogerás tu pedido?"
            : "Confirma tu pedido."
        }}
      </h1>
      <ng-container *ngIf="view === 'orderType'"
        ><div class="choice-list">
          <label
            class="select-card"
            [class.selected]="store.orderType() === 'Recojo en local'"
            ><input
              type="radio"
              name="delivery"
              [checked]="store.orderType() === 'Recojo en local'"
              (change)="store.orderType.set('Recojo en local')"
              value="Recojo en local"
            /><span>♨</span>
            <div>
              <b>Recojo en el local</b
              ><small>Te avisaremos cuando esté listo.</small>
            </div></label
          ><label
            class="select-card"
            [class.selected]="store.orderType() === 'Para llevar'"
            ><input
              type="radio"
              name="delivery"
              [checked]="store.orderType() === 'Para llevar'"
              (change)="store.orderType.set('Para llevar')"
              value="Para llevar"
            /><span>▣</span>
            <div>
              <b>Para llevar</b><small>Retira tu pedido en mostrador.</small>
            </div></label
          >
        </div>
        <button
          (click)="router.navigate(['/confirmacion'])"
          [disabled]="!store.cart().length"
          class="button button-red full-button"
        >
          Continuar →
        </button></ng-container
      ><ng-container *ngIf="view === 'confirm'"
        ><div class="summary-card">
          <h2>Resumen de tu pedido</h2>
          <div *ngFor="let item of store.cart()">
            <span>{{ item.product.name }} ×{{ item.quantity }}</span
            ><b>S/ {{ (item.unitPrice * item.quantity).toFixed(2) }}</b>
          </div>
          <div>
            <span>Modalidad</span><b>{{ store.orderType() }}</b>
          </div>
          <div class="summary-total">
            <span>Total</span><b>S/ {{ store.subtotal().toFixed(2) }}</b>
          </div>
          <p>
            Tu pedido se enviará a cocina; sin conexión quedará pendiente de
            sincronización.
          </p>
        </div>
        <button
          (click)="placeOrder()"
          [disabled]="!store.cart().length"
          class="button button-red full-button"
        >
          Confirmar pedido →
        </button></ng-container
      >
    </section>

    <section
      *ngIf="view === 'tracking'"
      class="container inner-page narrow-page"
    >
      <a class="crumb" routerLink="/pedidos">← Mis pedidos</a
      ><span class="overline">SEGUIMIENTO · DATOS LOCALES</span
      ><ng-container *ngIf="trackedOrder as order"
        ><h1>
          Tu pedido <em>#{{ order.id }}.</em>
        </h1>
        <p>
          Seguimiento actualizado con el servidor cuando está disponible. Los
          pedidos offline quedan pendientes.
        </p>
        <div class="tracking-card">
          <div class="tracking-top">
            <span class="status-chip preparing">{{
              order.syncState === "pendiente"
                ? "Pendiente de envío"
                : order.status
            }}</span
            ><b>{{ order.estimateMinutes }} min estimados</b>
          </div>
          <div
            class="timeline-row"
            *ngFor="let step of statusSteps; let i = index"
            [class.completed]="statusIndex(order.status) >= i"
          >
            <i>{{ statusIndex(order.status) >= i ? "✓" : i + 1 }}</i>
            <div>
              <b>{{ step }}</b
              ><small>{{
                statusIndex(order.status) >= i
                  ? "Etapa registrada"
                  : "Pendiente"
              }}</small>
            </div>
          </div>
        </div>
        <div class="summary-card">
          <h2>Productos</h2>
          <div *ngFor="let item of order.items">
            <span>{{ item.product.name }} ×{{ item.quantity }}</span
            ><b>S/ {{ (item.unitPrice * item.quantity).toFixed(2) }}</b>
          </div>
          <div class="summary-total">
            <span>Total</span><b>S/ {{ order.total.toFixed(2) }}</b>
          </div>
        </div></ng-container
      >
      <div *ngIf="!trackedOrder" class="empty-cart">
        Todavía no tienes pedidos. <a routerLink="/productos">Explorar menú</a>
      </div>
    </section>

    <section *ngIf="view === 'history'" class="container inner-page">
      <div class="inner-intro compact">
        <span class="overline">TU EXPERIENCIA</span>
        <h1>Mis <em>pedidos.</em></h1>
        <p>
          Pedidos registrados en este dispositivo y sincronizados con cocina
          cuando hay conexión.
        </p>
      </div>
      <div class="orders-table">
        <div class="orders-heading">
          <span>Pedido</span><span>Fecha</span><span>Importe</span
          ><span>Estado</span><span></span>
        </div>
        <div class="order-row" *ngFor="let order of store.orders()">
          <b
            >#{{ order.id }}
            <small *ngIf="order.syncState === 'pendiente'"
              >· Pendiente de envío</small
            ></b
          ><span>{{ order.createdAt | date: "dd/MM/yyyy HH:mm" }}</span
          ><strong>S/ {{ order.total.toFixed(2) }}</strong
          ><span
            class="status-chip"
            [class.ready]="
              order.status === 'Entregado' ||
              order.status === 'Listo para recoger'
            "
            [class.preparing]="order.status !== 'Entregado'"
            >{{ order.status }}</span
          ><a routerLink="/seguimiento" [queryParams]="{ id: order.id }"
            >Ver detalle →</a
          >
        </div>
        <div *ngIf="!store.orders().length" class="empty-cart">
          <h2>Aún no hay pedidos</h2>
          <p>Cuando confirmes tu primera orden, aparecerá aquí.</p>
          <a routerLink="/productos" class="button button-red">Ir al menú →</a>
        </div>
      </div>
    </section>

    <section
      *ngIf="view === 'login'"
      class="container inner-page narrow-page auth-page"
    >
      <span class="overline">BIENVENIDO A FASTORDER</span>
      <h1>Qué bueno <em>verte.</em></h1>
      <p>
        Vista de acceso. La autenticación se implementará en una fase posterior.
      </p>
      <div class="auth-card">
        <label
          >Correo electrónico<input
            type="email"
            placeholder="nombre&#64;correo.com" /></label
        ><label
          >Contraseña<input type="password" placeholder="••••••••" /></label
        ><a routerLink="/perfil" class="button button-red full-button"
          >Explorar perfil de ejemplo →</a
        ><small>Acceso demostrativo; no se registran credenciales.</small>
      </div>
    </section>
    <section
      *ngIf="view === 'profile'"
      class="container inner-page narrow-page"
    >
      <span class="overline">ÁREA PERSONAL</span>
      <h1>Mi <em>perfil.</em></h1>
      <div class="profile-box">
        <div class="profile-avatar">JC</div>
        <div>
          <h2>Juan Carlos</h2>
          <p>juan&#64;ejemplo.com</p>
        </div>
      </div>
      <div class="profile-links">
        <a routerLink="/pedidos">Mis pedidos <span>→</span></a
        ><a routerLink="/instalar">Instalar FastOrder <span>→</span></a
        ><button
          type="button"
          (click)="pwa.enablePushNotifications()"
          class="pwa-notifications"
        >
          Activar notificaciones de pedidos ({{ pwa.notificationPermission() }})
          <span>→</span></button
        ><a routerLink="/offline">Vista de conexión offline <span>→</span></a
        ><a routerLink="/inicio">Volver al inicio <span>→</span></a>
      </div>
    </section>
    <section
      *ngIf="view === 'install' || view === 'sync'"
      class="container inner-page narrow-page centered-page"
    >
      <div class="info-illustration">{{ view === "install" ? "↗" : "✓" }}</div>
      <span class="overline">EXPERIENCIA PWA · DISEÑO</span>
      <h1>
        {{
          view === "install"
            ? "FastOrder siempre a mano."
            : "Sincronización completada."
        }}
      </h1>
      <p>
        {{
          view === "install"
            ? "Puedes instalar FastOrder desde el navegador compatible o desde el menú de instalación del navegador."
            : "Al recuperar conexión, los pedidos pendientes se enviarán al servidor FastOrder cuando esté disponible."
        }}
      </p>
      <button
        *ngIf="view === 'install' && pwa.installAvailable()"
        (click)="pwa.promptInstall()"
        class="button button-red"
      >
        Instalar FastOrder</button
      ><a routerLink="/inicio" class="button button-red">Volver al inicio →</a>
    </section>
    <footer class="site-footer">
      <div class="container footer-grid">
        <div>
          <a routerLink="/inicio" class="brandmark footer-brand"
            ><img src="assets/fastorder-logo.png" alt="FastOrder"
          /></a>
          <p>
            Comida extraordinaria, sin complicaciones. Una experiencia web
            diseñada para cualquier pantalla.
          </p>
        </div>
        <div>
          <b>Explora</b><a routerLink="/inicio">Inicio</a
          ><a routerLink="/productos">Menú</a
          ><a routerLink="/pedidos">Mis pedidos</a>
        </div>
        <div>
          <b>Proyecto</b><a routerLink="/cocina">Panel de cocina</a
          ><a routerLink="/offline">Diseño offline</a
          ><a routerLink="/instalar">Diseño instalable</a>
        </div>
      </div>
      <div class="container footer-bottom">
        <span>© 2026 FastOrder · Prototipo académico de interfaz</span
        ><span>Fase 4 · PWA offline local</span>
      </div>
    </footer>
  </div>`,
})
export class CustomerPageComponent {
  view = "menu";
  products = PRODUCTS;
  mobileMenu = false;
  query = "";
  category = "Todos";
  selectedProduct: Product = PRODUCTS[1];
  selectedExtras: string[] = [];
  notes = "";
  detailQuantity = 1;
  extraOptions = [
    { name: "Queso extra", price: 3 },
    { name: "Tocino extra", price: 4 },
    { name: "Huevo", price: 3 },
  ];
  statusSteps = [
    "Recibido",
    "En preparación",
    "Listo para recoger",
    "Entregado",
  ];
  get detailTotal() {
    return (
      (this.selectedProduct.price +
        this.selectedExtras.reduce(
          (total, name) =>
            total +
            (this.extraOptions.find((x) => x.name === name)?.price || 0),
          0,
        )) *
      this.detailQuantity
    );
  }
  get trackedOrder() {
    return this.store.getOrder(this.route.snapshot.queryParamMap.get("id"));
  }
  toggleExtra(name: string) {
    this.selectedExtras = this.selectedExtras.includes(name)
      ? this.selectedExtras.filter((x) => x !== name)
      : [...this.selectedExtras, name];
  }
  changeDetailQuantity(delta: number) {
    this.detailQuantity = Math.min(
      50,
      Math.max(1, this.detailQuantity + delta),
    );
  }
  addSelectedToCart() {
    this.store.add(
      this.selectedProduct,
      this.detailQuantity,
      this.selectedExtras,
      this.notes,
    );
    this.router.navigate(["/carrito"]);
  }
  placeOrder() {
    const result = this.store.checkout(this.store.orderType());
    if (result.ok)
      this.router.navigate(["/seguimiento"], {
        queryParams: { id: result.id },
      });
  }
  statusIndex(status: string) {
    return this.statusSteps.indexOf(status);
  }
  categories = ["Todos", "Hamburguesas", "Papas", "Bebidas"];
  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public store: OrderStore,
    public pwa: PwaService,
  ) {
    this.view = route.snapshot.data["view"] || "menu";
    this.category = route.snapshot.queryParamMap.get("categoria") || "Todos";
    const id = Number(route.snapshot.queryParamMap.get("id"));
    this.selectedProduct = PRODUCTS.find((p) => p.id === id) ?? PRODUCTS[1];
  }
  get filteredProducts(): Product[] {
    return this.products.filter(
      (p) =>
        (this.category === "Todos" || p.category === this.category) &&
        [p.name, p.description]
          .join(" ")
          .toLowerCase()
          .includes(this.query.toLowerCase()),
    );
  }
  productBackground(p: Product) {
    return p.category === "Bebidas"
      ? "#f0e7dc"
      : p.category === "Papas"
        ? "#f8ebd7"
        : "#f7ebdb";
  }
  productImage(p: Product): string {
  const images: Record<string, string> = {
    'Clásica FastOrder': '/assets/clasica.jpg',
    'Doble Carne': '/assets/doblecarne.jpg',
    'Chicken Crispy': '/assets/crispy.jpg',
    'Veggie Burger': '/assets/veggie.jpg'
  };

  return images[p.name] || '/assets/burger.jpg';
}
}
