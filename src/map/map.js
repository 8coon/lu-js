
const ArrayMap = function ArrayMap() {
    this.byLength = {};
};


Object.assign(ArrayMap.prototype, {

    prepare(key) {
        const byLength = this.byLength[key.length] || {};
        this.byLength[key.length] = byLength;

        const byFirst = byLength[key[0]];
        byLength[key[0]] = byFirst || {keys: [], values: []};
    },

    set(key, value) {
        this.prepare(key);
        const index = this.byLength[key.length][key[0]].keys.indexOf(key);

        if (index === -1) {
            this.byLength[key.length][key[0]].keys.push(key);
            this.byLength[key.length][key[0]].values.push(value);

            return;
        }

        this.byLength[key.length][key[0]].values[index] = value;
    },

    has(key) {
        if (!this.byLength[key.length]) {
            return false;
        }

        if (!this.byLength[key.length][key[0]]) {
            return false;
        }

        return this.byLength[key.length][key[0]].keys.indexOf(key) !== -1;
    },

    get(key) {
        if (!this.byLength[key.length]) {
            return void 0;
        }

        if (!this.byLength[key.length][key[0]]) {
            return void 0;
        }

        const index = this.byLength[key.length][key[0]].keys.indexOf(key);
        return this.byLength[key.length][key[0]].values[index];
    }

});


export default ArrayMap;
