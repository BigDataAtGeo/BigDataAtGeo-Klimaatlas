import * as d3 from "d3";
export const colorGenerate= {
    methods:{
        generateColor(id,counter){
            if(counter>5) return d3.interpolateTurbo(0);
            if(counter==0&&this.$store.state.colors.indexOf(id)!=-1){
                return d3.interpolateTurbo((this.$store.state.colors.indexOf(id)%5)/4)
            }
            if(this.$store.state.colors[id%5]==id-counter){
                return d3.interpolateTurbo((id%5)/4);
            }else if(this.$store.state.colors[id%5]==0){
                this.$store.state.colors[id%5]=id-counter;
                return d3.interpolateTurbo((id%5)/4);
            }else{
                return this.generateColor(++id,++counter);
            }
        }
    }
}