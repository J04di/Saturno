class Cache extends Map {
    constructor(capacity) {
        super();
        this.capacity = capacity;
    }
    get(key) {
        if (!super.has(key)) {
            return undefined;
        }
        const value = super.get(key);
        super.delete(key);
        super.set(key, value);
        return value;
    }
    set(key, value) {
        if (super.size >= this.capacity) {
            super.delete(super.keys().next().value);
        }
        super.set(key, value);
        return this;
    }
}
const groupMetadatas = new Cache(10);
export { Cache, groupMetadatas }