#Ma base de données : 

CREATE TABLE Salle(
        id_salle                   int(11) Auto_increment  NOT NULL ,
        Nom                        Varchar(25) NOT NULL ,
        materiel                   Text NOT NULL ,
        capacite                   Int NOT NULL ,
        debut_reserver             Datetime NOT NULL ,
        fin_reserver               Datetime,
        id_utilisateur_Utilisateur Int,
        PRIMARY KEY (id_salle)
)ENGINE=InnoDB;

CREATE TABLE Formation(
        id_formation int(11) Auto_increment  NOT NULL ,
        libelle      Varchar(25) NOT NULL ,
        programme    Text NOT NULL ,
        type         Varchar(25) NOT NULL ,
        duree        Varchar(25) NOT NULL ,
        support      Varchar(25) NOT NULL ,
        PRIMARY KEY (id_formation)
)ENGINE=InnoDB;

CREATE TABLE Formateur(
        id_formateur int(11) Auto_increment  NOT NULL ,
        nom          Varchar(25) NOT NULL ,
        prenom       Varchar(25) NOT NULL ,
        PRIMARY KEY (id_formateur)
)ENGINE=InnoDB;

CREATE TABLE Utilisateur(
        id_utilisateur            int(11) Auto_increment  NOT NULL ,
        nom                       Varchar(25) NOT NULL ,
        prenom                    Varchar(25) NOT NULL ,
        mail                      Varchar(25) NOT NULL ,
        id_reservation_Restaurant Int NOT NULL ,
        PRIMARY KEY (id_utilisateur)
)ENGINE=InnoDB;

CREATE TABLE Commentaire(
        id_commentaire         int(11) Auto_increment  NOT NULL ,
        contenue               Varchar(25) NOT NULL ,
        id_formation_Formation Int NOT NULL ,
        PRIMARY KEY (id_commentaire)
)ENGINE=InnoDB;

CREATE TABLE Restaurant(
        id_reservation   int(11) Auto_increment  NOT NULL ,
        date_reservation Datetime NOT NULL ,
        nombre_personne  Int NOT NULL ,
        PRIMARY KEY (id_reservation)
)ENGINE=InnoDB;

CREATE TABLE Session(
        id_session             int(11) Auto_increment  NOT NULL ,
        debut                  Datetime NOT NULL ,
        fin                    Datetime NOT NULL ,
        nombre_personne        Int NOT NULL ,
        horaires               Varchar(25) NOT NULL ,
        salles                 Varchar(25) NOT NULL ,
        id_formateur_Formateur Int NOT NULL ,
        PRIMARY KEY (id_session)
)ENGINE=InnoDB;

CREATE TABLE contenir(
        id_formation_Formation Int NOT NULL ,
        id_session_Session     Int NOT NULL ,
        PRIMARY KEY (id_formation_Formation,id_session_Session)
)ENGINE=InnoDB;

CREATE TABLE suivre(
        id_utilisateur_Utilisateur Int NOT NULL ,
        id_session_Session         Int NOT NULL ,
        PRIMARY KEY (id_utilisateur_Utilisateur,id_session_Session)
)ENGINE=InnoDB;

ALTER TABLE Salle ADD CONSTRAINT FK_Salle_id_utilisateur_Utilisateur FOREIGN KEY (id_utilisateur_Utilisateur) REFERENCES Utilisateur(id_utilisateur);
ALTER TABLE Utilisateur ADD CONSTRAINT FK_Utilisateur_id_reservation_Restaurant FOREIGN KEY (id_reservation_Restaurant) REFERENCES Restaurant(id_reservation);
ALTER TABLE Commentaire ADD CONSTRAINT FK_Commentaire_id_formation_Formation FOREIGN KEY (id_formation_Formation) REFERENCES Formation(id_formation);
ALTER TABLE Session ADD CONSTRAINT FK_Session_id_formateur_Formateur FOREIGN KEY (id_formateur_Formateur) REFERENCES Formateur(id_formateur);
ALTER TABLE contenir ADD CONSTRAINT FK_contenir_id_formation_Formation FOREIGN KEY (id_formation_Formation) REFERENCES Formation(id_formation);
ALTER TABLE contenir ADD CONSTRAINT FK_contenir_id_session_Session FOREIGN KEY (id_session_Session) REFERENCES Session(id_session);
ALTER TABLE suivre ADD CONSTRAINT FK_suivre_id_utilisateur_Utilisateur FOREIGN KEY (id_utilisateur_Utilisateur) REFERENCES Utilisateur(id_utilisateur);
ALTER TABLE suivre ADD CONSTRAINT FK_suivre_id_session_Session FOREIGN KEY (id_session_Session) REFERENCES Session(id_session);
