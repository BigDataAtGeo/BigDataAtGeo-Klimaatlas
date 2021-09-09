/**
 * Generate colors, by cycling through a fixed set of colors
 */
export const colorGenerate = {
    data() {
        return {
            count: 0, // amount of generated colors
            //colors: ["#1F77B4", "#FF7F0E", "#2CA02C", "#D62728", "#9467BD", "#8C564B", "#E377C2", "#7F7F7F", "#BCBD22", "#17BECF"],
            colors: ["#17BECF", "#BCBD22", "#7F7F7F", "#7F7F7F", "#E377C2", "#8C564B", "#9467BD", "#D62728", "#2CA02C", "#FF7F0E", "#1F77B4"],

            /* These Colors are used for the SensorInformation and the corresponding Sensors, each Color with three different variants */
            //grün, orange, lila
            dataColors: [["#79fca9", "#44ab56", "#056005"],["#FF7A00", "#D44000", "#864000"],["#e14de3", "#99238c", "#520043"],["#bd7a61", "#b25037", "#a41414"]]
           
        }
    },
    methods: {
        generateColor() {
            return this.colors[this.count++ % this.colors.length];
        },
        amountColors() {
            return this.colors.length;
        },
        getDataColors(index){
            index=0;
            //at the moment all get the same colors, if different colors are needed use the indices for the color Pallete Array
            if(index < this.dataColors.length)
                return this.dataColors[index];
            else
                return this.dataColors[this.dataColors.length];
        }
    }
}

