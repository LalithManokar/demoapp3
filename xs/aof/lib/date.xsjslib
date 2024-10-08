function isNowBetween(sFrom, sTo) {
    var iNow = Date.now();
    var iFrom = Date.parse(sFrom);
    var iTo = Date.parse(sTo);
    return (iFrom <= iNow && iNow <= iTo);
}

function isInSequence(sEarlier, sLater) {
    var iEarlier = Date.parse(sEarlier);
    var iLater = Date.parse(sLater);
    return (iEarlier <= iLater);
}

// return < 0 if sDate lies in past and > 0 if sDate lies in future
function getRelationToNow(sDate) {
	var iNow = Date.now();
    var iDate = Date.parse(sDate);
    return (iDate - iNow);
}