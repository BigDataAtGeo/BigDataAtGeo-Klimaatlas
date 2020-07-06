import * as d3 from "d3";
export const colorGenerate= {
    methods:{
        generateColor(index,length){
            return d3.interpolateRainbow((index%7)/6);
        }
    }
}