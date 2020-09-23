import { Injectable } from '@angular/core';
import { map } from "rxjs/operators";

import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';

import { Mensaje } from "../interface/mensaje.interface";



@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private itemsCollection: AngularFirestoreCollection<Mensaje>;

  public chats : Mensaje[]=[];
  public usuario: any= {}; 

  constructor(private afs: AngularFirestore, public auth: AngularFireAuth) { 

    this.auth.authState.subscribe(user => {
      
      console.log("Estado del usuario", user);
      if (!user) {
        return;
      }

      this.usuario.nombre = user.displayName;
      this.usuario.uid    = user.uid;

    });
  }

  cargarMensajes(){
    this.itemsCollection = this.afs.collection<Mensaje>('chats', ref => ref.orderBy('fecha','desc').limit(5));
    return this.itemsCollection.valueChanges()
                                .pipe(map((mensajes:Mensaje[])=>{
                                  console.log(mensajes);
                                  this.chats = []

                                  for(let mensaje of mensajes){
                                    this.chats.unshift(mensaje);
                                  }
                                  return this.chats
                                }));
  }

  agregarMensaje(texto: string){

    let mensaje: Mensaje={
      nombre: this.usuario.nombre,
      mensaje: texto,
      fecha: new Date().getTime(),
      uid: this.usuario.uid
    }
    return this.itemsCollection.add(mensaje);
  }

  login(proveedor: string) {
    if (proveedor === "google") {
      
      this.auth.signInWithPopup(new auth.GoogleAuthProvider());
      
    } else {
      this.auth.signInWithPopup(new auth.FacebookAuthProvider());
    }
  }
  logout() {
    this.usuario = {};
    this.auth.signOut();
  }
}
