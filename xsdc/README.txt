XSDC = XS Direct Connection (vs. SQLCC)

Unfortunately we cannot switch off the default user at the moment in a subpackage 
and therefore a new package beneath sap.ino is needed for use cases (analytics, repository access)
for the user connection (application user is used for default connection) is needed.