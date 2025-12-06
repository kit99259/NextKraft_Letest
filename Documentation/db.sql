CREATE DATABASE IF NOT EXISTS nextkraft;
USE nextkraft;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

------------------------------------------------------------
-- USER TABLE
------------------------------------------------------------
CREATE TABLE users (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(100) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    Role ENUM('admin', 'operator', 'customer') NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


------------------------------------------------------------
-- PROJECT TABLE
------------------------------------------------------------
CREATE TABLE projects (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    ProjectName VARCHAR(150) NOT NULL UNIQUE,
    SocietyName VARCHAR(150) NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


------------------------------------------------------------
-- CUSTOMER TABLE
------------------------------------------------------------
CREATE TABLE customers (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100),
    Email VARCHAR(150),
    MobileNumber VARCHAR(20),
    UserId INT NOT NULL,
    ProjectId INT NOT NULL,
    SocietyName VARCHAR(150),
    WingName VARCHAR(100),
    FlatNumber VARCHAR(50),
    Profession VARCHAR(100),
    Status ENUM('Approved', 'Rejected', 'Pending') DEFAULT 'Pending',
    ApprovedAt DATETIME NULL,
    ApprovedBy INT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (UserId) REFERENCES users(Id),
    FOREIGN KEY (ProjectId) REFERENCES projects(Id),
    FOREIGN KEY (ApprovedBy) REFERENCES users(Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


------------------------------------------------------------
-- OPERATOR TABLE
------------------------------------------------------------
CREATE TABLE operators (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100),
    MobileNumber VARCHAR(20),
    Email VARCHAR(150),
    Status ENUM('Approved', 'Rejected', 'Pending') DEFAULT 'Pending',
    ProjectId INT NOT NULL,
    ParkingSystemId INT NULL,
    HasPalletPower BOOLEAN DEFAULT 0,
    ApprovedAt DATETIME NULL,
    ApprovedBy INT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (ProjectId) REFERENCES projects(Id),
    FOREIGN KEY (ParkingSystemId) REFERENCES parking_system(Id),
    FOREIGN KEY (ApprovedBy) REFERENCES users(Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


------------------------------------------------------------
-- PARKING SYSTEM TABLE
------------------------------------------------------------
CREATE TABLE parking_system (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    WingName VARCHAR(100),
    ProjectId INT NOT NULL,
    Type ENUM('Tower', 'Puzzle') NOT NULL,
    Level INT NOT NULL,
    `Column` INT NOT NULL,
    TotalNumberOfPallet INT NOT NULL,
    
    PalletDetails JSON,
    
    TimeForEachLevel INT DEFAULT 0,  -- seconds
    TimeForHorizontalMove INT DEFAULT 0, -- seconds
    
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (ProjectId) REFERENCES projects(Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


------------------------------------------------------------
-- CAR TABLE
------------------------------------------------------------
CREATE TABLE cars (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL,
    CarType VARCHAR(50),
    CarModel VARCHAR(100),
    CarCompany VARCHAR(100),
    CarNumber VARCHAR(50),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (UserId) REFERENCES users(Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


------------------------------------------------------------
-- PALLET ALLOTMENT TABLE
------------------------------------------------------------
CREATE TABLE pallet_allotment (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL,
    ProjectId INT NOT NULL,
    ParkingSystemId INT NOT NULL,
    CarId INT NOT NULL,
    
    PalletDetails JSON,
    
    Status ENUM('Assigned', 'Released') DEFAULT 'Assigned',
    
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (UserId) REFERENCES users(Id),
    FOREIGN KEY (ProjectId) REFERENCES projects(Id),
    FOREIGN KEY (ParkingSystemId) REFERENCES parking_system(Id),
    FOREIGN KEY (CarId) REFERENCES cars(Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


------------------------------------------------------------
-- REQUEST QUEUE TABLE (Active Requests)
------------------------------------------------------------
CREATE TABLE request_queue (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL,
    PalletAllotmentId INT NOT NULL,
    OperatorId INT NULL,
    
    Status ENUM('Pending', 'Accepted', 'Started', 'Completed', 'Cancelled') DEFAULT 'Pending',
    EstimatedTime INT DEFAULT 0, -- seconds
    
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (UserId) REFERENCES users(Id),
    FOREIGN KEY (PalletAllotmentId) REFERENCES pallet_allotment(Id),
    FOREIGN KEY (OperatorId) REFERENCES operators(Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


------------------------------------------------------------
-- REQUEST TABLE (History of Completed/Cancelled Requests)
------------------------------------------------------------
CREATE TABLE requests (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL,
    PalletAllotmentId INT NOT NULL,
    OperatorId INT NULL,
    
    Status ENUM('Pending', 'Accepted', 'Started', 'Completed', 'Cancelled') DEFAULT 'Pending',
    EstimatedTime INT DEFAULT 0,
    
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (UserId) REFERENCES users(Id),
    FOREIGN KEY (PalletAllotmentId) REFERENCES pallet_allotment(Id),
    FOREIGN KEY (OperatorId) REFERENCES operators(Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
