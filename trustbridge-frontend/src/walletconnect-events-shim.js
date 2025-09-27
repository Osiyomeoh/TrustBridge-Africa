// WalletConnect events module shim
class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    return this;
  }

  emit(event, ...args) {
    if (this.events[event]) {
      this.events[event].forEach(listener => {
        listener.apply(this, args);
      });
    }
    return this;
  }

  off(event, listener) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(l => l !== listener);
    }
    return this;
  }

  once(event, listener) {
    const onceWrapper = (...args) => {
      this.off(event, onceWrapper);
      listener.apply(this, args);
    };
    this.on(event, onceWrapper);
    return this;
  }

  removeAllListeners(event) {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
    return this;
  }
}

// IEvents interface for WalletConnect compatibility
export const IEvents = {
  on: Function,
  emit: Function,
  off: Function,
  once: Function,
  removeAllListeners: Function
};

// Additional common WalletConnect event exports
export { EventEmitter as IEventEmitter };
export { EventEmitter as EventEmitterInterface };

// Common event types and utilities
export const createEventEmitter = () => new EventEmitter();
export const isEventEmitter = (obj) => obj instanceof EventEmitter;

export { EventEmitter };
export default EventEmitter;
