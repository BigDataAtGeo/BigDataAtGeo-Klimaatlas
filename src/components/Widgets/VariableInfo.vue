<template>
  <div class="pb-2">
      
      <div v-if="this.variable.var_id=='huglin-year'"> <!-- hier richtige ID einfügen -->
      <div class="pr-2 float-left"> <b-button v-b-modal.m1 class="btn btn-light float-left" v-if="this.$store.state.variable!=null"><b-icon icon="info-circle"></b-icon></b-button></div>
            <b-modal id="m1" :title="this.variable.var" size="xl" :hide-footer="true" >
                <span v-html="this.variable.description"></span>
            </b-modal>
      </div>
      <h5>{{this.variable.var}} </h5>
      <span v-html="this.variable.description"></span>
  </div>
</template>

<script>
export default {
    name:"variableInfo",
    props:{
        variable:{
            type: Object,
            required:true
        }
    }
}
</script>

<style scoped>

div >>> td{
    min-width: 5vw;
    padding: 5px;
}
</style>