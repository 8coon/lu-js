
const charMap = {
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '&': '&amp;',
    '\'': '&#39;',
};

const sanitize = string => string
    .replace(/[<>'"&]/g, (match, ...groups) => charMap[match]);

/**
 * @param {Node} src
 * @param parent = null
 * @param {{events: boolean = false}} options
 */
const domT = (src, parent = null, options) => {
    // We're handling text node
    if (typeof src !== 'object') {
        const text = sanitize(String(src));
        const dst = document.createTextNode(text);

        // Append to parent
        if (parent) {
            parent.appendChild(dst);
        }

        return dst;
    }

    const dst = document.createElement(src.tag);
    const events = options.events;
    let handlers;

    // Creating event handlers map
    if (events) {
        dst.__lou_handlers__ = dst.__lou_handlers__ || {};
        handlers = dst.__lou_handlers__;
    }

    // Render attributes
    Object.keys(src.attrs).forEach(name => {
        let value = src.attrs[name];

        // Processing inline styles separately
        if (name === 'style') {
            Object.keys(value).forEach(propName => dst.style[propName] = value[propName]);
            return;
        }

        // Processing event handlers
        const lowerName = name.toLowerCase();
        if (events && lowerName.startsWith('on')) {
            handlers[lowerName] = value;

            value = `this.__lou_handlers__['${lowerName}'](event)`;
        }

        dst.setAttribute(name, value);
    });

    // Render children
    src.children.forEach(child => domT(child, dst, options));

    // Append to parent
    if (parent) {
        parent.appendChild(dst);
    }

    // Call handler
    if (src.onRender) {
        src.onRender(dst);
    }

    return dst;
};

/**
 * @param {Node} root
 * @param {{events: boolean = false}} options
 */
export default (root, options = {}) => domT(root, null, options);
