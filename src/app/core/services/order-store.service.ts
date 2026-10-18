import { Injectable, signal, computed } from "@angular/core";
import { Product, CartLine, Order, OrderStatus } from "../models/product.model";
import { LocalOrderDb } from "./local-order-db.service";
import { PwaService } from "./pwa.service";
import { RemoteOrdersService } from "./remote-orders.service";
const CART_KEY = "fastorder_cart_v2",
  ORDERS_KEY = "fastorder_orders_v2";
function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
@Injectable({ providedIn: "root" })
export class OrderStore {
  private busy = false;
  constructor(
    private readonly localDb: LocalOrderDb,
    private readonly pwa: PwaService,
    public readonly remote: RemoteOrdersService,
  ) {
    void this.restoreIfNecessary().then(() => this.sync());
    window.addEventListener("online", () => void this.sync());
    window.addEventListener("focus", () => void this.sync());
    navigator.serviceWorker?.addEventListener("message", (event) => {
      if (event.data?.type === "SYNC_ORDERS") void this.sync();
    });
    this.remote.subscribe(() => void this.refreshFromServer());
  }
  private async restoreIfNecessary() {
    try {
      const [cart, orders] = await Promise.all([
        this.localDb.read<CartLine[]>(CART_KEY),
        this.localDb.read<Order[]>(ORDERS_KEY),
      ]);
      if (cart && !this.cart().length) {
        this.cart.set(cart);
      }
      if (orders && !this.orders().length) {
        this.orders.set(orders);
      }
    } catch (error) {
      console.warn("IndexedDB no disponible", error);
    }
  }
  readonly cart = signal<CartLine[]>(load<CartLine[]>(CART_KEY, []));
  readonly orders = signal<Order[]>(load<Order[]>(ORDERS_KEY, []));
  readonly orderType = signal<"Recojo en local" | "Para llevar">(
    "Recojo en local",
  );
  readonly quantity = computed(() =>
    this.cart().reduce((a, l) => a + l.quantity, 0),
  );
  readonly subtotal = computed(() =>
    this.cart().reduce((a, l) => a + l.quantity * l.unitPrice, 0),
  );
  readonly lastOrder = computed(() => this.orders()[0] ?? null);
  add(product: Product, quantity = 1, extras: string[] = [], notes = "") {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) return;
    const additions: { [key: string]: number } = {
      "Queso extra": 3,
      "Tocino extra": 4,
      Huevo: 3,
    };
    const selected = Array.from(new Set(extras))
      .filter((x) => x in additions)
      .sort();
    const unitPrice =
      product.price + selected.reduce((t, x) => t + additions[x], 0);
    const key = JSON.stringify([product.id, selected, notes.trim()]);
    this.cart.update((lines) => {
      const found = lines.find((x) => x.key === key);
      return found
        ? lines.map((x) =>
            x.key === key
              ? { ...x, quantity: Math.min(50, x.quantity + quantity) }
              : x,
          )
        : [
            ...lines,
            {
              key,
              product,
              quantity,
              extras: selected,
              notes: notes.trim(),
              unitPrice,
            },
          ];
    });
    this.persist();
  }
  changeQuantity(key: string, delta: number) {
    this.cart.update((lines) =>
      lines
        .map((l) =>
          l.key === key
            ? { ...l, quantity: Math.max(0, Math.min(50, l.quantity + delta)) }
            : l,
        )
        .filter((l) => l.quantity > 0),
    );
    this.persist();
  }
  remove(key: string) {
    this.cart.update((lines) => lines.filter((l) => l.key !== key));
    this.persist();
  }
  checkout(type: "Recojo en local" | "Para llevar"): {
    ok: boolean;
    id?: string;
  } {
    if (!this.cart().length) return { ok: false };
    const id =
      "FO-" +
      Date.now().toString(36).toUpperCase() +
      "-" +
      Math.random().toString(36).slice(2, 6).toUpperCase();
    const order: Order = {
      id,
      createdAt: new Date().toISOString(),
      items: JSON.parse(JSON.stringify(this.cart())),
      total: this.subtotal(),
      type,
      status: "Recibido",
      estimateMinutes: 15,
      syncState: "pendiente",
    };
    this.orders.update((o) => [order, ...o]);
    this.cart.set([]);
    this.persist();
    if (!navigator.onLine && "serviceWorker" in navigator) {
      void navigator.serviceWorker.ready.then(async (reg) => {
        if ("sync" in reg)
          try {
            await (
              reg as ServiceWorkerRegistration & {
                sync: { register(tag: string): Promise<void> };
              }
            ).sync.register("fastorder-pending");
          } catch {}
      });
    }
    void this.sync();
    return { ok: true, id };
  }
  async updateStatus(id: string, status: OrderStatus) {
    if (this.remote.serverAvailable()) {
      const confirmed = await this.remote.changeStatus(id, status);
      if (!confirmed) return;
      this.orders.update((items) =>
        items.map((o) =>
          o.id === id ? { ...confirmed, syncState: "confirmado" } : o,
        ),
      );
    } else
      this.orders.update((items) =>
        items.map((o) => (o.id === id ? { ...o, status } : o)),
      );
    this.persist();
    void this.pwa.notifyStatus(id, status);
  }
  async refreshFromServer() {
    const online = await this.remote.list();
    if (!online) return;
    const saved = new Map(this.orders().map((o) => [o.id, o]));
    for (const o of online) saved.set(o.id, { ...o, syncState: "confirmado" });
    this.orders.set(
      [...saved.values()].sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt),
      ),
    );
    this.persist();
  }
  async sync() {
    if (this.busy || !navigator.onLine) return;
    this.busy = true;
    try {
      const pending = this.orders().filter((o) => o.syncState === "pendiente");
      for (const o of pending) {
        const remote = await this.remote.submit(o);
        if (remote) {
          this.orders.update((items) =>
            items.map((v) =>
              v.id === o.id ? { ...remote, syncState: "confirmado" } : v,
            ),
          );
          this.persist();
        }
      }
      await this.refreshFromServer();
    } finally {
      this.busy = false;
    }
  }

  getOrder(id: string | null) {
    return this.orders().find((o) => o.id === id) ?? this.lastOrder();
  }
  private persist() {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(this.cart()));
      localStorage.setItem(ORDERS_KEY, JSON.stringify(this.orders()));
      void this.localDb.save(CART_KEY, this.cart()).catch(() => {});
      void this.localDb.save(ORDERS_KEY, this.orders()).catch(() => {});
    } catch {}
  }
}
