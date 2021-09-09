<!-- This is a template to get Feedback from the User -->
<template>

  <div>
    <div class="text-center">
          <img class="mb-3" src="assets/BDAGlogo.svg" alt="BigData@Geo Logo" height="85px">
          <img class="mb-3 offset-md-1" src="assets/EFRE-Foerderhinweis.svg" alt="EFRE Förderungshinweis" height="60px">
    </div>

    <h5 class="text-center">Wir würden gerne mehr darüber erfahren, was Ihnen gut gefallen hat und wo wir uns noch verbessern können.</h5>  

    <div class="container-feedback">
        
        <b-form @submit="handleSubmit" @submit.stop.prevent>
            <b-form-group
            label="Name"
            label-for="name-input"
            :state="usernameState"
            >
            <b-form-input
                id="name-input"
                type="text"
                v-model="username"
                :state="usernameState"
            ></b-form-input>
            <small id="nameOptional" class="form-text text-muted">Name ist optional</small>
            </b-form-group>
    
            <b-form-group
            label="E-Mail"
            label-for="email-input"
            invalid-feedback="Keine gültige E-Mail Adresse"
            :state="emailState"
            >
            <b-form-input
                id="email-input"
                type="email"
                v-model="email"
                invalid-feedback="Keine gültige E-Mail Adresse"
                :state="emailState"
            ></b-form-input>
            <small id="nameOptional" class="form-text text-muted">E-Mail ist optional</small>
            </b-form-group>
        
            <b-form-group
            label="Nachricht"
            label-for="feedback-input"
            invalid-feedback="Feedback ist notwendig"
            :state="feedbackState"
            >
            <b-form-textarea
                id="feedback-input"
                type="text"
                rows="6"
                v-model="feedback"
                :state="feedbackState"
                required
            ></b-form-textarea>
            </b-form-group>

            <div class="text-center mt-4" v-if="! success">
              <b-button class="align-middle btn-lg" variant="primary" type="submit" >Senden</b-button>
           </div>

           <div class="text-center mt-4 visible" v-if="success">
                    <h4>Vielen Dank für ihre Nachricht! </h4>
           </div>
        </b-form>

    </div>

    <p id="datenschutzText" class="text-center text-muted">
      Die personenbezogenen Daten, die Sie uns im Rahmen dieser Kontaktanfrage zur Verfügung stellen, werden nur für die Beantwortung Ihrer Kontaktaufnahme verwendet. 
    </p>

  </div>
</template>
<script>

import axios from 'axios';

  export default {
    data() {
      return {
        feedback: '',
        feedbackState: null,
        username: '',
        usernameState: null,
        email: '',
        emailState:null,
        success: false,
      }
    },
    methods: {
      checkFormValidity() {
          
        let state = true;

        if(this.email){
           this.emailState = true;
        }
        if(!this.feedback){
             this.feedbackState = false;
             state = false
        }else{
            this.feedbackState = true;
        }
        if(this.username){
            this.usernameState = true;
        }
        return state;
      },


      resetModal() {
        this.feedback = ''
        this.feedbackState = null
        this.username = ''
        this.email = ''
        this.usernameState= null,
        this.emailState = null,
        this.success = false
      },

      handleSubmit(){
          if(this.checkFormValidity()){
            axios({
                method: 'post',
                url: process.env.VUE_APP_EVA_API + '/feedback',
                data: {
                  email: this.email,
                  feedback: this.feedback,
                  name: this.username,
                }
              }).then((response) => {
                this.success  = true;

              }, (error) => {
                console.log(error);
              });
           }
      },
    }
  }
</script>

<style scoped>

@media only screen and (max-width: 768px) {
  
  .container-feedback {
    max-width: 95%;
    margin-bottom: 5px;
    margin-top: 5px;
    margin-left: auto;
    margin-right: auto;
  }

}

@media only screen and (min-width: 768px) {
  .container-feedback {
    max-width: 75%;
    margin-bottom: 35px;
    margin-top: 35px;
    margin-left: auto;
    margin-right: auto;
  }
}

</style>
