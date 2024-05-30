const users = require("./users");

const addUserLoginList = (request, h) => {
    const { username, password } = request.payload;
   
    const createdAt = new Date().toISOString();

    const newUsers = {
      username, password, createdAt
    };
   
    users.push(newUsers);
   
    const isSuccess = users.filter((users) => users.username === username).length > 0;
   
    if (isSuccess) {
      const response = h.response({
        status: 'success',
        message: 'pendaftaran berhasil',
        data: {
          username: username,
          password: password
        },
      });
      response.code(201);
      return response;
    }
    const response = h.response({
      status: 'fail',
      message: 'Pendaftaran gagal',
    });
    response.code(500);
    return response;
  };
  
module.exports = { addUserLoginList };