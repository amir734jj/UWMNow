BEGIN TRANSACTION;
	CREATE TABLE 'user' ('id' INTEGER PRIMARY KEY AUTOINCREMENT, 'firstName' VARCHAR(255), 'lastName' VARCHAR(255), 'email' VARCHAR(255) UNIQUE, 'password' VARCHAR(255), 'hashcode' VARCHAR(255) UNIQUE, 'active' TINYINT(1) DEFAULT 0, 'admin' TINYINT(1) DEFAULT 0, 'createdAt' DATETIME NOT NULL, 'updatedAt' DATETIME NOT NULL);

	INSERT INTO 'user' (id,firstName,lastName,email,password,hashcode,active,admin,createdAt,updatedAt) VALUES (6,'Seyedamirhossein','Hesamian','hesamian@uwm.edu','HESAMIAN2015jj@','6a42fe46267df31e5040ba393d291158925a1d81',1,1,'2015-10-31 21:05:42.855 +00:00','2015-10-31 21:05:56.666 +00:00');

	CREATE TABLE 'news' ('id' INTEGER PRIMARY KEY AUTOINCREMENT, 'newsText' VARCHAR(255), 'newsDate' DATETIME, 'newsApprove' TINYINT(1) DEFAULT 0, 'hashcode' VARCHAR(255), 'newsUID' VARCHAR(255) UNIQUE, 'createdAt' DATETIME NOT NULL, 'updatedAt' DATETIME NOT NULL);

	INSERT INTO 'news' (id,newsText,newsDate,newsApprove,hashcode,newsUID,createdAt,updatedAt) VALUES (5,'Hello world!','2015-10-31 21:06:15.351 +00:00',0,'6a42fe46267df31e5040ba393d291158925a1d81','06c68f734bf1cc0118f1c5b17ce3564392e6bbb0','2015-10-31 21:06:15.353 +00:00','2015-10-31 21:06:15.353 +00:00');
	CREATE TABLE 'Sessions' ('sid' VARCHAR(255) PRIMARY KEY, 'expires' DATETIME, 'data' TEXT, 'createdAt' DATETIME NOT NULL, 'updatedAt' DATETIME NOT NULL);
COMMIT;
