"use strict";
const bcrypt = require("bcrypt");
const saltRounds = 10;
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */

    await queryInterface.bulkInsert("Users", [
      {
        firstname: "Admin",
        lastname: "User",
        email: "admin@email.com",
        role: "admin",
        password: await bcrypt.hash("123456", saltRounds),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstname: "John",
        lastname: "Doe",
        email: "demo@email.com",
        role: "admin",
        password: await bcrypt.hash("123456", saltRounds),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstname: "Alpha",
        lastname: "Player",
        email: "player@email.com",
        role: "player",
        password: await bcrypt.hash("123456", saltRounds),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstname: "MS",
        lastname: "Dhoni",
        email: "dhoni@email.com",
        role: "player",
        password: await bcrypt.hash("123456", saltRounds),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstname: "Virat",
        lastname: "Kohli",
        email: "virat@email.com",
        role: "player",
        password: await bcrypt.hash("123456", saltRounds),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstname: "Rohit",
        lastname: "Sharma",
        email: "rohit@email.com",
        role: "player",
        password: await bcrypt.hash("123456", saltRounds),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstname: "Saurav",
        lastname: "Ganguly",
        email: "saurav@email.com",
        role: "player",
        password: await bcrypt.hash("123456", saltRounds),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstname: "Neeraj",
        lastname: "Chopra",
        email: "neeraj@email.com",
        role: "player",
        password: await bcrypt.hash("123456", saltRounds),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await queryInterface.bulkInsert("sports", [
      {
        name: "Cricket",
        numberOfPlayers: 11,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 1,
      },
      {
        name: "Badminton",
        numberOfPlayers: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 1,
      },
      {
        name: "Football",
        numberOfPlayers: 11,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 1,
      },
      {
        name: "Hockey",
        numberOfPlayers: 11,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 1,
      },
      {
        name: "Chess",
        numberOfPlayers: 11,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 1,
      },
      {
        name: "Carrom",
        numberOfPlayers: 11,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 1,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", null, {});
    await queryInterface.bulkDelete("sports", null, {});
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
