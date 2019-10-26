'use strict';
 
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
 

admin.initializeApp({
	credential: admin.credential.applicationDefault(),
  	databaseURL: 'ws://yoyopizza-nxfhwq.firebaseio.com/'
});
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
	
  
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

  
  function handlesaveVeg(agent){
   var c = agent.parameters.crust;
   var s = agent.parameters.size;
   var fn = agent.parameters.first_name;
   var pn = agent.parameters.phone_number;
   var da = agent.parameters.delivery_address;
   var t = agent.parameters.toppingsveg;
   const a = admin.database().ref('data').push();
   var id = a.key;
   var ct = agent.parameters.count;
   agent.add(`Your Order is Confirmed.
			  Your OrderId is  " ${id} ".
			  Keep this for all future References`);
   return a.set({
     	address:da,
     	count:ct,
   		crust:c,
     	first_name:fn,
     	phone_number:pn,
     	size:s,
     	toppings:t,
     	key:id,
     	Type:"Veg"
   });
  }
  
  
  function handlesaveNonVeg(agent){
   var c = agent.parameters.crust;
   var s = agent.parameters.size;
   var fn = agent.parameters.first_name;
   var pn = agent.parameters.phone_number;
   var da = agent.parameters.delivery_address;
   var t = agent.parameters.toppingsNonVeg;
   const a = admin.database().ref('data').push();
   var id = a.key;
   var ct = agent.parameters.count;
   agent.add(`Your Order is Confirmed.
			  Your OrderId is  " ${id} ".
			  Keep this for all future References`);
   return a.set({
     	address:da,
     	count:ct,
   		crust:c,
     	first_name:fn,
     	phone_number:pn,
     	size:s,
     	toppings:t,
     	key:id,
     	Type:"Non-Veg"
   });
  }
  
  
  function OrderStatus(agent){
    var name,count,Type,add;
    var c = agent.parameters.orderId;
    var obj = admin.database().ref('data/'+c);
    obj.on('value', function(data){
    	name = data.child("first_name").val();
      	count = data.child("count").val();
      	Type = data.child("Type").val();
      	add = data.child("address").val();
      agent.add(`Hey ${name}, your ${count} , ${Type} pizzas will be delivered to ${add} 
					within 30 minutes.`);
    }, function(err){
    	console.log(err);
      agent.add(`Try again`);
    });
    	
  	return;
  }
  
    
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('VegPizza', handlesaveVeg);
  intentMap.set('NonVeg', handlesaveNonVeg);
  intentMap.set('OrderStatus', OrderStatus);
  agent.handleRequest(intentMap);
});
