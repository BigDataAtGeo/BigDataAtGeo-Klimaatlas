/**
 * Generate colors, by cycling through a fixed set of colors
 */
export const colorGenerate = {
    data() {
        return {
            count: 0, // amount of generated colors
            // colors: ["#23171B", "#26BCE1", "#95FB51", "#FF821D", "#900C00"],
            colors: ["#1F77B4", "#FF7F0E", "#2CA02C", "#D62728", "#9467BD", "#8C564B", "#E377C2", "#7F7F7F", "#BCBD22", "#17BECF"],
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
