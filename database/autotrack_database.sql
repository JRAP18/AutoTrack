-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 26, 2026 at 06:19 AM
-- Server version: 10.11.19-MariaDB
-- PHP Version: 8.5.13

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `autotrack_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `customerId` int(11) NOT NULL,
  `firstName` varchar(50) NOT NULL,
  `lastName` varchar(50) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address` varchar(255) NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`customerId`, `firstName`, `lastName`, `phone`, `email`, `address`, `createdAt`) VALUES
(1, 'Juan', 'Dela Cruz', '09112223344', 'juan@example.com', 'Imus, Cavite', '2026-11-24 14:33:55.312795'),
(3, 'Gabriel', 'Mendoza', '09170000000', 'gabriel@example.com', 'Dasmariñas, Cavite', '2026-11-24 15:53:28.754994');

-- --------------------------------------------------------

--
-- Table structure for table `service_records`
--

CREATE TABLE `service_records` (
  `serviceRecordId` int(11) NOT NULL,
  `vehicleId` int(11) NOT NULL,
  `serviceTypeId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `serviceDate` date NOT NULL,
  `description` text NOT NULL,
  `status` enum('Pending','In Progress','Completed','Cancelled') NOT NULL DEFAULT 'Pending',
  `cost` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `service_records`
--

INSERT INTO `service_records` (`serviceRecordId`, `vehicleId`, `serviceTypeId`, `userId`, `serviceDate`, `description`, `status`, `cost`) VALUES
(5, 1, 5, 1, '2026-11-24', 'Wheel alignment completed.', 'Completed', 800.00),
(8, 3, 7, 1, '2026-11-24', 'Perform routine vehicle maintenance and inspection.', 'Completed', 2500.00);

-- --------------------------------------------------------

--
-- Table structure for table `service_types`
--

CREATE TABLE `service_types` (
  `serviceTypeId` int(11) NOT NULL,
  `serviceName` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `basePrice` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `service_types`
--

INSERT INTO `service_types` (`serviceTypeId`, `serviceName`, `description`, `basePrice`) VALUES
(1, 'Oil Change', 'Engine oil and oil filter replacement with basic inspection.', 1000.00),
(2, 'Engine Tune-up', 'Inspection and adjustment of engine components.', 1500.00),
(3, 'Brake Maintenance', 'Inspection and maintenance of the braking system.', 1200.00),
(4, 'Tire Replacement', 'Removal and replacement of vehicle tires.', 2500.00),
(5, 'Wheel Alignment', 'Adjustment of vehicle wheel angles.', 800.00),
(6, 'General Inspection', 'General inspection of vehicle condition.', 500.00),
(7, 'Preventive Maintenance', 'Routine vehicle inspection and preventive maintenance.', 2500.00);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `userId` int(11) NOT NULL,
  `fullName` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `passwordHash` varchar(255) NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`userId`, `fullName`, `email`, `passwordHash`, `createdAt`) VALUES
(1, 'Gehlee Dangca', 'staff@autotrack.com', '$2b$12$4sE3kVvv7KAeZWYxID18UeSElEdNAeSqAhRzRZm3XDWcKobOYA3SG', '2026-11-24 14:27:40.923862');

-- --------------------------------------------------------

--
-- Table structure for table `vehicles`
--

CREATE TABLE `vehicles` (
  `vehicleId` int(11) NOT NULL,
  `customerId` int(11) NOT NULL,
  `plateNumber` varchar(20) NOT NULL,
  `brand` varchar(50) NOT NULL,
  `model` varchar(50) NOT NULL,
  `year` int(11) NOT NULL,
  `color` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vehicles`
--

INSERT INTO `vehicles` (`vehicleId`, `customerId`, `plateNumber`, `brand`, `model`, `year`, `color`) VALUES
(1, 1, 'ABC 1234', 'Toyota', 'Vios', 2022, 'Black'),
(3, 3, 'TST 2026', 'Toyota', 'Vios', 2023, 'Silver');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`customerId`);

--
-- Indexes for table `service_records`
--
ALTER TABLE `service_records`
  ADD PRIMARY KEY (`serviceRecordId`),
  ADD KEY `FK_ce445c3cb8acc53c1a8429b50c0` (`vehicleId`),
  ADD KEY `FK_67b6dd2e82a429640047397d6d1` (`serviceTypeId`),
  ADD KEY `FK_7c0d4c6aa59851248f2ef9f40e3` (`userId`);

--
-- Indexes for table `service_types`
--
ALTER TABLE `service_types`
  ADD PRIMARY KEY (`serviceTypeId`),
  ADD UNIQUE KEY `IDX_45599e38fbc2e0832a0ac8ba4e` (`serviceName`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`userId`),
  ADD UNIQUE KEY `IDX_97672ac88f789774dd47f7c8be` (`email`);

--
-- Indexes for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD PRIMARY KEY (`vehicleId`),
  ADD UNIQUE KEY `IDX_66ea96381a7a7ceb35c72f3662` (`plateNumber`),
  ADD KEY `FK_ddb00709ac9788b3ded9296f2a8` (`customerId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `customerId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `service_records`
--
ALTER TABLE `service_records`
  MODIFY `serviceRecordId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `service_types`
--
ALTER TABLE `service_types`
  MODIFY `serviceTypeId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `userId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `vehicles`
--
ALTER TABLE `vehicles`
  MODIFY `vehicleId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `service_records`
--
ALTER TABLE `service_records`
  ADD CONSTRAINT `FK_67b6dd2e82a429640047397d6d1` FOREIGN KEY (`serviceTypeId`) REFERENCES `service_types` (`serviceTypeId`) ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_7c0d4c6aa59851248f2ef9f40e3` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_ce445c3cb8acc53c1a8429b50c0` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles` (`vehicleId`) ON UPDATE NO ACTION;

--
-- Constraints for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD CONSTRAINT `FK_ddb00709ac9788b3ded9296f2a8` FOREIGN KEY (`customerId`) REFERENCES `customers` (`customerId`) ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
