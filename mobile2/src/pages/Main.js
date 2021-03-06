import React, { useState, useEffect} from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import io from 'socket.io-client';
import { View, Text, StyleSheet, Image, SafeAreaView, TouchableOpacity } from 'react-native';

import api from '../services/api';

import logo from '../assets/logolia.png';
import like from '../assets/like.png';
import dislike from '../assets/dislike.png';
import itsamatch from '../assets/itsamatch.png';

export default function Main({ navigation }) {
    const id = navigation.getParam('user'); 

    const [ users, setUsers] = useState([ ]);      
    const [ matchDev, setMatchDev ] = useState(null);
  
    useEffect(() => {
        async function loadUsers() {
            const response = await api.get('/devs', {
                headers: {
                    user: id,
                }
            })        
                                                
        setUsers(response.data);
    }  
    
    loadUsers();
    
}, [id]);   

useEffect(() => {
    const socket = io('http://localhost:8080', {
        query: { user: id }            //enviando um 2º parâmetro (user id) pro backend na conexão
    });

    socket.on('match', dev => {             //ouvir o evento de 'match' (criado no backend - LikeControler)
        setMatchDev(dev);                   //quando recebo o match, tenho os dados do dev
    })                                      //agora o setMatchDev eh objeto que contem todas infos do dev
                                            //da pra usar matchDev varias vezes la embaixo
}, [id]);

    async function handleLike() {
        const [user, ...rest ] = users;   //ao inves de 'const user: users[0];'
                                          //[] vai pegar a 1ª posição do array e armazenar na variável user, o restante dos usuários serão armazenados numa segunda array,  ...rest
         
        await api.post(`/devs/${user._id}/likes`, null, {  //o mongo salva informação de id em jason (_id), ao invez de id
            headers: {user: id},
        })
        // setUsers(users.filter(user => user._id !== id));
        setUsers(rest); //o rest substitui o users.filter... 
    }   


    async function handleDislike() {
        const [user, ...rest ] = users;
        await api.post(`/devs/${user._id}/dislikes`, null, {
            headers: {user: id},
        })
        // setUsers(users.filter(user => user._id !== id));
        setUsers(rest); //o rest substitui o users.filter...
    }    

    async function handleLogout() {
        await AsyncStorage.clear();

        navigation.navigate('Login');
    }

    return (    
        <SafeAreaView style={styles.container}>
            <TouchableOpacity onPress={handleLogout}>
                <Image style={styles.logo} source={logo}/>
                <Text>Logged in as {id}</Text>
            </TouchableOpacity>
           

            <View style={styles.cardsContainer}>
           
                { users.length === 0
                    ? <Text style={styles.empty}>Acabou :(</Text>
                    : (                        
                        users.map((user, index) => (
                            <View  key={user._id} style={[styles.card, { zIndex: users.length - index }]}>  
                                
                            
                            <Image style={styles.avatar} source={{ uri: user.avatar }}/>
                            <View style={styles.footer}>
                                <Text style={styles.name}>{user.name}</Text>
                                <Text style={styles.bio} numberOfLines={3}>{user.bio}}</Text>
        
                            </View>
        
                        </View>
                        ))
                    ) }          

               
            </View>

            { users.length > 0 && (    // && so faz executar 2ª parte se 1ª condição passar
                <View style={styles.buttonsContainer}>
                <TouchableOpacity style={styles.button} onPress={handleLike}>
                    <Image source={like}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={handleDislike}>
                    <Image source={dislike}/>
                </TouchableOpacity>

            </View>
            )
            }
            {
                matchDev && (
                    <View style={styles.matchContainer}>
                        <Image style={styles.matchImage} source={itsamatch} />
                        <Image style={styles.matchAvatar} source={{ uri: matchDev.avatar }}/>

                <Text style={styles.matchName}>{matchDev.name}</Text>
                <Text style={styles.matchBio}>{matchDev.bio}</Text>

                        <TouchableOpacity onPress={() => setMatchDev(null)}>
                            <Text style={styles.closeMatch}>FECHAR</Text>

                        </TouchableOpacity>

                    </View>
                )
            }
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'space-between'
    },

    logo: {
        marginTop: 40,
    },
    empty: {
        alignSelf: 'center',
        color: '#999',
        fontSize: 24 ,
        fontWeight: 'bold'     
    },
    cardsContainer: {
        flex: 1,
        alignSelf: 'stretch',
        justifyContent: 'center',
        maxHeight: 500
    },

    card: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        margin: 30,
        overflow: 'hidden',
        position: 'absolute',  //para perfis (cards) ficarem um por cima do outro
        top: 0,   //para perfil (card) ocupar todo espaço de 500 px
        bottom: 0,
        left: 0,
        right: 0
    },
    avatar: {
        flex: 1,
        height: 300
    },

    footer: {
        backgroundColor:'#FFF',
        paddingHorizontal: 20,
        paddingVertical: 15
    },

    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color:'#333'
    },

    bio: {
        fontSize: 14,
        color:'#999',
        marginTop: 5,
        lineHeight: 18
    },
    buttonsContainer: {
        flexDirection: 'row',
        marginBottom: 60
    },
    button: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 20,
        elevation: 2, //para efeito de sombra no android
        shadowColor: '#000',
        shadowOffset: 0.05,
        shadowRadius: 2,
        shadowOffset: {
            width: 0,
            height: 2
        },       
    },

    matchContainer: {
        ...StyleSheet.absoluteFillObject,    //corresponde a:  position: absolute; top: 0; bottom: 0;left: 0;right:0;
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    matchImage: {
        height: 60,
        resizeMode: 'contain'  //propriedade e valor do react que ajustam largura proporcional
    },

    matchAvatar: {
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 5,
        borderColor:'#fff',
        marginVertical: 30,

    },

    matchName: {
        fontSize: 26,
        fontWeight: 'bold',
        color:'#fff'

    },
    matchBio: {
        marginTop: 10,
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        lineHeight: 24,
        textAlign: 'center',
        paddingHorizontal: 30

    },

    closeMatch: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        marginTop: 30,
        fontWeight: 'bold'
    },
})


