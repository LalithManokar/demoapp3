sap.ui.define(['sap/chart/coloring/ColoringUtils','sap/chart/coloring/CriticalityType','sap/chart/ChartLog'],function(C,a,b){"use strict";var T={};var M={formulas:{}};var N=a.Negative;var c=a.Critical;var P=a.Positive;var d=a.Neutral;function g(u,s,l){return{upperBound:u,CriticalityType:s};}T.fillOmit=function(A,t,D){D.hi=(D.hi==undefined)?Number.POSITIVE_INFINITY:D.hi;D.lo=(D.lo==undefined)?Number.NEGATIVE_INFINITY:D.lo;t.hi=(t.hi==undefined)?D.hi:t.hi;t.lo=(t.lo==undefined)?D.lo:t.lo;A.hi=(A.hi==undefined)?t.hi:A.hi;A.lo=(A.lo==undefined)?t.lo:A.lo;};T.checkThreshold=function(D,A,t,o,e){var h;var l=C.isNumber(A.lo,o.lo,t.lo);var i=C.isNumber(A.hi,t.hi,o.hi);switch(D){case'maximize':h=l&&(o.lo<=t.lo&&t.lo<=A.lo);break;case'minimize':h=i&&(A.hi<=t.hi&&t.hi<=o.hi);break;case'target':h=(l&&i)&&(o.lo<=t.lo)&&(t.lo<=t.hi)&&(t.hi<=o.hi)&&(t.lo<=A.lo)&&(A.lo<=A.hi)&&(A.hi<=t.hi);break;default:}if(!h){var n=e?"ConstantThresholds":"DynamicThresholds";throw new b('error','Colorings.Criticality.'+n,'Invalid Thresholds settings.');}};T.MBCimprovement=function(D,A,t,o){var h=o.hi;var i=o.lo;var j=t.hi;var k=t.lo;var l=A.hi;var m=A.lo;var s=[];var B,n;switch(D){case'maximize':B=[i,k,m,Number.POSITIVE_INFINITY];n=[N,c,d,P];break;case'minimize':B=[l,j,h,Number.POSITIVE_INFINITY];n=[P,d,c,N];break;case'target':B=[i,k,m,l,j,h,Number.POSITIVE_INFINITY];n=[N,c,d,P,d,c,N];break;default:throw new Error('Unsupported ImprovementDirection: '+D);}var r=[];switch(D){case'maximize':r[0]=(i===-Infinity);r[1]=(i===k);r[2]=(k===m);r[3]=(m===Infinity);break;case'minimize':r[0]=(l===-Infinity);r[1]=(l===j);r[2]=(j===h);r[3]=(h===Infinity);break;case'target':r[0]=(i===-Infinity);r[1]=(i===k);r[2]=(k===m);r[3]=(m===l);r[4]=(l===j);r[5]=(j===h);r[6]=(h===Infinity);break;default:throw new Error('Unsupported ImprovementDirection: '+D);}B=B.filter(function(e,p){return!r[p];});n=n.filter(function(e,p){return!r[p];});s=n.map(function(e,p){return g(B[p],e,0);});return{segments:s,min:Number.POSITIVE_INFINITY,max:Number.NEGATIVE_INFINITY};};function f(e){return[function(o,h){return e(o,h);}];}T.improvement=function(D,m,A,t,o){var e=o.hi;var h=o.lo;var i=t.hi;var j=t.lo;var k=A.hi;var l=A.lo;var n=C.thresholdValue([e,Number.POSITIVE_INFINITY]);var p=C.thresholdValue([h,Number.NEGATIVE_INFINITY]);var q=C.thresholdValue([i,e,Number.POSITIVE_INFINITY]);var r=C.thresholdValue([j,h,Number.NEGATIVE_INFINITY]);var s=C.thresholdValue([k,i,e,Number.POSITIVE_INFINITY]);var u=C.thresholdValue([l,j,h,Number.NEGATIVE_INFINITY]);var v={};switch(D){case'maximize':v["Negative"]=(h==-Infinity)?null:f(M.formulas.maximize.negative(m,p));v["Critical"]=(h==j)?null:f(M.formulas.maximize.critical(m,p,r));v["Neutral"]=(j==l)?null:f(M.formulas.maximize.critical(m,r,u));v["Positive"]=(l==Infinity)?null:f(M.formulas.maximize.positive(m,u));break;case'minimize':v["Negative"]=(e==Infinity)?null:f(M.formulas.minimize.negative(m,n));v["Critical"]=(i==e)?null:f(M.formulas.minimize.critical(m,q,n));v["Neutral"]=(k==i)?null:f(M.formulas.minimize.neutral(m,s,q));v["Positive"]=(k==-Infinity)?null:f(M.formulas.minimize.positive(m,s));break;case'target':v["Negative"]=(h==-Infinity&&e===Infinity)?null:f(M.formulas.target.negative(m,p,n));v["Critical"]=(h==j&&i==e)?null:f(M.formulas.target.critical(m,p,r,q,n));v["Neutral"]=(j==l&&k==i)?null:f(M.formulas.target.neutral(m,r,u,s,q));v["Positive"]=f(M.formulas.target.positive(m,u,s));break;default:throw new Error('Unsupported ImprovementDirection: '+D);}return v;};M.formulas.maximize={negative:function(m,D){return function(o,A){var n=o[m];var e=D(o,A);return C.isInRange(n,Number.NEGATIVE_INFINITY,e,null,false);};},critical:function(m,D,t){return function(o,A){var n=o[m];var e=D(o,A);var h=t(o,A);return C.isInRange(n,e,h,true,false);};},neutral:function(m,t,A){return function(o,e){var n=o[m];var h=t(o,e);var i=A(o,e);return C.isInRange(n,h,i,true,false);};},positive:function(m,A){return function(o,e){var n=o[m];var h=A(o,e);return C.isInRange(n,h,Number.POSITIVE_INFINITY,true);};}};M.formulas.minimize={negative:function(m,D){return function(o,A){var n=o[m];var e=D(o,A);return C.isInRange(n,e,Number.POSITIVE_INFINITY,false);};},critical:function(m,t,D){return function(o,A){var n=o[m];var e=t(o,A);var h=D(o,A);return C.isInRange(n,e,h,false,true);};},neutral:function(m,A,t){return function(o,e){var n=o[m];var h=A(o,e);var i=t(o,e);return C.isInRange(n,h,i,false,true);};},positive:function(m,A){return function(o,e){var n=o[m];var h=A(o,e);return C.isInRange(n,Number.NEGATIVE_INFINITY,h,null,true);};}};M.formulas.target={negative:function(m,D,e){return function(o,A){var n=o[m];var h=D(o,A);var i=e(o,A);var j=C.isInRange(n,Number.NEGATIVE_INFINITY,h,null,false);var k=C.isInRange(n,i,Number.POSITIVE_INFINITY,false);return j||k;};},critical:function(m,D,t,e,h){return function(o,A){var n=o[m];var i=D(o,A),j=t(o,A);var k=e(o,A),l=h(o,A);var p=C.isInRange(n,i,j,true,false);var q=C.isInRange(n,k,l,false,true);return p||q;};},neutral:function(m,t,A,e,h){return function(o,i){var n=o[m];var j=t(o,i),k=A(o,i);var l=e(o,i),p=h(o,i);var q=C.isInRange(n,j,k,true,false);var r=C.isInRange(n,l,p,false,true);return q||r;};},positive:function(m,A,e){return function(o,h){var n=o[m];var i=A(o,h);var j=e(o,h);return C.isInRange(n,i,j,true,true);};}};return T;});
