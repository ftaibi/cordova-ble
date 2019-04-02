/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
 var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
        detailPage.hidden = true;
        this.iniciarBotones();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    iniciarBotones: function(){
        var buscar = document.getElementById('buscar');
        var deviceList = document.getElementById('deviceList');
        var mainPage = document.getElementById('mainPage');
        var detailPage = document.getElementById('detailPage');
        var vovler = document.getElementById('volver');
        var detailPage = document.getElementById('detailPage');
        var medir = document.getElementById('medir');
        var resultDiv = document.getElementById('resultDiv');
        var desconectar = document.getElementById('disconnect');
        var stop = document.getElementById('stop');
        var leer = document.getElementById('leer');
        var beatsPerMinute = document.getElementById('beatsPerMinute');
        var bp = document.getElementById('bp');

        leer.addEventListener('touchstart',this.leerDatos,false);
        stop.addEventListener('touchstart',this.stop,false);
        desconectar.addEventListener('touchstart',this.disconnect,false);
        volver.addEventListener('touchstart',this.showMainPage,false);
        buscar.addEventListener('touchstart',this.refrescarLista,false);
        deviceList.addEventListener('touchstart', this.connect, false); // assume not scrolling
        medir.addEventListener('touchstart',this.write,false);

    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.refrescarLista();
    },

    refrescarLista: function(){
        // empties the list
        deviceList.innerHTML = ''; 
        
        // buscará solo dispositivos de heartRate
        ble.scan([heartRate.service], 15, app.listar, app.onError);

    },

    listar:function(devices){
        //consola
        console.log(JSON.stringify(devices));

        //crea el boton en la vista
        var listItem = document.createElement('button'),

        //escribe en la vista
        html = '<b>' + devices.name + '</b><br/>' +
        'RSSI: ' + devices.rssi + '&nbsp;|&nbsp;' +
        devices.id;

        listItem.dataset.deviceId = devices.id;  // TODO
        listItem.innerHTML = html;
        deviceList.appendChild(listItem);
    },

    connect:function(e){
        console.log(e.target.dataset.deviceId);
        deviceId = e.target.dataset.deviceId;
        ble.connect(deviceId, app.onConnect, app.onError);
    },

    onConnect:function(e){
        app.showDetailPage();
        alert("Conectado");
        console.log('Conectado a: ' + deviceId);
        UUID_service = 'be940000-7333-be46-b7ae-689e71722bd5';
        UUID = 'be940001-7333-be46-b7ae-689e71722bd5';

       ble.startNotification(deviceId, heartRate.service, heartRate.measurement, app.onDataHeart, app.onFailure);

       ble.startNotification(deviceId, UUID_service, UUID , app.onData, app.onFailure);

    },

    disconnect:function(){
        ble.disconnect(deviceId, function(){console.log("Desconectado");});

    },
    write:function(e){
        console.log("Escribiendo en " + deviceId);
        var data = new Uint8Array([3, 2, 7, 0, 2, 100, -73]);
        var data2 = new Uint8Array([3, 9, 9, 0, 1, 3, 5, 20, -5]);

         //var UUID_service = '180d';
         //var UUID = '2a37';
         
         //var device_id = 'FA:1C:22:42:19:38';
         //console.log( JSON.stringify(new Uint8Array(data.buffer)));
         // console.log(deviceId + ' ' + UUID_service + ' ' + UUID+' '+data);

         //ble.writeWithoutResponse(deviceId, UUID_service, UUID, data.buffer, app.success, app.onFailure);

        //ble.write(deviceId, UUID_service, UUID, data.buffer, app.success, app.onFailure);

        ble.write(deviceId, UUID_service, UUID, data2.buffer, app.success2, app.onFailure);


        //escucha la pulsera, cuando esta midiendo el HeartRate, lo envia a la app y lo escribe
        // ble.startNotification(deviceId, heartRate.service, heartRate.measurement, app.onData, app.onError);

    },


    success:function(dato) {
        console.log("Midiendo... ");
        console.log(JSON.stringify(new Uint8Array(dato)));
        app.showDetailPage();     

        // UUID_service = '0000fee7-0000-1000-8000-00805f9b34fb';
        // UUID = '0000fea1-0000-1000-8000-00805f9b34fb';
        // resultDiv.innerHTML = resultDiv.innerHTML + "Sent: " + JSON.stringify(new Uint8Array(data.buffer)) + "<br/>";
        // resultDiv.innerHTML = resultDiv.innerHTML + "Sent: " + app.bytesToString(dato) + "<br/>";
        //resultDiv.scrollTop = resultDiv.scrollHeight;
        //ble.list(function(e){console.log(JSON.stringify(e.buffer));},function(error){console.log(error);});

    },


    success2:function(dato) {
        console.log("Leyendo... ");
        console.log(JSON.stringify(new Uint8Array(dato)));
        app.showDetailPage();     

        // UUID_service = '0000fee7-0000-1000-8000-00805f9b34fb';
        // UUID = '0000fea1-0000-1000-8000-00805f9b34fb';
        // resultDiv.innerHTML = resultDiv.innerHTML + "Sent: " + JSON.stringify(new Uint8Array(data.buffer)) + "<br/>";
        // resultDiv.innerHTML = resultDiv.innerHTML + "Sent: " + app.bytesToString(dato) + "<br/>";
        //resultDiv.scrollTop = resultDiv.scrollHeight;
        //ble.list(function(e){console.log(JSON.stringify(e.buffer));},function(error){console.log(error);});

    },

    onDataHeart:function(e) {
        // assuming heart rate measurement is Uint8 format, real code should check the flags
        // See the characteristic specs http://goo.gl/N7S5ZS
        var data = new Uint8Array(e);
        beatsPerMinute.innerHTML = data[1];
        console.log("Pulsación: " + data[1]);
    },

    onData:function(e) {
        // assuming heart rate measurement is Uint8 format, real code should check the flags
        // See the characteristic specs http://goo.gl/N7S5ZS
        var data = new Uint8Array(e);
        bp.innerHTML = data;

        console.log("Blood Pressure: " + data);
    },

   toHexString:function(byteArray) {
            return Array.from(byteArray, function(byte) {
            return ('0' + (byte & 0xFF).toString(16)).slice(-2);
      }).join('')
    },

    bytesToString:function(dato) {
        return String.fromCharCode.apply(null, new Uint8Array(dato));
    },

    stop:function(){
        //array de bytes que se envia a la pulsera para que pare de medir
        var data = new Uint8Array( [3, 2, 7, 0, 0, 38, -105]);
        ble.write(deviceId, UUID_service, UUID, data.buffer, app.successStop, app.onFailure);

    },

    successStop:function(buffer) {
        console.log("STOP");
    },
    
    onSuccess:function(e){
        console.log('ENVIADO');
    },

    onFailure:function(e){
        console.log('ERROR: ' + e);
    },

    showMainPage: function() {
        mainPage.hidden = false;
        detailPage.hidden = true;
    },

    showDetailPage: function() {
        mainPage.hidden = true;
        detailPage.hidden = false;
    },

    onError:function(reason){
        alert("Error " + reason);

    }


};

if('addEventListener' in document){
  document.addEventListener('DOMContentLoaded', function(){
    app.inicio();
}, false);
}

var heartRate = {
    service: '180d',
    measurement: '2a37'
};

var bloodP = {
    service: '1810',
    measurement: '2a35'
};


