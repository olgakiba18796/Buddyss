const express = require('express');

const router = express.Router();

const Person = require('../models/modelPerson'); // A.I. подключил модель монгоДБ
const Profile = require('../models/modelProfile'); // A.I. подключил модель монгоДБ

/* GET users listing. */
router.get('/', async (req, res, next) => {
  res.send('respond with a resource');
});

/**
 *  Aleksandr Ivanov
 *
 * @email
 * @password
 * Отдаю объект:
 * @success - флаг выполнения запроса
 * @data - объект с данными пользователя
 *    @nickname
 *    @id
 * @err - Расшифровка ошибки
 */
router.post('/users', async (req, res) => {
  const {
    email,
    password,
  } = req.body;
  const user = await Person.findOne({ email, password });
  if (user) {
    return res.send({
      success: true,
      date: {
        nickname: user.nickname,
        id: user._id,
      },
    });
  }
  return res.send({
    success: false,
    err: 'No such user or incorrect pair login password',
  });
});

/**
 *  Aleksandr Ivanov
 * Проверяю на уникальность поле: email
 * Вношу нового пользователя в базу
 * Отдаю объект:
 * @success - флаг выполнения запроса
 * @data - Айди созданного пользователя
 * @err - Расшифровка ошибки
 */
router.post('/registration', async (req, res) => {
  const {
    nickname,
    email,
    password,
  } = req.body;
  if (nickname === '' || email === '' || password === '') {
    return res.send({
      success: false,
      err: 'Wrong data',
    });
  }
  const user = await Person.findOne({ email });
  if (!user) {
    const userNew = await Person.create({
      nickname,
      email,
      password,
    });
    return res.send({
      success: true,
      date: userNew._id,
    });
  }
  return res.send({
    success: false,
    err: 'Email is already registered',
  });
});

module.exports = router;
