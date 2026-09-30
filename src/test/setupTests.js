import "@testing-library/jest-dom/vitest";

const getComputedStyle = window.getComputedStyle;

Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn()
    })
});

global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
};

window.getComputedStyle = (element) => getComputedStyle(element);
