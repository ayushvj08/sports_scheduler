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

    return queryInterface.bulkInsert("User", [
      {
        firstName: "John",
        lastName: "Doe",
        email: "demo@email.com",
        role: "superadmin",
        password: bcrypt.hash("123456", saltRounds),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstName: "Alpha",
        lastName: "Player",
        email: "alpha@email.com",
        role: "player",
        password: bcrypt.hash("123456", saltRounds),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("User", null, {});

    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
