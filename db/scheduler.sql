-- MySQL dump 10.13  Distrib 5.5.37, for debian-linux-gnu (x86_64)
--
-- Host: 192.168.0.219    Database: scheduler
-- ------------------------------------------------------
-- Server version	5.5.8

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `appt`
--

DROP TABLE IF EXISTS `appt`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `appt` (
  `appt_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `appt_group_id` int(10) unsigned DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `starts_at` datetime DEFAULT NULL,
  `ends_at` datetime DEFAULT NULL,
  PRIMARY KEY (`appt_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appt`
--

LOCK TABLES `appt` WRITE;
/*!40000 ALTER TABLE `appt` DISABLE KEYS */;
INSERT INTO `appt` VALUES (1,1,'xxx','xxxxxxxxxx','','2014-05-27 18:05:49','2014-04-29 16:00:00','2014-04-29 18:00:00'),(2,2,'CCCCCCCCCCc','CCCCCCCCC','','2014-05-27 18:07:07','2014-05-06 16:00:00','2014-05-06 18:00:00'),(3,2,'DDDDDDDDDDDDD','DDDDDDDDDDDd','','2014-05-27 18:07:07','2014-05-06 15:00:00','2014-05-06 19:01:00');
/*!40000 ALTER TABLE `appt` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `appt_group`
--

DROP TABLE IF EXISTS `appt_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `appt_group` (
  `appt_group_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime DEFAULT NULL,
  `created_by` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`appt_group_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appt_group`
--

LOCK TABLES `appt_group` WRITE;
/*!40000 ALTER TABLE `appt_group` DISABLE KEYS */;
INSERT INTO `appt_group` VALUES (1,'2014-05-27 18:05:49',2),(2,'2014-05-27 18:07:07',2);
/*!40000 ALTER TABLE `appt_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `appt_group_members`
--

DROP TABLE IF EXISTS `appt_group_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `appt_group_members` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `appt_group_id` int(10) unsigned DEFAULT NULL,
  `user_id` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appt_group_members`
--

LOCK TABLES `appt_group_members` WRITE;
/*!40000 ALTER TABLE `appt_group_members` DISABLE KEYS */;
INSERT INTO `appt_group_members` VALUES (1,1,2),(2,2,1);
/*!40000 ALTER TABLE `appt_group_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `appt_type`
--

DROP TABLE IF EXISTS `appt_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `appt_type` (
  `appt_type_id` int(10) unsigned NOT NULL DEFAULT '0',
  `title` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `duration` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`appt_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appt_type`
--

LOCK TABLES `appt_type` WRITE;
/*!40000 ALTER TABLE `appt_type` DISABLE KEYS */;
INSERT INTO `appt_type` VALUES (1,'A','A',60),(2,'B','B',90);
/*!40000 ALTER TABLE `appt_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_password`
--

DROP TABLE IF EXISTS `auth_password`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_password` (
  `user_id` int(10) unsigned NOT NULL DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `passhash` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_password`
--

LOCK TABLES `auth_password` WRITE;
/*!40000 ALTER TABLE `auth_password` DISABLE KEYS */;
INSERT INTO `auth_password` VALUES (1,'2014-05-27 18:04:47','9834876dcfb05cb167a5c24953eba58c4ac89b1adf57f28f2f9d09af107ee8f0'),(2,'2014-05-27 18:04:59','3e744b9dc39389baf0c5a0660589b8402f3dbb49b89b3e75f2c9355852a3c677');
/*!40000 ALTER TABLE `auth_password` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sequelizemeta`
--

DROP TABLE IF EXISTS `sequelizemeta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sequelizemeta` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `from` varchar(255) DEFAULT NULL,
  `to` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sequelizemeta`
--

LOCK TABLES `sequelizemeta` WRITE;
/*!40000 ALTER TABLE `sequelizemeta` DISABLE KEYS */;
INSERT INTO `sequelizemeta` VALUES (1,'20140527194814','20140527194814');
/*!40000 ALTER TABLE `sequelizemeta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `user_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime DEFAULT NULL,
  `given_name` varchar(255) DEFAULT NULL,
  `family_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `type` int(5) DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'2014-05-27 18:04:47','aaa','aaa','aaa',NULL),(2,'2014-05-27 18:04:59','bbb','bbb','bbb',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2014-05-27 21:33:13
