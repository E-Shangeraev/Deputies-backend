const Deputie = require('../models/Deputie')
const Calendar = require('../models/Calendar')
const News = require('../models/News')

exports.home = async (req, res) => {
  const deputies = await Deputie.find().sort({ id: 1 }).lean()
  const news = await News.find().sort({ date: -1 }).limit(20).lean()

  res.render('main', {
    title: 'Главная',
    isMain: true,
    deputies,
    news,
  })
}

exports.calendar = async (req, res) => {
  const calendar = await Calendar.find({})
  res.json(calendar)
}

exports.question = async (req, res) => {
  try {
    const message = `
        <h2>Письмо с сайта gorsovet-26.ru</h2>
        <hr>
        <p>
          <b>Имя: </b>
          ${req.body.name}
        </p>
        <hr>
        <p>
          <b>Телефон: </b>
          ${req.body.phone}
        </p>
        <hr>
        <p>
          <b>Вопрос: </b>
          ${req.body.question}
        </p>
        <hr>
      `
    await sendQuestion(message)
    res.send('1')
  } catch (err) {
    res.send('0')
  }
}

exports.searchTips = async (req, res) => {
  if (req.body.action == 'search') {
    let params = {}
    const textArray = req.body.request.split(' ')
    let textKey = ''
    textArray.forEach((text, index) => {
      if (index == 0) {
        textKey = '"' + text + '"'
      } else {
        textKey += ' ' + '"' + text + '"'
      }
    })
    params.$text = { $search: textKey }

    let inputValue = req.body.request
      .replace(/ул. /g, '')
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
      .replace(/\s{2,}/g, ' ')

    const regMarks = '([., /#!$%^&*;:{}=-_`~()]+)?'
    inputValue = inputValue.split(' ').join(regMarks)
    const reg = new RegExp(inputValue, 'gi')

    await Deputie.find(params, (err, deputie) => {
      deputie.forEach(deput => {
        let a = deput.address
          .map(addr => {
            if (addr.match(reg)) {
              return addr
            }
          })
          .filter(addr => addr)
        deput.address = a
      })
      res.send({ result: deputie })
    }).sort({ score: { $meta: 'textScore' } })
  }
}

exports.search = async (req, res) => {
  await Deputie.find({ _id: req.body.request }, (err, deputie) => {
    res.send({ result: deputie })
  })
}
