(function ($) {
  $.fn.autoSearch = function () {
    var request = '';
    var input = this;

    input.wrap('<div class="searchHolder"></div>');
    input.parent().append('<div class="autoFillBar"></div>');
    var autoFillBar = input.next();

    input.on('focus', function () {
      searchCheck();
    });

    document.querySelector('.form').addEventListener('submit', (e) => {
      e.preventDefault();
    });

    input.on('keyup', function (e) {
      if (e.keyCode == 40) {
        if (autoFillBar.find('.active').length == 0) {
          autoFillBar.find('.item:first').addClass('active');
        } else {
          autoFillBar.find('.active').removeClass('active').next().addClass('active');
        }

        var val = autoFillBar.find('.active').text();
        input.val(val);
      } else if (e.keyCode == 38) {
        if (autoFillBar.find('.active').length == 0) {
          autoFillBar.find('.item:last').addClass('active');
        } else {
          autoFillBar.find('.active').removeClass('active').prev().addClass('active');
        }

        var val = autoFillBar.find('.active').text();
        input.val(val);
      } else if (e.keyCode == 13) {
        showDeputie();
        //тут можно сделать переход на страницу статьи или все что пожелаешь
      } else {
        searchCheck();
      }
    });

    autoFillBar.on('click', '.item', function () {
      //тут можно сделать переход на страницу статьи или все что пожелаешь
      input.val($(this).text());
      showDeputie();
      return false;
    });

    autoFillBar.on('click', '.item', function (e) {
      if (
        !$(e.target).hasClass('autoFillBar') &&
        !$(e.target).parent().hasClass('autoFillBar') &&
        !$(e.target).parent().hasClass('searchHolder')
      ) {
        autoFillBar.slideUp('fast', function () {
          autoFillBar.children().remove();
        });
      }
    });

    $('html').on('click', function (e) {
      if (
        !$(e.target).hasClass('autoFillBar') &&
        !$(e.target).parent().hasClass('autoFillBar') &&
        !$(e.target).parent().hasClass('searchHolder')
      ) {
        autoFillBar.slideUp('fast', function () {
          autoFillBar.children().remove();
        });
      }
    });

    function searchCheck() {
      if (input.val().length >= 2) {
        var data = {};
        data.action = 'search';
        data.request = input.val();

        $.ajax({
          url: '/corpus',
          type: 'POST',
          dataType: 'json',
          data: data,
        }).done(function (data) {
          autoFillBar.children().remove();

          // console.log(data);

          var articlesArray = data.result;
          console.log(articlesArray);

          articlesArray.forEach((item, index) => {
            let addresses = item.address;

            for (var i = 0; i <= addresses.length - 1; i++) {
              var address = addresses[i];

              var regex = input.val();

              if (regex.indexOf(' ') == -1) {
                var searchMask = regex;
                var regEx = new RegExp(searchMask, 'ig');

                var num = address.toLowerCase().indexOf(regex.toLowerCase());
                var straddress = address.substr(num, regex.length);
                var replaceMask = '<b class="highlighted">' + straddress + '</b>';
                address = address.replace(regEx, replaceMask);
              } else {
                var regexArr = regex.split(' ');

                for (var n = 0; n < regexArr.length; n++) {
                  if (regexArr[n].length > 0) {
                    var searchMask = regexArr[n];
                    var regEx = new RegExp(searchMask, 'ig');

                    var num = address.toLowerCase().indexOf(regexArr[n].toLowerCase());
                    var straddress = address.substr(num, regexArr[n].length);
                    var replaceMask = '<b class="highlighted">' + straddress + '</b>';
                    var stopWords = '<b class="highlighted"></b>';
                    if (stopWords.indexOf(straddress.toLowerCase()) == -1) {
                      address = address.replace(regEx, replaceMask);
                    }
                  }
                }
              }

              autoFillBar.append('<div class="item">' + '<span>' + address + '</span>' + '</div>');
            }
          });

          autoFillBar.slideDown('fast');

          // конец ajax-запроса, ты знаешь, что делать ;)
        });
      }
    }

    function removeDeputie() {
      const yourDeputie = document.querySelectorAll('.find .your-deputie');
      yourDeputie.forEach((item) => (item.innerHTML = ''));
    }

    function showDeputie() {
      document.querySelector('.form').addEventListener('submit', (e) => {
        e.preventDefault();
        removeDeputie();
        const find = document.querySelector('.find');

        autoFillBar.children().remove();

        let data = {};
        data.action = 'search';
        data.request = input.val().split('. ')[1];

        $.ajax({
          url: '/corpus/search',
          type: 'POST',
          dataType: 'json',
          data: data,
        }).done(function (data) {
          // console.log(data);
          const deput = data.result[0];
          const about = deput.about ? deput.about : '';
          const schedule = deput.schedule
            ? `
          <p>
            <span class="red">
              График приема:
            </span>
            ${deput.schedule}
          </p>`
            : '';
          const appointment = deput.appointment
            ? `
          <p>
            <span class="red">
              Запись:
            </span>
            ${deput.appointment}
          </p>`
            : '';

          const res = `
          <div class="your-deputie">
            <h2 class="subtitle">
              Ваш депутат
            </h2>
            <div class="your-deputie__wrapper bg-gray bg-gray--border">
              <img class="your-deputie__photo" src="${deput.img}" />
              <header class="your-deputie__header d-flex">
                <div>
                  <h3 class="your-deputie__name">
                    ${deput.name}
                  </h3>
                  <p class="your-deputie__post">
                    ${deput.post}
                  </p>
                </div>
                <img src="${deput.fraction}" />
              </header>
              <p class="your-deputie__desc">
                ${about}
              </p>
              <footer class="your-deputie__footer">
                ${schedule}
                ${appointment}
              </footer>
            </div>
          </div>
          `;

          console.log(deput);
          removeDeputie();
          find.insertAdjacentHTML('beforeend', res);
        });
      });
    }

    return input;
  };

  $(document).ready(function () {
    $('#deputie-search').autoSearch();
  });
})(jQuery);
