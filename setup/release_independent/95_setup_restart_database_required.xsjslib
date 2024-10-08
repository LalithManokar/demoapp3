// This is a "dummy" step which will always succeed.
// Its purpose is to introduce a distinctive marker
// to ensure a manual database restart can be
// detected.

function check(oConnection) {
    return true;
}

function run(oConnection) {
    return true;
}

function clean(oConnection) {
    return true;
}