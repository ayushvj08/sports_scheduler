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

    return await queryInterface.bulkInsert("Users", [
      {
        firstname: "John",
        lastname: "Doe",
        email: "demo@email.com",
        role: "superadmin",
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
    ]);
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.bulkDelete("Users", null, {});

    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
