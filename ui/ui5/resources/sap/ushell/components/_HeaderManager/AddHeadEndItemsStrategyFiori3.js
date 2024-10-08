// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
sap.ui.define(["sap/base/Log"],function(L){"use strict";function v(E,i){var a=0,b,I;if(!E||!i){return false;}var n=i.some(function(I){var N=!sap.ui.getCore().byId(I);if(N){L.warning("Failed to find control with id '{id}'".replace("{id}",I));}return N;});if(n){return false;}if(i.length===1&&i[0]==="endItemsOverflowBtn"){return true;}for(b=0;b<E.length;b++){var c=i.indexOf(E[b]);if(c>-1){i.splice(c,1);if(i.length===0){return false;}}}for(b=0;b<E.length;b++){I=E[b];if(I!=="endItemsOverflowBtn"){a++;}if(a+i.length>10){L.warning("maximum of six items has reached, cannot add more items.");return false;}if(i.indexOf(I)>-1){return false;}}return true;}function A(c,i){var n=c.concat(i);var s={"sf":-2,"copilotBtn":-1,"NotificationsCountButton":1,"endItemsOverflowBtn":2,"meAreaHeaderButton":3,"productSwitchBtn":4};n.sort(function(a,b){var d=s[a]||0,B=s[b]||0;if(d===B){return a.localeCompare(b);}return d-B;});return n;}function e(c,V){var r=c;if(v(c,V)){r=A(c,V);}return r;}return{execute:e};});
