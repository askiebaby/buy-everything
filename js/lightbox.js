const lightbox = (() => {
  'use strict'

  function open( content, isClose ) {
    let root = document.querySelector('.lightBox')
    content = (content === undefined) ? '<div class="lightBox__message">錯誤，未傳送資料</div>' : content
    let lightBoxContainer

    if (isClose === true) {
      lightBoxContainer = `
        <div class="lightBox__wrapper">
          <div class="lightBox__layer"></div>
          <div class="lightBox__container animated fadeIn">
            <div class="lightBox__close"><i class="fas fa-times"></i></div>
            ${ content }
          </div>
        </div>
      `
      root.innerHTML = lightBoxContainer

      let closeButton = document.querySelector('.lightBox__close')
      if (closeButton) closeButton.addEventListener('click', close)

    } else if (isClose === false) {
      lightBoxContainer = `
        <div class="lightBox__wrapper">
          <div class="lightBox__layer"></div>
          <div class="lightBox__container animated fadeIn">
            ${ content }
          </div>
        </div>
      `
      root.innerHTML = lightBoxContainer
    }
  }

  function close () {
    let root = document.querySelector('.lightBox')
    let wholeContent = document.querySelector('.lightBox__wrapper')
    if (wholeContent) root.removeChild(wholeContent)
  }
  return {
    open: open,
    close: close
  }
})()