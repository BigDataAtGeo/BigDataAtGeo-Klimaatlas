
export const colorGenerate = {
    data() {
        return {
            count: 0,
            colors: ["#23171B", "#26BCE1", "#95FB51", "#FF821D", "#900C00"],
        }
    },
    methods: {
        generateColor() {
            return this.colors[this.count++ % this.colors.length];
        },
        amountColors() {
            return this.colors.length;
        },
    }
}
