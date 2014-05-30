DROP TABLE IF EXISTS session;
CREATE TABLE session (
  sid varchar(255) NOT NULL PRIMARY KEY,
  touched TIMESTAMP NOT NULL,
  data text,
  KEY(touched)
);
