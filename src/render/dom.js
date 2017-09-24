
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
 */
const domT = (src, parent = null) => {
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

    // Render attributes
    Object.keys(src.attrs).forEach(name => {
        const value = src.attrs[name];

        // Processing inline styles separately
        if (name === 'style') {
            Object.keys(value).forEach(propName => dst.style[propName] = value[propName]);
            return;
        }

        dst.setAttribute(name, value);
    });

    // Render children
    src.children.forEach(child => domT(child, dst));

    // Append to parent
    if (parent) {
        parent.appendChild(dst);
    }

    return dst;
};

export default domT;
