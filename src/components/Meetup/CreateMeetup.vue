<template>
 <v-container>
     <v-layout row>  
         <v-flex xs12 sm6 offset-sm3>
             <h2 class="secondary--text">Create a new Meetup</h2>
         </v-flex>
     </v-layout>
     <v-layout row>
         <v-flex xs12>
            <form @submit.prevent="oncreateMeetupRequest">
                 <v-layout row>
                     <v-flex xs12 sm6 offset-sm3>
                         <v-text-field name="title"
                         label="Title"
                         id="title"
                         v-model="title"
                         required>
                         </v-text-field>
                     </v-flex>
                 </v-layout>
                 <v-layout row>
                     <v-flex xs12 sm6 offset-sm3>
                         <v-text-field name="location"
                         label="Location"
                         id="location"
                         v-model="location"
                         required>
                         </v-text-field>
                     </v-flex>  
                 </v-layout>
                 <v-layout row>
                     <v-flex xs12 sm6 offset-sm3>
                         <v-btn raised class="info" @click="onPickFile">Upload Image</v-btn>
                         <input type="file" 
                         style="display: none" ref="fileInput"
                          accept="image/*"
                          @change="onFilePicked">
                     </v-flex>
                </v-layout>
                 <v-layout row>
                     <v-flex xs12 sm6 offset-sm3>
                         <img :src="imageUrl" height="150">
                     </v-flex>                    
                  </v-layout>
                     <v-layout row>
                     <v-flex xs12 sm6 offset-sm3>
                    <v-textarea
                            name="description"
                            auto-grow
                            label="Description"
                            rows="3"
                            id="description"
                            v-model="description"
                        ></v-textarea>        
                     </v-flex>
                 </v-layout> 
                 <v-layout row>
                     <v-flex xs12 sm6 offset-sm3>
                         <h4>Choose a date & Time</h4>
                     </v-flex>
                 </v-layout>
                 <v-layout row class="mb-2">
                     <v-flex xs12 sm6 offset-sm3>
                         <v-date-picker v-model="date" ></v-date-picker>
                         <p>{{date}}</p>
                     </v-flex>
                 </v-layout> 
                  <v-layout row>
                     <v-flex xs12 sm6 offset-sm3>
                         <v-time-picker v-model="time"></v-time-picker>
                          <p>{{time}}</p>
                     </v-flex>
                 </v-layout>                
                 <v-layout row>
                     <v-flex xs12 sm6 offset-sm3>
                         <v-btn class="primary" :disabled="!formIsValid"
                         type="submit">Create Meetup</v-btn>
                         {{submittableDateTime}}
                     </v-flex>
                 </v-layout>
             </form> 
         </v-flex>
     </v-layout>
 </v-container>
</template>

<script>
import moment from 'moment'
export default {
    data () {
        return {
            title: '',
            location: '',
            imageUrl: '',
            description: '',
            date: new Date(),
            time: new Date(),
            image: null
        }

    },
      created: function () {
        const dateTime = moment()
          this.date = dateTime.format('YYYY-MM-DD');this.time = dateTime.format('HH:mm') },
    computed: {
    formIsValid () {
        return this.title !== '' && this.location !== '' && this.description !== '' && this.imageUrl !== ''
    },
    submittableDateTime () {
      const date = new Date(this.date)
      const time = new Date(this.date)
      if(typeof this.time === 'string'){
          const hours = this.time.match(/^(\d+)/)[1]
          const minutes = this.time.match(/:(\d+)/)[1]
          date.setHours(hours)
          date.setMinutes(minutes) 
      }else {
        date.setHours(time.getHours())
        date.setMinutes(time.getMinutes())  
      }

      console.log(date)
      return date
    }    
    },
    methods: {
        oncreateMeetupRequest (){
            if(!this.formIsValid){
                return 
            }
            if(!this.image){
                return
            }
         const meetupData = {
             title: this.title,
             location: this.location,
             image: this.image,
             description: this.description,
             date: this.submittableDateTime
         }
         console.log('submitted');
         
         this.$store.dispatch('createMeetupRequest', meetupData) 
         this.$router.push('/meetups') 
        },
        onPickFile () {
            this.$refs.fileInput.click()
          },
        onFilePicked (event) {
            const files = event.target.files
            let filename = files[0].name
            if(filename.lastIndexOf('.') <=0){
                return alert('please add a valid file')
            }
            const fileReader = new FileReader()
            fileReader.addEventListener('load', () => {
              this.imageUrl = fileReader.result  
            })
            fileReader.readAsDataURL(files[0])
            this.image = files[0]
        }
    }
}
</script>
