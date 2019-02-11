'use strict'

function lightBox( content, isClose ) {
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

  } else if (isClose === false) {
    lightBoxContainer = `
      <div class="lightBox__wrapper">
        <div class="lightBox__layer"></div>
        <div class="lightBox__container animated fadeIn">
          ${ content }
        </div>
      </div>
    `
  }

  root.innerHTML = lightBoxContainer

  let close = document.querySelector('.lightBox__close')
  if (close) close.addEventListener('click', closeLightBox)
}

function closeLightBox () {
  let root = document.querySelector('.lightBox')
  let wholeContent = document.querySelector('.lightBox__wrapper')
  if (wholeContent) root.removeChild(wholeContent)
}
