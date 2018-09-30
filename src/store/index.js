import Vue from 'vue'
import Vuex from 'vuex'
import *as firebase from 'firebase'


Vue.use(Vuex);

export const store = new Vuex.Store({
    state: {
        loadedMeetups: [
            {
            imageUrl: '', 
            id: 'cdsvdfvdfnfk',
            title:'Meetup in Nairobi',
            date:new Date(),
            location: 'Nairobi',
            description: 'It\'s Nairobi'
        },
            

            {imageUrl: 'https://cdn-travel.jumia.com/web_hotel_detail_gallery/merica-hotel-nakuru-511-216b7010f9aa9b371fbdeda78555b4cbb8c1246a.jpg',
            id: 'cdsvdfvcfdsk',
            title:'Meetup in Nakuru',
            date: new Date(),
            location: 'Nakuru',
            description: 'It\'s Nakuru'
        },
           
        ],
        user: null,
        loading: false,
        error: null
    },
    mutations: {
        registerUserForMeetup (state, payload) {
            const id = payload.id
            if(state.user.registeredMeetups.findIndex(meetup => meetup.id === id)>=0){
                return
            }
            state.user.registeredMeetups.push(id)
            state.user.fbKeys[id] = payload.fbKey
        },
        unregisterUserFromMeetup (state, payload) {
            const registeredMeetups = state.user.registeredMeetups
            registeredMeetups.splice(registeredMeetups.findIndex(meetup => meetup.payload), 1)
            Reflect.deleteProperty(state.user.fbKeys, payload)
        },
        setLoadedMeetups (state, payload){
            state.loadedMeetups = payload
        },
        createMeetup (state, payload) {
            state.loadedMeetups.push(payload)
        },
        updateMeetup (state, payload) {
            const meetup = state.loadedMeetups.find(meetup =>{
                return meetup.id === payload.id
            })
            if(payload.title) {
                meetup.title = payload.title
            }
            if(payload.description) {
                meetup.description = payload.description
            }
            if(payload.date) {
                meetup.date = payload.date
            }
            
        },
        setUser (state, payload) {
            state.user = payload
        },
        setLoading (state, payload){
            state.loading = payload
        },
        setError (state, payload) {
            state.error = payload
        },
        clearError (state) {
            state.error = null
        }
    },
    actions: {
        registerUserForMeetup ({commit, getters}, payload) {
           commit('setLoading', true)
           const user = getters.user
           firebase.database().ref('/users/' + user.id).child('/registrations/')
           .push(payload)
           .then(data => {
               commit('setLoading', false)
               commit('registerUserForMeetup', {id: payload, fbKey: data.key})
           })
           .catch(error => {
               console.log(error)
               commit('setLoading', false)
           })
        },
        unregisterUserFromMeetup ({commit, getters}, payload){
            commit('setLoading', true)
            const user = getters.user
            if(!user.fbKeys){
                return
            }
            const fbKey = user.fbKeys[payload]
            firebase.database().ref('/users/' + user.id + '/registrations/').child(fbKey)
                .remove()
                .then(() => {
                    commit('setLoading', false)
                    commit('unregisterUserFromMeetup', payload)
                })
                .catch(error => {
                    console.log(error)
                    commit('setLoading', false)
                }
            )
        },
        loadedMeetups ({commit}) {
            commit('setLoading', true)
            firebase.database().ref('meetups').once('value')
                .then((data) => {
                    const meetups = []
                    const obj = data.val()
                    for(let key in obj) {
                        meetups.push({
                            id: key,
                            title: obj[key].title,
                            description: obj[key].description,
                            imageUrl: obj[key].imageUrl,
                            date: obj[key].date,
                            location: obj[key].location,
                            creatorId: obj[key].creatorId
                        })
                    }
                    commit('setLoadedMeetups', meetups)
                    commit('setLoading', false)
                })
                .catch (
                    (error) => {
                        console.log(error)
                        commit('setLoading', true)
                    }
                )
        },
        createMeetup ({commit, getters}, payload) {
            const meetup = {
               title: payload.title,
               location: payload.location,
               description: payload.description, 
               date: payload.date.toISOString(),
               creatorId: getters.user.id
            }
            let imageUrl
            let key
            firebase.database().ref('meetups').push(meetup)
            .then((data) => {
                console.log(data)
                 key = data.key
                // console.log(key)
                // commit('createMeetup', {
                //     ...meetup,
                //     id: key
                    
                // })
                return key  
            })
            .then(key => {
                const filename = payload.image.name
                const ext = filename.slice(filename.lastIndexOf('.'))
                //storing the image to firebase
                return firebase.storage().ref('meetups/' + key + '.' + ext).put(payload.image)
            })
            .then(fileData => {
                imageUrl = fileData.metadata.getDownloadURLs()
                console.log(imageUrl)
                // return firebase.database().ref('meetups').child(key).update({imageUrl: imageUrl})
            })
            .then(() => {
               console.log(key)
                commit('createMeetup', {
                    ...meetup,
                    imageUrl: imageUrl,
                    id: key
                    
                })
            })
            
            .catch((error) => {
                console.log(error)
            })
            //reach out firebase and store it
            
        },
         async createMeetupRequest(context, payload) { 
             context.commit("setLoading", true); 
             context.commit("clearError");
              try  {
       // --> Repackage payload before pushing into DB // 
          // Add CreatorId
           const meetup = {
                title: payload.title,
                location: payload.location,
                image: payload.image, 
                description: payload.description,
                date: payload.date.toISOString(),
                creatorId: context.getters.user.id
                    }; 
                 // --> Push into DB, Meetup Data package and get response, // -> fbResponse will containmeetup.id as key // > Key is already in the DB 
                 const fbResponse = await firebase.database().ref("meetups").push(meetup); 
                 console.log(fbResponse);
                  // --> Grab key and add to meetup package 
                 meetup.id = fbResponse.key; 
                     // --> Handle image
                 const filename = payload.image.name;
                 ext = filename.slice(filename.lastIndexOf("."));
                   // --> Get storage location with a 
                   // key.ext filename // -> put image request to location 
                 const imgInfo = await firebase .storage().ref(`meetups/${fbResponse.key}.${ext}`).put(payload.image); 
                    // [sidenote] Discover here that downloadURLs no longer exist in metadata
                 console.log('this is the image info:', imgInfo); // --> Extract imageUrl from imgInfo 
                 const imagePath = imgInfo.metadata.fullPath; 
                 const imageUrl = await firebase.storage().ref().child(imagePath).getDownloadURL();
           
                 let key
                 let ext
                  // --> Add imageUrl to meetup package 
                meetup.imageUrl = imageUrl; 
                // --> Update meetup in DB with imageUrl 
                const fbUpdateResponse = await firebase.database().ref("meetups").child(fbResponse.key) .update({ imageUrl: imageUrl }); 
                  console.log(fbUpdateResponse);
                 // --> Finally, commit meetup data // -> Repackaged from create new Form // -> with added id from the Database key // -> with added imageUrl from the storage with a 
                 //    key.ext name 
               context.commit("createMeetup", meetup); 

                 } 
                   catch (error) {
                         context.commit("setLoading", false); 
                         context.commit("setError", error);
                          console.log(error.message);
                         }
              },  
              updateMeetupData ({commit}, payload) {
                commit('setLoading', true)
                const updateObj = {}
                if(payload.title) {
                    updateObj.title = payload.title
                }
                if(payload.description) {
                    updateObj.description = payload.description
                }
                if(payload.date) {
                    updateObj.date = payload.date
                }
                firebase.database().ref('meetups').child(payload.id).update(updateObj)
                .then(() => {
                    commit('setLoading', false)
                    commit('updateMeetup', payload)
                })
                .catch(error =>{
                    commit('setLoading', false)
                })
              },           
        signUserUp ({commit}, payload) {
            commit('setLoading', true)
            commit('clearError')
            firebase.auth().createUserWithEmailAndPassword(payload.email, payload.password)
            .then(
                user => {
                    commit('setLoading', false)
                    const newUser = {
                        id: user.uid,
                        registeredMeetups: [],
                        fbKeys: {}
                    }
                    commit('setUser', newUser)
                }
            )
            .catch(
                error => {
                    commit('setLoading',false)
                    commit('setError', error)
                    console.log(error)
                }
            )
        },
        signUserIn({commit}, payload) {
            commit('setLoading', true)
            commit('clearError')
            firebase.auth().signInWithEmailAndPassword(payload.email, payload.password)
            .then(
                user => {
                    const newUser = {
                        id: user.uid,
                        registeredMeetups: [],
                        fbKeys: {}
                    }
                    commit('setUser', newUser)
                }
            )
            .catch (
                error => {
                    commit('setLoading',false)
                    commit('setError', error)
                    console.log(error)
                }
            )
        },
        autoSignIn({commit}, payload) {
            commit('setUser', {
                id: payload.uid,
                 registeredMeetups: [],
                 fbKeys: {}
                })
        },
        fetchUserData({commit, getters}) {
            commit('setLoading', true)
            firebase.database().ref('/users/' + getters.user.id +'/registrations/').once('value')
            .then(data => {
                const dataPairs = data.val()
                let registeredMeetups = []
                let swappedPairs = {}
                for (let key in dataPairs) {
                    registeredMeetups.push(dataPairs[key])
                    swappedPairs[dataPairs[key]] = key
                }
                console.log(registeredMeetups)
                console.log(swappedPairs)

                const updateduser = {
                  id: getters.user.id,
                  registeredMeetups: registeredMeetups,
                  fbKeys: swappedPairs  
                }
                commit('setLoading', false)
                commit('setUser', updateduser)
            })
            .catch(error => {
                console.log(error)
                commit('setLoading', false)   
            })
        },
        logout ({commit}) {
            firebase.auth().signOut()
            commit('setUser', null)
        },
        clearError ({commit}) {
            commit('clearError')
        }
    },
    getters: {
        loadedMeetups (state) {
            return state.loadedMeetups.sort((meetupA, meetupB) => {
                return meetupA.date > meetupB.date
            })
        },
        featuredMeetups (state, getters) {
           return getters.loadedMeetups.slice(0, 5) 
        },
        loadedMeetup (state) {
            return(meetupId) => {
                return state.loadedMeetups.find((meetup) => {
                    return meetup.id === meetupId
                })
            }
        },
        user (state) {
            return state.user
        },
        loading (state) {
            return state.loading
        },
        error (state) {
            return state.error
        }
    }
})